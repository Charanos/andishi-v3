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
import { users } from "@/db/schema/users";

export const availabilityEnum = pgEnum("availability_status", ["available", "soon", "engaged"]);

// Master doc §6.4 - Talent Ops depth.
export const vettingStatusEnum = pgEnum("engineer_vetting_status", [
  "not_started",
  "in_progress",
  "passed",
  "failed",
]);
export const engagementTypeEnum = pgEnum("engagement_type", [
  "freelance",
  "internal",
  "outsourced",
  "partner",
]);

export interface WorkHistoryItem {
  company: string;
  role: string;
  period: string;
  achievement: string;
}

export interface EngineerStat {
  label: string;
  value: string;
}

export const engineers = pgTable("engineers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  domain: text("domain").notNull(),
  domainLabel: text("domain_label").notNull(),
  avatar: text("avatar").notNull(),
  avatarColor: text("avatar_color").notNull(),
  avatarUrl: text("avatar_url"),
  yearsExp: integer("years_exp").notNull().default(0),
  location: text("location").notNull(),
  timezone: text("timezone").notNull(),
  availability: availabilityEnum("availability").notNull().default("available"),
  availableFrom: text("available_from"),
  bio: text("bio"),
  highlight: text("highlight"),
  skills: jsonb("skills").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  workHistory: jsonb("work_history").$type<WorkHistoryItem[]>().notNull().default(sql`'[]'::jsonb`),
  stats: jsonb("stats").$type<EngineerStat[]>().notNull().default(sql`'[]'::jsonb`),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
  profileComplete: boolean("profile_complete").notNull().default(false),
  isPublic: boolean("is_public").notNull().default(true),
  verified: boolean("verified").notNull().default(false),

  // ── NEW - Talent Ops depth (master doc §6.4) ────────────────────
  // vettingStatus is rolled up from vetting_stages (see talent.ts's
  // vettingStages table) by the vetting service - the stage history is
  // the source of truth, this column is a fast-read summary for list/
  // filter views that shouldn't need a join.
  vettingStatus: vettingStatusEnum("vetting_status").notNull().default("not_started"),
  engagementType: engagementTypeEnum("engagement_type").notNull().default("freelance"),
  // Free text - "referral", "outbound", "inbound-application", etc.
  supplySource: text("supply_source"),
  internal: boolean("internal").notNull().default(false),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Engineer = typeof engineers.$inferSelect;
export type NewEngineer = typeof engineers.$inferInsert;
