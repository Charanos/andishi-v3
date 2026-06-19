"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  IconAdjustmentsHorizontal,
  IconArrowRight,
  IconBriefcase,
  IconBuilding,
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconCode,
  IconFileText,
  IconGitMerge,
  IconLayoutGrid,
  IconListDetails,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { AdminWorkflowNav } from "@/components/dashboard/admin/admin-workflow-nav";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import {
  DashboardBarChart,
  DashboardDonutChart,
  DashboardLineChart,
} from "@/components/dashboard/shared/dashboard-chart";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { EntityDrawer } from "@/components/dashboard/shared/entity-drawer";
import { KpiCard } from "@/components/dashboard/shared/kpi-card";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { SectionDivider } from "@/components/ui/section-divider";
import { dashboardDemoData } from "@/data/dashboard-mock";
import { cn } from "@/lib/utils";

type BriefStatus =
  | "submitted"
  | "under_review"
  | "matching"
  | "shortlisted"
  | "closed";
type Seniority = "mid" | "senior" | "lead" | "principal";
type SortKey = "priority" | "sla" | "budget" | "recent";
type ViewMode = "grid" | "list";

type BriefRecord = {
  adminNotes: string;
  budgetMax: number;
  budgetMin: number;
  client: string;
  clientTier: "active" | "expansion" | "prospect";
  description: string;
  domain: string;
  healthScore: number;
  hoursInStage: number;
  hoursPerWeek: number;
  id: string;
  matchCount: number;
  owner: string;
  priority: number;
  requirements: string[];
  seniority: Seniority;
  slaLimitHours: number;
  stack: string[];
  stageEnteredAt: string;
  status: BriefStatus;
  submittedAt: string;
  timeline: string;
  title: string;
};

type EngineerCandidate = {
  availability: "immediate" | "soon" | "month";
  dimensions: {
    availability: number;
    domain: number;
    seniority: number;
    stack: number;
  };
  id: string;
  location: string;
  name: string;
  rateUsd: number;
  role: string;
  score: number;
  skills: string[];
};

const statusOrder: BriefStatus[] = [
  "submitted",
  "under_review",
  "matching",
  "shortlisted",
  "closed",
];

const queueStatusOrder: BriefStatus[] = [
  "submitted",
  "under_review",
  "matching",
  "shortlisted",
];

const briefPageSize = 6;

const statusMeta: Record<
  BriefStatus,
  {
    label: string;
    next: BriefStatus | null;
    tone: "active" | "available" | "overdue" | "pending";
  }
> = {
  closed: { label: "Closed", next: null, tone: "available" },
  matching: { label: "Matching", next: "shortlisted", tone: "pending" },
  shortlisted: { label: "Shortlisted", next: null, tone: "active" },
  submitted: { label: "Submitted", next: "under_review", tone: "pending" },
  under_review: { label: "Under review", next: "matching", tone: "pending" },
};

const candidatePool: EngineerCandidate[] = [
  {
    availability: "immediate",
    dimensions: { availability: 90, domain: 98, seniority: 92, stack: 96 },
    id: "cand-amina",
    location: "Nairobi, Kenya",
    name: "Amina Otieno",
    rateUsd: 9800,
    role: "Senior AI Product Engineer",
    score: 94,
    skills: ["Python", "RAG", "FastAPI", "Postgres"],
  },
  {
    availability: "soon",
    dimensions: { availability: 82, domain: 92, seniority: 88, stack: 90 },
    id: "cand-kwame",
    location: "Accra, Ghana",
    name: "Kwame Mensah",
    rateUsd: 7800,
    role: "Senior Full-Stack Engineer",
    score: 88,
    skills: ["React", "Node.js", "Postgres", "Payments"],
  },
  {
    availability: "immediate",
    dimensions: { availability: 91, domain: 84, seniority: 86, stack: 89 },
    id: "cand-zola",
    location: "Cape Town, South Africa",
    name: "Zola Ndlovu",
    rateUsd: 8600,
    role: "Cloud Platform Engineer",
    score: 85,
    skills: ["AWS", "Terraform", "Kubernetes", "Go"],
  },
  {
    availability: "soon",
    dimensions: { availability: 86, domain: 94, seniority: 88, stack: 93 },
    id: "cand-sarah",
    location: "Nairobi, Kenya",
    name: "Sarah Kimani",
    rateUsd: 6900,
    role: "Senior Mobile Engineer",
    score: 91,
    skills: ["React Native", "Expo", "GraphQL", "TypeScript"],
  },
];

const candidateMap: Record<string, string[]> = {
  "brief-ai-support": ["cand-amina", "cand-zola"],
  "brief-design-system": ["cand-kwame"],
  "brief-mobile-commerce": ["cand-sarah", "cand-kwame"],
  "brief-payments": ["cand-kwame", "cand-amina"],
};

const baseBriefs: BriefRecord[] = [
  {
    adminNotes:
      "Strong AI demand. Prioritize engineers with evaluation and customer support automation depth.",
    budgetMax: 12000,
    budgetMin: 8500,
    client: "Kijani Analytics",
    clientTier: "active",
    description:
      "Productionize a customer support RAG workflow with evaluation traces, admin review, and escalation handling.",
    domain: "AI / ML",
    healthScore: 88,
    hoursInStage: 38,
    hoursPerWeek: 32,
    id: "brief-ai-support",
    matchCount: 2,
    owner: "Dennis",
    priority: 94,
    requirements: ["Production RAG", "Evaluation loops", "FastAPI", "Postgres"],
    seniority: "lead",
    slaLimitHours: 72,
    stack: ["Python", "RAG", "FastAPI", "Postgres", "AWS"],
    stageEnteredAt: "2026-05-24T08:00:00.000Z",
    status: "matching",
    submittedAt: "2026-05-18T08:30:00.000Z",
    timeline: "Start within 2 weeks",
    title: "Lead AI engineer for support automation",
  },
  {
    adminNotes:
      "Payments domain matters more than raw frontend speed. Prep Kwame for client review.",
    budgetMax: 9500,
    budgetMin: 7200,
    client: "SokoPay",
    clientTier: "expansion",
    description:
      "Redesign the ledger model, optimize settlement flows, and deliver a finance reconciliation dashboard.",
    domain: "Fintech / Payments",
    healthScore: 76,
    hoursInStage: 51,
    hoursPerWeek: 40,
    id: "brief-payments",
    matchCount: 2,
    owner: "Maya",
    priority: 87,
    requirements: [
      "Full-stack TypeScript",
      "PostgreSQL",
      "Payments domain",
      "Audit trails",
    ],
    seniority: "senior",
    slaLimitHours: 96,
    stack: ["TypeScript", "Node.js", "PostgreSQL", "React"],
    stageEnteredAt: "2026-05-22T09:00:00.000Z",
    status: "shortlisted",
    submittedAt: "2026-05-20T09:30:00.000Z",
    timeline: "Immediate",
    title: "Senior full-stack engineer for payments reconciliation",
  },
  {
    adminNotes:
      "Scope is clear. Confirm if client needs IaC ownership or advisory only.",
    budgetMax: 13000,
    budgetMin: 9000,
    client: "Nova Health",
    clientTier: "active",
    description:
      "Move manual AWS provisioning into Terraform-managed infrastructure across a health data platform.",
    domain: "Cloud / Platform",
    healthScore: 91,
    hoursInStage: 22,
    hoursPerWeek: 40,
    id: "brief-cloud-reliability",
    matchCount: 0,
    owner: "Dennis",
    priority: 79,
    requirements: ["AWS", "Terraform", "Kubernetes", "Reliability"],
    seniority: "senior",
    slaLimitHours: 48,
    stack: ["AWS", "Terraform", "Go", "Kubernetes"],
    stageEnteredAt: "2026-05-23T09:00:00.000Z",
    status: "under_review",
    submittedAt: "2026-05-21T11:00:00.000Z",
    timeline: "June 2026",
    title: "Backend platform engineer for AWS reliability",
  },
  {
    adminNotes: "New prospect. Needs qualification before talent motion.",
    budgetMax: 16000,
    budgetMin: 12000,
    client: "DataSense AI",
    clientTier: "prospect",
    description:
      "Design a production computer vision pipeline for medical imaging inference APIs.",
    domain: "AI / ML",
    healthScore: 65,
    hoursInStage: 6,
    hoursPerWeek: 32,
    id: "brief-medical-imaging",
    matchCount: 0,
    owner: "Unassigned",
    priority: 72,
    requirements: [
      "PyTorch",
      "Computer vision",
      "Docker",
      "Clinical workflows",
    ],
    seniority: "principal",
    slaLimitHours: 24,
    stack: ["Python", "PyTorch", "OpenCV", "Docker"],
    stageEnteredAt: "2026-05-26T09:00:00.000Z",
    status: "submitted",
    submittedAt: "2026-05-26T09:00:00.000Z",
    timeline: "July 2026",
    title: "Principal ML engineer for medical imaging pipeline",
  },
  {
    adminNotes: "Sarah is a strong fit. Client needs a cleaner intro proposal.",
    budgetMax: 7500,
    budgetMin: 5500,
    client: "TradeHub",
    clientTier: "active",
    description:
      "Own a React Native app serving merchants, including checkout redesign and notification infrastructure.",
    domain: "Mobile / Commerce",
    healthScore: 72,
    hoursInStage: 64,
    hoursPerWeek: 32,
    id: "brief-mobile-commerce",
    matchCount: 2,
    owner: "Maya",
    priority: 81,
    requirements: [
      "React Native",
      "TypeScript",
      "GraphQL",
      "App store delivery",
    ],
    seniority: "mid",
    slaLimitHours: 72,
    stack: ["React Native", "TypeScript", "GraphQL", "Expo"],
    stageEnteredAt: "2026-05-25T10:00:00.000Z",
    status: "matching",
    submittedAt: "2026-05-23T10:00:00.000Z",
    timeline: "Immediate",
    title: "React Native engineer for mobile commerce",
  },
  ...dashboardDemoData.briefs
    .filter((brief) => brief.id !== dashboardDemoData.briefs[0]?.id)
    .map(
      (brief, index): BriefRecord => ({
        adminNotes: brief.andishiNotes,
        budgetMax: 9000 + index * 1200,
        budgetMin: 6500 + index * 1000,
        client: "Kijani Analytics",
        clientTier: "active",
        description: brief.description,
        domain: brief.domain,
        healthScore: 78 + index * 4,
        hoursInStage: 18 + index * 12,
        hoursPerWeek: brief.engagementModel === "embedded" ? 40 : 32,
        id: `brief-${brief.id}`,
        matchCount: index + 1,
        owner: "Talent ops",
        priority: 68 + index * 7,
        requirements: brief.stackTags.slice(0, 4),
        seniority: brief.seniority as Seniority,
        slaLimitHours: (brief.status as string) === "matching" ? 72 : 48,
        stack: [...brief.stackTags],
        stageEnteredAt: brief.submittedAt,
        status: brief.status as BriefStatus,
        submittedAt: brief.submittedAt,
        timeline: brief.timeline,
        title: brief.title,
      }),
    ),
];

export function AdminBriefsPage() {
  const [briefs, setBriefs] = useState<BriefRecord[]>(baseBriefs);
  const [commandBrief, setCommandBrief] = useState<BriefRecord | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BriefStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [drawerBrief, setDrawerBrief] = useState<BriefRecord | null>(null);
  const [confirmBrief, setConfirmBrief] = useState<BriefRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [syncedAt, setSyncedAt] = useState("2 min ago");

  const filteredBriefs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return briefs
      .filter((brief) => {
        const inQueue = queueStatusOrder.includes(brief.status);
        const matchesQuery =
          `${brief.title} ${brief.client} ${brief.domain} ${brief.stack.join(" ")} ${brief.owner}`
            .toLowerCase()
            .includes(normalized);
        const matchesStatus =
          statusFilter === "all" || brief.status === statusFilter;
        return inQueue && matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortKey === "sla")
          return (
            b.hoursInStage / b.slaLimitHours - a.hoursInStage / a.slaLimitHours
          );
        if (sortKey === "budget") return b.budgetMax - a.budgetMax;
        if (sortKey === "recent")
          return Date.parse(b.submittedAt) - Date.parse(a.submittedAt);
        return b.priority - a.priority;
      });
  }, [briefs, query, sortKey, statusFilter]);

  const totalPages = Math.max(
    Math.ceil(filteredBriefs.length / briefPageSize),
    1,
  );
  const activePage = Math.min(page, totalPages);
  const paginatedBriefs = filteredBriefs.slice(
    (activePage - 1) * briefPageSize,
    activePage * briefPageSize,
  );
  const stats = useMemo(() => buildBriefStats(briefs), [briefs]);
  const commandCandidates = commandBrief
    ? getCandidatesForBrief(commandBrief)
    : [];

  const syncBriefs = () => {
    setSyncedAt("just now");
  };

  const upsertBrief = (brief: BriefRecord) => {
    setBriefs((current) => [brief, ...current]);
    setCommandBrief(brief);
    setPage(1);
    setCreateOpen(false);
  };

  const advanceBrief = (brief: BriefRecord) => {
    const next = statusMeta[brief.status].next;
    if (!next) return;
    const updated = {
      ...brief,
      hoursInStage: 0,
      matchCount:
        next === "matching" ? Math.max(brief.matchCount, 1) : brief.matchCount,
      stageEnteredAt: new Date().toISOString(),
      status: next,
    };
    setBriefs((current) =>
      current.map((item) => (item.id === brief.id ? updated : item)),
    );
    setDrawerBrief((current) => (current?.id === brief.id ? updated : current));
    setCommandBrief((current) =>
      current?.id === brief.id ? updated : current,
    );
  };

  const archiveBrief = () => {
    if (!confirmBrief) return;
    setBriefs((current) => {
      const next = current.filter((brief) => brief.id !== confirmBrief.id);
      return next;
    });
    setCommandBrief((current) =>
      current?.id === confirmBrief.id ? null : current,
    );
    setDrawerBrief((current) =>
      current?.id === confirmBrief.id ? null : current,
    );
    setConfirmBrief(null);
  };

  const updateNotes = (briefId: string, notes: string) => {
    setBriefs((current) =>
      current.map((brief) =>
        brief.id === briefId ? { ...brief, adminNotes: notes } : brief,
      ),
    );
    setDrawerBrief((current) =>
      current?.id === briefId ? { ...current, adminNotes: notes } : current,
    );
    setCommandBrief((current) =>
      current?.id === briefId ? { ...current, adminNotes: notes } : current,
    );
  };

  const proposeShortlist = (brief: BriefRecord) => {
    const updated = {
      ...brief,
      matchCount: Math.max(
        brief.matchCount,
        getCandidatesForBrief(brief).length,
        1,
      ),
      status:
        brief.status === "submitted" || brief.status === "under_review"
          ? "matching"
          : brief.status,
    };
    setBriefs((current) =>
      current.map((item) => (item.id === brief.id ? updated : item)),
    );
    setDrawerBrief((current) => (current?.id === brief.id ? updated : current));
    setCommandBrief(updated);
  };

  return (
    <div className="grid min-w-0 gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <DashboardPageHeader
        className="mb-0"
        description="Triage client demand, clarify requirements, and move briefs into matching with visible SLA and relationship context."
        status={
          <StatusBadge label={`${stats.queueCount} queued`} tone="pending" />
        }
        title="Brief command room"
        actions={
          <>
            <button
              type="button"
              onClick={syncBriefs}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.9rem] font-medium text-[var(--on-surface)] transition-colors duration-200 hover:bg-[var(--glass-bg)]"
            >
              <IconRefresh size={16} stroke={1.7} />
              Sync
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.9rem] font-medium text-[var(--bg)] shadow-[0_14px_30px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <IconPlus size={16} stroke={1.8} />
              New brief
            </button>
          </>
        }
      />

      <AdminWorkflowNav active="briefs" />

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          chart="bar"
          data={[10, 12, 14, 13, 16, stats.queueCount]}
          icon={IconFileText}
          label="Queue briefs"
          trend={`${stats.reviewQueue} need admin review`}
          value={String(stats.queueCount)}
        />
        <KpiCard
          data={[42, 38, 35, 31, 29, stats.avgSlaUse]}
          icon={IconClock}
          label="SLA pressure"
          trend={`${stats.slaRisk} at risk right now`}
          value={`${stats.avgSlaUse}%`}
        />
        <KpiCard
          chart="bar"
          data={[2, 4, 5, 7, 8, stats.readyToMatch]}
          icon={IconGitMerge}
          label="Ready for shortlist"
          trend={`${stats.totalMatches} candidate signals`}
          value={String(stats.readyToMatch)}
        />
        <KpiCard
          data={[62, 68, 71, 76, 80, stats.avgHealth]}
          icon={IconCheck}
          label="Brief quality"
          trend="Composite requirement health"
          value={`${stats.avgHealth}%`}
        />
      </section>

      <SectionDivider />

      <section className="grid min-w-0 gap-6">
        <SectionHeader
          action={
            <span className="font-mono text-[0.86rem] text-[var(--on-surface-dim)]">
              Updated {syncedAt}
            </span>
          }
          description="Review demand quality, clarify client requirements, and prepare clean shortlist inputs without owning placement or delivery workflows on this page."
          eyebrow="Demand queue"
          title="Brief qualification"
        />

        <div className="min-w-0">
          <div className="flex min-w-0 flex-col gap-3 rounded-[1.1rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-3xl text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
              Queue cards expose SLA, requirement quality, talent supply, and
              notes so admins can prepare clean shortlist decisions.
            </p>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 font-mono text-[0.78rem] text-[var(--on-surface-dim)]">
                {filteredBriefs.length}/{stats.queueCount} visible
              </span>
              <span className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 font-mono text-[0.78rem] text-[var(--on-surface-dim)]">
                Page {activePage}/{totalPages}
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-5">
            <BriefToolbar
              query={query}
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
              sortKey={sortKey}
              statusFilter={statusFilter}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            <PipelineStageStrip
              activeStatus={statusFilter}
              briefs={briefs}
              onSelect={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            />

            <div
              className={cn(
                "grid gap-4",
                viewMode === "grid" ? "xl:grid-cols-2" : "grid-cols-1",
              )}
            >
              {paginatedBriefs.map((brief) => (
                <BriefQueueCard
                  active={commandBrief?.id === brief.id}
                  brief={brief}
                  key={brief.id}
                  onAdvance={() => advanceBrief(brief)}
                  onArchive={() => setConfirmBrief(brief)}
                  onInspect={() => setDrawerBrief(brief)}
                  onSelect={() => setCommandBrief(brief)}
                  viewMode={viewMode}
                />
              ))}

              {!filteredBriefs.length && (
                <div className="rounded-[1.35rem] border border-dashed border-[var(--glass-border)] bg-[var(--surface)] p-8 text-center xl:col-span-2">
                  <p className="text-[1rem] font-medium text-[var(--on-surface)]">
                    No briefs match this view
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
                    Clear the search, switch stage filters, or create a new
                    brief from the top action.
                  </p>
                </div>
              )}
            </div>

            {filteredBriefs.length > briefPageSize && (
              <BriefPagination
                page={activePage}
                pageSize={briefPageSize}
                total={filteredBriefs.length}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="grid gap-6">
        <SectionHeader
          eyebrow="Observability"
          description="Brief volume, time-to-match, and active stage distribution for demand planning."
          title="Brief Analytics"
        />
        <div className="grid items-stretch gap-5 lg:grid-cols-3">
          <AnalyticsCard
            chart={
              <DashboardLineChart
                data={[5, 8, 7, 9, 11, 9, briefs.length]}
                height={310}
                variant="area"
              />
            }
            description="Weekly submissions across active and archived briefs."
            metric={String(briefs.length)}
            metricLabel="current"
            title="Brief volume"
          />
          <AnalyticsCard
            chart={
              <DashboardBarChart
                data={[8.2, 7.5, 6.8, 6.1, 5.4, 4.2]}
                height={310}
              />
            }
            description="Average days from submitted to first strong match."
            metric="4.2d"
            metricLabel="latest"
            title="Time to match"
          />
          <AnalyticsCard
            chart={
              <DashboardDonutChart
                data={statusOrder
                  .filter((status) => status !== "closed")
                  .map((status) => ({
                    label: statusMeta[status].label,
                    tone:
                      status === "shortlisted"
                        ? "success"
                        : status === "submitted"
                          ? "primary"
                          : status === "under_review"
                            ? "secondary"
                            : "muted",
                    value: briefs.filter((brief) => brief.status === status)
                      .length,
                  }))}
                height={250}
                legend="inline"
                thickness="slim"
              />
            }
            description="Distribution of active briefs by operational stage."
            metric={String(stats.queueCount)}
            metricLabel="active"
            title="Status split"
          />
        </div>
      </section>

      <CreateBriefModal
        onClose={() => setCreateOpen(false)}
        onSubmit={upsertBrief}
        open={createOpen}
      />

      <BriefCommandModal
        brief={commandBrief}
        candidates={commandCandidates}
        onAdvance={commandBrief ? () => advanceBrief(commandBrief) : undefined}
        onArchive={
          commandBrief
            ? () => {
                setConfirmBrief(commandBrief);
                setCommandBrief(null);
              }
            : undefined
        }
        onClose={() => setCommandBrief(null)}
        onInspect={
          commandBrief
            ? () => {
                setDrawerBrief(commandBrief);
                setCommandBrief(null);
              }
            : undefined
        }
        onPropose={
          commandBrief ? () => proposeShortlist(commandBrief) : undefined
        }
        onUpdateNotes={updateNotes}
      />

      <EntityDrawer
        onClose={() => setDrawerBrief(null)}
        open={Boolean(drawerBrief)}
        title={drawerBrief?.title ?? "Brief details"}
      >
        {drawerBrief && (
          <BriefDrawerContent
            brief={drawerBrief}
            candidates={getCandidatesForBrief(drawerBrief)}
            onAdvance={() => advanceBrief(drawerBrief)}
            onPropose={() => proposeShortlist(drawerBrief)}
            onUpdateNotes={updateNotes}
          />
        )}
      </EntityDrawer>

      <ConfirmDialog
        confirmLabel="Archive brief"
        description={`This removes ${confirmBrief?.title ?? "the brief"} from the active queue while keeping the future audit trail pattern intact.`}
        onCancel={() => setConfirmBrief(null)}
        onConfirm={archiveBrief}
        open={Boolean(confirmBrief)}
        title="Archive this brief?"
      />
    </div>
  );
}

function BriefToolbar({
  query,
  setQuery,
  setSortKey,
  setStatusFilter,
  setViewMode,
  sortKey,
  statusFilter,
  viewMode,
}: {
  query: string;
  setQuery: (value: string) => void;
  setSortKey: (value: SortKey) => void;
  setStatusFilter: (value: BriefStatus | "all") => void;
  setViewMode: (value: ViewMode) => void;
  sortKey: SortKey;
  statusFilter: BriefStatus | "all";
  viewMode: ViewMode;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
      <label className="relative min-w-0">
        <span className="sr-only">Search briefs</span>
        <IconSearch
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]"
          size={17}
          stroke={1.7}
        />
        <input
          className="h-12 w-full rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-10 pr-4 text-[0.95rem] text-[var(--on-surface)] outline-none transition-colors placeholder:text-[var(--on-surface-dim)] focus:border-[var(--secondary)]"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search briefs, clients, stacks, owners..."
          value={query}
        />
      </label>
      <SelectControl
        icon={<IconBriefcase size={16} stroke={1.7} />}
        label="Stage"
        onChange={(value) => setStatusFilter(value as BriefStatus | "all")}
        value={statusFilter}
      >
        <option value="all">All stages</option>
        {queueStatusOrder.map((status) => (
          <option key={status} value={status}>
            {statusMeta[status].label}
          </option>
        ))}
      </SelectControl>
      <SelectControl
        icon={<IconAdjustmentsHorizontal size={16} stroke={1.7} />}
        label="Sort"
        onChange={(value) => setSortKey(value as SortKey)}
        value={sortKey}
      >
        <option value="priority">Priority</option>
        <option value="sla">SLA pressure</option>
        <option value="budget">Budget</option>
        <option value="recent">Newest</option>
      </SelectControl>
      <div className="flex w-fit items-center rounded-full border border-[var(--glass-border)] p-1">
        <ViewButton
          active={viewMode === "grid"}
          label="Grid view"
          onClick={() => setViewMode("grid")}
        >
          <IconLayoutGrid size={15} stroke={1.7} />
        </ViewButton>
        <ViewButton
          active={viewMode === "list"}
          label="List view"
          onClick={() => setViewMode("list")}
        >
          <IconListDetails size={15} stroke={1.7} />
        </ViewButton>
      </div>
    </div>
  );
}

function ViewButton({
  active,
  children,
  label,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "grid h-9 w-9 cursor-pointer place-items-center rounded-full transition-colors duration-200",
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

function SelectControl({
  children,
  icon,
  label,
  onChange,
  value,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]">
        {icon}
      </span>
      <select
        className="h-12 w-full cursor-pointer appearance-none rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-10 pr-9 text-[0.92rem] text-[var(--on-surface)] outline-none focus:border-[var(--secondary)] lg:w-44"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}

function PipelineStageStrip({
  activeStatus,
  briefs,
  onSelect,
}: {
  activeStatus: BriefStatus | "all";
  briefs: BriefRecord[];
  onSelect: (status: BriefStatus | "all") => void;
}) {
  return (
    <div className="grid gap-3 border-y border-[var(--glass-border)] py-5 sm:grid-cols-2 xl:grid-cols-4">
      {queueStatusOrder.map((status) => {
        const count = briefs.filter((brief) => brief.status === status).length;
        const active = activeStatus === status;
        return (
          <button
            className={cn(
              "min-w-0 cursor-pointer rounded-2xl border p-4 text-left transition-colors duration-200",
              active
                ? "border-[color-mix(in_srgb,var(--primary)_34%,transparent)] bg-[color-mix(in_srgb,var(--primary)_7%,transparent)]"
                : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[color-mix(in_srgb,var(--primary)_22%,var(--glass-border))]",
            )}
            key={status}
            onClick={() => onSelect(active ? "all" : status)}
            type="button"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-[0.92rem] font-medium text-[var(--on-surface)]">
                {statusMeta[status].label}
              </p>
              <span className="font-mono text-[1.15rem] text-[var(--on-surface)]">
                {count}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
              <span
                className={cn(
                  "block h-full rounded-full",
                  status === "shortlisted" && "bg-[var(--tertiary)]",
                  status === "submitted" &&
                    "bg-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]",
                  status !== "shortlisted" &&
                    status !== "submitted" &&
                    "bg-[var(--primary)]",
                )}
                style={{ width: `${Math.min(count * 22, 100)}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function BriefQueueCard({
  active,
  brief,
  onAdvance,
  onArchive,
  onInspect,
  onSelect,
  viewMode,
}: {
  active: boolean;
  brief: BriefRecord;
  onAdvance: () => void;
  onArchive: () => void;
  onInspect: () => void;
  onSelect: () => void;
  viewMode: ViewMode;
}) {
  const sla = getSlaInfo(brief);
  const next = statusMeta[brief.status].next;
  const priority = getPriorityMeta(brief.priority);
  const queueIndex = queueStatusOrder.indexOf(brief.status);
  const candidates = getCandidatesForBrief(brief);
  const activeMatches = candidates.length;

  return (
    <article
      className={cn(
        "group relative min-w-0 overflow-hidden rounded-[1.35rem] border transition-all duration-200 hover:-translate-y-px",
        active
          ? "border-[color-mix(in_srgb,var(--primary)_38%,var(--glass-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_8%,var(--surface)),var(--surface))] shadow-[0_18px_50px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]"
          : "border-[var(--glass-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-high)_28%,var(--surface)),var(--surface))] hover:border-[color-mix(in_srgb,var(--primary)_22%,var(--glass-border))]",
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-5 left-0 w-1 rounded-r-full"
        style={{ background: priority.color }}
      />
      <button
        className="block w-full min-w-0 cursor-pointer p-5 text-left lg:p-6"
        onClick={onSelect}
        type="button"
      >
        <span
          className={cn(
            "grid min-w-0 gap-5",
            viewMode === "list" &&
              "lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.46fr)] lg:items-start",
          )}
        >
          <span className="min-w-0">
            <span className="flex items-start justify-between gap-4">
              <span className="flex min-w-0 items-start gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--primary)_18%,transparent)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] text-[var(--primary)]">
                  <IconFileText size={20} stroke={1.7} />
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <h3 className="min-w-0 break-words text-[1.02rem] font-medium leading-snug text-[var(--on-surface)] sm:text-[1.08rem]">
                      {brief.title}
                    </h3>
                  </span>
                  <span className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge
                      label={statusMeta[brief.status].label}
                      tone={statusMeta[brief.status].tone}
                    />
                    <span
                      className="rounded-full px-2.5 py-1 font-mono text-[0.68rem]"
                      style={{
                        background: priority.bg,
                        color: priority.color,
                      }}
                    >
                      P{brief.priority}
                    </span>
                  </span>
                </span>
              </span>
              <HealthGauge score={brief.healthScore} />
            </span>

            <span className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.84rem] text-[var(--on-surface-dim)]">
              <span className="inline-flex items-center gap-1.5">
                <IconBuilding size={14} stroke={1.7} />
                {brief.client}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconCode size={14} stroke={1.7} />
                {brief.domain}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconCalendarEvent size={14} stroke={1.7} />
                {brief.timeline}
              </span>
            </span>

            <span className="mt-4 flex flex-wrap gap-1.5">
              {brief.stack.slice(0, viewMode === "list" ? 6 : 4).map((tag) => (
                <span
                  className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2.5 py-1 text-[0.72rem] text-[var(--on-surface-dim)]"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </span>
          </span>

          <span className="grid min-w-0 gap-4">
            <span className="grid grid-cols-3 overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_78%,transparent)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--on-surface)_7%,transparent)]">
              <BriefSignalCell label="SLA" value={sla.label} />
              <BriefSignalCell
                label="Quality"
                tone={brief.healthScore >= 78 ? "success" : "default"}
                value={`${brief.healthScore}%`}
              />
              <BriefSignalCell label="Matches" value={String(activeMatches)} />
            </span>

            <span className="grid gap-3 sm:grid-cols-2">
              <BriefProgressBar
                label="Brief path"
                detail={`${queueIndex + 1}/${queueStatusOrder.length}`}
                value={Math.round(
                  ((queueIndex + 1) / queueStatusOrder.length) * 100,
                )}
                tone="var(--primary)"
              />
              <BriefProgressBar
                label="SLA pressure"
                detail={`${brief.hoursInStage}h in stage`}
                value={sla.percent}
                tone={sla.overdue ? "var(--error)" : "var(--tertiary)"}
              />
            </span>

            <span className="grid gap-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
              <span className="flex items-center justify-between gap-3 text-[0.82rem]">
                <span className="text-[var(--on-surface-dim)]">Owner</span>
                <span className="truncate font-medium text-[var(--on-surface)]">
                  {brief.owner}
                </span>
              </span>
              <span className="flex items-center justify-between gap-3 text-[0.82rem]">
                <span className="text-[var(--on-surface-dim)]">Budget</span>
                <span className="font-mono text-[var(--on-surface)]">
                  {formatBudget(brief.budgetMin, brief.budgetMax)}
                </span>
              </span>
              <span className="flex items-center justify-between gap-3 text-[0.82rem]">
                <span className="text-[var(--on-surface-dim)]">Next</span>
                <span className="truncate font-medium text-[var(--on-surface)]">
                  {next ? statusMeta[next].label : "Shortlist workspace"}
                </span>
              </span>
            </span>
          </span>
        </span>
      </button>

      <div className="flex flex-col gap-3 border-t border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_38%,transparent)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <p className="line-clamp-2 min-w-0 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
          {brief.description}
        </p>
        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <IconButton label={`Inspect ${brief.title}`} onClick={onInspect}>
            <IconArrowRight size={16} stroke={1.8} />
          </IconButton>
          {next && (
            <IconButton label={`Advance ${brief.title}`} onClick={onAdvance}>
              <IconCheck size={16} stroke={1.8} />
            </IconButton>
          )}
          <IconButton
            danger
            label={`Archive ${brief.title}`}
            onClick={onArchive}
          >
            <IconTrash size={16} stroke={1.8} />
          </IconButton>
        </div>
      </div>
    </article>
  );
}

function BriefSignalCell({
  label,
  tone = "default",
  value,
}: {
  label: string;
  tone?: "danger" | "default" | "success";
  value: string;
}) {
  return (
    <span className="min-w-0 border-r border-[var(--glass-border)] px-3 py-3 last:border-r-0">
      <span
        className={cn(
          "block truncate font-mono text-[1rem] leading-none text-[var(--on-surface)]",
          tone === "danger" && "text-[var(--error)]",
          tone === "success" && "text-[var(--tertiary)]",
        )}
      >
        {value}
      </span>
      <span className="mt-1.5 block truncate text-[0.68rem] uppercase tracking-[0.08em] text-[var(--on-surface-dim)]">
        {label}
      </span>
    </span>
  );
}

function BriefProgressBar({
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
    <span className="min-w-0">
      <span className="flex items-center justify-between gap-3">
        <span className="truncate text-[0.78rem] font-medium text-[var(--on-surface)]">
          {label}
        </span>
        <span className="font-mono text-[0.76rem] text-[var(--on-surface-dim)]">
          {detail}
        </span>
      </span>
      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
        <span
          className="block h-full rounded-full"
          style={{
            background: tone,
            width: `${Math.min(Math.max(value, 0), 100)}%`,
          }}
        />
      </span>
    </span>
  );
}

function BriefPagination({
  onPageChange,
  page,
  pageSize,
  total,
  totalPages,
}: {
  onPageChange: (page: number) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--glass-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-mono text-[0.8rem] text-[var(--on-surface-dim)]">
        Showing {start}-{end} of {total}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="min-h-10 rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] disabled:cursor-not-allowed disabled:opacity-45"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          type="button"
        >
          Previous
        </button>
        <div className="flex items-center gap-1">
          {pages.map((item) => (
            <button
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full border font-mono text-[0.82rem] transition-colors",
                item === page
                  ? "border-[color-mix(in_srgb,var(--primary)_32%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]"
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
        <button
          className="min-h-10 rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] disabled:cursor-not-allowed disabled:opacity-45"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function BriefCommandModal({
  brief,
  candidates,
  onAdvance,
  onArchive,
  onClose,
  onInspect,
  onPropose,
  onUpdateNotes,
}: {
  brief: BriefRecord | null;
  candidates: EngineerCandidate[];
  onAdvance?: () => void;
  onArchive?: () => void;
  onClose: () => void;
  onInspect?: () => void;
  onPropose?: () => void;
  onUpdateNotes: (briefId: string, notes: string) => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!brief) return;
    closeButtonRef.current?.focus();
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
  }, [brief, onClose]);

  if (!brief) return null;

  return (
    <div
      className="fixed inset-0 z-[85] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_72%,transparent)] px-4 py-8 backdrop-blur-xl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="brief-command-title"
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_30px_110px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--glass-border)] p-5 sm:p-6">
          <div className="min-w-0">
            <p className="label-caps text-[var(--primary)]">Brief command</p>
            <h2
              className="title-serif mt-2 break-words text-[clamp(1.55rem,3.2vw,2rem)] font-medium leading-tight text-[var(--on-surface)]"
              id="brief-command-title"
            >
              Qualify this brief
            </h2>
            <p className="mt-2 max-w-2xl text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">
              Review the operational signals, save admin context, and move the
              brief toward shortlist without taking over the queue layout.
            </p>
          </div>
          <button
            aria-label="Close brief command"
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <IconX size={18} stroke={1.7} />
          </button>
        </div>
        <div className="max-h-[calc(100svh-12rem)] overflow-y-auto p-4 sm:p-6">
          <BriefCommandPanel
            brief={brief}
            candidates={candidates}
            onAdvance={onAdvance}
            onArchive={onArchive}
            onInspect={onInspect}
            onPropose={onPropose}
            onUpdateNotes={onUpdateNotes}
          />
        </div>
      </div>
    </div>
  );
}

function BriefCommandPanel({
  brief,
  candidates,
  onAdvance,
  onArchive,
  onInspect,
  onPropose,
  onUpdateNotes,
}: {
  brief: BriefRecord | null;
  candidates: EngineerCandidate[];
  onAdvance?: () => void;
  onArchive?: () => void;
  onInspect?: () => void;
  onPropose?: () => void;
  onUpdateNotes: (briefId: string, notes: string) => void;
}) {
  const [noteDraft, setNoteDraft] = useState("");

  if (!brief) {
    return (
      <div className="rounded-[1.35rem] border border-dashed border-[var(--glass-border)] bg-[var(--surface)] p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--primary)]">
          <IconGitMerge size={22} stroke={1.7} />
        </div>
        <p className="mt-4 text-[1rem] font-medium text-[var(--on-surface)]">
          Select a brief to qualify
        </p>
        <p className="mx-auto mt-2 max-w-sm text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
          Choose a queue item to inspect requirements, ownership, SLA pressure,
          notes, and shortlist readiness.
        </p>
      </div>
    );
  }

  const sla = getSlaInfo(brief);
  const next = statusMeta[brief.status].next;
  const primaryCandidate = candidates[0];

  return (
    <aside className="overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_7%,transparent)]">
      <div className="border-b border-[var(--glass-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_7%,transparent),transparent_64%)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="label-caps text-[var(--primary)]">Brief command</p>
            <h2 className="title-serif mt-2 break-words text-[1.25rem] font-medium leading-tight text-[var(--on-surface)]">
              {brief.title}
            </h2>
            <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
              {brief.client} / {brief.domain} / {brief.timeline}
            </p>
          </div>
          <StatusBadge
            label={statusMeta[brief.status].label}
            tone={statusMeta[brief.status].tone}
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[0.8fr_1fr]">
          <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
            <p className="font-mono text-[2.4rem] leading-none text-[var(--on-surface)]">
              {brief.healthScore}
            </p>
            <p className="mt-1 text-[0.78rem] text-[var(--on-surface-dim)]">
              requirement quality
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
              <span
                className={cn(
                  "block h-full rounded-full",
                  brief.healthScore >= 78
                    ? "bg-[var(--tertiary)]"
                    : "bg-[var(--primary)]",
                )}
                style={{ width: `${brief.healthScore}%` }}
              />
            </div>
          </div>
          <div className="grid gap-3">
            <InfoTile
              label="Budget"
              value={formatBudget(brief.budgetMin, brief.budgetMax)}
            />
            <InfoTile
              label="SLA"
              tone={sla.overdue ? "danger" : "default"}
              value={sla.label}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5">
        <section>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.98rem] font-medium text-[var(--on-surface)]">
              Qualification signals
            </p>
            <span className="font-mono text-[0.76rem] text-[var(--on-surface-dim)]">
              {brief.requirements.length} requirements
            </span>
          </div>
          <div className="mt-3 grid gap-2">
            {[
              {
                detail: `${brief.healthScore}% quality with ${brief.requirements.length} captured requirements`,
                done: brief.healthScore >= 72,
                label: "Demand quality captured",
              },
              {
                detail: `${candidates.length} candidate signal${candidates.length === 1 ? "" : "s"} mapped to this brief`,
                done: candidates.length > 0,
                label: "Shortlist signal available",
              },
              {
                detail: `${formatBudget(brief.budgetMin, brief.budgetMax)} and ${brief.hoursPerWeek}h/wk expectation`,
                done: brief.budgetMax > brief.budgetMin,
                label: "Commercial context captured",
              },
              {
                detail:
                  brief.status === "shortlisted"
                    ? "Ready to continue in the shortlist workspace"
                    : `Current stage is ${statusMeta[brief.status].label.toLowerCase()}`,
                done: brief.status === "shortlisted",
                label: "Shortlist handoff ready",
              },
              {
                detail: sla.overdue
                  ? "SLA needs admin attention"
                  : `${sla.label} before SLA breach`,
                done: !sla.overdue,
                label: "SLA under control",
              },
            ].map((item) => (
              <div
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3"
                key={item.label}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-full border",
                    item.done
                      ? "border-[color-mix(in_srgb,var(--tertiary)_34%,transparent)] text-[var(--tertiary)]"
                      : "border-[color-mix(in_srgb,var(--error)_30%,transparent)] text-[var(--error)]",
                  )}
                >
                  {item.done ? (
                    <IconCheck size={13} stroke={1.8} />
                  ) : (
                    <IconClock size={13} stroke={1.8} />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.86rem] font-medium text-[var(--on-surface)]">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-[0.78rem] leading-relaxed text-[var(--on-surface-dim)]">
                    {item.detail}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.98rem] font-medium text-[var(--on-surface)]">
              Candidate signals
            </p>
            <span className="font-mono text-[0.76rem] text-[var(--on-surface-dim)]">
              {candidates.length} options
            </span>
          </div>
          {primaryCandidate ? (
            <div className="rounded-[1.15rem] border border-[color-mix(in_srgb,var(--tertiary)_24%,var(--glass-border))] bg-[color-mix(in_srgb,var(--tertiary)_7%,var(--glass-bg))] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[1rem] font-medium text-[var(--on-surface)]">
                    {primaryCandidate.name}
                  </p>
                  <p className="mt-1 truncate text-[0.82rem] text-[var(--on-surface-dim)]">
                    {primaryCandidate.role} / {primaryCandidate.location}
                  </p>
                </div>
                <span className="rounded-full bg-[color-mix(in_srgb,var(--tertiary)_12%,transparent)] px-3 py-1 font-mono text-[0.82rem] text-[var(--tertiary)]">
                  {primaryCandidate.score}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <InfoTile label="Score" value={`${primaryCandidate.score}%`} />
                <InfoTile
                  label="Avail"
                  value={titleCase(primaryCandidate.availability)}
                />
                <InfoTile
                  label="Skills"
                  value={String(primaryCandidate.skills.length)}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--glass-border)] p-5">
              <p className="text-[0.94rem] font-medium text-[var(--on-surface)]">
                No candidate signals yet
              </p>
              <p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
                Prepare shortlist inputs after the brief is clarified. The
                shortlist workspace owns candidate slate decisions.
              </p>
            </div>
          )}
          {candidates.slice(1, 3).map((candidate) => (
            <CandidateCard candidate={candidate} key={candidate.id} />
          ))}
        </section>

        <label>
          <span className="text-[0.92rem] font-medium text-[var(--on-surface)]">
            Admin note
          </span>
          <textarea
            className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.92rem] leading-relaxed text-[var(--on-surface)] outline-none focus:border-[var(--secondary)]"
            onChange={(event) => setNoteDraft(event.target.value)}
            placeholder={
              brief.adminNotes ||
              "Capture brief risks, missing requirements, client context, and shortlist notes..."
            }
            value={noteDraft}
          />
        </label>
        <button
          className="min-h-10 w-fit cursor-pointer rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] transition-colors hover:bg-[var(--glass-bg)]"
          onClick={() => {
            onUpdateNotes(brief.id, noteDraft || brief.adminNotes);
            setNoteDraft("");
          }}
          type="button"
        >
          Save note
        </button>

        <div className="grid gap-2 border-t border-[var(--glass-border)] pt-5">
          <button
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.9rem] font-medium text-[var(--bg)]"
            onClick={onPropose ?? onAdvance}
            type="button"
          >
            <IconUsers size={16} stroke={1.8} />
            Prepare shortlist
          </button>
          {brief.status === "shortlisted" && (
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.9rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]"
              href="/admin/briefs/shortlist"
            >
              Open shortlist workspace
              <IconArrowRight size={15} stroke={1.8} />
            </Link>
          )}
          <div className="grid gap-2 sm:grid-cols-3 2xl:grid-cols-1">
            <SecondaryButton onClick={onInspect}>
              <IconArrowRight size={15} stroke={1.8} />
              Details
            </SecondaryButton>
            {next && (
              <SecondaryButton onClick={onAdvance}>
                <IconCheck size={15} stroke={1.8} />
                Advance
              </SecondaryButton>
            )}
            <SecondaryButton danger onClick={onArchive}>
              <IconTrash size={15} stroke={1.8} />
              Archive
            </SecondaryButton>
          </div>
        </div>
      </div>
    </aside>
  );
}

function CreateBriefModal({
  onClose,
  onSubmit,
  open,
}: {
  onClose: () => void;
  onSubmit: (brief: BriefRecord) => void;
  open: boolean;
}) {
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    budgetMax: "10000",
    budgetMin: "7000",
    client: "",
    description: "",
    hoursPerWeek: "32",
    owner: "Dennis",
    seniority: "senior" as Seniority,
    stack: "",
    timeline: "Start within 2 weeks",
    title: "",
  });

  const set =
    (key: keyof typeof form) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  useEffect(() => {
    if (!open) return;
    firstFieldRef.current?.focus();
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

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const stack = form.stack
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    onSubmit({
      adminNotes: "Created from admin demand intake.",
      budgetMax: Number(form.budgetMax) || 10000,
      budgetMin: Number(form.budgetMin) || 7000,
      client: form.client.trim() || "New client",
      clientTier: "prospect",
      description:
        form.description.trim() || "New brief awaiting admin qualification.",
      domain:
        stack.includes("Python") || stack.includes("RAG")
          ? "AI / ML"
          : "Engineering",
      healthScore: 64,
      hoursInStage: 0,
      hoursPerWeek: Number(form.hoursPerWeek) || 32,
      id: `brief-${Date.now()}`,
      matchCount: 0,
      owner: form.owner.trim() || "Unassigned",
      priority: 62,
      requirements: stack.slice(0, 4),
      seniority: form.seniority,
      slaLimitHours: 24,
      stack: stack.length ? stack : ["Discovery"],
      stageEnteredAt: new Date().toISOString(),
      status: "submitted",
      submittedAt: new Date().toISOString(),
      timeline: form.timeline.trim() || "TBD",
      title: form.title.trim() || "New hiring brief",
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-8 backdrop-blur-xl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-brief-title"
    >
      <form
        className="relative flex max-h-[calc(100svh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_30px_110px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:max-h-[calc(100svh-4rem)]"
        onSubmit={submit}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--glass-border)] p-5 sm:p-6">
          <div>
            <p className="label-caps text-[var(--primary)]">Demand intake</p>
            <h2
              id="create-brief-title"
              className="title-serif mt-2 text-[clamp(1.62rem,3.2vw,2.05rem)] font-medium leading-tight text-[var(--on-surface)]"
            >
              New hiring brief
            </h2>
            <p className="mt-2 max-w-2xl text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">
              Create a structured demand record with enough signal for review,
              SLA tracking, and matching.
            </p>
          </div>
          <button
            aria-label="Close modal"
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
            onClick={onClose}
            type="button"
          >
            <IconX size={18} stroke={1.7} />
          </button>
        </div>

        <div className="grid flex-1 gap-6 overflow-y-auto p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid content-start gap-4 sm:grid-cols-2">
            <Field label="Brief title" required>
              <input
                ref={firstFieldRef}
                className={inputClass}
                onChange={set("title")}
                placeholder="Senior AI Engineer for RAG workflow"
                required
                value={form.title}
              />
            </Field>
            <Field label="Client name" required>
              <input
                className={inputClass}
                onChange={set("client")}
                placeholder="Kijani Analytics"
                required
                value={form.client}
              />
            </Field>
            <Field label="Seniority">
              <select
                className={inputClass}
                onChange={set("seniority")}
                value={form.seniority}
              >
                {(["mid", "senior", "lead", "principal"] as Seniority[]).map(
                  (seniority) => (
                    <option key={seniority} value={seniority}>
                      {titleCase(seniority)}
                    </option>
                  ),
                )}
              </select>
            </Field>
            <Field label="Stack">
              <input
                className={inputClass}
                onChange={set("stack")}
                placeholder="Python, RAG, FastAPI, Postgres"
                value={form.stack}
              />
            </Field>
            <Field label="Budget min">
              <input
                className={inputClass}
                min={0}
                onChange={set("budgetMin")}
                type="number"
                value={form.budgetMin}
              />
            </Field>
            <Field label="Budget max">
              <input
                className={inputClass}
                min={0}
                onChange={set("budgetMax")}
                type="number"
                value={form.budgetMax}
              />
            </Field>
            <Field label="Hours per week">
              <input
                className={inputClass}
                min={1}
                onChange={set("hoursPerWeek")}
                type="number"
                value={form.hoursPerWeek}
              />
            </Field>
            <Field label="Timeline">
              <input
                className={inputClass}
                onChange={set("timeline")}
                value={form.timeline}
              />
            </Field>
            <label className="sm:col-span-2">
              <span className="text-[0.88rem] font-medium text-[var(--on-surface)]">
                Brief description
              </span>
              <textarea
                className="mt-2 min-h-36 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.92rem] leading-relaxed text-[var(--on-surface)] outline-none focus:border-[var(--secondary)]"
                onChange={set("description")}
                placeholder="What needs to be built, owned, clarified, or staffed?"
                value={form.description}
              />
            </label>
          </div>
          <aside className="rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
            <p className="text-[1rem] font-medium text-[var(--on-surface)]">
              Intake quality
            </p>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
              Capture enough signal for review, SLA tracking, and shortlist prep
              without opening a second workflow.
            </p>
            <div className="my-8 grid gap-3">
              <InfoTile label="Initial stage" value="Submitted" />
              <InfoTile label="Default SLA" value="24h" />
              <InfoTile label="Initial health" value="64" />
            </div>
          </aside>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[var(--glass-border)] p-5 sm:flex-row sm:justify-end sm:p-6">
          <button
            className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.9rem] font-medium text-[var(--on-surface)]"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-5 text-[0.9rem] font-medium text-[var(--bg)]"
            type="submit"
          >
            Create brief
          </button>
        </div>
      </form>
    </div>
  );
}

function BriefDrawerContent({
  brief,
  candidates,
  onAdvance,
  onPropose,
  onUpdateNotes,
}: {
  brief: BriefRecord;
  candidates: EngineerCandidate[];
  onAdvance: () => void;
  onPropose: () => void;
  onUpdateNotes: (briefId: string, notes: string) => void;
}) {
  const [notes, setNotes] = useState(brief.adminNotes);
  const sla = getSlaInfo(brief);
  const next = statusMeta[brief.status].next;

  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <StatusBadge
              label={statusMeta[brief.status].label}
              tone={statusMeta[brief.status].tone}
            />
            <h3 className="mt-3 break-words text-[1.35rem] font-medium leading-tight text-[var(--on-surface)]">
              {brief.title}
            </h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-[var(--on-surface-dim)]">
              {brief.description}
            </p>
          </div>
          <HealthGauge score={brief.healthScore} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoTile label="Client" value={brief.client} />
        <InfoTile
          label="Budget"
          value={formatBudget(brief.budgetMin, brief.budgetMax)}
        />
        <InfoTile
          label="SLA"
          tone={sla.overdue ? "danger" : "default"}
          value={sla.label}
        />
        <InfoTile
          label="Priority"
          tone={priorityTone(brief.priority)}
          value={String(brief.priority)}
        />
      </div>

      <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-5">
        <p className="text-[1rem] font-medium text-[var(--on-surface)]">
          Stage timeline
        </p>
        <BriefTimeline status={brief.status} />
      </div>

      <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-5">
        <p className="text-[1rem] font-medium text-[var(--on-surface)]">
          Requirements
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {brief.requirements.map((requirement) => (
            <div
              className="flex items-center gap-2 text-[0.9rem] text-[var(--on-surface-dim)]"
              key={requirement}
            >
              <IconCheck
                className="shrink-0 text-[var(--secondary)]"
                size={15}
                stroke={1.8}
              />
              {requirement}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[1rem] font-medium text-[var(--on-surface)]">
              Recommended engineers
            </p>
            <p className="mt-1 text-[0.88rem] text-[var(--on-surface-dim)]">
              Current shortlist candidates for this demand shape.
            </p>
          </div>
          <button
            className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]"
            onClick={onPropose}
            type="button"
          >
            <IconGitMerge size={15} stroke={1.8} />
            Prep shortlist
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {candidates.length ? (
            candidates.map((candidate) => (
              <CandidateCard candidate={candidate} key={candidate.id} />
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-[var(--glass-border)] p-5 text-[0.9rem] text-[var(--on-surface-dim)]">
              No recommended engineers yet. Prepare shortlist to move this into
              matching.
            </p>
          )}
        </div>
      </div>

      <label className="rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-5">
        <span className="text-[1rem] font-medium text-[var(--on-surface)]">
          Admin note
        </span>
        <textarea
          className="mt-3 min-h-32 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.92rem] leading-relaxed text-[var(--on-surface)] outline-none focus:border-[var(--secondary)]"
          onChange={(event) => setNotes(event.target.value)}
          value={notes}
        />
        <button
          className="mt-3 min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)]"
          onClick={() => onUpdateNotes(brief.id, notes)}
          type="button"
        >
          Save note
        </button>
      </label>

      {next ? (
        <button
          className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-5 text-[0.9rem] font-medium text-[var(--bg)]"
          onClick={onAdvance}
          type="button"
        >
          <IconCheck size={16} stroke={1.8} />
          Advance to {statusMeta[next].label}
        </button>
      ) : (
        <Link
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-5 text-[0.9rem] font-medium text-[var(--bg)]"
          href="/admin/briefs/shortlist"
        >
          Open shortlist workspace
          <IconArrowRight size={15} stroke={1.8} />
        </Link>
      )}
    </div>
  );
}

function AnalyticsCard({
  chart,
  description,
  metric,
  metricLabel,
  title,
}: {
  chart: React.ReactNode;
  description: string;
  metric: string;
  metricLabel: string;
  title: string;
}) {
  return (
    <article className="flex min-h-[31rem] flex-col overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_28%,var(--surface)),var(--surface))] shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]">
      <div className="flex min-h-[7.5rem] items-start justify-between gap-4 border-b border-[color-mix(in_srgb,var(--glass-border)_64%,transparent)] p-5 sm:p-6">
        <div className="min-w-0">
          <p className="text-[1rem] font-medium text-[var(--on-surface)]">
            {title}
          </p>
          <p className="mt-2 max-w-md text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
            {description}
          </p>
        </div>
        <div className="shrink-0 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-right">
          <p className="font-mono text-[1.05rem] leading-none text-[var(--on-surface)]">
            {metric}
          </p>
          <p className="mt-1 text-[0.66rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">
            {metricLabel}
          </p>
        </div>
      </div>
      <div className="grid min-h-0 flex-1 p-4 sm:p-5">
        <div className="grid min-h-[20.5rem] w-full place-items-stretch rounded-[1.1rem] border border-[color-mix(in_srgb,var(--glass-border)_68%,transparent)] bg-[color-mix(in_srgb,var(--surface)_62%,transparent)] p-3">
          <div className="min-h-0 w-full">{chart}</div>
        </div>
      </div>
    </article>
  );
}

function CandidateCard({ candidate }: { candidate: EngineerCandidate }) {
  return (
    <article className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[0.98rem] font-medium text-[var(--on-surface)]">
            {candidate.name}
          </p>
          <p className="mt-1 text-[0.84rem] text-[var(--on-surface-dim)]">
            {candidate.role} / {candidate.location}
          </p>
        </div>
        <span className="rounded-full bg-[color-mix(in_srgb,var(--primary)_9%,transparent)] px-3 py-1 font-mono text-[0.86rem] text-[var(--primary)]">
          {candidate.score}
        </span>
      </div>
      <div className="mt-4 grid gap-2">
        {Object.entries(candidate.dimensions).map(([label, value]) => (
          <div
            className="grid grid-cols-[5.5rem_minmax(0,1fr)_2rem] items-center gap-2"
            key={label}
          >
            <span className="text-[0.78rem] capitalize text-[var(--on-surface-dim)]">
              {label}
            </span>
            <span className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
              <span
                className="block h-full rounded-full bg-[var(--primary)]"
                style={{ width: `${value}%` }}
              />
            </span>
            <span className="font-mono text-[0.78rem] text-[var(--on-surface-dim)]">
              {value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {candidate.skills.map((skill) => (
          <span
            className="rounded-full border border-[var(--glass-border)] px-2 py-1 text-[0.74rem] text-[var(--on-surface-dim)]"
            key={skill}
          >
            {skill}
          </span>
        ))}
      </div>
    </article>
  );
}

function BriefTimeline({ status }: { status: BriefStatus }) {
  const currentIndex = statusOrder.indexOf(status);
  return (
    <div className="my-8 grid gap-3 sm:grid-cols-5">
      {statusOrder.map((item, index) => {
        const complete = index < currentIndex;
        const current = index === currentIndex;
        return (
          <div className="min-w-0" key={item}>
            <div
              className={cn(
                "h-1.5 rounded-full",
                complete || current
                  ? current
                    ? "bg-[var(--tertiary)]"
                    : "bg-[var(--primary)]"
                  : "bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]",
              )}
            />
            <p
              className={cn(
                "mt-2 text-[0.82rem]",
                current
                  ? "font-medium text-[var(--on-surface)]"
                  : "text-[var(--on-surface-dim)]",
              )}
            >
              {statusMeta[item].label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function HealthGauge({ score }: { score: number }) {
  return (
    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)]">
      <div className="text-center">
        <p className="font-mono text-[1.1rem] leading-none text-[var(--on-surface)]">
          {score}
        </p>
        <p className="mt-1 text-[0.68rem] text-[var(--on-surface-dim)]">
          health
        </p>
      </div>
    </div>
  );
}

function InfoTile({
  label,
  tone = "default",
  value,
}: {
  label: string;
  tone?: "danger" | "default" | "success";
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
      <p className="text-[0.8rem] text-[var(--on-surface-dim)]">{label}</p>
      <p
        className={cn(
          "mt-2 break-words font-mono text-[1rem] text-[var(--on-surface)]",
          tone === "danger" && "text-[var(--error)]",
          tone === "success" && "text-[var(--tertiary)]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function IconButton({
  children,
  danger = false,
  label,
  onClick,
}: {
  children: React.ReactNode;
  danger?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors hover:text-[var(--on-surface)]",
        danger &&
          "border-[color-mix(in_srgb,var(--error)_28%,transparent)] text-[var(--error)]",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  danger = false,
  onClick,
}: {
  children: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]",
        danger &&
          "border-[color-mix(in_srgb,var(--error)_28%,transparent)] text-[var(--error)]",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function Field({
  children,
  label,
  required = false,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="text-[0.88rem] font-medium text-[var(--on-surface)]">
        {label}
        {required && <span className="ml-1 text-[var(--error)]">*</span>}
      </span>
      {children}
    </label>
  );
}

function SectionHeader({
  action,
  description,
  eyebrow,
  title,
}: {
  action?: React.ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 border-b border-[color-mix(in_srgb,var(--glass-border)_62%,transparent)] pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="label-caps text-[var(--primary)]">{eyebrow}</p>
        )}
        <h2
          className={cn(
            "title-serif text-[clamp(1.48rem,2vw,1.9rem)] font-medium leading-tight text-[var(--on-surface)]",
            eyebrow && "mt-2",
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-3xl text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 text-[0.92rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--secondary)]";

function buildBriefStats(briefs: BriefRecord[]) {
  const openBriefs = briefs.filter((brief) => brief.status !== "closed").length;
  const queueBriefs = briefs.filter((brief) =>
    queueStatusOrder.includes(brief.status),
  );
  const reviewQueue = briefs.filter(
    (brief) => brief.status === "submitted" || brief.status === "under_review",
  ).length;
  const slaRisk = queueBriefs.filter((brief) => {
    const sla = getSlaInfo(brief);
    return sla.overdue || sla.percent >= 80;
  }).length;
  const readyToMatch = briefs.filter(
    (brief) => brief.status === "matching" || brief.status === "shortlisted",
  ).length;
  const shortlistedCount = briefs.filter(
    (brief) => brief.status === "shortlisted",
  ).length;
  const totalMatches = briefs.reduce((sum, brief) => sum + brief.matchCount, 0);
  const avgHealth = Math.round(
    briefs.reduce((sum, brief) => sum + brief.healthScore, 0) /
      Math.max(briefs.length, 1),
  );
  const avgSlaUse = Math.round(
    briefs
      .filter((brief) => brief.slaLimitHours > 0)
      .reduce(
        (sum, brief) =>
          sum + Math.min((brief.hoursInStage / brief.slaLimitHours) * 100, 100),
        0,
      ) / Math.max(briefs.filter((brief) => brief.slaLimitHours > 0).length, 1),
  );

  return {
    avgHealth,
    avgSlaUse,
    openBriefs,
    queueCount: queueBriefs.length,
    readyToMatch,
    reviewQueue,
    shortlistedCount,
    slaRisk,
    totalMatches,
  };
}

function getCandidatesForBrief(brief: BriefRecord) {
  const mapped = candidateMap[brief.id]
    ?.map((id) => candidatePool.find((candidate) => candidate.id === id))
    .filter(Boolean) as EngineerCandidate[] | undefined;
  if (mapped?.length) return mapped;
  return candidatePool
    .filter((candidate) =>
      candidate.skills.some((skill) => brief.stack.includes(skill)),
    )
    .slice(0, 2);
}

function getSlaInfo(brief: BriefRecord) {
  if (!brief.slaLimitHours) return { label: "N/A", overdue: false, percent: 0 };
  const percent = Math.round(
    Math.min((brief.hoursInStage / brief.slaLimitHours) * 100, 100),
  );
  const remaining = brief.slaLimitHours - brief.hoursInStage;
  if (remaining < 0) return { label: "Overdue", overdue: true, percent: 100 };
  return { label: `${remaining}h left`, overdue: false, percent };
}

function formatBudget(min: number, max: number) {
  return `$${formatShortNumber(min)}-${formatShortNumber(max)}`;
}

function formatShortNumber(value: number) {
  if (value >= 1000)
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return String(value);
}

function priorityTone(priority: number): "danger" | "default" | "success" {
  if (priority >= 84) return "danger";
  if (priority >= 70) return "success";
  return "default";
}

function getPriorityMeta(priority: number) {
  const tone = priorityTone(priority);
  if (tone === "danger") {
    return {
      bg: "color-mix(in_srgb,var(--error)_10%,transparent)",
      color: "var(--error)",
      tone,
    };
  }
  if (tone === "success") {
    return {
      bg: "color-mix(in_srgb,var(--tertiary)_10%,transparent)",
      color: "var(--tertiary)",
      tone,
    };
  }
  return {
    bg: "color-mix(in_srgb,var(--primary)_10%,transparent)",
    color: "var(--primary)",
    tone,
  };
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");
}
