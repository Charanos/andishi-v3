"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconAdjustmentsHorizontal,
  IconArrowRight,
  IconBriefcase,
  IconBuilding,
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconCode,
  IconCurrencyDollar,
  IconEdit,
  IconFileText,
  IconGitMerge,
  IconMessageCircle,
  IconPlus,
  IconReceipt,
  IconRefresh,
  IconRocket,
  IconSearch,
  IconSend,
  IconShieldCheck,
  IconTrash,
  IconUserCheck,
  IconUsers,
  IconUsersGroup,
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
import {
  OperationalDataTable,
  type OperationalTableColumn,
} from "@/components/dashboard/shared/operational-data-table";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { dashboardDemoData } from "@/data/dashboard-mock";
import type { AdminAuthIntakeRecord } from "@/lib/dashboard/admin-auth-intake";
import { cn } from "@/lib/utils";

export type AdminWorkspaceKind =
  | "briefs"
  | "clients"
  | "engineers"
  | "matches"
  | "placements"
  | "revenue"
  | "content"
  | "settings"
  | "support";

type AdminRecord = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  owner: string;
  metric: string;
  meta: string;
  description: string;
  tags: string[];
  relation: {
    admin: string;
    client: string;
    developer: string;
    project: string;
  };
  activity: string[];
};

type PageConfig = {
  title: string;
  eyebrow: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
  searchPlaceholder: string;
  icon: Icon;
  accent: string;
  chart: "line" | "bar" | "donut";
  filters: string[];
  kpis: Array<{
    label: string;
    value: string;
    trend: string;
    icon: Icon;
    data: number[];
  }>;
  records: AdminRecord[];
  support?: boolean;
};

const statusTone = (status: string) => {
  const normalized = status.toLowerCase();
  if (
    normalized.includes("active") ||
    normalized.includes("approved") ||
    normalized.includes("paid") ||
    normalized.includes("published") ||
    normalized.includes("verified")
  ) {
    return "active";
  }
  if (
    normalized.includes("overdue") ||
    normalized.includes("blocked") ||
    normalized.includes("disabled") ||
    normalized.includes("terminated")
  ) {
    return "overdue";
  }
  return "pending";
};

export function AdminWorkspacePage({
  authIntake = [],
  kind,
}: {
  authIntake?: AdminAuthIntakeRecord[];
  kind: AdminWorkspaceKind;
}) {
  const baseConfig = useMemo(() => buildPageConfig(kind), [kind]);
  const [records, setRecords] = useState<AdminRecord[]>(baseConfig.records);
  const [selectedRecord, setSelectedRecord] = useState<AdminRecord | null>(
    records[0] ?? null,
  );
  const [drawerRecord, setDrawerRecord] = useState<AdminRecord | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmRecord, setConfirmRecord] = useState<AdminRecord | null>(null);
  const [chatMessages, setChatMessages] = useState([
    {
      author: "Dennis",
      role: "Admin",
      message:
        "Keep the client, engineer, and Andishi ops thread tied to the active project context.",
      time: "09:24",
    },
    {
      author: "Maya",
      role: "Client",
      message: "We need the next update before the intro window closes.",
      time: "10:10",
    },
    {
      author: "Amina",
      role: "Developer",
      message:
        "I can share the delivery notes and risks after today's standup.",
      time: "10:18",
    },
  ]);

  const filteredRecords = records.filter((record) => {
    const matchesQuery =
      `${record.title} ${record.subtitle} ${record.owner} ${record.tags.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      record.status === filter ||
      record.tags.includes(filter);
    return matchesQuery && matchesFilter;
  });

  const selected =
    selectedRecord && records.some((record) => record.id === selectedRecord.id)
      ? selectedRecord
      : (records[0] ?? null);

  const analyticalColumns = useMemo<Array<OperationalTableColumn<AdminRecord>>>(
    () => [
      {
        key: "title",
        label: "Record",
        priority: true,
        render: (record) => (
          <div className="min-w-0">
            <p className="truncate text-[0.86rem] font-medium text-[var(--on-surface)]">
              {record.title}
            </p>
            <p className="mt-1 truncate text-[0.74rem] text-[var(--on-surface-dim)]">
              {record.subtitle}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (record) => (
          <StatusBadge label={record.status} tone={statusTone(record.status)} />
        ),
      },
      { key: "owner", label: "Owner" },
      { key: "metric", label: "Metric", mono: true },
      { key: "meta", label: "Cadence", hideOnMobile: true },
      {
        key: "relation",
        label: "Relationship",
        hideOnMobile: true,
        render: (record) => (
          <div className="min-w-0">
            <p className="truncate text-[0.78rem] text-[var(--on-surface)]">
              {record.relation.client}
            </p>
            <p className="mt-1 truncate text-[0.7rem] text-[var(--on-surface-dim)]">
              {record.relation.developer} / {record.relation.project}
            </p>
          </div>
        ),
      },
      {
        key: "tags",
        label: "Tags",
        hideOnMobile: true,
        render: (record) => (
          <div className="flex max-w-[18rem] flex-wrap gap-1.5">
            {record.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--glass-border)] px-2 py-1 text-[0.66rem] text-[var(--on-surface-dim)]"
              >
                {tag}
              </span>
            ))}
          </div>
        ),
      },
    ],
    [],
  );

  const addRecord = (formData: FormData) => {
    const title =
      String(formData.get("title") ?? "").trim() ||
      `${baseConfig.eyebrow} item`;
    const owner = String(formData.get("owner") ?? "").trim() || "Dennis";
    const status =
      String(formData.get("status") ?? "").trim() ||
      baseConfig.filters[1] ||
      "Active";
    const note =
      String(formData.get("note") ?? "").trim() ||
      "Created from the admin workspace action modal.";
    const created: AdminRecord = {
      id: `${kind}-${Date.now()}`,
      title,
      subtitle: "New operational record",
      status,
      owner,
      metric: "New",
      meta: "Created now",
      description: note,
      tags: [status, "Admin"],
      relation: {
        admin: "Dennis Munge",
        client: "Kijani Analytics",
        developer: "Amina Otieno",
        project: "AI support workflow",
      },
      activity: ["Record created", "Owner assigned", "Awaiting first update"],
    };
    setRecords((current) => [created, ...current]);
    setSelectedRecord(created);
    setDrawerRecord(created);
    setModalOpen(false);
  };

  const advanceRecord = (record: AdminRecord) => {
    const nextStatus = nextStatusFor(kind, record.status);
    const updated = {
      ...record,
      status: nextStatus,
      metric: "Updated",
      activity: [`Moved to ${nextStatus}`, ...record.activity],
    };
    setRecords((current) =>
      current.map((item) => (item.id === record.id ? updated : item)),
    );
    setSelectedRecord(updated);
    if (drawerRecord?.id === record.id) setDrawerRecord(updated);
  };

  const removeRecord = () => {
    if (!confirmRecord) return;
    setRecords((current) =>
      current.filter((record) => record.id !== confirmRecord.id),
    );
    if (selectedRecord?.id === confirmRecord.id) {
      setSelectedRecord(
        records.find((record) => record.id !== confirmRecord.id) ?? null,
      );
    }
    setConfirmRecord(null);
  };

  return (
    <div className="grid gap-6 pb-12">
      <DashboardPageHeader
        title={baseConfig.title}
        description={baseConfig.description}
        status={<StatusBadge label={baseConfig.eyebrow} tone="pending" />}
        actions={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)] shadow-[0_14px_30px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <IconPlus size={16} stroke={1.8} />
              {baseConfig.primaryAction}
            </button>
            <button
              type="button"
              onClick={() => setSelectedRecord(filteredRecords[0] ?? null)}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] transition-colors duration-300 hover:bg-[var(--glass-bg)]"
            >
              <IconRefresh size={16} stroke={1.7} />
              {baseConfig.secondaryAction}
            </button>
          </>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <HeroPanel config={baseConfig} records={records} />
        <InsightPanel config={baseConfig} records={records} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {baseConfig.kpis.map((kpi, index) => (
          <article
            key={kpi.label}
            className="min-w-0 rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4 shadow-[0_18px_45px_color-mix(in_srgb,var(--bg-deep)_7%,transparent)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[0.82rem] font-medium text-[var(--on-surface)]">
                  {kpi.label}
                </p>
                <p className="mt-3 font-mono text-[1.55rem] leading-none text-[var(--on-surface)]">
                  {kpi.value}
                </p>
                <p className="mt-2 text-[0.78rem] text-[var(--on-surface-dim)]">
                  {kpi.trend}
                </p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]">
                {(() => {
                  const KpiIcon = kpi.icon;
                  return <KpiIcon size={18} stroke={1.7} />;
                })()}
              </span>
            </div>
            <div className="mt-4">
              {index % 3 === 1 ? (
                <DashboardBarChart data={kpi.data} height={58} />
              ) : (
                <DashboardLineChart data={kpi.data} height={58} />
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="flex flex-col gap-3 border-b border-[var(--glass-border)] pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[1rem] font-medium text-[var(--on-surface)]">
                Operational queue
              </p>
              <p className="mt-1 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
                Search, filter, inspect, and move records through the admin
                workflow.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative min-w-0 sm:w-72">
                <span className="sr-only">Search records</span>
                <IconSearch
                  size={16}
                  stroke={1.7}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={baseConfig.searchPlaceholder}
                  className="h-10 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] pl-9 pr-3 text-[0.84rem] text-[var(--on-surface)] outline-none transition-colors placeholder:text-[var(--on-surface-dim)] focus:border-[var(--secondary)]"
                />
              </label>
              <label className="relative">
                <span className="sr-only">Filter records</span>
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="h-10 cursor-pointer appearance-none rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 pr-9 text-[0.84rem] text-[var(--on-surface)] outline-none focus:border-[var(--secondary)]"
                >
                  {["All", ...baseConfig.filters].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <IconAdjustmentsHorizontal
                  size={16}
                  stroke={1.7}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]"
                />
              </label>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {filteredRecords.map((record) => (
              <RecordRow
                key={record.id}
                icon={baseConfig.icon}
                onAdvance={() => advanceRecord(record)}
                onDelete={() => setConfirmRecord(record)}
                onSelect={() => {
                  setSelectedRecord(record);
                  setDrawerRecord(record);
                }}
                record={record}
                selected={selected?.id === record.id}
              />
            ))}
            {!filteredRecords.length && (
              <div className="rounded-2xl border border-dashed border-[var(--glass-border)] p-8 text-center">
                <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
                  No matching records
                </p>
                <p className="mt-2 text-[0.84rem] text-[var(--on-surface-dim)]">
                  Clear the search or add a new item to this workspace.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid min-w-0 gap-5">
          <RelationPanel record={selected} />
          {baseConfig.support ? (
            <StakeholderChatPanel
              messages={chatMessages}
              onSend={(message) => {
                setChatMessages((current) => [
                  ...current,
                  { author: "Dennis", role: "Admin", message, time: "Now" },
                ]);
              }}
            />
          ) : (
            <ActionRail
              config={baseConfig}
              onCreate={() => setModalOpen(true)}
              onOpen={() => selected && setDrawerRecord(selected)}
              record={selected}
            />
          )}
        </div>
      </section>

      <OperationalDataTable
        columns={analyticalColumns}
        description="A structured table view for comparing ownership, relationship context, metric health, and next operational cadence across the active admin queue."
        empty="No admin records match the current search and filter."
        onRowSelect={(record) => {
          setSelectedRecord(record);
          setDrawerRecord(record);
        }}
        rows={filteredRecords}
        title={`${baseConfig.accent} data matrix`}
      />

      {kind === "settings" && <AuthIntakePanel records={authIntake} />}

      <AdminCreateModal
        config={baseConfig}
        onClose={() => setModalOpen(false)}
        onSubmit={addRecord}
        open={modalOpen}
      />

      <EntityDrawer
        open={Boolean(drawerRecord)}
        onClose={() => setDrawerRecord(null)}
        title={drawerRecord?.title ?? baseConfig.title}
      >
        {drawerRecord && (
          <RecordDetails
            config={baseConfig}
            record={drawerRecord}
            onAdvance={() => advanceRecord(drawerRecord)}
          />
        )}
      </EntityDrawer>

      <ConfirmDialog
        open={Boolean(confirmRecord)}
        title="Archive this record?"
        description={`This keeps the audit trail but removes ${confirmRecord?.title ?? "the item"} from the active admin queue.`}
        confirmLabel="Archive"
        onCancel={() => setConfirmRecord(null)}
        onConfirm={removeRecord}
      />
    </div>
  );
}

function HeroPanel({
  config,
  records,
}: {
  config: PageConfig;
  records: AdminRecord[];
}) {
  return (
    <article className="min-w-0 rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="label-caps text-[var(--secondary)]">{config.eyebrow}</p>
          <h1 className="title-serif mt-4 max-w-2xl text-[clamp(2.35rem,3.6vw,3.45rem)] font-normal leading-[0.98] text-[var(--on-surface)]">
            {config.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-[1.7] text-[var(--on-surface-dim)]">
            {config.description}
          </p>
        </div>
        <span className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]">
          {(() => {
            const PageIcon = config.icon;
            return <PageIcon size={24} stroke={1.7} />;
          })()}
        </span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {records.slice(0, 3).map((record) => (
          <div
            key={record.id}
            className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3"
          >
            <p className="font-mono text-[1.25rem] text-[var(--on-surface)]">
              {record.metric}
            </p>
            <p className="mt-1 truncate text-[0.78rem] text-[var(--on-surface-dim)]">
              {record.title}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function InsightPanel({
  config,
  records,
}: {
  config: PageConfig;
  records: AdminRecord[];
}) {
  const aggregate = records.map(
    (_, index) => 8 + index * 4 + (index % 2 === 0 ? 3 : 0),
  );
  const donut = [
    { label: "Admin", value: 28, tone: "primary" as const },
    { label: "Client", value: 22, tone: "secondary" as const },
    { label: "Developer", value: 18, tone: "success" as const },
    { label: "Pending", value: 12, tone: "muted" as const },
  ];

  return (
    <article className="min-w-0 rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
            Workspace signal
          </p>
          <p className="mt-1 text-[0.82rem] text-[var(--on-surface-dim)]">
            Current activity across records, stakeholders, and admin actions.
          </p>
        </div>
        <StatusBadge label="Live" tone="active" />
      </div>
      <div className="my-8">
        {config.chart === "bar" ? (
          <DashboardBarChart data={aggregate} height={150} />
        ) : config.chart === "donut" ? (
          <DashboardDonutChart data={donut} height={150} legend="inline" />
        ) : (
          <DashboardLineChart data={aggregate} height={150} variant="area" />
        )}
      </div>
    </article>
  );
}

function RecordRow({
  icon: IconComponent,
  onAdvance,
  onDelete,
  onSelect,
  record,
  selected,
}: {
  icon: Icon;
  onAdvance: () => void;
  onDelete: () => void;
  onSelect: () => void;
  record: AdminRecord;
  selected: boolean;
}) {
  return (
    <article
      className={cn(
        "grid gap-3 rounded-2xl border p-3 transition-colors duration-300 sm:grid-cols-[minmax(0,1fr)_auto]",
        selected
          ? "border-[color-mix(in_srgb,var(--secondary)_45%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_8%,var(--surface))]"
          : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[color-mix(in_srgb,var(--secondary)_28%,var(--glass-border))]",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="grid min-w-0 cursor-pointer grid-cols-[2.75rem_minmax(0,1fr)] gap-3 text-left"
      >
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]">
          <IconComponent size={19} stroke={1.7} />
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-[0.94rem] font-medium text-[var(--on-surface)]">
              {record.title}
            </span>
            <StatusBadge
              label={record.status}
              tone={statusTone(record.status)}
            />
          </span>
          <span className="mt-1 block text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
            {record.subtitle}
          </span>
          <span className="mt-2 flex flex-wrap gap-1.5">
            {record.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--glass-border)] px-2 py-1 text-[0.68rem] text-[var(--on-surface-dim)]"
              >
                {tag}
              </span>
            ))}
          </span>
        </span>
      </button>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <div className="text-right">
          <p className="font-mono text-[0.86rem] text-[var(--on-surface)]">
            {record.metric}
          </p>
          <p className="text-[0.72rem] text-[var(--on-surface-dim)]">
            {record.meta}
          </p>
        </div>
        <button
          type="button"
          aria-label={`Advance ${record.title}`}
          onClick={onAdvance}
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
        >
          <IconCheck size={16} stroke={1.7} />
        </button>
        <button
          type="button"
          aria-label={`Archive ${record.title}`}
          onClick={onDelete}
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--error)]"
        >
          <IconTrash size={16} stroke={1.7} />
        </button>
      </div>
    </article>
  );
}

function RelationPanel({ record }: { record: AdminRecord | null }) {
  if (!record) return null;
  const relations = [
    {
      label: "Admin owner",
      value: record.relation.admin,
      icon: IconShieldCheck,
    },
    { label: "Client", value: record.relation.client, icon: IconBuilding },
    { label: "Developer", value: record.relation.developer, icon: IconCode },
    { label: "Project", value: record.relation.project, icon: IconRocket },
  ];

  return (
    <article className="rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4">
      <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
        Relationship map
      </p>
      <p className="mt-1 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
        Admin, client, developer, and project context stay visible for every
        action.
      </p>
      <div className="mt-4 grid gap-2">
        {relations.map((relation) => (
          <div
            key={relation.label}
            className="flex items-center gap-3 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]">
              {(() => {
                const RelationIcon = relation.icon;
                return <RelationIcon size={17} stroke={1.7} />;
              })()}
            </span>
            <div className="min-w-0">
              <p className="text-[0.7rem] uppercase tracking-[0.08em] text-[var(--on-surface-dim)]">
                {relation.label}
              </p>
              <p className="truncate text-[0.86rem] font-medium text-[var(--on-surface)]">
                {relation.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function ActionRail({
  config,
  onCreate,
  onOpen,
  record,
}: {
  config: PageConfig;
  onCreate: () => void;
  onOpen: () => void;
  record: AdminRecord | null;
}) {
  return (
    <article className="rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4">
      <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
        Admin actions
      </p>
      <div className="mt-4 grid gap-2">
        {[
          { label: config.primaryAction, icon: IconPlus, action: onCreate },
          { label: "Open detail drawer", icon: IconArrowRight, action: onOpen },
          {
            label: "Create stakeholder note",
            icon: IconMessageCircle,
            action: onCreate,
          },
        ].map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.action}
            className="flex min-h-10 cursor-pointer items-center justify-between rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-left text-[0.84rem] font-medium text-[var(--on-surface)] transition-colors hover:border-[color-mix(in_srgb,var(--secondary)_32%,var(--glass-border))]"
          >
            <span className="inline-flex items-center gap-2">
              {(() => {
                const ActionIcon = action.icon;
                return <ActionIcon size={16} stroke={1.7} />;
              })()}
              {action.label}
            </span>
            <IconArrowRight size={14} stroke={1.7} />
          </button>
        ))}
      </div>
      {record && (
        <p className="mt-4 rounded-xl bg-[var(--glass-bg)] p-3 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">
          Selected:{" "}
          <span className="text-[var(--on-surface)]">{record.title}</span>
        </p>
      )}
    </article>
  );
}

function StakeholderChatPanel({
  messages,
  onSend,
}: {
  messages: Array<{
    author: string;
    role: string;
    message: string;
    time: string;
  }>;
  onSend: (message: string) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <article className="rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
            Project support chat
          </p>
          <p className="mt-1 text-[0.8rem] text-[var(--on-surface-dim)]">
            Admin, client, and developer thread.
          </p>
        </div>
        <IconMessageCircle
          className="text-[var(--secondary)]"
          size={20}
          stroke={1.7}
        />
      </div>
      <div className="mt-4 grid max-h-72 gap-3 overflow-y-auto pr-1">
        {messages.map((message, index) => (
          <div
            key={`${message.time}-${index}`}
            className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.82rem] font-medium text-[var(--on-surface)]">
                {message.author}
              </p>
              <span className="font-mono text-[0.66rem] text-[var(--on-surface-dim)]">
                {message.time}
              </span>
            </div>
            <p className="mt-1 text-[0.68rem] uppercase tracking-[0.08em] text-[var(--secondary)]">
              {message.role}
            </p>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
              {message.message}
            </p>
          </div>
        ))}
      </div>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const message = draft.trim();
          if (!message) return;
          onSend(message);
          setDraft("");
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Send update to stakeholders..."
          className="h-10 min-w-0 flex-1 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.84rem] text-[var(--on-surface)] outline-none focus:border-[var(--secondary)]"
        />
        <button
          type="submit"
          aria-label="Send stakeholder message"
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-[var(--on-surface)] text-[var(--bg)]"
        >
          <IconSend size={16} stroke={1.8} />
        </button>
      </form>
    </article>
  );
}

function AuthIntakePanel({ records }: { records: AdminAuthIntakeRecord[] }) {
  const displayRecords = records.length
    ? records
    : [
        {
          id: "demo-client",
          name: "Maya Kamau",
          email: "client@andishi.dev",
          role: "client" as const,
          status: "active" as const,
          emailVerified: true,
          organizationId: "demo-org",
          engineerId: null,
          createdAt: new Date().toISOString(),
          lastLoginAt: null,
        },
        {
          id: "demo-dev",
          name: "Amina Otieno",
          email: "developer@andishi.dev",
          role: "developer" as const,
          status: "active" as const,
          emailVerified: true,
          organizationId: null,
          engineerId: "demo-engineer",
          createdAt: new Date().toISOString(),
          lastLoginAt: null,
        },
      ];

  return (
    <section className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-[var(--glass-border)] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[1rem] font-medium text-[var(--on-surface)]">
            Auth intake and relationships
          </p>
          <p className="mt-1 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
            Registration inputs from auth are visible here with their created
            client or developer relationship IDs.
          </p>
        </div>
        <StatusBadge
          label={`${displayRecords.length} records`}
          tone="pending"
        />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {displayRecords.map((record) => (
          <article
            key={record.id}
            className="min-w-0 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[0.94rem] font-medium text-[var(--on-surface)]">
                  {record.name}
                </p>
                <p className="mt-1 truncate text-[0.8rem] text-[var(--on-surface-dim)]">
                  {record.email}
                </p>
              </div>
              <StatusBadge
                label={record.role}
                tone={record.role === "admin" ? "active" : "pending"}
              />
            </div>
            <div className="mt-4 grid gap-2 font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
              <p>
                Status:{" "}
                <span className="text-[var(--on-surface)]">
                  {record.status}
                </span>
              </p>
              <p>
                Email verified:{" "}
                <span className="text-[var(--on-surface)]">
                  {record.emailVerified ? "yes" : "no"}
                </span>
              </p>
              <p>
                Organization:{" "}
                <span className="text-[var(--on-surface)]">
                  {record.organizationId ?? "-"}
                </span>
              </p>
              <p>
                Engineer:{" "}
                <span className="text-[var(--on-surface)]">
                  {record.engineerId ?? "-"}
                </span>
              </p>
              <p>
                Created:{" "}
                <span className="text-[var(--on-surface)]">
                  {new Date(record.createdAt).toLocaleDateString()}
                </span>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminCreateModal({
  config,
  onClose,
  onSubmit,
  open,
}: {
  config: PageConfig;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  open: boolean;
}) {
  useEffect(() => {
    if (!open) return;
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
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-6 backdrop-blur-xl">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <form
        action={onSubmit}
        className="relative w-full max-w-3xl rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_42%,transparent)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-caps text-[var(--secondary)]">
              {config.eyebrow}
            </p>
            <h2 className="title-serif mt-2 text-[1.35rem] font-medium text-[var(--on-surface)]">
              {config.primaryAction}
            </h2>
            <p className="mt-2 max-w-2xl text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
              Create a mock operational record with the same shape the backend
              mutation will eventually persist.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--glass-border)] px-3 py-2 text-[0.78rem] font-medium text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
          >
            Close
          </button>
        </div>
        <div className="my-8 grid gap-4 sm:grid-cols-2">
          <FormField
            label="Title"
            name="title"
            placeholder="Operational record title"
          />
          <FormField label="Owner" name="owner" placeholder="Dennis" />
          <FormField
            label="Status"
            name="status"
            placeholder={config.filters[1] ?? "Active"}
          />
          <FormField
            label="Stakeholder"
            name="stakeholder"
            placeholder="Client, engineer, or internal team"
          />
          <label className="sm:col-span-2">
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">
              Admin note
            </span>
            <textarea
              name="note"
              rows={4}
              placeholder="Add context, next step, or risk note..."
              className="mt-2 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--secondary)]"
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
            Save record
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <label>
      <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">
        {label}
      </span>
      <input
        name={name}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--secondary)]"
      />
    </label>
  );
}

function RecordDetails({
  config,
  onAdvance,
  record,
}: {
  config: PageConfig;
  onAdvance: () => void;
  record: AdminRecord;
}) {
  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <StatusBadge
              label={record.status}
              tone={statusTone(record.status)}
            />
            <h3 className="mt-3 text-[1.25rem] font-medium text-[var(--on-surface)]">
              {record.title}
            </h3>
            <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
              {record.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onAdvance}
            className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.84rem] font-medium text-[var(--bg)]"
          >
            Advance
            <IconArrowRight size={15} stroke={1.8} />
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-4">
          <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
            Action timeline
          </p>
          <div className="mt-4 grid gap-3">
            {record.activity.map((item, index) => (
              <div
                key={item}
                className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3"
              >
                <span className="mt-1 grid h-6 w-6 place-items-center rounded-full border border-[var(--glass-border)] font-mono text-[0.65rem] text-[var(--secondary)]">
                  {index + 1}
                </span>
                <p className="text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-4">
          <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
            Data preview
          </p>
          <div className="mt-4">
            {config.chart === "donut" ? (
              <DashboardDonutChart
                data={[
                  { label: "Admin", value: 4, tone: "primary" },
                  { label: "Client", value: 3, tone: "secondary" },
                  { label: "Developer", value: 2, tone: "success" },
                ]}
                height={180}
                legend="inline"
              />
            ) : config.chart === "bar" ? (
              <DashboardBarChart data={[2, 4, 7, 5, 9, 11]} height={180} />
            ) : (
              <DashboardLineChart
                data={[12, 14, 13, 18, 22, 26]}
                height={180}
                variant="area"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function nextStatusFor(kind: AdminWorkspaceKind, status: string) {
  const flows: Record<AdminWorkspaceKind, string[]> = {
    briefs: ["Submitted", "Under review", "Matching", "Shortlisted", "Closed"],
    clients: ["Prospect", "Onboarding", "Active", "Expansion"],
    engineers: ["Invited", "Vetting", "Verified", "Available"],
    matches: ["Proposed", "Client reviewing", "Intro scheduled", "Accepted"],
    placements: ["Draft", "Onboarding", "Active", "Renewal"],
    revenue: ["Draft", "Sent", "Paid", "Reconciled"],
    content: ["Draft", "Review", "Published", "Refresh"],
    settings: ["Draft", "Review", "Active", "Locked"],
    support: ["Open", "Waiting", "Resolved", "Escalated"],
  };
  const flow = flows[kind];
  const index = flow.findIndex(
    (item) => item.toLowerCase() === status.toLowerCase(),
  );
  return flow[index + 1] ?? flow[0];
}

function buildPageConfig(kind: AdminWorkspaceKind): PageConfig {
  const org = dashboardDemoData.organizations[0];
  const engineer = dashboardDemoData.engineers[0];
  const engineerTwo = dashboardDemoData.engineers[1];
  const brief = dashboardDemoData.briefs[0];
  const briefTwo = dashboardDemoData.briefs[1];
  const match = dashboardDemoData.matches[0];
  const project = dashboardDemoData.projects[0];
  const projectTwo = dashboardDemoData.projects[1];
  const invoice = dashboardDemoData.invoices[0];
  const commonRelation = {
    admin: "Dennis Munge",
    client: org.name,
    developer: engineer.name,
    project: project.title,
  };

  const configs: Record<AdminWorkspaceKind, PageConfig> = {
    briefs: {
      title: "Hiring briefs",
      eyebrow: "Demand intake",
      description:
        "Triage client demand, clarify requirements, and move briefs into matching with accountable owners.",
      primaryAction: "New brief",
      secondaryAction: "Review queue",
      searchPlaceholder: "Search briefs, clients, stacks...",
      icon: IconFileText,
      accent: "Briefs",
      chart: "bar",
      filters: [
        "Submitted",
        "Under review",
        "Matching",
        "Shortlisted",
        "Closed",
      ],
      kpis: [
        {
          label: "Open briefs",
          value: "18",
          trend: "4 need admin review",
          icon: IconFileText,
          data: [10, 12, 14, 13, 18],
        },
        {
          label: "Avg review",
          value: "18h",
          trend: "6h faster this week",
          icon: IconClock,
          data: [30, 28, 22, 19, 18],
        },
        {
          label: "Ready to match",
          value: "9",
          trend: "3 AI focused",
          icon: IconGitMerge,
          data: [4, 6, 7, 8, 9],
        },
        {
          label: "Client response",
          value: "82%",
          trend: "+7% vs last month",
          icon: IconUserCheck,
          data: [64, 70, 74, 78, 82],
        },
      ],
      records: [
        recordFrom(
          brief.id,
          brief.title,
          org.name,
          "Matching",
          "Dennis",
          "5d SLA",
          brief.timeline,
          brief.description,
          brief.stackTags,
          commonRelation,
        ),
        recordFrom(
          briefTwo.id,
          briefTwo.title,
          org.name,
          "Under review",
          "Talent ops",
          "24h",
          briefTwo.timeline,
          briefTwo.description,
          briefTwo.stackTags,
          {
            ...commonRelation,
            developer: engineerTwo.name,
            project: projectTwo.title,
          },
        ),
        recordFrom(
          "brief-cloud",
          "AWS platform engineer for migration review",
          "Cloud audit",
          "Submitted",
          "Unassigned",
          "New",
          "Start in June",
          "Migration audit, cost controls, and deployment review for a B2B SaaS platform.",
          ["AWS", "Terraform", "Security"],
          commonRelation,
        ),
      ],
    },
    clients: {
      title: "Clients",
      eyebrow: "Client operations",
      description:
        "Manage active accounts, stakeholder context, billing posture, and open work across the client portfolio.",
      primaryAction: "Add client",
      secondaryAction: "Sync accounts",
      searchPlaceholder: "Search clients, contacts, industries...",
      icon: IconBuilding,
      accent: "Clients",
      chart: "donut",
      filters: ["Prospect", "Onboarding", "Active", "Expansion"],
      kpis: [
        {
          label: "Active clients",
          value: "37",
          trend: "5 in expansion",
          icon: IconBuilding,
          data: [24, 28, 31, 34, 37],
        },
        {
          label: "Open briefs",
          value: "18",
          trend: "12 in motion",
          icon: IconFileText,
          data: [9, 10, 13, 16, 18],
        },
        {
          label: "Client health",
          value: "4.8",
          trend: "Avg satisfaction",
          icon: IconShieldCheck,
          data: [4, 4.2, 4.6, 4.7, 4.8],
        },
        {
          label: "Revenue exposure",
          value: "$42k",
          trend: "This month",
          icon: IconCurrencyDollar,
          data: [18, 22, 30, 36, 42],
        },
      ],
      records: [
        recordFrom(
          org.id,
          org.name,
          org.industry,
          "Active",
          "Dennis",
          "2 briefs",
          "Series A",
          "Climate fintech account with AI support and payments reconciliation workstreams.",
          ["Climate", "Fintech", "Series A"],
          commonRelation,
        ),
        recordFrom(
          "client-nova",
          "Nova Health",
          "Health SaaS",
          "Onboarding",
          "Maya",
          "1 intro",
          "Seed",
          "Preparing first technical brief and stakeholder alignment.",
          ["Health", "SaaS"],
          commonRelation,
        ),
        recordFrom(
          "client-soko",
          "SokoPay",
          "Commerce scale-up",
          "Expansion",
          "Dennis",
          "$18k",
          "Growth",
          "Finance operations team reviewing reconciliation scope.",
          ["Payments", "Commerce"],
          commonRelation,
        ),
      ],
    },
    engineers: {
      title: "Engineer network",
      eyebrow: "Talent supply",
      description:
        "Operate the vetted engineer network with availability, domain strength, placement readiness, and profile quality in one place.",
      primaryAction: "Invite engineer",
      secondaryAction: "Refresh supply",
      searchPlaceholder: "Search engineers, skills, locations...",
      icon: IconUsersGroup,
      accent: "Engineers",
      chart: "donut",
      filters: ["Invited", "Vetting", "Verified", "Available"],
      kpis: [
        {
          label: "Available",
          value: "148",
          trend: "12 newly ready",
          icon: IconUsersGroup,
          data: [118, 126, 133, 141, 148],
        },
        {
          label: "Vetting",
          value: "21",
          trend: "8 final review",
          icon: IconShieldCheck,
          data: [15, 18, 21, 20, 21],
        },
        {
          label: "AI depth",
          value: "34",
          trend: "6 senior leads",
          icon: IconCode,
          data: [20, 25, 28, 30, 34],
        },
        {
          label: "Profile quality",
          value: "92%",
          trend: "+4% complete",
          icon: IconUserCheck,
          data: [78, 82, 86, 90, 92],
        },
      ],
      records: [
        recordFrom(
          engineer.id,
          engineer.name,
          engineer.role,
          "Available",
          "Talent ops",
          "8 yrs",
          engineer.location,
          engineer.bio,
          engineer.skills,
          commonRelation,
        ),
        recordFrom(
          engineerTwo.id,
          engineerTwo.name,
          engineerTwo.role,
          "Verified",
          "Dennis",
          "9 yrs",
          engineerTwo.location,
          engineerTwo.bio,
          engineerTwo.skills,
          {
            ...commonRelation,
            developer: engineerTwo.name,
            project: projectTwo.title,
          },
        ),
        recordFrom(
          "eng-zola",
          "Zola Ndlovu",
          "Cloud Platform Engineer",
          "Vetting",
          "Talent ops",
          "7 yrs",
          "Cape Town",
          "Platform engineer focused on AWS reliability and IaC foundations.",
          ["AWS", "Terraform", "Kubernetes"],
          commonRelation,
        ),
      ],
    },
    matches: {
      title: "Matching pipeline",
      eyebrow: "Client and talent fit",
      description:
        "Coordinate proposed matches, client review, intro scheduling, and acceptance flow with full relationship context.",
      primaryAction: "Propose match",
      secondaryAction: "Schedule intros",
      searchPlaceholder: "Search matches, briefs, engineers...",
      icon: IconGitMerge,
      accent: "Matches",
      chart: "bar",
      filters: ["Proposed", "Client reviewing", "Intro scheduled", "Accepted"],
      support: true,
      kpis: [
        {
          label: "Strong matches",
          value: "8",
          trend: "4 client reviewing",
          icon: IconGitMerge,
          data: [2, 3, 5, 7, 8],
        },
        {
          label: "Intro slots",
          value: "11",
          trend: "3 today",
          icon: IconCalendarEvent,
          data: [4, 5, 8, 9, 11],
        },
        {
          label: "Acceptance",
          value: "63%",
          trend: "+9% this month",
          icon: IconCheck,
          data: [42, 48, 54, 58, 63],
        },
        {
          label: "Time to intro",
          value: "2.4d",
          trend: "0.6d faster",
          icon: IconClock,
          data: [4, 3.5, 3, 2.7, 2.4],
        },
      ],
      records: [
        recordFrom(
          match.id,
          "Amina / AI support workflow",
          brief.title,
          "Client reviewing",
          "Dennis",
          "Strong",
          "2 preferred slots",
          match.adminNotes,
          ["AI", "RAG", "Client review"],
          commonRelation,
        ),
        recordFrom(
          "match-kwame",
          "Kwame / payments reconciliation",
          briefTwo.title,
          "Proposed",
          "Talent ops",
          "Good",
          "Awaiting client",
          "Payments and SaaS rewrite fit for finance dashboard scope.",
          ["Payments", "Full-stack"],
          {
            ...commonRelation,
            developer: engineerTwo.name,
            project: projectTwo.title,
          },
        ),
        recordFrom(
          "match-zola",
          "Zola / AWS migration",
          "AWS platform engineer brief",
          "Intro scheduled",
          "Dennis",
          "Wed",
          "Calendar hold",
          "Cloud platform intro scheduled with client infra lead.",
          ["Cloud", "AWS"],
          commonRelation,
        ),
      ],
    },
    placements: {
      title: "Placements",
      eyebrow: "Delivery operations",
      description:
        "Manage active placements, project health, stakeholder support, onboarding, renewal risk, and delivery cadence.",
      primaryAction: "Create placement",
      secondaryAction: "Check health",
      searchPlaceholder: "Search placements, projects, stakeholders...",
      icon: IconBriefcase,
      accent: "Placements",
      chart: "line",
      filters: ["Draft", "Onboarding", "Active", "Renewal"],
      support: true,
      kpis: [
        {
          label: "Active placements",
          value: "24",
          trend: "1 starts next week",
          icon: IconBriefcase,
          data: [12, 16, 18, 22, 24],
        },
        {
          label: "Delivery health",
          value: "91%",
          trend: "2 watchlist",
          icon: IconShieldCheck,
          data: [78, 82, 86, 89, 91],
        },
        {
          label: "Weekly hours",
          value: "612",
          trend: "+38 planned",
          icon: IconClock,
          data: [420, 460, 510, 574, 612],
        },
        {
          label: "Renewals",
          value: "6",
          trend: "2 in negotiation",
          icon: IconRefresh,
          data: [2, 3, 4, 5, 6],
        },
      ],
      records: [
        recordFrom(
          project.id,
          project.title,
          `${org.name} / ${engineer.name}`,
          "Active",
          "Dennis",
          "32h/wk",
          project.targetDate,
          project.description,
          project.stackTags,
          commonRelation,
        ),
        recordFrom(
          projectTwo.id,
          projectTwo.title,
          `${org.name} / ${engineerTwo.name}`,
          "Onboarding",
          "Ops",
          "Scoping",
          projectTwo.targetDate,
          projectTwo.description,
          projectTwo.stackTags,
          {
            ...commonRelation,
            developer: engineerTwo.name,
            project: projectTwo.title,
          },
        ),
        recordFrom(
          "project-mobile",
          "Mobile onboarding refresh",
          "Fintech client / Sarah",
          "Renewal",
          "Maya",
          "Risk",
          "Review Friday",
          "Mobile app sprint needs renewal decision and support escalation.",
          ["Mobile", "React Native"],
          commonRelation,
        ),
      ],
    },
    revenue: {
      title: "Revenue",
      eyebrow: "Billing and finance",
      description:
        "Operate invoices, payment status, reconciliation, payout exposure, and revenue movement by client and project.",
      primaryAction: "Issue invoice",
      secondaryAction: "Reconcile",
      searchPlaceholder: "Search invoices, clients, amounts...",
      icon: IconCurrencyDollar,
      accent: "Revenue",
      chart: "bar",
      filters: ["Draft", "Sent", "Paid", "Reconciled"],
      kpis: [
        {
          label: "MTD revenue",
          value: "$284k",
          trend: "+18.6% vs Apr",
          icon: IconCurrencyDollar,
          data: [185, 196, 212, 205, 248, 284],
        },
        {
          label: "Outstanding",
          value: "$42k",
          trend: "$7.8k sent",
          icon: IconReceipt,
          data: [18, 26, 31, 44, 42],
        },
        {
          label: "Paid invoices",
          value: "19",
          trend: "6 this week",
          icon: IconCheck,
          data: [9, 12, 14, 17, 19],
        },
        {
          label: "Payouts due",
          value: "$96k",
          trend: "Next cycle",
          icon: IconUsers,
          data: [54, 67, 73, 88, 96],
        },
      ],
      records: [
        recordFrom(
          invoice.id,
          invoice.invoiceNumber,
          org.name,
          "Sent",
          "Finance",
          "$7.8k",
          "May 2026",
          "Invoice issued for AI support workflow delivery and timesheet approval.",
          ["Invoice", "USD", "AI"],
          commonRelation,
        ),
        recordFrom(
          "inv-002",
          "AND-2026-0002",
          "SokoPay",
          "Draft",
          "Finance",
          "$12.4k",
          "June 2026",
          "Draft invoice pending reconciliation export.",
          ["Payments", "Draft"],
          commonRelation,
        ),
        recordFrom(
          "inv-003",
          "AND-2026-0003",
          "Nova Health",
          "Paid",
          "Finance",
          "$9.1k",
          "May 2026",
          "Paid invoice with developer payout scheduled.",
          ["Paid", "Health"],
          commonRelation,
        ),
      ],
    },
    content: {
      title: "Content operations",
      eyebrow: "Market proof",
      description:
        "Manage case studies, engineer stories, hiring content, and proof artifacts that support pipeline conversion.",
      primaryAction: "Create content",
      secondaryAction: "Review drafts",
      searchPlaceholder: "Search content, campaigns, owners...",
      icon: IconEdit,
      accent: "Content",
      chart: "line",
      filters: ["Draft", "Review", "Published", "Refresh"],
      kpis: [
        {
          label: "Published",
          value: "28",
          trend: "3 this month",
          icon: IconEdit,
          data: [18, 20, 23, 25, 28],
        },
        {
          label: "Drafts",
          value: "9",
          trend: "4 need review",
          icon: IconFileText,
          data: [5, 6, 7, 8, 9],
        },
        {
          label: "Case studies",
          value: "6",
          trend: "2 in pipeline",
          icon: IconRocket,
          data: [2, 3, 4, 5, 6],
        },
        {
          label: "Conversion lift",
          value: "14%",
          trend: "From proof pages",
          icon: IconArrowRight,
          data: [7, 8, 10, 12, 14],
        },
      ],
      records: [
        recordFrom(
          "content-ai",
          "AI support workflow case study",
          org.name,
          "Review",
          "Content",
          "80%",
          "Draft",
          "Case study for RAG support workflow and Andishi delivery model.",
          ["Case study", "AI"],
          commonRelation,
        ),
        recordFrom(
          "content-engineer",
          "Amina engineer story",
          engineer.name,
          "Draft",
          "Maya",
          "New",
          "Interview",
          "Profile story highlighting senior African AI product engineering.",
          ["Engineer", "Story"],
          commonRelation,
        ),
        recordFrom(
          "content-hiring",
          "Hiring senior AI engineers guide",
          "Demand gen",
          "Published",
          "Content",
          "Live",
          "SEO",
          "Guide for CTOs evaluating senior AI workflow engineers.",
          ["Guide", "Hiring"],
          commonRelation,
        ),
      ],
    },
    settings: {
      title: "Workspace settings",
      eyebrow: "Admin controls",
      description:
        "Control users, roles, operational preferences, notification routes, integrations, and workspace security posture.",
      primaryAction: "Add admin user",
      secondaryAction: "Audit changes",
      searchPlaceholder: "Search settings, users, policies...",
      icon: IconShieldCheck,
      accent: "Settings",
      chart: "donut",
      filters: ["Draft", "Review", "Active", "Locked"],
      kpis: [
        {
          label: "Admin users",
          value: "4",
          trend: "2 owner level",
          icon: IconUsers,
          data: [2, 3, 3, 4],
        },
        {
          label: "Policies",
          value: "12",
          trend: "1 review due",
          icon: IconShieldCheck,
          data: [8, 9, 10, 12],
        },
        {
          label: "Integrations",
          value: "6",
          trend: "5 healthy",
          icon: IconAdjustmentsHorizontal,
          data: [3, 4, 5, 6],
        },
        {
          label: "Audit events",
          value: "148",
          trend: "24h window",
          icon: IconClock,
          data: [80, 96, 112, 148],
        },
      ],
      records: [
        recordFrom(
          "setting-role",
          "Role access matrix",
          "Admin/client/developer permissions",
          "Active",
          "Dennis",
          "RBAC",
          "Updated",
          "Permission map for route groups, action access, and data boundaries.",
          ["RBAC", "Security"],
          commonRelation,
        ),
        recordFrom(
          "setting-neon",
          "Neon database connection",
          "Production data source",
          "Active",
          "DevOps",
          "Healthy",
          "Live",
          "Environment-backed database connection and schema migration path.",
          ["Database", "Neon"],
          commonRelation,
        ),
        recordFrom(
          "setting-alerts",
          "Operational alerts",
          "Notifications and routing",
          "Review",
          "Ops",
          "3 rules",
          "Draft",
          "Notification rules for brief SLA, payments, and intro scheduling.",
          ["Alerts", "Ops"],
          commonRelation,
        ),
      ],
    },
    support: {
      title: "Support resolver",
      eyebrow: "Admin support desk",
      description:
        "Resolve client and developer support threads with project, placement, and stakeholder context attached.",
      primaryAction: "Open support case",
      secondaryAction: "Refresh inbox",
      searchPlaceholder: "Search support cases, stakeholders, projects...",
      icon: IconMessageCircle,
      accent: "Support",
      chart: "bar",
      filters: ["Open", "Waiting", "Resolved", "Escalated"],
      support: true,
      kpis: [
        {
          label: "Open cases",
          value: "14",
          trend: "5 project-linked",
          icon: IconMessageCircle,
          data: [7, 9, 11, 10, 14],
        },
        {
          label: "Median response",
          value: "18m",
          trend: "6m faster today",
          icon: IconClock,
          data: [34, 29, 24, 21, 18],
        },
        {
          label: "Resolved",
          value: "31",
          trend: "This week",
          icon: IconCheck,
          data: [12, 17, 20, 27, 31],
        },
        {
          label: "Escalations",
          value: "3",
          trend: "All assigned",
          icon: IconShieldCheck,
          data: [1, 2, 2, 4, 3],
        },
      ],
      records: [
        recordFrom(
          "support-client-ai",
          "Client needs intro-slot update",
          "Kijani Analytics / AI support workflow",
          "Open",
          "Dennis",
          "18m",
          "Client thread",
          "Client asked for confirmation on next intro windows and profile availability.",
          ["Client", "Intro", "Project"],
          commonRelation,
        ),
        recordFrom(
          "support-dev-pay",
          "Developer needs scope clarification",
          "Kwame / payments reconciliation",
          "Waiting",
          "Ops",
          "1h",
          "Developer thread",
          "Developer needs admin clarification before estimating reconciliation milestones.",
          ["Developer", "Scope"],
          {
            ...commonRelation,
            developer: engineerTwo.name,
            project: projectTwo.title,
          },
        ),
        recordFrom(
          "support-billing",
          "Invoice approval question",
          "Finance / Kijani Analytics",
          "Resolved",
          "Finance",
          "Done",
          "Billing thread",
          "Client billing contact asked about timesheet approvals tied to the invoice.",
          ["Billing", "Invoice"],
          commonRelation,
        ),
      ],
    },
  };

  return configs[kind];
}

function recordFrom(
  id: string,
  title: string,
  subtitle: string,
  status: string,
  owner: string,
  metric: string,
  meta: string,
  description: string | undefined,
  tags: readonly string[],
  relation: AdminRecord["relation"],
): AdminRecord {
  return {
    id,
    title,
    subtitle,
    status,
    owner,
    metric,
    meta,
    description: description ?? "No description available.",
    tags: [...tags],
    relation,
    activity: [
      `${owner} owns next step`,
      `${status} status confirmed`,
      `${relation.client} and ${relation.developer} relationship mapped`,
    ],
  };
}
