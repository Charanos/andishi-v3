import { z } from "zod";

const uuid = z.string().uuid();
const optionalText = z.string().trim().min(1).optional().nullable();

// ── Testimonials (ADR-0004) ──────────────────────────────────────────

export const createTestimonialSchema = z.object({
  authorName: z.string().trim().min(2),
  authorRole: z.string().trim().min(2),
  content: z.string().trim().min(10),
  avatarUrl: z.string().url(),
  projectUrl: optionalText,
  rating: z.coerce.number().int().min(1).max(5).default(5),
  date: z.string().trim().min(1),
  status: z.enum(["active", "archived"]).default("active"),
  featured: z.coerce.boolean().default(false),
  order: z.coerce.number().int().min(0).default(0),
  projectId: uuid.optional().nullable(),
  organizationId: uuid.optional().nullable(),
  engineerId: uuid.optional().nullable(),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();
