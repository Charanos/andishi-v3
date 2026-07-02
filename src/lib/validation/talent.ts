import { z } from "zod";

const uuid = z.string().uuid();
const optionalText = z.string().trim().min(1).optional().nullable();

// ── Skills taxonomy ───────────────────────────────────────────────────

export const createSkillSchema = z.object({
  name: z.string().trim().min(1),
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  category: z.string().trim().min(1),
});

export const updateSkillSchema = createSkillSchema.partial();

// ── Engineer <-> skill mapping ──────────────────────────────────────

export const setEngineerSkillSchema = z.object({
  skillId: uuid,
  level: z.coerce.number().int().min(1).max(5).default(1),
  years: z.coerce.number().int().min(0).default(0),
});

// ── Vetting pipeline ──────────────────────────────────────────────────

export const vettingStageSchema = z.enum([
  "application_review",
  "technical_screen",
  "system_design",
  "culture_fit",
  "reference_check",
  "final_decision",
]);

export const recordVettingDecisionSchema = z.object({
  stage: vettingStageSchema,
  status: z.enum(["pending", "passed", "failed", "skipped"]),
  notes: optionalText,
});

// ── Availability windows ─────────────────────────────────────────────

export const createAvailabilityWindowSchema = z.object({
  startDate: z.string().trim().min(1),
  endDate: optionalText,
  capacityHoursPerWeek: z.coerce.number().int().min(0).max(168),
});

export const updateAvailabilityWindowSchema = createAvailabilityWindowSchema.partial();
