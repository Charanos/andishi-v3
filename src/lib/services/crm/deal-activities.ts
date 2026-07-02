import { desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { dealActivities, deals } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type { createDealActivitySchema } from "@/lib/validation/crm";

type CreateDealActivityInput = z.infer<typeof createDealActivitySchema>;

function assertStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

/** The deal-specific note/call/meeting log - distinct from the global activity_events feed, which is cross-department. */
export async function listDealActivities(ctx: CallerContext, dealId: string) {
  assertStaff(ctx, "Only Andishi staff can view deal activity.");
  await authorize(ctx.session, "crm.deal.read");

  return getDb()
    .select()
    .from(dealActivities)
    .where(eq(dealActivities.dealId, dealId))
    .orderBy(desc(dealActivities.occurredAt));
}

export async function logDealActivity(ctx: CallerContext, input: CreateDealActivityInput) {
  assertStaff(ctx, "Only Andishi staff can log deal activity.");
  await authorize(ctx.session, "crm.deal.write");

  const [deal] = await getDb().select().from(deals).where(eq(deals.id, input.dealId)).limit(1);
  if (!deal) throw new NotFoundError("Deal not found.");

  const [activity] = await getDb()
    .insert(dealActivities)
    .values({ ...input, userId: ctx.session.user.id })
    .returning();

  return activity;
}
