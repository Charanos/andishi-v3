import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IconArrowRight, IconCircleCheck } from "@tabler/icons-react";
import { JsonLd } from "@/components/marketing/json-ld";
import { EngineerCard } from "@/components/marketing/engineer-card";
import { FaqList } from "@/components/marketing/faq-list";
import {
  FinalRouteCta,
  GlassPanel,
  PublicPageShell,
  RouteHero,
  SectionBlock,
} from "@/components/marketing/public-page";
import { LinkButton } from "@/components/ui/button";
import { getEngineersByDomain } from "@/data/engineers";
import { skillDomainList, skillDomains, type SkillDomain } from "@/data/skills";
import { siteConfig } from "@/config/site";

type Props = {
  params: Promise<{ domain: string }>;
};

function isSkillDomain(value: string): value is SkillDomain {
  return value in skillDomains;
}

export function generateStaticParams() {
  return skillDomainList.map((domain) => ({ domain: domain.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain: slug } = await params;
  if (!isSkillDomain(slug)) return {};
  const domain = skillDomains[slug];
  return {
    title: `${domain.label} Engineers - Andishi`,
    description: domain.subheadline,
  };
}

export default async function SkillDomainPage({ params }: Props) {
  const { domain: slug } = await params;
  if (!isSkillDomain(slug)) notFound();

  const domain = skillDomains[slug];
  const teasers = getEngineersByDomain(slug, 3);
  const pageUrl = `${siteConfig.url}/skills/${slug}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${domain.label} engineering talent`,
    provider: { "@type": "Organization", name: "Andishi", url: siteConfig.url },
    serviceType: `${domain.label} software engineering`,
    areaServed: ["United States", "United Kingdom", "European Union", "Africa"],
    description: domain.subheadline,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: domain.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Skills", item: `${siteConfig.url}/skills` },
      { "@type": "ListItem", position: 3, name: domain.label, item: pageUrl },
    ],
  };

  return (
    <>
      <PublicPageShell>
        <RouteHero
          eyebrow={domain.eyebrow}
          title={domain.h1}
          body={domain.subheadline}
          primary={{ href: "/start-project", label: `Brief us on ${domain.label}` }}
          secondary={{ href: "/engineers", label: "Browse engineers" }}
        />

        <SectionBlock eyebrow="What they build" title={`Where ${domain.label.toLowerCase()} engineers help fastest.`}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {domain.useCases.map((useCase, index) => (
              <GlassPanel key={useCase}>
                <p className="font-mono text-[0.72rem] text-[var(--secondary)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-5 text-[0.98rem] leading-relaxed text-[var(--on-surface-dim)]">{useCase}</p>
              </GlassPanel>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock eyebrow="Core technologies" title="The stack signal we match against.">
          <div className="flex flex-wrap gap-3">
            {domain.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 font-mono text-[0.86rem] text-[var(--on-surface)] backdrop-blur-xl"
              >
                {tech}
              </span>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock eyebrow="Why Andishi" title={`Why teams use Andishi for ${domain.label}.`}>
          <div className="grid gap-4 lg:grid-cols-3">
            {domain.differentiators.map((item) => (
              <GlassPanel key={item}>
                <p className="flex gap-3 text-[0.98rem] leading-relaxed text-[var(--on-surface-dim)]">
                  <IconCircleCheck size={18} stroke={1.8} className="mt-1 shrink-0 text-[var(--tertiary)]" />
                  {item}
                </p>
              </GlassPanel>
            ))}
          </div>
        </SectionBlock>

        {teasers.length > 0 && (
          <SectionBlock eyebrow="Engineer teasers" title={`Available ${domain.label.toLowerCase()} profiles.`}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {teasers.map((engineer) => (
                <EngineerCard key={engineer.slug} engineer={engineer} />
              ))}
            </div>
            <div className="mt-8">
              <LinkButton href="/engineers" variant="glass">
                See all engineers
                <IconArrowRight size={16} stroke={1.8} />
              </LinkButton>
            </div>
          </SectionBlock>
        )}

        <SectionBlock eyebrow="Domain FAQ" title={`${domain.label} questions, answered.`}>
          <FaqList items={domain.faq} />
        </SectionBlock>

        <FinalRouteCta
          title={`Brief us on your ${domain.label} need.`}
          body="Share the stack, current team shape, bottleneck, and timeline. We will match for senior ownership, not just keywords."
        />
      </PublicPageShell>
      <JsonLd id="skill-service-schema" data={serviceSchema} />
      <JsonLd id="skill-faq-schema" data={faqSchema} />
      <JsonLd id="skill-breadcrumb-schema" data={breadcrumbSchema} />
    </>
  );
}
