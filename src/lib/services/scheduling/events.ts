import { and, asc, eq, inArray } from "drizzle-orm";
import type { z } from "zod";
import { getDb } from "@/db";
import { calendarEventAttendees, calendarEvents } from "@/db/schema";
import { authorize } from "@/lib/authz/can";
import { ForbiddenError, NotFoundError } from "@/lib/authz/errors";
import { createNotification } from "@/lib/services/support/notifications";
import type { CallerContext } from "@/lib/services/types";
import type {
  createCalendarEventSchema,
  respondToEventSchema,
  updateCalendarEventSchema,
} from "@/lib/validation/scheduling";

type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;
type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>;
type RespondToEventInput = z.infer<typeof respondToEventSchema>;

function assertStaff(ctx: CallerContext, message: string) {
  if (ctx.session.user.role !== "admin") throw new ForbiddenError(message);
}

async function attachAttendees(eventIds: string[]) {
  const byEvent = new Map<string, (typeof calendarEventAttendees.$inferSelect)[]>();
  if (eventIds.length === 0) return byEvent;

  const rows = await getDb()
    .select()
    .from(calendarEventAttendees)
    .where(inArray(calendarEventAttendees.eventId, eventIds));

  for (const row of rows) {
    const list = byEvent.get(row.eventId) ?? [];
    list.push(row);
    byEvent.set(row.eventId, list);
  }
  return byEvent;
}

/** Self-scoped: events you organize or are invited to - no permission needed to see your own calendar. */
export async function listMyEvents(ctx: CallerContext) {
  const { session } = ctx;
  const db = getDb();

  const organized = await db
    .select()
    .from(calendarEvents)
    .where(eq(calendarEvents.organizerUserId, session.user.id));

  const invitedRows = await db
    .select({ event: calendarEvents })
    .from(calendarEventAttendees)
    .innerJoin(calendarEvents, eq(calendarEventAttendees.eventId, calendarEvents.id))
    .where(eq(calendarEventAttendees.userId, session.user.id));

  const byId = new Map(organized.map((e) => [e.id, e]));
  for (const { event } of invitedRows) byId.set(event.id, event);

  const events = Array.from(byId.values()).sort(
    (a, b) => a.startAt.getTime() - b.startAt.getTime(),
  );
  const attendeesByEvent = await attachAttendees(events.map((e) => e.id));

  return events.map((event) => ({ ...event, attendees: attendeesByEvent.get(event.id) ?? [] }));
}

/** Staff-wide calendar visibility, gated by scheduling.event.read. */
export async function listAllEvents(ctx: CallerContext) {
  assertStaff(ctx, "Only Andishi staff can view the full scheduling calendar.");
  await authorize(ctx.session, "scheduling.event.read");

  const events = await getDb().select().from(calendarEvents).orderBy(asc(calendarEvents.startAt));
  const attendeesByEvent = await attachAttendees(events.map((e) => e.id));

  return events.map((event) => ({ ...event, attendees: attendeesByEvent.get(event.id) ?? [] }));
}

async function loadEventForAccess(ctx: CallerContext, eventId: string) {
  const { session } = ctx;
  const [event] = await getDb()
    .select()
    .from(calendarEvents)
    .where(eq(calendarEvents.id, eventId))
    .limit(1);
  if (!event) throw new NotFoundError("Event not found.");

  if (event.organizerUserId === session.user.id) return event;

  const [attendee] = await getDb()
    .select({ id: calendarEventAttendees.id })
    .from(calendarEventAttendees)
    .where(
      and(
        eq(calendarEventAttendees.eventId, eventId),
        eq(calendarEventAttendees.userId, session.user.id),
      ),
    )
    .limit(1);
  if (attendee) return event;

  if (session.user.role === "admin") {
    await authorize(session, "scheduling.event.read");
    return event;
  }

  throw new NotFoundError("Event not found.");
}

export async function getEvent(ctx: CallerContext, id: string) {
  const event = await loadEventForAccess(ctx, id);
  const attendees = await getDb()
    .select()
    .from(calendarEventAttendees)
    .where(eq(calendarEventAttendees.eventId, id));

  return { ...event, attendees };
}

/** Staff-only - organizing interviews/calls is a staff-initiated action, not self-service. */
export async function createEvent(ctx: CallerContext, input: CreateCalendarEventInput) {
  const { session } = ctx;
  assertStaff(ctx, "Only Andishi staff can schedule calendar events.");
  await authorize(session, "scheduling.event.write");

  return getDb().transaction(async (tx) => {
    const [event] = await tx
      .insert(calendarEvents)
      .values({
        title: input.title,
        type: input.type,
        startAt: input.startAt,
        endAt: input.endAt,
        location: input.location,
        notes: input.notes,
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
        organizerUserId: session.user.id,
      })
      .returning();

    const attendees = input.attendees.length
      ? await tx
          .insert(calendarEventAttendees)
          .values(
            input.attendees.map((a) => ({
              eventId: event.id,
              userId: a.userId,
              externalName: a.externalName,
              externalEmail: a.externalEmail,
            })),
          )
          .returning()
      : [];

    for (const attendee of attendees) {
      if (!attendee.userId) continue;
      await createNotification(tx, {
        userId: attendee.userId,
        type: "calendar_event_invite",
        title: `You're invited: ${event.title}`,
        entityType: "calendar_event",
        entityId: event.id,
      });
    }

    return { ...event, attendees };
  });
}

export async function updateEvent(ctx: CallerContext, id: string, input: UpdateCalendarEventInput) {
  const { session } = ctx;
  assertStaff(ctx, "Only Andishi staff can update a calendar event.");
  await authorize(session, "scheduling.event.write");

  const [existing] = await getDb()
    .select()
    .from(calendarEvents)
    .where(eq(calendarEvents.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Event not found.");

  const [updated] = await getDb()
    .update(calendarEvents)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(calendarEvents.id, id))
    .returning();

  return updated;
}

export async function deleteEvent(ctx: CallerContext, id: string) {
  const { session } = ctx;
  assertStaff(ctx, "Only Andishi staff can delete a calendar event.");
  await authorize(session, "scheduling.event.write");

  const [existing] = await getDb()
    .select()
    .from(calendarEvents)
    .where(eq(calendarEvents.id, id))
    .limit(1);
  if (!existing) throw new NotFoundError("Event not found.");

  await getDb().delete(calendarEvents).where(eq(calendarEvents.id, id));
}

/** Self-scoped: an attendee updates their own RSVP - no permission needed. */
export async function respondToEvent(
  ctx: CallerContext,
  eventId: string,
  input: RespondToEventInput,
) {
  const { session } = ctx;

  const [attendee] = await getDb()
    .select()
    .from(calendarEventAttendees)
    .where(
      and(
        eq(calendarEventAttendees.eventId, eventId),
        eq(calendarEventAttendees.userId, session.user.id),
      ),
    )
    .limit(1);
  if (!attendee) throw new NotFoundError("You are not an attendee of this event.");

  const [updated] = await getDb()
    .update(calendarEventAttendees)
    .set({ status: input.status })
    .where(eq(calendarEventAttendees.id, attendee.id))
    .returning();

  return updated;
}
