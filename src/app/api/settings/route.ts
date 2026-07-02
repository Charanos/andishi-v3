import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { listSettings } from "@/lib/services/platform/settings";

export async function GET() {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const result = await listSettings({ session, requestId });
    return NextResponse.json({ settings: result });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "platform",
      action: "settings.read",
    });
  }
}
