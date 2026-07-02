import { and, desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { applicationEvents, applications, jobOpenings } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { emitActivityEvent } from "@/lib/services/activity";
import type { CallerContext } from "@/lib/services/types";
import type {
  createApplicationSchema,
  updateApplicationRatingSchema,
  updateApplicationStageSchema,
} from "@/lib/validation/careers";

type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
type UpdateApplicationStageInput = z.infer<typeof updateApplicationStageSchema>;
type UpdateApplicationRatingInput = z.infer<typeof updateApplicationRatingSchema>;

/**
 * Public, unauthenticated - the careers "apply" form. Rate-limited at the
 * route level (ADR-0008). Validates the opening is actually open before
 * accepting an application against it, and logs the initial system event.
 */
export async function submitApplication(input: CreateApplicationInput) {
  const [opening] = await getDb()
    .select()
    .from(jobOpenings)
    .where(and(eq(jobOpenings.id, input.jobOpeningId), eq(jobOpenings.status, "open")))
    .limit(1);

  if (!opening) throw new NotFoundError("This opening is no longer accepting applications.");

  return getDb().transaction(async (tx) => {
    const [application] = await tx.insert(applications).values(input).returning();

    await tx.insert(applicationEvents).values({
      applicationId: application.id,
      type: "status_change",
      note: "Application submitted via the careers portal",
      userId: null,
    });

    await emitActivityEvent(
      {
        type: "application_submitted",
        entityType: "application",
        entityId: application.id,
        description: `${application.applicantName} applied for "${opening.title}"`,
        visibleTo: ["careers.application.read"],
      },
      tx,
    );

    return application;
  });
}

/** Staff-only application queue, optionally filtered by opening or stage. */
export async function listApplications(
  ctx: CallerContext,
  filters: { jobOpeningId?: string; stage?: string } = {},
) {
  const { session } = ctx;
  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can view applications.");
  }
  await authorize(session, "careers.application.read");

  const conditions = [];
  if (filters.jobOpeningId) conditions.push(eq(applications.jobOpeningId, filters.jobOpeningId));
  if (filters.stage) {
    conditions.push(
      eq(applications.stage, filters.stage as (typeof applications.$inferSelect)["stage"]),
    );
  }

  return getDb()
    .select()
    .from(applications)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(applications.createdAt));
}

export async function getApplication(ctx: CallerContext, id: string) {
  const { session } = ctx;
  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can view applications.");
  }
  await authorize(session, "careers.application.read");

  const [application] = await getDb()
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);
  if (!application) throw new NotFoundError("Application not found.");

  const events = await getDb()
    .select()
    .from(applicationEvents)
    .where(eq(applicationEvents.applicationId, id))
    .orderBy(desc(applicationEvents.occurredAt));

  return { application, events };
}

export async function updateApplicationStage(
  ctx: CallerContext,
  id: string,
  input: UpdateApplicationStageInput,
) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can progress applications.");
  }
  await authorize(session, "careers.application.write");

  const [existing] = await getDb()
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Application not found.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(applications)
      .set({ stage: input.stage, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();

    await tx.insert(applicationEvents).values({
      applicationId: id,
      type: "status_change",
      note: input.note ?? `Moved from ${existing.stage} to ${input.stage}`,
      userId: session.user.id,
    });

    await emitActivityEvent(
      {
        type: "application_stage_changed",
        actorId: session.user.id,
        actorRole: session.user.role,
        entityType: "application",
        entityId: id,
        description: `${updated.applicantName} moved to ${input.stage}`,
        visibleTo: ["careers.application.read"],
      },
      tx,
    );

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "careers.application.write",
        resourceType: "application",
        resourceId: id,
        before: existing,
        after: updated,
        requestId,
      },
      tx,
    );

    return updated;
  });
}

export async function updateApplicationRating(
  ctx: CallerContext,
  id: string,
  input: UpdateApplicationRatingInput,
) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can rate applications.");
  }
  await authorize(session, "careers.application.write");

  const [existing] = await getDb()
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Application not found.");

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(applications)
      .set({ rating: input.rating, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();

    await tx.insert(applicationEvents).values({
      applicationId: id,
      type: "rating_assigned",
      note: `Rated ${input.rating} stars`,
      userId: session.user.id,
    });

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "careers.application.write",
        resourceType: "application",
        resourceId: id,
        before: existing,
        after: updated,
        requestId,
      },
      tx,
    );

    return updated;
  });
}
