import type { Metadata } from "next";
import { IconArrowRight } from "@tabler/icons-react";
import {
  PublicPageShell,
  RouteHero,
  SectionBlock,
  GlassPanel,
} from "@/components/marketing/public-page";
import { LinkButton } from "@/components/ui/button";
import { skillDomainList } from "@/data/skills";

export const metadata: Metadata = {
  title: "Product Capabilities & Skill Domains - Andishi",
  description:
    "Explore Andishi's core engineering domains for custom software, SaaS, AI systems, Web3, and cloud infrastructure builds.",
};

export default function SkillsPage() {
  return (
    <PublicPageShell>
      <RouteHero
        eyebrow="Product Capabilities"
        title="Engineered for performance."
        body="Explore the core technical domains our team leverages to scope, design, and ship custom software platforms, AI applications, and secure systems."
        primary={{ href: "/start-project", label: "Start a Project" }}
        secondary={{ href: "/services", label: "Explore Services" }}
      />
      <SectionBlock title="Choose a domain.">
        <div className="grid gap-4 md:grid-cols-2">
          {skillDomainList.map((domain) => (
            <GlassPanel key={domain.slug}>
              <p className="label-caps mb-4 text-[var(--secondary)]">
                {domain.eyebrow}
              </p>
              <h2 className="text-[1.45rem] font-medium leading-tight text-[var(--on-surface)]">
                {domain.label}
              </h2>
              <p className="mt-4 text-[0.98rem] leading-relaxed text-[var(--on-surface-dim)]">
                {domain.subheadline}
              </p>
              <div className="my-8 flex flex-wrap gap-2">
                {domain.technologies.slice(0, 5).map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2.5 py-1 text-[0.72rem] text-[var(--on-surface-dim)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="mt-6">
                <LinkButton
                  href={`/skills/${domain.slug}`}
                  variant="glass"
                  size="sm"
                >
                  View domain
                  <IconArrowRight size={15} stroke={1.8} />
                </LinkButton>
              </div>
            </GlassPanel>
          ))}
        </div>
      </SectionBlock>
    </PublicPageShell>
  );
}
