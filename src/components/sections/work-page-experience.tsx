"use client";

/**
 * src/components/sections/work-page-experience.tsx
 *
 * Flagship production-grade /work listing page experience:
 * - Single Flagship Spotlight Hero Card at top of page (index 0)
 * - Perfectly uniform 3-column grid for all subsequent projects
 * - Pill-based filter tabs (Service & Industry) with live counts
 * - Exact Decarding technique on Mobile (list style border-b), Full Glass Cards on Desktop
 * - Ultra-clean monochrome editorial styling (no sparkles, no neon color splashes)
 * - Power3 GSAP entrance animations & custom cursor hover cues
 */

import { IconArrowRight, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
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
  { label: "All Services", value: "all" },
  { label: "Web Apps", value: "custom-software" },
  { label: "SaaS Platforms", value: "saas-development" },
  { label: "Mobile Apps", value: "mobile-apps" },
  { label: "AI Systems", value: "ai-systems" },
  { label: "Enterprise Software", value: "enterprise-software" },
  { label: "APIs & Integrations", value: "apis-integrations" },
  { label: "Web3 / Blockchain", value: "blockchain" },
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
    <div className="mt-14 flex items-center justify-center gap-2">
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

  // Refined Power3 GSAP entrance animations
  useEffect(() => {
    if (!gridRef.current || paginatedProjects.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".work-card",
        { opacity: 0, y: 32, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.07,
          ease: "power3.out",
          delay: 0.04,
        },
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
        <PatternTexture opacity={0.04} />

        {/* Subtle top background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,color-mix(in_srgb,var(--surface-high)_12%,transparent),transparent)]"
        />

        <div className="relative z-[1] flex w-full flex-col pb-24 pt-28 lg:pt-32">
          {/* ── Hero Section ─────────────────────────────────────────── */}
          <section ref={heroRef} className="w-full px-5 sm:px-8 lg:px-10 mb-10">
            <div className="mx-auto w-full max-w-[92rem]">
              {/* Eyebrow */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...cosmicSpring, delay: 0 }}
                className="label-caps mb-4 flex items-center gap-2.5 text-[var(--on-surface-dim)]"
              >
                <span className="h-px w-6 bg-[var(--on-surface-dim)] opacity-40" />
                Portfolio Showcase · 2024–2026
              </motion.p>

              {/* Header Title & Counter Grid */}
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
                  <p className="font-mono text-[clamp(2.8rem,6vw,4.5rem)] font-medium leading-none tracking-tight text-[color-mix(in_srgb,var(--on-surface)_18%,transparent)]">
                    {formatIndex(filteredProjects.length)}
                  </p>
                  <p className="mt-3 max-w-xs text-[0.88rem] leading-[1.6] text-[var(--on-surface-dim)] lg:ml-auto">
                    Verified production software shipped across fintech, legal tech, SaaS,
                    logistics, and mobile.
                  </p>
                </motion.div>
              </div>

              {/* Stat strip */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...cosmicSpring, delay: 0.18 }}
                className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-[var(--glass-border)] pt-7"
              >
                {[
                  { value: "6+", label: "Key Verticals" },
                  { value: "34", label: "Shipped Products" },
                  { value: "100%", label: "Client Satisfaction" },
                  { value: "2024–", label: "Active Operations" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-baseline gap-2.5">
                    <span className="font-mono text-[1.2rem] font-medium text-[var(--on-surface)]">
                      {stat.value}
                    </span>
                    <span className="text-[0.75rem] font-mono text-[var(--on-surface-dim)] uppercase tracking-wider">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ── Filter Bar ─────────────────────────────────────────────── */}
          <div className="sticky top-[4.5rem] z-[40] w-full border-b border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] px-5 py-3.5 backdrop-blur-xl sm:px-8 lg:px-10 mb-10">
            <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
                          ? "border-[var(--on-surface)] bg-[var(--on-surface)] text-[var(--bg)] font-medium"
                          : "border-[var(--glass-border)] bg-transparent text-[var(--on-surface-dim)] hover:border-[var(--on-surface)] hover:text-[var(--on-surface)]",
                      )}
                    >
                      {filter.label}
                      <span className={cn("text-[0.65rem] opacity-60", isActive && "opacity-80")}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Vertical filter pills */}
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar lg:justify-end">
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
                          ? "border-[var(--on-surface)] bg-[var(--on-surface)] text-[var(--bg)] font-medium"
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

          {/* ── Showcase Section ────────────────────────────────────────── */}
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
                      Reset filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Showcase Container */}
              {paginatedProjects.length > 0 && (
                <div
                  ref={gridRef}
                  key={`${activeService}-${activeVertical}-${currentPage}`}
                  className={cn(
                    "flex flex-col gap-8 md:gap-8",
                    loading && "opacity-30 pointer-events-none transition-opacity duration-200",
                  )}
                >
                  {/* 1. SINGLE FLAGSHIP SPOTLIGHT HERO CARD (Top of Page 1) */}
                  {currentPage === 1 && (
                    <FlagshipHeroCard project={paginatedProjects[0]} index={0} />
                  )}

                  {/* 2. PERFECTLY UNIFORM 3-COLUMN GRID (All other projects) */}
                  <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-6">
                    {(currentPage === 1 ? paginatedProjects.slice(1) : paginatedProjects).map(
                      (project, index) => (
                        <UniformProjectCard
                          key={project.id}
                          index={
                            currentPage === 1 ? index + 1 : (currentPage - 1) * itemsPerPage + index
                          }
                          project={project}
                        />
                      ),
                    )}
                  </div>
                </div>
              )}

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
// Single Top Flagship Hero Showcase Card
// ─────────────────────────────────────────────────────────────────────────────

function FlagshipHeroCard({ project, index }: { project: WorkProject; index: number }) {
  return (
    <article className="work-card w-full">
      <Link
        href={`/work/${project.id}`}
        data-cursor-text="CASE STUDY"
        className={cn(
          "group/flagship block w-full overflow-hidden text-left transition-all duration-500 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--on-surface)]",
          // Desktop: Rich Glass Card Container
          "md:rounded-[2rem] md:border md:border-[var(--glass-border)] md:bg-[var(--glass-bg)] md:p-7 lg:p-9 md:backdrop-blur-xl md:shadow-[var(--glass-inner-shadow)]",
          "md:hover:border-[color-mix(in_srgb,var(--on-surface)_30%,transparent)] md:hover:shadow-[0_24px_64px_rgba(0,0,0,0.12)]",
          // Mobile: Decarding (border bottom list divider, no glass)
          "max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!py-8 max-md:!translate-y-0",
        )}
      >
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Column (7 cols): Artwork */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-deep)] lg:col-span-7">
            <Image
              src={project.image}
              alt={`${project.title} — Flagship case study`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-top transition-transform duration-700 group-hover/flagship:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Pulsing Dot Badge */}
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-1 font-mono text-[0.68rem] text-white backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>FLAGSHIP CASE STUDY</span>
              </span>
            </div>

            <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/60 px-3 py-1 font-mono text-[0.68rem] text-white backdrop-blur-md">
              {project.status}
            </span>
          </div>

          {/* Right Column (5 cols): Metadata & Narrative */}
          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[0.72rem] uppercase tracking-widest text-[var(--on-surface-dim)]">
                  {project.sectorLabel}
                </span>
                <span className="text-[var(--on-surface-dim)] opacity-40">•</span>
                <span className="font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
                  {formatIndex(index)}
                </span>
              </div>

              <h2 className="title-serif text-3xl sm:text-4xl font-normal text-[var(--on-surface)] leading-tight mb-4">
                {project.title}
              </h2>

              <p className="body-md text-[var(--on-surface-dim)] leading-relaxed mb-6 font-normal">
                {project.description}
              </p>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {project.metrics.slice(0, 4).map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border border-[var(--glass-border)] bg-[var(--surface-high)] p-3.5 max-md:bg-transparent"
                  >
                    <p className="font-mono text-[1.2rem] font-medium text-[var(--on-surface)]">
                      {m.value}
                    </p>
                    <p className="font-mono text-[0.65rem] uppercase tracking-wider text-[var(--on-surface-dim)] opacity-80 mt-1">
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Stack Tags */}
              <div className="flex flex-wrap gap-1.5 mb-8">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-[var(--outline)] bg-[var(--surface-high)] px-2.5 py-1 font-mono text-[0.72rem] text-[var(--on-surface-dim)] max-md:bg-transparent"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Read CTA */}
            <div className="flex items-center gap-2 pt-4 border-t border-[var(--glass-border)] text-[0.88rem] font-medium text-[var(--on-surface)] group-hover/flagship:translate-x-1 transition-transform max-md:border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)]">
              <span>Read Full Case Study</span>
              <IconArrowRight size={16} />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Uniform 3-Column Project Card (For all other items)
// ─────────────────────────────────────────────────────────────────────────────

function UniformProjectCard({ index, project }: { index: number; project: WorkProject }) {
  return (
    <article className="work-card flex h-full">
      <Link
        href={`/work/${project.id}`}
        data-cursor-text="EXPLORE"
        className={cn(
          "group/card flex w-full flex-col overflow-hidden text-left transition-all duration-500 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--on-surface)]",
          // Desktop: Full Rich Glass Card
          "md:rounded-[1.75rem] md:border md:border-[var(--glass-border)] md:bg-[var(--glass-bg)] md:p-6 md:backdrop-blur-md md:shadow-[var(--glass-inner-shadow)]",
          "md:hover:border-[color-mix(in_srgb,var(--on-surface)_30%,transparent)] md:hover:-translate-y-1 md:hover:shadow-[0_18px_48px_rgba(0,0,0,0.08)]",
          // Mobile: Decarding (border-bottom list item, no glass)
          "max-md:!rounded-none max-md:!border-x-0 max-md:!border-t-0 max-md:!border-b max-md:!border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:!bg-transparent max-md:!shadow-none max-md:!backdrop-blur-none max-md:!px-0 max-md:!py-8 max-md:last:!border-b-0 max-md:!translate-y-0",
        )}
      >
        {/* Artwork */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl md:rounded-[1.25rem]">
          <Image
            src={project.image}
            alt={`${project.title} preview`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover/card:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

          {/* Index & Status */}
          <span className="absolute left-3.5 top-3.5 rounded-lg border border-white/10 bg-black/50 px-2.5 py-0.5 font-mono text-[0.65rem] text-white/90 backdrop-blur-md">
            {formatIndex(index)}
          </span>

          <span className="absolute right-3.5 top-3.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-0.5 font-mono text-[0.65rem] text-white/90 backdrop-blur-md">
            {project.status}
          </span>

          {/* Title overlayed on image */}
          <div className="absolute bottom-0 left-0 w-full p-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-widest text-white/70 mb-1">
              {project.sectorLabel}
            </p>
            <h3 className="text-[1.15rem] font-medium text-white leading-tight">{project.title}</h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-col flex-1 max-md:pt-4">
          <p className="line-clamp-3 text-[0.88rem] text-[var(--on-surface-dim)] leading-[1.65] mb-4 font-normal">
            {project.description}
          </p>

          {/* Stack Tags */}
          <div className="flex flex-wrap gap-1.5 mt-auto mb-4">
            {project.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-[var(--outline)] bg-[var(--surface-high)] px-2 py-0.5 font-mono text-[0.68rem] text-[var(--on-surface-dim)] max-md:bg-transparent"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Footer Metric Row */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--glass-border)] max-md:border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)]">
            <div>
              <p className="font-mono text-[0.95rem] font-medium text-[var(--on-surface)]">
                {project.metric}
              </p>
              <p className="font-mono text-[0.62rem] uppercase tracking-wider text-[var(--on-surface-dim)] opacity-70 mt-0.5">
                {project.metricLabel}
              </p>
            </div>

            <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-all group-hover/card:border-[var(--on-surface)] group-hover/card:text-[var(--on-surface)]">
              <IconArrowRight size={14} className="-rotate-45" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
