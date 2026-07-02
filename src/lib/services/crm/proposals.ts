import { eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { deals, proposals } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type { createProposalSchema, updateProposalSchema } from "@/lib/validation/crm";

type CreateProposalInput = z.infer<typeof createProposalSchema>;
type UpdateProposalInput = z.infer<typeof updateProposalSchema>;

function assertStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

// Stages a proposal being sent should only advance a deal out of, never
// regress from - a revised proposal sent mid-negotiation shouldn't bump
// the deal backward to "proposal_sent".
const STAGES_ADVANCED_BY_SENDING = new Set(["qualification", "scoping"]);

export async function listProposals(ctx: CallerContext, dealId: string) {
  assertStaff(ctx, "Only Andishi staff can view proposals.");
  await authorize(ctx.session, "crm.proposal.read");

  return getDb().select().from(proposals).where(eq(proposals.dealId, dealId));
}

export async function createProposal(ctx: CallerContext, input: CreateProposalInput) {
  assertStaff(ctx, "Only Andishi staff can draft proposals.");
  await authorize(ctx.session, "crm.proposal.write");

  const [deal] = await getDb().select().from(deals).where(eq(deals.id, input.dealId)).limit(1);
  if (!deal) throw new NotFoundError("Deal not found.");
  if (deal.stage === "won" || deal.stage === "lost") {
    throw new ConflictError("Cannot draft a proposal for a closed deal.");
  }

  return getDb().transaction(async (tx) => {
    const [proposal] = await tx.insert(proposals).values(input).returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "crm.proposal.write",
        resourceType: "proposal",
        resourceId: proposal.id,
        after: proposal,
        requestId: ctx.requestId,
      },
      tx,
    );

    return proposal;
  });
}

export async function updateProposal(ctx: CallerContext, id: string, input: UpdateProposalInput) {
  assertStaff(ctx, "Only Andishi staff can edit proposals.");
  await authorize(ctx.session, "crm.proposal.write");

  const [existing] = await getDb().select().from(proposals).where(eq(proposals.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Proposal not found.");
  if (existing.status !== "draft") {
    throw new ConflictError("Only a draft proposal can be edited.");
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(proposals)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(proposals.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "crm.proposal.write",
        resourceType: "proposal",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId: ctx.requestId,
      },
      tx,
    );

    return updated;
  });
}

/** Sends a draft proposal - advances the parent deal to "proposal_sent" unless it's already further along. */
export async function sendProposal(ctx: CallerContext, id: string) {
  assertStaff(ctx, "Only Andishi staff can send proposals.");
  await authorize(ctx.session, "crm.proposal.write");

  const [existing] = await getDb().select().from(proposals).where(eq(proposals.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Proposal not found.");
  if (existing.status !== "draft") throw new ConflictError("Only a draft proposal can be sent.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(proposals)
      .set({ status: "sent", sentAt: new Date(), updatedAt: new Date() })
      .where(eq(proposals.id, id))
      .returning();

    const [deal] = await tx.select().from(deals).where(eq(deals.id, existing.dealId)).limit(1);
    if (deal && STAGES_ADVANCED_BY_SENDING.has(deal.stage)) {
      await tx
        .update(deals)
        .set({ stage: "proposal_sent", updatedAt: new Date() })
        .where(eq(deals.id, deal.id));
    }

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "crm.proposal.write",
        resourceType: "proposal",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId: ctx.requestId,
      },
      tx,
    );

    return updated;
  });
}

/** Accepting a proposal wins its deal; rejecting leaves the deal's stage to a human's judgment (a revision may follow). */
export async function decideProposal(
  ctx: CallerContext,
  id: string,
  decision: "accepted" | "rejected",
) {
  assertStaff(ctx, "Only Andishi staff can decide a proposal's outcome.");
  await authorize(ctx.session, "crm.proposal.write");

  const [existing] = await getDb().select().from(proposals).where(eq(proposals.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Proposal not found.");
  if (existing.status !== "sent") {
    throw new ConflictError("Only a sent proposal can be accepted or rejected.");
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(proposals)
      .set({ status: decision, decidedAt: new Date(), updatedAt: new Date() })
      .where(eq(proposals.id, id))
      .returning();

    if (decision === "accepted") {
      await tx
        .update(deals)
        .set({ stage: "won", updatedAt: new Date() })
        .where(eq(deals.id, existing.dealId));
    }

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "crm.proposal.write",
        resourceType: "proposal",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId: ctx.requestId,
      },
      tx,
    );

    return updated;
  });
}
