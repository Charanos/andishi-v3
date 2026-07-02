import { and, eq, isNull } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { roles, userRoles } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import {
  ConflictError,
  DomainValidationError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/authz/errors";
import { isLastSuperAdmin } from "@/lib/services/identity/roles";
import type { CallerContext } from "@/lib/services/types";
import type { assignRoleSchema } from "@/lib/validation/identity";

type AssignRoleInput = z.infer<typeof assignRoleSchema>;

function assertStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

export async function listRoleAssignmentsForUser(ctx: CallerContext, userId: string) {
  assertStaff(ctx, "Only Andishi staff can view role assignments.");
  await authorize(ctx.session, "identity.role.read");

  return getDb()
    .select({ assignment: userRoles, role: roles })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));
}

/** The literal "grant a role to another user/admin" capability - identity.role.write, super_admin-only by default. */
export async function assignRoleToUser(ctx: CallerContext, input: AssignRoleInput) {
  assertStaff(ctx, "Only Andishi staff can assign roles.");
  await authorize(ctx.session, "identity.role.write");

  const [role] = await getDb().select().from(roles).where(eq(roles.id, input.roleId)).limit(1);
  if (!role) throw new NotFoundError("Role not found.");

  if (role.scopeType === "team" && !input.scopeTeamId) {
    throw new DomainValidationError(
      "This role is team-scoped - scopeTeamId is required.",
      "scopeTeamId",
    );
  }
  if (role.scopeType !== "team" && input.scopeTeamId) {
    throw new DomainValidationError(
      "Only a team-scoped role can carry a scopeTeamId.",
      "scopeTeamId",
    );
  }

  const [existing] = await getDb()
    .select()
    .from(userRoles)
    .where(
      and(
        eq(userRoles.userId, input.userId),
        eq(userRoles.roleId, input.roleId),
        input.scopeTeamId
          ? eq(userRoles.scopeTeamId, input.scopeTeamId)
          : isNull(userRoles.scopeTeamId),
      ),
    )
    .limit(1);
  if (existing) throw new ConflictError("This user already holds this role.");

  return getDb().transaction(async (tx) => {
    const [assignment] = await tx
      .insert(userRoles)
      .values({ userId: input.userId, roleId: input.roleId, scopeTeamId: input.scopeTeamId })
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "identity.role.write",
        resourceType: "user_role",
        resourceId: assignment.id,
        after: { ...assignment, roleSlug: role.slug },
        requestId: ctx.requestId,
      },
      tx,
    );

    return assignment;
  });
}

/** The literal "revoke a role from another user/admin" capability - guards against removing the last super_admin. */
export async function revokeRoleAssignment(ctx: CallerContext, assignmentId: string) {
  assertStaff(ctx, "Only Andishi staff can revoke role assignments.");
  await authorize(ctx.session, "identity.role.write");

  const [existing] = await getDb()
    .select({ assignment: userRoles, role: roles })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.id, assignmentId))
    .limit(1);
  if (!existing) throw new NotFoundError("Role assignment not found.");

  if (
    existing.role.slug === "super_admin" &&
    (await isLastSuperAdmin(existing.assignment.userId))
  ) {
    throw new ConflictError(
      "Cannot remove the last super_admin - assign another user as super_admin first.",
    );
  }

  await getDb().transaction(async (tx) => {
    await tx.delete(userRoles).where(eq(userRoles.id, assignmentId));

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "identity.role.write",
        resourceType: "user_role",
        resourceId: assignmentId,
        before: { ...existing.assignment, roleSlug: existing.role.slug },
        requestId: ctx.requestId,
      },
      tx,
    );
  });
}
