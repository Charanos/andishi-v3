"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { showcaseProjects } from "@/content/landing";

gsap.registerPlugin(ScrollTrigger);

export function ProjectShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Elegant fade-up stagger for each project block
      (gsap.utils.toArray(".project-block") as Element[]).forEach((block) => {
        if (!block) return;
        gsap.fromTo(
          block,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: block,
              start: "top 85%",
            },
          },
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const featuredProject = showcaseProjects[0];
  const gridProjects = showcaseProjects.slice(1);

  return (
    <section
      ref={containerRef}
      id="work"
      className="relative isolate overflow-hidden bg-[var(--bg)] px-5 py-20 max-sm:py-14 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="relative z-[1] mx-auto max-w-[84rem]">
        {/* Header Section (Left Aligned) */}
        <div className="mb-20 flex flex-col items-start max-w-4xl max-md:mb-14">
          <p className="label-caps mb-4 flex items-center gap-3 text-[var(--tertiary)] font-medium">
            FEATURED WORK
            <span className="h-px w-10 bg-[var(--tertiary)]" />
          </p>
          <h2 className="title-serif text-[clamp(2.2rem,5vw,4rem)] font-normal leading-[0.96] tracking-tight text-[var(--on-surface)]">
            Products we have shipped
          </h2>
          <p className="body-md mt-5 max-w-2xl text-[var(--on-surface-dim)] font-normal">
            A selection of recent applications, platforms, and intelligent systems built for our
            clients.
          </p>
        </div>

        {/* Featured Flagship Project */}
        {featuredProject && (
          <div className="project-block flex flex-col gap-10 lg:gap-16 lg:flex-row items-center mb-28 md:rounded-[2.5rem] md:border md:border-[var(--glass-border)] md:bg-[var(--glass-bg)] md:shadow-[var(--glass-inner-shadow)] md:p-8 lg:p-12 hover:border-[color-mix(in_srgb,var(--tertiary)_30%,transparent)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all duration-500 max-md:border-b max-md:border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:pb-12 max-md:mb-16">
            {/* Image Side */}
            <div className="w-full lg:w-7/12 relative group">
              <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden border border-[var(--glass-border)] bg-[var(--surface-low)] shadow-[var(--glass-inner-shadow)] transition-all duration-700 ease-out hover:border-[color-mix(in_srgb,var(--on-surface)_15%,transparent)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] max-md:!rounded-[1.25rem]">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg)]/10 to-transparent z-10 pointer-events-none" />
                {featuredProject.image && (
                  <Image
                    src={featuredProject.image}
                    alt={featuredProject.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover object-top transition-transform duration-[3s] ease-out group-hover:scale-[1.03]"
                  />
                )}
              </div>
            </div>

            {/* Text Content Side */}
            <div className="w-full lg:w-5/12 flex flex-col justify-center">
              <p className="font-mono text-[0.68rem] tracking-[0.1em] text-[var(--tertiary)] uppercase font-medium mb-4 flex items-center gap-2">
                <span className="h-px w-5 bg-[var(--tertiary)] opacity-50" />
                {featuredProject.eyebrow}
              </p>

              <h3 className="text-[clamp(1.75rem,3vw,2.4rem)] font-normal leading-[1.05] tracking-tight text-[var(--on-surface)] mb-2">
                {featuredProject.title}
              </h3>
              <p className="text-[1.05rem] font-medium text-[var(--on-surface-dim)] mb-5">
                {featuredProject.accent}
              </p>

              <p className="text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)] font-normal mb-8 max-w-lg">
                {featuredProject.summary}
              </p>

              {/* Micro-grid of stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8 py-5 border-y border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)]">
                <div>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)] mb-1">
                    {featuredProject.resultLabel}
                  </p>
                  <p className="text-[1.25rem] font-mono tracking-tight text-[var(--tertiary)]">
                    {featuredProject.resultValue}
                  </p>
                  <p className="text-[0.7rem] text-[var(--on-surface-dim)] mt-0.5 leading-tight">
                    {featuredProject.resultContext}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)] mb-1">
                    Timeline
                  </p>
                  <p className="text-[0.92rem] text-[var(--on-surface)] mt-1">
                    {featuredProject.timeline}
                  </p>
                </div>
                <div className="max-sm:col-span-2">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)] mb-1">
                    Tech Stack
                  </p>
                  <p className="text-[0.82rem] text-[var(--on-surface-dim)] mt-1 leading-snug pr-4">
                    {featuredProject.stack}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2.5 mb-9">
                {featuredProject.tags.map((tag, i) => (
                  <span
                    key={tag}
                    className="rounded-full border px-3 py-1 font-mono text-[0.68rem]"
                    style={{
                      color: i === 0 ? "var(--on-surface)" : "var(--on-surface-dim)",
                      borderColor:
                        i === 0
                          ? "color-mix(in srgb, var(--on-surface) 15%, transparent)"
                          : "color-mix(in srgb, var(--on-surface) 8%, transparent)",
                      backgroundColor:
                        i === 0
                          ? "color-mix(in srgb, var(--on-surface) 4%, transparent)"
                          : "color-mix(in srgb, var(--surface) 30%, transparent)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/work"
                  className="inline-flex min-h-[2.4rem] items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-6 py-2.5 text-[0.88rem] font-medium text-[var(--bg)] shadow-md transition-all duration-300 hover:-translate-y-px hover:shadow-lg group/btn"
                >
                  View case study
                  <IconArrowRight
                    size={15}
                    stroke={2.5}
                    className="transition-transform duration-300 group-hover/btn:translate-x-1"
                  />
                </Link>
                <Link
                  href="/start-project"
                  className="inline-flex min-h-[2.4rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] px-6 py-2.5 text-[0.88rem] font-medium text-[var(--on-surface)] backdrop-blur-md transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_25%,transparent)]"
                >
                  Start a project
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Standard Grid for Remaining Projects */}
        {gridProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16 lg:gap-y-20">
            {gridProjects.map((project) => (
              <div
                key={project.title}
                className="project-block flex flex-col group md:rounded-[2rem] md:border md:border-[var(--glass-border)] md:bg-[var(--glass-bg)] md:shadow-[var(--glass-inner-shadow)] md:p-4 md:transition-all md:duration-500 md:hover:border-[color-mix(in_srgb,var(--tertiary)_30%,transparent)] md:hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] md:hover:-translate-y-1.5 max-md:border-b max-md:border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:pb-10 max-md:mb-10 max-md:last:border-0 max-md:last:pb-0 max-md:last:mb-0"
              >
                {/* Image */}
                <Link
                  href="/work"
                  className="block relative w-full aspect-[16/11] rounded-[1.5rem] md:rounded-[1.25rem] overflow-hidden max-md:border max-md:border-[var(--glass-border)] max-md:bg-[var(--surface-low)] max-md:shadow-[var(--glass-inner-shadow)] mb-6 md:mb-5 transition-all duration-700 ease-out"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg)]/10 to-transparent z-10 pointer-events-none" />
                  {project.image && (
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-top transition-transform duration-[3s] ease-out group-hover:scale-[1.03]"
                    />
                  )}
                </Link>

                {/* Content */}
                <div className="flex flex-col flex-1 md:px-2 md:pb-2">
                  <p className="font-mono text-[0.62rem] tracking-[0.12em] text-[var(--tertiary)] uppercase font-medium mb-3 flex items-center gap-2">
                    {project.eyebrow}
                  </p>
                  <h3 className="text-[1.45rem] font-medium leading-[1.2] tracking-tight text-[var(--on-surface)] mb-2">
                    <Link href="/work" className="hover:opacity-70 transition-opacity">
                      {project.title}
                    </Link>
                  </h3>
                  <p className="text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)] font-normal mb-6 line-clamp-3">
                    {project.summary}
                  </p>

                  {/* Tags - Pushed to bottom */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={tag}
                        className="rounded-full border px-3 py-1 font-mono text-[0.62rem]"
                        style={{
                          color: i === 0 ? "var(--on-surface)" : "var(--on-surface-dim)",
                          borderColor:
                            i === 0
                              ? "color-mix(in srgb, var(--on-surface) 15%, transparent)"
                              : "color-mix(in srgb, var(--on-surface) 8%, transparent)",
                          backgroundColor:
                            i === 0
                              ? "color-mix(in srgb, var(--on-surface) 4%, transparent)"
                              : "color-mix(in srgb, var(--surface) 30%, transparent)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="rounded-full border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] px-3 py-1 font-mono text-[0.62rem] text-[var(--on-surface-dim)]">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
