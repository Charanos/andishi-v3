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
import { createGovernanceControl, listGovernanceControls } from "@/lib/services/platform/governance";
import { createGovernanceControlSchema } from "@/lib/validation/governance";

export async function GET() {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const controls = await listGovernanceControls({ session, requestId });
    return NextResponse.json({ controls });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "platform",
      action: "governance.read",
    });
  }
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createGovernanceControlSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const control = await createGovernanceControl(
      { session, requestId, actorIp: getClientIp(req) },
      parsed.data,
    );
    return NextResponse.json({ control }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "platform",
      action: "governance.write",
    });
  }
}
