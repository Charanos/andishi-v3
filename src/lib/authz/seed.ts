import { and, eq } from "drizzle-orm";
import type { DB } from "@/db";
import { permissions, rolePermissions, roles, userRoles } from "@/db/schema";
import { PERMISSION_CATALOG, SYSTEM_ROLES } from "@/lib/authz/catalog";

/**
 * Idempotently seeds the permission catalog and system roles from
 * src/lib/authz/catalog.ts. Safe to re-run any time PERMISSION_CATALOG or
 * SYSTEM_ROLES change - each role's permission set is fully replaced to
 * match its current definition, not merged.
 */
export async function seedPermissionCatalog(db: DB) {
  for (const p of PERMISSION_CATALOG) {
    await db
      .insert(permissions)
      .values(p)
      .onConflictDoUpdate({
        target: permissions.key,
        set: {
          module: p.module,
          resource: p.resource,
          action: p.action,
          description: p.description,
        },
      });
  }

  const allPermissions = await db.select().from(permissions);
  const permissionIdByKey = new Map(allPermissions.map((row) => [row.key, row.id]));

  const roleIdBySlug = new Map<string, string>();

  for (const roleDef of SYSTEM_ROLES) {
    const [role] = await db
      .insert(roles)
      .values({
        slug: roleDef.slug,
        name: roleDef.name,
        description: roleDef.description,
        isSystem: true,
        scopeType: roleDef.scopeType,
      })
      .onConflictDoUpdate({
        target: roles.slug,
        set: {
          name: roleDef.name,
          description: roleDef.description,
          scopeType: roleDef.scopeType,
          updatedAt: new Date(),
        },
      })
      .returning();

    roleIdBySlug.set(roleDef.slug, role.id);

    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, role.id));

    const rows = roleDef.permissions
      .map((key) => permissionIdByKey.get(key))
      .filter((id): id is string => Boolean(id))
      .map((permissionId) => ({ roleId: role.id, permissionId }));

    if (rows.length > 0) {
      await db.insert(rolePermissions).values(rows);
    }
  }

  return { roleIdBySlug };
}

/** Idempotently assigns a global-scope system role to a user by slug. */
export async function assignRole(db: DB, userId: string, roleSlug: string) {
  const [role] = await db.select().from(roles).where(eq(roles.slug, roleSlug)).limit(1);
  if (!role) {
    throw new Error(`Unknown role slug: ${roleSlug}. Run seedPermissionCatalog() first.`);
  }

  const [existing] = await db
    .select()
    .from(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, role.id)))
    .limit(1);

  if (existing) return existing;

  const [assignment] = await db.insert(userRoles).values({ userId, roleId: role.id }).returning();
  return assignment;
}
