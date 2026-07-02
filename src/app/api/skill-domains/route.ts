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
import {
  createSkillDomain,
  listAllSkillDomains,
  listPublicSkillDomains,
} from "@/lib/services/cms/skill-domains";
import { createSkillDomainSchema } from "@/lib/validation/cms";

/**
 * GET /api/skill-domains
 *
 * Public, unauthenticated by default: returns published domains in display
 * order, for /skills and /skills/[domain]. Pass ?all=true while
 * authenticated as staff with cms.skill_domain.write to get the full
 * management list (including unpublished) for the admin page.
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const { searchParams } = new URL(req.url);

  if (searchParams.get("all") === "true") {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    try {
      const result = await listAllSkillDomains({ session, requestId });
      return NextResponse.json({ domains: result });
    } catch (error) {
      return handleRouteError(error, {
        requestId,
        actorUserId: session.user.id,
        module: "cms",
        action: "skill_domain.read",
      });
    }
  }

  const result = await listPublicSkillDomains();
  return NextResponse.json({ domains: result });
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createSkillDomainSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const domain = await createSkillDomain(
      { session, requestId, actorIp: getClientIp(req) },
      parsed.data,
    );
    return NextResponse.json({ domain }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "cms",
      action: "skill_domain.write",
    });
  }
}
