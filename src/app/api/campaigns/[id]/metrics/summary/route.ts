import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateRequestId, handleRouteError, jsonError } from "@/lib/api/responses";
import { getCampaignMetricsSummary } from "@/lib/services/marketing/campaign-metrics";

/** GET /api/campaigns/[id]/metrics/summary - aggregate impressions/clicks/conversions/spend (ROI view). */
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  try {
    const summary = await getCampaignMetricsSummary({ session, requestId }, id);
    return NextResponse.json({ summary });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "marketing",
      action: "campaign_metrics.read",
    });
  }
}
