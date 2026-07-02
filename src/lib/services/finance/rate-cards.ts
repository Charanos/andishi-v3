import { and, desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { rateCards } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type { createRateCardSchema, updateRateCardSchema } from "@/lib/validation/finance";

type CreateRateCardInput = z.infer<typeof createRateCardSchema>;
type UpdateRateCardInput = z.infer<typeof updateRateCardSchema>;

function assertStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

export async function listRateCards(
  ctx: CallerContext,
  filters: { subjectType?: string; subjectId?: string } = {},
) {
  assertStaff(ctx, "Only Andishi staff can view rate cards.");
  await authorize(ctx.session, "finance.rate.read");

  const conditions = [];
  if (filters.subjectType) {
    conditions.push(
      eq(rateCards.subjectType, filters.subjectType as "engineer" | "client" | "org"),
    );
  }
  if (filters.subjectId) conditions.push(eq(rateCards.subjectId, filters.subjectId));

  const query = getDb().select().from(rateCards).orderBy(desc(rateCards.effectiveFrom));
  return conditions.length ? query.where(and(...conditions)) : query;
}

/**
 * The rate a given subject/kind currently carries - the most recent card
 * whose effective window covers `at` (defaults to now). Used by invoice
 * and payout generation, not just the admin UI, so it takes no session -
 * it's an internal lookup, not a staff-gated read.
 */
export async function getActiveRateCard(
  subjectType: "engineer" | "client" | "org",
  subjectId: string,
  kind: "bill" | "pay",
  at: Date = new Date(),
) {
  const rows = await getDb()
    .select()
    .from(rateCards)
    .where(
      and(
        eq(rateCards.subjectType, subjectType),
        eq(rateCards.subjectId, subjectId),
        eq(rateCards.kind, kind),
      ),
    )
    .orderBy(desc(rateCards.effectiveFrom));

  return (
    rows.find(
      (row) => row.effectiveFrom <= at && (row.effectiveTo === null || row.effectiveTo >= at),
    ) ?? null
  );
}

export async function createRateCard(ctx: CallerContext, input: CreateRateCardInput) {
  assertStaff(ctx, "Only Andishi staff can set rate cards.");
  await authorize(ctx.session, "finance.rate.write");

  return getDb().transaction(async (tx) => {
    const [rateCard] = await tx.insert(rateCards).values(input).returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.rate.write",
        resourceType: "rate_card",
        resourceId: rateCard.id,
        after: rateCard,
        requestId: ctx.requestId,
      },
      tx,
    );

    return rateCard;
  });
}

export async function updateRateCard(ctx: CallerContext, id: string, input: UpdateRateCardInput) {
  assertStaff(ctx, "Only Andishi staff can edit rate cards.");
  await authorize(ctx.session, "finance.rate.write");

  const [existing] = await getDb().select().from(rateCards).where(eq(rateCards.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Rate card not found.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(rateCards)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(rateCards.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.rate.write",
        resourceType: "rate_card",
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

export async function deleteRateCard(ctx: CallerContext, id: string) {
  assertStaff(ctx, "Only Andishi staff can delete rate cards.");
  await authorize(ctx.session, "finance.rate.write");

  const [existing] = await getDb().select().from(rateCards).where(eq(rateCards.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Rate card not found.");

  await getDb().transaction(async (tx) => {
    await tx.delete(rateCards).where(eq(rateCards.id, id));

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.rate.write",
        resourceType: "rate_card",
        resourceId: id,
        before: existing,
        requestId: ctx.requestId,
      },
      tx,
    );
  });
}
