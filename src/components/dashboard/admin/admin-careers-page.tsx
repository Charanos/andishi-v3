"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconUserCheck,
  IconFileText,
  IconUsers,
  IconClock,
  IconDeviceLaptop,
  IconBuilding,
  IconStar,
  IconHistory,
  IconLink,
  IconBrandGithub,
  IconBrandLinkedin,
  IconWorld,
} from "@tabler/icons-react";
import type { Application, ApplicationEvent, JobOpening } from "@/db/schema/careers";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { KpiCard } from "@/components/dashboard/shared/kpi-card";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { EntityDrawer } from "@/components/dashboard/shared/entity-drawer";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import { useToast } from "@/components/dashboard/shared/toast-provider";
import { cn } from "@/lib/utils";

type JobKind = JobOpening["kind"];
type JobStatus = JobOpening["status"];
type ApplicationStage = Application["stage"];

type JobDraft = {
  id?: string;
  title: string;
  slug: string;
  kind: JobKind;
  department: string;
  location: string;
  remote: boolean;
  seniority: string;
  compensationNote: string;
  status: JobStatus;
  skills: string[];
  descriptionMd: string;
};

function toDraft(job?: JobOpening): JobDraft {
  return {
    id: job?.id,
    title: job?.title ?? "",
    slug: job?.slug ?? "",
    kind: job?.kind ?? "freelance",
    department: job?.department ?? "Engineering",
    location: job?.location ?? "Nairobi, Kenya",
    remote: job?.remote ?? true,
    seniority: job?.seniority ?? "Senior",
    compensationNote: job?.compensationNote ?? "",
    status: job?.status ?? "open",
    skills: job?.skills ?? [],
    descriptionMd: job?.descriptionMd ?? "",
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Mapping for kind labels
const kindMeta: Record<JobKind, { label: string; tone: "active" | "pending" | "available" }> = {
  freelance: { label: "Freelance", tone: "available" },
  internal: { label: "Studio Core", tone: "active" },
  outsourced: { label: "Placement", tone: "pending" },
};

const statusMeta: Record<JobStatus, { label: string; tone: "active" | "neutral" | "overdue" }> = {
  open: { label: "Open", tone: "active" },
  draft: { label: "Draft", tone: "neutral" },
  closed: { label: "Closed", tone: "overdue" },
};

const stageMeta: Record<
  ApplicationStage,
  { label: string; tone: "active" | "pending" | "available" | "neutral" | "overdue" }
> = {
  applied: { label: "Applied", tone: "neutral" },
  screening: { label: "Screening", tone: "pending" },
  interview: { label: "Interview", tone: "available" },
  offer: { label: "Offer Made", tone: "active" },
  hired: { label: "Hired", tone: "active" },
  rejected: { label: "Rejected", tone: "overdue" },
};

export function AdminCareersPage() {
  const [activeTab, setActiveTab] = useState<"openings" | "applications">("openings");
  const { notify } = useToast();

  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [filterKind, setFilterKind] = useState<JobKind | "all">("all");
  const [filterStatus, setFilterStatus] = useState<JobStatus | "all">("all");

  const [appSearch, setAppSearch] = useState("");
  const [filterJob, setFilterJob] = useState<string>("all");
  const [filterStage, setFilterStage] = useState<ApplicationStage | "all">("all");

  // Modals & Drawers
  const [editJob, setEditingJob] = useState<JobDraft | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingJob, setIsSavingJob] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [isDeletingJob, setIsDeletingJob] = useState(false);

  const [inspectApp, setInspectApp] = useState<Application | null>(null);
  const [appEvents, setAppEvents] = useState<ApplicationEvent[]>([]);

  useEffect(() => {
    const loadOpenings = async () => {
      try {
        const res = await fetch("/api/careers/openings");
        if (res.ok) setOpenings((await res.json()).openings ?? []);
      } catch {
        notify("Failed to load job openings", "error");
      }
    };

    const loadApplications = async () => {
      try {
        const res = await fetch("/api/careers/applications");
        if (res.ok) setApplications((await res.json()).applications ?? []);
      } catch {
        notify("Failed to load applications", "error");
      }
    };

    Promise.all([loadOpenings(), loadApplications()]).finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshInspected = async (id: string) => {
    try {
      const res = await fetch(`/api/careers/applications/${id}`);
      if (res.ok) {
        const data = await res.json();
        setInspectApp(data.application);
        setAppEvents(data.events ?? []);
      }
    } catch {
      // Keep current state if refresh fails
    }
  };

  // KPI Calculations
  const openJobsCount = useMemo(
    () => openings.filter((j) => j.status === "open").length,
    [openings],
  );
  const draftJobsCount = useMemo(
    () => openings.filter((j) => j.status === "draft").length,
    [openings],
  );
  const totalAppsCount = useMemo(() => applications.length, [applications]);

  const newAppsCount = useMemo(
    () => applications.filter((a) => a.stage === "applied").length,
    [applications],
  );
  const screeningAppsCount = useMemo(
    () => applications.filter((a) => a.stage === "screening").length,
    [applications],
  );
  const interviewAppsCount = useMemo(
    () => applications.filter((a) => a.stage === "interview").length,
    [applications],
  );
  const hiredAppsCount = useMemo(
    () => applications.filter((a) => a.stage === "hired").length,
    [applications],
  );

  // Filtered lists
  const filteredOpenings = useMemo(() => {
    return openings.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.department.toLowerCase().includes(search.toLowerCase()) ||
        job.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
      const matchesKind = filterKind === "all" ? true : job.kind === filterKind;
      const matchesStatus = filterStatus === "all" ? true : job.status === filterStatus;
      return matchesSearch && matchesKind && matchesStatus;
    });
  }, [openings, search, filterKind, filterStatus]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.applicantName.toLowerCase().includes(appSearch.toLowerCase()) ||
        app.applicantEmail.toLowerCase().includes(appSearch.toLowerCase());

      const matchesJob = filterJob === "all" ? true : app.jobOpeningId === filterJob;
      const matchesStage = filterStage === "all" ? true : app.stage === filterStage;

      return matchesSearch && matchesJob && matchesStage;
    });
  }, [applications, appSearch, filterJob, filterStage]);

  // Openings actions
  const handleOpenEdit = (job: JobOpening) => {
    setEditingJob(toDraft(job));
    setIsCreating(false);
  };

  const handleStartCreate = () => {
    setEditingJob(toDraft());
    setIsCreating(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editJob) return;

    const payload = {
      title: editJob.title,
      slug: editJob.slug || slugify(editJob.title),
      kind: editJob.kind,
      department: editJob.department,
      location: editJob.location,
      remote: editJob.remote,
      seniority: editJob.seniority,
      compensationNote: editJob.compensationNote || null,
      status: editJob.status,
      skills: editJob.skills,
      descriptionMd: editJob.descriptionMd,
    };

    setIsSavingJob(true);
    try {
      const res = isCreating
        ? await fetch("/api/careers/openings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/careers/openings/${editJob.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Save failed");
      }

      const data = await res.json();
      const saved: JobOpening = data.opening;

      setOpenings((prev) =>
        isCreating ? [saved, ...prev] : prev.map((o) => (o.id === saved.id ? saved : o)),
      );
      setEditingJob(null);
      setIsCreating(false);
      notify(isCreating ? "Job opening created" : "Job opening updated", "success");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setIsSavingJob(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!deletingJobId) return;
    setIsDeletingJob(true);
    try {
      const res = await fetch(`/api/careers/openings/${deletingJobId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setOpenings((prev) => prev.filter((o) => o.id !== deletingJobId));
      notify("Job opening deleted", "success");
    } catch {
      notify("Failed to delete job opening", "error");
    } finally {
      setIsDeletingJob(false);
      setDeletingJobId(null);
    }
  };

  // Inspect Application Drawer trigger
  const handleInspectApp = (app: Application) => {
    setInspectApp(app);
    setAppEvents([]);
    refreshInspected(app.id);
  };

  // Progress Candidate
  const handleStageChange = async (stage: ApplicationStage) => {
    if (!inspectApp) return;
    try {
      const res = await fetch(`/api/careers/applications/${inspectApp.id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      setApplications((prev) => prev.map((a) => (a.id === data.application.id ? data.application : a)));
      await refreshInspected(inspectApp.id);
      notify(`Moved to ${stageMeta[stage].label}`, "success");
    } catch {
      notify("Failed to update stage", "error");
    }
  };

  // Rate Candidate
  const handleRateCandidate = async (rating: number) => {
    if (!inspectApp) return;
    try {
      const res = await fetch(`/api/careers/applications/${inspectApp.id}/rating`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      setApplications((prev) => prev.map((a) => (a.id === data.application.id ? data.application : a)));
      await refreshInspected(inspectApp.id);
      notify("Rating saved", "success");
    } catch {
      notify("Failed to save rating", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-[92rem] mx-auto px-4 py-8 sm:px-6 lg:px-8 text-[var(--on-surface)]">
      <DashboardPageHeader
        title="Careers & Recruiter Console"
        description="Admin panel to manage Andishi's supply-side talent channels. Design open job slots, review inbound candidate profiles, score engineer resumes, and progress hires."
        actions={
          activeTab === "openings" ? (
            <button
              onClick={handleStartCreate}
              className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[var(--on-surface)] px-4 py-2 font-mono text-[0.7rem] uppercase tracking-wider text-[var(--bg)] transition-all hover:scale-[1.02] active:scale-95"
            >
              <IconPlus size={14} />
              Add Job Opening
            </button>
          ) : undefined
        }
      />

      {/* Tabs Switcher */}
      <div className="flex border-b border-[var(--glass-border)] pb-px">
        <button
          onClick={() => {
            setActiveTab("openings");
            setSearch("");
          }}
          className={cn(
            "relative cursor-pointer py-3.5 px-6 font-mono text-[0.75rem] uppercase tracking-wider transition-colors duration-200",
            activeTab === "openings"
              ? "text-[var(--primary)] border-b-2 border-[var(--primary)] font-normal"
              : "text-[var(--on-surface-dim)] opacity-60 hover:opacity-100",
          )}
        >
          Job Openings ({openings.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("applications");
            setAppSearch("");
          }}
          className={cn(
            "relative cursor-pointer py-3.5 px-6 font-mono text-[0.75rem] uppercase tracking-wider transition-colors duration-200",
            activeTab === "applications"
              ? "text-[var(--primary)] border-b-2 border-[var(--primary)] font-normal"
              : "text-[var(--on-surface-dim)] opacity-60 hover:opacity-100",
          )}
        >
          Applications Queue ({applications.length})
        </button>
      </div>

      {/* OPENINGS WORKSPACE */}
      {activeTab === "openings" && (
        <div className="space-y-6">
          {/* KPI strip */}
          <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
            <KpiCard
              label="Active Positions"
              value={openJobsCount.toString()}
              trend="Published public listings"
              icon={IconUserCheck}
              chart="line"
              data={[2, 3, 2, 4, 3, 3, openJobsCount]}
            />
            <KpiCard
              label="Draft Positions"
              value={draftJobsCount.toString()}
              trend="In prep or internal staging"
              icon={IconFileText}
              chart="bar"
              data={[1, 0, 1, 0, 2, 1, draftJobsCount]}
            />
            <KpiCard
              label="Candidate Pipeline"
              value={totalAppsCount.toString()}
              trend="Inbound profiles submitted"
              icon={IconUsers}
              chart="line"
              data={[1, 2, 2, 3, 4, 4, totalAppsCount]}
            />
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 backdrop-blur-md">
            <div className="relative min-w-[260px] max-md:w-full">
              <IconSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--on-surface-dim)] opacity-50" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] pl-10 pr-4 text-[0.82rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)] placeholder-[var(--on-surface-dim)]/50 transition-all"
              />
            </div>

            <select
              value={filterKind}
              onChange={(e) => setFilterKind(e.target.value as JobKind | "all")}
              className="h-10 cursor-pointer rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.82rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
            >
              <option value="all" className="bg-[var(--surface)] text-[var(--on-surface)]">All Channels</option>
              <option value="freelance" className="bg-[var(--surface)] text-[var(--on-surface)]">Freelance Projects</option>
              <option value="internal" className="bg-[var(--surface)] text-[var(--on-surface)]">Studio Core</option>
              <option value="outsourced" className="bg-[var(--surface)] text-[var(--on-surface)]">Placements</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as JobStatus | "all")}
              className="h-10 cursor-pointer rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.82rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
            >
              <option value="all" className="bg-[var(--surface)] text-[var(--on-surface)]">All Status</option>
              <option value="open" className="bg-[var(--surface)] text-[var(--on-surface)]">Open (Public)</option>
              <option value="draft" className="bg-[var(--surface)] text-[var(--on-surface)]">Draft</option>
              <option value="closed" className="bg-[var(--surface)] text-[var(--on-surface)]">Closed</option>
            </select>

            {search || filterKind !== "all" || filterStatus !== "all" ? (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterKind("all");
                  setFilterStatus("all");
                }}
                className="cursor-pointer text-[0.74rem] font-mono uppercase tracking-wider text-[var(--primary)] hover:underline pl-2"
              >
                Clear filters
              </button>
            ) : null}
          </div>

          {/* Openings Table */}
          <div className="overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--glass-border)] bg-white/5 font-mono text-[0.68rem] uppercase tracking-wider text-[var(--on-surface-dim)]">
                    <th className="py-4 px-5">Role Title</th>
                    <th className="py-4 px-5">Channel</th>
                    <th className="py-4 px-5">Department</th>
                    <th className="py-4 px-5">Location</th>
                    <th className="py-4 px-5">Compensation</th>
                    <th className="py-4 px-5">Applicants</th>
                    <th className="py-4 px-5 text-center">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border)] text-[0.82rem] text-[var(--on-surface-dim)]">
                  {isLoading && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center">
                        <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                      </td>
                    </tr>
                  )}
                  {!isLoading &&
                    filteredOpenings.map((job) => {
                      const kindInfo = kindMeta[job.kind];
                      const statusInfo = statusMeta[job.status];
                      const appCount = applications.filter((a) => a.jobOpeningId === job.id).length;

                      return (
                        <tr key={job.id} className="hover:bg-white/[0.02] transition-colors group/row">
                          <td className="py-4 px-5 font-medium text-[var(--on-surface)]">
                            <Link
                              href={`/careers/${job.slug}`}
                              target="_blank"
                              className="hover:underline hover:text-[var(--primary)]"
                            >
                              {job.title}
                            </Link>
                          </td>
                          <td className="py-4 px-5">
                            <StatusBadge label={kindInfo.label} tone={kindInfo.tone} />
                          </td>
                          <td className="py-4 px-5">{job.department}</td>
                          <td className="py-4 px-5">
                            <span className="inline-flex items-center gap-1">
                              {job.remote ? (
                                <IconDeviceLaptop size={12} className="text-[var(--secondary)]" />
                              ) : (
                                <IconBuilding size={12} />
                              )}
                              {job.location}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-mono text-[0.74rem]">
                            {job.compensationNote}
                          </td>
                          <td className="py-4 px-5 font-mono">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[0.72rem]",
                                appCount > 0
                                  ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20"
                                  : "bg-white/5 border border-white/5 opacity-55",
                              )}
                            >
                              {appCount} candidates
                            </span>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <StatusBadge label={statusInfo.label} tone={statusInfo.tone} />
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover/row:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenEdit(job)}
                                className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] transition-all duration-200 hover:scale-105 hover:text-white hover:border-[var(--on-surface)]"
                                title="Edit position"
                              >
                                <IconEdit size={14} />
                              </button>
                              <button
                                onClick={() => setDeletingJobId(job.id)}
                                className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-red-400 transition-all duration-200 hover:scale-105 hover:bg-red-500/10 hover:border-red-500"
                                title="Delete position"
                              >
                                <IconTrash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {!isLoading && filteredOpenings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[var(--on-surface-dim)] opacity-55">
                        No positions found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* APPLICATIONS QUEUE WORKSPACE */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          {/* KPI grid */}
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="New Candidates"
              value={newAppsCount.toString()}
              trend="Applied stage (action needed)"
              icon={IconUsers}
              chart="bar"
              data={[1, 2, 0, 1, 2, 2, newAppsCount]}
            />
            <KpiCard
              label="In Screening"
              value={screeningAppsCount.toString()}
              trend="Actively reviewing specs"
              icon={IconSearch}
              chart="line"
              data={[0, 1, 1, 2, 1, 1, screeningAppsCount]}
            />
            <KpiCard
              label="Scheduled Interviews"
              value={interviewAppsCount.toString()}
              trend="Technicals or client chats"
              icon={IconClock}
              chart="line"
              data={[0, 0, 1, 1, 2, 1, interviewAppsCount]}
            />
            <KpiCard
              label="Placed / Hired"
              value={hiredAppsCount.toString()}
              trend="Hired internally or placed"
              icon={IconCheck}
              chart="line"
              data={[0, 0, 1, 1, 1, 2, hiredAppsCount]}
            />
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 backdrop-blur-md">
            <div className="relative min-w-[260px] max-md:w-full">
              <IconSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--on-surface-dim)] opacity-50" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] pl-10 pr-4 text-[0.82rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)] placeholder-[var(--on-surface-dim)]/50 transition-all"
              />
            </div>

            <select
              value={filterJob}
              onChange={(e) => setFilterJob(e.target.value)}
              className="h-10 max-w-[200px] cursor-pointer rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.82rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
            >
              <option value="all" className="bg-[var(--surface)] text-[var(--on-surface)]">All Positions</option>
              {openings.map((job) => (
                <option key={job.id} value={job.id} className="bg-[var(--surface)] text-[var(--on-surface)]">
                  {job.title}
                </option>
              ))}
            </select>

            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value as ApplicationStage | "all")}
              className="h-10 cursor-pointer rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.82rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
            >
              <option value="all" className="bg-[var(--surface)] text-[var(--on-surface)]">All Stages</option>
              <option value="applied" className="bg-[var(--surface)] text-[var(--on-surface)]">Applied</option>
              <option value="screening" className="bg-[var(--surface)] text-[var(--on-surface)]">Screening</option>
              <option value="interview" className="bg-[var(--surface)] text-[var(--on-surface)]">Interview</option>
              <option value="offer" className="bg-[var(--surface)] text-[var(--on-surface)]">Offer Made</option>
              <option value="hired" className="bg-[var(--surface)] text-[var(--on-surface)]">Hired</option>
              <option value="rejected" className="bg-[var(--surface)] text-[var(--on-surface)]">Rejected</option>
            </select>

            {appSearch || filterJob !== "all" || filterStage !== "all" ? (
              <button
                onClick={() => {
                  setAppSearch("");
                  setFilterJob("all");
                  setFilterStage("all");
                }}
                className="cursor-pointer text-[0.74rem] font-mono uppercase tracking-wider text-[var(--primary)] hover:underline pl-2"
              >
                Clear filters
              </button>
            ) : null}
          </div>

          {/* Applications Queue Table */}
          <div className="overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--glass-border)] bg-white/5 font-mono text-[0.68rem] uppercase tracking-wider text-[var(--on-surface-dim)]">
                    <th className="py-4 px-5">Candidate Name</th>
                    <th className="py-4 px-5">Applied Position</th>
                    <th className="py-4 px-5">Submit Date</th>
                    <th className="py-4 px-5">Stage</th>
                    <th className="py-4 px-5 text-center">Score / Rating</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border)] text-[0.82rem] text-[var(--on-surface-dim)]">
                  {isLoading && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                      </td>
                    </tr>
                  )}
                  {!isLoading &&
                    filteredApplications.map((app) => {
                      const targetJob = openings.find((j) => j.id === app.jobOpeningId);
                      const stageInfo = stageMeta[app.stage];

                      return (
                        <tr key={app.id} className="hover:bg-white/[0.02] transition-colors group/row">
                          <td className="py-4 px-5">
                            <button
                              onClick={() => handleInspectApp(app)}
                              className="cursor-pointer font-medium text-[var(--on-surface)] hover:underline hover:text-[var(--primary)] text-left"
                            >
                              {app.applicantName}
                            </button>
                            <div className="text-[0.7rem] opacity-50 font-mono mt-0.5">
                              {app.applicantEmail}
                            </div>
                          </td>
                          <td className="py-4 px-5 text-[0.82rem]">
                            {targetJob ? targetJob.title : "Unknown Position"}
                          </td>
                          <td className="py-4 px-5 font-mono text-[0.74rem]">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-5">
                            <StatusBadge label={stageInfo.label} tone={stageInfo.tone} />
                          </td>
                          <td className="py-4 px-5 text-center">
                            <div className="flex items-center justify-center gap-0.5 text-amber-400">
                              {app.rating ? (
                                Array.from({ length: app.rating }).map((_, i) => (
                                  <IconStar key={i} size={13} fill="currentColor" />
                                ))
                              ) : (
                                <span className="text-[0.7rem] font-mono opacity-40">Unrated</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() => handleInspectApp(app)}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-wider text-[var(--on-surface)] transition-all duration-200 hover:scale-105 hover:bg-white/5"
                            >
                              Review Profile
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {!isLoading && filteredApplications.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[var(--on-surface-dim)] opacity-55">
                        No applications in queue matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT JOB OPENING MODAL */}
      <AnimatePresence>
        {editJob && (
          <div
            className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
          >
            <form
              onSubmit={handleSaveJob}
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-6 shadow-2xl backdrop-blur-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4 mb-5">
                <h2 className="title-serif text-[1.4rem] text-[var(--on-surface)]">
                  {isCreating ? "Create Job Opening" : "Edit Job Opening"}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="cursor-pointer rounded-full p-1 text-[var(--on-surface-dim)] hover:text-white hover:bg-white/10"
                >
                  <IconX size={18} />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto pr-1 flex-1 pb-4">
                {/* Title */}
                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editJob.title}
                    onChange={(e) => setEditingJob({ ...editJob, title: e.target.value })}
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
                      value={editJob.kind}
                      onChange={(e) => setEditingJob({ ...editJob, kind: e.target.value as JobKind })}
                      className="h-10 w-full cursor-pointer rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
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
                      value={editJob.department}
                      onChange={(e) => setEditingJob({ ...editJob, department: e.target.value })}
                      className="h-10 w-full cursor-pointer rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
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
                      value={editJob.seniority}
                      onChange={(e) => setEditingJob({ ...editJob, seniority: e.target.value })}
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
                      value={editJob.location}
                      onChange={(e) => setEditingJob({ ...editJob, location: e.target.value })}
                      placeholder="e.g. Nairobi, Kenya"
                      className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                      Remote Eligibility
                    </label>
                    <select
                      value={editJob.remote ? "true" : "false"}
                      onChange={(e) => setEditingJob({ ...editJob, remote: e.target.value === "true" })}
                      className="h-10 w-full cursor-pointer rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
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
                      value={editJob.status}
                      onChange={(e) => setEditingJob({ ...editJob, status: e.target.value as JobStatus })}
                      className="h-10 w-full cursor-pointer rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
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
                      value={editJob.compensationNote}
                      onChange={(e) => setEditingJob({ ...editJob, compensationNote: e.target.value })}
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
                      value={editJob.skills.join(", ")}
                      onChange={(e) =>
                        setEditingJob({
                          ...editJob,
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
                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Job Description (Markdown Allowed)
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={editJob.descriptionMd}
                    onChange={(e) => setEditingJob({ ...editJob, descriptionMd: e.target.value })}
                    placeholder="## The Role..."
                    className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] p-3 font-sans text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Save Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--glass-border)] shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  disabled={isSavingJob}
                  className="cursor-pointer rounded-xl border border-[var(--glass-border)] px-4 h-10 font-mono text-[0.7rem] uppercase tracking-wider text-[var(--on-surface-dim)] hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingJob}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white px-5 h-10 font-mono text-[0.7rem] uppercase tracking-wider text-black transition-all hover:bg-white/90 disabled:opacity-70"
                >
                  {isSavingJob ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  ) : (
                    <IconCheck size={14} />
                  )}
                  {isSavingJob ? "Saving…" : isCreating ? "Publish Opening" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE JOB */}
      <ConfirmDialog
        open={deletingJobId !== null}
        title="Delete Job Opening?"
        description="This action is permanent and will remove the job opening from the directory. Any existing applications tied to this opening will remain in the database but will reference a removed role."
        confirmLabel={isDeletingJob ? "Deleting…" : "Permanently Delete"}
        onCancel={() => setDeletingJobId(null)}
        onConfirm={handleDeleteJob}
      />

      {/* INSPECT CANDIDATE DRAWER */}
      <EntityDrawer
        open={inspectApp !== null}
        onClose={() => setInspectApp(null)}
        title={inspectApp ? `Candidate: ${inspectApp.applicantName}` : "Application Review"}
      >
        {inspectApp && (
          <div className="space-y-6 text-[var(--on-surface)]">
            {/* Top section overview */}
            <div className="flex flex-col gap-5 border-b border-[var(--glass-border)] pb-6 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-mono text-[0.7rem] uppercase tracking-wider text-[var(--primary)] mb-1">
                  Applied Profile
                </p>
                <h3 className="title-serif text-[1.4rem] font-normal leading-tight text-[var(--on-surface)]">
                  {inspectApp.applicantName}
                </h3>
                <p className="font-mono text-[0.74rem] text-[var(--on-surface-dim)] mt-1">
                  Email:{" "}
                  <a
                    href={`mailto:${inspectApp.applicantEmail}`}
                    className="text-white hover:underline"
                  >
                    {inspectApp.applicantEmail}
                  </a>
                </p>
              </div>

              {/* Rating block */}
              <div className="flex flex-col items-start gap-1.5 md:items-end">
                <span className="font-mono text-[0.66rem] uppercase tracking-wider text-[var(--on-surface-dim)] opacity-70">
                  Assign Rating
                </span>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRateCandidate(star)}
                      className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    >
                      <IconStar
                        size={18}
                        fill={star <= (inspectApp.rating || 0) ? "currentColor" : "transparent"}
                        strokeWidth={1.8}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main grid splitter */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Application Details */}
              <div className="space-y-5">
                <div>
                  <h4 className="font-mono text-[0.7rem] uppercase tracking-wider text-[var(--on-surface-dim)] mb-1.5">
                    Position Target
                  </h4>
                  <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] p-3 flex items-center justify-between">
                    <span className="font-medium text-[var(--on-surface)]">
                      {openings.find((j) => j.id === inspectApp.jobOpeningId)?.title ||
                        "Unknown position"}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-mono text-[0.7rem] uppercase tracking-wider text-[var(--on-surface-dim)] mb-1.5">
                    Stage Control
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["applied", "screening", "interview", "offer", "hired", "rejected"] as const).map(
                      (stage) => {
                        const current = inspectApp.stage === stage;
                        return (
                          <button
                            key={stage}
                            onClick={() => handleStageChange(stage)}
                            className={cn(
                              "h-9 cursor-pointer rounded-lg border text-[0.75rem] font-mono uppercase tracking-wider transition-all",
                              current
                                ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] font-medium"
                                : "border-[var(--glass-border)] bg-transparent text-[var(--on-surface-dim)] hover:bg-white/5",
                            )}
                          >
                            {stageMeta[stage].label}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-mono text-[0.7rem] uppercase tracking-wider text-[var(--on-surface-dim)] mb-1.5">
                    Developer Links
                  </h4>
                  <div className="space-y-2">
                    {inspectApp.resumeUrl && (
                      <a
                        href={inspectApp.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] p-3 text-[0.8rem] text-[var(--on-surface)] hover:bg-white/5 transition-colors"
                      >
                        <IconFileText size={16} className="text-[var(--primary)]" />
                        <span className="truncate flex-1 font-medium">Review Resume / CV file</span>
                        <IconLink size={12} className="opacity-55" />
                      </a>
                    )}
                    {inspectApp.links?.github && (
                      <a
                        href={inspectApp.links.github}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] p-3 text-[0.8rem] text-[var(--on-surface)] hover:bg-white/5 transition-colors"
                      >
                        <IconBrandGithub size={16} />
                        <span className="truncate flex-1 font-mono text-[0.74rem]">GitHub profile</span>
                        <IconLink size={12} className="opacity-55" />
                      </a>
                    )}
                    {inspectApp.links?.linkedin && (
                      <a
                        href={inspectApp.links.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] p-3 text-[0.8rem] text-[var(--on-surface)] hover:bg-white/5 transition-colors"
                      >
                        <IconBrandLinkedin size={16} className="text-blue-400" />
                        <span className="truncate flex-1 font-mono text-[0.74rem]">LinkedIn profile</span>
                        <IconLink size={12} className="opacity-55" />
                      </a>
                    )}
                    {inspectApp.links?.portfolio && (
                      <a
                        href={inspectApp.links.portfolio}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] p-3 text-[0.8rem] text-[var(--on-surface)] hover:bg-white/5 transition-colors"
                      >
                        <IconWorld size={16} className="text-emerald-400" />
                        <span className="truncate flex-1 font-mono text-[0.74rem]">Portfolio / Site</span>
                        <IconLink size={12} className="opacity-55" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover Note & Audit Logs */}
              <div className="space-y-5">
                <div>
                  <h4 className="font-mono text-[0.7rem] uppercase tracking-wider text-[var(--on-surface-dim)] mb-1.5">
                    Cover Pitch
                  </h4>
                  <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] p-4 text-[0.84rem] text-[var(--on-surface-dim)] leading-relaxed max-h-[160px] overflow-y-auto">
                    {inspectApp.coverNote ? (
                      inspectApp.coverNote
                    ) : (
                      <span className="italic opacity-45">No cover note submitted.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-mono text-[0.7rem] uppercase tracking-wider text-[var(--on-surface-dim)] mb-1.5 flex items-center gap-1.5">
                    <IconHistory size={14} />
                    Recruitment Audit Trail
                  </h4>
                  <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] p-4 space-y-4 max-h-[220px] overflow-y-auto">
                    {appEvents.map((evt) => (
                      <div key={evt.id} className="relative flex gap-3 text-[0.76rem] group/evt">
                        <div className="flex flex-col items-center">
                          <span className="h-2 w-2 rounded-full bg-[var(--primary)] mt-1.5" />
                          <span className="w-px flex-1 bg-[var(--glass-border)] group-last/evt:hidden" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[var(--on-surface)] leading-none font-medium">{evt.note}</p>
                          <div className="flex items-center gap-1.5 text-[0.66rem] text-[var(--on-surface-dim)] opacity-60 mt-1">
                            <span>{evt.userId ? "Staff" : "System"}</span>
                            <span>&bull;</span>
                            <span>{new Date(evt.occurredAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {appEvents.length === 0 && (
                      <div className="text-center py-4 text-[0.78rem] text-[var(--on-surface-dim)] opacity-55">
                        No timeline logs.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </EntityDrawer>
    </div>
  );
}
