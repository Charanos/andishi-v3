import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { listNewsletterSubscribers } from "@/lib/services/marketing/newsletter";

/** GET /api/newsletter/subscribers - staff management list, gated by marketing.newsletter.read. */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;

  try {
    const subscribers = await listNewsletterSubscribers({ session, requestId }, { status });
    return NextResponse.json({ subscribers });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "marketing",
      action: "newsletter.read",
    });
  }
}
