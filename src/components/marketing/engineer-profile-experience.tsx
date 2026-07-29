"use client";

/**
 * src/components/marketing/engineer-profile-experience.tsx
 *
 * Flagship production-grade /engineers/[slug] detail page experience:
 * - Uncarded cinematic editorial hero directly on page background (matching /work/[slug])
 * - High-craft portrait artwork photobox frame with action CTAs
 * - Integrated stat strip divider (Years exp, Vetting bar, Timezone, Location)
 * - Fluid editorial narrative flow — zero blocky nested card soup
 * - Single-page container max-width (max-w-[92rem]) matching /work
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandGithub,
  IconBrandWhatsapp,
  IconBriefcase,
  IconCheck,
  IconClock,
  IconCode,
  IconExternalLink,
  IconMapPin,
  IconShieldCheck,
  IconUserCheck,
  IconX,
  IconMaximize,
} from "@tabler/icons-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Engineer } from "@/data/engineers";
import { CustomCursorRegion } from "@/components/ui/custom-cursor-region";
import { cosmicSpring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const vettingItems = [
  "Live system architecture & design interview",
  "Async production code review challenge",
  "Algorithmic problem set & performance audit",
  "Technical communication & leadership assessment",
  "Past client & team reference check completed",
];

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function timezoneText(offset: number) {
  if (offset === 0) return "UTC+0";
  return `UTC${offset > 0 ? "+" : ""}${offset}`;
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

function PatternTexture({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 11v12M11 17h12' stroke='%23c5b8e8' stroke-width='0.65' stroke-linecap='round' opacity='0.22'/%3E%3C/svg%3E\")",
        backgroundSize: "34px 34px",
      }}
    />
  );
}

function AvailabilityBadge({ engineer }: { engineer: Engineer }) {
  const availableNow = engineer.availability === "now";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 font-mono text-[0.68rem] uppercase tracking-wider font-medium shadow-sm",
        availableNow
          ? "border-emerald-800/80 bg-emerald-950 text-emerald-200 dark:border-emerald-500/50 dark:bg-emerald-950/80 dark:text-emerald-300"
          : "border-[var(--outline)] bg-[var(--surface-high)] text-[var(--on-surface-dim)]",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          availableNow ? "bg-emerald-400 animate-pulse" : "bg-[var(--on-surface-dim)] opacity-40",
        )}
        aria-hidden="true"
      />
      <span>{availableNow ? "AVAILABLE NOW" : "ALLOCATED"}</span>
    </span>
  );
}

function RelatedCard({ engineer }: { engineer: Engineer }) {
  return (
    <Link
      href={`/engineers/${engineer.slug}`}
      data-cursor-text="PROFILE"
      className="group relative flex items-center justify-between overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--on-surface)] hover:shadow-lg"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[var(--glass-border)] bg-[var(--surface-high)]">
          <Image
            src={engineer.avatar}
            alt={`${engineer.name} profile photo`}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate title-serif text-[1.15rem] font-normal text-[var(--on-surface)]">
            {engineer.name}
          </p>
          <p className="truncate font-mono text-[0.68rem] uppercase tracking-wider text-[var(--on-surface-dim)]">
            {engineer.role}
          </p>
          <p className="mt-0.5 font-mono text-[0.65rem] text-[var(--on-surface-dim)] opacity-70">
            {engineer.yearsExp} yrs exp • {timezoneText(engineer.location.utcOffset)}
          </p>
        </div>
      </div>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--surface-high)] text-[var(--on-surface-dim)] transition-all group-hover:border-[var(--on-surface)] group-hover:bg-[var(--on-surface)] group-hover:text-[var(--bg)]">
        <IconArrowRight
          size={15}
          className="-rotate-45 transition-transform group-hover:rotate-0"
        />
      </span>
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
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <main className="relative isolate overflow-visible bg-[var(--bg)]">
      <CustomCursorRegion className="relative isolate">
        <PatternTexture opacity={0.04} />

        {/* Top Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,color-mix(in_srgb,var(--surface-high)_12%,transparent),transparent)]"
        />

        <div className="relative z-[1] mx-auto w-full max-w-[92rem] px-5 sm:px-8 lg:px-10 pb-24 pt-28 lg:pt-32">
          {/* Top Bar: Back Link & Status Badges (Left-Aligned for Navbar Visual Harmony) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={cosmicSpring}
            className="flex flex-wrap items-center gap-3 mb-10"
          >
            <Link
              href="/engineers"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-1.5 font-mono text-[0.78rem] text-[var(--on-surface-dim)] backdrop-blur-xl transition-all duration-300 hover:border-[var(--on-surface)] hover:text-[var(--on-surface)]"
            >
              <IconArrowLeft size={14} />
              <span>Back to directory</span>
            </Link>

            <AvailabilityBadge engineer={engineer} />

            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--surface-high)] px-3.5 py-1 font-mono text-[0.68rem] uppercase tracking-wider text-[var(--on-surface-dim)]">
              <IconShieldCheck size={13} className="text-emerald-400" />
              VERIFIED ANDISHI BAR
            </span>
          </motion.div>

          {/* ── Uncarded Cinematic Hero Section (Directly on Page Surface) ── */}
          <section aria-labelledby="profile-name" className="w-full mb-12">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              {/* Left Column (7 cols): Narrative & Metadata */}
              <div className="lg:col-span-7">
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.04 }}
                  className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--on-surface-dim)] mb-3 flex items-center gap-2"
                >
                  <span className="h-px w-6 bg-[var(--on-surface-dim)] opacity-40" />
                  {engineer.domains.map(domainLabel).join(" • ")}
                </motion.p>

                <motion.h1
                  id="profile-name"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.08 }}
                  className="title-serif text-[clamp(3.2rem,7.5vw,5.5rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)] mb-5"
                >
                  {engineer.name}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.12 }}
                  className="body-md text-[1.1rem] leading-[1.7] text-[var(--on-surface-dim)] max-w-2xl font-normal mb-8"
                >
                  <strong className="text-[var(--on-surface)] font-medium">{engineer.role}.</strong>{" "}
                  {engineer.bio}
                </motion.p>

                {/* Key Details Tags */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.16 }}
                  className="flex flex-wrap gap-2.5"
                >
                  {[
                    [IconMapPin, `${engineer.location.city}, ${engineer.location.country}`],
                    [IconClock, timezoneText(engineer.location.utcOffset)],
                    [IconCode, `${engineer.yearsExp} yrs production exp`],
                  ].map(([Icon, label]) => {
                    const DetailIcon = Icon as typeof IconMapPin;
                    return (
                      <span
                        key={label as string}
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 font-mono text-[0.78rem] text-[var(--on-surface-dim)] backdrop-blur-md"
                      >
                        <DetailIcon size={14} className="text-[var(--on-surface)] opacity-80" />
                        {label as string}
                      </span>
                    );
                  })}
                </motion.div>
              </div>

              {/* Right Column (5 cols): Photobox Showcase Frame & Action CTAs */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...cosmicSpring, delay: 0.1 }}
                  onClick={() => setLightboxOpen(true)}
                  className="group relative aspect-[4/5] w-full max-w-[24rem] overflow-hidden rounded-[2rem] border border-[var(--glass-border)] bg-[var(--bg-deep)] shadow-[0_24px_64px_rgba(0,0,0,0.14)] cursor-pointer"
                >
                  <Image
                    src={engineer.avatar}
                    alt={`${engineer.name} portrait`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 420px"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Top Badge */}
                  <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/60 px-3 py-1 font-mono text-[0.65rem] text-white backdrop-blur-md">
                    {engineer.role}
                  </span>

                  {/* Expand Hover Overlay */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-[0.72rem] text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <IconMaximize size={14} />
                    <span>Expand</span>
                  </div>
                </motion.div>

                {/* Direct Action CTAs below artwork */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.16 }}
                  className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full max-w-[24rem]"
                >
                  <a
                    href={buildWhatsAppUrl(undefined, {
                      variant: "hire",
                      context: `Engineer Intro: ${engineer.name}`,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-[var(--on-surface)] bg-[var(--on-surface)] px-6 py-3 font-mono text-[0.82rem] font-medium text-[var(--bg)] shadow-lg transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <IconBrandWhatsapp size={16} />
                    <span>Request Intro</span>
                  </a>

                  <Link
                    href="/hire"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-3 font-mono text-[0.82rem] text-[var(--on-surface-dim)] transition-colors hover:border-[var(--on-surface)] hover:text-[var(--on-surface)]"
                  >
                    <span>How it works</span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── Stat Strip Divider ───────────────────────────────────────── */}
          <section className="w-full border-y border-[var(--glass-border)] py-7 mb-14">
            <div className="flex flex-wrap items-center justify-between gap-6">
              {[
                { value: `${engineer.yearsExp}+ yrs`, label: "Production experience" },
                { value: "100%", label: "Vetting bar passed" },
                { value: timezoneText(engineer.location.utcOffset), label: "Timezone alignment" },
                {
                  value: `${engineer.location.city}, ${engineer.location.country}`,
                  label: "Location & remote ready",
                },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="font-mono text-[1.25rem] font-medium text-[var(--on-surface)]">
                    {stat.value}
                  </span>
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[var(--on-surface-dim)] opacity-70 mt-0.5">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Fluid Editorial Document Layout ───────────────────────────── */}
          <section className="w-full grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
            {/* Main Narrative Column */}
            <div className="flex flex-col gap-12">
              {/* Executive Summary */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--glass-border)] bg-[var(--surface-high)] text-[var(--on-surface)]">
                    <IconUserCheck size={16} />
                  </span>
                  <h2 className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--on-surface-dim)] font-medium">
                    Executive Summary & Background
                  </h2>
                </div>
                <div className="grid gap-4 text-[1.05rem] leading-[1.8] text-[var(--on-surface-dim)] font-normal">
                  {engineer.longBio.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Core Deliverables Grid (Hairline Column Split) */}
              <div className="border-t border-[var(--glass-border)] pt-10">
                <p className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--on-surface-dim)] mb-6">
                  Core Technical Deliverables & Focus
                </p>
                <div className="grid gap-6 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--glass-border)]">
                  {engineer.highlights.map((highlight, index) => (
                    <div
                      key={highlight}
                      className={cn(
                        "flex flex-col justify-between",
                        index > 0 && "md:pl-6 pt-4 md:pt-0",
                      )}
                    >
                      <p className="font-mono text-[0.78rem] font-medium text-[var(--on-surface)] mb-2">
                        {formatIndex(index)}
                      </p>
                      <p className="text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)] font-normal">
                        {highlight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Production Work History */}
              <div className="border-t border-[var(--glass-border)] pt-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--glass-border)] bg-[var(--surface-high)] text-[var(--on-surface)]">
                    <IconBriefcase size={16} />
                  </span>
                  <h2 className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--on-surface-dim)] font-medium">
                    Production Work History
                  </h2>
                </div>

                <ol className="relative space-y-6 border-l border-[var(--glass-border)] pl-6">
                  {engineer.workHistory.map((work) => (
                    <li key={`${work.company}-${work.duration}`} className="relative">
                      <span
                        aria-hidden="true"
                        className="absolute -left-[1.85rem] top-1 grid h-4 w-4 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--surface-high)]"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--on-surface)]" />
                      </span>
                      <div className="grid gap-1 sm:grid-cols-[1fr_auto] sm:items-start">
                        <div>
                          <h3 className="text-[1.1rem] font-normal title-serif text-[var(--on-surface)]">
                            {work.company}
                          </h3>
                          <p className="font-mono text-[0.72rem] text-[var(--on-surface-dim)] uppercase tracking-wider mt-0.5">
                            {work.role}
                          </p>
                        </div>
                        <p className="font-mono text-[0.72rem] text-[var(--on-surface-dim)] opacity-70">
                          {work.duration}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Sidebar Sticky Info Column */}
            <aside className="flex flex-col gap-8 self-start lg:sticky lg:top-28">
              {/* Technical Stack */}
              <div>
                <p className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--on-surface-dim)] mb-4">
                  Technical Stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {engineer.skills.map((skill, index) => (
                    <span
                      key={skill}
                      className={cn(
                        "rounded-lg border px-3 py-1 font-mono text-[0.75rem]",
                        index === 0
                          ? "border-[var(--on-surface)] bg-[var(--on-surface)] text-[var(--bg)] font-medium"
                          : "border-[var(--outline)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)]",
                      )}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vetting Checklist */}
              <div className="border-t border-[var(--glass-border)] pt-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--glass-border)] bg-[var(--surface-high)] text-[var(--on-surface)]">
                    <IconShieldCheck size={16} />
                  </span>
                  <h2 className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--on-surface-dim)] font-medium">
                    Vetting Verification
                  </h2>
                </div>

                <ul className="space-y-3" aria-label="Vetting stages passed">
                  {vettingItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)] font-normal"
                    >
                      <span
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"
                        aria-hidden="true"
                      >
                        <IconCheck size={11} stroke={2.5} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social Links */}
              <div className="border-t border-[var(--glass-border)] pt-8 flex items-center gap-3">
                {engineer.githubUrl && (
                  <a
                    href={engineer.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 font-mono text-[0.75rem] text-[var(--on-surface-dim)] hover:border-[var(--on-surface)] hover:text-[var(--on-surface)] transition-all"
                  >
                    <IconBrandGithub size={15} />
                    <span>GitHub</span>
                  </a>
                )}
                {engineer.portfolioUrl && (
                  <Link
                    href={engineer.portfolioUrl}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 font-mono text-[0.75rem] text-[var(--on-surface-dim)] hover:border-[var(--on-surface)] hover:text-[var(--on-surface)] transition-all"
                  >
                    <IconExternalLink size={15} />
                    <span>Portfolio</span>
                  </Link>
                )}
              </div>
            </aside>
          </section>

          {/* ── Similar Engineers Showcase ──────────────────────────────── */}
          {similar.length > 0 && (
            <section className="mt-16 pt-10 border-t border-[var(--glass-border)]">
              <p className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--on-surface-dim)] mb-6">
                Similar Vetted Engineers
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {similar.map((sim) => (
                  <RelatedCard key={sim.slug} engineer={sim} />
                ))}
              </div>
            </section>
          )}

          {/* ── Lightbox Modal for Avatar ──────────────────────────────── */}
          <AnimatePresence>
            {lightboxOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLightboxOpen(false)}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 backdrop-blur-xl"
              >
                <div className="relative max-h-[85vh] max-w-[85vw] aspect-[4/5] overflow-hidden rounded-2xl border border-white/20">
                  <Image
                    src={engineer.avatar}
                    alt={`${engineer.name} full portrait`}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => setLightboxOpen(false)}
                    className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/60 text-white"
                  >
                    <IconX size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CustomCursorRegion>
    </main>
  );
}
