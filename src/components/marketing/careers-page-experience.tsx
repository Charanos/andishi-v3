"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconSearch,
  IconBriefcase,
  IconChevronRight,
  IconPlus,
  IconEdit,
  IconX,
  IconCheck,
  IconDeviceLaptop,
  IconBuilding,
  IconTrash,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { getJobOpenings, saveJobOpening, deleteJobOpening, JobOpening, JobKind, JobStatus } from "@/data/careers";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { PublicPageShell, RouteHero, GlassPanel } from "./public-page";
import { cn } from "@/lib/utils";

// Accent glow mapping matching design system
const kindStyles: Record<
  JobKind,
  { label: string; bg: string; text: string; border: string; glow: string }
> = {
  freelance: {
    label: "Freelance Project",
    bg: "color-mix(in srgb, var(--tertiary) 8%, transparent)",
    text: "var(--tertiary)",
    border: "color-mix(in srgb, var(--tertiary) 20%, transparent)",
    glow: "rgba(6, 182, 212, 0.15)", // Cyan
  },
  internal: {
    label: "Studio Core",
    bg: "color-mix(in srgb, var(--primary) 8%, transparent)",
    text: "var(--primary)",
    border: "color-mix(in srgb, var(--primary) 20%, transparent)",
    glow: "rgba(208, 188, 255, 0.15)", // Violet
  },
  outsourced: {
    label: "Client Placement",
    bg: "rgba(200, 140, 0, 0.08)",
    text: "rgba(255, 184, 105, 0.95)",
    border: "rgba(200, 140, 0, 0.22)",
    glow: "rgba(255, 184, 105, 0.15)", // Amber
  },
};

export function CareersPageExperience() {
  const [openings, setOpenings] = useState<JobOpening[]>(() => {
    if (typeof window === "undefined") return [];
    return getJobOpenings();
  });
  const [search, setSearch] = useState("");
  const [activeKind, setActiveKind] = useState<JobKind | "all">("all");
  const [activeDept, setActiveDept] = useState<string>("all");
  const [onlyRemote, setOnlyRemote] = useState(false);

  // Administrative simulation state
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Load openings
  useEffect(() => {
    const checkAdmin = () => {
      setIsAdmin(localStorage.getItem("andishi_admin_sim_logged_in") === "true");
    };
    checkAdmin();
    window.addEventListener("storage", checkAdmin);
    window.addEventListener("admin_sim_changed", checkAdmin);
    return () => {
      window.removeEventListener("storage", checkAdmin);
      window.removeEventListener("admin_sim_changed", checkAdmin);
    };
  }, []);

  const handleDeleteJob = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this opening?")) {
      deleteJobOpening(id);
      reloadOpenings();
    }
  };

  // Sync state helper
  const reloadOpenings = () => {
    setOpenings(getJobOpenings());
  };

  // Get unique departments for filtering
  const departments = ["all", ...Array.from(new Set(openings.map((j) => j.department)))];

  // Filter logic: Admins see all status, public sees only "open" status
  const filteredOpenings = openings.filter((job) => {
    const matchesStatus = isAdmin ? true : job.status === "open";
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      job.department.toLowerCase().includes(search.toLowerCase());
    const matchesKind = activeKind === "all" ? true : job.kind === activeKind;
    const matchesDept = activeDept === "all" ? true : job.department === activeDept;
    const matchesRemote = onlyRemote ? job.remote : true;

    return matchesStatus && matchesSearch && matchesKind && matchesDept && matchesRemote;
  });

  // Inline CRUD Handlers
  const handleSaveJob = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingJob) return;

    // Auto-generate slug from title if new
    const updatedJob = {
      ...editingJob,
      slug: editingJob.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      published_at: editingJob.published_at || new Date().toISOString(),
    };

    saveJobOpening(updatedJob);
    setEditingJob(null);
    setIsCreating(false);
    reloadOpenings();
  };

  const handleStartCreate = () => {
    const newJob: JobOpening = {
      id: `job-${Date.now()}`,
      title: "",
      slug: "",
      kind: "freelance",
      department: "Engineering",
      location: "Nairobi, Kenya",
      remote: true,
      seniority: "Senior",
      compensation_note: "",
      status: "open",
      published_at: "",
      skills: [],
      description_md: "",
    };
    setEditingJob(newJob);
    setIsCreating(true);
  };

  return (
    <PublicPageShell>


      <RouteHero
        eyebrow="Careers & Supply"
        title="Join the orbit of senior builders."
        body="Andishi pivots classic hiring models. We run three channels: freelance project contracts, core studio operations, and premium client placements. Filter roles below and join Nairobi's highest fidelity talent pool."
      />

      <section className="px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-[92rem]">
          {/* Filter Ribbon & Search Bar */}
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-[var(--glass-border)] pb-8">
            {/* Left side: Search & filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative min-w-[240px] max-md:w-full">
                <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)] opacity-50" />
                <input
                  type="text"
                  placeholder="Search openings or skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] pl-10 pr-4 text-[0.85rem] text-[var(--on-surface)] backdrop-blur-md placeholder-[var(--on-surface-dim)]/50 transition-all duration-300 focus:border-[color-mix(in_srgb,var(--primary)_40%,transparent)] focus:outline-none focus:ring-1 focus:ring-[color-mix(in_srgb,var(--primary)_40%,transparent)]"
                />
              </div>

              {/* Channel Filter pills */}
              <div className="flex flex-wrap gap-1.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-1 backdrop-blur-md">
                {(["all", "freelance", "internal", "outsourced"] as const).map((kind) => (
                  <button
                    key={kind}
                    onClick={() => setActiveKind(kind)}
                    className={cn(
                      "rounded-lg px-3.5 py-1.5 font-mono text-[0.66rem] uppercase tracking-wider transition-all duration-200",
                      activeKind === kind
                        ? "bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] text-[var(--on-surface)]"
                        : "text-[var(--on-surface-dim)] opacity-60 hover:opacity-100",
                    )}
                  >
                    {kind === "all" ? "All Channels" : kindStyles[kind].label}
                  </button>
                ))}
              </div>

              {/* Department Selector */}
              <div className="relative">
                <select
                  value={activeDept}
                  onChange={(e) => setActiveDept(e.target.value)}
                  className="h-10 cursor-pointer rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.82rem] text-[var(--on-surface)] backdrop-blur-md outline-none transition-all duration-300 focus:border-[color-mix(in_srgb,var(--primary)_40%,transparent)]"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept === "all" ? "All Departments" : dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Remote Toggle */}
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 h-10 select-none text-[0.8rem] text-[var(--on-surface-dim)] transition-all hover:bg-[color-mix(in_srgb,var(--on-surface)_4%,transparent)]">
                <input
                  type="checkbox"
                  checked={onlyRemote}
                  onChange={(e) => setOnlyRemote(e.target.checked)}
                  className="rounded border-[var(--glass-border)] bg-transparent text-[var(--primary)] outline-none focus:ring-0 cursor-pointer"
                />
                Remote Only
              </label>
            </div>

            {/* Right side: Admin control */}
            {isAdmin && (
              <button
                onClick={handleStartCreate}
                className="flex items-center gap-1.5 rounded-xl bg-[var(--on-surface)] px-4 py-2 font-mono text-[0.7rem] uppercase tracking-wider text-[var(--bg)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(255,255,255,0.06)] active:scale-95"
              >
                <IconPlus size={14} />
                Create Role Inline
              </button>
            )}
          </div>

          {/* Grid Layout */}
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredOpenings.map((job) => {
                const style = kindStyles[job.kind];
                return (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden flex flex-col justify-between group transition-all duration-300",
                        "md:rounded-[1.35rem] md:border md:border-[var(--glass-border)] md:bg-[color-mix(in_srgb,var(--surface)_38%,transparent)] md:p-6 md:shadow-[0_24px_80px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] md:backdrop-blur-2xl md:hover:border-[color-mix(in_srgb,var(--on-surface)_25%,transparent)]",
                        "max-md:border-b max-md:border-b-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] max-md:pb-12 max-md:pt-4 max-md:mb-6 max-md:last:border-b-0 max-md:last:pb-0 max-md:last:mb-0"
                      )}
                    >
                      {/* Card Content */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <span
                            className="rounded-full border px-2.5 py-[3px] font-mono text-[0.62rem] uppercase tracking-wider font-normal"
                            style={{
                              backgroundColor: style.bg,
                              borderColor: style.border,
                              color: style.text,
                              boxShadow: `0 0 10px ${style.glow}`,
                            }}
                          >
                            {style.label}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[0.64rem] text-[var(--on-surface-dim)] opacity-40">
                            {job.status === "draft" ? (
                              <span className="rounded bg-yellow-400/25 px-1 py-[1px] text-yellow-400 font-medium uppercase text-[0.55rem]">
                                Draft
                              </span>
                            ) : job.status === "closed" ? (
                              <span className="rounded bg-red-400/25 px-1 py-[1px] text-red-400 font-medium uppercase text-[0.55rem]">
                                Closed
                              </span>
                            ) : null}
                            {job.published_at
                              ? new Date(job.published_at).toLocaleDateString()
                              : ""}
                          </span>
                        </div>

                        <div>
                          <h3 className="title-serif text-[1.38rem] font-normal leading-[1.12] tracking-tight text-[var(--on-surface)] transition-colors duration-300 group-hover:text-[var(--primary)]">
                            {job.title}
                          </h3>
                          <p className="mt-2 text-[0.8rem] font-medium text-[var(--on-surface-dim)] opacity-70">
                            {job.department} &bull; {job.seniority}
                          </p>
                        </div>

                        {/* Description excerpt */}
                        <p className="text-[0.82rem] leading-[1.62] text-[var(--on-surface-dim)] line-clamp-3">
                          {job.description_md
                            .replace(/[#*`\n_]/g, " ")
                            .replace(/\s+/g, " ")
                            .trim()}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {job.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-[2px] font-mono text-[0.62rem] text-[var(--on-surface-dim)]"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-[2px] font-mono text-[0.62rem] text-[var(--on-surface-dim)] opacity-60">
                              +{job.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between border-t border-[var(--glass-border)] pt-4 mt-6">
                        <div className="flex items-center gap-1.5 text-[var(--on-surface-dim)] opacity-80">
                          {job.remote ? (
                            <IconDeviceLaptop size={14} className="text-[var(--secondary)]" />
                          ) : (
                            <IconBuilding size={14} />
                          )}
                          <span className="font-mono text-[0.68rem] tracking-tight">
                            {job.location}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isAdmin && (
                            <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingJob(job);
                                  setIsCreating(false);
                                }}
                                className="p-1.5 rounded-lg border border-[var(--glass-border)] bg-[var(--surface-low)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] hover:bg-[color-mix(in_srgb,var(--on-surface)_6%,transparent)] transition-all cursor-pointer"
                                title="Edit Role"
                              >
                                <IconEdit size={13} />
                              </button>
                              <button
                                onClick={(e) => handleDeleteJob(job.id, e)}
                                className="p-1.5 rounded-lg border border-red-500/20 bg-[var(--surface-low)] text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                                title="Delete Role"
                              >
                                <IconTrash size={13} />
                              </button>
                            </div>
                          )}
                          <Link
                            href={`/careers/${job.slug}`}
                            className="group/link flex items-center gap-1 font-mono text-[0.68rem] uppercase tracking-wider text-[var(--on-surface)] hover:text-[var(--primary)] transition-colors duration-200"
                          >
                            Explore Role
                            <IconChevronRight
                              size={12}
                              className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredOpenings.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <GlassPanel className="max-w-md mx-auto py-12 flex flex-col items-center gap-4">
                  <IconBriefcase
                    size={36}
                    stroke={1.2}
                    className="text-[var(--on-surface-dim)] opacity-40 animate-pulse"
                  />
                  <h3 className="title-serif text-[1.25rem] text-[var(--on-surface)]">
                    No positions match
                  </h3>
                  <p className="body-md text-[0.82rem] text-[var(--on-surface-dim)] max-w-xs">
                    Try adjusting your filters or search tags. If you&apos;re an elite builder, get
                    in touch anyway.
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setActiveKind("all");
                      setActiveDept("all");
                      setOnlyRemote(false);
                    }}
                    className="rounded-lg border border-[var(--glass-border)] px-4 py-2 font-mono text-[0.68rem] uppercase tracking-wider text-[var(--on-surface)] hover:bg-[color-mix(in_srgb,var(--on-surface)_5%,transparent)] transition-all"
                  >
                    Clear Filters
                  </button>
                </GlassPanel>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Inline Creation / Edit Dialog Modal */}
      <AnimatePresence>
        {editingJob && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
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
                  {isCreating ? "Create Job Opening Inline" : "Edit Job Opening Inline"}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingJob(null);
                    setIsCreating(false);
                  }}
                  className="rounded-full p-1 text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] hover:bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] transition-colors"
                >
                  <IconX size={18} />
                </button>
              </div>

              <form
                onSubmit={handleSaveJob}
                className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
              >
                {/* Title */}
                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    placeholder="e.g. Senior AI Systems Engineer"
                    className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)] transition-all"
                  />
                </div>

                {/* Grid for Kind, Department, Seniority */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Supply Channel
                    </label>
                    <select
                      value={editingJob.kind}
                      onChange={(e) =>
                        setEditingJob({ ...editingJob, kind: e.target.value as JobKind })
                      }
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    >
                      <option value="freelance">Freelance Project</option>
                      <option value="internal">Core Studio Hire</option>
                      <option value="outsourced">Client Placement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Department
                    </label>
                    <select
                      value={editingJob.department}
                      onChange={(e) => setEditingJob({ ...editingJob, department: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Product">Product Management</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Seniority
                    </label>
                    <input
                      type="text"
                      required
                      value={editingJob.seniority}
                      onChange={(e) => setEditingJob({ ...editingJob, seniority: e.target.value })}
                      placeholder="e.g. Senior / Lead"
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>

                {/* Grid for Location, Remote, Status */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      required
                      value={editingJob.location}
                      onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                      placeholder="e.g. Nairobi, Kenya"
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Remote Eligibility
                    </label>
                    <select
                      value={editingJob.remote ? "true" : "false"}
                      onChange={(e) =>
                        setEditingJob({ ...editingJob, remote: e.target.value === "true" })
                      }
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    >
                      <option value="true">Fully Remote</option>
                      <option value="false">On-site (Nairobi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Listing Status
                    </label>
                    <select
                      value={editingJob.status}
                      onChange={(e) =>
                        setEditingJob({ ...editingJob, status: e.target.value as JobStatus })
                      }
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    >
                      <option value="open">Open (Public)</option>
                      <option value="draft">Draft (Admin Only)</option>
                      <option value="closed">Closed / Filled</option>
                    </select>
                  </div>
                </div>

                {/* Compensation & Skills */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Compensation note
                    </label>
                    <input
                      type="text"
                      required
                      value={editingJob.compensation_note}
                      onChange={(e) =>
                        setEditingJob({ ...editingJob, compensation_note: e.target.value })
                      }
                      placeholder="e.g. $8,000 - $12,000 / mo"
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Skills tags (comma separated)
                    </label>
                    <input
                      type="text"
                      required
                      value={editingJob.skills.join(", ")}
                      onChange={(e) =>
                        setEditingJob({
                          ...editingJob,
                          skills: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="e.g. Next.js, Python, OpenAI API"
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>

                {/* Description MD */}
                <div className="text-left">
                  <MarkdownEditor
                    label="Job Description"
                    value={editingJob.description_md}
                    onChange={(val) => setEditingJob({ ...editingJob, description_md: val })}
                    placeholder="## The Role..."
                    rows={7}
                  />
                </div>

                {/* Save Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--glass-border)]">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingJob(null);
                      setIsCreating(false);
                    }}
                    className="rounded-xl border border-[var(--glass-border)] px-4 h-10 font-mono text-[0.7rem] uppercase tracking-wider text-[var(--on-surface-dim)] hover:bg-[color-mix(in_srgb,var(--on-surface)_5%,transparent)] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-[var(--on-surface)] px-5 h-10 font-mono text-[0.7rem] uppercase tracking-wider text-[var(--bg)] transition-all hover:bg-[color-mix(in_srgb,var(--on-surface)_90%,transparent)] active:scale-95"
                  >
                    <IconCheck size={14} />
                    {isCreating ? "Publish Opening" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PublicPageShell>
  );
}
