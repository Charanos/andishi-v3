import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { tasks } from "@/db/schema/delivery";
import { engineers } from "@/db/schema/engineers";
import { invoices } from "@/db/schema/invoices";
import { projects } from "@/db/schema/projects";

export const timesheetStatusEnum = pgEnum("timesheet_status", [
  "draft",
  "submitted",
  "approved",
  "rejected",
]);

export const timesheetEntries = pgTable(
  "timesheet_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    // NEW - P1: which task the time was logged against.
    taskId: uuid("task_id").references(() => tasks.id, { onDelete: "set null" }),
    engineerId: uuid("engineer_id")
      .notNull()
      .references(() => engineers.id),
    date: text("date").notNull(),
    minutes: integer("minutes").notNull(),
    description: text("description").notNull(),
    billable: boolean("billable").notNull().default(true),
    status: timesheetStatusEnum("status").notNull().default("draft"),
    // NEW - P2: set once this entry has been rolled into an invoice line
    // item, so finance's invoice-generation job never double-bills it.
    invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    projectIdx: index("timesheet_entries_project_id_idx").on(table.projectId),
    engineerIdx: index("timesheet_entries_engineer_id_idx").on(table.engineerId),
    taskIdx: index("timesheet_entries_task_id_idx").on(table.taskId),
    statusIdx: index("timesheet_entries_status_idx").on(table.status),
  }),
);

export type TimesheetEntry = typeof timesheetEntries.$inferSelect;
export type NewTimesheetEntry = typeof timesheetEntries.$inferInsert;
