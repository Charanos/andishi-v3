"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  IconArrowRight,
  IconBolt,
  IconBrandGithub,
  IconBrandLinkedin,
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
  ["Email", "hello@andishi.dev", IconMail, "mailto:hello@andishi.dev"],
  ["Twitter/X", "@andishidev", IconBrandX, "https://twitter.com/andishidev"],
  [
    "LinkedIn",
    "Andishi Studio",
    IconBrandLinkedin,
    "https://linkedin.com/company/andishi",
  ],
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
      "Early web, ICT support, AI data, and product delivery experience shaped the studio's bias for practical software over presentation-only work.",
  },
  {
    year: "2023",
    event: "Delivery playbook formed",
    detail:
      "The working model became clear: small senior-led squads, clear scope, real staging links, and specialists brought in only when the project needs them.",
  },
  {
    year: "Jan 2024",
    event: "Andishi Studio founded",
    detail:
      "Andishi began as a software delivery company for businesses that needed web apps, payment systems, dashboards, and integrations built with local context.",
    badge: "Milestone",
  },
  {
    year: "2024",
    event: "Vetted developer bench",
    detail:
      "The studio expanded beyond one builder into a network of trusted in-house and contract developers, designers, and implementation specialists.",
    badge: "Milestone",
  },
  {
    year: "2024-25",
    event: "14+ products shipped",
    detail:
      "Delivered education, commerce, logistics, analytics, and payment systems for clients across East Africa and teams serving international users.",
  },
  {
    year: "Now / 2026",
    event: "Local and international delivery",
    detail:
      "Andishi now pairs Nairobi-led product direction with distributed specialists to deliver client work locally, regionally, and internationally.",
    badge: "Live now",
    current: true,
  },
];

const values = [
  {
    icon: IconBolt,
    title: "Ship first, refine always",
    body:
      "A working product in a client's hands teaches more in a week than three months of planning. We move fast and improve with real data.",
    tone: "var(--primary)",
  },
  {
    icon: IconUsers,
    title: "Context is everything",
    body:
      "Building for Kenya means M-Pesa is non-negotiable, USSD still matters, and mobile-first is the default reality.",
    tone: "var(--secondary)",
  },
  {
    icon: IconCheck,
    title: "Honest scoping, fixed pricing",
    body:
      "We would rather lose a project by quoting accurately than win it and be forced to cut corners later.",
    tone: "var(--tertiary)",
  },
  {
    icon: IconCalendarTime,
    title: "No radio silence",
    body:
      "Visible progress, staging links, and direct feedback loops. You should never need to chase your own project.",
    tone: "var(--secondary)",
  },
  {
    icon: IconRocket,
    title: "Metrics over aesthetics",
    body:
      "Beautiful software that does not move a business metric is just expensive decoration. Outcomes come first.",
    tone: "var(--primary)",
  },
  {
    icon: IconWorld,
    title: "Local context, global standards",
    body:
      "East Africa has its own stack and constraints, but the quality bar is global. We build with both realities in mind.",
    tone: "var(--secondary)",
  },
];

const availability = [
  ["Web application builds", "1 slot left", "var(--secondary)"],
  ["Payment integrations", "Open", "var(--tertiary)"],
  ["Conversion websites", "Open", "var(--tertiary)"],
  ["Large-scale platforms", "Q3 2026", "var(--primary)"],
];

const activeProjects = [
  ["Ante Social", "Social prediction market / closed beta", "72%", "A"],
  ["MySchool v2", "Multi-tenant EdTech / feature expansion", "88%", "M"],
  ["Ripoti Analytics", "SME dashboard / new connectors", "55%", "R"],
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
    label: "East Africa stack",
    skills: [
      ["M-Pesa Daraja 2.0", 96],
      ["USDT / crypto rails", 80],
      ["Africa's Talking SMS", 85],
      ["NEMIS / KRA / CBC", 78],
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

function PlusTexture({
  className = "",
  opacity = 0.12,
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
    <main className="relative isolate overflow-visible bg-[var(--bg)]">
      <PlusTexture className="z-0" opacity={0.1} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_8%,transparent),transparent_22rem),linear-gradient(90deg,color-mix(in_srgb,var(--bg)_88%,transparent),transparent_38%,color-mix(in_srgb,var(--bg)_72%,transparent))]"
      />

      <div className="relative z-[1] mx-auto flex w-full max-w-[96rem] items-start gap-0 px-5 pb-24 pt-32 sm:px-8 lg:px-10 lg:pt-36">
        <aside className="sticky top-28 hidden max-h-[calc(100svh-8rem)] w-60 shrink-0 flex-col justify-between self-start overflow-y-auto border-r border-[var(--glass-border)] pr-5 xl:flex">
          <div>
            <p className="label-caps mb-4 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
              About Andishi
            </p>
            <div className="border-y border-[var(--glass-border)]">
              {storySections.map((section) => {
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    className="group flex w-full items-center gap-3 border-b border-[var(--glass-border)] py-3 text-left text-[0.78rem] font-medium uppercase tracking-[0.1em] text-[var(--on-surface-dim)] transition-all duration-300 last:border-b-0 hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)]"
                  >
                    <span
                      className={cn(
                        "h-px w-4 bg-current transition-all duration-300",
                        isActive && "w-8 bg-[var(--secondary)]",
                      )}
                    />
                    <span className={isActive ? "text-[var(--secondary)]" : ""}>
                      {section.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[var(--glass-border)] pt-5">
            <p className="label-caps mb-4 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
              Studio facts
            </p>
            <div className="grid gap-4">
              {[
                ["Nairobi", "Studio base"],
                ["Global", "Client reach"],
                ["30d", "post-launch support"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="border-l border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] pl-3"
                >
                  <p className="font-mono text-[1.1rem] leading-none tracking-normal text-[var(--on-surface)]">
                    {value}
                  </p>
                  <p className="mt-2 text-[0.72rem] leading-snug text-[color-mix(in_srgb,var(--on-surface-dim)_68%,transparent)]">
                    {label}
                  </p>
                </div>
              ))}
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
            {[
              "/images/dev1.jpg",
              "/images/dev2.jpg",
              "/images/dev3.jpg",
              "/images/dev4.jpg",
            ].map((src, index) => (
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
            ))}
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_34%,color-mix(in_srgb,var(--bg-deep)_86%,transparent)_100%)]" />
          <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
            <PortraitChip icon={IconMapPin} label="Nairobi-led" />
            <PortraitChip icon={IconCode} label="In-house + contract devs" />
          </div>
          <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-2">
            <PortraitChip icon={IconCalendarTime} label="Operating since 2024" />
            <span className="inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--tertiary)_28%,transparent)] bg-[color-mix(in_srgb,var(--bg)_54%,transparent)] px-3 py-2 text-[0.72rem] font-medium text-[var(--tertiary)] backdrop-blur-xl">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--tertiary)]" />
              Delivery slots open
            </span>
          </div>
        </div>

        <h2 className="text-[clamp(2rem,5vw,2.7rem)] font-normal leading-none tracking-normal text-[var(--on-surface)]">
          Andishi Studio
        </h2>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
          Software delivery company / Nairobi-led, globally capable
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
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
          <h1 className="max-w-[12ch] text-[clamp(3rem,9vw,5.8rem)] font-normal leading-[0.94] tracking-normal text-[var(--on-surface)]">
            Software teams for serious launches.
          </h1>
          <div className="mt-7 max-w-2xl space-y-5">
            <p className="body-md text-[var(--on-surface-dim)]">
              Andishi is a Nairobi-led software company that assembles the right
              developers, designers, and implementation specialists for each
              build. Some work happens in-house, some through trusted contract
              specialists, but every project runs through one accountable
              delivery system.
            </p>
            <blockquote className="border-l border-[color-mix(in_srgb,var(--secondary)_44%,transparent)] pl-5 text-[clamp(1.18rem,2.4vw,1.55rem)] font-normal leading-snug text-[var(--on-surface)]">
              We bring the right team to the work, then keep one clear owner for
              scope, quality, communication, and launch.
            </blockquote>
            <p className="body-md text-[var(--on-surface-dim)]">
              That model lets us serve Kenyan and East African businesses
              without being limited to one person&apos;s bandwidth, while still
              meeting the expectations of international clients who need clean
              engineering, reliable timelines, and polished product execution.
            </p>
          </div>
        </div>

        <div className="mt-8 grid overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] sm:grid-cols-3">
          {[
            ["2024", "Studio founded"],
            ["14+", "Products shipped"],
            ["Global", "Delivery reach"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="border-b border-[var(--glass-border)] px-4 py-4 sm:border-b-0 sm:border-r sm:last:border-r-0"
            >
              <p className="font-mono text-[1.45rem] leading-none tracking-normal text-[var(--on-surface)]">
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

function PortraitChip({
  icon: Icon,
  label,
}: {
  icon: typeof IconMapPin;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_54%,transparent)] px-3 py-2 text-[0.72rem] font-medium text-[var(--on-surface-dim)] backdrop-blur-xl">
      <Icon size={14} stroke={1.6} className="text-[var(--secondary)]" />
      {label}
    </span>
  );
}

function Story() {
  return (
    <section id="origin" className="scroll-mt-32 border-b border-[var(--glass-border)] pb-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={cosmicSpring}
        className="max-w-4xl"
      >
        <p className="label-caps mb-4 flex items-center gap-3 text-[var(--secondary)]">
          <span className="h-px w-7 bg-[var(--secondary)]" />
          Origin
        </p>
        <h2 className="max-w-[13ch] text-[clamp(2rem,6vw,4.3rem)] font-normal leading-[0.96] tracking-normal text-[var(--on-surface)]">
          Why Andishi exists.
        </h2>
        <div className="mt-7 max-w-3xl space-y-5">
          <p className="body-md text-[var(--on-surface-dim)]">
            Andishi exists for companies that need real software delivery, not a
            loose chain of freelancers, templates, and unclear handoffs. The
            studio was built around a simple operating principle: understand the
            business, scope the work properly, then bring in the right technical
            team to ship it.
          </p>
          <p className="body-md text-[var(--on-surface-dim)]">
            The name Andishi comes from Swahili. It means writer or author. The
            idea is that we are not just writing code; we are authoring the
            systems that let businesses operate, sell, report, collect payments,
            and serve customers across local and international markets.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

function FounderContext() {
  return (
    <section
      id="founder"
      className="scroll-mt-32 border-b border-[var(--glass-border)] py-16"
    >
      <div className="grid gap-8 lg:grid-cols-[0.38fr_1fr] lg:items-start">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="label-caps mb-4 text-[var(--secondary)]">
            Founder context
          </p>
          <h2 className="max-w-[12ch] text-[clamp(2rem,6vw,3.6rem)] font-normal leading-[0.98] tracking-normal text-[var(--on-surface)]">
            Leadership without bottlenecking the work.
          </h2>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={cosmicSpring}
          className="relative overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-2xl sm:p-6"
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
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,color-mix(in_srgb,var(--bg-deep)_78%,transparent)_100%)]" />
            </div>

            <div>
              <p className="label-caps mb-4 text-[var(--primary)]">
                Ian Mwangi / Founder
              </p>
              <div className="space-y-4 text-[0.94rem] leading-[1.8] text-[var(--on-surface-dim)]">
                <p>
                  Ian started Andishi to close the gap between businesses that
                  need dependable software and the fragmented developer market
                  they usually have to navigate alone.
                </p>
                <p>
                  His role is to protect the standard: scope discipline,
                  technical judgment, client communication, and choosing the
                  right mix of in-house and contract talent for each build.
                </p>
                <p>
                  Andishi is intentionally not designed around one person doing
                  every task. The founder sets direction and quality control;
                  the delivery system brings in the people best suited to ship
                  the work.
                </p>
              </div>

              <div className="mt-6 grid gap-2 sm:grid-cols-3">
                {[
                  ["Direction", "Scope and product judgment"],
                  ["Quality", "Engineering review"],
                  ["Delivery", "Team assembly and cadence"],
                ].map(([label, detail]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_38%,transparent)] px-4 py-3"
                  >
                    <p className="text-[0.82rem] font-medium text-[var(--on-surface)]">
                      {label}
                    </p>
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
      <div className="grid gap-10 lg:grid-cols-[0.42fr_1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="label-caps mb-4 text-[var(--secondary)]">Timeline</p>
          <h2 className="max-w-[11ch] text-[clamp(2rem,6vw,3.6rem)] font-normal leading-[0.98] tracking-normal text-[var(--on-surface)]">
            The journey so far.
          </h2>
        </div>

        <div className="relative border-l border-[var(--glass-border)] pl-7">
          {timeline.map((item, index) => (
            <motion.article
              key={`${item.year}-${item.event}`}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ ...cosmicSpring, delay: Math.min(index * 0.05, 0.24) }}
              className="relative pb-8 last:pb-0"
            >
              <span
                className={cn(
                  "absolute -left-[2.1rem] top-1 h-3 w-3 rounded-full border-2 bg-[var(--bg)]",
                  item.current
                    ? "border-[var(--tertiary)]"
                    : "border-[color-mix(in_srgb,var(--on-surface)_22%,transparent)]",
                )}
              />
              <p className="font-mono text-[0.72rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface-dim)_64%,transparent)]">
                {item.year}
              </p>
              <h3 className="mt-2 text-[1rem] font-medium leading-snug text-[var(--on-surface)]">
                {item.event}
              </h3>
              <p className="mt-2 max-w-2xl text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
                {item.detail}
              </p>
              {item.badge && (
                <span
                  className={cn(
                    "mt-3 inline-flex rounded-full border px-3 py-1 text-[0.65rem] font-medium",
                    item.current
                      ? "border-[color-mix(in_srgb,var(--tertiary)_26%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] text-[var(--tertiary)]"
                      : "border-[color-mix(in_srgb,var(--primary)_24%,transparent)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] text-[var(--primary)]",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Values() {
  return (
    <section id="values" className="scroll-mt-32 border-b border-[var(--glass-border)] py-16">
      <div className="mb-9 max-w-3xl">
        <p className="label-caps mb-4 text-[var(--secondary)]">Values</p>
        <h2 className="max-w-[13ch] text-[clamp(2rem,6vw,3.8rem)] font-normal leading-[0.98] tracking-normal text-[var(--on-surface)]">
          What we actually believe.
        </h2>
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
              transition={{ ...cosmicSpring, delay: Math.min(index * 0.04, 0.2) }}
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
        <p className="label-caps mb-4 text-[var(--secondary)]">
          Live studio status
        </p>
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--tertiary)_26%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] px-3 py-1.5 text-[0.72rem] font-medium text-[var(--tertiary)]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--tertiary)]" />
          Updated May 2026
        </span>
        <h2 className="max-w-[13ch] text-[clamp(2rem,6vw,3.8rem)] font-normal leading-[0.98] tracking-normal text-[var(--on-surface)]">
          What is happening right now.
        </h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <StatusPanel title="Project availability" aside="May 2026">
          <div className="grid gap-2">
            {availability.map(([name, status, color]) => (
              <div
                key={name}
                className="flex items-center justify-between gap-4 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] px-4 py-3"
              >
                <span className="text-[0.86rem] text-[var(--on-surface-dim)]">
                  {name}
                </span>
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
            <LinkButton href="/contact" variant="primary" className="flex-1">
              Book a scoping call
              <IconArrowRight size={15} stroke={1.8} />
            </LinkButton>
            <LinkButton href="mailto:hello@andishi.dev" variant="glass" className="flex-1">
              hello@andishi.dev
            </LinkButton>
          </div>
        </StatusPanel>

        <StatusPanel title="Currently building" aside="3 active">
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
                    <p className="text-[0.88rem] font-medium text-[var(--on-surface)]">
                      {name}
                    </p>
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
                      className="h-full rounded-full bg-[var(--secondary)]"
                    />
                  </div>
                  <p className="mt-1 text-right font-mono text-[0.62rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
                    {progress}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </StatusPanel>
      </div>

      <div className="mt-5 grid overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] sm:grid-cols-4">
        {[
          ["14+", "Products shipped"],
          ["11d", "Fastest brief to launch"],
          ["Global", "Client reach"],
          ["0", "Missed deadlines"],
        ].map(([value, label]) => (
          <div
            key={label}
            className="border-b border-[var(--glass-border)] px-5 py-5 sm:border-b-0 sm:border-r sm:last:border-r-0"
          >
            <p className="font-mono text-[1.45rem] leading-none tracking-normal text-[var(--on-surface)]">
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
    <article className="overflow-hidden rounded-[1.3rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_42%,transparent)] px-5 py-4">
        <p className="text-[0.86rem] font-medium text-[var(--on-surface)]">
          {title}
        </p>
        <p className="font-mono text-[0.66rem] tracking-normal text-[var(--secondary)]">
          {aside}
        </p>
      </div>
      <div className="p-5">{children}</div>
    </article>
  );
}

function Capabilities() {
  return (
    <section id="capabilities" className="scroll-mt-32 border-b border-[var(--glass-border)] py-16">
      <div className="grid gap-10 lg:grid-cols-[0.36fr_1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="label-caps mb-4 text-[var(--secondary)]">Capabilities</p>
          <h2 className="max-w-[12ch] text-[clamp(2rem,6vw,3.6rem)] font-normal leading-[0.98] tracking-normal text-[var(--on-surface)]">
            The full delivery picture.
          </h2>
          <p className="body-md mt-5 text-[var(--on-surface-dim)]">
            Full-stack delivery from database schema to deployed UI, with
            specialist developers assigned around the work rather than a
            one-size team assigned to every project.
          </p>
        </div>

        <div className="grid gap-7">
          {skillGroups.map((group) => (
            <div key={group.label}>
              <p className="label-caps mb-4 flex items-center gap-3 text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
                {group.label}
                <span className="h-px flex-1 bg-[var(--glass-border)]" />
              </p>
              <div className="grid gap-3">
                {group.skills.map(([name, value]) => (
                  <SkillBar key={name} name={name as string} value={value as number} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillBar({ name, value }: { name: string; value: number }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[10rem_1fr_2.5rem] sm:items-center sm:gap-4">
      <p className="text-[0.84rem] text-[var(--on-surface-dim)]">{name}</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-[var(--secondary)]"
        />
      </div>
      <p className="font-mono text-[0.7rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)] sm:text-right">
        {value}%
      </p>
    </div>
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
          className="relative overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-2xl sm:p-8"
        >
          <PlusTexture opacity={0.08} />
          <div className="relative">
            <p className="label-caps mb-5 text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
              How delivery works
            </p>
            <div className="space-y-5 text-[0.95rem] leading-[1.8] text-[var(--on-surface-dim)]">
              <p>
                When you work with Andishi, you are not hiring a single
                developer and hoping their schedule, skill set, and stamina can
                carry the whole product. You are hiring a delivery company with
                a clear owner, a vetted technical bench, and a process built for
                client work.
              </p>
              <p>
                We match the scope to the right mix of in-house and contract
                specialists: frontend, backend, payments, analytics,
                integrations, mobile, QA, or implementation support. You still
                get one accountable project lead, one scope, and one delivery
                rhythm.
              </p>
              <p>
                The result is flexible capacity without agency bloat, local
                context without local-only thinking, and enough structure to
                serve teams building for Kenya, East Africa, and international
                markets.
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
                  Nairobi-led software delivery company
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
          className="relative overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_42%,transparent)] p-6 shadow-[0_24px_80px_color-mix(in_srgb,var(--bg-deep)_20%,transparent)] backdrop-blur-2xl sm:p-8"
        >
          <FinalCtaArtwork
            imageClassName="left-[66%] top-[47%] w-[min(780px,150%)] opacity-[0.15] dark:opacity-[0.22]"
            veilClassName="bg-[linear-gradient(90deg,color-mix(in_srgb,var(--surface)_88%,transparent)_0%,color-mix(in_srgb,var(--surface)_62%,transparent)_48%,color-mix(in_srgb,var(--bg)_72%,transparent)_100%)]"
          />
          <PlusTexture opacity={0.07} />
          <div className="relative z-[1]">
            <p className="label-caps mb-4 text-[var(--secondary)]">
              Get in touch
            </p>
            <h2 className="max-w-[12ch] text-[clamp(2rem,6vw,3.4rem)] font-normal leading-[1.02] tracking-normal text-[var(--on-surface)]">
              Let us build something real.
            </h2>
            <p className="body-md mt-5 text-[var(--on-surface-dim)]">
              One call. No pitch. Just an honest conversation about what you
              want to build, what kind of team it needs, and whether we are the
              right partner to deliver it.
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
                  <span className="font-medium text-[var(--on-surface)]">
                    {label}
                  </span>
                  <span className="ml-auto text-[0.74rem] text-[color-mix(in_srgb,var(--on-surface-dim)_64%,transparent)]">
                    {value}
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-7">
              <LinkButton href="/contact" variant="primary" className="w-full">
                Book a scoping call
                <IconArrowRight size={16} stroke={1.8} />
              </LinkButton>
              <p className="label-caps mt-5 text-center text-[color-mix(in_srgb,var(--on-surface-dim)_52%,transparent)]">
                No pitch / No retainer required / Response within 24 hours
              </p>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
