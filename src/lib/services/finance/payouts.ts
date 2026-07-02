import { eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { payouts } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { ACCOUNT_CODES } from "@/lib/services/finance/accounts";
import { postTransaction } from "@/lib/services/finance/ledger";
import { emitActivityEvent } from "@/lib/services/activity";
import type { CallerContext } from "@/lib/services/types";
import type { approvePayoutSchema, createPayoutSchema } from "@/lib/validation/finance";

type CreatePayoutInput = z.infer<typeof createPayoutSchema>;
type ApprovePayoutInput = z.infer<typeof approvePayoutSchema>;

/** Staff see all payouts; a developer sees only their own (powers /dev/earnings). */
export async function listPayouts(ctx: CallerContext) {
  const { session } = ctx;

  if (session.user.role === "admin") {
    await authorize(session, "finance.payout.read");
    return getDb().select().from(payouts).orderBy(payouts.createdAt);
  }

  if (session.user.role === "developer") {
    if (!session.user.engineerId) return [];
    return getDb().select().from(payouts).where(eq(payouts.engineerId, session.user.engineerId));
  }

  throw new ForbiddenError("Clients cannot view payouts.");
}

export async function createPayout(ctx: CallerContext, input: CreatePayoutInput) {
  if (ctx.session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can create a payout run.");
  }
  await authorize(ctx.session, "finance.payout.write");

  return getDb().transaction(async (tx) => {
    const [payout] = await tx.insert(payouts).values(input).returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.payout.write",
        resourceType: "payout",
        resourceId: payout.id,
        after: payout,
        requestId: ctx.requestId,
      },
      tx,
    );

    return payout;
  });
}

/** Approves a pending payout - posts the ledger entry that recognizes the engineer-pay cost. */
export async function approvePayout(ctx: CallerContext, id: string, input: ApprovePayoutInput) {
  if (ctx.session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can approve a payout.");
  }
  await authorize(ctx.session, "finance.payout.approve");

  const [existing] = await getDb().select().from(payouts).where(eq(payouts.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Payout not found.");
  if (existing.status !== "pending") {
    throw new ConflictError("Only a pending payout can be approved.");
  }

  return getDb().transaction(async (tx) => {
    const transaction = await postTransaction(
      {
        kind: "payout",
        referenceType: "payout",
        referenceId: existing.id,
        description: `Payout approved for period ${existing.periodStart} - ${existing.periodEnd}`,
        currency: existing.currency,
        entries: [
          {
            accountCode: ACCOUNT_CODES.COST_OF_SERVICES,
            direction: "debit",
            amountCents: existing.amountCents,
          },
          {
            accountCode: ACCOUNT_CODES.ACCOUNTS_PAYABLE_PAYOUTS,
            direction: "credit",
            amountCents: existing.amountCents,
          },
        ],
      },
      tx,
    );

    const [updated] = await tx
      .update(payouts)
      .set({
        status: "approved",
        method: input.method ?? existing.method,
        reference: input.reference ?? existing.reference,
        approvedBy: ctx.session.user.id,
        approvedAt: new Date(),
        ledgerTransactionId: transaction.id,
        updatedAt: new Date(),
      })
      .where(eq(payouts.id, id))
      .returning();

    await emitActivityEvent(
      {
        type: "payout_approved",
        actorId: ctx.session.user.id,
        actorRole: ctx.session.user.role,
        engineerId: updated.engineerId,
        entityType: "payout",
        entityId: updated.id,
        description: `Payout of $${(updated.amountCents / 100).toFixed(2)} approved for ${updated.periodStart} - ${updated.periodEnd}`,
        visibleTo: ["developer", "finance.payout.read"],
      },
      tx,
    );

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.payout.approve",
        resourceType: "payout",
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

/** Marks an approved payout paid - posts the ledger entry that clears the payable into cash. */
export async function markPayoutPaid(ctx: CallerContext, id: string, paidAt?: Date) {
  if (ctx.session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can record payout settlement.");
  }
  await authorize(ctx.session, "finance.payout.approve");

  const [existing] = await getDb().select().from(payouts).where(eq(payouts.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Payout not found.");
  if (existing.status !== "approved") {
    throw new ConflictError("Only an approved payout can be marked paid.");
  }

  return getDb().transaction(async (tx) => {
    await postTransaction(
      {
        kind: "payout",
        referenceType: "payout",
        referenceId: existing.id,
        description: `Payout settled for period ${existing.periodStart} - ${existing.periodEnd}`,
        currency: existing.currency,
        entries: [
          {
            accountCode: ACCOUNT_CODES.ACCOUNTS_PAYABLE_PAYOUTS,
            direction: "debit",
            amountCents: existing.amountCents,
          },
          {
            accountCode: ACCOUNT_CODES.CASH,
            direction: "credit",
            amountCents: existing.amountCents,
          },
        ],
      },
      tx,
    );

    const [updated] = await tx
      .update(payouts)
      .set({ status: "paid", paidAt: paidAt ?? new Date(), updatedAt: new Date() })
      .where(eq(payouts.id, id))
      .returning();

    await emitActivityEvent(
      {
        type: "payout_paid",
        actorId: ctx.session.user.id,
        actorRole: ctx.session.user.role,
        engineerId: updated.engineerId,
        entityType: "payout",
        entityId: updated.id,
        description: `Payout of $${(updated.amountCents / 100).toFixed(2)} paid for ${updated.periodStart} - ${updated.periodEnd}`,
        visibleTo: ["developer", "finance.payout.read"],
      },
      tx,
    );

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.payout.approve",
        resourceType: "payout",
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

/** Marks an approved payout failed (e.g. a bounced transfer) - no ledger reversal needed since cash never moved. */
export async function markPayoutFailed(ctx: CallerContext, id: string) {
  if (ctx.session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can mark a payout failed.");
  }
  await authorize(ctx.session, "finance.payout.approve");

  const [existing] = await getDb().select().from(payouts).where(eq(payouts.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Payout not found.");
  if (existing.status !== "approved") {
    throw new ConflictError("Only an approved payout can be marked failed.");
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(payouts)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(payouts.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.payout.approve",
        resourceType: "payout",
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
