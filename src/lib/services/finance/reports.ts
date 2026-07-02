import { and, eq, gte, lte, or } from "drizzle-orm";
import { getDb } from "@/db";
import { invoices, ledgerEntries } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { ForbiddenError } from "@/lib/authz/errors";
import { ACCOUNT_CODES, getAccountByCode } from "@/lib/services/finance/accounts";
import type { CallerContext } from "@/lib/services/types";

interface DateRange {
  from?: Date;
  to?: Date;
}

/**
 * Company-wide finance summary (ADR-0003): revenue is read from the
 * ledger (Service Revenue credits - i.e. what was actually invoiced, on
 * an accrual basis), cost is engineer pay + operating expenses, margin is
 * the difference. AR and DSO come from the Accounts Receivable balance,
 * not a period flow. Deliberately company-wide only for now - see
 * financeReportQuerySchema for why per-project cost isn't attempted yet.
 */
export async function getFinanceSummary(ctx: CallerContext, range: DateRange = {}) {
  if (ctx.session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can view finance reports.");
  }
  await authorize(ctx.session, "finance.report.export");

  const [revenueCents, costOfServicesCents, operatingExpensesCents, accountsReceivableCents] =
    await Promise.all([
      sumAccountEntries(ACCOUNT_CODES.SERVICE_REVENUE, "credit", range),
      sumAccountEntries(ACCOUNT_CODES.COST_OF_SERVICES, "debit", range),
      sumAccountEntries(ACCOUNT_CODES.OPERATING_EXPENSES, "debit", range),
      getAccountsReceivableBalance(),
    ]);

  const costCents = costOfServicesCents + operatingExpensesCents;
  const days = range.from && range.to ? daysBetween(range.from, range.to) : 30;

  return {
    revenueCents,
    costCents,
    marginCents: computeMarginCents(revenueCents, costCents),
    accountsReceivableCents,
    daysSalesOutstanding: computeDaysSalesOutstanding(accountsReceivableCents, revenueCents, days),
  };
}

/** Pure margin math (ADR-0003), extracted for direct unit testing. */
export function computeMarginCents(revenueCents: number, costCents: number): number {
  return revenueCents - costCents;
}

/**
 * DSO approximation using ending AR (no historical AR snapshots yet to
 * average over) - standard simplification until a daily balance job
 * exists. Pure function, extracted for direct unit testing.
 */
export function computeDaysSalesOutstanding(
  accountsReceivableCents: number,
  revenueCents: number,
  days: number,
): number {
  if (revenueCents <= 0) return 0;
  return Math.round((accountsReceivableCents / revenueCents) * days * 10) / 10;
}

export async function getMonthToDateSummary(ctx: CallerContext) {
  const now = new Date();
  return getFinanceSummary(ctx, { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now });
}

export async function getYearToDateSummary(ctx: CallerContext) {
  const now = new Date();
  return getFinanceSummary(ctx, { from: new Date(now.getFullYear(), 0, 1), to: now });
}

async function sumAccountEntries(
  accountCode: string,
  direction: "debit" | "credit",
  range: DateRange,
) {
  const account = await getAccountByCode(accountCode);
  const conditions = [
    eq(ledgerEntries.accountId, account.id),
    eq(ledgerEntries.direction, direction),
  ];
  if (range.from) conditions.push(gte(ledgerEntries.occurredAt, range.from));
  if (range.to) conditions.push(lte(ledgerEntries.occurredAt, range.to));

  const rows = await getDb()
    .select({ amountCents: ledgerEntries.amountCents })
    .from(ledgerEntries)
    .where(and(...conditions));

  return rows.reduce((sum, row) => sum + row.amountCents, 0);
}

/** All-time Accounts Receivable balance (debits - credits) - a balance, not a period flow. */
async function getAccountsReceivableBalance() {
  const account = await getAccountByCode(ACCOUNT_CODES.ACCOUNTS_RECEIVABLE);
  const rows = await getDb()
    .select({ amountCents: ledgerEntries.amountCents, direction: ledgerEntries.direction })
    .from(ledgerEntries)
    .where(eq(ledgerEntries.accountId, account.id));

  return rows.reduce(
    (balance, row) => balance + (row.direction === "debit" ? row.amountCents : -row.amountCents),
    0,
  );
}

function daysBetween(from: Date, to: Date) {
  return Math.max(1, Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)));
}

/** Outstanding (sent/overdue, unpaid) invoices, newest due first - the AR aging detail behind the summary number. */
export async function listOutstandingInvoices(ctx: CallerContext) {
  if (ctx.session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can view outstanding invoices.");
  }
  await authorize(ctx.session, "finance.report.export");

  return getDb()
    .select()
    .from(invoices)
    .where(or(eq(invoices.status, "sent"), eq(invoices.status, "overdue")));
}
