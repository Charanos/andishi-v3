"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCalendar,
  IconMapPin,
  IconQuote,
} from "@tabler/icons-react";
import type { WorkProject } from "@/content/work";
import { FinalCtaArtwork } from "@/components/ui/final-cta-artwork";
import { cosmicSpring, fadeUp, stagger } from "@/lib/motion";

const statusStyles: Record<WorkProject["status"], { bg: string; border: string; color: string; label: string }> = {
  Live: {
    bg: "color-mix(in srgb, var(--tertiary) 14%, transparent)",
    border: "color-mix(in srgb, var(--tertiary) 30%, transparent)",
    color: "var(--tertiary)",
    label: "Live",
  },
  Shipped: {
    bg: "color-mix(in srgb, var(--secondary) 10%, transparent)",
    border: "color-mix(in srgb, var(--secondary) 26%, transparent)",
    color: "var(--secondary)",
    label: "Shipped",
  },
  Beta: {
    bg: "color-mix(in srgb, var(--primary) 10%, transparent)",
    border: "color-mix(in srgb, var(--primary) 24%, transparent)",
    color: "var(--primary)",
    label: "Beta",
  },
};

function metricColor(tone?: "cyan" | "success" | "primary") {
  if (tone === "cyan") return "var(--secondary)";
  if (tone === "success") return "var(--tertiary)";
  if (tone === "primary") return "var(--primary)";
  return "var(--on-surface)";
}

function PatternTexture({ opacity = 0.1 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 10.5v7M10.5 14h7' stroke='%23c5b8e8' stroke-width='0.7' stroke-linecap='round' opacity='0.24'/%3E%3C/svg%3E\"), radial-gradient(circle, color-mix(in srgb, var(--secondary) 16%, transparent) 0 1px, transparent 1.7px)",
        backgroundPosition: "0 0, 14px 14px",
        backgroundSize: "28px 28px, 28px 28px",
      }}
    />
  );
}

export function CaseStudyExperience({
  project,
  related,
}: {
  project: WorkProject;
  related: WorkProject[];
}) {
  const status = statusStyles[project.status];

  return (
    <main className="relative isolate overflow-hidden bg-[var(--bg)]">
      <PatternTexture opacity={0.07} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--bg)_90%,transparent),transparent_44%,color-mix(in_srgb,var(--bg)_72%,transparent))]"
      />

      {/* ── Cinematic Hero ─────────────────────────────────────── */}
      <section className="relative h-[72svh] min-h-[480px] max-h-[780px] overflow-hidden">
        <Image
          src={project.image}
          alt={`${project.title} project`}
          fill
          priority
          sizes="100vw"
          className="object-cover brightness-[0.58] saturate-[0.72]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--bg)_96%,transparent)_0%,color-mix(in_srgb,var(--bg)_52%,transparent)_46%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_srgb,var(--bg)_64%,transparent),transparent_52%)]" />

        <div className="absolute inset-0 flex flex-col justify-between px-5 pb-10 pt-8 sm:px-8 lg:px-10">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...cosmicSpring, delay: 0.05 }}
          >
            <Link
              href="/work"
              className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_14%,transparent)] bg-[color-mix(in_srgb,var(--bg)_48%,transparent)] px-4 py-2 text-[0.82rem] font-medium text-[color-mix(in_srgb,var(--on-surface)_70%,transparent)] backdrop-blur-xl transition-all duration-300 hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_40%,transparent)]"
            >
              <IconArrowLeft size={13} stroke={1.7} aria-hidden="true" />
              All case studies
            </Link>
          </motion.div>

          {/* Hero text block */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-4xl"
          >
            <motion.p variants={fadeUp} className="label-caps mb-4 flex items-center gap-3 text-[var(--secondary)]">
              <span className="h-px w-7 bg-[var(--secondary)]" aria-hidden="true" />
              {project.sectorLabel}
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="title-serif text-[clamp(3rem,7.8vw,6rem)] font-normal leading-[0.93] tracking-tight text-[var(--on-surface)]"
            >
              {project.title}
            </motion.h1>
            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.75rem] font-medium"
                style={{ backgroundColor: status.bg, borderColor: status.border, color: status.color }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.color }} aria-hidden="true" />
                {status.label}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] bg-[color-mix(in_srgb,var(--bg)_48%,transparent)] px-3 py-1.5 text-[0.75rem] text-[color-mix(in_srgb,var(--on-surface)_62%,transparent)] backdrop-blur-xl">
                <IconMapPin size={12} stroke={1.6} aria-hidden="true" />
                {project.location}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] bg-[color-mix(in_srgb,var(--bg)_48%,transparent)] px-3 py-1.5 text-[0.75rem] text-[color-mix(in_srgb,var(--on-surface)_62%,transparent)] backdrop-blur-xl">
                <IconCalendar size={12} stroke={1.6} aria-hidden="true" />
                {project.timeline}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="relative z-[1] px-5 pb-24 pt-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[92rem]">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">

            {/* Left column */}
            <div className="space-y-8">
              {/* Intro */}
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...cosmicSpring, delay: 0.3 }}
                className="max-w-2xl text-[clamp(1.08rem,2vw,1.22rem)] leading-[1.78] text-[var(--on-surface-dim)]"
              >
                {project.description}
              </motion.p>

              {/* Challenge / Solution */}
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { label: "Challenge", body: project.challenge, tone: "secondary" as const },
                  { label: "Solution", body: project.solution, tone: "tertiary" as const },
                ].map(({ label, body, tone }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...cosmicSpring, delay: 0.38 + i * 0.08 }}
                    className="relative overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_36%,transparent)] p-6 shadow-[0_20px_60px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)] backdrop-blur-2xl"
                  >
                    {/* Subtle overlapping orbital outlines for challenge/solution */}
                    <div
                      aria-hidden="true"
                      className="absolute -right-6 -bottom-6 h-20 w-32 rotate-[12deg] rounded-[1.5rem] border border-[color-mix(in_srgb,var(--secondary)_12%,transparent)] opacity-60 pointer-events-none z-0"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute -right-8 -bottom-4 h-24 w-36 rotate-[-8deg] rounded-[1.8rem] border border-[color-mix(in_srgb,var(--tertiary)_8%,transparent)] opacity-50 pointer-events-none z-0"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-px"
                      style={{
                        background: `linear-gradient(to right, transparent, color-mix(in srgb, var(--${tone}) 38%, transparent), transparent)`,
                      }}
                    />
                    <p
                      className="label-caps mb-4"
                      style={{ color: `var(--${tone})` }}
                    >
                      {label}
                    </p>
                    <p className="text-[0.94rem] leading-[1.75] text-[var(--on-surface-dim)]">
                      {body}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Metrics strip */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...cosmicSpring, delay: 0.5 }}
                className="overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_36%,transparent)] backdrop-blur-2xl"
              >
                <div className="border-b border-[var(--glass-border)] px-5 py-3">
                  <p className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                    Outcome metrics
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4">
                  {project.metrics.map((metric, i) => (
                    <div
                      key={metric.label}
                      className="border-b border-r border-[var(--glass-border)] px-5 py-5 [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(4n)]:border-r-0 last:border-b-0 [&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b sm:last:border-b-0 sm:[&:nth-last-child(-n+1)]:border-b-0"
                    >
                      <p
                        className="font-mono text-[1.4rem] leading-none tracking-tight"
                        style={{ color: metricColor(metric.tone) }}
                      >
                        {metric.value}
                      </p>
                      <p className="mt-2 text-[0.62rem] font-medium uppercase tracking-[0.09em] text-[color-mix(in_srgb,var(--on-surface-dim)_56%,transparent)]">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Tech stack */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...cosmicSpring, delay: 0.58 }}
              >
                <p className="label-caps mb-4 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                  Tech stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span
                      key={tag}
                      className="rounded-full border px-3.5 py-1.5 text-[0.8rem] font-medium"
                      style={{
                        backgroundColor:
                          index === 0
                            ? "color-mix(in srgb, var(--secondary) 10%, transparent)"
                            : "var(--glass-bg)",
                        borderColor:
                          index === 0
                            ? "color-mix(in srgb, var(--secondary) 24%, transparent)"
                            : "var(--glass-border)",
                        color: index === 0 ? "var(--secondary)" : "var(--on-surface-dim)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right sidebar */}
            <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
              {/* Quick facts */}
              <motion.div
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...cosmicSpring, delay: 0.42 }}
                className="overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_38%,transparent)] backdrop-blur-2xl"
              >
                <div className="border-b border-[var(--glass-border)] px-5 py-3">
                  <p className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                    Project brief
                  </p>
                </div>
                <div className="divide-y divide-[var(--glass-border)]">
                  {[
                    { label: "Outcome", value: `${project.metric} ${project.metricLabel}` },
                    { label: "Timeline", value: project.timeline },
                    { label: "Location", value: project.location },
                    { label: "Status", value: project.status },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-5 py-3.5">
                      <span className="text-[0.8rem] text-[var(--on-surface-dim)]">{label}</span>
                      <span className="font-mono text-[0.8rem] text-[var(--on-surface)]">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* CTA card */}
              <motion.div
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...cosmicSpring, delay: 0.52 }}
                className="relative overflow-hidden rounded-[1.35rem] border border-[color-mix(in_srgb,var(--secondary)_22%,transparent)] bg-[color-mix(in_srgb,var(--surface)_38%,transparent)] p-6 shadow-[0_20px_60px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)] backdrop-blur-2xl"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--secondary)_44%,transparent),transparent)]"
                />
                <PatternTexture opacity={0.06} />
                <div className="relative z-[1]">
                  <p className="label-caps mb-3 text-[var(--secondary)]">Build your product</p>
                  <p className="text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">
                    Need a similar outcome? Share your brief. We scope, design, and ship your product - just like this.
                  </p>
                  <Link
                    href="/start-project"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] py-3 text-[0.9rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_38%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                  >
                    Start a project like this
                    <IconArrowRight size={14} stroke={2} aria-hidden="true" />
                  </Link>
                  <Link
                    href="/services"
                    className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] py-3 text-[0.9rem] font-medium text-[var(--on-surface-dim)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_30%,transparent)] hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                  >
                    Explore our services
                  </Link>
                </div>
              </motion.div>
            </aside>
          </div>

          {/* ── Related Projects ──────────────────────────────── */}
          {related.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...cosmicSpring, delay: 0.65 }}
              className="mt-20 lg:mt-24"
              aria-label="Related projects"
            >
              <div className="mb-8 flex items-end justify-between border-b border-[var(--glass-border)] pb-6">
                <div>
                  <p className="label-caps mb-3 text-[var(--secondary)]">More work</p>
                  <h2 className="title-serif text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.04] tracking-tight text-[var(--on-surface)]">
                    Related case studies.
                  </h2>
                </div>
                <Link
                  href="/work"
                  className="hidden shrink-0 items-center gap-2 text-[0.9rem] font-medium text-[var(--secondary)] transition-all duration-200 hover:gap-3 sm:inline-flex focus-visible:outline-none"
                >
                  All work
                  <IconArrowRight size={13} stroke={1.8} aria-hidden="true" />
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {related.slice(0, 2).map((item) => (
                  <Link
                    key={item.id}
                    href={`/work/${item.id}`}
                    className="group relative overflow-hidden rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--secondary)_26%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_44%,transparent)]"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(min-width: 1024px) 44rem, (min-width: 640px) 50vw, 100vw"
                        className="object-cover brightness-[0.74] saturate-[0.8] transition duration-700 group-hover:scale-105 group-hover:brightness-[0.88]"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--bg)_80%,transparent),transparent_52%)]" />
                    </div>
                    <div className="p-5">
                      <p className="label-caps mb-2 text-[color-mix(in_srgb,var(--on-surface-dim)_56%,transparent)]">
                        {item.sectorLabel}
                      </p>
                      <h3 className="text-[1.08rem] font-medium leading-snug text-[var(--on-surface)]">
                        {item.title}
                      </h3>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="font-mono text-[0.9rem] text-[var(--tertiary)]">
                          {item.metric}{" "}
                          <span className="font-sans text-[0.72rem] text-[color-mix(in_srgb,var(--on-surface-dim)_56%,transparent)]">
                            {item.metricLabel}
                          </span>
                        </p>
                        <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-all duration-300 group-hover:rotate-0 group-hover:border-[color-mix(in_srgb,var(--secondary)_34%,transparent)] group-hover:text-[var(--secondary)]">
                          <IconArrowRight size={13} stroke={1.7} aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}

          {/* ── Final CTA ─────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...cosmicSpring, delay: 0.72 }}
            className="relative mt-20 overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_42%,transparent)] px-6 py-14 text-center shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_26%,transparent)] backdrop-blur-2xl sm:px-10 lg:mt-24 lg:px-16 lg:py-20"
            aria-label="Start a project"
          >
            <FinalCtaArtwork />
            <PatternTexture opacity={0.09} />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_22%,transparent),transparent)]"
            />
            <div className="relative z-[1] mx-auto max-w-2xl">
              <p className="label-caps mb-4 text-[var(--secondary)]">
                Ready to build?
              </p>
              <h2 className="title-serif text-[clamp(2.18rem,4.4vw,3.4rem)] font-normal leading-[1.04] tracking-tight text-[var(--on-surface)]">
                Let&apos;s design, build, and ship your next product.
              </h2>
              <p className="body-md mx-auto my-8 max-w-lg text-[var(--on-surface-dim)]">
                Tell us what you&apos;re building. We return a clear brief, fixed timeline, and direct pricing within 48 hours.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/start-project"
                  className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-8 py-3 text-[0.92rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_40%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                >
                  Start a project
                  <IconArrowRight size={14} stroke={2} aria-hidden="true" />
                </Link>
                <Link
                  href="/work"
                  className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-7 py-3 text-[0.92rem] font-medium text-[var(--on-surface-dim)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_30%,transparent)] hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                >
                  Back to case studies
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
