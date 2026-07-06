"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconArrowUpRight, IconBrandWhatsapp } from "@tabler/icons-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services as landingServices } from "@/content/landing";
import { services as serviceDefs } from "@/data/services";

gsap.registerPlugin(ScrollTrigger);

// Merge landing services (icon, image, body) with defs (stackHighlights, glow)
const services = landingServices.map((ls) => ({
  ...ls,
  tags: serviceDefs.find((d) => d.slug === ls.slug)?.stackHighlights.slice(0, 3) ?? [],
  glow: serviceDefs.find((d) => d.slug === ls.slug)?.glow ?? ("violet" as const),
}));

// Light-mode-safe accent - "cyan" glow → --tertiary token
type AccentVariant = "primary" | "tertiary" | "surface";
const glowAccent: Record<string, AccentVariant> = {
  violet: "primary",
  cyan: "tertiary",
  amber: "surface",
};
const accentMap: Record<AccentVariant, { color: string; bg: string; border: string }> = {
  primary: {
    color: "var(--primary)",
    bg: "color-mix(in srgb, var(--primary) 8%, transparent)",
    border: "color-mix(in srgb, var(--primary) 22%, transparent)",
  },
  tertiary: {
    color: "var(--tertiary)",
    bg: "color-mix(in srgb, var(--tertiary) 8%, transparent)",
    border: "color-mix(in srgb, var(--tertiary) 22%, transparent)",
  },
  surface: {
    color: "var(--on-surface)",
    bg: "color-mix(in srgb, var(--on-surface) 6%, transparent)",
    border: "color-mix(in srgb, var(--on-surface) 14%, transparent)",
  },
};

// Base card - Link wrapper so the whole card is clickable
// Mobile: flat open pattern. Desktop: glass bento card.
const cardBase =
  "bento-card group relative block no-underline overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--glass-inner-shadow)] backdrop-blur-md transition-all duration-500 ease-out hover:border-[color-mix(in_srgb,var(--on-surface)_32%,transparent)] hover:shadow-[0_22px_56px_color-mix(in_srgb,var(--bg-deep)_16%,transparent)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_36%,transparent)] max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!py-10 max-md:last:!border-b-0 max-md:!translate-y-0";

export function ServicesBentoGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".bento-card",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.065,
          ease: "power2.out",
          scrollTrigger: { trigger: ".bento-grid", start: "top 84%" },
        },
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="services"
      className="relative w-full bg-[var(--bg)] px-5 py-16 max-sm:py-12 sm:px-8 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-[92rem]">
        {/* Section header */}
        <div className="mb-12">
          <p className="label-caps mb-3 flex items-center gap-3 text-[var(--tertiary)]">
            <span className="h-px w-7 bg-[var(--tertiary)]" />
            What We Build
          </p>
          <h2 className="title-serif text-[clamp(1.95rem,4.8vw,3.75rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)]">
            Eight service lines.
            <br />
            <em className="not-italic text-[var(--tertiary)]">One team that owns the outcome.</em>
          </h2>
        </div>

        {/* Bento grid */}
        <div className="bento-grid grid grid-cols-1 gap-4 max-md:gap-0 md:grid-cols-2 lg:grid-cols-4 md:auto-rows-[244px] lg:auto-rows-[244px]">
          {services.map((service, index) => {
            const Icon = service.icon;
            const variantKey = glowAccent[service.glow] ?? "surface";
            const accent = accentMap[variantKey];

            /* ═══════════════════════════════════════════════════
               CARD 0 - Web Applications   2 col × 2 row hero
            ═══════════════════════════════════════════════════ */
            if (index === 0) {
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className={`${cardBase} col-span-1 p-7 md:col-span-2 lg:col-span-2 lg:row-span-2`}
                >
                  <div className="relative z-10 grid h-full grid-cols-1 gap-0 lg:grid-cols-[1fr_1fr] lg:items-stretch">
                    {/* Left - structured content */}
                    <div className="flex h-full flex-col justify-between py-1 pr-0 lg:pr-8">
                      <div className="flex flex-col gap-5">
                        {/* Eyebrow row */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[0.62rem] tracking-[0.12em] text-[var(--on-surface-dim)] opacity-70">
                            01 &mdash; FEATURED
                          </span>
                          <span
                            className="rounded-full border px-2.5 py-0.5 font-mono text-[0.62rem]"
                            style={{
                              backgroundColor: accent.bg,
                              borderColor: accent.border,
                              color: accent.color,
                            }}
                          >
                            {service.timeline}
                          </span>
                        </div>

                        {/* Icon + headline */}
                        <div>
                          <div
                            className="mb-4 flex h-11 w-11 items-center justify-center rounded-[0.85rem] border shadow-sm"
                            style={{
                              borderColor: accent.border,
                              backgroundColor: accent.bg,
                              color: accent.color,
                            }}
                          >
                            <Icon size={22} stroke={1.4} />
                          </div>
                          <h3 className="title-serif text-[2rem] font-normal leading-[1.04] tracking-tight text-[var(--on-surface)] transition-colors duration-300 group-hover:text-[var(--primary)]">
                            {service.title}
                          </h3>
                          <p className="mt-3 text-[0.88rem] leading-[1.68] text-[var(--on-surface-dim)]">
                            {service.body}
                          </p>
                        </div>

                        {/* Tech tag row */}
                        {service.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {service.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2.5 py-[3px] font-mono text-[0.63rem] text-[var(--on-surface-dim)]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer CTA */}
                      <div className="mt-5 flex items-center gap-2 border-t border-[var(--glass-border)] pt-4">
                        <span
                          className="inline-flex items-center gap-1.5 text-[0.82rem] text-[var(--on-surface-dim)] transition-all duration-300 group-hover:text-[var(--primary)] group-hover:gap-2.5"
                          style={{}}
                        >
                          Explore service
                          <IconArrowRight
                            size={14}
                            stroke={1.8}
                            className="transition-transform duration-300 group-hover:translate-x-0.5"
                          />
                        </span>
                      </div>
                    </div>

                    {/* Right - browser mockup */}
                    <div className="relative hidden h-full items-center justify-end lg:flex">
                      <div className="h-full w-full overflow-hidden rounded-[1.1rem] soft-neumorphic-inner transition-all duration-700 group-hover:scale-[1.025] group-hover:rotate-[-0.4deg]">
                        {/* Browser chrome */}
                        <div className="flex h-6 shrink-0 items-center gap-1.5 border-b border-[var(--glass-border)] bg-[var(--surface-high)] px-3">
                          <span className="h-[7px] w-[7px] rounded-full bg-red-400/70" />
                          <span className="h-[7px] w-[7px] rounded-full bg-yellow-400/70" />
                          <span className="h-[7px] w-[7px] rounded-full bg-green-400/70" />
                          <div className="mx-2 flex h-3.5 flex-1 max-w-[140px] items-center rounded-sm bg-[var(--surface-highest)] px-2">
                            <span className="truncate font-mono text-[7px] leading-none text-[var(--on-surface-dim)] opacity-60">
                              app.andishi.dev/dashboard
                            </span>
                          </div>
                        </div>
                        {/* Screenshot */}
                        <div className="relative h-[calc(100%-1.5rem)] w-full overflow-hidden bg-[var(--bg-deep)]">
                          {service.image && (
                            <Image
                              src={service.image}
                              alt={service.title}
                              fill
                              priority
                              className="object-cover object-top transition-transform duration-[3.5s] ease-out group-hover:scale-105"
                              sizes="25vw"
                            />
                          )}
                          {/* Subtle bottom fade into chrome */}
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[var(--surface-low)]/60 to-transparent" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            }

            /* ═══════════════════════════════════════════════════
               CARD 2 - Mobile Applications   1 col × 2 row tall
            ═══════════════════════════════════════════════════ */
            if (index === 2) {
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className={`${cardBase} col-span-1 p-6 lg:col-span-1 lg:row-span-2`}
                >
                  {/* Atmospheric image */}
                  {service.image && (
                    <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.12] transition-all duration-700 group-hover:opacity-[0.22] max-md:hidden">
                      <Image
                        src={service.image}
                        alt=""
                        fill
                        className="object-cover object-center transition-transform duration-[3s] ease-out group-hover:scale-105"
                        sizes="14vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/50 to-transparent" />
                    </div>
                  )}
                  <div className="relative z-10 flex h-full flex-col">
                    {/* Top */}
                    <div>
                      <div className="mb-4 flex items-start justify-between">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-[0.85rem] border"
                          style={{
                            borderColor: accent.border,
                            backgroundColor: accent.bg,
                            color: accent.color,
                          }}
                        >
                          <Icon size={20} stroke={1.4} />
                        </div>
                        <span
                          className="rounded-full border px-2.5 py-0.5 font-mono text-[0.62rem]"
                          style={{
                            backgroundColor: accent.bg,
                            borderColor: accent.border,
                            color: accent.color,
                          }}
                        >
                          {service.timeline}
                        </span>
                      </div>
                      <h3 className="mb-2 text-[1.08rem] font-normal tracking-tight text-[var(--on-surface)] transition-colors duration-300 group-hover:text-[var(--primary)]">
                        {service.title}
                      </h3>
                      <p className="text-[0.84rem] leading-[1.62] text-[var(--on-surface-dim)] line-clamp-3">
                        {service.body}
                      </p>
                    </div>

                    {/* Phone mockup - fills vertical space */}
                    <div className="hidden lg:flex flex-1 items-end justify-center py-3">
                      <div className="relative w-[72%] overflow-hidden rounded-t-2xl soft-neumorphic-inner transition-all duration-700 group-hover:scale-[1.03] group-hover:-translate-y-1.5">
                        <div className="absolute left-1/2 top-1.5 z-20 h-2.5 w-10 -translate-x-1/2 rounded-full bg-black/30" />
                        <div className="relative h-[200px] w-full overflow-hidden bg-[var(--bg-deep)]">
                          {service.image && (
                            <Image
                              src={service.image}
                              alt={service.title}
                              fill
                              className="object-cover object-center transition-transform duration-[3s] ease-out group-hover:scale-105"
                              sizes="12vw"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div className="mt-auto flex items-center justify-between border-t border-[var(--glass-border)] pt-3.5 max-md:!border-transparent">
                      <div className="flex flex-wrap gap-1">
                        {service.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-[var(--glass-border)] px-2 py-[2px] font-mono text-[0.6rem] text-[var(--on-surface-dim)]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <IconArrowUpRight
                        size={15}
                        stroke={1.7}
                        className="text-[var(--on-surface-dim)] transition-all duration-300 group-hover:text-[var(--primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>
                  </div>
                </Link>
              );
            }

            /* ═══════════════════════════════════════════════════
               CARDS 4 & 7 - Enterprise & Strategy   2 col × 1 wide
            ═══════════════════════════════════════════════════ */
            if (index === 4 || index === 7) {
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className={`${cardBase} col-span-1 p-6 md:col-span-2 lg:col-span-2 lg:row-span-1`}
                >
                  {/* Atmospheric image */}
                  {service.image && (
                    <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.13] transition-all duration-700 group-hover:opacity-[0.22] max-md:hidden">
                      <Image
                        src={service.image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
                        sizes="40vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/50 to-[var(--bg)]/20" />
                    </div>
                  )}

                  <div className="relative z-10 grid h-full grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_auto]">
                    {/* Text column */}
                    <div className="flex h-full flex-col justify-between py-0.5">
                      <div>
                        <div className="mb-4 flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] border"
                            style={{
                              borderColor: accent.border,
                              backgroundColor: accent.bg,
                              color: accent.color,
                            }}
                          >
                            <Icon size={18} stroke={1.4} />
                          </div>
                          <span
                            className="rounded-full border px-2.5 py-0.5 font-mono text-[0.62rem]"
                            style={{
                              backgroundColor: accent.bg,
                              borderColor: accent.border,
                              color: accent.color,
                            }}
                          >
                            {service.timeline}
                          </span>
                        </div>
                        <h3 className="mb-2 text-[1.1rem] font-normal tracking-tight text-[var(--on-surface)] transition-colors duration-300 group-hover:text-[var(--primary)]">
                          {service.title}
                        </h3>
                        <p className="text-[0.84rem] leading-[1.62] text-[var(--on-surface-dim)] max-w-md line-clamp-2">
                          {service.body}
                        </p>
                      </div>
                      {/* Tech tags - slide up on hover */}
                      <div className="flex flex-wrap gap-1.5 pt-3 transition-all duration-300 max-md:hidden">
                        {service.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-[2px] font-mono text-[0.6rem] text-[var(--on-surface-dim)]"
                          >
                            {t}
                          </span>
                        ))}
                        <span className="ml-auto inline-flex items-center gap-1 text-[0.78rem] text-[var(--on-surface-dim)] transition-all duration-300 group-hover:text-[var(--primary)]">
                          Explore{" "}
                          <IconArrowRight
                            size={13}
                            stroke={1.8}
                            className="transition-transform duration-300 group-hover:translate-x-0.5"
                          />
                        </span>
                      </div>
                    </div>

                    {/* Image panel - desktop only */}
                    <div className="relative hidden lg:flex h-full w-[160px] shrink-0 items-center">
                      <div className="relative h-[140px] w-full overflow-hidden rounded-xl soft-neumorphic-inner transition-all duration-700 group-hover:scale-[1.03]">
                        {service.image && (
                          <Image
                            src={service.image}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
                            sizes="12vw"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/30 to-transparent" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            }

            /* ═══════════════════════════════════════════════════
               STANDARD 1×1 cards  (SaaS, AI, Blockchain, APIs)
            ═══════════════════════════════════════════════════ */
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className={`${cardBase} col-span-1 p-6 lg:col-span-1 lg:row-span-1`}
              >
                {/* Atmospheric image */}
                {service.image && (
                  <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.14] transition-all duration-700 group-hover:opacity-[0.25] max-md:hidden">
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
                      sizes="14vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />
                  </div>
                )}

                <div className="relative z-10 flex h-full flex-col">
                  {/* Top */}
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] border"
                        style={{
                          borderColor: accent.border,
                          backgroundColor: accent.bg,
                          color: accent.color,
                        }}
                      >
                        <Icon size={18} stroke={1.4} />
                      </div>
                      <span
                        className="rounded-full border px-2 py-[2px] font-mono text-[0.6rem]"
                        style={{
                          backgroundColor: accent.bg,
                          borderColor: accent.border,
                          color: accent.color,
                        }}
                      >
                        {service.timeline}
                      </span>
                    </div>
                    <div>
                      <h3 className="mb-1.5 text-[1.05rem] font-normal tracking-tight text-[var(--on-surface)] transition-colors duration-300 group-hover:text-[var(--primary)]">
                        {service.title}
                      </h3>
                      <p className="text-[0.82rem] leading-[1.62] text-[var(--on-surface-dim)] line-clamp-3">
                        {service.body}
                      </p>
                    </div>
                  </div>

                  {/* Footer - tech tags fade in on hover, arrow always visible */}
                  <div className="mt-4 border-t border-[var(--glass-border)] pt-3.5 max-md:!border-transparent">
                    {/* Tags - visible by default, shift slightly on hover */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex flex-1 flex-wrap gap-1 transition-all duration-300">
                        {service.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-[var(--glass-border)] px-2 py-[2px] font-mono text-[0.6rem] text-[var(--on-surface-dim)]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <IconArrowUpRight
                        size={14}
                        stroke={1.7}
                        className="ml-auto shrink-0 text-[var(--on-surface-dim)] transition-all duration-300 group-hover:text-[var(--primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* ═══ CTA bento card - stays as div (has internal links) ═══ */}
          <div className="bento-card col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-1 relative group overflow-hidden rounded-[1.75rem] border border-[color-mix(in_srgb,var(--tertiary)_18%,transparent)] bg-gradient-to-br from-[var(--surface-high)] via-[var(--surface-highest)] to-[color-mix(in_srgb,var(--tertiary)_5%,transparent)] p-6 transition-all duration-500 hover:border-[color-mix(in_srgb,var(--tertiary)_38%,transparent)] hover:shadow-[0_20px_48px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] flex flex-col justify-between max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-none max-md:!shadow-none max-md:!px-0 max-md:!py-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_90%_10%,color-mix(in_srgb,var(--tertiary)_10%,transparent),transparent_58%)]" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-lg">
                <p className="label-caps mb-2 text-[var(--tertiary)]">Bespoke Software Systems</p>
                <h3 className="title-serif mb-2.5 text-[1.55rem] font-normal leading-[1.1] tracking-tight text-[var(--on-surface)]">
                  Have something more complex in mind?
                </h3>
                <p className="text-[0.86rem] leading-[1.65] text-[var(--on-surface-dim)]">
                  We design bespoke architectures, unique database solutions, specialized
                  integrations, and workflow engines built specifically around your business.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2.5 lg:items-end">
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[2.35rem] items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-5 py-2 text-[0.84rem] text-[var(--bg)] shadow-md no-underline transition-all duration-300 hover:-translate-y-px hover:shadow-lg lg:w-auto w-full"
                >
                  Start a project <IconBrandWhatsapp size={14} stroke={1.8} />
                </a>
                <Link
                  href="/hire"
                  className="text-[0.8rem] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] transition-colors no-underline pl-1 lg:pl-0 text-center lg:text-right"
                >
                  Or extend your team &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
