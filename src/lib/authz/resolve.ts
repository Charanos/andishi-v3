import { cache } from "react";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { permissions, rolePermissions, roles, userRoles } from "@/db/schema";
import type { PermissionKey } from "@/lib/authz/catalog";

export interface ActorPermissions {
  userId: string;
  /** Permissions granted unconditionally, from global-scope role assignments. */
  global: Set<PermissionKey>;
  /** Permissions granted only within a specific team, from team-scope role assignments. */
  teamScoped: Map<string, Set<PermissionKey>>;
}

/**
 * Resolves the full set of permissions a staff user holds, merged across all
 * of their role assignments. Memoized per request via React `cache()` - the
 * same pattern already used by `getSession()` in lib/auth/session.ts, which
 * this codebase already relies on working inside Route Handlers, not just
 * Server Components.
 *
 * This resolver is for staff (admin-persona) authorization only. Client and
 * developer users are authorized by resource ownership (organizationId /
 * engineerId equality), enforced directly in services - they are not
 * expected to hold rows in user_roles.
 */
export const resolveActorPermissions = cache(async function resolveActorPermissions(
  userId: string,
): Promise<ActorPermissions> {
  const rows = await getDb()
    .select({
      permissionKey: permissions.key,
      roleScopeType: roles.scopeType,
      scopeTeamId: userRoles.scopeTeamId,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
    .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
    .where(eq(userRoles.userId, userId));

  const global = new Set<PermissionKey>();
  const teamScoped = new Map<string, Set<PermissionKey>>();

  for (const row of rows) {
    const key = row.permissionKey as PermissionKey;

    if (row.roleScopeType === "team" && row.scopeTeamId) {
      const existing = teamScoped.get(row.scopeTeamId) ?? new Set<PermissionKey>();
      existing.add(key);
      teamScoped.set(row.scopeTeamId, existing);
      continue;
    }

    global.add(key);
  }

  return { userId, global, teamScoped };
});
