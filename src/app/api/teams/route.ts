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
import { createTeam, listTeams } from "@/lib/services/identity/teams";
import { createTeamSchema } from "@/lib/validation/identity";

export async function GET() {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const result = await listTeams({ session, requestId });
    return NextResponse.json({ teams: result });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "team.read",
    });
  }
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createTeamSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const team = await createTeam({ session, requestId, actorIp: getClientIp(req) }, parsed.data);
    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "identity",
      action: "team.write",
    });
  }
}
