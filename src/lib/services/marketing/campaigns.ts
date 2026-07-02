import { desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { campaigns } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type { createCampaignSchema, updateCampaignSchema } from "@/lib/validation/marketing";

type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;

function assertStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

export async function listCampaigns(ctx: CallerContext, filters: { status?: string } = {}) {
  assertStaff(ctx, "Only Andishi staff can view campaigns.");
  await authorize(ctx.session, "marketing.campaign.read");

  const query = getDb().select().from(campaigns).orderBy(desc(campaigns.createdAt));
  if (filters.status) {
    return query.where(
      eq(campaigns.status, filters.status as (typeof campaigns.status.enumValues)[number]),
    );
  }
  return query;
}

export async function getCampaign(ctx: CallerContext, id: string) {
  assertStaff(ctx, "Only Andishi staff can view campaigns.");
  await authorize(ctx.session, "marketing.campaign.read");

  const [campaign] = await getDb().select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  if (!campaign) throw new NotFoundError("Campaign not found.");
  return campaign;
}

export async function createCampaign(ctx: CallerContext, input: CreateCampaignInput) {
  const { session, requestId, actorIp } = ctx;
  assertStaff(ctx, "Only Andishi staff can create campaigns.");
  await authorize(session, "marketing.campaign.write");

  return getDb().transaction(async (tx) => {
    const [campaign] = await tx
      .insert(campaigns)
      .values({ ...input, ownerUserId: input.ownerUserId ?? session.user.id })
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "marketing.campaign.write",
        resourceType: "campaign",
        resourceId: campaign.id,
        after: campaign,
        requestId,
      },
      tx,
    );

    return campaign;
  });
}

export async function updateCampaign(ctx: CallerContext, id: string, input: UpdateCampaignInput) {
  const { session, requestId, actorIp } = ctx;
  assertStaff(ctx, "Only Andishi staff can edit campaigns.");
  await authorize(session, "marketing.campaign.write");

  const [existing] = await getDb().select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Campaign not found.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(campaigns)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "marketing.campaign.write",
        resourceType: "campaign",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId,
      },
      tx,
    );

    return updated;
  });
}

export async function deleteCampaign(ctx: CallerContext, id: string) {
  const { session, requestId, actorIp } = ctx;
  assertStaff(ctx, "Only Andishi staff can delete campaigns.");
  await authorize(session, "marketing.campaign.write");

  const [existing] = await getDb().select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Campaign not found.");
  // Deleting a campaign cascades its campaign_metrics history - fine for a
  // draft created by mistake, destructive for anything that actually ran.
  // Anything past draft should be archived (status transition) instead.
  if (existing.status !== "draft") {
    throw new ConflictError("Only draft campaigns can be deleted - archive it instead.");
  }

  await getDb().transaction(async (tx) => {
    await tx.delete(campaigns).where(eq(campaigns.id, id));

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "marketing.campaign.write",
        resourceType: "campaign",
        resourceId: id,
        before: existing,
        requestId,
      },
      tx,
    );
  });
}
