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
import { createAllocation, listAllocations } from "@/lib/services/delivery/allocations";
import { createAllocationSchema } from "@/lib/validation/delivery";

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const engineerId = searchParams.get("engineerId") ?? undefined;
  const projectId = searchParams.get("projectId") ?? undefined;

  try {
    const result = await listAllocations({ session, requestId }, { engineerId, projectId });
    return NextResponse.json({ allocations: result });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "allocation.read",
    });
  }
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createAllocationSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const allocation = await createAllocation(
      { session, requestId, actorIp: getClientIp(req) },
      parsed.data,
    );
    return NextResponse.json({ allocation }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "allocation.write",
    });
  }
}
