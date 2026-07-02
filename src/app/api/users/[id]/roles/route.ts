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
import { assignRoleToUser, listRoleAssignmentsForUser } from "@/lib/services/identity/user-roles";
import { assignRoleSchema } from "@/lib/validation/identity";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  try {
    const assignments = await listRoleAssignmentsForUser({ session, requestId }, id);
    return NextResponse.json({ assignments });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "role.read",
    });
  }
}

/** POST /api/users/[id]/roles - grant a role to this user (the literal "permission escalation" surface). */
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id: userId } = await context.params;
  const parsed = assignRoleSchema.safeParse({ ...(await parseJson(req)), userId });
  if (!parsed.success) return validationError(parsed.error);

  try {
    const assignment = await assignRoleToUser(
      { session, requestId, actorIp: getClientIp(req) },
      parsed.data,
    );
    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "role.write",
    });
  }
}
