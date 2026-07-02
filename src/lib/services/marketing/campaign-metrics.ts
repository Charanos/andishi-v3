import { and, asc, eq, sql } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { campaignMetrics, campaigns } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type { recordCampaignMetricSchema } from "@/lib/validation/marketing";

type RecordCampaignMetricInput = z.infer<typeof recordCampaignMetricSchema>;

function assertStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

/** Governed by the parent campaign's own permissions - same pattern as crm/deal-activities.ts. */
export async function listCampaignMetrics(ctx: CallerContext, campaignId: string) {
  assertStaff(ctx, "Only Andishi staff can view campaign metrics.");
  await authorize(ctx.session, "marketing.campaign.read");

  return getDb()
    .select()
    .from(campaignMetrics)
    .where(eq(campaignMetrics.campaignId, campaignId))
    .orderBy(asc(campaignMetrics.date));
}

/** Upserts one day's metrics for a campaign - GA4 exports/backfills can safely re-run. */
export async function recordCampaignMetric(
  ctx: CallerContext,
  campaignId: string,
  input: RecordCampaignMetricInput,
) {
  assertStaff(ctx, "Only Andishi staff can record campaign metrics.");
  await authorize(ctx.session, "marketing.campaign.write");

  const [campaign] = await getDb()
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);
  if (!campaign) throw new NotFoundError("Campaign not found.");

  const [metric] = await getDb()
    .insert(campaignMetrics)
    .values({ campaignId, ...input })
    .onConflictDoUpdate({
      target: [campaignMetrics.campaignId, campaignMetrics.date],
      set: {
        impressions: input.impressions,
        clicks: input.clicks,
        conversions: input.conversions,
        spendCents: input.spendCents,
      },
    })
    .returning();

  return metric;
}

/** Aggregate totals across a campaign's full metrics history - the ROI summary. */
export async function getCampaignMetricsSummary(ctx: CallerContext, campaignId: string) {
  assertStaff(ctx, "Only Andishi staff can view campaign metrics.");
  await authorize(ctx.session, "marketing.campaign.read");

  const [summary] = await getDb()
    .select({
      impressions: sql<number>`coalesce(sum(${campaignMetrics.impressions}), 0)`,
      clicks: sql<number>`coalesce(sum(${campaignMetrics.clicks}), 0)`,
      conversions: sql<number>`coalesce(sum(${campaignMetrics.conversions}), 0)`,
      spendCents: sql<number>`coalesce(sum(${campaignMetrics.spendCents}), 0)`,
    })
    .from(campaignMetrics)
    .where(and(eq(campaignMetrics.campaignId, campaignId)));

  return summary;
}
