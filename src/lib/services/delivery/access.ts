import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { type Project, projects } from "@/db/schema";
import { NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";

export type ProjectScope = "staff" | "client-read-only" | "developer";

export interface ProjectAccess {
  project: Project;
  scope: ProjectScope;
}

/**
 * Loads a project and resolves the caller's ownership scope against it.
 * Shared by every delivery service (tasks/milestones/sprints/allocations/
 * timesheets) since they all hang off a projectId and the ownership rules
 * are identical across all of them.
 *
 * - staff (admin persona): ownership isn't checked here - the caller must
 *   separately call authorize() with the specific permission for the
 *   resource/action (delivery.task.write, delivery.milestone.approve, etc).
 * - client: read-only, only for their own organization's project.
 * - developer: only for a project they're assigned to (engineerIds);
 *   individual service functions decide what a developer may write (e.g.
 *   moving their own task, logging their own time) - this helper only
 *   proves they're allowed to be looking at the project at all.
 */
export async function resolveProjectAccess(
  ctx: CallerContext,
  projectId: string,
): Promise<ProjectAccess> {
  const { session } = ctx;

  const [project] = await getDb()
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!project) throw new NotFoundError("Project not found.");

  if (session.user.role === "admin") {
    return { project, scope: "staff" };
  }

  if (session.user.role === "client") {
    if (!session.user.organizationId || project.organizationId !== session.user.organizationId) {
      throw new NotFoundError("Project not found.");
    }
    return { project, scope: "client-read-only" };
  }

  // developer
  if (!session.user.engineerId || !project.engineerIds.includes(session.user.engineerId)) {
    throw new NotFoundError("Project not found.");
  }
  return { project, scope: "developer" };
}
