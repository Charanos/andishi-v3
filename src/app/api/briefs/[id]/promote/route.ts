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
import { promoteBriefToProject } from "@/lib/services/delivery/projects";
import { promoteBriefToProjectSchema } from "@/lib/validation/delivery";

/** POST /api/briefs/[id]/promote - the brief -> project handoff (ADR-0007). */
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const parsed = promoteBriefToProjectSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const result = await promoteBriefToProject(
      { session, requestId, actorIp: getClientIp(req) },
      id,
      parsed.data,
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "project.write",
    });
  }
}
