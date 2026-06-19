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
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  workHistory: jsonb("work_history")
    .$type<WorkHistoryItem[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  stats: jsonb("stats").$type<EngineerStat[]>().notNull().default(sql`'[]'::jsonb`),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
  profileComplete: boolean("profile_complete").notNull().default(false),
  isPublic: boolean("is_public").notNull().default(true),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Engineer = typeof engineers.$inferSelect;
export type NewEngineer = typeof engineers.$inferInsert;

