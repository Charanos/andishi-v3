"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import * as TablerIcons from "@tabler/icons-react";
import type { ComponentType } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  IconArrowLeft,
  IconArrowRight,
  IconChevronDown,
  IconCode,
  IconCheck,
  IconClock,
  IconShieldCheck,
  IconBolt,
  IconUsers,
} from "@tabler/icons-react";
import type { ServiceDefinition } from "@/data/services";
import { services as allServices } from "@/data/services";
import { services as landingServices } from "@/content/landing";
import { getProjectsByService } from "@/data/projects";
import type { ProjectEntry } from "@/data/projects";
import { FinalCtaArtwork } from "@/components/ui/final-cta-artwork";
import { cosmicSpring, stagger, fadeUp } from "@/lib/motion";
import { JsonLd } from "@/components/marketing/json-ld";

type GlowColor = ServiceDefinition["glow"];

// Light-mode-safe: "cyan" → --tertiary (dark-purple in light, cyan in dark)
const glowTokens: Record<GlowColor, { accent: string; bg: string; border: string; shadow: string }> = {
  violet: {
    accent: "var(--primary)",
    bg: "color-mix(in srgb, var(--primary) 8%, transparent)",
    border: "color-mix(in srgb, var(--primary) 22%, transparent)",
    shadow: "color-mix(in srgb, var(--primary) 14%, transparent)",
  },
  cyan: {
    accent: "var(--tertiary)",
    bg: "color-mix(in srgb, var(--tertiary) 8%, transparent)",
    border: "color-mix(in srgb, var(--tertiary) 22%, transparent)",
    shadow: "color-mix(in srgb, var(--tertiary) 14%, transparent)",
  },
  amber: {
    accent: "rgba(120,75,0,0.9)",
    bg: "rgba(200,140,0,0.10)",
    border: "rgba(200,140,0,0.22)",
    shadow: "rgba(200,140,0,0.14)",
  },
};

function PatternTexture({ opacity = 0.1 }: { opacity?: number }) {
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

// ── Unified Accordion Item ──────────────────────────────────────────────────
function AccordionItem({
  label,
  meta,
  children,
  open,
  onToggle,
  accent,
  index,
}: {
  label: string;
  meta?: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  accent: string;
  index: number;
}) {
  return (
    <div
      className="overflow-hidden rounded-[1.1rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] transition-all duration-300"
      style={open ? { borderColor: `color-mix(in srgb, ${accent} 28%, transparent)` } : {}}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_38%,transparent)] focus-visible:ring-inset"
        aria-expanded={open}
      >
        {/* Number badge */}
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-center transition-all duration-300"
          style={
            open
              ? { backgroundColor: accent, borderColor: accent, color: "white" }
              : { borderColor: "var(--glass-border)", color: "var(--on-surface-dim)" }
          }
        >
          {open ? (
            <IconCheck size={11} stroke={2.5} aria-hidden="true" />
          ) : (
            <span className="font-mono text-[0.62rem]">{String(index + 1).padStart(2, "0")}</span>
          )}
        </div>

        <div className="flex flex-1 items-center justify-between gap-3">
          <span className="text-[0.93rem] text-[var(--on-surface)]">{label}</span>
          {meta && (
            <span className="font-mono text-[0.68rem] shrink-0" style={{ color: accent }}>
              {meta}
            </span>
          )}
        </div>

        <div
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-all duration-300"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            ...(open ? { borderColor: `color-mix(in srgb, ${accent} 28%, transparent)`, color: accent } : {}),
          }}
        >
          <IconChevronDown size={14} stroke={1.7} aria-hidden="true" />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.76, 0, 0.24, 1] }}
          >
            <div
              className="border-t px-5 pb-5 pt-4"
              style={{ borderColor: `color-mix(in srgb, ${accent} 16%, transparent)` }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Timeline comparison mini-chart ─────────────────────────────────────────
function TimelineChart({ currentSlug, accent }: { currentSlug: string; accent: string }) {
  const data = allServices
    .map((s) => ({
      name: s.title.split(" ")[0],
      min: parseInt(s.timeline.split("–")[0]),
      isCurrent: s.slug === currentSlug,
    }))
    .sort((a, b) => a.min - b.min);

  return (
    <ResponsiveContainer width="100%" height={164}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 6, bottom: 0, left: 0 }}>
        <XAxis
          type="number"
          domain={[0, 20]}
          tick={{ fontSize: 9, fill: "var(--on-surface-dim)", fontFamily: "var(--font-jetbrains)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}w`}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={56}
          tick={{ fontSize: 9, fill: "var(--on-surface-dim)", fontFamily: "var(--font-jetbrains)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "color-mix(in srgb, var(--on-surface) 4%, transparent)" }}
          contentStyle={{
            background: "var(--surface-high)",
            border: "1px solid var(--glass-border)",
            borderRadius: "0.6rem",
            fontSize: "0.72rem",
            fontFamily: "var(--font-jetbrains)",
            color: "var(--on-surface)",
            padding: "6px 10px",
          }}
          formatter={(v) => [`${v ?? "?"} weeks min`, "Delivery"]}
          labelStyle={{ color: "var(--on-surface-dim)", marginBottom: 2 }}
        />
        <Bar dataKey="min" radius={[0, 4, 4, 0]} maxBarSize={10}>
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={
                entry.isCurrent
                  ? accent
                  : "color-mix(in srgb, var(--on-surface) 12%, transparent)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Project proof-of-work card ─────────────────────────────────────────────
function ProjectCard({ project, accent }: { project: ProjectEntry; accent: string }) {
  const statusColor: Record<ProjectEntry["status"], string> = {
    Live: "var(--tertiary)",
    Completed: "color-mix(in srgb, var(--on-surface) 48%, transparent)",
    "In Progress": "var(--primary)",
  };
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--on-surface)_26%,transparent)] hover:shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!py-6 max-md:last:!border-b-0 max-md:!translate-y-0">
      {/* Image */}
      <div className="relative h-40 w-full shrink-0 overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/90 via-[var(--bg)]/28 to-transparent" />
        {/* Result metric chip — bottom right of image */}
        <div
          className="absolute bottom-3 right-3 rounded-xl border px-2.5 py-1.5 backdrop-blur-xl"
          style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`, borderColor: `color-mix(in srgb, ${accent} 26%, transparent)` }}
        >
          <p className="font-mono text-[0.72rem] leading-none" style={{ color: accent }}>{project.resultValue}</p>
          <p className="mt-0.5 text-[0.58rem] leading-none" style={{ color: `color-mix(in srgb, ${accent} 78%, transparent)` }}>{project.resultLabel}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 pt-3.5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[0.68rem] tracking-[0.06em] uppercase text-[var(--on-surface-dim)] opacity-70">{project.eyebrow}</p>
          <span
            className="flex shrink-0 items-center gap-1 text-[0.64rem]"
            style={{ color: statusColor[project.status] }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor[project.status] }} />
            {project.status}
          </span>
        </div>

        <h3 className="mb-1.5 text-[0.96rem] leading-snug tracking-tight text-[var(--on-surface)]">
          {project.title}
        </h3>
        <p className="line-clamp-2 flex-1 text-[0.8rem] leading-[1.62] text-[var(--on-surface-dim)]">
          {project.summary}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--glass-border)] pt-3">
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--glass-border)] px-2 py-[2px] font-mono text-[0.62rem] text-[var(--on-surface-dim)]"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="shrink-0 font-mono text-[0.64rem] text-[var(--on-surface-dim)] opacity-60">{project.timeline}</span>
        </div>
      </div>
    </article>
  );
}

// ── Related service card ────────────────────────────────────────────────────
function RelatedServiceCard({ service }: { service: ServiceDefinition }) {
  const glow = glowTokens[service.glow];
  const Icon = (
    (TablerIcons as unknown as Record<string, ComponentType<{ size?: number; stroke?: number }>>)[service.icon] ??
    IconCode
  );
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 rounded-[1.15rem]"
    >
      <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--on-surface)_28%,transparent)] hover:shadow-[0_12px_36px_color-mix(in_srgb,var(--bg-deep)_12%,transparent)] max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!py-6 max-md:last:!border-b-0 max-md:!translate-y-0">
        <div
          className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border"
          style={{ borderColor: glow.border, backgroundColor: glow.bg, color: glow.accent }}
        >
          <Icon size={18} stroke={1.4} />
        </div>
        <h3 className="mb-1 text-[0.95rem] font-normal tracking-tight text-[var(--on-surface)] transition-colors duration-200 group-hover:text-[var(--primary)]">
          {service.title}
        </h3>
        <p className="text-[0.82rem] leading-[1.6] text-[var(--on-surface-dim)] line-clamp-2">{service.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-[0.68rem]" style={{ color: glow.accent }}>{service.timeline}</span>
          <IconArrowRight size={13} stroke={1.8} className="text-[var(--on-surface-dim)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />
        </div>
      </div>
    </Link>
  );
}

// ── Main export ─────────────────────────────────────────────────────────────
export function ServiceDetailExperience({
  service,
  schemas,
}: {
  service: ServiceDefinition;
  schemas: { service: object; faq: object; breadcrumb: object };
}) {
  const glow = glowTokens[service.glow];

  // FAQ accordion — engagement + process use open layouts instead
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const IconComponent = (
    (TablerIcons as unknown as Record<string, ComponentType<{ size?: number; stroke?: number }>>)[service.icon] ??
    IconCode
  );

  const heroImage = landingServices.find((s) => s.slug === service.slug)?.image ?? null;
  const related = allServices.filter((s) => s.group === service.group && s.slug !== service.slug).slice(0, 3);
  const selectedProjects = getProjectsByService(service.slug, 6);

  const processSteps = [
    { title: "Scoping call", body: "Tell us what you need. We'll tell you what's realistic. One focused conversation - no pitch, no deck." },
    { title: "We write the brief", body: "We produce the project brief: scope, timeline, deliverables, and pricing. You approve or we adjust - no back-and-forth." },
    { title: "Sprint delivery", body: "Working software every week. Feedback is structured. Scope changes are surfaced immediately, never buried in a final review." },
    { title: "Ship & handover", body: "You get a live, documented, tested product. You own the IP. We stay available for 30 days post-launch at no extra cost." },
  ];

  return (
    <>
      <main className="relative isolate overflow-visible bg-[var(--bg)]">
        <PatternTexture opacity={0.055} />

        {/* ── Cinematic hero ───────────────────────────────────────────────── */}
        <div className="relative w-full overflow-hidden">
          {heroImage && (
            <div className="pointer-events-none absolute inset-0 z-0">
              <Image src={heroImage} alt="" fill priority className="object-cover object-center" sizes="100vw" />
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)]/82 via-[var(--bg)]/72 to-[var(--bg)]" />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)]/58 via-transparent to-[var(--bg)]/58" />
            </div>
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background: `radial-gradient(ellipse 65% 50% at 50% 0%, color-mix(in srgb, ${glow.accent} 9%, transparent), transparent 60%)`,
            }}
          />

          <div className="relative z-[1] px-5 pb-14 pt-28 sm:px-8 lg:px-10 lg:pt-32">
            <div className="mx-auto w-full max-w-[92rem]">

              {/* Back */}
              <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ ...cosmicSpring, delay: 0.04 }} className="mb-10">
                <Link href="/services" className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-[0.82rem] text-[var(--on-surface-dim)] backdrop-blur-xl transition-all duration-300 hover:-translate-x-0.5 hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_40%,transparent)]">
                  <IconArrowLeft size={13} stroke={1.7} aria-hidden="true" />
                  All services
                </Link>
              </motion.div>

              {/* Hero grid */}
              <motion.header variants={stagger} initial="hidden" animate="visible" className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="max-w-3xl">
                  <motion.p variants={fadeUp} className="label-caps mb-4 flex items-center gap-3" style={{ color: glow.accent }}>
                    <span className="h-px w-7" style={{ backgroundColor: glow.accent }} aria-hidden="true" />
                    {service.group === "product-delivery" ? "Product Delivery" : "Specialist Build"}
                  </motion.p>
                  <motion.h1 variants={fadeUp} className="title-serif m-0 text-[clamp(2.5rem,5.6vw,4.4rem)] font-normal leading-[0.96] tracking-tight text-[var(--on-surface)]">
                    {service.title}
                  </motion.h1>
                  <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[clamp(1rem,1.7vw,1.1rem)] leading-[1.74] text-[var(--on-surface-dim)]">
                    {service.tagline}
                  </motion.p>
                  <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-3">
                    <Link href={`/start-project?service=${service.slug}`} className="inline-flex min-h-[2.55rem] items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-2.5 text-[0.9rem] text-[var(--bg)] shadow-[0_14px_32px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] no-underline transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]">
                      Start this project <IconArrowRight size={14} stroke={2} aria-hidden="true" />
                    </Link>
                    <Link href="/work" className="inline-flex min-h-[2.55rem] items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-6 py-2.5 text-[0.9rem] text-[var(--on-surface-dim)] no-underline backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]">
                      See our work
                    </Link>
                  </motion.div>
                </div>

                {/* Service visual card — clean accent panel */}
                <motion.div variants={fadeUp} className="mt-6 shrink-0 lg:mt-0">
                  <div
                    className="relative overflow-hidden rounded-[1.5rem] shadow-[0_24px_64px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)]"
                    style={{ border: `1px solid ${glow.border}`, minWidth: "13rem", width: "13rem", backgroundColor: glow.bg }}
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${glow.accent}66, transparent)` }} />
                    <PatternTexture opacity={0.055} />
                    <div className="relative z-10 p-7">
                      <p className="label-caps mb-5 text-[0.58rem]" style={{ color: glow.accent }}>
                        {service.group === "product-delivery" ? "Product Delivery" : "Specialist Build"}
                      </p>
                      <div
                        className="mb-5 flex h-14 w-14 items-center justify-center rounded-[1rem] border"
                        style={{ backgroundColor: `color-mix(in srgb, ${glow.accent} 12%, transparent)`, borderColor: glow.border, color: glow.accent }}
                      >
                        <IconComponent size={30} stroke={1.3} />
                      </div>
                      <div className="mb-4 flex items-center gap-2">
                        <IconClock size={12} stroke={1.5} style={{ color: glow.accent }} aria-hidden="true" />
                        <span className="font-mono text-[0.76rem]" style={{ color: glow.accent }}>{service.timeline}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {service.stackHighlights.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full px-2 py-[2px] font-mono text-[0.6rem]"
                            style={{ backgroundColor: `color-mix(in srgb, ${glow.accent} 10%, transparent)`, color: glow.accent, border: `1px solid ${glow.border}` }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.header>

              {/* ── Stat strip ─────────────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...cosmicSpring, delay: 0.38 }}
                className="mt-10 grid grid-cols-2 gap-4 border-t border-[var(--glass-border)] pt-8 sm:grid-cols-4"
              >
                {[
                  { icon: IconShieldCheck, value: "32+", label: "Products shipped", sub: "across 8 domains" },
                  { icon: IconBolt, value: "48h", label: "Scoping proposal", sub: "after first call" },
                  { icon: IconUsers, value: "100%", label: "IP ownership", sub: "transferred on delivery" },
                  { icon: IconClock, value: "30d", label: "Post-launch support", sub: "included, no retainer" },
                ].map(({ icon: StatIcon, value, label, sub }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: glow.accent }}><StatIcon size={13} stroke={1.6} /></span>
                      <span className="font-mono text-[1.32rem] font-normal tracking-tight text-[var(--on-surface)]">{value}</span>
                    </div>
                    <p className="text-[0.78rem] text-[var(--on-surface)] leading-tight">{label}</p>
                    <p className="text-[0.72rem] text-[var(--on-surface-dim)] leading-tight">{sub}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div className="relative z-[1] px-5 pb-28 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[92rem]">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">

              {/* ── Left column ─────────────────────────────────────────────── */}
              <div className="space-y-14">

                {/* Scope */}
                <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ ...cosmicSpring, delay: 0.28 }}>
                  <p className="label-caps mb-4" style={{ color: glow.accent }}>Service scope</p>
                  <div
                    className="relative overflow-hidden rounded-[1.35rem] border p-6 backdrop-blur-2xl sm:p-8"
                    style={{ borderColor: glow.border, backgroundColor: glow.bg, boxShadow: `0 18px 56px ${glow.shadow}` }}
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${glow.accent}44, transparent)` }} />
                    <PatternTexture opacity={0.035} />
                    <p className="relative z-[1] text-[1rem] leading-[1.8] text-[var(--on-surface-dim)]">{service.scope}</p>
                  </div>
                </motion.section>

                {/* Engagement options — side-by-side flat cards, label right */}
                <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ ...cosmicSpring, delay: 0.35 }}>
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <p className="text-[0.83rem] text-[var(--on-surface-dim)]">Choose the model that fits your situation.</p>
                    <p className="label-caps shrink-0" style={{ color: glow.accent }}>Engagement options</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {service.engagementOptions.map((opt, i) => (
                      <div
                        key={opt.label}
                        className="relative flex flex-col overflow-hidden rounded-[1.25rem] border p-5 transition-all duration-300 hover:-translate-y-0.5 max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!py-6 max-md:last:!border-b-0 max-md:!translate-y-0"
                        style={{
                          borderColor: i === 0 ? glow.border : "var(--glass-border)",
                          backgroundColor: i === 0 ? glow.bg : "var(--glass-bg)",
                        }}
                      >
                        <span className="mb-3 font-mono text-[0.6rem] tracking-[0.14em] opacity-70" style={{ color: glow.accent }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="mb-2 text-[0.95rem] text-[var(--on-surface)]">{opt.label}</h3>
                        <p className="flex-1 text-[0.84rem] leading-[1.7] text-[var(--on-surface-dim)]">{opt.description}</p>
                        <Link
                          href={`/start-project?service=${service.slug}&type=${encodeURIComponent(opt.label)}`}
                          className="mt-4 inline-flex items-center gap-1.5 text-[0.78rem] no-underline transition-all duration-200 hover:gap-2.5"
                          style={{ color: glow.accent }}
                        >
                          Start with this approach <IconArrowRight size={12} stroke={2} />
                        </Link>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* How we work — 2×2 step grid, open layout */}
                <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ ...cosmicSpring, delay: 0.42 }}>
                  <p className="label-caps mb-5" style={{ color: glow.accent }}>How we work</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {processSteps.map((step, i) => (
                      <div
                        key={step.title}
                        className="relative rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-md max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!py-6 max-md:last:!border-b-0"
                      >
                        <span className="mb-3 inline-block font-mono text-[0.6rem] tracking-[0.14em] opacity-55" style={{ color: glow.accent }}>
                          STEP {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="mb-2.5 text-[0.95rem] text-[var(--on-surface)]">{step.title}</h3>
                        <p className="text-[0.84rem] leading-[1.7] text-[var(--on-surface-dim)]">{step.body}</p>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* Technology stack — label right */}
                <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ ...cosmicSpring, delay: 0.48 }}>
                  <p className="label-caps mb-5 text-right" style={{ color: glow.accent }}>Technology stack</p>
                  <div className="flex flex-wrap gap-2">
                    {service.stackHighlights.map((tech, i) => (
                      <span
                        key={tech}
                        className="rounded-full border px-3.5 py-1.5 font-mono text-[0.8rem] transition-all duration-200 hover:scale-[1.03] hover:-translate-y-px"
                        style={{
                          backgroundColor: i === 0 ? glow.bg : "var(--glass-bg)",
                          borderColor: i === 0 ? glow.border : "var(--glass-border)",
                          color: i === 0 ? glow.accent : "var(--on-surface-dim)",
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.section>

                {/* FAQ — label right, accordion retained (natural pattern) */}
                <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ ...cosmicSpring, delay: 0.54 }}>
                  <p className="label-caps mb-5 text-right" style={{ color: glow.accent }}>Frequently asked questions</p>
                  <div className="space-y-2.5">
                    {service.faq.map((item, i) => (
                      <AccordionItem
                        key={item.question}
                        label={item.question}
                        open={openFaq === i}
                        onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                        accent={glow.accent}
                        index={i}
                      >
                        <p className="text-[0.88rem] leading-[1.72] text-[var(--on-surface-dim)]">{item.answer}</p>
                      </AccordionItem>
                    ))}
                  </div>
                </motion.section>
              </div>

              {/* ── Sidebar ─────────────────────────────────────────────────── */}
              <aside className="lg:sticky lg:top-28 lg:self-start">

                {/* ── Panel 1: Scope overview + CTA ────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.34 }}
                  className="relative overflow-hidden rounded-[1.5rem] backdrop-blur-2xl shadow-[0_20px_60px_color-mix(in_srgb,var(--bg-deep)_20%,transparent)] max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!py-6 max-md:last:!border-b-0"
                  style={{ border: `1px solid ${glow.border}` }}
                >
                  {/* Subtle tinted header area */}
                  <div className="relative px-6 pt-6 pb-5 max-md:!px-0 max-md:!pt-2 max-md:!pb-4" style={{ backgroundColor: glow.bg }}>
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${glow.accent}55, transparent)` }} />
                    <PatternTexture opacity={0.035} />

                    {/* Availability indicator */}
                    <div className="relative z-[1] mb-4 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: glow.accent }} />
                        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: glow.accent }} />
                      </span>
                      <span className="text-[0.7rem] tracking-[0.08em] uppercase" style={{ color: glow.accent }}>
                        Taking projects
                      </span>
                    </div>

                    <p className="relative z-[1] label-caps mb-2" style={{ color: glow.accent }}>Ready to scope?</p>
                    <p className="relative z-[1] text-[0.86rem] leading-[1.68] text-[var(--on-surface-dim)]">
                      We return a clear proposal - deliverables, timeline, and pricing - within one business day of your call.
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="bg-[var(--glass-bg)] px-6 py-5 space-y-2.5 max-md:!bg-transparent max-md:!px-0 max-md:!py-4">
                    <Link
                      href={`/start-project?service=${service.slug}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] py-2.5 text-[0.88rem] text-[var(--bg)] no-underline shadow-[0_12px_28px_color-mix(in_srgb,var(--bg-deep)_34%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                    >
                      Start a project <IconArrowRight size={14} stroke={2} aria-hidden="true" />
                    </Link>
                    <Link
                      href="/hire"
                      className="inline-flex w-full items-center justify-center rounded-full border border-[var(--glass-border)] bg-transparent py-2.5 text-[0.86rem] text-[var(--on-surface-dim)] no-underline transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_28%,transparent)] hover:text-[var(--on-surface)] focus-visible:outline-none"
                    >
                      Hire a specialist instead
                    </Link>
                  </div>

                  {/* Compact key facts row */}
                  <div className="grid grid-cols-3 divide-x divide-[var(--glass-border)] border-t border-[var(--glass-border)]">
                    {[
                      { value: service.timeline, label: "Delivery" },
                      { value: "100%", label: "IP yours" },
                      { value: "30d", label: "Support" },
                    ].map(({ value, label }) => (
                      <div key={label} className="flex flex-col items-center gap-0.5 py-3.5">
                        <span className="font-mono text-[0.84rem] text-[var(--on-surface)]">{value}</span>
                        <span className="text-[0.66rem] text-[var(--on-surface-dim)]">{label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* ── Panel 2: Delivery comparison chart ───────────────────── */}
                <motion.div
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.46 }}
                  className="mt-4 overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-2xl max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!py-6 max-md:last:!border-b-0"
                >
                  <div className="flex items-center justify-between border-b border-[var(--glass-border)] px-5 py-3.5 max-md:!px-0 max-md:!py-3 max-md:!border-b-0">
                    <div>
                      <p className="label-caps text-[var(--on-surface-dim)]">Delivery speed</p>
                      <p className="mt-0.5 text-[0.66rem] text-[var(--on-surface-dim)] opacity-55">Min. weeks vs. other services</p>
                    </div>
                    <span
                      className="rounded-full border px-2 py-[2px] font-mono text-[0.63rem]"
                      style={{ backgroundColor: glow.bg, borderColor: glow.border, color: glow.accent }}
                    >
                      {service.timeline.split("–")[0]}w min
                    </span>
                  </div>
                  <div className="px-2 py-3 max-md:!px-0 max-md:!py-2">
                    <TimelineChart currentSlug={service.slug} accent={glow.accent} />
                  </div>
                </motion.div>

                {/* ── Panel 3: Studio credentials ──────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.54 }}
                  className="mt-4 overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-2xl max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!py-6 max-md:last:!border-b-0"
                >
                  <div className="border-b border-[var(--glass-border)] px-5 py-3.5 max-md:!px-0 max-md:!py-3 max-md:!border-b-0">
                    <p className="label-caps text-[var(--on-surface-dim)]">Studio credentials</p>
                  </div>
                  <div className="divide-y divide-[var(--glass-border)]">
                    {[
                      { icon: IconShieldCheck, label: "Client IP ownership", value: "100%, always" },
                      { icon: IconBolt, label: "Scoping proposal", value: "Within 48h" },
                      { icon: IconUsers, label: "Engineers", value: "Senior only" },
                      { icon: IconClock, label: "Post-launch support", value: "30 days free" },
                    ].map(({ icon: BIcon, label, value }) => (
                      <div key={label} className="flex items-center justify-between gap-3 px-5 py-3 max-md:!px-0 max-md:!py-3">
                        <div className="flex items-center gap-2.5">
                          <span style={{ color: glow.accent }}><BIcon size={13} stroke={1.6} /></span>
                          <span className="text-[0.78rem] text-[var(--on-surface-dim)]">{label}</span>
                        </div>
                        <span className="font-mono text-[0.74rem] text-[var(--on-surface)] shrink-0">{value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

              </aside>
            </div>

            {/* ── Selected work ─────────────────────────────────────────────── */}
            {selectedProjects.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...cosmicSpring, delay: 0.56 }}
                className="mt-20"
              >
                <div className="mb-7 flex items-end justify-between gap-6">
                  <div>
                    <p className="label-caps mb-1.5" style={{ color: glow.accent }}>Selected work</p>
                    <h2 className="title-serif text-[1.7rem] font-normal tracking-tight text-[var(--on-surface)]">
                      Proof of delivery.
                    </h2>
                  </div>
                  <Link
                    href="/work"
                    className="hidden shrink-0 items-center gap-1.5 text-[0.82rem] text-[var(--on-surface-dim)] no-underline transition-colors hover:text-[var(--on-surface)] sm:inline-flex"
                  >
                    All projects <IconArrowRight size={13} stroke={1.8} />
                  </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedProjects.map((p) => (
                    <ProjectCard key={p.slug} project={p} accent={glow.accent} />
                  ))}
                </div>

                <div className="mt-5 sm:hidden">
                  <Link
                    href="/work"
                    className="inline-flex items-center gap-1.5 text-[0.82rem] text-[var(--on-surface-dim)] no-underline transition-colors hover:text-[var(--on-surface)]"
                  >
                    See all projects <IconArrowRight size={13} stroke={1.8} />
                  </Link>
                </div>
              </motion.section>
            )}

            {/* ── Related services ──────────────────────────────────────────── */}
            {related.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ ...cosmicSpring, delay: 0.6 }} className="mt-20">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="label-caps mb-1" style={{ color: glow.accent }}>Related services</p>
                    <h2 className="title-serif text-[1.5rem] font-normal tracking-tight text-[var(--on-surface)]">
                      Also in {service.group === "product-delivery" ? "Product Delivery" : "Specialist Builds"}
                    </h2>
                  </div>
                  <Link href="/services" className="inline-flex items-center gap-1.5 text-[0.82rem] text-[var(--on-surface-dim)] no-underline hover:text-[var(--on-surface)] transition-colors">
                    All services <IconArrowRight size={13} stroke={1.8} />
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((s) => <RelatedServiceCard key={s.slug} service={s} />)}
                </div>
              </motion.section>
            )}

            {/* ── Final CTA ─────────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...cosmicSpring, delay: 0.65 }}
              className="relative mx-auto mt-16 max-w-5xl overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_42%,transparent)] px-3 py-7 text-center shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] backdrop-blur-2xl sm:px-10 lg:mt-20 lg:px-16 lg:py-20"
            >
              <FinalCtaArtwork />
              <PatternTexture opacity={0.07} />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_20%,transparent),transparent)]" />
              <div className="relative z-[1] mx-auto max-w-2xl">
                <p className="label-caps mb-4" style={{ color: glow.accent }}>Start building</p>
                <h2 className="title-serif text-[clamp(2rem,4.2vw,3.3rem)] font-normal leading-[1.04] tracking-tight text-[var(--on-surface)]">
                  Let&apos;s design, build, and ship your next product.
                </h2>
                <p className="body-md mx-auto my-8 max-w-lg text-[var(--on-surface-dim)]">
                  Tell us what you&apos;re building. We return a clear brief, fixed timeline, and direct pricing within 48 hours.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href={`/start-project?service=${service.slug}`} className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-8 py-3 text-[0.92rem] text-[var(--bg)] no-underline shadow-[0_14px_34px_color-mix(in_srgb,var(--bg-deep)_38%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]">
                    Start a project <IconArrowRight size={14} stroke={2} aria-hidden="true" />
                  </Link>
                  <Link href="/hire" className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-7 py-3 text-[0.92rem] text-[var(--on-surface-dim)] no-underline backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_30%,transparent)] hover:text-[var(--on-surface)] focus-visible:outline-none">
                    Or hire a specialist
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <JsonLd id="service-jsonld" data={schemas.service} />
      <JsonLd id="faq-jsonld" data={schemas.faq} />
      <JsonLd id="breadcrumb-jsonld" data={schemas.breadcrumb} />
    </>
  );
}
