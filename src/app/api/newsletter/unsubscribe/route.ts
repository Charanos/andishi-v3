import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateRequestId, handleRouteError } from "@/lib/api/responses";
import { unsubscribeFromNewsletter } from "@/lib/services/marketing/newsletter";

const unsubscribeSchema = z.object({ email: z.string().trim().email() });

/** POST /api/newsletter/unsubscribe - public, unauthenticated (e.g. an email footer link). */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const parsed = unsubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  try {
    const subscriber = await unsubscribeFromNewsletter(parsed.data.email);
    return NextResponse.json({ subscriber });
  } catch (error) {
    return handleRouteError(error, { requestId, module: "marketing", action: "newsletter.write" });
  }
}
