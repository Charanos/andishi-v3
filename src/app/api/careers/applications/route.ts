import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { listApplications } from "@/lib/services/careers/applications";

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
