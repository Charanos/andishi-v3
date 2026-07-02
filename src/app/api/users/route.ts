import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { listUsers } from "@/lib/services/identity/users";

export async function GET() {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const result = await listUsers({ session, requestId });
    return NextResponse.json({ users: result });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "user.read",
    });
  }
}
