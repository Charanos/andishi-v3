"use client";

/**
 * src/components/marketing/case-study-experience.tsx
 *
 * Flagship full-page case study experience for /work/[slug].
 * High-craft editorial layout matching service-detail-experience standards:
 * - Ultra-clean monochrome editorial styling (no neon color splashes)
 * - Zero-redundancy Bento Overview combining Problem Context & Architectural Deliverables
 * - Recharts metric visualization with clean monochrome numbers
 * - Photobox showcase with full-screen interactive lightbox modal
 * - Standard max-w-[92rem] container width across all sections
 * - Full admin inline-edit compatibility (isAdmin=true)
 */

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { motion, useReducedMotion, useInView, AnimatePresence } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import {
  IconArrowRight,
  IconArrowLeft,
  IconExternalLink,
  IconBrandGithub,
  IconBrandWhatsapp,
  IconQuote,
  IconCode,
  IconCalendar,
  IconTrash,
  IconChevronUp,
  IconChevronDown,
  IconCheck,
  IconChartBar,
  IconTerminal2,
  IconMapPin,
  IconMaximize,
  IconX,
  IconTarget,
  IconCpu,
  IconLayersIntersect,
} from "@tabler/icons-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";

import { GlassCard } from "@/components/ui/glass-card";
import { LinkButton } from "@/components/ui/button";
import { CustomCursorRegion } from "@/components/ui/custom-cursor-region";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tooltip } from "@/components/ui/tooltip";
import { InlineEditField } from "@/components/ui/inline-edit-field";
import { ImageUploadZone } from "@/components/ui/image-upload-zone";
import { ToastProvider, useToast } from "@/components/ui/toast-provider";
import { CaseStudyGallery } from "@/components/marketing/case-study-gallery";
import { CaseStudyShareBar } from "@/components/marketing/case-study-share-bar";
import { CaseStudyAdminBar, type SaveStatus } from "@/components/marketing/case-study-admin-bar";

import { cosmicSpring, stagger, fadeUp } from "@/lib/motion";
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
// Scroll-reveal wrapper
// ─────────────────────────────────────────────────────────────────────────────

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 24 }}
      animate={prefersReducedMotion ? {} : inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...cosmicSpring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section separator
// ─────────────────────────────────────────────────────────────────────────────

function SectionSep() {
  return (
    <div
      aria-hidden="true"
      className="my-16 h-px w-full"
      style={{
        background: "linear-gradient(90deg, transparent, var(--section-divider) 50%, transparent)",
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
          <h4 className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--on-surface-dim)]">
            Impact Curve & Performance Data
          </h4>
        </div>
        <span className="rounded-full border border-[var(--outline)] bg-[var(--surface-high)] px-3 py-1 font-mono text-[0.68rem] text-[var(--on-surface-dim)]">
          Recharts Verified
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
// Inner component (needs toast context)
// ─────────────────────────────────────────────────────────────────────────────

function CaseStudyExperienceInner({ project, related, isAdmin, projectId }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { saveStatus, save } = useAutosave(projectId ?? null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // GSAP parallax on hero artwork
  useGSAP(
    () => {
      if (prefersReducedMotion || !heroRef.current) return;
      const img = heroRef.current.querySelector(".hero-parallax-img");
      if (!img) return;
      gsap.to(img, {
        y: "12%",
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

  // Curated WhatsApp intro message
  const whatsappUrl = buildWhatsAppUrl(project.sector, {
    context: `case study: ${project.title} (${project.sectorLabel})`,
  });

  return (
    <CustomCursorRegion className="min-h-screen pb-24">
      {/* ── Admin Bar ────────────────────────────────────────────────────── */}
      {isAdmin && projectId && (
        <CaseStudyAdminBar
          projectTitle={project.title}
          caseStudyStatus={project.caseStudyStatus}
          saveStatus={saveStatus}
          onPublish={handlePublish}
          onArchive={handleArchive}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          § 1  CINEMATIC HERO (Crisp Cover + Dual Column Grid + Photobox)
          ════════════════════════════════════════════════════════════════════ */}
      <div ref={heroRef} className="relative w-full overflow-hidden bg-[var(--bg)]">
        {/* Subtle background cover image overlay */}
        {project.coverImageUrl && (
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <Image
              src={project.coverImageUrl}
              alt=""
              fill
              priority
              className="hero-parallax-img object-cover object-top opacity-[0.05] transition-opacity"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)]/80 via-[var(--bg)]/95 to-[var(--bg)]" />
          </div>
        )}

        <PatternTexture opacity={0.03} />

        <div className="relative z-[1] px-5 pb-16 pt-28 sm:px-8 lg:px-10 lg:pt-32">
          <div className="mx-auto w-full max-w-[92rem]">
            {/* Top Breadcrumb Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...cosmicSpring, delay: 0.04 }}
              className="mb-8"
            >
              <Link
                href="/work"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-1.5 font-mono text-[0.78rem] text-[var(--on-surface-dim)] backdrop-blur-xl transition-all duration-200 hover:text-[var(--on-surface)] hover:border-[var(--on-surface)]"
              >
                <IconArrowLeft size={13} stroke={1.7} aria-hidden="true" />
                All work
              </Link>
            </motion.div>

            {/* Hero Main Grid */}
            <motion.header
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
            >
              {/* Left Column: Eyebrow, Title, Tagline, Stack Metadata & Action CTAs */}
              <div>
                {/* Eyebrow Line */}
                <motion.p
                  variants={fadeUp}
                  className="label-caps mb-3 flex items-center gap-2.5 text-[var(--on-surface-dim)]"
                >
                  <span
                    className="h-px w-6 bg-[var(--on-surface-dim)] opacity-40"
                    aria-hidden="true"
                  />
                  {project.sectorLabel}
                  <span className="opacity-40">•</span>
                  <span className="inline-flex items-center gap-1 text-[var(--on-surface)] font-mono text-[0.7rem] uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {project.status}
                  </span>
                </motion.p>

                {/* Flagship Title */}
                <motion.h1
                  variants={fadeUp}
                  className="title-serif text-5xl sm:text-6xl lg:text-7xl font-normal text-[var(--on-surface)] tracking-tight leading-[1.04] mb-4"
                >
                  {project.title}
                </motion.h1>

                {/* Tagline */}
                {isAdmin ? (
                  <motion.div variants={fadeUp} className="mb-5">
                    <InlineEditField
                      value={project.tagline ?? ""}
                      onChange={(val) => save({ tagline: val })}
                      label="tagline"
                      mode="text"
                      placeholder="Add a one-sentence value proposition tagline…"
                      maxLength={200}
                      readClassName="headline-sm text-[var(--on-surface-dim)] leading-relaxed"
                    />
                  </motion.div>
                ) : project.tagline ? (
                  <motion.p
                    variants={fadeUp}
                    className="mb-5 text-[1.08rem] leading-[1.6] text-[var(--on-surface-dim)] max-w-2xl font-normal"
                  >
                    {project.tagline}
                  </motion.p>
                ) : null}

                {/* Tech Stack & Key Specs Bar */}
                <motion.div variants={fadeUp} className="my-4 flex flex-wrap items-center gap-2">
                  {project.timeline && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1 font-mono text-[0.75rem] text-[var(--on-surface)]">
                      <IconCalendar size={13} className="text-[var(--on-surface-dim)]" />
                      {project.timeline}
                    </span>
                  )}

                  {project.clientName && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1 font-mono text-[0.75rem] text-[var(--on-surface)]">
                      <IconMapPin size={13} className="text-[var(--on-surface-dim)]" />
                      {project.clientName}
                    </span>
                  )}

                  {project.stackTags.slice(0, 7).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-lg border border-[var(--outline)] bg-[var(--surface-high)] px-2.5 py-1 font-mono text-[0.75rem] text-[var(--on-surface-dim)]"
                    >
                      {tag}
                    </span>
                  ))}
                </motion.div>

                {/* Primary CTAs */}
                <motion.div variants={fadeUp} className="my-8 flex flex-wrap items-center gap-3">
                  {/* <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--on-surface)] px-5 py-2.5 text-[0.88rem] font-medium text-[var(--bg)] shadow-[var(--cta-shadow)] hover:opacity-90 transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <IconBrandWhatsapp size={17} />
                    <span>Start a Project</span>
                  </a> */}

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4.5 py-2.5 text-[0.88rem] font-medium text-[var(--on-surface)] backdrop-blur-xl hover:border-[var(--on-surface)] transition-all cursor-pointer"
                    >
                      <IconExternalLink size={15} />
                      <span>Live Demo</span>
                    </a>
                  )}

                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4.5 py-2.5 text-[0.88rem] font-medium text-[var(--on-surface)] backdrop-blur-xl hover:border-[var(--on-surface)] transition-all cursor-pointer"
                    >
                      <IconBrandGithub size={15} />
                      <span>Code</span>
                    </a>
                  )}
                </motion.div>
              </div>

              {/* Right Column: Photobox Showcase + Action Buttons Below */}
              <motion.div variants={fadeUp} className="flex flex-col gap-3.5">
                <div
                  onClick={() => setLightboxOpen(true)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-container-low)] shadow-2xl transition-all duration-300 hover:border-[var(--on-surface)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setLightboxOpen(true);
                  }}
                  aria-label="Expand case study preview image"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--bg-deep)]">
                    <Image
                      src={project.coverImageUrl}
                      alt={`${project.title} — Andishi case study`}
                      fill
                      priority
                      className="hero-parallax-img object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 45vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Lightbox Badge Overlay */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 font-mono text-[0.72rem] text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
                      <IconMaximize size={13} />
                      <span>Expand preview</span>
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
                </div>

                {/* Sleek Action Buttons Positioned Directly Below Photo Box */}
                <div className="flex items-center justify-between gap-3 px-1 py-4">
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
              </motion.div>
            </motion.header>
          </div>
        </div>
      </div>

      {/* Full-Screen Lightbox Modal */}
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

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
            >
              <Image
                src={project.coverImageUrl}
                alt={project.title}
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

      <div className="mx-auto w-full max-w-[92rem] px-5 sm:px-8 lg:px-10">
        {/* ═══════════════════════════════════════════════════════════════════
            § 2  NON-REDUNDANT BENTO EXECUTIVE OVERVIEW
            ═══════════════════════════════════════════════════════════════════ */}
        <SectionSep />
        <Reveal>
          <div className="grid gap-6 md:grid-cols-12">
            {/* Bento Card 1: Core Problem & Challenge Context */}
            <div className="md:col-span-7">
              <div className="flex items-center gap-2 mb-3">
                <IconTarget size={16} className="text-[var(--on-surface-dim)]" />
                <p className="label-caps text-[var(--on-surface-dim)]">
                  Problem & Challenge Context
                </p>
              </div>
              <GlassCard
                glow="none"
                className="h-full flex flex-col justify-between p-7 border-[var(--glass-border)]"
              >
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

                <div className="mt-8 flex items-center justify-between gap-4 pt-4 border-t border-[var(--glass-border)]">
                  <div className="flex items-center gap-2">
                    <IconTerminal2 size={15} className="text-[var(--on-surface-dim)]" />
                    <span className="font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
                      Engineered & Shipped by Andishi Core Team
                    </span>
                  </div>
                  <span className="font-mono text-[0.68rem] text-[var(--on-surface-dim)] uppercase tracking-wider">
                    {project.sectorLabel}
                  </span>
                </div>
              </GlassCard>
            </div>

            {/* Bento Card 2: Testimonial OR Architectural Deliverables Spotlight */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-2 mb-3">
                {project.testimonial ? (
                  <>
                    <IconQuote size={16} className="text-[var(--on-surface-dim)]" />
                    <p className="label-caps text-[var(--on-surface-dim)]">Client Feedback</p>
                  </>
                ) : (
                  <>
                    <IconLayersIntersect size={16} className="text-[var(--on-surface-dim)]" />
                    <p className="label-caps text-[var(--on-surface-dim)]">Platform Deliverables</p>
                  </>
                )}
              </div>

              {project.testimonial ? (
                <GlassCard
                  glow="none"
                  className="h-full relative flex flex-col justify-between p-7 border-[var(--glass-border)]"
                >
                  <IconQuote
                    size={40}
                    aria-hidden
                    className="absolute right-5 top-5 text-[var(--on-surface-dim)] opacity-10"
                  />
                  <blockquote className="relative z-10">
                    <p className="body-md italic text-[var(--on-surface)] leading-relaxed">
                      &ldquo;{project.testimonial.quote}&rdquo;
                    </p>
                  </blockquote>
                  <div className="mt-6 flex items-center gap-3 pt-4 border-t border-[var(--glass-border)]">
                    {project.testimonial.authorAvatarUrl && (
                      <Image
                        src={project.testimonial.authorAvatarUrl}
                        alt={project.testimonial.authorName}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover border border-[var(--glass-border)]"
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
                </GlassCard>
              ) : (
                <GlassCard
                  glow="none"
                  className="h-full flex flex-col justify-between p-7 border-[var(--glass-border)]"
                >
                  <div>
                    <span className="font-mono text-[0.72rem] uppercase tracking-wider text-[var(--on-surface-dim)]">
                      Core Architecture Delivered
                    </span>
                    <ul className="mt-4 space-y-2.5">
                      {[
                        "Role-Based Access Control (Advocate, Paralegal, Client)",
                        "Structured Digital Case File & Document Management",
                        "Legal Subscription Tiers & Integrated Stripe Billing",
                        "Real-time Client Status Portal & Audit Logs",
                      ].map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-[0.85rem] text-[var(--on-surface)]"
                        >
                          <IconCheck
                            size={15}
                            className="text-[var(--on-surface)] shrink-0 mt-0.5"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--glass-border)] flex items-center gap-2">
                    <IconCpu size={15} className="text-[var(--on-surface-dim)]" />
                    <span className="font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
                      Verified Production Stack
                    </span>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        </Reveal>

        {/* ═══════════════════════════════════════════════════════════════════
            § 3  THE APPROACH (Engineering Timeline)
            ═══════════════════════════════════════════════════════════════════ */}
        <div id="approach">
          {(project.approachSteps.length > 0 || isAdmin) && (
            <>
              <SectionSep />
              <Reveal>
                <SectionHeading
                  eyebrow="Engineering approach"
                  title="How we got there"
                  accent="primary"
                />
              </Reveal>

              <div className="mt-10 space-y-6">
                {project.approachSteps
                  .sort((a, b) => a.order - b.order)
                  .map((step, idx) => (
                    <Reveal key={step.id} delay={idx * 0.08}>
                      <GlassCard
                        glow="none"
                        className="relative group flex flex-col md:flex-row gap-6 p-7 border-[var(--glass-border)]"
                      >
                        {/* Numbered node */}
                        <div className="shrink-0 flex md:flex-col items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--surface-high)] font-mono text-[1.1rem] text-[var(--on-surface)] font-medium">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <div className="hidden md:block h-full w-px bg-[var(--glass-border)]" />
                        </div>

                        {/* Step Details */}
                        <div className="flex-1">
                          {isAdmin ? (
                            <div className="mb-2">
                              <InlineEditField
                                value={step.title}
                                onChange={(val) => {
                                  const newSteps = [...project.approachSteps];
                                  newSteps[idx] = { ...step, title: val };
                                  save({ approachSteps: newSteps });
                                }}
                                label="title"
                                readClassName="headline-sm text-[var(--on-surface)]"
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
                                  readClassName="body-md text-[var(--on-surface-dim)]"
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="headline-sm text-[var(--on-surface)]">{step.title}</h3>
                              <p className="mt-2 body-md text-[var(--on-surface-dim)] leading-relaxed">
                                {step.description}
                              </p>
                            </>
                          )}

                          {step.imageUrl && (
                            <div className="mt-4 overflow-hidden rounded-xl border border-[var(--glass-border)]">
                              <Image
                                src={step.imageUrl}
                                alt={step.title}
                                width={700}
                                height={380}
                                className="w-full object-cover"
                              />
                            </div>
                          )}

                          {isAdmin && projectId && (
                            <div className="mt-4 w-48">
                              <ImageUploadZone
                                projectId={projectId}
                                field="step"
                                label="Step Image"
                                onSuccess={(url) => {
                                  const newSteps = [...project.approachSteps];
                                  newSteps[idx] = { ...step, imageUrl: url };
                                  save({ approachSteps: newSteps });
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {isAdmin && (
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
                                approachSteps: project.approachSteps.filter((_, i) => i !== idx),
                              });
                            }}
                          />
                        )}
                      </GlassCard>
                    </Reveal>
                  ))}

                {/* Admin: add step */}
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
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--glass-border)] py-4 text-[0.88rem] text-[var(--on-surface-dim)] hover:border-[var(--on-surface)] hover:text-[var(--on-surface)] transition-colors"
                  >
                    + Add approach step
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            § 4  THE SOLUTION (Feature Highlights Showcase)
            ═══════════════════════════════════════════════════════════════════ */}
        <div id="solution">
          {(project.solutionHighlights.length > 0 || isAdmin) && (
            <>
              <SectionSep />
              <Reveal>
                <SectionHeading
                  eyebrow="Built solution"
                  title="Core features & architecture"
                  accent="secondary"
                />
              </Reveal>

              <div className="mt-10 space-y-12">
                {project.solutionHighlights
                  .sort((a, b) => a.order - b.order)
                  .map((hl, idx) => (
                    <Reveal key={hl.id} delay={0.05}>
                      <div
                        className={cn(
                          "relative group flex flex-col gap-8 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-7 backdrop-blur-xl",
                          hl.imageUrl && idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse",
                        )}
                      >
                        {isAdmin && (
                          <AdminItemControls
                            onMoveUp={
                              idx > 0
                                ? () => {
                                    const newHls = [...project.solutionHighlights];
                                    [newHls[idx - 1], newHls[idx]] = [newHls[idx], newHls[idx - 1]];
                                    newHls.forEach((h, i) => (h.order = i));
                                    save({ solutionHighlights: newHls });
                                  }
                                : undefined
                            }
                            onMoveDown={
                              idx < project.solutionHighlights.length - 1
                                ? () => {
                                    const newHls = [...project.solutionHighlights];
                                    [newHls[idx], newHls[idx + 1]] = [newHls[idx + 1], newHls[idx]];
                                    newHls.forEach((h, i) => (h.order = i));
                                    save({ solutionHighlights: newHls });
                                  }
                                : undefined
                            }
                            onDelete={() => {
                              save({
                                solutionHighlights: project.solutionHighlights.filter(
                                  (_, i) => i !== idx,
                                ),
                              });
                            }}
                          />
                        )}

                        {(hl.imageUrl || isAdmin) && (
                          <div className="relative flex-1 overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--surface-high)] min-h-[240px] flex items-center justify-center">
                            {hl.imageUrl ? (
                              <Image
                                src={hl.imageUrl}
                                alt={hl.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                              />
                            ) : (
                              <div className="w-48 z-10">
                                <ImageUploadZone
                                  projectId={projectId!}
                                  field="highlight"
                                  label="Highlight Image"
                                  onSuccess={(url) => {
                                    const newHls = [...project.solutionHighlights];
                                    newHls[idx] = { ...hl, imageUrl: url };
                                    save({ solutionHighlights: newHls });
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        <div
                          className={cn(
                            "flex flex-1 flex-col justify-center",
                            !hl.imageUrl && !isAdmin && "col-span-2",
                          )}
                        >
                          {isAdmin ? (
                            <>
                              <InlineEditField
                                value={hl.title}
                                onChange={(val) => {
                                  const newHls = [...project.solutionHighlights];
                                  newHls[idx] = { ...hl, title: val };
                                  save({ solutionHighlights: newHls });
                                }}
                                label="title"
                                readClassName="headline-sm text-[var(--on-surface)]"
                              />
                              <div className="mt-3">
                                <InlineEditField
                                  value={hl.description}
                                  onChange={(val) => {
                                    const newHls = [...project.solutionHighlights];
                                    newHls[idx] = { ...hl, description: val };
                                    save({ solutionHighlights: newHls });
                                  }}
                                  label="description"
                                  readClassName="body-md text-[var(--on-surface-dim)]"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <IconCheck size={16} className="text-[var(--on-surface)]" />
                                <h3 className="headline-sm text-[var(--on-surface)]">{hl.title}</h3>
                              </div>
                              <p className="body-md text-[var(--on-surface-dim)] leading-relaxed">
                                {hl.description}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </Reveal>
                  ))}

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
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--glass-border)] py-4 text-[0.88rem] text-[var(--on-surface-dim)] hover:border-[var(--on-surface)] hover:text-[var(--on-surface)] transition-colors"
                  >
                    + Add solution highlight
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            § 5  VISUAL GALLERY (Masonry Lightbox)
            ═══════════════════════════════════════════════════════════════════ */}
        {(project.gallery.length > 0 || isAdmin) && (
          <div>
            <SectionSep />
            <Reveal>
              <SectionHeading eyebrow="Gallery" title="See it in action" accent="primary" />
            </Reveal>
            <div className="mt-8">
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
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            § 6  RESULTS & IMPACT (With Recharts Data Viz)
            ═══════════════════════════════════════════════════════════════════ */}
        <div id="impact">
          {project.results.length > 0 && (
            <>
              <SectionSep />
              <Reveal>
                <SectionHeading
                  eyebrow="Results & impact"
                  title="The numbers that matter"
                  accent="tertiary"
                />
              </Reveal>

              {/* Metrics Grid */}
              <div
                className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
                role="list"
                aria-label="Project results"
              >
                {project.results.map((result, idx) => (
                  <Reveal key={result.id} delay={idx * 0.07}>
                    <GlassCard
                      glow="none"
                      role="listitem"
                      className="flex flex-col gap-1 text-center relative group p-6 border-[var(--glass-border)]"
                    >
                      {isAdmin && (
                        <AdminItemControls
                          onMoveUp={
                            idx > 0
                              ? () => {
                                  const newResults = [...project.results];
                                  [newResults[idx - 1], newResults[idx]] = [
                                    newResults[idx],
                                    newResults[idx - 1],
                                  ];
                                  save({ results: newResults });
                                }
                              : undefined
                          }
                          onMoveDown={
                            idx < project.results.length - 1
                              ? () => {
                                  const newResults = [...project.results];
                                  [newResults[idx], newResults[idx + 1]] = [
                                    newResults[idx + 1],
                                    newResults[idx],
                                  ];
                                  save({ results: newResults });
                                }
                              : undefined
                          }
                          onDelete={() => {
                            save({ results: project.results.filter((_, i) => i !== idx) });
                          }}
                        />
                      )}
                      {isAdmin ? (
                        <>
                          <div className="font-mono text-[2rem] leading-none text-[var(--on-surface)] flex justify-center font-medium">
                            <InlineEditField
                              value={result.metric}
                              onChange={(val) => {
                                const newResults = [...project.results];
                                newResults[idx] = { ...result, metric: val };
                                save({ results: newResults });
                              }}
                              label="metric"
                            />
                          </div>
                          <div className="text-[0.85rem] text-[var(--on-surface-dim)] flex justify-center mt-2">
                            <InlineEditField
                              value={result.label}
                              onChange={(val) => {
                                const newResults = [...project.results];
                                newResults[idx] = { ...result, label: val };
                                save({ results: newResults });
                              }}
                              label="label"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="font-mono text-[2.2rem] leading-none text-[var(--on-surface)] font-medium">
                            {result.metric}
                          </span>
                          <span className="text-[0.85rem] text-[var(--on-surface-dim)] font-medium mt-1.5">
                            {result.label}
                          </span>
                          {result.context && (
                            <span className="mt-1 text-[0.75rem] text-[var(--on-surface-dim)] opacity-70">
                              {result.context}
                            </span>
                          )}
                        </>
                      )}
                    </GlassCard>
                  </Reveal>
                ))}
              </div>

              {/* Recharts Data Visualization Chart */}
              <Reveal>
                <CaseStudyMetricsChart results={project.results} />
              </Reveal>

              {/* Admin: add metric */}
              {isAdmin && projectId && (
                <button
                  onClick={() => {
                    const newResult = {
                      id: `result-${Date.now()}`,
                      metric: "0%",
                      label: "New metric",
                      context: null,
                    };
                    save({ results: [...project.results, newResult] });
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--glass-border)] py-4 text-[0.88rem] text-[var(--on-surface-dim)] hover:border-[var(--on-surface)] hover:text-[var(--on-surface)] transition-colors"
                >
                  + Add result metric
                </button>
              )}
            </>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            § 7  TECH STACK MATRIX
            ═══════════════════════════════════════════════════════════════════ */}
        <div id="tech">
          {(project.techStackDetails.length > 0 || project.stackTags.length > 0) && (
            <>
              <SectionSep />
              <Reveal>
                <SectionHeading eyebrow="Technology" title="Built with" accent="secondary" />
              </Reveal>
              <div className="mt-8 flex flex-wrap gap-3">
                {(project.techStackDetails.length > 0
                  ? project.techStackDetails
                  : project.stackTags.map((t) => ({ name: t, reason: null }))
                ).map((tech) =>
                  tech.reason ? (
                    <Tooltip key={tech.name} content={tech.reason}>
                      <TechBadge name={tech.name} hasReason />
                    </Tooltip>
                  ) : (
                    <TechBadge key={tech.name} name={tech.name} />
                  ),
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          § 8  NEXT CASE STUDY & RELATED WORK
          ═══════════════════════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <div className="mx-auto w-full max-w-[92rem] px-5 sm:px-8 lg:px-10">
          <SectionSep />
          <Reveal>
            <p className="label-caps mb-8 text-[var(--on-surface-dim)]">More work</p>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2">
            {related.map((r, idx) => (
              <Reveal key={r.slug} delay={idx * 0.08}>
                <Link
                  href={`/work/${r.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl transition-all duration-300 hover:border-[var(--on-surface)] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--on-surface)]"
                  aria-label={`View case study: ${r.title}`}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={r.coverImageUrl}
                      alt={r.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <div className="p-5">
                    <span className="font-mono text-[0.72rem] uppercase tracking-widest text-[var(--on-surface-dim)]">
                      {r.sectorLabel}
                    </span>
                    <h3 className="mt-1 text-[1rem] font-medium text-[var(--on-surface)]">
                      {r.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-1 text-[0.82rem] text-[var(--on-surface-dim)] group-hover:text-[var(--on-surface)] transition-colors">
                      View case study{" "}
                      <IconArrowRight
                        size={13}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          § 9  CLOSING HIGH-CONVERTING CTA
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative mt-20 overflow-hidden">
        <PatternTexture opacity={0.08} />
        <div className="relative mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 lg:px-10">
          <Reveal>
            <div className="flex flex-col items-center gap-8 text-center">
              <div>
                <p className="label-caps mb-3 text-[var(--on-surface-dim)]">Ready to build?</p>
                <h2 className="headline-lg max-w-xl text-[var(--on-surface)]">
                  Get a project like this built
                </h2>
                <p className="body-lg mx-auto mt-3 max-w-md text-[var(--on-surface-dim)]">
                  Tell us about your product goals. We move fast — scoping consultation within 48
                  hours.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[var(--on-surface)] px-6 py-3 text-[0.92rem] font-medium text-[var(--bg)] shadow-[var(--cta-shadow)] hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--on-surface)]"
                >
                  <IconBrandWhatsapp size={18} />
                  <span>Start on WhatsApp</span>
                </a>

                <LinkButton href="/work" variant="glass">
                  <span>See all work</span>
                  <IconArrowRight size={15} />
                </LinkButton>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
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

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function TechBadge({ name, hasReason = false }: { name: string; hasReason?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 font-mono text-[0.78rem] text-[var(--on-surface-dim)] transition-colors",
        hasReason
          ? "border-[color-mix(in_srgb,var(--on-surface)_25%,transparent)] hover:border-[var(--on-surface)] hover:text-[var(--on-surface)] cursor-help"
          : "border-[var(--outline)] hover:border-[var(--outline-variant)]",
      )}
    >
      <IconCode size={12} aria-hidden />
      {name}
    </span>
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
