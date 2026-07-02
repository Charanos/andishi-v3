import { z } from "zod";

const uuid = z.string().uuid();
const optionalText = z.string().trim().min(1).optional().nullable();

export const jobKindValues = ["freelance", "internal", "outsourced"] as const;
export const jobStatusValues = ["draft", "open", "closed"] as const;
export const applicationStageValues = [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
] as const;

// ── Job openings ──────────────────────────────────────────────────────

export const createJobOpeningSchema = z.object({
  title: z.string().trim().min(2),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  kind: z.enum(jobKindValues),
  department: z.string().trim().min(2),
  location: z.string().trim().min(2),
  remote: z.coerce.boolean().default(false),
  seniority: z.string().trim().min(2),
  descriptionMd: z.string().trim().min(20),
  skills: z.array(z.string().trim().min(1)).default([]),
  compensationNote: optionalText,
  status: z.enum(jobStatusValues).default("draft"),
  organizationId: uuid.optional().nullable(),
});

export const updateJobOpeningSchema = createJobOpeningSchema.partial();

// ── Applications ──────────────────────────────────────────────────────

export const applicationLinksSchema = z
  .object({
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    portfolio: z.string().url().optional(),
  })
  .default({});

export const createApplicationSchema = z.object({
  jobOpeningId: uuid,
  applicantName: z.string().trim().min(2),
  applicantEmail: z.string().trim().email(),
  resumeUrl: z.string().url().optional().nullable(),
  links: applicationLinksSchema,
  coverNote: optionalText,
});

export const updateApplicationStageSchema = z.object({
  stage: z.enum(applicationStageValues),
  note: optionalText,
});

export const updateApplicationRatingSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
});
