import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { listMySessions } from "@/lib/services/identity/sessions";

/** GET /api/sessions - self-scoped; a user only ever sees their own active sessions. */
export async function GET() {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const mySessions = await listMySessions({ session, requestId });
    return NextResponse.json({
      sessions: mySessions,
      currentSessionId: session.sessionId,
    });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "session.read",
    });
  }
}
