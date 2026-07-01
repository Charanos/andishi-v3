import { and, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { allocations } from "@/db/schema/delivery";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type { createAllocationSchema, updateAllocationSchema } from "@/lib/validation/delivery";

type CreateAllocationInput = z.infer<typeof createAllocationSchema>;
type UpdateAllocationInput = z.infer<typeof updateAllocationSchema>;

/**
 * Capacity planning is internal - clients never see it. Staff with
 * delivery.allocation.read see everyone's; an engineer may only see their
 * own (how many hours are planned for them this week).
 */
export async function listAllocations(
  ctx: CallerContext,
  filters: { engineerId?: string; projectId?: string },
) {
  const { session } = ctx;

  if (session.user.role === "client") {
    throw new ForbiddenError("Allocations are an internal planning surface.");
  }

  if (session.user.role === "admin") {
    await authorize(session, "delivery.allocation.read");
  } else if (!session.user.engineerId || filters.engineerId !== session.user.engineerId) {
    throw new ForbiddenError("You can only view your own allocations.");
  }

  const conditions = [];
  if (filters.engineerId) conditions.push(eq(allocations.engineerId, filters.engineerId));
  if (filters.projectId) conditions.push(eq(allocations.projectId, filters.projectId));

  return getDb()
    .select()
    .from(allocations)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(allocations.weekStart);
}

export async function createAllocation(ctx: CallerContext, input: CreateAllocationInput) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can plan allocations.");
  }
  await authorize(session, "delivery.allocation.write");

  return getDb().transaction(async (tx) => {
    const [allocation] = await tx.insert(allocations).values(input).returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.allocation.write",
        resourceType: "allocation",
        resourceId: allocation.id,
        after: allocation,
        requestId,
      },
      tx,
    );

    return allocation;
  });
}

export async function updateAllocation(
  ctx: CallerContext,
  allocationId: string,
  input: UpdateAllocationInput,
) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can adjust allocations.");
  }
  await authorize(session, "delivery.allocation.write");

  const [existing] = await getDb()
    .select()
    .from(allocations)
    .where(eq(allocations.id, allocationId))
    .limit(1);
  if (!existing) throw new NotFoundError("Allocation not found.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(allocations)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(allocations.id, allocationId))
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.allocation.write",
        resourceType: "allocation",
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

export async function deleteAllocation(ctx: CallerContext, allocationId: string) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can remove allocations.");
  }
  await authorize(session, "delivery.allocation.write");

  const [existing] = await getDb()
    .select()
    .from(allocations)
    .where(eq(allocations.id, allocationId))
    .limit(1);
  if (!existing) throw new NotFoundError("Allocation not found.");

  await getDb().transaction(async (tx) => {
    await tx.delete(allocations).where(eq(allocations.id, allocationId));

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.allocation.write",
        resourceType: "allocation",
        resourceId: allocationId,
        before: existing,
        requestId,
      },
      tx,
    );
  });
}
