import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projects } from "@/db/schema";

/**
 * GET /api/work
 *
 * Public endpoint - no authentication required.
 * Returns all projects where isPublic = true, ordered by featuredOrder.
 * Supports optional ?service= and ?vertical= query filters.
 *
 * Powers the /work page case study grid.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const service = searchParams.get("service");
  const vertical = searchParams.get("vertical");

  // Build conditions - always filter to public projects only
  const conditions = [eq(projects.isPublic, true)];

  if (service && service !== "all") {
    conditions.push(eq(projects.serviceType, service));
  }

  if (vertical && vertical !== "all") {
    conditions.push(eq(projects.vertical, vertical));
  }

  const result = await getDb()
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
    .where(and(...conditions))
    .orderBy(asc(projects.featuredOrder));

  return NextResponse.json({ work: result });
}
