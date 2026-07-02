import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { settings } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ForbiddenError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";

function assertStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

export async function listSettings(ctx: CallerContext) {
  assertStaff(ctx, "Only Andishi staff can view platform settings.");
  await authorize(ctx.session, "platform.settings.read");

  return getDb().select().from(settings).orderBy(settings.key);
}

/** Upsert - settings are set by key, not created via a separate "new setting" flow. */
export async function setSetting(ctx: CallerContext, key: string, value: unknown) {
  assertStaff(ctx, "Only Andishi staff can change platform settings.");
  await authorize(ctx.session, "platform.settings.write");

  const [existing] = await getDb().select().from(settings).where(eq(settings.key, key)).limit(1);

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .insert(settings)
      .values({ key, value, updatedBy: ctx.session.user.id })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedBy: ctx.session.user.id, updatedAt: new Date() },
      })
      .returning();

    await writeAudit(
      {
        actorUserId: ctx.session.user.id,
        actorIp: ctx.actorIp,
        action: "platform.settings.write",
        resourceType: "setting",
        resourceId: null,
        before: existing ? { key: existing.key, value: existing.value } : null,
        after: { key: updated.key, value: updated.value },
        requestId: ctx.requestId,
      },
      tx,
    );

    return updated;
  });
}
