import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  parseJson,
  validationError,
} from "@/lib/api/responses";
import { listNotificationPrefs, setNotificationPref } from "@/lib/services/support/notifications";
import { updateNotificationPrefSchema } from "@/lib/validation/support";

/** GET/PUT /api/notification-prefs - self-scoped; a user only ever manages their own. */
export async function GET() {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const prefs = await listNotificationPrefs({ session, requestId });
    return NextResponse.json({ prefs });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "support",
      action: "notification_pref.read",
    });
  }
}

export async function PUT(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = updateNotificationPrefSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const pref = await setNotificationPref({ session, requestId }, parsed.data);
    return NextResponse.json({ pref });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "support",
      action: "notification_pref.write",
    });
  }
}
