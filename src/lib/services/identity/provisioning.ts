import { createHash, randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import type { DB } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import type { UserRole } from "@/types/auth";

/** Either the top-level DB client or a transaction handle - see lib/authz/audit.ts. */
type Executor = Pick<DB, "select" | "insert" | "update">;

const INVITE_TOKEN_TTL_MS = 1000 * 60 * 60 * 48; // 48h - matches sendInviteEmail's copy

export interface ProvisionUserAccountInput {
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string | null;
  engineerId?: string | null;
}

/**
 * Shared core of every "give this person login access" flow - a fresh
 * admin invite (identity/users.ts's inviteUser), a newly hired careers
 * candidate (careers/applications.ts's hireApplication), or any future
 * onboarding path. Find-or-updates the user row and issues a fresh
 * activation token via the same password_reset_tokens + /reset-password
 * mechanism used for guest accounts.
 *
 * Returns `token: null` when the account is already active - the caller
 * decides whether that's a no-op or an error (an active account should
 * never get a password-set link re-issued, since that's a session-hijack
 * vector).
 */
export async function provisionUserAccount(tx: Executor, input: ProvisionUserAccountInput) {
  const email = input.email.toLowerCase();
  const [existing] = await tx.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing?.status === "active") {
    return { user: existing, token: null as string | null };
  }

  let user: typeof users.$inferSelect;
  if (existing) {
    [user] = await tx
      .update(users)
      .set({
        name: input.name,
        role: input.role,
        organizationId: input.organizationId ?? existing.organizationId,
        engineerId: input.engineerId ?? existing.engineerId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning();
  } else {
    [user] = await tx
      .insert(users)
      .values({
        email,
        name: input.name,
        role: input.role,
        status: "invited",
        emailVerified: false,
        organizationId: input.organizationId,
        engineerId: input.engineerId,
      })
      .returning();
  }

  const token = randomBytes(32).toString("base64url");
  await tx.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash: createHash("sha256").update(token).digest("hex"),
    expiresAt: new Date(Date.now() + INVITE_TOKEN_TTL_MS),
  });

  return { user, token };
}

export function buildActivationUrl(token: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
}
