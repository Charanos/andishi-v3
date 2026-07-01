import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { briefs } from "@/db/schema/briefs";
import { organizations } from "@/db/schema/organizations";
import { placements } from "@/db/schema/placements";
import { users } from "@/db/schema/users";

// ── Enums ─────────────────────────────────────────────────────────

export const projectStatusEnum = pgEnum("project_status", [
  "scoping",
  "active",
  "review",
  "completed",
  "on_hold",
]);

export const milestoneStatusEnum = pgEnum("milestone_status", [
  "pending",
  "in_progress",
  "submitted",
  "approved",
  "revision",
]);

// NEW - P1: rollup health signal, distinct from status (a project can be
// "active" and still "at_risk"). Set/derived by delivery_pm services.
export const projectHealthEnum = pgEnum("project_health", ["on_track", "at_risk", "off_track"]);

// NEW - P1: determines how delivery.milestone/timesheet data feeds finance's
// invoice generation (fixed = milestone amounts, time_and_materials = billed
// hours, retainer = flat recurring).
export const projectBillingTypeEnum = pgEnum("project_billing_type", [
  "fixed",
  "time_and_materials",
  "retainer",
]);

// ── Interfaces ────────────────────────────────────────────────────

export interface ProjectMilestone {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "submitted" | "approved" | "revision";
  dueDate?: string;
  submittedAt?: string;
  approvedAt?: string;
}

// ── Table ─────────────────────────────────────────────────────────

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  briefId: uuid("brief_id").references(() => briefs.id),
  placementId: uuid("placement_id").references(() => placements.id),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  engineerIds: jsonb("engineer_ids").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: projectStatusEnum("status").notNull().default("scoping"),
  startDate: text("start_date"),
  targetDate: text("target_date"),
  stackTags: jsonb("stack_tags").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  // DEPRECATED - P1 promotes milestones to a real table (see
  // src/db/schema/delivery.ts). Kept for backward compatibility with the
  // existing PATCH /api/projects/[id] passthrough; new milestone workflows
  // (submit/approve/amount) should use the `milestones` table instead.
  milestones: jsonb("milestones").$type<ProjectMilestone[]>().notNull().default(sql`'[]'::jsonb`),

  // ── NEW P1 - delivery/PM rollup fields ──────────────────────────
  code: text("code").unique(), // short reference code, e.g. "PRJ-001"
  health: projectHealthEnum("health").notNull().default("on_track"),
  budgetCents: integer("budget_cents"),
  billingType: projectBillingTypeEnum("billing_type"),
  leadPmUserId: uuid("lead_pm_user_id").references(() => users.id, { onDelete: "set null" }),

  // ── NEW June 2026 - public case study fields ───────────────────
  // Service type maps to /services/[slug] - determines which service this project represents
  serviceType: text("service_type"),
  // "custom-software" | "saas-development" | "ai-systems" | "mobile-apps"
  // "enterprise-software" | "blockchain" | "apis-integrations" | "product-strategy"

  // Industry vertical - drives filter-by-vertical on /work
  vertical: text("vertical"),
  // "fintech" | "healthtech" | "logistics" | "saas" | "ecommerce" |
  // "edtech" | "proptech" | "web3" | "enterprise" | "consumer"

  // Public visibility - only true projects appear on /work via GET /api/work
  isPublic: boolean("is_public").notNull().default(false),
  publicSlug: text("public_slug").unique(), // URL slug for /work/[slug]

  // Case study content
  coverImageUrl: text("cover_image_url"),
  challenge: text("challenge"), // one-paragraph problem statement
  solution: text("solution"), // one-paragraph what was built
  outcome: text("outcome"), // key result value e.g. "6hrs"
  outcomeLabel: text("outcome_label"), // context e.g. "saved per staff member weekly"
  clientQuote: text("client_quote"),
  clientQuoteAttribution: text("client_quote_attribution"),
  clientName: text("client_name"), // display name for the case study card

  // Featured ordering - lower number appears earlier on /work (null = not featured)
  featuredOrder: integer("featured_order"),

  // ── Timestamps ────────────────────────────────────────────────
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
