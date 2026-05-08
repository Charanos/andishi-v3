import {
  IconArrowRight,
  IconCalendarTime,
  IconCircleCheck,
  IconCode,
  IconFileText,
  IconRocket,
} from "@tabler/icons-react";
import Image from "next/image";
import { comparisonRows, processSteps } from "@/content/landing";
import { LinkButton } from "@/components/ui/button";
import { CustomCursorRegion } from "@/components/ui/custom-cursor-region";
import { BlogAndFaqNewsletter } from "@/components/sections/blog-faq-newsletter";
import { HeroSection } from "@/components/sections/hero-section";
import { ProjectShowcase } from "@/components/sections/project-showcase";
import { WhyAndishiSection } from "@/components/sections/why-andishi-section";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How quickly can we see matched engineers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Andishi typically surfaces two to three matched senior engineer profiles within 48 hours after the technical discovery call.",
      },
    },
    {
      "@type": "Question",
      name: "What seniority level are Andishi engineers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Andishi focuses on senior engineers with a minimum of five years of production experience, vetted through technical assessment, portfolio review, and references.",
      },
    },
  ],
};

const processTextureStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 11v12M11 17h12' stroke='%23c5b8e8' stroke-width='0.65' stroke-linecap='round' opacity='0.22'/%3E%3Cpath d='M4 4h4M26 30h4' stroke='%23c5b8e8' stroke-width='0.55' stroke-linecap='round' opacity='0.16'/%3E%3C/svg%3E\"), radial-gradient(circle, color-mix(in srgb, var(--secondary) 16%, transparent) 0 1px, transparent 1.8px)",
  backgroundPosition: "0 0, 17px 17px",
  backgroundSize: "34px 34px, 34px 34px",
};

export default function Home() {
  return (
    <>
      <main className="relative overflow-hidden">
        <HeroSection />
        <ProjectShowcase />
        <Process />
        <IllustrationBreak />
        <WhyAndishiSection />
        <Founder />
        <BlogAndFaqNewsletter />
        <FinalCTA />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </main>
    </>
  );
}

function Process() {
  const processIcons = [IconCalendarTime, IconFileText, IconCode, IconRocket];
  const processSignals = [
    ["01", "Signal", "Technical hiring brief"],
    ["02", "Match", "Two to three profiles"],
    ["03", "Start", "Onboarding + guarantee"],
  ];
  const processVisuals = [
    <div
      key="discovery"
      className="overflow-hidden rounded-[1.05rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--surface)_76%,transparent)] shadow-[0_18px_50px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)] transition-transform duration-300 group-hover:-translate-y-1"
    >
      <div className="flex h-7 items-center gap-1.5 border-b border-[color-mix(in_srgb,var(--on-surface)_9%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_54%,transparent)] px-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b57]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f]" />
        <span className="ml-auto font-mono text-[0.55rem] text-[color-mix(in_srgb,var(--on-surface)_38%,transparent)]">
          talent.chat
        </span>
      </div>
      <div className="space-y-2 p-3">
        <div className="flex max-w-[88%] items-start gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] px-3 py-2 text-[0.68rem] leading-snug text-[var(--on-surface)]">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--secondary)] font-mono text-[0.55rem] text-[var(--bg)]">
            A
          </span>
          What should this engineer own in 90 days?
        </div>
        <div className="ml-auto max-w-[82%] rounded-2xl border border-[color-mix(in_srgb,var(--on-surface)_9%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_18%,transparent)] px-3 py-2 text-[0.68rem] leading-snug text-[var(--on-surface-dim)]">
          AI workflow live, API stable, infra cost controlled.
        </div>
        <div className="flex max-w-[84%] items-start gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--on-surface)_6%,transparent)] px-3 py-2 text-[0.68rem] leading-snug text-[var(--on-surface-dim)]">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--on-surface)_14%,transparent)] font-mono text-[0.55rem] text-[var(--on-surface)]">
            C
          </span>
          Good. Let&apos;s match for that ownership level.
        </div>
      </div>
    </div>,
    <div
      key="brief"
      className="overflow-hidden rounded-[1.05rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--surface)_76%,transparent)] shadow-[0_18px_50px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)] transition-transform duration-300 group-hover:-translate-y-1"
    >
      <div className="flex h-7 items-center gap-1.5 border-b border-[color-mix(in_srgb,var(--on-surface)_9%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_54%,transparent)] px-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b57]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f]" />
        <span className="ml-auto font-mono text-[0.55rem] text-[color-mix(in_srgb,var(--on-surface)_38%,transparent)]">
          match.logic
        </span>
      </div>
      <div className="space-y-2 p-3">
        {[
          ["Need", "Senior backend + AI integration", "var(--tertiary)"],
          ["Stack", "Next.js, Python, AWS", "var(--secondary)"],
          ["Match", "2 profiles ready within 48h", "var(--primary)"],
        ].map(([label, text, color]) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_18%,transparent)] px-3 py-2 text-[0.66rem] text-[var(--on-surface-dim)]"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-medium text-[var(--on-surface)]">
              {label}:
            </span>
            {text}
          </div>
        ))}
      </div>
    </div>,
    <div
      key="sprints"
      className="overflow-hidden rounded-[1.05rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--surface)_76%,transparent)] shadow-[0_18px_50px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)] transition-transform duration-300 group-hover:-translate-y-1"
    >
      <div className="flex h-7 items-center gap-1.5 border-b border-[color-mix(in_srgb,var(--on-surface)_9%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_54%,transparent)] px-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b57]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f]" />
        <span className="ml-auto font-mono text-[0.55rem] text-[color-mix(in_srgb,var(--on-surface)_38%,transparent)]">
          sprint.loop
        </span>
      </div>
      <div className="space-y-3 p-3">
        <div className="flex flex-wrap gap-2">
          {["Planning", "Framing", "Polishing", "Purpose"].map(
            (label, index) => (
              <span
                key={label}
                className="rounded-lg border px-3 py-1.5 text-[0.63rem] font-medium text-[var(--on-surface)]"
                style={{
                  backgroundColor:
                    index === 0
                      ? "color-mix(in srgb, var(--secondary) 12%, transparent)"
                      : "color-mix(in srgb, var(--bg-deep) 20%, transparent)",
                  borderColor:
                    index === 0
                      ? "color-mix(in srgb, var(--secondary) 28%, transparent)"
                      : "color-mix(in srgb, var(--on-surface) 10%, transparent)",
                }}
              >
                {label}
              </span>
            ),
          )}
        </div>
        {[
          ["UX fidelity", "82%", "var(--secondary)"],
          ["Test coverage", "94%", "var(--tertiary)"],
        ].map(([label, value, color]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between font-mono text-[0.58rem] text-[var(--on-surface-dim)]">
              <span>{label}</span>
              <span style={{ color }}>{value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)]">
              <div
                className="h-full rounded-full transition-[width] duration-700 group-hover:w-full"
                style={{ width: value, backgroundColor: color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>,
    <div
      key="design"
      className="overflow-hidden rounded-[1.05rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--surface)_76%,transparent)] shadow-[0_18px_50px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)] transition-transform duration-300 group-hover:-translate-y-1"
    >
      <div className="flex h-7 items-center gap-1.5 border-b border-[color-mix(in_srgb,var(--on-surface)_9%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_54%,transparent)] px-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b57]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f]" />
        <span className="ml-auto font-mono text-[0.55rem] text-[color-mix(in_srgb,var(--on-surface)_38%,transparent)]">
          design.board
        </span>
      </div>
      <div className="space-y-3 p-3">
        <div className="flex flex-wrap gap-2">
          {[
            ["Figma", "var(--primary)"],
            ["Framer", "var(--secondary)"],
            ["Tailwind", "var(--tertiary)"],
          ].map(([label, color]) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_18%,transparent)] px-2.5 py-1.5 text-[0.62rem] text-[var(--on-surface)]"
            >
              <span
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: color }}
              />
              {label}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-10 rounded-lg border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_18%,transparent)] transition-colors duration-300 group-hover:bg-[color-mix(in_srgb,var(--secondary)_7%,transparent)]"
            />
          ))}
        </div>
      </div>
    </div>,
  ];

  return (
    <section
      id="process"
      className="relative isolate overflow-hidden bg-[color-mix(in_srgb,var(--bg-deep)_72%,var(--bg))] px-5 py-24 sm:px-8 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.11]"
        style={processTextureStyle}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_5%,transparent),transparent_18rem),linear-gradient(90deg,color-mix(in_srgb,var(--bg-deep)_42%,transparent),transparent_36%,color-mix(in_srgb,var(--bg-deep)_40%,transparent))]"
      />

      <div className="relative z-[1] mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-16">
          <p className="label-caps mb-5 flex items-center justify-center gap-3 text-[var(--secondary)]">
            <span className="h-px w-7 bg-[var(--secondary)]" />
            Our process
          </p>
          <h2 className="mx-auto max-w-[15ch] text-[clamp(2.4rem,7vw,4.9rem)] font-normal leading-[0.94] tracking-normal text-[var(--on-surface)]">
          Serious about fit. Obsessive about seniority.
          </h2>
          <p className="body-md mx-auto mt-6 max-w-2xl text-[var(--on-surface-dim)]">
            No recruiter theatre. No pile of unvetted CVs. Each stage creates a
            clear decision point so you know who is matched, why they fit, and
            how quickly they can start.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[1.5rem] border border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] bg-[color-mix(in_srgb,var(--surface)_36%,transparent)] p-4 shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_30%,transparent)] backdrop-blur-2xl sm:p-5">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.1]"
            style={processTextureStyle}
          />
          <div className="relative grid gap-3 sm:grid-cols-3">
            {processSignals.map(([num, label, value]) => (
              <div
                key={label}
                className="rounded-[1.1rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_34%,transparent)] p-4"
              >
                <p className="font-mono text-[0.68rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface)_46%,transparent)]">
                  {num}
                </p>
                <p className="label-caps mt-5 text-[var(--secondary)]">
                  {label}
                </p>
                <p className="mt-2 text-[0.95rem] leading-snug text-[var(--on-surface)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:mt-12 lg:grid-cols-2">
          {processSteps.map((item, index) => {
            const Icon = processIcons[index];

            return (
              <article
                key={item.step}
                className="group relative overflow-hidden rounded-[1.35rem] border border-[color-mix(in_srgb,var(--on-surface)_11%,transparent)] bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--surface-high)_36%,transparent)] sm:p-6"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-8 h-24 w-36 rotate-12 rounded-[1.6rem] border border-[color-mix(in_srgb,var(--secondary)_14%,transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-70"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-4 right-4 h-20 w-28 opacity-0 transition-opacity duration-300 group-hover:opacity-25"
                  style={processTextureStyle}
                />
                <div className="relative">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[0.68rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface)_48%,transparent)]">
                        {item.step}
                      </p>
                      <h3 className="mt-2 text-[1.05rem] font-medium leading-tight text-[var(--on-surface)]">
                        {item.title}
                      </h3>
                    </div>
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_9%,transparent)] text-[var(--secondary)]">
                      <Icon size={18} stroke={1.6} />
                    </span>
                  </div>

                  <p className="text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)] lg:min-h-[4.8rem]">
                    {item.body}
                  </p>

                  {processVisuals[index]}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <article className="relative overflow-hidden rounded-[1.35rem] border border-[color-mix(in_srgb,var(--on-surface)_11%,transparent)] bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[0.68rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface)_48%,transparent)]">
                  05
                </p>
                <h3 className="mt-2 text-[1.05rem] font-medium leading-tight text-[var(--on-surface)]">
                  Onboarding
                </h3>
              </div>
              <span className="rounded-full border border-[color-mix(in_srgb,var(--tertiary)_24%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] px-3 py-1 font-mono text-[0.68rem] text-[var(--tertiary)]">
                Ready
              </span>
            </div>
            <p className="text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
              The placement starts with context, access, expectations, and
              check-ins already mapped so your engineer can contribute quickly.
            </p>
            <div className="mt-5 grid gap-2">
              {[
                "Profile reviewed",
                "Technical fit confirmed",
                "Timezone overlap agreed",
                "30-day guarantee active",
              ].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--tertiary)_8%,transparent)] px-3 py-2 text-[0.74rem] text-[var(--on-surface-dim)]"
                >
                  <IconCircleCheck
                    size={14}
                    stroke={1.8}
                    className="text-[var(--tertiary)]"
                  />
                  {item}
                </span>
              ))}
            </div>
          </article>

          <article className="overflow-hidden rounded-[1.35rem] border border-[color-mix(in_srgb,var(--on-surface)_11%,transparent)] bg-[#171223] shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)]">
            <div className="flex h-9 items-center gap-2 border-b border-white/8 bg-[#211832] px-4">
              <span className="h-2 w-2 rounded-full bg-[#ff6b57]" />
              <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
              <span className="h-2 w-2 rounded-full bg-[#27c93f]" />
              <span className="ml-auto font-mono text-[0.62rem] text-white/42">
                deploy.terminal
              </span>
            </div>
            <div className="space-y-3 p-5 font-mono text-[0.74rem] leading-relaxed text-white/55 sm:p-6">
              <p>
                <span className="text-[var(--secondary)]">→</span> npm run build
              </p>
              <p className="text-white/32">✓ Compiled in 4.2s</p>
              <p>
                <span className="text-[var(--secondary)]">→</span> vercel deploy
                --prod
              </p>
              <p className="text-white/32">Deploying to production...</p>
              <p className="text-[var(--tertiary)]">
                ✓ Ready · lipa.andishi.co.ke
              </p>
              <p>
                <span className="text-[var(--secondary)]">→</span> andishi
                handover --docs --training
              </p>
              <p className="text-[var(--tertiary)]">
                ✓ All checks passed · 30d support active
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const decisionSignals = [
    ["01", "Scope", "One call"],
    ["02", "Lead", "Founder-direct"],
    ["03", "Launch", "5 business days"],
  ];

  const decisionPanels = [
    ["Velocity", "48h", "Scope clarity"],
    ["Context", "NBO", "Built for this market"],
    ["Support", "30d", "Included after launch"],
  ];

  return (
    <section
      id="comparison"
      className="relative isolate overflow-hidden bg-[color-mix(in_srgb,var(--bg-deep)_46%,var(--bg))] px-5 py-24 sm:px-8 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.1]"
        style={processTextureStyle}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_16%,transparent),transparent)]"
      />

      <div className="relative z-[1] mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div className="order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-[1.6rem] border border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] bg-[color-mix(in_srgb,var(--surface)_40%,transparent)] shadow-[0_30px_100px_color-mix(in_srgb,var(--bg-deep)_34%,transparent)] backdrop-blur-2xl">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.09]"
                style={processTextureStyle}
              />
              <div className="relative flex h-10 items-center gap-2 border-b border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_48%,transparent)] px-4">
                <span className="h-2 w-2 rounded-full bg-[#ff6b57]" />
                <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
                <span className="h-2 w-2 rounded-full bg-[#27c93f]" />
                <span className="ml-auto font-mono text-[0.62rem] text-[color-mix(in_srgb,var(--on-surface)_42%,transparent)]">
                  decision.os
                </span>
              </div>

              <div className="relative grid gap-4 p-4 sm:p-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  {decisionSignals.map(([num, label, value]) => (
                    <div
                      key={label}
                      className="rounded-[1.1rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_30%,transparent)] p-4"
                    >
                      <p className="font-mono text-[0.68rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface)_46%,transparent)]">
                        {num}
                      </p>
                      <p className="label-caps mt-5 text-[var(--secondary)]">
                        {label}
                      </p>
                      <p className="mt-2 text-[0.95rem] leading-snug text-[var(--on-surface)]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-[1.1rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_28%,transparent)] p-4">
                    <p className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_68%,transparent)]">
                      Operating bias
                    </p>
                    <div className="mt-4 space-y-3">
                      {decisionPanels.map(([label, value, caption]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-4 border-b border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] pb-3 last:border-b-0 last:pb-0"
                        >
                          <div>
                            <p className="text-[0.82rem] text-[var(--on-surface)]">
                              {label}
                            </p>
                            <p className="mt-1 text-[0.68rem] text-[var(--on-surface-dim)]">
                              {caption}
                            </p>
                          </div>
                          <p className="font-mono text-[1.2rem] tracking-normal text-[var(--secondary)]">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[1.1rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[#171223]">
                    <div className="flex h-8 items-center gap-2 border-b border-white/8 bg-[#211832] px-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b57]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ffbd2e]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f]" />
                      <span className="ml-auto font-mono text-[0.56rem] text-white/42">
                        route.check
                      </span>
                    </div>
                    <div className="space-y-2.5 p-4 font-mono text-[0.7rem] leading-relaxed text-white/58">
                      <p>
                        <span className="text-[var(--secondary)]">→</span>{" "}
                        compare marketplace agency andishi
                      </p>
                      <p className="text-white/32">Scanning delivery risk...</p>
                      <p className="text-[var(--tertiary)]">
                        ✓ fastest path: vetted senior engineer
                      </p>
                      <p className="text-[var(--tertiary)]">
                        ✓ retained context: Africa-sourced senior talent
                      </p>
                      <p className="text-[var(--secondary)]">
                        result: ship with Andishi
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 text-left lg:order-2 lg:text-right">
            <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)] lg:justify-end">
              <span className="h-px w-7 bg-[var(--secondary)]" />
          Why Andishi
            </p>
            <h2 className="ml-auto max-w-[13ch] text-[clamp(2.6rem,7vw,5.2rem)] font-normal leading-[0.94] tracking-normal text-[var(--on-surface)]">
              Built like a senior engineering partner.
            </h2>
            <p className="body-md ml-auto mt-6 max-w-xl text-[var(--on-surface-dim)]">
              Startups do not need more hiring theatre. They need vetted senior
              engineers, clear ownership, and someone accountable after the
              placement starts.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:mt-12 lg:grid-cols-2 xl:grid-cols-3">
          {comparisonRows.map(
            ([criteria, freelancer, agency, andishi], index) => (
              <article
                key={criteria}
                className="group relative overflow-hidden rounded-[1.35rem] border border-[color-mix(in_srgb,var(--on-surface)_11%,transparent)] bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--surface-high)_36%,transparent)]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-8 h-24 w-36 rotate-12 rounded-[1.6rem] border border-[color-mix(in_srgb,var(--secondary)_14%,transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-70"
                />
                <div className="relative flex h-8 items-center gap-1.5 border-b border-[color-mix(in_srgb,var(--on-surface)_9%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_46%,transparent)] px-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b57]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ffbd2e]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f]" />
                  <span className="ml-auto font-mono text-[0.56rem] text-[color-mix(in_srgb,var(--on-surface)_38%,transparent)]">
                    route-{String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="relative p-5 sm:p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[0.68rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface)_48%,transparent)]">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-2 text-[1.05rem] font-medium leading-tight text-[var(--on-surface)]">
                        {criteria}
                      </h3>
                    </div>
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-[color-mix(in_srgb,var(--tertiary)_26%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] text-[var(--tertiary)]">
                      <IconCircleCheck size={16} stroke={1.8} />
                    </span>
                  </div>

                  <div className="grid gap-2">
                    <div className="rounded-2xl border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_24%,transparent)] px-4 py-3">
                      <p className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_64%,transparent)]">
                        Common route
                      </p>
                      <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
                        Freelance platform: {freelancer}. Outsourcing agency: {agency}.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)] px-4 py-3">
                      <p className="label-caps text-[var(--secondary)]">
                        Andishi route
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-[0.95rem] font-medium leading-snug text-[var(--on-surface)]">
                        {andishi}
                        <IconArrowRight
                          size={15}
                          stroke={1.8}
                          className="shrink-0 text-[var(--secondary)]"
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function IllustrationBreak() {
  return (
    <section
      aria-label="Andishi engineering talent illustration"
      className="relative left-1/2 min-h-screen w-screen -translate-x-1/2 overflow-clip bg-[var(--bg-deep)]"
    >
      <div className="sticky top-0 min-h-screen overflow-hidden">
        <img
          aria-hidden="true"
          src="/light-blob.svg"
          alt=""
          className="blob-break-asset blob-break-asset--light"
          loading="lazy"
          decoding="async"
        />
        <img
          aria-hidden="true"
          src="/dark-blob.svg"
          alt=""
          className="blob-break-asset blob-break-asset--dark"
          loading="lazy"
          decoding="async"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={processTextureStyle}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--bg)_0%,transparent_14%,transparent_76%,var(--bg)_100%),linear-gradient(90deg,color-mix(in_srgb,var(--bg)_94%,transparent)_0%,color-mix(in_srgb,var(--bg)_78%,transparent)_42%,transparent_72%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-full w-full bg-[linear-gradient(90deg,color-mix(in_srgb,var(--surface)_78%,transparent)_0%,color-mix(in_srgb,var(--bg)_72%,transparent)_45%,transparent_74%)] backdrop-blur-[1px] sm:w-[70%] lg:w-[58%]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[12%] left-[8%] h-56 w-[42rem] rotate-[7deg] rounded-[3rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] opacity-45"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[28%] top-[22%] h-28 w-44 rotate-[-10deg] rounded-[2rem] border border-[color-mix(in_srgb,var(--secondary)_18%,transparent)] opacity-45"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_18%,transparent),transparent)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_16%,transparent),transparent)]"
        />

        <div className="relative z-[1] flex min-h-screen items-center px-5 py-28 sm:px-8 lg:px-12">
          <div className="w-full">
            <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-center">
              <div className="max-w-2xl rounded-[1.75rem] border border-[color-mix(in_srgb,var(--on-surface)_13%,transparent)] bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] p-5 shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_34%,transparent)] backdrop-blur-2xl sm:p-7 lg:p-9">
                <p className="label-caps mb-4 flex items-center gap-3 text-[var(--secondary)]">
                  <span className="h-px w-7 bg-[var(--secondary)]" />
                  Talent, not CV piles
                </p>
                <h2 className="max-w-[11ch] text-[clamp(2.45rem,12vw,5.8rem)] font-normal leading-[0.92] tracking-normal text-[var(--on-surface)]">
                  Every hire needs proof, context, and support.
                </h2>
                <div className="mt-7 grid gap-3 border-t border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] pt-5 sm:grid-cols-[0.72fr_1fr] sm:items-start">
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--on-surface)_58%,transparent)]">
                    Andishi layer
                  </p>
                  <p className="body-md text-[var(--on-surface-dim)]">
                    Technical assessment, reference checks, production track
                    record, and post-placement support designed to move
                    together.
                  </p>
                </div>
              </div>
              <div className="hidden lg:block" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Founder() {
  const founderStats = [
    ["Africa", "Talent network"],
    ["Founder-led", "Direct accountability"],
    ["30 days", "Placement guarantee"],
  ];

  const operatingRules = [
    "Match for ownership, not keywords.",
    "Vetting must look like production work.",
    "Stay close after the start date.",
  ];

  return (
    <section className="relative isolate overflow-hidden px-5 py-24 sm:px-8 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
        style={processTextureStyle}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_14%,transparent),transparent)]"
      />

      <div className="relative z-[1] mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="order-2 lg:order-1">
          <div className="relative mx-auto max-w-[28rem] lg:mx-0">
            <div
              aria-hidden="true"
              className="absolute -left-5 -top-5 h-24 w-36 rotate-[-8deg] rounded-[2rem] border border-[color-mix(in_srgb,var(--secondary)_18%,transparent)] opacity-60"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-7 -right-6 h-32 w-52 rotate-[7deg] rounded-[2rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] opacity-60"
            />

            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-[color-mix(in_srgb,var(--on-surface)_13%,transparent)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)]">
              <Image
                src="/images/ian.jpg"
                alt="Andishi founder"
                fill
                sizes="(min-width: 1024px) 28rem, 88vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_46%,color-mix(in_srgb,var(--bg-deep)_84%,transparent)_100%)]" />
              <div className="absolute inset-x-0 bottom-8 p-5 sm:p-6">
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--on-surface-dim)]">
                  CEO / Founder
                </p>
                <p className="mt-2 text-[1.3rem] font-medium leading-tight text-[var(--on-surface)]">
                  Built close to the engineer, the client, and the work.
                </p>
              </div>
            </div>

            <div className="relative z-[2] mx-4 -mt-10 rounded-[1.3rem] border border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] p-4 shadow-[0_20px_70px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)] backdrop-blur-2xl sm:mx-8">
              <div className="grid grid-cols-3 gap-2">
                {founderStats.map(([value, label]) => (
                  <div key={label}>
                    <p className="font-mono text-[0.78rem] leading-tight tracking-normal text-[var(--on-surface)]">
                      {value}
                    </p>
                    <p className="mt-1 text-[0.64rem] leading-snug text-[var(--on-surface-dim)]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="label-caps mb-5 flex items-center gap-3 text-(--tertiary)">
            <span className="h-px w-7 bg-(--tertiary)" />
            Founder
          </p>
          <h2 className="max-w-[13ch] text-[clamp(2.45rem,7vw,5.2rem)] font-normal leading-[0.94] tracking-normal text-foreground">
            Built from Africa. Accountable after placement.
          </h2>
          <p className="body-md mt-6 max-w-2xl text-(--on-surface-dim)">
            Andishi exists because senior African engineers are too often
            invisible to global startups, and global startups are tired of
            hiring channels that cannot tell senior signal from polished CVs.
          </p>

          <blockquote className="mt-8 border-l border-[color-mix(in_srgb,var(--secondary)_38%,transparent)] pl-5 text-[clamp(1.15rem,2.2vw,1.55rem)] font-normal leading-snug text-foreground">
            “The talent was always here. The work is finding it, vetting it,
            and making the engagement low-friction.”
          </blockquote>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {operatingRules.map((rule, index) => (
              <div
                key={rule}
                className="relative overflow-hidden rounded-[1.2rem] border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] p-4"
              >
                <p className="font-mono text-[0.68rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface)_48%,transparent)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-5 text-[0.92rem] leading-snug text-[var(--on-surface)]">
                  {rule}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section
      id="contact"
      className="relative isolate overflow-hidden bg-[var(--bg-deep)] px-6 py-20 text-center sm:px-8 lg:py-36"
    >
      <CustomCursorRegion className="-mx-6 -my-20 px-6 py-20 sm:-mx-8 sm:px-8 lg:-my-36 lg:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-80"
      >
        <img
          src="/final-cta.svg"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute left-1/2 top-1/2 h-auto w-[min(1580px,150vw)] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.56] dark:opacity-[0.5]"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)",
          }}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,var(--bg)_0%,color-mix(in_srgb,var(--bg)_68%,transparent)_22%,color-mix(in_srgb,var(--bg)_66%,transparent)_78%,var(--bg)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-0 w-[28%] bg-[linear-gradient(to_right,var(--bg)_0%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-0 w-[28%] bg-[linear-gradient(to_left,var(--bg)_0%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
        style={processTextureStyle}
      />
      <div className="relative z-[1] mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] bg-[color-mix(in_srgb,var(--surface)_58%,transparent)] px-5 py-10 shadow-[0_30px_110px_color-mix(in_srgb,var(--bg-deep)_38%,transparent)] backdrop-blur-2xl sm:px-10 sm:py-12 lg:px-14 lg:py-14">
        <p className="label-caps mb-4" style={{ color: "var(--secondary)" }}>
          Start here
        </p>
        <h2
          style={{
            fontSize: "clamp(2rem, 3.5vw, 3.5rem)",
            fontWeight: 300,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "var(--on-surface)",
          }}
        >
          Tell us what you are building.
        </h2>
        <p
          className="body-md mx-auto mt-5 max-w-md"
          style={{ color: "var(--on-surface-dim)" }}
        >
          We will tell you within 48 hours whether we have the right engineer
          for it, and surface profiles if we do.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/contact" variant="primary">
            Start a conversation
            <IconArrowRight size={16} stroke={1.8} />
          </LinkButton>
          <LinkButton href="mailto:hire@andishi.dev" variant="glass">
            hire@andishi.dev
          </LinkButton>
        </div>
        <p
          className="label-caps mt-6"
          style={{ color: "var(--on-surface-dim)", opacity: 0.5 }}
        >
          No retainer required / No recruiter pitch / Response within 24 hours
        </p>
        </div>
      </div>
      </CustomCursorRegion>
    </section>
  );
}
