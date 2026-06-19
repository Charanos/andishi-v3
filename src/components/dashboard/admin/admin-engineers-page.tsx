"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  IconAdjustmentsHorizontal,
  IconArrowRight,
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconCode,
  IconDatabase,
  IconFilter,
  IconLayoutGrid,
  IconListDetails,
  IconMail,
  IconMapPin,
  IconNotes,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconTrash,
  IconUsersGroup,
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

type EngineerStatus =
  | "invited"
  | "vetting"
  | "verified"
  | "available"
  | "placed";
type EngineerDomain = "AI" | "Full-stack" | "Cloud" | "Mobile" | "Web3";
type ViewMode = "grid" | "list";
type SortKey = "readiness" | "availability" | "quality" | "rate";
type DetailTab = "overview" | "vetting" | "financials" | "activity";

type EngineerRecord = {
  activity: string[];
  adminCompensationNote: string;
  availabilityDate: string;
  availabilityScore: number;
  clientFitNarrative: string;
  country: string;
  developerPayoutTarget: number;
  domain: EngineerDomain;
  evidencePack: string[];
  fitSignals: {
    communication: number;
    delivery: number;
    depth: number;
    reliability: number;
  };
  hourlyRate: number;
  id: string;
  initials: string;
  lastTouched: string;
  location: string;
  name: string;
  networkRisk: string;
  notes: string;
  owner: string;
  placement: string;
  profileQuality: number;
  readiness: number;
  role: string;
  shortlistReadiness: string;
  skills: string[];
  status: EngineerStatus;
  timezone: string;
  vetting: Array<{ label: string; complete: boolean }>;
  years: number;
};

type EngineerSeedRecord = Omit<
  EngineerRecord,
  | "adminCompensationNote"
  | "clientFitNarrative"
  | "developerPayoutTarget"
  | "evidencePack"
  | "networkRisk"
  | "shortlistReadiness"
>;

// ─── Constants ───────────────────────────────────────────────────────────────

const statusOrder: EngineerStatus[] = [
  "invited",
  "vetting",
  "verified",
  "available",
  "placed",
];

const engineerPageSizeOptions = [6, 12, 24, 48];

const domainOrder: EngineerDomain[] = [
  "AI",
  "Full-stack",
  "Cloud",
  "Mobile",
  "Web3",
];

const statusMeta: Record<
  EngineerStatus,
  {
    label: string;
    next: EngineerStatus | null;
    tone: "active" | "available" | "neutral" | "overdue" | "pending";
  }
> = {
  available: { label: "Available", next: "placed", tone: "available" },
  invited: { label: "Invited", next: "vetting", tone: "neutral" },
  placed: { label: "Placed", next: null, tone: "active" },
  verified: { label: "Verified", next: "available", tone: "active" },
  vetting: { label: "Vetting", next: "verified", tone: "pending" },
};

// ─── Seed data ───────────────────────────────────────────────────────────────

const rawEngineerSeed: EngineerSeedRecord[] = [
  {
    activity: [
      "Profile refreshed after AI evaluation review",
      "Matched to Kijani support workflow",
      "Reference check passed",
    ],
    availabilityDate: "Now",
    availabilityScore: 96,
    country: "Kenya",
    domain: "AI",
    fitSignals: { communication: 93, delivery: 95, depth: 98, reliability: 92 },
    hourlyRate: 72,
    id: "eng-amina",
    initials: "AO",
    lastTouched: "12m ago",
    location: "Nairobi, Kenya",
    name: "Amina Otieno",
    notes:
      "Best for production RAG, evaluation loops, and founder-facing delivery.",
    owner: "Dennis",
    placement: "Kijani Analytics",
    profileQuality: 98,
    readiness: 94,
    role: "Senior AI Product Engineer",
    skills: ["Python", "RAG", "OpenAI", "Postgres", "Next.js"],
    status: "available",
    timezone: "UTC+3",
    vetting: [
      { label: "Identity", complete: true },
      { label: "Technical screen", complete: true },
      { label: "Reference", complete: true },
      { label: "Portfolio proof", complete: true },
    ],
    years: 8,
  },
  {
    activity: [
      "Payments reconciliation sample reviewed",
      "Client intro availability confirmed",
      "Portfolio proof updated",
    ],
    availabilityDate: "Jun 10",
    availabilityScore: 82,
    country: "Ghana",
    domain: "Full-stack",
    fitSignals: { communication: 86, delivery: 91, depth: 89, reliability: 88 },
    hourlyRate: 68,
    id: "eng-kwame",
    initials: "KM",
    lastTouched: "1h ago",
    location: "Accra, Ghana",
    name: "Kwame Mensah",
    notes:
      "Strong for B2B SaaS rebuilds, payments, and high-confidence migrations.",
    owner: "Talent ops",
    placement: "SokoPay shortlist",
    profileQuality: 92,
    readiness: 88,
    role: "Senior Full-stack Engineer",
    skills: ["React", "Node.js", "Postgres", "Payments", "AWS"],
    status: "verified",
    timezone: "UTC+0",
    vetting: [
      { label: "Identity", complete: true },
      { label: "Technical screen", complete: true },
      { label: "Reference", complete: true },
      { label: "Portfolio proof", complete: false },
    ],
    years: 9,
  },
  {
    activity: [
      "Terraform review scheduled",
      "AWS architecture case study uploaded",
      "Awaiting final reference",
    ],
    availabilityDate: "Jun 17",
    availabilityScore: 74,
    country: "South Africa",
    domain: "Cloud",
    fitSignals: { communication: 80, delivery: 84, depth: 91, reliability: 86 },
    hourlyRate: 76,
    id: "eng-zola",
    initials: "ZN",
    lastTouched: "3h ago",
    location: "Cape Town, South Africa",
    name: "Zola Ndlovu",
    notes: "Platform engineer with AWS reliability, Kubernetes, and IaC depth.",
    owner: "Dennis",
    placement: "Nova Health review",
    profileQuality: 84,
    readiness: 79,
    role: "Cloud Platform Engineer",
    skills: ["AWS", "Terraform", "Kubernetes", "Go", "SRE"],
    status: "vetting",
    timezone: "UTC+2",
    vetting: [
      { label: "Identity", complete: true },
      { label: "Technical screen", complete: true },
      { label: "Reference", complete: false },
      { label: "Portfolio proof", complete: true },
    ],
    years: 7,
  },
  {
    activity: [
      "React Native project proof accepted",
      "Client intro deck prepared",
      "Availability moved to immediate",
    ],
    availabilityDate: "Now",
    availabilityScore: 91,
    country: "Kenya",
    domain: "Mobile",
    fitSignals: { communication: 89, delivery: 88, depth: 86, reliability: 90 },
    hourlyRate: 58,
    id: "eng-sarah",
    initials: "SK",
    lastTouched: "Today",
    location: "Nairobi, Kenya",
    name: "Sarah Kimani",
    notes: "React Native lead for commerce and field-work mobile products.",
    owner: "Maya",
    placement: "TradeHub shortlist",
    profileQuality: 90,
    readiness: 91,
    role: "Senior Mobile Engineer",
    skills: ["React Native", "Expo", "GraphQL", "TypeScript"],
    status: "available",
    timezone: "UTC+3",
    vetting: [
      { label: "Identity", complete: true },
      { label: "Technical screen", complete: true },
      { label: "Reference", complete: true },
      { label: "Portfolio proof", complete: true },
    ],
    years: 6,
  },
  {
    activity: [
      "Web3 audit exercise submitted",
      "Solidity references pending",
      "Invite converted to vetting",
    ],
    availabilityDate: "Jul 1",
    availabilityScore: 63,
    country: "Nigeria",
    domain: "Web3",
    fitSignals: { communication: 77, delivery: 74, depth: 90, reliability: 72 },
    hourlyRate: 82,
    id: "eng-binta",
    initials: "BK",
    lastTouched: "Yesterday",
    location: "Lagos, Nigeria",
    name: "Binta Kouyate",
    notes:
      "Smart contract and protocol engineer; keep for regulated Web3 work.",
    owner: "Talent ops",
    placement: "ChainLedger bench",
    profileQuality: 76,
    readiness: 72,
    role: "Smart Contract Engineer",
    skills: ["Solidity", "Hardhat", "Node.js", "Audits"],
    status: "vetting",
    timezone: "UTC+1",
    vetting: [
      { label: "Identity", complete: true },
      { label: "Technical screen", complete: false },
      { label: "Reference", complete: false },
      { label: "Portfolio proof", complete: true },
    ],
    years: 5,
  },
  {
    activity: [
      "Placement extended through August",
      "Weekly delivery health above target",
      "Profile hidden from public matching",
    ],
    availabilityDate: "Aug 12",
    availabilityScore: 44,
    country: "Egypt",
    domain: "Cloud",
    fitSignals: { communication: 86, delivery: 92, depth: 88, reliability: 94 },
    hourlyRate: 74,
    id: "eng-fatima",
    initials: "FA",
    lastTouched: "2d ago",
    location: "Cairo, Egypt",
    name: "Fatima Al-Zahrawi",
    notes:
      "Placed DevOps specialist. Good renewal candidate when Cloudify expands.",
    owner: "Ops",
    placement: "Cloudify active",
    profileQuality: 88,
    readiness: 67,
    role: "DevOps Engineer",
    skills: ["AWS", "Kubernetes", "Terraform", "CI/CD"],
    status: "placed",
    timezone: "UTC+2",
    vetting: [
      { label: "Identity", complete: true },
      { label: "Technical screen", complete: true },
      { label: "Reference", complete: true },
      { label: "Portfolio proof", complete: true },
    ],
    years: 8,
  },
];

const engineerSeed = rawEngineerSeed.map(enrichEngineerRecord);

// ─── Main page ────────────────────────────────────────────────────────────────

export function AdminEngineersPage() {
  const [engineers, setEngineers] = useState(engineerSeed);
  const [selectedId, setSelectedId] = useState(engineerSeed[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EngineerStatus | "all">(
    "all",
  );
  const [domainFilter, setDomainFilter] = useState<EngineerDomain | "all">(
    "all",
  );
  const [sortKey, setSortKey] = useState<SortKey>("readiness");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [detailEngineer, setDetailEngineer] = useState<EngineerRecord | null>(
    null,
  );
  const [confirmEngineer, setConfirmEngineer] = useState<EngineerRecord | null>(
    null,
  );
  const [inviteOpen, setInviteOpen] = useState(false);
  const [syncedAt, setSyncedAt] = useState("4 min ago");

  const selected =
    engineers.find((e) => e.id === selectedId) ?? engineers[0] ?? null;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return engineers
      .filter((engineer) => {
        const haystack = [
          engineer.name,
          engineer.role,
          engineer.location,
          engineer.domain,
          engineer.owner,
          engineer.skills.join(" "),
          engineer.placement,
          engineer.clientFitNarrative,
          engineer.shortlistReadiness,
          engineer.evidencePack.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return (
          (!needle || haystack.includes(needle)) &&
          (statusFilter === "all" || engineer.status === statusFilter) &&
          (domainFilter === "all" || engineer.domain === domainFilter)
        );
      })
      .sort((a, b) => {
        if (sortKey === "availability")
          return b.availabilityScore - a.availabilityScore;
        if (sortKey === "quality") return b.profileQuality - a.profileQuality;
        if (sortKey === "rate") return a.hourlyRate - b.hourlyRate;
        return b.readiness - a.readiness;
      });
  }, [domainFilter, engineers, query, sortKey, statusFilter]);

  const stats = useMemo(() => buildEngineerStats(engineers), [engineers]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const activePage = Math.min(page, totalPages);
  const paginatedEngineers = filtered.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize,
  );

  const columns = useMemo<Array<OperationalTableColumn<EngineerRecord>>>(
    () => [
      {
        key: "name",
        label: "Engineer",
        priority: true,
        render: (e) => (
          <div className="min-w-0">
            <p className="truncate text-[0.88rem] font-medium text-[var(--on-surface)]">
              {e.name}
            </p>
            <p className="mt-1 truncate text-[0.74rem] text-[var(--on-surface-dim)]">
              {e.role}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (e) => (
          <StatusBadge
            label={statusMeta[e.status].label}
            tone={statusMeta[e.status].tone}
          />
        ),
      },
      { key: "domain", label: "Domain" },
      {
        key: "readiness",
        label: "Ready",
        mono: true,
        render: (e) => `${e.readiness}%`,
      },
      {
        key: "profileQuality",
        label: "Profile",
        mono: true,
        hideOnMobile: true,
        render: (e) => `${e.profileQuality}%`,
      },
      { key: "availabilityDate", label: "Available", hideOnMobile: true },
      { key: "owner", label: "Owner", hideOnMobile: true },
    ],
    [],
  );

  const refreshSupply = () => {
    setSyncedAt("just now");
    setEngineers((cur) =>
      cur.map((e) =>
        e.status === "verified"
          ? { ...e, availabilityScore: Math.min(e.availabilityScore + 2, 100) }
          : e,
      ),
    );
  };

  const commitEngineer = (updated: EngineerRecord) => {
    setEngineers((cur) => cur.map((e) => (e.id === updated.id ? updated : e)));
    setSelectedId(updated.id);
    setDetailEngineer((cur) => (cur?.id === updated.id ? updated : cur));
  };

  const advanceEngineer = (engineer: EngineerRecord) => {
    const next = statusMeta[engineer.status].next;
    if (!next) return;
    const updated = enrichEngineerRecord(
      toEngineerSeed(engineer, {
        activity: [`Moved to ${statusMeta[next].label}`, ...engineer.activity],
        status: next,
        readiness:
          next === "available"
            ? Math.max(engineer.readiness, 90)
            : engineer.readiness,
      }),
    );
    commitEngineer(updated);
  };

  const inviteEngineer = (payload: {
    domain: EngineerDomain;
    hourlyRate: number;
    location: string;
    name: string;
    role: string;
    skills: string[];
  }) => {
    const created = enrichEngineerRecord({
      activity: [
        "Invite created",
        "Profile shell opened",
        "Awaiting engineer response",
      ],
      availabilityDate: "TBD",
      availabilityScore: 45,
      country: payload.location.split(",").pop()?.trim() || "Remote",
      domain: payload.domain,
      fitSignals: {
        communication: 60,
        delivery: 55,
        depth: 64,
        reliability: 58,
      },
      hourlyRate: payload.hourlyRate,
      id: `eng-${Date.now()}`,
      initials: getInitials(payload.name),
      lastTouched: "Now",
      location: payload.location,
      name: payload.name,
      notes:
        "Invite opened for senior-talent intake. Confirm evidence, payout expectation, availability, and profile proof before client presentation.",
      owner: "Talent ops",
      placement: "Bench intake",
      profileQuality: 38,
      readiness: 42,
      role: payload.role,
      skills: payload.skills,
      status: "invited",
      timezone: "TBD",
      vetting: [
        { label: "Identity", complete: false },
        { label: "Technical screen", complete: false },
        { label: "Reference", complete: false },
        { label: "Portfolio proof", complete: false },
      ],
      years: 0,
    });
    setEngineers((cur) => [created, ...cur]);
    setSelectedId(created.id);
    setDetailEngineer(created);
    setInviteOpen(false);
  };

  const saveEngineerEdit = (
    engineer: EngineerRecord,
    payload: Parameters<typeof EditEngineerForm>[0]["onSave"] extends (
      p: infer P,
    ) => void
      ? P
      : never,
  ) => {
    const updated = enrichEngineerRecord(
      toEngineerSeed(engineer, {
        activity: ["Profile details updated", ...engineer.activity],
        availabilityDate: payload.availabilityDate,
        availabilityScore: payload.availabilityScore,
        country: payload.location.split(",").pop()?.trim() || engineer.country,
        domain: payload.domain,
        hourlyRate: payload.hourlyRate,
        initials: getInitials(payload.name),
        lastTouched: "Now",
        location: payload.location,
        name: payload.name,
        notes: payload.notes,
        owner: payload.owner,
        placement: payload.placement,
        profileQuality: payload.profileQuality,
        readiness: payload.readiness,
        role: payload.role,
        skills: payload.skills,
        status: payload.status,
        timezone: payload.timezone,
        years: payload.years,
      }),
    );
    commitEngineer(updated);
  };

  const saveVetting = (
    engineer: EngineerRecord,
    vetting: EngineerRecord["vetting"],
  ) => {
    const complete = vetting.filter((item) => item.complete).length;
    const evidenceScore = Math.round(
      (complete / Math.max(vetting.length, 1)) * 100,
    );
    const updated = enrichEngineerRecord(
      toEngineerSeed(engineer, {
        activity: ["Vetting checklist updated", ...engineer.activity],
        lastTouched: "Now",
        profileQuality: Math.max(engineer.profileQuality, evidenceScore),
        readiness:
          complete === vetting.length
            ? Math.max(engineer.readiness, 86)
            : engineer.readiness,
        vetting,
      }),
    );
    commitEngineer(updated);
  };

  const updateNotes = (engineerId: string, notes: string) => {
    setEngineers((cur) =>
      cur.map((e) =>
        e.id === engineerId
          ? { ...e, activity: ["Admin note updated", ...e.activity], notes }
          : e,
      ),
    );
    setDetailEngineer((cur) =>
      cur?.id === engineerId ? { ...cur, notes } : cur,
    );
  };

  const archiveEngineer = () => {
    if (!confirmEngineer) return;
    const next = engineers.filter((e) => e.id !== confirmEngineer.id);
    setEngineers(next);
    if (selectedId === confirmEngineer.id) setSelectedId(next[0]?.id ?? "");
    setDetailEngineer(null);
    setConfirmEngineer(null);
  };

  return (
    <div className="grid min-w-0 gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <DashboardPageHeader
        className="mb-0"
        title="Engineer network"
        description="Operate senior talent supply with vetting evidence, availability confidence, compensation abstraction, domain coverage, and shortlist readiness without leaking client commercial context."
        status={
          <StatusBadge
            label={`${stats.available} available`}
            tone="available"
          />
        }
        actions={
          <>
            <button
              type="button"
              onClick={refreshSupply}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] transition-colors duration-300 hover:bg-[var(--glass-bg)]"
            >
              <IconRefresh size={16} stroke={1.6} />
              Refresh supply
            </button>
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)] shadow-[0_14px_30px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <IconPlus size={16} stroke={1.8} />
              Invite engineer
            </button>
          </>
        }
      />

      <AdminNetworkNav active="engineers" />

      <SectionDivider />

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          chart="bar"
          data={[108, 121, 132, 141, stats.total]}
          icon={IconUsersGroup}
          label="Network supply"
          trend={`${stats.vetting} in vetting`}
          value={String(stats.total)}
        />
        <KpiCard
          data={[68, 72, 79, 84, stats.avgReadiness]}
          icon={IconShieldCheck}
          label="Match readiness"
          trend={`${stats.avgQuality}% profile quality`}
          value={`${stats.avgReadiness}%`}
        />
        <KpiCard
          chart="bar"
          data={[8, 10, 9, 13, stats.available]}
          icon={IconCalendarEvent}
          label="Available now"
          trend={`${stats.placed} currently placed`}
          value={String(stats.available)}
        />
        <KpiCard
          data={[44, 48, 52, 57, stats.avgRate]}
          icon={IconDatabase}
          label="Blended rate"
          trend="Median hourly supply signal"
          value={`$${stats.avgRate}/h`}
        />
      </section>

      <SectionDivider />

      <section className="grid min-w-0 gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="Talent directory"
            title="Supply queue"
            description={`Search, sort, inspect, and move engineers through the network. Updated ${syncedAt}.`}
          />
          <EngineerToolbar
            domainFilter={domainFilter}
            query={query}
            setDomainFilter={(value) => {
              setDomainFilter(value);
              setPage(1);
            }}
            setQuery={(value) => {
              setQuery(value);
              setPage(1);
            }}
            setSortKey={(value) => {
              setSortKey(value);
              setPage(1);
            }}
            setStatusFilter={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            setViewMode={(value) => {
              setViewMode(value);
              setPage(1);
            }}
            sortKey={sortKey}
            statusFilter={statusFilter}
            viewMode={viewMode}
          />
        </div>

        <div
          className={cn(
            "grid gap-4",
            viewMode === "grid" ? "lg:grid-cols-2" : "grid-cols-1",
          )}
        >
          {paginatedEngineers.map((engineer) => (
            <EngineerCard
              engineer={engineer}
              key={engineer.id}
              selected={selected?.id === engineer.id}
              viewMode={viewMode}
              onOpen={() => {
                setSelectedId(engineer.id);
                setDetailEngineer(engineer);
              }}
              onSelect={() => setSelectedId(engineer.id)}
            />
          ))}
          {!filtered.length && (
            <EmptyState
              title="No engineers match this view"
              body="Clear the search, switch filters, or invite a new engineer into the network."
            />
          )}
        </div>

        {filtered.length > 0 && (
          <EngineerPagination
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
            page={activePage}
            pageSize={pageSize}
            total={filtered.length}
            totalPages={totalPages}
          />
        )}
      </section>

      <SectionDivider />

      <EngineerTalentRoom
        engineers={engineers}
        selected={selected}
        stats={stats}
      />

      <SectionDivider />

      <section className="grid min-w-0 gap-7 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <EngineerSupplyMap engineers={engineers} />
        <EngineerCommandPanel
          engineer={selected}
          onAdvance={selected ? () => advanceEngineer(selected) : undefined}
          onArchive={selected ? () => setConfirmEngineer(selected) : undefined}
          onOpen={selected ? () => setDetailEngineer(selected) : undefined}
          onInvite={() => setInviteOpen(true)}
        />
      </section>

      <SectionDivider />

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <ChartPanel
          title="Readiness movement"
          description="Composite network readiness across the last operating cycle."
          value={`${stats.avgReadiness}% avg`}
        >
          <DashboardLineChart
            data={[63, 68, 72, 77, 81, 84, stats.avgReadiness]}
            height={300}
            labels={[
              "Apr 22",
              "Apr 29",
              "May 6",
              "May 13",
              "May 20",
              "May 27",
              "Now",
            ]}
            variant="area"
          />
        </ChartPanel>
        <ChartPanel
          title="Vetting mix"
          description="How supply is distributed across onboarding and placement states."
          value={`${stats.total} records`}
        >
          <DashboardDonutChart
            data={statusOrder.map((status) => ({
              label: statusMeta[status].label,
              tone:
                status === "available" || status === "placed"
                  ? ("success" as const)
                  : status === "vetting"
                    ? ("primary" as const)
                    : status === "verified"
                      ? ("secondary" as const)
                      : ("muted" as const),
              value: engineers.filter((e) => e.status === status).length,
            }))}
            height={210}
            legend="stack"
          />
        </ChartPanel>
      </section>

      <OperationalDataTable
        columns={columns}
        description="Cross-check supply status, domain, readiness, profile quality, availability, and ownership before opening shortlists or placements."
        empty="No engineers match the active Network filters."
        onRowSelect={(engineer) => {
          setSelectedId(engineer.id);
          setDetailEngineer(engineer);
        }}
        rows={paginatedEngineers}
        title="Current page matrix"
        toolbar={
          <span className="rounded-full border border-[var(--glass-border)] px-3 py-1.5 font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
            Page {activePage}/{totalPages}
          </span>
        }
      />

      {/* ── Detail Modal ────────────────────────────────────────────────────── */}
      {detailEngineer && (
        <EngineerDetailModal
          key={detailEngineer.id}
          engineer={detailEngineer}
          onAdvance={() => advanceEngineer(detailEngineer)}
          onArchive={() => {
            setDetailEngineer(null);
            setConfirmEngineer(detailEngineer);
          }}
          onClose={() => setDetailEngineer(null)}
          onSaveEdit={(payload) => saveEngineerEdit(detailEngineer, payload)}
          onSaveNotes={(notes) => updateNotes(detailEngineer.id, notes)}
          onSaveVetting={(vetting) => saveVetting(detailEngineer, vetting)}
        />
      )}

      {/* ── Create Invite Modal ─────────────────────────────────────────────── */}
      <InviteEngineerModal
        onClose={() => setInviteOpen(false)}
        onSubmit={inviteEngineer}
        open={inviteOpen}
      />

      {/* ── Confirm Archive ──────────────────────────────────────────────────── */}
      <ConfirmDialog
        confirmLabel="Archive engineer"
        description={`This removes ${confirmEngineer?.name ?? "the engineer"} from the active network queue while preserving the future audit trail pattern.`}
        onCancel={() => setConfirmEngineer(null)}
        onConfirm={archiveEngineer}
        open={Boolean(confirmEngineer)}
        title="Archive this engineer?"
      />
    </div>
  );
}

// ─── EngineerCard ─────────────────────────────────────────────────────────────

function EngineerCard({
  engineer,
  onOpen,
  onSelect,
  selected,
  viewMode,
}: {
  engineer: EngineerRecord;
  onOpen: () => void;
  onSelect: () => void;
  selected: boolean;
  viewMode: ViewMode;
}) {
  return (
    <article
      className={cn(
        "group min-w-0 overflow-hidden rounded-[1.4rem] border transition-all duration-300",
        selected
          ? "border-[color-mix(in_srgb,var(--primary)_40%,var(--glass-border))] bg-gradient-to-br from-[color-mix(in_srgb,var(--primary)_8%,var(--surface))] to-[var(--surface)] shadow-[0_20px_56px_color-mix(in_srgb,var(--bg-deep)_12%,transparent)]"
          : "border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,var(--surface))] to-[var(--surface)] hover:border-[color-mix(in_srgb,var(--primary)_28%,var(--glass-border))] hover:shadow-[0_16px_44px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)]",
        viewMode === "list" && "lg:grid lg:grid-cols-[minmax(0,1fr)_24rem]",
      )}
    >
      <button
        className="block w-full min-w-0 cursor-pointer p-5 text-left sm:p-6"
        onClick={() => {
          onSelect();
          onOpen();
        }}
        type="button"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--primary)_22%,transparent)] bg-[color-mix(in_srgb,var(--primary)_9%,transparent)] text-[1.1rem] font-medium text-[var(--primary)] transition-colors duration-300">
              {engineer.initials}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="break-words text-[1rem] font-medium leading-snug text-[var(--on-surface)]">
                  {engineer.name}
                </h3>
                <StatusBadge
                  label={statusMeta[engineer.status].label}
                  tone={statusMeta[engineer.status].tone}
                />
              </div>
              <p className="mt-1 text-[0.82rem] text-[var(--on-surface-dim)]">
                {engineer.role}
              </p>
            </div>
          </div>
          <ReadinessRing value={engineer.readiness} size={52} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.8rem] text-[var(--on-surface-dim)]">
          <span className="inline-flex items-center gap-1.5">
            <IconMapPin size={13} stroke={1.6} />
            {engineer.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconClock size={13} stroke={1.6} />
            {engineer.timezone}
          </span>
          <span className="font-mono text-[var(--on-surface)]">
            ${engineer.hourlyRate}/h
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_24%,transparent)]">
          <SignalCell label="Avail" value={`${engineer.availabilityScore}%`} />
          <SignalCell label="Profile" value={`${engineer.profileQuality}%`} />
          <SignalCell
            label="Payout"
            value={`$${engineer.developerPayoutTarget}/h`}
          />
        </div>

        <div className="mt-4 space-y-2.5">
          <div>
            <div className="mb-1 flex items-center justify-between gap-2 text-[0.72rem] text-[var(--on-surface-dim)]">
              <span>Delivery Signal</span>
              <span className="font-mono text-[var(--on-surface)]">
                {engineer.fitSignals.delivery}%
              </span>
            </div>
            <div className="h-[0.22rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  background: `linear-gradient(90deg, color-mix(in srgb, var(--tertiary) 50%, transparent), var(--tertiary))`,
                  width: `${engineer.fitSignals.delivery}%`,
                }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between gap-2 text-[0.72rem] text-[var(--on-surface-dim)]">
              <span>Depth Signal</span>
              <span className="font-mono text-[var(--primary)]">
                {engineer.fitSignals.depth}%
              </span>
            </div>
            <div className="h-[0.22rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  background: `linear-gradient(90deg, color-mix(in srgb, var(--primary) 40%, transparent), var(--primary))`,
                  width: `${engineer.fitSignals.depth}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {engineer.skills.slice(0, 5).map((skill) => (
            <span
              className="rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] px-2.5 py-1 text-[0.72rem] text-[var(--on-surface-dim)]"
              key={skill}
            >
              {skill}
            </span>
          ))}
        </div>

        <p className="mt-4 line-clamp-2 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">
          <span className="mr-1.5 text-[var(--primary)] opacity-70">→</span>
          {engineer.shortlistReadiness}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[0.78rem] text-[var(--on-surface-dim)]">
            {engineer.placement}
          </p>
          <span className="inline-flex items-center gap-1 text-[0.75rem] font-medium text-[var(--primary)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            View details
            <IconArrowRight size={13} stroke={1.8} />
          </span>
        </div>
      </button>
    </article>
  );
}

// ─── EngineerDetailModal ──────────────────────────────────────────────────────

function EngineerDetailModal({
  engineer,
  onAdvance,
  onArchive,
  onClose,
  onSaveEdit,
  onSaveNotes,
  onSaveVetting,
}: {
  engineer: EngineerRecord;
  onAdvance: () => void;
  onArchive: () => void;
  onClose: () => void;
  onSaveEdit: (payload: {
    availabilityDate: string;
    availabilityScore: number;
    domain: EngineerDomain;
    hourlyRate: number;
    location: string;
    name: string;
    notes: string;
    owner: string;
    placement: string;
    profileQuality: number;
    readiness: number;
    role: string;
    skills: string[];
    status: EngineerStatus;
    timezone: string;
    years: number;
  }) => void;
  onSaveNotes: (notes: string) => void;
  onSaveVetting: (vetting: EngineerRecord["vetting"]) => void;
}) {
  const [tab, setTab] = useState<DetailTab>("overview");
  const [editMode, setEditMode] = useState(false);
  const [vettingMode, setVettingMode] = useState(false);
  const [prevNotes, setPrevNotes] = useState(engineer.notes);
  const [noteDraft, setNoteDraft] = useState(engineer.notes);
  const scrollRef = useRef<HTMLDivElement>(null);
  const next = statusMeta[engineer.status].next;

  if (engineer.notes !== prevNotes) {
    setPrevNotes(engineer.notes);
    setNoteDraft(engineer.notes);
  }

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="engineer-detail-title"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--bg-deep)_76%,transparent)] backdrop-blur-xl"
        onClick={onClose}
      />

      <div className="relative flex h-full max-h-[92dvh] w-full max-w-[74rem] flex-col overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_40%,var(--surface))] to-[var(--surface)] shadow-[0_32px_120px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)]">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex shrink-0 flex-col gap-4 border-b border-[var(--glass-border)] px-6 pb-0 pt-6 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--primary)_24%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[1.4rem] font-medium text-[var(--primary)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_12%,transparent)]">
                {engineer.initials}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2
                    id="engineer-detail-title"
                    className="text-[1.3rem] font-medium leading-tight text-[var(--on-surface)]"
                  >
                    {engineer.name}
                  </h2>
                  <StatusBadge
                    label={statusMeta[engineer.status].label}
                    tone={statusMeta[engineer.status].tone}
                  />
                  <span className="rounded-full border border-[var(--glass-border)] px-2.5 py-0.5 text-[0.74rem] text-[var(--on-surface-dim)]">
                    {engineer.domain}
                  </span>
                </div>
                <p className="mt-1 text-[0.84rem] text-[var(--on-surface-dim)]">
                  {engineer.role} · {engineer.location} · {engineer.years} YOE
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <ReadinessRing value={engineer.readiness} size={56} />
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
            {(
              ["overview", "vetting", "financials", "activity"] as DetailTab[]
            ).map((t) => (
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
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          {tab === "overview" && (
            <EngineerOverviewTab
              editMode={editMode}
              engineer={engineer}
              noteDraft={noteDraft}
              onCancelEdit={() => setEditMode(false)}
              onNoteDraftChange={setNoteDraft}
              onSaveEdit={(payload) => {
                onSaveEdit(payload);
                setEditMode(false);
              }}
              onSaveNotes={() => onSaveNotes(noteDraft)}
              onToggleEdit={() => setEditMode((v) => !v)}
            />
          )}
          {tab === "vetting" && (
            <EngineerVettingTab
              editMode={vettingMode}
              engineer={engineer}
              onCancelEdit={() => setVettingMode(false)}
              onSave={(items) => {
                onSaveVetting(items);
                setVettingMode(false);
              }}
              onToggleEdit={() => setVettingMode((v) => !v)}
            />
          )}
          {tab === "financials" && (
            <EngineerFinancialsTab engineer={engineer} />
          )}
          {tab === "activity" && <EngineerActivityTab engineer={engineer} />}
        </div>

        {/* ── Footer actions ──────────────────────────────────────────────────── */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_30%,transparent)] px-6 py-4 sm:px-7">
          <div className="flex flex-wrap items-center gap-2">
            <FooterButton
              icon={IconPencil}
              label="Edit profile"
              onClick={() => {
                setTab("overview");
                setEditMode(true);
              }}
            />
            <FooterButton
              icon={IconShieldCheck}
              label="Update vetting"
              onClick={() => {
                setTab("vetting");
                setVettingMode(true);
              }}
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
    </div>
  );
}

// ─── Detail Tabs ──────────────────────────────────────────────────────────────

function EngineerOverviewTab({
  editMode,
  engineer,
  noteDraft,
  onCancelEdit,
  onNoteDraftChange,
  onSaveEdit,
  onSaveNotes,
  onToggleEdit,
}: {
  editMode: boolean;
  engineer: EngineerRecord;
  noteDraft: string;
  onCancelEdit: () => void;
  onNoteDraftChange: (v: string) => void;
  onSaveEdit: (
    payload: Parameters<typeof EditEngineerForm>[0]["onSave"] extends (
      p: infer P,
    ) => void
      ? P
      : never,
  ) => void;
  onSaveNotes: () => void;
  onToggleEdit: () => void;
}) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (editMode) firstInputRef.current?.focus();
  }, [editMode]);

  if (editMode) {
    return (
      <EditEngineerForm
        engineer={engineer}
        firstInputRef={firstInputRef}
        onCancel={onCancelEdit}
        onSave={onSaveEdit}
      />
    );
  }

  return (
    <div className="grid gap-6 p-6 sm:p-7">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] p-5 backdrop-blur-xl">
          <p className="label-caps text-[var(--primary)]">
            Client fit narrative
          </p>
          <p className="mt-3 text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
            {engineer.clientFitNarrative}
          </p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
            <InfoTile
              label="Profile Quality"
              value={`${engineer.profileQuality}%`}
            />
            <InfoTile label="Availability" value={engineer.availabilityDate} />
            <InfoTile label="Owner" value={engineer.owner} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {engineer.skills.map((skill) => (
              <span
                className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 text-[0.78rem] text-[var(--on-surface-dim)]"
                key={skill}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-4">
            <p className="text-[0.82rem] font-medium text-[var(--on-surface)]">
              Shortlist readiness
            </p>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
              {engineer.shortlistReadiness}
            </p>
          </div>
          <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-4">
            <p className="text-[0.82rem] font-medium text-[var(--on-surface)]">
              Placement
            </p>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
              {engineer.placement}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {Object.entries(engineer.fitSignals).map(([label, value]) => (
          <SignalBarDetailed
            key={label}
            label={titleCase(label)}
            value={value}
            tone={
              label === "depth" || label === "delivery"
                ? "var(--primary)"
                : "var(--tertiary)"
            }
            detail={`${value >= 90 ? "Excellent" : value >= 75 ? "Strong" : "Developing"} signal`}
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.82rem] font-medium text-[var(--on-surface)]">
              Admin notes
            </p>
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
            placeholder="Private network notes..."
            value={noteDraft}
          />
        </div>

        <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-5">
          <p className="text-[0.82rem] font-medium text-[var(--on-surface)]">
            Evidence pack
          </p>
          <div className="mt-4 grid gap-3">
            {engineer.evidencePack.map((item) => (
              <div
                className="rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] p-3"
                key={item}
              >
                <p className="text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onToggleEdit}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] px-4 py-2 text-[0.82rem] font-medium text-[var(--on-surface)] transition-colors duration-200 hover:bg-[var(--glass-bg)]"
        >
          <IconPencil size={14} stroke={1.7} />
          Edit profile
        </button>
      </div>
    </div>
  );
}

function EngineerVettingTab({
  editMode,
  engineer,
  onCancelEdit,
  onSave,
  onToggleEdit,
}: {
  editMode: boolean;
  engineer: EngineerRecord;
  onCancelEdit: () => void;
  onSave: (vetting: EngineerRecord["vetting"]) => void;
  onToggleEdit: () => void;
}) {
  const [prevVetting, setPrevVetting] = useState(engineer.vetting);
  const [items, setItems] = useState(engineer.vetting.map((v) => ({ ...v })));
  const complete = items.filter((item) => item.complete).length;

  if (engineer.vetting !== prevVetting) {
    setPrevVetting(engineer.vetting);
    setItems(engineer.vetting.map((v) => ({ ...v })));
  }

  const toggle = (label: string) => {
    setItems((cur) =>
      cur.map((item) =>
        item.label === label ? { ...item, complete: !item.complete } : item,
      ),
    );
  };

  if (editMode) {
    return (
      <div className="grid gap-6 p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.9rem] font-medium text-[var(--on-surface)]">
            Update vetting evidence
          </p>
          <span className="font-mono text-[0.82rem] text-[var(--on-surface)]">
            {complete}/{items.length} completed
          </span>
        </div>

        <div className="grid gap-3">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => toggle(item.label)}
              type="button"
              className={cn(
                "flex min-w-0 cursor-pointer items-center justify-between gap-4 rounded-[1.2rem] border p-4 text-left transition-all duration-200 hover:-translate-y-px",
                item.complete
                  ? "border-[color-mix(in_srgb,var(--tertiary)_30%,var(--glass-border))] bg-[color-mix(in_srgb,var(--tertiary)_7%,transparent)]"
                  : "border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] hover:border-[color-mix(in_srgb,var(--primary)_24%,var(--glass-border))]",
              )}
            >
              <span className="min-w-0">
                <span className="block text-[0.94rem] font-medium text-[var(--on-surface)]">
                  {item.label}
                </span>
                <span className="mt-1 block text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">
                  {getVettingHint(item.label)}
                </span>
              </span>
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full border",
                  item.complete
                    ? "border-[color-mix(in_srgb,var(--tertiary)_34%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_12%,transparent)] text-[var(--tertiary)]"
                    : "border-[var(--glass-border)] text-[var(--on-surface-dim)]",
                )}
              >
                {item.complete ? (
                  <IconCheck size={16} stroke={2} />
                ) : (
                  <IconX size={16} stroke={2} />
                )}
              </span>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelEdit}
            className="min-h-9 cursor-pointer rounded-full border border-[var(--glass-border)] px-4 text-[0.82rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(items)}
            className="min-h-9 cursor-pointer rounded-full bg-[var(--on-surface)] px-4 text-[0.82rem] font-medium text-[var(--bg)]"
          >
            Save vetting
          </button>
        </div>
      </div>
    );
  }

  const liveComplete = engineer.vetting.filter((v) => v.complete).length;

  return (
    <div className="grid gap-6 p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.9rem] font-medium text-[var(--on-surface)]">
          Vetting checklist
        </p>
        <button
          type="button"
          onClick={onToggleEdit}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] px-3 py-1.5 text-[0.78rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]"
        >
          <IconPencil size={13} stroke={1.7} />
          Edit
        </button>
      </div>

      <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.82rem] font-medium text-[var(--on-surface)]">
            Evidence progress
          </p>
          <span className="font-mono text-[0.82rem] font-medium text-[var(--on-surface)]">
            {liveComplete}/{engineer.vetting.length}
          </span>
        </div>
        <div className="mt-3 h-[0.35rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
          <div
            className="h-full rounded-full bg-[var(--tertiary)] transition-all duration-500"
            style={{
              width: `${(liveComplete / Math.max(engineer.vetting.length, 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {engineer.vetting.map((item) => (
          <div
            key={item.label}
            className={cn(
              "flex items-center justify-between gap-3 rounded-[1.2rem] border p-4",
              item.complete
                ? "border-[color-mix(in_srgb,var(--tertiary)_20%,var(--glass-border))] bg-[color-mix(in_srgb,var(--tertiary)_5%,transparent)]"
                : "border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_15%,transparent)]",
            )}
          >
            <div>
              <p className="text-[0.86rem] font-medium text-[var(--on-surface)]">
                {item.label}
              </p>
              <p className="mt-0.5 text-[0.74rem] text-[var(--on-surface-dim)]">
                {item.complete ? "Verified" : "Pending"}
              </p>
            </div>
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full border",
                item.complete
                  ? "border-[color-mix(in_srgb,var(--tertiary)_34%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_12%,transparent)] text-[var(--tertiary)]"
                  : "border-[var(--glass-border)] text-[var(--on-surface-dim)] opacity-50",
              )}
            >
              {item.complete ? (
                <IconCheck size={14} stroke={2} />
              ) : (
                <IconX size={14} stroke={2} />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EngineerFinancialsTab({ engineer }: { engineer: EngineerRecord }) {
  return (
    <div className="grid gap-6 p-6 sm:p-7">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5 rounded-[1.1rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_28%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_4%,transparent)] p-4 backdrop-blur-md">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">
            Admin Rate
          </p>
          <p className="mt-1 font-mono text-[1.2rem] leading-none font-medium text-[var(--on-surface)]">
            ${engineer.hourlyRate}/h
          </p>
          <div className="mt-auto h-[0.22rem] w-full rounded-full opacity-40 bg-[var(--tertiary)]" />
        </div>
        <div className="flex flex-col gap-1.5 rounded-[1.1rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_28%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_4%,transparent)] p-4 backdrop-blur-md">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">
            Dev Payout
          </p>
          <p className="mt-1 font-mono text-[1.2rem] leading-none font-medium text-[var(--on-surface)]">
            ${engineer.developerPayoutTarget}/h
          </p>
          <div className="mt-auto h-[0.22rem] w-full rounded-full opacity-40 bg-[var(--primary)]" />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5 rounded-[1.1rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_28%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_4%,transparent)] p-4 backdrop-blur-md sm:col-span-1">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">
            Availability Score
          </p>
          <p className="mt-1 font-mono text-[1.2rem] leading-none font-medium text-[var(--on-surface)]">
            {engineer.availabilityScore}%
          </p>
          <div className="mt-auto h-[0.22rem] w-full rounded-full opacity-40 bg-[var(--secondary)]" />
        </div>
      </div>

      <div className="rounded-[1.2rem] border border-[color-mix(in_srgb,var(--primary)_16%,var(--glass-border))] bg-[color-mix(in_srgb,var(--primary)_5%,transparent)] p-5">
        <p className="text-[0.78rem] font-medium uppercase tracking-[0.1em] text-[var(--primary)]">
          Compensation Policy
        </p>
        <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
          {engineer.adminCompensationNote}
        </p>
      </div>

      {engineer.networkRisk && (
        <div className="rounded-[1.2rem] border border-[color-mix(in_srgb,var(--error)_20%,var(--glass-border))] bg-[color-mix(in_srgb,var(--error)_5%,transparent)] p-5">
          <p className="text-[0.78rem] font-medium text-[var(--error)]">
            Network Risk
          </p>
          <p className="mt-1.5 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
            {engineer.networkRisk}
          </p>
        </div>
      )}
    </div>
  );
}

function EngineerActivityTab({ engineer }: { engineer: EngineerRecord }) {
  return (
    <div className="grid gap-4 p-6 sm:p-7">
      <p className="text-[0.9rem] font-medium text-[var(--on-surface)]">
        Recent activity
      </p>
      <div className="grid gap-0">
        {engineer.activity.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-4 pb-5 last:pb-0"
          >
            {index < engineer.activity.length - 1 && (
              <div className="absolute left-[0.69rem] top-5 bottom-0 w-px bg-[var(--glass-border)]" />
            )}
            <span
              className={cn(
                "relative mt-1 h-[0.6rem] w-[0.6rem] translate-y-[0.15rem] rounded-full border-2",
                index === 0
                  ? "border-[var(--tertiary)] bg-[var(--tertiary)]"
                  : "border-[var(--glass-border)] bg-[var(--surface)]",
              )}
            />
            <div className="min-w-0">
              <p className="text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
                {item}
              </p>
              {index === 0 && (
                <span className="mt-1 block text-[0.7rem] text-[var(--on-surface-dim)] opacity-60">
                  {engineer.lastTouched}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Edit Form (inline in Overview tab) ───────────────────────────────────────

function EditEngineerForm({
  engineer,
  firstInputRef,
  onCancel,
  onSave,
}: {
  engineer: EngineerRecord;
  firstInputRef: React.RefObject<HTMLInputElement | null>;
  onCancel: () => void;
  onSave: (payload: {
    availabilityDate: string;
    availabilityScore: number;
    domain: EngineerDomain;
    hourlyRate: number;
    location: string;
    name: string;
    notes: string;
    owner: string;
    placement: string;
    profileQuality: number;
    readiness: number;
    role: string;
    skills: string[];
    status: EngineerStatus;
    timezone: string;
    years: number;
  }) => void;
}) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const readNum = (key: string, fallback: number) => {
      const v = Number(form.get(key));
      return Number.isFinite(v) ? v : fallback;
    };
    onSave({
      availabilityDate:
        String(form.get("availabilityDate") || "").trim() ||
        engineer.availabilityDate,
      availabilityScore: readNum(
        "availabilityScore",
        engineer.availabilityScore,
      ),
      domain:
        (String(form.get("domain") || engineer.domain) as EngineerDomain) ||
        engineer.domain,
      hourlyRate: readNum("hourlyRate", engineer.hourlyRate),
      location: String(form.get("location") || "").trim() || engineer.location,
      name: String(form.get("name") || "").trim() || engineer.name,
      notes: String(form.get("notes") || "").trim() || engineer.notes,
      owner: String(form.get("owner") || "").trim() || engineer.owner,
      placement:
        String(form.get("placement") || "").trim() || engineer.placement,
      profileQuality: readNum("profileQuality", engineer.profileQuality),
      readiness: readNum("readiness", engineer.readiness),
      role: String(form.get("role") || "").trim() || engineer.role,
      skills: String(form.get("skills") || engineer.skills.join(", "))
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      status:
        (String(form.get("status") || engineer.status) as EngineerStatus) ||
        engineer.status,
      timezone: String(form.get("timezone") || "").trim() || engineer.timezone,
      years: readNum("years", engineer.years),
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-5 p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.9rem] font-medium text-[var(--on-surface)]">
          Edit talent profile
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormInput
          ref={firstInputRef}
          defaultValue={engineer.name}
          label="Name"
          name="name"
          placeholder="Amina Otieno"
        />
        <FormInput
          defaultValue={engineer.role}
          label="Role"
          name="role"
          placeholder="Senior AI Engineer"
        />
        <FormInput
          defaultValue={engineer.location}
          label="Location"
          name="location"
          placeholder="Nairobi, Kenya"
        />
        <FormInput
          defaultValue={engineer.timezone}
          label="Timezone"
          name="timezone"
          placeholder="UTC+3"
        />
        <FormInput
          defaultValue={engineer.owner}
          label="Owner"
          name="owner"
          placeholder="Talent ops"
        />
        <FormInput
          defaultValue={engineer.placement}
          label="Placement signal"
          name="placement"
          placeholder="Available for matching"
        />

        <FormSelectField
          label="Domain"
          name="domain"
          defaultValue={engineer.domain}
        >
          {domainOrder.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </FormSelectField>

        <FormSelectField
          label="Status"
          name="status"
          defaultValue={engineer.status}
        >
          {statusOrder.map((s) => (
            <option key={s} value={s}>
              {statusMeta[s].label}
            </option>
          ))}
        </FormSelectField>

        <FormInput
          defaultValue={engineer.availabilityDate}
          label="Availability"
          name="availabilityDate"
          placeholder="Now"
        />
        <FormInput
          defaultValue={String(engineer.hourlyRate)}
          label="Admin rate"
          name="hourlyRate"
          placeholder="72"
          type="number"
        />
        <FormInput
          defaultValue={String(engineer.years)}
          label="Years"
          name="years"
          placeholder="8"
          type="number"
        />
        <FormInput
          defaultValue={String(engineer.readiness)}
          label="Readiness"
          name="readiness"
          placeholder="94"
          type="number"
        />
        <FormInput
          defaultValue={String(engineer.profileQuality)}
          label="Profile quality"
          name="profileQuality"
          placeholder="98"
          type="number"
        />
        <FormInput
          defaultValue={String(engineer.availabilityScore)}
          label="Availability score"
          name="availabilityScore"
          placeholder="96"
          type="number"
        />

        <label className="md:col-span-3">
          <span className="text-[0.76rem] font-medium text-[var(--on-surface)]">
            Skills
          </span>
          <input
            className="mt-2 h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)] transition-colors duration-200"
            defaultValue={engineer.skills.join(", ")}
            name="skills"
            placeholder="Python, RAG, Postgres"
          />
        </label>
        <label className="md:col-span-3">
          <span className="text-[0.76rem] font-medium text-[var(--on-surface)]">
            Admin notes
          </span>
          <textarea
            className="mt-2 min-h-[5rem] w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3.5 text-[0.88rem] leading-relaxed text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)] transition-colors duration-200"
            defaultValue={engineer.notes}
            name="notes"
            placeholder="Private network notes..."
          />
        </label>
      </div>

      <div className="flex justify-end gap-2 border-t border-[var(--glass-border)] pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-5 text-[0.86rem] font-medium text-[var(--bg)]"
        >
          Save profile
        </button>
      </div>
    </form>
  );
}

// ─── Command Panel ────────────────────────────────────────────────────────────

function EngineerCommandPanel({
  engineer,
  onAdvance,
  onArchive,
  onOpen,
  onInvite,
}: {
  engineer: EngineerRecord | null;
  onAdvance?: () => void;
  onArchive?: () => void;
  onOpen?: () => void;
  onInvite: () => void;
}) {
  if (!engineer) {
    return (
      <aside className="rounded-[1.35rem] border border-dashed border-[var(--glass-border)] p-8 text-center">
        <p className="text-[0.98rem] font-medium text-[var(--on-surface)]">
          Select an engineer
        </p>
        <p className="mt-2 text-[0.86rem] text-[var(--on-surface-dim)]">
          Pick a network record to inspect vetting, profile quality, and
          shortlist readiness.
        </p>
      </aside>
    );
  }

  const next = statusMeta[engineer.status].next;

  return (
    <aside className="xl:sticky xl:top-28 xl:self-start">
      <div className="rounded-[1.35rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,var(--surface))] to-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <StatusBadge
              label={statusMeta[engineer.status].label}
              tone={statusMeta[engineer.status].tone}
            />
            <h2 className="title-serif mt-3 text-[1.15rem] font-medium leading-tight text-[var(--on-surface)]">
              {engineer.name}
            </h2>
            <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
              {engineer.role} / {engineer.location}
            </p>
          </div>
          <ReadinessRing value={engineer.readiness} size={68} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <InfoTile label="Available" value={engineer.availabilityDate} />
          <InfoTile label="Rate" value={`$${engineer.hourlyRate}/h`} />
          <InfoTile label="Owner" value={engineer.owner} />
          <InfoTile label="Profile" value={`${engineer.profileQuality}%`} />
          <InfoTile
            label="Payout"
            value={`$${engineer.developerPayoutTarget}/h`}
          />
          <InfoTile label="Domain" value={engineer.domain} />
        </div>

        <div className="mt-5 rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-4">
          <p className="text-[0.86rem] font-medium text-[var(--on-surface)]">
            Client-fit proof
          </p>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
            {engineer.clientFitNarrative}
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-4">
          <p className="text-[0.86rem] font-medium text-[var(--on-surface)]">
            Next network move
          </p>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
            {next
              ? `Move to ${statusMeta[next].label.toLowerCase()} after the remaining evidence is ready.`
              : "Keep relationship context fresh while this engineer is active in delivery."}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <ActionButton icon={IconNotes} label="Inspect" onClick={onOpen} />
          <ActionButton icon={IconMail} label="Invite" onClick={onInvite} />
          <ActionButton
            icon={IconCheck}
            label={next ? "Advance" : "Current"}
            onClick={onAdvance}
          />
          <ActionButton
            danger
            icon={IconTrash}
            label="Archive"
            onClick={onArchive}
          />
        </div>
      </div>
    </aside>
  );
}

// ─── InviteEngineerModal ──────────────────────────────────────────────────────

function InviteEngineerModal({
  onClose,
  onSubmit,
  open,
}: {
  onClose: () => void;
  onSubmit: (payload: {
    domain: EngineerDomain;
    hourlyRate: number;
    location: string;
    name: string;
    role: string;
    skills: string[];
  }) => void;
  open: boolean;
}) {
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    firstInputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, open]);

  if (!open) return null;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onSubmit({
      domain:
        (String(form.get("domain") || "Full-stack") as EngineerDomain) ||
        "Full-stack",
      hourlyRate: Number(form.get("hourlyRate") || 60),
      location: String(form.get("location") || "Remote"),
      name: String(form.get("name") || "New Engineer"),
      role: String(form.get("role") || "Software Engineer"),
      skills: String(form.get("skills") || "TypeScript, React")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <div
      aria-labelledby="invite-engineer-title"
      aria-modal="true"
      className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-8 backdrop-blur-xl"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
    >
      <form
        className="w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_40%,var(--surface))] to-[var(--surface)] p-6 shadow-[0_32px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-7"
        onSubmit={submit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-caps text-[var(--primary)]">Network intake</p>
            <h2
              id="invite-engineer-title"
              className="title-serif mt-2 text-[1.3rem] font-medium text-[var(--on-surface)]"
            >
              Invite engineer
            </h2>
            <p className="mt-2 max-w-2xl text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
              Create a talent record with enough structure for vetting,
              availability, and future shortlist matching.
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
          <FormInput
            ref={firstInputRef}
            label="Name"
            name="name"
            placeholder="Ada Mensah"
          />
          <FormInput
            label="Role"
            name="role"
            placeholder="Senior Full-stack Engineer"
          />
          <FormInput
            label="Location"
            name="location"
            placeholder="Lagos, Nigeria"
          />
          <FormInput
            label="Hourly rate"
            name="hourlyRate"
            placeholder="68"
            type="number"
          />
          <FormSelectField
            label="Domain"
            name="domain"
            defaultValue="Full-stack"
          >
            {domainOrder.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </FormSelectField>
          <FormInput
            label="Skills"
            name="skills"
            placeholder="React, Node.js, Postgres"
          />
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
            Create invite
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Other Components & Utilities ──────────────────────────────────────────────

function EngineerSupplyMap({ engineers }: { engineers: EngineerRecord[] }) {
  const domainCounts = domainOrder.map((domain) => {
    const records = engineers.filter((e) => e.domain === domain);
    return {
      available: records.filter((e) => e.status === "available").length,
      domain,
      placed: records.filter((e) => e.status === "placed").length,
      total: records.length,
      vetting: records.filter((e) => e.status === "vetting").length,
    };
  });

  return (
    <div className="min-w-0">
      <SectionHeader
        eyebrow="Supply observability"
        title="Domain capacity map"
        description="Availability, vetting pressure, and placed capacity are shown by domain so talent ops can see supply gaps before a brief lands."
      />
      <div className="mt-6 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-h-[27rem] overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_40%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-2xl">
          <DashboardBarChart
            data={domainCounts.map((i) => i.total)}
            height={330}
            labels={domainCounts.map((i) => i.domain)}
          />
        </div>
        <div className="grid gap-3">
          {domainCounts.map((item) => {
            const availableWidth = item.total
              ? (item.available / item.total) * 100
              : 0;
            const vettingWidth = item.total
              ? (item.vetting / item.total) * 100
              : 0;
            const placedWidth = item.total
              ? (item.placed / item.total) * 100
              : 0;
            return (
              <article
                key={item.domain}
                className="rounded-[1.15rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-4 backdrop-blur-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
                    {item.domain}
                  </p>
                  <span className="font-mono text-[0.82rem] text-[var(--on-surface)]">
                    {item.total}
                  </span>
                </div>
                <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
                  <span
                    style={{ width: `${availableWidth}%` }}
                    className="bg-[var(--tertiary)]"
                  />
                  <span
                    style={{ width: `${vettingWidth}%` }}
                    className="bg-[var(--primary)]"
                  />
                  <span
                    style={{ width: `${placedWidth}%` }}
                    className="bg-[var(--secondary)]"
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[0.72rem] text-[var(--on-surface-dim)]">
                  <span>Avail {item.available}</span>
                  <span>Vet {item.vetting}</span>
                  <span>Placed {item.placed}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EngineerTalentRoom({
  engineers,
  selected,
  stats,
}: {
  engineers: EngineerRecord[];
  selected: EngineerRecord | null;
  stats: ReturnType<typeof buildEngineerStats>;
}) {
  if (!selected)
    return (
      <EmptyState
        title="No engineer selected"
        body="Select an engineer to open talent intelligence."
      />
    );

  const evidenceCounts = domainOrder.map((domain) => {
    const records = engineers.filter((e) => e.domain === domain);
    return records.length
      ? Math.round(
          records.reduce((sum, e) => sum + e.profileQuality, 0) /
            records.length,
        )
      : 0;
  });

  return (
    <section className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_22rem]">
      <article className="min-w-0 rounded-[1.6rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_34%,var(--surface))] to-[var(--surface)] p-5 shadow-[0_22px_70px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)] sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <p className="label-caps text-[var(--primary)]">
              Talent intelligence
            </p>
            <h2 className="title-serif mt-3 text-[1.45rem] font-medium leading-tight text-[var(--on-surface)]">
              {selected.name} shortlist dossier
            </h2>
            <p className="mt-3 max-w-3xl text-[0.96rem] leading-relaxed text-[var(--on-surface-dim)]">
              {selected.clientFitNarrative}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoTile
                label="Developer payout"
                value={`$${selected.developerPayoutTarget}/h`}
              />
              <InfoTile
                label="Admin rate"
                value={`$${selected.hourlyRate}/h`}
              />
              <InfoTile
                label="Availability"
                value={selected.availabilityDate}
              />
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_22%,transparent)] p-4 backdrop-blur-md">
            <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">
              Compensation boundary
            </p>
            <p className="mt-3 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
              {selected.adminCompensationNote}
            </p>
            <p className="mt-4 text-[0.78rem] leading-relaxed text-[var(--primary)]">
              {selected.shortlistReadiness}
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {selected.evidencePack.map((item) => (
            <div
              className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3"
              key={item}
            >
              <p className="text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">
                {item}
              </p>
            </div>
          ))}
        </div>
      </article>

      <article className="grid min-w-0 gap-4 rounded-[1.6rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,var(--surface))] to-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_7%,transparent)] sm:p-6">
        <div>
          <p className="label-caps text-[var(--primary)]">Network evidence</p>
          <p className="mt-3 font-mono text-[2rem] font-medium leading-none text-[var(--on-surface)]">
            {stats.evidenceCoverage}%
          </p>
          <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
            Evidence coverage across identity, technical screen, reference,
            portfolio proof, and shortlist readiness.
          </p>
        </div>
        <DashboardBarChart
          data={evidenceCounts}
          height={220}
          labels={domainOrder}
        />
      </article>
    </section>
  );
}

function EngineerPagination({
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
  ).filter((i) => i <= totalPages);

  return (
    <div className="grid gap-3 overflow-hidden rounded-[1.2rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_24%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] p-3 backdrop-blur-md sm:p-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between xl:justify-start">
        <p className="font-mono text-[0.8rem] text-[var(--on-surface-dim)]">
          Showing {start}–{end} of {total} engineers
        </p>
        <label className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--surface)] px-3 py-1.5 text-[0.78rem] text-[var(--on-surface-dim)]">
          Page size
          <select
            className="cursor-pointer bg-transparent font-mono text-[var(--on-surface)] outline-none"
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            value={pageSize}
          >
            {engineerPageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
        {[
          {
            disabled: page <= 1,
            label: "First",
            onClick: () => onPageChange(1),
          },
          {
            disabled: page <= 1,
            label: "Prev",
            onClick: () => onPageChange(Math.max(page - 1, 1)),
          },
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
          {
            disabled: page >= totalPages,
            label: "Next",
            onClick: () => onPageChange(Math.min(page + 1, totalPages)),
          },
          {
            disabled: page >= totalPages,
            label: "Last",
            onClick: () => onPageChange(totalPages),
          },
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
      <h2 className="title-serif mt-3 text-[clamp(1.48rem,2vw,1.9rem)] font-medium text-[var(--on-surface)]">
        {title}
      </h2>
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
    <article className="min-w-0 overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_34%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-2xl">
      <div className="flex min-h-[4.75rem] items-start justify-between gap-4">
        <div>
          <h3 className="text-[0.96rem] font-medium text-[var(--on-surface)]">
            {title}
          </h3>
          <p className="mt-1 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">
            {description}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--glass-border)] px-3 py-1.5 font-mono text-[0.7rem] text-[var(--on-surface)]">
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
  onChange: (v: string) => void;
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
        active
          ? "bg-[var(--on-surface)] text-[var(--bg)]"
          : "text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]",
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

function SignalCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-[var(--glass-border)] px-3 py-2.5 last:border-r-0">
      <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">
        {label}
      </p>
      <p className="mt-1 truncate font-mono text-[0.82rem] font-medium text-[var(--on-surface)]">
        {value}
      </p>
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
        <span className="text-[0.78rem] text-[var(--on-surface-dim)]">
          {label}
        </span>
        <span className="font-mono text-[0.78rem] font-medium text-[var(--on-surface)]">
          {value}%
        </span>
      </div>
      <div className="mt-2.5 h-[0.28rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            background: `linear-gradient(90deg, color-mix(in srgb, ${tone} 40%, transparent), ${tone})`,
            width: `${value}%`,
          }}
        />
      </div>
      <p className="mt-2 text-[0.7rem] text-[var(--on-surface-dim)] opacity-70">
        {detail}
      </p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_18%,transparent)] px-3 py-2.5">
      <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">
        {label}
      </p>
      <p className="mt-1 truncate font-mono text-[0.82rem] font-medium text-[var(--on-surface)]">
        {value}
      </p>
    </div>
  );
}

function ReadinessRing({ size = 58, value }: { size?: number; value: number }) {
  const background = `conic-gradient(var(--tertiary) ${value * 3.6}deg, color-mix(in srgb, var(--on-surface) 10%, transparent) 0deg)`;
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

const FormInput = forwardRef<
  HTMLInputElement,
  {
    defaultValue?: string;
    label: string;
    name: string;
    placeholder: string;
    type?: string;
  }
>(function FormInput(
  { defaultValue, label, name, placeholder, type = "text" },
  ref,
) {
  return (
    <label>
      <span className="text-[0.74rem] font-medium text-[var(--on-surface)]">
        {label}
      </span>
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
      <span className="text-[0.74rem] font-medium text-[var(--on-surface)]">
        {label}
      </span>
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

function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-[1.2rem] border border-dashed border-[var(--glass-border)] p-8 text-center lg:col-span-2">
      <p className="text-[0.98rem] font-medium text-[var(--on-surface)]">
        {title}
      </p>
      <p className="mx-auto mt-2 max-w-md text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
        {body}
      </p>
    </div>
  );
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function EngineerToolbar({
  domainFilter,
  query,
  setDomainFilter,
  setQuery,
  setSortKey,
  setStatusFilter,
  setViewMode,
  sortKey,
  statusFilter,
  viewMode,
}: {
  domainFilter: EngineerDomain | "all";
  query: string;
  setDomainFilter: (v: EngineerDomain | "all") => void;
  setQuery: (v: string) => void;
  setSortKey: (v: SortKey) => void;
  setStatusFilter: (v: EngineerStatus | "all") => void;
  setViewMode: (v: ViewMode) => void;
  sortKey: SortKey;
  statusFilter: EngineerStatus | "all";
  viewMode: ViewMode;
}) {
  return (
    <div className="grid w-full gap-3 lg:w-auto lg:min-w-[42rem]">
      <label className="relative min-w-0">
        <span className="sr-only">Search engineers</span>
        <IconSearch
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]"
          size={16}
          stroke={1.6}
        />
        <input
          className="h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-10 pr-4 text-[0.88rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)] transition-colors duration-200"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search engineers, skills, locations, owners..."
          value={query}
        />
      </label>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <SelectPill
          icon={IconFilter}
          label="Status"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as EngineerStatus | "all")}
        >
          <option value="all">All statuses</option>
          {statusOrder.map((s) => (
            <option key={s} value={s}>
              {statusMeta[s].label}
            </option>
          ))}
        </SelectPill>
        <SelectPill
          icon={IconCode}
          label="Domain"
          value={domainFilter}
          onChange={(v) => setDomainFilter(v as EngineerDomain | "all")}
        >
          <option value="all">All domains</option>
          {domainOrder.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </SelectPill>
        <SelectPill
          icon={IconAdjustmentsHorizontal}
          label="Sort"
          value={sortKey}
          onChange={(v) => setSortKey(v as SortKey)}
        >
          <option value="readiness">Readiness</option>
          <option value="availability">Availability</option>
          <option value="quality">Profile quality</option>
          <option value="rate">Lowest rate</option>
        </SelectPill>
        <div className="flex w-fit items-center rounded-full border border-[var(--glass-border)] p-1">
          <ViewButton
            active={viewMode === "grid"}
            label="Grid view"
            onClick={() => setViewMode("grid")}
          >
            <IconLayoutGrid size={15} stroke={1.6} />
          </ViewButton>
          <ViewButton
            active={viewMode === "list"}
            label="List view"
            onClick={() => setViewMode("list")}
          >
            <IconListDetails size={15} stroke={1.6} />
          </ViewButton>
        </div>
      </div>
    </div>
  );
}

// ─── Data utilities ───────────────────────────────────────────────────────────

function buildEngineerStats(engineers: EngineerRecord[]) {
  const avg = (values: number[]) =>
    values.length
      ? Math.round(values.reduce((s, v) => s + v, 0) / values.length)
      : 0;
  const evidenceCoverage = avg(
    engineers.map((e) =>
      Math.round(
        (e.vetting.filter((v) => v.complete).length / e.vetting.length) * 100,
      ),
    ),
  );

  return {
    available: engineers.filter((e) => e.status === "available").length,
    evidenceCoverage,
    avgQuality: avg(engineers.map((e) => e.profileQuality)),
    avgRate: avg(engineers.map((e) => e.hourlyRate)),
    avgReadiness: avg(engineers.map((e) => e.readiness)),
    placed: engineers.filter((e) => e.status === "placed").length,
    total: engineers.length,
    vetting: engineers.filter((e) => e.status === "vetting").length,
  };
}

function enrichEngineerRecord(engineer: EngineerSeedRecord): EngineerRecord {
  const developerPayoutTarget = Math.max(
    30,
    Math.round(engineer.hourlyRate * 0.72),
  );
  const completeVetting = engineer.vetting.filter((i) => i.complete).length;
  const proofLevel = Math.round(
    (completeVetting / engineer.vetting.length) * 100,
  );

  return {
    ...engineer,
    adminCompensationNote: `Admin can model client rate at $${engineer.hourlyRate}/h while the developer-facing dashboard only exposes approved payout around $${developerPayoutTarget}/h and payout state.`,
    clientFitNarrative:
      engineer.status === "placed"
        ? `${engineer.name} is active in delivery, so client visibility should center on milestone health, communication, and renewal timing.`
        : engineer.status === "available"
          ? `${engineer.name} is ready for shortlist use where ${engineer.domain.toLowerCase()} depth, delivery proof, and availability matter more than raw rate.`
          : engineer.status === "verified"
            ? `${engineer.name} has enough evidence for controlled shortlist review once availability and proof freshness are confirmed.`
            : engineer.status === "vetting"
              ? `${engineer.name} needs remaining evidence closed before client-facing profile presentation.`
              : `${engineer.name} is an intake record; keep private until identity, technical, reference, and portfolio proof are credible.`,
    developerPayoutTarget,
    evidencePack: [
      `${proofLevel}% vetting evidence complete`,
      `${engineer.profileQuality}% profile quality with ${engineer.skills.slice(0, 3).join(", ")} proof`,
      `${engineer.availabilityScore}% availability confidence for ${engineer.placement}`,
    ],
    networkRisk:
      engineer.status === "placed"
        ? "Do not expose as available until delivery owner confirms release timing."
        : engineer.profileQuality < 80
          ? "Profile proof needs strengthening before high-value client presentation."
          : engineer.availabilityScore < 70
            ? "Availability confidence may weaken shortlist conversion."
            : "No major network risk beyond keeping proof fresh.",
    shortlistReadiness:
      proofLevel >= 100 && engineer.availabilityScore >= 85
        ? "Shortlist-ready: evidence, availability, and profile proof can support a client intro."
        : proofLevel >= 75
          ? "Controlled shortlist: usable with admin review and a clear proof note."
          : "Hold from client shortlist until vetting evidence is stronger.",
  };
}

function toEngineerSeed(
  engineer: EngineerRecord,
  overrides: Partial<EngineerSeedRecord> = {},
): EngineerSeedRecord {
  return {
    activity: engineer.activity,
    availabilityDate: engineer.availabilityDate,
    availabilityScore: engineer.availabilityScore,
    country: engineer.country,
    domain: engineer.domain,
    fitSignals: engineer.fitSignals,
    hourlyRate: engineer.hourlyRate,
    id: engineer.id,
    initials: engineer.initials,
    lastTouched: engineer.lastTouched,
    location: engineer.location,
    name: engineer.name,
    notes: engineer.notes,
    owner: engineer.owner,
    placement: engineer.placement,
    profileQuality: engineer.profileQuality,
    readiness: engineer.readiness,
    role: engineer.role,
    skills: engineer.skills,
    status: engineer.status,
    timezone: engineer.timezone,
    vetting: engineer.vetting,
    years: engineer.years,
    ...overrides,
  };
}

function getVettingHint(label: string) {
  if (label === "Identity")
    return "Government ID, contact, and location verification.";
  if (label === "Technical screen")
    return "Live or async technical evidence accepted.";
  if (label === "Reference")
    return "At least one credible professional reference confirmed.";
  if (label === "Portfolio proof")
    return "Work samples reviewed for client-facing proof.";
  return "Evidence item required before confident shortlist use.";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
