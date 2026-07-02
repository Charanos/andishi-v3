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
import { createFaq, listAllFaqs, listPublicFaqs } from "@/lib/services/cms/faqs";
import { createFaqSchema } from "@/lib/validation/cms";

/**
 * GET /api/faqs
 *
 * Public, unauthenticated by default: returns published FAQs (?section= to
 * filter to one of landing/services/hire/careers/general). Pass ?all=true
 * while authenticated as staff with cms.faq.write to get the full
 * management list (including unpublished) for the admin page.
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const { searchParams } = new URL(req.url);

  if (searchParams.get("all") === "true") {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    try {
      const result = await listAllFaqs({ session, requestId });
      return NextResponse.json({ faqs: result });
    } catch (error) {
      return handleRouteError(error, {
        requestId,
        actorUserId: session.user.id,
        module: "cms",
        action: "faq.read",
      });
    }
  }

  const section = searchParams.get("section") ?? undefined;
  const result = await listPublicFaqs({ section });
  return NextResponse.json({ faqs: result });
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createFaqSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const faq = await createFaq({ session, requestId, actorIp: getClientIp(req) }, parsed.data);
    return NextResponse.json({ faq }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "cms",
      action: "faq.write",
    });
  }
}
