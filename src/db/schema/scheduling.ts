import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users";

// Calendar/scheduling - backs the admin/dev/client calendar menu and the
// intro-call/interview slots referenced throughout matching/careers. Not in
// the master doc's original module map - added per the July 2026 dashboard-
// workflow expansion (see docs/backend/BACKEND_ARCHITECTURE_MASTER.md).

export const calendarEventTypeEnum = pgEnum("calendar_event_type", [
  "interview",
  "intro_call",
  "client_call",
  "internal",
  "other",
]);

export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    type: calendarEventTypeEnum("type").notNull().default("other"),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }),
    location: text("location"), // a meeting link or physical location
    notes: text("notes"),
    organizerUserId: uuid("organizer_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Loose, cross-module link (e.g. "application"|"brief"|"match"|"project")
    // - no FK, same convention as activity_events.entityType/Id.
    relatedEntityType: text("related_entity_type"),
    relatedEntityId: uuid("related_entity_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    organizerIdx: index("calendar_events_organizer_idx").on(table.organizerUserId),
    startAtIdx: index("calendar_events_start_at_idx").on(table.startAt),
  }),
);

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type NewCalendarEvent = typeof calendarEvents.$inferInsert;

export const eventAttendeeStatusEnum = pgEnum("event_attendee_status", [
  "invited",
  "accepted",
  "declined",
  "tentative",
]);

export const calendarEventAttendees = pgTable(
  "calendar_event_attendees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => calendarEvents.id, { onDelete: "cascade" }),
    // Internal attendee (staff/dev/client already in the system).
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    // External attendee (e.g. a careers candidate with no account yet) -
    // exactly one of userId/externalEmail should be set.
    externalName: text("external_name"),
    externalEmail: text("external_email"),
    status: eventAttendeeStatusEnum("status").notNull().default("invited"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    eventIdx: index("calendar_event_attendees_event_idx").on(table.eventId),
    userIdx: index("calendar_event_attendees_user_idx").on(table.userId),
  }),
);

export type CalendarEventAttendee = typeof calendarEventAttendees.$inferSelect;
export type NewCalendarEventAttendee = typeof calendarEventAttendees.$inferInsert;
