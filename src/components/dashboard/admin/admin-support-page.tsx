"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBuilding,
  IconCheck,
  IconClock,
  IconEdit,
  IconFileText,
  IconFilter,
  IconMessageCircle,
  IconPlus,
  IconReceipt,
  IconSearch,
  IconShieldCheck,
  IconTrash,
  IconUserCheck,
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

type CaseStatus = "open" | "waiting" | "escalated" | "resolved";
type CasePriority = "low" | "normal" | "urgent";
type CaseSource = "client" | "developer" | "internal";

type SupportCase = {
  activity: string[];
  client: string;
  developer: string;
  id: string;
  lastReply: string;
  messages: Array<{ author: string; body: string; role: string; time: string }>;
  nextAction: string;
  owner: string;
  priority: CasePriority;
  project: string;
  resolutionNote: string;
  slaMinutes: number;
  source: CaseSource;
  status: CaseStatus;
  subject: string;
  topic: "billing" | "matching" | "project" | "profile" | "payout";
};

const statusOrder: CaseStatus[] = ["open", "waiting", "escalated", "resolved"];

const statusMeta: Record<
  CaseStatus,
  { label: string; next: CaseStatus | null; tone: "active" | "neutral" | "overdue" | "pending" }
> = {
  escalated: { label: "Escalated", next: "waiting", tone: "overdue" },
  open: { label: "Open", next: "waiting", tone: "pending" },
  resolved: { label: "Resolved", next: null, tone: "active" },
  waiting: { label: "Waiting", next: "resolved", tone: "neutral" },
};

const priorityMeta: Record<CasePriority, { label: string; tone: "active" | "overdue" | "pending" }> = {
  low: { label: "Low", tone: "active" },
  normal: { label: "Normal", tone: "pending" },
  urgent: { label: "Urgent", tone: "overdue" },
};

const supportSeed: SupportCase[] = [
  {
    activity: ["Client asked for intro-slot update", "Admin checked matching queue", "Amina confirmed availability"],
    client: "Kijani Analytics",
    developer: "Amina Otieno",
    id: "case-kijani-intro",
    lastReply: "12m ago",
    messages: [
      { author: "Maya", body: "Can we confirm intro windows before Friday?", role: "Client", time: "09:14" },
      { author: "Dennis", body: "Checking Amina and second AI profile availability now.", role: "Admin", time: "09:21" },
    ],
    nextAction: "Confirm intro windows and attach second AI profile",
    owner: "Dennis",
    priority: "urgent",
    project: "AI Support Workflow",
    resolutionNote: "Keep client confidence high while matching is active.",
    slaMinutes: 18,
    source: "client",
    status: "open",
    subject: "Intro windows before client review deadline",
    topic: "matching",
  },
  {
    activity: ["Developer requested scope clarification", "Payments brief reopened", "Client PM tagged for answer"],
    client: "SokoPay",
    developer: "Kwame Mensah",
    id: "case-kwame-scope",
    lastReply: "42m ago",
    messages: [
      { author: "Kwame", body: "I need reconciliation edge cases before estimating milestone two.", role: "Developer", time: "08:40" },
      { author: "Maya", body: "Client PM has been tagged. Hold implementation until scope is clear.", role: "Admin", time: "09:02" },
    ],
    nextAction: "Get client PM answer and update milestone scope",
    owner: "Maya",
    priority: "normal",
    project: "Payments Reconciliation",
    resolutionNote: "Protect margin by preventing unpaid scope drift.",
    slaMinutes: 74,
    source: "developer",
    status: "waiting",
    subject: "Milestone scope clarification",
    topic: "project",
  },
  {
    activity: ["Invoice overdue case escalated", "Finance note attached", "Developer payout held pending collection"],
    client: "Cloudify Inc",
    developer: "Fatima Al-Zahrawi",
    id: "case-cloudify-billing",
    lastReply: "2h ago",
    messages: [
      { author: "Finance", body: "Invoice is nine days overdue. Payout remains collection-gated.", role: "Admin", time: "10:12" },
      { author: "Fatima", body: "Please confirm when the payout will be released.", role: "Developer", time: "10:31" },
    ],
    nextAction: "Run collection follow-up and send payout status update",
    owner: "Finance",
    priority: "urgent",
    project: "Infrastructure Migration",
    resolutionNote: "Keep developer updated without exposing client commercial dispute detail.",
    slaMinutes: 146,
    source: "internal",
    status: "escalated",
    subject: "Overdue invoice and payout status",
    topic: "billing",
  },
  {
    activity: ["Profile visibility issue resolved", "Portfolio proof refreshed", "Developer notified"],
    client: "TradeHub",
    developer: "Sarah Kimani",
    id: "case-sarah-profile",
    lastReply: "Yesterday",
    messages: [
      { author: "Sarah", body: "My React Native proof is missing from the shortlist view.", role: "Developer", time: "Yesterday" },
      { author: "Talent ops", body: "Proof asset restored and profile is visible again.", role: "Admin", time: "Yesterday" },
    ],
    nextAction: "No action needed",
    owner: "Talent ops",
    priority: "low",
    project: "Mobile Commerce Shortlist",
    resolutionNote: "Resolved profile proof gap before client review.",
    slaMinutes: 0,
    source: "developer",
    status: "resolved",
    subject: "Profile proof missing from shortlist",
    topic: "profile",
  },
];

export function AdminSupportPage() {
  const [cases, setCases] = useState(supportSeed);
  const [selectedId, setSelectedId] = useState(supportSeed[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<CaseSource | "all">("all");
  const [drawerCase, setDrawerCase] = useState<SupportCase | null>(null);
  const [confirmCase, setConfirmCase] = useState<SupportCase | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCase, setEditCase] = useState<SupportCase | null>(null);
  const [replyCase, setReplyCase] = useState<SupportCase | null>(null);

  const selected = cases.find((item) => item.id === selectedId) ?? cases[0] ?? null;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return cases.filter((item) => {
      const haystack = `${item.subject} ${item.client} ${item.developer} ${item.project} ${item.owner} ${item.topic}`.toLowerCase();
      return (
        (!needle || haystack.includes(needle)) &&
        (statusFilter === "all" || item.status === statusFilter) &&
        (sourceFilter === "all" || item.source === sourceFilter)
      );
    });
  }, [cases, query, sourceFilter, statusFilter]);

  const stats = useMemo(() => buildSupportStats(cases), [cases]);

  const columns = useMemo<Array<OperationalTableColumn<SupportCase>>>(
    () => [
      {
        key: "subject",
        label: "Case",
        priority: true,
        render: (item) => (
          <div className="min-w-0">
            <p className="truncate text-[0.88rem] font-medium text-[var(--on-surface)]">{item.subject}</p>
            <p className="mt-1 truncate text-[0.74rem] text-[var(--on-surface-dim)]">{item.client} / {item.project}</p>
          </div>
        ),
      },
      { key: "status", label: "Status", render: (item) => <StatusBadge label={statusMeta[item.status].label} tone={statusMeta[item.status].tone} /> },
      { key: "priority", label: "Priority", render: (item) => <StatusBadge label={priorityMeta[item.priority].label} tone={priorityMeta[item.priority].tone} /> },
      { key: "source", label: "Source" },
      { key: "slaMinutes", label: "SLA", mono: true, render: (item) => `${item.slaMinutes}m` },
      { key: "owner", label: "Owner", hideOnMobile: true },
    ],
    [],
  );

  const advanceCase = (item: SupportCase) => {
    const next = statusMeta[item.status].next;
    if (!next) return;
    const updated: SupportCase = {
      ...item,
      activity: [`Moved to ${statusMeta[next].label}`, ...item.activity],
      status: next,
      slaMinutes: next === "resolved" ? 0 : item.slaMinutes,
    };
    setCases((current) => current.map((caseItem) => (caseItem.id === item.id ? updated : caseItem)));
    setSelectedId(updated.id);
    setDrawerCase((current) => (current?.id === item.id ? updated : current));
  };

  const createCase = (payload: { client: string; subject: string; source: CaseSource; topic: SupportCase["topic"] }) => {
    const created: SupportCase = {
      activity: ["Support case opened", "Resolver assigned", "First response pending"],
      client: payload.client,
      developer: "Unassigned",
      id: `case-${Date.now()}`,
      lastReply: "Now",
      messages: [{ author: "Admin", body: "Case opened from support resolver.", role: "Admin", time: "Now" }],
      nextAction: "Triage and send first response",
      owner: "Support",
      priority: "normal",
      project: "Unlinked",
      resolutionNote: "New case needs relationship context.",
      slaMinutes: 0,
      source: payload.source,
      status: "open",
      subject: payload.subject,
      topic: payload.topic,
    };
    setCases((current) => [created, ...current]);
    setSelectedId(created.id);
    setDrawerCase(created);
    setCreateOpen(false);
  };

  const sendReply = (item: SupportCase, message: string) => {
    const updated: SupportCase = {
      ...item,
      activity: [`Reply sent: ${message}`, ...item.activity],
      lastReply: "Now",
      messages: [...item.messages, { author: "Admin", body: message, role: "Admin", time: "Now" }],
      status: item.status === "open" ? "waiting" : item.status,
    };
    setCases((current) => current.map((caseItem) => (caseItem.id === item.id ? updated : caseItem)));
    setReplyCase(null);
  };

  const updateCase = (item: SupportCase, patch: Pick<SupportCase, "nextAction" | "owner" | "priority" | "resolutionNote">) => {
    const updated: SupportCase = {
      ...item,
      ...patch,
      activity: ["Resolver plan updated", ...item.activity],
      lastReply: "Now",
    };
    setCases((current) => current.map((caseItem) => (caseItem.id === item.id ? updated : caseItem)));
    setSelectedId(updated.id);
    setDrawerCase((current) => (current?.id === item.id ? updated : current));
    setEditCase(null);
  };

  const archiveCase = () => {
    if (!confirmCase) return;
    const next = cases.filter((item) => item.id !== confirmCase.id);
    setCases(next);
    if (selectedId === confirmCase.id) setSelectedId(next[0]?.id ?? "");
    setConfirmCase(null);
  };

  return (
    <div className="grid min-w-0 gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <DashboardPageHeader
        className="mb-0"
        title="Support resolver"
        description="Resolve client and developer issues with project, invoice, payout, profile, and placement context attached so Andishi stays accountable after matching."
        status={<StatusBadge label={`${stats.open} open`} tone="pending" />}
        actions={
          <>
            <button type="button" onClick={() => setStatusFilter("escalated")} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--error)_28%,var(--glass-border))] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]">
              <IconAlertTriangle size={16} stroke={1.7} />
              Escalations
              <span className="font-mono text-[0.76rem] text-[var(--error)]">{stats.escalated}</span>
            </button>
            <button type="button" onClick={() => setCreateOpen(true)} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)] shadow-[0_14px_30px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)]">
              <IconPlus size={16} stroke={1.8} />
              Open case
            </button>
          </>
        }
      />

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard chart="bar" data={[6, 8, 9, 12, stats.open]} icon={IconMessageCircle} label="Open cases" trend={`${stats.escalated} escalated`} value={String(stats.open)} />
        <KpiCard data={[42, 36, 28, 24, stats.medianResponse]} icon={IconClock} label="Median response" trend="Minutes to admin action" value={`${stats.medianResponse}m`} />
        <KpiCard chart="bar" data={[12, 18, 24, 29, stats.resolved]} icon={IconCheck} label="Resolved" trend="This operating cycle" value={String(stats.resolved)} />
        <KpiCard data={[3, 4, 3, 2, stats.billing]} icon={IconReceipt} label="Billing/payout" trend="Finance-linked issues" value={String(stats.billing)} />
      </section>

      <SectionDivider />

      <section className="grid min-w-0 gap-7 2xl:grid-cols-[minmax(0,1fr)_minmax(23rem,27rem)]">
        <SupportObservability cases={cases} />
        <SupportCommandPanel
          item={selected}
          onAdvance={selected ? () => advanceCase(selected) : undefined}
          onArchive={selected ? () => setConfirmCase(selected) : undefined}
          onEdit={selected ? () => setEditCase(selected) : undefined}
          onInspect={selected ? () => setDrawerCase(selected) : undefined}
          onReply={selected ? () => setReplyCase(selected) : undefined}
        />
      </section>

      <SectionDivider />

      <section className="grid gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <SectionHeader eyebrow="Resolver queue" title="Stakeholder support cases" description="Search, filter, reply, advance, and resolve support issues while preserving the correct client/developer/admin context." />
          <SupportToolbar query={query} setQuery={setQuery} setSourceFilter={setSourceFilter} setStatusFilter={setStatusFilter} sourceFilter={sourceFilter} statusFilter={statusFilter} />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((item) => (
            <SupportCaseCard
              item={item}
              key={item.id}
              selected={selected?.id === item.id}
              onAdvance={() => advanceCase(item)}
              onArchive={() => setConfirmCase(item)}
              onEdit={() => setEditCase(item)}
              onInspect={() => setDrawerCase(item)}
              onReply={() => setReplyCase(item)}
              onSelect={() => setSelectedId(item.id)}
            />
          ))}
          {!filtered.length && <EmptyState title="No support cases match" body="Clear filters or open a new resolver case." />}
        </div>
      </section>

      <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <ChartPanel title="Response trend" description="Median response movement for client and developer support." value={`${stats.medianResponse}m`}>
          <DashboardLineChart data={[41, 36, 31, 29, 25, stats.medianResponse]} height={300} labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Now"]} variant="area" />
        </ChartPanel>
        <ChartPanel title="Topic split" description="Case volume by resolver category." value={`${cases.length} cases`}>
          <DashboardDonutChart data={["billing", "matching", "project", "profile", "payout"].map((topic) => ({ label: topic, value: cases.filter((item) => item.topic === topic).length, tone: topic === "billing" || topic === "payout" ? "primary" as const : topic === "project" ? "secondary" as const : "muted" as const }))} height={210} />
        </ChartPanel>
      </section>

      <OperationalDataTable columns={columns} description="Cross-role support ledger for client, developer, project, billing, payout, and resolver ownership context." empty="No support cases match." onRowSelect={(item) => { setSelectedId(item.id); setDrawerCase(item); }} rows={filtered} title="Support resolver matrix" />

      <CreateSupportCaseModal onClose={() => setCreateOpen(false)} onSubmit={createCase} open={createOpen} />
      <EditSupportCaseModal item={editCase} onClose={() => setEditCase(null)} onSubmit={updateCase} />
      {replyCase && (
        <ReplyModal
          key={replyCase.id}
          item={replyCase}
          onClose={() => setReplyCase(null)}
          onReply={sendReply}
        />
      )}

      <EntityDrawer onClose={() => setDrawerCase(null)} open={Boolean(drawerCase)} title={drawerCase?.subject ?? "Support case"}>
        {drawerCase && <SupportDrawer item={drawerCase} onAdvance={() => advanceCase(drawerCase)} onArchive={() => setConfirmCase(drawerCase)} onEdit={() => setEditCase(drawerCase)} onReply={() => setReplyCase(drawerCase)} />}
      </EntityDrawer>

      <ConfirmDialog confirmLabel="Archive case" description={`This removes ${confirmCase?.subject ?? "this case"} from the active resolver queue while preserving future audit trail shape.`} onCancel={() => setConfirmCase(null)} onConfirm={archiveCase} open={Boolean(confirmCase)} title="Archive support case?" />
    </div>
  );
}

function SupportObservability({ cases }: { cases: SupportCase[] }) {
  const stageCounts = statusOrder.map((status) => cases.filter((item) => item.status === status).length);
  return (
    <div className="min-w-0">
      <SectionHeader eyebrow="Support intelligence" title="Promise protection map" description="Support is where Andishi protects the 48-hour match, onboarding, guarantee, finance, and post-placement promises from the public product." />
      <div className="mt-6 grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-h-[27rem] rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] sm:p-5">
          <DashboardBarChart data={stageCounts} height={330} labels={statusOrder.map((status) => statusMeta[status].label)} />
        </div>
        <div className="grid gap-3 md:grid-cols-3 2xl:grid-cols-1">
          <ContextTile icon={IconBuilding} label="Client-safe" value="Briefs, invoices, milestones" />
          <ContextTile icon={IconUserCheck} label="Developer-safe" value="Projects, profile, payout" />
          <ContextTile icon={IconShieldCheck} label="Admin-only" value="Margin, escalation, audit" />
        </div>
      </div>
    </div>
  );
}

function SupportToolbar({
  query,
  setQuery,
  setSourceFilter,
  setStatusFilter,
  sourceFilter,
  statusFilter,
}: {
  query: string;
  setQuery: (value: string) => void;
  setSourceFilter: (value: CaseSource | "all") => void;
  setStatusFilter: (value: CaseStatus | "all") => void;
  sourceFilter: CaseSource | "all";
  statusFilter: CaseStatus | "all";
}) {
  return (
    <div className="grid w-full gap-3 xl:w-auto xl:min-w-[40rem]">
      <label className="relative min-w-0">
        <span className="sr-only">Search support cases</span>
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]" size={16} stroke={1.7} />
        <input className="h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-10 pr-4 text-[0.9rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]" onChange={(event) => setQuery(event.target.value)} placeholder="Search cases, clients, developers, projects..." value={query} />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        <SelectPill icon={IconFilter} label="Status" value={statusFilter} onChange={(value) => setStatusFilter(value as CaseStatus | "all")}>
          <option value="all">All statuses</option>
          {statusOrder.map((status) => <option key={status} value={status}>{statusMeta[status].label}</option>)}
        </SelectPill>
        <SelectPill icon={IconUsers} label="Source" value={sourceFilter} onChange={(value) => setSourceFilter(value as CaseSource | "all")}>
          <option value="all">All sources</option>
          <option value="client">Client</option>
          <option value="developer">Developer</option>
          <option value="internal">Internal</option>
        </SelectPill>
      </div>
    </div>
  );
}

function SupportCaseCard({
  item,
  onAdvance,
  onArchive,
  onEdit,
  onInspect,
  onReply,
  onSelect,
  selected,
}: {
  item: SupportCase;
  onAdvance: () => void;
  onArchive: () => void;
  onEdit: () => void;
  onInspect: () => void;
  onReply: () => void;
  onSelect: () => void;
  selected: boolean;
}) {
  return (
    <article className={cn("min-w-0 overflow-hidden rounded-[1.35rem] border transition-all duration-200", selected ? "border-[color-mix(in_srgb,var(--primary)_38%,var(--glass-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_7%,var(--surface)),var(--surface))] shadow-[0_18px_50px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]" : item.status === "escalated" ? "border-[color-mix(in_srgb,var(--error)_34%,var(--glass-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--error)_6%,var(--surface)),var(--surface))]" : "border-[var(--glass-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-high)_24%,var(--surface)),var(--surface))]")}>
      <button className="block w-full cursor-pointer p-5 text-left sm:p-6" onClick={onSelect} type="button">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-words text-[1rem] font-medium text-[var(--on-surface)]">{item.subject}</h3>
          <StatusBadge label={statusMeta[item.status].label} tone={statusMeta[item.status].tone} />
          <StatusBadge label={priorityMeta[item.priority].label} tone={priorityMeta[item.priority].tone} />
        </div>
        <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{item.client} / {item.developer} / {item.project}</p>
        <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]">
          <SignalCell label="SLA" value={`${item.slaMinutes}m`} />
          <SignalCell label="Source" value={item.source} />
          <SignalCell label="Topic" value={item.topic} />
        </div>
        <p className="mt-5 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">{item.nextAction}</p>
      </button>
      <div className="flex flex-col gap-3 border-t border-[var(--glass-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <span className="truncate text-[0.82rem] text-[var(--on-surface-dim)]">Owner: {item.owner} / Last reply {item.lastReply}</span>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <IconButton label="Reply" onClick={onReply}><IconMessageCircle size={16} stroke={1.8} /></IconButton>
          <IconButton label="Edit" onClick={onEdit}><IconEdit size={16} stroke={1.8} /></IconButton>
          <IconButton label="Inspect" onClick={onInspect}><IconArrowRight size={16} stroke={1.8} /></IconButton>
          <IconButton label="Advance" onClick={onAdvance}><IconCheck size={16} stroke={1.8} /></IconButton>
          <IconButton danger label="Archive" onClick={onArchive}><IconTrash size={16} stroke={1.8} /></IconButton>
        </div>
      </div>
    </article>
  );
}

function SupportCommandPanel({ item, onAdvance, onArchive, onEdit, onInspect, onReply }: { item: SupportCase | null; onAdvance?: () => void; onArchive?: () => void; onEdit?: () => void; onInspect?: () => void; onReply?: () => void }) {
  if (!item) return <EmptyState title="Select a case" body="Pick a support case to inspect resolver context." />;
  return (
    <aside className="2xl:sticky 2xl:top-28 2xl:self-start">
      <div className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)] sm:p-6">
        <StatusBadge label={statusMeta[item.status].label} tone={statusMeta[item.status].tone} />
        <h2 className="title-serif mt-3 text-[1.15rem] font-medium text-[var(--on-surface)]">{item.subject}</h2>
        <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{item.nextAction}</p>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <InfoTile label="Client" value={item.client} />
          <InfoTile label="Developer" value={item.developer} />
          <InfoTile label="Project" value={item.project} />
          <InfoTile label="SLA" value={`${item.slaMinutes}m`} />
        </div>
        <div className="mt-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
          <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Resolution note</p>
          <p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">{item.resolutionNote}</p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <ActionButton icon={IconMessageCircle} label="Reply" onClick={onReply} />
          <ActionButton icon={IconEdit} label="Edit" onClick={onEdit} />
          <ActionButton icon={IconFileText} label="Inspect" onClick={onInspect} />
          <ActionButton icon={IconCheck} label="Advance" onClick={onAdvance} />
          <ActionButton danger icon={IconTrash} label="Archive" onClick={onArchive} />
        </div>
      </div>
    </aside>
  );
}

function SupportDrawer({ item, onAdvance, onArchive, onEdit, onReply }: { item: SupportCase; onAdvance: () => void; onArchive: () => void; onEdit: () => void; onReply: () => void }) {
  return (
    <div className="grid gap-6">
      <section>
        <StatusBadge label={statusMeta[item.status].label} tone={statusMeta[item.status].tone} />
        <h3 className="mt-3 text-[1.35rem] font-medium text-[var(--on-surface)]">{item.subject}</h3>
        <p className="mt-2 text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">{item.client} / {item.developer} / {item.project}</p>
      </section>
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4">
          <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Thread</p>
          <div className="mt-4 grid gap-3">
            {item.messages.map((message, index) => (
              <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3" key={`${message.time}-${index}`}>
                <div className="flex justify-between gap-3 text-[0.72rem] text-[var(--on-surface-dim)]"><span>{message.author} / {message.role}</span><span>{message.time}</span></div>
                <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface)]">{message.body}</p>
              </div>
            ))}
          </div>
        </div>
        <ActivityPanel activity={item.activity} />
      </section>
      <div className="flex flex-col-reverse gap-2 border-t border-[var(--glass-border)] pt-5 sm:flex-row sm:justify-end">
        <ActionButton danger icon={IconTrash} label="Archive" onClick={onArchive} />
        <ActionButton icon={IconEdit} label="Edit" onClick={onEdit} />
        <ActionButton icon={IconMessageCircle} label="Reply" onClick={onReply} />
        <ActionButton icon={IconCheck} label="Advance" onClick={onAdvance} />
      </div>
    </div>
  );
}

function CreateSupportCaseModal({ onClose, onSubmit, open }: { onClose: () => void; onSubmit: (payload: { client: string; subject: string; source: CaseSource; topic: SupportCase["topic"] }) => void; open: boolean }) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  useModalLifecycle(open, onClose, firstInputRef);
  if (!open) return null;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({ client: String(form.get("client") || "Client"), subject: String(form.get("subject") || "Support case"), source: String(form.get("source") || "client") as CaseSource, topic: String(form.get("topic") || "project") as SupportCase["topic"] });
  };
  return (
    <ModalShell labelledBy="create-support-title" onClose={onClose}>
      <form className="w-full max-w-3xl rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-6" onSubmit={submit}>
        <ModalHeader eyebrow="Resolver intake" id="create-support-title" onClose={onClose} title="Open support case" />
        <div className="mt-6 grid gap-4 border-t border-[var(--glass-border)] pt-6 sm:grid-cols-2">
          <FormInput ref={firstInputRef} label="Subject" name="subject" placeholder="Invoice or intro issue" />
          <FormInput label="Client" name="client" placeholder="Kijani Analytics" />
          <SelectField label="Source" name="source" options={["client", "developer", "internal"]} />
          <SelectField label="Topic" name="topic" options={["billing", "matching", "project", "profile", "payout"]} />
        </div>
        <ModalActions onClose={onClose} submitLabel="Open case" />
      </form>
    </ModalShell>
  );
}

function EditSupportCaseModal({
  item,
  onClose,
  onSubmit,
}: {
  item: SupportCase | null;
  onClose: () => void;
  onSubmit: (item: SupportCase, patch: Pick<SupportCase, "nextAction" | "owner" | "priority" | "resolutionNote">) => void;
}) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  useModalLifecycle(Boolean(item), onClose, firstInputRef);
  if (!item) return null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit(item, {
      nextAction: String(form.get("nextAction") || item.nextAction),
      owner: String(form.get("owner") || item.owner),
      priority: String(form.get("priority") || item.priority) as CasePriority,
      resolutionNote: String(form.get("resolutionNote") || item.resolutionNote),
    });
  };

  return (
    <ModalShell labelledBy="edit-support-title" onClose={onClose}>
      <form className="w-full max-w-3xl rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-6" onSubmit={submit}>
        <ModalHeader eyebrow="Resolver plan" id="edit-support-title" onClose={onClose} title={`Edit ${item.subject}`} />
        <div className="mt-6 grid gap-4 border-t border-[var(--glass-border)] pt-6 sm:grid-cols-2">
          <FormInput ref={firstInputRef} label="Owner" name="owner" placeholder={item.owner} />
          <SelectField label="Priority" name="priority" options={["low", "normal", "urgent"]} />
          <label className="sm:col-span-2">
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">Next action</span>
            <textarea className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]" defaultValue={item.nextAction} name="nextAction" />
          </label>
          <label className="sm:col-span-2">
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">Resolution policy</span>
            <textarea className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]" defaultValue={item.resolutionNote} name="resolutionNote" />
          </label>
        </div>
        <ModalActions onClose={onClose} submitLabel="Update case" />
      </form>
    </ModalShell>
  );
}

function ReplyModal({ item, onClose, onReply }: { item: SupportCase | null; onClose: () => void; onReply: (item: SupportCase, message: string) => void }) {
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useModalLifecycle(Boolean(item), onClose, textareaRef);
  if (!item) return null;
  return (
    <ModalShell labelledBy="reply-case-title" onClose={onClose}>
      <form className="w-full max-w-2xl rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-6" onSubmit={(event) => { event.preventDefault(); onReply(item, draft || "Support update sent"); }}>
        <ModalHeader eyebrow="Stakeholder reply" id="reply-case-title" onClose={onClose} title={`Reply to ${item.subject}`} />
        <label className="mt-6 block">
          <span className="text-[0.82rem] font-medium text-[var(--on-surface)]">Message</span>
          <textarea ref={textareaRef} className="mt-2 min-h-36 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.9rem] leading-relaxed text-[var(--on-surface)] outline-none focus:border-[var(--primary)]" onChange={(event) => setDraft(event.target.value)} value={draft} />
        </label>
        <ModalActions onClose={onClose} submitLabel="Send reply" />
      </form>
    </ModalShell>
  );
}

function buildSupportStats(cases: SupportCase[]) {
  const open = cases.filter((item) => item.status !== "resolved").length;
  const activeCases = cases.filter((item) => item.status !== "resolved");
  return {
    billing: cases.filter((item) => item.topic === "billing" || item.topic === "payout").length,
    escalated: cases.filter((item) => item.status === "escalated").length,
    medianResponse: activeCases.length ? Math.round(activeCases.reduce((sum, item) => sum + item.slaMinutes, 0) / activeCases.length) : 0,
    open,
    resolved: cases.filter((item) => item.status === "resolved").length,
  };
}

function ContextTile({ icon: Icon, label, value }: { icon: Icon; label: string; value: string }) {
  return <article className="rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4"><Icon className="text-[var(--primary)]" size={19} stroke={1.7} /><p className="mt-3 text-[0.9rem] font-medium text-[var(--on-surface)]">{label}</p><p className="mt-2 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">{value}</p></article>;
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

function ActivityPanel({ activity }: { activity: string[] }) {
  return <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4"><p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Activity</p><div className="mt-4 grid gap-3">{activity.map((item, index) => <div className="grid grid-cols-[1rem_minmax(0,1fr)] gap-3" key={`${item}-${index}`}><span className={cn("mt-1 h-2 w-2 rounded-full", index === 0 ? "bg-[var(--tertiary)]" : "bg-[var(--on-surface-dim)]")} /><p className="text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">{item}</p></div>)}</div></div>;
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

const FormInput = forwardRef<HTMLInputElement, { label: string; name: string; placeholder: string }>(function FormInput({ label, name, placeholder }, ref) {
  return <label><span className="text-[0.78rem] font-medium text-[var(--on-surface)]">{label}</span><input ref={ref} className="mt-2 h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]" name={name} placeholder={placeholder} /></label>;
});

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return <label><span className="text-[0.78rem] font-medium text-[var(--on-surface)]">{label}</span><select className="mt-2 h-11 w-full cursor-pointer rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]" name={name}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return <div className="rounded-[1.2rem] border border-dashed border-[var(--glass-border)] p-8 text-center lg:col-span-2"><p className="text-[0.98rem] font-medium text-[var(--on-surface)]">{title}</p><p className="mx-auto mt-2 max-w-md text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{body}</p></div>;
}

function useModalLifecycle<T extends HTMLElement>(open: boolean, onClose: () => void, ref: React.RefObject<T | null>) {
  useEffect(() => {
    if (!open) return;
    ref.current?.focus();
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
  }, [onClose, open, ref]);
}
