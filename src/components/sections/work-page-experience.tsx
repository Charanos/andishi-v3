"use client";

/**
 * src/components/sections/work-page-experience.tsx
 *
 * Production-grade /work listing page.
 * - Cinematic full-bleed hero with editorial typography
 * - Pill-based inline filter chips (no hover-over dropdowns)
 * - Masonry-style bento grid with featured-first spanning layout
 * - Proper decarding on mobile (matching services-page pattern)
 * - Monochrome editorial card design — no neon metric colors
 * - Clean stat strip below hero
 * - GSAP stagger entrance animations
 */

import { IconArrowRight, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { workProjects, type WorkProject } from "@/content/work";
import { CustomCursorRegion } from "@/components/ui/custom-cursor-region";
import { cosmicSpring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { mapApiProjectToWorkProject } from "@/lib/work-mapper";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatIndex(n: number) {
  return String(n).padStart(2, "0");
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter configuration
// ─────────────────────────────────────────────────────────────────────────────

const serviceFilters = [
  { label: "All", value: "all" },
  { label: "Web Apps", value: "custom-software" },
  { label: "SaaS", value: "saas-development" },
  { label: "Mobile", value: "mobile-apps" },
  { label: "AI Systems", value: "ai-systems" },
  { label: "Enterprise", value: "enterprise-software" },
  { label: "APIs", value: "apis-integrations" },
  { label: "Web3", value: "blockchain" },
] as const;

const verticalFilters = [
  { label: "All Industries", value: "all" },
  { label: "Fintech", value: "fintech" },
  { label: "EdTech", value: "edtech" },
  { label: "Logistics", value: "logistics" },
  { label: "SaaS", value: "saas" },
  { label: "Retail", value: "retail" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Pattern texture
// ─────────────────────────────────────────────────────────────────────────────

function PatternTexture({ opacity = 0.04 }: { opacity?: number }) {
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

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const go = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => go(currentPage - 1)}
        disabled={currentPage === 1}
        className="grid h-10 w-10 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-all hover:border-[var(--on-surface)] hover:text-[var(--on-surface)] disabled:opacity-30"
        aria-label="Previous page"
      >
        <IconChevronLeft size={17} stroke={2} />
      </button>

      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1;
        const isActive = page === currentPage;

        if (
          page === 1 ||
          page === totalPages ||
          (page >= currentPage - 1 && page <= currentPage + 1)
        ) {
          return (
            <button
              key={page}
              onClick={() => go(page)}
              className={cn(
                "grid h-10 min-w-[2.5rem] place-items-center rounded-full border px-3 font-mono text-[0.82rem] transition-all",
                isActive
                  ? "border-[var(--on-surface)] bg-[var(--on-surface)] text-[var(--bg)]"
                  : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] hover:border-[var(--on-surface)] hover:text-[var(--on-surface)]",
              )}
            >
              {page}
            </button>
          );
        }
        if (page === currentPage - 2 || page === currentPage + 2) {
          return (
            <span key={page} className="text-[var(--on-surface-dim)] opacity-40">
              …
            </span>
          );
        }
        return null;
      })}

      <button
        type="button"
        onClick={() => go(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="grid h-10 w-10 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-all hover:border-[var(--on-surface)] hover:text-[var(--on-surface)] disabled:opacity-30"
        aria-label="Next page"
      >
        <IconChevronRight size={17} stroke={2} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main WorkPageExperience
// ─────────────────────────────────────────────────────────────────────────────

export function WorkPageExperience() {
  const [activeService, setActiveService] = useState<string>("all");
  const [activeVertical, setActiveVertical] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  const [dbProjects, setDbProjects] = useState<WorkProject[]>([]);
  const [loading, setLoading] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Fetch from API (DB-backed projects)
  useEffect(() => {
    async function fetchWork() {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (activeService !== "all") query.set("service", activeService);
        if (activeVertical !== "all") query.set("vertical", activeVertical);

        const res = await fetch(`/api/work?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.work && data.work.length > 0) {
            setDbProjects(data.work.map(mapApiProjectToWorkProject));
          } else {
            setDbProjects([]);
          }
        }
      } catch (err) {
        console.error("Error fetching work projects:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWork();
  }, [activeService, activeVertical]);

  const filteredProjects = useMemo(() => {
    if (dbProjects.length > 0) return dbProjects;
    return workProjects.filter((project) => {
      const matchService =
        activeService === "all" ||
        project.tags.some((t) => t.toLowerCase().includes(activeService)) ||
        project.sector === activeService;
      const matchVertical = activeVertical === "all" || project.sector === activeVertical;
      return matchService && matchVertical;
    });
  }, [dbProjects, activeService, activeVertical]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage]);

  // GSAP stagger entrance for cards
  useEffect(() => {
    if (!gridRef.current || paginatedProjects.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".work-card",
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", delay: 0.05 },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [paginatedProjects, loading]);

  const countForService = (val: string) => {
    const pool = dbProjects.length > 0 ? dbProjects : workProjects;
    if (val === "all") return pool.length;
    return pool.filter((p) => p.tags.some((t) => t.toLowerCase().includes(val)) || p.sector === val)
      .length;
  };

  const countForVertical = (val: string) => {
    const pool = dbProjects.length > 0 ? dbProjects : workProjects;
    if (val === "all") return pool.length;
    return pool.filter((p) => p.sector === val).length;
  };

  return (
    <main className="relative isolate overflow-visible bg-[var(--bg)]">
      <CustomCursorRegion className="relative isolate">
        <PatternTexture opacity={0.05} />

        {/* Radial glow background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,color-mix(in_srgb,var(--surface-high)_12%,transparent),transparent)]"
        />

        <div className="relative z-[1] flex w-full flex-col pb-24 pt-28 lg:pt-32">
          {/* ── Hero Section ─────────────────────────────────────────── */}
          <section ref={heroRef} className="w-full px-5 sm:px-8 lg:px-10 mb-12">
            <div className="mx-auto w-full max-w-[92rem]">
              {/* Eyebrow */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...cosmicSpring, delay: 0 }}
                className="label-caps mb-5 flex items-center gap-2.5 text-[var(--on-surface-dim)]"
              >
                <span className="h-px w-6 bg-[var(--on-surface-dim)] opacity-40" />
                Selected work · 2024–2026
              </motion.p>

              {/* Two-column hero layout */}
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.06 }}
                  className="title-serif text-[clamp(3.2rem,7.5vw,5.5rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)]"
                >
                  Our Work.
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.12 }}
                  className="lg:text-right"
                >
                  <p className="font-mono text-[clamp(2.8rem,6vw,4.5rem)] font-medium leading-none tracking-tight text-[color-mix(in_srgb,var(--on-surface)_15%,transparent)]">
                    {formatIndex(filteredProjects.length)}
                  </p>
                  <p className="mt-3 max-w-xs text-[0.88rem] leading-[1.6] text-[var(--on-surface-dim)] lg:ml-auto">
                    Software shipped across fintech, SaaS, logistics, AI integrations, and mobile.
                  </p>
                </motion.div>
              </div>

              {/* Stat strip */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...cosmicSpring, delay: 0.18 }}
                className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-[var(--glass-border)] pt-8"
              >
                {[
                  { value: "6+", label: "Industries" },
                  { value: "34", label: "Projects shipped" },
                  { value: "100%", label: "Client retention" },
                  { value: "2024–", label: "Active since" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-baseline gap-2">
                    <span className="font-mono text-[1.2rem] font-medium text-[var(--on-surface)]">
                      {stat.value}
                    </span>
                    <span className="text-[0.75rem] text-[var(--on-surface-dim)]">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ── Sticky Filter Bar ─────────────────────────────────────── */}
          <div className="sticky top-[4.5rem] z-[40] w-full border-b border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] px-5 py-3.5 backdrop-blur-xl sm:px-8 lg:px-10 mb-8">
            <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Service filter pills */}
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar">
                {serviceFilters.map((filter) => {
                  const count = countForService(filter.value);
                  const isActive = activeService === filter.value;
                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => {
                        setActiveService(filter.value);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-[0.75rem] transition-all duration-200 whitespace-nowrap shrink-0",
                        isActive
                          ? "border-[var(--on-surface)] bg-[var(--on-surface)] text-[var(--bg)]"
                          : "border-[var(--glass-border)] bg-transparent text-[var(--on-surface-dim)] hover:border-[var(--on-surface)] hover:text-[var(--on-surface)]",
                      )}
                    >
                      {filter.label}
                      <span className={cn("text-[0.65rem] opacity-60", isActive && "opacity-70")}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Vertical filter pills */}
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar sm:justify-end">
                {verticalFilters.map((filter) => {
                  const count = countForVertical(filter.value);
                  const isActive = activeVertical === filter.value;
                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => {
                        setActiveVertical(filter.value);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-[0.75rem] transition-all duration-200 whitespace-nowrap shrink-0",
                        isActive
                          ? "border-[var(--on-surface)] bg-[var(--on-surface)] text-[var(--bg)]"
                          : "border-[var(--glass-border)] bg-transparent text-[var(--on-surface-dim)] hover:border-[var(--on-surface)] hover:text-[var(--on-surface)]",
                      )}
                    >
                      {filter.label}
                      <span className="text-[0.65rem] opacity-60">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Project Grid ────────────────────────────────────────────── */}
          <section className="w-full px-5 sm:px-8 lg:px-10">
            <div className="mx-auto w-full max-w-[92rem]">
              {/* Empty state */}
              <AnimatePresence mode="wait">
                {filteredProjects.length === 0 && !loading && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="py-24 text-center"
                  >
                    <p className="text-[0.9rem] text-[var(--on-surface-dim)]">
                      No projects match this filter combination.
                    </p>
                    <button
                      onClick={() => {
                        setActiveService("all");
                        setActiveVertical("all");
                      }}
                      className="mt-4 font-mono text-[0.82rem] text-[var(--on-surface)] underline underline-offset-4"
                    >
                      Clear filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grid */}
              <div
                ref={gridRef}
                key={`${activeService}-${activeVertical}-${currentPage}`}
                className={cn(
                  "grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-6 grid-flow-dense",
                  loading && "opacity-30 pointer-events-none transition-opacity duration-200",
                )}
              >
                {paginatedProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    index={(currentPage - 1) * itemsPerPage + index}
                    project={project}
                  />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </section>
        </div>
      </CustomCursorRegion>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Project Card
// ─────────────────────────────────────────────────────────────────────────────

function ProjectCard({ index, project }: { index: number; project: WorkProject }) {
  const isFeatured = project.featured;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <article ref={ref} className={cn("work-card", isFeatured ? "md:col-span-2 lg:col-span-2" : "")}>
      <Link
        href={`/work/${project.id}`}
        data-cursor-text="VIEW"
        className={cn(
          // Desktop: glass card
          "group/card flex w-full overflow-hidden text-left transition-all duration-500 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--on-surface)] focus-visible:ring-offset-2",
          "md:rounded-[1.75rem] md:border md:border-[var(--glass-border)] md:bg-[var(--glass-bg)] md:shadow-[var(--glass-inner-shadow)] md:backdrop-blur-md",
          "md:hover:border-[color-mix(in_srgb,var(--on-surface)_30%,transparent)] md:hover:-translate-y-[3px] md:hover:shadow-[0_22px_56px_color-mix(in_srgb,var(--bg-deep)_16%,transparent)]",
          // Mobile: decarding (list-style separator, no glass)
          "border-b border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] py-8 last:border-b-0",
          "md:border-0 md:py-0",
          isFeatured ? "flex-col lg:flex-row" : "flex-col",
        )}
      >
        {/* Image */}
        <div
          className={cn(
            "relative shrink-0 overflow-hidden",
            "rounded-[1.25rem] md:rounded-none",
            isFeatured
              ? "aspect-[16/10] w-full lg:aspect-auto lg:h-full lg:w-[55%] lg:min-h-[22rem]"
              : "aspect-[4/3] w-full",
          )}
        >
          <Image
            src={project.image}
            alt={`${project.title} — Andishi case study`}
            fill
            sizes={
              isFeatured
                ? "(min-width: 1024px) 50vw, 100vw"
                : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            }
            className="object-cover transition-transform duration-700 group-hover/card:scale-[1.04]"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          {/* Index badge */}
          <span className="absolute left-4 top-4 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1 font-mono text-[0.66rem] font-medium tracking-tight text-white/90 backdrop-blur-xl">
            {formatIndex(index)}
          </span>

          {/* Status badge */}
          <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 font-mono text-[0.64rem] font-medium text-white/90 backdrop-blur-xl">
            {project.status}
          </span>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 w-full p-5">
            <p className="mb-1.5 font-mono text-[0.68rem] uppercase tracking-widest text-white/60">
              {project.sectorLabel}
            </p>
            <h2
              className={cn(
                "font-medium leading-tight tracking-tight text-white",
                isFeatured ? "text-[clamp(1.5rem,3vw,2rem)]" : "text-[1.2rem]",
              )}
            >
              {project.title}
            </h2>
          </div>
        </div>

        {/* Content area */}
        <div
          className={cn(
            "flex flex-col flex-1",
            isFeatured ? "p-5 sm:p-6 lg:w-[45%] lg:p-8 lg:justify-center" : "p-5 sm:p-6",
            // On mobile no padding on sides (decarding style)
            "max-md:px-0 max-md:pt-4",
          )}
        >
          {/* Description */}
          <p
            className={cn(
              "text-[var(--on-surface-dim)] leading-[1.65]",
              isFeatured ? "text-[0.95rem]" : "line-clamp-3 text-[0.88rem]",
            )}
          >
            {project.description}
          </p>

          {/* Featured: Metrics grid */}
          {isFeatured && (
            <div className="mt-7 grid grid-cols-2 gap-0 overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)]">
              {project.metrics.slice(0, 4).map((metric, mi) => (
                <div
                  key={metric.label}
                  className={cn(
                    "px-5 py-4 border-[var(--glass-border)]",
                    mi % 2 === 0 ? "border-r" : "",
                    mi < 2 ? "border-b" : "",
                  )}
                >
                  <p className="font-mono text-[1.1rem] font-medium tracking-tight text-[var(--on-surface)]">
                    {metric.value}
                  </p>
                  <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[var(--on-surface-dim)] opacity-70">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Stack tags */}
          <div className={cn("flex flex-wrap gap-1.5", isFeatured ? "mt-7" : "mt-auto pt-5")}>
            {project.tags.slice(0, isFeatured ? 5 : 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--outline)] bg-[var(--glass-bg)] px-2.5 py-1 font-mono text-[0.7rem] text-[var(--on-surface-dim)]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Footer: key metric + arrow */}
          <div
            className={cn(
              "flex items-center justify-between border-t border-[var(--glass-border)]",
              isFeatured ? "mt-7 pt-6" : "mt-5 pt-5",
              "max-md:border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)]",
            )}
          >
            <div>
              <p className="font-mono text-[1rem] font-medium tracking-tight text-[var(--on-surface)]">
                {project.metric}
              </p>
              <p className="mt-0.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[var(--on-surface-dim)] opacity-70">
                {project.metricLabel}
              </p>
            </div>

            <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-all duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:border-[var(--on-surface)] group-hover/card:text-[var(--on-surface)]">
              <IconArrowRight size={14} stroke={1.8} className="-rotate-45" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
