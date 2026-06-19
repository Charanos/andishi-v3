import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createGooglePkce,
  getGoogleAuthorizationUrl,
  googleStateCookieName,
  googleVerifierCookieName,
} from "@/lib/auth/google";

export async function GET() {
  const { state, verifier, challenge } = createGooglePkce();
  const cookieStore = await cookies();

  cookieStore.set(googleStateCookieName, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  cookieStore.set(googleVerifierCookieName, verifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return NextResponse.redirect(getGoogleAuthorizationUrl(state, challenge));
}

