import { arrayContains, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ForbiddenError } from "@/lib/authz/errors";
import type { createProjectSchema } from "@/lib/validation/entities";
import type { CallerContext } from "@/lib/services/types";

type CreateProjectInput = z.infer<typeof createProjectSchema>;

/**
 * Admin (staff): sees all projects, gated by delivery.project.read.
 * Developer: sees only projects they are assigned to (ownership scope).
 * Client: sees only their own organization's projects (ownership scope).
 */
export async function listProjects(ctx: CallerContext) {
  const { session } = ctx;

  if (session.user.role === "admin") {
    await authorize(session, "delivery.project.read");
    return getDb().select().from(projects).orderBy(projects.createdAt);
  }

  if (session.user.role === "developer") {
    if (!session.user.engineerId) return [];
    return getDb()
      .select()
      .from(projects)
      .where(arrayContains(projects.engineerIds, [session.user.engineerId]));
  }

  if (!session.user.organizationId) return [];
  return getDb()
    .select()
    .from(projects)
    .where(eq(projects.organizationId, session.user.organizationId));
}

/** Only staff with delivery.project.write may create projects. */
export async function createProject(ctx: CallerContext, input: CreateProjectInput) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can create projects.");
  }

  await authorize(session, "delivery.project.write");

  return getDb().transaction(async (tx) => {
    const [project] = await tx.insert(projects).values(input).returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.project.write",
        resourceType: "project",
        resourceId: project.id,
        after: project,
        requestId,
      },
      tx,
    );

    return project;
  });
}
