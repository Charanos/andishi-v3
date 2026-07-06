import { and, desc, eq, gt } from "drizzle-orm";
import { getDb } from "@/db";
import { sessions } from "@/db/schema";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";

/** Session shape safe to send to the client - never includes the JWT `token` or `userId`. */
export type PublicSession = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  createdAt: Date;
};

/**
 * Self-scoped: a user only ever sees their own active (non-revoked,
 * non-expired) sessions. Deliberately excludes the `token` column - it's
 * the literal JWT for that session, and has no business leaving the server.
 */
export async function listMySessions(ctx: CallerContext) {
  const { session } = ctx;

  return getDb()
    .select({
      id: sessions.id,
      userAgent: sessions.userAgent,
      ipAddress: sessions.ipAddress,
      expiresAt: sessions.expiresAt,
      createdAt: sessions.createdAt,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, session.user.id),
        eq(sessions.revoked, false),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(sessions.createdAt));
}

/**
 * Revokes another session belonging to the caller ("sign out this device").
 * Deliberately can't revoke the session making the request - that's what
 * the sign-out button (revokeSession() in lib/auth/session.ts) is for, and
 * self-lockout mid-request would just be confusing.
 */
export async function revokeMySession(ctx: CallerContext, sessionId: string) {
  const { session } = ctx;

  if (sessionId === session.sessionId) {
    throw new ForbiddenError("Sign out from the account menu to end your current session.");
  }

  const [existing] = await getDb()
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, session.user.id)))
    .limit(1);
  if (!existing) throw new NotFoundError("Session not found.");

  const [updated] = await getDb()
    .update(sessions)
    .set({ revoked: true })
    .where(eq(sessions.id, sessionId))
    .returning({ id: sessions.id, revoked: sessions.revoked });

  return updated;
}
