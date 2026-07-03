import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { listProjectReviews } from "@/lib/services/delivery/project-reviews";

/** GET /api/projects/reviews - staff-wide client satisfaction overview. */
export async function GET() {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const reviews = await listProjectReviews({ session, requestId });
    return NextResponse.json({ reviews });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "delivery",
      action: "project.read",
    });
  }
}
