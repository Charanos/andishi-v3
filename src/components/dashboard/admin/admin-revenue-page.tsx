"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  IconAdjustmentsHorizontal,
  IconAlertTriangle,
  IconArrowRight,
  IconBuilding,
  IconChartBar,
  IconCheck,
  IconClock,
  IconCurrencyDollar,
  IconEye,
  IconFileText,
  IconFilter,
  IconLock,
  IconMessageCircle,
  IconPlus,
  IconSearch,
  IconShieldCheck,
  IconTrash,
  IconUsers,
  IconX,
  type Icon,
} from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import {
  DashboardBarChart,
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

type FinanceStatus =
  | "draft"
  | "client_sent"
  | "client_paid"
  | "payout_ready"
  | "reconciled"
  | "overdue";
type RiskLevel = "low" | "watch" | "high";
type BillingModel = "fixed_project" | "monthly_retainer" | "weekly_hours";
type SortKey = "margin" | "cash" | "client" | "payout";

type FinanceRecord = {
  activity: string[];
  billingModel: BillingModel;
  client: string;
  clientAmount: number;
  clientContact: string;
  clientInvoiceId: string;
  clientVisible: string[];
  currency: "USD";
  developer: string;
  developerPayout: number;
  developerVisible: string[];
  dueDate: string;
  hoursApproved: number;
  id: string;
  internalNotes: string;
  issuedAt: string;
  marginPolicy: string;
  owner: string;
  paidAt?: string;
  payoutDue: string;
  project: string;
  risk: RiskLevel;
  status: FinanceStatus;
  taxReserve: number;
};

const statusOrder: FinanceStatus[] = [
  "draft",
  "client_sent",
  "client_paid",
  "payout_ready",
  "reconciled",
  "overdue",
];

const statusMeta: Record<
  FinanceStatus,
  {
    label: string;
    next: FinanceStatus | null;
    tone: "active" | "available" | "neutral" | "overdue" | "pending";
  }
> = {
  client_paid: { label: "Client paid", next: "payout_ready", tone: "active" },
  client_sent: { label: "Client sent", next: "client_paid", tone: "pending" },
  draft: { label: "Draft", next: "client_sent", tone: "neutral" },
  overdue: { label: "Overdue", next: "client_paid", tone: "overdue" },
  payout_ready: { label: "Payout ready", next: "reconciled", tone: "available" },
  reconciled: { label: "Reconciled", next: null, tone: "active" },
};

const riskMeta: Record<RiskLevel, { label: string; tone: "active" | "overdue" | "pending" }> = {
  high: { label: "High risk", tone: "overdue" },
  low: { label: "Low risk", tone: "active" },
  watch: { label: "Watch", tone: "pending" },
};

const billingModelLabel: Record<BillingModel, string> = {
  fixed_project: "Fixed project",
  monthly_retainer: "Monthly retainer",
  weekly_hours: "Weekly hours",
};

const financeSeed: FinanceRecord[] = [
  {
    activity: [
      "Client invoice AND-2026-0108 issued",
      "Amina payout reserve calculated",
      "Timesheet approval matched to invoice line items",
    ],
    billingModel: "monthly_retainer",
    client: "Kijani Analytics",
    clientAmount: 16800,
    clientContact: "Maya Kamau",
    clientInvoiceId: "AND-2026-0108",
    clientVisible: ["Project retainer", "Approved hours", "Invoice status", "Payment due date"],
    currency: "USD",
    developer: "Amina Otieno",
    developerPayout: 6400,
    developerVisible: ["Approved payout", "Hours approved", "Payout due date", "Finance status"],
    dueDate: "Jun 14, 2026",
    hoursApproved: 80,
    id: "fin-kijani-ai",
    internalNotes: "Premium AI margin. Keep client billing and developer comp fully separated in role dashboards.",
    issuedAt: "Jun 1, 2026",
    marginPolicy: "Andishi owns commercial spread after developer compensation and tax reserve.",
    owner: "Finance",
    payoutDue: "Jun 18, 2026",
    project: "AI Support Workflow",
    risk: "low",
    status: "client_sent",
    taxReserve: 840,
  },
  {
    activity: [
      "Client paid invoice AND-2026-0102",
      "Kwame payout waiting on milestone approval",
      "Finance review flagged margin below target",
    ],
    billingModel: "fixed_project",
    client: "SokoPay",
    clientAmount: 24000,
    clientContact: "June Njeri",
    clientInvoiceId: "AND-2026-0102",
    clientVisible: ["Milestone invoice", "Payment receipt", "Scope summary"],
    currency: "USD",
    developer: "Kwame Mensah",
    developerPayout: 12600,
    developerVisible: ["Milestone payout", "Approval state", "Payout due date"],
    dueDate: "Paid Jun 2",
    hoursApproved: 126,
    id: "fin-sokopay-recon",
    internalNotes: "Large fixed scope. Protect margin by not expanding unpaid reconciliation scope.",
    issuedAt: "May 24, 2026",
    marginPolicy: "Target gross margin 40%+ on fixed project after payout and reserve.",
    owner: "Dennis",
    paidAt: "Jun 2, 2026",
    payoutDue: "Jun 7, 2026",
    project: "Payments Reconciliation",
    risk: "watch",
    status: "client_paid",
    taxReserve: 1200,
  },
  {
    activity: [
      "Draft invoice opened from onboarding",
      "Security review not yet billable",
      "Zola payout not visible until placement is active",
    ],
    billingModel: "weekly_hours",
    client: "Nova Health",
    clientAmount: 7200,
    clientContact: "Dr. Nia Mensah",
    clientInvoiceId: "AND-DRAFT-NOVA",
    clientVisible: ["Projected weekly budget", "Security review status"],
    currency: "USD",
    developer: "Zola Ndlovu",
    developerPayout: 3600,
    developerVisible: ["Projected payout range", "Placement pending"],
    dueDate: "Draft",
    hoursApproved: 0,
    id: "fin-nova-onboarding",
    internalNotes: "Pre-revenue onboarding. Do not expose internal margin until active invoice exists.",
    issuedAt: "Draft",
    marginPolicy: "Projected spread only. No payout liability until approved billable hours exist.",
    owner: "Finance",
    payoutDue: "Pending active work",
    project: "AWS Reliability Intake",
    risk: "watch",
    status: "draft",
    taxReserve: 360,
  },
  {
    activity: [
      "Invoice overdue by 9 days",
      "Developer payout held pending client collection",
      "Recovery note sent to account owner",
    ],
    billingModel: "weekly_hours",
    client: "Cloudify Inc",
    clientAmount: 11200,
    clientContact: "Anton Githinji",
    clientInvoiceId: "AND-2026-0097",
    clientVisible: ["Overdue invoice", "Approved weekly hours", "Payment instructions"],
    currency: "USD",
    developer: "Fatima Al-Zahrawi",
    developerPayout: 5920,
    developerVisible: ["Payout pending collection", "Approved hours", "Finance review"],
    dueDate: "May 25, 2026",
    hoursApproved: 74,
    id: "fin-cloudify-infra",
    internalNotes: "Collection risk. Do not release payout until client payment clears unless leadership approves float.",
    issuedAt: "May 10, 2026",
    marginPolicy: "Payout release is collection-gated on overdue accounts.",
    owner: "Ops",
    payoutDue: "On collection",
    project: "Infrastructure Migration",
    risk: "high",
    status: "overdue",
    taxReserve: 560,
  },
  {
    activity: [
      "Client paid renewal invoice",
      "Tendo payout queued",
      "Finance reconciliation batch ready",
    ],
    billingModel: "monthly_retainer",
    client: "MedLink",
    clientAmount: 17800,
    clientContact: "Aisha Bello",
    clientInvoiceId: "AND-2026-0105",
    clientVisible: ["Renewal invoice", "Payment receipt", "Retainer period"],
    currency: "USD",
    developer: "Tendo Nakamura",
    developerPayout: 8900,
    developerVisible: ["Approved payout", "Payout date", "Retainer period"],
    dueDate: "Paid Jun 1",
    hoursApproved: 96,
    id: "fin-medlink-mobile",
    internalNotes: "Healthy account. Reconcile after payout batch clears.",
    issuedAt: "May 26, 2026",
    marginPolicy: "Standard retainer spread with cleared client payment before payout.",
    owner: "Finance",
    paidAt: "Jun 1, 2026",
    payoutDue: "Jun 5, 2026",
    project: "Patient App Revamp",
    risk: "low",
    status: "payout_ready",
    taxReserve: 890,
  },
  {
    activity: [
      "Invoice and payout reconciled",
      "Margin posted to May close",
      "Audit packet attached",
    ],
    billingModel: "fixed_project",
    client: "StartupHub",
    clientAmount: 21000,
    clientContact: "Adaeze Okafor",
    clientInvoiceId: "AND-2026-0088",
    clientVisible: ["Paid invoice", "Milestone receipt", "Project closeout"],
    currency: "USD",
    developer: "Ada Mensah",
    developerPayout: 9800,
    developerVisible: ["Paid payout", "Milestone closeout"],
    dueDate: "Paid May 18",
    hoursApproved: 110,
    id: "fin-startuphub-events",
    internalNotes: "Closed clean. Use as reference for future fixed-project reconciliation.",
    issuedAt: "May 4, 2026",
    marginPolicy: "Closed margin recognized after payout and reserve.",
    owner: "Finance",
    paidAt: "May 18, 2026",
    payoutDue: "Paid May 21",
    project: "Real-time Events Pipeline",
    risk: "low",
    status: "reconciled",
    taxReserve: 1050,
  },
];

export function AdminRevenuePage() {
  const [records, setRecords] = useState(financeSeed);
  const [selectedId, setSelectedId] = useState(financeSeed[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FinanceStatus | "all">("all");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("cash");
  const [drawerRecord, setDrawerRecord] = useState<FinanceRecord | null>(null);
  const [confirmRecord, setConfirmRecord] = useState<FinanceRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [messageRecord, setMessageRecord] = useState<FinanceRecord | null>(null);

  const selected = records.find((record) => record.id === selectedId) ?? records[0] ?? null;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records
      .filter((record) => {
        const haystack = [
          record.client,
          record.developer,
          record.project,
          record.clientInvoiceId,
          record.owner,
          record.internalNotes,
        ]
          .join(" ")
          .toLowerCase();
        return (
          (!needle || haystack.includes(needle)) &&
          (statusFilter === "all" || record.status === statusFilter) &&
          (riskFilter === "all" || record.risk === riskFilter)
        );
      })
      .sort((a, b) => {
        if (sortKey === "client") return b.clientAmount - a.clientAmount;
        if (sortKey === "payout") return b.developerPayout - a.developerPayout;
        if (sortKey === "margin") return getMarginAmount(b) - getMarginAmount(a);
        return getCashPriority(b) - getCashPriority(a);
      });
  }, [query, records, riskFilter, sortKey, statusFilter]);

  const stats = useMemo(() => buildFinanceStats(records), [records]);

  const columns = useMemo<Array<OperationalTableColumn<FinanceRecord>>>(
    () => [
      {
        key: "clientInvoiceId",
        label: "Commercial record",
        priority: true,
        render: (record) => (
          <div className="min-w-0">
            <p className="truncate text-[0.88rem] font-medium text-[var(--on-surface)]">
              {record.clientInvoiceId}
            </p>
            <p className="mt-1 truncate text-[0.74rem] text-[var(--on-surface-dim)]">
              {record.client} / {record.project}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (record) => (
          <StatusBadge label={statusMeta[record.status].label} tone={statusMeta[record.status].tone} />
        ),
      },
      { key: "clientAmount", label: "Client bill", mono: true, render: (record) => formatMoney(record.clientAmount) },
      { key: "developerPayout", label: "Dev payout", mono: true, render: (record) => formatMoney(record.developerPayout) },
      { key: "margin", label: "Margin", mono: true, render: (record) => `${getMarginRate(record)}%` },
      {
        key: "risk",
        label: "Risk",
        hideOnMobile: true,
        render: (record) => <StatusBadge label={riskMeta[record.risk].label} tone={riskMeta[record.risk].tone} />,
      },
      { key: "owner", label: "Owner", hideOnMobile: true },
    ],
    [],
  );

  const advanceRecord = (record: FinanceRecord) => {
    const next = statusMeta[record.status].next;
    if (!next) return;
    const updated: FinanceRecord = {
      ...record,
      activity: [`Moved to ${statusMeta[next].label}`, ...record.activity],
      paidAt: next === "client_paid" ? "Today" : record.paidAt,
      risk: next === "client_paid" || next === "reconciled" ? "low" : record.risk,
      status: next,
    };
    setRecords((current) => current.map((item) => (item.id === record.id ? updated : item)));
    setSelectedId(updated.id);
    setDrawerRecord((current) => (current?.id === record.id ? updated : current));
  };

  const markOverdue = (record: FinanceRecord) => {
    const updated: FinanceRecord = {
      ...record,
      activity: ["Collection risk escalated", ...record.activity],
      risk: "high",
      status: "overdue",
    };
    setRecords((current) => current.map((item) => (item.id === record.id ? updated : item)));
    setSelectedId(updated.id);
    setDrawerRecord((current) => (current?.id === record.id ? updated : current));
  };

  const createRecord = (payload: {
    client: string;
    clientAmount: number;
    developer: string;
    developerPayout: number;
    project: string;
  }) => {
    const created: FinanceRecord = {
      activity: ["Commercial record drafted", "Visibility policy attached", "Awaiting invoice issue"],
      billingModel: "fixed_project",
      client: payload.client,
      clientAmount: payload.clientAmount,
      clientContact: "Client billing contact",
      clientInvoiceId: `AND-DRAFT-${Date.now().toString().slice(-4)}`,
      clientVisible: ["Project invoice", "Scope summary", "Due date"],
      currency: "USD",
      developer: payload.developer,
      developerPayout: payload.developerPayout,
      developerVisible: ["Approved payout", "Payout status"],
      dueDate: "Draft",
      hoursApproved: 0,
      id: `finance-${Date.now()}`,
      internalNotes: "Drafted from the CFO command workspace. Client billing and developer payout are intentionally separated.",
      issuedAt: "Draft",
      marginPolicy: "Admin-only spread. Client sees invoice value; developer sees approved compensation.",
      owner: "Finance",
      payoutDue: "Pending client payment",
      project: payload.project,
      risk: "watch",
      status: "draft",
      taxReserve: Math.round(payload.clientAmount * 0.05),
    };
    setRecords((current) => [created, ...current]);
    setSelectedId(created.id);
    setDrawerRecord(created);
    setCreateOpen(false);
  };

  const sendFinanceNote = (record: FinanceRecord, message: string) => {
    setRecords((current) =>
      current.map((item) =>
        item.id === record.id
          ? { ...item, activity: [`Finance note sent: ${message}`, ...item.activity] }
          : item,
      ),
    );
    setMessageRecord(null);
  };

  const updateNotes = (recordId: string, notes: string) => {
    setRecords((current) =>
      current.map((record) =>
        record.id === recordId
          ? { ...record, activity: ["Internal finance note updated", ...record.activity], internalNotes: notes }
          : record,
      ),
    );
    setDrawerRecord((current) =>
      current?.id === recordId ? { ...current, internalNotes: notes } : current,
    );
  };

  const archiveRecord = () => {
    if (!confirmRecord) return;
    const next = records.filter((record) => record.id !== confirmRecord.id);
    setRecords(next);
    if (selectedId === confirmRecord.id) setSelectedId(next[0]?.id ?? "");
    setConfirmRecord(null);
  };

  return (
    <div className="grid min-w-0 gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <DashboardPageHeader
        className="mb-0"
        title="Revenue boardroom"
        description="Model Andishi's commercial engine across client billings, developer payout liability, retained spread, reserves, collection risk, and role-safe margin visibility."
        status={<StatusBadge label={`${stats.marginRate}% gross margin`} tone="available" />}
        actions={
          <>
            <button
              type="button"
              onClick={() => setStatusFilter("overdue")}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--error)_28%,var(--glass-border))] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
            >
              <IconAlertTriangle size={16} stroke={1.7} />
              Collections
              <span className="font-mono text-[0.76rem] text-[var(--error)]">{stats.overdue}</span>
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)] shadow-[0_14px_30px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <IconPlus size={16} stroke={1.8} />
              Draft commercial record
            </button>
          </>
        }
      />

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          chart="bar"
          data={[48, 56, 62, 74, Math.round(stats.clientBillings / 1000)]}
          icon={IconCurrencyDollar}
          label="Client billings"
          trend={`${stats.sent} awaiting payment`}
          value={formatMoney(stats.clientBillings)}
        />
        <KpiCard
          data={[18, 24, 31, 36, Math.round(stats.payoutLiability / 1000)]}
          icon={IconUsers}
          label="Payout liability"
          trend={`${stats.payoutReady} payout ready`}
          value={formatMoney(stats.payoutLiability)}
        />
        <KpiCard
          chart="bar"
          data={[12, 16, 21, 28, Math.round(stats.margin / 1000)]}
          icon={IconChartBar}
          label="Andishi spread"
          trend={`${stats.marginRate}% gross margin`}
          value={formatMoney(stats.margin)}
        />
        <KpiCard
          data={[9, 8, 6, 4, stats.overdue]}
          icon={IconAlertTriangle}
          label="Collection risk"
          trend={`${formatMoney(stats.overdueAmount)} overdue`}
          value={String(stats.overdue)}
        />
      </section>

      <SectionDivider />

      <RevenueStrategyRoom records={records} selected={selected} stats={stats} />

      <SectionDivider />

      <section className="grid min-w-0 gap-7 2xl:grid-cols-[minmax(0,1fr)_minmax(23rem,27rem)]">
        <FinanceObservability records={records} />
        <FinanceCommandPanel
          record={selected}
          onAdvance={selected ? () => advanceRecord(selected) : undefined}
          onArchive={selected ? () => setConfirmRecord(selected) : undefined}
          onInspect={selected ? () => setDrawerRecord(selected) : undefined}
          onMessage={selected ? () => setMessageRecord(selected) : undefined}
          onOverdue={selected ? () => markOverdue(selected) : undefined}
        />
      </section>

      <SectionDivider />

      <section className="grid min-w-0 gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <SectionHeader
            eyebrow="Finance ledger"
            title="Commercial execution queue"
            description="Filter by cash state and risk, inspect the role-safe economics, then execute invoices, collections, payouts, and reconciliation."
          />
          <FinanceToolbar
            query={query}
            riskFilter={riskFilter}
            setQuery={setQuery}
            setRiskFilter={setRiskFilter}
            setSortKey={setSortKey}
            setStatusFilter={setStatusFilter}
            sortKey={sortKey}
            statusFilter={statusFilter}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((record) => (
            <FinanceCard
              key={record.id}
              record={record}
              selected={selected?.id === record.id}
              onAdvance={() => advanceRecord(record)}
              onArchive={() => setConfirmRecord(record)}
              onInspect={() => setDrawerRecord(record)}
              onMessage={() => setMessageRecord(record)}
              onOverdue={() => markOverdue(record)}
              onSelect={() => setSelectedId(record.id)}
            />
          ))}
          {!filtered.length && (
            <EmptyState
              title="No finance records match"
              body="Clear the search, switch filters, or draft a new commercial record."
            />
          )}
        </div>
      </section>

      <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <ChartPanel
          title="Cash conversion"
          description="Client billings collected against developer payout exposure and Andishi retained margin."
          value={`${stats.paidRate}% collected`}
        >
          <DashboardLineChart
            data={[42, 46, 54, 61, 68, 74, stats.paidRate]}
            height={300}
            labels={["Apr 22", "Apr 29", "May 6", "May 13", "May 20", "May 27", "Now"]}
            variant="area"
          />
        </ChartPanel>
        <ChartPanel
          title="Finance status mix"
          description="Distribution of commercial records by billing and payout state."
          value={`${records.length} records`}
        >
          <DashboardDonutChart
            data={statusOrder.map((status) => ({
              label: statusMeta[status].label,
              tone:
                status === "reconciled" || status === "payout_ready"
                  ? ("success" as const)
                  : status === "overdue"
                    ? ("primary" as const)
                    : status === "client_paid"
                      ? ("secondary" as const)
                      : ("muted" as const),
              value: records.filter((record) => record.status === status).length,
            }))}
            height={210}
          />
        </ChartPanel>
      </section>

      <OperationalDataTable
        columns={columns}
        description="Admin-only ledger view comparing client billing, developer payout liability, retained margin, risk, and finance ownership."
        empty="No finance records match the current filters."
        onRowSelect={(record) => {
          setSelectedId(record.id);
          setDrawerRecord(record);
        }}
        rows={filtered}
        title="Commercial abstraction matrix"
      />

      <CreateFinanceModal
        onClose={() => setCreateOpen(false)}
        onSubmit={createRecord}
        open={createOpen}
      />

      {messageRecord && (
        <FinanceMessageModal
          key={messageRecord.id}
          onClose={() => setMessageRecord(null)}
          onSend={sendFinanceNote}
          record={messageRecord}
        />
      )}

      <EntityDrawer
        onClose={() => setDrawerRecord(null)}
        open={Boolean(drawerRecord)}
        title={drawerRecord?.clientInvoiceId ?? "Finance details"}
      >
        {drawerRecord && (
          <FinanceDrawerContent
            key={drawerRecord.id}
            onAdvance={() => advanceRecord(drawerRecord)}
            onArchive={() => setConfirmRecord(drawerRecord)}
            onMessage={() => setMessageRecord(drawerRecord)}
            onOverdue={() => markOverdue(drawerRecord)}
            onUpdateNotes={updateNotes}
            record={drawerRecord}
          />
        )}
      </EntityDrawer>

      <ConfirmDialog
        confirmLabel="Archive record"
        description={`This removes ${confirmRecord?.clientInvoiceId ?? "this finance record"} from the active command queue while preserving the future audit trail pattern.`}
        onCancel={() => setConfirmRecord(null)}
        onConfirm={archiveRecord}
        open={Boolean(confirmRecord)}
        title="Archive this finance record?"
      />
    </div>
  );
}

function RevenueStrategyRoom({
  records,
  selected,
  stats,
}: {
  records: FinanceRecord[];
  selected: FinanceRecord | null;
  stats: ReturnType<typeof buildFinanceStats>;
}) {
  if (!selected) {
    return <EmptyState title="No revenue record selected" body="Select a commercial record to open the revenue boardroom." />;
  }

  const forecast = [
    Math.round(stats.clientBillings * 0.72 / 1000),
    Math.round(stats.clientBillings * 0.84 / 1000),
    Math.round(stats.clientBillings * 0.95 / 1000),
    Math.round(stats.clientBillings * 1.08 / 1000),
    Math.round((stats.clientBillings + stats.margin) * 1.08 / 1000),
  ];
  const modelMix = (Object.keys(billingModelLabel) as BillingModel[]).map((model) =>
    records.filter((record) => record.billingModel === model).reduce((sum, record) => sum + record.clientAmount, 0),
  );
  const selectedMargin = getMarginAmount(selected);
  const selectedRate = getMarginRate(selected);
  const recognitionPolicy =
    selected.status === "reconciled"
      ? "Recognized: payout, reserve, and close packet have cleared."
      : selected.status === "overdue"
        ? "At risk: keep revenue forecast conservative until collection clears."
        : selected.status === "draft"
          ? "Projected only: do not recognize until scope and invoice are issued."
          : "Forecasted: recognize only after client payment and payout controls clear.";

  return (
    <section className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_23rem]">
      <article className="min-w-0 overflow-hidden rounded-[1.6rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_22%,var(--surface)),var(--surface))] shadow-[0_22px_70px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="min-w-0">
            <p className="label-caps text-[var(--primary)]">CFO strategy room</p>
            <h2 className="title-serif mt-3 text-[1.45rem] font-medium leading-tight text-[var(--on-surface)]">
              {selected.client} commercial thesis
            </h2>
            <p className="mt-3 max-w-3xl text-[0.96rem] leading-relaxed text-[var(--on-surface-dim)]">
              {selected.marginPolicy} {recognitionPolicy}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoTile label="Client bill" value={formatMoney(selected.clientAmount)} />
              <InfoTile label="Payout" value={formatMoney(selected.developerPayout)} />
              <InfoTile label="Spread" value={formatMoney(selectedMargin)} />
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
            <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Margin posture</p>
            <div className="mt-4 flex items-center gap-4">
              <MarginRing size={82} value={selectedRate} />
              <div className="min-w-0">
                <p className="font-mono text-[1.35rem] text-[var(--on-surface)]">{selectedRate}%</p>
                <p className="mt-1 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">
                  Admin-only margin after payout and reserve.
                </p>
              </div>
            </div>
            <p className="mt-4 text-[0.78rem] leading-relaxed text-[var(--primary)]">
              Client sees project value. Developer sees approved payout. Andishi spread remains internal.
            </p>
          </div>
        </div>
        <div className="grid border-t border-[var(--glass-border)] md:grid-cols-3">
          <StrategyTile label="Recognition" value={recognitionPolicy} />
          <StrategyTile label="Cash policy" value={selected.status === "overdue" ? "Collection-gated; do not release payout without override." : "Release payout only after payment and finance evidence clear."} />
          <StrategyTile label="Visibility" value="Admin owns full economics; client and developer surfaces receive scoped commercial context." />
        </div>
      </article>

      <article className="grid min-w-0 gap-4 rounded-[1.6rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_7%,transparent)] sm:p-6">
        <div>
          <p className="label-caps text-[var(--primary)]">Forecast posture</p>
          <p className="mt-3 text-[2rem] font-medium leading-none text-[var(--on-surface)]">
            {formatMoney(Math.round((stats.clientBillings + stats.margin) * 1.08))}
          </p>
          <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
            Next-cycle forecast if current billings, retained spread, and low-risk expansion clear.
          </p>
        </div>
        <DashboardLineChart data={forecast} height={210} labels={["Base", "Collect", "Release", "Expand", "Next"]} variant="area" />
        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
          <p className="text-[0.78rem] text-[var(--on-surface-dim)]">Revenue by engagement model</p>
          <DashboardBarChart data={modelMix.map((value) => Math.round(value / 1000))} height={180} labels={(Object.keys(billingModelLabel) as BillingModel[]).map((model) => billingModelLabel[model])} />
        </div>
      </article>
    </section>
  );
}

function FinanceObservability({ records }: { records: FinanceRecord[] }) {
  const totals = buildFinanceStats(records);
  const marginBands = [
    records.filter((record) => getMarginRate(record) < 30).length,
    records.filter((record) => getMarginRate(record) >= 30 && getMarginRate(record) < 45).length,
    records.filter((record) => getMarginRate(record) >= 45).length,
  ];

  return (
    <div className="min-w-0">
      <SectionHeader
        eyebrow="CFO observability"
        title="Revenue waterfall and margin control"
        description="The page keeps client billing, developer payout, retained margin, and collection risk visible together while enforcing role-safe commercial abstraction."
      />
      <div className="mt-6 grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-h-[27rem] rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] sm:p-5">
          <DashboardBarChart
            data={[
              Math.round(totals.clientBillings / 1000),
              Math.round(totals.payoutLiability / 1000),
              Math.round(totals.taxReserve / 1000),
              Math.round(totals.margin / 1000),
            ]}
            height={330}
            labels={["Client", "Payout", "Reserve", "Spread"]}
          />
        </div>
        <div className="grid min-w-0 gap-3 md:grid-cols-3 2xl:grid-cols-1">
          <FinanceBandCard
            detail="Client sees only billable project value."
            icon={IconBuilding}
            label="Client billings"
            value={formatMoney(totals.clientBillings)}
          />
          <FinanceBandCard
            detail="Developer sees only approved compensation."
            icon={IconUsers}
            label="Developer liability"
            value={formatMoney(totals.payoutLiability)}
          />
          <FinanceBandCard
            detail="Admin-only spread after payout and reserve."
            icon={IconLock}
            label="Retained spread"
            value={formatMoney(totals.margin)}
          />
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          { label: "Low margin", value: marginBands[0], tone: "var(--error)" },
          { label: "Target margin", value: marginBands[1], tone: "var(--primary)" },
          { label: "Premium margin", value: marginBands[2], tone: "var(--tertiary)" },
        ].map((band) => (
          <div
            key={band.label}
            className="rounded-[1.1rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.86rem] text-[var(--on-surface-dim)]">{band.label}</p>
              <span className="font-mono text-[1.25rem] text-[var(--on-surface)]">{band.value}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
              <span
                className="block h-full rounded-full"
                style={{ background: band.tone, width: `${Math.max(band.value * 30, 8)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinanceToolbar({
  query,
  riskFilter,
  setQuery,
  setRiskFilter,
  setSortKey,
  setStatusFilter,
  sortKey,
  statusFilter,
}: {
  query: string;
  riskFilter: RiskLevel | "all";
  setQuery: (value: string) => void;
  setRiskFilter: (value: RiskLevel | "all") => void;
  setSortKey: (value: SortKey) => void;
  setStatusFilter: (value: FinanceStatus | "all") => void;
  sortKey: SortKey;
  statusFilter: FinanceStatus | "all";
}) {
  return (
    <div className="grid w-full gap-3 xl:w-auto xl:min-w-[44rem]">
      <label className="relative min-w-0">
        <span className="sr-only">Search finance records</span>
        <IconSearch
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]"
          size={16}
          stroke={1.7}
        />
        <input
          className="h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-10 pr-4 text-[0.9rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search clients, invoices, developers, projects..."
          value={query}
        />
      </label>
      <div className="grid gap-2 sm:grid-cols-3">
        <SelectPill
          icon={IconFilter}
          label="Status"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as FinanceStatus | "all")}
        >
          <option value="all">All states</option>
          {statusOrder.map((status) => (
            <option key={status} value={status}>
              {statusMeta[status].label}
            </option>
          ))}
        </SelectPill>
        <SelectPill
          icon={IconAlertTriangle}
          label="Risk"
          value={riskFilter}
          onChange={(value) => setRiskFilter(value as RiskLevel | "all")}
        >
          <option value="all">All risk</option>
          {Object.entries(riskMeta).map(([risk, meta]) => (
            <option key={risk} value={risk}>
              {meta.label}
            </option>
          ))}
        </SelectPill>
        <SelectPill
          icon={IconAdjustmentsHorizontal}
          label="Sort"
          value={sortKey}
          onChange={(value) => setSortKey(value as SortKey)}
        >
          <option value="cash">Cash priority</option>
          <option value="margin">Margin</option>
          <option value="client">Client bill</option>
          <option value="payout">Payout</option>
        </SelectPill>
      </div>
    </div>
  );
}

function FinanceCard({
  onAdvance,
  onArchive,
  onInspect,
  onMessage,
  onOverdue,
  onSelect,
  record,
  selected,
}: {
  onAdvance: () => void;
  onArchive: () => void;
  onInspect: () => void;
  onMessage: () => void;
  onOverdue: () => void;
  onSelect: () => void;
  record: FinanceRecord;
  selected: boolean;
}) {
  const margin = getMarginAmount(record);

  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-[1.35rem] border transition-all duration-200",
        selected
          ? "border-[color-mix(in_srgb,var(--primary)_38%,var(--glass-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_7%,var(--surface)),var(--surface))] shadow-[0_18px_50px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]"
          : record.status === "overdue"
            ? "border-[color-mix(in_srgb,var(--error)_34%,var(--glass-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--error)_6%,var(--surface)),var(--surface))]"
            : "border-[var(--glass-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-high)_24%,var(--surface)),var(--surface))] hover:border-[color-mix(in_srgb,var(--primary)_22%,var(--glass-border))]",
      )}
    >
      <button className="block w-full min-w-0 cursor-pointer p-5 text-left sm:p-6" onClick={onSelect} type="button">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words text-[1rem] font-medium leading-snug text-[var(--on-surface)]">
                {record.clientInvoiceId}
              </h3>
              <StatusBadge label={statusMeta[record.status].label} tone={statusMeta[record.status].tone} />
              <StatusBadge label={riskMeta[record.risk].label} tone={riskMeta[record.risk].tone} />
            </div>
            <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
              {record.client} / {record.project}
            </p>
          </div>
          <MarginRing value={getMarginRate(record)} />
        </div>

        <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]">
          <SignalCell label="Client" value={formatMoney(record.clientAmount)} />
          <SignalCell label="Payout" value={formatMoney(record.developerPayout)} />
          <SignalCell label="Spread" value={formatMoney(margin)} />
        </div>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[0.82rem] text-[var(--on-surface-dim)]">
          <span className="inline-flex items-center gap-1.5">
            <IconUsers size={14} stroke={1.7} />
            {record.developer}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconClock size={14} stroke={1.7} />
            {record.dueDate}
          </span>
          <span className="font-mono text-[var(--on-surface)]">{record.hoursApproved}h approved</span>
        </div>
      </button>

      <div className="grid gap-4 border-t border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_44%,transparent)] p-5 sm:p-6">
        <VisibilityStrip record={record} compact />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="rounded-full border border-[var(--glass-border)] px-3 py-1.5 font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
            {billingModelLabel[record.billingModel]}
          </span>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <IconButton label={`Inspect ${record.clientInvoiceId}`} onClick={onInspect}>
              <IconArrowRight size={16} stroke={1.8} />
            </IconButton>
            <IconButton label={`Send finance note for ${record.clientInvoiceId}`} onClick={onMessage}>
              <IconMessageCircle size={16} stroke={1.8} />
            </IconButton>
            <IconButton label={`Advance ${record.clientInvoiceId}`} onClick={onAdvance}>
              <IconCheck size={16} stroke={1.8} />
            </IconButton>
            <IconButton danger label={`Escalate ${record.clientInvoiceId}`} onClick={onOverdue}>
              <IconAlertTriangle size={16} stroke={1.8} />
            </IconButton>
            <IconButton danger label={`Archive ${record.clientInvoiceId}`} onClick={onArchive}>
              <IconTrash size={16} stroke={1.8} />
            </IconButton>
          </div>
        </div>
      </div>
    </article>
  );
}

function FinanceCommandPanel({
  onAdvance,
  onArchive,
  onInspect,
  onMessage,
  onOverdue,
  record,
}: {
  onAdvance?: () => void;
  onArchive?: () => void;
  onInspect?: () => void;
  onMessage?: () => void;
  onOverdue?: () => void;
  record: FinanceRecord | null;
}) {
  if (!record) {
    return (
      <aside className="rounded-[1.35rem] border border-dashed border-[var(--glass-border)] p-8 text-center">
        <p className="text-[0.98rem] font-medium text-[var(--on-surface)]">Select a finance record</p>
        <p className="mt-2 text-[0.86rem] text-[var(--on-surface-dim)]">
          Pick a commercial record to inspect cash state, payout liability, margin, and visibility boundaries.
        </p>
      </aside>
    );
  }

  const next = statusMeta[record.status].next;

  return (
    <aside className="2xl:sticky 2xl:top-28 2xl:self-start">
      <div className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_20%,var(--surface)),var(--surface))] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <StatusBadge label={statusMeta[record.status].label} tone={statusMeta[record.status].tone} />
            <h2 className="title-serif mt-3 text-[1.15rem] font-medium leading-tight text-[var(--on-surface)]">
              {record.clientInvoiceId}
            </h2>
            <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
              {record.client} / {record.project}
            </p>
          </div>
          <MarginRing value={getMarginRate(record)} size={68} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <InfoTile label="Client bill" value={formatMoney(record.clientAmount)} />
          <InfoTile label="Dev payout" value={formatMoney(record.developerPayout)} />
          <InfoTile label="Tax reserve" value={formatMoney(record.taxReserve)} />
          <InfoTile label="Spread" value={formatMoney(getMarginAmount(record))} />
        </div>

        <div className="mt-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
          <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Abstraction policy</p>
          <p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
            {record.marginPolicy}
          </p>
        </div>

        <div className="mt-5">
          <VisibilityStrip record={record} />
        </div>

        <div className="mt-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
          <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Next finance move</p>
          <p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
            {next
              ? `Move to ${statusMeta[next].label.toLowerCase()} when evidence is complete.`
              : "Record is closed for this cycle. Keep audit evidence attached."}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <ActionButton icon={IconMessageCircle} label="Note" onClick={onMessage} />
          <ActionButton icon={IconFileText} label="Inspect" onClick={onInspect} />
          <ActionButton icon={IconCheck} label={next ? "Advance" : "Closed"} onClick={onAdvance} />
          <ActionButton danger icon={IconAlertTriangle} label="Overdue" onClick={onOverdue} />
          <ActionButton danger icon={IconTrash} label="Archive" onClick={onArchive} />
        </div>
      </div>
    </aside>
  );
}

function FinanceDrawerContent({
  onAdvance,
  onArchive,
  onMessage,
  onOverdue,
  onUpdateNotes,
  record,
}: {
  onAdvance: () => void;
  onArchive: () => void;
  onMessage: () => void;
  onOverdue: () => void;
  onUpdateNotes: (recordId: string, notes: string) => void;
  record: FinanceRecord;
}) {
  const [draft, setDraft] = useState(record.internalNotes);

  return (
    <div className="grid gap-6">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <StatusBadge label={statusMeta[record.status].label} tone={statusMeta[record.status].tone} />
          <h3 className="mt-3 text-[1.35rem] font-medium leading-tight text-[var(--on-surface)]">
            {record.clientInvoiceId}
          </h3>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">
            {record.client} is billed for {record.project}. {record.developer} sees only approved payout context.
          </p>
        </div>
        <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4">
          <MarginRing value={getMarginRate(record)} size={92} />
          <p className="mt-4 text-center text-[0.82rem] text-[var(--on-surface-dim)]">
            Admin-only gross margin
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoTile label="Client amount" value={formatMoney(record.clientAmount)} />
        <InfoTile label="Developer payout" value={formatMoney(record.developerPayout)} />
        <InfoTile label="Tax reserve" value={formatMoney(record.taxReserve)} />
        <InfoTile label="Andishi spread" value={formatMoney(getMarginAmount(record))} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <VisibilityCard
          body={[
            "Full commercial record",
            "Client billing amount",
            "Developer payout",
            "Margin and reserve",
            "Internal notes",
          ]}
          icon={IconLock}
          role="Admin"
          tone="primary"
        />
        <VisibilityCard
          body={record.clientVisible}
          icon={IconBuilding}
          role="Client"
          tone="success"
        />
        <VisibilityCard
          body={record.developerVisible}
          icon={IconUsers}
          role="Developer"
          tone="muted"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4">
          <label>
            <span className="text-[0.92rem] font-medium text-[var(--on-surface)]">Internal finance notes</span>
            <textarea
              className="mt-3 min-h-36 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.9rem] leading-relaxed text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
              onChange={(event) => setDraft(event.target.value)}
              value={draft}
            />
          </label>
          <button
            className="mt-3 min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)]"
            onClick={() => onUpdateNotes(record.id, draft)}
            type="button"
          >
            Save notes
          </button>
        </div>
        <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4">
          <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Finance activity</p>
          <div className="mt-4 grid gap-3">
            {record.activity.map((item, index) => (
              <div className="grid grid-cols-[1rem_minmax(0,1fr)] gap-3" key={`${item}-${index}`}>
                <span className={cn("mt-1 h-2 w-2 rounded-full", index === 0 ? "bg-[var(--tertiary)]" : "bg-[var(--on-surface-dim)]")} />
                <p className="text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-2 border-t border-[var(--glass-border)] pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onArchive}
          className="min-h-10 cursor-pointer rounded-full border border-[color-mix(in_srgb,var(--error)_34%,var(--glass-border))] px-5 text-[0.86rem] font-medium text-[var(--error)]"
        >
          Archive
        </button>
        <button
          type="button"
          onClick={onOverdue}
          className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)]"
        >
          Escalate collection
        </button>
        <button
          type="button"
          onClick={onMessage}
          className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)]"
        >
          Send note
        </button>
        <button
          type="button"
          onClick={onAdvance}
          className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-5 text-[0.86rem] font-medium text-[var(--bg)]"
        >
          Advance finance state
        </button>
      </div>
    </div>
  );
}

function VisibilityStrip({
  compact = false,
  record,
}: {
  compact?: boolean;
  record: FinanceRecord;
}) {
  return (
    <div className={cn("grid gap-2", compact ? "sm:grid-cols-3" : "grid-cols-1")}>
      {[
        { icon: IconLock, label: "Admin", value: "Full economics" },
        { icon: IconEye, label: "Client", value: "Invoice only" },
        { icon: IconShieldCheck, label: "Developer", value: "Payout only" },
      ].map((item) => {
        const Icon = item.icon;
        return (
          <div
            className="flex min-w-0 items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_72%,transparent)] px-3 py-2"
            key={item.label}
          >
            <Icon className="shrink-0 text-[var(--primary)]" size={15} stroke={1.7} />
            <span className="min-w-0">
              <span className="block truncate text-[0.68rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">
                {item.label}
              </span>
              <span className="block truncate text-[0.78rem] text-[var(--on-surface)]">
                {item.value}
              </span>
            </span>
          </div>
        );
      })}
      {!compact && (
        <p className="text-[0.78rem] leading-relaxed text-[var(--on-surface-dim)]">
          {record.client} never sees {record.developer}&apos;s compensation or Andishi spread. {record.developer} never sees client billing or margin.
        </p>
      )}
    </div>
  );
}

function CreateFinanceModal({
  onClose,
  onSubmit,
  open,
}: {
  onClose: () => void;
  onSubmit: (payload: {
    client: string;
    clientAmount: number;
    developer: string;
    developerPayout: number;
    project: string;
  }) => void;
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

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      client: String(form.get("client") || "Client account"),
      clientAmount: Number(form.get("clientAmount") || 2000),
      developer: String(form.get("developer") || "Developer"),
      developerPayout: Number(form.get("developerPayout") || 80),
      project: String(form.get("project") || "Project engagement"),
    });
  };

  return (
    <div
      aria-labelledby="create-finance-title"
      aria-modal="true"
      className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-8 backdrop-blur-xl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      <form
        className="w-full max-w-4xl rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-6"
        onSubmit={submit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-caps text-[var(--primary)]">Commercial abstraction</p>
            <h2 id="create-finance-title" className="title-serif mt-2 text-[1.25rem] font-medium text-[var(--on-surface)]">
              Draft commercial record
            </h2>
            <p className="mt-2 max-w-2xl text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
              Define client billing and developer compensation as separate role-scoped values before the record flows into client payments and developer earnings.
            </p>
          </div>
          <button
            aria-label="Close commercial record modal"
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
            onClick={onClose}
            type="button"
          >
            <IconX size={18} stroke={1.7} />
          </button>
        </div>
        <div className="mt-6 grid gap-4 border-t border-[var(--glass-border)] pt-6 sm:grid-cols-2 lg:grid-cols-5">
          <FormInput ref={firstInputRef} label="Client" name="client" placeholder="Kijani Analytics" />
          <FormInput label="Project" name="project" placeholder="AI Support Workflow" />
          <FormInput label="Developer" name="developer" placeholder="Amina Otieno" />
          <FormInput label="Client bill" name="clientAmount" placeholder="2000" type="number" />
          <FormInput label="Developer payout" name="developerPayout" placeholder="80" type="number" />
        </div>
        <div className="mt-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
          <p className="text-[0.9rem] font-medium text-[var(--on-surface)]">Visibility contract</p>
          <p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
            Admin sees both sides. Client-facing dashboards receive project invoice value only. Developer dashboards receive approved compensation only. Andishi spread remains internal.
          </p>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)]"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-5 text-[0.86rem] font-medium text-[var(--bg)]"
            type="submit"
          >
            Create record
          </button>
        </div>
      </form>
    </div>
  );
}

function FinanceMessageModal({
  onClose,
  onSend,
  record,
}: {
  onClose: () => void;
  onSend: (record: FinanceRecord, message: string) => void;
  record: FinanceRecord | null;
}) {
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!record) return;
    textareaRef.current?.focus();
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
  }, [onClose, record]);

  if (!record) return null;

  return (
    <div
      aria-labelledby="finance-message-title"
      aria-modal="true"
      className="fixed inset-0 z-[95] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-8 backdrop-blur-xl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      <form
        className="w-full max-w-2xl rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          onSend(record, draft || "Finance update recorded");
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-caps text-[var(--primary)]">Finance note</p>
            <h2 id="finance-message-title" className="title-serif mt-2 text-[1.2rem] font-medium text-[var(--on-surface)]">
              Record action for {record.clientInvoiceId}
            </h2>
            <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
              Capture collection, payout, reconciliation, or stakeholder context without exposing internal economics to client or developer surfaces.
            </p>
          </div>
          <button
            aria-label="Close finance note modal"
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
            onClick={onClose}
            type="button"
          >
            <IconX size={18} stroke={1.7} />
          </button>
        </div>
        <label className="mt-6 block">
          <span className="text-[0.82rem] font-medium text-[var(--on-surface)]">Note</span>
          <textarea
            ref={textareaRef}
            className="mt-2 min-h-36 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.9rem] leading-relaxed text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Collection follow-up, payout approval, reconciliation evidence, or CFO note..."
            value={draft}
          />
        </label>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)]"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-5 text-[0.86rem] font-medium text-[var(--bg)]"
            type="submit"
          >
            Save action
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionHeader({
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
      <h2 className="title-serif mt-3 text-[clamp(1.48rem,2vw,1.9rem)] font-medium text-[var(--on-surface)]">{title}</h2>
      <p className="mt-2 max-w-3xl text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
        {description}
      </p>
    </div>
  );
}

function ChartPanel({
  children,
  description,
  title,
  value,
}: {
  children: ReactNode;
  description: string;
  title: string;
  value: string;
}) {
  return (
    <article className="min-w-0 rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] sm:p-5">
      <div className="flex min-h-[4.75rem] items-start justify-between gap-4">
        <div>
          <h3 className="text-[1rem] font-medium text-[var(--on-surface)]">{title}</h3>
          <p className="mt-1 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">{description}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--glass-border)] px-3 py-1.5 font-mono text-[0.72rem] text-[var(--on-surface)]">
          {value}
        </span>
      </div>
      <div className="mt-4">{children}</div>
    </article>
  );
}

function SelectPill({
  children,
  icon: Icon,
  label,
  onChange,
  value,
}: {
  children: ReactNode;
  icon: Icon;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <Icon
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]"
        size={15}
        stroke={1.7}
      />
      <select
        className="h-10 w-full cursor-pointer appearance-none rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-9 pr-8 text-[0.82rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}

function IconButton({
  children,
  danger,
  label,
  onClick,
}: {
  children: ReactNode;
  danger?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "grid h-9 w-9 cursor-pointer place-items-center rounded-full border transition-colors duration-200",
        danger
          ? "border-[color-mix(in_srgb,var(--error)_30%,var(--glass-border))] text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
          : "border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:bg-[var(--glass-bg)] hover:text-[var(--on-surface)]",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ActionButton({
  danger,
  icon: Icon,
  label,
  onClick,
}: {
  danger?: boolean;
  icon: Icon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border px-3 text-[0.82rem] font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45",
        danger
          ? "border-[color-mix(in_srgb,var(--error)_30%,var(--glass-border))] text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
          : "border-[var(--glass-border)] text-[var(--on-surface)] hover:bg-[var(--glass-bg)]",
      )}
      disabled={!onClick}
      onClick={onClick}
      type="button"
    >
      <Icon size={15} stroke={1.7} />
      {label}
    </button>
  );
}

function SignalCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-[var(--glass-border)] px-3 py-3 last:border-r-0">
      <p className="text-[0.66rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">{label}</p>
      <p className="mt-1 truncate font-mono text-[0.84rem] text-[var(--on-surface)]">{value}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5">
      <p className="text-[0.66rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">{label}</p>
      <p className="mt-1 truncate font-mono text-[0.82rem] text-[var(--on-surface)]">{value}</p>
    </div>
  );
}

function StrategyTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-[var(--glass-border)] p-4 md:border-l md:border-t-0 first:md:border-l-0">
      <p className="text-[0.68rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">{label}</p>
      <p className="mt-2 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">{value}</p>
    </div>
  );
}

function FinanceBandCard({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string;
  icon: Icon;
  label: string;
  value: string;
}) {
  return (
    <article className="min-w-0 rounded-[1.15rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,var(--surface))] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.78rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">{label}</p>
          <p className="mt-3 font-mono text-[1.35rem] text-[var(--on-surface)]">{value}</p>
          <p className="mt-2 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">{detail}</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--primary)]">
          <Icon size={18} stroke={1.7} />
        </span>
      </div>
    </article>
  );
}

function VisibilityCard({
  body,
  icon: Icon,
  role,
  tone,
}: {
  body: string[];
  icon: Icon;
  role: string;
  tone: "muted" | "primary" | "success";
}) {
  const color =
    tone === "success" ? "var(--tertiary)" : tone === "primary" ? "var(--primary)" : "var(--on-surface-dim)";
  return (
    <article className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)]" style={{ color }}>
          <Icon size={18} stroke={1.7} />
        </span>
        <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">{role} view</p>
      </div>
      <div className="mt-4 grid gap-2">
        {body.map((item) => (
          <div className="flex items-center gap-2 text-[0.82rem] text-[var(--on-surface-dim)]" key={item}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            {item}
          </div>
        ))}
      </div>
    </article>
  );
}

function MarginRing({ size = 58, value }: { size?: number; value: number }) {
  const tone = value < 30 ? "var(--error)" : value > 45 ? "var(--tertiary)" : "var(--primary)";
  const background = `conic-gradient(${tone} ${Math.min(value, 100) * 3.6}deg, color-mix(in srgb, var(--on-surface) 10%, transparent) 0deg)`;
  return (
    <span className="grid shrink-0 place-items-center rounded-full" style={{ background, height: size, width: size }}>
      <span className="grid h-[calc(100%-8px)] w-[calc(100%-8px)] place-items-center rounded-full bg-[var(--surface)] font-mono text-[0.76rem] text-[var(--on-surface)]">
        {value}%
      </span>
    </span>
  );
}

const FormInput = forwardRef<
  HTMLInputElement,
  {
    label: string;
    name: string;
    placeholder: string;
    type?: string;
  }
>(function FormInput({ label, name, placeholder, type = "text" }, ref) {
  return (
    <label>
      <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">{label}</span>
      <input
        ref={ref}
        className="mt-2 h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]"
        name={name}
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
});

function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-[1.2rem] border border-dashed border-[var(--glass-border)] p-8 text-center lg:col-span-2">
      <p className="text-[0.98rem] font-medium text-[var(--on-surface)]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{body}</p>
    </div>
  );
}

function getMarginAmount(record: FinanceRecord) {
  return Math.max(record.clientAmount - record.developerPayout - record.taxReserve, 0);
}

function getMarginRate(record: FinanceRecord) {
  if (!record.clientAmount) return 0;
  return Math.round((getMarginAmount(record) / record.clientAmount) * 100);
}

function getCashPriority(record: FinanceRecord) {
  const priority: Record<FinanceStatus, number> = {
    overdue: 6,
    client_sent: 5,
    client_paid: 4,
    payout_ready: 3,
    draft: 2,
    reconciled: 1,
  };
  return priority[record.status];
}

function buildFinanceStats(records: FinanceRecord[]) {
  const clientBillings = records.reduce((sum, record) => sum + record.clientAmount, 0);
  const payoutLiability = records.reduce((sum, record) => sum + record.developerPayout, 0);
  const taxReserve = records.reduce((sum, record) => sum + record.taxReserve, 0);
  const margin = records.reduce((sum, record) => sum + getMarginAmount(record), 0);
  const paid = records
    .filter((record) => record.status === "client_paid" || record.status === "payout_ready" || record.status === "reconciled")
    .reduce((sum, record) => sum + record.clientAmount, 0);
  const overdueRecords = records.filter((record) => record.status === "overdue");

  return {
    clientBillings,
    margin,
    marginRate: clientBillings ? Math.round((margin / clientBillings) * 100) : 0,
    overdue: overdueRecords.length,
    overdueAmount: overdueRecords.reduce((sum, record) => sum + record.clientAmount, 0),
    paidRate: clientBillings ? Math.round((paid / clientBillings) * 100) : 0,
    payoutLiability,
    payoutReady: records.filter((record) => record.status === "payout_ready").length,
    sent: records.filter((record) => record.status === "client_sent").length,
    taxReserve,
  };
}

function formatMoney(value: number) {
  if (!value) return "$0";
  if (value >= 1000) return `$${Math.round(value / 100) / 10}k`;
  return `$${value}`;
}
