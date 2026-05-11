import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowRight,
  IconBriefcase,
  IconCheck,
  IconCircleCheck,
  IconClockHour8,
  IconCode,
  IconFileText,
  IconMessageCircle,
  IconRoute,
  IconShieldCheck,
  IconTerminal2,
  IconTrendingUp,
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

const patternTextureStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 11v12M11 17h12' stroke='%23c5b8e8' stroke-width='0.65' stroke-linecap='round' opacity='0.22'/%3E%3Cpath d='M4 4h4M26 30h4' stroke='%23c5b8e8' stroke-width='0.55' stroke-linecap='round' opacity='0.16'/%3E%3C/svg%3E\"), radial-gradient(circle, color-mix(in srgb, var(--secondary) 16%, transparent) 0 1px, transparent 1.8px)",
  backgroundPosition: "0 0, 17px 17px",
  backgroundSize: "34px 34px, 34px 34px",
};

const routeLinks = [
  { href: "#runway", label: "Runway" },
  { href: "#brief", label: "Brief lab" },
  { href: "#models", label: "Models" },
  { href: "#decision", label: "Decision" },
  { href: "#faq", label: "FAQ" },
] as const;

const processIcons = [
  IconFileText,
  IconRoute,
  IconUsers,
  IconMessageCircle,
  IconCode,
] as const;

const modelMeta = [
  { timeline: "2-8 weeks", label: "Scoped delivery", icon: IconBriefcase },
  { timeline: "3+ months", label: "Embedded capacity", icon: IconWorld },
  { timeline: "2-5 seats", label: "Team extension", icon: IconUsers },
] as const;

const shortlist = [
  {
    name: "Amara K.",
    role: "Full-stack lead",
    fit: "92%",
    avatar: "/images/dev1.jpg",
    stack: ["Next.js", "Node", "Fintech"],
  },
  {
    name: "Nkechi M.",
    role: "AI systems engineer",
    fit: "88%",
    avatar: "/images/dev2.jpg",
    stack: ["RAG", "Python", "APIs"],
  },
  {
    name: "Kwame A.",
    role: "Cloud architect",
    fit: "84%",
    avatar: "/images/dev3.jpg",
    stack: ["AWS", "Terraform", "K8s"],
  },
] as const;

function GlassPanel({
  children,
  className = "",
  label = "",
  showChrome = false,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
  showChrome?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)] backdrop-blur-xl ${className}`}
    >
      {showChrome && label && (
        <div className="flex h-9 items-center gap-2 border-b border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_54%,transparent)] px-4">
          <span className="h-2 w-2 rounded-full bg-[#ff6b57]" />
          <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
          <span className="h-2 w-2 rounded-full bg-[#27c93f]" />
          <span className="ml-auto font-mono text-[0.62rem] tracking-tight text-[color-mix(in_srgb,var(--on-surface)_42%,transparent)]">
            {label}
          </span>
        </div>
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--secondary)_34%,transparent),transparent)]"
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="label-caps mb-4 flex items-center gap-3 text-[var(--secondary)]">
      <span className="h-px w-7 bg-[var(--secondary)]" aria-hidden="true" />
      {children}
    </p>
  );
}

function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`text-[clamp(2rem,6vw,3.8rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)] ${className}`}
    >
      {children}
    </h2>
  );
}

function SectionBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`body-md mt-5 text-[var(--on-surface-dim)] ${className}`}>
      {children}
    </p>
  );
}

function RouteBar() {
  return (
    <div className="sticky top-20 z-30 mx-auto hidden max-w-[96rem] px-5 sm:px-8 lg:block lg:px-10">
      <nav
        aria-label="Hire page shortcuts"
        className="mx-auto flex w-fit items-center gap-1 rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_72%,transparent)] p-1 shadow-[0_18px_60px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)] backdrop-blur-2xl"
      >
        {routeLinks.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-full px-4 py-2 text-[0.78rem] font-medium text-[var(--on-surface-dim)] transition-all duration-300 hover:bg-[color-mix(in_srgb,var(--surface)_58%,transparent)] hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_36%,transparent)]"
          >
            {item.label}
          </a>
        ))}
        <Link
          href="/start-project"
          className="ml-1 inline-flex items-center gap-2 rounded-full bg-[var(--on-surface)] px-4 py-2 text-[0.78rem] font-medium text-[var(--bg)]"
        >
          Start
          <IconArrowRight size={12} stroke={2} aria-hidden="true" />
        </Link>
      </nav>
    </div>
  );
}

function HireIllustrationLayer({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-0 z-0",
          compact
            ? "bg-[radial-gradient(ellipse_at_50%_48%,color-mix(in_srgb,var(--bg)_18%,transparent),color-mix(in_srgb,var(--bg)_86%,transparent)_72%),linear-gradient(180deg,color-mix(in_srgb,var(--bg)_80%,transparent)_0%,color-mix(in_srgb,var(--bg)_48%,transparent)_42%,color-mix(in_srgb,var(--bg)_88%,transparent)_100%)]"
            : "bg-[linear-gradient(90deg,color-mix(in_srgb,var(--bg)_90%,transparent)_0%,color-mix(in_srgb,var(--bg)_54%,transparent)_34%,color-mix(in_srgb,var(--bg)_34%,transparent)_58%,color-mix(in_srgb,var(--bg)_76%,transparent)_100%),linear-gradient(180deg,color-mix(in_srgb,var(--bg)_86%,transparent)_0%,transparent_34%,color-mix(in_srgb,var(--bg)_88%,transparent)_100%)]",
        ].join(" ")}
      />
      <Image
        aria-hidden="true"
        src="/hire-hero.png"
        alt=""
        width={1400}
        height={1100}
        priority={!compact}
        loading={compact ? "lazy" : undefined}
        className={[
          "pointer-events-none absolute z-0 h-auto max-w-none object-contain",
          compact
            ? "left-1/2 top-1/2 w-[min(1180px,132vw)] -translate-x-1/2 -translate-y-1/2 opacity-[0.24] dark:opacity-[0.28]"
            : "left-1/2 top-[5.5rem] w-[min(1500px,118vw)] -translate-x-1/2 opacity-[0.24] dark:opacity-[0.28] max-lg:top-[12rem] max-lg:w-[min(1180px,165vw)]",
        ].join(" ")}
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-x-0 z-0",
          compact
            ? "bottom-0 h-28 bg-[linear-gradient(to_bottom,transparent,var(--bg)_100%)]"
            : "bottom-0 h-40 bg-[linear-gradient(to_bottom,transparent,var(--bg)_100%)]",
        ].join(" ")}
      />
    </>
  );
}

function ShortlistDeck() {
  return (
    <div className="relative min-h-[34rem] lg:min-h-[42rem]">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-10 h-[82%] w-px -translate-x-1/2 bg-[linear-gradient(to_bottom,transparent,color-mix(in_srgb,var(--secondary)_28%,transparent),transparent)]"
      />
      <div
        aria-hidden="true"
        className="absolute left-7 right-7 top-1/2 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_14%,transparent),transparent)]"
      />

      <GlassPanel
        className="absolute left-0 top-0 w-[min(19rem,78vw)] p-4"
        showChrome
        label="match.engine"
      >
        <div className="mt-4 flex items-center gap-2 border-b border-[var(--glass-border)] pb-3">
          <IconTerminal2
            size={15}
            stroke={1.5}
            className="text-[var(--secondary)]"
            aria-hidden="true"
          />
          <p className="label-caps text-[var(--secondary)]">Matching score</p>
        </div>
        <div className="grid gap-3">
          {[
            ["Ownership", "Feature owner by week two", "92"],
            ["Timezone", "UTC+0 to UTC+3 overlap", "86"],
            ["Assessment", "System + code review", "100"],
          ].map(([label, body, value]) => (
            <div key={label}>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[0.82rem] font-medium text-[var(--on-surface)]">
                  {label}
                </p>
                <p className="font-mono text-[0.7rem] text-[var(--secondary)]">
                  {value}%
                </p>
              </div>
              <p className="text-[0.74rem] leading-snug text-[var(--on-surface-dim)]">
                {body}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
                <div
                  className="h-full rounded-full bg-[var(--secondary)]"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      {shortlist.map((engineer, index) => (
        <article
          key={engineer.name}
          className={[
            "absolute w-[min(20rem,82vw)] overflow-hidden rounded-[1.25rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_54%,transparent)] shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_26%,transparent)] backdrop-blur-xl",
            index === 0 ? "right-0 top-16 rotate-[2deg]" : "",
            index === 1 ? "left-[12%] top-[42%] -rotate-[3deg]" : "",
            index === 2 ? "right-[8%] bottom-0 rotate-[1deg]" : "",
          ].join(" ")}
        >
          <div className="relative h-36">
            <Image
              src={engineer.avatar}
              alt=""
              fill
              sizes="(min-width: 1280px) 20rem, 82vw"
              className="object-cover brightness-[0.82] saturate-[0.9]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--bg)_88%,transparent),transparent_65%)]" />
            <span className="absolute right-3 top-3 rounded-full border border-[color-mix(in_srgb,var(--tertiary)_28%,transparent)] bg-[color-mix(in_srgb,var(--bg)_66%,transparent)] px-3 py-1 font-mono text-[0.7rem] text-[var(--tertiary)] backdrop-blur-xl">
              {engineer.fit}
            </span>
          </div>
          <div className="p-4">
            <p className="text-[1rem] font-medium text-[var(--on-surface)]">
              {engineer.name}
            </p>
            <p className="mt-1 text-[0.84rem] text-[var(--on-surface-dim)]">
              {engineer.role}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {engineer.stack.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_58%,transparent)] px-2.5 py-1 text-[0.7rem] font-medium leading-none text-[var(--on-surface-dim)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function BriefLab() {
  const fields = [
    {
      label: "Ownership",
      prompt: "What must this engineer own by week two?",
      sample: "Payments flow + observability handoff",
    },
    {
      label: "Stack",
      prompt: "What is already in production?",
      sample: "Next.js, Node, PostgreSQL, AWS",
    },
    {
      label: "Rhythm",
      prompt: "How does the team ship decisions?",
      sample: "UTC+1 overlap, Linear, weekly demo",
    },
  ] as const;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
      <div className="grid gap-4 md:grid-cols-3">
        {fields.map((field, index) => (
          <article
            key={field.label}
            className="group relative min-h-64 overflow-hidden rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--secondary)_28%,transparent)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
              style={patternTextureStyle}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--secondary)_12%,transparent),transparent_70%)]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--secondary)_46%,transparent),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <div className="relative z-[1]">
              <p className="font-mono text-[0.72rem] text-[var(--secondary)]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-6 text-[1.25rem] font-medium leading-tight text-[var(--on-surface)]">
                {field.label}
              </h3>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
                {field.prompt}
              </p>
              <div className="absolute inset-x-5 bottom-5 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_42%,transparent)] px-3 py-3">
                <p className="label-caps mb-1 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                  Good signal
                </p>
                <p className="text-[0.82rem] leading-snug text-[var(--on-surface)]">
                  {field.sample}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <GlassPanel className="p-5 lg:sticky lg:top-32" showChrome label="risk.controls">
        <div className="mt-4 flex items-center justify-between border-b border-[var(--glass-border)] pb-4">
          <p className="label-caps text-[var(--secondary)]">Included</p>
          <span className="font-mono text-[0.68rem] text-[var(--on-surface-dim)]">
          </span>
        </div>
        <div className="grid gap-3">
          {hireGuarantees.map((item, index) => {
            const Icon = [IconClockHour8, IconUsers, IconCircleCheck][index];

            return (
              <div
                key={item.title}
                className="grid grid-cols-[2.5rem_1fr] gap-3"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_9%,transparent)] text-[var(--secondary)]">
                  <Icon size={18} stroke={1.6} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-mono text-[0.9rem] leading-none text-[var(--on-surface)]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-[0.82rem] font-medium text-[var(--on-surface)]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[0.76rem] leading-relaxed text-[var(--on-surface-dim)]">
                    {item.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>
    </div>
  );
}

function ProcessRunway() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-[2.15rem] hidden h-px bg-[linear-gradient(to_right,transparent,var(--glass-border),transparent)] lg:block"
      />
      <div className="grid gap-4 lg:grid-cols-5">
        {hireProcessSteps.map((step, index) => {
          const Icon = processIcons[index];

          return (
            <article
              key={step.name}
              className={[
                "group relative overflow-hidden rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--secondary)_26%,transparent)]",
                index % 2 === 1 ? "lg:mt-12" : "",
              ].join(" ")}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
                style={patternTextureStyle}
              />
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute h-24 w-24 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--secondary)_8%,transparent),transparent_70%)]`}
                style={{
                  top: index % 3 === 0 ? "-2rem" : "auto",
                  bottom: index % 3 === 1 ? "-1rem" : "auto",
                  right: index % 2 === 0 ? "-2rem" : "auto",
                  left: index % 2 === 1 ? "-1.5rem" : "auto",
                }}
              />
              <div className="relative z-[1]">
                <span className="mb-6 grid h-11 w-11 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[var(--bg)] text-[var(--secondary)] shadow-[0_0_0_6px_color-mix(in_srgb,var(--bg)_82%,transparent)] group-hover:shadow-[0_0_0_6px_color-mix(in_srgb,var(--secondary)_12%,transparent)] transition-shadow duration-300">
                  <Icon size={20} stroke={1.6} aria-hidden="true" />
                </span>
                <p className="font-mono text-[0.72rem] text-[color-mix(in_srgb,var(--on-surface-dim)_66%,transparent)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-[1.02rem] font-medium leading-snug text-[var(--on-surface)]">
                  {step.name}
                </h3>
                <p className="mt-3 text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
                  {step.text}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function EngagementModels() {
  return (
    <div className="grid gap-4">
      {engagementModels.map((model, index) => {
        const meta = modelMeta[index];
        const Icon = meta.icon;

        return (
          <article
            key={model.title}
            className="group relative grid gap-5 overflow-hidden rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--secondary)_26%,transparent)] md:grid-cols-[13rem_1fr_auto] md:items-center"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 opacity-[0.05]"
              style={patternTextureStyle}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_70%)]"
            />
            <div className="relative z-[1]">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--primary)_24%,transparent)] bg-[color-mix(in_srgb,var(--primary)_9%,transparent)] text-[var(--primary)] group-hover:shadow-[0_0_0_8px_color-mix(in_srgb,var(--primary)_8%,transparent)] transition-shadow duration-300">
                <Icon size={20} stroke={1.6} aria-hidden="true" />
              </span>
              <p className="mt-4 font-mono text-[0.76rem] text-[var(--on-surface-dim)]">
                {meta.timeline}
              </p>
            </div>
            <div>
              <p className="label-caps mb-2 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                {meta.label}
              </p>
              <h3 className="text-[1.25rem] font-medium leading-tight text-[var(--on-surface)]">
                {model.title}
              </h3>
              <p className="mt-3 max-w-2xl text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
                {model.body}
              </p>
            </div>
            <Link
              href="/start-project"
              className="inline-flex min-h-[2.5rem] items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_48%,transparent)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)] transition-all duration-300 group-hover:border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] group-hover:text-[var(--secondary)]"
              aria-label={`Start hiring with ${model.title} model`}
            >
              Start
              <IconArrowRight size={13} stroke={2} aria-hidden="true" />
            </Link>
          </article>
        );
      })}
    </div>
  );
}

function DecisionRoom() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
      <GlassPanel className="p-5 sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-5 border-b border-[var(--glass-border)] pb-5">
          <div>
            <p className="label-caps mb-3 text-[var(--secondary)]">
              Intro room
            </p>
            <h3 className="text-[clamp(1.5rem,3vw,2.15rem)] font-normal leading-tight text-[var(--on-surface)]">
              Review fewer people with stronger signal.
            </h3>
          </div>
          <span className="hidden rounded-full border border-[color-mix(in_srgb,var(--tertiary)_28%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] px-3 py-1 font-mono text-[0.68rem] text-[var(--tertiary)] sm:inline-flex">
            2-4 profiles
          </span>
        </div>
        <div className="grid gap-3">
          {[
            [
              "Profile evidence",
              "Assessment notes, past work, availability, timezone, and role fit.",
            ],
            [
              "Intro agenda",
              "30 minutes of technical depth, operating rhythm, and scope discussion.",
            ],
            [
              "Onboarding handoff",
              "First sprint scope, repo access, communication norms, and guarantee terms.",
            ],
          ].map(([title, body], index) => (
            <div key={title} className="grid grid-cols-[2rem_1fr] gap-3">
              <span className="mt-1 font-mono text-[0.72rem] text-[var(--secondary)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="border-b border-[var(--glass-border)] pb-4 last:border-b-0 last:pb-0">
                <p className="text-[0.96rem] font-medium text-[var(--on-surface)]">
                  {title}
                </p>
                <p className="mt-1.5 text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      <div className="relative overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_38%,transparent)] p-4 shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)]">
        <div className="relative min-h-[27rem] overflow-hidden rounded-[1.1rem] border border-[var(--glass-border)]">
          <Image
            src="/images/dev4.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover brightness-[0.75] saturate-[0.9]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--bg)_0%,color-mix(in_srgb,var(--bg)_74%,transparent)_34%,transparent_72%)]" />
          <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_66%,transparent)] p-4 backdrop-blur-xl">
            <p className="label-caps mb-3 text-[var(--secondary)]">Week one</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Access", "Repo + docs"],
                ["Scope", "First sprint"],
                ["Signal", "Code shipped"],
              ].map(([value, label]) => (
                <div key={value}>
                  <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">
                    {value}
                  </p>
                  <p className="mt-1 text-[0.72rem] text-[var(--on-surface-dim)]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HirePage() {
  return (
    <>
      <main className="relative isolate mx-auto max-w-[96rem] overflow-hidden bg-[var(--bg)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_9%,transparent),transparent_26rem),linear-gradient(90deg,color-mix(in_srgb,var(--bg)_92%,transparent),transparent_40%,color-mix(in_srgb,var(--bg)_78%,transparent))]"
        />

        <section className="relative z-[1] mx-auto max-w-[96rem] overflow-hidden px-5 pb-16 pt-32 sm:px-8 lg:px-10 lg:pb-24 lg:pt-40">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
            style={patternTextureStyle}
          />
          <HireIllustrationLayer />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(90deg,color-mix(in_srgb,var(--bg)_44%,transparent)_0%,color-mix(in_srgb,var(--bg)_28%,transparent)_34%,transparent_64%,color-mix(in_srgb,var(--bg)_18%,transparent)_100%),linear-gradient(180deg,color-mix(in_srgb,var(--bg)_32%,transparent)_0%,transparent_26%,color-mix(in_srgb,var(--bg)_12%,transparent)_58%,color-mix(in_srgb,var(--bg)_28%,transparent)_100%)] max-[899px]:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--bg)_38%,transparent)_0%,color-mix(in_srgb,var(--bg)_18%,transparent)_42%,color-mix(in_srgb,var(--bg)_32%,transparent)_100%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-[12rem] z-[3] h-[14rem] bg-[linear-gradient(to_bottom,transparent_0%,color-mix(in_srgb,var(--bg)_12%,transparent)_48%,transparent_100%)]"
          />
          <div className="relative z-[5] mx-auto grid max-w-[96rem] gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(26rem,0.86fr)] lg:items-center">
            <div className="relative z-[1]">
              <SectionEyebrow>How hiring works</SectionEyebrow>
              <h1 className="max-w-[12.5ch] text-[clamp(3rem,9vw,6.4rem)] font-normal leading-[0.92] tracking-tight text-[var(--on-surface)]">
                A sharper way to hire senior engineers.
              </h1>
              <p className="body-md mt-7 max-w-2xl text-[var(--on-surface-dim)]">
                Andishi turns a real technical need into a narrow, evidence-rich
                shortlist of senior African engineers. The experience is built
                like a matching room, not a recruiting marketplace.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/start-project"
                  className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-7 py-3 text-[0.92rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_40%,transparent)]"
                >
                  Start hiring
                  <IconArrowRight size={15} stroke={2} aria-hidden="true" />
                </Link>
                <Link
                  href="/engineers"
                  className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--on-surface)_18%,transparent)] bg-[var(--glass-bg)] px-7 py-3 text-[0.92rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_36%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_40%,transparent)]"
                >
                  Browse engineers
                </Link>
              </div>
              <div className="mt-10 grid max-w-2xl gap-3 grid-cols-3">
                {[
                  ["8d", "first profiles"],
                  ["5+", "years seniority"],
                  ["30d", "guarantee"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="border-l border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] pl-3"
                  >
                    <p className="font-mono text-[1.35rem] leading-none tracking-tight text-[var(--on-surface)]">
                      {value}
                    </p>
                    <p className="mt-2 text-[0.8rem] leading-snug text-[var(--on-surface-dim)]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-[1]">
              <ShortlistDeck />
            </div>
          </div>
        </section>

        <RouteBar />

        <section
          id="runway"
          className="relative z-[1] overflow-hidden px-5 py-16 sm:px-8 lg:px-10 lg:py-24"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
            style={patternTextureStyle}
          />
          <div className="relative z-[1] mx-auto max-w-[96rem]">
            <div className="mb-12 grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(18rem,0.35fr)] lg:items-end">
              <div>
                <SectionEyebrow>Matching runway</SectionEyebrow>
                <SectionTitle className="max-w-[14ch]">
                  Five controlled moves from brief to code.
                </SectionTitle>
              </div>
              <p className="body-md text-[var(--on-surface-dim)] lg:text-right">
                The shape is intentionally narrow: enough diligence to reduce
                risk, not enough process to stall the roadmap.
              </p>
            </div>
            <ProcessRunway />
          </div>
        </section>

        <section
          id="brief"
          className="relative z-[1] overflow-hidden px-5 py-16 sm:px-8 lg:px-10 lg:py-24"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
            style={patternTextureStyle}
          />
          <div className="relative z-[1] mx-auto max-w-[96rem]">
            <div className="mb-12 grid gap-6 border-y border-[var(--glass-border)] py-8 lg:grid-cols-[0.42fr_1fr] lg:items-end">
              <div>
                <p className="font-mono text-[0.74rem] uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--secondary)_82%,transparent)]">
                  Brief lab
                </p>
                <p className="mt-4 max-w-sm text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
                  Not a job post. A compact operating snapshot for matching.
                </p>
              </div>
              <div>
                <SectionTitle className="max-w-[15ch]">
                  The brief is the first quality filter.
                </SectionTitle>
                <SectionBody className="max-w-2xl">
                  We need the working truth: what should be owned, what already
                  exists, and how the team makes decisions.
                </SectionBody>
              </div>
            </div>
            <BriefLab />
          </div>
        </section>

        <section
          id="models"
          className="relative z-[1] overflow-hidden px-5 py-16 sm:px-8 lg:px-10 lg:py-24"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
            style={patternTextureStyle}
          />
          <div className="relative z-[1] mx-auto grid max-w-[96rem] gap-10 lg:grid-cols-[0.34fr_1fr] lg:items-start">
            <GlassPanel className="p-6 sm:p-8 lg:sticky lg:top-32">
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--secondary)]">
                Engagement models
              </p>
              <SectionTitle className="mt-4 max-w-[10ch]">
                Match the contract to the work.
              </SectionTitle>
              <SectionBody>
                Scoped build, embedded capacity, or a small senior team. The
                model follows the ownership need, not the other way round.
              </SectionBody>
              <div className="mt-8 grid grid-cols-3 overflow-hidden rounded-2xl border border-[var(--glass-border)]">
                {[
                  ["1", "scope"],
                  ["3+", "months"],
                  ["2-5", "seats"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="border-r border-[var(--glass-border)] px-3 py-4 last:border-r-0"
                  >
                    <p className="font-mono text-[1.35rem] leading-none text-[var(--on-surface)]">
                      {value}
                    </p>
                    <p className="mt-2 text-[0.66rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </GlassPanel>
            <EngagementModels />
          </div>
        </section>

        <section
          id="decision"
          className="relative z-[1] overflow-hidden px-5 py-16 sm:px-8 lg:px-10 lg:py-24"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
            style={patternTextureStyle}
          />
          <div className="relative z-[1] mx-auto max-w-[96rem]">
            <div className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SectionTitle className="max-w-[13ch]">
                Evaluate for ownership before onboarding.
              </SectionTitle>
              <p className="body-md max-w-md text-[var(--on-surface-dim)] lg:text-right">
                Every profile should answer one question: can this engineer own
                the work with your team inside the first sprint?
              </p>
            </div>
            <DecisionRoom />
          </div>
        </section>

        <section
          id="faq"
          className="relative z-[1] overflow-hidden px-5 py-16 sm:px-8 lg:px-10 lg:py-24"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
            style={patternTextureStyle}
          />
          <div className="relative z-[1] mx-auto grid max-w-[96rem] gap-10 lg:grid-cols-[0.42fr_1fr] lg:items-start">
            <div className="lg:sticky lg:top-32">
              <p className="font-mono text-[0.74rem] uppercase tracking-[0.14em] text-[var(--secondary)]">
                Buyer FAQ
              </p>
              <SectionTitle className="mt-4">
                The questions teams ask first.
              </SectionTitle>
              <SectionBody>
                Short answers for the evaluation stage. The full FAQ covers
                contracts, billing, timezone, vetting, and replacement terms.
              </SectionBody>
              <div className="mt-8 grid gap-3">
                {[
                  {
                    icon: IconShieldCheck,
                    text: "Technical assessment before any intro",
                  },
                  {
                    icon: IconTrendingUp,
                    text: "First profiles target stays around 8 days",
                  },
                  {
                    icon: IconCheck,
                    text: "Replacement guarantee covers the first 30 days",
                  },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 text-[0.84rem] text-[var(--on-surface-dim)]"
                  >
                    <Icon
                      size={15}
                      stroke={1.5}
                      className="shrink-0 text-[var(--secondary)]"
                      aria-hidden="true"
                    />
                    {text}
                  </div>
                ))}
              </div>
              <Link
                href="/hire/faq"
                className="mt-8 inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_18%,transparent)] bg-[var(--glass-bg)] px-6 py-3 text-[0.88rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_36%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_40%,transparent)]"
              >
                See all questions
                <IconArrowRight size={14} stroke={1.8} aria-hidden="true" />
              </Link>
            </div>
            <FaqList items={hireFaqTeaser} />
          </div>
        </section>

        <section className="relative z-[1] px-5 py-16 sm:px-8 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-[66rem]">
            <div className="relative grid min-h-[34rem] place-items-center overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_40%,transparent)] px-6 py-16 text-center shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_26%,transparent)] backdrop-blur-2xl sm:px-10 lg:min-h-[38rem] lg:px-20 lg:py-24">
              <FinalCtaArtwork
                imageClassName="left-1/2 top-1/2 w-[min(1120px,128%)] opacity-[0.08] dark:opacity-[0.12]"
                veilClassName="bg-transparent"
              />
              <HireIllustrationLayer compact />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_46%,color-mix(in_srgb,var(--bg)_42%,transparent),color-mix(in_srgb,var(--bg)_78%,transparent)_62%,color-mix(in_srgb,var(--bg)_92%,transparent)_100%)]"
              />
              <div className="relative z-[1] mx-auto max-w-2xl">
                <p className="font-mono text-[0.74rem] uppercase tracking-[0.14em] text-[var(--secondary)]">
                  Start here
                </p>
                <h2 className="mx-auto mt-4 max-w-7xl text-[clamp(2.2rem,6vw,4.2rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)]">
                  Submit your brief. We will build the shortlist.
                </h2>
                <p className="body-md mx-auto mt-5 max-w-xl text-[var(--on-surface-dim)]">
                  Send the role, stack, timeline, and ownership gap. Andishi
                  turns it into a narrow, technical shortlist of vetted senior
                  engineers.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/start-project"
                    className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-8 py-3 text-[0.92rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_40%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_40%,transparent)]"
                  >
                    Start hiring
                    <IconArrowRight size={15} stroke={2} aria-hidden="true" />
                  </Link>
                  <Link
                    href="/engineers"
                    className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--on-surface)_18%,transparent)] bg-[var(--glass-bg)] px-7 py-3 text-[0.92rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_36%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_40%,transparent)]"
                  >
                    Browse network
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
