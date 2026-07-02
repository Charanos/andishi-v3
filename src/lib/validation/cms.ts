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

// ── Blog posts (ADR-0004) ────────────────────────────────────────────

const blogCategoryEnum = z.enum(["Hiring", "African Tech", "Remote Work", "Engineering"]);

export const createBlogPostSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().trim().min(3),
  category: blogCategoryEnum,
  excerpt: z.string().trim().min(10),
  coverImage: z.string().trim().min(1),
  authorName: z.string().trim().min(2),
  authorRole: z.string().trim().min(2),
  authorAvatarUrl: z.string().trim().min(1),
  datePublished: z.string().trim().min(1),
  dateModified: z.string().trim().min(1),
  readTime: z.coerce.number().int().min(1).max(120).default(5),
  featured: z.coerce.boolean().default(false),
  body: z.array(z.string().trim().min(1)).min(1),
  status: z.enum(["published", "draft", "archived"]).default("draft"),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();
