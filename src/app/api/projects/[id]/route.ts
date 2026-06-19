import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { activityEvents, projects } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { jsonError, parseJson, validationError } from "@/lib/api/responses";
import { publishCaseStudySchema, updateProjectSchema } from "@/lib/validation/entities";

async function getProjectForRequest(id: string) {
  const session = await getSession();
  if (!session) return { session: null, project: null, allowed: false };

  const [project] = await getDb()
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  if (!project) return { session, project: null, allowed: false };

  const allowed =
    session.user.role === "admin" ||
    session.user.organizationId === project.organizationId ||
    Boolean(
      session.user.engineerId &&
        project.engineerIds.includes(session.user.engineerId),
    );

  return { session, project, allowed };
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { session, project, allowed } = await getProjectForRequest(id);
  if (!session) return jsonError("Unauthorized", 401);
  if (!project) return jsonError("Project not found", 404);
  if (!allowed) return jsonError("Forbidden", 403);
  return NextResponse.json({ project });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { session, project, allowed } = await getProjectForRequest(id);
  if (!session) return jsonError("Unauthorized", 401);
  if (!project) return jsonError("Project not found", 404);
  if (!allowed) return jsonError("Forbidden", 403);

  const parsed = updateProjectSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  // Non-admin users can only update milestone status and project status
  const update =
    session.user.role === "admin"
      ? parsed.data
      : {
          milestones: parsed.data.milestones,
          status:     parsed.data.status,
        };

  const [updated] = await getDb()
    .update(projects)
    .set({ ...update, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();

  return NextResponse.json({ project: updated });
}

/**
 * PATCH /api/projects/[id]
 *
 * Admin-only. Two modes:
 * 1. isPublic: true → validate against publishCaseStudySchema and publish to /work
 * 2. Standard partial update → any subset of project fields
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  const { id } = await context.params;
  const [existing] = await getDb()
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  if (!existing) return jsonError("Project not found", 404);

  const body = await parseJson(req);

  // ── Publish as case study ─────────────────────────────────────

  if (body?.isPublic === true) {
    const parsed = publishCaseStudySchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const [updated] = await getDb()
      .update(projects)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    await getDb().insert(activityEvents).values({
      type:        "project_published",
      actorId:     session.user.id,
      actorRole:   "admin",
      entityType:  "project",
      entityId:    updated.id,
      description: `Project "${updated.title}" published as public case study at /work/${updated.publicSlug}`,
      visibleTo:   ["admin"],
    });

    return NextResponse.json({ project: updated });
  }

  // ── Unpublish / standard partial update ───────────────────────

  if (body?.isPublic === false) {
    const [updated] = await getDb()
      .update(projects)
      .set({ isPublic: false, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    await getDb().insert(activityEvents).values({
      type:        "project_unpublished",
      actorId:     session.user.id,
      actorRole:   "admin",
      entityType:  "project",
      entityId:    updated.id,
      description: `Project "${updated.title}" unpublished from /work`,
      visibleTo:   ["admin"],
    });

    return NextResponse.json({ project: updated });
  }

  // Standard field update (admin-only free-form)
  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const [updated] = await getDb()
    .update(projects)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();

  return NextResponse.json({ project: updated });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return jsonError("Forbidden", 403);

  const { id } = await context.params;
  await getDb().delete(projects).where(eq(projects.id, id));
  return NextResponse.json({ success: true });
}
