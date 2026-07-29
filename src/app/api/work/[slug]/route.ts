import { NextResponse } from "next/server";
import { and, eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

/**
 * GET /api/work/[slug]
 *
 * Public endpoint — no authentication required.
 * Returns a single published project where publicSlug matches.
 * Powers the /work/[slug] case study detail page.
 *
 * Admin preview: pass ?preview=true with a valid admin session to see draft projects.
 * Admin-only markup is never returned to non-admin sessions.
 */
export async function GET(req: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const url = new URL(req.url);
  const isPreviewRequested = url.searchParams.get("preview") === "true";

  // Check session for admin preview — server-side, never trust client
  let isAdmin = false;
  if (isPreviewRequested) {
    const session = await getSession();
    isAdmin = session?.user?.role === "admin";
  }

  // Build the visibility filter
  const visibilityFilter = isAdmin
    ? // Admin preview: can see draft + published (not archived)
      or(eq(projects.caseStudyStatus, "published"), eq(projects.caseStudyStatus, "draft"))
    : // Public: only published
      eq(projects.caseStudyStatus, "published");

  const [result] = await getDb()
    .select({
      // ── Identity ──────────────────────────────────────────────
      id: projects.id,
      title: projects.title,
      publicSlug: projects.publicSlug,
      serviceType: projects.serviceType,
      vertical: projects.vertical,
      status: projects.status,
      // ── Hero ──────────────────────────────────────────────────
      coverImageUrl: projects.coverImageUrl,
      tagline: projects.tagline,
      liveUrl: projects.liveUrl,
      repoUrl: projects.repoUrl,
      featured: projects.featured,
      clientName: projects.clientName,
      // ── Quick Facts ───────────────────────────────────────────
      role: projects.role,
      teamSize: projects.teamSize,
      startDate: projects.startDate,
      targetDate: projects.targetDate,
      stackTags: projects.stackTags,
      // ── Summary / AEO ─────────────────────────────────────────
      summary: projects.summary,
      // ── Narrative sections ────────────────────────────────────
      challenge: projects.challenge,
      solution: projects.solution,
      approachSteps: projects.approachSteps,
      solutionHighlights: projects.solutionHighlights,
      // ── Gallery ───────────────────────────────────────────────
      gallery: projects.gallery,
      // ── Results & Impact ──────────────────────────────────────
      outcome: projects.outcome,
      outcomeLabel: projects.outcomeLabel,
      results: projects.results,
      testimonial: projects.testimonial,
      // Legacy client quote (preserved for backward compat)
      clientQuote: projects.clientQuote,
      clientQuoteAttribution: projects.clientQuoteAttribution,
      // ── Tech Stack ────────────────────────────────────────────
      techStackDetails: projects.techStackDetails,
      // ── SEO overrides ─────────────────────────────────────────
      seoMetaTitle: projects.seoMetaTitle,
      seoMetaDescription: projects.seoMetaDescription,
      seoOgImageUrl: projects.seoOgImageUrl,
      // ── Ad Campaign ───────────────────────────────────────────
      adExcerpt: projects.adExcerpt,
      featuredOrder: projects.featuredOrder,
      // ── Lifecycle ─────────────────────────────────────────────
      caseStudyStatus: projects.caseStudyStatus,
      publishedAt: projects.publishedAt,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .where(and(eq(projects.publicSlug, slug), visibilityFilter!))
    .limit(1);

  if (!result) return NextResponse.json({ project: null }, { status: 404 });

  // Normalize JSONB fields — Neon returns them as plain objects; ensure arrays
  const normalized = {
    ...result,
    stackTags: (result.stackTags as string[]) || [],
    approachSteps: (result.approachSteps as unknown[]) || [],
    solutionHighlights: (result.solutionHighlights as unknown[]) || [],
    gallery: (result.gallery as unknown[]) || [],
    results: (result.results as unknown[]) || [],
    techStackDetails: (result.techStackDetails as unknown[]) || [],
    testimonial: result.testimonial ?? null,
    // Timestamps → ISO strings for the client
    publishedAt: result.publishedAt?.toISOString() ?? null,
    updatedAt: result.updatedAt?.toISOString() ?? null,
  };

  return NextResponse.json({ project: normalized });
}
