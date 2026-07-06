"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowRight,
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "framer-motion";
import type { PublicProject } from "@/lib/api/public-client";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import { useToast } from "@/components/dashboard/shared/toast-provider";

gsap.registerPlugin(ScrollTrigger);

const serviceLabels: Record<string, string> = {
  "custom-software": "Custom Software",
  "saas-development": "SaaS Development",
  "ai-systems": "AI Systems",
  "mobile-apps": "Mobile Apps",
  "enterprise-software": "Enterprise Software",
  blockchain: "Blockchain / Web3",
  "apis-integrations": "APIs & Integrations",
  "product-strategy": "Product Strategy",
};

const verticalLabels: Record<string, string> = {
  fintech: "Fintech",
  healthtech: "HealthTech",
  logistics: "Logistics",
  saas: "SaaS",
  ecommerce: "E-Commerce",
  edtech: "EdTech",
  proptech: "PropTech",
  web3: "Web3",
  enterprise: "Enterprise",
  consumer: "Consumer",
};

type CaseStudyDraft = {
  id?: string;
  title: string;
  publicSlug: string;
  clientName: string;
  serviceType: string;
  vertical: string;
  challenge: string;
  solution: string;
  outcome: string;
  outcomeLabel: string;
  coverImageUrl: string;
  clientQuote: string;
  clientQuoteAttribution: string;
  stackTags: string[];
  featuredOrder: string;
  startDate: string;
  targetDate: string;
};

function toDraft(project?: PublicProject): CaseStudyDraft {
  return {
    id: project?.id,
    title: project?.title ?? "",
    publicSlug: project?.publicSlug ?? "",
    clientName: project?.clientName ?? "",
    serviceType: project?.serviceType ?? "custom-software",
    vertical: project?.vertical ?? "saas",
    challenge: project?.challenge ?? "",
    solution: project?.solution ?? "",
    outcome: project?.outcome ?? "",
    outcomeLabel: project?.outcomeLabel ?? "",
    coverImageUrl: project?.coverImageUrl ?? "/images/project1.webp",
    clientQuote: project?.clientQuote ?? "",
    clientQuoteAttribution: project?.clientQuoteAttribution ?? "",
    stackTags: project?.stackTags ?? [],
    featuredOrder: project?.featuredOrder != null ? String(project.featuredOrder) : "",
    startDate: project?.startDate ?? "",
    targetDate: project?.targetDate ?? "",
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface ProjectShowcaseProps {
  /** Pre-fetched server-side data to prevent empty flash on initial render. */
  initialProjects?: PublicProject[];
}

export function ProjectShowcase({ initialProjects = [] }: ProjectShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [projectsList, setProjectsList] = useState<PublicProject[]>(initialProjects);
  const [isAdmin, setIsAdmin] = useState(false);
  const [draft, setDraft] = useState<CaseStudyDraft | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch("/api/work");
        if (res.ok) {
          const data = await res.json();
          setProjectsList(data.work ?? []);
        }
      } catch {
        // Keep initialProjects if fetch fails
      }
    };
    const checkAdmin = () => {
      setIsAdmin(localStorage.getItem("andishi_admin_sim_logged_in") === "true");
    };
    loadProjects();
    checkAdmin();
    window.addEventListener("storage", checkAdmin);
    window.addEventListener("admin_sim_changed", checkAdmin);
    return () => {
      window.removeEventListener("storage", checkAdmin);
      window.removeEventListener("admin_sim_changed", checkAdmin);
    };
  }, []);

  useGSAP(
    () => {
      const blocks = gsap.utils.toArray(".project-block") as Element[];
      blocks.forEach((block) => {
        gsap.fromTo(
          block,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: block,
              start: "top 88%",
              once: true,
            },
          },
        );
      });
    },
    { scope: containerRef, dependencies: [projectsList] },
  );

  const sortedProjects = [...projectsList].sort((a, b) => {
    const aOrder = a.featuredOrder ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.featuredOrder ?? Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  });

  const featuredProject = sortedProjects[0] ?? null;
  const gridProjects = sortedProjects.slice(1, 7);

  const handleStartCreate = () => {
    setDraft(toDraft());
    setIsCreating(true);
  };

  const handleStartEdit = (project: PublicProject) => {
    setDraft(toDraft(project));
    setIsCreating(false);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;

    const payload = {
      title: draft.title,
      publicSlug: draft.publicSlug || slugify(draft.title),
      clientName: draft.clientName,
      serviceType: draft.serviceType,
      vertical: draft.vertical,
      challenge: draft.challenge,
      solution: draft.solution,
      outcome: draft.outcome,
      outcomeLabel: draft.outcomeLabel,
      coverImageUrl: draft.coverImageUrl || null,
      clientQuote: draft.clientQuote || null,
      clientQuoteAttribution: draft.clientQuoteAttribution || null,
      stackTags: draft.stackTags,
      featuredOrder: draft.featuredOrder ? Number(draft.featuredOrder) : null,
      startDate: draft.startDate || null,
      targetDate: draft.targetDate || null,
    };

    setIsSaving(true);
    try {
      const res = isCreating
        ? await fetch("/api/work", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/work/manage/${draft.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Save failed");
      }

      const data = await res.json();
      const saved: PublicProject = data.project;

      setProjectsList((prev) =>
        isCreating ? [...prev, saved] : prev.map((p) => (p.id === saved.id ? saved : p)),
      );
      setDraft(null);
      setIsCreating(false);
      notify(isCreating ? "Case study published successfully" : "Case study updated successfully", "success");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProjectId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/work/manage/${deletingProjectId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setProjectsList((prev) => prev.filter((p) => p.id !== deletingProjectId));
      notify("Case study deleted successfully", "success");
    } catch {
      notify("Failed to delete case study", "error");
    } finally {
      setIsDeleting(false);
      setDeletingProjectId(null);
    }
  };

  const eyebrowFor = (project: PublicProject) =>
    [verticalLabels[project.vertical ?? ""], project.clientName].filter(Boolean).join(" / ") ||
    "Case Study";

  return (
    <section
      ref={containerRef}
      id="work"
      className="relative isolate overflow-hidden bg-[var(--bg)] px-5 py-20 max-sm:py-14 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="relative z-[1] mx-auto max-w-[84rem]">
        {/* Header Section */}
        <div className="mb-20 flex flex-wrap items-end justify-between gap-6 max-w-none max-md:mb-14">
          <div className="max-w-4xl">
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
          {isAdmin && (
            <button
              onClick={handleStartCreate}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--on-surface)] px-4 py-2.5 font-mono text-[0.7rem] uppercase tracking-wider text-[var(--bg)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(255,255,255,0.06)] active:scale-95 cursor-pointer max-md:w-full max-md:justify-center"
            >
              <IconPlus size={14} />
              Add Case Study
            </button>
          )}
        </div>

        {/* Featured Flagship Project */}
        {featuredProject && (
          <div
            className="project-block relative flex flex-col gap-10 lg:gap-16 lg:flex-row items-center mb-28 md:rounded-[2.5rem] md:border md:border-[var(--glass-border)] md:bg-[var(--glass-bg)] md:shadow-[var(--glass-inner-shadow)] md:p-8 lg:p-12 hover:border-[color-mix(in_srgb,var(--tertiary)_30%,transparent)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all duration-500 max-md:border-b max-md:border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:pb-12 max-md:mb-16 group"
            style={{ willChange: "transform, opacity" }}
          >
            {/* Image Side */}
            <div className="w-full lg:w-7/12 relative">
              <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden border border-[var(--glass-border)] bg-[var(--surface-low)] shadow-[var(--glass-inner-shadow)] transition-all duration-700 ease-out hover:border-[color-mix(in_srgb,var(--on-surface)_15%,transparent)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] max-md:!rounded-[1.25rem]">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg)]/10 to-transparent z-10 pointer-events-none" />
                {featuredProject.coverImageUrl && (
                  <Image
                    src={featuredProject.coverImageUrl}
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
                {eyebrowFor(featuredProject)}
              </p>

              <h3 className="text-[clamp(1.75rem,3vw,2.4rem)] font-normal leading-[1.05] tracking-tight text-[var(--on-surface)] mb-2">
                {featuredProject.title}
              </h3>
              {featuredProject.challenge && (
                <p className="text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)] font-normal mb-8 max-w-lg">
                  {featuredProject.challenge}
                </p>
              )}

              {/* Micro-grid of stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8 py-5 border-y border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)]">
                <div>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)] mb-1">
                    {featuredProject.outcomeLabel || "Outcome"}
                  </p>
                  <p className="text-2xl font-normal text-[var(--on-surface)]">
                    {featuredProject.outcome || "—"}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)] mb-1">
                    Delivered
                  </p>
                  <p className="text-2xl font-normal text-[var(--on-surface)]">
                    {featuredProject.targetDate
                      ? new Date(featuredProject.targetDate).getFullYear()
                      : "Ongoing"}
                  </p>
                </div>
                <div className="max-sm:col-span-2">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)] mb-1">
                    Key Stack
                  </p>
                  <p className="text-[0.88rem] leading-tight text-[var(--on-surface-dim)] pt-1">
                    {featuredProject.stackTags.join(", ") || "—"}
                  </p>
                </div>
              </div>

              {/* Link CTA */}
              <Link
                href={`/work/${featuredProject.publicSlug}`}
                className="group/btn flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-wider text-[var(--on-surface)] hover:text-[var(--primary)] transition-all duration-300 w-fit focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)]"
              >
                Explore case study
                <span className="grid h-7 w-7 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] group-hover/btn:translate-x-1 group-hover/btn:bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] group-hover/btn:text-[var(--on-surface)] transition-all duration-300">
                  <IconArrowRight size={13} stroke={2} />
                </span>
              </Link>
            </div>

            {/* Admin Actions Overlay */}
            {isAdmin && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleStartEdit(featuredProject);
                  }}
                  className="p-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--surface-low)] text-[var(--on-surface-dim)] shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-105 hover:text-[var(--on-surface)] hover:bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] active:scale-95 cursor-pointer"
                  title="Edit Case Study"
                >
                  <IconEdit size={13} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeletingProjectId(featuredProject.id);
                  }}
                  className="p-1.5 rounded-lg border border-red-500/25 bg-[var(--surface-low)] text-red-500 shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-red-500/15 active:scale-95 cursor-pointer"
                  title="Delete Case Study"
                >
                  <IconTrash size={13} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Grid Projects */}
        {gridProjects.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {gridProjects.map((project) => (
              <div
                key={project.id}
                className="project-block relative flex flex-col group md:rounded-[1.8rem] md:border md:border-[var(--glass-border)] md:bg-[var(--glass-bg)] md:shadow-[var(--glass-inner-shadow)] md:p-6 hover:border-[color-mix(in_srgb,var(--tertiary)_30%,transparent)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all duration-500 max-md:border-b max-md:border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:pb-12 max-md:mb-12 max-md:last:border-b-0 max-md:last:pb-0 max-md:last:mb-0"
              >
                {/* Card Image */}
                <Link
                  href={`/work/${project.publicSlug}`}
                  className="relative block w-full aspect-[16/10] rounded-2xl overflow-hidden border border-[var(--glass-border)] bg-[var(--surface-low)] mb-6 max-md:!rounded-[1.25rem]"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg)]/10 to-transparent z-10 pointer-events-none" />
                  {project.coverImageUrl && (
                    <Image
                      src={project.coverImageUrl}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  )}
                </Link>

                {/* Card Description */}
                <div className="flex flex-col flex-grow">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[var(--tertiary)] font-medium mb-3">
                    {eyebrowFor(project)}
                  </p>
                  <Link href={`/work/${project.publicSlug}`}>
                    <h3 className="text-xl font-normal leading-tight text-[var(--on-surface)] mb-2 group-hover:text-[var(--primary)] transition-colors duration-300">
                      {project.title}
                    </h3>
                  </Link>
                  {project.challenge && (
                    <p className="text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)] font-normal mb-6 line-clamp-3">
                      {project.challenge}
                    </p>
                  )}

                  {/* Tags - Pushed to bottom */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.stackTags.slice(0, 3).map((tag, i) => (
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
                    {project.stackTags.length > 3 && (
                      <span className="rounded-full border border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] px-3 py-1 font-mono text-[0.62rem] text-[var(--on-surface-dim)]">
                        +{project.stackTags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Admin Actions Overlay */}
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleStartEdit(project);
                      }}
                      className="p-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--surface-low)] text-[var(--on-surface-dim)] shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-105 hover:text-[var(--on-surface)] hover:bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] active:scale-95 cursor-pointer"
                      title="Edit Case Study"
                    >
                      <IconEdit size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeletingProjectId(project.id);
                      }}
                      className="p-1.5 rounded-lg border border-red-500/25 bg-[var(--surface-low)] text-red-500 shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-red-500/15 active:scale-95 cursor-pointer"
                      title="Delete Case Study"
                    >
                      <IconTrash size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Case Study Edit Modal */}
      <AnimatePresence>
        {draft && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4 mb-5">
                <h2 className="title-serif text-[1.45rem] text-[var(--on-surface)]">
                  {isCreating ? "Publish Case Study" : "Edit Case Study"}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(null);
                    setIsCreating(false);
                  }}
                  className="rounded-full p-1 text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] hover:bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] transition-colors cursor-pointer"
                >
                  <IconX size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Title & Slug */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Project Title
                    </label>
                    <input
                      type="text"
                      required
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      placeholder="e.g. Haraka Fleet Management"
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Slug identifier
                    </label>
                    <input
                      type="text"
                      value={draft.publicSlug}
                      onChange={(e) => setDraft({ ...draft, publicSlug: slugify(e.target.value) })}
                      placeholder="e.g. haraka-fleet-management"
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>

                {/* Client, Service, Vertical */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Client Name
                    </label>
                    <input
                      type="text"
                      required
                      value={draft.clientName}
                      onChange={(e) => setDraft({ ...draft, clientName: e.target.value })}
                      placeholder="e.g. Haraka Fleet"
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Service Type
                    </label>
                    <select
                      value={draft.serviceType}
                      onChange={(e) => setDraft({ ...draft, serviceType: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    >
                      {Object.entries(serviceLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Vertical
                    </label>
                    <select
                      value={draft.vertical}
                      onChange={(e) => setDraft({ ...draft, vertical: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    >
                      {Object.entries(verticalLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Challenge / Solution */}
                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Challenge
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={draft.challenge}
                    onChange={(e) => setDraft({ ...draft, challenge: e.target.value })}
                    placeholder="What problem was the client facing?"
                    className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] p-3 font-sans text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Solution
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={draft.solution}
                    onChange={(e) => setDraft({ ...draft, solution: e.target.value })}
                    placeholder="What did we build?"
                    className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] p-3 font-sans text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                  />
                </div>

                {/* Outcome KPIs */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Outcome Value (e.g. 98.3%)
                    </label>
                    <input
                      type="text"
                      required
                      value={draft.outcome}
                      onChange={(e) => setDraft({ ...draft, outcome: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Outcome Label (e.g. Match rate)
                    </label>
                    <input
                      type="text"
                      required
                      value={draft.outcomeLabel}
                      onChange={(e) => setDraft({ ...draft, outcomeLabel: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>

                {/* Image, Tags, Featured order */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Cover Image URL
                    </label>
                    <input
                      type="text"
                      value={draft.coverImageUrl}
                      onChange={(e) => setDraft({ ...draft, coverImageUrl: e.target.value })}
                      placeholder="/images/project1.webp"
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Stack Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={draft.stackTags.join(", ")}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          stackTags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                        })
                      }
                      placeholder="React, Next.js, Redis"
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Featured Order (blank = unfeatured)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={draft.featuredOrder}
                      onChange={(e) => setDraft({ ...draft, featuredOrder: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={draft.startDate}
                      onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Target / Delivered Date
                    </label>
                    <input
                      type="date"
                      value={draft.targetDate}
                      onChange={(e) => setDraft({ ...draft, targetDate: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>

                {/* Client Quote */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Client Quote (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={draft.clientQuote}
                      onChange={(e) => setDraft({ ...draft, clientQuote: e.target.value })}
                      className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] p-3 font-sans text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Quote Attribution (optional)
                    </label>
                    <input
                      type="text"
                      value={draft.clientQuoteAttribution}
                      onChange={(e) => setDraft({ ...draft, clientQuoteAttribution: e.target.value })}
                      placeholder="e.g. CTO, Haraka Fleet"
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>

                {/* Save Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--glass-border)] mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(null);
                      setIsCreating(false);
                    }}
                    disabled={isSaving}
                    className="rounded-xl border border-[var(--glass-border)] px-4 h-10 font-mono text-[0.7rem] uppercase tracking-wider text-[var(--on-surface-dim)] hover:bg-[color-mix(in_srgb,var(--on-surface)_5%,transparent)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-1.5 rounded-xl bg-[var(--on-surface)] px-5 h-10 font-mono text-[0.7rem] uppercase tracking-wider text-[var(--bg)] hover:bg-[color-mix(in_srgb,var(--on-surface)_90%,transparent)] transition-all active:scale-95 cursor-pointer disabled:opacity-70"
                  >
                    <IconCheck size={14} />
                    {isSaving ? "Saving…" : isCreating ? "Publish Case Study" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={deletingProjectId !== null}
        title="Delete Case Study?"
        description="This action is permanent and will remove this project from the showcase directory. Clients viewing the work page will no longer see this project case study."
        confirmLabel={isDeleting ? "Deleting…" : "Permanently Delete"}
        onCancel={() => setDeletingProjectId(null)}
        onConfirm={handleDeleteProject}
      />
    </section>
  );
}
