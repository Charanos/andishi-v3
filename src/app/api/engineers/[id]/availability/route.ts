import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  parseJson,
  validationError,
} from "@/lib/api/responses";
import {
  createAvailabilityWindow,
  listAvailabilityWindows,
} from "@/lib/services/talent/availability";
import { createAvailabilityWindowSchema } from "@/lib/validation/talent";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  try {
    const windows = await listAvailabilityWindows({ session, requestId }, id);
    return NextResponse.json({ windows });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "talent",
      action: "engineer.read",
    });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const parsed = createAvailabilityWindowSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const window = await createAvailabilityWindow({ session, requestId }, id, parsed.data);
    return NextResponse.json({ window }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "talent",
      action: "availability.write",
    });
  }
}
