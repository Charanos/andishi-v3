import { and, asc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { faqs } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { recordRevision } from "@/lib/services/cms/revisions";
import type { CallerContext } from "@/lib/services/types";
import type { createFaqSchema, updateFaqSchema } from "@/lib/validation/cms";

type CreateFaqInput = z.infer<typeof createFaqSchema>;
type UpdateFaqInput = z.infer<typeof updateFaqSchema>;

/** Public, unauthenticated: only published FAQs, optionally filtered to one section. */
export async function listPublicFaqs(filters: { section?: string } = {}) {
  const conditions = [eq(faqs.published, true)];
  if (filters.section) {
    conditions.push(eq(faqs.section, filters.section as (typeof faqs.section.enumValues)[number]));
  }

  return getDb()
    .select()
    .from(faqs)
    .where(and(...conditions))
    .orderBy(asc(faqs.order));
}

/** Staff management view - all FAQs regardless of publish state, gated by cms.faq.write. */
export async function listAllFaqs(ctx: CallerContext) {
  const { session } = ctx;
  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can manage FAQs.");
  }
  await authorize(session, "cms.faq.write");

  return getDb().select().from(faqs).orderBy(asc(faqs.section), asc(faqs.order));
}

export async function createFaq(ctx: CallerContext, input: CreateFaqInput) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can create FAQs.");
  }
  await authorize(session, "cms.faq.write");

  return getDb().transaction(async (tx) => {
    const [faq] = await tx.insert(faqs).values(input).returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "cms.faq.write",
        resourceType: "faq",
        resourceId: faq.id,
        after: faq,
        requestId,
      },
      tx,
    );
    await recordRevision(tx, {
      contentType: "faq",
      contentId: faq.id,
      snapshot: faq,
      editorUserId: session.user.id,
    });

    return faq;
  });
}

export async function updateFaq(ctx: CallerContext, id: string, input: UpdateFaqInput) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can edit FAQs.");
  }
  await authorize(session, "cms.faq.write");

  const [existing] = await getDb().select().from(faqs).where(eq(faqs.id, id)).limit(1);
  if (!existing) throw new NotFoundError("FAQ not found.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(faqs)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(faqs.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "cms.faq.write",
        resourceType: "faq",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId,
      },
      tx,
    );
    await recordRevision(tx, {
      contentType: "faq",
      contentId: updated.id,
      snapshot: updated,
      editorUserId: session.user.id,
    });

    return updated;
  });
}

export async function deleteFaq(ctx: CallerContext, id: string) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can delete FAQs.");
  }
  await authorize(session, "cms.faq.write");

  const [existing] = await getDb().select().from(faqs).where(eq(faqs.id, id)).limit(1);
  if (!existing) throw new NotFoundError("FAQ not found.");

  await getDb().transaction(async (tx) => {
    await tx.delete(faqs).where(eq(faqs.id, id));

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "cms.faq.write",
        resourceType: "faq",
        resourceId: id,
        before: existing,
        requestId,
      },
      tx,
    );
  });
}
