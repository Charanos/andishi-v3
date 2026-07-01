import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/api/request";
import { authenticateUser, createSession, getSafeRedirectForRole } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(req: NextRequest) {
  const { allowed } = await rateLimit("login", getClientIp(req) ?? "unknown", {
    limit: 10,
    windowSeconds: 300,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again shortly." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const result = await authenticateUser(parsed.data.email, parsed.data.password);

  if (!result.ok) {
    if (result.reason === "account_disabled") {
      return NextResponse.json({ error: "This account has been disabled." }, { status: 403 });
    }

    if (result.reason === "account_invited") {
      return NextResponse.json({ error: "This invitation is not active yet." }, { status: 403 });
    }

    if (result.reason === "email_unverified") {
      return NextResponse.json(
        { error: "Please verify your email before signing in." },
        { status: 403 },
      );
    }

    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createSession(
    result.user.id,
    {
      userAgent: req.headers.get("user-agent") ?? undefined,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    },
    result.user.role,
  );

  return NextResponse.json({
    redirect: getSafeRedirectForRole(parsed.data.next, result.user.role),
  });
}
