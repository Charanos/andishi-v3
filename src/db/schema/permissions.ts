import {
  boolean,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users";

// ── Enums ─────────────────────────────────────────────────────────

export const roleScopeTypeEnum = pgEnum("role_scope_type", ["global", "team", "self"]);

export const teamKindEnum = pgEnum("team_kind", [
  "delivery",
  "finance",
  "sales",
  "marketing",
  "talent_ops",
  "support",
  "platform",
]);

// ── Permission catalog ────────────────────────────────────────────
// Seeded from src/lib/authz/catalog.ts. Keys follow "<module>.<resource>.<action>".

export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  module: text("module").notNull(),
  resource: text("resource").notNull(),
  action: text("action").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Roles ─────────────────────────────────────────────────────────
// System roles (isSystem = true) are seeded and non-deletable. Admins may
// also compose custom roles from the permission catalog.

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  isSystem: boolean("is_system").notNull().default(false),
  scopeType: roleScopeTypeEnum("scope_type").notNull().default("global"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  }),
);

// ── Teams ─────────────────────────────────────────────────────────
// Used for team-scoped role assignments (e.g. a finance_manager scoped
// to the "finance" team only). Global-scope roles ignore teams entirely.

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  kind: teamKindEnum("kind").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teamMembers = pgTable(
  "team_members",
  {
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.teamId, table.userId] }),
  }),
);

// ── User role assignments ─────────────────────────────────────────
// scopeTeamId is required when the assigned role has scopeType = "team",
// and must be null for "global" roles. Enforced in the service layer,
// not the DB, to keep the schema simple.

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    scopeTeamId: uuid("scope_team_id").references(() => teams.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("user_roles_user_id_idx").on(table.userId),
  }),
);

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type UserRoleAssignment = typeof userRoles.$inferSelect;
export type NewUserRoleAssignment = typeof userRoles.$inferInsert;
