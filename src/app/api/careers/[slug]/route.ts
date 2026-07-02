import { NextResponse } from "next/server";
import { getPublicOpeningBySlug } from "@/lib/services/careers/openings";
import { generateRequestId, handleRouteError } from "@/lib/api/responses";

/** GET /api/careers/[slug] - public detail for a single published opening. */
export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  const requestId = generateRequestId();
  const { slug } = await context.params;

  try {
    const opening = await getPublicOpeningBySlug(slug);
    return NextResponse.json({ opening });
  } catch (error) {
    return handleRouteError(error, { requestId, module: "careers", action: "job.read" });
  }
}
