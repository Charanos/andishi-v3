import type { Metadata } from "next";
import Link from "next/link";
import {
  IconArrowRight,
  IconBriefcase,
  IconCircleCheck,
  IconClockHour8,
  IconCode,
  IconFileText,
  IconMessageCircle,
  IconRoute,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react";
import { JsonLd } from "@/components/marketing/json-ld";
import { FaqList } from "@/components/marketing/faq-list";
import { FinalCtaArtwork } from "@/components/ui/final-cta-artwork";
import {
  engagementModels,
  hireFaqTeaser,
  hireGuarantees,
  hireProcessSteps,
} from "@/data/hire";
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

const processIcons = [
  IconFileText,
  IconRoute,
  IconUsers,
  IconMessageCircle,
  IconCode,
] as const;

const modelMeta = [
  ["2-8 weeks", "Scoped delivery"],
  ["3+ months", "Embedded capacity"],
  ["2-5 seats", "Team extension"],
] as const;

function PatternTexture({
  className = "",
  opacity = 0.16,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 10.5v7M10.5 14h7' stroke='%23c5b8e8' stroke-width='0.7' stroke-linecap='round' opacity='0.24'/%3E%3C/svg%3E\"), radial-gradient(circle, color-mix(in srgb, var(--secondary) 18%, transparent) 0 1px, transparent 1.7px)",
        backgroundPosition: "0 0, 14px 14px",
        backgroundSize: "28px 28px, 28px 28px",
      }}
    />
  );
}

function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] backdrop-blur-xl ${className}`}
    >
      <PatternTexture opacity={0.07} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--secondary)_36%,transparent),transparent)]"
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mb-8 max-w-3xl lg:mb-10">
      <p className="label-caps mb-4 flex items-center gap-3 text-[var(--secondary)]">
        <span className="h-px w-7 bg-[var(--secondary)]" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 className="max-w-[15ch] text-[clamp(2.1rem,7vw,4.5rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)]">
        {title}
      </h2>
      {body && (
        <p className="body-md mt-5 max-w-2xl text-[var(--on-surface-dim)]">
          {body}
        </p>
      )}
    </div>
  );
}

function MatchingArtifact() {
  return (
    <GlassPanel className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between border-b border-[var(--glass-border)] pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--tertiary)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--secondary)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
        </div>
        <span className="rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_36%,transparent)] px-2.5 py-1 font-mono text-[0.64rem] text-[var(--on-surface-dim)]">
          MATCHING OS
        </span>
      </div>

      <div className="grid gap-3">
        {[
          ["Role signal", "Senior full-stack / AI workflow ownership", "92%"],
          ["Timezone fit", "UTC+0 to UTC+3 overlap validated", "Strong"],
          ["Assessment", "System design + code review passed", "3/3"],
        ].map(([label, body, value], index) => (
          <div
            key={label}
            className="rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                {label}
              </p>
              <p className="font-mono text-[0.82rem] text-[var(--secondary)]">
                {value}
              </p>
            </div>
            <p className="text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
              {body}
            </p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--secondary),var(--primary))]"
                style={{ width: `${92 - index * 13}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

function BriefArtifact() {
  return (
    <div className="grid gap-3">
      {[
        ["01", "Ownership", "What must this engineer own by week two?"],
        ["02", "Stack", "Current production tools, constraints, and risks."],
        ["03", "Rhythm", "Timezone overlap, sprint cadence, and decision speed."],
      ].map(([index, title, body]) => (
        <div
          key={title}
          className="rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] p-4 backdrop-blur-xl"
        >
          <p className="font-mono text-[0.72rem] text-[var(--secondary)]">
            {index}
          </p>
          <p className="mt-3 text-[0.98rem] font-medium text-[var(--on-surface)]">
            {title}
          </p>
          <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
            {body}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function HirePage() {
  return (
    <>
      <main className="relative isolate overflow-hidden bg-[var(--bg)]">
        <PatternTexture className="z-0" opacity={0.1} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_8%,transparent),transparent_22rem),linear-gradient(90deg,color-mix(in_srgb,var(--bg)_88%,transparent),transparent_38%,color-mix(in_srgb,var(--bg)_72%,transparent))]"
        />

        <section className="relative z-[1] px-5 pb-16 pt-32 sm:px-8 lg:px-10 lg:pb-24 lg:pt-36">
          <div className="mx-auto grid max-w-[96rem] gap-8 border-b border-[var(--glass-border)] pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,32rem)] lg:items-end">
            <div>
              <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]">
                <span className="h-px w-7 bg-[var(--secondary)]" aria-hidden="true" />
                How hiring works / Andishi
              </p>
              <h1 className="max-w-[13ch] text-[clamp(3rem,11vw,6.4rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)]">
                Hire senior engineers without the recruiting drag.
              </h1>
              <p className="body-md mt-6 max-w-2xl text-[var(--on-surface-dim)]">
                A precise path from technical brief to matched senior African
                engineer: no marketplace noise, no junior-heavy padding, no
                vague recruiter loop.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/start-project"
                  className="inline-flex min-h-[2.35rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                >
                  Start hiring
                  <IconArrowRight size={15} stroke={2} />
                </Link>
                <Link
                  href="/engineers"
                  className="inline-flex min-h-[2.35rem] items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--glass-bg)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_34%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                >
                  Browse engineers
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["8d", "first profiles"],
                  ["5+", "years seniority"],
                  ["30d", "guarantee"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-4 text-center backdrop-blur-xl"
                  >
                    <p className="font-mono text-[clamp(1.4rem,4vw,2.35rem)] leading-none text-[var(--on-surface)]">
                      {value}
                    </p>
                    <p className="mt-2 text-[0.68rem] leading-tight text-[var(--on-surface-dim)]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              <MatchingArtifact />
            </div>
          </div>
        </section>

        <section className="relative z-[1] px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-[96rem]">
            <SectionIntro
              eyebrow="Process"
              title="Five steps from brief to first sprint."
              body="The path is intentionally narrow: enough structure to reduce risk, enough speed to keep your roadmap moving."
            />

            <div className="grid gap-4 lg:grid-cols-5">
              {hireProcessSteps.map((step, index) => {
                const Icon = processIcons[index];

                return (
                  <GlassPanel key={step.name} className="p-5 lg:min-h-80">
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_9%,transparent)] text-[var(--secondary)]">
                        <Icon size={20} stroke={1.6} />
                      </span>
                      <p className="font-mono text-[0.78rem] text-[var(--secondary)]">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                    </div>
                    <h3 className="mt-7 text-[1.08rem] font-medium leading-tight text-[var(--on-surface)]">
                      {step.name}
                    </h3>
                    <p className="mt-4 text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">
                      {step.text}
                    </p>
                  </GlassPanel>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative z-[1] px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto grid max-w-[96rem] gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-start">
            <div>
              <SectionIntro
                eyebrow="The brief"
                title="Better input creates sharper matches."
                body="We do not ask for a generic job description. We ask for the signals that let a senior engineer be evaluated against ownership, context, and operating rhythm."
              />
              <div className="grid gap-4 md:grid-cols-3">
                {hireGuarantees.map((item, index) => {
                  const icons = [IconClockHour8, IconUsers, IconCircleCheck];
                  const Icon = icons[index];

                  return (
                    <GlassPanel
                      key={item.title}
                      className="border-[color-mix(in_srgb,var(--secondary)_20%,transparent)] p-5"
                    >
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
            </div>

            <GlassPanel className="p-5 lg:sticky lg:top-28">
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="label-caps text-[var(--secondary)]">
                  Brief anatomy
                </p>
                <span className="rounded-full border border-[color-mix(in_srgb,var(--tertiary)_28%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] px-3 py-1 font-mono text-[0.68rem] text-[var(--tertiary)]">
                  10 min
                </span>
              </div>
              <BriefArtifact />
            </GlassPanel>
          </div>
        </section>

        <section className="relative z-[1] px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-[96rem]">
            <SectionIntro
              eyebrow="Engagement models"
              title="Use the model that fits the work."
              body="Every engagement is built around senior ownership, clear communication, and a practical route into your current engineering system."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              {engagementModels.map((model, index) => (
                <GlassPanel key={model.title} className="p-6">
                  {(() => {
                    const ModelIcon = [IconBriefcase, IconWorld, IconUsers][index];

                    return (
                      <div className="mb-7 flex items-start justify-between gap-4">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--primary)_24%,transparent)] bg-[color-mix(in_srgb,var(--primary)_9%,transparent)] text-[var(--primary)]">
                          <ModelIcon size={20} stroke={1.6} />
                        </span>
                        <span className="font-mono text-[0.72rem] text-[color-mix(in_srgb,var(--on-surface-dim)_60%,transparent)]">
                          {modelMeta[index][0]}
                        </span>
                      </div>
                    );
                  })()}
                  <p className="label-caps mb-3 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                    {modelMeta[index][1]}
                  </p>
                  <h3 className="text-[1.3rem] font-medium text-[var(--on-surface)]">
                    {model.title}
                  </h3>
                  <p className="mt-4 text-[0.98rem] leading-relaxed text-[var(--on-surface-dim)]">
                    {model.body}
                  </p>
                </GlassPanel>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-[1] px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto grid max-w-[96rem] gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
            <div>
              <SectionIntro
                eyebrow="Buyer FAQ"
                title="The first questions teams ask."
                body="Short answers for the evaluation stage. The full FAQ covers contracts, billing, timezone, vetting, and replacement terms."
              />
              <Link
                href="/hire/faq"
                className="inline-flex min-h-[2.35rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--glass-bg)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_34%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
              >
                See all questions
                <IconArrowRight size={15} stroke={1.8} />
              </Link>
            </div>
            <FaqList items={hireFaqTeaser} />
          </div>
        </section>

        <section className="relative z-[1] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-[96rem]">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_42%,transparent)] px-6 py-12 text-center shadow-[0_24px_80px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] backdrop-blur-2xl sm:px-10 lg:px-16 lg:py-16">
              <FinalCtaArtwork />
              <PatternTexture opacity={0.12} />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_22%,transparent),transparent)]"
              />
              <div className="relative z-[1] mx-auto max-w-2xl">
                <p className="label-caps mb-4 text-[var(--secondary)]">
                  Start here
                </p>
                <h2 className="text-[clamp(2rem,6vw,3.8rem)] font-normal leading-[1.02] tracking-tight text-[var(--on-surface)]">
                  Submit your brief. First profiles in 8 days.
                </h2>
                <p className="body-md mx-auto mt-5 max-w-lg text-[var(--on-surface-dim)]">
                  Tell us the stack, role, timeline, and ownership gap. We will
                  come back with the clearest path to the right senior engineer.
                </p>
                <div className="mt-8">
                  <Link
                    href="/start-project"
                    className="inline-flex min-h-[2.35rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                  >
                    Start hiring
                    <IconArrowRight size={15} stroke={2} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <JsonLd id="hire-howto-schema" data={howToSchema} />
      <JsonLd id="hire-faq-schema" data={faqSchema} />
      <JsonLd id="hire-breadcrumb-schema" data={breadcrumbSchema} />
    </>
  );
}
