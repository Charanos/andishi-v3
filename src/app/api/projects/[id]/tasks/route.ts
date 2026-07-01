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
import { createTask, listTasks } from "@/lib/services/delivery/tasks";
import { createTaskSchema } from "@/lib/validation/delivery";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id: projectId } = await context.params;

  try {
    const result = await listTasks({ session, requestId }, projectId);
    return NextResponse.json({ tasks: result });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "task.read",
    });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id: projectId } = await context.params;
  const parsed = createTaskSchema.safeParse({ ...(await parseJson(req)), projectId });
  if (!parsed.success) return validationError(parsed.error);

  try {
    const task = await createTask({ session, requestId, actorIp: getClientIp(req) }, parsed.data);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "task.write",
    });
  }
}
