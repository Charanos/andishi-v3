import { z } from "zod";
import { serviceTypeEnum } from "@/lib/validation/entities";

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
  body: z.string().trim().min(1),
  status: z.enum(["published", "draft", "archived"]).default("draft"),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

// ── Services content (ADR-0004, master doc §6.6) ─────────────────────

const serviceEngagementOptionSchema = z.object({
  label: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

const serviceFaqItemSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

export const createServiceContentSchema = z.object({
  slug: serviceTypeEnum,
  title: z.string().trim().min(2),
  description: z.string().trim().min(10),
  icon: z.string().trim().min(1),
  timeline: z.string().trim().min(1),
  glow: z.enum(["violet", "cyan", "amber"]),
  group: z.enum(["product-delivery", "specialist-builds"]),
  tagline: z.string().trim().min(1),
  imageUrl: optionalText,
  scope: z.string().trim().min(10),
  engagementOptions: z.array(serviceEngagementOptionSchema).default([]),
  faq: z.array(serviceFaqItemSchema).default([]),
  stackHighlights: z.array(z.string().trim().min(1)).default([]),
  order: z.coerce.number().int().min(0).default(0),
  published: z.coerce.boolean().default(false),
});

export const updateServiceContentSchema = createServiceContentSchema.partial();

// ── Skill domains (ADR-0004, master doc §6.6) ────────────────────────

const skillDomainFaqItemSchema = z.object({
  q: z.string().trim().min(1),
  a: z.string().trim().min(1),
});

export const createSkillDomainSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  label: z.string().trim().min(1),
  eyebrow: z.string().trim().min(1),
  h1: z.string().trim().min(1),
  subheadline: z.string().trim().min(1),
  technologies: z.array(z.string().trim().min(1)).default([]),
  useCases: z.array(z.string().trim().min(1)).default([]),
  differentiators: z.array(z.string().trim().min(1)).default([]),
  faq: z.array(skillDomainFaqItemSchema).default([]),
  order: z.coerce.number().int().min(0).default(0),
  published: z.coerce.boolean().default(true),
});

export const updateSkillDomainSchema = createSkillDomainSchema.partial();

// ── FAQs (ADR-0004, master doc §6.6) ─────────────────────────────────

export const faqSectionEnum = z.enum(["landing", "services", "hire", "careers", "general"]);

export const createFaqSchema = z.object({
  section: faqSectionEnum,
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
  order: z.coerce.number().int().min(0).default(0),
  published: z.coerce.boolean().default(true),
});

export const updateFaqSchema = createFaqSchema.partial();

// ── Content revisions (generic, shared across CMS tables) ────────────

export const contentTypeEnum = z.enum([
  "services_content",
  "skill_domain",
  "faq",
  "blog_post",
  "testimonial",
]);

export const listContentRevisionsSchema = z.object({
  contentType: contentTypeEnum,
  contentId: uuid,
});
