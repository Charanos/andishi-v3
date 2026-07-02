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
import { engineers } from "@/db/schema/engineers";
import { organizations } from "@/db/schema/organizations";
import { projects } from "@/db/schema/projects";

// ADR-0004 (CMS). Column names mirror the frontend's existing
// `Testimonial` TS interface (src/data/testimonials.ts) closely -
// authorName/authorRole/content/avatarUrl/rating/date/status - so wiring
// the marquee to this table later is a near-zero-reshape swap.

export const testimonialStatusEnum = pgEnum("testimonial_status", ["active", "archived"]);

export const testimonials = pgTable(
  "testimonials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorName: text("author_name").notNull(),
    authorRole: text("author_role").notNull(),
    content: text("content").notNull(),
    avatarUrl: text("avatar_url").notNull(),
    // Convenience link shown on the card (e.g. "/work/haraka-fleet") -
    // intentionally a plain string, not a strict FK, matching how the
    // rest of the public content (services, case studies) is loosely
    // coupled rather than referentially enforced.
    projectUrl: text("project_url"),
    rating: integer("rating").notNull().default(5),
    // Display date shown on the card - independent of createdAt, so an
    // admin can backdate a testimonial to when it was actually given.
    date: text("date").notNull(),
    status: testimonialStatusEnum("status").notNull().default("active"),
    featured: boolean("featured").notNull().default(false),
    order: integer("order").notNull().default(0),
    // Optional strict references for a future admin "pick from real
    // project/org/engineer" workflow - nullable, not required at creation.
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    engineerId: uuid("engineer_id").references(() => engineers.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("testimonials_status_idx").on(table.status),
    orderIdx: index("testimonials_order_idx").on(table.order),
  }),
);

export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
