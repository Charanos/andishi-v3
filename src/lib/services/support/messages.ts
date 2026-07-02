import { asc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { supportCases, supportMessages } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { createNotification } from "@/lib/services/support/notifications";
import type { CallerContext } from "@/lib/services/types";
import type { createSupportMessageSchema } from "@/lib/validation/support";

type CreateSupportMessageInput = z.infer<typeof createSupportMessageSchema>;

async function loadCaseForAccess(caseId: string) {
  const [existing] = await getDb()
    .select()
    .from(supportCases)
    .where(eq(supportCases.id, caseId))
    .limit(1);
  if (!existing) throw new NotFoundError("Support case not found.");
  return existing;
}

async function isStaffWithRead(ctx: CallerContext) {
  if (ctx.session.user.role !== "admin") return false;
  try {
    await authorize(ctx.session, "support.case.read");
    return true;
  } catch {
    return false;
  }
}

/** Staff see the full thread including internal notes; the requester sees only public messages. */
export async function listSupportMessages(ctx: CallerContext, caseId: string) {
  const supportCase = await loadCaseForAccess(caseId);
  const staff = await isStaffWithRead(ctx);
  if (!staff && supportCase.requesterUserId !== ctx.session.user.id) {
    throw new ForbiddenError("You can only view your own support cases.");
  }

  const rows = await getDb()
    .select()
    .from(supportMessages)
    .where(eq(supportMessages.caseId, caseId))
    .orderBy(asc(supportMessages.createdAt));

  return staff ? rows : rows.filter((m) => !m.internal);
}

export async function createSupportMessage(
  ctx: CallerContext,
  caseId: string,
  input: CreateSupportMessageInput,
) {
  const { session } = ctx;
  const supportCase = await loadCaseForAccess(caseId);
  const staff = await isStaffWithRead(ctx);
  const isRequester = supportCase.requesterUserId === session.user.id;

  if (!staff && !isRequester) {
    throw new ForbiddenError("You can only message your own support cases.");
  }
  if (staff) {
    await authorize(session, "support.message.write");
  }
  // Only staff can post internal notes - a requester's message is always client-visible.
  const internal = staff ? input.internal : false;

  return getDb().transaction(async (tx) => {
    const [message] = await tx
      .insert(supportMessages)
      .values({
        caseId,
        authorUserId: session.user.id,
        body: input.body,
        attachments: input.attachments,
        internal,
      })
      .returning();

    const updates: Partial<typeof supportCase> = { updatedAt: new Date() };
    // A new non-internal message reopens a resolved case.
    if (!internal && supportCase.status === "resolved") {
      updates.status = "open";
    }
    await tx.update(supportCases).set(updates).where(eq(supportCases.id, caseId));

    if (!internal) {
      const notifyUserId = staff ? supportCase.requesterUserId : supportCase.assigneeUserId;
      if (notifyUserId) {
        await createNotification(tx, {
          userId: notifyUserId,
          type: "support_case_reply",
          title: `New reply on "${supportCase.subject}"`,
          entityType: "support_case",
          entityId: supportCase.id,
        });
      }
    }

    return message;
  });
}
