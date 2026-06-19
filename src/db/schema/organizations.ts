import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  website: text("website"),
  industry: text("industry"),
  stage: text("stage"),      // "seed" | "series_a" | "series_b" | "enterprise" | "sme"
  logoUrl: text("logo_url"),
  billingEmail: text("billing_email"),

  // NEW - June 2026: global client tracking for the software studio pivot
  region: text("region"),  // "east_africa" | "north_america" | "europe" | "gcc" | "global"
  country: text("country"), // ISO 3166-1 alpha-2 e.g. "KE", "US", "GB"

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
