import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users";

// Part 6.9: non-secret operational config + integration on/off status +
// feature flags. Secrets stay in env vars (Part 10) - this table is for
// values an admin should be able to change without a redeploy.
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;

/**
 * Part 7's Idempotency-Key convention. Stores the actual response
 * (status + body) rather than the master doc's literal `response_hash`
 * column - a hash alone can't replay a response on retry, which is the
 * entire point of idempotency (the client resubmitting a POST after a
 * dropped response should get the original result back, not a second
 * invoice). See src/lib/api/idempotency.ts for the read/write path.
 */
export const idempotencyKeys = pgTable("idempotency_keys", {
  key: text("key").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  route: text("route").notNull(),
  responseStatus: integer("response_status").notNull(),
  responseBody: jsonb("response_body").$type<unknown>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type IdempotencyKeyRow = typeof idempotencyKeys.$inferSelect;
export type NewIdempotencyKeyRow = typeof idempotencyKeys.$inferInsert;
