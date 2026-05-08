import type { Metadata } from "next";
import { JsonLd } from "@/components/marketing/json-ld";
import { EngineerDirectory } from "@/components/marketing/engineer-directory";
import { PublicPageShell, RouteHero, SectionBlock } from "@/components/marketing/public-page";
import { engineers } from "@/data/engineers";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Senior Engineer Directory - Andishi",
  description:
    "Browse senior pre-vetted African engineers across full-stack, AI, cloud, Web3, mobile, and backend engineering.",
};

const sortedEngineers = [...engineers].sort((a, b) => Number(b.featured) - Number(a.featured));

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Andishi Engineer Directory",
  itemListElement: sortedEngineers.map((engineer, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `${siteConfig.url}/engineers/${engineer.slug}`,
    item: {
      "@type": "Person",
      name: engineer.name,
      jobTitle: engineer.role,
      knowsAbout: engineer.skills,
      memberOf: { "@type": "Organization", name: "Andishi" },
    },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
    { "@type": "ListItem", position: 2, name: "Engineers", item: `${siteConfig.url}/engineers` },
  ],
};

export default function EngineersPage() {
  return (
    <>
      <PublicPageShell>
        <RouteHero
          eyebrow="Engineer network"
          title="The engineers startups choose first."
          body="Senior pre-vetted engineers across full-stack, AI, cloud, Web3, and mobile. Available for embedded engagements and project-based work."
          primary={{ href: "/start-project", label: "Tell us what you need" }}
          secondary={{ href: "/skills", label: "Explore skill coverage" }}
        />
        <SectionBlock title="Browse active profiles." body="Featured engineers appear first. Use filters for role, availability, and stack coverage.">
          <EngineerDirectory engineers={sortedEngineers} />
        </SectionBlock>
      </PublicPageShell>
      <JsonLd id="engineers-item-list-schema" data={itemListSchema} />
      <JsonLd id="engineers-breadcrumb-schema" data={breadcrumbSchema} />
    </>
  );
}
