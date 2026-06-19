import { createHash, randomBytes } from "crypto";

export const googleStateCookieName = "andishi_google_state";
export const googleVerifierCookieName = "andishi_google_verifier";

const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
const googleTokenUrl = "https://oauth2.googleapis.com/token";
const googleUserInfoUrl = "https://openidconnect.googleapis.com/v1/userinfo";

export type GoogleProfile = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

export function createGooglePkce() {
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(64).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  return { state, verifier, challenge };
}

export function getGoogleAuthorizationUrl(state: string, challenge: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI are required.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "select_account",
  });

  return `${googleAuthUrl}?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, verifier: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth environment variables are required.");
  }

  const response = await fetch(googleTokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code,
      code_verifier: verifier,
    }),
  });

  if (!response.ok) {
    throw new Error("Google token exchange failed.");
  }

  return (await response.json()) as { access_token: string };
}

export async function fetchGoogleProfile(accessToken: string) {
  const response = await fetch(googleUserInfoUrl, {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Google profile fetch failed.");
  }

  return (await response.json()) as GoogleProfile;
}

