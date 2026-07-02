import { and, desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { budgets } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type { createBudgetSchema, updateBudgetSchema } from "@/lib/validation/finance";

type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

function assertStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

export async function listBudgets(
  ctx: CallerContext,
  filters: { scopeType?: string; scopeId?: string } = {},
) {
  assertStaff(ctx, "Only Andishi staff can view budgets.");
  await authorize(ctx.session, "finance.budget.read");

  const conditions = [];
  if (filters.scopeType) {
    conditions.push(eq(budgets.scopeType, filters.scopeType as "org" | "project" | "department"));
  }
  if (filters.scopeId) conditions.push(eq(budgets.scopeId, filters.scopeId));

  const query = getDb().select().from(budgets).orderBy(desc(budgets.period));
  return conditions.length ? query.where(and(...conditions)) : query;
}

export async function createBudget(ctx: CallerContext, input: CreateBudgetInput) {
  assertStaff(ctx, "Only Andishi staff can set budgets.");
  await authorize(ctx.session, "finance.budget.write");

  return getDb().transaction(async (tx) => {
    const [budget] = await tx.insert(budgets).values(input).returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.budget.write",
        resourceType: "budget",
        resourceId: budget.id,
        after: budget,
        requestId: ctx.requestId,
      },
      tx,
    );

    return budget;
  });
}

export async function updateBudget(ctx: CallerContext, id: string, input: UpdateBudgetInput) {
  assertStaff(ctx, "Only Andishi staff can edit budgets.");
  await authorize(ctx.session, "finance.budget.write");

  const [existing] = await getDb().select().from(budgets).where(eq(budgets.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Budget not found.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(budgets)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(budgets.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.budget.write",
        resourceType: "budget",
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

export async function deleteBudget(ctx: CallerContext, id: string) {
  assertStaff(ctx, "Only Andishi staff can delete budgets.");
  await authorize(ctx.session, "finance.budget.write");

  const [existing] = await getDb().select().from(budgets).where(eq(budgets.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Budget not found.");

  await getDb().transaction(async (tx) => {
    await tx.delete(budgets).where(eq(budgets.id, id));

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.budget.write",
        resourceType: "budget",
        resourceId: id,
        before: existing,
        requestId: ctx.requestId,
      },
      tx,
    );
  });
}
