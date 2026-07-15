import type { WorkProject } from "@/content/work";
import type { PublicProject } from "@/lib/api/public-client";

/**
 * Maps a DB-backed public project (GET /api/work) onto the static
 * `WorkProject` shape that the /work listing and case-study detail UI were
 * originally built around - lets both stay presentational while the data
 * source moves from src/content/work.ts to the real projects table.
 */
export function mapApiProjectToWorkProject(apiProj: PublicProject): WorkProject {
  return {
    // publicSlug (not the raw DB id) so /work/[slug] links and lookups
    // resolve correctly - GET /api/work/[slug] looks up by publicSlug.
    id: apiProj.publicSlug || apiProj.id,
    sector: apiProj.vertical || "saas",
    sectorLabel: (
      (apiProj.serviceType ? apiProj.serviceType.replace("-", " ") : "") +
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
    featured: apiProj.featuredOrder === 1,
    imageHeight: "mid",
    tags: apiProj.stackTags || [],
    metrics: [{ value: apiProj.outcome || "", label: apiProj.outcomeLabel || "", tone: "success" }],
  };
}
