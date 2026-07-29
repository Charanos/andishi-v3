/**
 * src/types/case-study.ts
 *
 * The rich CaseStudyProject type used exclusively by the /work/[slug] detail page.
 * Distinct from the leaner WorkProject type (src/content/work.ts) which powers
 * the /work listing grid. CaseStudyProject is a superset — it carries every field
 * a full case-study narrative requires, including structured content, SEO overrides,
 * admin CRUD metadata, and ad campaign fields.
 *
 * Both static fallback projects (src/content/work.ts) and DB-backed projects
 * are mapped to this type via mapApiProjectToCaseStudy() before reaching the page.
 * Static projects will have `null` for new-only fields — all sections that depend on
 * new fields must render gracefully when those fields are missing.
 */

export type CaseStudyStatus = "draft" | "published" | "archived";

export interface CaseStudyApproachStep {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  order: number;
}

export interface CaseStudySolutionHighlight {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  order: number;
}

export interface CaseStudyGalleryImage {
  id: string;
  url: string;
  alt: string;
  width?: number | null;
  height?: number | null;
  order: number;
}

export interface CaseStudyResultMetric {
  id: string;
  metric: string; // e.g. "98.3%"
  label: string; // e.g. "payment match rate"
  context?: string | null; // e.g. "measured over 30 days post-launch"
}

export interface CaseStudyTestimonial {
  quote: string;
  authorName: string;
  authorTitle: string;
  authorAvatarUrl?: string | null;
}

export interface CaseStudyTechDetail {
  name: string;
  reason?: string | null;
}

// ── Main type ────────────────────────────────────────────────────────

export interface CaseStudyProject {
  // ── Identity ────────────────────────────────────────────────────
  id: string;
  slug: string; // publicSlug for DB projects; static id for fallback projects

  // ── Hero ────────────────────────────────────────────────────────
  title: string;
  tagline: string | null; // one-sentence value prop
  sector: string; // raw sector value e.g. "fintech"
  sectorLabel: string; // display label e.g. "Fintech / Payments"
  clientName: string | null;
  coverImageUrl: string; // always has a value (fallback to static image)
  liveUrl: string | null; // primary CTA target
  repoUrl: string | null; // secondary CTA (optional, public repos only)
  status: "Live" | "Shipped" | "Beta";

  // ── Quick Facts Bar ─────────────────────────────────────────────
  role: string | null; // e.g. "Lead Engineer"
  teamSize: string | null; // e.g. "3 engineers"
  timeline: string | null; // e.g. "5 weeks"
  stackTags: string[];

  // ── AEO / Summary block ─────────────────────────────────────────
  summary: string | null; // 40-60 word TL;DR

  // ── Narrative sections ──────────────────────────────────────────
  challenge: string | null;
  approachSteps: CaseStudyApproachStep[];
  solutionHighlights: CaseStudySolutionHighlight[];

  // ── Gallery ──────────────────────────────────────────────────────
  gallery: CaseStudyGalleryImage[];

  // ── Results & Impact ─────────────────────────────────────────────
  results: CaseStudyResultMetric[];
  testimonial: CaseStudyTestimonial | null;

  // ── Tech Stack ───────────────────────────────────────────────────
  techStackDetails: CaseStudyTechDetail[];

  // ── SEO overrides (fallback to auto-generated defaults) ──────────
  seoMetaTitle: string | null;
  seoMetaDescription: string | null;
  seoOgImageUrl: string | null;

  // ── Ad campaign ──────────────────────────────────────────────────
  adExcerpt: string | null; // ≤125 chars
  featured: boolean;

  // ── Admin metadata (null for static fallback projects) ───────────
  dbId: string | null; // actual DB uuid (used for admin CRUD calls)
  caseStudyStatus: CaseStudyStatus;
  publishedAt: string | null; // ISO timestamp
  updatedAt: string | null;
}
