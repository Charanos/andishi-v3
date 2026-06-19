import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createSession, getSafeRedirectForRole } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(req: NextRequest) {
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
      return NextResponse.json({ error: "Please verify your email before signing in." }, { status: 403 });
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
