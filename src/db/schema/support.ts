import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { organizations } from "@/db/schema/organizations";
import { projects } from "@/db/schema/projects";
import { users } from "@/db/schema/users";

// Master doc §6.8 - Support & Notifications. Backs the floating support
// chat and the admin/dev/client support dashboards (which currently read
// from a richer client-side mock - src/components/dashboard/admin/
// admin-support-page.tsx's SupportCase type - reconciled into this table).

export const supportCaseStatusEnum = pgEnum("support_case_status", [
  "open",
  "waiting",
  "escalated",
  "resolved",
]);

export const supportCasePriorityEnum = pgEnum("support_case_priority", ["low", "normal", "urgent"]);

export const supportCaseSourceEnum = pgEnum("support_case_source", [
  "client",
  "developer",
  "internal",
]);

export const supportCaseTopicEnum = pgEnum("support_case_topic", [
  "billing",
  "matching",
  "project",
  "profile",
  "payout",
  "other",
]);

export const supportCases = pgTable(
  "support_cases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subject: text("subject").notNull(),
    status: supportCaseStatusEnum("status").notNull().default("open"),
    priority: supportCasePriorityEnum("priority").notNull().default("normal"),
    source: supportCaseSourceEnum("source").notNull(),
    topic: supportCaseTopicEnum("topic").notNull().default("other"),
    requesterUserId: uuid("requester_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    assigneeUserId: uuid("assignee_user_id").references(() => users.id, { onDelete: "set null" }),
    slaMinutes: integer("sla_minutes"),
    nextAction: text("next_action"),
    resolutionNote: text("resolution_note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("support_cases_status_idx").on(table.status),
    requesterIdx: index("support_cases_requester_idx").on(table.requesterUserId),
    assigneeIdx: index("support_cases_assignee_idx").on(table.assigneeUserId),
  }),
);

export type SupportCase = typeof supportCases.$inferSelect;
export type NewSupportCase = typeof supportCases.$inferInsert;

export const supportMessages = pgTable(
  "support_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => supportCases.id, { onDelete: "cascade" }),
    authorUserId: uuid("author_user_id").references(() => users.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    attachments: jsonb("attachments").$type<string[]>(),
    // Internal notes (staff-only, not shown to the client/developer) vs.
    // client-visible replies - same field the master doc calls for.
    internal: boolean("internal").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    caseIdx: index("support_messages_case_idx").on(table.caseId),
  }),
);

export type SupportMessage = typeof supportMessages.$inferSelect;
export type NewSupportMessage = typeof supportMessages.$inferInsert;

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Free text (e.g. "support_case_reply", "invoice_paid") - same
    // extensibility convention as activity_events.type, since new
    // notification-triggering events get added per-module over time.
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    entityType: text("entity_type"),
    entityId: uuid("entity_id"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("notifications_user_idx").on(table.userId),
    userUnreadIdx: index("notifications_user_read_idx").on(table.userId, table.readAt),
  }),
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export const notificationChannelEnum = pgEnum("notification_channel", ["email", "in_app", "sms"]);

export const notificationPrefs = pgTable(
  "notification_prefs",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    channel: notificationChannelEnum("channel").notNull(),
    // Free text - same event-type namespace as notifications.type.
    eventType: text("event_type").notNull(),
    enabled: boolean("enabled").notNull().default(true),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.channel, table.eventType] }),
  }),
);

export type NotificationPref = typeof notificationPrefs.$inferSelect;
export type NewNotificationPref = typeof notificationPrefs.$inferInsert;
