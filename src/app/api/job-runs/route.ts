import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { listJobRuns } from "@/lib/services/platform/job-runs";

export async function GET() {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const result = await listJobRuns({ session, requestId });
    return NextResponse.json({ jobRuns: result });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "platform",
      action: "job.read",
    });
  }
}
