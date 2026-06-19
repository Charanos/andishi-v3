import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { activityEvents, briefs } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { jsonError, parseJson, validationError } from "@/lib/api/responses";
import { createBriefSchema } from "@/lib/validation/entities";

/**
 * GET /api/briefs
 *
 * Admin: returns all briefs with optional ?type=build|hire filter.
 * Client: returns only briefs belonging to their organization.
 * Developer: no access.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (session.user.role === "developer") return jsonError("Forbidden", 403);

  const { searchParams } = new URL(req.url);
  const typeFilter = searchParams.get("type"); // "build" | "hire" | null (all)

  const conditions = [];

  // Clients see only their own org's briefs
  if (session.user.role === "client") {
    if (!session.user.organizationId) return NextResponse.json({ briefs: [] });
    conditions.push(eq(briefs.organizationId, session.user.organizationId));
  }

  // Optional type filter - works for both admin and client
  if (typeFilter === "build" || typeFilter === "hire") {
    conditions.push(eq(briefs.briefType, typeFilter));
  }

  const result = await getDb()
    .select()
    .from(briefs)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(briefs.createdAt));

  return NextResponse.json({ briefs: result });
}

/**
 * POST /api/briefs
 *
 * Admin or client can create briefs.
 * Uses discriminated union schema: briefType = "build" | "hire"
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (session.user.role === "developer") return jsonError("Forbidden", 403);

  const parsed = createBriefSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const organizationId =
    session.user.role === "admin"
      ? parsed.data.organizationId
      : session.user.organizationId;
  const submittedById =
    session.user.role === "admin"
      ? parsed.data.submittedById
      : session.user.id;

  if (!organizationId || !submittedById) {
    return jsonError("organizationId and submittedById are required.", 400);
  }

  const [brief] = await getDb()
    .insert(briefs)
    .values({ ...parsed.data, organizationId, submittedById })
    .returning();

  // Activity event typed by brief track
  await getDb().insert(activityEvents).values({
    type:
      brief.briefType === "build"
        ? "brief_build_submitted"
        : "brief_hire_submitted",
    actorId: session.user.id,
    actorRole: session.user.role,
    organizationId: brief.organizationId,
    entityType: "brief",
    entityId: brief.id,
    description: `${brief.briefType === "build" ? "Build" : "Hire"} brief "${brief.title}" submitted`,
    visibleTo: ["admin", "client"],
  });

  return NextResponse.json({ brief }, { status: 201 });
}
