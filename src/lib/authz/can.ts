import type { SessionContext } from "@/lib/auth/session";
import type { PermissionKey } from "@/lib/authz/catalog";
import { ForbiddenError } from "@/lib/authz/errors";
import { resolveActorPermissions } from "@/lib/authz/resolve";

export interface AuthorizeOptions {
  /** Required when checking a permission granted only within a team scope. */
  teamId?: string;
}

/**
 * Checks whether the session's user holds `permission`, either globally or
 * within the given team scope. There is no hardcoded "super admin" bypass -
 * `super_admin` is granted every catalog permission at seed time, so this
 * stays fully data-driven and auditable (see src/lib/authz/catalog.ts).
 *
 * Staff-only: client/developer sessions are authorized by resource ownership
 * in the service layer instead, and will simply resolve to an empty
 * permission set here.
 */
export async function can(
  session: SessionContext,
  permission: PermissionKey,
  options: AuthorizeOptions = {},
): Promise<boolean> {
  const grants = await resolveActorPermissions(session.user.id);

  if (grants.global.has(permission)) return true;
  if (options.teamId && grants.teamScoped.get(options.teamId)?.has(permission)) return true;

  return false;
}

/** Throws ForbiddenError if `can()` would return false. */
export async function authorize(
  session: SessionContext,
  permission: PermissionKey,
  options: AuthorizeOptions = {},
): Promise<void> {
  if (!(await can(session, permission, options))) {
    throw new ForbiddenError(`Missing permission: ${permission}`);
  }
}
