import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { engineers } from "@/db/schema/engineers";
import { users } from "@/db/schema/users";

// Master doc §6.4 - Talent/People Ops depth beyond the basic engineer
// profile: a real skills taxonomy (replacing free-text skill arrays),
// a vetting pipeline with a real decision trail, and capacity windows
// for allocation planning.

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(), // e.g. "language", "framework", "cloud", "domain"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;

export const engineerSkills = pgTable(
  "engineer_skills",
  {
    engineerId: uuid("engineer_id")
      .notNull()
      .references(() => engineers.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    level: integer("level").notNull().default(1), // 1-5 proficiency
    years: integer("years").notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.engineerId, table.skillId] }),
    engineerIdx: index("engineer_skills_engineer_idx").on(table.engineerId),
  }),
);

export type EngineerSkill = typeof engineerSkills.$inferSelect;
export type NewEngineerSkill = typeof engineerSkills.$inferInsert;

export const vettingStageEnum = pgEnum("vetting_pipeline_stage", [
  "application_review",
  "technical_screen",
  "system_design",
  "culture_fit",
  "reference_check",
  "final_decision",
]);

export const vettingStageStatusEnum = pgEnum("vetting_stage_status", [
  "pending",
  "passed",
  "failed",
  "skipped",
]);

export const vettingStages = pgTable(
  "vetting_stages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engineerId: uuid("engineer_id")
      .notNull()
      .references(() => engineers.id, { onDelete: "cascade" }),
    stage: vettingStageEnum("stage").notNull(),
    status: vettingStageStatusEnum("status").notNull().default("pending"),
    reviewerUserId: uuid("reviewer_user_id").references(() => users.id, { onDelete: "set null" }),
    notes: text("notes"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    engineerIdx: index("vetting_stages_engineer_idx").on(table.engineerId),
  }),
);

export type VettingStageRow = typeof vettingStages.$inferSelect;
export type NewVettingStageRow = typeof vettingStages.$inferInsert;

export const availabilityWindows = pgTable(
  "availability_windows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engineerId: uuid("engineer_id")
      .notNull()
      .references(() => engineers.id, { onDelete: "cascade" }),
    startDate: text("start_date").notNull(),
    endDate: text("end_date"),
    capacityHoursPerWeek: integer("capacity_hours_per_week").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    engineerIdx: index("availability_windows_engineer_idx").on(table.engineerId),
  }),
);

export type AvailabilityWindow = typeof availabilityWindows.$inferSelect;
export type NewAvailabilityWindow = typeof availabilityWindows.$inferInsert;
