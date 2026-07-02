import { desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { deals } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type {
  createDealSchema,
  transitionDealStageSchema,
  updateDealSchema,
} from "@/lib/validation/crm";

type CreateDealInput = z.infer<typeof createDealSchema>;
type UpdateDealInput = z.infer<typeof updateDealSchema>;
type TransitionDealStageInput = z.infer<typeof transitionDealStageSchema>;

function assertStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

/**
 * No deleteDeal - the permission catalog deliberately has no
 * crm.deal.delete (unlike lead/brief, which do). A deal that falls
 * through moves to stage "lost", it doesn't disappear - sales history is
 * kept, not erased.
 */
export async function listDeals(ctx: CallerContext) {
  assertStaff(ctx, "Only Andishi staff can view deals.");
  await authorize(ctx.session, "crm.deal.read");

  return getDb().select().from(deals).orderBy(desc(deals.updatedAt));
}

export async function getDeal(ctx: CallerContext, id: string) {
  assertStaff(ctx, "Only Andishi staff can view deals.");
  await authorize(ctx.session, "crm.deal.read");

  const [deal] = await getDb().select().from(deals).where(eq(deals.id, id)).limit(1);
  if (!deal) throw new NotFoundError("Deal not found.");
  return deal;
}

export async function createDeal(ctx: CallerContext, input: CreateDealInput) {
  assertStaff(ctx, "Only Andishi staff can create deals.");
  await authorize(ctx.session, "crm.deal.write");

  return getDb().transaction(async (tx) => {
    const [deal] = await tx.insert(deals).values(input).returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "crm.deal.write",
        resourceType: "deal",
        resourceId: deal.id,
        after: deal,
        requestId: ctx.requestId,
      },
      tx,
    );

    return deal;
  });
}

export async function updateDeal(ctx: CallerContext, id: string, input: UpdateDealInput) {
  assertStaff(ctx, "Only Andishi staff can edit deals.");
  await authorize(ctx.session, "crm.deal.write");

  const [existing] = await getDb().select().from(deals).where(eq(deals.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Deal not found.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(deals)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(deals.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "crm.deal.write",
        resourceType: "deal",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId: ctx.requestId,
      },
      tx,
    );

    return updated;
  });
}

export async function transitionDealStage(
  ctx: CallerContext,
  id: string,
  input: TransitionDealStageInput,
) {
  assertStaff(ctx, "Only Andishi staff can move a deal's stage.");
  await authorize(ctx.session, "crm.deal.write");

  const [existing] = await getDb().select().from(deals).where(eq(deals.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Deal not found.");

  if (input.stage === "lost" && !input.lostReason) {
    throw new ConflictError("A lost reason is required when marking a deal lost.");
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(deals)
      .set({
        stage: input.stage,
        lostReason: input.stage === "lost" ? input.lostReason : null,
        updatedAt: new Date(),
      })
      .where(eq(deals.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "crm.deal.write",
        resourceType: "deal",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId: ctx.requestId,
      },
      tx,
    );

    return updated;
  });
}
