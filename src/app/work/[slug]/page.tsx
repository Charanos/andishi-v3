import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { JsonLd } from "@/components/marketing/json-ld";
import { FinalRouteCta, GlassPanel, PublicPageShell, RouteHero, SectionBlock } from "@/components/marketing/public-page";
import { workProjects } from "@/content/work";
import { siteConfig } from "@/config/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return workProjects.map((project) => ({ slug: project.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = workProjects.find((item) => item.id === slug);
  if (!project) return {};
  return {
    title: `${project.title} Case Study - Andishi`,
    description: project.description,
  };
}

export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = workProjects.find((item) => item.id === slug);
  if (!project) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.title,
    description: project.description,
    image: `${siteConfig.url}${project.image}`,
    author: { "@type": "Organization", name: "Andishi" },
    publisher: { "@type": "Organization", name: "Andishi" },
    mainEntityOfPage: `${siteConfig.url}/work/${project.id}`,
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
      <PublicPageShell>
        <RouteHero
          eyebrow={project.sectorLabel}
          title={project.title}
          body={project.description}
          primary={{ href: "/start-project", label: "Hire similar talent" }}
          secondary={{ href: "/work", label: "All case studies" }}
        />
        <section className="px-5 pb-10 sm:px-8 lg:pb-16">
          <div className="mx-auto max-w-7xl">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--surface-high)]">
              <Image src={project.image} alt={project.title} fill sizes="(min-width: 1024px) 80rem, 100vw" className="object-cover" priority />
            </div>
          </div>
        </section>
        <SectionBlock eyebrow="Case study" title="Challenge, solution, result.">
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              ["Challenge", project.challenge],
              ["Solution", project.solution],
              ["Result", `${project.metric} ${project.metricLabel} across a ${project.timeline} build.`],
            ].map(([title, body]) => (
              <GlassPanel key={title}>
                <h2 className="text-[1.08rem] font-medium text-[var(--on-surface)]">{title}</h2>
                <p className="mt-4 text-[0.96rem] leading-relaxed text-[var(--on-surface-dim)]">{body}</p>
              </GlassPanel>
            ))}
          </div>
        </SectionBlock>
        <SectionBlock eyebrow="Metrics" title="What changed.">
          <div className="grid gap-4 md:grid-cols-4">
            {project.metrics.map((metric) => (
              <GlassPanel key={metric.label}>
                <p className="font-mono text-[1.65rem] leading-none text-[var(--on-surface)]">{metric.value}</p>
                <p className="label-caps mt-3 text-[var(--on-surface-dim)]">{metric.label}</p>
              </GlassPanel>
            ))}
          </div>
        </SectionBlock>
        <FinalRouteCta
          title="Need this level of ownership?"
          body="Share the system, stack, and current bottleneck. We will match the right senior engineer or tell you plainly if we cannot."
        />
      </PublicPageShell>
      <JsonLd id="work-article-schema" data={articleSchema} />
      <JsonLd id="work-breadcrumb-schema" data={breadcrumbSchema} />
    </>
  );
}
