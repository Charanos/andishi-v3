import { z } from "zod";

const uuid = z.string().uuid();
const optionalText = z.string().trim().min(1).optional().nullable();
const currency = z.enum(["USD", "EUR", "GBP"]).default("USD");

// ── Shared sub-schemas ────────────────────────────────────────────

const workHistoryItemSchema = z.object({
  company: z.string().trim().min(1),
  role: z.string().trim().min(1),
  period: z.string().trim().min(1),
  achievement: z.string().trim().min(1),
});

const engineerStatSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
});

const projectMilestoneSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  status: z.enum(["pending", "in_progress", "submitted", "approved", "revision"]),
  dueDate: z.string().trim().min(1).optional(),
  submittedAt: z.string().trim().min(1).optional(),
  approvedAt: z.string().trim().min(1).optional(),
});

// ── Service type enum (shared across briefs, projects, contact) ───

export const serviceTypeEnum = z.enum([
  "custom-software",
  "saas-development",
  "ai-systems",
  "mobile-apps",
  "enterprise-software",
  "blockchain",
  "apis-integrations",
  "product-strategy",
]);

// ── Vertical enum (for project case studies + /work filters) ──────

export const verticalEnum = z.enum([
  "fintech",
  "healthtech",
  "logistics",
  "saas",
  "ecommerce",
  "edtech",
  "proptech",
  "web3",
  "enterprise",
  "consumer",
]);

// ── Organization ──────────────────────────────────────────────────

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2),
  website: optionalText,
  industry: optionalText,
  stage: optionalText,
  logoUrl: optionalText,
  billingEmail: z.string().trim().email().optional().nullable(),
  // NEW - June 2026
  region: z.enum(["east_africa", "north_america", "europe", "gcc", "global"]).optional().nullable(),
  country: z.string().trim().length(2).optional().nullable(), // ISO 3166-1 alpha-2
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

// ── Engineer ──────────────────────────────────────────────────────

export const createEngineerSchema = z.object({
  userId: uuid,
  slug: z.string().trim().min(2),
  name: z.string().trim().min(2),
  role: z.string().trim().min(2),
  domain: z.string().trim().min(2),
  domainLabel: z.string().trim().min(2),
  avatar: z.string().trim().min(1),
  avatarColor: z.string().trim().min(1),
  avatarUrl: optionalText,
  yearsExp: z.coerce.number().int().min(0).default(0),
  location: z.string().trim().min(2),
  timezone: z.string().trim().min(1),
  availability: z.enum(["available", "soon", "engaged"]).default("available"),
  availableFrom: optionalText,
  bio: optionalText,
  highlight: optionalText,
  skills: z.array(z.string().trim().min(1)).default([]),
  workHistory: z.array(workHistoryItemSchema).default([]),
  stats: z.array(engineerStatSchema).default([]),
  githubUrl: optionalText,
  linkedinUrl: optionalText,
  portfolioUrl: optionalText,
  profileComplete: z.coerce.boolean().default(false),
  isPublic: z.coerce.boolean().default(true),
  verified: z.coerce.boolean().default(false),
});

export const updateEngineerSchema = createEngineerSchema.partial().omit({ userId: true });

// ── Briefs - Discriminated union (NEW June 2026) ──────────────────

/**
 * Schema for creating a BUILD brief (client wants software delivered by Andishi)
 */
const createBuildBriefSchema = z.object({
  briefType: z.literal("build"),
  organizationId: uuid.optional(),
  submittedById: uuid.optional(),
  title: z.string().trim().min(3),
  status: z
    .enum(["draft", "submitted", "under_review", "matching", "shortlisted", "scoping", "closed"])
    .default("submitted"),
  andishiNotes: optionalText,
  serviceType: serviceTypeEnum.optional(),
  problemStatement: z.string().trim().min(10).optional(),
  projectBudget: z.string().trim().optional(),
  projectTimeline: z.string().trim().optional(),
  targetLaunchDate: z.string().trim().optional(),
  hasExistingProduct: z.coerce.boolean().default(false),
  existingProductUrl: z.string().url().optional().nullable(),
  buildStackPreferences: z.array(z.string().trim().min(1)).default([]),
});

/**
 * Schema for creating a HIRE brief (client wants to place an engineer on their team)
 */
const createHireBriefSchema = z.object({
  briefType: z.literal("hire"),
  organizationId: uuid.optional(),
  submittedById: uuid.optional(),
  title: z.string().trim().min(3),
  status: z
    .enum(["draft", "submitted", "under_review", "matching", "shortlisted", "scoping", "closed"])
    .default("submitted"),
  andishiNotes: optionalText,
  role: z.string().trim().min(2),
  domain: z.string().trim().min(2),
  seniority: z.enum(["mid", "senior", "lead", "architect"]),
  stackTags: z.array(z.string().trim().min(1)).default([]),
  timeline: z.string().trim().min(2),
  engagementModel: z.enum(["project", "embedded", "team_extension"]),
  description: z.string().trim().min(10),
});

/**
 * Discriminated union - validated by the `briefType` field
 * Use this on all API routes that create or update briefs.
 */
export const createBriefSchema = z.discriminatedUnion("briefType", [
  createBuildBriefSchema,
  createHireBriefSchema,
]);

export const updateBriefSchema = z.union([
  createBuildBriefSchema.partial(),
  createHireBriefSchema.partial(),
]);

// ── Match ─────────────────────────────────────────────────────────

export const createMatchSchema = z.object({
  briefId: uuid,
  engineerId: uuid,
  status: z
    .enum([
      "proposed",
      "client_reviewing",
      "intro_scheduled",
      "intro_completed",
      "accepted",
      "declined",
    ])
    .default("proposed"),
  introScheduledAt: z.coerce.date().optional().nullable(),
  introCompletedAt: z.coerce.date().optional().nullable(),
  acceptedAt: z.coerce.date().optional().nullable(),
  adminNotes: optionalText,
  clientNotes: optionalText,
  clientPreferredSlot1: optionalText,
  clientPreferredSlot2: optionalText,
});

export const updateMatchSchema = createMatchSchema.partial();

// ── Placement ─────────────────────────────────────────────────────

export const createPlacementSchema = z.object({
  matchId: uuid,
  engineerId: uuid,
  organizationId: uuid,
  startDate: z.string().trim().min(1),
  endDate: optionalText,
  engagementModel: z.enum(["project", "embedded", "team_extension"]),
  status: z.enum(["active", "paused", "completed", "terminated"]).default("active"),
  weeklyHours: z.coerce.number().int().min(1).max(80).default(40),
  currency,
});

export const updatePlacementSchema = createPlacementSchema.partial();

// ── Project ───────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  briefId: uuid.optional().nullable(),
  placementId: uuid.optional().nullable(),
  organizationId: uuid,
  engineerIds: z.array(uuid).default([]),
  title: z.string().trim().min(2),
  description: z.string().trim().min(2),
  status: z.enum(["scoping", "active", "review", "completed", "on_hold"]).default("scoping"),
  startDate: optionalText,
  targetDate: optionalText,
  stackTags: z.array(z.string().trim().min(1)).default([]),
  milestones: z.array(projectMilestoneSchema).default([]),
  // NEW - June 2026: optional at creation; set properly before publishing
  serviceType: serviceTypeEnum.optional().nullable(),
  vertical: verticalEnum.optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.partial();

/**
 * Schema for publishing a project as a public case study via PATCH /api/projects/[id]
 * All required fields must be provided before a project can go public.
 */
export const publishCaseStudySchema = z.object({
  isPublic: z.literal(true),
  publicSlug: z
    .string()
    .trim()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  serviceType: serviceTypeEnum,
  vertical: verticalEnum,
  challenge: z.string().trim().min(20),
  solution: z.string().trim().min(20),
  outcome: z.string().trim().min(1),
  outcomeLabel: z.string().trim().min(1),
  clientName: z.string().trim().min(1),
  coverImageUrl: z.string().url().optional().nullable(),
  clientQuote: z.string().trim().optional().nullable(),
  clientQuoteAttribution: z.string().trim().optional().nullable(),
  featuredOrder: z.number().int().min(0).optional().nullable(),
});

// ── Timesheet ─────────────────────────────────────────────────────

export const createTimesheetSchema = z.object({
  projectId: uuid,
  taskId: uuid.optional().nullable(),
  engineerId: uuid.optional(),
  date: z.string().trim().min(1),
  minutes: z.coerce.number().int().min(1),
  description: z.string().trim().min(1),
  billable: z.coerce.boolean().default(true),
  status: z.enum(["draft", "submitted", "approved", "rejected"]).default("draft"),
});

export const updateTimesheetSchema = createTimesheetSchema.partial();

// ── Invoice ───────────────────────────────────────────────────────

// Invoice schemas moved to src/lib/validation/finance.ts (ADR-0003) - kept
// this file focused on non-finance entities.
