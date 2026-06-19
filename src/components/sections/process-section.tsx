"use client";

import React, { useRef, useEffect } from "react";
import {
  IconCalendarTime,
  IconFileText,
  IconCode,
  IconRocket,
  IconChevronRight,
} from "@tabler/icons-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { processSteps } from "@/content/landing";
import { SectionDivider } from "@/components/ui/section-divider";

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
      // Staggered fade-in-up entrance animation for the process steps
      gsap.fromTo(
        ".process-step-wrapper",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".process-grid",
            start: "top 80%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="process"
      className="relative isolate overflow-hidden bg-[color-mix(in_srgb,var(--bg-deep)_72%,var(--bg))] px-5 py-20 max-sm:py-14 sm:px-8 lg:px-10 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.11]"
        style={processTextureStyle}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_5%,transparent),transparent_18rem)]"
      />

      <div className="relative z-[1] mx-auto max-w-[92rem]">
        {/* Centered Header Section */}
        <div className="mb-16 text-center flex flex-col items-center max-w-4xl mx-auto">
          <p className="label-caps mb-4 flex items-center justify-center gap-3 text-[var(--on-surface-dim)] font-medium">
            <span className="h-px w-7 bg-[var(--on-surface)]" />
            HOW A PROJECT GOES
            <span className="h-px w-7 bg-[var(--on-surface)]" />
          </p>
          <h2 className="title-serif max-w-3xl text-[clamp(2rem,5.6vw,4.25rem)] font-normal leading-[0.96] tracking-tight text-[var(--on-surface)]">
            From brief to live product, here is exactly what happens
          </h2>
          <p className="body-md mt-5 max-w-2xl text-[var(--on-surface-dim)] font-normal">
            We scope in a single call, deliver in sprints, and ensure you own the outcome entirely.
          </p>
        </div>

        <SectionDivider />

        {/* Timeline Grid Container */}
        <div className="relative process-grid mt-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative z-10 max-md:gap-0 max-md:pl-4">
            {/* Mobile Vertical Line */}
            <div className="absolute left-[38px] top-8 bottom-8 w-px bg-[color-mix(in_srgb,var(--on-surface)_20%,transparent)] hidden max-md:block" />
            {processSteps.map((item, index) => {
              const Icon = processIcons[index];

              return (
                <div key={item.step} className="process-step-wrapper relative group/step flex flex-col h-full">
                  <article
                    className="process-card overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--glass-inner-shadow)] p-6 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-[color-mix(in_srgb,var(--on-surface)_40%,transparent)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] h-full flex flex-col justify-between max-md:!rounded-none max-md:!border-none max-md:!bg-transparent max-md:!shadow-none max-md:!px-0 max-md:!pl-[4.5rem] max-md:!py-6 max-md:hover:translate-y-0"
                  >
                    {/* Step Header Controls */}
                    <div className="relative z-10 flex items-center justify-between mb-5 max-md:mb-3 max-md:flex-row-reverse max-md:justify-end">
                      {/* Glowing rounded icon */}
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--on-surface)_20%,transparent)] bg-[var(--surface)] text-[var(--on-surface-dim)] shadow-sm backdrop-blur-md transition-all duration-300 group-hover/step:scale-105 group-hover/step:border-[var(--on-surface)] group-hover/step:text-[var(--tertiary)] max-md:absolute max-md:-left-[4.5rem] max-md:-top-1 max-md:z-10">
                        <Icon size={20} stroke={1.5} />
                      </span>

                      {/* Step pill badge */}
                      <span className="font-mono text-[0.7rem] tracking-[0.1em] text-[var(--tertiary)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] border border-[color-mix(in_srgb,var(--tertiary)_18%,transparent)] px-2.5 py-1 rounded-full uppercase font-medium">
                        Step {item.step}
                      </span>
                    </div>

                    {/* Step Title & Details */}
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div>
                        <h3 className="text-[1.125rem] font-medium tracking-tight text-[var(--on-surface)] mb-2.5">
                          {item.title}
                        </h3>
                        <p className="text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)] opacity-90 font-normal">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </article>

                  {/* Floating Chevron Connector centered in the gap between cards at icon height */}
                  {index < 3 && (
                    <div className="absolute top-[32px] -right-[22px] z-20 hidden lg:flex h-7 w-7 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--surface)] text-[var(--tertiary)] shadow-sm backdrop-blur-md transition-all duration-300 group-hover/step:translate-x-0.5 group-hover/step:border-[var(--on-surface)] pointer-events-none">
                      <IconChevronRight size={14} stroke={2} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
