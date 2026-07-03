import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  parseJson,
  validationError,
} from "@/lib/api/responses";
import { createEvent, listAllEvents, listMyEvents } from "@/lib/services/scheduling/events";
import { createCalendarEventSchema } from "@/lib/validation/scheduling";

/**
 * GET /api/calendar/events
 *
 * Self-scoped by default: events you organize or are invited to. Pass
 * ?all=true while authenticated as staff with scheduling.event.read for
 * the full cross-staff calendar.
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);

  try {
    const events =
      searchParams.get("all") === "true"
        ? await listAllEvents({ session, requestId })
        : await listMyEvents({ session, requestId });
    return NextResponse.json({ events });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "scheduling",
      action: "event.read",
    });
  }
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createCalendarEventSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const event = await createEvent({ session, requestId }, parsed.data);
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "scheduling",
      action: "event.write",
    });
  }
}
