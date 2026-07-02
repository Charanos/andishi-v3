import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users";

// ADR-0004 (CMS) remainder - master doc §6.6. Completes the consolidation
// of src/content/landing.ts + src/data/services.ts (services_content),
// src/data/skills.ts (skill_domains), and the per-page FAQ arrays scattered
// across landing/services/hire/careers (faqs), plus a generic version-
// history table (content_revisions) shared by every CMS-managed table.
//
// content_authors (master doc §6.6) is intentionally not built: blog_posts
// already ships with flattened authorName/authorRole/authorAvatarUrl/
// authorUserId columns rather than a join, and introducing a separate
// authors table now would force a migration of already-live data for no
// concrete benefit.

export const serviceGlowEnum = pgEnum("service_glow", ["violet", "cyan", "amber"]);
export const serviceGroupEnum = pgEnum("service_group", ["product-delivery", "specialist-builds"]);

export interface ServiceEngagementOption {
  label: string;
  description: string;
}

export interface ServiceFaqItem {
  question: string;
  answer: string;
}

export const servicesContent = pgTable(
  "services_content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Plain text, validated by the shared serviceTypeEnum at the zod layer -
    // same convention as briefs.serviceType/projects.serviceType.
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    icon: text("icon").notNull(),
    timeline: text("timeline").notNull(),
    glow: serviceGlowEnum("glow").notNull(),
    group: serviceGroupEnum("group").notNull(),
    tagline: text("tagline").notNull(),
    imageUrl: text("image_url"),
    scope: text("scope").notNull(),
    engagementOptions: jsonb("engagement_options")
      .$type<ServiceEngagementOption[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    faq: jsonb("faq").$type<ServiceFaqItem[]>().notNull().default(sql`'[]'::jsonb`),
    stackHighlights: jsonb("stack_highlights")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    order: integer("order").notNull().default(0),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    publishedIdx: index("services_content_published_idx").on(table.published),
    orderIdx: index("services_content_order_idx").on(table.order),
  }),
);

export type ServiceContent = typeof servicesContent.$inferSelect;
export type NewServiceContent = typeof servicesContent.$inferInsert;

export interface SkillDomainFaqItem {
  q: string;
  a: string;
}

export const skillDomains = pgTable(
  "skill_domains",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    label: text("label").notNull(),
    // Not in the master doc's abbreviated column list but present on every
    // rendered domain page (src/data/skills.ts's SkillDomainData) - added
    // for a genuine near-zero-reshape swap, same reasoning as the frontend-
    // mirroring precedent set by testimonials/blog.
    eyebrow: text("eyebrow").notNull(),
    h1: text("h1").notNull(),
    subheadline: text("subheadline").notNull(),
    technologies: jsonb("technologies").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    useCases: jsonb("use_cases").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    differentiators: jsonb("differentiators").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    faq: jsonb("faq").$type<SkillDomainFaqItem[]>().notNull().default(sql`'[]'::jsonb`),
    order: integer("order").notNull().default(0),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    publishedIdx: index("skill_domains_published_idx").on(table.published),
  }),
);

export type SkillDomainRow = typeof skillDomains.$inferSelect;
export type NewSkillDomainRow = typeof skillDomains.$inferInsert;

export const faqSectionEnum = pgEnum("faq_section", [
  "landing",
  "services",
  "hire",
  "careers",
  "general",
]);

export const faqs = pgTable(
  "faqs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    section: faqSectionEnum("section").notNull(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    order: integer("order").notNull().default(0),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sectionIdx: index("faqs_section_idx").on(table.section),
  }),
);

export type FaqRow = typeof faqs.$inferSelect;
export type NewFaqRow = typeof faqs.$inferInsert;

// Generic version history shared by every CMS-managed content type. One row
// is appended on every create/update with the resulting (post-write) row
// snapshot - so "history" for a piece of content is: its current live row,
// plus every revision here ordered by createdAt.
export const contentTypeEnum = pgEnum("cms_content_type", [
  "services_content",
  "skill_domain",
  "faq",
  "blog_post",
  "testimonial",
]);

export const contentRevisions = pgTable(
  "content_revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentType: contentTypeEnum("content_type").notNull(),
    // No FK - contentId points into whichever table contentType names, and
    // a single column can't carry a heterogeneous FK across tables.
    contentId: uuid("content_id").notNull(),
    snapshot: jsonb("snapshot").notNull(),
    editorUserId: uuid("editor_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    contentIdx: index("content_revisions_content_idx").on(table.contentType, table.contentId),
  }),
);

export type ContentRevision = typeof contentRevisions.$inferSelect;
export type NewContentRevision = typeof contentRevisions.$inferInsert;
