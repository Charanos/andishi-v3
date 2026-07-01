import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users";

// Immutable, append-only actor/delta trail. Distinct from `activity_events`,
// which is a user-facing feed. Written by every authorized write/delete/approve
// via lib/authz/audit.ts - never edited or deleted after insert.

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    actorIp: text("actor_ip"),
    action: text("action").notNull(), // permission key exercised, e.g. "delivery.task.write"
    resourceType: text("resource_type").notNull(),
    resourceId: uuid("resource_id"),
    before: jsonb("before").$type<Record<string, unknown> | null>(),
    after: jsonb("after").$type<Record<string, unknown> | null>(),
    requestId: text("request_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    resourceIdx: index("audit_log_resource_idx").on(table.resourceType, table.resourceId),
    actorIdx: index("audit_log_actor_idx").on(table.actorUserId),
    createdAtIdx: index("audit_log_created_at_idx").on(table.createdAt),
  }),
);

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
