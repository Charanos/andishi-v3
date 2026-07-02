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
import { createService, listAllServices, listPublicServices } from "@/lib/services/cms/services";
import { createServiceContentSchema } from "@/lib/validation/cms";

/**
 * GET /api/services-content
 *
 * Public, unauthenticated by default: returns published service lines in
 * display order, for the homepage bento grid and /services hub. Pass
 * ?all=true while authenticated as staff with cms.service.write to get the
 * full management list (including unpublished) for the admin page.
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const { searchParams } = new URL(req.url);

  if (searchParams.get("all") === "true") {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    try {
      const result = await listAllServices({ session, requestId });
      return NextResponse.json({ services: result });
    } catch (error) {
      return handleRouteError(error, {
        requestId,
        actorUserId: session.user.id,
        module: "cms",
        action: "service.read",
      });
    }
  }

  const result = await listPublicServices();
  return NextResponse.json({ services: result });
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createServiceContentSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const service = await createService(
      { session, requestId, actorIp: getClientIp(req) },
      parsed.data,
    );
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "cms",
      action: "service.write",
    });
  }
}
