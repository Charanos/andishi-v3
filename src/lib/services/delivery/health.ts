import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { getDb } from "@/db";
import { milestones, tasks } from "@/db/schema/delivery";
import { projects } from "@/db/schema/projects";

export type ProjectHealth = "on_track" | "at_risk" | "off_track";

type Executor = Pick<DB, "select" | "update">;

/**
 * Derives a project's health rollup from live task/milestone state:
 * - off_track: any task is blocked, or any unapproved milestone is overdue
 * - at_risk: any incomplete task is due today or already overdue
 * - on_track: otherwise
 */
export async function computeProjectHealth(
  projectId: string,
  tx?: Executor,
): Promise<ProjectHealth> {
  const db = tx ?? getDb();
  const today = new Date().toISOString().slice(0, 10);

  const [projectTasks, projectMilestones] = await Promise.all([
    db
      .select({ status: tasks.status, dueDate: tasks.dueDate })
      .from(tasks)
      .where(eq(tasks.projectId, projectId)),
    db
      .select({ status: milestones.status, dueDate: milestones.dueDate })
      .from(milestones)
      .where(eq(milestones.projectId, projectId)),
  ]);

  const hasBlockedTask = projectTasks.some((t) => t.status === "blocked");
  const hasOverdueMilestone = projectMilestones.some(
    (m) => m.status !== "approved" && !!m.dueDate && m.dueDate < today,
  );

  if (hasBlockedTask || hasOverdueMilestone) return "off_track";

  const hasOverdueTask = projectTasks.some(
    (t) => t.status !== "done" && !!t.dueDate && t.dueDate <= today,
  );
  if (hasOverdueTask) return "at_risk";

  return "on_track";
}

/** Recomputes and persists a project's health - call after any task/milestone mutation that could change it. */
export async function recomputeProjectHealth(
  projectId: string,
  tx?: Executor,
): Promise<ProjectHealth> {
  const health = await computeProjectHealth(projectId, tx);
  const db = tx ?? getDb();
  await db
    .update(projects)
    .set({ health, updatedAt: new Date() })
    .where(eq(projects.id, projectId));
  return health;
}
