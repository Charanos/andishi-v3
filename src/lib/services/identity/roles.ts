import { eq, inArray } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { permissions, rolePermissions, roles, userRoles } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type {
  createRoleSchema,
  setRolePermissionsSchema,
  updateRoleSchema,
} from "@/lib/validation/identity";

type CreateRoleInput = z.infer<typeof createRoleSchema>;
type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
type SetRolePermissionsInput = z.infer<typeof setRolePermissionsSchema>;

function assertStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

/**
 * By construction, only super_admin holds any identity.* permission today
 * (see catalog.ts) - there is no code-level "super admin bypass" here,
 * this module is gated exactly like every other one, via authorize().
 * A future super_admin could deliberately delegate identity management by
 * granting identity.* to a custom role; that is a feature, not a gap.
 */

export async function listRoles(ctx: CallerContext) {
  assertStaff(ctx, "Only Andishi staff can view roles.");
  await authorize(ctx.session, "identity.role.read");

  const allRoles = await getDb().select().from(roles).orderBy(roles.name);
  const allGrants = await getDb()
    .select({ roleId: rolePermissions.roleId, key: permissions.key })
    .from(rolePermissions)
    .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId));

  const keysByRole = new Map<string, string[]>();
  for (const grant of allGrants) {
    const list = keysByRole.get(grant.roleId) ?? [];
    list.push(grant.key);
    keysByRole.set(grant.roleId, list);
  }

  return allRoles.map((role) => ({ ...role, permissionKeys: keysByRole.get(role.id) ?? [] }));
}

export async function getRole(ctx: CallerContext, id: string) {
  assertStaff(ctx, "Only Andishi staff can view roles.");
  await authorize(ctx.session, "identity.role.read");

  const [role] = await getDb().select().from(roles).where(eq(roles.id, id)).limit(1);
  if (!role) throw new NotFoundError("Role not found.");

  const grants = await getDb()
    .select({ key: permissions.key })
    .from(rolePermissions)
    .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
    .where(eq(rolePermissions.roleId, id));

  return { ...role, permissionKeys: grants.map((g) => g.key) };
}

async function resolvePermissionIds(keys: string[]): Promise<string[]> {
  if (keys.length === 0) return [];

  const rows = await getDb()
    .select({ id: permissions.id, key: permissions.key })
    .from(permissions)
    .where(inArray(permissions.key, keys));

  const foundKeys = new Set(rows.map((r) => r.key));
  const missing = keys.filter((k) => !foundKeys.has(k));
  if (missing.length > 0) {
    throw new ConflictError(`Unknown permission key(s): ${missing.join(", ")}`);
  }

  return rows.map((r) => r.id);
}

/** Custom roles only - isSystem is always false for API-created roles (system roles come from catalog.ts + seeding). */
export async function createRole(ctx: CallerContext, input: CreateRoleInput) {
  assertStaff(ctx, "Only Andishi staff can create roles.");
  await authorize(ctx.session, "identity.role.write");

  const permissionIds = await resolvePermissionIds(input.permissionKeys);

  return getDb().transaction(async (tx) => {
    const [role] = await tx
      .insert(roles)
      .values({
        slug: input.slug,
        name: input.name,
        description: input.description,
        scopeType: input.scopeType,
        isSystem: false,
      })
      .returning();

    if (permissionIds.length > 0) {
      await tx
        .insert(rolePermissions)
        .values(permissionIds.map((permissionId) => ({ roleId: role.id, permissionId })));
    }

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "identity.role.write",
        resourceType: "role",
        resourceId: role.id,
        after: { ...role, permissionKeys: input.permissionKeys },
        requestId: ctx.requestId,
      },
      tx,
    );

    return role;
  });
}

/**
 * Only name/description/scopeType - never permissions here (see
 * setRolePermissions) and never on a system role. System role identity
 * (slug, permission set) is defined in catalog.ts and fully replaced by
 * seedPermissionCatalog() on every deploy - an API-side edit would just
 * be silently overwritten by the next deploy, which would be confusing,
 * so it's rejected outright instead.
 */
export async function updateRole(ctx: CallerContext, id: string, input: UpdateRoleInput) {
  assertStaff(ctx, "Only Andishi staff can edit roles.");
  await authorize(ctx.session, "identity.role.write");

  const [existing] = await getDb().select().from(roles).where(eq(roles.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Role not found.");
  if (existing.isSystem) {
    throw new ConflictError(
      "System roles are defined in code (src/lib/authz/catalog.ts) and re-seeded on every deploy - create a custom role instead if you need different permissions.",
    );
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(roles)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(roles.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "identity.role.write",
        resourceType: "role",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId: ctx.requestId,
      },
      tx,
    );

    return updated;
  });
}

/** Full replace of a custom role's permission set - this is the "permission escalation" surface. */
export async function setRolePermissions(
  ctx: CallerContext,
  id: string,
  input: SetRolePermissionsInput,
) {
  assertStaff(ctx, "Only Andishi staff can change role permissions.");
  await authorize(ctx.session, "identity.role.write");

  const [role] = await getDb().select().from(roles).where(eq(roles.id, id)).limit(1);
  if (!role) throw new NotFoundError("Role not found.");
  if (role.isSystem) {
    throw new ConflictError(
      "System role permissions are defined in code (src/lib/authz/catalog.ts) - create a custom role instead.",
    );
  }

  const permissionIds = await resolvePermissionIds(input.permissionKeys);

  const before = await getDb()
    .select({ key: permissions.key })
    .from(rolePermissions)
    .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
    .where(eq(rolePermissions.roleId, id));

  return getDb().transaction(async (tx) => {
    await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, id));

    if (permissionIds.length > 0) {
      await tx
        .insert(rolePermissions)
        .values(permissionIds.map((permissionId) => ({ roleId: id, permissionId })));
    }

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "identity.role.write",
        resourceType: "role_permissions",
        resourceId: id,
        before: { permissionKeys: before.map((b) => b.key) },
        after: { permissionKeys: input.permissionKeys },
        requestId: ctx.requestId,
      },
      tx,
    );

    return { roleId: id, permissionKeys: input.permissionKeys };
  });
}

export async function deleteRole(ctx: CallerContext, id: string) {
  assertStaff(ctx, "Only Andishi staff can delete roles.");
  await authorize(ctx.session, "identity.role.write");

  const [existing] = await getDb().select().from(roles).where(eq(roles.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Role not found.");
  if (existing.isSystem) throw new ConflictError("System roles cannot be deleted.");

  const [stillAssigned] = await getDb()
    .select({ id: userRoles.id })
    .from(userRoles)
    .where(eq(userRoles.roleId, id))
    .limit(1);
  if (stillAssigned) {
    throw new ConflictError("Unassign every user from this role before deleting it.");
  }

  await getDb().transaction(async (tx) => {
    await tx.delete(roles).where(eq(roles.id, id));

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "identity.role.write",
        resourceType: "role",
        resourceId: id,
        before: existing,
        requestId: ctx.requestId,
      },
      tx,
    );
  });
}

/**
 * Guards against a total self-lockout: the last super_admin can't have
 * their super_admin assignment revoked, and (used by identity/users.ts)
 * can't have their account disabled either. Not exposed as a route -
 * internal safety check only.
 */
export async function isLastSuperAdmin(userId: string): Promise<boolean> {
  const db = getDb();
  const [superAdminRole] = await db
    .select()
    .from(roles)
    .where(eq(roles.slug, "super_admin"))
    .limit(1);
  if (!superAdminRole) return false;

  const assignees = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(eq(userRoles.roleId, superAdminRole.id));

  const distinctUserIds = new Set(assignees.map((a) => a.userId));
  return distinctUserIds.size === 1 && distinctUserIds.has(userId);
}

export async function listPermissionCatalog(ctx: CallerContext) {
  assertStaff(ctx, "Only Andishi staff can view the permission catalog.");
  await authorize(ctx.session, "identity.role.read");

  return getDb()
    .select()
    .from(permissions)
    .orderBy(permissions.module, permissions.resource, permissions.action);
}
