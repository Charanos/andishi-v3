import { z } from "zod";
import { serviceTypeEnum } from "@/lib/validation/entities";

// ── Build inquiry - client wants Andishi to build software ────────

export const buildContactSchema = z.object({
  type: z.literal("build"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  company: z.string().trim().optional(),
  serviceType: serviceTypeEnum,
  problemStatement: z
    .string()
    .trim()
    .min(20, "Please describe your project in at least 20 characters"),
  projectBudget: z.string().trim().optional(),
  projectTimeline: z.string().trim().optional(),
});

// ── Hire inquiry - client wants to place an engineer on their team ─

export const hireContactSchema = z.object({
  type: z.literal("hire"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  company: z.string().trim().optional(),
  role: z.string().trim().min(2, "Role is required"),
  domain: z.string().trim().min(1, "Domain is required"),
  seniority: z.enum(["mid", "senior", "lead", "architect"]),
  stackTags: z.array(z.string().trim().min(1)).default([]),
  timeline: z.string().trim().min(1, "Timeline is required"),
  engagementModel: z.enum(["project", "embedded", "team_extension"]),
  description: z
    .string()
    .trim()
    .min(20, "Please provide at least 20 characters of detail"),
});

/**
 * Discriminated union for POST /api/contact
 * The `type` field determines which track is being submitted.
 */
export const contactSchema = z.discriminatedUnion("type", [
  buildContactSchema,
  hireContactSchema,
]);

export type BuildContactInput = z.infer<typeof buildContactSchema>;
export type HireContactInput = z.infer<typeof hireContactSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
