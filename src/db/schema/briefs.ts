import { sql } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { organizations } from "@/db/schema/organizations";
import { users } from "@/db/schema/users";

// ── Enums ─────────────────────────────────────────────────────────

export const briefStatusEnum = pgEnum("brief_status", [
  "draft",
  "submitted",
  "under_review",
  "matching",
  "shortlisted",
  "scoping",   // NEW - June 2026: for build briefs entering project scope
  "closed",
]);

// NEW - June 2026: discriminates between a software build and a talent hire brief
export const briefTypeEnum = pgEnum("brief_type", [
  "build", // client wants Andishi to design and deliver software
  "hire",  // client wants to extend their own team with a placed engineer
]);

// ── Table ─────────────────────────────────────────────────────────

export const briefs = pgTable("briefs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  submittedById: uuid("submitted_by_id").notNull().references(() => users.id),

  // ── Shared fields ──────────────────────────────────────────────
  title: text("title").notNull(),
  status: briefStatusEnum("status").notNull().default("submitted"),
  andishiNotes: text("andishi_notes"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),

  // NEW - June 2026: brief type discriminator (default "hire" is safe for existing records)
  briefType: briefTypeEnum("brief_type").notNull().default("hire"),

  // ── Build brief fields (populated when briefType = "build") ────
  serviceType: text("service_type"),
  // One of: "custom-software" | "saas-development" | "ai-systems" |
  //         "mobile-apps" | "enterprise-software" | "blockchain" |
  //         "apis-integrations" | "product-strategy"
  problemStatement: text("problem_statement"),
  projectBudget: text("project_budget"),    // free text: "$5k–$15k", "Open to discuss"
  projectTimeline: text("project_timeline"),  // free text: "8 weeks", "ASAP"
  targetLaunchDate: text("target_launch_date"),
  hasExistingProduct: boolean("has_existing_product").default(false),
  existingProductUrl: text("existing_product_url"),
  buildStackPreferences: jsonb("build_stack_preferences")
    .$type<string[]>()
    .default(sql`'[]'::jsonb`),

  // ── Hire brief fields (populated when briefType = "hire") ──────
  // All nullable - only required when briefType = "hire"
  role: text("role"),
  domain: text("domain"),
  seniority: text("seniority"),  // "mid" | "senior" | "lead" | "architect"
  stackTags: jsonb("stack_tags")
    .$type<string[]>()
    .default(sql`'[]'::jsonb`),
  timeline: text("timeline"),
  engagementModel: text("engagement_model"),  // "project" | "embedded" | "team_extension"
  description: text("description"),
});

export type Brief = typeof briefs.$inferSelect;
export type NewBrief = typeof briefs.$inferInsert;
