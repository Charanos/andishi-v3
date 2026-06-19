"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  IconArrowRight,
  IconCheck,
  IconDatabase,
  IconEdit,
  IconFilter,
  IconKey,
  IconLock,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconTrash,
  IconUsers,
  IconWebhook,
  IconX,
  type Icon,
} from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import {
  DashboardBarChart,
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
import type { AdminAuthIntakeRecord } from "@/lib/dashboard/admin-auth-intake";
import { cn } from "@/lib/utils";

type ControlStatus = "healthy" | "review" | "locked" | "disabled";
type ControlArea = "rbac" | "auth" | "integration" | "policy" | "audit";

type ControlRecord = {
  activity: string[];
  area: ControlArea;
  id: string;
  lastChanged: string;
  owner: string;
  policy: string;
  risk: string;
  status: ControlStatus;
  title: string;
  visibleTo: string[];
};

const statusMeta: Record<ControlStatus, { label: string; next: ControlStatus | null; tone: "active" | "neutral" | "overdue" | "pending" }> = {
  disabled: { label: "Disabled", next: "review", tone: "overdue" },
  healthy: { label: "Healthy", next: "review", tone: "active" },
  locked: { label: "Locked", next: "healthy", tone: "neutral" },
  review: { label: "Review", next: "healthy", tone: "pending" },
};

const areaLabel: Record<ControlArea, string> = {
  audit: "Audit",
  auth: "Auth intake",
  integration: "Integration",
  policy: "Policy",
  rbac: "RBAC",
};

const controlSeed: ControlRecord[] = [
  {
    activity: ["Admin route policies reviewed", "Client/dev action boundaries synced", "Revenue margin visibility locked"],
    area: "rbac",
    id: "ctrl-rbac",
    lastChanged: "Today",
    owner: "Dennis",
    policy: "Admin sees full operations. Client and developer dashboards receive scoped business context only.",
    risk: "A route-level guard without action-level checks is not enough for production.",
    status: "review",
    title: "Role access matrix",
    visibleTo: ["admin", "client", "developer"],
  },
  {
    activity: ["Neon connection verified", "Lazy DB getter active", "Migrations aligned with schema"],
    area: "integration",
    id: "ctrl-neon",
    lastChanged: "Jun 1",
    owner: "DevOps",
    policy: "Database clients initialize lazily and dashboard data access must stay server-authorized.",
    risk: "Missing env vars should fail scoped panels, not the whole shell.",
    status: "healthy",
    title: "Neon database",
    visibleTo: ["admin"],
  },
  {
    activity: ["Stripe placeholder documented", "Client invoice view mapped", "Developer payout view mapped"],
    area: "integration",
    id: "ctrl-stripe",
    lastChanged: "May 31",
    owner: "Finance",
    policy: "Stripe powers client invoices and payout status while Andishi margin stays admin-only.",
    risk: "Before live Stripe, every finance action remains local mock state.",
    status: "review",
    title: "Stripe billing and payouts",
    visibleTo: ["admin", "client", "developer"],
  },
  {
    activity: ["Support routing defined", "Client and developer chat entry points live", "Admin resolver queue linked"],
    area: "integration",
    id: "ctrl-crisp",
    lastChanged: "May 30",
    owner: "Support",
    policy: "Crisp handles real-time comms; admin support is resolver context, not a custom chat backend.",
    risk: "Identity payload must include role and relationship IDs before production.",
    status: "review",
    title: "Crisp support routing",
    visibleTo: ["admin", "client", "developer"],
  },
  {
    activity: ["Activity schema includes visibleTo", "Drawer actions model future audit events", "Archive confirmations standardized"],
    area: "audit",
    id: "ctrl-audit",
    lastChanged: "Today",
    owner: "Ops",
    policy: "Every admin action should produce a role-scoped audit event with entity context.",
    risk: "Local mock actions need server action handoff before compliance-ready operations.",
    status: "review",
    title: "Audit event posture",
    visibleTo: ["admin"],
  },
];

export function AdminSettingsPage({
  authIntake,
}: {
  authIntake: AdminAuthIntakeRecord[];
}) {
  const [controls, setControls] = useState(controlSeed);
  const [selectedId, setSelectedId] = useState(controlSeed[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState<ControlArea | "all">("all");
  const [drawerControl, setDrawerControl] = useState<ControlRecord | null>(null);
  const [confirmControl, setConfirmControl] = useState<ControlRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editControl, setEditControl] = useState<ControlRecord | null>(null);

  const selected = controls.find((control) => control.id === selectedId) ?? controls[0] ?? null;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return controls.filter((control) => {
      const haystack = `${control.title} ${control.area} ${control.owner} ${control.policy} ${control.visibleTo.join(" ")}`.toLowerCase();
      return (!needle || haystack.includes(needle)) && (areaFilter === "all" || control.area === areaFilter);
    });
  }, [areaFilter, controls, query]);

  const stats = useMemo(() => buildSettingsStats(controls, authIntake), [authIntake, controls]);

  const columns = useMemo<Array<OperationalTableColumn<ControlRecord>>>(
    () => [
      {
        key: "title",
        label: "Control",
        priority: true,
        render: (control) => (
          <div className="min-w-0">
            <p className="truncate text-[0.88rem] font-medium text-[var(--on-surface)]">{control.title}</p>
            <p className="mt-1 truncate text-[0.74rem] text-[var(--on-surface-dim)]">{areaLabel[control.area]} / {control.owner}</p>
          </div>
        ),
      },
      { key: "status", label: "Status", render: (control) => <StatusBadge label={statusMeta[control.status].label} tone={statusMeta[control.status].tone} /> },
      { key: "area", label: "Area", render: (control) => areaLabel[control.area] },
      { key: "lastChanged", label: "Changed", mono: true },
      { key: "visibleTo", label: "Visibility", hideOnMobile: true, render: (control) => control.visibleTo.join(", ") },
      { key: "owner", label: "Owner", hideOnMobile: true },
    ],
    [],
  );

  const advanceControl = (control: ControlRecord) => {
    const next = statusMeta[control.status].next;
    if (!next) return;
    const updated: ControlRecord = {
      ...control,
      activity: [`Moved to ${statusMeta[next].label}`, ...control.activity],
      lastChanged: "Now",
      status: next,
    };
    setControls((current) => current.map((item) => (item.id === control.id ? updated : item)));
    setSelectedId(updated.id);
    setDrawerControl((current) => (current?.id === control.id ? updated : current));
  };

  const createControl = (payload: { area: ControlArea; title: string; owner: string }) => {
    const created: ControlRecord = {
      activity: ["Control created", "Review required", "Audit posture pending"],
      area: payload.area,
      id: `ctrl-${Date.now()}`,
      lastChanged: "Now",
      owner: payload.owner,
      policy: "New control needs a production policy and owner signoff.",
      risk: "Unreviewed control should not be considered production-ready.",
      status: "review",
      title: payload.title,
      visibleTo: ["admin"],
    };
    setControls((current) => [created, ...current]);
    setSelectedId(created.id);
    setDrawerControl(created);
    setCreateOpen(false);
  };

  const updateControl = (
    control: ControlRecord,
    patch: Pick<ControlRecord, "owner" | "policy" | "risk" | "title" | "visibleTo">,
  ) => {
    const updated: ControlRecord = {
      ...control,
      ...patch,
      activity: ["Control policy edited", ...control.activity],
      lastChanged: "Now",
      status: control.status === "healthy" ? "review" : control.status,
    };
    setControls((current) => current.map((item) => (item.id === control.id ? updated : item)));
    setSelectedId(updated.id);
    setDrawerControl((current) => (current?.id === control.id ? updated : current));
    setEditControl(null);
  };

  const archiveControl = () => {
    if (!confirmControl) return;
    const next = controls.filter((control) => control.id !== confirmControl.id);
    setControls(next);
    if (selectedId === confirmControl.id) setSelectedId(next[0]?.id ?? "");
    setConfirmControl(null);
  };

  return (
    <div className="grid min-w-0 gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <DashboardPageHeader
        className="mb-0"
        title="Admin control plane"
        description="Govern RBAC, auth intake, integrations, audit posture, and role-scoped visibility so admin, client, and developer workspaces stay commercially safe."
        status={<StatusBadge label={`${stats.review} controls need review`} tone="pending" />}
        actions={
          <>
            <button type="button" onClick={() => setAreaFilter("auth")} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]">
              <IconRefresh size={16} stroke={1.7} />
              Auth intake
            </button>
            <button type="button" onClick={() => setCreateOpen(true)} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)] shadow-[0_14px_30px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)]">
              <IconPlus size={16} stroke={1.8} />
              Add control
            </button>
          </>
        }
      />

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard chart="bar" data={[3, 4, 5, controls.length]} icon={IconShieldCheck} label="Controls" trend={`${stats.healthy} healthy`} value={String(controls.length)} />
        <KpiCard data={[8, 10, 11, authIntake.length]} icon={IconUsers} label="Auth intake" trend={`${stats.unverified} unverified`} value={String(authIntake.length)} />
        <KpiCard chart="bar" data={[2, 3, 3, stats.integrations]} icon={IconWebhook} label="Integrations" trend={`${stats.review} review needed`} value={String(stats.integrations)} />
        <KpiCard data={[72, 78, 84, stats.posture]} icon={IconLock} label="Posture score" trend="Control readiness" value={`${stats.posture}%`} />
      </section>

      <SectionDivider />

      <section className="grid min-w-0 gap-7 2xl:grid-cols-[minmax(0,1fr)_minmax(23rem,27rem)]">
        <SettingsObservability controls={controls} authIntake={authIntake} />
        <SettingsCommandPanel control={selected} onAdvance={selected ? () => advanceControl(selected) : undefined} onArchive={selected ? () => setConfirmControl(selected) : undefined} onEdit={selected ? () => setEditControl(selected) : undefined} onInspect={selected ? () => setDrawerControl(selected) : undefined} />
      </section>

      <SectionDivider />

      <section className="grid gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <SectionHeader eyebrow="Control registry" title="Admin systems and policy controls" description="Search and operate the controls that keep dashboard data, role visibility, integrations, and audit behavior production-ready." />
          <SettingsToolbar areaFilter={areaFilter} query={query} setAreaFilter={setAreaFilter} setQuery={setQuery} />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((control) => (
            <ControlCard control={control} key={control.id} selected={selected?.id === control.id} onAdvance={() => advanceControl(control)} onArchive={() => setConfirmControl(control)} onEdit={() => setEditControl(control)} onInspect={() => setDrawerControl(control)} onSelect={() => setSelectedId(control.id)} />
          ))}
          {!filtered.length && <EmptyState title="No controls match" body="Clear filters or add a control." />}
        </div>
      </section>

      <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <AuthIntakePanel records={authIntake} />
        <ChartPanel title="Control posture" description="Readiness trend across RBAC, integrations, audit, and auth controls." value={`${stats.posture}%`}>
          <DashboardLineChart data={[66, 70, 74, 81, stats.posture]} height={300} labels={["Apr", "May 1", "May 15", "Jun 1", "Now"]} variant="area" />
        </ChartPanel>
      </section>

      <OperationalDataTable columns={columns} description="Settings matrix for RBAC, auth, integrations, policies, audit controls, owner, and role visibility." empty="No controls match." onRowSelect={(control) => { setSelectedId(control.id); setDrawerControl(control); }} rows={filtered} title="Admin control matrix" />

      <CreateControlModal onClose={() => setCreateOpen(false)} onSubmit={createControl} open={createOpen} />
      <EditControlModal control={editControl} onClose={() => setEditControl(null)} onSubmit={updateControl} />

      <EntityDrawer onClose={() => setDrawerControl(null)} open={Boolean(drawerControl)} title={drawerControl?.title ?? "Control details"}>
        {drawerControl && <ControlDrawer control={drawerControl} onAdvance={() => advanceControl(drawerControl)} onArchive={() => setConfirmControl(drawerControl)} onEdit={() => setEditControl(drawerControl)} />}
      </EntityDrawer>

      <ConfirmDialog confirmLabel="Archive control" description={`This removes ${confirmControl?.title ?? "this control"} from the active settings registry while preserving future audit trail shape.`} onCancel={() => setConfirmControl(null)} onConfirm={archiveControl} open={Boolean(confirmControl)} title="Archive control?" />
    </div>
  );
}

function SettingsObservability({ authIntake, controls }: { authIntake: AdminAuthIntakeRecord[]; controls: ControlRecord[] }) {
  const areaCounts = (Object.keys(areaLabel) as ControlArea[]).map((area) => controls.filter((control) => control.area === area).length);
  return (
    <div className="min-w-0">
      <SectionHeader eyebrow="Control observability" title="Role and system safety map" description="Settings is where the app enforces the business model: admin full visibility, client hiring/billing confidence, developer workbench clarity, and no accidental margin leakage." />
      <div className="mt-6 grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-h-[27rem] rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] sm:p-5">
          <DashboardBarChart data={areaCounts} height={330} labels={(Object.keys(areaLabel) as ControlArea[]).map((area) => areaLabel[area])} />
        </div>
        <div className="grid gap-3 md:grid-cols-3 2xl:grid-cols-1">
          <ContextTile icon={IconKey} label="Auth intake" value={`${authIntake.length} latest users`} />
          <ContextTile icon={IconLock} label="Visibility" value="Admin/client/developer boundaries" />
          <ContextTile icon={IconDatabase} label="Persistence" value="Server-authorized data handoff" />
        </div>
      </div>
    </div>
  );
}

function AuthIntakePanel({ records }: { records: AdminAuthIntakeRecord[] }) {
  return (
    <section className="min-w-0 rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-caps text-[var(--primary)]">Auth intake</p>
          <h3 className="mt-3 text-[1rem] font-medium text-[var(--on-surface)]">Recent account shells</h3>
          <p className="mt-1 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">Registration must create linked organization or engineer context before dashboard data becomes useful.</p>
        </div>
        <StatusBadge label={`${records.length} records`} tone="neutral" />
      </div>
      <div className="mt-5 grid gap-3">
        {(records.length ? records : []).slice(0, 6).map((record) => (
          <article className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3" key={record.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[0.88rem] font-medium text-[var(--on-surface)]">{record.name}</p>
                <p className="mt-1 truncate text-[0.74rem] text-[var(--on-surface-dim)]">{record.email}</p>
              </div>
              <StatusBadge label={record.role} tone={record.status === "active" ? "active" : "pending"} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[0.72rem] text-[var(--on-surface-dim)]">
              <span>Org: {record.organizationId ? "linked" : "none"}</span>
              <span>Eng: {record.engineerId ? "linked" : "none"}</span>
            </div>
          </article>
        ))}
        {!records.length && <EmptyState title="No auth intake yet" body="Seed or register users to populate intake records." />}
      </div>
    </section>
  );
}

function SettingsToolbar({ areaFilter, query, setAreaFilter, setQuery }: { areaFilter: ControlArea | "all"; query: string; setAreaFilter: (value: ControlArea | "all") => void; setQuery: (value: string) => void }) {
  return (
    <div className="grid w-full gap-3 xl:w-auto xl:min-w-[38rem]">
      <label className="relative min-w-0"><span className="sr-only">Search controls</span><IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]" size={16} stroke={1.7} /><input className="h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-10 pr-4 text-[0.9rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]" onChange={(event) => setQuery(event.target.value)} placeholder="Search controls, policies, integrations..." value={query} /></label>
      <SelectPill icon={IconFilter} label="Area" value={areaFilter} onChange={(value) => setAreaFilter(value as ControlArea | "all")}><option value="all">All areas</option>{(Object.keys(areaLabel) as ControlArea[]).map((area) => <option key={area} value={area}>{areaLabel[area]}</option>)}</SelectPill>
    </div>
  );
}

function ControlCard({ control, onAdvance, onArchive, onEdit, onInspect, onSelect, selected }: { control: ControlRecord; onAdvance: () => void; onArchive: () => void; onEdit: () => void; onInspect: () => void; onSelect: () => void; selected: boolean }) {
  return (
    <article className={cn("min-w-0 overflow-hidden rounded-[1.35rem] border transition-all duration-200", selected ? "border-[color-mix(in_srgb,var(--primary)_38%,var(--glass-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_7%,var(--surface)),var(--surface))] shadow-[0_18px_50px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]" : control.status === "disabled" ? "border-[color-mix(in_srgb,var(--error)_34%,var(--glass-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--error)_6%,var(--surface)),var(--surface))]" : "border-[var(--glass-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-high)_24%,var(--surface)),var(--surface))]")}>
      <button className="block w-full cursor-pointer p-5 text-left sm:p-6" onClick={onSelect} type="button">
        <div className="flex flex-wrap items-center gap-2"><h3 className="break-words text-[1rem] font-medium text-[var(--on-surface)]">{control.title}</h3><StatusBadge label={statusMeta[control.status].label} tone={statusMeta[control.status].tone} /></div>
        <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{control.policy}</p>
        <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]"><SignalCell label="Area" value={areaLabel[control.area]} /><SignalCell label="Owner" value={control.owner} /><SignalCell label="Changed" value={control.lastChanged} /></div>
      </button>
      <div className="flex flex-col gap-3 border-t border-[var(--glass-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <span className="truncate text-[0.82rem] text-[var(--on-surface-dim)]">Visible: {control.visibleTo.join(", ")}</span>
        <div className="flex shrink-0 flex-wrap justify-end gap-2"><IconButton label="Edit" onClick={onEdit}><IconEdit size={16} stroke={1.8} /></IconButton><IconButton label="Inspect" onClick={onInspect}><IconArrowRight size={16} stroke={1.8} /></IconButton><IconButton label="Advance" onClick={onAdvance}><IconCheck size={16} stroke={1.8} /></IconButton><IconButton danger label="Archive" onClick={onArchive}><IconTrash size={16} stroke={1.8} /></IconButton></div>
      </div>
    </article>
  );
}

function SettingsCommandPanel({ control, onAdvance, onArchive, onEdit, onInspect }: { control: ControlRecord | null; onAdvance?: () => void; onArchive?: () => void; onEdit?: () => void; onInspect?: () => void }) {
  if (!control) return <EmptyState title="Select a control" body="Pick a control to inspect policy state." />;
  return <aside className="2xl:sticky 2xl:top-28 2xl:self-start"><div className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)] sm:p-6"><StatusBadge label={statusMeta[control.status].label} tone={statusMeta[control.status].tone} /><h2 className="title-serif mt-3 text-[1.15rem] font-medium text-[var(--on-surface)]">{control.title}</h2><p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{control.policy}</p><div className="mt-5 grid grid-cols-2 gap-2.5"><InfoTile label="Area" value={areaLabel[control.area]} /><InfoTile label="Owner" value={control.owner} /><InfoTile label="Changed" value={control.lastChanged} /><InfoTile label="Visible" value={control.visibleTo.join(", ")} /></div><div className="mt-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4"><p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Risk</p><p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">{control.risk}</p></div><div className="mt-5 grid grid-cols-2 gap-2"><ActionButton icon={IconEdit} label="Edit" onClick={onEdit} /><ActionButton icon={IconShieldCheck} label="Inspect" onClick={onInspect} /><ActionButton icon={IconCheck} label="Advance" onClick={onAdvance} /><ActionButton danger icon={IconTrash} label="Archive" onClick={onArchive} /></div></div></aside>;
}

function ControlDrawer({ control, onAdvance, onArchive, onEdit }: { control: ControlRecord; onAdvance: () => void; onArchive: () => void; onEdit: () => void }) {
  return <div className="grid gap-6"><section><StatusBadge label={statusMeta[control.status].label} tone={statusMeta[control.status].tone} /><h3 className="mt-3 text-[1.35rem] font-medium text-[var(--on-surface)]">{control.title}</h3><p className="mt-2 text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">{control.policy}</p></section><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><InfoTile label="Area" value={areaLabel[control.area]} /><InfoTile label="Owner" value={control.owner} /><InfoTile label="Changed" value={control.lastChanged} /><InfoTile label="Visible" value={control.visibleTo.join(", ")} /></section><section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]"><div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4"><p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Production risk</p><p className="mt-3 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">{control.risk}</p></div><ActivityPanel activity={control.activity} /></section><div className="flex flex-col-reverse gap-2 border-t border-[var(--glass-border)] pt-5 sm:flex-row sm:justify-end"><ActionButton danger icon={IconTrash} label="Archive" onClick={onArchive} /><ActionButton icon={IconEdit} label="Edit" onClick={onEdit} /><ActionButton icon={IconCheck} label="Advance" onClick={onAdvance} /></div></div>;
}

function CreateControlModal({ onClose, onSubmit, open }: { onClose: () => void; onSubmit: (payload: { area: ControlArea; title: string; owner: string }) => void; open: boolean }) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  useModalLifecycle(open, onClose, firstInputRef);
  if (!open) return null;
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); onSubmit({ area: String(form.get("area") || "policy") as ControlArea, owner: String(form.get("owner") || "Ops"), title: String(form.get("title") || "New control") }); };
  return <ModalShell labelledBy="create-control-title" onClose={onClose}><form className="w-full max-w-3xl rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-6" onSubmit={submit}><ModalHeader eyebrow="Control intake" id="create-control-title" onClose={onClose} title="Add admin control" /><div className="mt-6 grid gap-4 border-t border-[var(--glass-border)] pt-6 sm:grid-cols-2"><FormInput ref={firstInputRef} label="Title" name="title" placeholder="Billing visibility policy" /><FormInput label="Owner" name="owner" placeholder="Finance" /><SelectField label="Area" name="area" options={Object.keys(areaLabel)} /></div><ModalActions onClose={onClose} submitLabel="Create control" /></form></ModalShell>;
}

function EditControlModal({ control, onClose, onSubmit }: { control: ControlRecord | null; onClose: () => void; onSubmit: (control: ControlRecord, patch: Pick<ControlRecord, "owner" | "policy" | "risk" | "title" | "visibleTo">) => void }) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  useModalLifecycle(Boolean(control), onClose, firstInputRef);
  if (!control) return null;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const visibleTo = String(form.get("visibleTo") || control.visibleTo.join(","))
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean);
    onSubmit(control, {
      owner: String(form.get("owner") || control.owner),
      policy: String(form.get("policy") || control.policy),
      risk: String(form.get("risk") || control.risk),
      title: String(form.get("title") || control.title),
      visibleTo,
    });
  };
  return <ModalShell labelledBy="edit-control-title" onClose={onClose}><form className="w-full max-w-4xl rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-6" onSubmit={submit}><ModalHeader eyebrow="Policy editor" id="edit-control-title" onClose={onClose} title={`Edit ${control.title}`} /><div className="mt-6 grid gap-4 border-t border-[var(--glass-border)] pt-6 sm:grid-cols-2"><FormInput ref={firstInputRef} label="Title" name="title" placeholder={control.title} /><FormInput label="Owner" name="owner" placeholder={control.owner} /><FormInput label="Visible roles" name="visibleTo" placeholder={control.visibleTo.join(", ")} /><label className="sm:col-span-2"><span className="text-[0.78rem] font-medium text-[var(--on-surface)]">Policy</span><textarea className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]" defaultValue={control.policy} name="policy" /></label><label className="sm:col-span-2"><span className="text-[0.78rem] font-medium text-[var(--on-surface)]">Production risk</span><textarea className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]" defaultValue={control.risk} name="risk" /></label></div><ModalActions onClose={onClose} submitLabel="Update control" /></form></ModalShell>;
}

function buildSettingsStats(controls: ControlRecord[], intake: AdminAuthIntakeRecord[]) {
  const healthy = controls.filter((control) => control.status === "healthy").length;
  const review = controls.filter((control) => control.status === "review").length;
  return { healthy, integrations: controls.filter((control) => control.area === "integration").length, posture: controls.length ? Math.round((healthy / controls.length) * 100) : 0, review, unverified: intake.filter((record) => !record.emailVerified).length };
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
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKey); };
  }, [onClose, open, ref]);
}
