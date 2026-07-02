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
import { setRolePermissions } from "@/lib/services/identity/roles";
import { setRolePermissionsSchema } from "@/lib/validation/identity";

/** POST /api/roles/[id]/permissions - full replace of a custom role's permission set. */
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const parsed = setRolePermissionsSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const result = await setRolePermissions(
      { session, requestId, actorIp: getClientIp(req) },
      id,
      parsed.data,
    );
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "role.write",
    });
  }
}
