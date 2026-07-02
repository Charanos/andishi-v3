import { desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type { subscribeNewsletterSchema } from "@/lib/validation/marketing";

type SubscribeInput = z.infer<typeof subscribeNewsletterSchema>;

/**
 * Public, unauthenticated: idempotent subscribe. Re-subscribing an
 * unsubscribed email flips it back to subscribed rather than erroring - a
 * visitor re-submitting the form shouldn't see a "you're already on this
 * list" dead end. Same public-write shape as crm/leads.ts's recordIntakeLead
 * (no CallerContext, no audit - there's no staff actor to attribute).
 */
export async function subscribeToNewsletter(input: SubscribeInput) {
  const db = getDb();

  const [existing] = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, input.email))
    .limit(1);

  if (existing) {
    if (existing.status === "subscribed") return existing;

    const [resubscribed] = await db
      .update(newsletterSubscribers)
      .set({ status: "subscribed", unsubscribedAt: null, source: input.source ?? existing.source })
      .where(eq(newsletterSubscribers.id, existing.id))
      .returning();
    return resubscribed;
  }

  const [created] = await db
    .insert(newsletterSubscribers)
    .values({ email: input.email, source: input.source })
    .returning();
  return created;
}

/** Public, unauthenticated: one-click unsubscribe (e.g. from an email footer link). */
export async function unsubscribeFromNewsletter(email: string) {
  const db = getDb();
  const normalized = email.toLowerCase();

  const [existing] = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, normalized))
    .limit(1);
  if (!existing) throw new NotFoundError("Subscriber not found.");

  const [updated] = await db
    .update(newsletterSubscribers)
    .set({ status: "unsubscribed", unsubscribedAt: new Date() })
    .where(eq(newsletterSubscribers.id, existing.id))
    .returning();
  return updated;
}

/** Staff management view, gated by marketing.newsletter.read. */
export async function listNewsletterSubscribers(
  ctx: CallerContext,
  filters: { status?: string } = {},
) {
  const { session } = ctx;
  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can view newsletter subscribers.");
  }
  await authorize(session, "marketing.newsletter.read");

  const query = getDb()
    .select()
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.subscribedAt));
  if (filters.status) {
    return query.where(
      eq(
        newsletterSubscribers.status,
        filters.status as (typeof newsletterSubscribers.status.enumValues)[number],
      ),
    );
  }
  return query;
}
