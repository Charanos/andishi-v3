"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  IconAlertTriangle,
  IconArchive,
  IconArrowRight,
  IconCalendarTime,
  IconCheck,
  IconClock,
  IconCode,
  IconDatabaseExport,
  IconDownload,
  IconEdit,
  IconEye,
  IconLock,
  IconPlus,
  IconReportAnalytics,
  IconSearch,
  IconShieldCheck,
  IconTrash,
  IconUsers,
  IconX,
  type Icon,
} from "@tabler/icons-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import {
  DashboardDonutChart,
} from "@/components/dashboard/shared/dashboard-chart";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { EntityDrawer } from "@/components/dashboard/shared/entity-drawer";
import { ModalShell } from "@/components/dashboard/shared/modal-shell";
import {
  OperationalDataTable,
  type OperationalTableColumn,
} from "@/components/dashboard/shared/operational-data-table";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { useToast } from "@/components/dashboard/shared/toast-provider";
import { AdminPlatformNav } from "@/components/dashboard/admin/admin-platform-nav";
import { SectionDivider } from "@/components/ui/section-divider";
import { cn } from "@/lib/utils";

type AuditStatus = "clean" | "review" | "exception" | "scheduled";
type AuditSurface = "commercial" | "identity" | "delivery" | "content" | "support";
type AuditSeverity = "low" | "medium" | "high";

function SectionHeader({ description, eyebrow, title }: { description: string; eyebrow: string; title: string }) {
  return <div><p className="label-caps text-[var(--primary)]">{eyebrow}</p><h2 className="title-serif mt-3 text-[clamp(1.48rem,2vw,1.9rem)] font-medium text-[var(--on-surface)]">{title}</h2><p className="mt-2 max-w-3xl text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">{description}</p></div>;
}

type AuditRecord = {
  actor: string;
  amountProtected: number;
  clientVisible: boolean;
  developerVisible: boolean;
  evidence: string[];
  id: string;
  updatedAt: string;
  nextAction: string;
  owner: string;
  policy: string;
  reportCadence: string;
  scope: string;
  severity: AuditSeverity;
  status: AuditStatus;
  surface: AuditSurface;
  title: string;
  imageUrl?: string | null;
};

type AuditFormValues = Omit<AuditRecord, "id" | "updatedAt">;

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(iso));
}

/**
 * Turns the free-text cadence label into a real interval instead of leaving
 * it purely decorative - this is what makes "Weekly" etc. an operational
 * commitment (a control can go overdue) rather than just a tag on a card.
 */
function cadenceDays(cadence: string): number {
  const normalized = cadence.trim().toLowerCase();
  if (normalized === "daily") return 1;
  if (normalized === "weekly") return 7;
  if (normalized === "monthly") return 30;
  if (normalized === "quarterly") return 90;
  return 30;
}

function nextReviewDue(record: Pick<AuditRecord, "reportCadence" | "updatedAt">) {
  return new Date(new Date(record.updatedAt).getTime() + cadenceDays(record.reportCadence) * 86_400_000);
}

/**
 * An exception is already a known problem being tracked on its own terms -
 * "overdue" is specifically about controls nobody has checked on within
 * their committed cadence, which is a different (and easy to miss) failure
 * mode: the boundary might be fine, or might have silently drifted.
 */
function isOverdue(record: Pick<AuditRecord, "reportCadence" | "status" | "updatedAt">) {
  if (record.status === "exception") return false;
  return nextReviewDue(record).getTime() < Date.now();
}

function overdueBy(record: Pick<AuditRecord, "reportCadence" | "updatedAt">) {
  const days = Math.floor((Date.now() - nextReviewDue(record).getTime()) / 86_400_000);
  return days <= 0 ? "Due today" : days === 1 ? "1 day overdue" : `${days} days overdue`;
}

/** Dynamic labels so the transition button always states what it actually does, not a generic "Advance". */
const nextActionCta: Record<AuditStatus, string> = {
  clean: "Schedule next review",
  exception: "Begin remediation",
  review: "Confirm resolved",
  scheduled: "Start review",
};

/** Same intent, shorter - for tight spaces (queue cards) where the full phrase would wrap or crowd. */
const nextActionCtaCompact: Record<AuditStatus, string> = {
  clean: "Schedule",
  exception: "Remediate",
  review: "Resolve",
  scheduled: "Start review",
};

const formInputClass = "h-12 w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.92rem] text-[var(--on-surface)] outline-none transition-colors placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_60%,transparent)] focus:border-[color-mix(in_srgb,var(--primary)_60%,transparent)] focus:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)]";
const formTextareaClass = "w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 text-[0.92rem] text-[var(--on-surface)] outline-none transition-colors focus:border-[color-mix(in_srgb,var(--primary)_60%,transparent)] focus:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)]";

const surfaceLabel: Record<AuditSurface, string> = {
  commercial: "Commercial",
  content: "Content",
  delivery: "Delivery",
  identity: "Identity",
  support: "Support",
};

const statusOrder: AuditStatus[] = ["exception", "review", "scheduled", "clean"];

const statusMeta: Record<
  AuditStatus,
  { label: string; next: AuditStatus | null; tone: "active" | "available" | "neutral" | "overdue" | "pending" }
> = {
  clean: { label: "Clean", next: "scheduled", tone: "active" },
  exception: { label: "Exception", next: "review", tone: "overdue" },
  review: { label: "Review", next: "clean", tone: "pending" },
  scheduled: { label: "Scheduled", next: "clean", tone: "available" },
};

const severityMeta: Record<AuditSeverity, { label: string; tone: "active" | "overdue" | "pending" }> = {
  high: { label: "High", tone: "overdue" },
  low: { label: "Low", tone: "active" },
  medium: { label: "Medium", tone: "pending" },
};

function buildInitialAuditFormValues(record?: AuditRecord | null): AuditFormValues {
  if (record) {
    return {
      actor: record.actor,
      amountProtected: record.amountProtected,
      clientVisible: record.clientVisible,
      developerVisible: record.developerVisible,
      evidence: record.evidence,
      nextAction: record.nextAction,
      owner: record.owner,
      policy: record.policy,
      reportCadence: record.reportCadence,
      scope: record.scope,
      severity: record.severity,
      status: record.status,
      surface: record.surface,
      title: record.title,
      imageUrl: record.imageUrl,
    };
  }
  return {
    actor: "Admin",
    amountProtected: 0,
    clientVisible: true,
    developerVisible: false,
    evidence: ["Initial evidence required"],
    nextAction: "Assign owner and attach evidence",
    owner: "Dennis",
    policy: "Define the role boundary and evidence rule for this control",
    reportCadence: "Weekly",
    scope: "New governance scope",
    severity: "medium",
    status: "review",
    surface: "commercial",
    title: "",
    imageUrl: null,
  };
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Client-side CSV of whatever's currently filtered/visible - exporting a
 * governance register only matters if it reflects what someone is actually
 * looking at ("just the overdue ones", "just Commercial"), not a fixed
 * full-table dump every time.
 */
function exportEvidenceCsv(records: AuditRecord[]) {
  const header = ["Title", "Scope", "Surface", "Status", "Severity", "Overdue", "Owner", "Actor", "Protected ($)", "Client Visible", "Developer Visible", "Cadence", "Next Review Due", "Policy", "Next Action", "Evidence Trail", "Last Updated"];
  const rows = records.map((record) => [
    record.title,
    record.scope,
    surfaceLabel[record.surface],
    statusMeta[record.status].label,
    severityMeta[record.severity].label,
    isOverdue(record) ? "Yes" : "No",
    record.owner,
    record.actor,
    String(record.amountProtected),
    record.clientVisible ? "Yes" : "No",
    record.developerVisible ? "Yes" : "No",
    record.reportCadence,
    new Intl.DateTimeFormat("en-CA").format(nextReviewDue(record)),
    record.policy,
    record.nextAction,
    record.evidence.join(" | "),
    new Intl.DateTimeFormat("en-CA").format(new Date(record.updatedAt)),
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `governance-controls-${new Intl.DateTimeFormat("en-CA").format(new Date())}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

async function readGovernanceError(res: Response, fallback: string) {
  try {
    const body = await res.json();
    return typeof body?.error === "string" ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export function AdminAuditPage() {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [surfaceFilter, setSurfaceFilter] = useState<AuditSurface | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AuditStatus | "all">("all");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [drawerRecord, setDrawerRecord] = useState<AuditRecord | null>(null);
  const { notify } = useToast();
  const [confirmRecord, setConfirmRecord] = useState<AuditRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AuditRecord | null>(null);
  const [advanceTarget, setAdvanceTarget] = useState<AuditRecord | null>(null);

  const selected = records.find((record) => record.id === selectedId) ?? records[0] ?? null;

  useEffect(() => {
    const loadControls = async () => {
      try {
        const res = await fetch("/api/governance-controls");
        if (res.ok) {
          const data = await res.json();
          setRecords(data.controls ?? []);
        } else {
          notify("Failed to load governance controls", "error");
        }
      } catch {
        notify("Failed to load governance controls", "error");
      } finally {
        setLoading(false);
      }
    };
    loadControls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records
      .filter((record) => {
        const haystack = `${record.title} ${record.scope} ${record.owner} ${record.policy} ${record.nextAction} ${record.evidence.join(" ")}`.toLowerCase();
        return (
          (!needle || haystack.includes(needle)) &&
          (surfaceFilter === "all" || record.surface === surfaceFilter) &&
          (statusFilter === "all" || record.status === statusFilter) &&
          (!overdueOnly || isOverdue(record))
        );
      })
      .sort((a, b) => {
        // A known, active exception always outranks a merely-overdue check-in
        // - one is a confirmed problem, the other just means nobody has
        // looked yet (the boundary may still be fine).
        const exceptionRank = Number(b.status === "exception") - Number(a.status === "exception");
        if (exceptionRank !== 0) return exceptionRank;
        const overdueRank = Number(isOverdue(b)) - Number(isOverdue(a));
        if (overdueRank !== 0) return overdueRank;
        const severityRank = severityScore(b.severity) - severityScore(a.severity);
        if (severityRank !== 0) return severityRank;
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      });
  }, [records, query, statusFilter, surfaceFilter, overdueOnly]);

  const stats = useMemo(() => buildAuditStats(records), [records]);
  const drawerRank = drawerRecord ? Math.max(0, filtered.findIndex((record) => record.id === drawerRecord.id)) + 1 : 0;

  // Custom columns logic moved into AuditLedger inline component below.

  const createRecord = async (values: AuditFormValues) => {
    setSavingId("create");
    try {
      const res = await fetch("/api/governance-controls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(await readGovernanceError(res, "Failed to create governance control."));
      const { control } = await res.json();
      setRecords((current) => [control, ...current]);
      setSelectedId(control.id);
      setCreateOpen(false);
      notify("Governance control created", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Failed to create governance control.", "error");
    } finally {
      setSavingId(null);
    }
  };

  const updateRecord = async (id: string, patch: Partial<AuditFormValues>, successMessage = "Governance control updated") => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/governance-controls/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(await readGovernanceError(res, "Failed to update governance control."));
      const { control } = await res.json();
      setRecords((current) => current.map((entry) => (entry.id === control.id ? control : entry)));
      setSelectedId(control.id);
      setDrawerRecord((current) => (current?.id === control.id ? control : current));
      setEditRecord(null);
      notify(successMessage, "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Failed to update governance control.", "error");
    } finally {
      setSavingId(null);
    }
  };

  const confirmAdvance = (note: string) => {
    if (!advanceTarget) return;
    const record = advanceTarget;
    const next = statusMeta[record.status].next;
    if (!next) return;
    const entry = `[${statusMeta[record.status].label} → ${statusMeta[next].label}] ${note}`;
    updateRecord(
      record.id,
      { status: next, evidence: [entry, ...record.evidence] },
      `Advanced to ${statusMeta[next].label}`,
    );
    setAdvanceTarget(null);
  };

  const archiveRecord = async () => {
    if (!confirmRecord) return;
    const record = confirmRecord;
    setSavingId(record.id);
    try {
      const res = await fetch(`/api/governance-controls/${record.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readGovernanceError(res, "Failed to archive governance control."));
      setRecords((current) => current.filter((entry) => entry.id !== record.id));
      setSelectedId((current) => (current !== record.id ? current : records.find((entry) => entry.id !== record.id)?.id ?? ""));
      setConfirmRecord(null);
      if (drawerRecord?.id === record.id) setDrawerRecord(null);
      notify("Governance control archived", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Failed to archive governance control.", "error");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="relative min-w-0 pb-12 pt-10 md:pt-10 lg:pt-12">
      {/* Page-level Cosmic Mesh Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--primary)_8%,transparent),transparent_70%)] blur-3xl opacity-50" />
        <div className="absolute top-[30%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--secondary)_6%,transparent),transparent_70%)] blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 grid gap-9 md:gap-10 lg:gap-12">
      <DashboardPageHeader
        className="mb-0"
        title="Audit reports"
        description="Govern commercial boundaries, identity changes, delivery evidence, support communications, and proof consent without exposing client revenue or developer compensation to the wrong party."
        status={<StatusBadge label={loading ? "Syncing..." : "Governance live"} tone={loading ? "neutral" : "active"} />}
        actions={
          <>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.84rem] font-medium text-[var(--bg)]"
            >
              <IconPlus size={15} stroke={1.8} />
              New control
            </button>
            <button
              type="button"
              onClick={() => exportEvidenceCsv(filtered)}
              disabled={filtered.length === 0}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.84rem] font-medium text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconDownload size={15} stroke={1.8} />
              Export evidence ({filtered.length})
            </button>
          </>
        }
      />

      <AdminPlatformNav />

      <AuditTelemetryBar stats={stats} />

      <section className="grid gap-5 2xl:grid-cols-[minmax(20rem,0.72fr)_minmax(0,1.28fr)]">
        <AuditControlTower stats={stats} />
        <AuditReviewQueue
          records={filtered}
          selectedId={selected?.id ?? ""}
          onArchive={setConfirmRecord}
          onEdit={setEditRecord}
          onInspect={setDrawerRecord}
          onSelect={setSelectedId}
          onAdvance={setAdvanceTarget}
        />
      </section>

      <SectionDivider />

      <section className="grid min-w-0 gap-7 2xl:grid-cols-[minmax(0,1fr)_minmax(23rem,27rem)]">
        <AuditCommandRoom
          record={selected}
          onAdvance={selected && savingId !== selected.id ? () => setAdvanceTarget(selected) : undefined}
          onArchive={selected && savingId !== selected.id ? () => setConfirmRecord(selected) : undefined}
          onEdit={selected && savingId !== selected.id ? () => setEditRecord(selected) : undefined}
          onInspect={selected ? () => setDrawerRecord(selected) : undefined}
        />
        <AuditVisibilityPanel record={selected} />
      </section>

      <AuditLedger
         records={filtered}
         onRowSelect={setDrawerRecord}
         query={query}
         setQuery={setQuery}
         surfaceFilter={surfaceFilter}
         setSurfaceFilter={setSurfaceFilter}
         statusFilter={statusFilter}
         setStatusFilter={setStatusFilter}
         overdueOnly={overdueOnly}
         setOverdueOnly={setOverdueOnly}
      />

      <EntityDrawer
        open={Boolean(drawerRecord)}
        onClose={() => setDrawerRecord(null)}
        title={drawerRecord?.title ?? "Audit record"}
      >
        {drawerRecord && (
          <AuditDrawer
            record={drawerRecord}
            rank={drawerRank}
            onAdvance={setAdvanceTarget}
            onArchive={setConfirmRecord}
            onEdit={setEditRecord}
          />
        )}
      </EntityDrawer>

      {advanceTarget && (
        <AdvanceControlModal
          busy={savingId === advanceTarget.id}
          onClose={() => setAdvanceTarget(null)}
          onSubmit={confirmAdvance}
          record={advanceTarget}
        />
      )}

      {createOpen && (
        <AuditRecordModal
          key="create-audit-record"
          mode="create"
          onClose={() => setCreateOpen(false)}
          onSubmit={createRecord}
          open={createOpen}
        />
      )}
      {editRecord && (
        <AuditRecordModal
          key={editRecord.id}
          mode="edit"
          onClose={() => setEditRecord(null)}
          onSubmit={(values) => updateRecord(editRecord.id, values)}
          open={Boolean(editRecord)}
          record={editRecord}
        />
      )}

      {confirmRecord && (
        <ConfirmDialog
          cancelLabel="Keep record"
          confirmLabel="Archive control"
          description={`${confirmRecord.title} will leave the active governance ledger. Use this only when evidence has been exported and the control no longer needs operational follow-up.`}
          onCancel={() => setConfirmRecord(null)}
          onConfirm={archiveRecord}
          open={Boolean(confirmRecord)}
          title="Archive audit record?"
        />
      )}
      </div>
    </div>
  );
}

function AuditTelemetryBar({ stats }: { stats: AuditStats }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    gsap.fromTo(
      ".gsap-telemetry-item",
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
    );
  }, []);

  return (
    <section ref={containerRef} className="relative overflow-hidden rounded-[2rem] border border-[var(--glass-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_80%,transparent),var(--surface))] p-6 shadow-[0_20px_60px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)] backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,color-mix(in_srgb,var(--primary)_3%,transparent),transparent_50%)] pointer-events-none" />
      <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--glass-border)]">
        
        <div className="gsap-telemetry-item flex flex-col px-4 first:pl-0">
           <div className="flex items-center gap-2 text-[var(--on-surface-dim)] mb-3">
             <IconAlertTriangle size={16} />
             <span className="text-[0.8rem] font-medium uppercase tracking-wider">Open Exceptions</span>
           </div>
           <div className="flex items-baseline gap-3">
             <span className="text-3xl font-mono tracking-tight text-[var(--on-surface)]">{stats.exceptionCount}</span>
             <span className="text-[0.85rem] text-[var(--primary)]">{stats.reviewCount} in review</span>
           </div>
        </div>

        <div className="gsap-telemetry-item flex flex-col px-4 pt-4 sm:pt-0">
           <div className="flex items-center gap-2 text-[var(--on-surface-dim)] mb-3">
             <IconLock size={16} />
             <span className="text-[0.8rem] font-medium uppercase tracking-wider">Risk Protected</span>
           </div>
           <div className="flex items-baseline gap-3">
             <span className="text-3xl font-mono tracking-tight text-[var(--on-surface)]">${Math.round(stats.amountProtected / 1000)}k</span>
             <span className="text-[0.85rem] text-[var(--secondary)]">+18% vs prev</span>
           </div>
        </div>

        <div className="gsap-telemetry-item flex flex-col px-4 pt-4 sm:pt-0">
           <div className="flex items-center gap-2 text-[var(--on-surface-dim)] mb-3">
             <IconCalendarTime size={16} />
             <span className="text-[0.8rem] font-medium uppercase tracking-wider">Overdue Reviews</span>
           </div>
           <div className="flex items-baseline gap-3">
             <span className={cn("text-3xl font-mono tracking-tight", stats.overdueCount > 0 ? "text-[var(--error)]" : "text-[var(--on-surface)]")}>{stats.overdueCount}</span>
             <span className="text-[0.85rem] text-[var(--on-surface-dim)]">past cadence</span>
           </div>
        </div>

        <div className="gsap-telemetry-item flex flex-col px-4 pt-4 sm:pt-0">
           <div className="flex items-center gap-2 text-[var(--on-surface-dim)] mb-3">
             <IconShieldCheck size={16} />
             <span className="text-[0.8rem] font-medium uppercase tracking-wider">Clean Ratio</span>
           </div>
           <div className="flex items-baseline gap-3">
             <span className="text-3xl font-mono tracking-tight text-[var(--on-surface)]">{stats.cleanRatio}%</span>
             <span className="text-[0.85rem] text-[var(--success)]">Clear chain</span>
           </div>
        </div>

      </div>
    </section>
  );
}

function AuditCommandRoom({
  record,
  onAdvance,
  onArchive,
  onEdit,
  onInspect,
}: {
  record: AuditRecord | null;
  onAdvance?: () => void;
  onArchive?: () => void;
  onEdit?: () => void;
  onInspect?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!record) return;
    gsap.fromTo(
      ".gsap-command-item",
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: "power2.out" }
    );
  }, [record?.id]);

  if (!record) {
    return (
      <section className="min-w-0 flex flex-col items-center justify-center p-8 lg:p-12 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--glass-bg)] border border-[color-mix(in_srgb,var(--primary)_40%,var(--glass-border))] text-[var(--primary)] mb-4 shadow-[0_0_30px_color-mix(in_srgb,var(--primary)_20%,transparent)]">
          <IconReportAnalytics size={32} />
        </span>
        <p className="text-[1.1rem] font-medium text-[var(--on-surface)]">No audit control selected</p>
        <p className="mx-auto mt-2 max-w-xl text-[0.95rem] leading-relaxed text-[var(--on-surface-dim)]">
          Select a control from the review queue to inspect policy, role visibility, evidence, and next governance action.
        </p>
      </section>
    );
  }

  const next = statusMeta[record.status].next;

  return (
    <div ref={containerRef} className="min-w-0">
      <SectionHeader eyebrow="Governance Command" title={record.title} description={record.policy} />
      <div className="gsap-command-item mt-6 grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-h-[20rem] rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4 sm:p-6 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] flex flex-col justify-between relative overflow-hidden group/command">
          {record.imageUrl ? (
            <>
              <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay transition-transform duration-1000 ease-out group-hover/command:scale-105 pointer-events-none" style={{ backgroundImage: `url(${record.imageUrl})` }} />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--surface)_40%,transparent),var(--surface))] pointer-events-none" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_50%)] pointer-events-none" />
          )}
          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <StatusBadge label={statusMeta[record.status].label} tone={statusMeta[record.status].tone} />
            <StatusBadge label={severityMeta[record.severity].label} tone={severityMeta[record.severity].tone} />
            {isOverdue(record) && <StatusBadge label="Overdue" tone="overdue" />}
            <span className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1 font-mono text-[0.7rem] uppercase tracking-wider text-[var(--on-surface-dim)]">
              {surfaceLabel[record.surface]}
            </span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3 relative z-10">
            <InfoTile label="Scope" value={record.scope} />
            <InfoTile label="Protected Risk" value={`$${record.amountProtected.toLocaleString()}`} />
            <InfoTile
              label="Next Review"
              value={isOverdue(record) ? overdueBy(record) : new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(nextReviewDue(record))}
            />
          </div>
        </div>

        <aside className="z-10 flex flex-col justify-between rounded-[1.35rem] border border-[color-mix(in_srgb,var(--primary)_20%,var(--glass-border))] bg-[var(--surface)] p-5 shadow-[0_24px_60px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--primary)_8%,transparent),transparent_60%)] pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[0.8rem] uppercase tracking-wider font-medium text-[var(--on-surface-dim)] mb-1">Next governance move</p>
            <p className="mt-2 text-[0.95rem] font-medium leading-relaxed text-[var(--on-surface)]">{record.nextAction}</p>
          </div>
          <div className="mt-6 flex flex-col gap-2 relative z-10">
            {next && <button className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-[var(--bg)] font-medium text-[0.9rem] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" onClick={onAdvance ?? (() => undefined)}><IconCheck size={18} /> {nextActionCta[record.status]}</button>}
            <div className="grid grid-cols-2 gap-2">
               <button className="py-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface)] text-[0.85rem] flex items-center justify-center gap-1 hover:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] transition-colors" onClick={onInspect ?? (() => undefined)}><IconEye size={16} /> Inspect</button>
               <button className="py-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface)] text-[0.85rem] flex items-center justify-center gap-1 hover:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] transition-colors" onClick={onEdit ?? (() => undefined)}><IconEdit size={16} /> Edit</button>
            </div>
            <button className="py-2 rounded-xl border border-[color-mix(in_srgb,var(--critical)_30%,var(--glass-border))] text-[var(--critical)] text-[0.85rem] flex items-center justify-center gap-1 hover:bg-[color-mix(in_srgb,var(--critical)_10%,transparent)] transition-colors mt-2" onClick={onArchive ?? (() => undefined)}><IconArchive size={16} /> Archive Control</button>
          </div>
        </aside>
      </div>

      <div className="gsap-command-item grid mt-5 border border-[var(--glass-border)] rounded-[1.35rem] bg-[var(--surface)] overflow-hidden md:grid-cols-3">
        <BoundaryTile
          icon={IconUsers}
          label="Client surface"
          value={record.clientVisible ? "Approved scope, invoice state, delivery proof" : "Hidden from client workspace"}
        />
        <BoundaryTile
          icon={IconCode}
          label="Developer surface"
          value={record.developerVisible ? "Work evidence, payout status, project context" : "Hidden from developer workbench"}
        />
        <BoundaryTile
          icon={IconLock}
          label="Admin surface"
          value="Full policy, actor, evidence, margin, and exception context"
        />
      </div>
    </div>
  );
}

function AuditControlTower({ stats }: { stats: AuditStats }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".gsap-tower-item",
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power2.out" }
    );
  }, []);

  return (
    <div ref={containerRef} className="min-w-0">
      <SectionHeader eyebrow="Surface analytics" title="Control tower" description="Exception pressure by governance surface" />
      <div className="mt-6 relative overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-6 sm:p-8 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--primary)_5%,transparent),transparent_50%)] pointer-events-none" />
        <div className="relative z-10">
          <div className="gsap-tower-item mt-2">
           <DashboardDonutChart
             data={[
               { label: "Clean", value: stats.cleanCount, tone: "success" },
               { label: "Review", value: stats.reviewCount, tone: "secondary" },
               { label: "Exception", value: stats.exceptionCount, tone: "primary" },
             ]}
             height={220}
           />
         </div>
         <div className="mt-8 grid gap-4">
           {stats.surfaceBreakdown.map((item) => (
             <div key={item.label} className="gsap-tower-item group rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)] transition-colors">
               <div className="flex items-center justify-between gap-3">
                 <p className="text-[0.85rem] font-medium text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors">{item.label}</p>
                 <span className="font-mono text-[0.8rem] text-[var(--on-surface-dim)]">{item.value}</span>
               </div>
               <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)]">
                 <span
                   className="block h-full rounded-full bg-[linear-gradient(90deg,var(--secondary),var(--primary))] shadow-[0_0_10px_var(--primary)] transition-all duration-1000 ease-out"
                   style={{ width: `${Math.min(100, item.value * 25)}%` }}
                 />
               </div>
             </div>
           ))}
         </div>
      </div>
      </div>
    </div>
  );
}

function AuditReviewQueue({
  records,
  selectedId,
  onAdvance,
  onArchive,
  onEdit,
  onInspect,
  onSelect,
}: {
  records: AuditRecord[];
  selectedId: string;
  onAdvance: (record: AuditRecord) => void;
  onArchive: (record: AuditRecord) => void;
  onEdit: (record: AuditRecord) => void;
  onInspect: (record: AuditRecord) => void;
  onSelect: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useGSAP(() => {
    if (records.length === 0 || hasAnimated.current) return;
    // Entrance stagger runs once, on first paint - re-firing it every time
    // `records` changes (which happens on every keystroke while searching)
    // would reset already-visible cards to opacity:0 and flash them back in,
    // which reads as janky rather than polished. A filtered set should just
    // update instantly, the way it does in any mature admin table.
    hasAnimated.current = true;
    gsap.fromTo(
      ".gsap-queue-card",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" }
    );
  }, [records]);

  return (
    <div className="min-w-0">
      <SectionHeader eyebrow="Active pipeline" title="Review queue" description="Pending and scheduled audit records requiring action." />
      <div ref={containerRef} className="mt-6 grid gap-4 xl:grid-cols-2">
        {records.length ? records.map((record) => {
          const selected = record.id === selectedId;
          const next = statusMeta[record.status].next;
          return (
            <article
              key={record.id}
              className={cn(
                "gsap-queue-card group rounded-[1.5rem] border p-5 transition-all duration-300 bg-[var(--surface)]",
                selected
                  ? "border-[color-mix(in_srgb,var(--primary)_40%,transparent)] shadow-sm scale-[1.01]"
                  : "border-[var(--glass-border)] hover:border-[color-mix(in_srgb,var(--primary)_20%,transparent)] hover:shadow-md",
              )}
            >
              <button type="button" onClick={() => onSelect(record.id)} className="block w-full cursor-pointer text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={statusMeta[record.status].label} tone={statusMeta[record.status].tone} />
                  <StatusBadge label={severityMeta[record.severity].label} tone={severityMeta[record.severity].tone} />
                  {isOverdue(record) && <StatusBadge label="Overdue" tone="overdue" />}
                  <span className="rounded-full border border-[var(--glass-border)] px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-wider text-[var(--on-surface-dim)] group-hover:text-[var(--primary)] transition-colors">
                    {surfaceLabel[record.surface]}
                  </span>
                </div>
                <h2 className={cn("title-serif mt-4 text-[1.1rem] font-medium leading-tight transition-colors", selected ? "text-[var(--primary)]" : "text-[var(--on-surface)] group-hover:text-[var(--primary)]")}>{record.title}</h2>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-[var(--on-surface-dim)] line-clamp-2">{record.policy}</p>
              </button>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <MiniFact label="Scope" value={record.scope} />
                <MiniFact label="Protected" value={`$${record.amountProtected.toLocaleString()}`} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-[color-mix(in_srgb,var(--glass-border)_50%,transparent)]">
                <ActionButton icon={IconEye} onClick={() => onInspect(record)}>Inspect</ActionButton>
                <ActionButton icon={IconEdit} onClick={() => onEdit(record)}>Edit</ActionButton>
                {next && <ActionButton icon={IconCheck} onClick={() => onAdvance(record)}>{nextActionCtaCompact[record.status]}</ActionButton>}
                <ActionButton danger icon={IconTrash} onClick={() => onArchive(record)}>Archive</ActionButton>
              </div>
            </article>
          );
        }) : (
          <div className="rounded-[1.5rem] border border-dashed border-[color-mix(in_srgb,var(--primary)_20%,var(--glass-border))] bg-[color-mix(in_srgb,var(--glass-bg)_50%,transparent)] p-12 text-center xl:col-span-2 flex flex-col items-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--glass-bg)] border border-[color-mix(in_srgb,var(--primary)_40%,var(--glass-border))] text-[var(--primary)] mb-3">
              <IconSearch size={20} />
            </span>
            <p className="text-[1rem] font-medium text-[var(--on-surface)]">No controls match this view</p>
            <p className="mx-auto mt-2 max-w-md text-[0.85rem] leading-relaxed text-[var(--on-surface-dim)]">
              Clear filters or create a new report from the page action.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AuditVisibilityPanel({ record }: { record: AuditRecord | null }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!record) return;
    gsap.fromTo(
      containerRef.current,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
    );
  }, [record?.id]);

  if (!record) return null;

  return (
    <div ref={containerRef} className="min-w-0">
      <div className="relative overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-6 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] h-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,color-mix(in_srgb,var(--primary)_5%,transparent),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col h-full">
           <PanelHeading icon={IconUsers} title="Role boundary" detail="Who can see what, and why." />
           <div className="mt-6 grid gap-4 flex-1">
             <VisibilityRow enabled={record.clientVisible} label="Client-visible record" note="Can expose project scope, invoice state, approved proof, and delivery evidence." />
             <VisibilityRow enabled={record.developerVisible} label="Developer-visible record" note="Can expose work evidence, payout status, project context, and profile governance." />
             <VisibilityRow enabled={!record.developerVisible && record.amountProtected > 0} label="Compensation abstraction" note="Client pricing and Andishi margin are held at admin level only." />
           </div>
           <div className="mt-6 rounded-2xl border border-[color-mix(in_srgb,var(--primary)_30%,var(--glass-border))] bg-[color-mix(in_srgb,var(--primary)_5%,var(--glass-bg))] p-5 shadow-inner">
             <p className="text-[0.75rem] uppercase tracking-[0.15em] font-medium text-[var(--primary)] flex items-center gap-2">
                <IconClock size={14} /> Next account move
             </p>
             <p className="mt-2 text-[0.95rem] font-medium leading-relaxed text-[var(--on-surface)]">{record.nextAction}</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function AuditDrawer({
  record,
  rank,
  onAdvance,
  onArchive,
  onEdit,
}: {
  record: AuditRecord;
  rank: number;
  onAdvance: (record: AuditRecord) => void;
  onArchive: (record: AuditRecord) => void;
  onEdit: (record: AuditRecord) => void;
}) {
  const next = statusMeta[record.status].next;
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".gsap-drawer-item",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" }
    );
  }, [record.id]);

  return (
    <div ref={containerRef} className="grid gap-6">
      <section className="gsap-drawer-item relative overflow-hidden rounded-[1.5rem] border border-[color-mix(in_srgb,var(--primary)_20%,var(--glass-border))] bg-[var(--surface)] p-6 shadow-[0_10px_30px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--primary)_8%,transparent),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge label={`Priority ${rank}`} tone={rank < 3 ? "overdue" : "pending"} />
              <StatusBadge label={statusMeta[record.status].label} tone={statusMeta[record.status].tone} />
              <StatusBadge label={severityMeta[record.severity].label} tone={severityMeta[record.severity].tone} />
              {isOverdue(record) && <StatusBadge label="Overdue" tone="overdue" />}
            </div>
            <p className="mt-4 text-[0.7rem] uppercase tracking-[0.15em] font-medium text-[var(--primary)] flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
               Governance Inspect
            </p>
            <h2 className="title-serif mt-2 text-[1.4rem] font-medium tracking-tight text-[var(--on-surface)]">{record.title}</h2>
            <p className="mt-2 max-w-3xl text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">{record.policy}</p>
          </div>
          <div className="flex flex-wrap gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-[color-mix(in_srgb,var(--glass-border)_50%,transparent)]">
            <ActionButton icon={IconEdit} onClick={() => onEdit(record)}>Edit</ActionButton>
            {next && <ActionButton icon={IconCheck} onClick={() => onAdvance(record)}>{nextActionCta[record.status]}</ActionButton>}
            <ActionButton danger icon={IconArchive} onClick={() => onArchive(record)}>Archive</ActionButton>
          </div>
        </div>
      </section>

      <section className="gsap-drawer-item grid gap-4 sm:grid-cols-3">
        <InsightTile icon={IconLock} label="Protected value" value={`$${record.amountProtected.toLocaleString()}`} />
        <InsightTile
          icon={IconCalendarTime}
          label="Next Review"
          value={isOverdue(record) ? overdueBy(record) : `${record.reportCadence} - ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(nextReviewDue(record))}`}
        />
        <InsightTile icon={IconShieldCheck} label="Surface" value={surfaceLabel[record.surface]} />
      </section>

      <section className="gsap-drawer-item grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
        <div className="rounded-[1.5rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_40%,var(--surface)),var(--surface))] p-6 shadow-sm">
          <PanelHeading icon={IconDatabaseExport} title="Evidence chain" detail="Exportable proof items for the selected governance control." />
          <div className="mt-5 grid gap-3">
            {record.evidence.map((item, index) => (
              <div key={item} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 rounded-[1.25rem] border border-[color-mix(in_srgb,var(--glass-border)_50%,transparent)] bg-[var(--glass-bg)] p-3.5 hover:border-[color-mix(in_srgb,var(--primary)_20%,transparent)] transition-colors">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] font-mono text-[0.8rem] text-[var(--primary)] font-medium">
                  {index + 1}
                </span>
                <p className="min-w-0 text-[0.86rem] leading-relaxed text-[var(--on-surface)] flex items-center">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_40%,var(--surface)),var(--surface))] p-6 shadow-sm">
          <PanelHeading icon={IconEye} title="Visibility" detail="Operational access posture" />
          <div className="mt-5 grid gap-4">
            <VisibilityRow enabled={record.clientVisible} label="Client Workspace" note={record.clientVisible ? "Visible to active clients." : "Admin-only abstraction."} />
            <VisibilityRow enabled={record.developerVisible} label="Dev Workbench" note={record.developerVisible ? "Visible to active developers." : "Admin-only abstraction."} />
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Every status transition requires a real note instead of a canned
 * "transition captured by admin" string - this is what actually makes the
 * evidence trail worth reading later, and stops an exception from being
 * clearable with the same single click as a routine scheduled check-in.
 */
function AdvanceControlModal({
  busy,
  onClose,
  onSubmit,
  record,
}: {
  busy: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
  record: AuditRecord;
}) {
  const [note, setNote] = useState("");
  const next = statusMeta[record.status].next;
  if (!next) return null;

  const prompt =
    record.status === "exception"
      ? "What remediation is being applied, and by whom?"
      : record.status === "review"
        ? "What did the review confirm - why is this now clean?"
        : "Notes for this transition";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!note.trim() || busy) return;
    onSubmit(note.trim());
  };

  return (
    <ModalShell labelledBy="advance-control-title" onClose={onClose}>
      <form onSubmit={submit} className="gsap-modal-content w-full max-w-lg rounded-[2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-6 sm:p-8 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_60%,transparent)] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--primary)_8%,transparent),transparent_60%)] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 border-b border-[color-mix(in_srgb,var(--glass-border)_50%,transparent)] pb-5 mb-5">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[0.75rem] uppercase tracking-[0.15em] text-[var(--primary)] font-medium">
                {statusMeta[record.status].label}
                <IconArrowRight size={12} stroke={2.2} />
                {statusMeta[next].label}
              </p>
              <h2 id="advance-control-title" className="title-serif mt-2 text-[1.25rem] font-medium text-[var(--on-surface)] truncate">{nextActionCta[record.status]}</h2>
              <p className="mt-1 truncate text-[0.82rem] text-[var(--on-surface-dim)]">{record.title}</p>
            </div>
            <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] hover:text-[var(--on-surface)]" aria-label="Close modal">
              <IconX size={18} stroke={1.7} />
            </button>
          </div>

          {record.status === "exception" && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-[color-mix(in_srgb,var(--error)_30%,transparent)] bg-[color-mix(in_srgb,var(--error)_8%,transparent)] p-4">
              <IconAlertTriangle size={16} className="mt-0.5 shrink-0 text-[var(--error)]" stroke={1.8} />
              <p className="text-[0.82rem] leading-relaxed text-[var(--on-surface)]">This moves an active exception into review, not straight to clean - it still needs a second confirmation once the fix is verified.</p>
            </div>
          )}

          <FormField label={prompt}>
            <textarea
              autoFocus
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              placeholder="Required - this is appended to the control's permanent evidence trail."
              className={formTextareaClass}
            />
          </FormField>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <ModalButton onClick={onClose} type="button">Cancel</ModalButton>
            <ModalButton disabled={!note.trim() || busy} intent="primary" type="submit">
              {busy ? "Saving..." : nextActionCta[record.status]}
            </ModalButton>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}

function AuditRecordModal({
  mode,
  onClose,
  onSubmit,
  open,
  record,
}: {
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (values: AuditFormValues) => void;
  open: boolean;
  record?: AuditRecord | null;
}) {
  const [form, setForm] = useState<AuditFormValues>(() => buildInitialAuditFormValues(record));

  if (!open) return null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({ ...form, title: form.title.trim() });
  };

  return (
    <ModalShell labelledBy="audit-record-title" onClose={onClose}>
      <form onSubmit={submit} className="gsap-modal-content max-h-[85vh] overflow-y-auto scrollbar-hide w-full max-w-4xl rounded-[2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-6 sm:p-8 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_60%,transparent)] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--primary)_8%,transparent),transparent_60%)] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 border-b border-[color-mix(in_srgb,var(--glass-border)_50%,transparent)] pb-5 mb-6">
            <div>
              <p className="text-[0.75rem] uppercase tracking-[0.15em] text-[var(--primary)] font-medium">Control details</p>
              <h2 id="audit-record-title" className="title-serif mt-2 text-[1.4rem] font-medium text-[var(--on-surface)]">{mode === "create" ? "Create governance control" : "Edit governance control"}</h2>
            </div>
            <button type="button" onClick={onClose} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] hover:text-[var(--on-surface)]" aria-label="Close modal">
              <IconX size={18} stroke={1.7} />
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField className="gsap-modal-field" label="Control title">
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Project margin visibility boundary" className={formInputClass} />
            </FormField>
            <FormField className="gsap-modal-field" label="Scope">
              <input value={form.scope} onChange={(event) => setForm((current) => ({ ...current, scope: event.target.value }))} className={formInputClass} />
            </FormField>
            <FormField className="gsap-modal-field" label="Surface">
              <select value={form.surface} onChange={(event) => setForm((current) => ({ ...current, surface: event.target.value as AuditSurface }))} className={cn(formInputClass, "appearance-none cursor-pointer")}>
                {(Object.keys(surfaceLabel) as AuditSurface[]).map((surface) => (
                  <option key={surface} value={surface}>{surfaceLabel[surface]}</option>
                ))}
              </select>
            </FormField>
            {mode === "create" ? (
              <FormField className="gsap-modal-field" label="Starting status">
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AuditStatus }))} className={cn(formInputClass, "appearance-none cursor-pointer")}>
                  {statusOrder.map((status) => (
                    <option key={status} value={status}>{statusMeta[status].label}</option>
                  ))}
                </select>
              </FormField>
            ) : (
              <div className="gsap-modal-field flex flex-col gap-2">
                <span className="text-[0.78rem] uppercase tracking-wider font-medium text-[var(--on-surface-dim)]">Status</span>
                <div className="flex h-12 items-center gap-2 rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--glass-bg)_60%,transparent)] px-4">
                  <StatusBadge label={statusMeta[form.status].label} tone={statusMeta[form.status].tone} />
                  <span className="text-[0.78rem] text-[var(--on-surface-dim)]">Use &quot;{nextActionCta[form.status]}&quot; to change this</span>
                </div>
              </div>
            )}
            <FormField className="gsap-modal-field" label="Severity">
              <select value={form.severity} onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value as AuditSeverity }))} className={cn(formInputClass, "appearance-none cursor-pointer")}>
                {(Object.keys(severityMeta) as AuditSeverity[]).map((severity) => (
                  <option key={severity} value={severity}>{severityMeta[severity].label}</option>
                ))}
              </select>
            </FormField>
            <FormField className="gsap-modal-field" label="Owner">
              <input value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} className={formInputClass} />
            </FormField>
            <FormField className="gsap-modal-field" label="Protected amount">
              <input type="number" min={0} value={form.amountProtected} onChange={(event) => setForm((current) => ({ ...current, amountProtected: Number(event.target.value) }))} className={formInputClass} />
            </FormField>
            <FormField className="gsap-modal-field" label="Review cadence (flags overdue automatically)">
              <select value={form.reportCadence} onChange={(event) => setForm((current) => ({ ...current, reportCadence: event.target.value }))} className={cn(formInputClass, "appearance-none cursor-pointer")}>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Quarterly</option>
              </select>
            </FormField>
            <FormField className="md:col-span-2 gsap-modal-field" label="Policy boundary">
              <textarea value={form.policy} onChange={(event) => setForm((current) => ({ ...current, policy: event.target.value }))} rows={3} className={formTextareaClass} />
            </FormField>
            <FormField className="md:col-span-2 gsap-modal-field" label="Next action">
              <textarea value={form.nextAction} onChange={(event) => setForm((current) => ({ ...current, nextAction: event.target.value }))} rows={2} className={formTextareaClass} />
            </FormField>
            <FormField className="md:col-span-2 gsap-modal-field" label="Evidence items">
              <textarea value={form.evidence.join("\n")} onChange={(event) => setForm((current) => ({ ...current, evidence: event.target.value.split("\n").filter(Boolean) }))} rows={4} className={formTextareaClass} />
            </FormField>
            <div className="grid gap-4 md:col-span-2 sm:grid-cols-2">
              <ToggleField className="gsap-modal-field" checked={form.clientVisible} label="Client-visible" onChange={(value) => setForm((current) => ({ ...current, clientVisible: value }))} />
              <ToggleField className="gsap-modal-field" checked={form.developerVisible} label="Developer-visible" onChange={(value) => setForm((current) => ({ ...current, developerVisible: value }))} />
            </div>
          </div>

          <div className="gsap-modal-field sticky bottom-[-1.5rem] sm:bottom-[-2rem] -mx-6 sm:-mx-8 px-6 sm:px-8 pb-6 sm:pb-8 pt-5 mt-8 flex flex-col-reverse gap-3 border-t border-[color-mix(in_srgb,var(--glass-border)_50%,transparent)] bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] backdrop-blur-2xl sm:flex-row sm:justify-end z-20">
            <ModalButton onClick={onClose} type="button">Cancel</ModalButton>
            <ModalButton intent="primary" type="submit">{mode === "create" ? "Create control" : "Save changes"}</ModalButton>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}

type AuditStats = ReturnType<typeof buildAuditStats>;

function buildAuditStats(records: AuditRecord[]) {
  const exceptionCount = records.filter((record) => record.status === "exception").length;
  const reviewCount = records.filter((record) => record.status === "review").length;
  const cleanCount = records.filter((record) => record.status === "clean").length;
  const overdueCount = records.filter((record) => isOverdue(record)).length;
  const amountProtected = records.reduce((sum, record) => sum + record.amountProtected, 0);
  const surfaces = (Object.keys(surfaceLabel) as AuditSurface[]).map((surface) => records.filter((record) => record.surface === surface).length);
  const surfaceCoverage = surfaces.filter(Boolean).length;
  const cleanRatio = records.length ? Math.round((cleanCount / records.length) * 100) : 0;

  return {
    amountProtected,
    cleanCount,
    cleanRatio,
    cleanTrend: [2, 2, 3, 3, 4, 4, cleanCount],
    exceptionCount,
    exceptionTrend: [1, 2, 1, 3, 2, 2, exceptionCount],
    overdueCount,
    protectedTrend: [12, 16, 18, 20, 23, 24, Math.round(amountProtected / 1000)],
    reviewCount,
    surfaceBreakdown: (Object.keys(surfaceLabel) as AuditSurface[]).map((surface, index) => ({
      label: surfaceLabel[surface],
      value: surfaces[index] ?? 0,
    })),
    surfaceCounts: surfaces,
    surfaceCoverage,
  };
}

function severityScore(severity: AuditSeverity) {
  if (severity === "high") return 3;
  if (severity === "medium") return 2;
  return 1;
}

function PanelHeading({ detail, icon: Icon, title }: { detail: string; icon: Icon; title: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)] text-[var(--secondary)]">
        <Icon size={18} stroke={1.7} />
      </span>
      <div className="min-w-0">
        <p className="text-[0.98rem] font-medium text-[var(--on-surface)]">{title}</p>
        <p className="mt-1 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">{detail}</p>
      </div>
    </div>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-[var(--glass-border)] bg-[var(--surface)] px-3 py-2">
      <p className="text-[0.64rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">{label}</p>
      <p className="mt-1 truncate font-mono text-[0.76rem] text-[var(--on-surface)]">{value}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
      <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">{label}</p>
      <p className="mt-1.5 truncate font-mono text-[0.9rem] text-[var(--on-surface)]">{value}</p>
    </div>
  );
}

function BoundaryTile({ icon: Icon, label, value }: { icon: Icon; label: string; value: string }) {
  return (
    <div className="grid gap-3 border-b border-[var(--glass-border)] p-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <span className="grid h-10 w-10 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)] text-[var(--secondary)]">
        <Icon size={18} stroke={1.7} />
      </span>
      <div className="min-w-0">
        <p className="text-[0.84rem] font-medium text-[var(--on-surface)]">{label}</p>
        <p className="mt-1.5 text-[0.78rem] leading-relaxed text-[var(--on-surface-dim)]">{value}</p>
      </div>
    </div>
  );
}

function InsightTile({ icon: Icon, label, value }: { icon: Icon; label: string; value: string }) {
  return (
    <article className="rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4">
      <Icon size={18} stroke={1.7} className="text-[var(--secondary)]" />
      <p className="mt-4 text-[0.72rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">{label}</p>
      <p className="mt-2 min-w-0 break-words font-mono text-[1.15rem] text-[var(--on-surface)]">{value}</p>
    </article>
  );
}

function VisibilityRow({ enabled, label, note }: { enabled: boolean; label: string; note: string }) {
  return (
    <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-full",
          enabled
            ? "bg-[color-mix(in_srgb,var(--tertiary)_14%,transparent)] text-[var(--tertiary)]"
            : "bg-[color-mix(in_srgb,var(--on-surface-dim)_10%,transparent)] text-[var(--on-surface-dim)]",
        )}
      >
        {enabled ? <IconCheck size={16} stroke={1.8} /> : <IconLock size={16} stroke={1.8} />}
      </span>
      <div className="min-w-0">
        <p className="text-[0.86rem] font-medium text-[var(--on-surface)]">{label}</p>
        <p className="mt-1 text-[0.76rem] leading-relaxed text-[var(--on-surface-dim)]">{note}</p>
      </div>
    </div>
  );
}

function FormField({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-[0.78rem] uppercase tracking-wider font-medium text-[var(--on-surface-dim)]">{label}</span>
      {children}
    </label>
  );
}

function ToggleField({ checked, label, onChange, className }: { checked: boolean; label: string; onChange: (value: boolean) => void; className?: string }) {
  return (
    <label className={cn("flex h-12 cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.92rem] text-[var(--on-surface)] transition-colors hover:border-[color-mix(in_srgb,var(--primary)_40%,transparent)]", className)}>
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[var(--secondary)]" />
    </label>
  );
}

function ActionButton({
  children,
  danger = false,
  icon: Icon,
  onClick,
}: {
  children: ReactNode;
  danger?: boolean;
  icon: Icon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 text-[0.76rem] font-medium transition-colors duration-300",
        danger
          ? "border-[color-mix(in_srgb,var(--error)_30%,transparent)] text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
          : "border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]",
      )}
    >
      <Icon size={13} stroke={1.8} />
      {children}
    </button>
  );
}

const ModalButton = forwardRef<
  HTMLButtonElement,
  {
    children: ReactNode;
    className?: string;
    disabled?: boolean;
    intent?: "neutral" | "primary";
    onClick?: () => void;
    type: "button" | "submit";
  }
>(function ModalButton({ children, className, disabled, intent = "neutral", onClick, type }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-11 cursor-pointer rounded-full border px-6 text-[0.88rem] font-medium transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50",
        intent === "primary"
          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--bg)] hover:opacity-90 transition-opacity"
          : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface)] hover:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)]",
        className
      )}
    >
      {children}
    </button>
  );
});

function FilterChip({ active, children, onClick }: { active: boolean, children: ReactNode, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-[0.8rem] font-medium transition-all duration-300 border backdrop-blur-sm cursor-pointer",
        active
          ? "border-[color-mix(in_srgb,var(--primary)_50%,transparent)] bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] text-[var(--primary)] shadow-[0_0_15px_color-mix(in_srgb,var(--primary)_20%,transparent)]"
          : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)]"
      )}
    >
      {children}
    </button>
  );
}

function AuditLedger({
  records,
  onRowSelect,
  query,
  setQuery,
  surfaceFilter,
  setSurfaceFilter,
  statusFilter,
  setStatusFilter,
  overdueOnly,
  setOverdueOnly,
}: {
  records: AuditRecord[];
  onRowSelect: (r: AuditRecord) => void;
  query: string;
  setQuery: (q: string) => void;
  surfaceFilter: AuditSurface | "all";
  setSurfaceFilter: (s: AuditSurface | "all") => void;
  statusFilter: AuditStatus | "all";
  setStatusFilter: (s: AuditStatus | "all") => void;
  overdueOnly: boolean;
  setOverdueOnly: (value: boolean) => void;
}) {
  const columns = useMemo<Array<OperationalTableColumn<AuditRecord>>>(
    () => [
      {
        key: "title",
        label: "Control & Scope",
        priority: true,
        render: (record) => (
          <div className="min-w-0">
            <p className="font-medium text-[0.95rem] text-[var(--on-surface)] line-clamp-1">{record.title}</p>
            <p className="mt-1 text-[0.8rem] text-[var(--on-surface-dim)] line-clamp-1">{record.scope}</p>
          </div>
        ),
      },
      {
        key: "surface",
        label: "Surface",
        render: (record) => (
          <span className="inline-flex items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2.5 py-0.5 text-[0.75rem] font-medium text-[var(--on-surface-dim)]">
            {surfaceLabel[record.surface]}
          </span>
        ),
      },
      { key: "status", label: "Status", render: (record) => <StatusBadge label={statusMeta[record.status].label} tone={statusMeta[record.status].tone} /> },
      { key: "severity", label: "Severity", render: (record) => <StatusBadge label={severityMeta[record.severity].label} tone={severityMeta[record.severity].tone} /> },
      { key: "amountProtected", label: "Protected", align: "right", mono: true, render: (record) => `$${record.amountProtected.toLocaleString()}` },
      { key: "owner", label: "Owner", hideOnMobile: true },
      {
        key: "updatedAt",
        label: "Last Event / Review",
        align: "right",
        mono: true,
        hideOnMobile: true,
        render: (record) => (
          <span className={isOverdue(record) ? "text-[var(--error)]" : undefined}>
            {isOverdue(record) ? overdueBy(record) : relativeTime(record.updatedAt)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="mt-8 min-w-0">
      <div className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-6 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]">
        <div className="flex items-center gap-3 bg-[var(--glass-bg)] border border-[color-mix(in_srgb,var(--primary)_20%,var(--glass-border))] rounded-full px-4 py-2 shadow-inner w-fit">
           <IconSearch size={18} className="text-[var(--on-surface-dim)]" />
           <input
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder="Search ledger..."
             className="bg-transparent border-none outline-none text-[0.9rem] text-[var(--on-surface)] placeholder:text-[var(--on-surface-dim)] w-48"
           />
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
           <div className="flex flex-wrap gap-2 items-center">
             <span className="text-[0.75rem] uppercase tracking-wider text-[var(--on-surface-dim)] mr-2 font-medium">Surface</span>
             <FilterChip active={surfaceFilter === "all"} onClick={() => setSurfaceFilter("all")}>All</FilterChip>
             {(Object.keys(surfaceLabel) as AuditSurface[]).map(s => (
               <FilterChip key={s} active={surfaceFilter === s} onClick={() => setSurfaceFilter(s)}>{surfaceLabel[s]}</FilterChip>
             ))}
           </div>
           <div className="hidden sm:block w-px h-8 bg-[var(--glass-border)] mx-2" />
           <div className="flex flex-wrap gap-2 items-center">
             <span className="text-[0.75rem] uppercase tracking-wider text-[var(--on-surface-dim)] mr-2 font-medium">Status</span>
             <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>All</FilterChip>
             {statusOrder.map(s => (
               <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{statusMeta[s].label}</FilterChip>
             ))}
           </div>
           <div className="hidden sm:block w-px h-8 bg-[var(--glass-border)] mx-2" />
           <FilterChip active={overdueOnly} onClick={() => setOverdueOnly(!overdueOnly)}>Overdue only</FilterChip>
        </div>
      </div>

      <div className="mt-6">
        <OperationalDataTable
          columns={columns}
          description="Historical log of every commercial, identity, and developer boundary enforced or excepted - sortable, paginated, and searchable."
          empty="No ledger entries found. Try adjusting your filters or search query."
          onRowSelect={onRowSelect}
          pageSize={10}
          rows={records}
          title="Governance Ledger"
        />
      </div>
    </div>
  );
}
