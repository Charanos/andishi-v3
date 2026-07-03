import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  parseJson,
  validationError,
} from "@/lib/api/responses";
import { respondToEvent } from "@/lib/services/scheduling/events";
import { respondToEventSchema } from "@/lib/validation/scheduling";

/** POST /api/calendar/events/[id]/respond - self-scoped RSVP, no permission needed. */
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const parsed = respondToEventSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const attendee = await respondToEvent({ session, requestId }, id, parsed.data);
    return NextResponse.json({ attendee });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "scheduling",
      action: "event.respond",
    });
  }
}
