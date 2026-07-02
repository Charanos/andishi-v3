import { and, eq, gte, isNull, lte } from "drizzle-orm";
import { getDb } from "@/db";
import { jobRuns, milestones, projects, timesheetEntries, users } from "@/db/schema";
import type { SessionContext } from "@/lib/auth/session";
import {
  generateInvoiceFromMilestone,
  generateInvoiceFromTimesheets,
} from "@/lib/services/finance/invoices";

export const INVOICE_GENERATION_JOB_KEY = "finance.generate_invoices";

interface GenerateInvoicesJobResult {
  timesheetInvoicesCreated: number;
  milestoneInvoicesCreated: number;
  skipped: Array<{ reason: string; projectId?: string; milestoneId?: string }>;
}

/**
 * Rolls up the prior period's approved time and any approved,
 * not-yet-invoiced milestones into draft invoices (ADR-0003 action item
 * #3). Runs as the seeded admin "service account" since this fires from a
 * cron route, not an interactive session - see getSystemActorSession().
 * Per-project/per-milestone failures are recorded in the result payload
 * and skipped, not fatal to the run: one engineer missing a rate card
 * shouldn't block billing every other project this period.
 */
export async function runInvoiceGenerationJob(period?: {
  periodStart: string;
  periodEnd: string;
}): Promise<GenerateInvoicesJobResult> {
  const db = getDb();
  const { periodStart, periodEnd } = period ?? previousMonthRange();

  const [jobRun] = await db
    .insert(jobRuns)
    .values({
      jobKey: INVOICE_GENERATION_JOB_KEY,
      status: "running",
      payload: { periodStart, periodEnd },
    })
    .returning();

  const result: GenerateInvoicesJobResult = {
    timesheetInvoicesCreated: 0,
    milestoneInvoicesCreated: 0,
    skipped: [],
  };

  try {
    const session = await getSystemActorSession();
    const ctx = { session, requestId: `job:${jobRun.id}` };

    const billableEntries = await db
      .select({ projectId: timesheetEntries.projectId })
      .from(timesheetEntries)
      .where(
        and(
          eq(timesheetEntries.status, "approved"),
          eq(timesheetEntries.billable, true),
          isNull(timesheetEntries.invoiceId),
          gte(timesheetEntries.date, periodStart),
          lte(timesheetEntries.date, periodEnd),
        ),
      );
    const candidateProjectIds = [...new Set(billableEntries.map((entry) => entry.projectId))];

    for (const projectId of candidateProjectIds) {
      const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
      if (!project) {
        result.skipped.push({ reason: "Project not found.", projectId });
        continue;
      }

      try {
        await generateInvoiceFromTimesheets(ctx, {
          organizationId: project.organizationId,
          projectId: project.id,
          periodStart,
          periodEnd,
        });
        result.timesheetInvoicesCreated += 1;
      } catch (error) {
        result.skipped.push({
          reason: error instanceof Error ? error.message : "Unknown error",
          projectId,
        });
      }
    }

    const approvedMilestones = await db
      .select({
        id: milestones.id,
        amountCents: milestones.amountCents,
        invoiceId: milestones.invoiceId,
      })
      .from(milestones)
      .where(eq(milestones.status, "approved"));

    for (const milestone of approvedMilestones) {
      if (!milestone.amountCents || milestone.invoiceId) continue;

      try {
        await generateInvoiceFromMilestone(ctx, { milestoneId: milestone.id });
        result.milestoneInvoicesCreated += 1;
      } catch (error) {
        result.skipped.push({
          reason: error instanceof Error ? error.message : "Unknown error",
          milestoneId: milestone.id,
        });
      }
    }

    await db
      .update(jobRuns)
      .set({
        status: "succeeded",
        finishedAt: new Date(),
        payload: { periodStart, periodEnd, ...result },
      })
      .where(eq(jobRuns.id, jobRun.id));

    return result;
  } catch (error) {
    await db
      .update(jobRuns)
      .set({
        status: "failed",
        finishedAt: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(jobRuns.id, jobRun.id));
    throw error;
  }
}

function previousMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  const toDateString = (d: Date) => d.toISOString().slice(0, 10);
  return { periodStart: toDateString(start), periodEnd: toDateString(end) };
}

/**
 * Background jobs have no interactive session, so they act as the seeded
 * admin ("service account" pattern) to satisfy the service layer's
 * staff-role + permission checks. Only `session.user.id`/`role` are ever
 * read by authorize()/can() - the other SessionContext fields are unused
 * placeholders here, never persisted or compared.
 */
async function getSystemActorSession(): Promise<SessionContext> {
  const email = process.env.ADMIN_SEED_EMAIL ?? "dennis@andishi.dev";
  const [admin] = await getDb().select().from(users).where(eq(users.email, email)).limit(1);

  if (!admin) {
    throw new Error(`System actor "${email}" not found - run scripts/seed-admin.ts first.`);
  }

  return {
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      status: admin.status,
      organizationId: admin.organizationId ?? undefined,
      engineerId: admin.engineerId ?? undefined,
      createdAt: admin.createdAt.toISOString(),
    },
    token: "system",
    sessionId: "system",
    expiresAt: new Date(Date.now() + 60_000),
  };
}
