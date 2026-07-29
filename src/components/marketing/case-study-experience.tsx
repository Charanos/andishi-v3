"use client";

/**
 * src/components/marketing/case-study-experience.tsx
 *
 * Flagship full-page case study experience for /work/[slug].
 * Production-grade fluid editorial document layout:
 * - Uncarded cinematic hero directly on page surface
 * - Top navigation bar with left-aligned back link & status badges for visual harmony with site navbar
 * - Interactive Hero Photobox Carousel showcase (slides through all project images with prev/next controls & lightbox modal)
 * - Stat strip divider showcasing key outcome metrics with clean font-mono styling (no dotted lines)
 * - Fluid editorial document structure with hairline dividers (no blocky card soup)
 * - Numbered engineering process timeline with node indicators
 * - Clean feature breakdown & masonry image gallery
 * - Recharts metric curve visualization with interactive Tooltips
 * - Sticky sidebar info column with tech stack summary & quick CTAs
 * - Bottom CTA section with signature FinalCtaArtwork background graphics
 * - Full admin inline-edit compatibility (isAdmin=true)
 */

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import {
  IconArrowRight,
  IconArrowLeft,
  IconExternalLink,
  IconBrandGithub,
  IconBrandWhatsapp,
  IconQuote,
  IconCalendar,
  IconTrash,
  IconChevronUp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconChartBar,
  IconTerminal2,
  IconMapPin,
  IconMaximize,
  IconX,
  IconTarget,
  IconCpu,
  IconLayersIntersect,
  IconShieldCheck,
} from "@tabler/icons-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";

import { CustomCursorRegion } from "@/components/ui/custom-cursor-region";
import { Tooltip } from "@/components/ui/tooltip";
import { InlineEditField } from "@/components/ui/inline-edit-field";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import { ToastProvider, useToast } from "@/components/ui/toast-provider";
import { CaseStudyGallery } from "@/components/marketing/case-study-gallery";
import { CaseStudyShareBar } from "@/components/marketing/case-study-share-bar";
import { CaseStudyAdminBar, type SaveStatus } from "@/components/marketing/case-study-admin-bar";
import { FinalCtaArtwork } from "@/components/ui/final-cta-artwork";

import { cosmicSpring } from "@/lib/motion";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import type { CaseStudyProject, CaseStudyResultMetric } from "@/types/case-study";

// ─────────────────────────────────────────────────────────────────────────────
// Types & Props
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  project: CaseStudyProject;
  related: CaseStudyProject[];
  isAdmin?: boolean;
  projectId?: string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Pattern texture (background decoration)
// ─────────────────────────────────────────────────────────────────────────────

function PatternTexture({
  className = "",
  opacity = 0.04,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
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
// Recharts Data Viz Component
// ─────────────────────────────────────────────────────────────────────────────

function CaseStudyMetricsChart({ results }: { results: CaseStudyResultMetric[] }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted || !results.length) return null;

  const chartData = results.map((r, index) => {
    const rawNum = parseFloat(r.metric.replace(/[^0-9.]/g, ""));
    const val = !isNaN(rawNum) && rawNum > 0 ? rawNum : (index + 1) * 35;
    return {
      name: r.label,
      metricVal: val,
      displayMetric: r.metric,
      context: r.context ?? "Measured impact post-launch",
    };
  });

  return (
    <div className="mt-8 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconChartBar size={18} className="text-[var(--on-surface-dim)]" />
          <h4 className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--on-surface-dim)] font-medium">
            Impact Curve & Performance Data
          </h4>
        </div>
        <span className="rounded-full border border-[var(--outline)] bg-[var(--surface-high)] px-3 py-1 font-mono text-[0.68rem] text-[var(--on-surface-dim)]">
          Verified Performance
        </span>
      </div>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--on-surface)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--on-surface)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="var(--on-surface-dim)" fontSize={11} tickLine={false} />
            <YAxis stroke="var(--on-surface-dim)" fontSize={11} tickLine={false} />
            <RechartsTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--surface-high)] p-3.5 text-[0.8rem] shadow-xl backdrop-blur-xl">
                      <p className="font-mono text-[var(--on-surface-dim)]">{data.name}</p>
                      <p className="font-mono text-[1.25rem] text-[var(--on-surface)]">
                        {data.displayMetric}
                      </p>
                      {data.context && (
                        <p className="text-[0.72rem] text-[var(--on-surface-dim)]">
                          {data.context}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="metricVal"
              stroke="var(--on-surface)"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorMetric)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin autosave hook
// ─────────────────────────────────────────────────────────────────────────────

function useAutosave(projectId: string | null) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<NodeJS.Timeout | number | null>(null);
  const { toast } = useToast();

  const save = useCallback(
    async (patch: Record<string, unknown>) => {
      if (!projectId) return;
      if (timerRef.current) clearTimeout(timerRef.current);

      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/work/manage/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error("Save failed");
        setSaveStatus("saved");
        timerRef.current = setTimeout(() => setSaveStatus("idle"), 2500);
      } catch {
        setSaveStatus("error");
        toast("Autosave failed — check your connection", "error");
        timerRef.current = setTimeout(() => setSaveStatus("idle"), 4000);
      }
    },
    [projectId, toast],
  );

  return { saveStatus, save };
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner Component
// ─────────────────────────────────────────────────────────────────────────────

function CaseStudyExperienceInner({ project, isAdmin, projectId }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { saveStatus, save } = useAutosave(projectId ?? null);

  // Collect all images for the Photobox Carousel & Lightbox
  const allImages = [
    { url: project.coverImageUrl, title: `${project.title} — Main Overview` },
    ...project.gallery.map((g) => ({ url: g.url, title: g.alt || `${project.title} preview` })),
  ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  }, [allImages.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  }, [allImages.length]);

  // GSAP parallax on hero artwork
  useGSAP(
    () => {
      if (prefersReducedMotion || !heroRef.current) return;
      const img = heroRef.current.querySelector(".hero-parallax-img");
      if (!img) return;
      gsap.to(img, {
        y: "10%",
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: heroRef },
  );

  // Publish handler
  const handlePublish = useCallback(async () => {
    if (!projectId) return [];
    const res = await fetch(`/api/work/manage/${projectId}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      toast("Case study published!", "success");
      return [];
    }
    const data = await res.json().catch(() => ({}));
    if (res.status === 400 && data.errors) {
      return (data.errors as Array<{ path: string[]; message: string }>).map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
    }
    toast("Publish failed — try again", "error");
    return [];
  }, [projectId, toast]);

  // Archive handler
  const handleArchive = useCallback(async () => {
    if (!projectId) return;
    const res = await fetch(`/api/work/manage/${projectId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true }),
    });
    if (res.ok) {
      toast("Case study archived", "success");
    } else {
      toast("Archive failed — try again", "error");
    }
  }, [projectId, toast]);

  // WhatsApp CTA
  const whatsappUrl = buildWhatsAppUrl(project.sector, {
    context: `case study: ${project.title} (${project.sectorLabel})`,
  });

  return (
    <CustomCursorRegion className="min-h-screen pb-24">
      {/* Admin Control Bar */}
      {isAdmin && projectId && (
        <CaseStudyAdminBar
          projectTitle={project.title}
          caseStudyStatus={project.caseStudyStatus}
          saveStatus={saveStatus}
          onPublish={handlePublish}
          onArchive={handleArchive}
        />
      )}

      <main className="relative isolate overflow-visible bg-[var(--bg)]">
        <PatternTexture opacity={0.03} />

        {/* Ambient Top Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,color-mix(in_srgb,var(--surface-high)_12%,transparent),transparent)]"
        />

        <div className="relative z-[1] mx-auto w-full max-w-[92rem] px-5 sm:px-8 lg:px-10 pb-24 pt-28 lg:pt-32">
          {/* Top Bar: Back Link & Status Badges (Left-Aligned for Navbar Visual Harmony) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={cosmicSpring}
            className="flex flex-wrap items-center gap-3 mb-10"
          >
            <Link
              href="/work"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-1.5 font-mono text-[0.78rem] text-[var(--on-surface-dim)] backdrop-blur-xl transition-all duration-300 hover:border-[var(--on-surface)] hover:text-[var(--on-surface)]"
            >
              <IconArrowLeft size={14} />
              <span>Back to work index</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950 px-3.5 py-1 font-mono text-[0.7rem] uppercase tracking-wider text-emerald-200 shadow-sm dark:bg-emerald-950/80 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {project.status.toUpperCase()}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--surface-high)] px-3.5 py-1 font-mono text-[0.68rem] uppercase tracking-wider text-[var(--on-surface-dim)]">
              {project.sectorLabel}
            </span>
          </motion.div>

          {/* ── Uncarded Cinematic Hero Section ───────────────────────────── */}
          <div ref={heroRef} className="w-full mb-12">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              {/* Left Column (7 cols): Narrative & Metadata */}
              <div className="lg:col-span-7">
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.04 }}
                  className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--on-surface-dim)] mb-3 flex items-center gap-2"
                >
                  <span className="h-px w-6 bg-[var(--on-surface-dim)] opacity-40" />
                  {project.sectorLabel}
                  {project.clientName && (
                    <>
                      <span className="opacity-40">•</span>
                      <span>{project.clientName}</span>
                    </>
                  )}
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.08 }}
                  className="title-serif text-[clamp(3rem,6.5vw,5.2rem)] font-normal leading-[0.96] tracking-tight text-[var(--on-surface)] mb-5"
                >
                  {project.title}
                </motion.h1>

                {isAdmin ? (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...cosmicSpring, delay: 0.12 }}
                    className="mb-8"
                  >
                    <InlineEditField
                      value={project.tagline ?? ""}
                      onChange={(val) => save({ tagline: val })}
                      label="tagline"
                      mode="text"
                      placeholder="Add a one-sentence value proposition tagline…"
                      maxLength={200}
                      readClassName="body-md text-[1.12rem] leading-[1.65] text-[var(--on-surface-dim)] font-normal"
                    />
                  </motion.div>
                ) : project.tagline ? (
                  <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...cosmicSpring, delay: 0.12 }}
                    className="body-md text-[1.12rem] leading-[1.65] text-[var(--on-surface-dim)] max-w-2xl font-normal mb-8"
                  >
                    {project.tagline}
                  </motion.p>
                ) : null}

                {/* Spec Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.16 }}
                  className="flex flex-wrap gap-2.5 mb-8"
                >
                  {project.timeline && (
                    <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 font-mono text-[0.78rem] text-[var(--on-surface-dim)] backdrop-blur-md">
                      <IconCalendar size={14} className="text-[var(--on-surface)] opacity-80" />
                      {project.timeline} build
                    </span>
                  )}
                  {project.clientName && (
                    <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 font-mono text-[0.78rem] text-[var(--on-surface-dim)] backdrop-blur-md">
                      <IconMapPin size={14} className="text-[var(--on-surface)] opacity-80" />
                      {project.clientName}
                    </span>
                  )}
                  {project.stackTags.slice(0, 6).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-xl border border-[var(--outline)] bg-[var(--surface-high)] px-3 py-2 font-mono text-[0.78rem] text-[var(--on-surface-dim)]"
                    >
                      {tag}
                    </span>
                  ))}
                </motion.div>

                {/* Primary Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...cosmicSpring, delay: 0.2 }}
                  className="flex flex-wrap items-center gap-3"
                >
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-full bg-[var(--on-surface)] px-6 py-3 text-[0.88rem] font-medium text-[var(--bg)] shadow-[var(--cta-shadow)] hover:opacity-90 transition-all cursor-pointer"
                  >
                    <IconBrandWhatsapp size={18} />
                    <span>Start a project like this</span>
                  </a>

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-3 text-[0.88rem] font-medium text-[var(--on-surface)] backdrop-blur-xl hover:border-[var(--on-surface)] transition-all cursor-pointer"
                    >
                      <IconExternalLink size={16} />
                      <span>Live demo</span>
                    </a>
                  )}

                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-3 text-[0.88rem] font-medium text-[var(--on-surface)] backdrop-blur-xl hover:border-[var(--on-surface)] transition-all cursor-pointer"
                    >
                      <IconBrandGithub size={16} />
                      <span>Source code</span>
                    </a>
                  )}
                </motion.div>
              </div>

              {/* Right Column (5 cols): Photobox Carousel Showcase & Share Bar */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...cosmicSpring, delay: 0.12 }}
                  className="group relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-container-low)] shadow-2xl transition-all duration-500 hover:border-[var(--on-surface)]"
                >
                  <div
                    onClick={() => setLightboxOpen(true)}
                    className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden bg-[var(--bg-deep)]"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setLightboxOpen(true);
                    }}
                    aria-label="Expand case study preview image"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSlideIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={allImages[currentSlideIndex].url}
                          alt={allImages[currentSlideIndex].title}
                          fill
                          priority={currentSlideIndex === 0}
                          className="hero-parallax-img object-cover object-top transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 45vw"
                        />
                      </motion.div>
                    </AnimatePresence>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Carousel Nav Arrows */}
                    {allImages.length > 1 && (
                      <div
                        className="absolute inset-x-3 top-1/2 z-20 flex -translate-y-1/2 justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={prevSlide}
                          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black/80"
                          aria-label="Previous slide"
                        >
                          <IconChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={nextSlide}
                          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black/80"
                          aria-label="Next slide"
                        >
                          <IconChevronRight size={18} />
                        </button>
                      </div>
                    )}

                    {/* Lightbox & Slide Counter Badge Overlay */}
                    <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3.5 py-1.5 font-mono text-[0.72rem] text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
                      {allImages.length > 1 && (
                        <>
                          <span className="opacity-90">
                            {String(currentSlideIndex + 1).padStart(2, "0")} /{" "}
                            {String(allImages.length).padStart(2, "0")}
                          </span>
                          <span className="opacity-40">•</span>
                        </>
                      )}
                      <span className="flex items-center gap-1">
                        <IconMaximize size={13} />
                        <span>Expand preview</span>
                      </span>
                    </div>

                    {/* Admin Image Upload Zone */}
                    {isAdmin && projectId && (
                      <div
                        className="absolute top-3 right-3 z-20 w-48"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ImageUploadZone
                          projectId={projectId}
                          field="cover"
                          label="Upload cover image"
                          onSuccess={(url) => save({ coverImageUrl: url })}
                          className="opacity-80 hover:opacity-100 transition-opacity"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Share Strip */}
                <div className="flex items-center justify-between gap-3 px-1 py-2">
                  <span className="font-mono text-[0.72rem] uppercase tracking-wider text-[var(--on-surface-dim)]">
                    Share Showcase
                  </span>
                  <CaseStudyShareBar
                    slug={project.slug}
                    title={project.title}
                    sector={project.sector}
                    sectorLabel={project.sectorLabel}
                    isAdmin={isAdmin}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Stat Strip Divider (Clean Monospace Typography, No Dotted Underlines) ───── */}
          <section
            aria-label="Key project statistics"
            className="w-full border-y border-[var(--glass-border)] py-7 mb-14"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {project.results.length > 0 ? (
                project.results.slice(0, 4).map((stat) => (
                  <div key={stat.id} className="flex flex-col">
                    {stat.context ? (
                      <Tooltip content={stat.context}>
                        <span className="font-mono text-[1.5rem] sm:text-[1.75rem] font-medium text-[var(--on-surface)] cursor-help">
                          {stat.metric}
                        </span>
                      </Tooltip>
                    ) : (
                      <span className="font-mono text-[1.5rem] sm:text-[1.75rem] font-medium text-[var(--on-surface)]">
                        {stat.metric}
                      </span>
                    )}
                    <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[var(--on-surface-dim)] opacity-80 mt-1">
                      {stat.label}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex flex-col">
                    <span className="font-mono text-[1.5rem] sm:text-[1.75rem] font-medium text-[var(--on-surface)]">
                      {project.timeline || "Engineered"}
                    </span>
                    <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[var(--on-surface-dim)] opacity-80 mt-1">
                      Delivery speed
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[1.5rem] sm:text-[1.75rem] font-medium text-[var(--on-surface)]">
                      100%
                    </span>
                    <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[var(--on-surface-dim)] opacity-80 mt-1">
                      Production ready
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[1.5rem] sm:text-[1.75rem] font-medium text-[var(--on-surface)]">
                      Full Stack
                    </span>
                    <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[var(--on-surface-dim)] opacity-80 mt-1">
                      Architecture
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[1.5rem] sm:text-[1.75rem] font-medium text-[var(--on-surface)]">
                      Verified
                    </span>
                    <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[var(--on-surface-dim)] opacity-80 mt-1">
                      Quality Bar
                    </span>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ── Fluid Editorial Document Layout ───────────────────────────── */}
          <section className="w-full grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
            {/* Main Narrative Column */}
            <div className="flex flex-col gap-12">
              {/* Executive Overview & Problem Context */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--glass-border)] bg-[var(--surface-high)] text-[var(--on-surface)]">
                    <IconTarget size={16} />
                  </span>
                  <h2 className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--on-surface-dim)] font-medium">
                    Executive Overview & Problem Context
                  </h2>
                </div>

                <div className="text-[1.08rem] leading-[1.8] text-[var(--on-surface-dim)] font-normal">
                  {isAdmin ? (
                    <InlineEditField
                      value={project.challenge ?? ""}
                      onChange={(val) => save({ challenge: val })}
                      label="challenge"
                      placeholder="Describe the problem, bottlenecks, and legacy pain points…"
                      readClassName="body-lg text-[var(--on-surface)] leading-relaxed"
                    />
                  ) : (
                    <p className="body-lg text-[var(--on-surface)] leading-relaxed font-normal">
                      {project.challenge || project.summary}
                    </p>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--glass-border)]">
                  <div className="flex items-center gap-2">
                    <IconTerminal2 size={15} className="text-[var(--on-surface-dim)]" />
                    <span className="font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
                      Shipped & Verified by Andishi Core Engineering
                    </span>
                  </div>
                  <span className="font-mono text-[0.68rem] text-[var(--on-surface-dim)] uppercase tracking-wider">
                    {project.sectorLabel}
                  </span>
                </div>
              </div>

              {/* Client Feedback OR Core Deliverables */}
              <div className="border-t border-[var(--glass-border)] pt-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--glass-border)] bg-[var(--surface-high)] text-[var(--on-surface)]">
                    {project.testimonial ? (
                      <IconQuote size={16} />
                    ) : (
                      <IconLayersIntersect size={16} />
                    )}
                  </span>
                  <h2 className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--on-surface-dim)] font-medium">
                    {project.testimonial
                      ? "Client Feedback & Validation"
                      : "Platform Deliverables & Scope"}
                  </h2>
                </div>

                {project.testimonial ? (
                  <blockquote className="relative border-l-2 border-[var(--on-surface)] pl-6 py-2">
                    <p className="body-md italic text-[1.12rem] leading-relaxed text-[var(--on-surface)] mb-4">
                      &ldquo;{project.testimonial.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      {project.testimonial.authorAvatarUrl && (
                        <Image
                          src={project.testimonial.authorAvatarUrl}
                          alt={project.testimonial.authorName}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full object-cover border border-[var(--glass-border)]"
                        />
                      )}
                      <div>
                        <cite className="text-[0.88rem] font-medium text-[var(--on-surface)] not-italic block">
                          {project.testimonial.authorName}
                        </cite>
                        <span className="text-[0.76rem] text-[var(--on-surface-dim)]">
                          {project.testimonial.authorTitle}
                        </span>
                      </div>
                    </div>
                  </blockquote>
                ) : (
                  <div className="grid gap-6 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--glass-border)]">
                    {[
                      { num: "01", text: "Role-Based Access Control (Patient & Legal Portals)" },
                      {
                        num: "02",
                        text: "Programmatic HITECH Requests & OCR Identity Verification",
                      },
                      {
                        num: "03",
                        text: "HIPAA-Compliant Encrypted Medical Record Storage & Audit Logs",
                      },
                    ].map((item, idx) => (
                      <div
                        key={item.num}
                        className={cn(
                          "flex flex-col justify-between",
                          idx > 0 && "md:pl-6 pt-4 md:pt-0",
                        )}
                      >
                        <p className="font-mono text-[0.78rem] font-medium text-[var(--on-surface)] mb-2">
                          {item.num}
                        </p>
                        <p className="text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)] font-normal">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Engineering Approach Timeline */}
              {(project.approachSteps.length > 0 || isAdmin) && (
                <div id="approach" className="border-t border-[var(--glass-border)] pt-10">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--glass-border)] bg-[var(--surface-high)] text-[var(--on-surface)]">
                      <IconCpu size={16} />
                    </span>
                    <h2 className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--on-surface-dim)] font-medium">
                      Engineering Approach & Architecture
                    </h2>
                  </div>

                  <ol className="relative space-y-8 border-l border-[var(--glass-border)] pl-6">
                    {project.approachSteps
                      .sort((a, b) => a.order - b.order)
                      .map((step, idx) => (
                        <li key={step.id} className="relative group">
                          {/* Number Node */}
                          <span
                            aria-hidden="true"
                            className="absolute -left-[2.15rem] top-0 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--surface-high)] font-mono text-[0.75rem] text-[var(--on-surface)] font-medium"
                          >
                            {String(idx + 1).padStart(2, "0")}
                          </span>

                          <div className="flex flex-col gap-3">
                            {isAdmin ? (
                              <div>
                                <InlineEditField
                                  value={step.title}
                                  onChange={(val) => {
                                    const newSteps = [...project.approachSteps];
                                    newSteps[idx] = { ...step, title: val };
                                    save({ approachSteps: newSteps });
                                  }}
                                  label="title"
                                  readClassName="text-[1.15rem] font-medium text-[var(--on-surface)]"
                                />
                                <div className="mt-2">
                                  <InlineEditField
                                    value={step.description}
                                    onChange={(val) => {
                                      const newSteps = [...project.approachSteps];
                                      newSteps[idx] = { ...step, description: val };
                                      save({ approachSteps: newSteps });
                                    }}
                                    label="description"
                                    readClassName="text-[0.95rem] text-[var(--on-surface-dim)] leading-relaxed"
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <h3 className="text-[1.12rem] font-medium text-[var(--on-surface)]">
                                  {step.title}
                                </h3>
                                <p className="text-[0.95rem] leading-relaxed text-[var(--on-surface-dim)]">
                                  {step.description}
                                </p>
                              </>
                            )}

                            {step.imageUrl && (
                              <div className="mt-3 overflow-hidden rounded-xl border border-[var(--glass-border)] max-w-xl">
                                <Image
                                  src={step.imageUrl}
                                  alt={step.title}
                                  width={700}
                                  height={380}
                                  className="w-full object-cover"
                                />
                              </div>
                            )}

                            {isAdmin && (
                              <div className="mt-2 flex items-center gap-3">
                                <AdminItemControls
                                  onMoveUp={
                                    idx > 0
                                      ? () => {
                                          const newSteps = [...project.approachSteps];
                                          [newSteps[idx - 1], newSteps[idx]] = [
                                            newSteps[idx],
                                            newSteps[idx - 1],
                                          ];
                                          newSteps.forEach((s, i) => (s.order = i));
                                          save({ approachSteps: newSteps });
                                        }
                                      : undefined
                                  }
                                  onMoveDown={
                                    idx < project.approachSteps.length - 1
                                      ? () => {
                                          const newSteps = [...project.approachSteps];
                                          [newSteps[idx], newSteps[idx + 1]] = [
                                            newSteps[idx + 1],
                                            newSteps[idx],
                                          ];
                                          newSteps.forEach((s, i) => (s.order = i));
                                          save({ approachSteps: newSteps });
                                        }
                                      : undefined
                                  }
                                  onDelete={() => {
                                    save({
                                      approachSteps: project.approachSteps.filter(
                                        (_, i) => i !== idx,
                                      ),
                                    });
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                  </ol>

                  {isAdmin && projectId && (
                    <button
                      onClick={() => {
                        const newStep = {
                          id: `step-${Date.now()}`,
                          title: "New engineering phase",
                          description: "Describe this phase…",
                          order: project.approachSteps.length,
                        };
                        save({ approachSteps: [...project.approachSteps, newStep] });
                      }}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--glass-border)] py-3 text-[0.82rem] text-[var(--on-surface-dim)] hover:border-[var(--on-surface)] hover:text-[var(--on-surface)] transition-colors font-mono"
                    >
                      + Add approach step
                    </button>
                  )}
                </div>
              )}

              {/* Built Solution & Core Features */}
              {(project.solutionHighlights.length > 0 || isAdmin) && (
                <div id="solution" className="border-t border-[var(--glass-border)] pt-10">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--glass-border)] bg-[var(--surface-high)] text-[var(--on-surface)]">
                      <IconCheck size={16} />
                    </span>
                    <h2 className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--on-surface-dim)] font-medium">
                      Built Solution & Core Features
                    </h2>
                  </div>

                  <div className="divide-y divide-[var(--glass-border)]">
                    {project.solutionHighlights
                      .sort((a, b) => a.order - b.order)
                      .map((hl, idx) => (
                        <div
                          key={hl.id}
                          className={cn(
                            "py-6 first:pt-0 last:pb-0 flex flex-col gap-4",
                            hl.imageUrl && "md:flex-row md:items-center md:justify-between",
                          )}
                        >
                          <div className="flex-1">
                            {isAdmin ? (
                              <div>
                                <InlineEditField
                                  value={hl.title}
                                  onChange={(val) => {
                                    const newHls = [...project.solutionHighlights];
                                    newHls[idx] = { ...hl, title: val };
                                    save({ solutionHighlights: newHls });
                                  }}
                                  label="title"
                                  readClassName="text-[1.08rem] font-medium text-[var(--on-surface)]"
                                />
                                <div className="mt-1.5">
                                  <InlineEditField
                                    value={hl.description}
                                    onChange={(val) => {
                                      const newHls = [...project.solutionHighlights];
                                      newHls[idx] = { ...hl, description: val };
                                      save({ solutionHighlights: newHls });
                                    }}
                                    label="description"
                                    readClassName="text-[0.92rem] text-[var(--on-surface-dim)] leading-relaxed"
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <IconCheck size={15} className="text-emerald-400 shrink-0" />
                                  <h3 className="text-[1.08rem] font-medium text-[var(--on-surface)]">
                                    {hl.title}
                                  </h3>
                                </div>
                                <p className="text-[0.92rem] text-[var(--on-surface-dim)] leading-relaxed pl-6">
                                  {hl.description}
                                </p>
                              </>
                            )}
                          </div>

                          {hl.imageUrl && (
                            <div className="shrink-0 w-full md:w-64 h-40 overflow-hidden rounded-xl border border-[var(--glass-border)] relative">
                              <Image
                                src={hl.imageUrl}
                                alt={hl.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 256px"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  {isAdmin && projectId && (
                    <button
                      onClick={() => {
                        const newHl = {
                          id: `hl-${Date.now()}`,
                          title: "New solution highlight",
                          description: "Describe this feature highlight…",
                          order: project.solutionHighlights.length,
                        };
                        save({ solutionHighlights: [...project.solutionHighlights, newHl] });
                      }}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--glass-border)] py-3 text-[0.82rem] text-[var(--on-surface-dim)] hover:border-[var(--on-surface)] hover:text-[var(--on-surface)] transition-colors font-mono"
                    >
                      + Add solution highlight
                    </button>
                  )}
                </div>
              )}

              {/* Visual Gallery */}
              {(project.gallery.length > 0 || isAdmin) && (
                <div className="border-t border-[var(--glass-border)] pt-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--glass-border)] bg-[var(--surface-high)] text-[var(--on-surface)]">
                      <IconMaximize size={16} />
                    </span>
                    <h2 className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--on-surface-dim)] font-medium">
                      Product Gallery & Interface Showcase
                    </h2>
                  </div>

                  <CaseStudyGallery
                    images={project.gallery}
                    isAdmin={isAdmin}
                    onUpdate={(newGallery) => save({ gallery: newGallery })}
                  />

                  {isAdmin && projectId && (
                    <div className="mt-4">
                      <ImageUploadZone
                        projectId={projectId}
                        field="gallery"
                        label="Add gallery image"
                        onSuccess={(url) => {
                          const newImg = {
                            id: `img-${Date.now()}`,
                            url,
                            alt: "Gallery image",
                            order: project.gallery.length,
                          };
                          save({ gallery: [...project.gallery, newImg] });
                          toast("Image added to gallery", "success");
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Results & Performance Visualization */}
              {project.results.length > 0 && (
                <div id="impact" className="border-t border-[var(--glass-border)] pt-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--glass-border)] bg-[var(--surface-high)] text-[var(--on-surface)]">
                      <IconChartBar size={16} />
                    </span>
                    <h2 className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--on-surface-dim)] font-medium">
                      Verified Results & Business Impact
                    </h2>
                  </div>

                  {/* Recharts Chart */}
                  <CaseStudyMetricsChart results={project.results} />
                </div>
              )}
            </div>

            {/* Sticky Sidebar Info Column */}
            <aside className="flex flex-col gap-8 self-start lg:sticky lg:top-28">
              {/* Primary Actions Card */}
              <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-xl">
                <p className="font-mono text-[0.72rem] uppercase tracking-widest text-[var(--on-surface-dim)] mb-4 font-medium">
                  Direct Action
                </p>
                <div className="flex flex-col gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--on-surface)] px-4 py-3 text-[0.88rem] font-medium text-[var(--bg)] shadow-md hover:opacity-90 transition-opacity"
                  >
                    <IconBrandWhatsapp size={18} />
                    <span>Start Similar Build</span>
                  </a>

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--surface-high)] px-4 py-2.5 text-[0.85rem] font-medium text-[var(--on-surface)] hover:border-[var(--on-surface)] transition-colors"
                    >
                      <IconExternalLink size={15} />
                      <span>Visit Live Platform</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Technical Stack Tags */}
              <div className="border-t border-[var(--glass-border)] pt-6">
                <p className="font-mono text-[0.72rem] uppercase tracking-widest text-[var(--on-surface-dim)] mb-3 font-medium">
                  Technical Stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.stackTags.map((tag, idx) => (
                    <span
                      key={tag}
                      className={cn(
                        "rounded-lg border px-3 py-1 font-mono text-[0.75rem]",
                        idx === 0
                          ? "border-[var(--on-surface)] bg-[var(--on-surface)] text-[var(--bg)] font-medium"
                          : "border-[var(--outline)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)]",
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Engineering Specs */}
              <div className="border-t border-[var(--glass-border)] pt-6">
                <p className="font-mono text-[0.72rem] uppercase tracking-widest text-[var(--on-surface-dim)] mb-3 font-medium">
                  Engineering Specs
                </p>
                <dl className="space-y-3 font-mono text-[0.78rem]">
                  <div className="flex justify-between">
                    <dt className="text-[var(--on-surface-dim)]">Status:</dt>
                    <dd className="text-[var(--on-surface)] font-medium">{project.status}</dd>
                  </div>
                  {project.timeline && (
                    <div className="flex justify-between">
                      <dt className="text-[var(--on-surface-dim)]">Timeline:</dt>
                      <dd className="text-[var(--on-surface)]">{project.timeline}</dd>
                    </div>
                  )}
                  {project.clientName && (
                    <div className="flex justify-between">
                      <dt className="text-[var(--on-surface-dim)]">Location:</dt>
                      <dd className="text-[var(--on-surface)]">{project.clientName}</dd>
                    </div>
                  )}
                  {project.role && (
                    <div className="flex justify-between">
                      <dt className="text-[var(--on-surface-dim)]">Role:</dt>
                      <dd className="text-[var(--on-surface)]">{project.role}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Vetting Bar */}
              <div className="border-t border-[var(--glass-border)] pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <IconShieldCheck size={16} className="text-emerald-400" />
                  <span className="font-mono text-[0.75rem] uppercase tracking-wider text-[var(--on-surface)] font-medium">
                    Verified Quality Standard
                  </span>
                </div>
                <p className="text-[0.82rem] text-[var(--on-surface-dim)] leading-relaxed">
                  Full HIPAA compliance architecture, unit tested codebase, and high-concurrency API
                  setup.
                </p>
              </div>
            </aside>
          </section>

          {/* ── Closing CTA Banner (With FinalCtaArtwork Background Art) ─────────────── */}
          <section className="mt-20 border-t border-[var(--glass-border)] pt-16">
            <div className="relative isolate overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-8 sm:p-14 backdrop-blur-2xl text-center">
              <FinalCtaArtwork />

              <div className="relative z-10">
                <span className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--on-surface-dim)] mb-3 block">
                  Have a similar vision?
                </span>
                <h2 className="title-serif text-3xl sm:text-5xl font-normal text-[var(--on-surface)] tracking-tight max-w-2xl mx-auto mb-6">
                  Build your next flagship SaaS with Andishi
                </h2>
                <p className="body-md text-[1.05rem] text-[var(--on-surface-dim)] max-w-xl mx-auto mb-8">
                  From initial architecture to production launch, we engineer high-impact products
                  with speed and precision.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-full bg-[var(--on-surface)] px-7 py-3.5 text-[0.92rem] font-medium text-[var(--bg)] shadow-lg hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <IconBrandWhatsapp size={18} />
                    <span>Start on WhatsApp</span>
                  </a>
                  <Link
                    href="/work"
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--surface-high)] px-6 py-3.5 text-[0.92rem] font-medium text-[var(--on-surface)] hover:border-[var(--on-surface)] transition-colors"
                  >
                    <span>Explore more work</span>
                    <IconArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Lightbox Modal with Carousel Navigation */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-2xl"
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Close modal"
            >
              <IconX size={20} />
            </button>

            {/* Prev/Next inside Lightbox */}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  aria-label="Previous image"
                >
                  <IconChevronLeft size={24} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  aria-label="Next image"
                >
                  <IconChevronRight size={24} />
                </button>
              </>
            )}

            <motion.div
              key={currentSlideIndex}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
            >
              <Image
                src={allImages[currentSlideIndex].url}
                alt={allImages[currentSlideIndex].title}
                width={1600}
                height={1000}
                className="max-h-[85vh] w-auto object-contain"
              />
              {project.liveUrl && (
                <div className="absolute bottom-4 right-4">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[0.85rem] font-medium text-black shadow-lg hover:bg-gray-100"
                  >
                    <IconExternalLink size={15} />
                    <span>Visit live site</span>
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CustomCursorRegion>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Public Export
// ─────────────────────────────────────────────────────────────────────────────

export function CaseStudyExperience(props: Props) {
  return (
    <ToastProvider>
      <CaseStudyExperienceInner {...props} />
    </ToastProvider>
  );
}

function AdminItemControls({
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="absolute right-2 top-2 z-20 hidden items-center gap-1 rounded-lg border border-[var(--glass-border)] bg-[var(--surface-high)] p-1 backdrop-blur-xl group-hover:flex">
      {onMoveUp && (
        <button
          onClick={onMoveUp}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--on-surface-dim)] hover:bg-[var(--glass-border)] hover:text-[var(--on-surface)] transition-colors"
          title="Move Up"
        >
          <IconChevronUp size={14} />
        </button>
      )}
      {onMoveDown && (
        <button
          onClick={onMoveDown}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--on-surface-dim)] hover:bg-[var(--glass-border)] hover:text-[var(--on-surface)] transition-colors"
          title="Move Down"
        >
          <IconChevronDown size={14} />
        </button>
      )}
      <div className="mx-1 h-4 w-px bg-[var(--glass-border)]" />
      <button
        onClick={onDelete}
        className="flex h-7 w-7 items-center justify-center rounded-md text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        title="Delete"
      >
        <IconTrash size={14} />
      </button>
    </div>
  );
}
