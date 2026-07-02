import { NextResponse } from "next/server";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { getPublicServiceBySlug } from "@/lib/services/cms/services";

/** GET /api/services-content/[slug] - public detail for a single published service. */
export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  const requestId = generateRequestId();
  const { slug } = await context.params;

  try {
    const service = await getPublicServiceBySlug(slug);
    if (!service) return jsonError("Service not found.", 404);
    return NextResponse.json({ service });
  } catch (error) {
    return handleRouteError(error, { requestId, module: "cms", action: "service.read" });
  }
}
