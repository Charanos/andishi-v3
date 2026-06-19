"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode, RefObject } from "react";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBuildingBank,
  IconCheck,
  IconFileInvoice,
  IconFilter,
  IconLock,
  IconMessageCircle,
  IconPlus,
  IconReceipt,
  IconRefresh,
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

type PaymentStatus = "draft" | "sent" | "due" | "paid" | "settled" | "void";
type PayoutStatus = "blocked" | "pending" | "approved" | "released";
type PaymentRisk = "low" | "watch" | "urgent";
type SortKey = "cash" | "age" | "payout" | "risk";

type PaymentRecord = {
  activity: string[];
  agingDays: number;
  client: string;
  clientAmount: number;
  clientContact: string;
  collectionMove: string;
  developer: string;
  developerPayout: number;
  dueDate: string;
  id: string;
  invoiceId: string;
  issuedAt: string;
  owner: string;
  paymentRail: "Stripe" | "Wire" | "Manual";
  payoutDue: string;
  payoutStatus: PayoutStatus;
  project: string;
  risk: PaymentRisk;
  settlementPolicy: string;
  status: PaymentStatus;
};

const statusOrder: PaymentStatus[] = ["draft", "sent", "due", "paid", "settled", "void"];

const statusMeta: Record<
  PaymentStatus,
  { label: string; next: PaymentStatus | null; tone: "active" | "available" | "neutral" | "overdue" | "pending" }
> = {
  draft: { label: "Draft", next: "sent", tone: "neutral" },
  due: { label: "Due", next: "paid", tone: "overdue" },
  paid: { label: "Paid", next: "settled", tone: "active" },
  sent: { label: "Sent", next: "due", tone: "pending" },
  settled: { label: "Settled", next: null, tone: "available" },
  void: { label: "Void", next: null, tone: "neutral" },
};

const payoutMeta: Record<PayoutStatus, { label: string; tone: "active" | "available" | "neutral" | "overdue" | "pending" }> = {
  approved: { label: "Approved", tone: "available" },
  blocked: { label: "Blocked", tone: "overdue" },
  pending: { label: "Pending", tone: "pending" },
  released: { label: "Released", tone: "active" },
};

const riskMeta: Record<PaymentRisk, { label: string; tone: "active" | "overdue" | "pending" }> = {
  low: { label: "Low", tone: "active" },
  urgent: { label: "Urgent", tone: "overdue" },
  watch: { label: "Watch", tone: "pending" },
};

const paymentSeed: PaymentRecord[] = [
  {
    activity: ["Invoice issued to Kijani", "Amina payout held in scheduled reserve", "Finance contact confirmed billing route"],
    agingDays: 4,
    client: "Kijani Analytics",
    clientAmount: 16800,
    clientContact: "Maya Kamau",
    collectionMove: "Confirm payment window before intro batch closes",
    developer: "Amina Otieno",
    developerPayout: 6400,
    dueDate: "Jun 14, 2026",
    id: "pay-kijani-ai",
    invoiceId: "AND-2026-0108",
    issuedAt: "Jun 1, 2026",
    owner: "Finance",
    paymentRail: "Wire",
    payoutDue: "Jun 18, 2026",
    payoutStatus: "pending",
    project: "AI Support Workflow",
    risk: "low",
    settlementPolicy: "Release payout after client funds clear and approved hours match invoice lines.",
    status: "sent",
  },
  {
    activity: ["Client payment received", "Milestone approval pending", "Developer payout queued behind scope signoff"],
    agingDays: 0,
    client: "SokoPay",
    clientAmount: 24000,
    clientContact: "June Njeri",
    collectionMove: "Get milestone acceptance before releasing Kwame payout",
    developer: "Kwame Mensah",
    developerPayout: 12600,
    dueDate: "Paid Jun 2",
    id: "pay-sokopay-recon",
    invoiceId: "AND-2026-0102",
    issuedAt: "May 24, 2026",
    owner: "Dennis",
    paymentRail: "Stripe",
    payoutDue: "Jun 7, 2026",
    payoutStatus: "approved",
    project: "Payments Reconciliation",
    risk: "watch",
    settlementPolicy: "Payout can release after milestone acceptance is attached to the finance packet.",
    status: "paid",
  },
  {
    activity: ["Invoice overdue", "Developer payout blocked", "Account recovery note sent"],
    agingDays: 13,
    client: "Cloudify Inc",
    clientAmount: 11200,
    clientContact: "Anton Githinji",
    collectionMove: "Escalate CTO and finance manager before Friday",
    developer: "Fatima Al-Zahrawi",
    developerPayout: 5920,
    dueDate: "May 25, 2026",
    id: "pay-cloudify-infra",
    invoiceId: "AND-2026-0097",
    issuedAt: "May 10, 2026",
    owner: "Ops",
    paymentRail: "Wire",
    payoutDue: "On collection",
    payoutStatus: "blocked",
    project: "Infrastructure Migration",
    risk: "urgent",
    settlementPolicy: "Collection-gated payout. Leadership override required before Andishi floats developer payout.",
    status: "due",
  },
  {
    activity: ["Renewal invoice paid", "Tendo payout approved", "Batch settlement waiting on bank export"],
    agingDays: 0,
    client: "MedLink",
    clientAmount: 17800,
    clientContact: "Aisha Bello",
    collectionMove: "Release payout batch after bank export is reconciled",
    developer: "Tendo Nakamura",
    developerPayout: 8900,
    dueDate: "Paid Jun 1",
    id: "pay-medlink-mobile",
    invoiceId: "AND-2026-0105",
    issuedAt: "May 26, 2026",
    owner: "Finance",
    paymentRail: "Stripe",
    payoutDue: "Jun 5, 2026",
    payoutStatus: "approved",
    project: "Patient App Revamp",
    risk: "low",
    settlementPolicy: "Payment cleared. Release payout after export and reconciliation packet are attached.",
    status: "paid",
  },
  {
    activity: ["Draft created from onboarding", "Security review not billable yet", "Payout hidden until work activates"],
    agingDays: 0,
    client: "Nova Health",
    clientAmount: 7200,
    clientContact: "Dr. Nia Mensah",
    collectionMove: "Wait for security signoff before sending invoice",
    developer: "Zola Ndlovu",
    developerPayout: 3600,
    dueDate: "Draft",
    id: "pay-nova-onboarding",
    invoiceId: "AND-DRAFT-NOVA",
    issuedAt: "Draft",
    owner: "Finance",
    paymentRail: "Manual",
    payoutDue: "Pending activation",
    payoutStatus: "blocked",
    project: "AWS Reliability Intake",
    risk: "watch",
    settlementPolicy: "No payout liability exists until billable scope and approved work exist.",
    status: "draft",
  },
  {
    activity: ["Invoice settled", "Ada payout released", "Close packet attached"],
    agingDays: 0,
    client: "StartupHub",
    clientAmount: 21000,
    clientContact: "Adaeze Okafor",
    collectionMove: "No action required; use as clean settlement reference",
    developer: "Ada Mensah",
    developerPayout: 9800,
    dueDate: "Paid May 18",
    id: "pay-startuphub-events",
    invoiceId: "AND-2026-0088",
    issuedAt: "May 4, 2026",
    owner: "Finance",
    paymentRail: "Wire",
    payoutDue: "Released May 21",
    payoutStatus: "released",
    project: "Real-time Events Pipeline",
    risk: "low",
    settlementPolicy: "Closed packet can support future fixed-project finance QA.",
    status: "settled",
  },
];

export function AdminPaymentsPage() {
  const [records, setRecords] = useState(paymentSeed);
  const [selectedId, setSelectedId] = useState(paymentSeed[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [riskFilter, setRiskFilter] = useState<PaymentRisk | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("cash");
  const [drawerRecord, setDrawerRecord] = useState<PaymentRecord | null>(null);
  const [confirmRecord, setConfirmRecord] = useState<PaymentRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [noteRecord, setNoteRecord] = useState<PaymentRecord | null>(null);

  const selected = records.find((record) => record.id === selectedId) ?? records[0] ?? null;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records
      .filter((record) => {
        const haystack = `${record.invoiceId} ${record.client} ${record.clientContact} ${record.developer} ${record.project} ${record.owner} ${record.collectionMove}`.toLowerCase();
        return (!needle || haystack.includes(needle)) && (statusFilter === "all" || record.status === statusFilter) && (riskFilter === "all" || record.risk === riskFilter);
      })
      .sort((a, b) => {
        if (sortKey === "age") return b.agingDays - a.agingDays;
        if (sortKey === "payout") return b.developerPayout - a.developerPayout;
        if (sortKey === "risk") return riskPriority(b.risk) - riskPriority(a.risk);
        return b.clientAmount - a.clientAmount;
      });
  }, [query, records, riskFilter, sortKey, statusFilter]);

  const stats = useMemo(() => buildPaymentStats(records), [records]);

  const columns = useMemo<Array<OperationalTableColumn<PaymentRecord>>>(
    () => [
      {
        key: "invoiceId",
        label: "Invoice",
        priority: true,
        render: (record) => (
          <div className="min-w-0">
            <p className="truncate text-[0.88rem] font-medium text-[var(--on-surface)]">{record.invoiceId}</p>
            <p className="mt-1 truncate text-[0.74rem] text-[var(--on-surface-dim)]">{record.client} / {record.project}</p>
          </div>
        ),
      },
      { key: "status", label: "Status", render: (record) => <StatusBadge label={statusMeta[record.status].label} tone={statusMeta[record.status].tone} /> },
      { key: "clientAmount", label: "Client bill", mono: true, render: (record) => formatMoney(record.clientAmount) },
      { key: "developerPayout", label: "Payout", mono: true, render: (record) => formatMoney(record.developerPayout) },
      { key: "payoutStatus", label: "Payout state", hideOnMobile: true, render: (record) => <StatusBadge label={payoutMeta[record.payoutStatus].label} tone={payoutMeta[record.payoutStatus].tone} /> },
      { key: "risk", label: "Risk", hideOnMobile: true, render: (record) => <StatusBadge label={riskMeta[record.risk].label} tone={riskMeta[record.risk].tone} /> },
      { key: "owner", label: "Owner", hideOnMobile: true },
    ],
    [],
  );

  const advanceRecord = (record: PaymentRecord) => {
    const next = statusMeta[record.status].next;
    if (!next) return;
    const updated: PaymentRecord = {
      ...record,
      activity: [`Moved payment to ${statusMeta[next].label}`, ...record.activity],
      agingDays: next === "paid" || next === "settled" ? 0 : record.agingDays,
      payoutStatus: next === "paid" ? "approved" : next === "settled" ? "released" : record.payoutStatus,
      risk: next === "paid" || next === "settled" ? "low" : record.risk,
      status: next,
    };
    setRecords((current) => current.map((item) => (item.id === record.id ? updated : item)));
    setSelectedId(updated.id);
    setDrawerRecord((current) => (current?.id === record.id ? updated : current));
  };

  const escalateCollection = (record: PaymentRecord) => {
    const updated: PaymentRecord = {
      ...record,
      activity: ["Collection escalation opened", ...record.activity],
      agingDays: Math.max(record.agingDays, 7),
      payoutStatus: "blocked",
      risk: "urgent",
      status: record.status === "draft" ? "sent" : "due",
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
    const created: PaymentRecord = {
      activity: ["Invoice draft opened", "Settlement policy attached", "Payout remains hidden until approval"],
      agingDays: 0,
      client: payload.client,
      clientAmount: payload.clientAmount,
      clientContact: "Billing contact",
      collectionMove: "Confirm billing contact and scope before sending",
      developer: payload.developer,
      developerPayout: payload.developerPayout,
      dueDate: "Draft",
      id: `pay-${Date.now()}`,
      invoiceId: `AND-DRAFT-${Date.now().toString().slice(-4)}`,
      issuedAt: "Draft",
      owner: "Finance",
      paymentRail: "Manual",
      payoutDue: "Pending client payment",
      payoutStatus: "blocked",
      project: payload.project,
      risk: "watch",
      settlementPolicy: "Admin must confirm client invoice scope and developer payout boundary before payment is visible downstream.",
      status: "draft",
    };
    setRecords((current) => [created, ...current]);
    setSelectedId(created.id);
    setDrawerRecord(created);
    setCreateOpen(false);
  };

  const sendNote = (record: PaymentRecord, message: string) => {
    setRecords((current) =>
      current.map((item) => item.id === record.id ? { ...item, activity: [`Payment note: ${message}`, ...item.activity] } : item),
    );
    setNoteRecord(null);
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
        title="Payment operations"
        description="Execute invoices, collections, payout release, and settlement without exposing Andishi spread or client commercial terms to developer surfaces."
        status={<StatusBadge label={`${stats.collectionCount} collection actions`} tone={stats.collectionCount ? "overdue" : "active"} />}
        actions={
          <>
            <button
              type="button"
              onClick={() => setRiskFilter("urgent")}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--error)_30%,var(--glass-border))] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
            >
              <IconAlertTriangle size={16} stroke={1.7} />
              Collections
              <span className="font-mono text-[0.76rem] text-[var(--error)]">{stats.urgent}</span>
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)] shadow-[0_14px_30px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <IconPlus size={16} stroke={1.8} />
              New invoice
            </button>
          </>
        }
      />

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard chart="bar" data={[42, 48, 57, 63, Math.round(stats.receivable / 1000)]} icon={IconFileInvoice} label="Receivables" trend={`${formatMoney(stats.overdueAmount)} overdue`} value={formatMoney(stats.receivable)} />
        <KpiCard data={[18, 22, 24, 28, Math.round(stats.payoutHold / 1000)]} icon={IconUsers} label="Payout hold" trend={`${stats.blockedPayouts} blocked payouts`} value={formatMoney(stats.payoutHold)} />
        <KpiCard chart="bar" data={[3, 4, 5, 4, stats.readyToSettle]} icon={IconBuildingBank} label="Ready to settle" trend="Paid invoices awaiting release" value={String(stats.readyToSettle)} />
        <KpiCard data={[71, 76, 82, 87, stats.settlementScore]} icon={IconShieldCheck} label="Settlement score" trend="Cash and payout readiness" value={`${stats.settlementScore}%`} />
      </section>

      <SectionDivider />

      <PaymentSettlementDesk records={records} selected={selected} stats={stats} />

      <SectionDivider />

      <section className="grid min-w-0 gap-7 2xl:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)]">
        <PaymentLanes records={records} onSelect={setSelectedId} selectedId={selected?.id ?? ""} />
        <PaymentCommandPanel
          record={selected}
          onAdvance={selected ? () => advanceRecord(selected) : undefined}
          onArchive={selected ? () => setConfirmRecord(selected) : undefined}
          onEscalate={selected ? () => escalateCollection(selected) : undefined}
          onInspect={selected ? () => setDrawerRecord(selected) : undefined}
          onNote={selected ? () => setNoteRecord(selected) : undefined}
        />
      </section>

      <section className="grid min-w-0 gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <SectionHeader eyebrow="Payment ledger" title="Invoice and payout queue" description="Filter invoices by status and risk, then execute collection, settlement, and payout release from one role-safe operating table." />
          <PaymentToolbar query={query} riskFilter={riskFilter} setQuery={setQuery} setRiskFilter={setRiskFilter} setSortKey={setSortKey} setStatusFilter={setStatusFilter} sortKey={sortKey} statusFilter={statusFilter} />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((record) => (
            <PaymentCard
              key={record.id}
              record={record}
              selected={selected?.id === record.id}
              onAdvance={() => advanceRecord(record)}
              onArchive={() => setConfirmRecord(record)}
              onEscalate={() => escalateCollection(record)}
              onInspect={() => setDrawerRecord(record)}
              onNote={() => setNoteRecord(record)}
              onSelect={() => setSelectedId(record.id)}
            />
          ))}
          {!filtered.length && <EmptyState title="No payments match" body="Clear filters or draft a new invoice from the header action." />}
        </div>
      </section>

      <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <ChartPanel title="Cash clearing" description="Receivable, paid, settlement, and payout-release movement." value={`${stats.settlementScore}%`}>
          <DashboardLineChart data={[48, 53, 61, 66, 72, stats.settlementScore]} height={300} labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Now"]} variant="area" />
        </ChartPanel>
        <ChartPanel title="Payment state" description="Invoice distribution from draft through settlement." value={`${records.length} invoices`}>
          <DashboardDonutChart data={statusOrder.map((status) => ({ label: statusMeta[status].label, value: records.filter((record) => record.status === status).length, tone: status === "settled" || status === "paid" ? "success" as const : status === "due" ? "primary" as const : status === "sent" ? "secondary" as const : "muted" as const }))} height={210} />
        </ChartPanel>
      </section>

      <OperationalDataTable columns={columns} description="Execution matrix for invoice state, collection risk, developer payout state, owner, and role-safe settlement policy." empty="No payment records match the active filters." onRowSelect={(record) => { setSelectedId(record.id); setDrawerRecord(record); }} rows={filtered} title="Payment execution matrix" />

      <CreatePaymentModal onClose={() => setCreateOpen(false)} onSubmit={createRecord} open={createOpen} />
      {noteRecord && (
        <PaymentNoteModal
          key={noteRecord.id}
          onClose={() => setNoteRecord(null)}
          onSend={sendNote}
          record={noteRecord}
        />
      )}

      <EntityDrawer onClose={() => setDrawerRecord(null)} open={Boolean(drawerRecord)} title={drawerRecord?.invoiceId ?? "Payment details"}>
        {drawerRecord && <PaymentDrawerContent record={drawerRecord} onAdvance={() => advanceRecord(drawerRecord)} onArchive={() => setConfirmRecord(drawerRecord)} onEscalate={() => escalateCollection(drawerRecord)} onNote={() => setNoteRecord(drawerRecord)} />}
      </EntityDrawer>

      <ConfirmDialog confirmLabel="Archive payment" description={`This removes ${confirmRecord?.invoiceId ?? "this payment"} from the active payment queue while keeping the future audit trail shape intact.`} onCancel={() => setConfirmRecord(null)} onConfirm={archiveRecord} open={Boolean(confirmRecord)} title="Archive payment record?" />
    </div>
  );
}

function PaymentSettlementDesk({ records, selected, stats }: { records: PaymentRecord[]; selected: PaymentRecord | null; stats: ReturnType<typeof buildPaymentStats> }) {
  if (!selected) return <EmptyState title="No payment selected" body="Select an invoice to open the settlement desk." />;

  const railMix = ["Stripe", "Wire", "Manual"].map((rail) => records.filter((record) => record.paymentRail === rail).length);

  return (
    <section className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_22rem]">
      <article className="min-w-0 overflow-hidden rounded-[1.6rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_22%,var(--surface)),var(--surface))] shadow-[0_22px_70px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <p className="label-caps text-[var(--primary)]">Settlement desk</p>
            <h2 className="title-serif mt-3 text-[1.45rem] font-medium leading-tight text-[var(--on-surface)]">{selected.invoiceId}</h2>
            <p className="mt-3 max-w-3xl text-[0.96rem] leading-relaxed text-[var(--on-surface-dim)]">{selected.collectionMove}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoTile label="Client bill" value={formatMoney(selected.clientAmount)} />
              <InfoTile label="Developer payout" value={formatMoney(selected.developerPayout)} />
              <InfoTile label="Aging" value={`${selected.agingDays}d`} />
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
            <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Settlement policy</p>
            <p className="mt-3 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{selected.settlementPolicy}</p>
            <p className="mt-4 text-[0.78rem] leading-relaxed text-[var(--primary)]">Client sees invoice and payment status. Developer sees approved payout and release state. Andishi spread stays internal.</p>
          </div>
        </div>
        <div className="grid border-t border-[var(--glass-border)] md:grid-cols-3">
          <BoundaryTile icon={IconReceipt} label="Client surface" value="Invoice, receipt, scope, due date" />
          <BoundaryTile icon={IconUsers} label="Developer surface" value="Approved payout, release date, work context" />
          <BoundaryTile icon={IconLock} label="Admin surface" value="Full settlement, margin, reserve, collection policy" />
        </div>
      </article>
      <article className="rounded-[1.6rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_7%,transparent)] sm:p-6">
        <p className="label-caps text-[var(--primary)]">Rails and readiness</p>
        <p className="mt-3 text-[2rem] font-medium leading-none text-[var(--on-surface)]">{formatMoney(stats.readyValue)}</p>
        <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">Paid value that can become settlement once payout and finance evidence are clean.</p>
        <div className="mt-5">
          <DashboardBarChart data={railMix} height={220} labels={["Stripe", "Wire", "Manual"]} />
        </div>
      </article>
    </section>
  );
}

function PaymentLanes({ onSelect, records, selectedId }: { onSelect: (id: string) => void; records: PaymentRecord[]; selectedId: string }) {
  const lanes: Array<{ description: string; statuses: PaymentStatus[]; title: string }> = [
    { description: "Scope and invoice setup before client visibility.", statuses: ["draft", "sent"], title: "Issue" },
    { description: "Client payment follow-up and collection risk.", statuses: ["due"], title: "Collect" },
    { description: "Cash received; payout release is policy-gated.", statuses: ["paid"], title: "Release" },
    { description: "Closed packets, released payouts, and audit references.", statuses: ["settled"], title: "Settle" },
  ];

  return (
    <div className="min-w-0">
      <SectionHeader eyebrow="Execution lanes" title="Invoice to payout flow" description="Payments are organized by operational state so finance can see what must be issued, collected, released, and closed." />
      <div className="mt-6 grid gap-4 xl:grid-cols-4">
        {lanes.map((lane) => {
          const laneRecords = records.filter((record) => lane.statuses.includes(record.status));
          return (
            <article className="min-w-0 rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4" key={lane.title}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[1rem] font-medium text-[var(--on-surface)]">{lane.title}</h3>
                  <p className="mt-1 text-[0.78rem] leading-relaxed text-[var(--on-surface-dim)]">{lane.description}</p>
                </div>
                <span className="rounded-full border border-[var(--glass-border)] px-2.5 py-1 font-mono text-[0.72rem] text-[var(--on-surface)]">{laneRecords.length}</span>
              </div>
              <div className="mt-4 grid gap-3">
                {laneRecords.map((record) => (
                  <button className={cn("min-w-0 rounded-2xl border p-3 text-left transition-colors duration-200", selectedId === record.id ? "border-[color-mix(in_srgb,var(--primary)_42%,var(--glass-border))] bg-[color-mix(in_srgb,var(--primary)_8%,var(--surface))]" : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[color-mix(in_srgb,var(--primary)_24%,var(--glass-border))]")} key={record.id} onClick={() => onSelect(record.id)} type="button">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 truncate text-[0.86rem] font-medium text-[var(--on-surface)]">{record.client}</p>
                      <StatusBadge label={riskMeta[record.risk].label} tone={riskMeta[record.risk].tone} />
                    </div>
                    <p className="mt-2 truncate font-mono text-[0.82rem] text-[var(--on-surface)]">{formatMoney(record.clientAmount)}</p>
                    <p className="mt-1 text-[0.74rem] text-[var(--on-surface-dim)]">{record.invoiceId}</p>
                  </button>
                ))}
                {!laneRecords.length && <p className="rounded-2xl border border-dashed border-[var(--glass-border)] p-4 text-[0.8rem] text-[var(--on-surface-dim)]">No records in this lane.</p>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function PaymentToolbar({ query, riskFilter, setQuery, setRiskFilter, setSortKey, setStatusFilter, sortKey, statusFilter }: { query: string; riskFilter: PaymentRisk | "all"; setQuery: (value: string) => void; setRiskFilter: (value: PaymentRisk | "all") => void; setSortKey: (value: SortKey) => void; setStatusFilter: (value: PaymentStatus | "all") => void; sortKey: SortKey; statusFilter: PaymentStatus | "all" }) {
  return (
    <div className="grid w-full gap-3 xl:w-auto xl:min-w-[42rem]">
      <label className="relative min-w-0">
        <span className="sr-only">Search payments</span>
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]" size={16} stroke={1.7} />
        <input className="h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-10 pr-4 text-[0.9rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]" onChange={(event) => setQuery(event.target.value)} placeholder="Search invoices, clients, developers, projects..." value={query} />
      </label>
      <div className="grid gap-2 sm:grid-cols-3">
        <SelectPill icon={IconFilter} label="Status" value={statusFilter} onChange={(value) => setStatusFilter(value as PaymentStatus | "all")}>
          <option value="all">All statuses</option>
          {statusOrder.map((status) => <option key={status} value={status}>{statusMeta[status].label}</option>)}
        </SelectPill>
        <SelectPill icon={IconAlertTriangle} label="Risk" value={riskFilter} onChange={(value) => setRiskFilter(value as PaymentRisk | "all")}>
          <option value="all">All risk</option>
          {Object.entries(riskMeta).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
        </SelectPill>
        <SelectPill icon={IconRefresh} label="Sort" value={sortKey} onChange={(value) => setSortKey(value as SortKey)}>
          <option value="cash">Cash value</option>
          <option value="age">Aging</option>
          <option value="payout">Payout</option>
          <option value="risk">Risk</option>
        </SelectPill>
      </div>
    </div>
  );
}

function PaymentCard({ onAdvance, onArchive, onEscalate, onInspect, onNote, onSelect, record, selected }: { onAdvance: () => void; onArchive: () => void; onEscalate: () => void; onInspect: () => void; onNote: () => void; onSelect: () => void; record: PaymentRecord; selected: boolean }) {
  return (
    <article className={cn("min-w-0 overflow-hidden rounded-[1.35rem] border transition-all duration-200", selected ? "border-[color-mix(in_srgb,var(--primary)_38%,var(--glass-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_7%,var(--surface)),var(--surface))] shadow-[0_18px_50px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]" : record.risk === "urgent" ? "border-[color-mix(in_srgb,var(--error)_34%,var(--glass-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--error)_6%,var(--surface)),var(--surface))]" : "border-[var(--glass-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-high)_24%,var(--surface)),var(--surface))]")}>
      <button className="block w-full min-w-0 cursor-pointer p-5 text-left sm:p-6" onClick={onSelect} type="button">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words text-[1rem] font-medium text-[var(--on-surface)]">{record.invoiceId}</h3>
              <StatusBadge label={statusMeta[record.status].label} tone={statusMeta[record.status].tone} />
            </div>
            <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{record.client} / {record.project}</p>
          </div>
          <PaymentRing value={getCollectionScore(record)} />
        </div>
        <p className="mt-5 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{record.collectionMove}</p>
      </button>
      <div className="grid gap-4 border-t border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_44%,transparent)] p-5 sm:p-6">
        <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]">
          <SignalCell label="Client" value={formatMoney(record.clientAmount)} />
          <SignalCell label="Payout" value={formatMoney(record.developerPayout)} />
          <SignalCell label="Aging" value={`${record.agingDays}d`} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <StatusBadge label={payoutMeta[record.payoutStatus].label} tone={payoutMeta[record.payoutStatus].tone} />
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <IconButton label={`Inspect ${record.invoiceId}`} onClick={onInspect}><IconArrowRight size={16} stroke={1.8} /></IconButton>
            <IconButton label={`Note ${record.invoiceId}`} onClick={onNote}><IconMessageCircle size={16} stroke={1.8} /></IconButton>
            <IconButton label={`Advance ${record.invoiceId}`} onClick={onAdvance}><IconCheck size={16} stroke={1.8} /></IconButton>
            <IconButton danger label={`Escalate ${record.invoiceId}`} onClick={onEscalate}><IconAlertTriangle size={16} stroke={1.8} /></IconButton>
            <IconButton danger label={`Archive ${record.invoiceId}`} onClick={onArchive}><IconTrash size={16} stroke={1.8} /></IconButton>
          </div>
        </div>
      </div>
    </article>
  );
}

function PaymentCommandPanel({ onAdvance, onArchive, onEscalate, onInspect, onNote, record }: { onAdvance?: () => void; onArchive?: () => void; onEscalate?: () => void; onInspect?: () => void; onNote?: () => void; record: PaymentRecord | null }) {
  if (!record) return <EmptyState title="Select a payment" body="Pick an invoice to inspect collection and payout state." />;

  return (
    <aside className="2xl:sticky 2xl:top-28 2xl:self-start">
      <div className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)] sm:p-6">
        <StatusBadge label={statusMeta[record.status].label} tone={statusMeta[record.status].tone} />
        <h2 className="title-serif mt-3 text-[1.15rem] font-medium text-[var(--on-surface)]">{record.invoiceId}</h2>
        <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{record.client} billing with {record.developer} payout held as a separate downstream value.</p>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <InfoTile label="Client bill" value={formatMoney(record.clientAmount)} />
          <InfoTile label="Payout" value={formatMoney(record.developerPayout)} />
          <InfoTile label="Rail" value={record.paymentRail} />
          <InfoTile label="Owner" value={record.owner} />
        </div>
        <div className="mt-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
          <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Next payment move</p>
          <p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">{record.collectionMove}</p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <ActionButton icon={IconMessageCircle} label="Note" onClick={onNote} />
          <ActionButton icon={IconReceipt} label="Inspect" onClick={onInspect} />
          <ActionButton icon={IconCheck} label="Advance" onClick={onAdvance} />
          <ActionButton danger icon={IconAlertTriangle} label="Escalate" onClick={onEscalate} />
          <ActionButton danger icon={IconTrash} label="Archive" onClick={onArchive} />
        </div>
      </div>
    </aside>
  );
}

function PaymentDrawerContent({ onAdvance, onArchive, onEscalate, onNote, record }: { onAdvance: () => void; onArchive: () => void; onEscalate: () => void; onNote: () => void; record: PaymentRecord }) {
  return (
    <div className="grid gap-6">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <StatusBadge label={statusMeta[record.status].label} tone={statusMeta[record.status].tone} />
          <h3 className="mt-3 text-[1.35rem] font-medium text-[var(--on-surface)]">{record.invoiceId}</h3>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">{record.client} / {record.project}. Payment rail: {record.paymentRail}.</p>
        </div>
        <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4">
          <PaymentRing value={getCollectionScore(record)} size={92} />
          <p className="mt-4 text-center text-[0.82rem] text-[var(--on-surface-dim)]">Collection readiness</p>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoTile label="Client bill" value={formatMoney(record.clientAmount)} />
        <InfoTile label="Developer payout" value={formatMoney(record.developerPayout)} />
        <InfoTile label="Due" value={record.dueDate} />
        <InfoTile label="Payout due" value={record.payoutDue} />
      </section>
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4">
          <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Settlement policy</p>
          <p className="mt-3 text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">{record.settlementPolicy}</p>
          <div className="mt-4 grid gap-2">
            <BoundaryRow label="Client" value="Invoice value, receipt, due date, project scope" />
            <BoundaryRow label="Developer" value="Approved payout, release date, payout state" />
            <BoundaryRow label="Admin" value="Full commercial relation, collection risk, margin policy" />
          </div>
        </div>
        <ActivityPanel activity={record.activity} />
      </section>
      <div className="flex flex-col-reverse gap-2 border-t border-[var(--glass-border)] pt-5 sm:flex-row sm:justify-end">
        <ActionButton danger icon={IconTrash} label="Archive" onClick={onArchive} />
        <ActionButton danger icon={IconAlertTriangle} label="Escalate" onClick={onEscalate} />
        <ActionButton icon={IconMessageCircle} label="Note" onClick={onNote} />
        <ActionButton icon={IconCheck} label="Advance" onClick={onAdvance} />
      </div>
    </div>
  );
}

function CreatePaymentModal({ onClose, onSubmit, open }: { onClose: () => void; onSubmit: (payload: { client: string; clientAmount: number; developer: string; developerPayout: number; project: string }) => void; open: boolean }) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  useModalLifecycle(open, onClose, firstInputRef);
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
    <ModalShell labelledBy="create-payment-title" onClose={onClose}>
      <form className="w-full max-w-4xl rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-6" onSubmit={submit}>
        <ModalHeader eyebrow="Invoice intake" id="create-payment-title" onClose={onClose} title="Create payment record" />
        <p className="mt-3 max-w-2xl text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">Create the client invoice and developer payout boundary as two separate downstream surfaces before the payment enters collections.</p>
        <div className="mt-6 grid gap-4 border-t border-[var(--glass-border)] pt-6 sm:grid-cols-2 lg:grid-cols-5">
          <FormInput ref={firstInputRef} label="Client" name="client" placeholder="Kijani Analytics" />
          <FormInput label="Project" name="project" placeholder="AI Support Workflow" />
          <FormInput label="Developer" name="developer" placeholder="Amina Otieno" />
          <FormInput label="Client bill" name="clientAmount" placeholder="2000" type="number" />
          <FormInput label="Developer payout" name="developerPayout" placeholder="80" type="number" />
        </div>
        <ModalActions onClose={onClose} submitLabel="Create invoice" />
      </form>
    </ModalShell>
  );
}

function PaymentNoteModal({ onClose, onSend, record }: { onClose: () => void; onSend: (record: PaymentRecord, message: string) => void; record: PaymentRecord | null }) {
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useModalLifecycle(Boolean(record), onClose, textareaRef);
  if (!record) return null;

  return (
    <ModalShell labelledBy="payment-note-title" onClose={onClose}>
      <form className="w-full max-w-2xl rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-6" onSubmit={(event) => { event.preventDefault(); onSend(record, draft || "Payment action recorded"); }}>
        <ModalHeader eyebrow="Payment note" id="payment-note-title" onClose={onClose} title={`Record action for ${record.invoiceId}`} />
        <label className="mt-6 block">
          <span className="text-[0.82rem] font-medium text-[var(--on-surface)]">Action note</span>
          <textarea ref={textareaRef} className="mt-2 min-h-36 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.9rem] leading-relaxed text-[var(--on-surface)] outline-none focus:border-[var(--primary)]" onChange={(event) => setDraft(event.target.value)} placeholder="Collection follow-up, payout release, settlement packet, or finance owner note..." value={draft} />
        </label>
        <ModalActions onClose={onClose} submitLabel="Save note" />
      </form>
    </ModalShell>
  );
}

function SectionHeader({ description, eyebrow, title }: { description: string; eyebrow: string; title: string }) {
return <div><p className="label-caps text-[var(--primary)]">{eyebrow}</p><h2 className="title-serif mt-3 text-[clamp(1.48rem,2vw,1.9rem)] font-medium text-[var(--on-surface)]">{title}</h2><p className="mt-2 max-w-3xl text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">{description}</p></div>;
}

function ChartPanel({ children, description, title, value }: { children: ReactNode; description: string; title: string; value: string }) {
  return <article className="min-w-0 rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] sm:p-5"><div className="flex min-h-[4.75rem] items-start justify-between gap-4"><div><h3 className="text-[1rem] font-medium text-[var(--on-surface)]">{title}</h3><p className="mt-1 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">{description}</p></div><span className="shrink-0 rounded-full border border-[var(--glass-border)] px-3 py-1.5 font-mono text-[0.72rem] text-[var(--on-surface)]">{value}</span></div><div className="mt-4">{children}</div></article>;
}

function SelectPill({ children, icon: Icon, label, onChange, value }: { children: ReactNode; icon: Icon; label: string; onChange: (value: string) => void; value: string }) {
  return <label className="relative"><span className="sr-only">{label}</span><Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]" size={15} stroke={1.7} /><select className="h-10 w-full cursor-pointer appearance-none rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-9 pr-8 text-[0.82rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]" onChange={(event) => onChange(event.target.value)} value={value}>{children}</select></label>;
}

function IconButton({ children, danger, label, onClick }: { children: ReactNode; danger?: boolean; label: string; onClick: () => void }) {
  return <button aria-label={label} className={cn("grid h-9 w-9 cursor-pointer place-items-center rounded-full border transition-colors duration-200", danger ? "border-[color-mix(in_srgb,var(--error)_30%,var(--glass-border))] text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]" : "border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:bg-[var(--glass-bg)] hover:text-[var(--on-surface)]")} onClick={onClick} type="button">{children}</button>;
}

function ActionButton({ danger, icon: Icon, label, onClick }: { danger?: boolean; icon: Icon; label: string; onClick?: () => void }) {
  return <button className={cn("inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border px-3 text-[0.82rem] font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45", danger ? "border-[color-mix(in_srgb,var(--error)_30%,var(--glass-border))] text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]" : "border-[var(--glass-border)] text-[var(--on-surface)] hover:bg-[var(--glass-bg)]")} disabled={!onClick} onClick={onClick} type="button"><Icon size={15} stroke={1.7} />{label}</button>;
}

function SignalCell({ label, value }: { label: string; value: string }) {
  return <div className="border-r border-[var(--glass-border)] px-3 py-3 last:border-r-0"><p className="text-[0.66rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">{label}</p><p className="mt-1 truncate font-mono text-[0.84rem] text-[var(--on-surface)]">{value}</p></div>;
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5"><p className="text-[0.66rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">{label}</p><p className="mt-1 truncate font-mono text-[0.82rem] text-[var(--on-surface)]">{value}</p></div>;
}

function BoundaryTile({ icon: Icon, label, value }: { icon: Icon; label: string; value: string }) {
  return <div className="border-t border-[var(--glass-border)] p-4 md:border-l md:border-t-0 first:md:border-l-0"><div className="flex items-center gap-2 text-[var(--on-surface)]"><Icon size={16} stroke={1.7} /><p className="text-[0.84rem] font-medium">{label}</p></div><p className="mt-2 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">{value}</p></div>;
}

function BoundaryRow({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3"><p className="text-[0.68rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">{label}</p><p className="mt-1 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">{value}</p></div>;
}

function ActivityPanel({ activity }: { activity: string[] }) {
  return <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4"><p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Payment activity</p><div className="mt-4 grid gap-3">{activity.map((item, index) => <div className="grid grid-cols-[1rem_minmax(0,1fr)] gap-3" key={`${item}-${index}`}><span className={cn("mt-1 h-2 w-2 rounded-full", index === 0 ? "bg-[var(--tertiary)]" : "bg-[var(--on-surface-dim)]")} /><p className="text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">{item}</p></div>)}</div></div>;
}

function PaymentRing({ size = 58, value }: { size?: number; value: number }) {
  const tone = value < 55 ? "var(--error)" : value > 82 ? "var(--tertiary)" : "var(--primary)";
  const background = `conic-gradient(${tone} ${value * 3.6}deg, color-mix(in srgb, var(--on-surface) 10%, transparent) 0deg)`;
  return <span className="grid shrink-0 place-items-center rounded-full" style={{ background, height: size, width: size }}><span className="grid h-[calc(100%-8px)] w-[calc(100%-8px)] place-items-center rounded-full bg-[var(--surface)] font-mono text-[0.76rem] text-[var(--on-surface)]">{value}</span></span>;
}

function ModalShell({ children, labelledBy, onClose }: { children: ReactNode; labelledBy: string; onClose: () => void }) {
  return <div aria-labelledby={labelledBy} aria-modal="true" className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-8 backdrop-blur-xl" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} role="dialog">{children}</div>;
}

function ModalHeader({ eyebrow, id, onClose, title }: { eyebrow: string; id: string; onClose: () => void; title: string }) {
  return <div className="flex items-start justify-between gap-4"><div><p className="label-caps text-[var(--primary)]">{eyebrow}</p><h2 id={id} className="title-serif mt-2 text-[1.25rem] font-medium text-[var(--on-surface)]">{title}</h2></div><button aria-label="Close modal" className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]" onClick={onClose} type="button"><IconX size={18} stroke={1.7} /></button></div>;
}

function ModalActions({ onClose, submitLabel }: { onClose: () => void; submitLabel: string }) {
  return <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)]" onClick={onClose} type="button">Cancel</button><button className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-5 text-[0.86rem] font-medium text-[var(--bg)]" type="submit">{submitLabel}</button></div>;
}

const FormInput = forwardRef<HTMLInputElement, { label: string; name: string; placeholder: string; type?: string }>(function FormInput({ label, name, placeholder, type = "text" }, ref) {
  return <label><span className="text-[0.78rem] font-medium text-[var(--on-surface)]">{label}</span><input ref={ref} className="mt-2 h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]" name={name} placeholder={placeholder} type={type} /></label>;
});

function EmptyState({ body, title }: { body: string; title: string }) {
  return <div className="rounded-[1.2rem] border border-dashed border-[var(--glass-border)] p-8 text-center lg:col-span-2"><p className="text-[0.98rem] font-medium text-[var(--on-surface)]">{title}</p><p className="mx-auto mt-2 max-w-md text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{body}</p></div>;
}

function useModalLifecycle<T extends HTMLElement>(open: boolean, onClose: () => void, ref: RefObject<T | null>) {
  useEffect(() => {
    if (!open) return;
    ref.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, open, ref]);
}

function buildPaymentStats(records: PaymentRecord[]) {
  const receivable = records.filter((record) => record.status !== "settled" && record.status !== "void").reduce((sum, record) => sum + record.clientAmount, 0);
  const payoutHold = records.filter((record) => record.payoutStatus === "blocked" || record.payoutStatus === "pending").reduce((sum, record) => sum + record.developerPayout, 0);
  const readyRecords = records.filter((record) => record.status === "paid" && record.payoutStatus === "approved");
  const collectionRecords = records.filter((record) => record.risk === "urgent" || record.status === "due");
  const settled = records.filter((record) => record.status === "settled").length;
  return {
    blockedPayouts: records.filter((record) => record.payoutStatus === "blocked").length,
    collectionCount: collectionRecords.length,
    overdueAmount: collectionRecords.reduce((sum, record) => sum + record.clientAmount, 0),
    payoutHold,
    readyToSettle: readyRecords.length,
    readyValue: readyRecords.reduce((sum, record) => sum + record.clientAmount, 0),
    receivable,
    settlementScore: records.length ? Math.round(((settled + readyRecords.length) / records.length) * 100) : 0,
    urgent: records.filter((record) => record.risk === "urgent").length,
  };
}

function getCollectionScore(record: PaymentRecord) {
  if (record.status === "settled") return 96;
  if (record.status === "paid") return 86;
  if (record.status === "due") return Math.max(24, 64 - record.agingDays * 2);
  if (record.status === "sent") return 72;
  if (record.status === "draft") return 48;
  return 20;
}

function riskPriority(risk: PaymentRisk) {
  return risk === "urgent" ? 3 : risk === "watch" ? 2 : 1;
}

function formatMoney(value: number) {
  if (!value) return "$0";
  if (value >= 1000) return `$${Math.round(value / 100) / 10}k`;
  return `$${value}`;
}
