"use client";

import React, { useRef, useEffect } from "react";
import { IconCalendarTime, IconFileText, IconCode, IconRocket } from "@tabler/icons-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { processSteps } from "@/content/landing";
import { SectionDivider } from "@/components/ui/section-divider";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const processTextureStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 11v12M11 17h12' stroke='%23c5b8e8' stroke-width='0.65' stroke-linecap='round' opacity='0.22'/%3E%3Cpath d='M4 4h4M26 30h4' stroke='%23c5b8e8' stroke-width='0.55' stroke-linecap='round' opacity='0.16'/%3E%3C/svg%3E\"), radial-gradient(circle, color-mix(in srgb, var(--tertiary) 16%, transparent) 0 1px, transparent 1.8px)",
  backgroundPosition: "0 0, 17px 17px",
  backgroundSize: "34px 34px, 34px 34px",
};

export function ProcessSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const processIcons = [IconCalendarTime, IconFileText, IconCode, IconRocket];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animations for nodes, lines, and cards
      gsap.fromTo(
        ".timeline-node",
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.12,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: ".process-workspace",
            start: "top 80%",
          },
        },
      );

      gsap.fromTo(
        ".connector-line",
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top center",
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".process-workspace",
            start: "top 78%",
          },
        },
      );

      gsap.fromTo(
        ".process-staggered-card",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".process-workspace",
            start: "top 75%",
          },
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="process"
      className="relative isolate overflow-hidden bg-[color-mix(in_srgb,var(--bg-deep)_72%,var(--bg))] px-5 py-20 max-sm:py-14 sm:px-8 lg:px-10 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.11]"
        style={processTextureStyle}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_5%,transparent),transparent_22rem)]"
      />

      <div className="relative z-[1] mx-auto max-w-[92rem]">
        {/* Header Section */}
        <div className="mb-16 text-center flex flex-col items-center max-w-4xl mx-auto">
          <p className="label-caps mb-4 flex items-center justify-center gap-3 text-[var(--tertiary)] font-medium tracking-[0.18em]">
            <span className="h-px w-7 bg-[var(--tertiary)]" />
            HOW A PROJECT GOES
            <span className="h-px w-7 bg-[var(--tertiary)]" />
          </p>
          <h2 className="title-serif max-w-5xl text-[clamp(2.2rem,5.8vw,4.55rem)] font-normal leading-[0.96] tracking-tight text-[var(--on-surface)]">
            From brief to live product, here is exactly what happens
          </h2>
          <p className="body-md mt-5 max-w-2xl text-[var(--on-surface-dim)] font-normal leading-relaxed">
            We scope in a single call, deliver in sprints, and ensure you own the outcome entirely.
          </p>
        </div>

        <SectionDivider />

        {/* Timeline Grid Container */}
        <div className="relative process-workspace mt-20">
          {/* Horizontal Track Line (Desktop Only) */}
          <div className="absolute top-[28px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--glass-border)_70%,var(--primary))] to-transparent -translate-y-1/2 z-0 hidden lg:block" />

          {/* Staggered Vertical Spacing Grid */}
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 max-md:gap-0 max-md:pl-4">
            {/* Mobile Vertical Timeline Line */}
            <div className="absolute left-[22px] top-8 bottom-8 w-px bg-gradient-to-b from-[var(--primary)] via-[color-mix(in_srgb,var(--glass-border)_60%,var(--tertiary))] to-transparent hidden max-md:block" />

            {processSteps.map((item, index) => {
              const Icon = processIcons[index];
              const isEven = index % 2 === 1;

              return (
                <div
                  key={item.step}
                  className="group/step relative flex flex-col items-center w-full max-md:items-start"
                >
                  {/* Timeline Node Block (Desktop Center Anchor, Mobile Left Anchor) */}
                  <div className="relative flex flex-col items-center justify-center h-14 w-full lg:mb-12 max-md:h-12 max-md:w-12 max-md:absolute max-md:-left-[2.2rem] max-md:-top-0.5">
                    {/* Inner glowing orbital circle */}
                    <div className="timeline-node z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--surface-container)] text-[var(--on-surface-dim)] shadow-[var(--glass-inner-shadow)] backdrop-blur-md transition-all duration-500 ease-out group-hover/step:scale-110 group-hover/step:border-[var(--primary)] group-hover/step:text-[var(--primary)] group-hover/step:shadow-[0_0_15px_color-mix(in_srgb,var(--primary)_25%,transparent)]">
                      <Icon size={16} stroke={1.5} />
                    </div>

                    {/* Glowing status dot */}
                    <span className="absolute bottom-1.5 right-1.5 z-20 h-2 w-2 rounded-full bg-[var(--secondary)] border border-[var(--surface)] shadow-[0_0_8px_var(--secondary)] animate-pulse hidden lg:block" />

                    {/* Vertical Connector Line stretching to staggered card */}
                    <div
                      className={cn(
                        "connector-line absolute top-10 w-[2px] bg-gradient-to-b from-[var(--glass-border)] to-transparent hidden lg:block",
                        isEven ? "h-[85px]" : "h-[45px]",
                      )}
                    />
                  </div>

                  {/* Card Section */}
                  <article
                    className={cn(
                      "process-staggered-card w-full relative overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--glass-inner-shadow)] p-7 transition-all duration-500 ease-out hover:border-[color-mix(in_srgb,var(--on-surface)_25%,transparent)] hover:shadow-[0_20px_50px_color-mix(in_srgb,var(--bg-deep)_16%,transparent)] hover:-translate-y-1 max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!pl-8 max-md:!pb-8 max-md:!pt-4 max-md:hover:translate-y-0 max-md:last:border-b-0",
                      isEven ? "lg:mt-16" : "lg:mt-6",
                    )}
                  >
                    {/* Background Backdrop step index number (Editorial look) */}
                    <span className="absolute -right-4 -bottom-10 font-serif text-[10rem] font-medium leading-none select-none pointer-events-none opacity-[0.03] text-[var(--on-surface-dim)] transition-all duration-700 group-hover/step:opacity-[0.05] group-hover/step:scale-105">
                      0{index + 1}
                    </span>

                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-4 max-md:mb-3">
                      <span className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[var(--secondary)] bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)] border border-[color-mix(in_srgb,var(--secondary)_16%,transparent)] px-2.5 py-0.5 rounded-full font-medium">
                        Phase 0{index + 1}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="relative z-10 flex flex-col justify-between">
                      <h3 className="title-serif text-[1.25rem] font-normal leading-tight tracking-tight text-[var(--on-surface)] mb-2.5 transition-colors duration-300 group-hover/step:text-[var(--primary)]">
                        {item.title}
                      </h3>
                      <p className="text-[0.84rem] leading-[1.68] text-[var(--on-surface-dim)] opacity-85 font-normal">
                        {item.body}
                      </p>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
