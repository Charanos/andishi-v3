import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IconArrowRight, IconCircleCheck } from "@tabler/icons-react";
import { JsonLd } from "@/components/marketing/json-ld";
import { EngineerCard } from "@/components/marketing/engineer-card";
import { FaqList } from "@/components/marketing/faq-list";
import {
  GlassPanel,
  PublicPageShell,
  RouteHero,
  SectionBlock,
  textureStyle,
} from "@/components/marketing/public-page";
import { LinkButton } from "@/components/ui/button";
import { DualTrackCTA } from "@/components/marketing/dual-track-cta";
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
    title: `${domain.label} Engineering & Custom Builds - Andishi`,
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
    name: `${domain.label} Custom Software Development`,
    provider: { "@type": "Organization", name: "Andishi", url: siteConfig.url },
    serviceType: `${domain.label} Software Development`,
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
      {
        "@type": "ListItem",
        position: 2,
        name: "Skills",
        item: `${siteConfig.url}/skills`,
      },
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
          primary={{
            href: "/start-project",
            label: "Start a Project",
          }}
          secondary={{ href: "/services", label: "Explore Services" }}
        />

        <SectionBlock
          eyebrow="What we build"
          title={`Proven expertise in ${domain.label.toLowerCase()} development.`}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {domain.useCases.map((useCase, index) => (
              <GlassPanel key={useCase}>
                <p className="font-mono text-[0.72rem] text-[var(--secondary)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="my-8 text-[0.98rem] leading-relaxed text-[var(--on-surface-dim)]">
                  {useCase}
                </p>
              </GlassPanel>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock
          eyebrow="Core technologies"
          title="The tech stack we leverage."
        >
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

        <SectionBlock
          eyebrow="Why Andishi"
          title={`Why teams partner with Andishi for ${domain.label} builds.`}
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {domain.differentiators.map((item) => (
              <GlassPanel key={item}>
                <p className="flex gap-3 text-[0.98rem] leading-relaxed text-[var(--on-surface-dim)]">
                  <IconCircleCheck
                    size={18}
                    stroke={1.8}
                    className="mt-1 shrink-0 text-[var(--tertiary)]"
                  />
                  {item}
                </p>
              </GlassPanel>
            ))}
          </div>
        </SectionBlock>

        {teasers.length > 0 && (
          <SectionBlock
            eyebrow="Engineer Network"
            title={`Vetted ${domain.label.toLowerCase()} developers available.`}
          >
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

        <SectionBlock
          eyebrow="Domain FAQ"
          title={`${domain.label} questions, answered.`}
        >
          <FaqList items={domain.faq} />
        </SectionBlock>

        <section className="px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-[92rem]">
            <div className="relative overflow-hidden rounded-[1.55rem] border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--surface)_46%,transparent)] px-6 py-12 text-center shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_30%,transparent)] backdrop-blur-2xl sm:px-10 lg:px-16 lg:py-16">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.1]"
                style={textureStyle}
              />
              <div className="relative z-[1] mx-auto max-w-2xl">
                <p className="label-caps mb-4 text-[var(--secondary)]">
                  Start here
                </p>
                <h2 className="title-serif text-[clamp(2.18rem,4.5vw,3.45rem)] font-normal leading-[1.02] tracking-tight text-[var(--on-surface)]">
                  Start building your {domain.label} product.
                </h2>
                <p className="body-md mx-auto my-6 max-w-lg text-[var(--on-surface-dim)]">
                  Work with our senior engineering team to scope, design, and deliver your next product milestone.
                </p>
                <DualTrackCTA
                  context=""
                  primaryLabel="Start a Project"
                  primaryHref="/start-project"
                  secondaryLabel="Or hire an engineer"
                  secondaryHref="/hire"
                />
              </div>
            </div>
          </div>
        </section>
      </PublicPageShell>
      <JsonLd id="skill-service-schema" data={serviceSchema} />
      <JsonLd id="skill-faq-schema" data={faqSchema} />
      <JsonLd id="skill-breadcrumb-schema" data={breadcrumbSchema} />
    </>
  );
}
