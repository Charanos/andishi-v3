import {
  type AnyPgColumn,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { engineers } from "@/db/schema/engineers";
import { milestoneStatusEnum, projects } from "@/db/schema/projects";
import { users } from "@/db/schema/users";

// ── Enums ─────────────────────────────────────────────────────────

export const sprintStatusEnum = pgEnum("sprint_status", [
  "planned",
  "active",
  "completed",
  "cancelled",
]);
export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "in_review",
  "done",
  "blocked",
]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "urgent"]);

// ── Milestones ────────────────────────────────────────────────────
// Promotes the JSONB blob on `projects` to a real table so submission,
// approval, and fixed-price billing amounts have their own lifecycle and
// audit trail. See delivery.milestone.* permissions and ADR-0007.

export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: milestoneStatusEnum("status").notNull().default("pending"),
    dueDate: text("due_date"),
    // Set only for fixed-price billing_type projects - finance reads this
    // to generate an invoice line item when the milestone is approved.
    amountCents: integer("amount_cents"),
    // NEW - P2: set once this milestone has been rolled into an invoice
    // line item, so finance's invoice-generation job never double-bills
    // it. Plain uuid (not FK) - same convention as invoices.ledgerTransactionId.
    invoiceId: uuid("invoice_id"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    projectIdx: index("milestones_project_id_idx").on(table.projectId),
  }),
);

// ── Sprints ─────────────────────────────────────────────────────────

export const sprints = pgTable(
  "sprints",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    goal: text("goal"),
    startDate: text("start_date"),
    endDate: text("end_date"),
    status: sprintStatusEnum("status").notNull().default("planned"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    projectIdx: index("sprints_project_id_idx").on(table.projectId),
  }),
);

// ── Tasks ─────────────────────────────────────────────────────────

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    milestoneId: uuid("milestone_id").references(() => milestones.id, { onDelete: "set null" }),
    sprintId: uuid("sprint_id").references(() => sprints.id, { onDelete: "set null" }),
    // Self-reference for subtasks - AnyPgColumn return type avoids a TS
    // circular-inference error on the table's own const.
    parentTaskId: uuid("parent_task_id").references((): AnyPgColumn => tasks.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatusEnum("status").notNull().default("todo"),
    priority: taskPriorityEnum("priority").notNull().default("medium"),
    assigneeEngineerId: uuid("assignee_engineer_id").references(() => engineers.id, {
      onDelete: "set null",
    }),
    reporterUserId: uuid("reporter_user_id")
      .notNull()
      .references(() => users.id),
    estimateMinutes: integer("estimate_minutes"),
    dueDate: text("due_date"),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    projectIdx: index("tasks_project_id_idx").on(table.projectId),
    milestoneIdx: index("tasks_milestone_id_idx").on(table.milestoneId),
    sprintIdx: index("tasks_sprint_id_idx").on(table.sprintId),
    assigneeIdx: index("tasks_assignee_engineer_id_idx").on(table.assigneeEngineerId),
    statusIdx: index("tasks_status_idx").on(table.status),
  }),
);

// ── Task dependencies ───────────────────────────────────────────────

export const taskDependencies = pgTable(
  "task_dependencies",
  {
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    dependsOnTaskId: uuid("depends_on_task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.taskId, table.dependsOnTaskId] }),
  }),
);

// ── Allocations (capacity planning) ─────────────────────────────────

export const allocations = pgTable(
  "allocations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engineerId: uuid("engineer_id")
      .notNull()
      .references(() => engineers.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    weekStart: text("week_start").notNull(),
    plannedMinutes: integer("planned_minutes").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    engineerIdx: index("allocations_engineer_id_idx").on(table.engineerId),
    projectIdx: index("allocations_project_id_idx").on(table.projectId),
  }),
);

export type Milestone = typeof milestones.$inferSelect;
export type NewMilestone = typeof milestones.$inferInsert;
export type Sprint = typeof sprints.$inferSelect;
export type NewSprint = typeof sprints.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type TaskDependency = typeof taskDependencies.$inferSelect;
export type NewTaskDependency = typeof taskDependencies.$inferInsert;
export type Allocation = typeof allocations.$inferSelect;
export type NewAllocation = typeof allocations.$inferInsert;
