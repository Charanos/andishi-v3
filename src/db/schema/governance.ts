import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users";

// Manually curated compliance/access-boundary policies (e.g. "client invoice
// and developer payout stay separated by role"), distinct from `audit_log`.
// `audit_log` is the immutable, system-generated trail of every write across
// the platform; a governance control is a mutable policy row an admin owns,
// reviews, and advances through a status lifecycle. Every write below still
// goes through writeAudit() like any other domain mutation, so "who changed
// this control and when" lives in audit_log same as everywhere else - this
// table is the "what the policy currently is," not the trail of edits to it.

export const governanceSurfaceEnum = pgEnum("governance_surface", [
  "commercial",
  "identity",
  "delivery",
  "content",
  "support",
]);

export const governanceStatusEnum = pgEnum("governance_status", [
  "clean",
  "review",
  "exception",
  "scheduled",
]);

export const governanceSeverityEnum = pgEnum("governance_severity", ["low", "medium", "high"]);

export const governanceControls = pgTable("governance_controls", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  scope: text("scope").notNull(),
  surface: governanceSurfaceEnum("surface").notNull(),
  status: governanceStatusEnum("status").notNull().default("review"),
  severity: governanceSeverityEnum("severity").notNull().default("medium"),
  actor: text("actor").notNull(),
  owner: text("owner").notNull(),
  policy: text("policy").notNull(),
  nextAction: text("next_action").notNull(),
  reportCadence: text("report_cadence").notNull(),
  amountProtected: integer("amount_protected").notNull().default(0),
  clientVisible: boolean("client_visible").notNull().default(false),
  developerVisible: boolean("developer_visible").notNull().default(false),
  evidence: jsonb("evidence").$type<string[]>().notNull().default([]),
  imageUrl: text("image_url"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type GovernanceControl = typeof governanceControls.$inferSelect;
export type NewGovernanceControl = typeof governanceControls.$inferInsert;
