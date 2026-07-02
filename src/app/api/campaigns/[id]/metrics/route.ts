import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  generateRequestId,
  handleRouteError,
  jsonError,
  parseJson,
  validationError,
} from "@/lib/api/responses";
import {
  listCampaignMetrics,
  recordCampaignMetric,
} from "@/lib/services/marketing/campaign-metrics";
import { recordCampaignMetricSchema } from "@/lib/validation/marketing";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  try {
    const metrics = await listCampaignMetrics({ session, requestId }, id);
    return NextResponse.json({ metrics });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "marketing",
      action: "campaign_metrics.read",
    });
  }
}

/** Upserts one day's metrics - the ingestion endpoint for GA4/manual entry. */
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const parsed = recordCampaignMetricSchema.safeParse(await parseJson(req));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const metric = await recordCampaignMetric({ session, requestId }, id, parsed.data);
    return NextResponse.json({ metric }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, {
      requestId,
      actorUserId: session.user.id,
      module: "marketing",
      action: "campaign_metrics.write",
    });
  }
}
