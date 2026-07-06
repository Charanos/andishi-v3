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
import { listPublicOpenings, createJobOpening } from "@/lib/services/careers/openings";
import { createJobOpeningSchema } from "@/lib/validation/careers";

type JobKind = "freelance" | "internal" | "outsourced";

function parseJobKind(value: string | null): JobKind | undefined {
  return value === "freelance" || value === "internal" || value === "outsourced"
    ? value
    : undefined;
}

/** GET /api/careers - public list of published (status=open) job openings. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kind = parseJobKind(searchParams.get("kind"));

  const openings = await listPublicOpenings(kind ? { kind } : {});
  return NextResponse.json({ openings });
}

/**
 * POST /api/careers
 *
 * Admin-only: create a new job opening.
 * The opening starts as draft by default; use the publish endpoint to make it live.
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = createJobOpeningSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const opening = await createJobOpening(
      { session, requestId, actorIp: getClientIp(req) },
      parsed.data,
    );
    return NextResponse.json({ opening }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "careers",
      action: "careers.job.write",
    });
  }
}

