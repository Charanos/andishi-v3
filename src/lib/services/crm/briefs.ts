import { and, desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { briefs } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { DomainValidationError, ForbiddenError } from "@/lib/authz/errors";
import type { createBriefSchema } from "@/lib/validation/entities";
import type { CallerContext } from "@/lib/services/types";
import { emitActivityEvent } from "@/lib/services/activity";

type CreateBriefInput = z.infer<typeof createBriefSchema>;

export interface ListBriefsFilters {
  briefType?: "build" | "hire";
}

/**
 * Admin (staff): sees all briefs, gated by crm.brief.read.
 * Client: sees only their own organization's briefs (ownership scope, not
 * a permission check - see ADR-0001).
 * Developer: no access to briefs at all.
 */
export async function listBriefs(ctx: CallerContext, filters: ListBriefsFilters) {
  const { session } = ctx;

  if (session.user.role === "developer") {
    throw new ForbiddenError("Developers do not have access to briefs.");
  }

  if (session.user.role === "admin") {
    await authorize(session, "crm.brief.read");
  }

  const conditions = [];

  if (session.user.role === "client") {
    if (!session.user.organizationId) return [];
    conditions.push(eq(briefs.organizationId, session.user.organizationId));
  }

  if (filters.briefType) {
    conditions.push(eq(briefs.briefType, filters.briefType));
  }

  return getDb()
    .select()
    .from(briefs)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(briefs.createdAt));
}

export async function createBrief(ctx: CallerContext, input: CreateBriefInput) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role === "developer") {
    throw new ForbiddenError("Developers do not have access to briefs.");
  }

  if (session.user.role === "admin") {
    await authorize(session, "crm.brief.write");
  }

  const organizationId =
    session.user.role === "admin" ? input.organizationId : session.user.organizationId;
  const submittedById = session.user.role === "admin" ? input.submittedById : session.user.id;

  if (!organizationId || !submittedById) {
    throw new DomainValidationError("organizationId and submittedById are required.");
  }

  return getDb().transaction(async (tx) => {
    const [brief] = await tx
      .insert(briefs)
      .values({ ...input, organizationId, submittedById })
      .returning();

    await emitActivityEvent(
      {
        type: brief.briefType === "build" ? "brief_build_submitted" : "brief_hire_submitted",
        actorId: session.user.id,
        actorRole: session.user.role,
        organizationId: brief.organizationId,
        entityType: "brief",
        entityId: brief.id,
        description: `${brief.briefType === "build" ? "Build" : "Hire"} brief "${brief.title}" submitted`,
        // Owning client org, plus any staff who can act on a brief
        // (sales_manager owns intake, delivery_pm and support_agent need
        // visibility) - not a blanket "admin" broadcast.
        visibleTo: ["client", "crm.brief.read"],
      },
      tx,
    );

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: session.user.role === "admin" ? "crm.brief.write" : "crm.brief.write.self_service",
        resourceType: "brief",
        resourceId: brief.id,
        after: brief,
        requestId,
      },
      tx,
    );

    return brief;
  });
}
