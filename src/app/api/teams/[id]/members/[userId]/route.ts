import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getClientIp } from "@/lib/api/request";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { removeTeamMember } from "@/lib/services/identity/teams";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; userId: string }> },
) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id, userId } = await context.params;

  try {
    await removeTeamMember({ session, requestId, actorIp: getClientIp(req) }, id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "team.write",
    });
  }
}
