import { eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { milestones } from "@/db/schema/delivery";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { DomainValidationError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { resolveProjectAccess } from "@/lib/services/delivery/access";
import { recomputeProjectHealth } from "@/lib/services/delivery/health";
import { emitActivityEvent } from "@/lib/services/activity";
import type { CallerContext } from "@/lib/services/types";
import type { createMilestoneSchema, updateMilestoneSchema } from "@/lib/validation/delivery";

type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;

export async function listMilestones(ctx: CallerContext, projectId: string) {
  const { session } = ctx;
  const { scope } = await resolveProjectAccess(ctx, projectId);

  if (scope === "staff") {
    await authorize(session, "delivery.milestone.read");
  }
  // client-read-only and developer scopes may read once ownership is proven.

  return getDb()
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, projectId))
    .orderBy(milestones.order);
}

export async function createMilestone(ctx: CallerContext, input: CreateMilestoneInput) {
  const { session, requestId, actorIp } = ctx;
  const { scope } = await resolveProjectAccess(ctx, input.projectId);

  if (scope !== "staff") throw new ForbiddenError("Only Andishi staff can create milestones.");
  await authorize(session, "delivery.milestone.write");

  return getDb().transaction(async (tx) => {
    const [milestone] = await tx.insert(milestones).values(input).returning();

    await emitActivityEvent(
      {
        type: "milestone_created",
        actorId: session.user.id,
        actorRole: session.user.role,
        entityType: "milestone",
        entityId: milestone.id,
        description: `Milestone "${milestone.title}" created`,
        visibleTo: ["client", "delivery.milestone.read"],
      },
      tx,
    );

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.milestone.write",
        resourceType: "milestone",
        resourceId: milestone.id,
        after: milestone,
        requestId,
      },
      tx,
    );

    return milestone;
  });
}

export async function updateMilestone(
  ctx: CallerContext,
  milestoneId: string,
  input: UpdateMilestoneInput,
) {
  const { session, requestId, actorIp } = ctx;

  const [existing] = await getDb()
    .select()
    .from(milestones)
    .where(eq(milestones.id, milestoneId))
    .limit(1);
  if (!existing) throw new NotFoundError("Milestone not found.");

  const { scope } = await resolveProjectAccess(ctx, existing.projectId);
  if (scope !== "staff") throw new ForbiddenError("Only Andishi staff can edit milestones.");
  await authorize(session, "delivery.milestone.write");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(milestones)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(milestones.id, milestoneId))
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.milestone.write",
        resourceType: "milestone",
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

/** Any engineer on the project marks a milestone's work ready for review. */
export async function submitMilestone(ctx: CallerContext, milestoneId: string) {
  const { session, requestId, actorIp } = ctx;

  const [existing] = await getDb()
    .select()
    .from(milestones)
    .where(eq(milestones.id, milestoneId))
    .limit(1);
  if (!existing) throw new NotFoundError("Milestone not found.");

  const { scope } = await resolveProjectAccess(ctx, existing.projectId);
  if (scope === "client-read-only") throw new ForbiddenError("Clients cannot submit milestones.");
  if (scope === "staff") await authorize(session, "delivery.milestone.write");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(milestones)
      .set({ status: "submitted", submittedAt: new Date(), updatedAt: new Date() })
      .where(eq(milestones.id, milestoneId))
      .returning();

    await emitActivityEvent(
      {
        type: "milestone_submitted",
        actorId: session.user.id,
        actorRole: session.user.role,
        entityType: "milestone",
        entityId: updated.id,
        description: `Milestone "${updated.title}" submitted for review`,
        visibleTo: ["client", "delivery.milestone.approve"],
      },
      tx,
    );

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.milestone.write",
        resourceType: "milestone",
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

/** delivery_pm/super_admin approves a submitted milestone - finance reads this to bill fixed-price work. */
export async function approveMilestone(ctx: CallerContext, milestoneId: string) {
  const { session, requestId, actorIp } = ctx;

  const [existing] = await getDb()
    .select()
    .from(milestones)
    .where(eq(milestones.id, milestoneId))
    .limit(1);
  if (!existing) throw new NotFoundError("Milestone not found.");

  const { scope } = await resolveProjectAccess(ctx, existing.projectId);
  if (scope !== "staff") throw new ForbiddenError("Only Andishi staff can approve milestones.");
  await authorize(session, "delivery.milestone.approve");

  if (existing.status !== "submitted") {
    throw new DomainValidationError("Only a submitted milestone can be approved.");
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(milestones)
      .set({ status: "approved", approvedAt: new Date(), updatedAt: new Date() })
      .where(eq(milestones.id, milestoneId))
      .returning();

    await recomputeProjectHealth(existing.projectId, tx);

    await emitActivityEvent(
      {
        type: "milestone_approved",
        actorId: session.user.id,
        actorRole: session.user.role,
        entityType: "milestone",
        entityId: updated.id,
        description: `Milestone "${updated.title}" approved`,
        // Reaches finance_manager and delivery_pm (both hold
        // delivery.milestone.read) plus the client, per ADR-0007.
        visibleTo: ["client", "delivery.milestone.read"],
      },
      tx,
    );

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.milestone.approve",
        resourceType: "milestone",
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
