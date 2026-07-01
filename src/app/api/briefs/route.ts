import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  parseJson,
  validationError,
} from "@/lib/api/responses";
import { getClientIp } from "@/lib/api/request";
import { createBriefSchema } from "@/lib/validation/entities";
import { createBrief, listBriefs } from "@/lib/services/crm/briefs";

/**
 * GET /api/briefs
 *
 * Reference implementation for the route -> service pattern (ADR-0002):
 * the route only authenticates, parses the request, calls the service, and
 * shapes the response. All authorization, ownership scoping, transactions,
 * and audit writes live in src/lib/services/crm/briefs.ts.
 *
 * Admin: returns all briefs with optional ?type=build|hire filter.
 * Client: returns only briefs belonging to their organization.
 * Developer: no access.
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const typeFilter = searchParams.get("type");
  const briefType = typeFilter === "build" || typeFilter === "hire" ? typeFilter : undefined;

  try {
    const result = await listBriefs({ session, requestId }, { briefType });
    return NextResponse.json({ briefs: result });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "crm",
      action: "brief.read",
    });
  }
}

/**
 * POST /api/briefs
 *
 * Admin or client can create briefs. Uses discriminated union schema:
 * briefType = "build" | "hire".
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createBriefSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const brief = await createBrief({ session, requestId, actorIp: getClientIp(req) }, parsed.data);
    return NextResponse.json({ brief }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "crm",
      action: "brief.write",
    });
  }
}
