import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import {
  exchangeGoogleCode,
  fetchGoogleProfile,
  googleStateCookieName,
  googleVerifierCookieName,
} from "@/lib/auth/google";
import { createSession } from "@/lib/auth/session";
import { roleHome } from "@/types/auth";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(googleStateCookieName)?.value;
  const verifier = cookieStore.get(googleVerifierCookieName)?.value;

  // eslint-disable-next-line drizzle/enforce-delete-with-where -- Next.js cookie store, not a Drizzle table
  cookieStore.delete(googleStateCookieName);
  // eslint-disable-next-line drizzle/enforce-delete-with-where -- Next.js cookie store, not a Drizzle table
  cookieStore.delete(googleVerifierCookieName);

  if (!code || !state || !expectedState || !verifier || state !== expectedState) {
    return NextResponse.redirect(new URL("/login?error=oauth_state", req.url));
  }

  try {
    const token = await exchangeGoogleCode(code, verifier);
    const profile = await fetchGoogleProfile(token.access_token);

    if (!profile.email || profile.email_verified === false) {
      return NextResponse.redirect(new URL("/login?error=oauth_email", req.url));
    }

    const db = getDb();
    const [existing] = await db
      .select()
      .from(users)
      .where(or(eq(users.googleId, profile.sub), eq(users.email, profile.email.toLowerCase())))
      .limit(1);

    const [user] = existing
      ? await db
          .update(users)
          .set({
            googleId: profile.sub,
            avatarUrl: profile.picture,
            emailVerified: true,
            status: existing.status === "invited" ? "active" : existing.status,
          })
          .where(eq(users.id, existing.id))
          .returning()
      : await db
          .insert(users)
          .values({
            email: profile.email.toLowerCase(),
            name: profile.name ?? profile.email.split("@")[0],
            avatarUrl: profile.picture,
            googleId: profile.sub,
            role: "client",
            status: "active",
            emailVerified: true,
          })
          .returning();

    if (user.status === "disabled") {
      return NextResponse.redirect(new URL("/login?error=account_disabled", req.url));
    }

    await createSession(
      user.id,
      {
        userAgent: req.headers.get("user-agent") ?? undefined,
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      },
      user.role,
    );

    return NextResponse.redirect(new URL(roleHome[user.role], req.url));
  } catch (error) {
    console.error("Google OAuth callback failed:", error);
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }
}
