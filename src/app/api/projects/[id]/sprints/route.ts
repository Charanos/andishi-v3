import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getClientIp } from "@/lib/api/request";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  parseJson,
  validationError,
} from "@/lib/api/responses";
import { createSprint, listSprints } from "@/lib/services/delivery/sprints";
import { createSprintSchema } from "@/lib/validation/delivery";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id: projectId } = await context.params;

  try {
    const result = await listSprints({ session, requestId }, projectId);
    return NextResponse.json({ sprints: result });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "sprint.read",
    });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id: projectId } = await context.params;
  const parsed = createSprintSchema.safeParse({ ...(await parseJson(req)), projectId });
  if (!parsed.success) return validationError(parsed.error);

  try {
    const sprint = await createSprint(
      { session, requestId, actorIp: getClientIp(req) },
      parsed.data,
    );
    return NextResponse.json({ sprint }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "sprint.write",
    });
  }
}
