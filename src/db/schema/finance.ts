import { index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { engineers } from "@/db/schema/engineers";
import { organizations } from "@/db/schema/organizations";
import { projects } from "@/db/schema/projects";
import { users } from "@/db/schema/users";

// ADR-0003: internal, provider-agnostic finance ledger. All money is
// integer minor units (`*_cents`) + an explicit `currency` - never float.
// Stripe/Wise fields are added nullable so a later integration is a
// config/wiring change, not a reshape.

// ── Rate cards ───────────────────────────────────────────────────────

export const rateSubjectTypeEnum = pgEnum("rate_subject_type", ["engineer", "client", "org"]);
export const rateKindEnum = pgEnum("rate_kind", ["bill", "pay"]);
export const rateUnitEnum = pgEnum("rate_unit", ["hour", "day", "month", "project"]);

export const rateCards = pgTable(
  "rate_cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Polymorphic subject (engineer/client/org) - plain uuid, not FK
    // constrained, matching the activity_events.entityId convention
    // already used elsewhere in this codebase for polymorphic refs.
    subjectType: rateSubjectTypeEnum("subject_type").notNull(),
    subjectId: uuid("subject_id").notNull(),
    kind: rateKindEnum("kind").notNull(),
    amountCents: integer("amount_cents").notNull(),
    unit: rateUnitEnum("unit").notNull().default("hour"),
    currency: text("currency").notNull().default("USD"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull().defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    subjectIdx: index("rate_cards_subject_idx").on(table.subjectType, table.subjectId),
    kindIdx: index("rate_cards_kind_idx").on(table.kind),
  }),
);

export type RateCard = typeof rateCards.$inferSelect;
export type NewRateCard = typeof rateCards.$inferInsert;

// ── Ledger (double-entry) ────────────────────────────────────────────

export const ledgerAccountTypeEnum = pgEnum("ledger_account_type", [
  "asset",
  "liability",
  "revenue",
  "expense",
  "equity",
]);

export const ledgerAccounts = pgTable("ledger_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  type: ledgerAccountTypeEnum("type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LedgerAccount = typeof ledgerAccounts.$inferSelect;
export type NewLedgerAccount = typeof ledgerAccounts.$inferInsert;

export const ledgerTransactionKindEnum = pgEnum("ledger_transaction_kind", [
  "invoice",
  "payout",
  "expense",
  "adjustment",
]);

export const ledgerTransactions = pgTable(
  "ledger_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: ledgerTransactionKindEnum("kind").notNull(),
    // Polymorphic source (invoice/payout/expense id) - plain text+uuid,
    // same convention as activity_events.entityType/entityId.
    referenceType: text("reference_type").notNull(),
    referenceId: uuid("reference_id").notNull(),
    description: text("description").notNull(),
    postedAt: timestamp("posted_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    referenceIdx: index("ledger_transactions_reference_idx").on(
      table.referenceType,
      table.referenceId,
    ),
  }),
);

export type LedgerTransaction = typeof ledgerTransactions.$inferSelect;
export type NewLedgerTransaction = typeof ledgerTransactions.$inferInsert;

export const ledgerDirectionEnum = pgEnum("ledger_direction", ["debit", "credit"]);

export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => ledgerTransactions.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => ledgerAccounts.id),
    direction: ledgerDirectionEnum("direction").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    memo: text("memo"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    transactionIdx: index("ledger_entries_transaction_idx").on(table.transactionId),
    accountIdx: index("ledger_entries_account_idx").on(table.accountId),
  }),
);

export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type NewLedgerEntry = typeof ledgerEntries.$inferInsert;

// ── Invoice line items ───────────────────────────────────────────────

export const invoiceLineItemSourceEnum = pgEnum("invoice_line_item_source", [
  "timesheet",
  "milestone",
  "manual",
]);

export const invoiceLineItems = pgTable(
  "invoice_line_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id").notNull(),
    description: text("description").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unitAmountCents: integer("unit_amount_cents").notNull(),
    amountCents: integer("amount_cents").notNull(),
    sourceType: invoiceLineItemSourceEnum("source_type").notNull().default("manual"),
    // Polymorphic source (timesheet_entries.id or milestones.id) - plain
    // uuid, same convention as elsewhere; null for manual line items.
    sourceId: uuid("source_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    invoiceIdx: index("invoice_line_items_invoice_idx").on(table.invoiceId),
  }),
);

export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type NewInvoiceLineItem = typeof invoiceLineItems.$inferInsert;

// ── Expenses ─────────────────────────────────────────────────────────

export const expenseStatusEnum = pgEnum("expense_status", [
  "pending",
  "approved",
  "rejected",
  "reimbursed",
]);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    category: text("category").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    incurredOn: text("incurred_on").notNull(),
    status: expenseStatusEnum("status").notNull().default("pending"),
    receiptUrl: text("receipt_url"),
    enteredBy: uuid("entered_by")
      .notNull()
      .references(() => users.id),
    approvedBy: uuid("approved_by").references(() => users.id, { onDelete: "set null" }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    ledgerTransactionId: uuid("ledger_transaction_id").references(() => ledgerTransactions.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("expenses_status_idx").on(table.status),
    projectIdx: index("expenses_project_idx").on(table.projectId),
  }),
);

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

// ── Payouts ──────────────────────────────────────────────────────────

export const payoutStatusEnum = pgEnum("payout_status", ["pending", "approved", "paid", "failed"]);

export const payouts = pgTable(
  "payouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engineerId: uuid("engineer_id")
      .notNull()
      .references(() => engineers.id),
    periodStart: text("period_start").notNull(),
    periodEnd: text("period_end").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    status: payoutStatusEnum("status").notNull().default("pending"),
    method: text("method"),
    reference: text("reference"),
    // Provider fields for later Stripe Connect/Wise integration - nullable
    // until then, per ADR-0003.
    stripeTransferId: text("stripe_transfer_id"),
    wiseTransferId: text("wise_transfer_id"),
    approvedBy: uuid("approved_by").references(() => users.id, { onDelete: "set null" }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    ledgerTransactionId: uuid("ledger_transaction_id").references(() => ledgerTransactions.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("payouts_status_idx").on(table.status),
    engineerIdx: index("payouts_engineer_idx").on(table.engineerId),
  }),
);

export type Payout = typeof payouts.$inferSelect;
export type NewPayout = typeof payouts.$inferInsert;

// ── Budgets ──────────────────────────────────────────────────────────

export const budgetScopeTypeEnum = pgEnum("budget_scope_type", ["org", "project", "department"]);

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Polymorphic scope (org/project/department id) - plain uuid, same
    // convention as elsewhere; "department" has no table yet so this must
    // stay loosely coupled regardless.
    scopeType: budgetScopeTypeEnum("scope_type").notNull(),
    scopeId: uuid("scope_id").notNull(),
    // "2026-07" for a month, "2026-Q3" for a quarter, "2026" for a year -
    // plain string, matches the display-date convention used elsewhere
    // (testimonials.date, blog_posts.datePublished) for simplicity.
    period: text("period").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    scopeIdx: index("budgets_scope_idx").on(table.scopeType, table.scopeId),
    periodIdx: index("budgets_period_idx").on(table.period),
  }),
);

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
