import { and, desc, eq, ne } from "drizzle-orm";
import type { z } from "zod";
import type { DB } from "@/db";
import { getDb } from "@/db";
import { briefs, leads } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { findOrCreateGuestAccount } from "@/lib/services/crm/guest-accounts";
import type { CallerContext } from "@/lib/services/types";
import type {
  convertLeadToBriefSchema,
  createLeadSchema,
  intakeLeadSchema,
  updateLeadSchema,
} from "@/lib/validation/crm";

type IntakeLeadInput = z.infer<typeof intakeLeadSchema>;
type CreateLeadInput = z.infer<typeof createLeadSchema>;
type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
type ConvertLeadToBriefInput = z.infer<typeof convertLeadToBriefSchema>;

type Executor = Pick<DB, "insert" | "select" | "update">;

/**
 * The single write path for every public intake surface (/api/contact,
 * /api/general-inquiry, and any future form) to record an inbound
 * inquiry as a lead - not session-gated, since visitors submitting these
 * forms are unauthenticated. Fixes the gap where /api/contact and
 * /api/general-inquiry each had their own inconsistent, non-CRM way of
 * remembering an inquiry (see ADR-0007's flow map: lead is the first
 * stock in the funnel, before brief).
 *
 * Re-engagement handling: an open (not won/lost) lead for the same email
 * is updated in place rather than duplicated; a closed one gets a fresh
 * lead, since a new inquiry after a past win/loss is a new opportunity.
 */
export async function recordIntakeLead(input: IntakeLeadInput, tx?: Executor) {
  const db = tx ?? getDb();
  const email = input.email.toLowerCase();

  const [existingOpen] = await db
    .select()
    .from(leads)
    .where(and(eq(leads.email, email), ne(leads.status, "won"), ne(leads.status, "lost")))
    .orderBy(desc(leads.createdAt))
    .limit(1);

  if (existingOpen) {
    const [updated] = await db
      .update(leads)
      .set({
        message: input.message ?? existingOpen.message,
        phone: input.phone ?? existingOpen.phone,
        company: input.company ?? existingOpen.company,
        organizationId: input.organizationId ?? existingOpen.organizationId,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, existingOpen.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(leads)
    .values({
      source: input.source,
      name: input.name,
      email,
      company: input.company,
      phone: input.phone,
      message: input.message,
      intendedTrack: input.intendedTrack,
      serviceType: input.serviceType,
      briefType: input.briefType,
      utm: input.utm,
      organizationId: input.organizationId,
      status: "new",
    })
    .returning();

  return created;
}

function assertStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

export async function listLeads(
  ctx: CallerContext,
  filters: { status?: string; ownerUserId?: string } = {},
) {
  assertStaff(ctx, "Only Andishi staff can view leads.");
  await authorize(ctx.session, "crm.lead.read");

  const conditions = [];
  if (filters.status)
    conditions.push(eq(leads.status, filters.status as (typeof leads.status.enumValues)[number]));
  if (filters.ownerUserId) conditions.push(eq(leads.ownerUserId, filters.ownerUserId));

  const query = getDb().select().from(leads).orderBy(desc(leads.createdAt));
  return conditions.length ? query.where(and(...conditions)) : query;
}

export async function getLead(ctx: CallerContext, id: string) {
  assertStaff(ctx, "Only Andishi staff can view leads.");
  await authorize(ctx.session, "crm.lead.read");

  const [lead] = await getDb().select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!lead) throw new NotFoundError("Lead not found.");
  return lead;
}

/** Manual lead creation - a rep adding a lead from a phone call, event, or other offline channel. */
export async function createLead(ctx: CallerContext, input: CreateLeadInput) {
  assertStaff(ctx, "Only Andishi staff can create leads.");
  await authorize(ctx.session, "crm.lead.write");

  return getDb().transaction(async (tx) => {
    const [lead] = await tx
      .insert(leads)
      .values({ ...input, email: input.email.toLowerCase(), status: "new" })
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "crm.lead.write",
        resourceType: "lead",
        resourceId: lead.id,
        after: lead,
        requestId: ctx.requestId,
      },
      tx,
    );

    return lead;
  });
}

export async function updateLead(ctx: CallerContext, id: string, input: UpdateLeadInput) {
  assertStaff(ctx, "Only Andishi staff can edit leads.");
  await authorize(ctx.session, "crm.lead.write");

  const [existing] = await getDb().select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Lead not found.");

  if (input.status === "lost" && !input.lostReason && !existing.lostReason) {
    throw new ConflictError("A lost reason is required when marking a lead lost.");
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(leads)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "crm.lead.write",
        resourceType: "lead",
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

/**
 * The lead -> brief handoff (ADR-0007). Creates (or reuses, if the lead is
 * already linked to an org) the guest org/user and a real brief, then
 * marks the lead converted so the funnel stays traceable instead of
 * relying on fuzzy email/org matching.
 */
export async function convertLeadToBrief(
  ctx: CallerContext,
  id: string,
  input: ConvertLeadToBriefInput,
) {
  assertStaff(ctx, "Only Andishi staff can convert a lead.");
  await authorize(ctx.session, "crm.lead.write");
  await authorize(ctx.session, "crm.brief.write");

  const [lead] = await getDb().select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!lead) throw new NotFoundError("Lead not found.");
  if (lead.convertedToBriefId) throw new ConflictError("This lead has already been converted.");
  if (lead.status === "lost") throw new ConflictError("A lost lead cannot be converted.");

  return getDb().transaction(async (tx) => {
    const { organization, user } = await findOrCreateGuestAccount(
      { email: lead.email, name: lead.name, company: lead.company },
      tx,
    );

    const briefValues =
      lead.intendedTrack === "build"
        ? {
            organizationId: organization.id,
            submittedById: user.id,
            title: input.title,
            briefType: "build" as const,
            serviceType: input.serviceType,
            problemStatement: input.problemStatement ?? lead.message ?? "",
            projectBudget: input.projectBudget,
            projectTimeline: input.projectTimeline,
            status: "submitted" as const,
          }
        : {
            organizationId: organization.id,
            submittedById: user.id,
            title: input.title,
            briefType: "hire" as const,
            role: input.role,
            domain: input.domain,
            seniority: input.seniority,
            description: input.description ?? lead.message ?? "",
            status: "submitted" as const,
          };

    const [brief] = await tx.insert(briefs).values(briefValues).returning();

    const [updatedLead] = await tx
      .update(leads)
      .set({
        status: "qualified",
        organizationId: organization.id,
        convertedToBriefId: brief.id,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "crm.lead.write",
        resourceType: "lead",
        resourceId: updatedLead.id,
        before: lead,
        after: updatedLead,
        requestId: ctx.requestId,
      },
      tx,
    );

    return { lead: updatedLead, brief };
  });
}

export async function deleteLead(ctx: CallerContext, id: string) {
  assertStaff(ctx, "Only Andishi staff can delete leads.");
  await authorize(ctx.session, "crm.lead.delete");

  const [existing] = await getDb().select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!existing) throw new NotFoundError("Lead not found.");

  await getDb().transaction(async (tx) => {
    await tx.delete(leads).where(eq(leads.id, id));

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "crm.lead.delete",
        resourceType: "lead",
        resourceId: id,
        before: existing,
        requestId: ctx.requestId,
      },
      tx,
    );
  });
}
