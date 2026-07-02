import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { listNotifications } from "@/lib/services/support/notifications";

/** GET /api/notifications - self-scoped; a user only ever sees their own. */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";

  try {
    const notifications = await listNotifications({ session, requestId }, { unreadOnly });
    return NextResponse.json({ notifications });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "support",
      action: "notification.read",
    });
  }
}
