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
import { getUser, updateUserAccess, updateUserProfile } from "@/lib/services/identity/users";
import { updateUserAccessSchema, updateUserProfileSchema } from "@/lib/validation/identity";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  try {
    const user = await getUser({ session, requestId }, id);
    return NextResponse.json({ user });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "user.read",
    });
  }
}

/**
 * PUT /api/users/[id]
 *
 * Profile fields (name/avatarUrl) route to self-service - any
 * authenticated user, own record only. Access fields (status/role/
 * organizationId/engineerId) route to updateUserAccess, gated by
 * identity.user.write (super_admin by default) - previously these were
 * gated by a bare `role === "admin"` check, which let ANY staff persona
 * (marketer, support_agent, etc.) reassign another user's role/status/
 * org/engineer with no permission check at all. Fixed here.
 */
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const body: Record<string, unknown> = (await parseJson(req)) ?? {};
  const ctx = { session, requestId, actorIp: getClientIp(req) };

  const hasProfileFields = "name" in body || "avatarUrl" in body;
  const hasAccessFields =
    "status" in body || "role" in body || "organizationId" in body || "engineerId" in body;

  if (!hasProfileFields && !hasAccessFields) {
    return jsonError("No updatable fields provided.", 400);
  }

  try {
    let user;

    if (hasProfileFields) {
      const parsed = updateUserProfileSchema.safeParse(body);
      if (!parsed.success) return validationError(parsed.error);
      user = await updateUserProfile(ctx, id, parsed.data);
    }

    if (hasAccessFields) {
      const parsed = updateUserAccessSchema.safeParse(body);
      if (!parsed.success) return validationError(parsed.error);
      user = await updateUserAccess(ctx, id, parsed.data);
    }

    return NextResponse.json({ user });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "user.write",
    });
  }
}
