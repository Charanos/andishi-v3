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
  IconCreditCard,
  IconFileText,
  IconGitMerge,
  IconMessageCircle,
  IconPlus,
  IconReceipt,
  IconRefresh,
  IconRocket,
  IconSearch,
  IconSend,
  IconSettings,
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
import {
  OperationalDataTable,
  type OperationalTableColumn,
} from "@/components/dashboard/shared/operational-data-table";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { dashboardDemoData } from "@/data/dashboard-mock";

export type ClientWorkspaceKind =
  | "overview"
  | "brief"
  | "matches"
  | "team"
  | "projects"
  | "messages"
  | "payments"
  | "settings";

type ClientRecord = {
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

type ClientConfig = {
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
  records: ClientRecord[];
  actionHint: string;
};

const statusTone = (status: string) => {
  const normalized = status.toLowerCase();
  if (
    normalized.includes("active") ||
    normalized.includes("approved") ||
    normalized.includes("ready") ||
    normalized.includes("paid") ||
    normalized.includes("verified")
  ) {
    return "active";
  }
  if (
    normalized.includes("blocked") ||
    normalized.includes("overdue") ||
    normalized.includes("rejected") ||
    normalized.includes("cancelled")
  ) {
    return "overdue";
  }
  return "pending";
};

export function ClientWorkspacePage({ kind }: { kind: ClientWorkspaceKind }) {
  const baseConfig = useMemo(() => buildClientConfig(kind), [kind]);
  const [records, setRecords] = useState<ClientRecord[]>(baseConfig.records);
  const [selectedRecord, setSelectedRecord] = useState<ClientRecord | null>(
    baseConfig.records[0] ?? null,
  );
  const [drawerRecord, setDrawerRecord] = useState<ClientRecord | null>(null);
  const [confirmRecord, setConfirmRecord] = useState<ClientRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [threadMessages, setThreadMessages] = useState([
    {
      author: "Dennis",
      role: "Andishi admin",
      message:
        "We are keeping the shortlist and project decisions tied to this workspace.",
      time: "09:30",
    },
    {
      author: "Maya",
      role: "Client",
      message:
        "Please keep the intro windows and billing approvals visible here.",
      time: "10:12",
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

  const columns = useMemo<Array<OperationalTableColumn<ClientRecord>>>(
    () => [
      {
        key: "title",
        label: kind === "payments" ? "Invoice" : "Record",
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
      { key: "owner", label: kind === "team" ? "Role" : "Owner" },
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
      `${baseConfig.eyebrow} request`;
    const note =
      String(formData.get("note") ?? "").trim() || baseConfig.actionHint;
    const status =
      String(formData.get("status") ?? "").trim() ||
      baseConfig.filters[0] ||
      "Requested";
    const created: ClientRecord = {
      id: `client-${kind}-${Date.now()}`,
      title,
      subtitle: "Client-created workspace action",
      status,
      owner: "Client workspace",
      metric: "New",
      due: "Admin review",
      description: note,
      tags: [status, "Client"],
      relation: defaultRelation(),
      activity: [
        "Client request created",
        "Andishi admin notified",
        "Awaiting next action",
      ],
    };

    setRecords((current) => [created, ...current]);
    setSelectedRecord(created);
    setDrawerRecord(created);
    setModalOpen(false);
  };

  const advanceRecord = (record: ClientRecord) => {
    const nextStatus = nextClientStatus(kind, record.status);
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
        <ClientHero
          config={baseConfig}
          onSelect={(record) => {
            setSelectedRecord(record);
            setDrawerRecord(record);
          }}
          records={records}
        />
        <ClientSignalPanel config={baseConfig} records={records} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {baseConfig.kpis.map((kpi, index) => (
          <ClientKpiCard key={kpi.label} index={index} kpi={kpi} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <OperationalDataTable
          columns={columns}
          description={baseConfig.tableDescription}
          empty="No client workspace records match the current filter."
          onRowSelect={(record) => {
            setSelectedRecord(record);
            setDrawerRecord(record);
          }}
          rows={filteredRecords}
          title={baseConfig.tableTitle}
          toolbar={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <label className="relative min-w-0 sm:w-72">
                <span className="sr-only">Search client records</span>
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
                <span className="sr-only">Filter client records</span>
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
          <ClientRelationPanel record={selected} />
          {kind === "messages" ? (
            <ClientThreadPanel
              messages={threadMessages}
              onSend={(message) =>
                setThreadMessages((current) => [
                  ...current,
                  { author: "Maya", role: "Client", message, time: "Now" },
                ])
              }
            />
          ) : (
            <ClientActionRail
              config={baseConfig}
              onCreate={() => setModalOpen(true)}
              onOpen={() => selected && setDrawerRecord(selected)}
              record={selected}
            />
          )}
        </div>
      </section>

      <ClientActionModal
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
          <ClientRecordDetails
            config={baseConfig}
            onAdvance={() => advanceRecord(drawerRecord)}
            onArchive={() => setConfirmRecord(drawerRecord)}
            record={drawerRecord}
          />
        )}
      </EntityDrawer>

      <ConfirmDialog
        open={Boolean(confirmRecord)}
        title="Remove this client record?"
        description={`This removes ${confirmRecord?.title ?? "the selected item"} from the visible client workspace data while preserving the mock flow for this session.`}
        confirmLabel="Remove"
        onCancel={() => setConfirmRecord(null)}
        onConfirm={removeRecord}
      />
    </div>
  );
}

function ClientHero({
  config,
  onSelect,
  records,
}: {
  config: ClientConfig;
  onSelect: (record: ClientRecord) => void;
  records: ClientRecord[];
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

function ClientSignalPanel({
  config,
  records,
}: {
  config: ClientConfig;
  records: ClientRecord[];
}) {
  const activity = records.map(
    (_, index) => 12 + index * 5 + (index % 2 === 0 ? 4 : 0),
  );
  const donut = [
    { label: "Client", value: 34, tone: "primary" as const },
    { label: "Admin", value: 24, tone: "secondary" as const },
    { label: "Developer", value: 18, tone: "success" as const },
    { label: "Pending", value: 10, tone: "muted" as const },
  ];

  return (
    <article className="min-w-0 rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
            Workspace signal
          </p>
          <p className="mt-1 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
            Client actions, Andishi admin follow-up, and delivery movement in
            one view.
          </p>
        </div>
        <StatusBadge label="Live" tone="active" />
      </div>
      <div className="my-8">
        {config.chart === "bar" ? (
          <DashboardBarChart data={activity} height={154} />
        ) : config.chart === "donut" ? (
          <DashboardDonutChart data={donut} height={154} legend="inline" />
        ) : (
          <DashboardLineChart data={activity} height={154} variant="area" />
        )}
      </div>
    </article>
  );
}

function ClientKpiCard({
  index,
  kpi,
}: {
  index: number;
  kpi: ClientConfig["kpis"][number];
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

function ClientRelationPanel({ record }: { record: ClientRecord | null }) {
  if (!record) {
    return (
      <aside className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5">
        <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
          Relationship map
        </p>
        <p className="mt-2 text-[0.84rem] text-[var(--on-surface-dim)]">
          Select a row to inspect client, admin, developer, and project context.
        </p>
      </aside>
    );
  }

  const rows = [
    ["Client", record.relation.client],
    ["Andishi admin", record.relation.admin],
    ["Developer", record.relation.developer],
    ["Project", record.relation.project],
  ];

  return (
    <aside className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
            Relationship map
          </p>
          <p className="mt-1 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
            Every client action is tied to accountable stakeholders.
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

function ClientActionRail({
  config,
  onCreate,
  onOpen,
  record,
}: {
  config: ClientConfig;
  onCreate: () => void;
  onOpen: () => void;
  record: ClientRecord | null;
}) {
  return (
    <aside className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5">
      <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
        Client controls
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

function ClientThreadPanel({
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
        Workspace thread
      </p>
      <p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
        Project-linked chat with Andishi admin support and delivery context.
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
          placeholder="Write an update..."
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

function ClientRecordDetails({
  config,
  onAdvance,
  onArchive,
  record,
}: {
  config: ClientConfig;
  onAdvance: () => void;
  onArchive: () => void;
  record: ClientRecord;
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
            Decision controls
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

function ClientActionModal({
  config,
  onClose,
  onSubmit,
  open,
}: {
  config: ClientConfig;
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
      aria-labelledby="client-action-modal-title"
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
              id="client-action-modal-title"
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
              placeholder="What should Andishi action?"
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
            placeholder="Add the operational context, requested outcome, or preferred timeline..."
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
            Submit request
          </button>
        </div>
      </form>
    </div>
  );
}

function buildClientConfig(kind: ClientWorkspaceKind): ClientConfig {
  const org = dashboardDemoData.organizations[0];
  const engineer = dashboardDemoData.engineers[0];
  const engineerTwo = dashboardDemoData.engineers[1];
  const brief = dashboardDemoData.briefs[0];
  const briefTwo = dashboardDemoData.briefs[1];
  const match = dashboardDemoData.matches[0];
  const project = dashboardDemoData.projects[0];
  const projectTwo = dashboardDemoData.projects[1];
  const invoice = dashboardDemoData.invoices[0];
  const relation = defaultRelation();

  const configs: Record<ClientWorkspaceKind, ClientConfig> = {
    overview: {
      title: `${org.name} command center`,
      eyebrow: "Client workspace",
      description:
        "Track briefs, proposed engineers, project delivery, invoices, and support threads with Andishi admin context attached.",
      primaryAction: "Request action",
      secondaryAction: "Open priority",
      searchPlaceholder: "Search workspace records...",
      tableTitle: "Client operating table",
      tableDescription:
        "Structured view of the records Andishi, your team, and developers are actively moving.",
      icon: IconBriefcase,
      chart: "line",
      filters: ["Ready", "Reviewing", "Active", "Waiting"],
      actionHint:
        "Create a client-side request for Andishi admin to review, route, or resolve.",
      kpis: [
        {
          label: "Profiles ready",
          value: "3",
          trend: "2 strong AI matches",
          icon: IconUsers,
          data: [0, 1, 1, 2, 3],
        },
        {
          label: "Open briefs",
          value: "2",
          trend: "1 needs client input",
          icon: IconFileText,
          data: [1, 1, 2, 2, 2],
        },
        {
          label: "Active projects",
          value: "1",
          trend: "Next milestone in 14d",
          icon: IconRocket,
          data: [0, 0, 1, 1, 1],
        },
        {
          label: "Invoices",
          value: "$7.8k",
          trend: "Awaiting approval",
          icon: IconCreditCard,
          data: [0, 3, 5, 7.8],
        },
      ],
      records: [
        clientRecord(
          brief.id,
          brief.title,
          "Hiring brief",
          "Reviewing",
          "Andishi ops",
          "5d",
          brief.timeline,
          brief.description,
          brief.stackTags,
          relation,
        ),
        clientRecord(
          match.id,
          `${engineer.name} profile`,
          engineer.role,
          "Ready",
          "Dennis",
          "Strong",
          "Choose intro slot",
          match.adminNotes,
          engineer.skills,
          relation,
        ),
        clientRecord(
          project.id,
          project.title,
          "Delivery project",
          "Active",
          engineer.name,
          "32h/wk",
          project.targetDate,
          project.description,
          project.stackTags,
          relation,
        ),
      ],
    },
    brief: {
      title: "Hiring brief",
      eyebrow: "Demand intake",
      description:
        "Review and refine the brief Andishi uses to shortlist engineers, schedule intros, and protect delivery expectations.",
      primaryAction: "Add requirement",
      secondaryAction: "Review brief",
      searchPlaceholder: "Search requirements, stack, timelines...",
      tableTitle: "Brief requirements",
      tableDescription:
        "The structured hiring spec Andishi uses to match your team with senior engineers.",
      icon: IconFileText,
      chart: "bar",
      filters: ["Submitted", "Clarifying", "Matching", "Approved"],
      actionHint:
        "Add a missing requirement, business constraint, timeline preference, or stakeholder note.",
      kpis: [
        {
          label: "Brief completeness",
          value: "86%",
          trend: "Stack and timeline clear",
          icon: IconShieldCheck,
          data: [42, 58, 72, 86],
        },
        {
          label: "Matching SLA",
          value: "5d",
          trend: "Inside target",
          icon: IconClock,
          data: [8, 7, 6, 5],
        },
        {
          label: "Stack tags",
          value: "5",
          trend: "AI and platform heavy",
          icon: IconCode,
          data: [2, 3, 5, 5],
        },
        {
          label: "Review notes",
          value: "4",
          trend: "1 client response due",
          icon: IconMessageCircle,
          data: [1, 2, 3, 4],
        },
      ],
      records: [
        clientRecord(
          brief.id,
          brief.title,
          brief.role,
          "Matching",
          "Dennis",
          "Senior",
          brief.timeline,
          brief.description,
          brief.stackTags,
          relation,
        ),
        clientRecord(
          briefTwo.id,
          briefTwo.title,
          briefTwo.role,
          "Clarifying",
          "Talent ops",
          "Lead",
          briefTwo.timeline,
          briefTwo.description,
          briefTwo.stackTags,
          {
            ...relation,
            developer: engineerTwo.name,
            project: projectTwo.title,
          },
        ),
        clientRecord(
          "brief-stakeholder",
          "Stakeholder alignment",
          "Decision criteria",
          "Submitted",
          "Client team",
          "New",
          "Before intros",
          "Confirm who joins interviews and how offers are approved.",
          ["Interview", "Approval"],
          relation,
        ),
      ],
    },
    matches: {
      title: "Developer profiles",
      eyebrow: "Match review",
      description:
        "Evaluate proposed engineers with fit notes, intro readiness, and project-specific relationship context.",
      primaryAction: "Request intro",
      secondaryAction: "Open profile",
      searchPlaceholder: "Search profiles, skills, statuses...",
      tableTitle: "Profile shortlist",
      tableDescription:
        "Compare fit, role, availability, and next action for every proposed engineer.",
      icon: IconUsers,
      chart: "donut",
      filters: ["Proposed", "Client reviewing", "Intro scheduled", "Accepted"],
      actionHint:
        "Request an intro, ask for another profile, or leave review notes for the Andishi admin.",
      kpis: [
        {
          label: "Profiles proposed",
          value: "3",
          trend: "2 strong fit",
          icon: IconUsers,
          data: [0, 1, 2, 3],
        },
        {
          label: "Intro slots",
          value: "2",
          trend: "Client preference saved",
          icon: IconCalendarEvent,
          data: [0, 1, 1, 2],
        },
        {
          label: "AI fit",
          value: "94%",
          trend: "Top profile",
          icon: IconGitMerge,
          data: [60, 76, 88, 94],
        },
        {
          label: "Decision age",
          value: "1d",
          trend: "No SLA risk",
          icon: IconClock,
          data: [4, 3, 2, 1],
        },
      ],
      records: [
        clientRecord(
          match.id,
          engineer.name,
          engineer.role,
          "Client reviewing",
          "Dennis",
          "94%",
          "Pick intro slot",
          engineer.bio,
          engineer.skills,
          relation,
        ),
        clientRecord(
          "match-kwame",
          engineerTwo.name,
          engineerTwo.role,
          "Proposed",
          "Talent ops",
          "82%",
          "Awaiting review",
          engineerTwo.bio,
          engineerTwo.skills,
          {
            ...relation,
            developer: engineerTwo.name,
            project: projectTwo.title,
          },
        ),
        clientRecord(
          "match-zola",
          "Zola Ndlovu",
          "Cloud Platform Engineer",
          "Intro scheduled",
          "Dennis",
          "78%",
          "Calendar hold",
          "Cloud platform engineer for AWS migration and reliability review.",
          ["AWS", "Terraform", "Kubernetes"],
          relation,
        ),
      ],
    },
    team: {
      title: "Team roster",
      eyebrow: "Engagement team",
      description:
        "See the client stakeholders, Andishi admin owner, and developer contributors attached to active work.",
      primaryAction: "Invite stakeholder",
      secondaryAction: "Open roster",
      searchPlaceholder: "Search team members, roles, projects...",
      tableTitle: "Workspace roster",
      tableDescription:
        "Role-aware relationship data between client, admin, and developer stakeholders.",
      icon: IconCode,
      chart: "donut",
      filters: ["Active", "Pending", "Admin", "Developer"],
      actionHint:
        "Invite a stakeholder, assign a decision owner, or update who should receive project alerts.",
      kpis: [
        {
          label: "Stakeholders",
          value: "6",
          trend: "3 client side",
          icon: IconUsers,
          data: [2, 4, 5, 6],
        },
        {
          label: "Admin owner",
          value: "1",
          trend: "Dennis assigned",
          icon: IconShieldCheck,
          data: [1, 1, 1, 1],
        },
        {
          label: "Developers",
          value: "2",
          trend: "1 active placement",
          icon: IconCode,
          data: [0, 1, 1, 2],
        },
        {
          label: "Coverage",
          value: "92%",
          trend: "Decision paths mapped",
          icon: IconGitMerge,
          data: [60, 72, 86, 92],
        },
      ],
      records: [
        clientRecord(
          "team-maya",
          "Maya Kamau",
          "Client decision owner",
          "Active",
          "Client",
          "Owner",
          "All alerts",
          "Primary business stakeholder for hiring and project approvals.",
          ["Client", "Approver"],
          relation,
        ),
        clientRecord(
          "team-dennis",
          "Dennis Munge",
          "Andishi admin resolver",
          "Admin",
          "Andishi",
          "Resolver",
          "Live support",
          "Admin owner for support, matching, and delivery escalation.",
          ["Admin", "Support"],
          relation,
        ),
        clientRecord(
          engineer.id,
          engineer.name,
          engineer.role,
          "Developer",
          "Delivery",
          "32h/wk",
          project.targetDate,
          engineer.bio,
          engineer.skills,
          relation,
        ),
      ],
    },
    projects: {
      title: "Projects",
      eyebrow: "Delivery view",
      description:
        "Track project health, source brief context, milestones, developer allocation, and delivery risks after a brief becomes active work.",
      primaryAction: "Add milestone",
      secondaryAction: "Open project",
      searchPlaceholder: "Search projects, milestones, stack...",
      tableTitle: "Project delivery table",
      tableDescription:
        "Milestone-oriented view of active and upcoming work with ownership, source brief, and next steps.",
      icon: IconBriefcase,
      chart: "line",
      filters: ["Active", "Scoping", "Pending", "Blocked"],
      actionHint:
        "Add a milestone, attach a risk, or request an admin delivery check-in.",
      kpis: [
        {
          label: "Active work",
          value: "1",
          trend: "32 hours weekly",
          icon: IconBriefcase,
          data: [0, 0, 1, 1],
        },
        {
          label: "Milestones",
          value: "3",
          trend: "1 in progress",
          icon: IconCheck,
          data: [1, 2, 3, 3],
        },
        {
          label: "Delivery health",
          value: "91%",
          trend: "No blocker",
          icon: IconShieldCheck,
          data: [74, 82, 88, 91],
        },
        {
          label: "Target date",
          value: "45d",
          trend: "July 15",
          icon: IconCalendarEvent,
          data: [60, 55, 50, 45],
        },
      ],
      records: [
        clientRecord(
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
        clientRecord(
          projectTwo.id,
          projectTwo.title,
          `Source brief: ${projectTwo.sourceBrief}`,
          "Scoping",
          engineerTwo.name,
          "Draft",
          projectTwo.targetDate,
          projectTwo.description,
          projectTwo.stackTags,
          {
            ...relation,
            developer: engineerTwo.name,
            project: projectTwo.title,
          },
        ),
        clientRecord(
          "project-risk",
          "Human review queue handoff",
          "Milestone",
          "Pending",
          "Dennis",
          "Due",
          "Jun 28",
          "Confirm review roles and admin permissions before implementation sprint.",
          ["Milestone", "Admin"],
          relation,
        ),
      ],
    },
    messages: {
      title: "Messages",
      eyebrow: "Project chat",
      description:
        "Coordinate project-linked communication across client stakeholders, Andishi admin, and developer contributors.",
      primaryAction: "New message",
      secondaryAction: "Open thread",
      searchPlaceholder: "Search threads, stakeholders, projects...",
      tableTitle: "Message threads",
      tableDescription:
        "Threaded operational communication with owner, status, and project context.",
      icon: IconMessageCircle,
      chart: "bar",
      filters: ["Open", "Waiting", "Resolved", "Internal"],
      actionHint:
        "Start a new project-linked thread or send a decision note to Andishi support.",
      kpis: [
        {
          label: "Open threads",
          value: "4",
          trend: "2 project-linked",
          icon: IconMessageCircle,
          data: [2, 3, 4, 4],
        },
        {
          label: "Median response",
          value: "18m",
          trend: "Admin online",
          icon: IconClock,
          data: [34, 29, 21, 18],
        },
        {
          label: "Resolved",
          value: "9",
          trend: "This week",
          icon: IconCheck,
          data: [3, 5, 7, 9],
        },
        {
          label: "Stakeholders",
          value: "6",
          trend: "All mapped",
          icon: IconUsers,
          data: [3, 4, 5, 6],
        },
      ],
      records: [
        clientRecord(
          "msg-intro",
          "Intro slot confirmation",
          "AI support workflow",
          "Open",
          "Dennis",
          "18m",
          "Today",
          "Confirm two preferred windows for Amina's technical intro.",
          ["Intro", "Client"],
          relation,
        ),
        clientRecord(
          "msg-project",
          "Evaluation dashboard status",
          project.title,
          "Waiting",
          engineer.name,
          "1h",
          "Standup",
          "Developer status update and client review timing.",
          ["Project", "Developer"],
          relation,
        ),
        clientRecord(
          "msg-billing",
          "Invoice approval",
          invoice.invoiceNumber,
          "Resolved",
          "Finance",
          "$7.8k",
          "Yesterday",
          "Timesheet and invoice approval thread.",
          ["Billing", "Invoice"],
          relation,
        ),
      ],
    },
    payments: {
      title: "Payments",
      eyebrow: "Billing workspace",
      description:
        "Review invoices, billing periods, timesheet approvals, and payment status tied to active delivery.",
      primaryAction: "Request invoice change",
      secondaryAction: "Open invoice",
      searchPlaceholder: "Search invoices, projects, amounts...",
      tableTitle: "Billing table",
      tableDescription:
        "Invoice, period, status, and project context for client-side payment operations.",
      icon: IconCreditCard,
      chart: "bar",
      filters: ["Draft", "Sent", "Approved", "Paid"],
      actionHint:
        "Request an invoice correction, ask for a timesheet detail, or approve billing context.",
      kpis: [
        {
          label: "Outstanding",
          value: "$7.8k",
          trend: "Current invoice",
          icon: IconReceipt,
          data: [0, 2, 5, 7.8],
        },
        {
          label: "Approved hours",
          value: "6.5",
          trend: "Latest timesheet",
          icon: IconClock,
          data: [2, 4, 6.5],
        },
        {
          label: "Invoices",
          value: "1",
          trend: "May 2026",
          icon: IconCreditCard,
          data: [0, 1, 1, 1],
        },
        {
          label: "Payment health",
          value: "Good",
          trend: "No overdue balance",
          icon: IconShieldCheck,
          data: [70, 78, 88, 94],
        },
      ],
      records: [
        clientRecord(
          invoice.id,
          invoice.invoiceNumber,
          project.title,
          "Sent",
          "Finance",
          "$7.8k",
          "May 2026",
          "Invoice issued for AI support workflow delivery and timesheet approval.",
          ["Invoice", "USD"],
          relation,
        ),
        clientRecord(
          "pay-timesheet",
          "Timesheet approval",
          "Evaluation trace schema",
          "Approved",
          engineer.name,
          "6.5h",
          "May 25",
          "Timesheet submitted by developer for billable project work.",
          ["Timesheet", "Billable"],
          relation,
        ),
        clientRecord(
          "pay-next",
          "June billing forecast",
          "AI support workflow",
          "Draft",
          "Finance",
          "$12k",
          "June",
          "Projected invoice based on active 32 hours per week placement.",
          ["Forecast", "Budget"],
          relation,
        ),
      ],
    },
    settings: {
      title: "Workspace settings",
      eyebrow: "Client controls",
      description:
        "Manage organization profile, billing contacts, notification routes, stakeholder access, and client workspace preferences.",
      primaryAction: "Add setting",
      secondaryAction: "Review access",
      searchPlaceholder: "Search settings, contacts, policies...",
      tableTitle: "Client control table",
      tableDescription:
        "Operational settings that shape notifications, billing, access, and project governance.",
      icon: IconSettings,
      chart: "donut",
      filters: ["Active", "Review", "Pending", "Locked"],
      actionHint:
        "Add a billing contact, change notification routing, or request access updates.",
      kpis: [
        {
          label: "Contacts",
          value: "4",
          trend: "2 billing-aware",
          icon: IconUsers,
          data: [2, 3, 4, 4],
        },
        {
          label: "Policies",
          value: "6",
          trend: "1 review due",
          icon: IconShieldCheck,
          data: [4, 5, 6],
        },
        {
          label: "Alerts",
          value: "9",
          trend: "Project and billing",
          icon: IconMessageCircle,
          data: [3, 5, 8, 9],
        },
        {
          label: "Access health",
          value: "96%",
          trend: "No stale owner",
          icon: IconCheck,
          data: [76, 84, 91, 96],
        },
      ],
      records: [
        clientRecord(
          "setting-org",
          org.name,
          org.industry,
          "Active",
          "Maya",
          "Org",
          "Verified",
          "Organization profile and billing identity.",
          ["Organization", "Billing"],
          relation,
        ),
        clientRecord(
          "setting-alerts",
          "Notification routing",
          "Briefs, projects, invoices",
          "Review",
          "Client admin",
          "9 rules",
          "Audit Friday",
          "Controls where operational alerts are sent.",
          ["Alerts", "Workflow"],
          relation,
        ),
        clientRecord(
          "setting-access",
          "Stakeholder access",
          "Client workspace permissions",
          "Active",
          "Dennis",
          "6 users",
          "Live",
          "Client and Andishi visibility for dashboard routes and actions.",
          ["RBAC", "Client"],
          relation,
        ),
      ],
    },
  };

  return configs[kind];
}

function clientRecord(
  id: string,
  title: string,
  subtitle: string,
  status: string,
  owner: string,
  metric: string,
  due: string,
  description: string | undefined,
  tags: readonly string[],
  relation: ClientRecord["relation"],
): ClientRecord {
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
      `${status} status confirmed in the client workspace`,
      `${relation.admin}, ${relation.client}, and ${relation.developer} context mapped`,
    ],
  };
}

function defaultRelation(): ClientRecord["relation"] {
  return {
    admin: "Dennis Munge",
    client: "Kijani Analytics",
    developer: "Amina Otieno",
    project: "AI support workflow",
  };
}

function nextClientStatus(kind: ClientWorkspaceKind, status: string) {
  const flows: Record<ClientWorkspaceKind, string[]> = {
    overview: ["Ready", "Reviewing", "Active", "Waiting"],
    brief: ["Submitted", "Clarifying", "Matching", "Approved"],
    matches: ["Proposed", "Client reviewing", "Intro scheduled", "Accepted"],
    team: ["Pending", "Active", "Admin", "Developer"],
    projects: ["Pending", "Scoping", "Active", "Blocked"],
    messages: ["Open", "Waiting", "Resolved", "Internal"],
    payments: ["Draft", "Sent", "Approved", "Paid"],
    settings: ["Pending", "Review", "Active", "Locked"],
  };
  const flow = flows[kind];
  const index = flow.findIndex(
    (item) => item.toLowerCase() === status.toLowerCase(),
  );
  return flow[index + 1] ?? flow[0];
}
