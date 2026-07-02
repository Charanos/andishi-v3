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
import { cn } from "@/lib/utils";
import {
  getProjectsList,
  saveProjectEntry,
  deleteProjectEntry,
  projects,
  type ProjectEntry,
} from "@/data/projects";

gsap.registerPlugin(ScrollTrigger);

export function ProjectShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [projectsList, setProjectsList] = useState<ProjectEntry[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const loadProjects = () => {
      setProjectsList(getProjectsList());
    };
    const checkAdmin = () => {
      setIsAdmin(localStorage.getItem("andishi_admin_sim_logged_in") === "true");
    };
    loadProjects();
    checkAdmin();
    window.addEventListener("projects_updated", loadProjects);
    window.addEventListener("storage", checkAdmin);
    window.addEventListener("admin_sim_changed", checkAdmin);
    return () => {
      window.removeEventListener("projects_updated", loadProjects);
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

  const activeProjects = projectsList.length > 0 ? projectsList : projects;
  
  // Map fields to guarantee compatibility with fallback structures
  const mapProjectToShowcase = (p: ProjectEntry) => {
    return {
      ...p,
      accent: (p as any).accent || p.resultLabel || "with production depth",
      statLabel: p.resultLabel || "Match rate",
      statValue: p.resultValue || "98.3%",
      statSub: p.resultContext || "reconciled logs",
      tags: p.tags || [],
      image: p.image || "/images/project1.webp",
    };
  };

  const featuredRaw = activeProjects[0];
  const featuredProject = featuredRaw ? mapProjectToShowcase(featuredRaw) : null;
  
  const gridProjects = activeProjects.slice(1, 7).map(mapProjectToShowcase);

  const handleStartCreate = () => {
    const newProj: ProjectEntry = {
      slug: `project-${Date.now()}`,
      title: "",
      eyebrow: "Fintech / Nairobi",
      summary: "",
      industry: "Fintech",
      location: "Nairobi",
      timeline: "4 weeks",
      stack: "Next.js + Tailwind",
      status: "Completed",
      resultValue: "98%",
      resultLabel: "Satisfaction",
      resultContext: "client rating",
      tags: [],
      image: "/images/project1.webp",
      services: ["custom-software"],
      year: new Date().getFullYear().toString(),
    };
    setEditingProject(newProj);
    setIsCreating(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    saveProjectEntry(editingProject);
    setEditingProject(null);
    setIsCreating(false);
  };

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
              Add Project Inline
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
                  <p className="text-2xl font-normal text-[var(--on-surface)]">
                    {featuredProject.resultValue}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)] mb-1">
                    Timeline
                  </p>
                  <p className="text-2xl font-normal text-[var(--on-surface)]">
                    {featuredProject.timeline}
                  </p>
                </div>
                <div className="max-sm:col-span-2">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)] mb-1">
                    Key Stack
                  </p>
                  <p className="text-[0.88rem] leading-tight text-[var(--on-surface-dim)] pt-1">
                    {featuredProject.stack}
                  </p>
                </div>
              </div>

              {/* Link CTA */}
              <Link
                href={`/work/${featuredProject.slug}`}
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
                    setEditingProject(featuredRaw);
                    setIsCreating(false);
                  }}
                  className="p-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--surface-low)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] hover:bg-[color-mix(in_srgb,var(--on-surface)_6%,transparent)] transition-all cursor-pointer"
                  title="Edit Project"
                >
                  <IconEdit size={13} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirm("Are you sure you want to delete this project?")) {
                      deleteProjectEntry(featuredProject.slug);
                    }
                  }}
                  className="p-1.5 rounded-lg border border-red-500/20 bg-[var(--surface-low)] text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                  title="Delete Project"
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
            {gridProjects.map((project, index) => {
              const rawProject = activeProjects[index + 1];
              return (
                <div
                  key={project.slug}
                  className="project-block relative flex flex-col group md:rounded-[1.8rem] md:border md:border-[var(--glass-border)] md:bg-[var(--glass-bg)] md:shadow-[var(--glass-inner-shadow)] md:p-6 hover:border-[color-mix(in_srgb,var(--tertiary)_30%,transparent)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all duration-500 max-md:border-b max-md:border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:pb-12 max-md:mb-12 max-md:last:border-b-0 max-md:last:pb-0 max-md:last:mb-0"
                >
                  {/* Card Image */}
                  <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-[var(--glass-border)] bg-[var(--surface-low)] mb-6 max-md:!rounded-[1.25rem]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg)]/10 to-transparent z-10 pointer-events-none" />
                    {project.image && (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    )}
                  </div>

                  {/* Card Description */}
                  <div className="flex flex-col flex-grow">
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[var(--tertiary)] font-medium mb-3">
                      {project.eyebrow}
                    </p>
                    <h3 className="text-xl font-normal leading-tight text-[var(--on-surface)] mb-2 group-hover:text-[var(--primary)] transition-colors duration-300">
                      {project.title}
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

                  {/* Admin Actions Overlay */}
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingProject(rawProject);
                          setIsCreating(false);
                        }}
                        className="p-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--surface-low)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] hover:bg-[color-mix(in_srgb,var(--on-surface)_6%,transparent)] transition-all cursor-pointer"
                        title="Edit Project"
                      >
                        <IconEdit size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (confirm("Are you sure you want to delete this project?")) {
                            deleteProjectEntry(project.slug);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-red-500/20 bg-[var(--surface-low)] text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Delete Project"
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Edit Modal */}
      <AnimatePresence>
        {editingProject && (
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
                  {isCreating ? "Create Project Inline" : "Edit Project Inline"}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
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
                      value={editingProject.title}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
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
                      required
                      disabled={!isCreating}
                      value={editingProject.slug}
                      onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })}
                      placeholder="e.g. haraka-fleet-management"
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)] disabled:opacity-40"
                    />
                  </div>
                </div>

                {/* Eyebrow & Subtitle */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Eyebrow Category (e.g. Fintech / Nairobi)
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.eyebrow}
                      onChange={(e) => setEditingProject({ ...editingProject, eyebrow: e.target.value })}
                      placeholder="Fintech / Nairobi"
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Visual Subtitle / Accent
                    </label>
                    <input
                      type="text"
                      required
                      value={(editingProject as any).accent || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, accent: e.target.value } as any)}
                      placeholder="with production depth"
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Summary / Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={editingProject.summary}
                    onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
                    placeholder="Describe the solution..."
                    className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] p-3 font-sans text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                  />
                </div>

                {/* Grid for Industry, Location, Timeline, Stack */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.industry}
                      onChange={(e) => setEditingProject({ ...editingProject, industry: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.location}
                      onChange={(e) => setEditingProject({ ...editingProject, location: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Timeline
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.timeline}
                      onChange={(e) => setEditingProject({ ...editingProject, timeline: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Stack notes
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.stack}
                      onChange={(e) => setEditingProject({ ...editingProject, stack: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>

                {/* Outcome KPIs */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Result Value (e.g. 98.3%)
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.resultValue}
                      onChange={(e) => setEditingProject({ ...editingProject, resultValue: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Result Label (e.g. Match rate)
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.resultLabel}
                      onChange={(e) => setEditingProject({ ...editingProject, resultLabel: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Result Context (e.g. reconciled logs)
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.resultContext}
                      onChange={(e) => setEditingProject({ ...editingProject, resultContext: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>

                {/* Image & Tags */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Image URL / Path
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.image}
                      onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })}
                      placeholder="/images/project1.webp"
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.tags.join(", ")}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                        })
                      }
                      placeholder="React, Next.js, Redis"
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>

                {/* Save Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--glass-border)] mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProject(null);
                      setIsCreating(false);
                    }}
                    className="rounded-xl border border-[var(--glass-border)] px-4 h-10 font-mono text-[0.7rem] uppercase tracking-wider text-[var(--on-surface-dim)] hover:bg-[color-mix(in_srgb,var(--on-surface)_5%,transparent)] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-[var(--on-surface)] px-5 h-10 font-mono text-[0.7rem] uppercase tracking-wider text-[var(--bg)] hover:bg-[color-mix(in_srgb,var(--on-surface)_90%,transparent)] transition-all active:scale-95 cursor-pointer"
                  >
                    <IconCheck size={14} />
                    {isCreating ? "Publish Project" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
