import { desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { availabilityWindows } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type {
  createAvailabilityWindowSchema,
  updateAvailabilityWindowSchema,
} from "@/lib/validation/talent";

type CreateAvailabilityWindowInput = z.infer<typeof createAvailabilityWindowSchema>;
type UpdateAvailabilityWindowInput = z.infer<typeof updateAvailabilityWindowSchema>;

/** Staff (capacity planning) or the engineer themself may view their own windows. */
export async function listAvailabilityWindows(ctx: CallerContext, engineerId: string) {
  const { session } = ctx;
  const isSelf = session.user.role === "developer" && session.user.engineerId === engineerId;

  if (!isSelf) {
    if (session.user.role !== "admin")
      throw new ForbiddenError("You can only view your own availability.");
    await authorize(session, "talent.engineer.read");
  }

  return getDb()
    .select()
    .from(availabilityWindows)
    .where(eq(availabilityWindows.engineerId, engineerId))
    .orderBy(desc(availabilityWindows.startDate));
}

function assertCanWrite(ctx: CallerContext, engineerId: string) {
  const isSelf =
    ctx.session.user.role === "developer" && ctx.session.user.engineerId === engineerId;
  if (!isSelf && ctx.session.user.role !== "admin") {
    throw new ForbiddenError("You can only manage your own availability.");
  }
  return isSelf;
}

export async function createAvailabilityWindow(
  ctx: CallerContext,
  engineerId: string,
  input: CreateAvailabilityWindowInput,
) {
  const isSelf = assertCanWrite(ctx, engineerId);
  if (!isSelf) await authorize(ctx.session, "talent.availability.write");

  const [window] = await getDb()
    .insert(availabilityWindows)
    .values({ engineerId, ...input })
    .returning();

  return window;
}

export async function updateAvailabilityWindow(
  ctx: CallerContext,
  id: string,
  input: UpdateAvailabilityWindowInput,
) {
  const [existing] = await getDb()
    .select()
    .from(availabilityWindows)
    .where(eq(availabilityWindows.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Availability window not found.");

  const isSelf = assertCanWrite(ctx, existing.engineerId);
  if (!isSelf) await authorize(ctx.session, "talent.availability.write");

  const [updated] = await getDb()
    .update(availabilityWindows)
    .set(input)
    .where(eq(availabilityWindows.id, id))
    .returning();

  return updated;
}

export async function deleteAvailabilityWindow(ctx: CallerContext, id: string) {
  const [existing] = await getDb()
    .select()
    .from(availabilityWindows)
    .where(eq(availabilityWindows.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Availability window not found.");

  const isSelf = assertCanWrite(ctx, existing.engineerId);
  if (!isSelf) await authorize(ctx.session, "talent.availability.write");

  await getDb().delete(availabilityWindows).where(eq(availabilityWindows.id, id));
}
