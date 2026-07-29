import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyExperience } from "@/components/marketing/case-study-experience";
import { JsonLd } from "@/components/marketing/json-ld";
import { workProjects } from "@/content/work";
import { siteConfig } from "@/config/site";
import { fetchPublicProjectBySlugFull, fetchPublicProjects } from "@/lib/api/public-client";
import {
  mapApiProjectToCaseStudy,
  mapStaticProjectToCaseStudy,
  mapApiProjectToWorkProject,
} from "@/lib/work-mapper";
import { casedokCaseStudy } from "@/content/work";
import { getSession } from "@/lib/auth/session";
import type { CaseStudyProject } from "@/types/case-study";

type Props = { params: Promise<{ slug: string }> };

// Pre-render static fallback projects at build time.
// DB-backed case studies render on-demand (dynamicParams defaults to true).
export function generateStaticParams() {
  return workProjects.map((project) => ({ slug: project.id }));
}

async function resolveCaseStudy(slug: string, isAdmin: boolean): Promise<CaseStudyProject | null> {
  // Try DB first — full rich payload
  const dbProject = await fetchPublicProjectBySlugFull(slug, {
    preview: isAdmin, // admins can preview draft projects
  });
  if (dbProject) return mapApiProjectToCaseStudy(dbProject);

  // Use the rich static casedok object directly (has full narrative & architecture)
  if (slug === "casedok") return casedokCaseStudy;

  // Fall back to static content (no DB record yet)
  const staticProject = workProjects.find((item) => item.id === slug);
  return staticProject ? mapStaticProjectToCaseStudy(staticProject) : null;
}

async function resolveRelated(project: CaseStudyProject): Promise<CaseStudyProject[]> {
  const dbProjects = await fetchPublicProjects();
  if (dbProjects.length > 0) {
    return dbProjects
      .map(mapApiProjectToCaseStudy)
      .filter((item) => item.slug !== project.slug)
      .sort((a) => (a.sector === project.sector ? -1 : 1))
      .slice(0, 2);
  }

  return workProjects
    .filter((item) => item.id !== project.slug)
    .sort((a) => (a.sector === project.sector ? -1 : 1))
    .slice(0, 2)
    .map(mapStaticProjectToCaseStudy);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Use public fetch for metadata (no preview)
  const dbProject = await fetchPublicProjectBySlugFull(slug);
  const staticProject = workProjects.find((item) => item.id === slug);

  const title = dbProject?.title ?? staticProject?.title;
  const tagline = dbProject?.tagline ?? null;
  const description =
    dbProject?.seoMetaDescription ??
    tagline ??
    dbProject?.challenge ??
    staticProject?.description ??
    siteConfig.description;
  const coverImage =
    dbProject?.seoOgImageUrl ??
    dbProject?.coverImageUrl ??
    (staticProject?.image ? `${siteConfig.url}${staticProject.image}` : null);
  const metaTitle = dbProject?.seoMetaTitle ?? (title ? `${title} — Case Study | Andishi` : null);
  const canonicalUrl = `${siteConfig.url}/work/${slug}`;

  if (!title) return {};

  return {
    title: metaTitle ?? `${title} — Case Study | Andishi`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: metaTitle ?? `${title} — Case Study | Andishi`,
      description: description ?? undefined,
      url: canonicalUrl,
      type: "article",
      siteName: siteConfig.name,
      ...(coverImage && {
        images: [{ url: coverImage, width: 1200, height: 630, alt: `${title} — Andishi` }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle ?? `${title} — Case Study | Andishi`,
      description: description ?? undefined,
      ...(coverImage && { images: [coverImage] }),
    },
  };
}

export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params;

  // Server-side admin check — never trust the client for this
  const session = await getSession();
  const isAdmin = session?.user?.role === "admin";

  const project = await resolveCaseStudy(slug, isAdmin);
  if (!project) notFound();

  // Non-admin cannot see archived projects
  if (!isAdmin && project.caseStudyStatus === "archived") notFound();

  const related = await resolveRelated(project);

  // ── JSON-LD schemas ───────────────────────────────────────────────

  const canonicalUrl = `${siteConfig.url}/work/${slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary ?? project.challenge ?? "",
    image: project.seoOgImageUrl ?? project.coverImageUrl,
    author: { "@type": "Organization", name: "Andishi", url: siteConfig.url },
    creator: { "@type": "Organization", name: "Andishi", url: siteConfig.url },
    url: canonicalUrl,
    keywords: project.stackTags.join(", "),
    ...(project.publishedAt && { datePublished: project.publishedAt }),
    ...(project.updatedAt && { dateModified: project.updatedAt }),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Work", item: `${siteConfig.url}/work` },
      { "@type": "ListItem", position: 3, name: project.title, item: canonicalUrl },
    ],
  };

  // Review schema — only emit when we have a real testimonial
  const reviewSchema = project.testimonial
    ? {
        "@context": "https://schema.org",
        "@type": "Review",
        itemReviewed: {
          "@type": "Service",
          name: project.title,
          provider: { "@type": "Organization", name: "Andishi", url: siteConfig.url },
        },
        reviewBody: project.testimonial.quote,
        author: {
          "@type": "Person",
          name: project.testimonial.authorName,
          jobTitle: project.testimonial.authorTitle,
        },
      }
    : null;

  return (
    <>
      <CaseStudyExperience
        project={project}
        related={related}
        isAdmin={isAdmin}
        projectId={project.dbId}
      />
      <JsonLd id="work-article-schema" data={articleSchema} />
      <JsonLd id="work-breadcrumb-schema" data={breadcrumbSchema} />
      {reviewSchema && <JsonLd id="work-review-schema" data={reviewSchema} />}
    </>
  );
}
