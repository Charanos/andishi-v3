"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services } from "@/content/landing";

gsap.registerPlugin(ScrollTrigger);

export function ServicesBentoGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered fade-in-up entrance animation for all cards
      gsap.fromTo(
        ".bento-card",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".bento-grid",
            start: "top 85%",
          },
        }
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
        {/* Section Header */}
        <div className="mb-12">
          <p className="label-caps mb-3 flex items-center gap-3 text-[var(--tertiary)]">
            <span className="h-px w-7 bg-[var(--tertiary)]" />
            WHAT WE BUILD
          </p>
          <h2 className="title-serif text-[clamp(1.95rem,4.8vw,3.75rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)]">
            Eight service lines.<br />One team that owns the outcome.
          </h2>
        </div>

        {/* Bento Grid: 240px auto rows for a sleeker, more professional height */}
        <div className="bento-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-md:gap-0 md:auto-rows-[240px] lg:auto-rows-[240px]">
          {services.map((service, index) => {
            const Icon = service.icon;

            // Accent colors tailored to match the design system seamlessly
            const accentColor =
              index === 0 || index === 3 || index === 6
                ? "var(--on-surface)"
                : "var(--tertiary)";

            // Card basic theme style
            const cardBaseClasses =
              "bento-card relative group overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--glass-inner-shadow)] p-6 backdrop-blur-md transition-all duration-500 ease-out hover:border-[color-mix(in_srgb,var(--on-surface)_40%,transparent)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] flex flex-col justify-between max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!py-10 max-md:last:!border-b-0";

            if (index === 0) {
              // 1. Web Applications (Large 2x2 Hero Card - Structural Refinement to eliminate whitespace)
              return (
                <div
                  key={service.slug}
                  className={`${cardBaseClasses} col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/90 to-transparent z-10 hidden" />

                  <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-center">
                    {/* Left details panel: grouped vertically in the center to remove empty vertical gap */}
                    <div className="lg:col-span-6 flex flex-col justify-center gap-5 h-full py-2">
                      <div>
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--on-surface)_20%,transparent)] bg-[color-mix(in_srgb,var(--on-surface)_6%,transparent)] text-[var(--on-surface-dim)] backdrop-blur-md">
                          <Icon size={22} stroke={1.5} />
                        </div>
                        <h3 className="text-2xl font-medium tracking-tight text-[var(--on-surface)] mb-2.5">
                          {service.title}
                        </h3>
                        <p className="text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
                          {service.body}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <span className="rounded-full bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] border border-[color-mix(in_srgb,var(--tertiary)_18%,transparent)] px-3 py-1 font-mono text-[var(--tertiary)]">
                          {service.timeline}
                        </span>
                        <Link
                          href={`/services/${service.slug}`}
                          className="inline-flex items-center gap-1.5 font-medium text-[var(--on-surface-dim)] hover:opacity-70 transition-opacity"
                        >
                          View details <IconArrowRight size={14} />
                        </Link>
                      </div>
                    </div>

                    {/* Right mockbrowser panel: sized larger on desktop to eliminate empty space */}
                    <div className="relative hidden lg:flex lg:col-span-6 h-full items-center justify-center pl-2">
                      <div className="w-full h-[350px] rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] overflow-hidden shadow-xl transition-all duration-700 group-hover:scale-[1.02] group-hover:rotate-[-0.5deg]">
                        {/* Thin browser header */}
                        <div className="h-5 w-full bg-[var(--surface-high)] border-b border-[var(--glass-border)] flex items-center px-2.5 gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                        </div>
                        {/* Embedded page screenshot */}
                        <div className="relative w-full h-[calc(100%-1.25rem)] overflow-hidden bg-[var(--bg-deep)]">
                          {service.image && (
                            <Image
                              src={service.image}
                              alt={service.title}
                              fill
                              className="object-cover object-top transition-transform duration-[3s] ease-out group-hover:scale-105"
                              sizes="25vw"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (index === 2) {
              // 2. Mobile Applications (Tall 1x2 Slim Card)
              return (
                <div
                  key={service.slug}
                  className={`${cardBaseClasses} col-span-1 md:col-span-1 lg:col-span-1 lg:row-span-2`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/90 to-transparent z-10 hidden" />

                  {/* Details panel */}
                  <div className="relative z-20">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--tertiary)_20%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_6%,transparent)] text-[var(--tertiary)] backdrop-blur-md">
                      <Icon size={22} stroke={1.5} />
                    </div>
                    <h3 className="text-xl font-medium tracking-tight text-[var(--on-surface)] mb-2">
                      {service.title}
                    </h3>
                    <p className="text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)] mb-4">
                      {service.body}
                    </p>
                  </div>

                  {/* Phone Mockup Frame */}
                  <div className="relative hidden lg:block w-full h-[220px] shrink-0 overflow-hidden mt-2">
                    <div className="relative mx-auto w-[85%] h-full bg-[var(--surface-low)] border border-[var(--glass-border)] rounded-t-2xl overflow-hidden shadow-xl transition-all duration-700 group-hover:scale-[1.03] group-hover:translate-y-[-2px]">
                      {/* Notch indicator */}
                      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-2.5 bg-black/40 rounded-full z-20 flex items-center justify-center">
                        <span className="w-5 h-0.5 bg-white/20 rounded-full" />
                      </div>
                      {/* Screen content */}
                      <div className="relative w-full h-full overflow-hidden bg-[var(--bg-deep)]">
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

                  {/* Links */}
                  <div className="relative z-20 flex items-center gap-4 text-xs mt-auto pt-2">
                    <span className="rounded-full bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] border border-[color-mix(in_srgb,var(--tertiary)_18%,transparent)] px-3 py-1 font-mono text-[var(--tertiary)]">
                      {service.timeline}
                    </span>
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-1.5 font-medium text-[var(--on-surface-dim)] hover:opacity-70 transition-opacity"
                    >
                      Details <IconArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            }

            if (index === 4 || index === 7) {
              // 3. Enterprise & Product Strategy (Wide 2x1 Sleek Cards)
              return (
                <div
                  key={service.slug}
                  className={`${cardBaseClasses} col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-1`}
                >
                  <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-center w-full">
                    {/* Left content */}
                    <div className="lg:col-span-8 flex flex-col justify-between h-full py-1">
                      <div>
                        <div
                          className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-md"
                          style={{
                            borderColor: `color-mix(in_srgb, ${accentColor} 20%, transparent)`,
                            backgroundColor: `color-mix(in_srgb, ${accentColor} 6%, transparent)`,
                            color: accentColor,
                          }}
                        >
                          <Icon size={22} stroke={1.5} />
                        </div>
                        <h3 className="text-xl font-medium tracking-tight text-[var(--on-surface)] mb-2">
                          {service.title}
                        </h3>
                        <p className="text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)] max-w-lg mb-3">
                          {service.body}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs mt-auto">
                        <span className="rounded-full bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] border border-[color-mix(in_srgb,var(--tertiary)_18%,transparent)] px-3 py-1 font-mono text-[var(--tertiary)]">
                          {service.timeline}
                        </span>
                        <Link
                          href={`/services/${service.slug}`}
                          className="inline-flex items-center gap-1.5 font-medium text-[var(--on-surface-dim)] hover:opacity-70 transition-opacity"
                        >
                          Details <IconArrowRight size={14} />
                        </Link>
                      </div>
                    </div>

                    {/* Right illustrative thumbnail */}
                    <div className="relative hidden lg:flex lg:col-span-4 h-full items-center justify-center pr-1">
                      <div className="relative w-full h-[120px] rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] overflow-hidden shadow-md transition-all duration-700 group-hover:scale-[1.02] group-hover:rotate-[0.5deg]">
                        {service.image && (
                          <Image
                            src={service.image}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
                            sizes="12vw"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg)]/10 to-transparent" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // 4. Standard 1x1 Cards (SaaS, AI, Blockchain, APIs - compact height)
            return (
              <div
                key={service.slug}
                className={`${cardBaseClasses} col-span-1 md:col-span-1 lg:col-span-1 lg:row-span-1`}
              >
                {/* Atmospheric soft background image overlay */}
                <div className="absolute inset-0 z-0 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none max-md:hidden">
                  {service.image && (
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
                      sizes="12vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-[var(--bg)]/40" />
                </div>

                <div className="relative z-20 flex flex-col h-full justify-between w-full">
                  <div>
                    <div
                      className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-md"
                      style={{
                        borderColor: `color-mix(in_srgb, ${accentColor} 20%, transparent)`,
                        backgroundColor: `color-mix(in_srgb, ${accentColor} 6%, transparent)`,
                        color: accentColor,
                      }}
                    >
                      <Icon size={22} stroke={1.5} />
                    </div>
                    <h3 className="text-[1.125rem] font-medium tracking-tight text-[var(--on-surface)] mb-1.5">
                      {service.title}
                    </h3>
                    <p className="text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)] line-clamp-3">
                      {service.body}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs mt-4 pt-1">
                    <span className="rounded-full bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] border border-[color-mix(in_srgb,var(--tertiary)_18%,transparent)] px-3 py-1 font-mono text-[var(--tertiary)]">
                      {service.timeline}
                    </span>
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-1 font-medium text-[var(--on-surface-dim)] hover:opacity-70 transition-opacity"
                    >
                      Details <IconArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 5. Custom Spec / CTA Bento Card (Col-span-2, Row-span-1 - compact & balanced) */}
          <div className="bento-card col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-1 relative group overflow-hidden rounded-[1.75rem] border border-[color-mix(in_srgb,var(--on-surface)_25%,transparent)] bg-gradient-to-br from-[var(--surface-high)] via-[var(--surface-highest)] to-[color-mix(in_srgb,var(--on-surface)_6%,transparent)] p-6 shadow-sm transition-all duration-500 hover:border-[color-mix(in_srgb,var(--tertiary)_45%,transparent)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] flex flex-col justify-between max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!bg-none max-md:!shadow-none max-md:!px-0 max-md:!py-10 max-md:last:!border-b-0 max-md:hover:!shadow-none max-md:hover:!border-b max-md:hover:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)]">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,color-mix(in_srgb,var(--tertiary)_10%,transparent),transparent_50%)] pointer-events-none" />

            <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-center w-full">
              {/* Left content block */}
              <div className="lg:col-span-8 flex flex-col justify-between h-full py-1">
                <div>
                  <p className="font-mono text-[0.68rem] tracking-[0.12em] text-[var(--tertiary)] uppercase font-medium mb-2">
                    Bespoke Software Systems
                  </p>
                  <h3 className="text-xl md:text-2xl font-medium tracking-tight text-[var(--on-surface)] mb-2">
                    Have custom requirements?
                  </h3>
                  <p className="text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)] max-w-lg">
                    We design and build bespoke software architectures, unique database solutions, specialized integrations, and workflow engines built specifically for your business operations.
                  </p>
                </div>
              </div>

              {/* Right CTA button block */}
              <div className="lg:col-span-4 flex flex-col gap-2.5 justify-center items-start lg:items-end w-full pr-1">
                <Link
                  href="/start-project"
                  className="inline-flex min-h-[2.3rem] items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-5 py-2 text-xs font-medium text-[var(--bg)] no-underline shadow-md transition-all duration-300 hover:-translate-y-px hover:shadow-lg group/btn w-full lg:w-auto"
                >
                  Start a Project
                  <IconArrowRight
                    size={14}
                    stroke={2.5}
                    className="transition-transform duration-300 group-hover/btn:translate-x-1"
                  />
                </Link>
                <Link
                  href="/hire"
                  className="text-xs font-medium text-[var(--on-surface-dim)] hover:opacity-70 transition-opacity pl-1 lg:pl-0"
                >
                  Or extend team &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
