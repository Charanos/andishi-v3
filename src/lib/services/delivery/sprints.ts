import { and, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { sprints } from "@/db/schema/delivery";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { resolveProjectAccess } from "@/lib/services/delivery/access";
import { emitActivityEvent } from "@/lib/services/activity";
import type { CallerContext } from "@/lib/services/types";
import type { createSprintSchema, updateSprintSchema } from "@/lib/validation/delivery";

type CreateSprintInput = z.infer<typeof createSprintSchema>;
type UpdateSprintInput = z.infer<typeof updateSprintSchema>;

export async function listSprints(ctx: CallerContext, projectId: string) {
  const { session } = ctx;
  const { scope } = await resolveProjectAccess(ctx, projectId);

  if (scope === "staff") {
    await authorize(session, "delivery.sprint.read");
  }

  return getDb()
    .select()
    .from(sprints)
    .where(eq(sprints.projectId, projectId))
    .orderBy(sprints.startDate);
}

export async function createSprint(ctx: CallerContext, input: CreateSprintInput) {
  const { session, requestId, actorIp } = ctx;
  const { scope } = await resolveProjectAccess(ctx, input.projectId);

  if (scope !== "staff") throw new ForbiddenError("Only Andishi staff can create sprints.");
  await authorize(session, "delivery.sprint.write");

  return getDb().transaction(async (tx) => {
    const [sprint] = await tx.insert(sprints).values(input).returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.sprint.write",
        resourceType: "sprint",
        resourceId: sprint.id,
        after: sprint,
        requestId,
      },
      tx,
    );

    return sprint;
  });
}

export async function updateSprint(ctx: CallerContext, sprintId: string, input: UpdateSprintInput) {
  const { session, requestId, actorIp } = ctx;

  const [existing] = await getDb().select().from(sprints).where(eq(sprints.id, sprintId)).limit(1);
  if (!existing) throw new NotFoundError("Sprint not found.");

  const { scope } = await resolveProjectAccess(ctx, existing.projectId);
  if (scope !== "staff") throw new ForbiddenError("Only Andishi staff can edit sprints.");
  await authorize(session, "delivery.sprint.write");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(sprints)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(sprints.id, sprintId))
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.sprint.write",
        resourceType: "sprint",
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

/** A project runs one active sprint at a time. */
export async function openSprint(ctx: CallerContext, sprintId: string) {
  const { session, requestId, actorIp } = ctx;

  const [existing] = await getDb().select().from(sprints).where(eq(sprints.id, sprintId)).limit(1);
  if (!existing) throw new NotFoundError("Sprint not found.");

  const { scope } = await resolveProjectAccess(ctx, existing.projectId);
  if (scope !== "staff") throw new ForbiddenError("Only Andishi staff can open a sprint.");
  await authorize(session, "delivery.sprint.write");

  const [alreadyActive] = await getDb()
    .select()
    .from(sprints)
    .where(and(eq(sprints.projectId, existing.projectId), eq(sprints.status, "active")))
    .limit(1);

  if (alreadyActive && alreadyActive.id !== sprintId) {
    throw new ConflictError(`Sprint "${alreadyActive.name}" is already active on this project.`);
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(sprints)
      .set({ status: "active", updatedAt: new Date() })
      .where(eq(sprints.id, sprintId))
      .returning();

    await emitActivityEvent(
      {
        type: "sprint_opened",
        actorId: session.user.id,
        actorRole: session.user.role,
        entityType: "sprint",
        entityId: updated.id,
        description: `Sprint "${updated.name}" opened`,
        visibleTo: ["client", "developer", "delivery.sprint.read"],
      },
      tx,
    );

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.sprint.write",
        resourceType: "sprint",
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

export async function closeSprint(ctx: CallerContext, sprintId: string) {
  const { session, requestId, actorIp } = ctx;

  const [existing] = await getDb().select().from(sprints).where(eq(sprints.id, sprintId)).limit(1);
  if (!existing) throw new NotFoundError("Sprint not found.");

  const { scope } = await resolveProjectAccess(ctx, existing.projectId);
  if (scope !== "staff") throw new ForbiddenError("Only Andishi staff can close a sprint.");
  await authorize(session, "delivery.sprint.write");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(sprints)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(sprints.id, sprintId))
      .returning();

    await emitActivityEvent(
      {
        type: "sprint_closed",
        actorId: session.user.id,
        actorRole: session.user.role,
        entityType: "sprint",
        entityId: updated.id,
        description: `Sprint "${updated.name}" closed`,
        visibleTo: ["client", "developer", "delivery.sprint.read"],
      },
      tx,
    );

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.sprint.write",
        resourceType: "sprint",
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
