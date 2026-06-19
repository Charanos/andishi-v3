"use client";

import { forwardRef, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  IconArchive,
  IconBell,
  IconBellRinging,
  IconCheck,
  IconClock,
  IconEye,
  IconFilter,
  IconMail,
  IconPlus,
  IconSearch,
  IconSend,
  IconShieldCheck,
  IconTrash,
  IconWebhook,
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

type AlertStatus = "unread" | "acknowledged" | "snoozed" | "resolved";
type AlertPriority = "critical" | "high" | "normal";
type AlertChannel = "in_app" | "email" | "slack" | "webhook";
type AlertSurface = "briefs" | "payments" | "support" | "security" | "audit";

type AdminAlert = {
  activity: string[];
  channel: AlertChannel;
  createdAt: string;
  entity: string;
  id: string;
  message: string;
  nextAction: string;
  owner: string;
  priority: AlertPriority;
  routingRule: string;
  status: AlertStatus;
  surface: AlertSurface;
  title: string;
};

const statusMeta: Record<AlertStatus, { label: string; next: AlertStatus | null; tone: "active" | "neutral" | "overdue" | "pending" }> = {
  acknowledged: { label: "Acknowledged", next: "resolved", tone: "pending" },
  resolved: { label: "Resolved", next: null, tone: "active" },
  snoozed: { label: "Snoozed", next: "acknowledged", tone: "neutral" },
  unread: { label: "Unread", next: "acknowledged", tone: "overdue" },
};

const priorityMeta: Record<AlertPriority, { label: string; tone: "active" | "overdue" | "pending" }> = {
  critical: { label: "Critical", tone: "overdue" },
  high: { label: "High", tone: "pending" },
  normal: { label: "Normal", tone: "active" },
};

const surfaceLabel: Record<AlertSurface, string> = {
  audit: "Audit",
  briefs: "Briefs",
  payments: "Payments",
  security: "Security",
  support: "Support",
};

const channelLabel: Record<AlertChannel, string> = {
  email: "Email",
  in_app: "In-app",
  slack: "Slack",
  webhook: "Webhook",
};

const alertsSeed: AdminAlert[] = [
  {
    activity: ["Client brief submitted", "SLA timer started", "Dennis assigned"],
    channel: "in_app",
    createdAt: "Now",
    entity: "Kijani Analytics / AI Support Workflow",
    id: "alert-brief-kijani",
    message: "New high-value AI brief needs commercial review before matching starts.",
    nextAction: "Review budget, timeline, and shortlist readiness.",
    owner: "Dennis",
    priority: "critical",
    routingRule: "Admin brief SLA and high-value demand",
    status: "unread",
    surface: "briefs",
    title: "High-value brief awaiting review",
  },
  {
    activity: ["Invoice aged 9d", "Developer payout held", "Collection note drafted"],
    channel: "email",
    createdAt: "42m ago",
    entity: "Cloudify Inc / Infrastructure Migration",
    id: "alert-payment-cloudify",
    message: "Collection risk is now blocking developer payout release.",
    nextAction: "Send collection follow-up and update developer payout status.",
    owner: "Finance",
    priority: "critical",
    routingRule: "Payment collection and payout boundary",
    status: "unread",
    surface: "payments",
    title: "Collection-gated payout alert",
  },
  {
    activity: ["Role change requested", "Finance access included", "MFA active"],
    channel: "slack",
    createdAt: "2h ago",
    entity: "Brian Ouma / Staff access",
    id: "alert-role-brian",
    message: "Staff role escalation includes finance visibility and needs admin confirmation.",
    nextAction: "Confirm least-privilege role and log reason.",
    owner: "Maya",
    priority: "high",
    routingRule: "Identity governance review",
    status: "acknowledged",
    surface: "security",
    title: "Finance access review",
  },
  {
    activity: ["Client asked for intro windows", "Amina confirmed availability", "Second profile pending"],
    channel: "in_app",
    createdAt: "Yesterday",
    entity: "Kijani Analytics / Matching support",
    id: "alert-support-kijani",
    message: "Support case needs intro-window confirmation before Friday.",
    nextAction: "Attach second AI profile and message client.",
    owner: "Support",
    priority: "high",
    routingRule: "Support SLA and matching escalation",
    status: "snoozed",
    surface: "support",
    title: "Intro-window support follow-up",
  },
  {
    activity: ["Weekly export generated", "Commercial boundary checked", "Evidence packet ready"],
    channel: "webhook",
    createdAt: "Yesterday",
    entity: "Audit reports / Weekly governance",
    id: "alert-audit-weekly",
    message: "Weekly governance export is ready for review.",
    nextAction: "Download evidence packet and clear exceptions.",
    owner: "Dennis",
    priority: "normal",
    routingRule: "Governance export schedule",
    status: "resolved",
    surface: "audit",
    title: "Audit export ready",
  },
];

export function AdminNotificationsPage() {
  const [alerts, setAlerts] = useState(alertsSeed);
  const [selectedId, setSelectedId] = useState(alertsSeed[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [surfaceFilter, setSurfaceFilter] = useState<AlertSurface | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "all">("all");
  const [drawerAlert, setDrawerAlert] = useState<AdminAlert | null>(null);
  const [confirmAlert, setConfirmAlert] = useState<AdminAlert | null>(null);
  const [ruleOpen, setRuleOpen] = useState(false);

  const selected = alerts.find((alert) => alert.id === selectedId) ?? alerts[0] ?? null;
  const stats = useMemo(() => buildNotificationStats(alerts), [alerts]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return alerts
      .filter((alert) => {
        const haystack = `${alert.title} ${alert.message} ${alert.entity} ${alert.owner} ${alert.routingRule}`.toLowerCase();
        return (!needle || haystack.includes(needle)) && (surfaceFilter === "all" || alert.surface === surfaceFilter) && (statusFilter === "all" || alert.status === statusFilter);
      })
      .sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority));
  }, [alerts, query, statusFilter, surfaceFilter]);

  const columns = useMemo<Array<OperationalTableColumn<AdminAlert>>>(
    () => [
      { key: "title", label: "Alert", priority: true, render: (alert) => <div><p className="text-[var(--on-surface)]">{alert.title}</p><p className="mt-1 text-[0.72rem] text-[var(--on-surface-dim)]">{alert.entity}</p></div> },
      { key: "surface", label: "Surface", render: (alert) => surfaceLabel[alert.surface] },
      { key: "status", label: "State", render: (alert) => <StatusBadge label={statusMeta[alert.status].label} tone={statusMeta[alert.status].tone} /> },
      { key: "priority", label: "Priority", render: (alert) => <StatusBadge label={priorityMeta[alert.priority].label} tone={priorityMeta[alert.priority].tone} /> },
      { key: "owner", label: "Owner", hideOnMobile: true },
      { key: "createdAt", label: "Created", mono: true, hideOnMobile: true },
    ],
    [],
  );

  const updateAlert = (alert: AdminAlert) => {
    setAlerts((current) => current.map((entry) => entry.id === alert.id ? alert : entry));
    setSelectedId(alert.id);
    setDrawerAlert((current) => current?.id === alert.id ? alert : current);
  };

  const advanceAlert = (alert: AdminAlert) => {
    const next = statusMeta[alert.status].next;
    if (!next) return;
    updateAlert({ ...alert, status: next, activity: [`Moved to ${statusMeta[next].label}`, ...alert.activity] });
  };

  const sendTest = (alert: AdminAlert) => {
    updateAlert({ ...alert, activity: [`Test delivery sent through ${channelLabel[alert.channel]}`, ...alert.activity] });
  };

  const archiveAlert = () => {
    if (!confirmAlert) return;
    const next = alerts.filter((alert) => alert.id !== confirmAlert.id);
    setAlerts(next);
    setSelectedId(next[0]?.id ?? "");
    setDrawerAlert((current) => current?.id === confirmAlert.id ? null : current);
    setConfirmAlert(null);
  };

  return (
    <div className="grid min-w-0 gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <DashboardPageHeader
        className="mb-0"
        title="Notification center"
        description="Route admin signals across briefs, payments, support, audit, and security with owner, priority, delivery channel, and next action visible before escalation."
        status={<StatusBadge label={`${stats.unread} unread`} tone={stats.unread ? "overdue" : "active"} />}
        actions={
          <>
            <button type="button" onClick={() => setAlerts((current) => current.map((alert) => ({ ...alert, status: alert.status === "unread" ? "acknowledged" : alert.status })))} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]">
              <IconCheck size={15} stroke={1.8} />
              Acknowledge all
            </button>
            <button type="button" onClick={() => setRuleOpen(true)} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)]">
              <IconPlus size={15} stroke={1.8} />
              Routing rule
            </button>
          </>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard chart="bar" data={[2, 3, 4, 4, stats.unread]} icon={IconBellRinging} label="Unread alerts" trend={`${stats.critical} critical`} value={String(stats.unread)} />
        <KpiCard data={[61, 68, 74, 80, stats.deliveryScore]} icon={IconSend} label="Delivery health" trend="Channel routing readiness" value={`${stats.deliveryScore}%`} />
        <KpiCard chart="bar" data={stats.surfaceCounts} icon={IconShieldCheck} label="Surfaces covered" trend={`${stats.surfaceCoverage}/5 monitored`} value={String(stats.surfaceCoverage)} />
        <KpiCard data={[8, 7, 5, 4, stats.pending]} icon={IconClock} label="Pending action" trend="Awaiting owner movement" value={String(stats.pending)} />
      </section>

      <section className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)]">
        <NotificationCommandPanel alert={selected} onAdvance={selected ? () => advanceAlert(selected) : undefined} onArchive={selected ? () => setConfirmAlert(selected) : undefined} onInspect={selected ? () => setDrawerAlert(selected) : undefined} onSendTest={selected ? () => sendTest(selected) : undefined} />
        <NotificationRoutingPanel alerts={alerts} stats={stats} />
      </section>

      <SectionDivider />

      <section className="grid min-w-0 gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <SectionHeader eyebrow="Alert queue" title="Signal inbox" description="Filter by surface and state, then acknowledge, test delivery, inspect, or archive each operational alert." />
          <NotificationToolbar query={query} setQuery={setQuery} setStatusFilter={setStatusFilter} setSurfaceFilter={setSurfaceFilter} statusFilter={statusFilter} surfaceFilter={surfaceFilter} />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((alert) => (
            <NotificationCard key={alert.id} alert={alert} selected={selected?.id === alert.id} onAdvance={() => advanceAlert(alert)} onArchive={() => setConfirmAlert(alert)} onInspect={() => setDrawerAlert(alert)} onSelect={() => setSelectedId(alert.id)} onSendTest={() => sendTest(alert)} />
          ))}
          {!filtered.length && <EmptyState title="No alerts match this view" body="Clear search or filters to return to the full notification queue." />}
        </div>
      </section>

      <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <ChartPanel title="Notification pressure" description="Unread, acknowledged, snoozed, and resolved movement across the current admin cycle." value={`${stats.deliveryScore}%`}>
          <DashboardLineChart data={[42, 48, 51, 57, 63, stats.deliveryScore]} height={300} labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Now"]} variant="area" />
        </ChartPanel>
        <ChartPanel title="Channel mix" description="Current routing distribution by delivery channel." value={`${alerts.length} alerts`}>
          <DashboardDonutChart data={(Object.keys(channelLabel) as AlertChannel[]).map((channel) => ({ label: channelLabel[channel], value: alerts.filter((alert) => alert.channel === channel).length, tone: channel === "in_app" ? "secondary" as const : channel === "email" ? "primary" as const : channel === "slack" ? "success" as const : "muted" as const }))} height={210} />
        </ChartPanel>
      </section>

      <OperationalDataTable columns={columns} description="Structured notification matrix for alert state, priority, owner, delivery channel, and affected operating surface." empty="No notifications match the active filters." onRowSelect={(alert) => { setSelectedId(alert.id); setDrawerAlert(alert); }} rows={filtered} title="Notification ledger" />

      <EntityDrawer onClose={() => setDrawerAlert(null)} open={Boolean(drawerAlert)} title={drawerAlert?.title ?? "Notification detail"}>
        {drawerAlert && <NotificationDrawer alert={drawerAlert} onAdvance={() => advanceAlert(drawerAlert)} onArchive={() => setConfirmAlert(drawerAlert)} onSendTest={() => sendTest(drawerAlert)} />}
      </EntityDrawer>

      <RoutingRuleModal onClose={() => setRuleOpen(false)} open={ruleOpen} onCreate={(alert) => { setAlerts((current) => [alert, ...current]); setSelectedId(alert.id); setRuleOpen(false); }} />

      <ConfirmDialog cancelLabel="Keep alert" confirmLabel="Archive alert" description={`Archive ${confirmAlert?.title ?? "this alert"} from the active notification center.`} onCancel={() => setConfirmAlert(null)} onConfirm={archiveAlert} open={Boolean(confirmAlert)} title="Archive notification?" />
    </div>
  );
}

function NotificationCommandPanel({ alert, onAdvance, onArchive, onInspect, onSendTest }: { alert: AdminAlert | null; onAdvance?: () => void; onArchive?: () => void; onInspect?: () => void; onSendTest?: () => void }) {
  if (!alert) return <EmptyState title="No alert selected" body="Select an alert to open notification command." />;
  const next = statusMeta[alert.status].next;
  return (
    <section className="overflow-hidden rounded-[1.6rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_22%,var(--surface)),var(--surface))] shadow-[0_22px_70px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <div className="flex flex-wrap gap-2"><StatusBadge label={statusMeta[alert.status].label} tone={statusMeta[alert.status].tone} /><StatusBadge label={priorityMeta[alert.priority].label} tone={priorityMeta[alert.priority].tone} /></div>
          <p className="mt-5 label-caps text-[var(--primary)]">Notification command</p>
          <h2 className="title-serif mt-3 text-[1.45rem] font-medium leading-tight text-[var(--on-surface)]">{alert.title}</h2>
          <p className="mt-3 text-[0.96rem] leading-relaxed text-[var(--on-surface-dim)]">{alert.message}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3"><InfoTile label="Surface" value={surfaceLabel[alert.surface]} /><InfoTile label="Channel" value={channelLabel[alert.channel]} /><InfoTile label="Owner" value={alert.owner} /></div>
        </div>
        <aside className="rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
          <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Next action</p>
          <p className="mt-3 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{alert.nextAction}</p>
          <div className="mt-5 flex flex-wrap gap-2"><ActionButton icon={IconEye} onClick={onInspect}>Inspect</ActionButton><ActionButton icon={IconSend} onClick={onSendTest}>Test</ActionButton>{next && <ActionButton icon={IconCheck} onClick={onAdvance}>{statusMeta[next].label}</ActionButton>}<ActionButton danger icon={IconArchive} onClick={onArchive}>Archive</ActionButton></div>
        </aside>
      </div>
    </section>
  );
}

function NotificationRoutingPanel({ alerts, stats }: { alerts: AdminAlert[]; stats: ReturnType<typeof buildNotificationStats> }) {
  return (
    <aside className="rounded-[1.6rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_7%,transparent)] sm:p-6">
      <SectionHeader eyebrow="Routing health" title="Delivery controls" description="Admin alerts should reach the right owner without exposing client revenue, developer payout, or security detail to the wrong surface." />
      <div className="mt-5 grid gap-3">
        <ContextTile icon={IconBell} label="Unread" value={`${stats.unread} live`} />
        <ContextTile icon={IconMail} label="Email" value={`${alerts.filter((alert) => alert.channel === "email").length} routed`} />
        <ContextTile icon={IconWebhook} label="Webhook" value={`${alerts.filter((alert) => alert.channel === "webhook").length} routed`} />
      </div>
      <div className="mt-5"><DashboardBarChart data={stats.surfaceCounts} height={180} labels={(Object.keys(surfaceLabel) as AlertSurface[]).map((surface) => surfaceLabel[surface])} /></div>
    </aside>
  );
}

function NotificationCard({ alert, selected, onAdvance, onArchive, onInspect, onSelect, onSendTest }: { alert: AdminAlert; selected: boolean; onAdvance: () => void; onArchive: () => void; onInspect: () => void; onSelect: () => void; onSendTest: () => void }) {
  const next = statusMeta[alert.status].next;
  return (
    <article className={cn("rounded-[1.35rem] border p-4 transition-colors duration-200 sm:p-5", selected ? "border-[color-mix(in_srgb,var(--primary)_38%,var(--glass-border))] bg-[color-mix(in_srgb,var(--primary)_7%,transparent)]" : "border-[var(--glass-border)] bg-[var(--surface)] hover:border-[color-mix(in_srgb,var(--primary)_24%,var(--glass-border))]")}>
      <button type="button" onClick={onSelect} className="w-full cursor-pointer text-left">
        <div className="flex flex-wrap gap-2"><StatusBadge label={statusMeta[alert.status].label} tone={statusMeta[alert.status].tone} /><StatusBadge label={priorityMeta[alert.priority].label} tone={priorityMeta[alert.priority].tone} /><span className="rounded-full border border-[var(--glass-border)] px-2.5 py-1 font-mono text-[0.68rem] text-[var(--on-surface-dim)]">{channelLabel[alert.channel]}</span></div>
        <h2 className="title-serif mt-3 text-[1rem] font-medium text-[var(--on-surface)]">{alert.title}</h2>
        <p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">{alert.message}</p>
      </button>
      <div className="mt-4 grid gap-2 sm:grid-cols-2"><InfoTile label="Entity" value={alert.entity} /><InfoTile label="Owner" value={alert.owner} /></div>
      <div className="mt-4 flex flex-wrap gap-2"><ActionButton icon={IconEye} onClick={onInspect}>Inspect</ActionButton><ActionButton icon={IconSend} onClick={onSendTest}>Test</ActionButton>{next && <ActionButton icon={IconCheck} onClick={onAdvance}>{statusMeta[next].label}</ActionButton>}<ActionButton danger icon={IconTrash} onClick={onArchive}>Archive</ActionButton></div>
    </article>
  );
}

function NotificationDrawer({ alert, onAdvance, onArchive, onSendTest }: { alert: AdminAlert; onAdvance: () => void; onArchive: () => void; onSendTest: () => void }) {
  return (
    <div className="grid gap-5">
      <section className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div><div className="flex flex-wrap gap-2"><StatusBadge label={statusMeta[alert.status].label} tone={statusMeta[alert.status].tone} /><StatusBadge label={priorityMeta[alert.priority].label} tone={priorityMeta[alert.priority].tone} /></div><h2 className="title-serif mt-3 text-[1.25rem] font-medium text-[var(--on-surface)]">{alert.title}</h2><p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">{alert.message}</p></div>
          <div className="flex flex-wrap gap-2"><ActionButton icon={IconSend} onClick={onSendTest}>Test delivery</ActionButton><ActionButton icon={IconCheck} onClick={onAdvance}>Advance</ActionButton><ActionButton danger icon={IconArchive} onClick={onArchive}>Archive</ActionButton></div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3"><InfoTile label="Entity" value={alert.entity} /><InfoTile label="Rule" value={alert.routingRule} /><InfoTile label="Created" value={alert.createdAt} /></section>
      <section className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5"><SectionHeader eyebrow="Delivery activity" title="Notification trail" description="Operational delivery and ownership events for this alert." /><div className="mt-4 grid gap-3">{alert.activity.map((item, index) => <div key={`${item}-${index}`} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--on-surface)] font-mono text-[0.72rem] text-[var(--bg)]">{index + 1}</span><p className="text-[0.86rem] text-[var(--on-surface)]">{item}</p></div>)}</div></section>
    </div>
  );
}

function RoutingRuleModal({ onClose, onCreate, open }: { onClose: () => void; onCreate: (alert: AdminAlert) => void; open: boolean }) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  if (!open) return null;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    if (!title) return;
    onCreate({ activity: ["Routing rule created manually"], channel: String(form.get("channel")) as AlertChannel, createdAt: "Just now", entity: String(form.get("entity") ?? "Admin workspace"), id: `alert-${Date.now()}`, message: String(form.get("message") ?? "Manual notification rule."), nextAction: String(form.get("nextAction") ?? "Review routing rule."), owner: String(form.get("owner") ?? "Dennis"), priority: String(form.get("priority")) as AlertPriority, routingRule: title, status: "unread", surface: String(form.get("surface")) as AlertSurface, title });
  };
  return <ModalShell onClose={onClose}><form onSubmit={submit} className="w-full max-w-3xl rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-6"><ModalHeader title="Create routing rule" onClose={onClose} /><div className="mt-6 grid gap-4 border-t border-[var(--glass-border)] pt-6 sm:grid-cols-2"><FormInput ref={firstInputRef} label="Rule title" name="title" placeholder="Brief SLA escalation" /><FormInput label="Entity" name="entity" placeholder="Kijani Analytics" /><FormInput label="Message" name="message" placeholder="Alert message" /><FormInput label="Next action" name="nextAction" placeholder="Review and assign owner" /><FormInput label="Owner" name="owner" placeholder="Dennis" /><SelectField label="Surface" name="surface" options={Object.keys(surfaceLabel)} /><SelectField label="Priority" name="priority" options={Object.keys(priorityMeta)} /><SelectField label="Channel" name="channel" options={Object.keys(channelLabel)} /></div><ModalActions onClose={onClose} submitLabel="Create rule" /></form></ModalShell>;
}

function NotificationToolbar({ query, setQuery, setStatusFilter, setSurfaceFilter, statusFilter, surfaceFilter }: { query: string; setQuery: (value: string) => void; setStatusFilter: (value: AlertStatus | "all") => void; setSurfaceFilter: (value: AlertSurface | "all") => void; statusFilter: AlertStatus | "all"; surfaceFilter: AlertSurface | "all" }) {
  return <div className="flex flex-wrap gap-2"><FilterControl icon={IconSearch}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search alerts..." className="h-9 w-48 bg-transparent text-[0.8rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)]" /></FilterControl><FilterControl icon={IconFilter}><select value={surfaceFilter} onChange={(event) => setSurfaceFilter(event.target.value as AlertSurface | "all")} className="h-9 bg-transparent text-[0.8rem] text-[var(--on-surface)] outline-none"><option value="all">All surfaces</option>{(Object.keys(surfaceLabel) as AlertSurface[]).map((surface) => <option key={surface} value={surface}>{surfaceLabel[surface]}</option>)}</select></FilterControl><FilterControl icon={IconClock}><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as AlertStatus | "all")} className="h-9 bg-transparent text-[0.8rem] text-[var(--on-surface)] outline-none"><option value="all">All states</option>{(Object.keys(statusMeta) as AlertStatus[]).map((status) => <option key={status} value={status}>{statusMeta[status].label}</option>)}</select></FilterControl></div>;
}

function ChartPanel({ children, description, title, value }: { children: ReactNode; description: string; title: string; value: string }) {
  return <article className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]"><div className="flex items-start justify-between gap-4"><div><h2 className="title-serif text-[1rem] font-medium text-[var(--on-surface)]">{title}</h2><p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{description}</p></div><span className="rounded-full border border-[var(--glass-border)] px-3 py-1.5 font-mono text-[0.72rem] text-[var(--on-surface)]">{value}</span></div><div className="mt-5">{children}</div></article>;
}

function ContextTile({ icon: Icon, label, value }: { icon: Icon; label: string; value: string }) {
  return <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3"><span className="grid h-9 w-9 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] text-[var(--secondary)]"><Icon size={16} stroke={1.7} /></span><div><p className="text-[0.84rem] font-medium text-[var(--on-surface)]">{label}</p><p className="mt-1 font-mono text-[0.78rem] text-[var(--on-surface-dim)]">{value}</p></div></div>;
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3"><p className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">{label}</p><p className="mt-1.5 truncate font-mono text-[0.9rem] text-[var(--on-surface)]">{value}</p></div>;
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return <div className="rounded-[1.35rem] border border-dashed border-[var(--glass-border)] bg-[var(--surface)] p-8 text-center"><p className="text-[1rem] font-medium text-[var(--on-surface)]">{title}</p><p className="mx-auto mt-2 max-w-md text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{body}</p></div>;
}

function SectionHeader({ description, eyebrow, title }: { description: string; eyebrow: string; title: string }) {
  return <div><p className="label-caps text-[var(--primary)]">{eyebrow}</p><h2 className="title-serif mt-2 text-[clamp(1.48rem,2vw,1.9rem)] font-medium text-[var(--on-surface)]">{title}</h2><p className="mt-2 max-w-2xl text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">{description}</p></div>;
}

function FilterControl({ children, icon: Icon }: { children: ReactNode; icon: Icon }) {
  return <label className="inline-flex h-10 min-w-0 items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[var(--on-surface-dim)]"><Icon size={14} stroke={1.7} />{children}</label>;
}

function ActionButton({ children, danger = false, icon: Icon, onClick }: { children: ReactNode; danger?: boolean; icon: Icon; onClick?: () => void }) {
  return <button type="button" disabled={!onClick} onClick={onClick} className={cn("inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 text-[0.76rem] font-medium transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50", danger ? "border-[color-mix(in_srgb,var(--error)_30%,transparent)] text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]" : "border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]")}><Icon size={13} stroke={1.8} />{children}</button>;
}

function buildNotificationStats(alerts: AdminAlert[]) {
  const unread = alerts.filter((alert) => alert.status === "unread").length;
  const critical = alerts.filter((alert) => alert.priority === "critical").length;
  const pending = alerts.filter((alert) => alert.status !== "resolved").length;
  const surfaceCounts = (Object.keys(surfaceLabel) as AlertSurface[]).map((surface) => alerts.filter((alert) => alert.surface === surface).length);
  return { critical, deliveryScore: Math.max(0, 100 - unread * 9 - critical * 6), pending, surfaceCounts, surfaceCoverage: surfaceCounts.filter(Boolean).length, unread };
}

function priorityScore(priority: AlertPriority) {
  if (priority === "critical") return 3;
  if (priority === "high") return 2;
  return 1;
}

function ModalShell({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-[90] grid place-items-center bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-6 backdrop-blur-xl" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>{children}</div>;
}

function ModalHeader({ onClose, title }: { onClose: () => void; title: string }) {
  return <div className="flex items-start justify-between gap-4"><div><p className="label-caps text-[var(--primary)]">Notification routing</p><h2 className="title-serif mt-2 text-[1.2rem] font-medium text-[var(--on-surface)]">{title}</h2></div><button type="button" onClick={onClose} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]" aria-label="Close modal"><IconX size={18} stroke={1.6} /></button></div>;
}

const FormInput = forwardRef<HTMLInputElement, { label: string; name: string; placeholder?: string }>(function FormInput({ label, name, placeholder }, ref) {
  return <label className="grid gap-2"><span className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">{label}</span><input ref={ref} name={name} placeholder={placeholder} className="h-11 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.9rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)]" /></label>;
});

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return <label className="grid gap-2"><span className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">{label}</span><select name={name} className="h-11 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.9rem] text-[var(--on-surface)] outline-none">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function ModalActions({ onClose, submitLabel }: { onClose: () => void; submitLabel: string }) {
  return <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[var(--glass-border)] pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.9rem] font-medium text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]">Cancel</button><button type="submit" className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-5 text-[0.9rem] font-medium text-[var(--bg)]">{submitLabel}</button></div>;
}
