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

/**
 * PATCH/DELETE /api/work/manage/[id]
 *
 * Admin-only management of an existing public case study by project id
 * (nested under /manage so it doesn't collide with the public GET
 * /api/work/[slug] route - same split pattern as
 * /api/careers/[slug] (public) vs /api/careers/openings/[id] (admin)).
 * Scoped to case-study fields only; internal delivery fields (briefId,
 * engineerIds, milestones, etc.) go through /api/projects/[id] instead.
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const { id } = await context.params;
  const [existing] = await getDb().select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!existing) return jsonError("Case study not found", 404);

  const parsed = updateWorkCaseStudySchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    await authorize(session, "delivery.project.write");

    const [updated] = await getDb()
      .update(projects)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    return NextResponse.json({ project: updated });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "project.write",
    });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const { id } = await context.params;
  const [existing] = await getDb().select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!existing) return jsonError("Case study not found", 404);

  try {
    await authorize(session, "delivery.project.delete");

    await getDb().delete(projects).where(eq(projects.id, id));

    await getDb().insert(activityEvents).values({
      type: "project_unpublished",
      actorId: session.user.id,
      actorRole: "admin",
      entityType: "project",
      entityId: id,
      description: `Case study "${existing.title}" deleted from /work`,
      visibleTo: ["admin"],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "project.delete",
    });
  }
}
