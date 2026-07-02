import { eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { expenses } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { ACCOUNT_CODES } from "@/lib/services/finance/accounts";
import { postTransaction } from "@/lib/services/finance/ledger";
import type { CallerContext } from "@/lib/services/types";
import type { createExpenseSchema, updateExpenseSchema } from "@/lib/validation/finance";

type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

function assertStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

export async function listExpenses(ctx: CallerContext) {
  assertStaff(ctx, "Only Andishi staff can view expenses.");
  await authorize(ctx.session, "finance.expense.read");

  return getDb().select().from(expenses).orderBy(expenses.createdAt);
}

export async function createExpense(ctx: CallerContext, input: CreateExpenseInput) {
  assertStaff(ctx, "Only Andishi staff can record expenses.");
  await authorize(ctx.session, "finance.expense.write");

  return getDb().transaction(async (tx) => {
    const [expense] = await tx
      .insert(expenses)
      .values({ ...input, enteredBy: ctx.session.user.id })
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.expense.write",
        resourceType: "expense",
        resourceId: expense.id,
        after: expense,
        requestId: ctx.requestId,
      },
      tx,
    );

    return expense;
  });
}

export async function updateExpense(ctx: CallerContext, id: string, input: UpdateExpenseInput) {
  assertStaff(ctx, "Only Andishi staff can edit expenses.");
  await authorize(ctx.session, "finance.expense.write");

  const [existing] = await getDb().select().from(expenses).where(eq(expenses.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Expense not found.");
  if (existing.status !== "pending") {
    throw new ConflictError("Only a pending expense can be edited.");
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(expenses)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.expense.write",
        resourceType: "expense",
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

/** Approves or rejects a pending expense - approval posts the ledger entry that recognizes the cost. */
export async function decideExpense(
  ctx: CallerContext,
  id: string,
  decision: "approved" | "rejected",
) {
  assertStaff(ctx, "Only Andishi staff can decide on expenses.");
  await authorize(ctx.session, "finance.expense.approve");

  const [existing] = await getDb().select().from(expenses).where(eq(expenses.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Expense not found.");
  if (existing.status !== "pending") {
    throw new ConflictError("Only a pending expense can be approved or rejected.");
  }

  return getDb().transaction(async (tx) => {
    let ledgerTransactionId: string | null = null;

    if (decision === "approved") {
      const transaction = await postTransaction(
        {
          kind: "expense",
          referenceType: "expense",
          referenceId: existing.id,
          description: `Expense approved: ${existing.category}`,
          currency: existing.currency,
          entries: [
            {
              accountCode: ACCOUNT_CODES.OPERATING_EXPENSES,
              direction: "debit",
              amountCents: existing.amountCents,
            },
            {
              accountCode: ACCOUNT_CODES.ACCOUNTS_PAYABLE_EXPENSES,
              direction: "credit",
              amountCents: existing.amountCents,
            },
          ],
        },
        tx,
      );
      ledgerTransactionId = transaction.id;
    }

    const [updated] = await tx
      .update(expenses)
      .set({
        status: decision,
        approvedBy: ctx.session.user.id,
        approvedAt: new Date(),
        ledgerTransactionId,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.expense.approve",
        resourceType: "expense",
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

/** Marks an approved expense reimbursed - posts the ledger entry that clears the payable into cash. */
export async function reimburseExpense(ctx: CallerContext, id: string) {
  assertStaff(ctx, "Only Andishi staff can reimburse expenses.");
  await authorize(ctx.session, "finance.expense.approve");

  const [existing] = await getDb().select().from(expenses).where(eq(expenses.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Expense not found.");
  if (existing.status !== "approved") {
    throw new ConflictError("Only an approved expense can be reimbursed.");
  }

  return getDb().transaction(async (tx) => {
    await postTransaction(
      {
        kind: "expense",
        referenceType: "expense",
        referenceId: existing.id,
        description: `Expense reimbursed: ${existing.category}`,
        currency: existing.currency,
        entries: [
          {
            accountCode: ACCOUNT_CODES.ACCOUNTS_PAYABLE_EXPENSES,
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
      .update(expenses)
      .set({ status: "reimbursed", updatedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.expense.approve",
        resourceType: "expense",
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

export async function deleteExpense(ctx: CallerContext, id: string) {
  assertStaff(ctx, "Only Andishi staff can delete expenses.");
  await authorize(ctx.session, "finance.expense.write");

  const [existing] = await getDb().select().from(expenses).where(eq(expenses.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Expense not found.");
  if (existing.status !== "pending") {
    throw new ConflictError("Only a pending expense can be deleted.");
  }

  await getDb().transaction(async (tx) => {
    await tx.delete(expenses).where(eq(expenses.id, id));

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.expense.write",
        resourceType: "expense",
        resourceId: id,
        before: existing,
        requestId: ctx.requestId,
      },
      tx,
    );
  });
}
