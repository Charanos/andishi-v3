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
 * PATCH /api/work/manage/[id]
 *
 * Admin-only. Partial update of case study fields (used for autosave).
 * Scoped to case-study fields only; internal delivery fields go through
 * /api/projects/[id] instead.
 *
 * Note: this is the autosave endpoint. It always writes as draft unless
 * caseStudyStatus is explicitly passed. Never auto-publishes.
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

    const updatePayload = parsed.data;

    // Never let autosave silently publish — strip caseStudyStatus if it
    // was accidentally included in an autosave call without explicit publish.
    // The /publish endpoint handles the status flip with proper validation.
    if (updatePayload.caseStudyStatus === "published") {
      return jsonError("Use PATCH /api/work/manage/:id/publish to publish a case study", 400);
    }

    const [updated] = await getDb()
      .update(projects)
      .set({ ...updatePayload, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning({
        id: projects.id,
        title: projects.title,
        caseStudyStatus: projects.caseStudyStatus,
        updatedAt: projects.updatedAt,
      });

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

/**
 * DELETE /api/work/manage/[id]
 *
 * Admin-only. SOFT deletes by setting caseStudyStatus to "archived".
 * Never hard-deletes — archived rows remain recoverable.
 * Requires a confirmation payload { confirm: true } to prevent accidental calls.
 */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const { id } = await context.params;
  const [existing] = await getDb().select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!existing) return jsonError("Case study not found", 404);

  // Require explicit confirmation body to prevent accidental deletes
  const body = await parseJson(req).catch(() => ({}));
  if (!(body as { confirm?: boolean })?.confirm) {
    return jsonError("Send { confirm: true } to archive a case study", 400);
  }

  try {
    await authorize(session, "delivery.project.delete");

    const [archived] = await getDb()
      .update(projects)
      .set({ caseStudyStatus: "archived", updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning({ id: projects.id, title: projects.title });

    await getDb()
      .insert(activityEvents)
      .values({
        type: "project_unpublished",
        actorId: session.user.id,
        actorRole: "admin",
        entityType: "project",
        entityId: id,
        description: `Case study "${existing.title}" archived (soft-deleted) from /work`,
        visibleTo: ["admin"],
      });

    return NextResponse.json({ archived: true, project: archived });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "project.delete",
    });
  }
}
