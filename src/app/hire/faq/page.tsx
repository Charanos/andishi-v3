import type { Metadata } from "next";
import { JsonLd } from "@/components/marketing/json-ld";
import { FaqList } from "@/components/marketing/faq-list";
import {
  PublicPageShell,
  RouteHero,
  SectionBlock,
} from "@/components/marketing/public-page";
import { hireFaqItems } from "@/data/hire";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Hiring FAQ - Andishi",
  description:
    "Answers to common questions about hiring senior Andishi engineers, including matching, vetting, contracts, billing, time zones, and replacement guarantees.",
};

const pageUrl = `${siteConfig.url}/hire/faq`;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: hireFaqItems.map((item) => ({
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
    { "@type": "ListItem", position: 2, name: "Hire", item: `${siteConfig.url}/hire` },
    { "@type": "ListItem", position: 3, name: "FAQ", item: pageUrl },
  ],
};

export default function HireFaqPage() {
  const categories = [...new Set(hireFaqItems.map((item) => item.category))];

  return (
    <>
      <PublicPageShell>
        <RouteHero
          eyebrow="Hiring FAQ"
          title="Straight answers before the first call."
          body="Process, quality, engagement structure, time zones, technical coverage, and the replacement guarantee, written as standalone answers for buyers and AI search."
          primary={{ href: "/start-project", label: "Submit a hiring brief" }}
          secondary={{ href: "/hire", label: "How hiring works" }}
        />
        <SectionBlock title="Everything a buyer needs to clarify.">
          <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-2xl">
                <p className="label-caps mb-4 text-[var(--secondary)]">
                  Topics
                </p>
                <div className="grid gap-2">
                  {categories.map((category) => (
                    <a
                      key={category}
                      href={`#${category.toLowerCase()}`}
                      className="rounded-lg px-3 py-2 text-[0.9rem] text-[var(--on-surface-dim)] transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--on-surface)_7%,transparent)] hover:text-[var(--on-surface)]"
                    >
                      {category}
                    </a>
                  ))}
                </div>
              </div>
            </aside>
            <div className="grid gap-10">
              {categories.map((category) => (
                <section key={category} id={category.toLowerCase()} className="scroll-mt-28">
                  <p className="label-caps mb-4 text-[var(--secondary)]">
                    {category}
                  </p>
                  <FaqList items={hireFaqItems.filter((item) => item.category === category)} />
                </section>
              ))}
            </div>
          </div>
        </SectionBlock>
      </PublicPageShell>
      <JsonLd id="hire-full-faq-schema" data={faqSchema} />
      <JsonLd id="hire-faq-breadcrumb-schema" data={breadcrumbSchema} />
    </>
  );
}
