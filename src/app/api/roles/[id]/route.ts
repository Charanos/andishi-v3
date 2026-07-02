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
import { deleteRole, getRole, updateRole } from "@/lib/services/identity/roles";
import { updateRoleSchema } from "@/lib/validation/identity";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  try {
    const role = await getRole({ session, requestId }, id);
    return NextResponse.json({ role });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "role.read",
    });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const parsed = updateRoleSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const role = await updateRole(
      { session, requestId, actorIp: getClientIp(req) },
      id,
      parsed.data,
    );
    return NextResponse.json({ role });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "role.write",
    });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  try {
    await deleteRole({ session, requestId, actorIp: getClientIp(req) }, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "role.write",
    });
  }
}
