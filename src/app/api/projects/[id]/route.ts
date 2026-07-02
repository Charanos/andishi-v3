import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { activityEvents, projects } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/authz/can";
import { ForbiddenError } from "@/lib/authz/errors";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  parseJson,
  validationError,
} from "@/lib/api/responses";
import { publishCaseStudySchema, updateProjectSchema } from "@/lib/validation/entities";

async function getProjectForRequest(id: string) {
  const session = await getSession();
  if (!session) return { session: null, project: null, allowed: false };

  const [project] = await getDb().select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) return { session, project: null, allowed: false };

  const allowed =
    session.user.role === "admin" ||
    session.user.organizationId === project.organizationId ||
    Boolean(session.user.engineerId && project.engineerIds.includes(session.user.engineerId));

  return { session, project, allowed };
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { session, project, allowed } = await getProjectForRequest(id);
  if (!session) return jsonError("Unauthorized", 401);
  if (!project) return jsonError("Project not found", 404);
  if (!allowed) return jsonError("Forbidden", 403);
  return NextResponse.json({ project });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const { id } = await context.params;
  const { session, project, allowed } = await getProjectForRequest(id);
  if (!session) return jsonError("Unauthorized", 401);
  if (!project) return jsonError("Project not found", 404);
  if (!allowed) return jsonError("Forbidden", 403);

  const parsed = updateProjectSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    // Non-admin users can only update milestone status and project status
    let update: Record<string, unknown> = {
      milestones: parsed.data.milestones,
      status: parsed.data.status,
    };

    if (session.user.role === "admin") {
      await authorize(session, "delivery.project.write");
      update = parsed.data;
    }

    const [updated] = await getDb()
      .update(projects)
      .set({ ...update, updatedAt: new Date() })
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

/**
 * PATCH /api/projects/[id]
 *
 * Admin-only. Two modes:
 * 1. isPublic: true → validate against publishCaseStudySchema and publish to /work (delivery.project.publish)
 * 2. Standard partial update → any subset of project fields (delivery.project.write)
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  const { id } = await context.params;
  const [existing] = await getDb().select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!existing) return jsonError("Project not found", 404);

  const body = await parseJson(req);

  try {
    // ── Publish as case study ─────────────────────────────────────

    if (body?.isPublic === true) {
      await authorize(session, "delivery.project.publish");

      const parsed = publishCaseStudySchema.safeParse(body);
      if (!parsed.success) return validationError(parsed.error);

      const [updated] = await getDb()
        .update(projects)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();

      await getDb()
        .insert(activityEvents)
        .values({
          type: "project_published",
          actorId: session.user.id,
          actorRole: "admin",
          entityType: "project",
          entityId: updated.id,
          description: `Project "${updated.title}" published as public case study at /work/${updated.publicSlug}`,
          visibleTo: ["admin"],
        });

      return NextResponse.json({ project: updated });
    }

    // ── Unpublish / standard partial update ───────────────────────

    if (body?.isPublic === false) {
      await authorize(session, "delivery.project.publish");

      const [updated] = await getDb()
        .update(projects)
        .set({ isPublic: false, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();

      await getDb()
        .insert(activityEvents)
        .values({
          type: "project_unpublished",
          actorId: session.user.id,
          actorRole: "admin",
          entityType: "project",
          entityId: updated.id,
          description: `Project "${updated.title}" unpublished from /work`,
          visibleTo: ["admin"],
        });

      return NextResponse.json({ project: updated });
    }

    // Standard field update (admin-only free-form)
    await authorize(session, "delivery.project.write");

    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

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
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  try {
    if (session.user.role !== "admin") throw new ForbiddenError();
    await authorize(session, "delivery.project.delete");

    await getDb().delete(projects).where(eq(projects.id, id));
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
