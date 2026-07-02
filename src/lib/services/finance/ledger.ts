import { desc, eq } from "drizzle-orm";
import type { DB } from "@/db";
import { getDb } from "@/db";
import { ledgerEntries, ledgerTransactions } from "@/db/schema";
import { DomainValidationError } from "@/lib/authz/errors";
import { getAccountByCode } from "@/lib/services/finance/accounts";

type Executor = Pick<DB, "insert" | "select">;

export interface PostEntryInput {
  /** Ledger account code, e.g. ACCOUNT_CODES.SERVICE_REVENUE - never a raw row id. */
  accountCode: string;
  direction: "debit" | "credit";
  amountCents: number;
  memo?: string;
}

export interface PostTransactionInput {
  kind: "invoice" | "payout" | "expense" | "adjustment";
  referenceType: string;
  referenceId: string;
  description: string;
  currency?: string;
  entries: PostEntryInput[];
}

/**
 * The single write path for the ledger (ADR-0003). Every finance mutation
 * that represents real money movement - sending an invoice, approving an
 * expense, approving a payout - posts through here instead of writing
 * ledger_entries directly, so the debits-equal-credits invariant can never
 * be bypassed. Always call inside the same db.transaction() as the
 * triggering mutation (pass `tx`) so the ledger entry only lands if the
 * mutation commits.
 */
export async function postTransaction(input: PostTransactionInput, tx?: Executor) {
  const db = tx ?? getDb();
  const currency = input.currency ?? "USD";

  assertBalanced(input.entries);

  const [transaction] = await db
    .insert(ledgerTransactions)
    .values({
      kind: input.kind,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      description: input.description,
    })
    .returning();

  for (const entry of input.entries) {
    const account = await getAccountByCode(entry.accountCode);

    await db.insert(ledgerEntries).values({
      transactionId: transaction.id,
      accountId: account.id,
      direction: entry.direction,
      amountCents: entry.amountCents,
      currency,
      memo: entry.memo,
    });
  }

  return transaction;
}

/**
 * The core double-entry invariant, extracted as a pure function so it's
 * unit-testable without a database: every transaction must have at least
 * one debit and one credit, and debits must equal credits.
 */
export function assertBalanced(entries: PostEntryInput[]): void {
  if (entries.length < 2) {
    throw new DomainValidationError(
      "A ledger transaction needs at least two entries (one debit, one credit).",
    );
  }

  const debits = sumByDirection(entries, "debit");
  const credits = sumByDirection(entries, "credit");

  if (debits !== credits) {
    throw new DomainValidationError(
      `Unbalanced ledger transaction: debits (${debits}) must equal credits (${credits}).`,
    );
  }
}

function sumByDirection(entries: PostEntryInput[], direction: "debit" | "credit") {
  return entries
    .filter((entry) => entry.direction === direction)
    .reduce((sum, entry) => sum + entry.amountCents, 0);
}

/** Staff read of a transaction's entries - used by the ledger detail view. */
export async function getTransactionEntries(transactionId: string) {
  return getDb().select().from(ledgerEntries).where(eq(ledgerEntries.transactionId, transactionId));
}

/** Staff read of recent transactions, newest first - used by the ledger list view. */
export async function listLedgerTransactions(limit = 50) {
  return getDb()
    .select()
    .from(ledgerTransactions)
    .orderBy(desc(ledgerTransactions.postedAt))
    .limit(limit);
}
