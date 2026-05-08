import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandGithub,
  IconCircleCheck,
  IconExternalLink,
  IconMapPin,
} from "@tabler/icons-react";
import { JsonLd } from "@/components/marketing/json-ld";
import { EngineerCard, availabilityLabel, timezoneLabel } from "@/components/marketing/engineer-card";
import { FinalRouteCta, GlassPanel, PublicPageShell, SectionBlock } from "@/components/marketing/public-page";
import { engineers, getEngineer } from "@/data/engineers";
import { skillDomains } from "@/data/skills";
import { siteConfig } from "@/config/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return engineers.map((engineer) => ({ slug: engineer.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const engineer = getEngineer(slug);
  if (!engineer) return {};

  return {
    title: `${engineer.name} - ${engineer.role} | Andishi`,
    description: engineer.bio,
  };
}

export default async function EngineerProfilePage({ params }: Props) {
  const { slug } = await params;
  const engineer = getEngineer(slug);
  if (!engineer) notFound();

  const similar = engineers
    .filter((item) => item.slug !== engineer.slug && item.domains.some((domain) => engineer.domains.includes(domain)))
    .slice(0, 3);

  const primaryDomain = skillDomains[engineer.domains[0]];

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: engineer.name,
    jobTitle: engineer.role,
    image: `${siteConfig.url}${engineer.avatar}`,
    description: engineer.bio,
    knowsAbout: engineer.skills,
    memberOf: { "@type": "Organization", name: "Andishi", url: siteConfig.url },
    sameAs: [engineer.githubUrl, engineer.portfolioUrl?.startsWith("http") ? engineer.portfolioUrl : undefined].filter(Boolean),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Engineers", item: `${siteConfig.url}/engineers` },
      { "@type": "ListItem", position: 3, name: engineer.name, item: `${siteConfig.url}/engineers/${engineer.slug}` },
    ],
  };

  return (
    <>
      <PublicPageShell>
        <section className="px-5 pb-16 pt-32 sm:px-8 lg:pb-24 lg:pt-40">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[18rem_minmax(0,1fr)_20rem] lg:items-start">
            <aside className="lg:sticky lg:top-28">
              <GlassPanel>
                <div className="relative h-28 w-28 overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)]">
                  <Image src={engineer.avatar} alt={`${engineer.name} profile photo`} fill sizes="112px" className="object-cover" priority />
                </div>
                <h1 className="mt-5 text-[1.55rem] font-medium leading-tight text-[var(--on-surface)]">
                  {engineer.name}
                </h1>
                <p className="mt-2 text-[0.98rem] text-[var(--on-surface-dim)]">{engineer.role}</p>
                <p className="mt-4 inline-flex rounded-full border border-[color-mix(in_srgb,var(--tertiary)_28%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] px-3 py-1 font-mono text-[0.75rem] text-[var(--tertiary)]">
                  {availabilityLabel(engineer.availability)}
                </p>
                <p className="mt-4 flex items-center gap-2 text-[0.9rem] text-[var(--on-surface-dim)]">
                  <IconMapPin size={15} stroke={1.5} />
                  {engineer.location.city}, {engineer.location.country} · {timezoneLabel(engineer.location.utcOffset)}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {engineer.skills.map((skill) => (
                    <Link
                      key={skill}
                      href={`/skills/${primaryDomain.slug}`}
                      className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2.5 py-1 text-[0.72rem] font-medium text-[var(--on-surface-dim)] transition-colors duration-300 hover:text-[var(--on-surface)]"
                    >
                      {skill}
                    </Link>
                  ))}
                </div>
                <div className="mt-6 grid gap-2">
                  <Link href="/start-project" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-5 py-2 text-[0.92rem] font-medium text-[var(--bg)]">
                    Request intro
                    <IconArrowRight size={15} stroke={1.8} />
                  </Link>
                  <Link href="/engineers" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-2 text-[0.9rem] text-[var(--on-surface-dim)]">
                    <IconArrowLeft size={15} stroke={1.6} />
                    Back to engineers
                  </Link>
                </div>
              </GlassPanel>
            </aside>

            <article className="min-w-0">
              <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]">
                <span className="h-px w-7 bg-[var(--secondary)]" />
                Engineer profile
              </p>
              <h2 className="max-w-[13ch] text-[clamp(2.6rem,8vw,5.4rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)]">
                {engineer.role}
              </h2>
              <div className="mt-8 grid gap-5 text-[1.05rem] leading-relaxed text-[var(--on-surface-dim)]">
                {engineer.longBio.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <SectionBlock className="px-0 py-14 lg:py-16" eyebrow="Work history" title="Recent ownership.">
                <div className="grid gap-3">
                  {engineer.workHistory.map((item) => (
                    <GlassPanel key={`${item.company}-${item.duration}`}>
                      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-start">
                        <div>
                          <h3 className="text-[1.05rem] font-medium text-[var(--on-surface)]">{item.company}</h3>
                          <p className="mt-2 text-[0.95rem] text-[var(--on-surface-dim)]">{item.role}</p>
                        </div>
                        <p className="font-mono text-[0.8rem] text-[var(--secondary)]">{item.duration}</p>
                      </div>
                    </GlassPanel>
                  ))}
                </div>
              </SectionBlock>

              <SectionBlock className="px-0 py-0" eyebrow="Highlights" title="Technical proof points.">
                <div className="grid gap-4 md:grid-cols-3">
                  {engineer.highlights.map((highlight, index) => (
                    <GlassPanel key={highlight}>
                      <p className="font-mono text-[0.72rem] text-[var(--secondary)]">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <p className="mt-5 text-[0.98rem] leading-relaxed text-[var(--on-surface-dim)]">{highlight}</p>
                    </GlassPanel>
                  ))}
                </div>
              </SectionBlock>
            </article>

            <aside className="lg:sticky lg:top-28">
              <GlassPanel>
                <p className="label-caps mb-4 text-[var(--secondary)]">Vetting</p>
                <div className="grid gap-3">
                  {["System Design Interview", "Live Code Review", "Architecture Challenge", "Reference Checked"].map((item) => (
                    <p key={item} className="flex items-center gap-2 text-[0.9rem] text-[var(--on-surface-dim)]">
                      <IconCircleCheck size={16} stroke={1.8} className="text-[var(--tertiary)]" />
                      {item}
                    </p>
                  ))}
                </div>
                <div className="mt-6 border-t border-[var(--glass-border)] pt-5">
                  <p className="label-caps mb-3 text-[var(--secondary)]">Links</p>
                  <div className="grid gap-2">
                    {engineer.githubUrl && (
                      <a href={engineer.githubUrl} className="inline-flex items-center gap-2 text-[0.9rem] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]">
                        <IconBrandGithub size={16} stroke={1.6} />
                        GitHub
                      </a>
                    )}
                    {engineer.portfolioUrl && (
                      <Link href={engineer.portfolioUrl} className="inline-flex items-center gap-2 text-[0.9rem] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]">
                        <IconExternalLink size={16} stroke={1.6} />
                        Portfolio
                      </Link>
                    )}
                  </div>
                </div>
              </GlassPanel>
              {similar.length > 0 && (
                <div className="mt-4 grid gap-3">
                  <p className="label-caps text-[var(--secondary)]">Similar engineers</p>
                  {similar.map((item) => (
                    <EngineerCard key={item.slug} engineer={item} compact />
                  ))}
                </div>
              )}
            </aside>
          </div>
        </section>
        <FinalRouteCta
          title={`Request an intro with ${engineer.name.split(" ")[0]}.`}
          body="Share the role, stack, timeline, and ownership expectation. Andishi will confirm fit before scheduling the call."
        />
      </PublicPageShell>
      <JsonLd id="engineer-person-schema" data={personSchema} />
      <JsonLd id="engineer-breadcrumb-schema" data={breadcrumbSchema} />
    </>
  );
}
