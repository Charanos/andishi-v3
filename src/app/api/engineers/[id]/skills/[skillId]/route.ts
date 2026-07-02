import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { removeEngineerSkill } from "@/lib/services/talent/skills";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string; skillId: string }> },
) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id, skillId } = await context.params;

  try {
    await removeEngineerSkill({ session, requestId }, id, skillId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "talent",
      action: "engineer.write",
    });
  }
}
