"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import * as TablerIcons from "@tabler/icons-react";
import type { ComponentType } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconChevronDown,
  IconCode,
  IconClock,
} from "@tabler/icons-react";
import type { ServiceDefinition } from "@/data/services";
import { FinalCtaArtwork } from "@/components/ui/final-cta-artwork";
import { cosmicSpring, stagger, fadeUp } from "@/lib/motion";
import { JsonLd } from "@/components/marketing/json-ld";

type GlowColor = ServiceDefinition["glow"];

const glowTokens: Record<GlowColor, { accent: string; bg: string; border: string }> = {
  violet: {
    accent: "var(--primary)",
    bg: "color-mix(in srgb, var(--primary) 8%, transparent)",
    border: "color-mix(in srgb, var(--primary) 22%, transparent)",
  },
  cyan: {
    accent: "var(--secondary)",
    bg: "color-mix(in srgb, var(--secondary) 8%, transparent)",
    border: "color-mix(in srgb, var(--secondary) 22%, transparent)",
  },
  amber: {
    accent: "var(--tertiary)",
    bg: "color-mix(in srgb, var(--tertiary) 8%, transparent)",
    border: "color-mix(in srgb, var(--tertiary) 22%, transparent)",
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

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-[1.1rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_32%,transparent)] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--secondary)_20%,transparent)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_40%,transparent)] focus-visible:ring-inset"
        aria-expanded={open}
      >
        <span className="text-[0.95rem] font-medium text-[var(--on-surface)]">{question}</span>
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-all duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <IconChevronDown size={14} stroke={1.7} aria-hidden="true" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="border-t border-[var(--glass-border)] px-5 pb-5 pt-4">
              <p className="text-[0.88rem] leading-[1.72] text-[var(--on-surface-dim)]">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ServiceDetailExperience({
  service,
  schemas,
}: {
  service: ServiceDefinition;
  schemas: { service: object; faq: object; breadcrumb: object };
}) {
  const glow = glowTokens[service.glow];
  const IconComponent = (
    (TablerIcons as unknown as Record<string, ComponentType<{ size?: number; stroke?: number }>>)[service.icon] ??
    IconCode
  );

  return (
    <>
      <main className="relative isolate overflow-visible bg-[var(--bg)]">
        <PatternTexture opacity={0.07} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_8%,transparent),transparent_24rem),linear-gradient(90deg,color-mix(in_srgb,var(--bg)_88%,transparent),transparent_40%,color-mix(in_srgb,var(--bg)_72%,transparent))]"
        />

        <div className="relative z-[1] px-5 pb-28 pt-32 sm:px-8 lg:px-10 lg:pt-36">
          <div className="mx-auto w-full max-w-[92rem]">

            {/* ── Back link ───────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...cosmicSpring, delay: 0.04 }}
              className="mb-10"
            >
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-[0.82rem] font-medium text-[var(--on-surface-dim)] backdrop-blur-xl transition-all duration-300 hover:-translate-x-0.5 hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_40%,transparent)]"
              >
                <IconArrowLeft size={13} stroke={1.7} aria-hidden="true" />
                All services
              </Link>
            </motion.div>

            {/* ── Hero header ─────────────────────────────────── */}
            <motion.header
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="mb-16 border-b border-[var(--glass-border)] pb-12 lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12"
            >
              <div className="max-w-3xl">
                <motion.p variants={fadeUp} className="label-caps mb-4 flex items-center gap-3" style={{ color: glow.accent }}>
                  <span className="h-px w-7" style={{ backgroundColor: glow.accent }} aria-hidden="true" />
                  <span className="font-mono tracking-tight">{service.timeline}</span>
                  {" "}delivery
                </motion.p>
                <motion.h1
                  variants={fadeUp}
                  className="title-serif m-0 text-[clamp(2.85rem,6.2vw,4.8rem)] font-normal leading-[0.95] tracking-tight text-[var(--on-surface)]"
                >
                  {service.title}
                </motion.h1>
                <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[clamp(1rem,1.8vw,1.16rem)] leading-[1.72] font-light text-[var(--on-surface-dim)]">
                  {service.tagline}
                </motion.p>
                <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href={`/start-project?service=${service.slug}`}
                    className="inline-flex min-h-[2.6rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-2.5 text-[0.9rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_38%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                  >
                    Start this project
                    <IconArrowRight size={14} stroke={2} aria-hidden="true" />
                  </Link>
                  <Link
                    href="/work"
                    className="inline-flex min-h-[2.6rem] items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-6 py-2.5 text-[0.9rem] font-medium text-[var(--on-surface-dim)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                  >
                    See our work
                  </Link>
                </motion.div>
              </div>

              {/* Service icon badge */}
              <motion.div
                variants={fadeUp}
                className="mt-8 lg:mt-0"
              >
                <div
                  className="relative overflow-hidden rounded-[1.5rem] p-8"
                  style={{ backgroundColor: glow.bg, border: `1px solid ${glow.border}` }}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{ background: `linear-gradient(to right, transparent, ${glow.accent}55, transparent)` }}
                  />
                  <span style={{ color: glow.accent }}>
                    <IconComponent size={52} stroke={1.3} />
                  </span>
                  <div className="mt-4 flex items-center gap-2">
                    <span style={{ color: glow.accent }}>
                      <IconClock size={14} stroke={1.5} aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[0.8rem] tracking-tight" style={{ color: glow.accent }}>
                      {service.timeline}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.header>

            {/* ── Body: main + sidebar ─────────────────────────── */}
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_21rem]">

              {/* Left column */}
              <div className="space-y-14">

                {/* Scope */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.28 }}
                >
                  <p className="label-caps mb-4 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                    Service scope
                  </p>
                  <div className="relative overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_36%,transparent)] p-6 shadow-[0_20px_60px_color-mix(in_srgb,var(--bg-deep)_20%,transparent)] backdrop-blur-2xl sm:p-8">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-px"
                      style={{ background: `linear-gradient(to right, transparent, ${glow.accent}44, transparent)` }}
                    />
                    <p className="text-[1.02rem] leading-[1.78] text-[var(--on-surface-dim)]">
                      {service.scope}
                    </p>
                  </div>
                </motion.section>

                {/* Engagement options */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.36 }}
                >
                  <p className="label-caps mb-5 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                    Engagement options
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {service.engagementOptions.map((opt, index) => (
                      <div
                        key={opt.label}
                        className="relative overflow-hidden rounded-[1.25rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] p-6 transition-all duration-300 hover:border-[color-mix(in_srgb,var(--secondary)_20%,transparent)] hover:bg-[color-mix(in_srgb,var(--surface)_40%,transparent)]"
                      >
                        <span className="font-mono text-[0.68rem] tracking-tight" style={{ color: glow.accent }}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="mt-3 text-[1rem] font-medium text-[var(--on-surface)]">
                          {opt.label}
                        </h3>
                        <p className="mt-2.5 text-[0.88rem] leading-[1.7] text-[var(--on-surface-dim)]">
                          {opt.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* Stack */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.44 }}
                >
                  <p className="label-caps mb-5 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                    Technology stack
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {service.stackHighlights.map((tech, index) => (
                      <span
                        key={tech}
                        className="rounded-full border px-4 py-2 font-mono text-[0.82rem]"
                        style={{
                          backgroundColor: index === 0 ? glow.bg : "var(--glass-bg)",
                          borderColor: index === 0 ? glow.border : "var(--glass-border)",
                          color: index === 0 ? glow.accent : "var(--on-surface-dim)",
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.section>

                {/* FAQ */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.52 }}
                >
                  <p className="label-caps mb-5 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                    Frequently asked questions
                  </p>
                  <div className="space-y-2.5">
                    {service.faq.map((item) => (
                      <FaqItem key={item.question} question={item.question} answer={item.answer} />
                    ))}
                  </div>
                </motion.section>
              </div>

              {/* Sidebar */}
              <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
                {/* Key deliverables / quick stats */}
                <motion.div
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.38 }}
                  className="overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_36%,transparent)] backdrop-blur-2xl"
                >
                  <div className="border-b border-[var(--glass-border)] px-5 py-3">
                    <p className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_56%,transparent)]">
                      At a glance
                    </p>
                  </div>
                  <div className="divide-y divide-[var(--glass-border)]">
                    {[
                      { label: "Delivery", value: service.timeline },
                      { label: "Track", value: service.group === "product-delivery" ? "Product Delivery" : "Specialist Build" },
                      { label: "Ownership", value: "Client retains IP" },
                      { label: "Support", value: "30 days post-launch" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between px-5 py-3.5">
                        <span className="text-[0.8rem] text-[var(--on-surface-dim)]">{label}</span>
                        <span className="font-mono text-[0.78rem] text-[var(--on-surface)]">{value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* CTA card */}
                <motion.div
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.48 }}
                  className="relative overflow-hidden rounded-[1.35rem] p-6 shadow-[0_20px_60px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] backdrop-blur-2xl"
                  style={{ border: `1px solid ${glow.border}`, backgroundColor: glow.bg }}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{ background: `linear-gradient(to right, transparent, ${glow.accent}55, transparent)` }}
                  />
                  <PatternTexture opacity={0.05} />
                  <div className="relative z-[1]">
                    <p className="label-caps mb-3" style={{ color: glow.accent }}>
                      Ready to scope?
                    </p>
                    <p className="text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
                      Schedule a brief scoping call. We&apos;ll return a clear proposal — deliverables, timeline, and pricing — within one business day.
                    </p>
                    <Link
                      href={`/start-project?service=${service.slug}`}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] py-3 text-[0.9rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_38%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                    >
                      Start a project
                      <IconArrowRight size={14} stroke={2} aria-hidden="true" />
                    </Link>
                    <Link
                      href="/hire"
                      className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] py-3 text-[0.88rem] font-medium text-[var(--on-surface-dim)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_28%,transparent)] hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                    >
                      Or hire a specialist
                    </Link>
                  </div>
                </motion.div>

                {/* Trust chips */}
                <motion.div
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.56 }}
                  className="grid gap-2"
                >
                  {[
                    "32+ products shipped",
                    "48h to scoping proposal",
                    "100% client IP ownership",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2.5 backdrop-blur-xl"
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: glow.accent }}
                        aria-hidden="true"
                      />
                      <span className="text-[0.82rem] text-[var(--on-surface-dim)]">{item}</span>
                    </div>
                  ))}
                </motion.div>
              </aside>
            </div>

            {/* ── Final CTA ─────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...cosmicSpring, delay: 0.6 }}
              className="relative mt-20 overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_42%,transparent)] px-6 py-14 text-center shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_26%,transparent)] backdrop-blur-2xl sm:px-10 lg:mt-24 lg:px-16 lg:py-20"
            >
              <FinalCtaArtwork />
              <PatternTexture opacity={0.08} />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_20%,transparent),transparent)]"
              />
              <div className="relative z-[1] mx-auto max-w-2xl">
                <p className="label-caps mb-4 text-[var(--secondary)]">
                  Start building
                </p>
                <h2 className="title-serif text-[clamp(2.18rem,4.4vw,3.4rem)] font-normal leading-[1.04] tracking-tight text-[var(--on-surface)]">
                  Let&apos;s design, build, and ship your next product.
                </h2>
                <p className="body-md mx-auto my-8 max-w-lg text-[var(--on-surface-dim)]">
                  Tell us what you&apos;re building. We return a clear brief, fixed timeline, and direct pricing within 48 hours.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href={`/start-project?service=${service.slug}`}
                    className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-8 py-3 text-[0.92rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_40%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                  >
                    Start a project
                    <IconArrowRight size={14} stroke={2} aria-hidden="true" />
                  </Link>
                  <Link
                    href="/hire"
                    className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-7 py-3 text-[0.92rem] font-medium text-[var(--on-surface-dim)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_30%,transparent)] hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                  >
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
