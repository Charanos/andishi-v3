import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { revokeMySession } from "@/lib/services/identity/sessions";

/** DELETE /api/sessions/[id] - revoke one of the caller's own OTHER sessions ("sign out this device"). */
export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  try {
    const revoked = await revokeMySession({ session, requestId }, id);
    return NextResponse.json({ session: revoked });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "session.write",
    });
  }
}
