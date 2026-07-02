import { and, eq, gte, isNull, lte } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import {
  engineers,
  invoiceLineItems,
  invoices,
  milestones,
  projects,
  timesheetEntries,
} from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { emitActivityEvent } from "@/lib/services/activity";
import { ACCOUNT_CODES } from "@/lib/services/finance/accounts";
import { getActiveRateCard } from "@/lib/services/finance/rate-cards";
import { postTransaction } from "@/lib/services/finance/ledger";
import type { CallerContext } from "@/lib/services/types";
import type {
  createInvoiceSchema,
  generateInvoiceFromMilestoneSchema,
  generateInvoiceFromTimesheetsSchema,
  updateInvoiceSchema,
} from "@/lib/validation/finance";

type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
type GenerateFromTimesheetsInput = z.infer<typeof generateInvoiceFromTimesheetsSchema>;
type GenerateFromMilestoneInput = z.infer<typeof generateInvoiceFromMilestoneSchema>;

function assertFinanceStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

export async function listInvoices(ctx: CallerContext) {
  const { session } = ctx;

  if (session.user.role === "admin") {
    await authorize(session, "finance.invoice.read");
    return getDb().select().from(invoices).orderBy(invoices.createdAt);
  }

  if (session.user.role === "developer") {
    if (!session.user.engineerId) return [];
    return getDb().select().from(invoices).where(eq(invoices.engineerId, session.user.engineerId));
  }

  if (!session.user.organizationId) return [];
  return getDb()
    .select()
    .from(invoices)
    .where(eq(invoices.organizationId, session.user.organizationId));
}

export async function getInvoice(ctx: CallerContext, id: string) {
  const { session } = ctx;
  const [invoice] = await getDb().select().from(invoices).where(eq(invoices.id, id)).limit(1);
  if (!invoice) throw new NotFoundError("Invoice not found.");

  const allowed =
    session.user.role === "admin" ||
    session.user.organizationId === invoice.organizationId ||
    session.user.engineerId === invoice.engineerId;
  if (!allowed) throw new NotFoundError("Invoice not found.");

  const lineItems = await getDb()
    .select()
    .from(invoiceLineItems)
    .where(eq(invoiceLineItems.invoiceId, id));

  return { invoice, lineItems };
}

async function nextInvoiceNumber() {
  const now = new Date();
  const prefix = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const monthInvoices = await getDb()
    .select({ id: invoices.id })
    .from(invoices)
    .where(and(gte(invoices.createdAt, monthStart), lte(invoices.createdAt, monthEnd)));

  return `${prefix}-${String(monthInvoices.length + 1).padStart(4, "0")}`;
}

export async function createInvoice(ctx: CallerContext, input: CreateInvoiceInput) {
  assertFinanceStaff(ctx, "Only Andishi staff can create invoices.");
  await authorize(ctx.session, "finance.invoice.write");

  return getDb().transaction(async (tx) => {
    const [invoice] = await tx.insert(invoices).values(input).returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.invoice.write",
        resourceType: "invoice",
        resourceId: invoice.id,
        after: invoice,
        requestId: ctx.requestId,
      },
      tx,
    );

    return invoice;
  });
}

export async function updateInvoice(ctx: CallerContext, id: string, input: UpdateInvoiceInput) {
  assertFinanceStaff(ctx, "Only Andishi staff can edit invoices.");
  await authorize(ctx.session, "finance.invoice.write");

  const [existing] = await getDb().select().from(invoices).where(eq(invoices.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Invoice not found.");
  if (existing.status !== "draft") {
    throw new ConflictError("Only a draft invoice can be edited directly.");
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(invoices)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.invoice.write",
        resourceType: "invoice",
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

/**
 * Rolls up approved, not-yet-invoiced, billable timesheet entries for a
 * project into a draft invoice - one line item per engineer, at that
 * engineer's active "bill" rate card. Never double-bills: entries get
 * `invoiceId` set the moment they're rolled up.
 */
export async function generateInvoiceFromTimesheets(
  ctx: CallerContext,
  input: GenerateFromTimesheetsInput,
) {
  assertFinanceStaff(ctx, "Only Andishi staff can generate invoices.");
  await authorize(ctx.session, "finance.invoice.write");
  await authorize(ctx.session, "delivery.timesheet.read");

  const [project] = await getDb()
    .select()
    .from(projects)
    .where(eq(projects.id, input.projectId))
    .limit(1);
  if (!project) throw new NotFoundError("Project not found.");
  if (project.organizationId !== input.organizationId) {
    throw new ConflictError("This project does not belong to the given organization.");
  }

  const entries = await getDb()
    .select()
    .from(timesheetEntries)
    .where(
      and(
        eq(timesheetEntries.projectId, input.projectId),
        eq(timesheetEntries.status, "approved"),
        eq(timesheetEntries.billable, true),
        isNull(timesheetEntries.invoiceId),
        gte(timesheetEntries.date, input.periodStart),
        lte(timesheetEntries.date, input.periodEnd),
      ),
    );

  if (entries.length === 0) {
    throw new ConflictError("No approved, uninvoiced billable time entries in this period.");
  }

  const minutesByEngineer = new Map<string, number>();
  for (const entry of entries) {
    minutesByEngineer.set(
      entry.engineerId,
      (minutesByEngineer.get(entry.engineerId) ?? 0) + entry.minutes,
    );
  }

  const lineItemDrafts: Array<{
    description: string;
    quantity: number;
    unitAmountCents: number;
    amountCents: number;
  }> = [];

  for (const [engineerId, totalMinutes] of minutesByEngineer) {
    const rateCard = await getActiveRateCard("engineer", engineerId, "bill");
    if (!rateCard) {
      const [engineer] = await getDb()
        .select({ name: engineers.name })
        .from(engineers)
        .where(eq(engineers.id, engineerId))
        .limit(1);
      throw new ConflictError(
        `${engineer?.name ?? "This engineer"} has no active bill rate card - set one before generating this invoice.`,
      );
    }

    const hours = totalMinutes / 60;
    const [engineer] = await getDb()
      .select({ name: engineers.name })
      .from(engineers)
      .where(eq(engineers.id, engineerId))
      .limit(1);

    lineItemDrafts.push({
      description: `${engineer?.name ?? "Engineer"} - time & materials (${hours.toFixed(2)}h @ $${(rateCard.amountCents / 100).toFixed(2)}/hr)`,
      quantity: totalMinutes,
      unitAmountCents: rateCard.amountCents,
      amountCents: Math.round(hours * rateCard.amountCents),
    });
  }

  const subtotalCents = lineItemDrafts.reduce((sum, item) => sum + item.amountCents, 0);
  const invoiceNumber = await nextInvoiceNumber();

  return getDb().transaction(async (tx) => {
    const [invoice] = await tx
      .insert(invoices)
      .values({
        organizationId: input.organizationId,
        projectId: input.projectId,
        invoiceNumber,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        subtotalCents,
        taxCents: 0,
        amountCents: subtotalCents,
        currency: "USD",
        status: "draft",
        source: "timesheet",
      })
      .returning();

    for (const item of lineItemDrafts) {
      await tx.insert(invoiceLineItems).values({
        invoiceId: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unitAmountCents: item.unitAmountCents,
        amountCents: item.amountCents,
        sourceType: "timesheet",
      });
    }

    await tx
      .update(timesheetEntries)
      .set({ invoiceId: invoice.id, updatedAt: new Date() })
      .where(
        and(
          eq(timesheetEntries.projectId, input.projectId),
          eq(timesheetEntries.status, "approved"),
          eq(timesheetEntries.billable, true),
          isNull(timesheetEntries.invoiceId),
          gte(timesheetEntries.date, input.periodStart),
          lte(timesheetEntries.date, input.periodEnd),
        ),
      );

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.invoice.write",
        resourceType: "invoice",
        resourceId: invoice.id,
        after: invoice,
        requestId: ctx.requestId,
      },
      tx,
    );

    return invoice;
  });
}

/** Rolls up a single approved fixed-price milestone into a draft invoice. */
export async function generateInvoiceFromMilestone(
  ctx: CallerContext,
  input: GenerateFromMilestoneInput,
) {
  assertFinanceStaff(ctx, "Only Andishi staff can generate invoices.");
  await authorize(ctx.session, "finance.invoice.write");
  await authorize(ctx.session, "delivery.milestone.read");

  const [milestone] = await getDb()
    .select()
    .from(milestones)
    .where(eq(milestones.id, input.milestoneId))
    .limit(1);
  if (!milestone) throw new NotFoundError("Milestone not found.");
  if (milestone.status !== "approved") {
    throw new ConflictError("Only an approved milestone can be invoiced.");
  }
  if (!milestone.amountCents) {
    throw new ConflictError("This milestone has no billing amount set.");
  }
  if (milestone.invoiceId) {
    throw new ConflictError("This milestone has already been invoiced.");
  }

  const milestoneAmountCents = milestone.amountCents;

  const [project] = await getDb()
    .select()
    .from(projects)
    .where(eq(projects.id, milestone.projectId))
    .limit(1);
  if (!project) throw new NotFoundError("Project not found.");

  const invoiceNumber = await nextInvoiceNumber();

  return getDb().transaction(async (tx) => {
    const [invoice] = await tx
      .insert(invoices)
      .values({
        organizationId: project.organizationId,
        projectId: project.id,
        invoiceNumber,
        periodStart: milestone.approvedAt?.toISOString().slice(0, 10) ?? milestone.dueDate ?? "",
        periodEnd: milestone.approvedAt?.toISOString().slice(0, 10) ?? milestone.dueDate ?? "",
        subtotalCents: milestoneAmountCents,
        taxCents: 0,
        amountCents: milestoneAmountCents,
        currency: "USD",
        status: "draft",
        source: "milestone",
      })
      .returning();

    await tx.insert(invoiceLineItems).values({
      invoiceId: invoice.id,
      description: `Milestone: ${milestone.title}`,
      quantity: 1,
      unitAmountCents: milestoneAmountCents,
      amountCents: milestoneAmountCents,
      sourceType: "milestone",
      sourceId: milestone.id,
    });

    await tx
      .update(milestones)
      .set({ invoiceId: invoice.id, updatedAt: new Date() })
      .where(eq(milestones.id, milestone.id));

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.invoice.write",
        resourceType: "invoice",
        resourceId: invoice.id,
        after: invoice,
        requestId: ctx.requestId,
      },
      tx,
    );

    return invoice;
  });
}

/** Sends a draft invoice - posts the ledger transaction that recognizes revenue (accrual basis). */
export async function sendInvoice(ctx: CallerContext, id: string, issuedAt?: Date) {
  assertFinanceStaff(ctx, "Only Andishi staff can send invoices.");
  await authorize(ctx.session, "finance.invoice.approve");

  const [existing] = await getDb().select().from(invoices).where(eq(invoices.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Invoice not found.");
  if (existing.status !== "draft") throw new ConflictError("Only a draft invoice can be sent.");

  return getDb().transaction(async (tx) => {
    const transaction = await postTransaction(
      {
        kind: "invoice",
        referenceType: "invoice",
        referenceId: existing.id,
        description: `Invoice ${existing.invoiceNumber} sent`,
        currency: existing.currency,
        entries: [
          {
            accountCode: ACCOUNT_CODES.ACCOUNTS_RECEIVABLE,
            direction: "debit",
            amountCents: existing.amountCents,
          },
          {
            accountCode: ACCOUNT_CODES.SERVICE_REVENUE,
            direction: "credit",
            amountCents: existing.amountCents,
          },
        ],
      },
      tx,
    );

    const [updated] = await tx
      .update(invoices)
      .set({
        status: "sent",
        issuedAt: issuedAt ?? new Date(),
        ledgerTransactionId: transaction.id,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning();

    await emitActivityEvent(
      {
        type: "invoice_sent",
        actorId: ctx.session.user.id,
        actorRole: ctx.session.user.role,
        organizationId: updated.organizationId,
        entityType: "invoice",
        entityId: updated.id,
        description: `Invoice ${updated.invoiceNumber} sent for $${(updated.amountCents / 100).toFixed(2)}`,
        visibleTo: ["client", "finance.invoice.read"],
      },
      tx,
    );

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.invoice.approve",
        resourceType: "invoice",
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

/** Marks a sent/overdue invoice paid - posts the ledger transaction that clears AR into cash. */
export async function markInvoicePaid(ctx: CallerContext, id: string, paidAt?: Date) {
  assertFinanceStaff(ctx, "Only Andishi staff can record payment.");
  await authorize(ctx.session, "finance.invoice.approve");

  const [existing] = await getDb().select().from(invoices).where(eq(invoices.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Invoice not found.");
  if (!["sent", "overdue"].includes(existing.status)) {
    throw new ConflictError("Only a sent or overdue invoice can be marked paid.");
  }

  return getDb().transaction(async (tx) => {
    await postTransaction(
      {
        kind: "invoice",
        referenceType: "invoice",
        referenceId: existing.id,
        description: `Invoice ${existing.invoiceNumber} paid`,
        currency: existing.currency,
        entries: [
          {
            accountCode: ACCOUNT_CODES.CASH,
            direction: "debit",
            amountCents: existing.amountCents,
          },
          {
            accountCode: ACCOUNT_CODES.ACCOUNTS_RECEIVABLE,
            direction: "credit",
            amountCents: existing.amountCents,
          },
        ],
      },
      tx,
    );

    const [updated] = await tx
      .update(invoices)
      .set({ status: "paid", paidAt: paidAt ?? new Date(), updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();

    await emitActivityEvent(
      {
        type: "invoice_paid",
        actorId: ctx.session.user.id,
        actorRole: ctx.session.user.role,
        organizationId: updated.organizationId,
        entityType: "invoice",
        entityId: updated.id,
        description: `Invoice ${updated.invoiceNumber} paid ($${(updated.amountCents / 100).toFixed(2)})`,
        visibleTo: ["client", "finance.invoice.read"],
      },
      tx,
    );

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.invoice.approve",
        resourceType: "invoice",
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

export async function cancelInvoice(ctx: CallerContext, id: string) {
  assertFinanceStaff(ctx, "Only Andishi staff can cancel invoices.");
  await authorize(ctx.session, "finance.invoice.approve");

  const [existing] = await getDb().select().from(invoices).where(eq(invoices.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Invoice not found.");
  if (existing.status !== "draft") {
    throw new ConflictError("Only a draft invoice can be cancelled directly.");
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(invoices)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();

    await tx
      .update(timesheetEntries)
      .set({ invoiceId: null, updatedAt: new Date() })
      .where(eq(timesheetEntries.invoiceId, id));
    await tx
      .update(milestones)
      .set({ invoiceId: null, updatedAt: new Date() })
      .where(eq(milestones.invoiceId, id));

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "finance.invoice.approve",
        resourceType: "invoice",
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
