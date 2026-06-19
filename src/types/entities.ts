import type { Engineer } from "@/data/engineers";

// ── Domain types ──────────────────────────────────────────────────

export type EngineerDomain = Engineer["domains"][number] | "mobile" | "backend";

// ── Status types ──────────────────────────────────────────────────

export type BriefStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "matching"
  | "shortlisted"
  | "scoping"   // NEW - June 2026: build briefs entering project scoping
  | "closed";

export type MatchStatus =
  | "proposed"
  | "client_reviewing"
  | "intro_scheduled"
  | "intro_completed"
  | "accepted"
  | "declined";

export type PlacementStatus = "active" | "paused" | "completed" | "terminated";
export type ProjectStatus = "scoping" | "active" | "review" | "completed" | "on_hold";
export type MilestoneStatus = "pending" | "in_progress" | "submitted" | "approved" | "revision";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

// ── NEW June 2026 - Software studio repositioning types ───────────

/** The two tracks Andishi now serves: build a product, or place an engineer */
export type BriefType = "build" | "hire";

/**
 * Service type slugs - maps 1:1 with /services/[slug] routes
 * and the serviceType field on briefs and projects tables.
 */
export type ServiceType =
  | "custom-software"
  | "saas-development"
  | "ai-systems"
  | "mobile-apps"
  | "enterprise-software"
  | "blockchain"
  | "apis-integrations"
  | "product-strategy";

/**
 * Industry verticals for case study filtering on /work
 */
export type Vertical =
  | "fintech"
  | "healthtech"
  | "logistics"
  | "saas"
  | "ecommerce"
  | "edtech"
  | "proptech"
  | "web3"
  | "enterprise"
  | "consumer";

/**
 * Geographic regions for global client tracking
 */
export type OrgRegion =
  | "east_africa"
  | "north_america"
  | "europe"
  | "gcc"
  | "global";

// ── Organization ──────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  logoUrl?: string;
  billingEmail?: string;
  region?: OrgRegion;  // NEW
  country?: string;     // NEW - ISO 3166-1 alpha-2
  primaryContactUserId: string;
  createdAt: string;
  updatedAt: string;
}

// ── Briefs - Discriminated union ──────────────────────────────────

/** Fields shared by both build and hire briefs */
interface BriefBase {
  id: string;
  organizationId: string;
  submittedById: string;
  title: string;
  status: BriefStatus;
  andishiNotes?: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

/** A build brief - Andishi will design and deliver software */
export interface BuildBrief extends BriefBase {
  briefType: "build";
  serviceType?: ServiceType;
  problemStatement?: string;
  projectBudget?: string;
  projectTimeline?: string;
  targetLaunchDate?: string;
  hasExistingProduct?: boolean;
  existingProductUrl?: string;
  buildStackPreferences: string[];
}

/** A hire brief - client wants to place a senior engineer on their own team */
export interface HireBrief extends BriefBase {
  briefType: "hire";
  role: string;
  domain: EngineerDomain;
  seniority: "mid" | "senior" | "lead" | "architect";
  stackTags: string[];
  timeline: string;
  engagementModel: "project" | "embedded" | "team_extension";
  description: string;
}

/** Discriminated union - use `brief.briefType === "build"` to narrow */
export type AnyBrief = BuildBrief | HireBrief;

/**
 * @deprecated Use BuildBrief | HireBrief instead.
 * Kept temporarily for dashboard components that haven't been migrated.
 */
export type HiringBrief = HireBrief;

// ── Match ─────────────────────────────────────────────────────────

export interface Match {
  id: string;
  briefId: string;
  engineerId: string;
  status: MatchStatus;
  proposedAt: string;
  introScheduledAt?: string;
  introCompletedAt?: string;
  acceptedAt?: string;
  adminNotes?: string;
  clientNotes?: string;
}

// ── Placement ─────────────────────────────────────────────────────

export interface Placement {
  id: string;
  matchId: string;
  engineerId: string;
  organizationId: string;
  startDate: string;
  endDate?: string;
  engagementModel: "project" | "embedded" | "team_extension";
  status: PlacementStatus;
  weeklyHours: number;
  currency: "USD" | "EUR" | "GBP";
  createdAt: string;
}

// ── Project - includes case study fields ──────────────────────────

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  status: MilestoneStatus;
  dueDate?: string;
  submittedAt?: string;
  approvedAt?: string;
}

export interface Project {
  id: string;
  briefId?: string;
  placementId?: string;
  organizationId: string;
  engineerIds: string[];
  title: string;
  description: string;
  status: ProjectStatus;
  startDate?: string;
  targetDate?: string;
  stackTags: string[];
  milestones: Milestone[];

  // NEW - June 2026: case study fields
  serviceType?: ServiceType;
  vertical?: Vertical;
  isPublic: boolean;
  publicSlug?: string;
  coverImageUrl?: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  outcomeLabel?: string;
  clientQuote?: string;
  clientQuoteAttribution?: string;
  clientName?: string;
  featuredOrder?: number;

  createdAt: string;
  updatedAt: string;
}

/** Minimal public-facing project record returned by GET /api/work */
export interface PublicProject {
  id: string;
  title: string;
  publicSlug: string;
  serviceType?: ServiceType;
  vertical?: Vertical;
  coverImageUrl?: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  outcomeLabel?: string;
  clientQuote?: string;
  clientQuoteAttribution?: string;
  clientName?: string;
  stackTags: string[];
  featuredOrder?: number;
  status: ProjectStatus;
  startDate?: string;
  targetDate?: string;
}

// ── Timesheet ─────────────────────────────────────────────────────

export interface TimesheetEntry {
  id: string;
  projectId: string;
  engineerId: string;
  date: string;
  minutes: number;
  description: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

// ── Invoice ───────────────────────────────────────────────────────

export interface Invoice {
  id: string;
  organizationId: string;
  engineerId?: string;
  projectId?: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  currency: "USD" | "EUR" | "GBP";
  status: InvoiceStatus;
  issuedAt?: string;
  paidAt?: string;
  createdAt: string;
}

// ── Activity ──────────────────────────────────────────────────────

export type ActivityEntityType =
  | "brief"
  | "match"
  | "placement"
  | "project"
  | "invoice"
  | "profile"
  | "system"
  | "contact_inquiry"; // NEW - June 2026

export interface ActivityEvent {
  id: string;
  type: string;  // e.g. "brief_build_submitted" | "project_published"
  actorUserId?: string;
  actorRole?: string;
  organizationId?: string;
  engineerId?: string;
  entityType: ActivityEntityType;
  entityId: string;
  label: string;
  description?: string;
  metadata?: Record<string, unknown>;
  visibleTo: string[];
  createdAt: string;
}
