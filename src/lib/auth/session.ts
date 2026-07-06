import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import jwt from "jsonwebtoken";
import { and, eq, gt } from "drizzle-orm";
import { getDb } from "@/db";
import { sessions, users } from "@/db/schema";
import { comparePassword } from "@/lib/auth/password";
import type { AuthUser, UserRole } from "@/types/auth";
import { isUserRole, roleHome } from "@/types/auth";

export const sessionCookieName = "andishi_session";

const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;

type JwtPayload = {
  sessionId: string;
  userId: string;
  role: UserRole;
};

export type SessionContext = {
  user: AuthUser;
  token: string;
  sessionId: string;
  expiresAt: Date;
};

export type LoginResult =
  | { ok: true; user: AuthUser }
  | {
      ok: false;
      reason: "invalid_credentials" | "account_disabled" | "account_invited" | "email_unverified";
    };

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters long.");
  }

  return secret;
}

export async function authenticateUser(email: string, password: string): Promise<LoginResult> {
  const normalized = email.trim().toLowerCase();
  const [user] = await getDb().select().from(users).where(eq(users.email, normalized)).limit(1);

  const invalidHash = "$2b$10$ndtjgjU8nkjGROyhK1/Cg.QyvS1tcoBOgPWE2JAl30G4cgm7EdBLC";
  const passwordValid = user?.passwordHash
    ? await comparePassword(password, user.passwordHash)
    : await comparePassword(password, invalidHash).catch(() => false);

  if (!user || !passwordValid) {
    return { ok: false, reason: "invalid_credentials" };
  }

  if (user.status === "disabled") return { ok: false, reason: "account_disabled" };
  if (user.status === "invited") return { ok: false, reason: "account_invited" };
  if (!user.emailVerified) return { ok: false, reason: "email_unverified" };

  return { ok: true, user: toAuthUser(user) };
}

export async function createSession(
  userId: string,
  metadata?: { userAgent?: string; ipAddress?: string },
  role?: UserRole,
) {
  const resolvedRole = role ?? (await getUserRole(userId));
  if (!resolvedRole) {
    throw new Error("Cannot create session for a missing user.");
  }

  const expiresAt = new Date(Date.now() + sessionMaxAgeSeconds * 1000);
  const sessionId = crypto.randomUUID();

  const token = jwt.sign(
    { sessionId, userId, role: resolvedRole } satisfies JwtPayload,
    getJwtSecret(),
    { expiresIn: sessionMaxAgeSeconds },
  );

  await Promise.all([
    getDb().insert(sessions).values({
      id: sessionId,
      userId,
      token,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
      expiresAt,
    }),
    getDb().update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId)),
  ]);

  await setSessionCookie(token);

  return token;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  // eslint-disable-next-line drizzle/enforce-delete-with-where -- Next.js cookie store, not a Drizzle table
  cookieStore.delete(sessionCookieName);
}

export async function revokeSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (token) {
    await getDb().update(sessions).set({ revoked: true }).where(eq(sessions.token, token));
  }

  await clearSession();
}

export const getSession = cache(async function getSession(): Promise<SessionContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) return null;

  let payload: JwtPayload;
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as Partial<JwtPayload>;
    if (!decoded.sessionId || !decoded.userId || !decoded.role || !isUserRole(decoded.role)) {
      return null;
    }
    payload = decoded as JwtPayload;
  } catch {
    return null;
  }

  const [row] = await getDb()
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.id, payload.sessionId),
        eq(sessions.token, token),
        eq(sessions.revoked, false),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    user: toAuthUser(row.user),
    token,
    sessionId: row.session.id,
    expiresAt: row.session.expiresAt,
  };
});

export async function requireSession() {
  const session = await getSession();
  const currentPath = await getCurrentPath("/dashboard");

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }

  if (session.user.status === "disabled") {
    await clearSession();
    redirect("/login?error=account_disabled");
  }

  return session.user;
}

export async function requireRole(role: UserRole) {
  const user = await requireSession();

  if (user.role !== role) {
    redirect(roleHome[user.role]);
  }

  return user;
}

export async function requireDashboardAccess() {
  const currentPath = await getCurrentPath("/dashboard");
  const requiredRole = getRoleForPath(currentPath);

  if (requiredRole) {
    await requireRole(requiredRole);
  } else {
    await requireSession();
  }
}

export function getRoleForPath(pathname: string): UserRole | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/dashboard")) return "client";
  if (pathname.startsWith("/dev")) return "developer";
  return null;
}

export function getSafeRedirectForRole(next: string | null | undefined, role: UserRole) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return roleHome[role];
  }

  const targetRole = getRoleForPath(next);

  return targetRole === role ? next : roleHome[role];
}

async function getCurrentPath(fallback: string) {
  const headerStore = await headers();
  return headerStore.get("x-pathname") ?? fallback;
}

function toAuthUser(user: typeof users.$inferSelect): AuthUser {
  let avatarUrl = user.avatarUrl ?? undefined;
  if (!avatarUrl && user.role === "admin") {
    avatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80";
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl,
    role: user.role,
    status: user.status,
    organizationId: user.organizationId ?? undefined,
    engineerId: user.engineerId ?? undefined,
    lastLoginAt: user.lastLoginAt?.toISOString(),
    createdAt: user.createdAt.toISOString(),
  };
}

async function getUserRole(userId: string) {
  const [user] = await getDb()
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.role ?? null;
}
