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
import { createRole, listRoles } from "@/lib/services/identity/roles";
import { createRoleSchema } from "@/lib/validation/identity";

export async function GET() {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const result = await listRoles({ session, requestId });
    return NextResponse.json({ roles: result });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "role.read",
    });
  }
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createRoleSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const role = await createRole({ session, requestId, actorIp: getClientIp(req) }, parsed.data);
    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "role.write",
    });
  }
}
