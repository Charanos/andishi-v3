import { and, desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { jobOpenings } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import type { CallerContext } from "@/lib/services/types";
import type { createJobOpeningSchema, updateJobOpeningSchema } from "@/lib/validation/careers";

type CreateJobOpeningInput = z.infer<typeof createJobOpeningSchema>;
type UpdateJobOpeningInput = z.infer<typeof updateJobOpeningSchema>;

/** Public, unauthenticated: only published (status=open) openings. */
export async function listPublicOpenings(
  filters: { kind?: "freelance" | "internal" | "outsourced" } = {},
) {
  const conditions = [eq(jobOpenings.status, "open")];
  if (filters.kind) conditions.push(eq(jobOpenings.kind, filters.kind));

  return getDb()
    .select()
    .from(jobOpenings)
    .where(and(...conditions))
    .orderBy(desc(jobOpenings.publishedAt));
}

/** Public detail lookup - 404s (not 403) for draft/closed openings so their existence isn't leaked. */
export async function getPublicOpeningBySlug(slug: string) {
  const [opening] = await getDb()
    .select()
    .from(jobOpenings)
    .where(and(eq(jobOpenings.slug, slug), eq(jobOpenings.status, "open")))
    .limit(1);

  if (!opening) throw new NotFoundError("This opening is no longer available.");
  return opening;
}

/** Staff management view - all openings regardless of status. */
export async function listAllOpenings(ctx: CallerContext) {
  const { session } = ctx;
  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can manage job openings.");
  }
  await authorize(session, "careers.job.read");

  return getDb().select().from(jobOpenings).orderBy(desc(jobOpenings.createdAt));
}

export async function createJobOpening(ctx: CallerContext, input: CreateJobOpeningInput) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can create job openings.");
  }
  await authorize(session, "careers.job.write");

  return getDb().transaction(async (tx) => {
    const [opening] = await tx.insert(jobOpenings).values(input).returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "careers.job.write",
        resourceType: "job_opening",
        resourceId: opening.id,
        after: opening,
        requestId,
      },
      tx,
    );

    return opening;
  });
}

export async function updateJobOpening(
  ctx: CallerContext,
  id: string,
  input: UpdateJobOpeningInput,
) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can edit job openings.");
  }
  await authorize(session, "careers.job.write");

  const [existing] = await getDb()
    .select()
    .from(jobOpenings)
    .where(eq(jobOpenings.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Job opening not found.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(jobOpenings)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(jobOpenings.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "careers.job.write",
        resourceType: "job_opening",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId,
      },
      tx,
    );

    return updated;
  });
}

async function transitionOpeningStatus(ctx: CallerContext, id: string, status: "open" | "closed") {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can publish or close job openings.");
  }
  await authorize(session, "careers.job.publish");

  const [existing] = await getDb()
    .select()
    .from(jobOpenings)
    .where(eq(jobOpenings.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Job opening not found.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(jobOpenings)
      .set({
        status,
        publishedAt: status === "open" ? new Date() : existing.publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(jobOpenings.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "careers.job.publish",
        resourceType: "job_opening",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId,
      },
      tx,
    );

    return updated;
  });
}

export const publishJobOpening = (ctx: CallerContext, id: string) =>
  transitionOpeningStatus(ctx, id, "open");
export const closeJobOpening = (ctx: CallerContext, id: string) =>
  transitionOpeningStatus(ctx, id, "closed");
