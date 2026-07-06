import { z } from "zod";

export const governanceSurfaceSchema = z.enum([
  "commercial",
  "identity",
  "delivery",
  "content",
  "support",
]);

export const governanceStatusSchema = z.enum(["clean", "review", "exception", "scheduled"]);

export const governanceSeveritySchema = z.enum(["low", "medium", "high"]);

export const createGovernanceControlSchema = z.object({
  title: z.string().trim().min(2),
  scope: z.string().trim().min(1),
  surface: governanceSurfaceSchema,
  status: governanceStatusSchema.default("review"),
  severity: governanceSeveritySchema.default("medium"),
  actor: z.string().trim().min(1),
  owner: z.string().trim().min(1),
  policy: z.string().trim().min(1),
  nextAction: z.string().trim().min(1),
  reportCadence: z.string().trim().min(1),
  amountProtected: z.number().int().min(0).default(0),
  clientVisible: z.boolean().default(false),
  developerVisible: z.boolean().default(false),
  evidence: z.array(z.string().trim().min(1)).default([]),
  imageUrl: z.string().trim().url().optional().nullable(),
});

export const updateGovernanceControlSchema = createGovernanceControlSchema.partial();
