import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import { getClientIp } from "@/lib/api/request";
import { hashPassword, validatePassword } from "@/lib/auth/password";
import { createSession, getSafeRedirectForRole } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";

const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Reset token is required."),
  password: z.string().min(1, "Password is required."),
});

/**
 * Consumes a password_reset_tokens row to set a new password. Also used to
 * activate guest/"invited" accounts created from a brief submission, since
 * those users never had a password - this is their first real credential.
 */
export async function POST(req: NextRequest) {
  const { allowed } = await rateLimit("reset-password", getClientIp(req) ?? "unknown", {
    limit: 10,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const passwordError = validatePassword(parsed.data.password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const db = getDb();
  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, hashToken(parsed.data.token)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!row) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  const [user] = await db
    .update(users)
    .set({
      passwordHash: await hashPassword(parsed.data.password),
      status: "active",
      emailVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, row.userId))
    .returning();

  if (!user || user.status === "disabled") {
    return NextResponse.json({ error: "This account can't be activated." }, { status: 403 });
  }

  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, row.id));

  await createSession(
    user.id,
    {
      userAgent: req.headers.get("user-agent") ?? undefined,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    },
    user.role,
  );

  return NextResponse.json({
    redirect: getSafeRedirectForRole(undefined, user.role),
  });
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
