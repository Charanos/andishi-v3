import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { emailVerificationTokens, users } from "@/db/schema";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  const db = getDb();
  const [row] = await db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.tokenHash, hashToken(token)),
        isNull(emailVerificationTokens.usedAt),
        gt(emailVerificationTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!row) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  await db.update(users).set({ emailVerified: true }).where(eq(users.id, row.userId));
  await db
    .update(emailVerificationTokens)
    .set({ usedAt: new Date() })
    .where(eq(emailVerificationTokens.id, row.id));

  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

