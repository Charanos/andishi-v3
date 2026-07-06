import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projects } from "@/db/schema";

/**
 * GET /api/work/[slug]
 *
 * Public endpoint - no authentication required.
 * Returns a single project where isPublic = true and publicSlug matches.
 * Powers the /work/[slug] case study detail page.
 */
export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  const [result] = await getDb()
    .select({
      id: projects.id,
      title: projects.title,
      publicSlug: projects.publicSlug,
      serviceType: projects.serviceType,
      vertical: projects.vertical,
      coverImageUrl: projects.coverImageUrl,
      challenge: projects.challenge,
      solution: projects.solution,
      outcome: projects.outcome,
      outcomeLabel: projects.outcomeLabel,
      clientQuote: projects.clientQuote,
      clientQuoteAttribution: projects.clientQuoteAttribution,
      clientName: projects.clientName,
      stackTags: projects.stackTags,
      featuredOrder: projects.featuredOrder,
      status: projects.status,
      startDate: projects.startDate,
      targetDate: projects.targetDate,
    })
    .from(projects)
    .where(and(eq(projects.isPublic, true), eq(projects.publicSlug, slug)))
    .limit(1);

  if (!result) return NextResponse.json({ project: null }, { status: 404 });
  return NextResponse.json({ project: result });
}
