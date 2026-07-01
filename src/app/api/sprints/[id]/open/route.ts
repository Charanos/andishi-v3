import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getClientIp } from "@/lib/api/request";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { openSprint } from "@/lib/services/delivery/sprints";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  try {
    const sprint = await openSprint({ session, requestId, actorIp: getClientIp(req) }, id);
    return NextResponse.json({ sprint });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "sprint.open",
    });
  }
}
