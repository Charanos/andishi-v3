import { eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { isLastSuperAdmin } from "@/lib/services/identity/roles";
import type { CallerContext } from "@/lib/services/types";
import type { updateUserAccessSchema, updateUserProfileSchema } from "@/lib/validation/identity";

type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
type UpdateUserAccessInput = z.infer<typeof updateUserAccessSchema>;

function omitPasswordHash<T extends { passwordHash: unknown }>(user: T) {
  const safeUser = { ...user };
  delete safeUser.passwordHash;
  return safeUser;
}

export async function listUsers(ctx: CallerContext) {
  if (ctx.session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can list users.");
  }
  await authorize(ctx.session, "identity.user.read");

  const rows = await getDb().select().from(users).orderBy(users.createdAt);
  return rows.map(omitPasswordHash);
}

/** Any authenticated user may read their own record; staff need identity.user.read for anyone else's. */
export async function getUser(ctx: CallerContext, id: string) {
  const { session } = ctx;
  if (session.user.id !== id) {
    if (session.user.role !== "admin")
      throw new ForbiddenError("You can only view your own account.");
    await authorize(session, "identity.user.read");
  }

  const [user] = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) throw new NotFoundError("User not found.");

  return omitPasswordHash(user);
}

/** Self-service profile fields (name/avatar) - any authenticated user, on their own record only. */
export async function updateUserProfile(
  ctx: CallerContext,
  id: string,
  input: UpdateUserProfileInput,
) {
  const { session, requestId, actorIp } = ctx;
  if (session.user.id !== id) {
    throw new ForbiddenError("You can only update your own profile.");
  }

  const [existing] = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  if (!existing) throw new NotFoundError("User not found.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(users)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "identity.user.write.self_service",
        resourceType: "user",
        resourceId: id,
        before: omitPasswordHash(existing),
        after: omitPasswordHash(updated),
        requestId,
      },
      tx,
    );

    return omitPasswordHash(updated);
  });
}

/**
 * Staff-only: role/status/organizationId/engineerId. This is the exact
 * surface that was previously gated by a bare `role === "admin"` check
 * (any staff persona, not just identity-privileged ones) - fixed to
 * require identity.user.write, which only super_admin holds by default.
 * Also guards against disabling the last active super_admin account.
 */
export async function updateUserAccess(
  ctx: CallerContext,
  id: string,
  input: UpdateUserAccessInput,
) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can change a user's access.");
  }
  await authorize(session, "identity.user.write");

  const [existing] = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  if (!existing) throw new NotFoundError("User not found.");

  if (
    input.status === "disabled" &&
    existing.status !== "disabled" &&
    (await isLastSuperAdmin(id))
  ) {
    throw new ConflictError(
      "Cannot disable the last super_admin's account - assign another user as super_admin first.",
    );
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(users)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "identity.user.write",
        resourceType: "user",
        resourceId: id,
        before: omitPasswordHash(existing),
        after: omitPasswordHash(updated),
        requestId,
      },
      tx,
    );

    return omitPasswordHash(updated);
  });
}
