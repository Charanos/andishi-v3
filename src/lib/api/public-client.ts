/**
 * src/lib/api/public-client.ts
 *
 * Lightweight typed fetchers for **public** API endpoints (no auth required).
 * These are used both from:
 *   - Server Components (SSR): called directly in page.tsx during the request
 *   - Client Components: called via fetch() for client-side revalidation
 *
 * All functions return data or a sensible empty/null default so callers never
 * need to handle missing data defensively outside of explicit UI states.
 */

import type { Testimonial } from "@/db/schema/testimonials";
import type { JobOpening } from "@/db/schema/careers";
import type { BlogPost } from "@/data/blog";
import { mapBlogPostRow } from "@/lib/blog-mapper";

// ── Public project type (exposed via /api/work and /api/work/[slug]) ─────────

export interface PublicProject {
  id: string;
  title: string;
  publicSlug: string | null;
  serviceType: string | null;
  vertical: string | null;
  coverImageUrl: string | null;
  // Basic case study content (original fields)
  challenge: string | null;
  solution: string | null;
  outcome: string | null;
  outcomeLabel: string | null;
  clientQuote: string | null;
  clientQuoteAttribution: string | null;
  clientName: string | null;
  stackTags: string[];
  featuredOrder: number | null;
  status: string;
  startDate: string | null;
  targetDate: string | null;

  // ── Rich case study fields (Phase 2 - July 2026) ────────────────
  tagline: string | null;
  summary: string | null;
  role: string | null;
  teamSize: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  featured: boolean;

  approachSteps: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl?: string | null;
    order: number;
  }>;

  solutionHighlights: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl?: string | null;
    order: number;
  }>;

  gallery: Array<{
    id: string;
    url: string;
    alt: string;
    width?: number | null;
    height?: number | null;
    order: number;
  }>;

  results: Array<{
    id: string;
    metric: string;
    label: string;
    context?: string | null;
  }>;

  testimonial: {
    quote: string;
    authorName: string;
    authorTitle: string;
    authorAvatarUrl?: string | null;
  } | null;

  techStackDetails: Array<{
    name: string;
    reason?: string | null;
  }>;

  // SEO overrides
  seoMetaTitle: string | null;
  seoMetaDescription: string | null;
  seoOgImageUrl: string | null;

  // Ad campaign
  adExcerpt: string | null;

  // Lifecycle
  caseStudyStatus: "draft" | "published" | "archived";
  publishedAt: string | null;
  updatedAt: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Testimonials
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches active public testimonials.
 * Called server-side in page.tsx to avoid client-side data fetch flicker.
 */
export async function fetchPublicTestimonials(
  options: { featuredOnly?: boolean; baseUrl?: string } = {},
): Promise<Testimonial[]> {
  const base = options.baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = new URL("/api/testimonials", base);
  if (options.featuredOnly) url.searchParams.set("featured", "true");

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 300 }, // 5 minutes server-side cache
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.testimonials ?? [];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Blog Posts
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchPublicBlogPosts(
  options: { category?: string; baseUrl?: string } = {},
): Promise<BlogPost[]> {
  const base = options.baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = new URL("/api/blog", base);
  if (options.category && options.category !== "All") {
    url.searchParams.set("category", options.category);
  }

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.posts ?? []).map(mapBlogPostRow);
  } catch {
    return [];
  }
}

export async function fetchPublicBlogPost(
  slug: string,
  baseUrl?: string,
): Promise<BlogPost | null> {
  const base = baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const res = await fetch(`${base}/api/blog/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.post ? mapBlogPostRow(data.post) : null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public Projects (Work / Case Studies)
// ─────────────────────────────────────────────────────────────────────────────

import { STATIC_PUBLIC_PROJECTS } from "@/lib/work-mapper";

export async function fetchPublicProjects(
  options: { service?: string; vertical?: string; baseUrl?: string } = {},
): Promise<PublicProject[]> {
  const base = options.baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = new URL("/api/work", base);
  if (options.service) url.searchParams.set("service", options.service);
  if (options.vertical) url.searchParams.set("vertical", options.vertical);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
    });
    if (!res.ok) return STATIC_PUBLIC_PROJECTS;
    const data = await res.json();
    if (data.work && data.work.length > 0) {
      return data.work;
    }
    return STATIC_PUBLIC_PROJECTS;
  } catch {
    return STATIC_PUBLIC_PROJECTS;
  }
}

export async function fetchPublicProjectBySlug(
  slug: string,
  baseUrl?: string,
): Promise<PublicProject | null> {
  const base = baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const res = await fetch(`${base}/api/work/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.project ?? null;
  } catch {
    return null;
  }
}

/**
 * Full detail fetch for the case study page — returns all rich fields.
 * Passes ?preview=true so admins can see draft projects server-side.
 * Always use this in /work/[slug]/page.tsx, not fetchPublicProjectBySlug.
 */
export async function fetchPublicProjectBySlugFull(
  slug: string,
  options: { preview?: boolean; baseUrl?: string } = {},
): Promise<PublicProject | null> {
  const base = options.baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = new URL(`/api/work/${slug}`, base);
  if (options.preview) url.searchParams.set("preview", "true");

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 }, // 1 min — case study content updates more frequently
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.project ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Job Openings
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchPublicOpenings(
  options: { kind?: "freelance" | "internal" | "outsourced"; baseUrl?: string } = {},
): Promise<JobOpening[]> {
  const base = options.baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = new URL("/api/careers", base);
  if (options.kind) url.searchParams.set("kind", options.kind);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 }, // 1 minute - jobs change more frequently
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.openings ?? [];
  } catch {
    return [];
  }
}

export async function fetchPublicOpening(
  slug: string,
  baseUrl?: string,
): Promise<JobOpening | null> {
  const base = baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const res = await fetch(`${base}/api/careers/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.opening ?? null;
  } catch {
    return null;
  }
}
