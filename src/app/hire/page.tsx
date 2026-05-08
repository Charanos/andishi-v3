import type { Metadata } from "next";
import { IconArrowRight, IconCircleCheck, IconClockHour8, IconUsers } from "@tabler/icons-react";
import { JsonLd } from "@/components/marketing/json-ld";
import {
  FinalRouteCta,
  GlassPanel,
  PublicPageShell,
  RouteHero,
  SectionBlock,
} from "@/components/marketing/public-page";
import { FaqList } from "@/components/marketing/faq-list";
import { LinkButton } from "@/components/ui/button";
import { engagementModels, hireFaqTeaser, hireGuarantees, hireProcessSteps } from "@/data/hire";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "How Hiring Works - Andishi",
  description:
    "A clear path to hiring senior Andishi engineers: submit a brief, review shortlisted profiles, book intro calls, and onboard with a 30-day guarantee.",
};

const pageUrl = `${siteConfig.url}/hire`;

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to hire an Andishi engineer",
  description: metadata.description,
  totalTime: "P8D",
  step: hireProcessSteps.map((step, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    name: step.name,
    text: step.text,
  })),
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: hireFaqTeaser.map((item) => ({
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
    { "@type": "ListItem", position: 2, name: "Hire", item: pageUrl },
  ],
};

export default function HirePage() {
  return (
    <>
      <PublicPageShell>
        <RouteHero
          eyebrow="How hiring works"
          title="How hiring an Andishi engineer actually works."
          body="No recruiter calls, no marketplace filtering, no junior-heavy team padding. A direct path to a senior engineer matched to your stack and timeline."
          primary={{ href: "/start-project", label: "Submit a hiring brief" }}
          secondary={{ href: "/engineers", label: "See engineers" }}
          meta={
            <div className="grid grid-cols-3 gap-2">
              {[
                ["8d", "first profiles"],
                ["5+", "years seniority"],
                ["30d", "guarantee"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-3">
                  <p className="font-mono text-[1rem] text-[var(--on-surface)]">{value}</p>
                  <p className="mt-1 text-[0.68rem] leading-tight text-[var(--on-surface-dim)]">{label}</p>
                </div>
              ))}
            </div>
          }
        />

        <SectionBlock
          eyebrow="Process"
          title="Five steps from brief to first sprint."
          body="The matching process is deliberately narrow: enough structure to reduce risk, enough speed to keep momentum."
        >
          <div className="grid gap-4 lg:grid-cols-5">
            {hireProcessSteps.map((step, index) => (
              <GlassPanel key={step.name} className="lg:min-h-72">
                <p className="font-mono text-[0.78rem] text-[var(--secondary)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-5 text-[1.05rem] font-medium leading-tight text-[var(--on-surface)]">
                  {step.name}
                </h3>
                <p className="mt-4 text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">
                  {step.text}
                </p>
              </GlassPanel>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock eyebrow="Guarantees" title="Buyer risk, reduced up front.">
          <div className="grid gap-4 lg:grid-cols-3">
            {hireGuarantees.map((item, index) => {
              const icons = [IconClockHour8, IconUsers, IconCircleCheck];
              const Icon = icons[index];
              return (
                <GlassPanel key={item.title} className="border-[color-mix(in_srgb,var(--secondary)_20%,transparent)]">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_9%,transparent)] text-[var(--secondary)]">
                    <Icon size={21} stroke={1.6} />
                  </span>
                  <p className="mt-7 font-mono text-[clamp(2rem,6vw,3.2rem)] leading-none tracking-tight text-[var(--on-surface)]">
                    {item.value}
                  </p>
                  <h3 className="mt-5 text-[1.1rem] font-medium text-[var(--on-surface)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--on-surface-dim)]">
                    {item.body}
                  </p>
                </GlassPanel>
              );
            })}
          </div>
        </SectionBlock>

        <SectionBlock
          eyebrow="Engagement models"
          title="Use the model that fits the work."
          body="Andishi supports focused projects, long-term embedded engineers, and small team extensions."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {engagementModels.map((model) => (
              <GlassPanel key={model.title}>
                <h3 className="text-[1.1rem] font-medium text-[var(--on-surface)]">
                  {model.title}
                </h3>
                <p className="mt-4 text-[0.98rem] leading-relaxed text-[var(--on-surface-dim)]">
                  {model.body}
                </p>
              </GlassPanel>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock eyebrow="Who it is for" title="Built for teams that need senior ownership now.">
          <div className="grid gap-4 lg:grid-cols-2">
            {[
              [
                "For startups",
                "Seed to Series B teams that need senior engineering capacity without the four-month hiring cycle.",
              ],
              [
                "For scale-ups",
                "Engineering leads who need specialist AI, Web3, cloud, or product capacity without building an internal team for it.",
              ],
            ].map(([title, body]) => (
              <GlassPanel key={title}>
                <h3 className="text-[1.25rem] font-medium text-[var(--on-surface)]">{title}</h3>
                <p className="body-md mt-4 text-[var(--on-surface-dim)]">{body}</p>
              </GlassPanel>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock eyebrow="Buyer FAQ" title="The first questions teams ask.">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <FaqList items={hireFaqTeaser} />
            <LinkButton href="/hire/faq" variant="glass" className="lg:mt-1">
              See all questions
              <IconArrowRight size={16} stroke={1.8} />
            </LinkButton>
          </div>
        </SectionBlock>

        <FinalRouteCta
          title="Submit your brief. First profiles in 8 days."
          body="Tell us the stack, role, timeline, and ownership gap. We will come back with the clearest path to the right senior engineer."
        />
      </PublicPageShell>
      <JsonLd id="hire-howto-schema" data={howToSchema} />
      <JsonLd id="hire-faq-schema" data={faqSchema} />
      <JsonLd id="hire-breadcrumb-schema" data={breadcrumbSchema} />
    </>
  );
}
