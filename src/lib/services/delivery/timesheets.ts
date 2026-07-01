import { eq } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { timesheetEntries } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { writeAudit } from "@/lib/authz/audit";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { emitActivityEvent } from "@/lib/services/activity";
import type { CallerContext } from "@/lib/services/types";
import type { createTimesheetSchema, updateTimesheetSchema } from "@/lib/validation/entities";

type LogTimeInput = z.infer<typeof createTimesheetSchema>;
type UpdateTimesheetInput = z.infer<typeof updateTimesheetSchema>;

/** Clients never see raw time entries - only the invoices/milestones that come out of them. */
export async function listTimesheets(ctx: CallerContext) {
  const { session } = ctx;

  if (session.user.role === "client") return [];

  if (session.user.role === "admin") {
    await authorize(session, "delivery.timesheet.read");
    return getDb().select().from(timesheetEntries).orderBy(timesheetEntries.createdAt);
  }

  if (!session.user.engineerId) return [];
  return getDb()
    .select()
    .from(timesheetEntries)
    .where(eq(timesheetEntries.engineerId, session.user.engineerId));
}

/** A developer logs their own time; staff may log on an engineer's behalf. */
export async function logTime(ctx: CallerContext, input: LogTimeInput) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role === "client") throw new ForbiddenError("Clients cannot log time.");

  if (session.user.role === "admin") {
    await authorize(session, "delivery.timesheet.write");
    if (!input.engineerId)
      throw new ConflictError(
        "engineerId is required when staff logs time on an engineer's behalf.",
      );
  }

  const engineerId = session.user.role === "admin" ? input.engineerId : session.user.engineerId;
  if (!engineerId) throw new ConflictError("engineerId is required.");

  return getDb().transaction(async (tx) => {
    const [entry] = await tx
      .insert(timesheetEntries)
      .values({ ...input, engineerId })
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.timesheet.write",
        resourceType: "timesheet_entry",
        resourceId: entry.id,
        after: entry,
        requestId,
      },
      tx,
    );

    return entry;
  });
}

/** Fetches a single entry - staff see any, a developer only their own. */
export async function getTimesheet(ctx: CallerContext, id: string) {
  return loadOwnedTimesheet(ctx, id);
}

async function loadOwnedTimesheet(ctx: CallerContext, id: string) {
  const { session } = ctx;
  const [entry] = await getDb()
    .select()
    .from(timesheetEntries)
    .where(eq(timesheetEntries.id, id))
    .limit(1);
  if (!entry) throw new NotFoundError("Timesheet entry not found.");

  const isOwner = session.user.role === "developer" && session.user.engineerId === entry.engineerId;
  if (session.user.role !== "admin" && !isOwner) {
    throw new NotFoundError("Timesheet entry not found.");
  }

  return entry;
}

/** Only draft or rejected entries can be freely edited - once submitted, use submit/approve/reject. */
export async function updateTimesheet(ctx: CallerContext, id: string, input: UpdateTimesheetInput) {
  const { session, requestId, actorIp } = ctx;
  const existing = await loadOwnedTimesheet(ctx, id);

  if (session.user.role === "admin") {
    await authorize(session, "delivery.timesheet.write");
  } else if (!["draft", "rejected"].includes(existing.status)) {
    throw new ConflictError("Only draft or rejected entries can be edited directly.");
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(timesheetEntries)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(timesheetEntries.id, id))
      .returning();

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.timesheet.write",
        resourceType: "timesheet_entry",
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

export async function submitTimesheet(ctx: CallerContext, id: string) {
  const { session, requestId, actorIp } = ctx;
  const existing = await loadOwnedTimesheet(ctx, id);

  if (!["draft", "rejected"].includes(existing.status)) {
    throw new ConflictError("Only a draft or rejected entry can be submitted.");
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(timesheetEntries)
      .set({ status: "submitted", submittedAt: new Date(), updatedAt: new Date() })
      .where(eq(timesheetEntries.id, id))
      .returning();

    await emitActivityEvent(
      {
        type: "timesheet_submitted",
        actorId: session.user.id,
        actorRole: session.user.role,
        entityType: "timesheet_entry",
        entityId: updated.id,
        description: `${updated.minutes} minutes submitted for approval`,
        visibleTo: ["delivery.timesheet.approve"],
      },
      tx,
    );

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.timesheet.write",
        resourceType: "timesheet_entry",
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

async function transitionSubmittedTimesheet(
  ctx: CallerContext,
  id: string,
  nextStatus: "approved" | "rejected",
) {
  const { session, requestId, actorIp } = ctx;

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Only Andishi staff can approve or reject time entries.");
  }
  await authorize(session, "delivery.timesheet.approve");

  const [existing] = await getDb()
    .select()
    .from(timesheetEntries)
    .where(eq(timesheetEntries.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Timesheet entry not found.");
  if (existing.status !== "submitted") {
    throw new ConflictError("Only a submitted entry can be approved or rejected.");
  }

  return getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(timesheetEntries)
      .set({
        status: nextStatus,
        approvedAt: nextStatus === "approved" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(timesheetEntries.id, id))
      .returning();

    if (nextStatus === "approved") {
      await emitActivityEvent(
        {
          type: "timesheet_approved",
          actorId: session.user.id,
          actorRole: session.user.role,
          entityType: "timesheet_entry",
          entityId: updated.id,
          description: `${updated.minutes} minutes approved`,
          // Finance reads approved time to generate invoices (ADR-0007).
          visibleTo: ["delivery.timesheet.read"],
        },
        tx,
      );
    }

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.timesheet.approve",
        resourceType: "timesheet_entry",
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

export const approveTimesheet = (ctx: CallerContext, id: string) =>
  transitionSubmittedTimesheet(ctx, id, "approved");
export const rejectTimesheet = (ctx: CallerContext, id: string) =>
  transitionSubmittedTimesheet(ctx, id, "rejected");

export async function deleteTimesheet(ctx: CallerContext, id: string) {
  const { session, requestId, actorIp } = ctx;
  const existing = await loadOwnedTimesheet(ctx, id);

  if (session.user.role === "admin") {
    await authorize(session, "delivery.timesheet.write");
  } else if (existing.status !== "draft") {
    throw new ConflictError("Only a draft entry can be deleted.");
  }

  await getDb().transaction(async (tx) => {
    await tx.delete(timesheetEntries).where(eq(timesheetEntries.id, id));

    await writeAudit(
      {
        actorUserId: session.user.id,
        actorIp,
        action: "delivery.timesheet.write",
        resourceType: "timesheet_entry",
        resourceId: id,
        before: existing,
        requestId,
      },
      tx,
    );
  });
}
