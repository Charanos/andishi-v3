import type { Metadata } from "next";
import { IconArrowRight, IconDeviceDesktop, IconShoppingCart, IconWorldWww, IconPlugConnected } from "@tabler/icons-react";
import { JsonLd } from "@/components/marketing/json-ld";
import { GlassPanel, PublicPageShell, RouteHero, SectionBlock, FinalRouteCta } from "@/components/marketing/public-page";
import { LinkButton } from "@/components/ui/button";
import { workProjects } from "@/content/work";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Andishi Studio - Build Arm for African Businesses",
  description:
    "Andishi Studio builds web apps, e-commerce systems, conversion sites, and digital systems for African businesses with the same engineering bar as the talent network.",
};

const services = [
  ["Web apps", "Operational portals, dashboards, booking systems, and workflow tools.", IconDeviceDesktop],
  ["E-commerce", "M-Pesa-ready storefronts, inventory workflows, and order dashboards.", IconShoppingCart],
  ["Conversion sites", "Fast, credible websites for businesses that need trust and qualified leads.", IconWorldWww],
  ["Digital systems", "Internal systems that replace spreadsheets, manual status checks, and disconnected tools.", IconPlugConnected],
] as const;

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Andishi Studio",
  provider: { "@type": "Organization", name: "Andishi", url: siteConfig.url },
  serviceType: "Software product studio",
  areaServed: "Africa",
  description: metadata.description,
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
    { "@type": "ListItem", position: 2, name: "Studio", item: `${siteConfig.url}/studio` },
  ],
};

export default function StudioPage() {
  const featured = workProjects.slice(0, 3);

  return (
    <>
      <PublicPageShell>
        <RouteHero
          eyebrow="Andishi Studio"
          title="We build for African businesses too."
          body="Andishi Studio is the build arm of the Andishi network. Our engineers build for African businesses the same way they build for global startups: with the same technical bar and sprint cadence."
          primary={{ href: "/contact", label: "Start a studio conversation" }}
          secondary={{ href: "/work", label: "See shipped work" }}
        />
        <SectionBlock eyebrow="Studio services" title="Focused builds with product discipline.">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {services.map(([title, body, Icon]) => (
              <GlassPanel key={title}>
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_9%,transparent)] text-[var(--secondary)]">
                  <Icon size={20} stroke={1.6} />
                </span>
                <h2 className="mt-5 text-[1.05rem] font-medium text-[var(--on-surface)]">{title}</h2>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">{body}</p>
              </GlassPanel>
            ))}
          </div>
        </SectionBlock>
        <SectionBlock eyebrow="How studio works" title="Brief, sprint, ship.">
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              ["Brief", "We clarify the business workflow, customer journey, technical constraints, and the result that matters."],
              ["Sprint", "A small senior team builds in focused loops with visible progress and practical decisions."],
              ["Ship", "We hand over a live product with deployment, admin context, and the next improvement path."],
            ].map(([title, body], index) => (
              <GlassPanel key={title}>
                <p className="font-mono text-[0.72rem] text-[var(--secondary)]">{String(index + 1).padStart(2, "0")}</p>
                <h2 className="mt-5 text-[1.12rem] font-medium text-[var(--on-surface)]">{title}</h2>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--on-surface-dim)]">{body}</p>
              </GlassPanel>
            ))}
          </div>
        </SectionBlock>
        <SectionBlock eyebrow="Featured studio work" title="Proof from shipped systems.">
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((project) => (
              <GlassPanel key={project.id}>
                <p className="label-caps text-[var(--secondary)]">{project.sectorLabel}</p>
                <h2 className="mt-4 text-[1.15rem] font-medium leading-tight text-[var(--on-surface)]">{project.title}</h2>
                <p className="mt-4 text-[0.93rem] leading-relaxed text-[var(--on-surface-dim)]">{project.description}</p>
                <div className="mt-5">
                  <LinkButton href={`/work/${project.id}`} variant="glass" size="sm">
                    View case study
                    <IconArrowRight size={15} stroke={1.8} />
                  </LinkButton>
                </div>
              </GlassPanel>
            ))}
          </div>
        </SectionBlock>
        <FinalRouteCta
          title="Need the studio track?"
          body="Tell us what you are building, where the current workflow breaks, and what needs to be live first."
          href="/contact"
          label="Start a studio conversation"
        />
      </PublicPageShell>
      <JsonLd id="studio-service-schema" data={serviceSchema} />
      <JsonLd id="studio-breadcrumb-schema" data={breadcrumbSchema} />
    </>
  );
}
