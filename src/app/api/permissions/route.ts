import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { listPermissionCatalog } from "@/lib/services/identity/roles";

/** GET /api/permissions - the full catalog, for the role-builder UI's permission picker. */
export async function GET() {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const permissions = await listPermissionCatalog({ session, requestId });
    return NextResponse.json({ permissions });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "role.read",
    });
  }
}
