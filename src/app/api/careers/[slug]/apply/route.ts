import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/api/request";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  parseJson,
  validationError,
} from "@/lib/api/responses";
import { rateLimit } from "@/lib/rate-limit";
import { getPublicOpeningBySlug } from "@/lib/services/careers/openings";
import { submitApplication } from "@/lib/services/careers/applications";
import { createApplicationSchema } from "@/lib/validation/careers";

/** POST /api/careers/[slug]/apply - public, rate-limited (ADR-0008). */
export async function POST(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const requestId = generateRequestId();

  const { allowed } = await rateLimit("careers-apply", getClientIp(req) ?? "unknown", {
    limit: 5,
    windowSeconds: 3600,
  });
  if (!allowed) return jsonError("Too many applications submitted. Please try again later.", 429);

  const { slug } = await context.params;

  try {
    const opening = await getPublicOpeningBySlug(slug);

    const parsed = createApplicationSchema.safeParse({
      ...(await parseJson(req)),
      jobOpeningId: opening.id,
    });
    if (!parsed.success) return validationError(parsed.error);

    const application = await submitApplication(parsed.data);
    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, { requestId, module: "careers", action: "application.write" });
  }
}
