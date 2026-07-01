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
import { createMilestone, listMilestones } from "@/lib/services/delivery/milestones";
import { createMilestoneSchema } from "@/lib/validation/delivery";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id: projectId } = await context.params;

  try {
    const result = await listMilestones({ session, requestId }, projectId);
    return NextResponse.json({ milestones: result });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "milestone.read",
    });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id: projectId } = await context.params;
  const parsed = createMilestoneSchema.safeParse({ ...(await parseJson(req)), projectId });
  if (!parsed.success) return validationError(parsed.error);

  try {
    const milestone = await createMilestone(
      { session, requestId, actorIp: getClientIp(req) },
      parsed.data,
    );
    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "milestone.write",
    });
  }
}
