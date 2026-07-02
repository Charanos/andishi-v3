import { and, desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { supportCases, supportMessages } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { createNotification } from "@/lib/services/support/notifications";
import type { CallerContext } from "@/lib/services/types";
import type {
  assignSupportCaseSchema,
  createSupportCaseSchema,
  updateSupportCaseSchema,
} from "@/lib/validation/support";

type CreateSupportCaseInput = z.infer<typeof createSupportCaseSchema>;
type UpdateSupportCaseInput = z.infer<typeof updateSupportCaseSchema>;
type AssignSupportCaseInput = z.infer<typeof assignSupportCaseSchema>;

async function isStaffWithRead(ctx: CallerContext) {
  if (ctx.session.user.role !== "admin") return false;
  try {
    await authorize(ctx.session, "support.case.read");
    return true;
  } catch {
    return false;
  }
}

/** Staff (support.case.read) see every case; everyone else sees only their own. */
export async function listSupportCases(ctx: CallerContext, filters: { status?: string } = {}) {
  const staff = await isStaffWithRead(ctx);
  const conditions = staff ? [] : [eq(supportCases.requesterUserId, ctx.session.user.id)];
  if (filters.status) {
    conditions.push(
      eq(supportCases.status, filters.status as (typeof supportCases.status.enumValues)[number]),
    );
  }

  const query = getDb().select().from(supportCases).orderBy(desc(supportCases.createdAt));
  return conditions.length ? query.where(and(...conditions)) : query;
}

export async function getSupportCase(ctx: CallerContext, id: string) {
  const [existing] = await getDb()
    .select()
    .from(supportCases)
    .where(eq(supportCases.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Support case not found.");

  const staff = await isStaffWithRead(ctx);
  if (!staff && existing.requesterUserId !== ctx.session.user.id) {
    throw new ForbiddenError("You can only view your own support cases.");
  }

  return existing;
}

/** Any authenticated user can open a case for themselves - the opening message is required. */
export async function createSupportCase(ctx: CallerContext, input: CreateSupportCaseInput) {
  const { session, requestId, actorIp } = ctx;
  const { message, ...caseFields } = input;

  return getDb().transaction(async (tx) => {
    const [supportCase] = await tx
      .insert(supportCases)
      .values({ ...caseFields, requesterUserId: session.user.id })
      .returning();

    await tx.insert(supportMessages).values({
      caseId: supportCase.id,
      authorUserId: session.user.id,
      body: message,
      internal: false,
    });

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "support.case.write",
        resourceType: "support_case",
        resourceId: supportCase.id,
        after: supportCase,
        requestId,
      },
      tx,
    );

    return supportCase;
  });
}

export async function updateSupportCase(
  ctx: CallerContext,
  id: string,
  input: UpdateSupportCaseInput,
) {
  const { session, requestId, actorIp } = ctx;
  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can update a support case.");
  }
  await authorize(session, "support.case.write");

  const [existing] = await getDb()
    .select()
    .from(supportCases)
    .where(eq(supportCases.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Support case not found.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(supportCases)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(supportCases.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "support.case.write",
        resourceType: "support_case",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId,
      },
      tx,
    );

    if (input.status && input.status !== existing.status && input.status === "resolved") {
      await createNotification(tx, {
        userId: existing.requesterUserId,
        type: "support_case_resolved",
        title: `Your support case "${existing.subject}" was resolved`,
        entityType: "support_case",
        entityId: existing.id,
      });
    }

    return updated;
  });
}

export async function assignSupportCase(
  ctx: CallerContext,
  id: string,
  input: AssignSupportCaseInput,
) {
  const { session, requestId, actorIp } = ctx;
  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can assign a support case.");
  }
  await authorize(session, "support.case.assign");

  const [existing] = await getDb()
    .select()
    .from(supportCases)
    .where(eq(supportCases.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Support case not found.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(supportCases)
      .set({ assigneeUserId: input.assigneeUserId, updatedAt: new Date() })
      .where(eq(supportCases.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "support.case.assign",
        resourceType: "support_case",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId,
      },
      tx,
    );

    if (input.assigneeUserId) {
      await createNotification(tx, {
        userId: input.assigneeUserId,
        type: "support_case_assigned",
        title: `You were assigned to "${existing.subject}"`,
        entityType: "support_case",
        entityId: existing.id,
      });
    }

    return updated;
  });
}
