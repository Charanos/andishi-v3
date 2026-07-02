import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { engineers } from "@/db/schema/engineers";
import { organizations } from "@/db/schema/organizations";
import { projects } from "@/db/schema/projects";

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
]);

export const invoiceSourceEnum = pgEnum("invoice_source", ["timesheet", "milestone", "manual"]);

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  engineerId: uuid("engineer_id").references(() => engineers.id),
  projectId: uuid("project_id").references(() => projects.id),
  invoiceNumber: text("invoice_number").notNull().unique(),
  periodStart: text("period_start").notNull(),
  periodEnd: text("period_end").notNull(),
  // ADR-0003: amountCents stays the authoritative total (subtotal + tax);
  // invoice_line_items back it out in detail once generated.
  subtotalCents: integer("subtotal_cents").notNull().default(0),
  taxCents: integer("tax_cents").notNull().default(0),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  source: invoiceSourceEnum("source").notNull().default("manual"),
  // Points at ledger_transactions.id once posted - plain uuid (not FK) to
  // avoid a circular module import between invoices.ts and finance.ts;
  // enforced at the service layer instead, same convention as the other
  // polymorphic refs in finance.ts (rate_cards.subjectId, etc.).
  ledgerTransactionId: uuid("ledger_transaction_id"),
  pdfUrl: text("pdf_url"),
  issuedAt: timestamp("issued_at", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
