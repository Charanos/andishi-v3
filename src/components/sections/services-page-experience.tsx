"use client";

import { useRef, useEffect, useState } from "react";
import type { ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import * as Icons from "@tabler/icons-react";
import {
  IconArrowUpRight,
  IconBrandWhatsapp,
  IconCheck,
  IconBolt,
  IconShieldCheck,
  IconUsers,
  IconClock,
  IconChevronDown,
} from "@tabler/icons-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getServicesByGroup } from "@/data/services";
import type { ServiceDefinition } from "@/data/services";
import { cosmicSpring, stagger, fadeUp } from "@/lib/motion";
import { LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

// ── Images ───────────────────────────────────────────────────────────────────
const serviceImages: Record<string, string> = {
  "custom-software":
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  "saas-development":
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  "mobile-apps":
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
  "ai-systems":
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
  "enterprise-software":
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  blockchain:
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80",
  "apis-integrations":
    "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
  "product-strategy":
    "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80",
};

// ── Light-mode-safe glow map ──────────────────────────────────────────────────
type GlowKey = "violet" | "cyan" | "amber";
const glowMap: Record<GlowKey, { color: string; bg: string; border: string }> = {
  violet: {
    color: "var(--primary)",
    bg: "color-mix(in srgb, var(--primary) 8%, transparent)",
    border: "color-mix(in srgb, var(--primary) 22%, transparent)",
  },
  cyan: {
    color: "var(--tertiary)",
    bg: "color-mix(in srgb, var(--tertiary) 8%, transparent)",
    border: "color-mix(in srgb, var(--tertiary) 22%, transparent)",
  },
  amber: { color: "rgba(120,75,0,.9)", bg: "rgba(200,140,0,.10)", border: "rgba(200,140,0,.22)" },
};

// ── Card base - Link, mobile-open pattern ────────────────────────────────────
const bentoBase =
  "bento-card group relative block no-underline overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--glass-inner-shadow)] backdrop-blur-md transition-all duration-500 ease-out hover:border-[color-mix(in_srgb,var(--on-surface)_30%,transparent)] hover:shadow-[0_22px_56px_color-mix(in_srgb,var(--bg-deep)_16%,transparent)] hover:-translate-y-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_36%,transparent)] flex flex-col max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!py-10 max-md:last:!border-b-0 max-md:!translate-y-0";

// ── Icon box ──────────────────────────────────────────────────────────────────
function IconBox({
  IC,
  accent,
}: {
  IC: ComponentType<{ size?: number; stroke?: number }>;
  accent: { color: string; bg: string; border: string };
}) {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.85rem] border transition-transform duration-300 group-hover:scale-105"
      style={{ backgroundColor: accent.bg, borderColor: accent.border, color: accent.color }}
    >
      <IC size={20} stroke={1.4} />
    </div>
  );
}

// ── Stack tag pills ───────────────────────────────────────────────────────────
function StackTags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span
          key={t}
          className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-[2px] font-mono text-[0.62rem] text-[var(--on-surface-dim)]"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

// ── Card footer ───────────────────────────────────────────────────────────────
function CardFoot({
  timeline,
  accent,
}: {
  timeline: string;
  accent: { color: string; bg: string; border: string };
}) {
  return (
    <div className="flex items-center justify-between border-t border-[var(--glass-border)] pt-3.5 max-md:!border-transparent">
      <span
        className="rounded-full border px-2.5 py-[2px] font-mono text-[0.66rem]"
        style={{ backgroundColor: accent.bg, borderColor: accent.border, color: accent.color }}
      >
        {timeline}
      </span>
      <IconArrowUpRight
        size={15}
        stroke={1.7}
        className="text-[var(--on-surface-dim)] transition-all duration-300 group-hover:text-[var(--primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO SERVICE CARD - 2×2 col-span-2, row-span-2, browser mockup right
// ═══════════════════════════════════════════════════════════════════════════════
function HeroServiceCard({ service }: { service: ServiceDefinition }) {
  const IC =
    (Icons as unknown as Record<string, ComponentType<{ size?: number; stroke?: number }>>)[
      service.icon
    ] ?? Icons.IconCode;
  const accent = glowMap[service.glow];
  const img = serviceImages[service.slug];
  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(bentoBase, "col-span-1 p-7 md:col-span-2 lg:col-span-2 lg:row-span-2")}
    >
      <div className="relative z-10 grid h-full grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        {/* Left */}
        <div className="flex h-full flex-col justify-between py-1 lg:col-span-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <IconBox IC={IC} accent={accent} />
              <span className="font-mono text-[0.62rem] tracking-[0.14em] opacity-50 text-[var(--on-surface-dim)]">
                01 - PRODUCT
              </span>
            </div>
            <div>
              <h3 className="title-serif mb-2.5 text-[1.9rem] font-normal leading-[1.04] tracking-tight text-[var(--on-surface)] transition-colors duration-300 group-hover:text-[var(--primary)]">
                {service.title}
              </h3>
              <p className="text-[0.88rem] leading-[1.68] text-[var(--on-surface-dim)]">
                {service.description}
              </p>
            </div>
            <StackTags tags={service.stackHighlights.slice(0, 3)} />
          </div>
          <CardFoot timeline={service.timeline} accent={accent} />
        </div>
        {/* Right - browser mockup */}
        <div className="relative hidden h-full items-center justify-end lg:flex lg:col-span-6">
          {img && (
            <div className="h-full w-full overflow-hidden rounded-[1.1rem] border border-[var(--glass-border)] bg-[var(--surface-low)] shadow-[0_8px_32px_color-mix(in_srgb,var(--bg-deep)_18%,transparent)] transition-all duration-700 group-hover:scale-[1.025] group-hover:rotate-[-0.35deg]">
              <div className="flex h-6 shrink-0 items-center gap-1.5 border-b border-[var(--glass-border)] bg-[var(--surface-high)] px-3">
                <span className="h-[7px] w-[7px] rounded-full bg-red-400/70" />
                <span className="h-[7px] w-[7px] rounded-full bg-yellow-400/70" />
                <span className="h-[7px] w-[7px] rounded-full bg-green-400/70" />
                <div className="mx-2 flex h-3.5 flex-1 max-w-[140px] items-center rounded-sm bg-[var(--surface-highest)] px-2">
                  <span className="truncate font-mono text-[7px] leading-none text-[var(--on-surface-dim)] opacity-60">
                    app.andishi.dev
                  </span>
                </div>
              </div>
              <div className="relative h-[calc(100%-1.5rem)] w-full overflow-hidden bg-[var(--bg-deep)]">
                <Image
                  src={img}
                  alt={service.title}
                  fill
                  priority
                  className="object-cover object-top transition-transform duration-[3.5s] ease-out group-hover:scale-105"
                  sizes="22vw"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[var(--surface-low)]/50 to-transparent" />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STANDARD 1×1 CARD
// ═══════════════════════════════════════════════════════════════════════════════
function StandardServiceCard({ service, num }: { service: ServiceDefinition; num: string }) {
  const IC =
    (Icons as unknown as Record<string, ComponentType<{ size?: number; stroke?: number }>>)[
      service.icon
    ] ?? Icons.IconCode;
  const accent = glowMap[service.glow];
  const img = serviceImages[service.slug];
  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(bentoBase, "col-span-1 p-6 lg:col-span-1 lg:row-span-1")}
    >
      {img && (
        <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.14] transition-all duration-700 group-hover:opacity-[0.26] max-md:hidden">
          <Image
            src={img}
            alt=""
            fill
            className="object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
            sizes="14vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />
        </div>
      )}
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex flex-col gap-3.5">
          <div className="flex items-start justify-between">
            <IconBox IC={IC} accent={accent} />
            <span className="font-mono text-[0.62rem] tracking-[0.12em] text-[var(--on-surface-dim)] opacity-45">
              {num}
            </span>
          </div>
          <div>
            <h3 className="mb-1.5 text-[1.08rem] font-normal tracking-tight text-[var(--on-surface)] transition-colors duration-300 group-hover:text-[var(--primary)]">
              {service.title}
            </h3>
            <p className="text-[0.84rem] leading-[1.62] text-[var(--on-surface-dim)] line-clamp-3">
              {service.description}
            </p>
          </div>
          <StackTags tags={service.stackHighlights.slice(0, 2)} />
        </div>
        <CardFoot timeline={service.timeline} accent={accent} />
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TALL 1×2 CARD - phone mockup
// ═══════════════════════════════════════════════════════════════════════════════
function TallServiceCard({ service, num }: { service: ServiceDefinition; num: string }) {
  const IC =
    (Icons as unknown as Record<string, ComponentType<{ size?: number; stroke?: number }>>)[
      service.icon
    ] ?? Icons.IconCode;
  const accent = glowMap[service.glow];
  const img = serviceImages[service.slug];
  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(bentoBase, "col-span-1 p-6 lg:col-span-1 lg:row-span-2")}
    >
      {img && (
        <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.1] transition-all duration-700 group-hover:opacity-[0.2] max-md:hidden">
          <Image
            src={img}
            alt=""
            fill
            className="object-cover object-center transition-transform duration-[3s] ease-out group-hover:scale-105"
            sizes="14vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/55 to-transparent" />
        </div>
      )}
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-col gap-3.5">
          <div className="flex items-start justify-between">
            <IconBox IC={IC} accent={accent} />
            <span className="font-mono text-[0.62rem] tracking-[0.12em] text-[var(--on-surface-dim)] opacity-45">
              {num}
            </span>
          </div>
          <div>
            <h3 className="mb-1.5 text-[1.08rem] font-normal tracking-tight text-[var(--on-surface)] transition-colors duration-300 group-hover:text-[var(--primary)]">
              {service.title}
            </h3>
            <p className="text-[0.84rem] leading-[1.62] text-[var(--on-surface-dim)]">
              {service.description}
            </p>
          </div>
          <StackTags tags={service.stackHighlights.slice(0, 2)} />
        </div>
        {/* Phone mockup */}
        {img && (
          <div className="hidden lg:flex flex-1 items-end justify-center py-4">
            <div className="relative w-[74%] overflow-hidden rounded-t-2xl border border-[var(--glass-border)] bg-[var(--surface-low)] shadow-[0_-6px_28px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] transition-all duration-700 group-hover:scale-[1.03] group-hover:-translate-y-1.5">
              <div className="absolute left-1/2 top-1.5 z-20 h-2.5 w-10 -translate-x-1/2 rounded-full bg-black/30" />
              <div className="relative h-[200px] w-full overflow-hidden bg-[var(--bg-deep)]">
                <Image
                  src={img}
                  alt={service.title}
                  fill
                  className="object-cover object-center transition-transform duration-[3s] ease-out group-hover:scale-105"
                  sizes="12vw"
                />
              </div>
            </div>
          </div>
        )}
        <div className="mt-auto pt-1">
          <CardFoot timeline={service.timeline} accent={accent} />
        </div>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPECIALIST CARD - horizontal layout for the builds grid
// ═══════════════════════════════════════════════════════════════════════════════
function SpecialistCard({ service, num }: { service: ServiceDefinition; num: string }) {
  const IC =
    (Icons as unknown as Record<string, ComponentType<{ size?: number; stroke?: number }>>)[
      service.icon
    ] ?? Icons.IconCode;
  const accent = glowMap[service.glow];
  const img = serviceImages[service.slug];
  return (
    <Link href={`/services/${service.slug}`} className={cn(bentoBase, "col-span-1 p-6")}>
      {img && (
        <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.13] transition-all duration-700 group-hover:opacity-[0.24] max-md:hidden">
          <Image
            src={img}
            alt=""
            fill
            className="object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
            sizes="18vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/55 to-transparent" />
        </div>
      )}
      <div className="relative z-10 flex h-full flex-col lg:grid lg:grid-cols-[1fr_auto] lg:gap-4 lg:items-center">
        {/* Content */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <IconBox IC={IC} accent={accent} />
            <span className="font-mono text-[0.62rem] tracking-[0.12em] text-[var(--on-surface-dim)] opacity-45">
              {num}
            </span>
          </div>
          <div>
            <h3 className="mb-1.5 text-[1.08rem] font-normal tracking-tight text-[var(--on-surface)] transition-colors duration-300 group-hover:text-[var(--primary)]">
              {service.title}
            </h3>
            <p className="text-[0.83rem] leading-[1.62] text-[var(--on-surface-dim)] line-clamp-2">
              {service.description}
            </p>
          </div>
          <StackTags tags={service.stackHighlights.slice(0, 3)} />
        </div>
        {/* Right - image + footer stacked */}
        <div className="flex flex-col items-end justify-between h-full mt-4 lg:mt-0 gap-3">
          {img && (
            <div className="relative hidden lg:block h-[80px] w-[100px] overflow-hidden rounded-xl border border-[var(--glass-border)] shadow-md transition-all duration-700 group-hover:scale-[1.04]">
              <Image
                src={img}
                alt=""
                fill
                className="object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
                sizes="10vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/20 to-transparent" />
            </div>
          )}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <span
              className="rounded-full border px-2.5 py-[2px] font-mono text-[0.64rem]"
              style={{
                backgroundColor: accent.bg,
                borderColor: accent.border,
                color: accent.color,
              }}
            >
              {service.timeline}
            </span>
            <IconArrowUpRight
              size={14}
              stroke={1.7}
              className="text-[var(--on-surface-dim)] ml-auto transition-all duration-300 group-hover:text-[var(--primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROCESS SECTION - accordion, editorial open feel
// ═══════════════════════════════════════════════════════════════════════════════
const processSteps = [
  {
    num: "01",
    title: "One scoping call",
    body: "Tell us what you're building and why. We ask the right questions - no intake forms, no deck, no pitch. A direct conversation about what you need and what's realistic.",
  },
  {
    num: "02",
    title: "We write the brief",
    body: "We produce a one-page project brief: scope, timeline, deliverables, and cost. You approve or revise. No vague SOW. No back-and-forth that takes weeks.",
  },
  {
    num: "03",
    title: "We build in sprints",
    body: "Working progress every week. Feedback is structured. Scope changes are flagged immediately - never buried in a final review at the end.",
  },
  {
    num: "04",
    title: "You get a live product",
    body: "We ship a live, tested, documented product. You own the IP from day one. We stay available for 30 days post-launch at no extra cost.",
  },
];

function ProcessSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto w-full max-w-[92rem]">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
          {/* Left - editorial header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-8%" }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="label-caps mb-5 text-[var(--primary)]">
              How a project begins
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="title-serif text-[clamp(2.2rem,5vw,3.8rem)] font-normal leading-[0.95] tracking-tight text-[var(--on-surface)]"
            >
              Scope, build, ship.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-sm text-[0.9rem] leading-[1.72] text-[var(--on-surface-dim)]"
            >
              Every project starts with a single call. Within 48 hours you have a clear brief, a
              fixed timeline, and a team that owns the outcome.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--on-surface)] px-5 py-2.5 text-[0.86rem] text-[var(--bg)] no-underline shadow-md transition-all duration-300 hover:-translate-y-px hover:shadow-lg"
              >
                Start with a call <IconBrandWhatsapp size={14} stroke={1.8} />
              </a>
            </motion.div>
          </motion.div>

          {/* Right - accordion steps */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ ...cosmicSpring, delay: 0.14 }}
            className="space-y-2"
          >
            {processSteps.map((step, i) => {
              const isOpen = open === i;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className={cn(
                    "group/step w-full overflow-hidden rounded-[1.1rem] border text-left transition-all duration-300",
                    isOpen
                      ? "border-[color-mix(in_srgb,var(--primary)_28%,transparent)] bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]"
                      : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[color-mix(in_srgb,var(--on-surface)_18%,transparent)]",
                  )}
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300"
                      style={
                        isOpen
                          ? {
                              backgroundColor: "var(--primary)",
                              borderColor: "var(--primary)",
                              color: "white",
                            }
                          : { borderColor: "var(--glass-border)", color: "var(--on-surface-dim)" }
                      }
                    >
                      {isOpen ? (
                        <IconCheck size={13} stroke={2.2} />
                      ) : (
                        <span className="font-mono text-[0.62rem]">{step.num}</span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "flex-1 text-[0.93rem] tracking-tight transition-colors duration-200",
                        isOpen ? "text-[var(--on-surface)]" : "text-[var(--on-surface-dim)]",
                      )}
                    >
                      {step.title}
                    </span>
                    <IconChevronDown
                      size={15}
                      stroke={1.7}
                      className="shrink-0 text-[var(--on-surface-dim)] transition-transform duration-300"
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </div>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: [0.76, 0, 0.24, 1] }}
                      >
                        <div className="border-t border-[color-mix(in_srgb,var(--primary)_14%,transparent)] px-5 pb-5 pt-4">
                          <p className="text-[0.86rem] leading-[1.72] text-[var(--on-surface-dim)]">
                            {step.body}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPERIENCE
// ═══════════════════════════════════════════════════════════════════════════════
export function ServicesPageExperience() {
  const productDelivery = getServicesByGroup("product-delivery");
  const specialistBuilds = getServicesByGroup("specialist-builds");
  const bento1Ref = useRef<HTMLDivElement>(null);
  const bento2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctxs: gsap.Context[] = [];
    [bento1Ref, bento2Ref].forEach((ref) => {
      if (!ref.current) return;
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".bento-card",
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.065,
            ease: "power2.out",
            scrollTrigger: { trigger: ref.current, start: "top 84%" },
          },
        );
      }, ref);
      ctxs.push(ctx);
    });
    return () => ctxs.forEach((c) => c.revert());
  }, []);

  const [pdHero, pdSaas, pdMobile, pdAi] = productDelivery;

  return (
    <main className="relative isolate overflow-hidden bg-[var(--bg)]">
      {/* Ambient backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_9%,transparent),transparent_26rem)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 z-0 h-[48rem] w-[48rem] rounded-full opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-[-10%] z-0 h-[32rem] w-[32rem] rounded-full opacity-[0.04]"
        style={{
          background: "radial-gradient(circle, var(--tertiary) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-[1]">
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="px-5 pb-0 pt-32 sm:px-8 lg:px-10 lg:pt-40">
          <div className="mx-auto w-full max-w-[92rem]">
            <div className="grid gap-10 border-b border-[var(--glass-border)] pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)] lg:items-end lg:pb-16">
              <motion.div initial="hidden" animate="visible" variants={stagger}>
                <motion.p
                  variants={fadeUp}
                  className="label-caps mb-5 flex items-center gap-3 text-[var(--primary)]"
                >
                  <span className="h-px w-7 bg-[var(--primary)]" />
                  Our Capabilities
                </motion.p>
                <motion.h1
                  variants={fadeUp}
                  className="title-serif text-[clamp(3rem,7vw,5.2rem)] font-normal leading-[0.93] tracking-tight text-[var(--on-surface)]"
                >
                  Eight service lines.
                  <br />
                  <em className="not-italic text-[var(--primary)]">One standard.</em>
                </motion.h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...cosmicSpring, delay: 0.18 }}
                className="flex flex-col gap-7 lg:justify-self-end"
              >
                <p className="text-[0.95rem] leading-[1.72] text-[var(--on-surface-dim)] max-w-sm lg:text-right">
                  We design, build, and ship complete software products - from greenfield SaaS and
                  custom business tools to production-ready AI pipelines and mobile applications.
                </p>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <LinkButton
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="primary"
                  >
                    Start a project <IconBrandWhatsapp size={16} stroke={1.8} />
                  </LinkButton>
                  <LinkButton href="/work" variant="glass">
                    See our work
                  </LinkButton>
                </div>
              </motion.div>
            </div>

            {/* Stats strip - open layout, no cells */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...cosmicSpring, delay: 0.28 }}
              className="flex flex-wrap items-center gap-x-10 gap-y-5 py-10 sm:gap-x-14"
            >
              {[
                { icon: IconShieldCheck, value: "08", label: "Service lines" },
                { icon: IconBolt, value: "32+", label: "Products shipped" },
                { icon: IconClock, value: "48h", label: "To scoping proposal" },
                { icon: IconUsers, value: "30d", label: "Post-launch support" },
              ].map(({ icon: SI, value, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-[var(--primary)] opacity-60">
                    <SI size={15} stroke={1.6} />
                  </span>
                  <span className="font-mono text-[1.35rem] tracking-tight text-[var(--on-surface)]">
                    {value}
                  </span>
                  <span className="text-[0.78rem] text-[var(--on-surface-dim)]">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── PRODUCT DELIVERY ─────────────────────────────────────────────── */}
        <section className="px-5 pt-4 pb-16 sm:px-8 lg:px-10 lg:pb-20">
          <div className="mx-auto w-full max-w-[92rem]">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-8%" }}
              variants={stagger}
              className="mb-10"
            >
              <motion.p variants={fadeUp} className="label-caps mb-3 text-[var(--primary)]">
                Product Delivery
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="title-serif max-w-[28ch] text-[clamp(1.9rem,4.2vw,3rem)] font-normal leading-[0.97] tracking-tight text-[var(--on-surface)]"
              >
                From concept to production-ready software.
              </motion.h2>
            </motion.div>

            <div
              ref={bento1Ref}
              className="bento-grid grid grid-cols-1 gap-4 max-md:gap-0 md:grid-cols-2 lg:grid-cols-4 md:auto-rows-[260px] lg:auto-rows-[260px]"
            >
              {pdHero && <HeroServiceCard service={pdHero} />}
              {pdSaas && <StandardServiceCard service={pdSaas} num="02" />}
              {pdMobile && <TallServiceCard service={pdMobile} num="03" />}
              {pdAi && <StandardServiceCard service={pdAi} num="04" />}
            </div>
          </div>
        </section>

        {/* ── PROCESS STRIP ─────────────────────────────────────────────────── */}
        <div className="border-y border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_4%,transparent)]">
          <ProcessSection />
        </div>

        {/* ── SPECIALIST BUILDS ─────────────────────────────────────────────── */}
        <section className="px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto w-full max-w-[92rem]">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-8%" }}
              variants={stagger}
              className="mb-10"
            >
              <motion.p variants={fadeUp} className="label-caps mb-3 text-[var(--tertiary)]">
                Specialist Builds
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
              >
                <h2 className="title-serif max-w-[28ch] text-[clamp(1.9rem,4.2vw,3rem)] font-normal leading-[0.97] tracking-tight text-[var(--on-surface)]">
                  Deep expertise in complex technical domains.
                </h2>
                <p className="max-w-xs text-[0.88rem] leading-[1.68] text-[var(--on-surface-dim)] sm:text-right">
                  Blockchain, enterprise platforms, API systems, and product strategy - each
                  requiring specialist knowledge beyond standard builds.
                </p>
              </motion.div>
            </motion.div>

            {/* 2-col grid - feels different from the 4-col product delivery */}
            <div
              ref={bento2Ref}
              className="bento-grid grid grid-cols-1 gap-4 max-md:gap-0 md:grid-cols-2 md:auto-rows-[220px]"
            >
              {specialistBuilds.map((service, i) => (
                <SpecialistCard
                  key={service.slug}
                  service={service}
                  num={String(productDelivery.length + i + 1).padStart(2, "0")}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
