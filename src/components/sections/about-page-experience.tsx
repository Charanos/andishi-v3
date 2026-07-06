"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  IconBolt,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandWhatsapp,
  IconBrandX,
  IconCalendarTime,
  IconCheck,
  IconCode,
  IconMail,
  IconMapPin,
  IconRocket,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { LinkButton } from "@/components/ui/button";
import { FinalCtaArtwork } from "@/components/ui/final-cta-artwork";
import { cn } from "@/lib/utils";
import { cosmicSpring } from "@/lib/motion";

const socialLinks = [
  ["Twitter/X", IconBrandX, "https://twitter.com/andishidev"],
  ["LinkedIn", IconBrandLinkedin, "https://linkedin.com/company/andishi"],
  ["GitHub", IconBrandGithub, "https://github.com/Charanos"],
] as const;

const contactLinks = [
  ["Email", "hire@andishi.dev", IconMail, "mailto:hire@andishi.dev"],
  ["Twitter/X", "@andishidev", IconBrandX, "https://twitter.com/andishidev"],
  ["LinkedIn", "Andishi Talent", IconBrandLinkedin, "https://linkedin.com/company/andishi"],
] as const;

const storySections = [
  { id: "origin", label: "Origin" },
  { id: "founder", label: "Founder" },
  { id: "timeline", label: "Timeline" },
  { id: "values", label: "Values" },
  { id: "status", label: "Status" },
  { id: "capabilities", label: "Capabilities" },
];

const timeline = [
  {
    year: "2021-23",
    event: "Technical groundwork",
    detail:
      "Early web, ICT support, AI data, and product delivery experience shaped Andishi's bias for practical engineers who can ship, not just talk about code.",
  },
  {
    year: "2023",
    event: "Delivery playbook formed",
    detail:
      "The working model became clear: understand the client need technically, verify production signal, and build systems with direct accountability and zero agency overhead.",
  },
  {
    year: "Jan 2024",
    event: "Andishi founded",
    detail:
      "Andishi began as a software studio building web apps, payment systems, dashboards, and integrations for local Kenyan businesses and global startups.",
    badge: "Milestone",
  },
  {
    year: "2024",
    event: "Vetted engineering network",
    detail:
      "We built a network of trusted senior engineers across full-stack, backend, AI, cloud, and mobile to expand our studio delivery capacity.",
    badge: "Milestone",
  },
  {
    year: "2024-25",
    event: "Product portfolio expands",
    detail:
      "School management tools, payment engines, SaaS dashboards, and logistics systems shipped, establishing a strong track record of production-ready software.",
  },
  {
    year: "Now / 2026",
    event: "Software studio first",
    detail:
      "Andishi focuses fully on studio product delivery, custom software, and AI systems, while offering vetted staff augmentation to global clients who want to scale their teams.",
    badge: "Live now",
    current: true,
  },
];

const values = [
  {
    icon: IconBolt,
    title: "Production signal beats polish",
    body: "We care about shipped systems, reference checks, judgment under constraints, and whether code solves actual business problems.",
    tone: "var(--primary)",
  },
  {
    icon: IconUsers,
    title: "Nairobi-led global delivery",
    body: "Our Nairobi hub delivers global-quality software. Timezone alignment, direct communication, and deep engineering depth are our core strengths.",
    tone: "var(--secondary)",
  },
  {
    icon: IconCheck,
    title: "Lead builder accountability",
    body: "You speak directly to the lead builders of your software, not account managers who translate technical details incorrectly.",
    tone: "var(--tertiary)",
  },
  {
    icon: IconCalendarTime,
    title: "Weekly sprint cycles",
    body: "We build and demo in weekly milestones. Scope adjustments are handled transparently, ensuring no surprises at launch.",
    tone: "var(--secondary)",
  },
  {
    icon: IconRocket,
    title: "You own the IP entirely",
    body: "Every line of code, design asset, and database schema is yours from day one. We hand over fully documented repositories.",
    tone: "var(--primary)",
  },
  {
    icon: IconWorld,
    title: "Vetted engineering depth",
    body: "We draw from our pre-vetted senior African engineering network to staff our build teams, assuring high technical standards.",
    tone: "var(--secondary)",
  },
];

const availability = [
  ["Dedicated build teams", "Open", "var(--tertiary)"],
  ["Full-stack web/mobile", "Open", "var(--tertiary)"],
  ["AI / integrations", "Limited", "var(--secondary)"],
  ["Enterprise platforms", "Q3 2026", "var(--primary)"],
];

const activeProjects = [
  ["Fintech Payment Engine", "Next.js / Node / PostgreSQL integration", "92%", "F"],
  ["School Admin Portal", "Next.js / MongoDB / multi-tenant dashboard", "68%", "S"],
  ["Analytics SaaS Interface", "React / API data pipeline integration", "84%", "A"],
];

const radarData = [
  { domain: "Frontend", v: 93 },
  { domain: "Backend", v: 90 },
  { domain: "Mobile", v: 78 },
  { domain: "AI / ML", v: 86 },
  { domain: "Web3", v: 80 },
  { domain: "Cloud", v: 85 },
  { domain: "DevOps", v: 88 },
  { domain: "Payments", v: 90 },
];

const skillGroups = [
  {
    label: "Frontend",
    skills: [
      ["Next.js / React", 95],
      ["TypeScript", 90],
      ["Tailwind CSS", 92],
      ["React Native", 75],
    ],
  },
  {
    label: "Backend",
    skills: [
      ["NestJS", 88],
      ["Node.js", 90],
      ["PostgreSQL / MongoDB", 85],
      ["REST / GraphQL APIs", 88],
    ],
  },
  {
    label: "Specialist depth",
    skills: [
      ["AI / LLM integration", 86],
      ["AWS infrastructure", 88],
      ["Web3 / Solidity", 80],
      ["Payments / integrations", 90],
    ],
  },
  {
    label: "Infrastructure and growth",
    skills: [
      ["AWS / Vercel", 82],
      ["GitHub / CI/CD", 88],
      ["Digital marketing", 78],
    ],
  },
];

function PlusTexture({ className = "", opacity = 0.12 }: { className?: string; opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 11.5v9M11.5 16h9' stroke='%23c5b8e8' stroke-width='0.7' stroke-linecap='round' opacity='0.32'/%3E%3C/svg%3E\")",
        backgroundSize: "32px 32px",
      }}
    />
  );
}

export function AboutPageExperience() {
  const [activeSection, setActiveSection] = useState("origin");

  useEffect(() => {
    const sections = storySections
      .map((section) => document.getElementById(section.id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-24% 0px -58% 0px", threshold: 0.1 },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main className="relative isolate overflow-visible bg-[var(--bg)] px-5 sm:px-8 lg:px-10">
      <PlusTexture className="z-0" opacity={0.1} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_8%,transparent),transparent_22rem),linear-gradient(90deg,color-mix(in_srgb,var(--bg)_88%,transparent),transparent_38%,color-mix(in_srgb,var(--bg)_72%,transparent))]"
      />

      <div className="relative z-[1] mx-auto flex w-full max-w-[92rem] items-start gap-0 pb-24 pt-32 lg:pt-36">
        <aside className="sticky top-28 hidden max-h-[calc(100svh-8rem)] w-64 shrink-0 flex-col justify-between self-start overflow-y-auto border-r border-[var(--glass-border)] pr-6 xl:flex">
          <div className="relative">
            <p className="label-caps mb-6 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
              About Andishi
            </p>
            {/* Sidebar vertical track */}
            <div className="absolute left-[11px] top-12 bottom-4 w-[1px] bg-[var(--glass-border)]" />

            <div className="flex flex-col gap-1">
              {storySections.map((section, idx) => {
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    className="group relative flex w-full flex-col items-start pl-7 py-3 text-left focus-visible:outline-none focus-visible:ring-0"
                  >
                    {/* Visual dot on vertical track */}
                    <div
                      className={cn(
                        "absolute left-[7px] top-[18px] z-10 h-[9px] w-[9px] rounded-full border transition-all duration-300",
                        isActive
                          ? "border-[var(--primary)] bg-[var(--primary)] shadow-[0_0_6px_var(--primary)] scale-110"
                          : "border-transparent bg-[color-mix(in_srgb,var(--on-surface)_20%,transparent)] group-hover:bg-[var(--on-surface-dim)] group-hover:scale-105",
                      )}
                    />

                    {/* Section Index & Label */}
                    <span className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-[var(--on-surface-dim)] opacity-50 mb-0.5 group-hover:text-[var(--primary)] group-hover:opacity-100 transition-all duration-300">
                      0{idx + 1}
                    </span>
                    <span
                      className={cn(
                        "text-[0.84rem] font-medium uppercase tracking-[0.06em] transition-all duration-300 group-hover:text-[var(--on-surface)]",
                        isActive
                          ? "text-[var(--primary)] font-medium tracking-wide"
                          : "text-[var(--on-surface-dim)]",
                      )}
                    >
                      {section.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 xl:pl-10">
          <Hero />

          <div className="mb-8 flex gap-2 overflow-x-auto pb-1 xl:hidden">
            {storySections.map((section) => {
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className="shrink-0 rounded-full border px-4 py-2 text-[0.78rem] font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)]"
                  style={{
                    backgroundColor: isActive
                      ? "color-mix(in srgb, var(--primary) 10%, transparent)"
                      : "var(--glass-bg)",
                    borderColor: isActive
                      ? "color-mix(in srgb, var(--primary) 34%, transparent)"
                      : "var(--glass-border)",
                    color: isActive ? "var(--primary)" : "var(--on-surface-dim)",
                  }}
                >
                  {section.label}
                </button>
              );
            })}
          </div>

          <Story />
          <FounderContext />
          <Timeline />
          <Values />
          <StudioStatus />
          <Capabilities />
          <Signoff />
        </div>
      </div>
    </main>
  );
}

function Hero() {
  return (
    <section className="mb-12 border-b border-[var(--glass-border)] pb-12 lg:mb-16 lg:grid lg:min-h-[calc(100svh-9rem)] lg:grid-cols-[0.9fr_1fr] lg:gap-10 lg:pb-16">
      <motion.div
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={cosmicSpring}
        className="border-b border-[var(--glass-border)] pb-10 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10"
      >
        <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]">
          <span className="h-px w-7 bg-[var(--secondary)]" />
          The company behind it
        </p>

        <div className="relative mb-7 aspect-[4/5] max-h-[34rem] overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] p-4 shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)]">
          <PlusTexture opacity={0.1} />
          <div className="relative grid h-full grid-cols-2 gap-3">
            {["/images/dev1.jpg", "/images/dev2.jpg", "/images/dev3.jpg", "/images/dev4.jpg"].map(
              (src, index) => (
                <div
                  key={src}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]",
                    index === 0 && "translate-y-4",
                    index === 1 && "-translate-y-1",
                    index === 2 && "translate-y-1",
                    index === 3 && "-translate-y-4",
                  )}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, 45vw"
                    className="object-cover brightness-[0.82] saturate-[0.9]"
                  />
                </div>
              ),
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
            <PortraitChip icon={IconMapPin} label="Africa-sourced" />
            <PortraitChip icon={IconCode} label="Senior product builders" />
          </div>
          <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-2">
            <PortraitChip icon={IconCalendarTime} label="Operating since 2024" />
            <span className="inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--tertiary)_28%,transparent)] bg-[color-mix(in_srgb,var(--bg)_54%,transparent)] px-3 py-2 text-[0.72rem] font-medium text-[var(--tertiary)] backdrop-blur-xl">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--tertiary)]" />
              Active product studio
            </span>
          </div>
        </div>

        <h2 className="title-serif text-[clamp(2.08rem,4vw,2.65rem)] font-normal leading-none tracking-tight text-[var(--on-surface)]">
          Andishi Studio
        </h2>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
          Custom software development / Nairobi-led delivery
        </p>
        <div className="my-8 flex flex-wrap gap-2">
          {socialLinks.map(([label, Icon, href]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-[0.76rem] font-medium text-[var(--on-surface-dim)] transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] hover:text-[var(--secondary)]"
            >
              <Icon size={14} stroke={1.6} />
              {label as string}
            </a>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...cosmicSpring, delay: 0.08 }}
        className="pt-10 lg:flex lg:flex-col lg:justify-between lg:pt-0"
      >
        <div>
          <p className="label-caps mb-4 text-[var(--primary)]">Studio note</p>
          <h1 className="title-serif max-w-[18ch] text-[clamp(3.12rem,7vw,5.05rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)]">
            We build products that scale.
          </h1>
          <div className="mt-7 max-w-2xl space-y-5">
            <p className="body-md text-[var(--on-surface-dim)]">
              Andishi is a software development studio that designs, builds, and ships high-quality
              custom software, SaaS platforms, AI systems, and mobile apps. We work with global
              startups and local enterprises to launch Software Products with speed, discipline, and
              full IP ownership.
            </p>
            <blockquote className="border-l border-[color-mix(in_srgb,var(--secondary)_44%,transparent)] pl-5 text-[clamp(1.18rem,2.4vw,1.55rem)] font-normal leading-snug text-[var(--on-surface)]">
              We design, build, and ship software products that drive real business outcomes.
            </blockquote>
            <p className="body-md text-[var(--on-surface-dim)]">
              We maintain a vetted network of senior software engineers across Africa to scale our
              delivery capabilities, ensuring that every project is built by autonomous, senior
              technical owners.
            </p>
          </div>
        </div>

        <div className="mt-8 grid overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] sm:grid-cols-3">
          {[
            ["2024", "Founded"],
            ["32+", "Products shipped"],
            ["8", "Service domains"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="border-b border-[var(--glass-border)] px-4 py-4 sm:border-b-0 sm:border-r sm:last:border-r-0"
            >
              <p className="font-mono text-[1.45rem] leading-none tracking-tight text-[var(--on-surface)]">
                {value}
              </p>
              <p className="label-caps mt-2 text-[0.58rem] leading-tight text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function PortraitChip({ icon: Icon, label }: { icon: typeof IconMapPin; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_54%,transparent)] px-3 py-2 text-[0.72rem] font-medium text-[var(--on-surface-dim)] backdrop-blur-xl">
      <Icon size={14} stroke={1.6} className="text-[var(--secondary)]" />
      {label}
    </span>
  );
}

function Story() {
  return (
    <section
      id="origin"
      className="scroll-mt-32 flex justify-end text-right border-b border-[var(--glass-border)] pb-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={cosmicSpring}
        className="max-w-4xl"
      >
        <p className="label-caps mb-4 flex items-end justify-end gap-3 text-[var(--primary)]">
          <span className="h-px w-7 bg-[var(--primary)]" />
          Origin
        </p>
        <h2 className="title-serif max-w-[19ch] lg:ml-60 mr-0 text-right text-[clamp(2.25rem,4.8vw,3.75rem)] font-normal leading-[0.96] tracking-tight text-[var(--on-surface)]">
          Why Andishi exists.
        </h2>
        <div className="mt-7 max-w-3xl space-y-5">
          <p className="body-md text-[var(--on-surface-dim)]">
            Andishi exists because serious African engineers are still under-discovered by global
            hiring teams, while startups keep burning months in recruiting loops that do not
            reliably find senior talent. The company was built around a simple operating principle:
            source carefully, vet rigorously, and make the engagement easy to start.
          </p>
          <p className="body-md text-[var(--on-surface-dim)]">
            The name Andishi comes from Swahili. It means writer or author. The idea still matters:
            engineers author systems, but the bigger job is helping the right authors find the teams
            where their work can move fastest.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

function FounderContext() {
  return (
    <section id="founder" className="scroll-mt-32 border-b border-[var(--glass-border)] py-16">
      <div className="grid gap-8 lg:grid-cols-[0.38fr_1fr] lg:items-start">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="label-caps mb-4 text-[var(--secondary)]">Founder context</p>
          <h2 className="title-serif max-w-[18ch] text-[clamp(2.16rem,4.4vw,3.35rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)]">
            Built from Africa, shipping for the world.
          </h2>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={cosmicSpring}
          className="relative overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-2xl sm:p-6 max-md:!rounded-none max-md:!border-none max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!p-0"
        >
          <PlusTexture opacity={0.08} />
          <div className="relative grid gap-6 md:grid-cols-[13rem_1fr] md:items-center">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_42%,transparent)]">
              <Image
                src="/images/ian.jpg"
                alt="Ian Mwangi, founder of Andishi"
                fill
                sizes="(min-width: 1024px) 13rem, 70vw"
                className="object-cover brightness-[0.86] saturate-[0.92]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            </div>

            <div>
              <p className="label-caps mb-4 text-[var(--primary)]">Ian Mwangi / Founder & CEO</p>
              <div className="space-y-4 text-[0.94rem] leading-[1.8] text-[var(--on-surface-dim)]">
                <p>
                  Ian started Andishi to fix the broken agency model: founders paying for bloated
                  account manager layers, missed deadlines, and unmotivated developers who
                  don&apos;t understand the product&apos;s business goals.
                </p>
                <p>
                  His role is to protect the standard: technical architecture, scoping precision,
                  sprint discipline, and the quality of every line of code shipped.
                </p>
                <p>
                  Andishi is intentionally structured for high accountability. You get direct access
                  to lead builders and see working software progress weekly.
                </p>
              </div>

              <div className="mt-6 grid gap-2 sm:grid-cols-3">
                {[
                  ["Direct Scoping", "Fast, honest project briefs"],
                  ["Weekly Sprints", "Continuous visible progress"],
                  ["IP Ownership", "Full repository handovers"],
                ].map(([label, detail]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_38%,transparent)] px-4 py-3"
                  >
                    <p className="text-[0.82rem] font-medium text-[var(--on-surface)]">{label}</p>
                    <p className="mt-1 text-[0.72rem] leading-snug text-[color-mix(in_srgb,var(--on-surface-dim)_68%,transparent)]">
                      {detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section id="timeline" className="scroll-mt-32 border-b border-[var(--glass-border)] py-16">
      {/* Title row */}
      <div className="mb-12 flex items-baseline justify-between gap-6">
        <h2 className="title-serif text-[clamp(2.16rem,4.4vw,3.35rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)]">
          The journey so far.
        </h2>
        <p className="label-caps shrink-0 text-[var(--primary)]">Timeline</p>
      </div>

      {/* Vertical timeline track container */}
      <div className="relative pl-6 sm:pl-10">
        {/* Timeline connector line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--primary)_30%,transparent),color-mix(in_srgb,var(--tertiary)_40%,transparent))]" />

        {timeline.map((item, index) => {
          const isFeatured = !!item.badge;
          return (
            <motion.article
              key={`${item.year}-${item.event}`}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ ...cosmicSpring, delay: Math.min(index * 0.06, 0.25) }}
              className={cn(
                "relative pb-10 last:pb-0 group",
                "max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!pb-8 max-md:!pt-2 max-md:last:!border-b-0",
              )}
            >
              {/* Timeline dot */}
              <div className="absolute left-[-29px] sm:left-[-33px] top-1.5 z-10 flex h-[10px] w-[10px] items-center justify-center rounded-full bg-[var(--bg)]">
                <div
                  className={cn(
                    "h-[10px] w-[10px] rounded-full border transition-all duration-300 group-hover:scale-125",
                    item.current
                      ? "border-[var(--tertiary)] bg-[var(--tertiary)] shadow-[0_0_8px_var(--tertiary)]"
                      : isFeatured
                        ? "border-[var(--primary)] bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]"
                        : "border-[var(--glass-border)] bg-[var(--on-surface-dim)]",
                  )}
                />
              </div>

              {/* Destructured content card */}
              <div className="grid gap-3 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <div>
                  <p
                    className="font-mono text-[0.74rem] font-normal tracking-tight"
                    style={{
                      color: item.current ? "var(--tertiary)" : "var(--primary)",
                    }}
                  >
                    {item.year}
                  </p>
                  <h3 className="mt-1 text-[0.98rem] font-normal text-[var(--on-surface)] leading-snug">
                    {item.event}
                  </h3>
                  {item.badge && (
                    <span
                      className={cn(
                        "mt-2 inline-flex rounded-full border px-2 py-0.5 text-[0.62rem] font-medium tracking-tight",
                        item.current
                          ? "border-[color-mix(in_srgb,var(--tertiary)_26%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] text-[var(--tertiary)]"
                          : "border-[color-mix(in_srgb,var(--primary)_24%,transparent)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] text-[var(--primary)]",
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[0.88rem] leading-[1.7] text-[var(--on-surface-dim)] max-w-xl">
                    {item.detail}
                  </p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function Values() {
  return (
    <section id="values" className="scroll-mt-32 border-b border-[var(--glass-border)] py-16">
      {/* Title row: heading left, label right - z-pattern balance */}
      <div className="mb-9 flex items-baseline justify-between gap-6">
        <h2 className="title-serif text-[clamp(2.18rem,4.5vw,3.45rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)]">
          What we actually believe.
        </h2>
        <p className="label-caps shrink-0 text-[var(--primary)]">Values</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {values.map((value, index) => {
          const Icon = value.icon;

          return (
            <motion.article
              key={value.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                ...cosmicSpring,
                delay: Math.min(index * 0.04, 0.2),
              }}
              className="group relative overflow-hidden rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] sm:p-6"
            >
              <PlusTexture opacity={0.08} />
              <div className="relative">
                <span
                  className="mb-5 grid h-10 w-10 place-items-center rounded-xl border"
                  style={{
                    color: value.tone,
                    backgroundColor: `color-mix(in srgb, ${value.tone} 10%, transparent)`,
                    borderColor: `color-mix(in srgb, ${value.tone} 22%, transparent)`,
                  }}
                >
                  <Icon size={19} stroke={1.6} />
                </span>
                <h3 className="text-[1.02rem] font-medium leading-tight text-[var(--on-surface)]">
                  {value.title}
                </h3>
                <p className="mt-3 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
                  {value.body}
                </p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function StudioStatus() {
  return (
    <section id="status" className="scroll-mt-32 border-b border-[var(--glass-border)] py-16">
      <div className="mb-9">
        <p className="label-caps mb-4 text-[var(--secondary)]">Live studio status</p>
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--tertiary)_26%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] px-3 py-1.5 text-[0.72rem] font-medium text-[var(--tertiary)]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--tertiary)]" />
          Updated June 2026
        </span>
        <h2 className="title-serif max-w-[19ch] text-[clamp(2.18rem,4.5vw,3.45rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)]">
          What is happening right now.
        </h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <StatusPanel title="Build availability" aside="June 2026">
          <div className="grid gap-2">
            {availability.map(([name, status, color]) => (
              <div
                key={name}
                className="flex items-center justify-between gap-4 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] px-4 py-3"
              >
                <span className="text-[0.86rem] text-[var(--on-surface-dim)]">{name}</span>
                <span
                  className="inline-flex shrink-0 items-center gap-2 text-[0.72rem] font-medium"
                  style={{ color }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <LinkButton
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              className="flex-1"
            >
              Start a Project
              <IconBrandWhatsapp size={15} stroke={1.8} />
            </LinkButton>
            <LinkButton href="mailto:hire@andishi.dev" variant="glass" className="flex-1">
              hire@andishi.dev
            </LinkButton>
          </div>
        </StatusPanel>

        <StatusPanel title="Active builds" aside="3 active">
          <div className="grid gap-2">
            {activeProjects.map(([name, detail, progress, initial], index) => (
              <div
                key={name}
                className="grid gap-3 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] px-4 py-3 sm:grid-cols-[1fr_5rem] sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--gradient-brand)] font-mono text-[0.7rem] text-[var(--bg)]">
                    {initial}
                  </span>
                  <div>
                    <p className="text-[0.88rem] font-medium text-[var(--on-surface)]">{name}</p>
                    <p className="text-[0.72rem] leading-snug text-[color-mix(in_srgb,var(--on-surface-dim)_68%,transparent)]">
                      {detail}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: progress }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: index * 0.08 }}
                      className="h-full rounded-full bg-[var(--primary)]"
                    />
                  </div>
                  <p className="mt-1 text-right font-mono text-[0.62rem] tracking-tight text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
                    {progress}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </StatusPanel>
      </div>

      <div className="my-8 grid overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] sm:grid-cols-4">
        {[
          ["32+", "Products shipped"],
          ["8", "Service domains"],
          ["4-10w", "Average delivery"],
          ["30d", "Post-launch support"],
        ].map(([value, label]) => (
          <div
            key={label}
            className="border-b border-[var(--glass-border)] px-5 py-5 sm:border-b-0 sm:border-r sm:last:border-r-0"
          >
            <p className="font-mono text-[1.45rem] leading-none tracking-tight text-[var(--on-surface)]">
              {value}
            </p>
            <p className="label-caps mt-2 text-[0.58rem] leading-tight text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatusPanel({
  aside,
  children,
  title,
}: {
  aside: string;
  children: ReactNode;
  title: string;
}) {
  return (
    <article className="overflow-hidden rounded-[1.3rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!py-6 max-md:last:!border-b-0">
      <div className="flex items-center justify-between border-b border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_42%,transparent)] px-5 py-4 max-md:!border-b-0 max-md:!bg-transparent max-md:!px-0 max-md:!pb-3">
        <p className="text-[0.86rem] font-medium text-[var(--on-surface)]">{title}</p>
        <p className="font-mono text-[0.66rem] tracking-tight text-[var(--secondary)]">{aside}</p>
      </div>
      <div className="p-5 max-md:!px-0 max-md:!pb-2">{children}</div>
    </article>
  );
}

function Capabilities() {
  return (
    <section id="capabilities" className="scroll-mt-32 border-b border-[var(--glass-border)] py-16">
      {/* Title row: label left, heading right - z-pattern balance */}
      <div className="mb-10 flex items-baseline justify-between gap-6">
        <p className="label-caps shrink-0 text-[var(--primary)]">Capabilities</p>
        <h2 className="title-serif text-right text-[clamp(2.16rem,4.4vw,3.35rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)]">
          Our technical coverage.
        </h2>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Skill groups as chip clouds */}
        <div>
          <p className="body-md mb-7 text-[var(--on-surface-dim)]">
            Our build teams cover core product engineering needs across full-stack web, SaaS
            architectures, backend APIs, AI systems, cloud infrastructure, Web3, and mobile apps.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {skillGroups.map((group) => (
              <div
                key={group.label}
                className="rounded-[1.1rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 backdrop-blur-xl max-md:!rounded-none max-md:!border-none max-md:!bg-transparent max-md:!px-0 max-md:!py-3 max-md:!shadow-none max-md:!backdrop-blur-none"
              >
                <p className="label-caps mb-3 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.skills.map(([name]) => (
                    <span
                      key={name}
                      className="rounded-full border border-[var(--glass-border)] px-2.5 py-1 font-mono text-[0.7rem] text-[var(--on-surface-dim)] transition-colors hover:border-[color-mix(in_srgb,var(--primary)_28%,transparent)] hover:text-[var(--primary)]"
                    >
                      {name as string}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar chart - depth index */}
        <div>
          <div className="overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-2xl">
            <p className="label-caps mb-0.5 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
              Depth index
            </p>
            <p className="mb-3 text-[0.66rem] text-[color-mix(in_srgb,var(--on-surface-dim)_40%,transparent)]">
              Self-assessed across active projects
            </p>
            <ResponsiveContainer width="100%" height={286}>
              <RadarChart data={radarData} margin={{ top: 10, right: 28, bottom: 10, left: 28 }}>
                <PolarGrid
                  stroke="color-mix(in srgb, var(--on-surface) 9%, transparent)"
                  strokeDasharray="3 3"
                />
                <PolarAngleAxis
                  dataKey="domain"
                  tick={{
                    fontSize: 10,
                    fill: "var(--on-surface-dim)",
                    fontFamily: "var(--font-jetbrains)",
                  }}
                />
                <Radar
                  dataKey="v"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.14}
                  strokeWidth={1.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

function Signoff() {
  return (
    <section className="py-16 lg:py-20">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={cosmicSpring}
          className="relative overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-2xl sm:p-8 max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!py-8 max-md:last:!border-b-0 max-md:!translate-y-0"
        >
          <PlusTexture opacity={0.08} />
          <div className="relative">
            <p className="label-caps mb-5 text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
              How we build
            </p>
            <div className="space-y-5 text-[0.95rem] leading-[1.8] text-[var(--on-surface-dim)]">
              <p>
                When you build with Andishi, you are not just contracting generalists or managing
                fragmented freelance hires. You partner with a structured software studio that
                understands product architecture, deadlines, and direct accountability.
              </p>
              <p>
                We structure our builds in weekly sprints. You speak directly to the lead
                developers, review live product demos, and get full visibility into the codebase. No
                account manager layers, no telephone game.
              </p>
              <p>
                The result is production-ready, documented software that you own entirely (IP is
                yours). Post-launch, we back our work with a 30-day warranty window to fix any
                issues in production.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3 border-t border-[var(--glass-border)] pt-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--gradient-brand)] font-mono text-[0.9rem] text-[var(--bg)]">
                A
              </span>
              <div>
                <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
                  Andishi Studio
                </p>
                <p className="text-[0.74rem] text-[color-mix(in_srgb,var(--on-surface-dim)_68%,transparent)]">
                  Nairobi-led software development studio
                </p>
              </div>
            </div>
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ ...cosmicSpring, delay: 0.08 }}
          className="relative overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_42%,transparent)] p-6 shadow-[0_24px_80px_color-mix(in_srgb,var(--bg-deep)_20%,transparent)] backdrop-blur-2xl sm:p-8 max-md:!rounded-none max-md:!border-none max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!py-8 max-md:!translate-y-0"
        >
          <FinalCtaArtwork
            imageClassName="left-[66%] top-[47%] w-[min(780px,150%)] opacity-[0.15] dark:opacity-[0.22]"
            veilClassName="bg-[linear-gradient(90deg,color-mix(in_srgb,var(--surface)_88%,transparent)_0%,color-mix(in_srgb,var(--surface)_62%,transparent)_48%,color-mix(in_srgb,var(--bg)_72%,transparent)_100%)]"
          />
          <PlusTexture opacity={0.07} />
          <div className="relative z-[1]">
            <p className="label-caps mb-4 text-[var(--secondary)]">Get in touch</p>
            <h2 className="title-serif max-w-[18ch] text-[clamp(2.12rem,4.2vw,3.2rem)] font-normal leading-[1.02] tracking-tight text-[var(--on-surface)]">
              Let&apos;s build your next product.
            </h2>
            <p className="body-md my-8 text-[var(--on-surface-dim)]">
              One scoping call. No agency pitch. Just an honest technical discussion about your
              requirements, timeline, budget, and how we would build it.
            </p>

            <div className="mt-7 grid gap-2">
              {contactLinks.map(([label, value, Icon, href]) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-3 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_52%,transparent)] px-4 py-3 text-[0.84rem] text-[var(--on-surface-dim)] backdrop-blur-xl transition-all duration-300 hover:translate-x-1 hover:border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] hover:text-[var(--secondary)]"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--surface-high)_54%,transparent)]">
                    <Icon size={15} stroke={1.6} />
                  </span>
                  <span className="font-medium text-[var(--on-surface)]">{label}</span>
                  <span className="ml-auto text-[0.74rem] text-[color-mix(in_srgb,var(--on-surface-dim)_64%,transparent)]">
                    {value}
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-7">
              <LinkButton
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                className="w-full"
              >
                Start a Project
                <IconBrandWhatsapp size={16} stroke={1.8} />
              </LinkButton>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
