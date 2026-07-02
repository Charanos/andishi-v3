import { NextResponse } from "next/server";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { getPublicSkillDomainBySlug } from "@/lib/services/cms/skill-domains";

/** GET /api/skill-domains/[slug] - public detail for a single published domain. */
export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  const requestId = generateRequestId();
  const { slug } = await context.params;

  try {
    const domain = await getPublicSkillDomainBySlug(slug);
    if (!domain) return jsonError("Skill domain not found.", 404);
    return NextResponse.json({ domain });
  } catch (error) {
    return handleRouteError(error, { requestId, module: "cms", action: "skill_domain.read" });
  }
}
