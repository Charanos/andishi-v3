import { z } from "zod";

const uuid = z.string().uuid();
const optionalText = z.string().trim().min(1).optional().nullable();

// ── Users (staff-driven access changes - identity.user.write) ────────
// Split from profile self-service (name/avatarUrl, any authenticated
// user on their own record) per the RBAC model: only identity.user.write
// may change what a user CAN DO or WHETHER they can log in at all.

export const updateUserProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  avatarUrl: z.string().trim().url().optional().nullable(),
});

export const updateUserAccessSchema = z.object({
  status: z.enum(["active", "invited", "disabled"]).optional(),
  role: z.enum(["admin", "client", "developer"]).optional(),
  organizationId: uuid.optional().nullable(),
  engineerId: uuid.optional().nullable(),
});

/**
 * Provisions login access for someone not yet in the system (a newly
 * placed developer, a client contact added outside the brief-intake flow,
 * a new staff hire) - or re-sends an activation link if they're still
 * "invited". See lib/services/identity/users.ts's inviteUser.
 */
export const inviteUserSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(2),
  role: z.enum(["admin", "client", "developer"]),
  organizationId: uuid.optional().nullable(),
  engineerId: uuid.optional().nullable(),
});

// ── Roles ─────────────────────────────────────────────────────────────

const permissionKey = z.string().trim().min(1);

export const createRoleSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9_]+$/, "Slug must be lowercase alphanumeric with underscores"),
  name: z.string().trim().min(2),
  description: optionalText,
  scopeType: z.enum(["global", "team", "self"]).default("global"),
  permissionKeys: z.array(permissionKey).default([]),
});

export const updateRoleSchema = z.object({
  name: z.string().trim().min(2).optional(),
  description: optionalText,
});

export const setRolePermissionsSchema = z.object({
  permissionKeys: z.array(permissionKey),
});

// ── User <-> role assignments ─────────────────────────────────────────

export const assignRoleSchema = z.object({
  userId: uuid,
  roleId: uuid,
  scopeTeamId: uuid.optional().nullable(),
});

// ── Teams ─────────────────────────────────────────────────────────────

export const teamKindSchema = z.enum([
  "delivery",
  "finance",
  "sales",
  "marketing",
  "talent_ops",
  "support",
  "platform",
]);

export const createTeamSchema = z.object({
  name: z.string().trim().min(2),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  kind: teamKindSchema,
});

export const updateTeamSchema = z.object({
  name: z.string().trim().min(2).optional(),
  kind: teamKindSchema.optional(),
});

export const addTeamMemberSchema = z.object({
  userId: uuid,
  title: optionalText,
});
