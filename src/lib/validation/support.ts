import { z } from "zod";

const uuid = z.string().uuid();
const optionalText = z.string().trim().min(1).optional().nullable();

// ── Support cases (master doc §6.8) ──────────────────────────────────

export const createSupportCaseSchema = z.object({
  subject: z.string().trim().min(2),
  priority: z.enum(["low", "normal", "urgent"]).default("normal"),
  source: z.enum(["client", "developer", "internal"]),
  topic: z.enum(["billing", "matching", "project", "profile", "payout", "other"]).default("other"),
  organizationId: uuid.optional().nullable(),
  projectId: uuid.optional().nullable(),
  // The first message in the thread - a case without an opening message
  // isn't useful, so it's required at creation rather than a separate step.
  message: z.string().trim().min(2),
});

export const updateSupportCaseSchema = z.object({
  status: z.enum(["open", "waiting", "escalated", "resolved"]).optional(),
  priority: z.enum(["low", "normal", "urgent"]).optional(),
  topic: z.enum(["billing", "matching", "project", "profile", "payout", "other"]).optional(),
  slaMinutes: z.coerce.number().int().min(0).optional().nullable(),
  nextAction: optionalText,
  resolutionNote: optionalText,
});

export const assignSupportCaseSchema = z.object({
  assigneeUserId: uuid.nullable(),
});

// ── Support messages (master doc §6.8) ───────────────────────────────

export const createSupportMessageSchema = z.object({
  body: z.string().trim().min(1),
  attachments: z.array(z.string().trim().min(1)).optional(),
  internal: z.coerce.boolean().default(false),
});

// ── Notifications (master doc §6.8) ──────────────────────────────────

export const updateNotificationPrefSchema = z.object({
  channel: z.enum(["email", "in_app", "sms"]),
  eventType: z.string().trim().min(1),
  enabled: z.coerce.boolean(),
});
