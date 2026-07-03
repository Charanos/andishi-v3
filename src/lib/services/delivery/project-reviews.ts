import { desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { projectReviews, projects, users } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { emitActivityEvent } from "@/lib/services/activity";
import { createNotification } from "@/lib/services/support/notifications";
import type { CallerContext } from "@/lib/services/types";
import type { submitProjectReviewSchema } from "@/lib/validation/delivery";

type SubmitProjectReviewInput = z.infer<typeof submitProjectReviewSchema>;

/**
 * Staff-only project completion transition. Distinct from the generic
 * PATCH /api/projects/[id] status field because this is the one status
 * change with a real side effect: it opens the door for the client to
 * submit a private satisfaction review (submitProjectReview below rejects
 * reviews on any project that isn't yet "completed").
 */
export async function markProjectCompleted(ctx: CallerContext, projectId: string) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can mark a project completed.");
  }
  await authorize(session, "delivery.project.write");

  const [existing] = await getDb()
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!existing) throw new NotFoundError("Project not found.");
  if (existing.status === "completed") {
    throw new ConflictError("This project is already marked completed.");
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(projects)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(projects.id, projectId))
      .returning();

    await emitActivityEvent(
      {
        type: "project_completed",
        actorId: session.user.id,
        actorRole: session.user.role,
        organizationId: updated.organizationId,
        entityType: "project",
        entityId: updated.id,
        description: `"${updated.title}" was marked completed`,
        visibleTo: ["client", "delivery.project.read"],
      },
      tx,
    );

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.project.write",
        resourceType: "project",
        resourceId: updated.id,
        before: existing,
        after: updated,
        requestId,
      },
      tx,
    );

    const clientUsers = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.organizationId, updated.organizationId));
    for (const clientUser of clientUsers) {
      await createNotification(tx, {
        userId: clientUser.id,
        type: "project_completed",
        title: `"${updated.title}" is complete - share your feedback`,
        entityType: "project",
        entityId: updated.id,
      });
    }

    return updated;
  });
}

/** Self-scoped: only a client belonging to the project's organization may review it. */
export async function submitProjectReview(
  ctx: CallerContext,
  projectId: string,
  input: SubmitProjectReviewInput,
) {
  const { session } = ctx;

  const [project] = await getDb()
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!project) throw new NotFoundError("Project not found.");

  if (session.user.role !== "client" || session.user.organizationId !== project.organizationId) {
    throw new ForbiddenError("Only that project's client can submit a review.");
  }
  if (project.status !== "completed") {
    throw new ConflictError("Reviews can only be submitted once a project is marked completed.");
  }

  return getDb().transaction(async (tx) => {
    const [review] = await tx
      .insert(projectReviews)
      .values({ projectId, submittedByUserId: session.user.id, ...input })
      .onConflictDoUpdate({
        target: projectReviews.projectId,
        set: {
          submittedByUserId: session.user.id,
          rating: input.rating,
          feedback: input.feedback,
          wouldRecommend: input.wouldRecommend,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (project.leadPmUserId) {
      await createNotification(tx, {
        userId: project.leadPmUserId,
        type: "project_review_submitted",
        title: `Client feedback received for "${project.title}"`,
        entityType: "project",
        entityId: project.id,
      });
    }

    return review;
  });
}

/** Staff or the reviewing client's own organization may view a project's review. */
export async function getProjectReview(ctx: CallerContext, projectId: string) {
  const { session } = ctx;

  const [project] = await getDb()
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!project) throw new NotFoundError("Project not found.");

  if (session.user.role === "admin") {
    await authorize(session, "delivery.project.read");
  } else if (
    session.user.role !== "client" ||
    session.user.organizationId !== project.organizationId
  ) {
    throw new ForbiddenError("You can only view your own project's review.");
  }

  const [review] = await getDb()
    .select()
    .from(projectReviews)
    .where(eq(projectReviews.projectId, projectId))
    .limit(1);

  return review ?? null;
}

/** Staff-wide satisfaction overview, gated by delivery.project.read. */
export async function listProjectReviews(ctx: CallerContext) {
  const { session } = ctx;
  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can view the project review overview.");
  }
  await authorize(session, "delivery.project.read");

  return getDb().select().from(projectReviews).orderBy(desc(projectReviews.createdAt));
}
