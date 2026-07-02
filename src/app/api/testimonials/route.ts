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
import {
  createTestimonial,
  listAllTestimonials,
  listPublicTestimonials,
} from "@/lib/services/cms/testimonials";
import { createTestimonialSchema } from "@/lib/validation/cms";

/**
 * GET /api/testimonials
 *
 * Public, unauthenticated by default: returns active testimonials for the
 * homepage marquee (?featured=true to filter). Pass ?all=true while
 * authenticated as staff with cms.testimonial.write to get the full
 * management list (including archived) for the admin page.
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const { searchParams } = new URL(req.url);

  if (searchParams.get("all") === "true") {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    try {
      const result = await listAllTestimonials({ session, requestId });
      return NextResponse.json({ testimonials: result });
    } catch (error) {
      return handleRouteError(error, {
        requestId,
        actorUserId: session.user.id,
        module: "cms",
        action: "testimonial.read",
      });
    }
  }

  const featuredOnly = searchParams.get("featured") === "true";
  const result = await listPublicTestimonials({ featuredOnly });
  return NextResponse.json({ testimonials: result });
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createTestimonialSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const testimonial = await createTestimonial(
      { session, requestId, actorIp: getClientIp(req) },
      parsed.data,
    );
    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "cms",
      action: "testimonial.write",
    });
  }
}
