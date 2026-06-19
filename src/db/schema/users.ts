import { boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "client", "developer"]);
export const userStatusEnum = pgEnum("user_status", ["active", "invited", "disabled"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").notNull().default("client"),
  status: userStatusEnum("status").notNull().default("invited"),
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  organizationId: uuid("organization_id"),
  engineerId: uuid("engineer_id"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

