import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { ledgerAccounts } from "@/db/schema";

/**
 * Minimal chart of accounts sufficient for invoice/expense/payout postings
 * (ADR-0003). Codes are the stable identifier services post against -
 * never the row id, so re-running the seed is safe and account rows can be
 * looked up without a round-trip cache.
 */
export const ACCOUNT_CODES = {
  ACCOUNTS_RECEIVABLE: "1000",
  CASH: "1010",
  ACCOUNTS_PAYABLE_EXPENSES: "2000",
  ACCOUNTS_PAYABLE_PAYOUTS: "2010",
  SERVICE_REVENUE: "4000",
  COST_OF_SERVICES: "5000",
  OPERATING_EXPENSES: "5100",
} as const;

const CHART_OF_ACCOUNTS: Array<{
  code: string;
  name: string;
  type: "asset" | "liability" | "revenue" | "expense" | "equity";
}> = [
  { code: ACCOUNT_CODES.ACCOUNTS_RECEIVABLE, name: "Accounts Receivable", type: "asset" },
  { code: ACCOUNT_CODES.CASH, name: "Cash", type: "asset" },
  {
    code: ACCOUNT_CODES.ACCOUNTS_PAYABLE_EXPENSES,
    name: "Accounts Payable - Expenses",
    type: "liability",
  },
  {
    code: ACCOUNT_CODES.ACCOUNTS_PAYABLE_PAYOUTS,
    name: "Accounts Payable - Engineer Payouts",
    type: "liability",
  },
  { code: ACCOUNT_CODES.SERVICE_REVENUE, name: "Service Revenue", type: "revenue" },
  {
    code: ACCOUNT_CODES.COST_OF_SERVICES,
    name: "Cost of Services - Engineer Pay",
    type: "expense",
  },
  { code: ACCOUNT_CODES.OPERATING_EXPENSES, name: "Operating Expenses", type: "expense" },
];

/** Idempotent - safe to call on every boot/deploy, mirrors seedPermissionCatalog. */
export async function seedChartOfAccounts() {
  const db = getDb();

  for (const account of CHART_OF_ACCOUNTS) {
    const [existing] = await db
      .select({ id: ledgerAccounts.id })
      .from(ledgerAccounts)
      .where(eq(ledgerAccounts.code, account.code))
      .limit(1);

    if (!existing) {
      await db.insert(ledgerAccounts).values(account);
    }
  }
}

export async function getAccountByCode(code: string) {
  const [account] = await getDb()
    .select()
    .from(ledgerAccounts)
    .where(eq(ledgerAccounts.code, code))
    .limit(1);

  if (!account) {
    throw new Error(
      `Ledger account "${code}" not found - run seedChartOfAccounts() before posting.`,
    );
  }

  return account;
}
