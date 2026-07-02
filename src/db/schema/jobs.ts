import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Generic background-job bookkeeping (master doc §"Background jobs"):
// invoice generation, timesheet rollups, SLA sweeps, payout runs, and
// notification digests all record a run here. Triggered by scheduled
// routes (Vercel Cron per ADR-0008), not a queue - this table is the
// only infra needed for liveness/observability at this stage.

export const jobRunStatusEnum = pgEnum("job_run_status", ["running", "succeeded", "failed"]);

export const jobRuns = pgTable("job_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobKey: text("job_key").notNull(),
  status: jobRunStatusEnum("status").notNull().default("running"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  error: text("error"),
  payload: jsonb("payload").$type<Record<string, unknown>>(),
});

export type JobRun = typeof jobRuns.$inferSelect;
export type NewJobRun = typeof jobRuns.$inferInsert;
