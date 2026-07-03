import { z } from "zod";

const uuid = z.string().uuid();
const optionalText = z.string().trim().min(1).optional().nullable();

const attendeeInputSchema = z
  .object({
    userId: uuid.optional(),
    externalName: z.string().trim().min(1).optional(),
    externalEmail: z.string().trim().email().optional(),
  })
  .refine((a) => Boolean(a.userId) !== Boolean(a.externalEmail), {
    message: "Each attendee must have exactly one of userId or externalEmail.",
  });

export const createCalendarEventSchema = z.object({
  title: z.string().trim().min(2),
  type: z.enum(["interview", "intro_call", "client_call", "internal", "other"]).default("other"),
  startAt: z.coerce.date(),
  endAt: z.coerce.date().optional().nullable(),
  location: optionalText,
  notes: optionalText,
  relatedEntityType: optionalText,
  relatedEntityId: uuid.optional().nullable(),
  attendees: z.array(attendeeInputSchema).default([]),
});

export const updateCalendarEventSchema = z.object({
  title: z.string().trim().min(2).optional(),
  type: z.enum(["interview", "intro_call", "client_call", "internal", "other"]).optional(),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional().nullable(),
  location: optionalText,
  notes: optionalText,
});

export const respondToEventSchema = z.object({
  status: z.enum(["accepted", "declined", "tentative"]),
});
