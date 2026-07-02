import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/api/request";
import { rateLimit } from "@/lib/rate-limit";
import { subscribeToNewsletter } from "@/lib/services/marketing/newsletter";
import { subscribeNewsletterSchema } from "@/lib/validation/marketing";

/** POST /api/newsletter/subscribe - public, unauthenticated. Backs the homepage newsletter form. */
export async function POST(req: NextRequest) {
  const { allowed } = await rateLimit("newsletter-subscribe", getClientIp(req) ?? "unknown", {
    limit: 5,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const parsed = subscribeNewsletterSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: issue?.message ?? "Validation failed", field: issue?.path.join(".") },
      { status: 400 },
    );
  }

  try {
    const subscriber = await subscribeToNewsletter(parsed.data);
    return NextResponse.json({ subscriber }, { status: 201 });
  } catch (error) {
    console.error("[Newsletter Subscribe Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
