"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import * as Icons from "@tabler/icons-react";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { getServicesByGroup } from "@/data/services";
import type { ServiceDefinition } from "@/data/services";
import { cosmicSpring, stagger, fadeUp } from "@/lib/motion";
import { FinalCtaArtwork } from "@/components/ui/final-cta-artwork";
import { LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── shared texture ─────────────────────────────────────────────────────────────
const textureStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 11v12M11 17h12' stroke='%23c5b8e8' stroke-width='0.65' stroke-linecap='round' opacity='0.22'/%3E%3Cpath d='M4 4h4M26 30h4' stroke='%23c5b8e8' stroke-width='0.55' stroke-linecap='round' opacity='0.16'/%3E%3C/svg%3E\")",
};

// ── glow accent map — light-mode safe, no raw cyan ─────────────────────────────
// "cyan" services map to --tertiary (dark purple in light, cyan in dark) to avoid
// the nearly-invisible light-cyan-on-white problem.
type GlowKey = "violet" | "cyan" | "amber";

const glowMap: Record<
  GlowKey,
  {
    shadowCls: string;
    hoverBorderCls: string;
    iconBgCls: string;
    chipBgCls: string;
    chipTextCls: string;
    chipBorderCls: string;
    accentColor: string; // inline style value
  }
> = {
  violet: {
    shadowCls:
      "group-hover:shadow-[0_20px_64px_color-mix(in_srgb,var(--primary)_15%,transparent),0_6px_20px_color-mix(in_srgb,var(--primary)_8%,transparent)]",
    hoverBorderCls:
      "group-hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)]",
    iconBgCls: "bg-[var(--primary-container)]",
    chipBgCls: "bg-[var(--primary-container)]",
    chipTextCls: "text-[var(--primary)]",
    chipBorderCls: "border-[var(--glass-border)]",
    accentColor: "var(--primary)",
  },
  cyan: {
    // tertiary is deep-purple in light mode → great contrast; cyan in dark → on-brand
    shadowCls:
      "group-hover:shadow-[0_20px_64px_color-mix(in_srgb,var(--tertiary)_13%,transparent),0_6px_20px_color-mix(in_srgb,var(--tertiary)_7%,transparent)]",
    hoverBorderCls:
      "group-hover:border-[color-mix(in_srgb,var(--tertiary)_30%,transparent)]",
    iconBgCls: "bg-[var(--tertiary-container)]",
    chipBgCls: "bg-[var(--tertiary-container)]",
    chipTextCls: "text-[var(--tertiary)]",
    chipBorderCls: "border-[var(--glass-border)]",
    accentColor: "var(--tertiary)",
  },
  amber: {
    shadowCls:
      "group-hover:shadow-[0_20px_64px_rgba(180,120,0,0.13),0_6px_20px_rgba(180,120,0,0.07)]",
    hoverBorderCls: "group-hover:border-[rgba(200,140,0,0.30)]",
    iconBgCls: "bg-[rgba(200,140,0,0.10)]",
    chipBgCls: "bg-[rgba(200,140,0,0.10)]",
    chipTextCls: "text-[rgba(120,75,0,0.90)]",
    chipBorderCls: "border-[rgba(200,140,0,0.22)]",
    accentColor: "rgba(120,75,0,0.9)",
  },
};

// ── LargeServiceCard (Product Delivery group — 2-col grid) ────────────────────
function LargeServiceCard({
  service,
  index,
}: {
  service: ServiceDefinition;
  index: number;
}) {
  const IconComponent = (
    Icons as unknown as Record<
      string,
      ComponentType<{ size?: number; stroke?: number }>
    >
  )[service.icon] ?? Icons.IconCode;
  const accent = glowMap[service.glow];
  const num = String(index + 1).padStart(2, "0");

  return (
    <motion.div variants={fadeUp} className="h-full">
      <Link
        href={`/services/${service.slug}`}
        className="group block h-full rounded-[1.35rem] no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40"
      >
        <div
          className={cn(
            "relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)]",
            "bg-[var(--glass-bg)] p-8 shadow-[0_2px_24px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)] backdrop-blur-xl",
            "transition-all duration-300 group-hover:-translate-y-1.5",
            accent.shadowCls,
            accent.hoverBorderCls,
          )}
        >
          {/* texture + top-shine */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={textureStyle}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,var(--glass-highlight),transparent)]"
          />

          {/* number + icon row */}
          <div className="mb-7 flex items-center justify-between">
            <span
              className="font-mono text-[0.68rem] tracking-[0.16em]"
              style={{ color: accent.accentColor, opacity: 0.65 }}
            >
              {num}
            </span>
            <div
              className={cn(
                "grid h-11 w-11 place-items-center rounded-xl border border-[var(--glass-border)] transition-transform duration-300 group-hover:scale-105",
                accent.iconBgCls,
              )}
            >
              <span style={{ color: accent.accentColor }}>
                <IconComponent size={20} stroke={1.5} />
              </span>
            </div>
          </div>

          {/* title — Cormorant Garamond via .title-serif */}
          <h3 className="title-serif mb-3 text-[1.65rem] font-normal leading-[1.06] tracking-tight text-[var(--on-surface)] transition-colors duration-200 group-hover:text-[var(--primary)]">
            {service.title}
          </h3>

          {/* description */}
          <p className="mb-6 text-[0.92rem] leading-[1.68] text-[var(--on-surface-dim)]">
            {service.description}
          </p>

          {/* tech stack pills */}
          <div className="mb-auto flex flex-wrap gap-1.5 pb-6">
            {service.stackHighlights.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className={cn(
                  "inline-block rounded-full border px-2.5 py-[2px] font-mono text-[0.68rem]",
                  accent.chipBgCls,
                  accent.chipTextCls,
                  accent.chipBorderCls,
                )}
              >
                {tech}
              </span>
            ))}
          </div>

          {/* bottom strip */}
          <div className="flex items-center justify-between border-t border-[var(--glass-border)] pt-5">
            <span className="font-mono text-[0.73rem] tracking-[0.05em] text-[var(--on-surface-dim)]">
              {service.timeline}
            </span>
            <span className="flex items-center gap-1.5 text-[0.8rem] tracking-[0.03em] text-[var(--on-surface-dim)] transition-colors duration-200 group-hover:text-[var(--on-surface)]">
              Explore
              <IconArrowRight
                size={14}
                stroke={1.8}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── CompactServiceCard (Specialist Builds group — 4-col grid) ─────────────────
function CompactServiceCard({
  service,
  index,
  offset,
}: {
  service: ServiceDefinition;
  index: number;
  offset: number;
}) {
  const IconComponent = (
    Icons as unknown as Record<
      string,
      ComponentType<{ size?: number; stroke?: number }>
    >
  )[service.icon] ?? Icons.IconCode;
  const accent = glowMap[service.glow];
  const num = String(offset + index + 1).padStart(2, "0");

  return (
    <motion.div variants={fadeUp} className="h-full">
      <Link
        href={`/services/${service.slug}`}
        className="group block h-full rounded-[1.2rem] no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40"
      >
        <div
          className={cn(
            "relative flex h-full flex-col overflow-hidden rounded-[1.2rem] border border-[var(--glass-border)]",
            "bg-[var(--glass-bg)] p-6 shadow-[0_2px_16px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)] backdrop-blur-xl",
            "transition-all duration-300 group-hover:-translate-y-1",
            accent.shadowCls,
            accent.hoverBorderCls,
          )}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={textureStyle}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,var(--glass-highlight),transparent)]"
          />

          {/* icon + number */}
          <div className="mb-5 flex items-center justify-between">
            <div
              className={cn(
                "grid h-9 w-9 place-items-center rounded-lg border border-[var(--glass-border)]",
                accent.iconBgCls,
              )}
            >
              <span style={{ color: accent.accentColor }}>
                <IconComponent size={16} stroke={1.5} />
              </span>
            </div>
            <span
              className="font-mono text-[0.64rem] tracking-[0.14em]"
              style={{ color: accent.accentColor, opacity: 0.6 }}
            >
              {num}
            </span>
          </div>

          <h3 className="mb-2 text-[1.08rem] font-normal leading-[1.18] tracking-tight text-[var(--on-surface)] transition-colors duration-200 group-hover:text-[var(--primary)]">
            {service.title}
          </h3>

          <p className="mb-auto text-[0.855rem] leading-[1.62] text-[var(--on-surface-dim)]">
            {service.description}
          </p>

          <div className="mt-5 flex items-center justify-between border-t border-[var(--glass-border)] pt-4">
            <span
              className={cn(
                "inline-block rounded-full border px-2.5 py-[2px] font-mono text-[0.67rem]",
                accent.chipBgCls,
                accent.chipTextCls,
                accent.chipBorderCls,
              )}
            >
              {service.timeline}
            </span>
            <IconArrowRight
              size={14}
              stroke={1.8}
              className="text-[var(--on-surface-dim)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--on-surface)]"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── ProcessStep ────────────────────────────────────────────────────────────────
function ProcessStep({
  num,
  title,
  body,
}: {
  num: string;
  title: string;
  body: string;
}) {
  return (
    <motion.div variants={fadeUp} className="flex gap-4">
      <span className="mt-0.5 shrink-0 font-mono text-[0.68rem] tracking-[0.16em] text-[var(--primary)] opacity-60">
        {num}
      </span>
      <div>
        <p className="mb-1.5 text-[0.92rem] tracking-tight text-[var(--on-surface)]">
          {title}
        </p>
        <p className="text-[0.84rem] leading-[1.62] text-[var(--on-surface-dim)]">
          {body}
        </p>
      </div>
    </motion.div>
  );
}

// ── Stat cell ──────────────────────────────────────────────────────────────────
function StatCell({ num, label }: { num: string; label: string }) {
  return (
    <div className="px-4 py-6 text-center sm:px-6">
      <p className="font-mono text-[1.55rem] leading-none tracking-tight text-[var(--on-surface)]">
        {num}
      </p>
      <p className="mt-2 text-[0.77rem] tracking-[0.04em] text-[var(--on-surface-dim)]">
        {label}
      </p>
    </div>
  );
}

// ── Main experience ────────────────────────────────────────────────────────────
export function ServicesPageExperience() {
  const productDelivery = getServicesByGroup("product-delivery");
  const specialistBuilds = getServicesByGroup("specialist-builds");

  return (
    <main className="relative isolate overflow-hidden bg-[var(--bg)]">
      {/* cosmic backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
        style={textureStyle}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_10%,transparent),transparent_28rem)]"
      />
      {/* floating violet orb — violet family, not cyan */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 z-0 h-[44rem] w-[44rem] rounded-full opacity-[0.07]"
        style={{
          background:
            "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-[30rem] w-[30rem] rounded-full opacity-[0.04]"
        style={{
          background:
            "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      <div className="relative z-[1]">
        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="px-5 pb-0 pt-32 sm:px-8 lg:px-10 lg:pt-40">
          <div className="mx-auto w-full max-w-[92rem]">
            {/* headline + descriptor */}
            <div className="grid gap-8 border-b border-[var(--glass-border)] pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,30rem)] lg:items-end lg:pb-14">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
              >
                <motion.p
                  variants={fadeUp}
                  className="label-caps mb-5 flex items-center gap-3 text-[var(--primary)]"
                >
                  <span className="h-px w-7 bg-[var(--primary)]" />
                  Our Capabilities
                </motion.p>
                <motion.h1
                  variants={fadeUp}
                  className="title-serif text-[clamp(3.1rem,7vw,5.2rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)]"
                >
                  Eight service lines.
                  <br />
                  <em className="not-italic text-[var(--primary)]">
                    One standard.
                  </em>
                </motion.h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...cosmicSpring, delay: 0.18 }}
                className="max-w-md lg:justify-self-end lg:text-right"
              >
                <p className="body-md text-[var(--on-surface-dim)]">
                  We design, build, and ship complete software products — from
                  greenfield SaaS architectures and custom business tools to
                  production-ready AI pipelines and mobile applications.
                </p>
                <div className="mt-7 flex flex-wrap gap-3 lg:justify-end">
                  <LinkButton href="/start-project" variant="primary">
                    Start a project
                    <IconArrowRight size={16} stroke={1.8} />
                  </LinkButton>
                  <LinkButton href="/work" variant="glass">
                    See our work
                  </LinkButton>
                </div>
              </motion.div>
            </div>

            {/* stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...cosmicSpring, delay: 0.28 }}
              className="grid grid-cols-2 divide-x divide-[var(--glass-border)] border-b border-[var(--glass-border)] sm:grid-cols-4"
            >
              <StatCell num="08" label="Service lines" />
              <StatCell num="32+" label="Products shipped" />
              <StatCell num="48h" label="Scoping proposal" />
              <StatCell num="30d" label="Post-launch support" />
            </motion.div>
          </div>
        </section>

        {/* ── PRODUCT DELIVERY GROUP ─────────────────────────────────────────── */}
        <section className="px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto w-full max-w-[92rem]">
            {/* section header */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-8%" }}
              variants={stagger}
              className="mb-10"
            >
              <motion.p
                variants={fadeUp}
                className="label-caps mb-3 text-[var(--primary)]"
              >
                Product Delivery
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="title-serif max-w-[26ch] text-[clamp(2rem,4.4vw,3.15rem)] font-normal leading-[0.97] tracking-tight text-[var(--on-surface)]"
              >
                From concept to production-ready software.
              </motion.h2>
            </motion.div>

            {/* 2-column large card grid */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-5%" }}
              variants={stagger}
              className="grid gap-5 sm:grid-cols-2"
            >
              {productDelivery.map((service, i) => (
                <LargeServiceCard key={service.slug} service={service} index={i} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── HOW A PROJECT BEGINS ──────────────────────────────────────────── */}
        <section className="px-5 pb-4 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[92rem]">
            <div className="relative overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] px-8 py-12 backdrop-blur-xl sm:px-10 lg:px-14">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={textureStyle}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,var(--glass-highlight),transparent)]"
              />
              {/* subtle orb */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-16 top-0 h-52 w-52 rounded-full opacity-[0.07]"
                style={{
                  background:
                    "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
                  filter: "blur(40px)",
                }}
              />

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-8%" }}
                variants={stagger}
                className="relative"
              >
                <motion.p
                  variants={fadeUp}
                  className="label-caps mb-8 text-[var(--primary)]"
                >
                  How a project begins
                </motion.p>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  <ProcessStep
                    num="01"
                    title="One scoping call"
                    body="You explain the product. We ask the right questions. No lengthy intake forms or decks required."
                  />
                  <ProcessStep
                    num="02"
                    title="We write the brief"
                    body="We produce the technical specification and scope document. You approve or revise — in plain English."
                  />
                  <ProcessStep
                    num="03"
                    title="Fixed proposal"
                    body="A clear timeline, deliverables list, and price. You know exactly what you are getting before work begins."
                  />
                  <ProcessStep
                    num="04"
                    title="Iterative delivery"
                    body="Weekly sprints, regular demos, and IP ownership from day one. Ship in weeks, not quarters."
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── SPECIALIST BUILDS GROUP ───────────────────────────────────────── */}
        <section className="px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto w-full max-w-[92rem]">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-8%" }}
              variants={stagger}
              className="mb-10"
            >
              <motion.p
                variants={fadeUp}
                className="label-caps mb-3 text-[var(--primary)]"
              >
                Specialist Builds
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="title-serif max-w-[26ch] text-[clamp(2rem,4.4vw,3.15rem)] font-normal leading-[0.97] tracking-tight text-[var(--on-surface)]"
              >
                Deep expertise in complex technical domains.
              </motion.h2>
            </motion.div>

            {/* 4-column compact card grid */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-5%" }}
              variants={stagger}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {specialistBuilds.map((service, i) => (
                <CompactServiceCard
                  key={service.slug}
                  service={service}
                  index={i}
                  offset={productDelivery.length}
                />
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── TRUST STRIP ───────────────────────────────────────────────────── */}
        <section className="px-5 pb-8 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[92rem]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={cosmicSpring}
              viewport={{ once: true, margin: "-10%" }}
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-b border-[var(--glass-border)] py-7"
            >
              {[
                "Senior engineers only",
                "IP ownership from day one",
                "Fixed-scope pricing",
                "Weekly sprint demos",
                "30-day post-launch support",
              ].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-2 text-[0.82rem] tracking-[0.03em] text-[var(--on-surface-dim)]"
                >
                  <span
                    className="h-1 w-1 rounded-full"
                    style={{ backgroundColor: "var(--primary)", opacity: 0.5 }}
                  />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
        <section className="px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto w-full max-w-[92rem]">
            <div className="relative overflow-hidden rounded-[1.55rem] border border-[color-mix(in_srgb,var(--primary)_22%,transparent)] bg-[color-mix(in_srgb,var(--surface)_46%,transparent)] px-6 py-16 text-center shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)] backdrop-blur-2xl sm:px-10 lg:px-16 lg:py-20">
              <FinalCtaArtwork />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 opacity-[0.10]"
                style={textureStyle}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_22%,transparent),transparent)]"
              />

              <div className="relative z-[1] mx-auto max-w-2xl">
                <p className="label-caps mb-4 text-[var(--primary)]">
                  Start a project
                </p>
                <h2 className="title-serif text-[clamp(2.2rem,4.6vw,3.5rem)] font-normal leading-[1.02] tracking-tight text-[var(--on-surface)]">
                  Ready to build your next product?
                </h2>
                <p className="body-md mx-auto my-8 max-w-lg text-[var(--on-surface-dim)]">
                  We scope in a single call. We write the brief. You get a fixed
                  timeline, clear deliverables, and weekly sprints from a senior
                  team.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <LinkButton href="/start-project" variant="primary">
                    Start a project
                    <IconArrowRight size={16} stroke={1.8} />
                  </LinkButton>
                  <LinkButton href="mailto:hire@andishi.dev" variant="glass">
                    hire@andishi.dev
                  </LinkButton>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
