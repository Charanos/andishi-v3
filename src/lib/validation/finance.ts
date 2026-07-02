import { z } from "zod";

const uuid = z.string().uuid();
const optionalText = z.string().trim().min(1).optional().nullable();
const currency = z.enum(["USD", "EUR", "GBP"]).default("USD");
const cents = z.coerce.number().int().min(0);

// ── Rate cards (ADR-0003) ────────────────────────────────────────────

export const createRateCardSchema = z.object({
  subjectType: z.enum(["engineer", "client", "org"]),
  subjectId: uuid,
  kind: z.enum(["bill", "pay"]),
  amountCents: cents,
  unit: z.enum(["hour", "day", "month", "project"]).default("hour"),
  currency,
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional().nullable(),
});

export const updateRateCardSchema = createRateCardSchema.partial();

// ── Invoices ─────────────────────────────────────────────────────────

export const createInvoiceSchema = z.object({
  organizationId: uuid,
  engineerId: uuid.optional().nullable(),
  projectId: uuid.optional().nullable(),
  invoiceNumber: z.string().trim().min(1),
  periodStart: z.string().trim().min(1),
  periodEnd: z.string().trim().min(1),
  subtotalCents: cents.default(0),
  taxCents: cents.default(0),
  amountCents: cents,
  currency,
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).default("draft"),
  source: z.enum(["timesheet", "milestone", "manual"]).default("manual"),
  pdfUrl: optionalText,
  issuedAt: z.coerce.date().optional().nullable(),
  paidAt: z.coerce.date().optional().nullable(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export const generateInvoiceFromTimesheetsSchema = z.object({
  organizationId: uuid,
  projectId: uuid,
  periodStart: z.string().trim().min(1),
  periodEnd: z.string().trim().min(1),
});

export const generateInvoiceFromMilestoneSchema = z.object({
  milestoneId: uuid,
});

export const sendInvoiceSchema = z.object({
  issuedAt: z.coerce.date().optional(),
});

export const markInvoicePaidSchema = z.object({
  paidAt: z.coerce.date().optional(),
});

// ── Expenses ─────────────────────────────────────────────────────────

export const createExpenseSchema = z.object({
  organizationId: uuid.optional().nullable(),
  projectId: uuid.optional().nullable(),
  category: z.string().trim().min(2),
  amountCents: cents,
  currency,
  incurredOn: z.string().trim().min(1),
  receiptUrl: optionalText,
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const decideExpenseSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
});

// ── Payouts ──────────────────────────────────────────────────────────

export const createPayoutSchema = z.object({
  engineerId: uuid,
  periodStart: z.string().trim().min(1),
  periodEnd: z.string().trim().min(1),
  amountCents: cents,
  currency,
  method: optionalText,
  reference: optionalText,
});

export const approvePayoutSchema = z.object({
  method: optionalText,
  reference: optionalText,
});

export const markPayoutPaidSchema = z.object({
  paidAt: z.coerce.date().optional(),
});

// ── Budgets ──────────────────────────────────────────────────────────

export const createBudgetSchema = z.object({
  scopeType: z.enum(["org", "project", "department"]),
  scopeId: uuid,
  period: z.string().trim().min(1),
  amountCents: cents,
  currency,
});

export const updateBudgetSchema = createBudgetSchema.partial();

// ── Reports ──────────────────────────────────────────────────────────
// Company-wide only for now, not per-project/org - accurate per-project
// cost needs time-allocation logic (payouts aren't tied to one project)
// that doesn't exist yet. Revenue-only project/org drilldowns are a
// reasonable P2.1 follow-up once that's built.

export const financeReportQuerySchema = z.object({
  from: z.string().trim().min(1).optional(),
  to: z.string().trim().min(1).optional(),
});
