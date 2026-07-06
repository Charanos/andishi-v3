import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { activityEvents, organizations, projects } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/authz/can";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  parseJson,
  validationError,
} from "@/lib/api/responses";
import { createWorkCaseStudySchema } from "@/lib/validation/entities";

/**
 * GET /api/work
 *
 * Public endpoint - no authentication required.
 * Returns all projects where isPublic = true, ordered by featuredOrder.
 * Supports optional ?service= and ?vertical= query filters.
 *
 * Powers the /work page case study grid.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const service = searchParams.get("service");
  const vertical = searchParams.get("vertical");

  // Build conditions - always filter to public projects only
  const conditions = [eq(projects.isPublic, true)];

  if (service && service !== "all") {
    conditions.push(eq(projects.serviceType, service));
  }

  if (vertical && vertical !== "all") {
    conditions.push(eq(projects.vertical, vertical));
  }

  const result = await getDb()
    .select({
      id: projects.id,
      title: projects.title,
      publicSlug: projects.publicSlug,
      serviceType: projects.serviceType,
      vertical: projects.vertical,
      coverImageUrl: projects.coverImageUrl,
      challenge: projects.challenge,
      solution: projects.solution,
      outcome: projects.outcome,
      outcomeLabel: projects.outcomeLabel,
      clientQuote: projects.clientQuote,
      clientQuoteAttribution: projects.clientQuoteAttribution,
      clientName: projects.clientName,
      stackTags: projects.stackTags,
      featuredOrder: projects.featuredOrder,
      status: projects.status,
      startDate: projects.startDate,
      targetDate: projects.targetDate,
    })
    .from(projects)
    .where(and(...conditions))
    .orderBy(asc(projects.featuredOrder));

  return NextResponse.json({ work: result });
}

/**
 * POST /api/work
 *
 * Admin-only. Marketing-site convenience: creates a project and publishes it
 * as a public case study in one call (the internal dashboard instead creates
 * a project via POST /api/projects, then PATCHes /api/projects/[id] with
 * isPublic:true separately). Auto-provisions the client organization by name
 * since the public /work admin UI doesn't expose the internal CRM's
 * organization picker.
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const parsed = createWorkCaseStudySchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    await authorize(session, "delivery.project.write");
    await authorize(session, "delivery.project.publish");

    const { title, clientName, ...caseStudyFields } = parsed.data;

    const project = await getDb().transaction(async (tx) => {
      const [existingOrg] = await tx
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.name, clientName))
        .limit(1);

      const orgId =
        existingOrg?.id ??
        (
          await tx.insert(organizations).values({ name: clientName }).returning({ id: organizations.id })
        )[0]?.id;
      if (!orgId) throw new Error("Failed to resolve client organization");

      const [created] = await tx
        .insert(projects)
        .values({
          organizationId: orgId,
          title,
          description: caseStudyFields.challenge,
          status: "completed",
          isPublic: true,
          clientName,
          ...caseStudyFields,
        })
        .returning();

      await tx.insert(activityEvents).values({
        type: "project_published",
        actorId: session.user.id,
        actorRole: "admin",
        entityType: "project",
        entityId: created.id,
        description: `Project "${created.title}" published as public case study at /work/${created.publicSlug}`,
        visibleTo: ["admin"],
      });

      return created;
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "project.write",
    });
  }
}
