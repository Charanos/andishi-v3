import { eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { tasks } from "@/db/schema/delivery";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { resolveProjectAccess } from "@/lib/services/delivery/access";
import { recomputeProjectHealth } from "@/lib/services/delivery/health";
import { emitActivityEvent } from "@/lib/services/activity";
import type { CallerContext } from "@/lib/services/types";
import type { createTaskSchema, moveTaskSchema, updateTaskSchema } from "@/lib/validation/delivery";

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
type MoveTaskInput = z.infer<typeof moveTaskSchema>;

/**
 * Staff see all tasks (gated by delivery.task.read). Clients and developers
 * see the full task list for a project they're scoped into - team-wide
 * transparency, not filtered to "my tasks only", since a client should see
 * the whole board and an engineer benefits from seeing teammates' tasks.
 */
export async function listTasks(ctx: CallerContext, projectId: string) {
  const { session } = ctx;
  const { scope } = await resolveProjectAccess(ctx, projectId);

  if (scope === "staff") {
    await authorize(session, "delivery.task.read");
  }

  return getDb().select().from(tasks).where(eq(tasks.projectId, projectId)).orderBy(tasks.order);
}

/** Only staff create tasks - task creation is a PM planning action. */
export async function createTask(ctx: CallerContext, input: CreateTaskInput) {
  const { session, requestId, actorIp } = ctx;
  const { scope } = await resolveProjectAccess(ctx, input.projectId);

  if (scope !== "staff") throw new ForbiddenError("Only Andishi staff can create tasks.");
  await authorize(session, "delivery.task.write");

  return getDb().transaction(async (tx) => {
    const [task] = await tx
      .insert(tasks)
      .values({ ...input, reporterUserId: session.user.id })
      .returning();

    await emitActivityEvent(
      {
        type: "task_created",
        actorId: session.user.id,
        actorRole: session.user.role,
        entityType: "task",
        entityId: task.id,
        description: `Task "${task.title}" created`,
        visibleTo: ["client", "developer", "delivery.task.read"],
      },
      tx,
    );

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.task.write",
        resourceType: "task",
        resourceId: task.id,
        after: task,
        requestId,
      },
      tx,
    );

    return task;
  });
}

/** Full field edits (title, description, assignment, estimate) - staff only. */
export async function updateTask(ctx: CallerContext, taskId: string, input: UpdateTaskInput) {
  const { session, requestId, actorIp } = ctx;

  const [existing] = await getDb().select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (!existing) throw new NotFoundError("Task not found.");

  const { scope } = await resolveProjectAccess(ctx, existing.projectId);
  if (scope !== "staff") throw new ForbiddenError("Only Andishi staff can edit task details.");
  await authorize(session, "delivery.task.write");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(tasks)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
      .returning();

    if (input.status && input.status !== existing.status) {
      await recomputeProjectHealth(existing.projectId, tx);
    }

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.task.write",
        resourceType: "task",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId,
      },
      tx,
    );

    return updated;
  });
}

/**
 * Kanban-style transition (status/sprint/order only). Staff can move any
 * task; a developer may move only a task assigned to them, and only this
 * narrow set of fields - not reassign it or edit its content.
 */
export async function moveTask(ctx: CallerContext, taskId: string, input: MoveTaskInput) {
  const { session, requestId, actorIp } = ctx;

  const [existing] = await getDb().select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (!existing) throw new NotFoundError("Task not found.");

  const { scope } = await resolveProjectAccess(ctx, existing.projectId);

  if (scope === "client-read-only") {
    throw new ForbiddenError("Clients cannot move tasks.");
  }

  if (scope === "staff") {
    await authorize(session, "delivery.task.write");
  } else if (existing.assigneeEngineerId !== session.user.engineerId) {
    throw new ForbiddenError("You can only move tasks assigned to you.");
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(tasks)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
      .returning();

    if (input.status && input.status !== existing.status) {
      await recomputeProjectHealth(existing.projectId, tx);
    }

    await emitActivityEvent(
      {
        type: "task_moved",
        actorId: session.user.id,
        actorRole: session.user.role,
        entityType: "task",
        entityId: updated.id,
        description: `Task "${updated.title}" moved to ${updated.status}`,
        visibleTo: ["client", "developer", "delivery.task.read"],
      },
      tx,
    );

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.task.write",
        resourceType: "task",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId,
      },
      tx,
    );

    return updated;
  });
}

export async function deleteTask(ctx: CallerContext, taskId: string) {
  const { session, requestId, actorIp } = ctx;

  const [existing] = await getDb().select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (!existing) throw new NotFoundError("Task not found.");

  const { scope } = await resolveProjectAccess(ctx, existing.projectId);
  if (scope !== "staff") throw new ForbiddenError("Only Andishi staff can delete tasks.");
  await authorize(session, "delivery.task.delete");

  await getDb().transaction(async (tx) => {
    await tx.delete(tasks).where(eq(tasks.id, taskId));

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.task.delete",
        resourceType: "task",
        resourceId: taskId,
        before: existing,
        requestId,
      },
      tx,
    );
  });
}
