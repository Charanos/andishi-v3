import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { activityEvents, projects } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/authz/can";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  parseJson,
  validationError,
} from "@/lib/api/responses";
import { updateWorkCaseStudySchema } from "@/lib/validation/entities";
import { z } from "zod";

// Publish gate — all required fields must be present
const publishGateSchema = updateWorkCaseStudySchema
  .required({ title: true, publicSlug: true, clientName: true, coverImageUrl: true })
  .superRefine((data, ctx) => {
    if (!data.liveUrl && !data.repoUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one of liveUrl or repoUrl is required to publish",
        path: ["liveUrl"],
      });
    }
    if (!data.results?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one result metric is required to publish",
        path: ["results"],
      });
    }
  });

/**
 * PATCH /api/work/manage/[id]/publish
 *
 * Admin-only. Runs full publish-gate validation before setting
 * caseStudyStatus → "published" and recording publishedAt.
 *
 * This is the ONLY endpoint that can flip caseStudyStatus to "published".
 * The autosave PATCH /api/work/manage/[id] intentionally blocks this transition.
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const { id } = await context.params;
  const [existing] = await getDb().select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!existing) return jsonError("Case study not found", 404);

  if (existing.caseStudyStatus === "archived") {
    return jsonError("Cannot publish an archived case study. Restore it first.", 409);
  }

  // Merge the incoming patch with existing data so validation sees the full picture
  const body = await parseJson(req).catch(() => ({}));
  const merged = { ...existing, ...body };

  const parsed = publishGateSchema.safeParse(merged);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    await authorize(session, "delivery.project.publish");

    const now = new Date();
    const [published] = await getDb()
      .update(projects)
      .set({
        ...(body as Record<string, unknown>),
        caseStudyStatus: "published",
        publishedAt: existing.publishedAt ?? now, // preserve original publishedAt on re-publish
        isPublic: true,
        updatedAt: now,
      })
      .where(eq(projects.id, id))
      .returning({
        id: projects.id,
        title: projects.title,
        publicSlug: projects.publicSlug,
        caseStudyStatus: projects.caseStudyStatus,
        publishedAt: projects.publishedAt,
      });

    await getDb()
      .insert(activityEvents)
      .values({
        type: "project_published",
        actorId: session.user.id,
        actorRole: "admin",
        entityType: "project",
        entityId: id,
        description: `Case study "${existing.title}" published at /work/${published.publicSlug}`,
        visibleTo: ["admin"],
      });

    return NextResponse.json({ project: published });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "project.publish",
    });
  }
}
