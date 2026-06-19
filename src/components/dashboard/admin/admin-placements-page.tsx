"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  IconAlertTriangle,
  IconBriefcase,
  IconBuilding,
  IconCheck,
  IconClock,
  IconCurrencyDollar,
  IconLayoutGrid,
  IconListDetails,
  IconMessageCircle,
  IconPlayerPause,
  IconPlus,
  IconReceipt,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconTrash,
  IconTrendingUp,
  IconX,
  type Icon,
} from "@tabler/icons-react";
import { AdminWorkflowNav } from "@/components/dashboard/admin/admin-workflow-nav";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import {
  DashboardDonutChart,
  DashboardLineChart,
} from "@/components/dashboard/shared/dashboard-chart";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import {
  OperationalDataTable,
  type OperationalTableColumn,
} from "@/components/dashboard/shared/operational-data-table";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { cn } from "@/lib/utils";
import { SectionDivider } from "@/components/ui/section-divider";

// ─── Types ───────────────────────────────────────────────────────────────────

type PlacementStatus = "active" | "onboarding" | "paused" | "renewal";
type EngagementModel = "embedded" | "project" | "team_extension";
type ViewMode = "grid" | "list";
type DetailTab = "delivery" | "financials" | "timeline" | "notes";

type PlacementRecord = {
  activity: string[];
  adminNotes: string;
  billing: number;
  client: string;
  communication: number;
  delivery: number;
  endDate: string;
  engineer: string;
  engineerRole: string;
  health: number;
  id: string;
  initials: string;
  loggedThisWeek: number;
  milestone: string;
  milestoneProgress: number;
  model: EngagementModel;
  monthlyRate: number;
  mtdBilled: number;
  project: string;
  renewalDue?: string;
  startDate: string;
  status: PlacementStatus;
  tags: string[];
  weeklyHours: number;
};

// ─── Seed data ───────────────────────────────────────────────────────────────

const placementsSeed: PlacementRecord[] = [
  {
    activity: [
      "Timesheet approved - 30h",
      "Milestone 3 submitted",
      "Intro notes added by Dennis",
    ],
    adminNotes:
      "Top performer. Client is extremely happy with the RAG workflow. Prep renewal conversation before July planning.",
    billing: 95,
    client: "Kijani Analytics",
    communication: 91,
    delivery: 96,
    endDate: "Sep 10, 2026",
    engineer: "Amina Otieno",
    engineerRole: "Senior AI Engineer",
    health: 94,
    id: "p-001",
    initials: "AO",
    loggedThisWeek: 30,
    milestone: "RAG pipeline v2 integration",
    milestoneProgress: 82,
    model: "embedded",
    monthlyRate: 8400,
    mtdBilled: 8400,
    project: "AI Support Workflow",
    startDate: "Mar 10, 2026",
    status: "active",
    tags: ["AI", "Full-stack", "Embedded"],
    weeklyHours: 32,
  },
  {
    activity: [
      "Missed 5h this week - flagged",
      "Phase 1 milestone approved",
      "Scope clarification requested",
    ],
    adminNotes:
      "Hours variance this week. Follow up with Kwame and confirm scope boundaries with SokoPay product by Friday.",
    billing: 82,
    client: "SokoPay",
    communication: 80,
    delivery: 74,
    endDate: "Jul 31, 2026",
    engineer: "Kwame Asante",
    engineerRole: "Backend Engineer",
    health: 78,
    id: "p-002",
    initials: "KA",
    loggedThisWeek: 35,
    milestone: "Reconciliation engine phase 2",
    milestoneProgress: 55,
    model: "project",
    monthlyRate: 10500,
    mtdBilled: 10500,
    project: "Payments Reconciliation",
    renewalDue: "Jul 31, 2026",
    startDate: "Apr 1, 2026",
    status: "active",
    tags: ["Payments", "Backend", "API"],
    weeklyHours: 40,
  },
  {
    activity: [
      "Onboarding checklist 80% complete",
      "First standup completed",
      "AWS access provisioned",
    ],
    adminNotes:
      "Onboarding is moving well. Watch AWS access provisioning and confirm architecture review slot this week.",
    billing: 86,
    client: "Nova Health",
    communication: 88,
    delivery: 90,
    endDate: "Nov 26, 2026",
    engineer: "Zola Ndlovu",
    engineerRole: "Cloud Platform Engineer",
    health: 88,
    id: "p-003",
    initials: "ZN",
    loggedThisWeek: 18,
    milestone: "AWS architecture sign-off",
    milestoneProgress: 38,
    model: "embedded",
    monthlyRate: 5400,
    mtdBilled: 2100,
    project: "Data Pipeline Migration",
    startDate: "May 26, 2026",
    status: "onboarding",
    tags: ["AWS", "Cloud", "Data"],
    weeklyHours: 20,
  },
  {
    activity: [
      "Delivery watchlist - 3 milestones slipped",
      "Risk note added by ops",
      "Client escalated timeline concern",
    ],
    adminNotes:
      "Risk watch. Three milestone slips in two weeks. Schedule an urgent client, engineer, and ops alignment call.",
    billing: 70,
    client: "Cloudify Inc",
    communication: 65,
    delivery: 58,
    endDate: "Jun 30, 2026",
    engineer: "Fatima Al-Zahrawi",
    engineerRole: "DevOps Engineer",
    health: 62,
    id: "p-004",
    initials: "FA",
    loggedThisWeek: 38,
    milestone: "Kubernetes cluster migration",
    milestoneProgress: 71,
    model: "project",
    monthlyRate: 11200,
    mtdBilled: 11200,
    project: "Infrastructure Migration",
    renewalDue: "Jun 30, 2026",
    startDate: "Feb 14, 2026",
    status: "active",
    tags: ["DevOps", "Kubernetes", "Terraform"],
    weeklyHours: 40,
  },
  {
    activity: [
      "Renewal proposal sent to client",
      "Final sprint milestone approved",
      "Handoff document started",
    ],
    adminNotes:
      "Renewal is imminent. Client likes the work. Draft renewal terms and confirm next scope this week.",
    billing: 91,
    client: "MedLink",
    communication: 90,
    delivery: 93,
    endDate: "Jun 1, 2026",
    engineer: "Tendo Nakamura",
    engineerRole: "Mobile Engineer",
    health: 91,
    id: "p-005",
    initials: "TN",
    loggedThisWeek: 32,
    milestone: "Accessibility audit pass",
    milestoneProgress: 95,
    model: "embedded",
    monthlyRate: 8900,
    mtdBilled: 8900,
    project: "Patient App Revamp",
    renewalDue: "Jun 1, 2026",
    startDate: "Dec 1, 2025",
    status: "renewal",
    tags: ["Mobile", "React Native", "Healthcare"],
    weeklyHours: 32,
  },
  {
    activity: [
      "Milestone 2 reviewed internally",
      "Client approved component designs",
      "Timesheet approved - 22h",
    ],
    adminNotes:
      "Stable delivery. Component library is on track after design approval. Keep next sprint scoped tightly.",
    billing: 88,
    client: "Craft Commerce",
    communication: 82,
    delivery: 87,
    endDate: "Oct 14, 2026",
    engineer: "Binta Kouyate",
    engineerRole: "Frontend Engineer",
    health: 85,
    id: "p-006",
    initials: "BK",
    loggedThisWeek: 22,
    milestone: "Product listing component library",
    milestoneProgress: 68,
    model: "team_extension",
    monthlyRate: 6200,
    mtdBilled: 6200,
    project: "Storefront Rebuild",
    startDate: "Apr 14, 2026",
    status: "active",
    tags: ["Frontend", "Next.js", "Commerce"],
    weeklyHours: 24,
  },
  {
    activity: [
      "All milestones on schedule",
      "Client NPS: 5/5 this month",
      "Timesheet auto-approved",
    ],
    adminNotes:
      "Exemplary placement. Client NPS 5/5 and timeline ahead of plan. Strong candidate for case-study capture.",
    billing: 97,
    client: "StartupHub",
    communication: 96,
    delivery: 98,
    endDate: "Aug 5, 2026",
    engineer: "Ada Mensah",
    engineerRole: "Full-stack Engineer",
    health: 97,
    id: "p-007",
    initials: "AM",
    loggedThisWeek: 40,
    milestone: "Real-time events pipeline",
    milestoneProgress: 90,
    model: "project",
    monthlyRate: 10800,
    mtdBilled: 10800,
    project: "Analytics Dashboard",
    startDate: "May 5, 2026",
    status: "active",
    tags: ["Full-stack", "Data viz", "TypeScript"],
    weeklyHours: 40,
  },
];

const billingTrend = [198, 212, 224, 219, 241, 255, 271, 284];
const billingTrendLabels = [
  "Apr 8",
  "Apr 15",
  "Apr 22",
  "Apr 29",
  "May 6",
  "May 13",
  "May 20",
  "May 27",
];
const filterTabs: Array<{ label: string; value: PlacementStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Onboarding", value: "onboarding" },
  { label: "Renewal", value: "renewal" },
  { label: "Paused", value: "paused" },
];

const modelLabel: Record<EngagementModel, string> = {
  embedded: "Embedded",
  project: "Project",
  team_extension: "Team ext.",
};

// ─── Main page ────────────────────────────────────────────────────────────────

export function AdminPlacementsPage() {
  const [placements, setPlacements] = useState(placementsSeed);
  const [selectedId, setSelectedId] = useState(placementsSeed[0]?.id ?? "");
  const [filter, setFilter] = useState<PlacementStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailPlacement, setDetailPlacement] = useState<PlacementRecord | null>(null);
  const [messagePlacement, setMessagePlacement] = useState<PlacementRecord | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      placements.filter((placement) => {
        const haystack = `${placement.engineer} ${placement.engineerRole} ${placement.client} ${placement.project} ${placement.tags.join(" ")}`.toLowerCase();
        const matchesQuery = !query || haystack.includes(query.toLowerCase());
        const matchesFilter = filter === "all" || placement.status === filter;
        return matchesQuery && matchesFilter;
      }),
    [filter, placements, query],
  );

  const metrics = useMemo(() => getPlacementMetrics(placements), [placements]);

  const tableColumns = useMemo<Array<OperationalTableColumn<PlacementRecord>>>(
    () => [
      {
        key: "engineer",
        label: "Placement",
        priority: true,
        render: (p) => (
          <div className="min-w-0">
            <p className="truncate text-[0.88rem] font-medium text-[var(--on-surface)]">{p.engineer}</p>
            <p className="mt-1 truncate text-[0.76rem] text-[var(--on-surface-dim)]">{p.client} / {p.project}</p>
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (p) => <StatusBadge label={titleCase(p.status)} tone={statusTone(p.status)} />,
      },
      {
        key: "health",
        label: "Health",
        mono: true,
        render: (p) => <span className={cn("font-mono text-[0.86rem]", healthTextClass(p.health))}>{p.health}</span>,
      },
      {
        key: "loggedThisWeek",
        label: "Hours",
        mono: true,
        hideOnMobile: true,
        render: (p) => `${p.loggedThisWeek}/${p.weeklyHours}h`,
      },
      {
        key: "model",
        label: "Model",
        hideOnMobile: true,
        render: (p) => <span className="rounded-full border border-[var(--glass-border)] px-2 py-1 font-mono text-[0.68rem] text-[var(--on-surface-dim)]">{modelLabel[p.model]}</span>,
      },
      {
        key: "mtdBilled",
        label: "MTD billed",
        mono: true,
        hideOnMobile: true,
        render: (p) => formatMoney(p.mtdBilled),
      },
    ],
    [],
  );

  const createPlacement = (formData: FormData) => {
    const engineer = getFormValue(formData, "engineer", "New Engineer");
    const client = getFormValue(formData, "client", "Client account");
    const project = getFormValue(formData, "project", "New placement");
    const rate = Number(getFormValue(formData, "rate", "8000"));
    const hours = Number(getFormValue(formData, "hours", "32"));
    const created: PlacementRecord = {
      activity: ["Placement created by admin", "Onboarding checklist opened"],
      adminNotes: "New placement. Complete onboarding checklist and schedule the first delivery standup.",
      billing: 88,
      client,
      communication: 88,
      delivery: 88,
      endDate: "TBD",
      engineer,
      engineerRole: getFormValue(formData, "role", "Engineer"),
      health: 88,
      id: `placement-${Date.now()}`,
      initials: getInitials(engineer),
      loggedThisWeek: 0,
      milestone: "Onboarding checklist",
      milestoneProgress: 0,
      model: (getFormValue(formData, "model", "embedded") as EngagementModel) ?? "embedded",
      monthlyRate: Number.isFinite(rate) ? rate : 8000,
      mtdBilled: 0,
      project,
      startDate: getFormValue(formData, "startDate", "Now"),
      status: "onboarding",
      tags: ["Onboarding"],
      weeklyHours: Number.isFinite(hours) ? hours : 32,
    };
    setPlacements((cur) => [created, ...cur]);
    setSelectedId(created.id);
    setCreateOpen(false);
    setDetailPlacement(created);
  };

  const updatePlacement = (placementId: string, updater: (p: PlacementRecord) => PlacementRecord) => {
    setPlacements((cur) => cur.map((p) => (p.id === placementId ? updater(p) : p)));
    setDetailPlacement((cur) => (cur?.id === placementId ? updater(cur) : cur));
  };

  const pausePlacement = (placement: PlacementRecord) => {
    updatePlacement(placement.id, (p) => ({
      ...p,
      activity: [p.status === "paused" ? "Placement resumed by admin" : "Placement paused by admin", ...p.activity],
      status: p.status === "paused" ? "active" : "paused",
    }));
  };

  const queueInvoice = (placement: PlacementRecord) => {
    updatePlacement(placement.id, (p) => ({
      ...p,
      activity: [`Invoice queued for ${formatMoney(p.mtdBilled)}`, ...p.activity],
    }));
  };

  const sendMessage = (placement: PlacementRecord, message: string) => {
    updatePlacement(placement.id, (p) => ({
      ...p,
      activity: [`Stakeholder message sent: ${message}`, ...p.activity],
    }));
    setMessagePlacement(null);
  };

  const saveNotes = (placement: PlacementRecord, notes: string) => {
    updatePlacement(placement.id, (p) => ({ ...p, adminNotes: notes }));
  };

  const terminatePlacement = () => {
    if (!confirmId) return;
    const next = placements.filter((p) => p.id !== confirmId);
    setPlacements(next);
    if (selectedId === confirmId) setSelectedId(next[0]?.id ?? "");
    setDetailPlacement((cur) => (cur?.id === confirmId ? null : cur));
    setConfirmId(null);
  };

  return (
    <div className="grid gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <DashboardPageHeader
        className="mb-0"
        title="Placement operations"
        description="Operate active engineer placements with delivery health, billing cadence, hours, renewal risk, and stakeholder context in one workspace."
        status={<StatusBadge label="Delivery ops" tone="neutral" />}
        actions={
          <>
            <button
              type="button"
              onClick={() => setFilter("active")}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] transition-colors duration-200 hover:bg-[var(--glass-bg)]"
            >
              <IconRefresh size={15} stroke={1.6} />
              Health check
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)] shadow-[0_12px_28px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] transition-transform duration-200 hover:-translate-y-px"
            >
              <IconPlus size={16} stroke={1.8} />
              New placement
            </button>
          </>
        }
      />

      <AdminWorkflowNav active="placements" />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <PlacementMetric icon={IconBriefcase} label="Active placements" value={String(metrics.active)} detail={`${metrics.renewal} renewal`} tone="primary" />
        <PlacementMetric icon={IconShieldCheck} label="Health 85+" value={String(metrics.healthy)} detail={`${metrics.averageHealth}% avg health`} tone="success" />
        <PlacementMetric icon={IconAlertTriangle} label="Watchlist" value={String(metrics.watchlist)} detail="Needs admin review" tone="danger" />
        <PlacementMetric icon={IconClock} label="Hours logged" value={`${metrics.hours}h`} detail="Current week" tone="neutral" />
        <PlacementMetric icon={IconCurrencyDollar} label="MTD billed" value={formatMoney(metrics.billed)} detail="Across placements" tone="neutral" />
      </section>

      <SectionDivider />

      <section className="grid min-w-0 gap-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Delivery roster"
            title="Active placement workspace"
            description="Scan live delivery, open focused engineer details only when needed, and keep the roster cards as the primary working surface."
          />
          <PlacementToolbar
            filter={filter}
            query={query}
            setFilter={setFilter}
            setQuery={setQuery}
            setViewMode={setViewMode}
            viewMode={viewMode}
          />
        </div>

        <div className={cn("grid gap-4", viewMode === "grid" ? "md:grid-cols-2 2xl:grid-cols-3" : "grid-cols-1")}>
          {filtered.length ? (
            filtered.map((placement) => (
              <PlacementCard
                key={placement.id}
                placement={placement}
                selected={selectedId === placement.id}
                viewMode={viewMode}
                onSelect={() => { setSelectedId(placement.id); setDetailPlacement(placement); }}
              />
            ))
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-[var(--glass-border)] p-8 text-center md:col-span-2 2xl:col-span-3">
              <p className="text-[0.98rem] font-medium text-[var(--on-surface)]">No placements match</p>
              <p className="mt-2 text-[0.86rem] text-[var(--on-surface-dim)]">Adjust the search or filter to return active placement records.</p>
            </div>
          )}
        </div>
      </section>

      <SectionDivider />

      <section className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-w-0 flex-col">
          <div className="min-h-[6.75rem]">
            <SectionHeading eyebrow="Observability" title="Billing and delivery movement" description="Placement revenue, risk, and completion signals for the current operating cycle." />
          </div>
          <div className="mt-6 flex min-h-[28rem] flex-1 flex-col overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_26%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-2xl sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[1rem] font-medium text-[var(--on-surface)]">Billing trend</p>
                <p className="mt-1 text-[0.86rem] text-[var(--on-surface-dim)]">Weekly placement billing across active work.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] px-3 py-1.5 font-mono text-[0.76rem] text-[var(--on-surface-dim)]">
                <IconTrendingUp size={14} stroke={1.6} />
                {formatMoney(metrics.billed)} MTD
              </span>
            </div>
            <div className="mt-6 min-h-0 flex-1">
              <DashboardLineChart data={billingTrend} height={340} labels={billingTrendLabels} variant="area" />
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="min-h-[6.75rem]">
            <SectionHeading eyebrow="Risk mix" title="Health distribution" description="How the current portfolio splits across healthy, stable, and watchlist work." />
          </div>
          <div className="mt-6 flex min-h-[28rem] flex-1 flex-col justify-center overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_26%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-2xl sm:p-6">
            <DashboardDonutChart
              data={[
                { label: "Healthy", value: metrics.healthy || 1, tone: "success" },
                { label: "Stable", value: metrics.stable || 1, tone: "primary" },
                { label: "Watchlist", value: metrics.watchlist || 1, tone: "muted" },
              ]}
              height={235}
            />
          </div>
        </div>
      </section>

      <OperationalDataTable
        columns={tableColumns}
        description="Compare placement ownership, health, billing, hours, and engagement model without opening each detail panel."
        empty="No placements match the current filter."
        onRowSelect={(placement) => { setSelectedId(placement.id); setDetailPlacement(placement); }}
        rows={filtered}
        title="Placement matrix"
      />

      {detailPlacement && (
        <PlacementDetailModal
          onClose={() => setDetailPlacement(null)}
          placement={detailPlacement}
          onInvoice={() => queueInvoice(detailPlacement)}
          onMessage={() => setMessagePlacement(detailPlacement)}
          onPause={() => pausePlacement(detailPlacement)}
          onSaveNotes={saveNotes}
          onTerminate={() => { setDetailPlacement(null); setConfirmId(detailPlacement.id); }}
        />
      )}

      <CreatePlacementModal onClose={() => setCreateOpen(false)} onCreate={createPlacement} open={createOpen} />

      <PlacementMessageModal onClose={() => setMessagePlacement(null)} onSend={sendMessage} placement={messagePlacement} />

      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Terminate this placement?"
        description={`This removes ${placements.find((p) => p.id === confirmId)?.engineer ?? "the selected engineer"} from the active placement roster while preserving the future audit trail.`}
        confirmLabel="Terminate"
        onCancel={() => setConfirmId(null)}
        onConfirm={terminatePlacement}
      />
    </div>
  );
}

// ─── Placement Card ────────────────────────────────────────────────────────────

function PlacementCard({ onSelect, placement, selected, viewMode }: { onSelect: () => void; placement: PlacementRecord; selected: boolean; viewMode: ViewMode }) {
  const hoursRatio = Math.min(placement.loggedThisWeek / placement.weeklyHours, 1);
  const risk = placement.health < 70;
  const renewal = placement.status === "renewal";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative w-full cursor-pointer overflow-hidden rounded-[1.4rem] border p-5 text-left transition-all duration-300 sm:p-6",
        selected
          ? "border-[color-mix(in_srgb,var(--primary)_38%,var(--glass-border))] bg-gradient-to-br from-[color-mix(in_srgb,var(--primary)_8%,var(--surface))] to-[var(--surface)] shadow-[0_18px_50px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]"
          : risk
            ? "border-[color-mix(in_srgb,var(--error)_34%,var(--glass-border))] bg-gradient-to-br from-[color-mix(in_srgb,var(--error)_6%,var(--surface))] to-[var(--surface)] hover:border-[color-mix(in_srgb,var(--error)_40%,var(--glass-border))]"
            : renewal
              ? "border-[color-mix(in_srgb,var(--primary)_28%,var(--glass-border))] bg-gradient-to-br from-[color-mix(in_srgb,var(--primary)_5%,var(--surface))] to-[var(--surface)] hover:border-[color-mix(in_srgb,var(--primary)_34%,var(--glass-border))]"
              : "border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_28%,var(--surface))] to-[var(--surface)] hover:border-[color-mix(in_srgb,var(--primary)_22%,var(--glass-border))] hover:shadow-[0_16px_44px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)]",
        viewMode === "list" && "md:grid md:grid-cols-[minmax(0,1fr)_18rem] md:gap-6"
      )}
    >
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--primary)_18%,transparent)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] font-mono text-[1.1rem] font-medium text-[var(--primary)] transition-colors duration-300">
              {placement.initials}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-[1rem] font-medium text-[var(--on-surface)]">{placement.engineer}</h3>
                <StatusBadge label={titleCase(placement.status)} tone={statusTone(placement.status)} />
              </div>
              <p className="mt-1 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">{placement.engineerRole}</p>
            </div>
          </div>
          <HealthRing score={placement.health} size={52} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.8rem] text-[var(--on-surface-dim)]">
          <span className="inline-flex items-center gap-1.5">
            <IconBuilding size={13} stroke={1.6} />
            {placement.client}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconBriefcase size={13} stroke={1.6} />
            {placement.project}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {placement.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] px-2.5 py-1 text-[0.72rem] text-[var(--on-surface-dim)]">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className={cn("mt-5 grid gap-4", viewMode === "list" && "md:mt-0")}>
        <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_24%,transparent)]">
          <SignalCell label="Hours" value={`${placement.loggedThisWeek}/${placement.weeklyHours}h`} />
          <SignalCell label="MTD" value={formatMoney(placement.mtdBilled)} />
          <SignalCell label="Model" value={modelLabel[placement.model]} />
        </div>
        <SignalBar label="Current milestone" value={placement.milestoneProgress} detail={placement.milestone} tone={healthColor(placement.health)} />
        <SignalBar label="Weekly hours" value={Math.round(hoursRatio * 100)} detail={`${placement.loggedThisWeek}h logged`} tone={hoursRatio >= 0.85 ? "var(--tertiary)" : "var(--primary)"} />
      </div>
    </button>
  );
}

// ─── Placement Detail Modal (Tabbed) ──────────────────────────────────────────

function PlacementDetailModal({
  onClose,
  onInvoice,
  onMessage,
  onPause,
  onSaveNotes,
  onTerminate,
  placement,
}: {
  onClose: () => void;
  onInvoice?: () => void;
  onMessage?: () => void;
  onPause?: () => void;
  onSaveNotes?: (placement: PlacementRecord, notes: string) => void;
  onTerminate?: () => void;
  placement: PlacementRecord;
}) {
  const [tab, setTab] = useState<DetailTab>("delivery");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="placement-detail-title"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--bg-deep)_76%,transparent)] backdrop-blur-xl"
        onClick={onClose}
      />

      <div className="relative flex h-full max-h-[92dvh] w-full max-w-[74rem] flex-col overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_40%,var(--surface))] to-[var(--surface)] shadow-[0_32px_120px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)]">
        
        {/* Header */}
        <div className="flex shrink-0 flex-col gap-4 border-b border-[var(--glass-border)] px-6 pb-0 pt-6 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--primary)_24%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[1.4rem] font-medium text-[var(--primary)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_12%,transparent)]">
                {placement.initials}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 id="placement-detail-title" className="text-[1.3rem] font-medium leading-tight text-[var(--on-surface)]">
                    {placement.engineer}
                  </h2>
                  <StatusBadge label={titleCase(placement.status)} tone={statusTone(placement.status)} />
                </div>
                <p className="mt-1 text-[0.84rem] text-[var(--on-surface-dim)]">
                  {placement.engineerRole} · {placement.client} / {placement.project}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <HealthRing score={placement.health} size={56} />
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors duration-200 hover:bg-[var(--glass-bg)] hover:text-[var(--on-surface)]"
              >
                <IconX size={18} stroke={1.6} />
              </button>
            </div>
          </div>

          <nav className="flex gap-1">
            {(["delivery", "financials", "timeline", "notes"] as DetailTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-t-xl px-4 py-2.5 text-[0.83rem] font-medium capitalize transition-all duration-200",
                  tab === t
                    ? "border-b-2 border-[var(--primary)] text-[var(--on-surface)]"
                    : "text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]",
                )}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>

        {/* Scrollable body */}
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {tab === "delivery" && <PlacementDeliveryTab placement={placement} />}
          {tab === "financials" && <PlacementFinancialsTab placement={placement} />}
          {tab === "timeline" && <PlacementTimelineTab placement={placement} />}
          {tab === "notes" && (
            <PlacementNotesTab
              placement={placement}
              onSaveNotes={onSaveNotes ? (n) => onSaveNotes(placement, n) : () => {}}
            />
          )}
        </div>

        {/* Footer actions */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_30%,transparent)] px-6 py-4 sm:px-7">
          <div className="flex flex-wrap items-center gap-2">
            <FooterButton icon={IconMessageCircle} label="Message" onClick={() => onMessage?.()} />
            <FooterButton icon={IconReceipt} label="Invoice" onClick={() => onInvoice?.()} />
            <FooterButton icon={placement.status === "paused" ? IconCheck : IconPlayerPause} label={placement.status === "paused" ? "Resume" : "Pause"} onClick={() => onPause?.()} />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTerminate}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--error)_34%,var(--glass-border))] px-5 text-[0.86rem] font-medium text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
            >
              <IconTrash size={15} stroke={1.8} />
              Terminate Placement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Placement Detail Subtabs ──────────────────────────────────────────────────

function PlacementDeliveryTab({ placement }: { placement: PlacementRecord }) {
  return (
    <div className="grid gap-6 p-6 sm:p-7">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-5">
          <p className="text-[0.82rem] font-medium text-[var(--on-surface)]">Current Milestone Progress</p>
          <div className="mt-4">
            <SignalBar label={placement.milestone} value={placement.milestoneProgress} detail="Of overall scope" tone={healthColor(placement.health)} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoTile label="Model" value={modelLabel[placement.model]} />
            <InfoTile label="Start Date" value={placement.startDate} />
            <InfoTile label="End Date" value={placement.endDate} />
            <InfoTile label="Renewal Due" value={placement.renewalDue ?? "N/A"} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {placement.tags.map((tag) => (
              <span className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 text-[0.78rem] text-[var(--on-surface-dim)]" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-5">
          <p className="text-[0.82rem] font-medium text-[var(--on-surface)]">Health Signals</p>
          <div className="mt-4 grid gap-5">
            <MiniBar label="Delivery" value={placement.delivery} tone={healthColor(placement.delivery)} />
            <MiniBar label="Communication" value={placement.communication} tone={healthColor(placement.communication)} />
            <MiniBar label="Billing" value={placement.billing} tone={healthColor(placement.billing)} />
          </div>
        </div>
      </section>

      <section className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-5">
        <p className="text-[0.82rem] font-medium text-[var(--on-surface)]">Next Delivery Move</p>
        <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
          {placement.health < 70
            ? "Escalate delivery risk and align the client, engineer, and ops owner."
            : placement.status === "renewal"
              ? "Move renewal context into the next client proposal cycle."
              : "Keep milestone, hours, and stakeholder communication on cadence."}
        </p>
      </section>
    </div>
  );
}

function PlacementFinancialsTab({ placement }: { placement: PlacementRecord }) {
  const hoursRatio = Math.min(placement.loggedThisWeek / placement.weeklyHours, 1);
  return (
    <div className="grid gap-6 p-6 sm:p-7">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5 rounded-[1.1rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_28%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_4%,transparent)] p-4 backdrop-blur-md">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">Monthly Rate</p>
          <p className="mt-1 font-mono text-[1.2rem] leading-none font-medium text-[var(--on-surface)]">{formatMoney(placement.monthlyRate)}</p>
          <div className="mt-auto h-[0.22rem] w-full rounded-full opacity-40 bg-[var(--tertiary)]" />
        </div>
        <div className="flex flex-col gap-1.5 rounded-[1.1rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_28%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_4%,transparent)] p-4 backdrop-blur-md">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">MTD Billed</p>
          <p className="mt-1 font-mono text-[1.2rem] leading-none font-medium text-[var(--on-surface)]">{formatMoney(placement.mtdBilled)}</p>
          <div className="mt-auto h-[0.22rem] w-full rounded-full opacity-40 bg-[var(--primary)]" />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5 rounded-[1.1rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_28%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_4%,transparent)] p-4 backdrop-blur-md sm:col-span-1">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">Weekly Hours Ratio</p>
          <p className="mt-1 font-mono text-[1.2rem] leading-none font-medium text-[var(--on-surface)]">{Math.round(hoursRatio * 100)}%</p>
          <div className="mt-auto h-[0.22rem] w-full rounded-full opacity-40 bg-[var(--secondary)]" />
        </div>
      </div>

      <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-5">
        <SignalBar
          label="Weekly hours utilization"
          value={Math.round(hoursRatio * 100)}
          detail={`${placement.loggedThisWeek}h logged / ${placement.weeklyHours}h target`}
          tone={hoursRatio >= 0.85 ? "var(--tertiary)" : "var(--primary)"}
        />
      </div>
    </div>
  );
}

function PlacementTimelineTab({ placement }: { placement: PlacementRecord }) {
  return (
    <div className="grid gap-4 p-6 sm:p-7">
      <p className="text-[0.9rem] font-medium text-[var(--on-surface)]">Recent timeline</p>
      <div className="grid gap-0">
        {placement.activity.map((item, index) => (
          <div key={`${item}-${index}`} className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-4 pb-5 last:pb-0">
            {index < placement.activity.length - 1 && (
              <div className="absolute left-[0.69rem] top-5 bottom-0 w-px bg-[var(--glass-border)]" />
            )}
            <span
              className={cn(
                "relative mt-1 h-[0.6rem] w-[0.6rem] translate-y-[0.15rem] rounded-full border-2",
                index === 0 ? "border-[var(--tertiary)] bg-[var(--tertiary)]" : "border-[var(--glass-border)] bg-[var(--surface)]",
              )}
            />
            <div className="min-w-0">
              <p className="text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{item}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlacementNotesTab({ placement, onSaveNotes }: { placement: PlacementRecord; onSaveNotes: (n: string) => void }) {
  const [prevNotes, setPrevNotes] = useState(placement.adminNotes);
  const [draft, setDraft] = useState(placement.adminNotes);

  if (placement.adminNotes !== prevNotes) {
    setPrevNotes(placement.adminNotes);
    setDraft(placement.adminNotes);
  }

  return (
    <div className="grid gap-6 p-6 sm:p-7">
      <div className="flex flex-col gap-3 rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.82rem] font-medium text-[var(--on-surface)]">Admin Handoff Note</p>
          <button
            type="button"
            onClick={() => onSaveNotes(draft)}
            className="rounded-full bg-[var(--on-surface)] px-3 py-1 text-[0.72rem] font-medium text-[var(--bg)] transition-transform duration-200 hover:-translate-y-px"
          >
            Save
          </button>
        </div>
        <textarea
          className="min-h-[10rem] w-full resize-none rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3.5 text-[0.86rem] leading-relaxed text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]"
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Private network notes..."
          value={draft}
        />
      </div>
    </div>
  );
}

function FooterButton({ danger, icon: Icon, label, onClick }: { danger?: boolean; icon: Icon; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[0.78rem] font-medium transition-colors duration-200",
        danger ? "border-[color-mix(in_srgb,var(--error)_26%,var(--glass-border))] text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]" : "border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:bg-[var(--glass-bg)] hover:text-[var(--on-surface)]",
      )}
    >
      <Icon size={13} stroke={1.6} />
      {label}
    </button>
  );
}

// ─── Shared Components & Utils ────────────────────────────────────────────────

function PlacementToolbar({ filter, query, setFilter, setQuery, setViewMode, viewMode }: { filter: PlacementStatus | "all"; query: string; setFilter: (v: PlacementStatus | "all") => void; setQuery: (v: string) => void; setViewMode: (v: ViewMode) => void; viewMode: ViewMode }) {
  return (
    <div className="grid w-full gap-3 lg:max-w-[42rem]">
      <div className="flex flex-wrap items-center gap-3">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              "min-h-9 cursor-pointer rounded-full border px-3 text-[0.8rem] font-medium transition-colors duration-200",
              filter === tab.value
                ? "border-[var(--on-surface)] bg-[var(--on-surface)] text-[var(--bg)]"
                : "border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="relative min-w-0">
          <span className="sr-only">Search placements</span>
          <IconSearch size={16} stroke={1.6} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search engineer, client, project..."
            className="h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-10 pr-4 text-[0.88rem] text-[var(--on-surface)] outline-none transition-colors placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]"
          />
        </label>
        <div className="flex w-fit items-center rounded-full border border-[var(--glass-border)] p-1">
          <ViewButton active={viewMode === "grid"} label="Grid view" onClick={() => setViewMode("grid")}><IconLayoutGrid size={15} stroke={1.6} /></ViewButton>
          <ViewButton active={viewMode === "list"} label="List view" onClick={() => setViewMode("list")}><IconListDetails size={15} stroke={1.6} /></ViewButton>
        </div>
      </div>
    </div>
  );
}

function ViewButton({ active, children, label, onClick }: { active: boolean; children: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn("grid h-8 w-8 cursor-pointer place-items-center rounded-full transition-colors duration-200", active ? "bg-[var(--on-surface)] text-[var(--bg)]" : "text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]")}
    >
      {children}
    </button>
  );
}

function SectionHeading({ description, eyebrow, title }: { description: string; eyebrow: string; title: string }) {
  return (
    <div>
      <p className="label-caps text-[var(--primary)]">{eyebrow}</p>
      <h2 className="title-serif mt-2 text-[clamp(1.48rem,2vw,1.9rem)] font-medium text-[var(--on-surface)]">{title}</h2>
      <p className="mt-2 max-w-2xl text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">{description}</p>
    </div>
  );
}

function PlacementMetric({ detail, icon: MetricIcon, label, tone, value }: { detail: string; icon: Icon; label: string; tone: "danger" | "neutral" | "primary" | "success"; value: string }) {
  const color = tone === "success" ? "var(--tertiary)" : tone === "danger" ? "var(--error)" : tone === "primary" ? "var(--primary)" : "var(--on-surface-dim)";
  const railWidth = tone === "success" ? "86%" : tone === "danger" ? "72%" : tone === "primary" ? "64%" : "46%";

  return (
    <article className="flex min-h-[9.5rem] flex-col justify-between overflow-hidden rounded-[1.25rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_44%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] p-5 shadow-[0_12px_34px_color-mix(in_srgb,var(--bg-deep)_6%,transparent),inset_0_1px_0_color-mix(in_srgb,white_14%,transparent)] backdrop-blur-2xl transition-all duration-300 hover:shadow-[0_20px_48px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.76rem] uppercase tracking-[0.12em] font-medium text-[var(--on-surface-dim)]">{label}</p>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_60%,transparent)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-md">
          <MetricIcon size={16} stroke={1.6} style={{ color }} />
        </span>
      </div>
      <div className="mt-5">
        <p className="font-mono text-[1.8rem] font-medium leading-none text-[var(--on-surface)]">{value}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[0.82rem] font-medium text-[var(--on-surface-dim)]">{detail}</p>
          <span className="h-[0.35rem] w-16 shrink-0 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]" aria-hidden>
            <span className="block h-full rounded-full transition-all duration-700 ease-out" style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${color} 30%, transparent), ${color})`, width: railWidth }} />
          </span>
        </div>
      </div>
    </article>
  );
}

function SignalCell({ label, value }: { label: string; value: string }) {
  return (
    <span className="min-w-0 border-r border-[var(--glass-border)] px-3 py-2.5 last:border-r-0">
      <span className="block truncate font-mono text-[0.82rem] text-[var(--on-surface)]">{value}</span>
      <span className="mt-1 block truncate text-[0.64rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">{label}</span>
    </span>
  );
}

function SignalBar({ detail, label, tone, value }: { detail: string; label: string; tone: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.78rem] text-[var(--on-surface-dim)]">{label}</p>
        <p className="font-mono text-[0.78rem] text-[var(--on-surface)]">{value}%</p>
      </div>
      <div className="mt-2 h-[0.28rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
        <span className="block h-full rounded-full" style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${tone} 40%, transparent), ${tone})`, width: `${Math.min(Math.max(value, 0), 100)}%` }} />
      </div>
      <p className="mt-2 line-clamp-1 text-[0.78rem] text-[var(--on-surface-dim)]">{detail}</p>
    </div>
  );
}

function MiniBar({ label, tone, value }: { label: string; tone: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[0.78rem] text-[var(--on-surface-dim)]">{label}</span>
        <span className="font-mono text-[0.78rem]" style={{ color: tone }}>{value}</span>
      </div>
      <div className="h-[0.22rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
        <span className="block h-full rounded-full" style={{ background: tone, width: `${value}%` }} />
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_18%,transparent)] px-3 py-2.5">
      <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">{label}</p>
      <p className="mt-1 truncate font-mono text-[0.82rem] font-medium text-[var(--on-surface)]">{value}</p>
    </div>
  );
}

function HealthRing({ score, size = 46 }: { score: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const tone = healthColor(score);

  return (
    <div className="relative grid shrink-0 place-items-center" style={{ height: size, width: size }} aria-label={`Placement health ${score}`}>
      <svg aria-hidden className="absolute -rotate-90" height={size} width={size}>
        <circle cx={size / 2} cy={size / 2} fill="none" r={radius} stroke="color-mix(in srgb, var(--on-surface) 10%, transparent)" strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} fill="none" r={radius} stroke={tone} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" strokeWidth="3" />
      </svg>
      <span className={cn("font-mono font-medium leading-none", healthTextClass(score), size > 50 ? "text-[0.9rem]" : "text-[0.72rem]")}>{score}</span>
    </div>
  );
}

function CreatePlacementModal({ onClose, onCreate, open }: { onClose: () => void; onCreate: (formData: FormData) => void; open: boolean }) {
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    firstInputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-8 backdrop-blur-xl" role="dialog" aria-modal="true" aria-labelledby="create-placement-title" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form onSubmit={(e) => { e.preventDefault(); onCreate(new FormData(e.currentTarget)); }} className="w-full max-w-4xl rounded-[1.75rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,var(--surface))] to-[var(--surface)] p-6 shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_42%,transparent)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-caps text-[var(--primary)]">Placements</p>
            <h2 id="create-placement-title" className="title-serif mt-2 text-[1.3rem] font-medium text-[var(--on-surface)]">Create placement</h2>
            <p className="mt-2 max-w-2xl text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">Add a delivery record with enough structure to connect client, engineer, billing, and project cadence.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors duration-200 hover:bg-[var(--glass-bg)] hover:text-[var(--on-surface)]">
            <IconX size={18} stroke={1.6} />
          </button>
        </div>
        <div className="mt-7 grid gap-4 border-t border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <FormField ref={firstInputRef} label="Engineer name" name="engineer" placeholder="Amina Otieno" />
          <FormField label="Engineer role" name="role" placeholder="Senior AI Engineer" />
          <FormField label="Client" name="client" placeholder="Kijani Analytics" />
          <FormField label="Project" name="project" placeholder="AI Support Workflow" />
          <FormField label="Monthly rate" name="rate" placeholder="8400" />
          <FormField label="Weekly hours" name="hours" placeholder="32" />
          <FormField label="Start date" name="startDate" placeholder="Jun 10, 2026" />
          <label className="lg:col-span-2">
            <span className="text-[0.76rem] font-medium text-[var(--on-surface)]">Engagement model</span>
            <select name="model" className="mt-2 h-11 w-full cursor-pointer rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)] transition-colors duration-200">
              <option value="embedded">Embedded</option>
              <option value="project">Project</option>
              <option value="team_extension">Team extension</option>
            </select>
          </label>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]">Cancel</button>
          <button type="submit" className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-5 text-[0.86rem] font-medium text-[var(--bg)]">Create placement</button>
        </div>
      </form>
    </div>
  );
}

function PlacementMessageModal({ onClose, onSend, placement }: { onClose: () => void; onSend: (p: PlacementRecord, m: string) => void; placement: PlacementRecord | null }) {
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!placement) return;
    textareaRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose, placement]);

  if (!placement) return null;

  const closeModal = () => { setDraft(""); onClose(); };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-8 backdrop-blur-xl" role="dialog" aria-modal="true" aria-labelledby="placement-message-title" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <form onSubmit={(e) => { e.preventDefault(); const m = draft.trim(); if (!m) return; onSend(placement, m); setDraft(""); }} className="w-full max-w-3xl rounded-[1.75rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,var(--surface))] to-[var(--surface)] p-6 shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_42%,transparent)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-caps text-[var(--primary)]">Stakeholder update</p>
            <h2 id="placement-message-title" className="title-serif mt-2 text-[1.2rem] font-medium text-[var(--on-surface)]">Message {placement.engineer}</h2>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">This mock action records a stakeholder message in the placement activity stream.</p>
          </div>
          <button type="button" onClick={closeModal} aria-label="Close message modal" className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]">
            <IconX size={18} stroke={1.6} />
          </button>
        </div>
        <div className="mt-5 grid gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 sm:grid-cols-3">
          {[{ label: "Client", value: placement.client }, { label: "Project", value: placement.project }, { label: "Health", value: `${placement.health}%` }].map((item) => (
            <div className="min-w-0" key={item.label}>
              <p className="text-[0.68rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">{item.label}</p>
              <p className="mt-1 truncate font-mono text-[0.86rem] text-[var(--on-surface)]">{item.value}</p>
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={5}
          placeholder="Share a delivery note, billing reminder, renewal update, or next step..."
          className="mt-5 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 text-[0.92rem] leading-relaxed text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)] transition-colors duration-200"
        />
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={closeModal} className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]">Cancel</button>
          <button type="submit" className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-5 text-[0.86rem] font-medium text-[var(--bg)]">Send update</button>
        </div>
      </form>
    </div>
  );
}

const FormField = forwardRef<HTMLInputElement, { label: string; name: string; placeholder: string }>(function FormField({ label, name, placeholder }, ref) {
  return (
    <label>
      <span className="text-[0.76rem] font-medium text-[var(--on-surface)]">{label}</span>
      <input ref={ref} name={name} placeholder={placeholder} className="mt-2 h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)] transition-colors duration-200" />
    </label>
  );
});

function getPlacementMetrics(placements: PlacementRecord[]) {
  const active = placements.filter((p) => p.status === "active").length;
  const renewal = placements.filter((p) => p.status === "renewal").length;
  const healthy = placements.filter((p) => p.health >= 85).length;
  const stable = placements.filter((p) => p.health >= 70 && p.health < 85).length;
  const watchlist = placements.filter((p) => p.health < 70).length;
  const hours = placements.reduce((s, p) => s + p.loggedThisWeek, 0);
  const billed = placements.reduce((s, p) => s + p.mtdBilled, 0);
  const averageHealth = Math.round(placements.reduce((s, p) => s + p.health, 0) / Math.max(placements.length, 1));
  return { active, averageHealth, billed, healthy, hours, renewal, stable, watchlist };
}

function healthColor(score: number) {
  if (score >= 85) return "var(--tertiary)";
  if (score >= 70) return "var(--primary)";
  return "var(--error)";
}

function healthTextClass(score: number) {
  if (score >= 85) return "text-[var(--tertiary)]";
  if (score >= 70) return "text-[var(--primary)]";
  return "text-[var(--error)]";
}

function statusTone(status: PlacementStatus) {
  if (status === "active") return "active";
  if (status === "paused") return "overdue";
  if (status === "renewal") return "neutral";
  return "pending";
}

function formatMoney(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return `$${value}`;
}

function getFormValue(formData: FormData, key: string, fallback: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || fallback;
}

function getInitials(value: string) {
  return value.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function titleCase(value: string) {
  return value.split("_").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}
