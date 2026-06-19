import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { briefs } from "@/db/schema/briefs";
import { engineers } from "@/db/schema/engineers";

export const matchStatusEnum = pgEnum("match_status", [
  "proposed",
  "client_reviewing",
  "intro_scheduled",
  "intro_completed",
  "accepted",
  "declined",
]);

export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  briefId: uuid("brief_id").notNull().references(() => briefs.id),
  engineerId: uuid("engineer_id").notNull().references(() => engineers.id),
  status: matchStatusEnum("status").notNull().default("proposed"),
  proposedAt: timestamp("proposed_at", { withTimezone: true }).notNull().defaultNow(),
  introScheduledAt: timestamp("intro_scheduled_at", { withTimezone: true }),
  introCompletedAt: timestamp("intro_completed_at", { withTimezone: true }),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  adminNotes: text("admin_notes"),
  clientNotes: text("client_notes"),
  clientPreferredSlot1: text("client_preferred_slot_1"),
  clientPreferredSlot2: text("client_preferred_slot_2"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;

