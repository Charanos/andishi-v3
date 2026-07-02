import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import { getClientIp } from "@/lib/api/request";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validation/auth";

/**
 * Always returns { success: true } regardless of whether the email matches
 * an account, so this endpoint can't be used to enumerate registered users.
 * This also covers guest/"invited" accounts created from a brief submission
 * (see /api/contact) - the reset link doubles as their account activation
 * link since they never had a password to begin with.
 */
export async function POST(req: NextRequest) {
  const { allowed } = await rateLimit("forgot-password", getClientIp(req) ?? "unknown", {
    limit: 5,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const [user] = await getDb()
    .select({ id: users.id, name: users.name, email: users.email, status: users.status })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (user && user.status !== "disabled") {
    const token = randomBytes(32).toString("base64url");
    await getDb()
      .insert(passwordResetTokens)
      .values({
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      });

    sendPasswordResetEmail(user.email, user.name, token).catch((error) => {
      console.error("[forgot-password] Failed to send reset email:", error);
    });
  }

  return NextResponse.json({ success: true });
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
