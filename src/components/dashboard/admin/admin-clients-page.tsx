"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBuilding,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconCurrencyDollar,
  IconFileText,
  IconFilter,
  IconLayoutGrid,
  IconListDetails,
  IconMessageCircle,
  IconPencil,
  IconPlus,
  IconReceipt,
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
import { AdminNetworkNav } from "@/components/dashboard/admin/admin-network-nav";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { KpiCard } from "@/components/dashboard/shared/kpi-card";
import {
  OperationalDataTable,
  type OperationalTableColumn,
} from "@/components/dashboard/shared/operational-data-table";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { SectionDivider } from "@/components/ui/section-divider";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type ClientStatus = "prospect" | "onboarding" | "active" | "expansion" | "risk";
type ClientTier = "Seed" | "Series A" | "Series B" | "Growth" | "Enterprise";
type ViewMode = "grid" | "list";
type SortKey = "health" | "revenue" | "briefs" | "recent";
type DetailTab = "overview" | "stakeholders" | "financials" | "activity";

type Stakeholder = {
  influence: "buyer" | "technical" | "finance";
  name: string;
  role: string;
};

type ClientRecord = {
  accountPromise: string;
  activity: string[];
  billingPosture: "healthy" | "watch" | "overdue" | "pre_revenue";
  briefs: number;
  commercialModel: string;
  contactEmail: string;
  decisionHealth: number;
  health: number;
  id: string;
  industry: string;
  lastTouched: string;
  marginGuardrail: string;
  mrr: number;
  name: string;
  nextAction: string;
  nextMilestone: string;
  notes: string;
  openInvoices: number;
  owner: string;
  placementCount: number;
  primaryContact: string;
  relationshipScore: number;
  risk: string;
  roleVisibility: {
    admin: string;
    client: string;
    developer: string;
  };
  stageAge: number;
  status: ClientStatus;
  stakeholders: Stakeholder[];
  tier: ClientTier;
};

type ClientSeedRecord = Omit<
  ClientRecord,
  "accountPromise" | "commercialModel" | "decisionHealth" | "marginGuardrail" | "nextMilestone" | "roleVisibility"
>;

// ─── Constants ───────────────────────────────────────────────────────────────

const statusOrder: ClientStatus[] = [
  "prospect",
  "onboarding",
  "active",
  "expansion",
  "risk",
];

const clientPageSizeOptions = [6, 12, 24, 48];

const statusMeta: Record<
  ClientStatus,
  { label: string; next: ClientStatus | null; tone: "active" | "available" | "neutral" | "overdue" | "pending" }
> = {
  active: { label: "Active", next: "expansion", tone: "active" },
  expansion: { label: "Expansion", next: "active", tone: "available" },
  onboarding: { label: "Onboarding", next: "active", tone: "pending" },
  prospect: { label: "Prospect", next: "onboarding", tone: "neutral" },
  risk: { label: "Risk", next: "active", tone: "overdue" },
};

const billingMeta: Record<
  ClientRecord["billingPosture"],
  { label: string; tone: "active" | "neutral" | "overdue" | "pending" }
> = {
  healthy: { label: "Healthy", tone: "active" },
  overdue: { label: "Overdue", tone: "overdue" },
  pre_revenue: { label: "Pre-revenue", tone: "neutral" },
  watch: { label: "Watch", tone: "pending" },
};

const influenceColors: Record<Stakeholder["influence"], string> = {
  buyer: "var(--primary)",
  finance: "var(--secondary)",
  technical: "var(--tertiary)",
};

// ─── Seed data ───────────────────────────────────────────────────────────────

const rawClientSeed: ClientSeedRecord[] = [
  {
    activity: [
      "AI support brief moved into matching",
      "Finance contact confirmed invoice routing",
      "Amina profile reviewed by technical lead",
    ],
    billingPosture: "healthy",
    briefs: 2,
    contactEmail: "maya@kijani.example",
    health: 92,
    id: "client-kijani",
    industry: "Climate fintech",
    lastTouched: "18m ago",
    mrr: 16800,
    name: "Kijani Analytics",
    nextAction: "Send second AI profile and confirm intro windows",
    notes: "High trust Series A account. Strong expansion potential after support automation lands.",
    openInvoices: 1,
    owner: "Dennis",
    placementCount: 1,
    primaryContact: "Maya Kamau",
    relationshipScore: 94,
    risk: "Intro window closes Friday",
    stageAge: 4,
    status: "active",
    stakeholders: [
      { influence: "buyer", name: "Maya Kamau", role: "Founder" },
      { influence: "technical", name: "Brian Ouma", role: "VP Engineering" },
      { influence: "finance", name: "Lena Wairimu", role: "Finance Lead" },
    ],
    tier: "Series A",
  },
  {
    activity: [
      "Payments reconciliation brief clarified",
      "Kwame shortlist accepted internally",
      "Expansion budget signaled by CFO",
    ],
    billingPosture: "watch",
    briefs: 3,
    contactEmail: "ops@sokopay.example",
    health: 81,
    id: "client-sokopay",
    industry: "Commerce payments",
    lastTouched: "1h ago",
    mrr: 24400,
    name: "SokoPay",
    nextAction: "Confirm reconciliation milestone scope before intro",
    notes: "Expansion-ready commerce account. Billing needs better cadence before adding the second workstream.",
    openInvoices: 2,
    owner: "Maya",
    placementCount: 1,
    primaryContact: "June Njeri",
    relationshipScore: 86,
    risk: "Finance approval lag",
    stageAge: 8,
    status: "expansion",
    stakeholders: [
      { influence: "buyer", name: "June Njeri", role: "COO" },
      { influence: "technical", name: "Kwasi Boateng", role: "Engineering Lead" },
      { influence: "finance", name: "Ruth Akinyi", role: "Controller" },
    ],
    tier: "Growth",
  },
  {
    activity: [
      "AWS migration kickoff scheduled",
      "Security intake requested",
      "Zola profile under final review",
    ],
    billingPosture: "pre_revenue",
    briefs: 1,
    contactEmail: "product@nova.example",
    health: 78,
    id: "client-nova",
    industry: "Health SaaS",
    lastTouched: "Today",
    mrr: 0,
    name: "Nova Health",
    nextAction: "Complete onboarding checklist and security data room",
    notes: "New health account. Needs calm onboarding and explicit security boundaries.",
    openInvoices: 0,
    owner: "Dennis",
    placementCount: 0,
    primaryContact: "Dr. Nia Mensah",
    relationshipScore: 79,
    risk: "Security review could slow matching",
    stageAge: 3,
    status: "onboarding",
    stakeholders: [
      { influence: "buyer", name: "Dr. Nia Mensah", role: "CEO" },
      { influence: "technical", name: "David Mutua", role: "Platform Lead" },
    ],
    tier: "Seed",
  },
  {
    activity: [
      "Infrastructure delivery flagged by ops",
      "Client escalated missed milestone",
      "Renewal call pending",
    ],
    billingPosture: "overdue",
    briefs: 1,
    contactEmail: "cto@cloudify.example",
    health: 58,
    id: "client-cloudify",
    industry: "Cloud infrastructure",
    lastTouched: "Yesterday",
    mrr: 11200,
    name: "Cloudify Inc",
    nextAction: "Run recovery call with delivery owner and CTO",
    notes: "High-value cloud account with delivery risk. Needs executive recovery motion.",
    openInvoices: 2,
    owner: "Ops",
    placementCount: 1,
    primaryContact: "Anton Githinji",
    relationshipScore: 62,
    risk: "Milestone slipped and invoice aging",
    stageAge: 11,
    status: "risk",
    stakeholders: [
      { influence: "buyer", name: "Anton Githinji", role: "CTO" },
      { influence: "finance", name: "Leila Hassan", role: "Finance Manager" },
    ],
    tier: "Series B",
  },
  {
    activity: [
      "Mobile rebuild discovery completed",
      "Budget owner added",
      "Brief draft awaiting signoff",
    ],
    billingPosture: "pre_revenue",
    briefs: 1,
    contactEmail: "hello@tradehub.example",
    health: 71,
    id: "client-tradehub",
    industry: "Retail commerce",
    lastTouched: "2d ago",
    mrr: 0,
    name: "TradeHub",
    nextAction: "Convert discovery notes into mobile hiring brief",
    notes: "Promising prospect for React Native work. Keep buying committee simple.",
    openInvoices: 0,
    owner: "Maya",
    placementCount: 0,
    primaryContact: "Peter Okello",
    relationshipScore: 74,
    risk: "Budget not confirmed",
    stageAge: 6,
    status: "prospect",
    stakeholders: [
      { influence: "buyer", name: "Peter Okello", role: "Founder" },
      { influence: "technical", name: "Lulu Adebayo", role: "Product Lead" },
    ],
    tier: "Seed",
  },
  {
    activity: [
      "Patient app renewal proposal sent",
      "Accessibility audit passed",
      "Finance approved June invoice",
    ],
    billingPosture: "healthy",
    briefs: 2,
    contactEmail: "ops@medlink.example",
    health: 89,
    id: "client-medlink",
    industry: "Healthcare",
    lastTouched: "3d ago",
    mrr: 17800,
    name: "MedLink",
    nextAction: "Confirm renewal scope and second engineer timing",
    notes: "Solid healthcare client with renewal upside after mobile handoff.",
    openInvoices: 0,
    owner: "Dennis",
    placementCount: 1,
    primaryContact: "Aisha Bello",
    relationshipScore: 90,
    risk: "Renewal timing",
    stageAge: 14,
    status: "expansion",
    stakeholders: [
      { influence: "buyer", name: "Aisha Bello", role: "Head of Product" },
      { influence: "technical", name: "Noah Kato", role: "Mobile Lead" },
      { influence: "finance", name: "Grace Nalule", role: "Finance" },
    ],
    tier: "Series A",
  },
];

const clientSeed = rawClientSeed.map(enrichClientRecord);

// ─── Main page ────────────────────────────────────────────────────────────────

export function AdminClientsPage() {
  const [clients, setClients] = useState(clientSeed);
  const [selectedId, setSelectedId] = useState(clientSeed[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [billingFilter, setBillingFilter] = useState<ClientRecord["billingPosture"] | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("health");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [detailClient, setDetailClient] = useState<ClientRecord | null>(null);
  const [confirmClient, setConfirmClient] = useState<ClientRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const selected = clients.find((client) => client.id === selectedId) ?? clients[0] ?? null;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return clients
      .filter((client) => {
        const haystack = [
          client.name,
          client.primaryContact,
          client.industry,
          client.owner,
          client.tier,
          client.nextAction,
          client.accountPromise,
          client.commercialModel,
          client.marginGuardrail,
          client.stakeholders.map((s) => s.name).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return (
          (!needle || haystack.includes(needle)) &&
          (statusFilter === "all" || client.status === statusFilter) &&
          (billingFilter === "all" || client.billingPosture === billingFilter)
        );
      })
      .sort((a, b) => {
        if (sortKey === "revenue") return b.mrr - a.mrr;
        if (sortKey === "briefs") return b.briefs - a.briefs;
        if (sortKey === "recent") return a.stageAge - b.stageAge;
        return b.health - a.health;
      });
  }, [billingFilter, clients, query, sortKey, statusFilter]);

  const stats = useMemo(() => buildClientStats(clients), [clients]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const activePage = Math.min(page, totalPages);
  const paginatedClients = filtered.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize,
  );

  const columns = useMemo<Array<OperationalTableColumn<ClientRecord>>>(
    () => [
      {
        key: "name",
        label: "Client",
        priority: true,
        render: (client) => (
          <div className="min-w-0">
            <p className="truncate text-[0.88rem] font-medium text-[var(--on-surface)]">
              {client.name}
            </p>
            <p className="mt-1 truncate text-[0.74rem] text-[var(--on-surface-dim)]">
              {client.industry} / {client.tier}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (client) => (
          <StatusBadge label={statusMeta[client.status].label} tone={statusMeta[client.status].tone} />
        ),
      },
      { key: "health", label: "Health", mono: true, render: (client) => `${client.health}%` },
      { key: "briefs", label: "Briefs", mono: true },
      { key: "mrr", label: "MRR", mono: true, hideOnMobile: true, render: (client) => formatMoney(client.mrr) },
      {
        key: "billingPosture",
        label: "Billing",
        hideOnMobile: true,
        render: (client) => (
          <StatusBadge
            label={billingMeta[client.billingPosture].label}
            tone={billingMeta[client.billingPosture].tone}
          />
        ),
      },
      { key: "owner", label: "Owner", hideOnMobile: true },
    ],
    [],
  );

  const commitClient = (updated: ClientRecord) => {
    setClients((current) =>
      current.map((client) => (client.id === updated.id ? updated : client)),
    );
    setSelectedId(updated.id);
    setDetailClient((current) =>
      current?.id === updated.id ? updated : current,
    );
  };

  const advanceClient = (client: ClientRecord) => {
    const next = statusMeta[client.status].next;
    if (!next) return;
    const updated = enrichClientRecord(toClientSeed(client, {
      activity: [`Moved to ${statusMeta[next].label}`, ...client.activity],
      health: next === "active" ? Math.max(client.health, 80) : client.health,
      status: next,
      stageAge: 0,
    }));
    commitClient(updated);
  };

  const markRisk = (client: ClientRecord) => {
    const nextStatus: ClientStatus = client.status === "risk" ? "active" : "risk";
    const updated = enrichClientRecord(toClientSeed(client, {
      activity: [
        client.status === "risk" ? "Risk review completed" : "Account marked for risk review",
        ...client.activity,
      ],
      status: nextStatus,
    }));
    commitClient(updated);
  };

  const saveClientEdit = (
    client: ClientRecord,
    payload: {
      billingPosture: ClientRecord["billingPosture"];
      briefs: number;
      contactEmail: string;
      health: number;
      industry: string;
      mrr: number;
      name: string;
      nextAction: string;
      notes: string;
      openInvoices: number;
      owner: string;
      placementCount: number;
      primaryContact: string;
      relationshipScore: number;
      risk: string;
      stageAge: number;
      status: ClientStatus;
      tier: ClientTier;
    },
  ) => {
    const updated = enrichClientRecord(
      toClientSeed(client, {
        activity: ["Account profile updated", ...client.activity],
        billingPosture: payload.billingPosture,
        briefs: payload.briefs,
        contactEmail: payload.contactEmail,
        health: payload.health,
        industry: payload.industry,
        lastTouched: "Now",
        mrr: payload.mrr,
        name: payload.name,
        nextAction: payload.nextAction,
        notes: payload.notes,
        openInvoices: payload.openInvoices,
        owner: payload.owner,
        placementCount: payload.placementCount,
        primaryContact: payload.primaryContact,
        relationshipScore: payload.relationshipScore,
        risk: payload.risk,
        stageAge: payload.stageAge,
        status: payload.status,
        tier: payload.tier,
      }),
    );
    commitClient(updated);
  };

  const saveStakeholders = (client: ClientRecord, stakeholders: Stakeholder[]) => {
    const updated = enrichClientRecord(
      toClientSeed(client, {
        activity: [
          `Stakeholder map updated: ${stakeholders.length} contacts`,
          ...client.activity,
        ],
        lastTouched: "Now",
        stakeholders,
      }),
    );
    commitClient(updated);
  };

  const createClient = (payload: {
    budget: number;
    contactEmail: string;
    industry: string;
    name: string;
    owner: string;
    primaryContact: string;
    tier: ClientTier;
  }) => {
    const created = enrichClientRecord({
      activity: ["Client account created", "Stakeholder map opened", "Awaiting first brief"],
      billingPosture: "pre_revenue",
      briefs: 0,
      contactEmail: payload.contactEmail,
      health: 68,
      id: `client-${Date.now()}`,
      industry: payload.industry,
      lastTouched: "Now",
      mrr: payload.budget,
      name: payload.name,
      nextAction: "Qualify first hiring brief",
      notes: "Created from account intake. Confirm buying committee, scope, budget owner, and first Andishi promise before opening matching.",
      openInvoices: 0,
      owner: payload.owner,
      placementCount: 0,
      primaryContact: payload.primaryContact,
      relationshipScore: 64,
      risk: "Needs qualification",
      stageAge: 0,
      status: "prospect",
      stakeholders: [{ influence: "buyer", name: payload.primaryContact, role: "Primary contact" }],
      tier: payload.tier,
    });
    setClients((current) => [created, ...current]);
    setSelectedId(created.id);
    setDetailClient(created);
    setCreateOpen(false);
  };

  const sendMessage = (client: ClientRecord, message: string) => {
    setClients((current) =>
      current.map((item) =>
        item.id === client.id
          ? { ...item, activity: [`Stakeholder update sent: ${message}`, ...item.activity] }
          : item,
      ),
    );
    setDetailClient((current) =>
      current?.id === client.id
        ? { ...current, activity: [`Stakeholder update sent: ${message}`, ...current.activity] }
        : current,
    );
  };

  const updateNotes = (clientId: string, notes: string) => {
    setClients((current) =>
      current.map((client) =>
        client.id === clientId
          ? { ...client, activity: ["Account notes updated", ...client.activity], notes }
          : client,
      ),
    );
    setDetailClient((current) => (current?.id === clientId ? { ...current, notes } : current));
  };

  const archiveClient = () => {
    if (!confirmClient) return;
    const next = clients.filter((client) => client.id !== confirmClient.id);
    setClients(next);
    if (selectedId === confirmClient.id) setSelectedId(next[0]?.id ?? "");
    setDetailClient(null);
    setConfirmClient(null);
  };

  return (
    <div className="grid min-w-0 gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <DashboardPageHeader
        className="mb-0"
        title="Client network"
        description="Run account strategy, stakeholder coverage, briefs, billing posture, margin-safe visibility, and expansion motion from a client command surface built for Andishi's intermediary business model."
        status={<StatusBadge label={`${stats.active} active`} tone="active" />}
        actions={
          <>
            <button
              type="button"
              onClick={() => setStatusFilter("risk")}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--error)_28%,var(--glass-border))] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] transition-all duration-300 hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
            >
              <IconAlertTriangle size={16} stroke={1.6} />
              Review risk
              <span className="font-mono text-[0.76rem] text-[var(--error)]">{stats.risk}</span>
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)] shadow-[0_14px_30px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <IconPlus size={16} stroke={1.8} />
              Add client
            </button>
          </>
        }
      />

      <AdminNetworkNav active="clients" />

      <SectionDivider />

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          chart="bar"
          data={[18, 24, 29, 33, clients.length]}
          icon={IconBuilding}
          label="Client portfolio"
          trend={`${stats.expansion} expansion accounts`}
          value={String(clients.length)}
        />
        <KpiCard
          data={[71, 76, 79, 84, stats.avgHealth]}
          icon={IconShieldCheck}
          label="Account health"
          trend={`${stats.risk} needs recovery`}
          value={`${stats.avgHealth}%`}
        />
        <KpiCard
          chart="bar"
          data={[8, 11, 12, 14, stats.briefs]}
          icon={IconFileText}
          label="Open briefs"
          trend={`${stats.placements} live placements`}
          value={String(stats.briefs)}
        />
        <KpiCard
          data={[24, 31, 38, 51, Math.round(stats.mrr / 1000)]}
          icon={IconCurrencyDollar}
          label="MRR exposure"
          trend={`${formatMoney(stats.protectedSpread)} protected spread`}
          value={formatMoney(stats.mrr)}
        />
      </section>

      <SectionDivider />

      <section className="grid min-w-0 gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <SectionHeader
            eyebrow="Account directory"
            title="Relationship queue"
            description="Filter by lifecycle and billing posture, then act from the selected account context."
          />
          <ClientToolbar
            billingFilter={billingFilter}
            query={query}
            setBillingFilter={(value) => { setBillingFilter(value); setPage(1); }}
            setQuery={(value) => { setQuery(value); setPage(1); }}
            setSortKey={(value) => { setSortKey(value); setPage(1); }}
            setStatusFilter={(value) => { setStatusFilter(value); setPage(1); }}
            setViewMode={(value) => { setViewMode(value); setPage(1); }}
            sortKey={sortKey}
            statusFilter={statusFilter}
            viewMode={viewMode}
          />
        </div>

        <div
          className={cn(
            "grid gap-4",
            viewMode === "grid" ? "xl:grid-cols-2" : "grid-cols-1",
          )}
        >
          {paginatedClients.map((client) => (
            <ClientCard
              client={client}
              key={client.id}
              selected={selected?.id === client.id}
              viewMode={viewMode}
              onOpen={() => {
                setSelectedId(client.id);
                setDetailClient(client);
              }}
              onSelect={() => setSelectedId(client.id)}
            />
          ))}
          {!filtered.length && (
            <EmptyState
              title="No clients match this view"
              body="Clear the search, switch filters, or add a client account from the header action."
            />
          )}
        </div>

        {filtered.length > 0 && (
          <ClientPagination
            onPageChange={setPage}
            onPageSizeChange={(value) => { setPageSize(value); setPage(1); }}
            page={activePage}
            pageSize={pageSize}
            total={filtered.length}
            totalPages={totalPages}
          />
        )}
      </section>

      <SectionDivider />

      <ClientAccountRoom client={selected} stats={stats} />

      <SectionDivider />

      <section className="grid min-w-0 gap-7 2xl:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)]">
        <ClientPortfolioMap clients={clients} />
        <ClientCommandPanel
          client={selected}
          onAdvance={selected ? () => advanceClient(selected) : undefined}
          onArchive={selected ? () => setConfirmClient(selected) : undefined}
          onOpen={selected ? () => setDetailClient(selected) : undefined}
          onRisk={selected ? () => markRisk(selected) : undefined}
        />
      </section>

      <SectionDivider />

      <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <ChartPanel
          title="Portfolio health movement"
          description="Account health trend across the current operating cycle."
          value={`${stats.avgHealth}% avg`}
        >
          <DashboardLineChart
            data={[64, 68, 72, 74, 79, 82, stats.avgHealth]}
            height={300}
            labels={["Apr 22", "Apr 29", "May 6", "May 13", "May 20", "May 27", "Now"]}
            variant="area"
          />
        </ChartPanel>
        <ChartPanel
          title="Lifecycle mix"
          description="Distribution of clients by relationship state."
          value={`${clients.length} accounts`}
        >
          <DashboardDonutChart
            data={statusOrder.map((status) => ({
              label: statusMeta[status].label,
              tone:
                status === "active" || status === "expansion"
                  ? ("success" as const)
                  : status === "risk"
                    ? ("primary" as const)
                    : status === "onboarding"
                      ? ("secondary" as const)
                      : ("muted" as const),
              value: clients.filter((client) => client.status === status).length,
            }))}
            height={210}
          />
        </ChartPanel>
      </section>

      <OperationalDataTable
        columns={columns}
        description="Compare lifecycle state, account health, open briefs, MRR, billing posture, and ownership across the client portfolio."
        empty="No client accounts match the active Network filters."
        onRowSelect={(client) => {
          setSelectedId(client.id);
          setDetailClient(client);
        }}
        rows={paginatedClients}
        title="Current page account matrix"
        toolbar={
          <span className="rounded-full border border-[var(--glass-border)] px-3 py-1.5 font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
            Page {activePage}/{totalPages}
          </span>
        }
      />

      {/* ── Client Detail Modal ──────────────────────────────────────────────── */}
      {detailClient && (
        <ClientDetailModal
          key={detailClient.id}
          client={detailClient}
          onAdvance={() => advanceClient(detailClient)}
          onArchive={() => { setDetailClient(null); setConfirmClient(detailClient); }}
          onClose={() => setDetailClient(null)}
          onRisk={() => markRisk(detailClient)}
          onSaveEdit={(payload) => saveClientEdit(detailClient, payload)}
          onSaveNotes={(notes) => updateNotes(detailClient.id, notes)}
          onSaveStakeholders={(stakeholders) => saveStakeholders(detailClient, stakeholders)}
          onSendMessage={(message) => sendMessage(detailClient, message)}
        />
      )}

      {/* ── Create Client Modal ──────────────────────────────────────────────── */}
      <CreateClientModal
        onClose={() => setCreateOpen(false)}
        onSubmit={createClient}
        open={createOpen}
      />

      {/* ── Confirm Archive ──────────────────────────────────────────────────── */}
      <ConfirmDialog
        confirmLabel="Archive client"
        description={`This removes ${confirmClient?.name ?? "the client"} from the active client queue while preserving the future audit trail pattern.`}
        onCancel={() => setConfirmClient(null)}
        onConfirm={archiveClient}
        open={Boolean(confirmClient)}
        title="Archive this client?"
      />
    </div>
  );
}

// ─── ClientCard ───────────────────────────────────────────────────────────────

function ClientCard({
  client,
  onOpen,
  onSelect,
  selected,
  viewMode,
}: {
  client: ClientRecord;
  onOpen: () => void;
  onSelect: () => void;
  selected: boolean;
  viewMode: ViewMode;
}) {
  const healthTone =
    client.health < 70 ? "var(--error)" : client.health > 85 ? "var(--tertiary)" : "var(--primary)";

  return (
    <article
      className={cn(
        "group min-w-0 overflow-hidden rounded-[1.4rem] border transition-all duration-300",
        selected
          ? "border-[color-mix(in_srgb,var(--primary)_40%,var(--glass-border))] bg-gradient-to-br from-[color-mix(in_srgb,var(--primary)_8%,var(--surface))] to-[var(--surface)] shadow-[0_20px_56px_color-mix(in_srgb,var(--bg-deep)_12%,transparent)]"
          : client.status === "risk"
            ? "border-[color-mix(in_srgb,var(--error)_30%,var(--glass-border))] bg-gradient-to-br from-[color-mix(in_srgb,var(--error)_5%,var(--surface))] to-[var(--surface)] hover:border-[color-mix(in_srgb,var(--error)_48%,var(--glass-border))]"
            : "border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,var(--surface))] to-[var(--surface)] hover:border-[color-mix(in_srgb,var(--primary)_28%,var(--glass-border))] hover:shadow-[0_16px_44px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)]",
        viewMode === "list" && "xl:grid xl:grid-cols-[minmax(0,1fr)_22rem]",
      )}
    >
      {/* ── Clickable body - opens detail modal ──────────────────────────────── */}
      <button
        className="block w-full min-w-0 cursor-pointer p-5 text-left sm:p-6"
        onClick={() => { onSelect(); onOpen(); }}
        type="button"
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            {/* Logo avatar */}
            <span
              className={cn(
                "grid h-12 w-12 shrink-0 place-items-center rounded-2xl border text-[1.1rem] font-medium transition-colors duration-300",
                client.status === "risk"
                  ? "border-[color-mix(in_srgb,var(--error)_22%,transparent)] bg-[color-mix(in_srgb,var(--error)_10%,transparent)] text-[var(--error)]"
                  : "border-[color-mix(in_srgb,var(--primary)_22%,transparent)] bg-[color-mix(in_srgb,var(--primary)_9%,transparent)] text-[var(--primary)]",
              )}
            >
              {client.name.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="break-words text-[1rem] font-medium leading-snug text-[var(--on-surface)]">
                  {client.name}
                </h3>
                <StatusBadge label={statusMeta[client.status].label} tone={statusMeta[client.status].tone} />
              </div>
              <p className="mt-1 text-[0.82rem] text-[var(--on-surface-dim)]">
                {client.industry} · {client.tier}
              </p>
            </div>
          </div>

          {/* Health ring */}
          <HealthRing value={client.health} size={52} />
        </div>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.8rem] text-[var(--on-surface-dim)]">
          <span className="inline-flex items-center gap-1.5">
            <IconUsers size={13} stroke={1.6} />
            {client.primaryContact}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconClock size={13} stroke={1.6} />
            {client.lastTouched}
          </span>
          {client.mrr > 0 && (
            <span className="font-mono text-[var(--on-surface)]">{formatMoney(client.mrr)}/mo</span>
          )}
        </div>

        {/* Signal trio */}
        <div className="mt-4 grid grid-cols-4 overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_24%,transparent)]">
          <SignalCell label="Briefs" value={String(client.briefs)} />
          <SignalCell label="Active" value={String(client.placementCount)} />
          <SignalCell label="Invoices" value={String(client.openInvoices)} />
          <SignalCell label="Decision" value={`${client.decisionHealth}%`} />
        </div>

        {/* Thin signal bars */}
        <div className="mt-4 space-y-2.5">
          <div>
            <div className="mb-1 flex items-center justify-between gap-2 text-[0.72rem] text-[var(--on-surface-dim)]">
              <span>Relationship</span>
              <span className="font-mono text-[var(--on-surface)]">{client.relationshipScore}%</span>
            </div>
            <div className="h-[0.22rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  background: `linear-gradient(90deg, color-mix(in srgb, var(--tertiary) 50%, transparent), var(--tertiary))`,
                  width: `${client.relationshipScore}%`,
                }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between gap-2 text-[0.72rem] text-[var(--on-surface-dim)]">
              <span>Account health</span>
              <span className="font-mono" style={{ color: healthTone }}>{client.health}%</span>
            </div>
            <div className="h-[0.22rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  background: `linear-gradient(90deg, color-mix(in srgb, ${healthTone} 40%, transparent), ${healthTone})`,
                  width: `${client.health}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Next action */}
        <p className="mt-4 line-clamp-2 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">
          <span className="mr-1.5 text-[var(--primary)] opacity-70">→</span>
          {client.nextAction}
        </p>

        {/* Stakeholder initials */}
        {client.stakeholders.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              {client.stakeholders.slice(0, 3).map((s) => (
                <span
                  key={s.name}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-[var(--surface)] font-mono text-[0.6rem] text-white"
                  style={{ background: influenceColors[s.influence] }}
                  title={`${s.name} (${s.influence})`}
                >
                  {getInitials(s.name)}
                </span>
              ))}
              {client.stakeholders.length > 3 && (
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-[var(--surface)] bg-[var(--glass-bg)] font-mono text-[0.6rem] text-[var(--on-surface-dim)]">
                  +{client.stakeholders.length - 3}
                </span>
              )}
            </div>
            <span className="text-[0.72rem] text-[var(--on-surface-dim)]">
              {client.stakeholders.length} stakeholder{client.stakeholders.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Billing posture badge + open caret */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <StatusBadge
            label={billingMeta[client.billingPosture].label}
            tone={billingMeta[client.billingPosture].tone}
          />
          <span className="inline-flex items-center gap-1 text-[0.75rem] font-medium text-[var(--primary)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            View details
            <IconArrowRight size={13} stroke={1.8} />
          </span>
        </div>
      </button>
    </article>
  );
}

// ─── ClientDetailModal ────────────────────────────────────────────────────────

function ClientDetailModal({
  client,
  onAdvance,
  onArchive,
  onClose,
  onRisk,
  onSaveEdit,
  onSaveNotes,
  onSaveStakeholders,
  onSendMessage,
}: {
  client: ClientRecord;
  onAdvance: () => void;
  onArchive: () => void;
  onClose: () => void;
  onRisk: () => void;
  onSaveEdit: (payload: {
    billingPosture: ClientRecord["billingPosture"];
    briefs: number;
    contactEmail: string;
    health: number;
    industry: string;
    mrr: number;
    name: string;
    nextAction: string;
    notes: string;
    openInvoices: number;
    owner: string;
    placementCount: number;
    primaryContact: string;
    relationshipScore: number;
    risk: string;
    stageAge: number;
    status: ClientStatus;
    tier: ClientTier;
  }) => void;
  onSaveNotes: (notes: string) => void;
  onSaveStakeholders: (stakeholders: Stakeholder[]) => void;
  onSendMessage: (message: string) => void;
}) {
  const [tab, setTab] = useState<DetailTab>("overview");
  const [editMode, setEditMode] = useState(false);
  const [stakeholderMode, setStakeholderMode] = useState(false);
  const [messageMode, setMessageMode] = useState(false);
  const [prevNotes, setPrevNotes] = useState(client.notes);
  const [noteDraft, setNoteDraft] = useState(client.notes);
  const scrollRef = useRef<HTMLDivElement>(null);
  const next = statusMeta[client.status].next;

  if (client.notes !== prevNotes) {
    setPrevNotes(client.notes);
    setNoteDraft(client.notes);
  }

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
      aria-labelledby="client-detail-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--bg-deep)_76%,transparent)] backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative flex h-full max-h-[92dvh] w-full max-w-[74rem] flex-col overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_40%,var(--surface))] to-[var(--surface)] shadow-[0_32px_120px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)]">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex shrink-0 flex-col gap-4 border-b border-[var(--glass-border)] px-6 pb-0 pt-6 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              {/* Avatar */}
              <span
                className={cn(
                  "grid h-14 w-14 shrink-0 place-items-center rounded-2xl border text-[1.4rem] font-medium shadow-[inset_0_1px_0_color-mix(in_srgb,white_12%,transparent)]",
                  client.status === "risk"
                    ? "border-[color-mix(in_srgb,var(--error)_24%,transparent)] bg-[color-mix(in_srgb,var(--error)_12%,transparent)] text-[var(--error)]"
                    : "border-[color-mix(in_srgb,var(--primary)_24%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]",
                )}
              >
                {client.name.slice(0, 1)}
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 id="client-detail-title" className="text-[1.3rem] font-medium leading-tight text-[var(--on-surface)]">
                    {client.name}
                  </h2>
                  <StatusBadge label={statusMeta[client.status].label} tone={statusMeta[client.status].tone} />
                  <StatusBadge label={billingMeta[client.billingPosture].label} tone={billingMeta[client.billingPosture].tone} />
                </div>
                <p className="mt-1 text-[0.84rem] text-[var(--on-surface-dim)]">
                  {client.industry} · {client.tier} · Owned by {client.owner}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <HealthRing value={client.health} size={56} />
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

          {/* Tab nav */}
          <nav className="flex gap-1">
            {(["overview", "stakeholders", "financials", "activity"] as DetailTab[]).map((t) => (
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

        {/* ── Scrollable body ─────────────────────────────────────────────────── */}
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {tab === "overview" && (
            <OverviewTab
              client={client}
              editMode={editMode}
              noteDraft={noteDraft}
              onCancelEdit={() => setEditMode(false)}
              onNoteDraftChange={setNoteDraft}
              onSaveEdit={(payload) => { onSaveEdit(payload); setEditMode(false); }}
              onSaveNotes={() => onSaveNotes(noteDraft)}
              onToggleEdit={() => setEditMode((v) => !v)}
            />
          )}
          {tab === "stakeholders" && (
            <StakeholdersTab
              client={client}
              editMode={stakeholderMode}
              onCancelEdit={() => setStakeholderMode(false)}
              onSave={(stakeholders) => { onSaveStakeholders(stakeholders); setStakeholderMode(false); }}
              onToggleEdit={() => setStakeholderMode((v) => !v)}
              onMessage={() => setMessageMode(true)}
            />
          )}
          {tab === "financials" && (
            <FinancialsTab client={client} />
          )}
          {tab === "activity" && (
            <ActivityTab client={client} />
          )}
        </div>

        {/* ── Footer actions ──────────────────────────────────────────────────── */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_30%,transparent)] px-6 py-4 sm:px-7">
          <div className="flex flex-wrap items-center gap-2">
            <FooterButton
              icon={IconPencil}
              label="Edit account"
              onClick={() => { setTab("overview"); setEditMode(true); }}
            />
            <FooterButton
              icon={IconUsers}
              label="Stakeholders"
              onClick={() => { setTab("stakeholders"); setStakeholderMode(true); }}
            />
            <FooterButton
              icon={IconMessageCircle}
              label="Message"
              onClick={() => setMessageMode(true)}
            />
            <FooterButton
              danger={client.status !== "risk"}
              icon={IconAlertTriangle}
              label={client.status === "risk" ? "Recover" : "Mark risk"}
              onClick={onRisk}
            />
            <FooterButton
              danger
              icon={IconTrash}
              label="Archive"
              onClick={onArchive}
            />
          </div>
          <div className="flex items-center gap-2">
            {next && (
              <button
                type="button"
                onClick={onAdvance}
                className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-5 text-[0.86rem] font-medium text-[var(--bg)] shadow-[0_8px_24px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                <IconCheck size={15} stroke={1.8} />
                Advance to {statusMeta[next].label}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Message sub-modal ────────────────────────────────────────────────── */}
      {messageMode && (
        <MessageModal
          recipientName={client.primaryContact}
          onClose={() => setMessageMode(false)}
          onSend={(msg) => { onSendMessage(msg); setMessageMode(false); }}
        />
      )}
    </div>
  );
}

// ─── Detail tabs ──────────────────────────────────────────────────────────────

function OverviewTab({
  client,
  editMode,
  noteDraft,
  onCancelEdit,
  onNoteDraftChange,
  onSaveEdit,
  onSaveNotes,
  onToggleEdit,
}: {
  client: ClientRecord;
  editMode: boolean;
  noteDraft: string;
  onCancelEdit: () => void;
  onNoteDraftChange: (v: string) => void;
  onSaveEdit: (payload: Parameters<AdminClientsPageSaveEdit>[0]) => void;
  onSaveNotes: () => void;
  onToggleEdit: () => void;
}) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editMode) firstInputRef.current?.focus(); }, [editMode]);

  if (editMode) {
    return (
      <EditClientForm
        client={client}
        firstInputRef={firstInputRef}
        onCancel={onCancelEdit}
        onSave={onSaveEdit}
      />
    );
  }

  return (
    <div className="grid gap-6 p-6 sm:p-7">
      {/* Account promise */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] p-5 backdrop-blur-xl">
          <p className="label-caps text-[var(--primary)]">Account promise</p>
          <p className="mt-3 text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
            {client.accountPromise}
          </p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
            <InfoTile label="Next milestone" value={client.nextMilestone} />
            <InfoTile label="Decision health" value={`${client.decisionHealth}%`} />
            <InfoTile label="Stage age" value={`${client.stageAge}d`} />
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-4">
            <p className="text-[0.82rem] font-medium text-[var(--on-surface)]">Commercial model</p>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
              {client.commercialModel}
            </p>
          </div>
          <div className="rounded-[1.2rem] border border-[color-mix(in_srgb,var(--error)_20%,var(--glass-border))] bg-[color-mix(in_srgb,var(--error)_5%,transparent)] p-4">
            <p className="text-[0.82rem] font-medium text-[var(--error)]">Risk signal</p>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">{client.risk}</p>
          </div>
        </div>
      </section>

      {/* Next action + notes */}
      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-5">
          <p className="text-[0.82rem] font-medium text-[var(--on-surface)]">Next account move</p>
          <p className="mt-3 text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
            {client.nextAction}
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.82rem] font-medium text-[var(--on-surface)]">Admin notes</p>
            <button
              type="button"
              onClick={onSaveNotes}
              className="rounded-full bg-[var(--on-surface)] px-3 py-1 text-[0.72rem] font-medium text-[var(--bg)] transition-transform duration-200 hover:-translate-y-px"
            >
              Save
            </button>
          </div>
          <textarea
            className="min-h-[7rem] w-full resize-none rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.86rem] leading-relaxed text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]"
            onChange={(e) => onNoteDraftChange(e.target.value)}
            placeholder="Private account notes..."
            value={noteDraft}
          />
        </div>
      </section>

      {/* Visibility policy */}
      <section>
        <p className="mb-3 text-[0.82rem] font-medium text-[var(--on-surface)]">Role visibility policy</p>
        <div className="grid gap-3 md:grid-cols-3">
          {(["admin", "client", "developer"] as const).map((role) => (
            <div key={role} className="rounded-[1.15rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_18%,transparent)] p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">{role}</p>
              <p className="mt-2 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">
                {client.roleVisibility[role]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Margin guardrail */}
      <div className="rounded-[1.2rem] border border-[color-mix(in_srgb,var(--primary)_18%,var(--glass-border))] bg-[color-mix(in_srgb,var(--primary)_5%,transparent)] p-4">
        <p className="text-[0.78rem] font-medium text-[var(--primary)]">Margin guardrail (admin only)</p>
        <p className="mt-1.5 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">
          {client.marginGuardrail}
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onToggleEdit}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] px-4 py-2 text-[0.82rem] font-medium text-[var(--on-surface)] transition-colors duration-200 hover:bg-[var(--glass-bg)]"
        >
          <IconPencil size={14} stroke={1.7} />
          Edit account
        </button>
      </div>
    </div>
  );
}

function StakeholdersTab({
  client,
  editMode,
  onCancelEdit,
  onMessage,
  onSave,
  onToggleEdit,
}: {
  client: ClientRecord;
  editMode: boolean;
  onCancelEdit: () => void;
  onMessage: () => void;
  onSave: (stakeholders: Stakeholder[]) => void;
  onToggleEdit: () => void;
}) {
  const [prevStakeholders, setPrevStakeholders] = useState(client.stakeholders);
  const [items, setItems] = useState<Stakeholder[]>(client.stakeholders.map((s) => ({ ...s })));

  if (client.stakeholders !== prevStakeholders) {
    setPrevStakeholders(client.stakeholders);
    setItems(client.stakeholders.map((s) => ({ ...s })));
  }

  const updateItem = (index: number, key: keyof Stakeholder, value: string) => {
    setItems((cur) => cur.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  if (editMode) {
    return (
      <div className="grid gap-4 p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.9rem] font-medium text-[var(--on-surface)]">Edit buying committee</p>
          <button
            type="button"
            onClick={() => setItems((cur) => [...cur, { influence: "buyer", name: "", role: "" }])}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] px-3 py-1.5 text-[0.78rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]"
          >
            <IconPlus size={13} stroke={1.8} />
            Add
          </button>
        </div>

        <div className="grid gap-3">
          {items.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="grid gap-3 rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-4 md:grid-cols-[1fr_1fr_10rem_auto] md:items-end"
            >
              <label>
                <span className="text-[0.72rem] font-medium text-[var(--on-surface)]">Name</span>
                <input
                  className="mt-1.5 h-10 w-full rounded-full border border-[var(--glass-border)] bg-[var(--surface)] px-3.5 text-[0.84rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  value={item.name}
                />
              </label>
              <label>
                <span className="text-[0.72rem] font-medium text-[var(--on-surface)]">Role</span>
                <input
                  className="mt-1.5 h-10 w-full rounded-full border border-[var(--glass-border)] bg-[var(--surface)] px-3.5 text-[0.84rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                  onChange={(e) => updateItem(index, "role", e.target.value)}
                  value={item.role}
                />
              </label>
              <label>
                <span className="text-[0.72rem] font-medium text-[var(--on-surface)]">Influence</span>
                <select
                  className="mt-1.5 h-10 w-full cursor-pointer rounded-full border border-[var(--glass-border)] bg-[var(--surface)] px-3.5 text-[0.84rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                  onChange={(e) => updateItem(index, "influence", e.target.value)}
                  value={item.influence}
                >
                  <option value="buyer">Buyer</option>
                  <option value="technical">Technical</option>
                  <option value="finance">Finance</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() => setItems((cur) => cur.filter((_, i) => i !== index))}
                className="min-h-10 cursor-pointer rounded-full border border-[color-mix(in_srgb,var(--error)_28%,var(--glass-border))] px-3 text-[0.78rem] font-medium text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancelEdit} className="min-h-9 cursor-pointer rounded-full border border-[var(--glass-border)] px-4 text-[0.82rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(items.filter((item) => item.name.trim()))}
            className="min-h-9 cursor-pointer rounded-full bg-[var(--on-surface)] px-4 text-[0.82rem] font-medium text-[var(--bg)]"
          >
            Save map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.9rem] font-medium text-[var(--on-surface)]">Buying committee</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onMessage}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] px-3 py-1.5 text-[0.78rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]"
          >
            <IconMessageCircle size={13} stroke={1.7} />
            Message
          </button>
          <button
            type="button"
            onClick={onToggleEdit}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] px-3 py-1.5 text-[0.78rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]"
          >
            <IconPencil size={13} stroke={1.7} />
            Edit
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {client.stakeholders.map((s) => (
          <div
            key={s.name}
            className="flex flex-col gap-3 rounded-[1.2rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] p-4 backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl font-mono text-[0.7rem] text-white shadow-[inset_0_1px_0_color-mix(in_srgb,white_18%,transparent)]"
                style={{ background: influenceColors[s.influence] }}
              >
                {getInitials(s.name)}
              </span>
              <span
                className="rounded-full px-2 py-0.5 font-mono text-[0.62rem] font-medium capitalize"
                style={{
                  background: `color-mix(in srgb, ${influenceColors[s.influence]} 14%, transparent)`,
                  color: influenceColors[s.influence],
                }}
              >
                {s.influence}
              </span>
            </div>
            <div>
              <p className="text-[0.88rem] font-medium text-[var(--on-surface)]">{s.name}</p>
              <p className="mt-0.5 text-[0.76rem] text-[var(--on-surface-dim)]">{s.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinancialsTab({ client }: { client: ClientRecord }) {
  const projectValue = client.mrr || Math.max(client.briefs, 1) * 4800;
  const devBudget = Math.round(projectValue * (client.status === "risk" ? 0.54 : 0.48));
  const spread = Math.max(0, projectValue - devBudget);
  const healthTone = client.health < 70 ? "var(--error)" : client.health > 85 ? "var(--tertiary)" : "var(--primary)";

  const statItems = [
    { label: "MRR", value: formatMoney(client.mrr), accent: "var(--tertiary)" },
    { label: "Placements", value: String(client.placementCount), accent: "var(--primary)" },
    { label: "Open briefs", value: String(client.briefs), accent: "var(--secondary)" },
    { label: "Open invoices", value: String(client.openInvoices), accent: client.openInvoices > 0 ? "var(--error)" : "var(--on-surface-dim)" },
    { label: "Protected spread", value: formatMoney(spread), accent: "var(--tertiary)" },
    { label: "Account health", value: `${client.health}%`, accent: healthTone },
    { label: "Relationship", value: `${client.relationshipScore}%`, accent: "var(--primary)" },
    { label: "Decision health", value: `${client.decisionHealth}%`, accent: "var(--secondary)" },
  ];

  return (
    <div className="grid gap-6 p-6 sm:p-7">
      {/* Billing posture callout */}
      <div
        className={cn(
          "flex items-center gap-4 rounded-[1.2rem] border p-4",
          client.billingPosture === "overdue"
            ? "border-[color-mix(in_srgb,var(--error)_28%,var(--glass-border))] bg-[color-mix(in_srgb,var(--error)_6%,transparent)]"
            : client.billingPosture === "watch"
              ? "border-[color-mix(in_srgb,var(--secondary)_28%,var(--glass-border))] bg-[color-mix(in_srgb,var(--secondary)_6%,transparent)]"
              : "border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)]",
        )}
      >
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
            client.billingPosture === "overdue"
              ? "bg-[color-mix(in_srgb,var(--error)_14%,transparent)] text-[var(--error)]"
              : "bg-[color-mix(in_srgb,var(--tertiary)_14%,transparent)] text-[var(--tertiary)]",
          )}
        >
          <IconReceipt size={18} stroke={1.6} />
        </span>
        <div>
          <p className="text-[0.84rem] font-medium text-[var(--on-surface)]">
            Billing: {billingMeta[client.billingPosture].label}
          </p>
          <p className="mt-0.5 text-[0.78rem] text-[var(--on-surface-dim)]">
            {client.billingPosture === "overdue"
              ? "Immediate action required - invoice aging is escalating."
              : client.billingPosture === "watch"
                ? "Monitor closely - payment cadence is irregular."
                : client.billingPosture === "healthy"
                  ? "Payments on schedule - billing confidence is high."
                  : "Pre-revenue - no invoices issued yet."}
          </p>
        </div>
      </div>

      {/* Key financials grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-1.5 rounded-[1.1rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_28%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_4%,transparent)] p-4 backdrop-blur-md"
          >
            <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">
              {item.label}
            </p>
            <p className="mt-1 font-mono text-[1.2rem] leading-none font-medium text-[var(--on-surface)]">
              {item.value}
            </p>
            <div
              className="mt-auto h-[0.22rem] w-full rounded-full opacity-40"
              style={{ background: item.accent }}
            />
          </div>
        ))}
      </div>

      {/* Signal bars */}
      <div className="grid gap-3 sm:grid-cols-2">
        <SignalBarDetailed label="Account health" value={client.health} tone={healthTone} detail={`${client.health >= 85 ? "Healthy" : client.health >= 70 ? "Stable" : "At risk"} composite`} />
        <SignalBarDetailed label="Relationship score" value={client.relationshipScore} tone="var(--tertiary)" detail="Stakeholder trust signal" />
        <SignalBarDetailed label="Expansion readiness" value={client.status === "expansion" ? 90 : client.status === "active" ? 72 : 44} tone="var(--primary)" detail="Commercial momentum" />
        <SignalBarDetailed label="Decision health" value={client.decisionHealth} tone="var(--secondary)" detail="Buying committee alignment" />
      </div>

      {/* Commercial model */}
      <div className="rounded-[1.2rem] border border-[color-mix(in_srgb,var(--primary)_16%,var(--glass-border))] bg-[color-mix(in_srgb,var(--primary)_5%,transparent)] p-5">
        <p className="text-[0.78rem] font-medium uppercase tracking-[0.1em] text-[var(--primary)]">Commercial abstraction</p>
        <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{client.commercialModel}</p>
        <p className="mt-3 text-[0.78rem] leading-relaxed text-[var(--on-surface-dim)] opacity-70">
          {client.marginGuardrail}
        </p>
      </div>
    </div>
  );
}

function ActivityTab({ client }: { client: ClientRecord }) {
  return (
    <div className="grid gap-4 p-6 sm:p-7">
      <p className="text-[0.9rem] font-medium text-[var(--on-surface)]">Recent activity</p>
      <div className="grid gap-0">
        {client.activity.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-4 pb-5 last:pb-0"
          >
            {/* Timeline line */}
            {index < client.activity.length - 1 && (
              <div className="absolute left-[0.69rem] top-5 bottom-0 w-px bg-[var(--glass-border)]" />
            )}
            {/* Dot */}
            <span
              className={cn(
                "relative mt-1 h-[0.6rem] w-[0.6rem] translate-y-[0.15rem] rounded-full border-2",
                index === 0
                  ? "border-[var(--tertiary)] bg-[var(--tertiary)]"
                  : "border-[var(--glass-border)] bg-[var(--surface)]",
              )}
            />
            <div className="min-w-0">
              <p className="text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{item}</p>
              {index === 0 && (
                <span className="mt-1 block text-[0.7rem] text-[var(--on-surface-dim)] opacity-60">
                  {client.lastTouched}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Edit form (inline in Overview tab) ──────────────────────────────────────

type AdminClientsPageSaveEdit = (payload: {
  billingPosture: ClientRecord["billingPosture"];
  briefs: number;
  contactEmail: string;
  health: number;
  industry: string;
  mrr: number;
  name: string;
  nextAction: string;
  notes: string;
  openInvoices: number;
  owner: string;
  placementCount: number;
  primaryContact: string;
  relationshipScore: number;
  risk: string;
  stageAge: number;
  status: ClientStatus;
  tier: ClientTier;
}) => void;

function EditClientForm({
  client,
  firstInputRef,
  onCancel,
  onSave,
}: {
  client: ClientRecord;
  firstInputRef: React.RefObject<HTMLInputElement | null>;
  onCancel: () => void;
  onSave: AdminClientsPageSaveEdit;
}) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const readNum = (key: string, fallback: number) => {
      const v = Number(form.get(key));
      return Number.isFinite(v) ? v : fallback;
    };
    onSave({
      billingPosture: (String(form.get("billingPosture") || client.billingPosture) as ClientRecord["billingPosture"]) || client.billingPosture,
      briefs: readNum("briefs", client.briefs),
      contactEmail: String(form.get("contactEmail") || "").trim() || client.contactEmail,
      health: readNum("health", client.health),
      industry: String(form.get("industry") || "").trim() || client.industry,
      mrr: readNum("mrr", client.mrr),
      name: String(form.get("name") || "").trim() || client.name,
      nextAction: String(form.get("nextAction") || "").trim() || client.nextAction,
      notes: String(form.get("notes") || "").trim() || client.notes,
      openInvoices: readNum("openInvoices", client.openInvoices),
      owner: String(form.get("owner") || "").trim() || client.owner,
      placementCount: readNum("placementCount", client.placementCount),
      primaryContact: String(form.get("primaryContact") || "").trim() || client.primaryContact,
      relationshipScore: readNum("relationshipScore", client.relationshipScore),
      risk: String(form.get("risk") || "").trim() || client.risk,
      stageAge: readNum("stageAge", client.stageAge),
      status: (String(form.get("status") || client.status) as ClientStatus) || client.status,
      tier: (String(form.get("tier") || client.tier) as ClientTier) || client.tier,
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-5 p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.9rem] font-medium text-[var(--on-surface)]">Edit account profile</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormInput ref={firstInputRef} defaultValue={client.name} label="Client name" name="name" placeholder="Kijani Analytics" />
        <FormInput defaultValue={client.primaryContact} label="Primary contact" name="primaryContact" placeholder="Maya Kamau" />
        <FormInput defaultValue={client.contactEmail} label="Contact email" name="contactEmail" placeholder="maya@company.com" />
        <FormInput defaultValue={client.industry} label="Industry" name="industry" placeholder="Climate fintech" />
        <FormInput defaultValue={client.owner} label="Owner" name="owner" placeholder="Dennis" />
        <FormSelectField label="Tier" name="tier" defaultValue={client.tier}>
          {["Seed", "Series A", "Series B", "Growth", "Enterprise"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </FormSelectField>
        <FormSelectField label="Lifecycle" name="status" defaultValue={client.status}>
          {statusOrder.map((s) => (
            <option key={s} value={s}>{statusMeta[s].label}</option>
          ))}
        </FormSelectField>
        <FormSelectField label="Billing posture" name="billingPosture" defaultValue={client.billingPosture}>
          {Object.entries(billingMeta).map(([v, m]) => (
            <option key={v} value={v}>{m.label}</option>
          ))}
        </FormSelectField>
        <FormInput defaultValue={String(client.mrr)} label="MRR" name="mrr" placeholder="16800" type="number" />
        <FormInput defaultValue={String(client.health)} label="Health" name="health" placeholder="92" type="number" />
        <FormInput defaultValue={String(client.relationshipScore)} label="Relationship" name="relationshipScore" placeholder="94" type="number" />
        <FormInput defaultValue={String(client.briefs)} label="Open briefs" name="briefs" placeholder="2" type="number" />
        <FormInput defaultValue={String(client.placementCount)} label="Placements" name="placementCount" placeholder="1" type="number" />
        <FormInput defaultValue={String(client.openInvoices)} label="Open invoices" name="openInvoices" placeholder="1" type="number" />
        <FormInput defaultValue={String(client.stageAge)} label="Stage age (days)" name="stageAge" placeholder="4" type="number" />
        <FormInput defaultValue={client.risk} label="Risk note" name="risk" placeholder="Intro window closes Friday" />

        <label className="md:col-span-3">
          <span className="text-[0.76rem] font-medium text-[var(--on-surface)]">Next action</span>
          <textarea
            className="mt-2 min-h-[5rem] w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3.5 text-[0.88rem] leading-relaxed text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]"
            defaultValue={client.nextAction}
            name="nextAction"
            placeholder="Next account move..."
          />
        </label>
        <label className="md:col-span-3">
          <span className="text-[0.76rem] font-medium text-[var(--on-surface)]">Account notes</span>
          <textarea
            className="mt-2 min-h-[5rem] w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3.5 text-[0.88rem] leading-relaxed text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]"
            defaultValue={client.notes}
            name="notes"
            placeholder="Private notes..."
          />
        </label>
      </div>

      <div className="flex justify-end gap-2 border-t border-[var(--glass-border)] pt-4">
        <button type="button" onClick={onCancel} className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]">
          Cancel
        </button>
        <button type="submit" className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-5 text-[0.86rem] font-medium text-[var(--bg)]">
          Save account
        </button>
      </div>
    </form>
  );
}

// ─── MessageModal (focused sub-modal, z-[90]) ─────────────────────────────────

function MessageModal({
  onClose,
  onSend,
  recipientName,
}: {
  onClose: () => void;
  onSend: (message: string) => void;
  recipientName: string;
}) {
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-[color-mix(in_srgb,var(--bg-deep)_60%,transparent)] px-4 backdrop-blur-lg"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl rounded-[1.5rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_40%,var(--surface))] to-[var(--surface)] p-6 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-caps text-[var(--primary)]">Stakeholder update</p>
            <h3 className="mt-2 text-[1.1rem] font-medium text-[var(--on-surface)]">
              Message {recipientName}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]">
            <IconX size={16} stroke={1.6} />
          </button>
        </div>
        <label className="mt-5 block">
          <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">Message</span>
          <textarea
            ref={textareaRef}
            className="mt-2 min-h-[8rem] w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3.5 text-[0.88rem] leading-relaxed text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]"
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Share next action, intro timing, billing update, or recovery plan..."
            value={draft}
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { if (draft.trim()) { onSend(draft); } }}
            disabled={!draft.trim()}
            className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-5 text-[0.86rem] font-medium text-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send update
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ClientPortfolioMap ───────────────────────────────────────────────────────

function ClientPortfolioMap({ clients }: { clients: ClientRecord[] }) {
  const statusCounts = statusOrder.map((status) => clients.filter((client) => client.status === status).length);
  const topAccounts = [...clients].sort((a, b) => b.mrr - a.mrr).slice(0, 4);

  return (
    <div className="min-w-0">
      <SectionHeader
        eyebrow="Relationship observability"
        title="Portfolio pressure map"
        description="Health, revenue exposure, lifecycle distribution, and next account motion are visible before opening a single record."
      />
      <div className="mt-6 grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-h-[27rem] overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_40%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-2xl">
          <DashboardBarChart
            data={statusCounts}
            height={330}
            labels={statusOrder.map((s) => statusMeta[s].label)}
          />
        </div>
        <div className="grid min-w-0 gap-3 md:grid-cols-2 2xl:grid-cols-1">
          {topAccounts.map((client) => (
            <article
              className="group min-w-0 overflow-hidden rounded-[1.2rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_28%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] p-4 backdrop-blur-md transition-all duration-300 hover:border-[color-mix(in_srgb,var(--primary)_24%,var(--glass-border))] hover:shadow-[0_12px_32px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)]"
              key={client.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[0.9rem] font-medium text-[var(--on-surface)]">{client.name}</p>
                  <p className="mt-0.5 truncate text-[0.74rem] text-[var(--on-surface-dim)]">{client.nextAction}</p>
                </div>
                <HealthRing value={client.health} size={40} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-[0.76rem]">
                <span className="min-w-0 truncate text-[var(--on-surface-dim)]">{client.primaryContact}</span>
                <span className="font-mono text-[var(--on-surface)]">{formatMoney(client.mrr)}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ClientAccountRoom ────────────────────────────────────────────────────────

function ClientAccountRoom({
  client,
  stats,
}: {
  client: ClientRecord | null;
  stats: ReturnType<typeof buildClientStats>;
}) {
  if (!client) {
    return <EmptyState title="No account selected" body="Select a client to open the account command room." />;
  }

  return (
    <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
      <article className="min-w-0 overflow-hidden rounded-[1.6rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_34%,var(--surface))] to-[var(--surface)] shadow-[0_22px_70px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <p className="label-caps text-[var(--primary)]">Account command room</p>
            <h2 className="title-serif mt-3 text-[1.45rem] font-medium leading-tight text-[var(--on-surface)]">
              {client.name} growth plan
            </h2>
            <p className="mt-3 max-w-3xl text-[0.96rem] leading-relaxed text-[var(--on-surface-dim)]">
              {client.accountPromise}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoTile label="Decision health" value={`${client.decisionHealth}%`} />
              <InfoTile label="Renewal motion" value={client.nextMilestone} />
              <InfoTile label="Owner" value={client.owner} />
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_22%,transparent)] p-4 backdrop-blur-md">
            <p className="text-[0.88rem] font-medium text-[var(--on-surface)]">Commercial abstraction</p>
            <p className="mt-3 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
              {client.commercialModel}
            </p>
            <p className="mt-4 text-[0.76rem] leading-relaxed text-[var(--primary)]">
              {client.marginGuardrail}
            </p>
          </div>
        </div>
        <div className="grid border-t border-[var(--glass-border)] md:grid-cols-3">
          <VisibilityTile label="Admin" value={client.roleVisibility.admin} />
          <VisibilityTile label="Client" value={client.roleVisibility.client} />
          <VisibilityTile label="Developer" value={client.roleVisibility.developer} />
        </div>
      </article>

      <article className="grid min-w-0 gap-4 rounded-[1.6rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,var(--surface))] to-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_7%,transparent)] sm:p-6">
        <div>
          <p className="label-caps text-[var(--primary)]">Portfolio economics</p>
          <p className="mt-3 font-mono text-[2rem] font-medium leading-none text-[var(--on-surface)]">
            {formatMoney(stats.protectedSpread)}
          </p>
          <p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
            Estimated Andishi retained spread across active client exposure after developer compensation guardrails.
          </p>
        </div>
        <div className="grid gap-3">
          <SignalBarDetailed label="Stakeholder coverage" value={stats.stakeholderCoverage} tone="var(--tertiary)" detail="Buying committee completeness" />
          <SignalBarDetailed label="Billing confidence" value={stats.billingConfidence} tone="var(--primary)" detail="Payment reliability signal" />
          <SignalBarDetailed label="Expansion readiness" value={stats.expansionReadiness} tone="var(--secondary)" detail="Commercial momentum" />
        </div>
      </article>
    </section>
  );
}

// ─── ClientCommandPanel ───────────────────────────────────────────────────────

function ClientCommandPanel({
  client,
  onAdvance,
  onArchive,
  onOpen,
  onRisk,
}: {
  client: ClientRecord | null;
  onAdvance?: () => void;
  onArchive?: () => void;
  onOpen?: () => void;
  onRisk?: () => void;
}) {
  if (!client) {
    return (
      <aside className="rounded-[1.35rem] border border-dashed border-[var(--glass-border)] p-8 text-center">
        <p className="text-[0.98rem] font-medium text-[var(--on-surface)]">Select a client</p>
        <p className="mt-2 text-[0.86rem] text-[var(--on-surface-dim)]">
          Pick an account to inspect stakeholders, billing posture, and next motion.
        </p>
      </aside>
    );
  }

  const next = statusMeta[client.status].next;

  return (
    <aside className="2xl:sticky 2xl:top-28 2xl:self-start">
      <div className="rounded-[1.35rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,var(--surface))] to-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <StatusBadge label={statusMeta[client.status].label} tone={statusMeta[client.status].tone} />
            <h2 className="title-serif mt-3 text-[1.15rem] font-medium leading-tight text-[var(--on-surface)]">
              {client.name}
            </h2>
            <p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
              {client.primaryContact} · {client.industry}
            </p>
          </div>
          <HealthRing value={client.health} size={68} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <InfoTile label="MRR" value={formatMoney(client.mrr)} />
          <InfoTile label="Briefs" value={String(client.briefs)} />
          <InfoTile label="Owner" value={client.owner} />
          <InfoTile label="Stage age" value={`${client.stageAge}d`} />
          <InfoTile label="Decision" value={`${client.decisionHealth}%`} />
          <InfoTile label="Milestone" value={client.nextMilestone} />
        </div>

        <div className="mt-5 rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-4">
          <p className="text-[0.86rem] font-medium text-[var(--on-surface)]">Stakeholder map</p>
          <div className="mt-4 grid gap-3">
            {client.stakeholders.map((s) => (
              <div className="flex items-center justify-between gap-3" key={s.name}>
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-[0.58rem] text-white"
                    style={{ background: influenceColors[s.influence] }}
                  >
                    {getInitials(s.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[0.82rem] text-[var(--on-surface)]">{s.name}</p>
                    <p className="truncate text-[0.7rem] text-[var(--on-surface-dim)]">{s.role}</p>
                  </div>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 font-mono text-[0.6rem] capitalize"
                  style={{
                    background: `color-mix(in srgb, ${influenceColors[s.influence]} 12%, transparent)`,
                    color: influenceColors[s.influence],
                  }}
                >
                  {s.influence}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-4">
          <p className="text-[0.86rem] font-medium text-[var(--on-surface)]">Next account move</p>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
            {client.nextAction}
          </p>
          {client.risk && (
            <p className="mt-2 text-[0.74rem] leading-relaxed text-[var(--error)]">{client.risk}</p>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <ActionButton icon={IconFileText} label="Open profile" onClick={onOpen} />
          <ActionButton icon={IconCheck} label={next ? "Advance" : "Cycle"} onClick={onAdvance} />
          <ActionButton danger={client.status !== "risk"} icon={IconAlertTriangle} label={client.status === "risk" ? "Recover" : "Risk"} onClick={onRisk} />
          <ActionButton danger icon={IconTrash} label="Archive" onClick={onArchive} />
        </div>
      </div>
    </aside>
  );
}

// ─── CreateClientModal ────────────────────────────────────────────────────────

function CreateClientModal({
  onClose,
  onSubmit,
  open,
}: {
  onClose: () => void;
  onSubmit: (payload: {
    budget: number;
    contactEmail: string;
    industry: string;
    name: string;
    owner: string;
    primaryContact: string;
    tier: ClientTier;
  }) => void;
  open: boolean;
}) {
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

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onSubmit({
      budget: Number(form.get("budget") || 0),
      contactEmail: String(form.get("contactEmail") || "contact@example.com"),
      industry: String(form.get("industry") || "SaaS"),
      name: String(form.get("name") || "New Client"),
      owner: String(form.get("owner") || "Dennis"),
      primaryContact: String(form.get("primaryContact") || "Primary Contact"),
      tier: (String(form.get("tier") || "Seed") as ClientTier) || "Seed",
    });
  };

  return (
    <div
      aria-labelledby="create-client-title"
      aria-modal="true"
      className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-8 backdrop-blur-xl"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
    >
      <form
        className="w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_40%,var(--surface))] to-[var(--surface)] p-6 shadow-[0_32px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-7"
        onSubmit={submit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-caps text-[var(--primary)]">Account intake</p>
            <h2 id="create-client-title" className="title-serif mt-2 text-[1.3rem] font-medium text-[var(--on-surface)]">
              Add client account
            </h2>
            <p className="mt-2 max-w-2xl text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
              Create an account with relationship context before briefs, placements, and billing history arrive.
            </p>
          </div>
          <button
            aria-label="Close"
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors duration-200 hover:bg-[var(--glass-bg)] hover:text-[var(--on-surface)]"
            onClick={onClose}
            type="button"
          >
            <IconX size={18} stroke={1.6} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 border-t border-[var(--glass-border)] pt-6 sm:grid-cols-2">
          <FormInput ref={firstInputRef} label="Client name" name="name" placeholder="Kijani Analytics" />
          <FormInput label="Primary contact" name="primaryContact" placeholder="Maya Kamau" />
          <FormInput label="Contact email" name="contactEmail" placeholder="maya@company.com" />
          <FormInput label="Industry" name="industry" placeholder="Climate fintech" />
          <FormInput label="Account owner" name="owner" placeholder="Dennis" />
          <FormInput label="Projected monthly value" name="budget" placeholder="12000" type="number" />
          <FormSelectField label="Tier" name="tier" defaultValue="Seed">
            {["Seed", "Series A", "Series B", "Growth", "Enterprise"].map((tier) => (
              <option key={tier} value={tier}>{tier}</option>
            ))}
          </FormSelectField>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-5 text-[0.86rem] font-medium text-[var(--bg)]"
            type="submit"
          >
            Create account
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function ClientPagination({
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  total,
  totalPages,
}: {
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const windowStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const visiblePages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => windowStart + i,
  ).filter((item) => item <= totalPages);

  return (
    <div className="grid gap-3 overflow-hidden rounded-[1.2rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_24%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] p-3 backdrop-blur-md sm:p-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between xl:justify-start">
        <p className="font-mono text-[0.8rem] text-[var(--on-surface-dim)]">
          Showing {start}–{end} of {total} clients
        </p>
        <label className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--surface)] px-3 py-1.5 text-[0.78rem] text-[var(--on-surface-dim)]">
          Page size
          <select
            className="cursor-pointer bg-transparent font-mono text-[var(--on-surface)] outline-none"
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            value={pageSize}
          >
            {clientPageSizeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
        {[
          { disabled: page <= 1, label: "First", onClick: () => onPageChange(1) },
          { disabled: page <= 1, label: "Prev", onClick: () => onPageChange(Math.max(page - 1, 1)) },
        ].map((btn) => (
          <button
            key={btn.label}
            className="min-h-9 cursor-pointer rounded-full border border-[var(--glass-border)] px-3 text-[0.82rem] font-medium text-[var(--on-surface)] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={btn.disabled}
            onClick={btn.onClick}
            type="button"
          >
            {btn.label}
          </button>
        ))}
        <div className="flex items-center gap-1">
          {visiblePages.map((item) => (
            <button
              className={cn(
                "grid h-9 w-9 cursor-pointer place-items-center rounded-full border font-mono text-[0.8rem] transition-colors duration-200",
                item === page
                  ? "border-[color-mix(in_srgb,var(--primary)_34%,transparent)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]"
                  : "border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]",
              )}
              key={item}
              onClick={() => onPageChange(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        {[
          { disabled: page >= totalPages, label: "Next", onClick: () => onPageChange(Math.min(page + 1, totalPages)) },
          { disabled: page >= totalPages, label: "Last", onClick: () => onPageChange(totalPages) },
        ].map((btn) => (
          <button
            key={btn.label}
            className="min-h-9 cursor-pointer rounded-full border border-[var(--glass-border)] px-3 text-[0.82rem] font-medium text-[var(--on-surface)] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={btn.disabled}
            onClick={btn.onClick}
            type="button"
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Small reusable components ────────────────────────────────────────────────

function SectionHeader({ description, eyebrow, title }: { description: string; eyebrow: string; title: string }) {
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

function ChartPanel({ children, description, title, value }: { children: ReactNode; description: string; title: string; value: string }) {
  return (
    <article className="min-w-0 overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_34%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-2xl">
      <div className="flex min-h-[4.75rem] items-start justify-between gap-4">
        <div>
          <h3 className="text-[0.96rem] font-medium text-[var(--on-surface)]">{title}</h3>
          <p className="mt-1 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">{description}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--glass-border)] px-3 py-1.5 font-mono text-[0.7rem] text-[var(--on-surface)]">
          {value}
        </span>
      </div>
      <div className="mt-4">{children}</div>
    </article>
  );
}

function SignalCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-[var(--glass-border)] px-3 py-2.5 last:border-r-0">
      <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">{label}</p>
      <p className="mt-1 truncate font-mono text-[0.82rem] font-medium text-[var(--on-surface)]">{value}</p>
    </div>
  );
}

function SignalBarDetailed({
  detail,
  label,
  tone,
  value,
}: {
  detail: string;
  label: string;
  tone: string;
  value: number;
}) {
  return (
    <div className="rounded-[1.1rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[0.78rem] text-[var(--on-surface-dim)]">{label}</span>
        <span className="font-mono text-[0.78rem] font-medium text-[var(--on-surface)]">{value}%</span>
      </div>
      <div className="mt-2.5 h-[0.28rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${tone} 40%, transparent), ${tone})`, width: `${value}%` }}
        />
      </div>
      <p className="mt-2 text-[0.7rem] text-[var(--on-surface-dim)] opacity-70">{detail}</p>
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

function VisibilityTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-[var(--glass-border)] p-4 md:border-l md:border-t-0 first:md:border-l-0">
      <p className="text-[0.66rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">{label}</p>
      <p className="mt-2 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">{value}</p>
    </div>
  );
}

function HealthRing({ size = 58, value }: { size?: number; value: number }) {
  const tone = value < 70 ? "var(--error)" : value > 85 ? "var(--tertiary)" : "var(--primary)";
  const background = `conic-gradient(${tone} ${value * 3.6}deg, color-mix(in srgb, var(--on-surface) 10%, transparent) 0deg)`;
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full shadow-[0_2px_8px_color-mix(in_srgb,var(--bg-deep)_12%,transparent)]"
      style={{ background, height: size, width: size }}
    >
      <span className="grid h-[calc(100%-8px)] w-[calc(100%-8px)] place-items-center rounded-full bg-[var(--surface)] font-mono text-[0.72rem] font-medium text-[var(--on-surface)]">
        {value}
      </span>
    </span>
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
        stroke={1.6}
      />
      <select
        className="h-10 w-full cursor-pointer appearance-none rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-9 pr-8 text-[0.82rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}

function ViewButton({
  active,
  children,
  label,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "grid h-8 w-8 cursor-pointer place-items-center rounded-full transition-all duration-200",
        active ? "bg-[var(--on-surface)] text-[var(--bg)]" : "text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]",
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
        "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border px-3 text-[0.82rem] font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40",
        danger
          ? "border-[color-mix(in_srgb,var(--error)_28%,var(--glass-border))] text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
          : "border-[var(--glass-border)] text-[var(--on-surface)] hover:bg-[var(--glass-bg)]",
      )}
      disabled={!onClick}
      onClick={onClick}
      type="button"
    >
      <Icon size={14} stroke={1.6} />
      {label}
    </button>
  );
}

function FooterButton({
  danger,
  icon: Icon,
  label,
  onClick,
}: {
  danger?: boolean;
  icon: Icon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[0.78rem] font-medium transition-all duration-200",
        danger
          ? "border-[color-mix(in_srgb,var(--error)_26%,var(--glass-border))] text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
          : "border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:bg-[var(--glass-bg)] hover:text-[var(--on-surface)]",
      )}
    >
      <Icon size={13} stroke={1.6} />
      {label}
    </button>
  );
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-[1.2rem] border border-dashed border-[var(--glass-border)] p-8 text-center lg:col-span-2">
      <p className="text-[0.98rem] font-medium text-[var(--on-surface)]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{body}</p>
    </div>
  );
}

const FormInput = forwardRef<
  HTMLInputElement,
  {
    defaultValue?: string;
    label: string;
    name: string;
    placeholder: string;
    type?: string;
  }
>(function FormInput({ defaultValue, label, name, placeholder, type = "text" }, ref) {
  return (
    <label>
      <span className="text-[0.74rem] font-medium text-[var(--on-surface)]">{label}</span>
      <input
        ref={ref}
        className="mt-2 h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)] transition-colors duration-200"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
});

function FormSelectField({
  children,
  defaultValue,
  label,
  name,
}: {
  children: ReactNode;
  defaultValue?: string;
  label: string;
  name: string;
}) {
  return (
    <label>
      <span className="text-[0.74rem] font-medium text-[var(--on-surface)]">{label}</span>
      <select
        className="mt-2 h-11 w-full cursor-pointer rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)] transition-colors duration-200"
        defaultValue={defaultValue}
        name={name}
      >
        {children}
      </select>
    </label>
  );
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function ClientToolbar({
  billingFilter,
  query,
  setBillingFilter,
  setQuery,
  setSortKey,
  setStatusFilter,
  setViewMode,
  sortKey,
  statusFilter,
  viewMode,
}: {
  billingFilter: ClientRecord["billingPosture"] | "all";
  query: string;
  setBillingFilter: (value: ClientRecord["billingPosture"] | "all") => void;
  setQuery: (value: string) => void;
  setSortKey: (value: SortKey) => void;
  setStatusFilter: (value: ClientStatus | "all") => void;
  setViewMode: (value: ViewMode) => void;
  sortKey: SortKey;
  statusFilter: ClientStatus | "all";
  viewMode: ViewMode;
}) {
  return (
    <div className="grid w-full gap-3 xl:w-auto xl:min-w-[42rem]">
      <label className="relative min-w-0">
        <span className="sr-only">Search clients</span>
        <IconSearch
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]"
          size={16}
          stroke={1.6}
        />
        <input
          className="h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-10 pr-4 text-[0.88rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)] transition-colors duration-200"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clients, stakeholders, industries, owners..."
          value={query}
        />
      </label>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <SelectPill
          icon={IconFilter}
          label="Status"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as ClientStatus | "all")}
        >
          <option value="all">All statuses</option>
          {statusOrder.map((status) => (
            <option key={status} value={status}>{statusMeta[status].label}</option>
          ))}
        </SelectPill>
        <SelectPill
          icon={IconReceipt}
          label="Billing"
          value={billingFilter}
          onChange={(value) => setBillingFilter(value as ClientRecord["billingPosture"] | "all")}
        >
          <option value="all">All billing</option>
          {Object.entries(billingMeta).map(([value, meta]) => (
            <option key={value} value={value}>{meta.label}</option>
          ))}
        </SelectPill>
        <SelectPill
          icon={IconChevronDown}
          label="Sort"
          value={sortKey}
          onChange={(value) => setSortKey(value as SortKey)}
        >
          <option value="health">Health</option>
          <option value="revenue">Revenue</option>
          <option value="briefs">Brief load</option>
          <option value="recent">Recent stage</option>
        </SelectPill>
        <div className="flex w-fit items-center rounded-full border border-[var(--glass-border)] p-1">
          <ViewButton active={viewMode === "grid"} label="Grid view" onClick={() => setViewMode("grid")}>
            <IconLayoutGrid size={15} stroke={1.6} />
          </ViewButton>
          <ViewButton active={viewMode === "list"} label="List view" onClick={() => setViewMode("list")}>
            <IconListDetails size={15} stroke={1.6} />
          </ViewButton>
        </div>
      </div>
    </div>
  );
}

// ─── Data utilities ───────────────────────────────────────────────────────────

function buildClientStats(clients: ClientRecord[]) {
  const avg = (values: number[]) =>
    values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

  const protectedSpread = clients.reduce((sum, client) => {
    const projectValue = client.mrr || client.briefs * 4800;
    return sum + Math.max(0, Math.round(projectValue * 0.42));
  }, 0);
  const stakeholderCoverage = avg(clients.map((client) => Math.min(100, client.stakeholders.length * 28 + (client.relationshipScore > 84 ? 12 : 0))));
  const billingConfidence = avg(clients.map((client) => client.billingPosture === "healthy" ? 92 : client.billingPosture === "watch" ? 68 : client.billingPosture === "overdue" ? 42 : 76));
  const expansionReadiness = avg(clients.map((client) => client.status === "expansion" ? 92 : client.status === "active" ? 82 : client.status === "risk" ? 38 : 64));

  return {
    active: clients.filter((client) => client.status === "active").length,
    avgHealth: avg(clients.map((client) => client.health)),
    billingConfidence,
    briefs: clients.reduce((sum, client) => sum + client.briefs, 0),
    expansion: clients.filter((client) => client.status === "expansion").length,
    expansionReadiness,
    mrr: clients.reduce((sum, client) => sum + client.mrr, 0),
    overdue: clients.filter((client) => client.billingPosture === "overdue" || client.billingPosture === "watch").length,
    placements: clients.reduce((sum, client) => sum + client.placementCount, 0),
    protectedSpread,
    risk: clients.filter((client) => client.status === "risk").length,
    stakeholderCoverage,
  };
}

function enrichClientRecord(client: ClientSeedRecord): ClientRecord {
  const projectValue = client.mrr || Math.max(client.briefs, 1) * 4800;
  const developerBudget = Math.round(projectValue * (client.status === "risk" ? 0.54 : 0.48));
  const spread = Math.max(0, projectValue - developerBudget);
  const decisionHealth = Math.min(
    98,
    Math.max(45, Math.round((client.relationshipScore + client.health + Math.min(100, client.stakeholders.length * 30)) / 3)),
  );

  return {
    ...client,
    accountPromise:
      client.status === "risk"
        ? `Protect trust with a recovery plan before adding new scope; ${client.risk.toLowerCase()} is the board-level constraint.`
        : client.status === "expansion"
          ? `Turn current delivery proof into the next commercial motion while keeping stakeholder, finance, and technical owners aligned.`
          : client.status === "onboarding"
            ? `Convert onboarding confidence into the first clean brief without exposing internal talent economics.`
            : client.status === "prospect"
              ? `Qualify urgency, budget owner, and success metric before Andishi commits matching capacity.`
              : `Maintain account confidence while moving the next brief through matching with role-safe project visibility.`,
    commercialModel: client.mrr ? `${formatMoney(projectValue)} monthly exposure` : `${formatMoney(projectValue)} projected first project`,
    decisionHealth,
    marginGuardrail: `Admin tracks roughly ${formatMoney(spread)} spread; client sees project/invoice value, developer sees only scoped compensation and payout state.`,
    nextMilestone:
      client.status === "risk"
        ? "Recovery call"
        : client.status === "expansion"
          ? "Expansion scope"
          : client.status === "onboarding"
            ? "Onboarding signoff"
            : client.status === "prospect"
              ? "Brief qualification"
              : "Intro decision",
    roleVisibility: {
      admin: "Full account, billing, spread, stakeholder, brief, and delivery context.",
      client: "Project value, invoices, milestones, profiles, approvals, and next steps.",
      developer: "Scoped project context, approved work, communication needs, and payout status only.",
    },
  };
}

function toClientSeed(
  client: ClientRecord,
  overrides: Partial<ClientSeedRecord> = {},
): ClientSeedRecord {
  return {
    activity: client.activity,
    billingPosture: client.billingPosture,
    briefs: client.briefs,
    contactEmail: client.contactEmail,
    health: client.health,
    id: client.id,
    industry: client.industry,
    lastTouched: client.lastTouched,
    mrr: client.mrr,
    name: client.name,
    nextAction: client.nextAction,
    notes: client.notes,
    openInvoices: client.openInvoices,
    owner: client.owner,
    placementCount: client.placementCount,
    primaryContact: client.primaryContact,
    relationshipScore: client.relationshipScore,
    risk: client.risk,
    stageAge: client.stageAge,
    status: client.status,
    stakeholders: client.stakeholders,
    tier: client.tier,
    ...overrides,
  };
}

function formatMoney(value: number) {
  if (!value) return "$0";
  if (value >= 1000) return `$${Math.round(value / 100) / 10}k`;
  return `$${value}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
