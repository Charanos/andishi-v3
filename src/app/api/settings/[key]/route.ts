import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getClientIp } from "@/lib/api/request";
import { generateRequestId, handleRouteError, jsonError, parseJson } from "@/lib/api/responses";
import { setSetting } from "@/lib/services/platform/settings";

/** PUT /api/settings/[key] - upsert a single setting by key. Body is the raw value (any JSON). */
export async function PUT(req: NextRequest, context: { params: Promise<{ key: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { key } = await context.params;
  const value = await parseJson(req);
  if (value === null) return jsonError("A JSON value is required.", 400);

  try {
    const setting = await setSetting({ session, requestId, actorIp: getClientIp(req) }, key, value);
    return NextResponse.json({ setting });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "platform",
      action: "settings.write",
    });
  }
}
