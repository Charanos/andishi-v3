import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateRequestId, handleRouteError, jsonError, parseJson, validationError } from "@/lib/api/responses";
import { listApplications, submitApplication } from "@/lib/services/careers/applications";
import { createApplicationSchema } from "@/lib/validation/careers";
import { getClientIp } from "@/lib/api/request";
import { rateLimit } from "@/lib/rate-limit";

/** GET /api/careers/applications - staff-only list of applications. */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const jobOpeningId = searchParams.get("jobOpeningId") ?? undefined;
  const stage = searchParams.get("stage") ?? undefined;

  try {
    const applications = await listApplications({ session, requestId }, { jobOpeningId, stage });
    return NextResponse.json({ applications });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "careers",
      action: "application.read",
    });
  }
}

/**
 * POST /api/careers/applications
 *
 * Public, unauthenticated — the careers apply form.
 * Rate-limited to prevent spam (5 applications per hour per IP).
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const ip = getClientIp(req) ?? "unknown";

  const { allowed } = await rateLimit("career-apply", ip, {
    limit: 5,
    windowSeconds: 3600,
  });
  if (!allowed) return jsonError("Too many applications. Please try again later.", 429);

  const parsed = createApplicationSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const application = await submitApplication(parsed.data);
    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      module: "careers",
      action: "application.submit",
    });
  }
}

