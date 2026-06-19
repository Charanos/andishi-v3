import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { engineers } from "@/db/schema/engineers";
import { matches } from "@/db/schema/matches";
import { organizations } from "@/db/schema/organizations";

export const placementStatusEnum = pgEnum("placement_status", [
  "active",
  "paused",
  "completed",
  "terminated",
]);

export const placements = pgTable("placements", {
  id: uuid("id").primaryKey().defaultRandom(),
  matchId: uuid("match_id").notNull().references(() => matches.id),
  engineerId: uuid("engineer_id").notNull().references(() => engineers.id),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  engagementModel: text("engagement_model").notNull(),
  status: placementStatusEnum("status").notNull().default("active"),
  weeklyHours: integer("weekly_hours").notNull().default(40),
  currency: text("currency").notNull().default("USD"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Placement = typeof placements.$inferSelect;
export type NewPlacement = typeof placements.$inferInsert;

