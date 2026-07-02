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
import { inviteUser } from "@/lib/services/identity/users";
import { inviteUserSchema } from "@/lib/validation/identity";

/**
 * POST /api/users/invite - staff-only. Provisions login access for a new
 * developer/client/staff hire, or re-sends an activation link for an
 * existing "invited" account. This is the literal "provision login
 * details" step referenced by the placement/hire workflow.
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = inviteUserSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const user = await inviteUser(
      { session, requestId, actorIp: getClientIp(req) },
      parsed.data,
    );
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "user.invite",
    });
  }
}
