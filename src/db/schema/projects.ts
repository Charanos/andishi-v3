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

// P1: rollup health signal, distinct from status
export const projectHealthEnum = pgEnum("project_health", ["on_track", "at_risk", "off_track"]);

// P1: determines how delivery.milestone/timesheet data feeds finance's invoice generation
export const projectBillingTypeEnum = pgEnum("project_billing_type", [
  "fixed",
  "time_and_materials",
  "retainer",
]);

// Case study lifecycle - SEPARATE from internal delivery status
export const caseStudyStatusEnum = pgEnum("case_study_status", [
  "draft",
  "published",
  "archived", // soft-delete target; never hard-delete published case studies
]);

// ── Case Study Interfaces ──────────────────────────────────────────

export interface ApproachStep {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  order: number;
}

export interface SolutionHighlight {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  order: number;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  width?: number | null;
  height?: number | null;
  order: number;
}

export interface ResultMetric {
  id: string;
  metric: string; // e.g. "98.3%"
  label: string; // e.g. "payment match rate"
  context?: string | null; // e.g. "measured over 30 days post-launch"
}

export interface CaseStudyTestimonial {
  quote: string;
  authorName: string;
  authorTitle: string;
  authorAvatarUrl?: string | null;
}

export interface TechDetail {
  name: string;
  reason?: string | null; // one-line "why we chose this"
}

// ── Project Milestone Interface ────────────────────────────────────

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
  // DEPRECATED - P1 promotes milestones to a real table (see src/db/schema/delivery.ts).
  // Kept for backward compatibility with existing PATCH /api/projects/[id] passthrough.
  milestones: jsonb("milestones").$type<ProjectMilestone[]>().notNull().default(sql`'[]'::jsonb`),

  // ── P1 - delivery/PM rollup fields ──────────────────────────────
  code: text("code").unique(), // short reference code, e.g. "PRJ-001"
  health: projectHealthEnum("health").notNull().default("on_track"),
  budgetCents: integer("budget_cents"),
  billingType: projectBillingTypeEnum("billing_type"),
  leadPmUserId: uuid("lead_pm_user_id").references(() => users.id, { onDelete: "set null" }),

  // ── June 2026 - public case study core fields ──────────────────
  serviceType: text("service_type"),
  // "custom-software" | "saas-development" | "ai-systems" | "mobile-apps"
  // "enterprise-software" | "blockchain" | "apis-integrations" | "product-strategy"

  vertical: text("vertical"),
  // "fintech" | "healthtech" | "logistics" | "saas" | "ecommerce" |
  // "edtech" | "proptech" | "web3" | "enterprise" | "consumer"

  isPublic: boolean("is_public").notNull().default(false),
  publicSlug: text("public_slug").unique(), // URL slug for /work/[slug]

  // Basic case study content (original fields - preserved)
  coverImageUrl: text("cover_image_url"),
  challenge: text("challenge"), // "The Challenge" section body
  solution: text("solution"), // original one-para solution (kept for backward compat)
  outcome: text("outcome"), // key result value e.g. "98.3%"
  outcomeLabel: text("outcome_label"), // context e.g. "payment match rate"
  clientQuote: text("client_quote"),
  clientQuoteAttribution: text("client_quote_attribution"),
  clientName: text("client_name"), // display name for the case study card

  // Featured ordering - lower number appears earlier on /work (null = not featured)
  featuredOrder: integer("featured_order"),

  // ── RICH CASE STUDY FIELDS (Phase 2 - July 2026) ───────────────

  // Hero enrichment
  tagline: text("tagline"), // one-sentence value prop shown in hero
  summary: text("summary"), // 40-60 word TL;DR / AEO extractable block

  // Quick facts bar
  role: text("role"), // e.g. "Lead Engineer" or "Full-Stack Team"
  teamSize: text("team_size"), // e.g. "3 engineers"
  liveUrl: text("live_url"), // primary CTA target
  repoUrl: text("repo_url"), // secondary CTA target (optional, public repos only)

  // Flagship flag (replaces featuredOrder === 1 check)
  featured: boolean("featured").notNull().default(false),

  // Structured content sections
  approachSteps: jsonb("approach_steps")
    .$type<ApproachStep[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),

  solutionHighlights: jsonb("solution_highlights")
    .$type<SolutionHighlight[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),

  gallery: jsonb("gallery").$type<GalleryImage[]>().notNull().default(sql`'[]'::jsonb`),

  // Results & Impact - at least 1 required to publish
  results: jsonb("results").$type<ResultMetric[]>().notNull().default(sql`'[]'::jsonb`),

  // Testimonial - nullable; never fabricate
  testimonial: jsonb("testimonial").$type<CaseStudyTestimonial | null>(),

  // Tech stack with optional "why we chose this" reasoning
  techStackDetails: jsonb("tech_stack_details")
    .$type<TechDetail[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),

  // ── SEO & Ad Campaign Fields ────────────────────────────────────

  // Per-project SEO overrides (fallback: auto-generated from title/tagline/coverImageUrl)
  seoMetaTitle: text("seo_meta_title"),
  seoMetaDescription: text("seo_meta_description"),
  seoOgImageUrl: text("seo_og_image_url"), // 1200×630 share image, separate from cover

  // Ad campaign hook - ≤125 chars, distinct from seo_meta_description
  adExcerpt: text("ad_excerpt"),

  // Case study lifecycle (soft-delete model)
  caseStudyStatus: caseStudyStatusEnum("case_study_status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),

  // ── Timestamps ─────────────────────────────────────────────────
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
