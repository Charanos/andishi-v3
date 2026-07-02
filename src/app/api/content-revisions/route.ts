import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  validationError,
} from "@/lib/api/responses";
import { listContentRevisions } from "@/lib/services/cms/revisions";
import { listContentRevisionsSchema } from "@/lib/validation/cms";

/**
 * GET /api/content-revisions?contentType=&contentId=
 *
 * Staff-only version history for a single CMS-managed row, gated by the
 * write permission for its contentType (e.g. skill_domain -> cms.skill_domain.write).
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const parsed = listContentRevisionsSchema.safeParse({
    contentType: searchParams.get("contentType"),
    contentId: searchParams.get("contentId"),
  });
  if (!parsed.success) return validationError(parsed.error);

  try {
    const revisions = await listContentRevisions(
      { session, requestId },
      parsed.data.contentType,
      parsed.data.contentId,
    );
    return NextResponse.json({ revisions });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "cms",
      action: "revisions.read",
    });
  }
}
