import { and, desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { applicationEvents, applications, engineers, jobOpenings } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { sendInviteEmail } from "@/lib/email";
import { emitActivityEvent } from "@/lib/services/activity";
import { buildActivationUrl, provisionUserAccount } from "@/lib/services/identity/provisioning";
import type { CallerContext } from "@/lib/services/types";
import type {
  createApplicationSchema,
  hireApplicationSchema,
  updateApplicationRatingSchema,
  updateApplicationStageSchema,
} from "@/lib/validation/careers";

type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
type UpdateApplicationStageInput = z.infer<typeof updateApplicationStageSchema>;
type UpdateApplicationRatingInput = z.infer<typeof updateApplicationRatingSchema>;
type HireApplicationInput = z.infer<typeof hireApplicationSchema>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

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

/**
 * Converts a hired application into a real engineer-network member -
 * provisioning login access (if this is a brand-new candidate) and
 * creating their engineers row, so they're immediately available to be
 * matched to a brief through the existing match/placement pipeline.
 * "Direct" placement (an admin picking an already-onboarded engineer with
 * no careers application involved) needs none of this - it already works
 * today via POST /api/matches + POST /api/placements against an existing
 * engineer.
 */
export async function hireApplication(
  ctx: CallerContext,
  applicationId: string,
  input: HireApplicationInput,
) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can hire an application.");
  }
  await authorize(session, "careers.application.write");

  const [application] = await getDb()
    .select()
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);
  if (!application) throw new NotFoundError("Application not found.");
  if (application.stage === "rejected") {
    throw new ConflictError("A rejected application can't be hired.");
  }
  if (application.stage === "hired" && application.engineerId) {
    throw new ConflictError("This application has already been hired.");
  }

  return getDb().transaction(async (tx) => {
    let engineerId = application.engineerId;
    let activation: { email: string; role: string; token: string | null } | null = null;

    if (!engineerId) {
      const { user, token } = await provisionUserAccount(tx, {
        email: application.applicantEmail,
        name: application.applicantName,
        role: "developer",
      });

      const baseSlug = slugify(application.applicantName);
      let slug = baseSlug;
      let attempt = 1;
      while (
        (
          await tx
            .select({ id: engineers.id })
            .from(engineers)
            .where(eq(engineers.slug, slug))
            .limit(1)
        ).length > 0
      ) {
        attempt += 1;
        slug = `${baseSlug}-${attempt}`;
      }

      const [engineer] = await tx
        .insert(engineers)
        .values({
          userId: user.id,
          slug,
          name: application.applicantName,
          role: input.role,
          domain: input.domain,
          domainLabel: input.domainLabel,
          avatar: input.avatar || application.applicantName.slice(0, 2).toUpperCase(),
          avatarColor: input.avatarColor,
          location: input.location,
          timezone: input.timezone,
          portfolioUrl: application.links?.portfolio,
          githubUrl: application.links?.github,
          linkedinUrl: application.links?.linkedin,
          supplySource: "careers",
          isPublic: false,
          verified: false,
        })
        .returning();

      engineerId = engineer.id;
      activation = { email: user.email, role: user.role, token };
    }

    const [updated] = await tx
      .update(applications)
      .set({ stage: "hired", engineerId, updatedAt: new Date() })
      .where(eq(applications.id, applicationId))
      .returning();

    await tx.insert(applicationEvents).values({
      applicationId,
      type: "status_change",
      note: "Hired - added to the engineer network",
      userId: session.user.id,
    });

    await emitActivityEvent(
      {
        type: "application_hired",
        actorId: session.user.id,
        actorRole: session.user.role,
        entityType: "engineer",
        entityId: engineerId,
        description: `${updated.applicantName} was hired and added to the engineer network`,
        visibleTo: ["careers.application.read", "talent.engineer.read"],
      },
      tx,
    );

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "careers.application.write",
        resourceType: "application",
        resourceId: applicationId,
        before: application,
        after: updated,
        requestId,
      },
      tx,
    );

    if (activation?.token) {
      const { email, role, token } = activation;
      sendInviteEmail(email, session.user.name, role, buildActivationUrl(token)).catch((error) => {
        console.error("[hireApplication] Failed to send invite email:", error);
      });
    }

    return updated;
  });
}
