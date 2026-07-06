import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyExperience } from "@/components/marketing/case-study-experience";
import { JsonLd } from "@/components/marketing/json-ld";
import { workProjects, type WorkProject } from "@/content/work";
import { siteConfig } from "@/config/site";
import { fetchPublicProjectBySlug, fetchPublicProjects } from "@/lib/api/public-client";
import { mapApiProjectToWorkProject } from "@/lib/work-mapper";

type Props = { params: Promise<{ slug: string }> };

// Pre-renders the static fallback set; DB-backed case studies (unknown at
// build time) render on-demand since dynamicParams defaults to true.
export function generateStaticParams() {
  return workProjects.map((project) => ({ slug: project.id }));
}

async function resolveProject(slug: string): Promise<WorkProject | null> {
  const dbProject = await fetchPublicProjectBySlug(slug);
  if (dbProject) return mapApiProjectToWorkProject(dbProject);

  return workProjects.find((item) => item.id === slug) ?? null;
}

async function resolveRelated(project: WorkProject): Promise<WorkProject[]> {
  const dbProjects = await fetchPublicProjects();
  if (dbProjects.length > 0) {
    return dbProjects
      .map(mapApiProjectToWorkProject)
      .filter((item) => item.id !== project.id)
      .sort((a) => (a.sector === project.sector ? -1 : 1))
      .slice(0, 2);
  }

  return workProjects
    .filter((item) => item.id !== project.id)
    .sort((a) => (a.sector === project.sector ? -1 : 1))
    .slice(0, 2);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await resolveProject(slug);
  if (!project) return {};

  return {
    title: `${project.title} - Case Study | Andishi`,
    description: project.description,
    openGraph: {
      title: `${project.title} - Case Study | Andishi`,
      description: project.description,
      images: [{ url: `${siteConfig.url}${project.image}`, width: 1200, height: 630 }],
      type: "article",
    },
  };
}

export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await resolveProject(slug);
  if (!project) notFound();

  const related = await resolveRelated(project);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    image: `${siteConfig.url}${project.image}`,
    author: { "@type": "Organization", name: "Andishi", url: siteConfig.url },
    creator: { "@type": "Organization", name: "Andishi", url: siteConfig.url },
    url: `${siteConfig.url}/work/${project.id}`,
    keywords: project.tags.join(", "),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Work", item: `${siteConfig.url}/work` },
      { "@type": "ListItem", position: 3, name: project.title, item: `${siteConfig.url}/work/${project.id}` },
    ],
  };

  return (
    <>
      <CaseStudyExperience project={project} related={related} />
      <JsonLd id="work-article-schema" data={articleSchema} />
      <JsonLd id="work-breadcrumb-schema" data={breadcrumbSchema} />
    </>
  );
}
