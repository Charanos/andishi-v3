import type { DB } from "@/db";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { notificationPrefs, notifications } from "@/db/schema";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";

/** Either the top-level DB client or a transaction handle - see lib/authz/audit.ts. */
type Executor = Pick<DB, "insert">;

/**
 * Internal creation path - not exposed as a public/staff write API.
 * Other services call this directly to notify a user of something relevant
 * (a support reply, an invoice event, etc). There is no cross-user "create
 * a notification for anyone" surface; notifications only ever originate
 * from real domain events.
 */
export async function createNotification(
  tx: Executor,
  params: {
    userId: string;
    type: string;
    title: string;
    body?: string | null;
    entityType?: string | null;
    entityId?: string | null;
  },
) {
  const [notification] = await tx.insert(notifications).values(params).returning();
  return notification;
}

/** Self-scoped: a user can only ever list their own notifications. */
export async function listNotifications(
  ctx: CallerContext,
  filters: { unreadOnly?: boolean } = {},
) {
  const conditions = [eq(notifications.userId, ctx.session.user.id)];
  if (filters.unreadOnly) conditions.push(isNull(notifications.readAt));

  return getDb()
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationRead(ctx: CallerContext, id: string) {
  const [existing] = await getDb()
    .select()
    .from(notifications)
    .where(eq(notifications.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Notification not found.");
  if (existing.userId !== ctx.session.user.id) {
    throw new ForbiddenError("You can only manage your own notifications.");
  }
  if (existing.readAt) return existing;

  const [updated] = await getDb()
    .update(notifications)
    .set({ readAt: new Date() })
    .where(eq(notifications.id, id))
    .returning();
  return updated;
}

export async function markAllNotificationsRead(ctx: CallerContext) {
  await getDb()
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, ctx.session.user.id), isNull(notifications.readAt)));
}

/** Self-scoped notification preferences. */
export async function listNotificationPrefs(ctx: CallerContext) {
  return getDb()
    .select()
    .from(notificationPrefs)
    .where(eq(notificationPrefs.userId, ctx.session.user.id));
}

export async function setNotificationPref(
  ctx: CallerContext,
  input: { channel: "email" | "in_app" | "sms"; eventType: string; enabled: boolean },
) {
  const [pref] = await getDb()
    .insert(notificationPrefs)
    .values({ userId: ctx.session.user.id, ...input })
    .onConflictDoUpdate({
      target: [notificationPrefs.userId, notificationPrefs.channel, notificationPrefs.eventType],
      set: { enabled: input.enabled },
    })
    .returning();
  return pref;
}
