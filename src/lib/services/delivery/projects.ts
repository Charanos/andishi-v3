import { arrayContains, eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { briefs, projects } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { emitActivityEvent } from "@/lib/services/activity";
import type { promoteBriefToProjectSchema } from "@/lib/validation/delivery";
import type { createProjectSchema } from "@/lib/validation/entities";
import type { CallerContext } from "@/lib/services/types";

type CreateProjectInput = z.infer<typeof createProjectSchema>;
type PromoteBriefToProjectInput = z.infer<typeof promoteBriefToProjectSchema>;

/**
 * Admin (staff): sees all projects, gated by delivery.project.read.
 * Developer: sees only projects they are assigned to (ownership scope).
 * Client: sees only their own organization's projects (ownership scope).
 */
export async function listProjects(ctx: CallerContext) {
  const { session } = ctx;

  if (session.user.role === "admin") {
    await authorize(session, "delivery.project.read");
    return getDb().select().from(projects).orderBy(projects.createdAt);
  }

  if (session.user.role === "developer") {
    if (!session.user.engineerId) return [];
    return getDb()
      .select()
      .from(projects)
      .where(arrayContains(projects.engineerIds, [session.user.engineerId]));
  }

  if (!session.user.organizationId) return [];
  return getDb()
    .select()
    .from(projects)
    .where(eq(projects.organizationId, session.user.organizationId));
}

/** Only staff with delivery.project.write may create projects. */
export async function createProject(ctx: CallerContext, input: CreateProjectInput) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can create projects.");
  }

  await authorize(session, "delivery.project.write");

  return getDb().transaction(async (tx) => {
    const [project] = await tx.insert(projects).values(input).returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.project.write",
        resourceType: "project",
        resourceId: project.id,
        after: project,
        requestId,
      },
      tx,
    );

    return project;
  });
}

/**
 * The central brief -> project handoff (ADR-0007): "delivery_pm promotes
 * the brief into a project." Gated on delivery.project.write only, not
 * crm.brief.write - RBAC gives delivery_pm project-write but deliberately
 * not brief-write (that's sales_manager's), so flipping the source
 * brief's status to "closed" here is treated as a side effect of the
 * project-creation action, not an independent brief edit - the same
 * pattern finance's sendInvoice() uses when it marks timesheet/milestone
 * rows invoiced under finance.invoice.approve rather than requiring
 * delivery.timesheet.write too.
 *
 * Build-track briefs only - a hire-track brief is formalized through
 * matches/placements instead (see ADR-0007); promoting one directly to a
 * project would skip that talent-ops decision entirely.
 */
export async function promoteBriefToProject(
  ctx: CallerContext,
  briefId: string,
  input: PromoteBriefToProjectInput,
) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can promote a brief to a project.");
  }
  await authorize(session, "delivery.project.write");

  const [brief] = await getDb().select().from(briefs).where(eq(briefs.id, briefId)).limit(1);
  if (!brief) throw new NotFoundError("Brief not found.");
  if (brief.briefType !== "build") {
    throw new ConflictError(
      "Only a build brief can be promoted to a project - a hire brief is formalized through matches/placements instead.",
    );
  }
  if (brief.status === "closed") {
    throw new ConflictError("This brief is already closed.");
  }

  const [existingProject] = await getDb()
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.briefId, briefId))
    .limit(1);
  if (existingProject) {
    throw new ConflictError("This brief has already been promoted to a project.");
  }

  return getDb().transaction(async (tx) => {
    const [project] = await tx
      .insert(projects)
      .values({
        briefId: brief.id,
        organizationId: brief.organizationId,
        engineerIds: input.engineerIds,
        title: input.title ?? brief.title,
        description: brief.problemStatement ?? brief.title,
        status: "scoping",
        stackTags: brief.buildStackPreferences ?? [],
        serviceType: brief.serviceType,
        billingType: input.billingType,
        budgetCents: input.budgetCents,
        startDate: input.startDate,
        targetDate: input.targetDate,
        leadPmUserId: input.leadPmUserId,
      })
      .returning();

    const [updatedBrief] = await tx
      .update(briefs)
      .set({ status: "closed", updatedAt: new Date() })
      .where(eq(briefs.id, briefId))
      .returning();

    await emitActivityEvent(
      {
        type: "brief_promoted_to_project",
        actorId: session.user.id,
        actorRole: session.user.role,
        organizationId: project.organizationId,
        entityType: "project",
        entityId: project.id,
        description: `"${brief.title}" started as a project`,
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
        resourceId: project.id,
        after: project,
        requestId,
      },
      tx,
    );

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.project.write",
        resourceType: "brief",
        resourceId: updatedBrief.id,
        before: brief,
        after: updatedBrief,
        requestId,
      },
      tx,
    );

    return { project, brief: updatedBrief };
  });
}
