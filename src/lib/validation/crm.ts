import { z } from "zod";
import { serviceTypeEnum } from "@/lib/validation/entities";

const uuid = z.string().uuid();
const optionalText = z.string().trim().min(1).optional().nullable();
const cents = z.coerce.number().int().min(0);
const currency = z.enum(["USD", "EUR", "GBP"]).default("USD");

// ── Leads (ADR per master doc §6.3) ──────────────────────────────────

export const leadSourceSchema = z.enum([
  "contact",
  "start_project",
  "hire",
  "referral",
  "campaign",
  "manual",
  "newsletter",
]);

/**
 * Used internally by the public intake routes (/api/contact,
 * /api/general-inquiry) to record every inbound inquiry as a lead - not
 * exposed as its own public endpoint. Distinct from createLeadSchema
 * (below), which is the staff-facing "add a lead manually" shape and
 * requires a resolved owner/status instead of accepting raw form input.
 */
export const intakeLeadSchema = z.object({
  source: leadSourceSchema,
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  company: optionalText,
  phone: optionalText,
  message: optionalText,
  intendedTrack: z.enum(["build", "hire"]),
  serviceType: serviceTypeEnum.optional(),
  briefType: z.enum(["build", "hire"]).optional(),
  utm: z.record(z.string(), z.string()).optional(),
  organizationId: uuid.optional(),
});

export const createLeadSchema = z.object({
  source: leadSourceSchema,
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  company: optionalText,
  phone: optionalText,
  message: optionalText,
  intendedTrack: z.enum(["build", "hire"]),
  serviceType: serviceTypeEnum.optional(),
  briefType: z.enum(["build", "hire"]).optional(),
  utm: z.record(z.string(), z.string()).optional(),
  ownerUserId: uuid.optional().nullable(),
  organizationId: uuid.optional().nullable(),
});

export const updateLeadSchema = z.object({
  name: z.string().trim().min(2).optional(),
  company: optionalText,
  phone: optionalText,
  message: optionalText,
  status: z.enum(["new", "qualified", "nurturing", "won", "lost"]).optional(),
  ownerUserId: uuid.optional().nullable(),
  organizationId: uuid.optional().nullable(),
  lostReason: optionalText,
});

export const convertLeadToBriefSchema = z.object({
  title: z.string().trim().min(3),
  serviceType: serviceTypeEnum.optional(),
  problemStatement: optionalText,
  projectBudget: optionalText,
  projectTimeline: optionalText,
  role: optionalText,
  domain: optionalText,
  seniority: z.enum(["mid", "senior", "lead", "architect"]).optional(),
  description: optionalText,
});

// ── Deals ─────────────────────────────────────────────────────────────

export const dealStageSchema = z.enum([
  "qualification",
  "scoping",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
]);

export const createDealSchema = z.object({
  leadId: uuid.optional().nullable(),
  organizationId: uuid.optional().nullable(),
  title: z.string().trim().min(2),
  valueCents: cents.default(0),
  currency,
  probability: z.coerce.number().int().min(0).max(100).default(50),
  expectedClose: optionalText,
  ownerUserId: uuid,
});

export const updateDealSchema = z.object({
  title: z.string().trim().min(2).optional(),
  valueCents: cents.optional(),
  currency: currency.optional(),
  probability: z.coerce.number().int().min(0).max(100).optional(),
  expectedClose: optionalText,
  ownerUserId: uuid.optional(),
});

export const transitionDealStageSchema = z.object({
  stage: dealStageSchema,
  lostReason: optionalText,
});

// ── Proposals ─────────────────────────────────────────────────────────

export const createProposalSchema = z.object({
  dealId: uuid,
  title: z.string().trim().min(2),
  bodyMd: z.string().trim().min(10),
  amountCents: cents,
  currency,
  pdfUrl: optionalText,
});

export const updateProposalSchema = z.object({
  title: z.string().trim().min(2).optional(),
  bodyMd: z.string().trim().min(10).optional(),
  amountCents: cents.optional(),
  currency: currency.optional(),
  pdfUrl: optionalText,
});

export const decideProposalSchema = z.object({
  decision: z.enum(["accepted", "rejected"]),
});

// ── Deal activities ───────────────────────────────────────────────────

export const createDealActivitySchema = z.object({
  dealId: uuid,
  type: z.enum(["call", "email", "meeting", "note", "stage_change"]),
  note: z.string().trim().min(1),
  occurredAt: z.coerce.date().optional(),
});
