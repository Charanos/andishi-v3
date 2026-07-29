import type { WorkProject } from "@/content/work";
import type { PublicProject } from "@/lib/api/public-client";
import type { CaseStudyProject } from "@/types/case-study";

/**
 * mapApiProjectToWorkProject
 *
 * Maps a DB-backed public project onto the static WorkProject shape used by
 * the /work listing grid and its project cards. Kept intentionally thin —
 * only the fields the listing UI needs.
 */
export function mapApiProjectToWorkProject(apiProj: PublicProject): WorkProject {
  return {
    // publicSlug so /work/[slug] links and lookups resolve correctly
    id: apiProj.publicSlug || apiProj.id,
    sector: apiProj.vertical || "saas",
    sectorLabel: (
      (apiProj.serviceType ? apiProj.serviceType.replace(/-/g, " ") : "") +
      " / " +
      (apiProj.vertical || "")
    ).toUpperCase(),
    title: apiProj.title,
    shortTitle: apiProj.title,
    description: apiProj.challenge || "",
    challenge: apiProj.challenge || "",
    solution: apiProj.solution || "",
    image: apiProj.coverImageUrl || "/images/project1.webp",
    status:
      apiProj.status === "completed" ? "Live" : apiProj.status === "active" ? "Beta" : "Shipped",
    metric: apiProj.outcome || "",
    metricLabel: apiProj.outcomeLabel || "",
    timeline: apiProj.targetDate || "Flexible",
    location: apiProj.clientName || "Global-ready",
    featured: apiProj.featured || apiProj.featuredOrder === 1,
    imageHeight: "mid",
    tags: apiProj.stackTags || [],
    metrics: apiProj.results?.length
      ? apiProj.results.map((r) => ({ value: r.metric, label: r.label, tone: "success" as const }))
      : [
          {
            value: apiProj.outcome || "",
            label: apiProj.outcomeLabel || "",
            tone: "success" as const,
          },
        ],
  };
}

/**
 * mapApiProjectToCaseStudy
 *
 * Maps a DB-backed public project onto the rich CaseStudyProject type used
 * exclusively by the /work/[slug] detail page. Handles graceful null defaults
 * for all new fields so static fallback projects render without errors.
 */
export function mapApiProjectToCaseStudy(apiProj: PublicProject): CaseStudyProject {
  return {
    // ── Identity ──────────────────────────────────────────────────
    id: apiProj.publicSlug || apiProj.id,
    slug: apiProj.publicSlug || apiProj.id,
    dbId: apiProj.id,

    // ── Hero ──────────────────────────────────────────────────────
    title: apiProj.title,
    tagline: apiProj.tagline ?? null,
    sector: apiProj.vertical || "saas",
    sectorLabel: (
      (apiProj.serviceType ? apiProj.serviceType.replace(/-/g, " ") : "") +
      " / " +
      (apiProj.vertical || "")
    ).toUpperCase(),
    clientName: apiProj.clientName ?? null,
    coverImageUrl: apiProj.coverImageUrl || "/images/project1.webp",
    liveUrl: apiProj.liveUrl ?? null,
    repoUrl: apiProj.repoUrl ?? null,
    status:
      apiProj.status === "completed" ? "Live" : apiProj.status === "active" ? "Beta" : "Shipped",

    // ── Quick Facts Bar ───────────────────────────────────────────
    role: apiProj.role ?? null,
    teamSize: apiProj.teamSize ?? null,
    timeline: apiProj.targetDate ?? null,
    stackTags: apiProj.stackTags || [],

    // ── Summary ───────────────────────────────────────────────────
    summary: apiProj.summary ?? null,

    // ── Narrative ─────────────────────────────────────────────────
    challenge: apiProj.challenge ?? null,
    approachSteps: apiProj.approachSteps || [],
    solutionHighlights: apiProj.solutionHighlights || [],

    // ── Gallery ───────────────────────────────────────────────────
    gallery: apiProj.gallery || [],

    // ── Results & Impact ──────────────────────────────────────────
    results: apiProj.results?.length
      ? apiProj.results
      : apiProj.outcome
        ? [
            {
              id: "legacy",
              metric: apiProj.outcome,
              label: apiProj.outcomeLabel || "",
              context: null,
            },
          ]
        : [],
    testimonial: apiProj.testimonial ?? null,

    // ── Tech Stack ────────────────────────────────────────────────
    techStackDetails: apiProj.techStackDetails || [],

    // ── SEO ───────────────────────────────────────────────────────
    seoMetaTitle: apiProj.seoMetaTitle ?? null,
    seoMetaDescription: apiProj.seoMetaDescription ?? null,
    seoOgImageUrl: apiProj.seoOgImageUrl ?? null,

    // ── Ad Campaign ───────────────────────────────────────────────
    adExcerpt: apiProj.adExcerpt ?? null,
    featured: apiProj.featured || false,

    // ── Lifecycle ─────────────────────────────────────────────────
    caseStudyStatus: apiProj.caseStudyStatus ?? "published",
    publishedAt: apiProj.publishedAt ?? null,
    updatedAt: apiProj.updatedAt ?? null,
  };
}

/**
 * mapStaticProjectToCaseStudy
 *
 * Converts a static WorkProject (src/content/work.ts) to a CaseStudyProject
 * so the detail page can render static fallback projects with graceful null
 * values for new-only fields.
 */
export function mapStaticProjectToCaseStudy(wp: WorkProject): CaseStudyProject {
  return {
    id: wp.id,
    slug: wp.id,
    dbId: null, // No DB record — admin CRUD unavailable for static projects

    title: wp.title,
    tagline: null,
    sector: wp.sector,
    sectorLabel: wp.sectorLabel,
    clientName: wp.location || null,
    coverImageUrl: wp.image,
    liveUrl: null,
    repoUrl: null,
    status: wp.status,

    role: null,
    teamSize: null,
    timeline: wp.timeline,
    stackTags: wp.tags,

    summary: null,
    challenge: wp.challenge,
    approachSteps: [],
    solutionHighlights: [],

    gallery: [],

    results: wp.metrics.map((m, i) => ({
      id: `static-${i}`,
      metric: m.value,
      label: m.label,
      context: null,
    })),
    testimonial: null,

    techStackDetails: wp.tags.map((t) => ({ name: t, reason: null })),

    seoMetaTitle: null,
    seoMetaDescription: wp.description || null,
    seoOgImageUrl: null,

    adExcerpt: null,
    featured: wp.featured || false,

    caseStudyStatus: "published",
    publishedAt: null,
    updatedAt: null,
  };
}
