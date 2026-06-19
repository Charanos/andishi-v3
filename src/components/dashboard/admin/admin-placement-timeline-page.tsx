"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconCalendar,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconCurrencyDollar,
  IconDownload,
  IconEdit,
  IconFilter,
  IconPlus,
  IconSearch,
  IconSquare,
  IconSquareCheck,
  IconUsersGroup,
  IconX,
  type Icon,
} from "@tabler/icons-react";
import { AdminWorkflowNav } from "@/components/dashboard/admin/admin-workflow-nav";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import { DashboardBarChart } from "@/components/dashboard/shared/dashboard-chart";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import {
  OperationalDataTable,
  type OperationalTableColumn,
} from "@/components/dashboard/shared/operational-data-table";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { cn } from "@/lib/utils";
import { SectionDivider } from "@/components/ui/section-divider";

type EntryStatus = "approved" | "disputed" | "pending";

type TimesheetEntry = {
  approvedBy?: string;
  billable: boolean;
  client: string;
  date: string;
  day: string;
  description: string;
  engineer: string;
  hours: number;
  id: string;
  initials: string;
  project: string;
  status: EntryStatus;
  submittedAt: string;
};

type EngineerSummary = {
  approvedHours: number;
  billablePercent: number;
  client: string;
  engineer: string;
  initials: string;
  pendingHours: number;
  totalHours: number;
};

const baseWeekLabel = "Jun 2 - Jun 8, 2026";
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const seedEntries: TimesheetEntry[] = [
  {
    approvedBy: "Dennis",
    billable: true,
    client: "Kijani Analytics",
    date: "Jun 2",
    day: "Mon",
    description:
      "RAG pipeline integration, context retrieval refactor, and unit tests.",
    engineer: "Amina Otieno",
    hours: 8,
    id: "ts-001",
    initials: "AO",
    project: "AI Support Workflow",
    status: "approved",
    submittedAt: "Jun 2, 08:50",
  },
  {
    approvedBy: "Dennis",
    billable: true,
    client: "Kijani Analytics",
    date: "Jun 3",
    day: "Tue",
    description:
      "API endpoint implementation and documentation for the RAG query route.",
    engineer: "Amina Otieno",
    hours: 7.5,
    id: "ts-002",
    initials: "AO",
    project: "AI Support Workflow",
    status: "approved",
    submittedAt: "Jun 3, 18:10",
  },
  {
    billable: true,
    client: "Kijani Analytics",
    date: "Jun 4",
    day: "Wed",
    description: "Internal review sync and milestone 3 final QA pass.",
    engineer: "Amina Otieno",
    hours: 8,
    id: "ts-003",
    initials: "AO",
    project: "AI Support Workflow",
    status: "pending",
    submittedAt: "Jun 4, 17:45",
  },
  {
    approvedBy: "Dennis",
    billable: true,
    client: "SokoPay",
    date: "Jun 2",
    day: "Mon",
    description:
      "Reconciliation engine phase 2 kickoff, schema design, and data contracts.",
    engineer: "Kwame Asante",
    hours: 8,
    id: "ts-004",
    initials: "KA",
    project: "Payments Reconciliation",
    status: "approved",
    submittedAt: "Jun 2, 09:10",
  },
  {
    billable: true,
    client: "SokoPay",
    date: "Jun 3",
    day: "Tue",
    description:
      "Transaction batch processor and edge-case handling for partial matches.",
    engineer: "Kwame Asante",
    hours: 7,
    id: "ts-005",
    initials: "KA",
    project: "Payments Reconciliation",
    status: "pending",
    submittedAt: "Jun 3, 19:30",
  },
  {
    billable: false,
    client: "SokoPay",
    date: "Jun 4",
    day: "Wed",
    description:
      "Scope clarification call with product team; disputed non-billable log window.",
    engineer: "Kwame Asante",
    hours: 6,
    id: "ts-006",
    initials: "KA",
    project: "Payments Reconciliation",
    status: "disputed",
    submittedAt: "Jun 4, 20:10",
  },
  {
    approvedBy: "Ops",
    billable: true,
    client: "Nova Health",
    date: "Jun 2",
    day: "Mon",
    description: "Onboarding: AWS IAM setup and environment orientation.",
    engineer: "Zola Ndlovu",
    hours: 4,
    id: "ts-007",
    initials: "ZN",
    project: "Data Pipeline Migration",
    status: "approved",
    submittedAt: "Jun 2, 16:20",
  },
  {
    billable: true,
    client: "Nova Health",
    date: "Jun 3",
    day: "Tue",
    description:
      "Architecture diagram for S3-to-Redshift pipeline and first review.",
    engineer: "Zola Ndlovu",
    hours: 4.5,
    id: "ts-008",
    initials: "ZN",
    project: "Data Pipeline Migration",
    status: "pending",
    submittedAt: "Jun 3, 17:00",
  },
  {
    approvedBy: "Dennis",
    billable: true,
    client: "Cloudify Inc",
    date: "Jun 2",
    day: "Mon",
    description:
      "Kubernetes cluster migration, namespace policy config, and rollout.",
    engineer: "Fatima Al-Zahrawi",
    hours: 8,
    id: "ts-009",
    initials: "FA",
    project: "Infrastructure Migration",
    status: "approved",
    submittedAt: "Jun 2, 18:00",
  },
  {
    billable: true,
    client: "Cloudify Inc",
    date: "Jun 3",
    day: "Tue",
    description: "CI/CD pipeline testing and regression fixes after migration.",
    engineer: "Fatima Al-Zahrawi",
    hours: 8,
    id: "ts-010",
    initials: "FA",
    project: "Infrastructure Migration",
    status: "pending",
    submittedAt: "Jun 3, 19:15",
  },
  {
    billable: true,
    client: "Cloudify Inc",
    date: "Jun 4",
    day: "Wed",
    description:
      "Helm chart migration; four services completed and staging validation in progress.",
    engineer: "Fatima Al-Zahrawi",
    hours: 7.5,
    id: "ts-011",
    initials: "FA",
    project: "Infrastructure Migration",
    status: "pending",
    submittedAt: "Jun 4, 18:55",
  },
  {
    approvedBy: "Dennis",
    billable: true,
    client: "StartupHub",
    date: "Jun 2",
    day: "Mon",
    description:
      "Real-time events pipeline, WebSocket server, and first chart live-update.",
    engineer: "Ada Mensah",
    hours: 8,
    id: "ts-012",
    initials: "AM",
    project: "Analytics Dashboard",
    status: "approved",
    submittedAt: "Jun 2, 18:00",
  },
  {
    approvedBy: "Dennis",
    billable: true,
    client: "StartupHub",
    date: "Jun 3",
    day: "Tue",
    description:
      "Dashboard polish sprint, chart theming, tooltip redesign, and mobile layout.",
    engineer: "Ada Mensah",
    hours: 8,
    id: "ts-013",
    initials: "AM",
    project: "Analytics Dashboard",
    status: "approved",
    submittedAt: "Jun 3, 17:45",
  },
  {
    billable: true,
    client: "StartupHub",
    date: "Jun 4",
    day: "Wed",
    description:
      "Performance optimization, lazy-loaded chart modules, and memoization pass.",
    engineer: "Ada Mensah",
    hours: 8,
    id: "ts-014",
    initials: "AM",
    project: "Analytics Dashboard",
    status: "pending",
    submittedAt: "Jun 4, 18:20",
  },
];

const filterTabs: Array<{ label: string; value: EntryStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Disputed", value: "disputed" },
];

export function AdminPlacementTimelinePage() {
  const [entries, setEntries] = useState(seedEntries);
  const [filter, setFilter] = useState<EntryStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [drawerEntry, setDrawerEntry] = useState<TimesheetEntry | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const metrics = useMemo(() => getTimelineMetrics(entries), [entries]);
  const dailyTotals = useMemo(() => getDailyTotals(entries), [entries]);
  const summaries = useMemo(() => getEngineerSummaries(entries), [entries]);
  const activeWeekLabel = useMemo(() => getWeekLabel(weekOffset), [weekOffset]);

  const filtered = useMemo(
    () =>
      entries.filter((entry) => {
        const haystack =
          `${entry.engineer} ${entry.project} ${entry.client} ${entry.description}`.toLowerCase();
        const matchesQuery = !query || haystack.includes(query.toLowerCase());
        const matchesFilter = filter === "all" || entry.status === filter;
        return matchesQuery && matchesFilter;
      }),
    [entries, filter, query],
  );

  const tableColumns = useMemo<Array<OperationalTableColumn<TimesheetEntry>>>(
    () => [
      {
        key: "engineer",
        label: "Entry",
        priority: true,
        render: (entry) => (
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar initials={entry.initials} />
            <div className="min-w-0">
              <p className="truncate text-[0.86rem] font-medium text-[var(--on-surface)]">
                {entry.engineer}
              </p>
              <p className="mt-1 truncate text-[0.74rem] text-[var(--on-surface-dim)]">
                {entry.project}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "date",
        label: "Date",
        render: (entry) => (
          <span className="font-mono text-[0.8rem] text-[var(--on-surface-dim)]">
            {entry.day} / {entry.date}
          </span>
        ),
      },
      {
        key: "hours",
        label: "Hours",
        mono: true,
        render: (entry) => `${entry.hours}h`,
      },
      {
        key: "billable",
        label: "Billable",
        hideOnMobile: true,
        render: (entry) => (
          <span
            className={cn(
              "font-mono text-[0.76rem]",
              entry.billable
                ? "text-[var(--tertiary)]"
                : "text-[var(--on-surface-dim)]",
            )}
          >
            {entry.billable ? "Yes" : "No"}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (entry) => (
          <StatusBadge
            label={titleCase(entry.status)}
            tone={statusTone(entry.status)}
          />
        ),
      },
      {
        key: "client",
        label: "Client",
        hideOnMobile: true,
      },
    ],
    [],
  );

  const approveEntry = (entryId: string) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.id === entryId
          ? { ...entry, approvedBy: "Dennis", status: "approved" }
          : entry,
      ),
    );
  };

  const disputeEntry = (entryId: string) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.id === entryId ? { ...entry, status: "disputed" } : entry,
      ),
    );
  };

  const toggleSelect = (entryId: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(entryId)) next.delete(entryId);
      else next.add(entryId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((current) => {
      const allVisibleSelected =
        filtered.length > 0 && filtered.every((entry) => current.has(entry.id));
      if (allVisibleSelected) return new Set();
      return new Set(filtered.map((entry) => entry.id));
    });
  };

  const selectedPendingCount = Array.from(selected).filter(
    (entryId) =>
      entries.find((entry) => entry.id === entryId)?.status === "pending",
  ).length;

  const bulkApprove = () => {
    setEntries((current) =>
      current.map((entry) =>
        selected.has(entry.id) && entry.status === "pending"
          ? { ...entry, approvedBy: "Dennis", status: "approved" }
          : entry,
      ),
    );
    setSelected(new Set());
    setConfirmBulk(false);
  };

  const addEntry = (formData: FormData) => {
    const engineer = getFormValue(formData, "engineer", "New Engineer");
    const hours = Number(getFormValue(formData, "hours", "0"));
    const created: TimesheetEntry = {
      billable: formData.get("billable") === "on",
      client: getFormValue(formData, "client", "Client account"),
      date: getFormValue(formData, "date", "Jun 4"),
      day: getFormValue(formData, "day", "Wed"),
      description: getFormValue(
        formData,
        "description",
        "Manual placement timeline entry.",
      ),
      engineer,
      hours: Number.isFinite(hours) ? hours : 0,
      id: `ts-${Date.now()}`,
      initials: getInitials(engineer),
      project: getFormValue(formData, "project", "Placement work"),
      status: "pending",
      submittedAt: "Now",
    };
    setEntries((current) => [created, ...current]);
    setAddOpen(false);
  };

  return (
    <div className="grid gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <DashboardPageHeader
        className="mb-0"
        title="Placement timeline"
        description="Review weekly timesheet movement across active placements, approve submitted hours, dispute questionable entries, and keep billing readiness visible."
        status={<StatusBadge label={activeWeekLabel} tone="neutral" />}
        actions={
          <>
            <button
              type="button"
              onClick={() =>
                setExportNotice(`Export prepared for ${activeWeekLabel}`)
              }
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] transition-colors duration-200 hover:bg-[var(--glass-bg)]"
            >
              <IconDownload size={15} stroke={1.7} />
              Export week
            </button>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)] shadow-[0_12px_28px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] transition-transform duration-200 hover:-translate-y-px"
            >
              <IconPlus size={16} stroke={1.8} />
              Add entry
            </button>
          </>
        }
      />

      <AdminWorkflowNav active="placements" />

      {exportNotice && (
        <div className="flex items-center justify-between gap-3 rounded-[1rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3">
          <p className="text-[0.86rem] text-[var(--on-surface)]">
            {exportNotice}
          </p>
          <button
            type="button"
            onClick={() => setExportNotice(null)}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-[var(--on-surface-dim)] hover:bg-[var(--surface)] hover:text-[var(--on-surface)]"
            aria-label="Dismiss export notice"
          >
            <IconX size={15} stroke={1.7} />
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <TimelineMetric
          icon={IconClock}
          label="Total hours"
          value={`${metrics.totalHours.toFixed(1)}h`}
          detail="Week submitted"
          tone="neutral"
        />
        <TimelineMetric
          icon={IconFilter}
          label="Pending approval"
          value={`${metrics.pendingHours.toFixed(1)}h`}
          detail={`${metrics.pendingEntries} entries`}
          tone="primary"
        />
        <TimelineMetric
          icon={IconCheck}
          label="Approved"
          value={`${metrics.approvedHours.toFixed(1)}h`}
          detail="Ready for billing"
          tone="success"
        />
        <TimelineMetric
          icon={IconCurrencyDollar}
          label="Billable"
          value={`${metrics.billablePercent}%`}
          detail={`${metrics.billableHours.toFixed(1)}h billable`}
          tone="neutral"
        />
        <TimelineMetric
          icon={IconUsersGroup}
          label="Engineers"
          value={String(metrics.engineers)}
          detail="Logged this week"
          tone="neutral"
        />
      </section>

      <SectionDivider />

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0">
          <WeekNavigator
            dailyTotals={dailyTotals}
            entries={entries}
            onNext={() => setWeekOffset((current) => current + 1)}
            onPrevious={() => setWeekOffset((current) => current - 1)}
            weekLabel={activeWeekLabel}
          />
          <div className="mt-6 flex min-h-[30rem] flex-col rounded-[1.35rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_18%,var(--surface)),var(--surface))] p-5 shadow-[0_14px_42px_color-mix(in_srgb,var(--bg-deep)_5%,transparent)] sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[1rem] font-medium text-[var(--on-surface)]">
                  Daily hours logged
                </p>
                <p className="mt-1 text-[0.86rem] text-[var(--on-surface-dim)]">
                  Across all placements for {activeWeekLabel}.
                </p>
              </div>
              <p className="font-mono text-[0.84rem] text-[var(--on-surface-dim)]">
                {dailyTotals.reduce((sum, value) => sum + value, 0).toFixed(1)}h
                week so far
              </p>
            </div>
            <div className="mt-6 grid min-h-0 flex-1 place-items-stretch rounded-[1.1rem] border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--surface)_62%,transparent)] p-3">
              <div className="min-h-0 w-full">
                <DashboardBarChart
                  data={dailyTotals}
                  height={360}
                  labels={days}
                />
              </div>
            </div>
          </div>
        </div>

        <QuickApproveQueue
          entries={entries}
          onApprove={approveEntry}
          onDispute={disputeEntry}
        />
      </section>

      <SectionDivider />

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0">
          <SectionHeading
            eyebrow="Engineer breakdown"
            title="Hours by placement"
            description="Approved, pending, and billable distribution by engineer so billing and delivery follow-up stay aligned."
          />
          <div className="mt-6 grid gap-3">
            {summaries.map((summary) => (
              <EngineerSummaryRow key={summary.engineer} summary={summary} />
            ))}
          </div>
        </div>

        <TimelineControlPanel
          filter={filter}
          pendingCount={metrics.pendingEntries}
          query={query}
          selectedCount={selected.size}
          selectedPendingCount={selectedPendingCount}
          setFilter={setFilter}
          setQuery={setQuery}
          onBulkApprove={() => selectedPendingCount > 0 && setConfirmBulk(true)}
          onClear={() => setSelected(new Set())}
        />
      </section>

      <SectionDivider />

      <section className="min-w-0">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label-caps text-[var(--primary)]">Approval ledger</p>
            <h2 className="title-serif mt-2 text-[clamp(1.48rem,2vw,1.9rem)] font-medium text-[var(--on-surface)]">
              Timeline entries
            </h2>
            <p className="mt-2 text-[0.9rem] text-[var(--on-surface-dim)]">
              {filtered.length} entries / {activeWeekLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleSelectAll}
            className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-3 text-[0.82rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]"
          >
            {filtered.length > 0 &&
            filtered.every((entry) => selected.has(entry.id)) ? (
              <IconSquareCheck size={15} stroke={1.7} />
            ) : (
              <IconSquare size={15} stroke={1.7} />
            )}
            Select visible
          </button>
        </div>

        <div className="overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_16%,var(--surface)),var(--surface))] shadow-[0_16px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]">
          <div className="hidden grid-cols-[2.25rem_minmax(0,1.2fr)_minmax(10rem,0.8fr)_8rem_12rem] gap-3 border-b border-[var(--glass-border)] px-5 py-3 text-[0.68rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)] lg:grid">
            <span />
            <span>Engineer / work</span>
            <span>Placement</span>
            <span className="text-right">Hours</span>
            <span className="text-right">State</span>
          </div>
          <div className="divide-y divide-[color-mix(in_srgb,var(--glass-border)_58%,transparent)]">
            {filtered.length ? (
              filtered.map((entry) => (
                <TimelineEntryRow
                  key={entry.id}
                  entry={entry}
                  selected={selected.has(entry.id)}
                  onApprove={() => approveEntry(entry.id)}
                  onDispute={() => disputeEntry(entry.id)}
                  onInspect={() => setDrawerEntry(entry)}
                  onToggle={() => toggleSelect(entry.id)}
                />
              ))
            ) : (
              <div className="p-10 text-center">
                <p className="text-[0.98rem] font-medium text-[var(--on-surface)]">
                  No entries found
                </p>
                <p className="mt-2 text-[0.84rem] text-[var(--on-surface-dim)]">
                  Adjust the search or filter to find placement timeline
                  entries.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-[var(--glass-border)] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
              {filtered.reduce((sum, entry) => sum + entry.hours, 0).toFixed(1)}
              h total /{" "}
              {filtered
                .filter((entry) => entry.billable)
                .reduce((sum, entry) => sum + entry.hours, 0)
                .toFixed(1)}
              h billable
            </p>
            <p className="font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
              {filtered.length} entries shown
            </p>
          </div>
        </div>
      </section>

      <SectionDivider />

      <OperationalDataTable
        columns={tableColumns}
        description="Structured matrix for cross-checking placement timeline entries by engineer, date, billable status, client, and approval state."
        empty="No timeline entries match the current filter."
        onRowSelect={(entry) => setDrawerEntry(entry)}
        rows={filtered}
        title="Timesheet matrix"
      />

      <TimelineEntryModal
        entry={drawerEntry}
        onClose={() => setDrawerEntry(null)}
        onApprove={(entry) => {
          approveEntry(entry.id);
          setDrawerEntry(null);
        }}
        onDispute={(entry) => {
          disputeEntry(entry.id);
          setDrawerEntry(null);
        }}
      />

      <AddEntryModal
        onAdd={addEntry}
        onClose={() => setAddOpen(false)}
        open={addOpen}
      />

      <ConfirmDialog
        open={confirmBulk}
        title={`Approve ${selectedPendingCount} pending entries?`}
        description={`This marks ${selectedPendingCount} selected pending entries as approved and records the action for the future audit trail.`}
        confirmLabel="Approve selected"
        onCancel={() => setConfirmBulk(false)}
        onConfirm={bulkApprove}
      />
    </div>
  );
}

function WeekNavigator({
  dailyTotals,
  entries,
  onNext,
  onPrevious,
  weekLabel,
}: {
  dailyTotals: number[];
  entries: TimesheetEntry[];
  onNext: () => void;
  onPrevious: () => void;
  weekLabel: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors duration-200 hover:text-[var(--on-surface)]"
          aria-label="Previous week"
        >
          <IconChevronLeft size={15} stroke={1.7} />
        </button>
        <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4">
          <IconCalendar
            size={14}
            stroke={1.7}
            className="text-[var(--primary)]"
          />
          <span className="font-mono text-[0.8rem] text-[var(--on-surface)]">
            {weekLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors duration-200 hover:text-[var(--on-surface)]"
          aria-label="Next week"
        >
          <IconChevronRight size={15} stroke={1.7} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {days.map((day, index) => {
          const pending = entries.some(
            (entry) => entry.day === day && entry.status === "pending",
          );
          const active = day === "Wed";
          return (
            <div
              key={day}
              className={cn(
                "rounded-xl border px-2.5 py-2 text-center",
                active
                  ? "border-[color-mix(in_srgb,var(--primary)_35%,transparent)] bg-[color-mix(in_srgb,var(--primary)_7%,transparent)]"
                  : "border-[var(--glass-border)]",
              )}
            >
              <p
                className={cn(
                  "text-[0.62rem] uppercase tracking-[0.08em]",
                  active
                    ? "text-[var(--primary)]"
                    : "text-[var(--on-surface-dim)]",
                )}
              >
                {day}
              </p>
              <p className="mt-1 font-mono text-[0.75rem] text-[var(--on-surface)]">
                {dailyTotals[index] > 0 ? `${dailyTotals[index]}h` : "-"}
              </p>
              {pending && (
                <span className="mx-auto mt-1 block h-1 w-1 rounded-full bg-[var(--primary)]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuickApproveQueue({
  entries,
  onApprove,
  onDispute,
}: {
  entries: TimesheetEntry[];
  onApprove: (entryId: string) => void;
  onDispute: (entryId: string) => void;
}) {
  const pending = entries.filter((entry) => entry.status === "pending");
  const pendingHours = pending.reduce((sum, entry) => sum + entry.hours, 0);

  return (
    <aside className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_18%,var(--surface)),var(--surface))] shadow-[0_16px_42px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] 2xl:sticky 2xl:top-28 2xl:self-start">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--glass-border)] px-5 py-4">
        <div>
          <p className="text-[1rem] font-medium text-[var(--on-surface)]">
            Approval queue
          </p>
          <p className="mt-1 text-[0.82rem] text-[var(--on-surface-dim)]">
            Pending entries needing admin action.
          </p>
        </div>
        <span className="rounded-full border border-[var(--glass-border)] px-3 py-1.5 font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
          {pendingHours.toFixed(1)}h
        </span>
      </div>
      <div className="grid gap-0">
        {pending.length ? (
          pending.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] gap-3 border-b border-[color-mix(in_srgb,var(--glass-border)_58%,transparent)] px-4 py-3.5 last:border-b-0"
            >
              <Avatar initials={entry.initials} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="text-[0.84rem] font-medium text-[var(--on-surface)]">
                    {entry.engineer}
                  </p>
                  <p className="font-mono text-[0.76rem] text-[var(--primary)]">
                    {entry.hours}h
                  </p>
                  <p className="font-mono text-[0.68rem] text-[var(--on-surface-dim)]">
                    {entry.day} / {entry.date}
                  </p>
                </div>
                <p className="mt-1 line-clamp-1 text-[0.76rem] text-[var(--on-surface-dim)]">
                  {entry.description}
                </p>
                <p className="mt-1 text-[0.7rem] text-[var(--on-surface-dim)]">
                  {entry.project} / {entry.client}
                </p>
              </div>
              <div className="flex items-start gap-1.5">
                <QueueAction
                  label={`Approve ${entry.engineer}`}
                  tone="success"
                  onClick={() => onApprove(entry.id)}
                >
                  <IconCheck size={12} stroke={2} />
                </QueueAction>
                <QueueAction
                  label={`Dispute ${entry.engineer}`}
                  tone="danger"
                  onClick={() => onDispute(entry.id)}
                >
                  <IconX size={12} stroke={2} />
                </QueueAction>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <IconCheck
              size={22}
              stroke={1.7}
              className="mx-auto text-[var(--tertiary)]"
            />
            <p className="mt-3 text-[0.92rem] font-medium text-[var(--on-surface)]">
              All clear
            </p>
            <p className="mt-1 text-[0.82rem] text-[var(--on-surface-dim)]">
              No pending entries this week.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

function EngineerSummaryRow({ summary }: { summary: EngineerSummary }) {
  const approvedWidth =
    (summary.approvedHours / Math.max(summary.totalHours, 1)) * 100;
  const pendingWidth =
    (summary.pendingHours / Math.max(summary.totalHours, 1)) * 100;

  return (
    <article className="grid gap-3 rounded-[1.2rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_15%,var(--surface)),var(--surface))] p-4 shadow-[0_10px_30px_color-mix(in_srgb,var(--bg-deep)_4%,transparent)] md:grid-cols-[minmax(0,1fr)_16rem] md:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar initials={summary.initials} />
        <div className="min-w-0">
          <p className="truncate text-[0.95rem] font-medium text-[var(--on-surface)]">
            {summary.engineer}
          </p>
          <p className="mt-1 truncate text-[0.78rem] text-[var(--on-surface-dim)]">
            {summary.client}
          </p>
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[0.9rem] text-[var(--on-surface)]">
            {summary.totalHours}h
          </p>
          <p className="font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
            {summary.billablePercent}% billable
          </p>
        </div>
        <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
          <span
            className="bg-[var(--tertiary)]"
            style={{ width: `${approvedWidth}%` }}
          />
          <span
            className="bg-[var(--primary)]"
            style={{ width: `${pendingWidth}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between gap-2 text-[0.7rem] text-[var(--on-surface-dim)]">
          <span>{summary.approvedHours}h approved</span>
          <span>{summary.pendingHours}h pending</span>
        </div>
      </div>
    </article>
  );
}

function TimelineControlPanel({
  filter,
  onBulkApprove,
  onClear,
  pendingCount,
  query,
  selectedCount,
  selectedPendingCount,
  setFilter,
  setQuery,
}: {
  filter: EntryStatus | "all";
  onBulkApprove: () => void;
  onClear: () => void;
  pendingCount: number;
  query: string;
  selectedCount: number;
  selectedPendingCount: number;
  setFilter: (value: EntryStatus | "all") => void;
  setQuery: (value: string) => void;
}) {
  return (
    <aside className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_18%,var(--surface)),var(--surface))] p-5 shadow-[0_14px_38px_color-mix(in_srgb,var(--bg-deep)_5%,transparent)] 2xl:sticky 2xl:top-28 2xl:self-start">
      <p className="text-[1rem] font-medium text-[var(--on-surface)]">
        Timeline controls
      </p>
      <p className="mt-1 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
        Filter the week, search entries, and approve selected pending logs.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
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
            {tab.value === "pending" && pendingCount > 0 && (
              <span className="ml-1 font-mono text-[var(--primary)]">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>
      <label className="relative mt-4 block">
        <span className="sr-only">Search timeline entries</span>
        <IconSearch
          size={15}
          stroke={1.7}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search engineer, client, project..."
          className="h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] pl-9 pr-4 text-[0.88rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]"
        />
      </label>
      {selectedCount > 0 && (
        <div className="mt-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
          <p className="text-[0.88rem] font-medium text-[var(--on-surface)]">
            {selectedCount} selected
          </p>
          <p className="mt-1 text-[0.8rem] text-[var(--on-surface-dim)]">
            {selectedPendingCount} pending entries are eligible for bulk
            approval.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row xl:flex-col">
            <button
              type="button"
              onClick={onBulkApprove}
              disabled={selectedPendingCount === 0}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--tertiary)] px-4 text-[0.84rem] font-medium text-[var(--on-tertiary)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <IconCheck size={14} stroke={2} />
              Approve pending
            </button>
            <button
              type="button"
              onClick={onClear}
              className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-4 text-[0.84rem] font-medium text-[var(--on-surface)]"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

function TimelineEntryRow({
  entry,
  onApprove,
  onDispute,
  onInspect,
  onToggle,
  selected,
}: {
  entry: TimesheetEntry;
  onApprove: () => void;
  onDispute: () => void;
  onInspect: () => void;
  onToggle: () => void;
  selected: boolean;
}) {
  return (
    <article
      className={cn(
        "m-3 grid gap-3 rounded-2xl border border-transparent px-4 py-4 transition-colors duration-150 sm:grid-cols-[auto_minmax(0,1fr)] lg:m-0 lg:grid-cols-[auto_minmax(0,1.2fr)_minmax(10rem,0.8fr)_8rem_12rem] lg:items-center lg:rounded-none lg:border-0 lg:px-5",
        selected
          ? "border-[color-mix(in_srgb,var(--primary)_28%,var(--glass-border))] bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]"
          : entry.status === "disputed"
            ? "border-[color-mix(in_srgb,var(--error)_24%,transparent)] bg-[color-mix(in_srgb,var(--error)_4%,transparent)]"
            : "hover:bg-[color-mix(in_srgb,var(--on-surface)_3%,transparent)]",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
        aria-label={`Select ${entry.engineer} entry`}
      >
        {selected ? (
          <IconSquareCheck
            size={16}
            stroke={1.7}
            className="text-[var(--primary)]"
          />
        ) : (
          <IconSquare size={16} stroke={1.7} />
        )}
      </button>
      <div className="flex min-w-0 items-start gap-3">
        <Avatar initials={entry.initials} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-[0.9rem] font-medium text-[var(--on-surface)]">
              {entry.engineer}
            </p>
            <StatusBadge
              label={entry.billable ? "Billable" : "Non-billable"}
              tone={entry.billable ? "active" : "neutral"}
            />
          </div>
          <p className="mt-1 line-clamp-2 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">
            {entry.description}
          </p>
        </div>
      </div>
      <div className="min-w-0">
        <p className="truncate text-[0.86rem] font-medium text-[var(--on-surface)]">
          {entry.project}
        </p>
        <p className="mt-1 truncate text-[0.76rem] text-[var(--on-surface-dim)]">
          {entry.client}
        </p>
      </div>
      <div className="flex items-center gap-3 lg:block lg:text-right">
        <p className="font-mono text-[0.88rem] text-[var(--on-surface)]">
          {entry.hours}h
        </p>
        <p className="font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
          {entry.day} / {entry.date}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <StatusBadge
          label={titleCase(entry.status)}
          tone={statusTone(entry.status)}
        />
        {entry.status === "pending" && (
          <>
            <QueueAction
              label="Approve entry"
              tone="success"
              onClick={onApprove}
            >
              <IconCheck size={12} stroke={2} />
            </QueueAction>
            <QueueAction
              label="Dispute entry"
              tone="danger"
              onClick={onDispute}
            >
              <IconX size={12} stroke={2} />
            </QueueAction>
          </>
        )}
        <QueueAction label="Inspect entry" tone="neutral" onClick={onInspect}>
          <IconEdit size={12} stroke={1.8} />
        </QueueAction>
      </div>
    </article>
  );
}

function TimelineEntryModal({
  entry,
  onApprove,
  onClose,
  onDispute,
}: {
  entry: TimesheetEntry | null;
  onApprove: (entry: TimesheetEntry) => void;
  onClose: () => void;
  onDispute: (entry: TimesheetEntry) => void;
}) {
  useEffect(() => {
    if (!entry) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [entry, onClose]);

  if (!entry) return null;

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-6 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="timeline-entry-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-[1.65rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_18%,var(--surface)),var(--surface))] shadow-[0_30px_110px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--glass-border)] p-5 sm:p-6">
          <div className="min-w-0">
            <p className="label-caps text-[var(--primary)]">
              Timeline entry
            </p>
            <h2
              id="timeline-entry-title"
              className="title-serif mt-2 text-[clamp(1.45rem,2vw,1.9rem)] font-medium leading-tight text-[var(--on-surface)]"
            >
              {entry.engineer} / {entry.hours}h
            </h2>
            <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
              {entry.client} / {entry.project}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close timeline entry"
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
          >
            <IconX size={18} stroke={1.7} />
          </button>
        </div>
        <div className="max-h-[calc(100svh-9rem)] overflow-y-auto p-5 sm:p-6">
          <TimelineEntryDetail
            entry={entry}
            onApprove={() => onApprove(entry)}
            onDispute={() => onDispute(entry)}
          />
        </div>
      </div>
    </div>
  );
}

function TimelineEntryDetail({
  entry,
  onApprove,
  onDispute,
}: {
  entry: TimesheetEntry;
  onApprove: () => void;
  onDispute: () => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="grid min-w-0 gap-5">
        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <StatusBadge
                label={titleCase(entry.status)}
                tone={statusTone(entry.status)}
              />
              <h3 className="title-serif mt-3 text-[1.24rem] font-medium text-[var(--on-surface)]">
                {entry.project}
              </h3>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
                {entry.client} / submitted {entry.submittedAt}
              </p>
            </div>
            <Avatar initials={entry.initials} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            { label: "Date", value: `${entry.day}, ${entry.date}` },
            { label: "Hours", value: `${entry.hours}h` },
            { label: "Billable", value: entry.billable ? "Yes" : "No" },
            { label: "Submitted", value: entry.submittedAt },
            { label: "Approved by", value: entry.approvedBy ?? "-" },
            { label: "Status", value: titleCase(entry.status) },
          ].map((item) => (
            <InfoTile key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-5">
          <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
            Work note
          </p>
          <p className="mt-2 text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
            {entry.description}
          </p>
        </div>
      </div>

      <div className="grid content-start gap-4">
        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
          <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
            Approval posture
          </p>
          <p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
            {entry.status === "pending"
              ? "Pending entries can be approved for billing readiness or disputed for follow-up."
              : entry.status === "approved"
                ? "This entry is approved and ready for billing reconciliation."
                : "This entry is disputed and should stay out of billing until resolved."}
          </p>
        </div>
        {entry.status === "pending" && (
          <div className="grid gap-2">
            <button
              type="button"
              onClick={onApprove}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--tertiary)] px-4 text-[0.86rem] font-medium text-[var(--on-tertiary)]"
            >
              <IconCheck size={15} stroke={2} />
              Approve for billing
            </button>
            <button
              type="button"
              onClick={onDispute}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--error)_32%,var(--glass-border))] px-4 text-[0.86rem] font-medium text-[var(--error)]"
            >
              <IconX size={14} stroke={2} />
              Dispute entry
            </button>
          </div>
        )}
        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
          <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
            Billing signal
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
            <span
              className={cn(
                "block h-full rounded-full",
                entry.billable ? "bg-[var(--tertiary)]" : "bg-[var(--primary)]",
              )}
              style={{ width: entry.billable ? "100%" : "45%" }}
            />
          </div>
          <p className="mt-2 text-[0.82rem] text-[var(--on-surface-dim)]">
            {entry.billable
              ? "Billable hours count toward client invoice readiness."
              : "Non-billable entry retained for delivery audit context."}
          </p>
        </div>
      </div>
    </div>
  );
}

function AddEntryModal({
  onAdd,
  onClose,
  open,
}: {
  onAdd: (formData: FormData) => void;
  onClose: () => void;
  open: boolean;
}) {
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    firstInputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-8 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-entry-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onAdd(new FormData(event.currentTarget));
        }}
        className="w-full max-w-4xl rounded-[1.75rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_18%,var(--surface)),var(--surface))] p-5 shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_42%,transparent)] sm:p-6 lg:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-caps text-[var(--primary)]">
              Placement timeline
            </p>
            <h2
              id="add-entry-title"
              className="title-serif mt-2 text-[1.2rem] font-medium text-[var(--on-surface)]"
            >
              Add manual entry
            </h2>
            <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
              Log hours for a placement. Manual entries enter the approval
              queue.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add entry modal"
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
          >
            <IconX size={18} stroke={1.7} />
          </button>
        </div>
        <div className="mt-7 grid gap-4 border-t border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <FormField
            ref={firstInputRef}
            label="Engineer"
            name="engineer"
            placeholder="Amina Otieno"
          />
          <FormField
            label="Client"
            name="client"
            placeholder="Kijani Analytics"
          />
          <FormField
            label="Project"
            name="project"
            placeholder="AI Support Workflow"
          />
          <label>
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">
              Day
            </span>
            <select
              name="day"
              defaultValue="Wed"
              className="mt-2 h-11 w-full cursor-pointer rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
            >
              {days.map((day) => (
                <option key={day}>{day}</option>
              ))}
            </select>
          </label>
          <FormField label="Date" name="date" placeholder="Jun 5" />
          <FormField label="Hours logged" name="hours" placeholder="7.5" />
          <label className="flex cursor-pointer items-center gap-2.5 self-end rounded-full border border-[var(--glass-border)] px-4 py-3 lg:col-span-2">
            <input
              type="checkbox"
              name="billable"
              defaultChecked
              className="h-4 w-4 accent-[var(--primary)]"
            />
            <span className="text-[0.84rem] font-medium text-[var(--on-surface)]">
              Billable hours
            </span>
          </label>
          <label className="sm:col-span-2 lg:col-span-4">
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">
              Description
            </span>
            <textarea
              name="description"
              rows={4}
              placeholder="Describe what was worked on..."
              className="mt-2 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.88rem] leading-relaxed text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]"
            />
          </label>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-5 text-[0.86rem] font-medium text-[var(--bg)]"
          >
            Add entry
          </button>
        </div>
      </form>
    </div>
  );
}

const FormField = function FormField({
  label,
  name,
  placeholder,
  ref,
}: {
  label: string;
  name: string;
  placeholder: string;
  ref?: React.Ref<HTMLInputElement>;
}) {
  return (
    <label>
      <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">
        {label}
      </span>
      <input
        ref={ref}
        name={name}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]"
      />
    </label>
  );
};

function TimelineMetric({
  detail,
  icon: MetricIcon,
  label,
  tone,
  value,
}: {
  detail: string;
  icon: Icon;
  label: string;
  tone: "danger" | "neutral" | "primary" | "success";
  value: string;
}) {
  const color =
    tone === "success"
      ? "var(--tertiary)"
      : tone === "danger"
        ? "var(--error)"
        : tone === "primary"
          ? "var(--primary)"
          : "var(--on-surface-dim)";
  const railWidth =
    tone === "success"
      ? "86%"
      : tone === "danger"
        ? "72%"
        : tone === "primary"
          ? "64%"
          : "46%";

  return (
    <article className="flex min-h-[9.5rem] flex-col justify-between overflow-hidden rounded-[1.15rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_14%,var(--surface)),var(--surface))] p-4 shadow-[0_12px_34px_color-mix(in_srgb,var(--bg-deep)_5%,transparent)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.76rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">
          {label}
        </p>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)]">
          <MetricIcon size={16} stroke={1.7} style={{ color }} />
        </span>
      </div>
      <div className="mt-5">
        <p className="font-mono text-[1.55rem] leading-none text-[var(--on-surface)]">
          {value}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[0.82rem] text-[var(--on-surface-dim)]">
            {detail}
          </p>
          <span
            className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]"
            aria-hidden
          >
            <span
              className="block h-full rounded-full"
              style={{ background: color, width: railWidth }}
            />
          </span>
        </div>
      </div>
    </article>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5">
      <p className="text-[0.66rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">
        {label}
      </p>
      <p className="mt-1 truncate font-mono text-[0.82rem] text-[var(--on-surface)]">
        {value}
      </p>
    </div>
  );
}

function QueueAction({
  children,
  label,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  tone: "danger" | "neutral" | "success";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid h-8 w-8 cursor-pointer place-items-center rounded-full border transition-colors duration-200",
        tone === "success" &&
          "border-[color-mix(in_srgb,var(--tertiary)_35%,transparent)] text-[var(--tertiary)] hover:bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)]",
        tone === "danger" &&
          "border-[color-mix(in_srgb,var(--error)_30%,var(--glass-border))] text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]",
        tone === "neutral" &&
          "border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]",
      )}
    >
      {children}
    </button>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[color-mix(in_srgb,var(--primary)_18%,transparent)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] font-mono text-[0.66rem] text-[var(--primary)]">
      {initials}
    </span>
  );
}

function SectionHeading({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="label-caps text-[var(--primary)]">{eyebrow}</p>
      <h2 className="title-serif mt-2 text-[clamp(1.48rem,2vw,1.9rem)] font-medium text-[var(--on-surface)]">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
        {description}
      </p>
    </div>
  );
}

function getTimelineMetrics(entries: TimesheetEntry[]) {
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const pendingEntries = entries.filter(
    (entry) => entry.status === "pending",
  ).length;
  const pendingHours = entries
    .filter((entry) => entry.status === "pending")
    .reduce((sum, entry) => sum + entry.hours, 0);
  const approvedHours = entries
    .filter((entry) => entry.status === "approved")
    .reduce((sum, entry) => sum + entry.hours, 0);
  const billableHours = entries
    .filter((entry) => entry.billable)
    .reduce((sum, entry) => sum + entry.hours, 0);
  const billablePercent = Math.round(
    (billableHours / Math.max(totalHours, 1)) * 100,
  );
  const engineers = new Set(entries.map((entry) => entry.engineer)).size;

  return {
    approvedHours,
    billableHours,
    billablePercent,
    engineers,
    pendingEntries,
    pendingHours,
    totalHours,
  };
}

function getDailyTotals(entries: TimesheetEntry[]) {
  return days.map((day) =>
    Number(
      entries
        .filter((entry) => entry.day === day)
        .reduce((sum, entry) => sum + entry.hours, 0)
        .toFixed(1),
    ),
  );
}

function getEngineerSummaries(entries: TimesheetEntry[]): EngineerSummary[] {
  return Array.from(new Set(entries.map((entry) => entry.engineer))).map(
    (engineer) => {
      const engineerEntries = entries.filter(
        (entry) => entry.engineer === engineer,
      );
      const totalHours = engineerEntries.reduce(
        (sum, entry) => sum + entry.hours,
        0,
      );
      const pendingHours = engineerEntries
        .filter((entry) => entry.status === "pending")
        .reduce((sum, entry) => sum + entry.hours, 0);
      const approvedHours = engineerEntries
        .filter((entry) => entry.status === "approved")
        .reduce((sum, entry) => sum + entry.hours, 0);
      const billableHours = engineerEntries
        .filter((entry) => entry.billable)
        .reduce((sum, entry) => sum + entry.hours, 0);

      return {
        approvedHours,
        billablePercent: Math.round(
          (billableHours / Math.max(totalHours, 1)) * 100,
        ),
        client: engineerEntries[0]?.client ?? "-",
        engineer,
        initials: engineerEntries[0]?.initials ?? getInitials(engineer),
        pendingHours,
        totalHours,
      };
    },
  );
}

function statusTone(status: EntryStatus) {
  if (status === "approved") return "active";
  if (status === "disputed") return "overdue";
  return "neutral";
}

function getWeekLabel(offset: number) {
  if (offset === 0) return baseWeekLabel;
  if (offset < 0) return `Previous week ${Math.abs(offset)}`;
  return `Future week ${offset}`;
}

function getFormValue(formData: FormData, key: string, fallback: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || fallback;
}

function getInitials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
