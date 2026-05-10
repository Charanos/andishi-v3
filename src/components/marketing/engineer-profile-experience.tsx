"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBolt,
  IconBrandGithub,
  IconBriefcase,
  IconCheck,
  IconClock,
  IconCode,
  IconExternalLink,
  IconMapPin,
  IconShieldCheck,
  IconStack2,
  IconUserCheck,
} from "@tabler/icons-react";
import type { Engineer } from "@/data/engineers";
import { CustomCursorRegion } from "@/components/ui/custom-cursor-region";
import { FinalCtaArtwork } from "@/components/ui/final-cta-artwork";
import { cosmicSpring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const vettingItems = [
  "Live system design interview",
  "Async code review challenge",
  "Architecture problem set",
  "Communication assessment",
  "Reference checked",
];

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function timezoneText(offset: number) {
  if (offset === 0) return "UTC+0";
  return `UTC${offset > 0 ? "+" : ""}${offset}`;
}

function availabilityText(engineer: Engineer) {
  if (engineer.availability === "now") return "Available now";

  return `Available from ${new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(engineer.availability))}`;
}

function domainLabel(domain: Engineer["domains"][number]) {
  const labels: Record<Engineer["domains"][number], string> = {
    ai: "AI / LLM",
    aws: "Cloud / AWS",
    fullstack: "Full-Stack",
    web3: "Web3",
  };

  return labels[domain];
}

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
      className={cn("pointer-events-none absolute inset-0", className)}
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

function AvailabilityBadge({ engineer }: { engineer: Engineer }) {
  const availableNow = engineer.availability === "now";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 backdrop-blur-xl",
        availableNow
          ? "border-[color-mix(in_srgb,var(--tertiary)_28%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] text-[var(--tertiary)]"
          : "border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)] text-[var(--secondary)]",
      )}
    >
      <span
        className={cn(
          "h-[6px] w-[6px] rounded-full",
          availableNow
            ? "bg-[var(--tertiary)] shadow-[0_0_8px_var(--tertiary)]"
            : "bg-[var(--secondary)]",
        )}
        aria-hidden="true"
      />
      <span className="text-[0.62rem] font-medium">{availabilityText(engineer)}</span>
    </span>
  );
}

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ ...cosmicSpring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ProfilePanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] backdrop-blur-xl sm:p-6",
        className,
      )}
    >
      <PatternTexture opacity={0.08} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--secondary)_36%,transparent),transparent)]"
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  label,
  tone = "secondary",
}: {
  icon: typeof IconCode;
  label: string;
  tone?: "secondary" | "tertiary";
}) {
  const color = tone === "tertiary" ? "var(--tertiary)" : "var(--secondary)";

  return (
    <div className="mb-5 flex items-center gap-3">
      <span
        className="grid h-9 w-9 place-items-center rounded-xl border bg-[color-mix(in_srgb,currentColor_9%,transparent)]"
        style={{
          borderColor: `color-mix(in srgb, ${color} 24%, transparent)`,
          color,
        }}
      >
        <Icon size={17} stroke={1.6} />
      </span>
      <p className="label-caps" style={{ color }}>
        {label}
      </p>
    </div>
  );
}

function SkillTag({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className="rounded-full border px-2.5 py-1 text-[0.72rem] font-medium"
      style={{
        backgroundColor: active
          ? "color-mix(in srgb, var(--secondary) 10%, transparent)"
          : "var(--glass-bg)",
        borderColor: active
          ? "color-mix(in srgb, var(--secondary) 24%, transparent)"
          : "var(--glass-border)",
        color: active ? "var(--secondary)" : "var(--on-surface-dim)",
      }}
    >
      {children}
    </span>
  );
}

function RelatedCard({ engineer }: { engineer: Engineer }) {
  return (
    <Link
      href={`/engineers/${engineer.slug}`}
      className="group relative overflow-hidden rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 shadow-[0_18px_60px_color-mix(in_srgb,var(--bg-deep)_18%,transparent)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--secondary)_28%,transparent)]"
    >
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--surface-high)]">
          <Image
            src={engineer.avatar}
            alt={`${engineer.name} profile photo`}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.98rem] font-medium text-[var(--on-surface)]">
            {engineer.name}
          </p>
          <p className="truncate text-[0.8rem] text-[var(--on-surface-dim)]">
            {engineer.role}
          </p>
          <p className="mt-1 font-mono text-[0.68rem] text-[var(--secondary)]">
            {engineer.yearsExp} yrs / {timezoneText(engineer.location.utcOffset)}
          </p>
        </div>
        <IconArrowRight
          size={16}
          stroke={1.7}
          className="shrink-0 text-[var(--on-surface-dim)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--secondary)]"
        />
      </div>
    </Link>
  );
}

export function EngineerProfileExperience({
  engineer,
  similar,
}: {
  engineer: Engineer;
  similar: Engineer[];
}) {
  const stats = [
    { label: "Years production", value: `${engineer.yearsExp}` },
    { label: "Assessment pass", value: "3/3" },
    { label: "Timezone", value: timezoneText(engineer.location.utcOffset) },
  ];

  return (
    <main className="relative isolate overflow-visible bg-[var(--bg)]">
      <CustomCursorRegion className="relative isolate">
        <PatternTexture className="z-0" opacity={0.1} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_8%,transparent),transparent_22rem),linear-gradient(90deg,color-mix(in_srgb,var(--bg)_88%,transparent),transparent_38%,color-mix(in_srgb,var(--bg)_72%,transparent))]"
        />

        <div className="relative z-[1] mx-auto w-full max-w-[96rem] px-5 pb-24 pt-32 sm:px-8 lg:px-10 lg:pt-36">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={cosmicSpring}
            className="mb-8"
          >
            <Link
              href="/engineers"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-[0.86rem] font-medium text-[var(--on-surface-dim)] backdrop-blur-xl transition-colors duration-300 hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_36%,transparent)]"
            >
              <IconArrowLeft size={15} stroke={1.6} />
              All engineers
            </Link>
          </motion.div>

          <section
            aria-labelledby="profile-name"
            className="relative overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)] backdrop-blur-2xl"
          >
            <div className="relative min-h-[28rem] overflow-hidden lg:min-h-[32rem]">
              <Image
                src={engineer.avatar}
                alt={`${engineer.name} profile photo`}
                fill
                sizes="(min-width: 1280px) 88rem, 100vw"
                className="object-cover brightness-[0.78] saturate-[0.86]"
                priority
              />
              <PatternTexture opacity={0.1} />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--bg)_88%,transparent),color-mix(in_srgb,var(--bg)_54%,transparent)_45%,transparent_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--bg),transparent_58%)]" />

              <div className="relative z-[1] flex min-h-[28rem] max-w-4xl flex-col justify-end px-5 pb-8 pt-24 sm:px-8 lg:min-h-[32rem] lg:px-10 lg:pb-10">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={cosmicSpring}
                  className="mb-4 flex flex-wrap gap-2"
                >
                  <AvailabilityBadge engineer={engineer} />
                  <span className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] px-3 py-1 text-[0.62rem] font-medium text-[var(--secondary)] backdrop-blur-xl">
                    <IconShieldCheck size={10} stroke={2} aria-hidden="true" />
                    Andishi vetted
                  </span>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.04 }}
                  className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]"
                >
                  <span className="h-px w-7 bg-[var(--secondary)]" aria-hidden="true" />
                  {engineer.domains.map(domainLabel).join(" / ")}
                </motion.p>

                <motion.h1
                  id="profile-name"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.08 }}
                  className="max-w-[12ch] text-[clamp(3rem,11vw,6.2rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)]"
                >
                  {engineer.name}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.12 }}
                  className="body-md mt-5 max-w-2xl text-[var(--on-surface-dim)]"
                >
                  {engineer.role}. {engineer.bio}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.16 }}
                  className="mt-7 flex flex-wrap gap-2"
                  aria-label="Engineer details"
                >
                  {[
                    [IconMapPin, `${engineer.location.city}, ${engineer.location.country}`],
                    [IconClock, timezoneText(engineer.location.utcOffset)],
                    [IconCode, `${engineer.yearsExp} yrs production`],
                  ].map(([Icon, label]) => {
                    const DetailIcon = Icon as typeof IconMapPin;

                    return (
                      <span
                        key={label as string}
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_48%,transparent)] px-3 py-2 text-[0.82rem] text-[var(--on-surface-dim)] backdrop-blur-xl"
                      >
                        <DetailIcon size={14} stroke={1.5} className="text-[var(--secondary)]" />
                        {label as string}
                      </span>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-8 xl:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="grid gap-5 self-start xl:sticky xl:top-28">
              <FadeIn>
                <ProfilePanel>
                  <div className="mb-5 flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--surface-high)]">
                      <Image
                        src={engineer.avatar}
                        alt={`${engineer.name} profile photo`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[1rem] font-medium text-[var(--on-surface)]">
                        {engineer.name}
                      </p>
                      <p className="mt-1 text-[0.78rem] leading-snug text-[var(--on-surface-dim)]">
                        {engineer.role}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Link
                      href="/start-project"
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-5 py-2.5 text-[0.95rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_32%,transparent)] transition-all duration-300 hover:-translate-y-px"
                    >
                      <IconBolt size={16} stroke={1.9} />
                      Request intro
                    </Link>
                    <Link
                      href="/hire"
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-2.5 text-[0.92rem] font-medium text-[var(--on-surface-dim)] transition-colors duration-300 hover:text-[var(--on-surface)]"
                    >
                      How hiring works
                    </Link>
                  </div>

                  <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)]">
                    {stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="border-r border-[var(--glass-border)] px-3 py-3 text-center last:border-r-0"
                      >
                        <p className="font-mono text-[0.9rem] tracking-tight text-[var(--secondary)]">
                          {stat.value}
                        </p>
                        <p className="mt-1 text-[0.54rem] font-medium uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex justify-center gap-2">
                    {engineer.githubUrl && (
                      <a
                        href={engineer.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-colors duration-300 hover:text-[var(--on-surface)]"
                        aria-label={`${engineer.name} on GitHub`}
                      >
                        <IconBrandGithub size={17} stroke={1.6} />
                      </a>
                    )}
                    {engineer.portfolioUrl && (
                      <Link
                        href={engineer.portfolioUrl}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-colors duration-300 hover:text-[var(--on-surface)]"
                        aria-label={`${engineer.name} portfolio`}
                      >
                        <IconExternalLink size={17} stroke={1.6} />
                      </Link>
                    )}
                  </div>
                </ProfilePanel>
              </FadeIn>

              <FadeIn delay={0.04}>
                <ProfilePanel>
                  <p className="label-caps mb-3 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                    Technical stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {engineer.skills.map((skill, index) => (
                      <SkillTag key={skill} active={index === 0}>
                        {skill}
                      </SkillTag>
                    ))}
                  </div>
                </ProfilePanel>
              </FadeIn>
            </aside>

            <div className="grid gap-5">
              <FadeIn>
                <ProfilePanel className="p-5 sm:p-7">
                  <SectionTitle icon={IconUserCheck} label="Profile" />
                  <div className="grid gap-5 text-[1.02rem] leading-[1.75] text-[var(--on-surface-dim)]">
                    {engineer.longBio.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </ProfilePanel>
              </FadeIn>

              <FadeIn delay={0.03}>
                <div className="grid gap-5 lg:grid-cols-3">
                  {engineer.highlights.map((highlight, index) => (
                    <ProfilePanel key={highlight}>
                      <p className="font-mono text-[0.72rem] text-[var(--secondary)]">
                        {formatIndex(index)}
                      </p>
                      <p className="mt-4 text-[0.9rem] leading-[1.65] text-[var(--on-surface-dim)]">
                        {highlight}
                      </p>
                    </ProfilePanel>
                  ))}
                </div>
              </FadeIn>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <FadeIn delay={0.05}>
                  <ProfilePanel className="h-full p-5 sm:p-7">
                    <SectionTitle icon={IconBriefcase} label="Experience" />
                    <ol className="relative space-y-6 border-l border-[var(--glass-border)] pl-6">
                      {engineer.workHistory.map((work) => (
                        <li key={`${work.company}-${work.duration}`} className="relative">
                          <span
                            aria-hidden="true"
                            className="absolute -left-[1.85rem] top-1 grid h-4 w-4 place-items-center rounded-full border border-[color-mix(in_srgb,var(--secondary)_30%,transparent)] bg-[var(--surface)]"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--secondary)]" />
                          </span>
                          <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-start">
                            <div>
                              <h2 className="text-[1rem] font-medium text-[var(--on-surface)]">
                                {work.company}
                              </h2>
                              <p className="mt-1 text-[0.88rem] text-[var(--secondary)]">
                                {work.role}
                              </p>
                            </div>
                            <p className="font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
                              {work.duration}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </ProfilePanel>
                </FadeIn>

                <div className="grid gap-5">
                  <FadeIn delay={0.07}>
                    <ProfilePanel>
                      <SectionTitle icon={IconShieldCheck} label="Vetting completed" tone="tertiary" />
                      <ul className="space-y-2.5" aria-label="Vetting stages passed">
                        {vettingItems.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]"
                          >
                            <span
                              className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--tertiary)_16%,transparent)] text-[var(--tertiary)]"
                              aria-hidden="true"
                            >
                              <IconCheck size={10} stroke={2.5} />
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </ProfilePanel>
                  </FadeIn>

                  <FadeIn delay={0.09}>
                    <ProfilePanel className="border-[color-mix(in_srgb,var(--secondary)_22%,transparent)]">
                      <p className="mb-2 inline-flex items-center gap-2 text-[0.78rem] font-medium text-[var(--secondary)]">
                        <IconBolt size={15} stroke={1.8} />
                        Work with {engineer.name.split(" ")[0]}
                      </p>
                      <p className="text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
                        Submit a brief and mention this profile. Andishi will
                        confirm availability, fit, and intro timing before the
                        first call.
                      </p>
                      <Link
                        href="/start-project"
                        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-5 py-2 text-[0.92rem] font-medium text-[var(--bg)]"
                      >
                        Request an intro
                        <IconArrowRight size={15} stroke={1.8} />
                      </Link>
                    </ProfilePanel>
                  </FadeIn>
                </div>
              </div>

              {similar.length > 0 && (
                <FadeIn delay={0.1}>
                  <ProfilePanel className="p-5 sm:p-7">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <SectionTitle icon={IconStack2} label="Similar profiles" />
                        <h2 className="text-[clamp(1.5rem,4vw,2.4rem)] font-normal leading-[1.04] tracking-tight text-[var(--on-surface)]">
                          More engineers you might like.
                        </h2>
                      </div>
                      <Link
                        href="/engineers"
                        className="inline-flex items-center gap-1.5 text-[0.92rem] font-medium text-[var(--secondary)]"
                      >
                        View all
                        <IconArrowRight size={15} stroke={1.8} />
                      </Link>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      {similar.map((item) => (
                        <RelatedCard key={item.slug} engineer={item} />
                      ))}
                    </div>
                  </ProfilePanel>
                </FadeIn>
              )}

              <section className="relative mt-10 overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_42%,transparent)] px-6 py-12 text-center shadow-[0_24px_80px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] backdrop-blur-2xl sm:px-10 lg:px-16 lg:py-16">
                <FinalCtaArtwork />
                <PatternTexture opacity={0.12} />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_22%,transparent),transparent)]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-10 left-8 h-28 w-44 rotate-[-8deg] rounded-[2rem] border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] opacity-40"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 top-8 h-32 w-52 rotate-[8deg] rounded-[2rem] border border-[color-mix(in_srgb,var(--secondary)_16%,transparent)] opacity-35"
                />
                <div className="relative z-[1] mx-auto max-w-2xl">
                  <p className="label-caps mb-4 text-[var(--secondary)]">
                    Ready to move?
                  </p>
                  <h2 className="text-[clamp(2rem,6vw,3.6rem)] font-normal leading-[1.04] tracking-tight text-[var(--on-surface)]">
                    Submit a brief and we will connect you with {engineer.name.split(" ")[0]}.
                  </h2>
                  <p className="body-md mx-auto mt-5 max-w-lg text-[var(--on-surface-dim)]">
                    Tell us your role, stack, and timeline. Andishi handles the
                    fit check, availability, and intro scheduling.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                      href="/start-project"
                      className="inline-flex min-h-[2.35rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                    >
                      Submit a hiring brief
                      <IconArrowRight size={15} stroke={2} />
                    </Link>
                    <Link
                      href="/engineers"
                      className="inline-flex min-h-[2.35rem] items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--glass-bg)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_34%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                    >
                      Browse more engineers
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </div>
      </CustomCursorRegion>
    </main>
  );
}
