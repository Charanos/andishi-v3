"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  IconAlertTriangle,
  IconArchive,
  IconCalendarTime,
  IconCheck,
  IconClock,
  IconCode,
  IconDatabaseExport,
  IconDownload,
  IconEdit,
  IconEye,
  IconFileAnalytics,
  IconFilter,
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
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import {
  DashboardDonutChart,
  DashboardLineChart,
} from "@/components/dashboard/shared/dashboard-chart";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { EntityDrawer } from "@/components/dashboard/shared/entity-drawer";
import { KpiCard } from "@/components/dashboard/shared/kpi-card";
import {
  OperationalDataTable,
  type OperationalTableColumn,
} from "@/components/dashboard/shared/operational-data-table";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { SectionDivider } from "@/components/ui/section-divider";
import { cn } from "@/lib/utils";

type AuditStatus = "clean" | "review" | "exception" | "scheduled";
type AuditSurface = "commercial" | "identity" | "delivery" | "content" | "support";
type AuditSeverity = "low" | "medium" | "high";

type AuditRecord = {
  actor: string;
  amountProtected: number;
  clientVisible: boolean;
  developerVisible: boolean;
  evidence: string[];
  id: string;
  lastEvent: string;
  nextAction: string;
  owner: string;
  policy: string;
  reportCadence: string;
  scope: string;
  severity: AuditSeverity;
  status: AuditStatus;
  surface: AuditSurface;
  title: string;
};

const formInputClass = "min-h-11 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.9rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)]";
const formTextareaClass = "min-h-24 resize-none rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-3 text-[0.9rem] leading-relaxed text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)]";

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

const auditSeed: AuditRecord[] = [
  {
    actor: "Finance ops",
    amountProtected: 1920,
    clientVisible: true,
    developerVisible: false,
    evidence: ["Client invoice: $2,000", "Developer payout quote: $80", "Markup policy applied"],
    id: "audit-commercial-kijani",
    lastEvent: "18m ago",
    nextAction: "Export redacted finance packet for leadership review",
    owner: "Dennis",
    policy: "Client invoice and developer payout remain separated by role",
    reportCadence: "Weekly",
    scope: "Kijani Analytics / AI Support Workflow",
    severity: "high",
    status: "exception",
    surface: "commercial",
    title: "Project margin visibility boundary",
  },
  {
    actor: "Identity service",
    amountProtected: 0,
    clientVisible: false,
    developerVisible: false,
    evidence: ["Invite accepted", "Admin MFA active", "Role changed by Dennis"],
    id: "audit-role-brian",
    lastEvent: "1h ago",
    nextAction: "Confirm least-privilege role after finance access request",
    owner: "Maya",
    policy: "Role changes require actor, reason, and after-state capture",
    reportCadence: "Daily",
    scope: "Brian Ouma / Staff access",
    severity: "medium",
    status: "review",
    surface: "identity",
    title: "Staff role escalation review",
  },
  {
    actor: "Delivery ops",
    amountProtected: 6400,
    clientVisible: true,
    developerVisible: true,
    evidence: ["Timesheet submitted", "Client approval captured", "Milestone payout queued"],
    id: "audit-timesheet-soko",
    lastEvent: "3h ago",
    nextAction: "Attach client approval to payout release note",
    owner: "Finance",
    policy: "Payout release needs delivery evidence and collection status",
    reportCadence: "Weekly",
    scope: "SokoPay / Reconciliation milestone",
    severity: "low",
    status: "scheduled",
    surface: "delivery",
    title: "Timesheet to payout evidence chain",
  },
  {
    actor: "Content ops",
    amountProtected: 0,
    clientVisible: true,
    developerVisible: true,
    evidence: ["Case study quote approved", "Developer name redacted", "Screenshot checked"],
    id: "audit-content-proof",
    lastEvent: "Yesterday",
    nextAction: "Keep next refresh in quarterly governance cycle",
    owner: "Content",
    policy: "Public proof requires client consent and developer-safe attribution",
    reportCadence: "Monthly",
    scope: "Payment reconciliation case study",
    severity: "low",
    status: "clean",
    surface: "content",
    title: "Marketing proof consent trail",
  },
  {
    actor: "Support desk",
    amountProtected: 11800,
    clientVisible: false,
    developerVisible: true,
    evidence: ["Collection case open", "Developer payout status sent", "Client dispute hidden from dev"],
    id: "audit-support-cloudify",
    lastEvent: "Yesterday",
    nextAction: "Resolve dispute note before releasing payout expectation",
    owner: "Support",
    policy: "Support can share payout status without exposing client commercial dispute",
    reportCadence: "Daily",
    scope: "Cloudify Inc / Overdue invoice support",
    severity: "high",
    status: "exception",
    surface: "support",
    title: "Collection-gated payout communication",
  },
];

function buildInitialAuditRecord(record?: AuditRecord | null): AuditRecord {
  return record ?? {
    actor: "Admin",
    amountProtected: 0,
    clientVisible: true,
    developerVisible: false,
    evidence: ["Initial evidence required"],
    id: `audit-${Date.now()}`,
    lastEvent: "Just now",
    nextAction: "Assign owner and attach evidence",
    owner: "Dennis",
    policy: "Define the role boundary and evidence rule for this control",
    reportCadence: "Weekly",
    scope: "New governance scope",
    severity: "medium",
    status: "review",
    surface: "commercial",
    title: "",
  };
}

export function AdminAuditPage() {
  const [records, setRecords] = useState(auditSeed);
  const [selectedId, setSelectedId] = useState(auditSeed[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [surfaceFilter, setSurfaceFilter] = useState<AuditSurface | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AuditStatus | "all">("all");
  const [drawerRecord, setDrawerRecord] = useState<AuditRecord | null>(null);
  const [confirmRecord, setConfirmRecord] = useState<AuditRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AuditRecord | null>(null);

  const selected = records.find((record) => record.id === selectedId) ?? records[0] ?? null;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records
      .filter((record) => {
        const haystack = `${record.title} ${record.scope} ${record.owner} ${record.policy} ${record.nextAction} ${record.evidence.join(" ")}`.toLowerCase();
        return (!needle || haystack.includes(needle)) && (surfaceFilter === "all" || record.surface === surfaceFilter) && (statusFilter === "all" || record.status === statusFilter);
      })
      .sort((a, b) => {
        const severityRank = severityScore(b.severity) - severityScore(a.severity);
        if (severityRank !== 0) return severityRank;
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      });
  }, [records, query, statusFilter, surfaceFilter]);

  const stats = useMemo(() => buildAuditStats(records), [records]);
  const drawerRank = drawerRecord ? Math.max(0, filtered.findIndex((record) => record.id === drawerRecord.id)) + 1 : 0;

  const columns = useMemo<Array<OperationalTableColumn<AuditRecord>>>(
    () => [
      {
        key: "title",
        label: "Control",
        priority: true,
        render: (record) => (
          <div className="min-w-0">
            <p className="truncate text-[var(--on-surface)]">{record.title}</p>
            <p className="mt-1 truncate text-[0.72rem] text-[var(--on-surface-dim)]">{record.scope}</p>
          </div>
        ),
      },
      {
        key: "surface",
        label: "Surface",
        render: (record) => surfaceLabel[record.surface],
      },
      {
        key: "status",
        label: "Status",
        render: (record) => <StatusBadge label={statusMeta[record.status].label} tone={statusMeta[record.status].tone} />,
      },
      {
        key: "severity",
        label: "Risk",
        render: (record) => <StatusBadge label={severityMeta[record.severity].label} tone={severityMeta[record.severity].tone} />,
      },
      {
        key: "amountProtected",
        label: "Protected",
        align: "right",
        mono: true,
        render: (record) => `$${record.amountProtected.toLocaleString()}`,
      },
      { key: "owner", label: "Owner", hideOnMobile: true },
      {
        key: "lastEvent",
        label: "Last event",
        hideOnMobile: true,
        mono: true,
      },
    ],
    [],
  );

  const createRecord = (record: AuditRecord) => {
    setRecords((current) => [record, ...current]);
    setSelectedId(record.id);
    setCreateOpen(false);
  };

  const updateRecord = (record: AuditRecord) => {
    setRecords((current) => current.map((entry) => (entry.id === record.id ? record : entry)));
    setSelectedId(record.id);
    setEditRecord(null);
  };

  const advanceRecord = (record: AuditRecord) => {
    const next = statusMeta[record.status].next;
    if (!next) return;
    updateRecord({
      ...record,
      lastEvent: "Just now",
      status: next,
      evidence: [`${statusMeta[next].label} transition captured by admin`, ...record.evidence],
    });
  };

  const archiveRecord = (record: AuditRecord) => {
    setRecords((current) => current.filter((entry) => entry.id !== record.id));
    setSelectedId((current) => {
      if (current !== record.id) return current;
      return records.find((entry) => entry.id !== record.id)?.id ?? "";
    });
    setConfirmRecord(null);
    if (drawerRecord?.id === record.id) setDrawerRecord(null);
  };

  return (
    <div className="grid min-w-0 gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <DashboardPageHeader
        className="mb-0"
        title="Audit reports"
        description="Govern commercial boundaries, identity changes, delivery evidence, support communications, and proof consent without exposing client revenue or developer compensation to the wrong party."
        status={<StatusBadge label="Governance live" tone="active" />}
        actions={
          <>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.84rem] font-medium text-[var(--bg)]"
            >
              <IconPlus size={15} stroke={1.8} />
              New report
            </button>
            <button
              type="button"
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.84rem] font-medium text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
            >
              <IconDownload size={15} stroke={1.8} />
              Export evidence
            </button>
          </>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard chart="bar" data={stats.exceptionTrend} icon={IconAlertTriangle} label="Open exceptions" trend={`${stats.reviewCount} controls in review`} value={String(stats.exceptionCount)} />
        <KpiCard data={stats.protectedTrend} icon={IconLock} label="Commercial exposure protected" trend="+18% under gated policy" value={`$${Math.round(stats.amountProtected / 1000)}k`} />
        <KpiCard chart="bar" data={stats.surfaceCounts} icon={IconReportAnalytics} label="Audited surfaces" trend={`${stats.surfaceCoverage}/5 surfaces covered`} value={`${stats.surfaceCoverage}`} />
        <KpiCard data={stats.cleanTrend} icon={IconShieldCheck} label="Clean controls" trend={`${stats.cleanRatio}% clear evidence chain`} value={`${stats.cleanCount}`} />
      </section>

      <section className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)]">
        <AuditCommandRoom
          record={selected}
          onAdvance={selected ? () => advanceRecord(selected) : undefined}
          onArchive={selected ? () => setConfirmRecord(selected) : undefined}
          onEdit={selected ? () => setEditRecord(selected) : undefined}
          onInspect={selected ? () => setDrawerRecord(selected) : undefined}
        />
        <AuditVisibilityPanel record={selected} />
      </section>

      <SectionDivider />

      <section className="grid gap-5 2xl:grid-cols-[minmax(20rem,0.72fr)_minmax(0,1.28fr)]">
        <AuditControlTower stats={stats} />
        <AuditReviewQueue
          records={filtered}
          selectedId={selected?.id ?? ""}
          onArchive={setConfirmRecord}
          onEdit={setEditRecord}
          onInspect={setDrawerRecord}
          onSelect={setSelectedId}
          onAdvance={advanceRecord}
        />
      </section>

      <div>
        <SectionDivider />
        <p className="mt-3 text-[0.72rem] uppercase tracking-[0.14em] text-[var(--on-surface-dim)]">
          Evidence Ledger
        </p>
      </div>

      <OperationalDataTable
        columns={columns}
        description="Every row is a reportable control with explicit role visibility, evidence, owner, and next governance move."
        empty="No audit controls match the current filters."
        onRowSelect={setDrawerRecord}
        rows={filtered}
        title="Governance ledger"
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <FilterControl icon={IconSearch}>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search controls..."
                className="h-9 w-48 bg-transparent text-[0.8rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)]"
              />
            </FilterControl>
            <FilterControl icon={IconFilter}>
              <select
                value={surfaceFilter}
                onChange={(event) => setSurfaceFilter(event.target.value as AuditSurface | "all")}
                className="h-9 bg-transparent text-[0.8rem] text-[var(--on-surface)] outline-none"
              >
                <option value="all">All surfaces</option>
                {(Object.keys(surfaceLabel) as AuditSurface[]).map((surface) => (
                  <option key={surface} value={surface}>{surfaceLabel[surface]}</option>
                ))}
              </select>
            </FilterControl>
            <FilterControl icon={IconClock}>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as AuditStatus | "all")}
                className="h-9 bg-transparent text-[0.8rem] text-[var(--on-surface)] outline-none"
              >
                <option value="all">All states</option>
                {statusOrder.map((status) => (
                  <option key={status} value={status}>{statusMeta[status].label}</option>
                ))}
              </select>
            </FilterControl>
          </div>
        }
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
            onAdvance={advanceRecord}
            onArchive={setConfirmRecord}
            onEdit={setEditRecord}
          />
        )}
      </EntityDrawer>

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
          onSubmit={updateRecord}
          open={Boolean(editRecord)}
          record={editRecord}
        />
      )}

      <ConfirmDialog
        cancelLabel="Keep record"
        confirmLabel="Archive control"
        description={confirmRecord ? `${confirmRecord.title} will leave the active governance ledger. Use this only when evidence has been exported and the control no longer needs operational follow-up.` : ""}
        onCancel={() => setConfirmRecord(null)}
        onConfirm={() => confirmRecord && archiveRecord(confirmRecord)}
        open={Boolean(confirmRecord)}
        title="Archive audit record?"
      />
    </div>
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
  if (!record) {
    return (
      <section className="min-w-0 rounded-[1.6rem] border border-dashed border-[var(--glass-border)] bg-[var(--surface)] p-8 text-center shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]">
        <p className="text-[1rem] font-medium text-[var(--on-surface)]">No audit control selected</p>
        <p className="mx-auto mt-2 max-w-xl text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
          Select a control from the review queue to inspect policy, role visibility, evidence, and next governance action.
        </p>
      </section>
    );
  }

  const next = statusMeta[record.status].next;

  return (
    <section className="min-w-0 overflow-hidden rounded-[1.6rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_22%,var(--surface)),var(--surface))] shadow-[0_22px_70px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]">
      <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={statusMeta[record.status].label} tone={statusMeta[record.status].tone} />
            <StatusBadge label={severityMeta[record.severity].label} tone={severityMeta[record.severity].tone} />
            <span className="rounded-full border border-[var(--glass-border)] px-2.5 py-1 font-mono text-[0.68rem] text-[var(--on-surface-dim)]">
              {surfaceLabel[record.surface]}
            </span>
          </div>
          <p className="mt-5 label-caps text-[var(--primary)]">Governance command</p>
          <h2 className="title-serif mt-3 text-[1.45rem] font-medium leading-tight tracking-tight text-[var(--on-surface)]">
            {record.title}
          </h2>
          <p className="mt-3 max-w-3xl text-[0.96rem] leading-relaxed text-[var(--on-surface-dim)]">
            {record.policy}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <InfoTile label="Scope" value={record.scope} />
            <InfoTile label="Protected" value={`$${record.amountProtected.toLocaleString()}`} />
            <InfoTile label="Cadence" value={record.reportCadence} />
          </div>
        </div>

        <aside className="rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
          <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Next governance move</p>
          <p className="mt-3 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{record.nextAction}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <ActionButton icon={IconEye} onClick={onInspect ?? (() => undefined)}>Inspect</ActionButton>
            <ActionButton icon={IconEdit} onClick={onEdit ?? (() => undefined)}>Edit</ActionButton>
            {next && <ActionButton icon={IconCheck} onClick={onAdvance ?? (() => undefined)}>{statusMeta[next].label}</ActionButton>}
            <ActionButton danger icon={IconArchive} onClick={onArchive ?? (() => undefined)}>Archive</ActionButton>
          </div>
        </aside>
      </div>

      <div className="grid border-t border-[var(--glass-border)] md:grid-cols-3">
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
    </section>
  );
}

function AuditControlTower({ stats }: { stats: AuditStats }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]">
      <PanelHeading icon={IconDatabaseExport} title="Control tower" detail="Exception pressure by governance surface" />
      <div className="mt-5">
        <DashboardDonutChart
          data={[
            { label: "Clean", value: stats.cleanCount, tone: "success" },
            { label: "Review", value: stats.reviewCount, tone: "secondary" },
            { label: "Exception", value: stats.exceptionCount, tone: "primary" },
          ]}
          height={220}
        />
      </div>
      <div className="mt-5 grid gap-3">
        {stats.surfaceBreakdown.map((item) => (
          <div key={item.label} className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.82rem] text-[var(--on-surface)]">{item.label}</p>
              <span className="font-mono text-[0.76rem] text-[var(--on-surface-dim)]">{item.value}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)]">
              <span
                className="block h-full rounded-full bg-[var(--secondary)]"
                style={{ width: `${Math.min(100, item.value * 25)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
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
  return (
    <section className="min-w-0 overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]">
      <div className="border-b border-[var(--glass-border)] p-5">
        <PanelHeading icon={IconFileAnalytics} title="Review queue" detail="Controls that affect money, identity, delivery, or public proof." />
      </div>
      <div className="grid gap-3 p-3 xl:grid-cols-2">
        {records.length ? records.map((record) => {
          const selected = record.id === selectedId;
          const next = statusMeta[record.status].next;
          return (
            <article
              key={record.id}
              className={cn(
                "rounded-2xl border p-4 transition-colors duration-200",
                selected
                  ? "border-[color-mix(in_srgb,var(--secondary)_36%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_7%,transparent)]"
                  : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[color-mix(in_srgb,var(--secondary)_22%,transparent)]",
              )}
            >
              <button type="button" onClick={() => onSelect(record.id)} className="block w-full cursor-pointer text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={statusMeta[record.status].label} tone={statusMeta[record.status].tone} />
                  <StatusBadge label={severityMeta[record.severity].label} tone={severityMeta[record.severity].tone} />
                  <span className="rounded-full border border-[var(--glass-border)] px-2.5 py-1 font-mono text-[0.68rem] text-[var(--on-surface-dim)]">
                    {surfaceLabel[record.surface]}
                  </span>
                </div>
                <h2 className="title-serif mt-3 text-[1rem] font-medium leading-tight text-[var(--on-surface)]">{record.title}</h2>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">{record.policy}</p>
              </button>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <MiniFact label="Scope" value={record.scope} />
                <MiniFact label="Protected" value={`$${record.amountProtected.toLocaleString()}`} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionButton icon={IconEye} onClick={() => onInspect(record)}>Inspect</ActionButton>
                <ActionButton icon={IconEdit} onClick={() => onEdit(record)}>Edit</ActionButton>
                {next && <ActionButton icon={IconCheck} onClick={() => onAdvance(record)}>{statusMeta[next].label}</ActionButton>}
                <ActionButton danger icon={IconTrash} onClick={() => onArchive(record)}>Archive</ActionButton>
              </div>
            </article>
          );
        }) : (
          <div className="rounded-[1.25rem] border border-dashed border-[var(--glass-border)] bg-[var(--glass-bg)] p-8 text-center xl:col-span-2">
            <p className="text-[0.96rem] font-medium text-[var(--on-surface)]">No controls match this view</p>
            <p className="mx-auto mt-2 max-w-md text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
              Clear filters or create a new report from the page action.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function AuditVisibilityPanel({ record }: { record: AuditRecord | null }) {
  if (!record) return null;

  return (
    <aside className="min-w-0 overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]">
      <PanelHeading icon={IconUsers} title="Role boundary" detail="Who can see what, and why." />
      <div className="mt-5 grid gap-3">
        <VisibilityRow enabled={record.clientVisible} label="Client-visible record" note="Can expose project scope, invoice state, approved proof, and delivery evidence." />
        <VisibilityRow enabled={record.developerVisible} label="Developer-visible record" note="Can expose work evidence, payout status, project context, and profile governance." />
        <VisibilityRow enabled={!record.developerVisible && record.amountProtected > 0} label="Compensation abstraction" note="Client pricing and Andishi margin are held at admin level only." />
      </div>
      <div className="mt-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
        <p className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">Next account move</p>
        <p className="mt-2 text-[0.92rem] leading-relaxed text-[var(--on-surface)]">{record.nextAction}</p>
      </div>
      <div className="mt-5">
        <DashboardLineChart data={[42, 50, 48, 62, 58, 70, 76]} height={150} />
      </div>
    </aside>
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

  return (
    <div className="grid gap-6">
      <section className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge label={`Priority ${rank}`} tone={rank < 3 ? "overdue" : "pending"} />
              <StatusBadge label={statusMeta[record.status].label} tone={statusMeta[record.status].tone} />
              <StatusBadge label={severityMeta[record.severity].label} tone={severityMeta[record.severity].tone} />
            </div>
            <h2 className="title-serif mt-3 text-[1.35rem] font-medium tracking-tight text-[var(--on-surface)]">{record.title}</h2>
            <p className="mt-2 max-w-3xl text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">{record.policy}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton icon={IconEdit} onClick={() => onEdit(record)}>Edit</ActionButton>
            {next && <ActionButton icon={IconCheck} onClick={() => onAdvance(record)}>{statusMeta[next].label}</ActionButton>}
            <ActionButton danger icon={IconArchive} onClick={() => onArchive(record)}>Archive</ActionButton>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <InsightTile icon={IconLock} label="Protected value" value={`$${record.amountProtected.toLocaleString()}`} />
        <InsightTile icon={IconCalendarTime} label="Cadence" value={record.reportCadence} />
        <InsightTile icon={IconShieldCheck} label="Surface" value={surfaceLabel[record.surface]} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
        <div className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5">
          <PanelHeading icon={IconDatabaseExport} title="Evidence chain" detail="Exportable proof items for the selected governance control." />
          <div className="mt-4 grid gap-3">
            {record.evidence.map((item, index) => (
              <div key={item} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--on-surface)] font-mono text-[0.72rem] text-[var(--bg)]">
                  {index + 1}
                </span>
                <p className="min-w-0 text-[0.86rem] leading-relaxed text-[var(--on-surface)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5">
          <PanelHeading icon={IconEye} title="Visibility" detail="Operational access posture" />
          <div className="mt-4 grid gap-3">
            <VisibilityRow enabled={record.clientVisible} label="Client" note={record.clientVisible ? "Visible in client workspace." : "Admin-only."} />
            <VisibilityRow enabled={record.developerVisible} label="Developer" note={record.developerVisible ? "Visible in developer workbench." : "Admin-only."} />
          </div>
        </div>
      </section>
    </div>
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
  onSubmit: (record: AuditRecord) => void;
  open: boolean;
  record?: AuditRecord | null;
}) {
  const [form, setForm] = useState<AuditRecord>(() => buildInitialAuditRecord(record));
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({ ...form, title: form.title.trim(), id: form.id || `audit-${Date.now()}` });
  };

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-6 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "create" ? "Create audit report" : "Edit audit report"}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form onSubmit={submit} className="max-h-[calc(100dvh-3rem)] w-full max-w-3xl overflow-y-auto rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--glass-border)] p-5">
          <div>
            <h2 className="title-serif text-[1.2rem] font-medium text-[var(--on-surface)]">{mode === "create" ? "Create audit report" : "Edit audit report"}</h2>
            <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">Capture surface, visibility, evidence, and the next governance move.</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]" aria-label="Close modal">
            <IconX size={18} stroke={1.6} />
          </button>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <FormField label="Control title">
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Project margin visibility boundary" className={formInputClass} />
          </FormField>
          <FormField label="Scope">
            <input value={form.scope} onChange={(event) => setForm((current) => ({ ...current, scope: event.target.value }))} className={formInputClass} />
          </FormField>
          <FormField label="Surface">
            <select value={form.surface} onChange={(event) => setForm((current) => ({ ...current, surface: event.target.value as AuditSurface }))} className={formInputClass}>
              {(Object.keys(surfaceLabel) as AuditSurface[]).map((surface) => (
                <option key={surface} value={surface}>{surfaceLabel[surface]}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Status">
            <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AuditStatus }))} className={formInputClass}>
              {statusOrder.map((status) => (
                <option key={status} value={status}>{statusMeta[status].label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Severity">
            <select value={form.severity} onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value as AuditSeverity }))} className={formInputClass}>
              {(Object.keys(severityMeta) as AuditSeverity[]).map((severity) => (
                <option key={severity} value={severity}>{severityMeta[severity].label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Owner">
            <input value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} className={formInputClass} />
          </FormField>
          <FormField label="Protected amount">
            <input type="number" min={0} value={form.amountProtected} onChange={(event) => setForm((current) => ({ ...current, amountProtected: Number(event.target.value) }))} className={formInputClass} />
          </FormField>
          <FormField label="Cadence">
            <select value={form.reportCadence} onChange={(event) => setForm((current) => ({ ...current, reportCadence: event.target.value }))} className={formInputClass}>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Quarterly</option>
            </select>
          </FormField>
          <FormField className="md:col-span-2" label="Policy boundary">
            <textarea value={form.policy} onChange={(event) => setForm((current) => ({ ...current, policy: event.target.value }))} rows={3} className={formTextareaClass} />
          </FormField>
          <FormField className="md:col-span-2" label="Next action">
            <textarea value={form.nextAction} onChange={(event) => setForm((current) => ({ ...current, nextAction: event.target.value }))} rows={2} className={formTextareaClass} />
          </FormField>
          <FormField className="md:col-span-2" label="Evidence items">
            <textarea value={form.evidence.join("\n")} onChange={(event) => setForm((current) => ({ ...current, evidence: event.target.value.split("\n").filter(Boolean) }))} rows={4} className={formTextareaClass} />
          </FormField>
          <div className="grid gap-3 md:col-span-2 sm:grid-cols-2">
            <ToggleField checked={form.clientVisible} label="Client-visible" onChange={(value) => setForm((current) => ({ ...current, clientVisible: value }))} />
            <ToggleField checked={form.developerVisible} label="Developer-visible" onChange={(value) => setForm((current) => ({ ...current, developerVisible: value }))} />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[var(--glass-border)] p-5 sm:flex-row sm:justify-end">
          <ModalButton onClick={onClose} type="button">Cancel</ModalButton>
          <ModalButton intent="primary" type="submit">{mode === "create" ? "Create report" : "Save changes"}</ModalButton>
        </div>
      </form>
    </div>
  );
}

type AuditStats = ReturnType<typeof buildAuditStats>;

function buildAuditStats(records: AuditRecord[]) {
  const exceptionCount = records.filter((record) => record.status === "exception").length;
  const reviewCount = records.filter((record) => record.status === "review").length;
  const cleanCount = records.filter((record) => record.status === "clean").length;
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

function FilterControl({ children, icon: Icon }: { children: ReactNode; icon: Icon }) {
  return (
    <label className="inline-flex h-10 min-w-0 items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[var(--on-surface-dim)]">
      <Icon size={14} stroke={1.7} />
      {children}
    </label>
  );
}

function FormField({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  return (
    <label className={cn("grid gap-2", className)}>
      <span className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">{label}</span>
      {children}
    </label>
  );
}

function ToggleField({ checked, label, onChange }: { checked: boolean; label: string; onChange: (value: boolean) => void }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.86rem] text-[var(--on-surface)]">
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
    intent?: "neutral" | "primary";
    onClick?: () => void;
    type: "button" | "submit";
  }
>(function ModalButton({ children, intent = "neutral", onClick, type }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      className={cn(
        "min-h-10 cursor-pointer rounded-full border px-5 text-[0.9rem] font-medium transition-colors duration-300",
        intent === "primary"
          ? "border-[var(--on-surface)] bg-[var(--on-surface)] text-[var(--bg)]"
          : "border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]",
      )}
    >
      {children}
    </button>
  );
});
