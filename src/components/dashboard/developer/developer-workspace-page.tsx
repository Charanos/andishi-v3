"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconAdjustmentsHorizontal,
  IconArrowRight,
  IconBriefcase,
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconCode,
  IconCoin,
  IconFileText,
  IconGitMerge,
  IconMessageCircle,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSend,
  IconSettings,
  IconShieldCheck,
  IconTrash,
  IconUserCircle,
  IconWallet,
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
import {
  OperationalDataTable,
  type OperationalTableColumn,
} from "@/components/dashboard/shared/operational-data-table";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { TimeTracker } from "@/components/dashboard/shared/time-tracker";
import { dashboardDemoData } from "@/data/dashboard-mock";

export type DeveloperWorkspaceKind =
  | "overview"
  | "projects"
  | "time"
  | "profile"
  | "earnings"
  | "messages"
  | "settings";

type DeveloperRecord = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  owner: string;
  metric: string;
  due: string;
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

type DeveloperConfig = {
  title: string;
  eyebrow: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
  searchPlaceholder: string;
  tableTitle: string;
  tableDescription: string;
  icon: Icon;
  chart: "line" | "bar" | "donut";
  filters: string[];
  kpis: Array<{
    label: string;
    value: string;
    trend: string;
    icon: Icon;
    data: number[];
  }>;
  records: DeveloperRecord[];
  actionHint: string;
  timer?: boolean;
};

const statusTone = (status: string) => {
  const normalized = status.toLowerCase();
  if (
    normalized.includes("active") ||
    normalized.includes("approved") ||
    normalized.includes("available") ||
    normalized.includes("paid") ||
    normalized.includes("verified") ||
    normalized.includes("submitted")
  ) {
    return "active";
  }
  if (
    normalized.includes("blocked") ||
    normalized.includes("overdue") ||
    normalized.includes("rejected") ||
    normalized.includes("flagged")
  ) {
    return "overdue";
  }
  return "pending";
};

export function DeveloperWorkspacePage({
  kind,
}: {
  kind: DeveloperWorkspaceKind;
}) {
  const baseConfig = useMemo(() => buildDeveloperConfig(kind), [kind]);
  const [records, setRecords] = useState<DeveloperRecord[]>(baseConfig.records);
  const [selectedRecord, setSelectedRecord] = useState<DeveloperRecord | null>(
    baseConfig.records[0] ?? null,
  );
  const [drawerRecord, setDrawerRecord] = useState<DeveloperRecord | null>(
    null,
  );
  const [confirmRecord, setConfirmRecord] = useState<DeveloperRecord | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [threadMessages, setThreadMessages] = useState([
    {
      author: "Dennis",
      role: "Andishi admin",
      message:
        "Keep blockers, timesheets, and project questions inside the project thread.",
      time: "09:18",
    },
    {
      author: "Amina",
      role: "Developer",
      message:
        "Evaluation trace schema is ready for review after today's implementation pass.",
      time: "10:04",
    },
  ]);

  useEffect(() => {
    const resetId = window.setTimeout(() => {
      setRecords(baseConfig.records);
      setSelectedRecord(baseConfig.records[0] ?? null);
      setDrawerRecord(null);
      setConfirmRecord(null);
      setModalOpen(false);
      setQuery("");
      setFilter("All");
    }, 0);

    return () => window.clearTimeout(resetId);
  }, [baseConfig]);

  const filteredRecords = records.filter((record) => {
    const searchable = `${record.title} ${record.subtitle} ${record.owner} ${record.status} ${record.tags.join(" ")}`;
    const matchesQuery = searchable.toLowerCase().includes(query.toLowerCase());
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

  const columns = useMemo<Array<OperationalTableColumn<DeveloperRecord>>>(
    () => [
      {
        key: "title",
        label: kind === "earnings" ? "Payout" : "Record",
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
      { key: "owner", label: kind === "profile" ? "Source" : "Owner" },
      { key: "metric", label: "Signal", mono: true },
      { key: "due", label: "Next step", hideOnMobile: true },
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
    [kind],
  );

  const addRecord = (formData: FormData) => {
    const title =
      String(formData.get("title") ?? "").trim() ||
      `${baseConfig.eyebrow} update`;
    const note =
      String(formData.get("note") ?? "").trim() || baseConfig.actionHint;
    const status =
      String(formData.get("status") ?? "").trim() ||
      baseConfig.filters[0] ||
      "Submitted";
    const created: DeveloperRecord = {
      id: `developer-${kind}-${Date.now()}`,
      title,
      subtitle: "Developer-created workspace action",
      status,
      owner: "Developer workspace",
      metric: "New",
      due: "Admin review",
      description: note,
      tags: [status, "Developer"],
      relation: defaultRelation(),
      activity: [
        "Developer action created",
        "Andishi admin notified",
        "Awaiting next update",
      ],
    };

    setRecords((current) => [created, ...current]);
    setSelectedRecord(created);
    setDrawerRecord(created);
    setModalOpen(false);
  };

  const advanceRecord = (record: DeveloperRecord) => {
    const nextStatus = nextDeveloperStatus(kind, record.status);
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
        status={<StatusBadge label={baseConfig.eyebrow} tone="available" />}
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
              onClick={() => selected && setDrawerRecord(selected)}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] transition-colors duration-300 hover:bg-[var(--glass-bg)]"
            >
              <IconRefresh size={16} stroke={1.7} />
              {baseConfig.secondaryAction}
            </button>
          </>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_minmax(20rem,0.82fr)]">
        <DeveloperHero
          config={baseConfig}
          onSelect={(record) => {
            setSelectedRecord(record);
            setDrawerRecord(record);
          }}
          records={records}
        />
        <DeveloperSignalPanel config={baseConfig} records={records} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {baseConfig.kpis.map((kpi, index) => (
          <DeveloperKpiCard key={kpi.label} index={index} kpi={kpi} />
        ))}
      </section>

      {baseConfig.timer && (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <TimeTracker />
          <DeveloperAvailabilityPanel record={selected} />
        </section>
      )}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <OperationalDataTable
          columns={columns}
          description={baseConfig.tableDescription}
          empty="No developer workspace records match the current filter."
          onRowSelect={(record) => {
            setSelectedRecord(record);
            setDrawerRecord(record);
          }}
          rows={filteredRecords}
          title={baseConfig.tableTitle}
          toolbar={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <label className="relative min-w-0 sm:w-72">
                <span className="sr-only">Search developer records</span>
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
                <span className="sr-only">Filter developer records</span>
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
          }
        />

        <div className="grid min-w-0 gap-5">
          <DeveloperRelationPanel record={selected} />
          {kind === "messages" ? (
            <DeveloperThreadPanel
              messages={threadMessages}
              onSend={(message) =>
                setThreadMessages((current) => [
                  ...current,
                  { author: "Amina", role: "Developer", message, time: "Now" },
                ])
              }
            />
          ) : (
            <DeveloperActionRail
              config={baseConfig}
              onCreate={() => setModalOpen(true)}
              onOpen={() => selected && setDrawerRecord(selected)}
              record={selected}
            />
          )}
        </div>
      </section>

      <DeveloperActionModal
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
          <DeveloperRecordDetails
            config={baseConfig}
            onAdvance={() => advanceRecord(drawerRecord)}
            onArchive={() => setConfirmRecord(drawerRecord)}
            record={drawerRecord}
          />
        )}
      </EntityDrawer>

      <ConfirmDialog
        open={Boolean(confirmRecord)}
        title="Remove this developer record?"
        description={`This removes ${confirmRecord?.title ?? "the selected item"} from the visible developer workspace data for this session.`}
        confirmLabel="Remove"
        onCancel={() => setConfirmRecord(null)}
        onConfirm={removeRecord}
      />
    </div>
  );
}

function DeveloperHero({
  config,
  onSelect,
  records,
}: {
  config: DeveloperConfig;
  onSelect: (record: DeveloperRecord) => void;
  records: DeveloperRecord[];
}) {
  const HeroIcon = config.icon;

  return (
    <article className="min-w-0 rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="label-caps text-[var(--secondary)]">{config.eyebrow}</p>
          <h1 className="title-serif mt-4 max-w-3xl text-[clamp(2.35rem,3.5vw,3.35rem)] font-normal leading-[0.98] text-[var(--on-surface)]">
            {config.title}
          </h1>
          <p className="mt-4 max-w-3xl text-[0.95rem] leading-[1.7] text-[var(--on-surface-dim)]">
            {config.description}
          </p>
        </div>
        <span className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]">
          <HeroIcon size={24} stroke={1.7} />
        </span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {records.slice(0, 3).map((record) => (
          <button
            key={record.id}
            type="button"
            onClick={() => onSelect(record)}
            className="min-w-0 cursor-pointer rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-left transition-colors duration-300 hover:border-[color-mix(in_srgb,var(--secondary)_32%,var(--glass-border))]"
          >
            <p className="font-mono text-[1.18rem] text-[var(--on-surface)]">
              {record.metric}
            </p>
            <p className="mt-1 truncate text-[0.78rem] text-[var(--on-surface-dim)]">
              {record.title}
            </p>
          </button>
        ))}
      </div>
    </article>
  );
}

function DeveloperSignalPanel({
  config,
  records,
}: {
  config: DeveloperConfig;
  records: DeveloperRecord[];
}) {
  const signal = records.map(
    (_, index) => 10 + index * 6 + (index % 2 === 0 ? 5 : 0),
  );
  const donut = [
    { label: "Delivery", value: 38, tone: "primary" as const },
    { label: "Admin", value: 22, tone: "secondary" as const },
    { label: "Client", value: 18, tone: "success" as const },
    { label: "Pending", value: 8, tone: "muted" as const },
  ];

  return (
    <article className="min-w-0 rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
            Developer signal
          </p>
          <p className="mt-1 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
            Delivery movement, profile readiness, time logs, and payout
            operations.
          </p>
        </div>
        <StatusBadge label="Live" tone="active" />
      </div>
      <div className="my-8">
        {config.chart === "bar" ? (
          <DashboardBarChart data={signal} height={154} />
        ) : config.chart === "donut" ? (
          <DashboardDonutChart data={donut} height={154} legend="inline" />
        ) : (
          <DashboardLineChart data={signal} height={154} variant="area" />
        )}
      </div>
    </article>
  );
}

function DeveloperKpiCard({
  index,
  kpi,
}: {
  index: number;
  kpi: DeveloperConfig["kpis"][number];
}) {
  const KpiIcon = kpi.icon;

  return (
    <article className="min-w-0 rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4 shadow-[0_18px_45px_color-mix(in_srgb,var(--bg-deep)_7%,transparent)]">
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
          <KpiIcon size={18} stroke={1.7} />
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
  );
}

function DeveloperAvailabilityPanel({
  record,
}: {
  record: DeveloperRecord | null;
}) {
  return (
    <aside className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5">
      <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
        Work session context
      </p>
      <p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
        Timer activity should stay attached to the active project, milestone,
        and client-visible deliverable.
      </p>
      <div className="my-8 grid gap-3">
        {[
          ["Active record", record?.title ?? "Select work"],
          ["Project", record?.relation.project ?? "AI support workflow"],
          ["Admin resolver", record?.relation.admin ?? "Dennis Munge"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3"
          >
            <p className="label-caps text-[var(--on-surface-dim)]">{label}</p>
            <p className="mt-1 truncate text-[0.88rem] font-medium text-[var(--on-surface)]">
              {value}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}

function DeveloperRelationPanel({
  record,
}: {
  record: DeveloperRecord | null;
}) {
  if (!record) {
    return (
      <aside className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5">
        <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
          Delivery map
        </p>
        <p className="mt-2 text-[0.84rem] text-[var(--on-surface-dim)]">
          Select a row to inspect client, admin, developer, and project context.
        </p>
      </aside>
    );
  }

  const rows = [
    ["Developer", record.relation.developer],
    ["Client", record.relation.client],
    ["Andishi admin", record.relation.admin],
    ["Project", record.relation.project],
  ];

  return (
    <aside className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
            Delivery map
          </p>
          <p className="mt-1 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
            Developer work stays linked to client, admin, and project context.
          </p>
        </div>
        <IconGitMerge
          className="text-[var(--secondary)]"
          size={20}
          stroke={1.7}
        />
      </div>
      <div className="my-8 grid gap-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3"
          >
            <p className="label-caps text-[var(--on-surface-dim)]">{label}</p>
            <p className="mt-1 truncate text-[0.88rem] font-medium text-[var(--on-surface)]">
              {value}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}

function DeveloperActionRail({
  config,
  onCreate,
  onOpen,
  record,
}: {
  config: DeveloperConfig;
  onCreate: () => void;
  onOpen: () => void;
  record: DeveloperRecord | null;
}) {
  return (
    <aside className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5">
      <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
        Developer controls
      </p>
      <p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
        {config.actionHint}
      </p>
      <div className="my-8 grid gap-2">
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.84rem] font-medium text-[var(--bg)]"
        >
          <IconPlus size={15} stroke={1.8} />
          {config.primaryAction}
        </button>
        <button
          type="button"
          onClick={onOpen}
          disabled={!record}
          className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.84rem] font-medium text-[var(--on-surface)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          View selected
          <IconArrowRight size={15} stroke={1.8} />
        </button>
      </div>
    </aside>
  );
}

function DeveloperThreadPanel({
  messages,
  onSend,
}: {
  messages: Array<{
    author: string;
    message: string;
    role: string;
    time: string;
  }>;
  onSend: (message: string) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <aside className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5">
      <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
        Project thread
      </p>
      <p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
        Developer, client, and Andishi admin messages stay tied to active work.
      </p>
      <div className="my-8 grid max-h-72 gap-3 overflow-y-auto pr-1">
        {messages.map((message, index) => (
          <div
            key={`${message.author}-${message.time}-${index}`}
            className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.82rem] font-medium text-[var(--on-surface)]">
                {message.author}
              </p>
              <span className="font-mono text-[0.68rem] text-[var(--on-surface-dim)]">
                {message.time}
              </span>
            </div>
            <p className="mt-1 text-[0.72rem] text-[var(--secondary)]">
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
          placeholder="Write a project update..."
          className="h-10 min-w-0 flex-1 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.84rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--secondary)]"
        />
        <button
          type="submit"
          aria-label="Send message"
          className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-[var(--on-surface)] text-[var(--bg)]"
        >
          <IconSend size={16} stroke={1.8} />
        </button>
      </form>
    </aside>
  );
}

function DeveloperRecordDetails({
  config,
  onAdvance,
  onArchive,
  record,
}: {
  config: DeveloperConfig;
  onAdvance: () => void;
  onArchive: () => void;
  record: DeveloperRecord;
}) {
  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <StatusBadge
              label={record.status}
              tone={statusTone(record.status)}
            />
            <h3 className="mt-3 text-[1.35rem] font-medium text-[var(--on-surface)]">
              {record.title}
            </h3>
            <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
              {record.description}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-mono text-[1.1rem] text-[var(--on-surface)]">
              {record.metric}
            </p>
            <p className="mt-1 text-[0.76rem] text-[var(--on-surface-dim)]">
              {record.due}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {record.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--glass-border)] px-2.5 py-1 text-[0.72rem] text-[var(--on-surface-dim)]"
            >
              {tag}
            </span>
          ))}
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
                key={`${item}-${index}`}
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
            Developer action
          </p>
          <p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
            {config.actionHint}
          </p>
          <div className="my-8 grid gap-2">
            <button
              type="button"
              onClick={onAdvance}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.84rem] font-medium text-[var(--bg)]"
            >
              Advance status
              <IconArrowRight size={15} stroke={1.8} />
            </button>
            <button
              type="button"
              onClick={onArchive}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--error)_32%,transparent)] px-4 text-[0.84rem] font-medium text-[var(--error)]"
            >
              Remove from view
              <IconTrash size={15} stroke={1.7} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeveloperActionModal({
  config,
  onClose,
  onSubmit,
  open,
}: {
  config: DeveloperConfig;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  open: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
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
      className="fixed inset-0 z-[80] grid place-items-center bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-8 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="developer-action-modal-title"
    >
      <button
        type="button"
        aria-label="Close action modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <form
        className="relative grid max-h-[calc(100svh-4rem)] w-full max-w-3xl gap-5 overflow-y-auto rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_24px_90px_color-mix(in_srgb,var(--bg-deep)_42%,transparent)] sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(new FormData(event.currentTarget));
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-caps text-[var(--secondary)]">
              {config.eyebrow}
            </p>
            <h2
              id="developer-action-modal-title"
              className="title-serif mt-2 text-[1.45rem] font-medium text-[var(--on-surface)]"
            >
              {config.primaryAction}
            </h2>
            <p className="mt-2 max-w-2xl text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
              {config.actionHint}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)]"
            aria-label="Close modal"
          >
            <IconX size={17} stroke={1.6} />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">
              Title
            </span>
            <input
              name="title"
              placeholder="What changed or needs attention?"
              className="h-11 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.9rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--secondary)]"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">
              Status
            </span>
            <select
              name="status"
              className="h-11 cursor-pointer rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.9rem] text-[var(--on-surface)] outline-none focus:border-[var(--secondary)]"
            >
              {config.filters.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">
            Context
          </span>
          <textarea
            name="note"
            rows={5}
            placeholder="Add delivery notes, blocker context, time detail, or payout clarification..."
            className="resize-none rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-3 text-[0.9rem] leading-relaxed text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--secondary)]"
          />
        </label>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)]"
          >
            Submit update
          </button>
        </div>
      </form>
    </div>
  );
}

function buildDeveloperConfig(kind: DeveloperWorkspaceKind): DeveloperConfig {
  const engineer = dashboardDemoData.engineers[0];
  const org = dashboardDemoData.organizations[0];
  const project = dashboardDemoData.projects[0];
  const projectTwo = dashboardDemoData.projects[1];
  const invoice = dashboardDemoData.invoices[0];
  const timesheet = dashboardDemoData.timesheets[0];
  const hours = dashboardDemoData.timesheets.reduce(
    (sum, item) => sum + item.minutes / 60,
    0,
  );
  const relation = defaultRelation();

  const configs: Record<DeveloperWorkspaceKind, DeveloperConfig> = {
    overview: {
      title: `${engineer.name}'s delivery console`,
      eyebrow: "Developer workspace",
      description:
        "A focused operating view for active delivery, time logging, profile readiness, client context, support, and payouts.",
      primaryAction: "Submit update",
      secondaryAction: "Open active work",
      searchPlaceholder: "Search work, payouts, profile items...",
      tableTitle: "Developer operating table",
      tableDescription:
        "Structured view of delivery, time, profile, and payment records tied to active work.",
      icon: IconCode,
      chart: "line",
      filters: ["Active", "Submitted", "Pending", "Verified"],
      actionHint:
        "Share a delivery update, blocker, or admin request without losing project context.",
      timer: true,
      kpis: [
        {
          label: "Hours this week",
          value: hours.toFixed(1),
          trend: "Submitted to active project",
          icon: IconClock,
          data: [0, 2, 4, hours],
        },
        {
          label: "Pending payout",
          value: "$7.8k",
          trend: invoice.invoiceNumber,
          icon: IconWallet,
          data: [0, 2, 5, 7.8],
        },
        {
          label: "Active projects",
          value: "2",
          trend: "1 milestone due",
          icon: IconBriefcase,
          data: [1, 1, 2, 2],
        },
        {
          label: "Profile health",
          value: "96%",
          trend: "Public and verified",
          icon: IconUserCircle,
          data: [72, 84, 92, 96],
        },
      ],
      records: [
        devRecord(
          project.id,
          project.title,
          org.name,
          "Active",
          engineer.name,
          "32h/wk",
          project.targetDate,
          project.description,
          project.stackTags,
          relation,
        ),
        devRecord(
          timesheet.id,
          "Evaluation trace schema",
          project.title,
          "Submitted",
          engineer.name,
          `${hours.toFixed(1)}h`,
          timesheet.date,
          timesheet.description,
          ["Timesheet", "Billable"],
          relation,
        ),
        devRecord(
          invoice.id,
          invoice.invoiceNumber,
          project.title,
          "Pending",
          "Finance",
          "$7.8k",
          "May 2026",
          "Invoice and payout context linked to submitted work.",
          ["Payout", "USD"],
          relation,
        ),
      ],
    },
    projects: {
      title: "My projects",
      eyebrow: "Delivery work",
      description:
        "Track active and upcoming engagements with source brief context, milestones, client expectations, delivery health, and admin escalation paths.",
      primaryAction: "Add project note",
      secondaryAction: "Open project",
      searchPlaceholder: "Search projects, milestones, stack...",
      tableTitle: "Project delivery table",
      tableDescription:
        "Milestone-aware project records with source brief context for the developer workspace.",
      icon: IconBriefcase,
      chart: "line",
      filters: ["Active", "Scoping", "Pending", "Blocked"],
      actionHint:
        "Add a project note, raise a blocker, or request clarification from Andishi admin.",
      timer: true,
      kpis: [
        {
          label: "Active projects",
          value: "2",
          trend: "1 billable",
          icon: IconBriefcase,
          data: [1, 1, 2, 2],
        },
        {
          label: "Milestones",
          value: "3",
          trend: "1 in progress",
          icon: IconCheck,
          data: [1, 2, 3, 3],
        },
        {
          label: "Weekly hours",
          value: "32",
          trend: "Contracted capacity",
          icon: IconClock,
          data: [24, 28, 32, 32],
        },
        {
          label: "Health",
          value: "91%",
          trend: "No blocker",
          icon: IconShieldCheck,
          data: [72, 81, 88, 91],
        },
      ],
      records: [
        devRecord(
          project.id,
          project.title,
          `Source brief: ${project.sourceBrief}`,
          "Active",
          engineer.name,
          "32h/wk",
          project.targetDate,
          project.description,
          project.stackTags,
          relation,
        ),
        devRecord(
          projectTwo.id,
          projectTwo.title,
          `Source brief: ${projectTwo.sourceBrief}`,
          "Scoping",
          "Andishi ops",
          "Draft",
          projectTwo.targetDate,
          projectTwo.description,
          projectTwo.stackTags,
          { ...relation, project: projectTwo.title },
        ),
        devRecord(
          "milestone-review",
          "Human review queue",
          project.title,
          "Pending",
          engineer.name,
          "Due",
          "Jun 28",
          "Build the client-visible review queue after evaluation traces land.",
          ["Milestone", "Review"],
          relation,
        ),
      ],
    },
    time: {
      title: "Time tracking",
      eyebrow: "Billable work",
      description:
        "Log work sessions, submit timesheets, and keep billable context attached to the right client project.",
      primaryAction: "Log time",
      secondaryAction: "Review timesheet",
      searchPlaceholder: "Search timesheets, work notes, statuses...",
      tableTitle: "Timesheet ledger",
      tableDescription:
        "Billable entries with project, status, duration, and admin review context.",
      icon: IconClock,
      chart: "bar",
      filters: ["Draft", "Submitted", "Approved", "Rejected"],
      actionHint:
        "Submit a billable work entry with enough detail for client approval and payout processing.",
      timer: true,
      kpis: [
        {
          label: "Logged today",
          value: "6.5h",
          trend: "Evaluation dashboard",
          icon: IconClock,
          data: [0, 2, 4, 6.5],
        },
        {
          label: "Weekly total",
          value: "26.5h",
          trend: "5.5h remaining",
          icon: IconCalendarEvent,
          data: [8, 14, 20, 26.5],
        },
        {
          label: "Approved",
          value: "18h",
          trend: "This cycle",
          icon: IconCheck,
          data: [4, 8, 12, 18],
        },
        {
          label: "Payout forecast",
          value: "$7.8k",
          trend: "May cycle",
          icon: IconWallet,
          data: [2, 4, 6, 7.8],
        },
      ],
      records: [
        devRecord(
          timesheet.id,
          timesheet.description,
          project.title,
          "Submitted",
          engineer.name,
          "6.5h",
          timesheet.date,
          "Evaluation trace schema and dashboard handoff.",
          ["Timesheet", "Billable"],
          relation,
        ),
        devRecord(
          "time-review",
          "Human review queue planning",
          project.title,
          "Approved",
          "Dennis",
          "4h",
          "May 24",
          "Planning session for review workflow and escalation rules.",
          ["Planning", "Approved"],
          relation,
        ),
        devRecord(
          "time-draft",
          "RAG evaluation tuning",
          project.title,
          "Draft",
          engineer.name,
          "2h",
          "Today",
          "Draft entry for retrieval evaluation tuning.",
          ["RAG", "Draft"],
          relation,
        ),
      ],
    },
    profile: {
      title: "My profile",
      eyebrow: "Talent profile",
      description:
        "Keep your public profile, skills, availability, proof points, and Andishi verification status sharp.",
      primaryAction: "Add profile proof",
      secondaryAction: "Review profile",
      searchPlaceholder: "Search skills, proof, profile sections...",
      tableTitle: "Profile readiness table",
      tableDescription:
        "Profile sections that power matching, client confidence, and placement readiness.",
      icon: IconUserCircle,
      chart: "donut",
      filters: ["Verified", "Active", "Review", "Pending"],
      actionHint:
        "Add a proof point, portfolio link, skill update, or availability note for Andishi review.",
      kpis: [
        {
          label: "Profile complete",
          value: "96%",
          trend: "Public profile ready",
          icon: IconUserCircle,
          data: [60, 78, 90, 96],
        },
        {
          label: "Core skills",
          value: "6",
          trend: "AI product focus",
          icon: IconCode,
          data: [3, 4, 6, 6],
        },
        {
          label: "Verified",
          value: "Yes",
          trend: "Assessment passed",
          icon: IconShieldCheck,
          data: [0, 1, 1, 1],
        },
        {
          label: "Availability",
          value: "Now",
          trend: "32h weekly",
          icon: IconCalendarEvent,
          data: [0, 1, 1, 1],
        },
      ],
      records: [
        devRecord(
          engineer.id,
          engineer.name,
          engineer.role,
          "Verified",
          "Andishi talent",
          "96%",
          engineer.location,
          engineer.bio,
          engineer.skills,
          relation,
        ),
        devRecord(
          "profile-proof",
          engineer.highlight,
          "Featured proof point",
          "Active",
          engineer.name,
          "Live",
          "Public",
          "Highlight shown to clients during shortlist review.",
          ["Proof", "AI"],
          relation,
        ),
        devRecord(
          "profile-availability",
          "Availability settings",
          "Capacity and timezone",
          "Active",
          engineer.name,
          "32h/wk",
          engineer.timezone,
          "Availability, timezone, and start preferences used by matching.",
          ["Availability", "Capacity"],
          relation,
        ),
      ],
    },
    earnings: {
      title: "Earnings",
      eyebrow: "Payout operations",
      description:
        "Understand invoice status, approved hours, payout timing, and finance actions tied to your work.",
      primaryAction: "Request payout help",
      secondaryAction: "Open payout",
      searchPlaceholder: "Search payouts, invoices, periods...",
      tableTitle: "Payout ledger",
      tableDescription:
        "Developer-visible payout and invoice records with approval and finance status.",
      icon: IconCoin,
      chart: "bar",
      filters: ["Draft", "Submitted", "Approved", "Paid"],
      actionHint:
        "Ask Andishi finance for payout clarification, invoice correction, or payment status help.",
      kpis: [
        {
          label: "Pending payout",
          value: "$7.8k",
          trend: "Current cycle",
          icon: IconWallet,
          data: [0, 2, 5, 7.8],
        },
        {
          label: "Approved hours",
          value: "18h",
          trend: "May cycle",
          icon: IconCheck,
          data: [4, 8, 12, 18],
        },
        {
          label: "Next payout",
          value: "Jun 7",
          trend: "Finance review",
          icon: IconCalendarEvent,
          data: [14, 10, 7],
        },
        {
          label: "Invoices",
          value: "1",
          trend: "Client sent",
          icon: IconFileText,
          data: [0, 1, 1],
        },
      ],
      records: [
        devRecord(
          invoice.id,
          invoice.invoiceNumber,
          project.title,
          "Submitted",
          "Finance",
          "$7.8k",
          "May 2026",
          "Invoice sent to client and tied to approved delivery work.",
          ["Invoice", "USD"],
          relation,
        ),
        devRecord(
          "earning-approved",
          "Approved timesheet batch",
          project.title,
          "Approved",
          "Dennis",
          "18h",
          "May cycle",
          "Approved billable hours for the active project.",
          ["Timesheet", "Approved"],
          relation,
        ),
        devRecord(
          "earning-forecast",
          "June payout forecast",
          project.title,
          "Draft",
          "Finance",
          "$12k",
          "June",
          "Forecasted payout based on active placement capacity.",
          ["Forecast", "Draft"],
          relation,
        ),
      ],
    },
    messages: {
      title: "Messages",
      eyebrow: "Project chat",
      description:
        "Coordinate delivery updates, blockers, client questions, and Andishi admin support inside project-linked threads.",
      primaryAction: "New update",
      secondaryAction: "Open thread",
      searchPlaceholder: "Search messages, blockers, stakeholders...",
      tableTitle: "Developer threads",
      tableDescription:
        "Thread records for active project communication and resolver handoff.",
      icon: IconMessageCircle,
      chart: "bar",
      filters: ["Open", "Waiting", "Resolved", "Internal"],
      actionHint:
        "Send a project update, raise a blocker, or ask Andishi admin to resolve context.",
      kpis: [
        {
          label: "Open threads",
          value: "3",
          trend: "1 client-facing",
          icon: IconMessageCircle,
          data: [1, 2, 3],
        },
        {
          label: "Response time",
          value: "18m",
          trend: "Admin online",
          icon: IconClock,
          data: [40, 30, 24, 18],
        },
        {
          label: "Resolved",
          value: "7",
          trend: "This week",
          icon: IconCheck,
          data: [2, 4, 6, 7],
        },
        {
          label: "Escalations",
          value: "1",
          trend: "Scope clarification",
          icon: IconShieldCheck,
          data: [0, 0, 1],
        },
      ],
      records: [
        devRecord(
          "msg-eval",
          "Evaluation dashboard update",
          project.title,
          "Open",
          engineer.name,
          "18m",
          "Today",
          "Share status and next risk on evaluation dashboard.",
          ["Project", "Update"],
          relation,
        ),
        devRecord(
          "msg-scope",
          "Scope clarification",
          project.title,
          "Waiting",
          "Dennis",
          "1h",
          "Admin",
          "Ask admin to confirm client review permissions.",
          ["Scope", "Admin"],
          relation,
        ),
        devRecord(
          "msg-payout",
          "Timesheet approval note",
          invoice.invoiceNumber,
          "Resolved",
          "Finance",
          "Done",
          "Yesterday",
          "Payout and timesheet approval context resolved.",
          ["Payout", "Timesheet"],
          relation,
        ),
      ],
    },
    settings: {
      title: "Developer settings",
      eyebrow: "Workspace controls",
      description:
        "Manage availability, notification routes, payout preferences, profile visibility, and security settings.",
      primaryAction: "Update setting",
      secondaryAction: "Review controls",
      searchPlaceholder: "Search settings, preferences, alerts...",
      tableTitle: "Developer control table",
      tableDescription:
        "Settings that govern availability, profile visibility, payout routes, and notifications.",
      icon: IconSettings,
      chart: "donut",
      filters: ["Active", "Review", "Pending", "Locked"],
      actionHint:
        "Update availability, payout routing, alerts, or public profile visibility.",
      kpis: [
        {
          label: "Availability",
          value: "Active",
          trend: "Starts now",
          icon: IconCalendarEvent,
          data: [0, 1, 1],
        },
        {
          label: "Notifications",
          value: "8",
          trend: "Project and payout",
          icon: IconMessageCircle,
          data: [3, 5, 8],
        },
        {
          label: "Security",
          value: "Good",
          trend: "Session active",
          icon: IconShieldCheck,
          data: [70, 84, 94],
        },
        {
          label: "Payout route",
          value: "Set",
          trend: "Finance ready",
          icon: IconWallet,
          data: [0, 1, 1],
        },
      ],
      records: [
        devRecord(
          "setting-availability",
          "Availability and capacity",
          "32h weekly",
          "Active",
          engineer.name,
          "Live",
          engineer.timezone,
          "Capacity, timezone, and start preferences for matching.",
          ["Availability", "Matching"],
          relation,
        ),
        devRecord(
          "setting-alerts",
          "Notification routing",
          "Project, support, payouts",
          "Review",
          engineer.name,
          "8 rules",
          "Audit",
          "Controls how project and payout alerts reach the developer.",
          ["Alerts", "Workflow"],
          relation,
        ),
        devRecord(
          "setting-payout",
          "Payout profile",
          "Finance preferences",
          "Active",
          "Finance",
          "Set",
          "Live",
          "Payment details and payout preference shell.",
          ["Payout", "Finance"],
          relation,
        ),
      ],
    },
  };

  return configs[kind];
}

function devRecord(
  id: string,
  title: string,
  subtitle: string,
  status: string,
  owner: string,
  metric: string,
  due: string,
  description: string | undefined,
  tags: readonly string[],
  relation: DeveloperRecord["relation"],
): DeveloperRecord {
  return {
    id,
    title,
    subtitle,
    status,
    owner,
    metric,
    due,
    description: description ?? "No description available.",
    tags: [...tags],
    relation,
    activity: [
      `${owner} owns the visible next step`,
      `${status} status confirmed in the developer workspace`,
      `${relation.admin}, ${relation.client}, and ${relation.developer} context mapped`,
    ],
  };
}

function defaultRelation(): DeveloperRecord["relation"] {
  return {
    admin: "Dennis Munge",
    client: "Kijani Analytics",
    developer: "Amina Otieno",
    project: "AI support workflow",
  };
}

function nextDeveloperStatus(kind: DeveloperWorkspaceKind, status: string) {
  const flows: Record<DeveloperWorkspaceKind, string[]> = {
    overview: ["Active", "Submitted", "Pending", "Verified"],
    projects: ["Pending", "Scoping", "Active", "Blocked"],
    time: ["Draft", "Submitted", "Approved", "Rejected"],
    profile: ["Pending", "Review", "Active", "Verified"],
    earnings: ["Draft", "Submitted", "Approved", "Paid"],
    messages: ["Open", "Waiting", "Resolved", "Internal"],
    settings: ["Pending", "Review", "Active", "Locked"],
  };
  const flow = flows[kind];
  const index = flow.findIndex(
    (item) => item.toLowerCase() === status.toLowerCase(),
  );
  return flow[index + 1] ?? flow[0];
}
