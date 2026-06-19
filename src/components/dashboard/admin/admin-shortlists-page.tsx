"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import Link from "next/link";
import {
  IconAdjustmentsHorizontal,
  IconArrowRight,
  IconBuilding,
  IconCalendarEvent,
  IconChevronRight,
  IconCheck,
  IconClock,
  IconEye,
  IconFileText,
  IconMapPin,
  IconPlus,
  IconSearch,
  IconSend,
  IconShieldCheck,
  IconSparkles,
  IconStar,
  IconTarget,
  IconTrash,
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
import { KpiCard } from "@/components/dashboard/shared/kpi-card";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { SectionDivider } from "@/components/ui/section-divider";
import { cn } from "@/lib/utils";

type EngineerStatus =
  | "proposed"
  | "client_viewed"
  | "intro_requested"
  | "accepted"
  | "declined";
type ShortlistStatus = "draft" | "sent" | "client_reviewing" | "decided";
type SortKey = "score" | "deadline" | "slots" | "recent";

type Dimensions = {
  availability: number;
  domain: number;
  seniority: number;
  stack: number;
};

type ShortlistEngineer = {
  addedAt: string;
  adminNotes: string;
  availability: "immediate" | "2_weeks" | "1_month";
  dimensions: Dimensions;
  id: string;
  location: string;
  name: string;
  rateUsd: number;
  role: string;
  score: number;
  skills: string[];
  status: EngineerStatus;
  yearsExp: number;
};

type EngagementEvent = {
  actor: "admin" | "client" | "system";
  at: string | null;
  done: boolean;
  id: string;
  label: string;
};

type Shortlist = {
  adminNotes: string;
  adminOwner: string;
  briefTitle: string;
  client: string;
  clientContact: string;
  clientTier: "active" | "expansion" | "prospect";
  domain: string;
  engagementEvents: EngagementEvent[];
  engineers: ShortlistEngineer[];
  id: string;
  maxSlots: number;
  responseDeadline: string;
  sentAt: string | null;
  stack: string[];
  status: ShortlistStatus;
  viewedAt: string | null;
};

const shortlistStatusOrder: ShortlistStatus[] = [
  "draft",
  "sent",
  "client_reviewing",
  "decided",
];

const shortlistStatusMeta: Record<
  ShortlistStatus,
  {
    label: string;
    next: ShortlistStatus | null;
    tone: "active" | "available" | "neutral" | "pending";
  }
> = {
  client_reviewing: {
    label: "Client reviewing",
    next: "decided",
    tone: "active",
  },
  decided: { label: "Decided", next: null, tone: "available" },
  draft: { label: "Draft", next: "sent", tone: "neutral" },
  sent: { label: "Sent", next: "client_reviewing", tone: "pending" },
};

const engineerStatusMeta: Record<
  EngineerStatus,
  {
    label: string;
    next: EngineerStatus | null;
    tone: "active" | "available" | "neutral" | "overdue" | "pending";
  }
> = {
  accepted: { label: "Accepted", next: null, tone: "available" },
  client_viewed: {
    label: "Client viewed",
    next: "intro_requested",
    tone: "active",
  },
  declined: { label: "Declined", next: null, tone: "overdue" },
  intro_requested: {
    label: "Intro requested",
    next: "accepted",
    tone: "active",
  },
  proposed: { label: "Proposed", next: "client_viewed", tone: "neutral" },
};

const initialShortlists: Shortlist[] = [
  {
    adminNotes:
      "Client opened the profiles. Amina is the strongest fit because she has production RAG, evaluation, and support automation depth.",
    adminOwner: "Dennis",
    briefTitle: "Lead AI engineer for support automation",
    client: "Kijani Analytics",
    clientContact: "Wanjiru Mwangi",
    clientTier: "active",
    domain: "AI / ML",
    id: "sl-ai-support",
    maxSlots: 3,
    responseDeadline: "2026-06-01",
    sentAt: "2026-05-27T10:00:00.000Z",
    stack: ["Python", "LangChain", "FastAPI", "Pinecone"],
    status: "client_reviewing",
    viewedAt: "2026-05-28T14:32:00.000Z",
    engineers: [
      {
        addedAt: "2026-05-26T09:00:00.000Z",
        adminNotes:
          "Strongly recommended. Has shipped real support automation workflows with eval loops.",
        availability: "immediate",
        dimensions: { availability: 90, domain: 98, seniority: 92, stack: 96 },
        id: "eng-amina",
        location: "Nairobi, Kenya",
        name: "Amina Otieno",
        rateUsd: 9800,
        role: "AI/ML Lead Engineer",
        score: 94,
        skills: ["Python", "LangChain", "FastAPI", "Pinecone", "RAG"],
        status: "client_viewed",
        yearsExp: 8,
      },
      {
        addedAt: "2026-05-26T09:30:00.000Z",
        adminNotes:
          "Excellent MLOps depth. Good second option if the client wants platform ownership.",
        availability: "2_weeks",
        dimensions: { availability: 82, domain: 86, seniority: 90, stack: 88 },
        id: "eng-nadia",
        location: "Addis Ababa, Ethiopia",
        name: "Nadia Abebe",
        rateUsd: 8400,
        role: "ML Platform Engineer",
        score: 89,
        skills: ["Python", "PyTorch", "MLflow", "Kubeflow", "LLM"],
        status: "proposed",
        yearsExp: 7,
      },
    ],
    engagementEvents: [
      {
        actor: "admin",
        at: "2026-05-24T08:00:00.000Z",
        done: true,
        id: "ev-ai-1",
        label: "Shortlist created",
      },
      {
        actor: "admin",
        at: "2026-05-26T09:30:00.000Z",
        done: true,
        id: "ev-ai-2",
        label: "Engineers added",
      },
      {
        actor: "admin",
        at: "2026-05-27T10:00:00.000Z",
        done: true,
        id: "ev-ai-3",
        label: "Sent to client",
      },
      {
        actor: "client",
        at: "2026-05-28T14:32:00.000Z",
        done: true,
        id: "ev-ai-4",
        label: "Client viewed",
      },
      {
        actor: "client",
        at: null,
        done: false,
        id: "ev-ai-5",
        label: "Intro request",
      },
      {
        actor: "client",
        at: null,
        done: false,
        id: "ev-ai-6",
        label: "Decision",
      },
    ],
  },
  {
    adminNotes:
      "Kwame is the ideal fit for payments reconciliation. Follow up if there is no response before Friday EOD.",
    adminOwner: "Maya",
    briefTitle: "Senior full-stack engineer for payments reconciliation",
    client: "SokoPay",
    clientContact: "Brian Ochieng",
    clientTier: "expansion",
    domain: "Fintech / Payments",
    id: "sl-payments",
    maxSlots: 3,
    responseDeadline: "2026-06-03",
    sentAt: "2026-05-28T16:00:00.000Z",
    stack: ["TypeScript", "Node.js", "PostgreSQL", "React"],
    status: "sent",
    viewedAt: null,
    engineers: [
      {
        addedAt: "2026-05-28T11:00:00.000Z",
        adminNotes:
          "Payments-native background and strong reconciliation systems experience.",
        availability: "immediate",
        dimensions: { availability: 89, domain: 94, seniority: 88, stack: 93 },
        id: "eng-kwame",
        location: "Accra, Ghana",
        name: "Kwame Mensah",
        rateUsd: 7800,
        role: "Senior Full-Stack Engineer",
        score: 91,
        skills: ["TypeScript", "Node.js", "React", "PostgreSQL", "Stripe"],
        status: "proposed",
        yearsExp: 9,
      },
    ],
    engagementEvents: [
      {
        actor: "admin",
        at: "2026-05-27T13:00:00.000Z",
        done: true,
        id: "ev-pay-1",
        label: "Shortlist created",
      },
      {
        actor: "admin",
        at: "2026-05-28T11:00:00.000Z",
        done: true,
        id: "ev-pay-2",
        label: "Engineers added",
      },
      {
        actor: "admin",
        at: "2026-05-28T16:00:00.000Z",
        done: true,
        id: "ev-pay-3",
        label: "Sent to client",
      },
      {
        actor: "client",
        at: null,
        done: false,
        id: "ev-pay-4",
        label: "Client viewed",
      },
      {
        actor: "client",
        at: null,
        done: false,
        id: "ev-pay-5",
        label: "Intro request",
      },
      {
        actor: "client",
        at: null,
        done: false,
        id: "ev-pay-6",
        label: "Decision",
      },
    ],
  },
  {
    adminNotes:
      "Need one more senior React Native candidate before sending. Sarah should remain the recommended lead.",
    adminOwner: "Maya",
    briefTitle: "Senior React Native engineer for mobile commerce",
    client: "TradeHub",
    clientContact: "Asha Njoroge",
    clientTier: "active",
    domain: "Mobile / Commerce",
    id: "sl-mobile",
    maxSlots: 4,
    responseDeadline: "2026-06-06",
    sentAt: null,
    stack: ["React Native", "TypeScript", "GraphQL", "Expo"],
    status: "draft",
    viewedAt: null,
    engineers: [
      {
        addedAt: "2026-05-28T09:00:00.000Z",
        adminNotes:
          "Top mobile pick. Has led six production React Native apps.",
        availability: "2_weeks",
        dimensions: { availability: 91, domain: 95, seniority: 90, stack: 96 },
        id: "eng-sarah",
        location: "Nairobi, Kenya",
        name: "Sarah Kimani",
        rateUsd: 6800,
        role: "Senior Mobile Engineer",
        score: 93,
        skills: ["React Native", "TypeScript", "Expo", "GraphQL"],
        status: "proposed",
        yearsExp: 7,
      },
      {
        addedAt: "2026-05-28T10:00:00.000Z",
        adminNotes: "Solid backup, less senior but immediately productive.",
        availability: "immediate",
        dimensions: { availability: 81, domain: 80, seniority: 78, stack: 85 },
        id: "eng-tunde",
        location: "Lagos, Nigeria",
        name: "Tunde Afolabi",
        rateUsd: 5900,
        role: "Mobile / Full-Stack Engineer",
        score: 81,
        skills: ["React Native", "TypeScript", "Firebase", "REST"],
        status: "proposed",
        yearsExp: 5,
      },
    ],
    engagementEvents: [
      {
        actor: "admin",
        at: "2026-05-28T08:00:00.000Z",
        done: true,
        id: "ev-mobile-1",
        label: "Shortlist created",
      },
      {
        actor: "admin",
        at: "2026-05-28T10:00:00.000Z",
        done: true,
        id: "ev-mobile-2",
        label: "Engineers added",
      },
      {
        actor: "admin",
        at: null,
        done: false,
        id: "ev-mobile-3",
        label: "Sent to client",
      },
      {
        actor: "client",
        at: null,
        done: false,
        id: "ev-mobile-4",
        label: "Client viewed",
      },
      {
        actor: "client",
        at: null,
        done: false,
        id: "ev-mobile-5",
        label: "Intro request",
      },
      {
        actor: "client",
        at: null,
        done: false,
        id: "ev-mobile-6",
        label: "Decision",
      },
    ],
  },
];

const engineerPool: ShortlistEngineer[] = [
  {
    addedAt: "",
    adminNotes:
      "Cloud platform engineer with AWS migration and infrastructure reliability depth.",
    availability: "immediate",
    dimensions: { availability: 90, domain: 80, seniority: 82, stack: 88 },
    id: "eng-zola",
    location: "Cape Town, South Africa",
    name: "Zola Ndlovu",
    rateUsd: 8500,
    role: "Cloud Platform Engineer",
    score: 85,
    skills: ["AWS", "Terraform", "Kubernetes", "Go"],
    status: "proposed",
    yearsExp: 7,
  },
  {
    addedAt: "",
    adminNotes:
      "Backend Python engineer with FastAPI and database-heavy delivery experience.",
    availability: "2_weeks",
    dimensions: { availability: 88, domain: 78, seniority: 80, stack: 85 },
    id: "eng-chisom",
    location: "Enugu, Nigeria",
    name: "Chisom Okafor",
    rateUsd: 6400,
    role: "Backend Python Engineer",
    score: 83,
    skills: ["Python", "Django", "FastAPI", "Postgres"],
    status: "proposed",
    yearsExp: 6,
  },
  {
    addedAt: "",
    adminNotes:
      "AI engineer with HuggingFace, Redis, and LLM workflow experience.",
    availability: "2_weeks",
    dimensions: { availability: 85, domain: 90, seniority: 84, stack: 89 },
    id: "eng-kemi",
    location: "Ibadan, Nigeria",
    name: "Kemi Oduola",
    rateUsd: 7900,
    role: "AI Engineer",
    score: 87,
    skills: ["Python", "HuggingFace", "LLM", "Redis"],
    status: "proposed",
    yearsExp: 6,
  },
];

export function AdminShortlistsPage() {
  const [shortlists, setShortlists] = useState(initialShortlists);
  const [activeId, setActiveId] = useState(initialShortlists[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShortlistStatus | "all">(
    "all",
  );
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [drawerEngineer, setDrawerEngineer] =
    useState<ShortlistEngineer | null>(null);
  const [decisionEngineer, setDecisionEngineer] =
    useState<ShortlistEngineer | null>(null);
  const [confirmEngineer, setConfirmEngineer] = useState<{
    engineer: ShortlistEngineer;
    shortlistId: string;
  } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState(
    initialShortlists[0]?.adminNotes ?? "",
  );

  const active =
    shortlists.find((shortlist) => shortlist.id === activeId) ?? shortlists[0];

  const filteredShortlists = useMemo(
    () =>
      shortlists
        .filter((shortlist) => {
          const haystack =
            `${shortlist.briefTitle} ${shortlist.client} ${shortlist.domain} ${shortlist.stack.join(" ")} ${shortlist.adminOwner}`.toLowerCase();
          const matchesQuery = haystack.includes(query.trim().toLowerCase());
          const matchesStatus =
            statusFilter === "all" || shortlist.status === statusFilter;
          return matchesQuery && matchesStatus;
        })
        .sort((a, b) => {
          if (sortKey === "deadline")
            return (
              Date.parse(a.responseDeadline) - Date.parse(b.responseDeadline)
            );
          if (sortKey === "slots")
            return (
              b.engineers.length / b.maxSlots - a.engineers.length / a.maxSlots
            );
          if (sortKey === "recent")
            return Date.parse(b.sentAt ?? "0") - Date.parse(a.sentAt ?? "0");
          return (
            average(b.engineers.map((engineer) => engineer.score)) -
            average(a.engineers.map((engineer) => engineer.score))
          );
        }),
    [query, shortlists, sortKey, statusFilter],
  );

  const metrics = useMemo(() => buildMetrics(shortlists), [shortlists]);

  const advanceShortlist = (shortlistId: string) => {
    setShortlists((current) =>
      current.map((shortlist) => {
        if (shortlist.id !== shortlistId) return shortlist;
        const next = shortlistStatusMeta[shortlist.status].next;
        if (!next) return shortlist;
        const now = new Date().toISOString();

        return {
          ...shortlist,
          engagementEvents: shortlist.engagementEvents.map((event) =>
            advanceEventForStatus(event, next, now),
          ),
          sentAt: next === "sent" ? now : shortlist.sentAt,
          status: next,
          viewedAt: next === "client_reviewing" ? now : shortlist.viewedAt,
        };
      }),
    );
  };

  const sendShortlist = ({
    deadline,
    note,
  }: {
    deadline: string;
    note: string;
  }) => {
    if (!active) return;
    const now = new Date().toISOString();
    const nextNotes = note.trim() || active.adminNotes;
    setShortlists((current) =>
      current.map((shortlist) =>
        shortlist.id === active.id
          ? {
              ...shortlist,
              adminNotes: nextNotes,
              engagementEvents: shortlist.engagementEvents.map((event) =>
                advanceEventForStatus(event, "sent", now),
              ),
              responseDeadline: deadline,
              sentAt: now,
              status: "sent",
            }
          : shortlist,
      ),
    );
    setNotesDraft(nextNotes);
    setSendOpen(false);
  };

  const advanceEngineer = (shortlistId: string, engineerId: string) => {
    setShortlists((current) =>
      current.map((shortlist) => {
        if (shortlist.id !== shortlistId) return shortlist;
        return {
          ...shortlist,
          engineers: shortlist.engineers.map((engineer) => {
            if (engineer.id !== engineerId) return engineer;
            const next = engineerStatusMeta[engineer.status].next;
            return next ? { ...engineer, status: next } : engineer;
          }),
        };
      }),
    );
  };

  const removeEngineer = () => {
    if (!confirmEngineer) return;
    setShortlists((current) =>
      current.map((shortlist) =>
        shortlist.id === confirmEngineer.shortlistId
          ? {
              ...shortlist,
              engineers: shortlist.engineers.filter(
                (engineer) => engineer.id !== confirmEngineer.engineer.id,
              ),
            }
          : shortlist,
      ),
    );
    setConfirmEngineer(null);
  };

  const addEngineers = (engineerIds: string[]) => {
    if (!active) return;
    setShortlists((current) =>
      current.map((shortlist) => {
        if (shortlist.id !== active.id) return shortlist;
        const existingIds = new Set(
          shortlist.engineers.map((engineer) => engineer.id),
        );
        const freshEngineers = engineerPool
          .filter(
            (engineer) =>
              engineerIds.includes(engineer.id) &&
              !existingIds.has(engineer.id),
          )
          .map((engineer) => ({
            ...engineer,
            addedAt: new Date().toISOString(),
          }));

        return {
          ...shortlist,
          engagementEvents: shortlist.engagementEvents.map((event) =>
            event.label === "Engineers added"
              ? { ...event, at: new Date().toISOString(), done: true }
              : event,
          ),
          engineers: [...shortlist.engineers, ...freshEngineers],
        };
      }),
    );
    setAddOpen(false);
  };

  const saveNotes = () => {
    if (!active) return;
    setShortlists((current) =>
      current.map((shortlist) =>
        shortlist.id === active.id
          ? { ...shortlist, adminNotes: notesDraft }
          : shortlist,
      ),
    );
  };

  const selectShortlist = (shortlist: Shortlist) => {
    setActiveId(shortlist.id);
    setNotesDraft(shortlist.adminNotes);
  };

  return (
    <div className="grid min-w-0 gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <DashboardPageHeader
        className="mb-0"
        title="Talent slates"
        description="Curate shortlist-ready engineer slates, track client engagement, and move from draft to decision with clear fit signals."
        status={<StatusBadge label={`${metrics.active} active`} tone="pending" />}
        actions={
          <>
            <Link
              href="/admin/briefs"
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--surface-high)_60%,transparent)] shadow-sm"
            >
              <IconFileText size={16} stroke={1.6} />
              Brief queue
            </Link>
            <Link
              href="/admin/matches"
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--surface-high)_60%,transparent)] shadow-sm"
            >
              <IconArrowRight size={16} stroke={1.6} />
              Pipeline
            </Link>
            {active?.status === "draft" ? (
              <button
                type="button"
                onClick={() => setSendOpen(true)}
                className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-[0.88rem] font-medium text-[var(--bg)] shadow-[0_12px_28px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition-all duration-300 hover:scale-[1.02]"
              >
                <IconSend size={16} stroke={1.6} />
                Send slate
              </button>
            ) : (
              <AdvanceShortlistButton
                active={active}
                onAdvance={advanceShortlist}
              />
            )}
          </>
        }
      />

      <AdminWorkflowNav active="shortlists" />

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          chart="bar"
          data={[2, 3, 4, 5, metrics.active]}
          icon={IconFileText}
          label="Active slates"
          trend={`${metrics.clientReviewing} with clients`}
          value={String(metrics.active)}
        />
        <KpiCard
          data={[74, 79, 82, 85, metrics.averageScore]}
          icon={IconStar}
          label="Avg fit score"
          trend="Across proposed engineers"
          value={`${metrics.averageScore}%`}
        />
        <KpiCard
          chart="bar"
          data={[0, 1, 1, 2, metrics.introRequests]}
          icon={IconSend}
          label="Intro requested"
          trend="Awaiting scheduling"
          value={String(metrics.introRequests)}
        />
        <KpiCard
          data={[42, 58, 63, 71, metrics.slotFill]}
          icon={IconTarget}
          label="Slots filled"
          trend="Slate capacity health"
          value={`${metrics.slotFill}%`}
        />
      </section>

      <StageSignalBar
        activeStatus={statusFilter}
        onSelect={setStatusFilter}
        shortlists={shortlists}
      />

      <SectionDivider />

      <section className="grid gap-8 xl:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] min-[1880px]:grid-cols-[21rem_minmax(0,1fr)_23rem]">
        <aside className="min-w-0">
          <SectionHeading
            eyebrow="Portfolio"
            title="Client slates"
            description="Search and select the shortlist that drives the slate workspace."
          />
          <div className="mt-6 grid gap-4">
            <div className="grid gap-3">
              <label className="relative">
                <span className="sr-only">Search shortlists</span>
                <IconSearch
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]"
                  size={18}
                  stroke={1.6}
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search client, brief, stack..."
                  className="h-11 w-full rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] pl-10 pr-4 text-[0.92rem] text-[var(--on-surface)] outline-none transition-colors placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-md"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
                <SelectControl
                  icon={<IconShieldCheck size={16} stroke={1.6} />}
                  label="Status"
                  onChange={(value) =>
                    setStatusFilter(value as ShortlistStatus | "all")
                  }
                  value={statusFilter}
                >
                  <option value="all">All status</option>
                  {shortlistStatusOrder.map((status) => (
                    <option key={status} value={status}>
                      {shortlistStatusMeta[status].label}
                    </option>
                  ))}
                </SelectControl>
                <SelectControl
                  icon={<IconAdjustmentsHorizontal size={16} stroke={1.6} />}
                  label="Sort"
                  onChange={(value) => setSortKey(value as SortKey)}
                  value={sortKey}
                >
                  <option value="score">Fit score</option>
                  <option value="deadline">Deadline</option>
                  <option value="slots">Slot fill</option>
                  <option value="recent">Recently sent</option>
                </SelectControl>
              </div>
            </div>
            <div className="grid gap-3 overflow-visible pr-0 min-[1880px]:max-h-[calc(100svh-18rem)] min-[1880px]:overflow-y-auto min-[1880px]:pr-1">
              {filteredShortlists.map((shortlist) => (
                <ShortlistCard
                  key={shortlist.id}
                  active={shortlist.id === active?.id}
                  onSelect={() => selectShortlist(shortlist)}
                  shortlist={shortlist}
                />
              ))}
              {!filteredShortlists.length && (
                <div className="rounded-[1.25rem] border border-dashed border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-8 text-center backdrop-blur-sm">
                  <p className="text-[0.98rem] font-medium text-[var(--on-surface)]">
                    No slates match
                  </p>
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
                    Clear search or change the status filter to bring the
                    portfolio back.
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className="grid min-w-0 gap-8">
          <div className="flex min-w-0 flex-col gap-4 border-b border-[color-mix(in_srgb,var(--glass-border)_62%,transparent)] pb-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Engineer slate"
              title={active?.briefTitle ?? "Select a shortlist"}
              description="Compare fit quality, availability, client actions, and the next admin move."
              plain
            />
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--primary)_40%,var(--glass-border))] px-5 text-[0.86rem] font-medium text-[var(--primary)] transition-colors hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] min-[1880px]:hidden shadow-sm backdrop-blur-sm"
              >
                <IconShieldCheck size={16} stroke={1.6} />
                Command
              </button>
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface-high)_50%,transparent)] shadow-sm backdrop-blur-sm"
              >
                <IconPlus size={16} stroke={1.6} />
                Add engineer
              </button>
            </div>
          </div>
          {active ? (
            <div className="grid gap-5">
              <div className="grid items-stretch gap-5 min-[1500px]:grid-cols-[minmax(0,1fr)_18rem]">
                <SlateSummary shortlist={active} />
                <EngagementTimeline events={active.engagementEvents} />
              </div>
              <div className="grid gap-4">
                {active.engineers.map((engineer) => (
                  <EngineerMatchCard
                    key={engineer.id}
                    engineer={engineer}
                    onAdvance={() => setDecisionEngineer(engineer)}
                    onInspect={() => setDrawerEngineer(engineer)}
                    onRemove={() =>
                      setConfirmEngineer({ engineer, shortlistId: active.id })
                    }
                  />
                ))}
                {!active.engineers.length ? (
                  <div className="rounded-[1.25rem] border border-dashed border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-10 text-center backdrop-blur-sm">
                    <p className="text-[1.05rem] font-medium text-[var(--on-surface)]">
                      No engineers in this slate yet
                    </p>
                    <p className="mt-2 text-[0.92rem] text-[var(--on-surface-dim)] max-w-lg mx-auto">
                      Add vetted engineers from the available pool to start
                      shaping the client review.
                    </p>
                    <button
                      type="button"
                      onClick={() => setAddOpen(true)}
                      className="my-8 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[var(--primary)] px-6 text-[0.9rem] font-medium text-[var(--bg)] shadow-[0_12px_28px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition-transform duration-300 hover:scale-[1.02]"
                    >
                      <IconPlus size={18} stroke={1.6} />
                      Add engineers
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <ShortlistCommandPanel
          active={active}
          mode="rail"
          notesDraft={notesDraft}
          onAddEngineer={() => setAddOpen(true)}
          onAdvance={active ? () => advanceShortlist(active.id) : undefined}
          onNotesChange={setNotesDraft}
          onSaveNotes={saveNotes}
          onSend={() => setSendOpen(true)}
        />
      </section>

      <SectionDivider />

      <section>
        <SectionHeading
          eyebrow="Observability"
          title="Slate analytics"
          description="Throughput, fit quality, and status distribution for shortlist planning."
        />
        <div className="mt-6 grid items-stretch gap-5 xl:grid-cols-3">
          <AnalyticsCard
            chart={
              <ChartAccent secondary="var(--primary)">
                <DashboardLineChart
                  data={[6, 7, 7, 9, 11, 12, metrics.active + 8]}
                  height={310}
                  labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Now"]}
                  variant="area"
                />
              </ChartAccent>
            }
            metric={`${metrics.active} active`}
            title="Shortlist throughput"
            description="Drafts, sent slates, client views, and decisions."
          />
          <AnalyticsCard
            chart={
              <ChartAccent primary="var(--tertiary)" secondary="var(--primary)">
                <DashboardBarChart
                  data={[82, 86, 89, 91, metrics.averageScore]}
                  height={310}
                  labels={["Stack", "Domain", "Sen.", "Avail.", "Avg"]}
                />
              </ChartAccent>
            }
            metric={`${metrics.averageScore}% avg`}
            metricTone="success"
            title="Fit quality"
            description="Average score movement across active proposed engineers."
          />
          <AnalyticsCard
            chart={
              <DashboardDonutChart
                data={[
                  { label: "Draft", value: metrics.draft, tone: "muted" },
                  { label: "Sent", value: metrics.sent, tone: "secondary" },
                  {
                    label: "Review",
                    value: metrics.clientReviewing,
                    tone: "primary",
                  },
                  {
                    label: "Decided",
                    value: shortlists.filter(
                      (shortlist) => shortlist.status === "decided",
                    ).length,
                    tone: "success",
                  },
                ]}
                height={230}
                legend="inline"
                thickness="slim"
              />
            }
            metric={`${metrics.slotFill}% filled`}
            metricTone="primary"
            title="Slate mix"
            description="Status split and slate capacity across client shortlists."
          />
        </div>
      </section>

      {addOpen && (
        <AddEngineerModal
          existingIds={active?.engineers.map((engineer) => engineer.id) ?? []}
          onAdd={addEngineers}
          onClose={() => setAddOpen(false)}
          open={addOpen}
        />
      )}

      {sendOpen && active && (
        <SendShortlistModal
          key={active.id}
          onClose={() => setSendOpen(false)}
          onSubmit={sendShortlist}
          shortlist={active}
        />
      )}

      {commandOpen && active && (
        <CommandModal
          onClose={() => setCommandOpen(false)}
          title={`${active.client} slate command`}
        >
          <ShortlistCommandPanel
            active={active}
            mode="modal"
            notesDraft={notesDraft}
            onAddEngineer={() => {
              setCommandOpen(false);
              setAddOpen(true);
            }}
            onAdvance={() => {
              advanceShortlist(active.id);
              setCommandOpen(false);
            }}
            onNotesChange={setNotesDraft}
            onSaveNotes={saveNotes}
            onSend={() => {
              setCommandOpen(false);
              setSendOpen(true);
            }}
          />
        </CommandModal>
      )}

      {drawerEngineer && (
        <EngineerProfileModal
          engineer={drawerEngineer}
          onClose={() => setDrawerEngineer(null)}
          onDecision={() => {
            setDecisionEngineer(drawerEngineer);
            setDrawerEngineer(null);
          }}
        />
      )}

      {decisionEngineer && active && (
        <EngineerDecisionModal
          engineer={decisionEngineer}
          onClose={() => setDecisionEngineer(null)}
          onConfirm={() => {
            advanceEngineer(active.id, decisionEngineer.id);
            setDecisionEngineer(null);
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirmEngineer)}
        title="Remove engineer from shortlist?"
        description={`This removes ${confirmEngineer?.engineer.name ?? "the engineer"} from the active client slate. You can add them back from the talent pool later.`}
        confirmLabel="Remove"
        onCancel={() => setConfirmEngineer(null)}
        onConfirm={removeEngineer}
      />
    </div>
  );
}

function ShortlistCommandPanel({
  active,
  mode = "rail",
  notesDraft,
  onAddEngineer,
  onAdvance,
  onNotesChange,
  onSaveNotes,
  onSend,
}: {
  active: Shortlist | undefined;
  mode?: "modal" | "rail";
  notesDraft: string;
  onAddEngineer: () => void;
  onAdvance?: () => void;
  onNotesChange: (value: string) => void;
  onSaveNotes: () => void;
  onSend: () => void;
}) {
  if (!active) return null;

  const meta = shortlistStatusMeta[active.status];
  const next = meta.next;
  const averageScore = average(
    active.engineers.map((engineer) => engineer.score),
  );
  const railMode = mode === "rail";

  return (
    <aside
      className={cn(
        railMode
          ? "rounded-[1.45rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] p-6 shadow-[0_24px_54px_color-mix(in_srgb,var(--bg-deep)_12%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-2xl"
          : "p-0",
        railMode && "hidden min-[1880px]:block min-[1880px]:sticky min-[1880px]:top-24",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-caps text-[var(--primary)]">Slate command</p>
          <h2 className="title-serif mt-3 text-[1.4rem] font-medium leading-tight text-[var(--on-surface)]">
            {active.client}
          </h2>
          <p className="mt-2 text-[0.92rem] leading-[1.65] text-[var(--on-surface-dim)]">
            {active.clientContact} / {active.domain}
          </p>
        </div>
        <StatusBadge label={meta.label} tone={meta.tone} />
      </div>

      <div className="my-8 grid grid-cols-2 gap-3">
        <InfoTile
          label="Slots"
          value={`${active.engineers.length}/${active.maxSlots}`}
        />
        <InfoTile
          label="Deadline"
          value={formatDate(active.responseDeadline) ?? "Pending"}
        />
        <InfoTile label="Sent" value={formatDate(active.sentAt) ?? "Draft"} />
        <InfoTile
          label="Viewed"
          value={formatDate(active.viewedAt) ?? "Pending"}
        />
      </div>

      <div className="rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-5 shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md">
        <p className="text-[0.74rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">
          Next curation move
        </p>
        <p className="mt-2.5 text-[0.94rem] font-medium leading-snug text-[var(--on-surface)]">
          {active.status === "draft"
            ? "Package the slate with deadline and client-facing note."
            : next
              ? `Move client signal toward ${shortlistStatusMeta[next].label.toLowerCase()}.`
              : "Decision captured. Route accepted talent into pipeline."}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <InlineMetric label="Avg fit" value={`${averageScore}%`} />
          <InlineMetric label="Owner" value={active.adminOwner} />
        </div>
      </div>

      <div className="my-8 border-t border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] pt-6">
        <label>
          <span className="text-[0.92rem] font-medium text-[var(--on-surface)]">
            Admin notes
          </span>
          <textarea
            value={notesDraft}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={5}
            className="mt-3 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-4 text-[0.92rem] leading-relaxed text-[var(--on-surface)] outline-none focus:border-[var(--primary)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md"
          />
        </label>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onSaveNotes}
            className="inline-flex min-h-[2.8rem] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.88rem] font-medium text-[var(--on-surface)] transition-all duration-300 hover:-translate-y-px hover:bg-[color-mix(in_srgb,var(--surface-high)_50%,transparent)] shadow-sm"
          >
            <IconCheck size={16} stroke={1.6} />
            Save notes
          </button>
          <button
            type="button"
            onClick={onAddEngineer}
            className="inline-flex min-h-[2.8rem] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-4 text-[0.88rem] font-medium text-[var(--bg)] shadow-[0_10px_24px_color-mix(in_srgb,var(--bg-deep)_16%,transparent)] transition-transform duration-300 hover:-translate-y-px hover:scale-[1.02]"
          >
            <IconPlus size={16} stroke={1.6} />
            Add engineer
          </button>
        </div>
        {active.status === "draft" ? (
          <button
            type="button"
            onClick={onSend}
            className="mt-3 inline-flex min-h-[2.8rem] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 text-[0.88rem] font-medium text-[var(--bg)] shadow-[0_12px_28px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition-all duration-300 hover:-translate-y-px hover:scale-[1.02]"
          >
            <IconSend size={16} stroke={1.6} />
            Send to client
          </button>
        ) : onAdvance && next ? (
          <button
            type="button"
            onClick={onAdvance}
            className="mt-3 inline-flex min-h-[2.8rem] w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--primary)_40%,var(--glass-border))] text-[0.88rem] font-medium text-[var(--primary)] transition-all duration-300 hover:-translate-y-px hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] shadow-sm"
          >
            Move to {shortlistStatusMeta[next].label}
            <IconArrowRight size={16} stroke={1.6} />
          </button>
        ) : null}
      </div>
    </aside>
  );
}

function StageSignalBar({
  activeStatus,
  onSelect,
  shortlists,
}: {
  activeStatus: ShortlistStatus | "all";
  onSelect: (status: ShortlistStatus | "all") => void;
  shortlists: Shortlist[];
}) {
  const total = Math.max(shortlists.length, 1);
  const stageCopy: Record<ShortlistStatus, string> = {
    client_reviewing: "Client signal",
    decided: "Pipeline handoff",
    draft: "Internal curation",
    sent: "Client package",
  };

  return (
    <section className="rounded-[1.45rem] border border-[var(--glass-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-high)_60%,transparent),color-mix(in_srgb,var(--surface)_30%,transparent))] p-5 shadow-[0_18px_50px_color-mix(in_srgb,var(--bg-deep)_10%,transparent),inset_0_1px_0_color-mix(in_srgb,white_8%,transparent)] backdrop-blur-2xl sm:p-6">
      <div className="flex min-w-0 flex-col gap-3 border-b border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="label-caps text-[var(--primary)]">Slate flight path</p>
          <h2 className="title-serif mt-2 text-[1.15rem] font-medium text-[var(--on-surface)]">
            Curation stages
          </h2>
          <p className="mt-1.5 max-w-2xl text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
            Filter by the client-slate moment without losing the progression
            from internal assembly to pipeline handoff.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect("all")}
          className={cn(
            "inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 text-[0.82rem] font-medium transition-colors shadow-sm",
            activeStatus === "all"
              ? "border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] text-[var(--bg)] shadow-[0_8px_16px_color-mix(in_srgb,var(--bg-deep)_12%,transparent)]"
              : "border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:bg-[color-mix(in_srgb,var(--surface-high)_40%,transparent)] hover:text-[var(--on-surface)]",
          )}
        >
          <IconSparkles size={16} stroke={1.6} />
          All slates
        </button>
      </div>

      <div className="relative mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <span
          aria-hidden
          className="pointer-events-none absolute left-[8%] right-[8%] top-[2.15rem] hidden h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--primary)_40%,transparent),color-mix(in_srgb,var(--tertiary)_30%,transparent),transparent)] xl:block"
        />
        {shortlistStatusOrder.map((stage) => {
          const meta = shortlistStatusMeta[stage];
          const count = shortlists.filter(
            (shortlist) => shortlist.status === stage,
          ).length;
          const active = activeStatus === stage;
          const percent = Math.round((count / total) * 100);
          const width = `${Math.max(8, percent)}%`;

          return (
            <button
              key={stage}
              type="button"
              onClick={() => onSelect(active ? "all" : stage)}
              className={cn(
                "relative min-w-0 cursor-pointer rounded-[1.25rem] border p-5 text-left transition-all duration-300 hover:-translate-y-px",
                active
                  ? "border-[color-mix(in_srgb,var(--primary)_40%,var(--glass-border))] bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface))] shadow-[0_16px_36px_color-mix(in_srgb,var(--primary)_12%,transparent)]"
                  : "border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] hover:border-[color-mix(in_srgb,var(--primary)_30%,var(--glass-border))] hover:bg-[color-mix(in_srgb,var(--surface-high)_40%,transparent)]",
              )}
            >
              <span
                className={cn(
                  "relative z-[1] grid h-11 w-11 place-items-center rounded-full border font-mono text-[0.8rem] shadow-sm transition-colors duration-300",
                  active
                    ? "border-[color-mix(in_srgb,var(--primary)_40%,transparent)] bg-[var(--primary)] text-[var(--bg)] shadow-[0_8px_16px_color-mix(in_srgb,var(--primary)_30%,transparent)]"
                    : "border-[var(--glass-border)] bg-[var(--surface)] text-[var(--on-surface-dim)]",
                )}
              >
                {shortlistStatusOrder.indexOf(stage) + 1}
              </span>
              <div className="mt-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[0.98rem] font-medium text-[var(--on-surface)]">
                    {meta.label}
                  </p>
                  <p className="mt-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--on-surface-dim)]">
                    {stageCopy[stage]}
                  </p>
                </div>
                <span className="font-mono text-[1.35rem] text-[var(--on-surface)]">
                  {count}
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 text-[0.76rem] text-[var(--on-surface-dim)]">
                <span>{percent}% of slate load</span>
                {stage !== "decided" && (
                  <IconChevronRight size={16} stroke={1.6} />
                )}
              </div>
              <div className="mt-2.5 h-[0.4rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
                <span
                  className={cn(
                    "block h-full rounded-full transition-all duration-500",
                    meta.tone === "active" && "bg-[var(--primary)]",
                    meta.tone === "pending" && "bg-[var(--primary)]",
                    meta.tone === "available" && "bg-[var(--tertiary)]",
                    meta.tone === "neutral" &&
                      "bg-[color-mix(in_srgb,var(--on-surface-dim)_60%,transparent)]",
                  )}
                  style={{ width }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function AdvanceShortlistButton({
  active,
  onAdvance,
}: {
  active: Shortlist | undefined;
  onAdvance: (shortlistId: string) => void;
}) {
  if (!active) return null;

  const next = shortlistStatusMeta[active.status].next;
  if (!next) return null;

  return (
    <button
      type="button"
      onClick={() => onAdvance(active.id)}
      className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-5 text-[0.88rem] font-medium text-[var(--bg)] shadow-[0_12px_28px_color-mix(in_srgb,var(--bg-deep)_20%,transparent)] transition-all duration-300 hover:-translate-y-px hover:scale-[1.02]"
    >
      {active.status === "draft" ? (
        <IconSend size={16} stroke={1.6} />
      ) : (
        <IconCheck size={16} stroke={1.6} />
      )}
      {active.status === "draft"
        ? "Send shortlist"
        : `Mark ${shortlistStatusMeta[next].label}`}
    </button>
  );
}

function ShortlistCard({
  active,
  onSelect,
  shortlist,
}: {
  active: boolean;
  onSelect: () => void;
  shortlist: Shortlist;
}) {
  const meta = shortlistStatusMeta[shortlist.status];
  const score = average(shortlist.engineers.map((engineer) => engineer.score));
  const fill = Math.min(
    100,
    Math.round((shortlist.engineers.length / shortlist.maxSlots) * 100),
  );
  const nextOpenEvent = shortlist.engagementEvents.find((event) => !event.done);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative w-full cursor-pointer rounded-[1.25rem] border bg-[color-mix(in_srgb,var(--surface-high)_40%,transparent)] p-5 pb-6 text-left transition-all duration-300 hover:-translate-y-px backdrop-blur-md",
        active
          ? "border-[color-mix(in_srgb,var(--primary)_40%,var(--glass-border))] shadow-[0_16px_42px_color-mix(in_srgb,var(--primary)_10%,transparent),inset_0_1px_0_color-mix(in_srgb,white_8%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_80%,transparent)]"
          : "border-[var(--glass-border)] hover:border-[color-mix(in_srgb,var(--primary)_24%,var(--glass-border))] hover:bg-[color-mix(in_srgb,var(--surface-high)_60%,transparent)]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-5 left-0 w-1 rounded-full transition-opacity duration-300",
          active
            ? "bg-[var(--tertiary)] opacity-100"
            : "bg-[var(--glass-border)] opacity-0 group-hover:opacity-100",
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[1.05rem] font-medium text-[var(--on-surface)]">
            {shortlist.client}
          </p>
          <p className="mt-1.5 line-clamp-2 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
            {shortlist.briefTitle}
          </p>
        </div>
        <StatusBadge label={meta.label} tone={meta.tone} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 border-y border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] py-4">
        <InlineMetric label="Score" value={`${score}%`} />
        <InlineMetric
          label="Slots"
          value={`${shortlist.engineers.length}/${shortlist.maxSlots}`}
        />
        <InlineMetric
          label="Due"
          value={formatDate(shortlist.responseDeadline) ?? "Pending"}
        />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.82rem] text-[var(--on-surface-dim)]">
        <span className="inline-flex items-center gap-1.5 bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] border border-[color-mix(in_srgb,var(--glass-border)_40%,transparent)] px-2.5 py-1 rounded-full">
          <IconBuilding size={15} stroke={1.6} />
          {shortlist.clientContact}
        </span>
        <span className="inline-flex items-center gap-1.5 bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] border border-[color-mix(in_srgb,var(--glass-border)_40%,transparent)] px-2.5 py-1 rounded-full">
          <IconClock size={15} stroke={1.6} />
          {nextOpenEvent?.label ?? "Complete"}
        </span>
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between gap-2 text-[0.78rem] text-[var(--on-surface-dim)]">
          <span>Slate capacity</span>
          <span className="font-mono font-medium">{fill}%</span>
        </div>
        <div className="mt-2.5 h-[0.35rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_12%,transparent)]">
          <span
            className="block h-full rounded-full bg-[var(--tertiary)] transition-all duration-500"
            style={{ width: `${fill}%` }}
          />
        </div>
      </div>
    </button>
  );
}

function SlateSummary({ shortlist }: { shortlist: Shortlist }) {
  const averageScore = average(
    shortlist.engineers.map((engineer) => engineer.score),
  );
  const dimensions = averageDimensions(shortlist.engineers);
  const weakest = Object.entries(dimensions).sort(([, a], [, b]) => a - b)[0];
  const strongest = Object.entries(dimensions).sort(([, a], [, b]) => b - a)[0];
  const recommended = [...shortlist.engineers].sort(
    (a, b) => b.score - a.score,
  )[0];
  const introReady = shortlist.engineers.filter(
    (engineer) =>
      engineer.status === "intro_requested" || engineer.status === "accepted",
  ).length;

  return (
    <article className="h-full rounded-[1.35rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_60%,transparent),color-mix(in_srgb,var(--surface)_30%,transparent))] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_8%,transparent),inset_0_1px_0_color-mix(in_srgb,white_8%,transparent)] backdrop-blur-xl sm:p-6">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_14rem] min-[1700px]:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <p className="label-caps text-[var(--primary)]">Fit observability</p>
          <h3 className="mt-3 text-[1.15rem] font-medium text-[var(--on-surface)]">
            {shortlist.engineers.length} engineers / {averageScore}% average fit
          </h3>
          <p className="mt-2.5 max-w-2xl text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">
            {recommended
              ? `${recommended.name} is the current recommended lead. `
              : ""}
            Watch {formatDimensionLabel(weakest?.[0] ?? "availability")} before
            sending the next client nudge.
          </p>
          <div className="mt-5 grid gap-x-6 gap-y-4 min-[1180px]:grid-cols-2">
            {Object.entries(dimensions).map(([label, value]) => (
              <ScoreBar
                key={label}
                label={formatDimensionLabel(label)}
                value={value}
                tone={dimensionTone(label)}
                large
              />
            ))}
          </div>
        </div>

        <aside className="grid content-start gap-4 border-t border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <PerformanceScore score={averageScore} />
          <div className="grid grid-cols-2 gap-3">
            <InfoTile
              label="Strongest"
              value={`${formatDimensionLabel(strongest?.[0] ?? "stack")} ${strongest?.[1] ?? 0}%`}
            />
            <InfoTile
              label="Intro ready"
              value={`${introReady}/${shortlist.engineers.length}`}
            />
          </div>
          <div className="rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-4 shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md">
            <p className="text-[0.74rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">
              Action signal
            </p>
            <p className="mt-2.5 text-[0.94rem] font-medium leading-snug text-[var(--on-surface)]">
              {shortlist.status === "draft"
                ? "Add one more candidate before send."
                : "Prioritize client follow-up and intro slot capture."}
            </p>
            <div className="mt-5 h-[0.35rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_12%,transparent)]">
              <span
                className="block h-full rounded-full bg-[var(--primary)] transition-all duration-500"
                style={{ width: `${Math.min(100, averageScore)}%` }}
              />
            </div>
            <p className="mt-2.5 font-mono text-[0.7rem] text-[var(--on-surface-dim)]">
              {averageScore}% confidence
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
}

function EngagementTimeline({ events }: { events: EngagementEvent[] }) {
  return (
    <article className="h-full rounded-[1.35rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_60%,transparent),color-mix(in_srgb,var(--surface)_30%,transparent))] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_8%,transparent),inset_0_1px_0_color-mix(in_srgb,white_8%,transparent)] backdrop-blur-xl sm:p-6">
      <p className="text-[1.05rem] font-medium text-[var(--on-surface)]">
        Client engagement
      </p>
      <div className="mt-5 grid gap-3">
        {events.map((event, index) => (
          <div
            key={event.id}
            className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-4"
          >
            <span className={cn(
                "relative grid h-6 w-6 place-items-center rounded-full border shadow-sm",
                event.done ? "border-[color-mix(in_srgb,var(--tertiary)_40%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_15%,transparent)]" : "border-[var(--glass-border)] bg-[var(--surface)]"
            )}>
              {event.done ? (
                <IconCheck
                  className="text-[var(--tertiary)]"
                  size={14}
                  stroke={2}
                />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--on-surface-dim)]" />
              )}
              {index < events.length - 1 ? (
                <span className="absolute left-1/2 top-6 h-5 w-px -translate-x-1/2 bg-[color-mix(in_srgb,var(--glass-border)_60%,transparent)]" />
              ) : null}
            </span>
            <div className="min-w-0 pb-2">
              <p className={cn(
                  "text-[0.9rem] font-medium",
                  event.done ? "text-[var(--on-surface)]" : "text-[var(--on-surface-dim)]"
              )}>
                {event.label}
              </p>
              <p className="mt-1 text-[0.76rem] text-[color-mix(in_srgb,var(--on-surface-dim)_80%,transparent)]">
                {event.at ? formatDate(event.at) : "Pending"} / {event.actor}
              </p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function EngineerMatchCard({
  engineer,
  onAdvance,
  onInspect,
  onRemove,
}: {
  engineer: ShortlistEngineer;
  onAdvance: () => void;
  onInspect: () => void;
  onRemove: () => void;
}) {
  const meta = engineerStatusMeta[engineer.status];
  const signal = scoreSignal(engineer.score);
  const topDimension = Object.entries(engineer.dimensions).sort(
    ([, a], [, b]) => b - a,
  )[0];

  return (
    <article className="group rounded-[1.25rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_40%,transparent)] shadow-[0_16px_42px_color-mix(in_srgb,var(--bg-deep)_8%,transparent),inset_0_1px_0_color-mix(in_srgb,white_8%,transparent)] transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--primary)_30%,var(--glass-border))] hover:bg-[color-mix(in_srgb,var(--surface-high)_70%,transparent)] backdrop-blur-md">
      <div className="grid gap-5 p-5 sm:p-6 min-[1500px]:grid-cols-[minmax(0,1fr)_auto]">
        <button
          type="button"
          onClick={onInspect}
          className="min-w-0 cursor-pointer text-left"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[1rem] border border-[color-mix(in_srgb,var(--primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] font-mono text-[0.85rem] text-[var(--primary)] shadow-sm">
                {initials(engineer.name)}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-[1.1rem] font-medium leading-tight text-[var(--on-surface)]">
                    {engineer.name}
                  </h3>
                  <StatusBadge label={meta.label} tone={meta.tone} />
                </div>
                <p className="mt-1.5 text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">
                  {engineer.role}
                </p>
              </div>
            </div>
            <PerformanceScore score={engineer.score} compact />
          </div>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[0.84rem] text-[var(--on-surface-dim)]">
            <span className="inline-flex items-center gap-1.5 bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] border border-[color-mix(in_srgb,var(--glass-border)_40%,transparent)] px-2.5 py-1 rounded-full">
              <IconMapPin size={15} stroke={1.6} />
              {engineer.location}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] border border-[color-mix(in_srgb,var(--glass-border)_40%,transparent)] px-2.5 py-1 rounded-full">
              <IconClock size={15} stroke={1.6} />
              {availabilityLabel(engineer.availability)}
            </span>
          </div>

          <div className="mt-5 grid overflow-hidden rounded-[1.15rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_30%,transparent)] sm:grid-cols-3 shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-sm">
            <SignalCell label="Rate" value={formatRate(engineer.rateUsd)} />
            <SignalCell label="Experience" value={`${engineer.yearsExp} yrs`} />
            <SignalCell
              label="Best signal"
              value={`${formatDimensionLabel(topDimension?.[0] ?? "stack")} ${topDimension?.[1] ?? 0}`}
            />
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 text-[0.8rem] text-[var(--on-surface-dim)]">
              <span>{signal.summary}</span>
              <span className="font-mono text-[var(--on-surface)] font-medium">
                {engineer.score}%
              </span>
            </div>
            <div className="mt-2.5 h-[0.35rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_12%,transparent)]">
              <span
                className="block h-full rounded-full transition-all duration-500"
                style={{ background: signal.tone, width: `${engineer.score}%` }}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {engineer.skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] px-3 py-1.5 text-[0.76rem] font-medium text-[var(--on-surface-dim)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface)_90%,transparent)]"
              >
                {skill}
              </span>
            ))}
          </div>
        </button>

        <div className="flex items-center gap-2 border-t border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] pt-5 min-[1500px]:flex-col min-[1500px]:border-l min-[1500px]:border-t-0 min-[1500px]:pl-5 min-[1500px]:pt-0">
          <IconButton label={`Inspect ${engineer.name}`} onClick={onInspect}>
            <IconEye size={18} stroke={1.6} />
          </IconButton>
          {meta.next ? (
            <IconButton label={`Advance ${engineer.name}`} onClick={onAdvance}>
              <IconArrowRight size={18} stroke={1.6} />
            </IconButton>
          ) : null}
          <IconButton
            label={`Remove ${engineer.name}`}
            onClick={onRemove}
            danger
          >
            <IconTrash size={18} stroke={1.6} />
          </IconButton>
        </div>
      </div>
    </article>
  );
}

function AddEngineerModal({
  existingIds,
  onAdd,
  onClose,
  open,
}: {
  existingIds: string[];
  onAdd: (engineerIds: string[]) => void;
  onClose: () => void;
  open: boolean;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"available" | "saved">("available");
  const firstOptionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => firstOptionRef.current?.focus(), 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, open]);

  if (!open) return null;

  const availableEngineers = engineerPool.filter(
    (engineer) => !existingIds.includes(engineer.id),
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedIds.length) onAdd(selectedIds);
  };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_80%,transparent)] px-4 py-6 backdrop-blur-2xl">
      <button
        type="button"
        aria-label="Close add engineer modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <form
        onSubmit={submit}
        className="relative max-h-[calc(100svh-3rem)] w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_95%,transparent),color-mix(in_srgb,var(--surface)_85%,transparent))] shadow-[0_32px_120px_color-mix(in_srgb,var(--bg-deep)_50%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] p-6 sm:p-8">
          <div>
            <p className="label-caps text-[var(--primary)]">Talent pool</p>
            <h2 className="title-serif mt-2 text-[1.6rem] font-medium text-[var(--on-surface)]">
              Add engineers to shortlist
            </h2>
            <p className="mt-2 max-w-2xl text-[0.96rem] leading-relaxed text-[var(--on-surface-dim)]">
              Select vetted engineers to add to the active slate. Existing
              candidates are filtered out automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] text-[var(--on-surface-dim)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface-high)_80%,transparent)] hover:text-[var(--on-surface)] shadow-sm"
            aria-label="Close modal"
          >
            <IconX size={18} stroke={1.6} />
          </button>
        </div>

        {/* Tabbed Navigation inside modal */}
        <div className="border-b border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] px-6 sm:px-8 bg-[color-mix(in_srgb,var(--surface)_30%,transparent)]">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("available")}
              className={cn(
                "relative pb-3 pt-4 text-[0.92rem] font-medium transition-colors",
                activeTab === "available"
                  ? "text-[var(--on-surface)]"
                  : "text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
              )}
            >
              Available Pool
              {activeTab === "available" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-[var(--primary)]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={cn(
                "relative pb-3 pt-4 text-[0.92rem] font-medium transition-colors",
                activeTab === "saved"
                  ? "text-[var(--on-surface)]"
                  : "text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
              )}
            >
              Saved Candidates
              {activeTab === "saved" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-[var(--primary)]" />
              )}
            </button>
          </div>
        </div>

        <div className="max-h-[50svh] overflow-y-auto p-6 sm:p-8">
          {activeTab === "available" ? (
             <div className="grid gap-4 md:grid-cols-2">
             {availableEngineers.map((engineer, index) => {
               const selected = selectedIds.includes(engineer.id);
               return (
                 <label
                   key={engineer.id}
                   className={cn(
                     "cursor-pointer rounded-[1.25rem] border p-5 transition-all duration-300 hover:-translate-y-px",
                     selected
                       ? "border-[color-mix(in_srgb,var(--primary)_40%,var(--glass-border))] bg-[color-mix(in_srgb,var(--primary)_8%,var(--surface))] shadow-[0_12px_32px_color-mix(in_srgb,var(--primary)_10%,transparent)]"
                       : "border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_30%,transparent)] hover:border-[color-mix(in_srgb,var(--primary)_26%,var(--glass-border))] hover:bg-[color-mix(in_srgb,var(--surface-high)_60%,transparent)]",
                   )}
                 >
                   <input
                     ref={index === 0 ? firstOptionRef : undefined}
                     type="checkbox"
                     checked={selected}
                     onChange={() =>
                       setSelectedIds((current) =>
                         current.includes(engineer.id)
                           ? current.filter((id) => id !== engineer.id)
                           : [...current, engineer.id],
                       )
                     }
                     className="sr-only"
                   />
                   <div className="flex items-start justify-between gap-3">
                     <div className="min-w-0">
                       <p className="text-[1.05rem] font-medium text-[var(--on-surface)]">
                         {engineer.name}
                       </p>
                       <p className="mt-1.5 text-[0.9rem] text-[var(--on-surface-dim)]">
                         {engineer.role}
                       </p>
                     </div>
                     <span className="rounded-full border border-[color-mix(in_srgb,var(--glass-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] px-3 py-1 font-mono text-[0.8rem] font-medium text-[var(--on-surface)] shadow-sm">
                       {engineer.score}%
                     </span>
                   </div>
                   <p className="mt-4 text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
                     {engineer.adminNotes}
                   </p>
                   <div className="mt-4 flex flex-wrap gap-2">
                     {engineer.skills.slice(0, 4).map((skill) => (
                       <span
                         key={skill}
                         className="rounded-full border border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] px-3 py-1.5 text-[0.78rem] font-medium text-[var(--on-surface-dim)]"
                       >
                         {skill}
                       </span>
                     ))}
                   </div>
                 </label>
               );
             })}
           </div>
          ) : (
             <div className="rounded-[1.25rem] border border-dashed border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-10 text-center backdrop-blur-sm">
                 <p className="text-[1.05rem] font-medium text-[var(--on-surface)]">
                   No saved candidates yet
                 </p>
                 <p className="mt-2 text-[0.92rem] text-[var(--on-surface-dim)] max-w-lg mx-auto">
                   Candidates you save during sourcing will appear here. For now, use the available pool to add engineers to the slate.
                 </p>
             </div>
          )}
         
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] bg-[color-mix(in_srgb,var(--surface)_40%,transparent)] p-6 sm:flex-row sm:justify-end sm:p-6">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[2.8rem] cursor-pointer rounded-full border border-[var(--glass-border)] px-6 text-[0.9rem] font-medium text-[var(--on-surface)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface-high)_60%,transparent)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedIds.length}
            className="min-h-[2.8rem] cursor-pointer rounded-full bg-[var(--on-surface)] px-6 text-[0.9rem] font-medium text-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-45 shadow-[0_12px_28px_color-mix(in_srgb,var(--bg-deep)_16%,transparent)] transition-all duration-300 hover:scale-[1.02] hover:bg-[var(--primary)]"
          >
            Add {selectedIds.length > 0 ? selectedIds.length : ""} selected
          </button>
        </div>
      </form>
    </div>
  );
}

function EngineerProfileModal({
  engineer,
  onClose,
  onDecision,
}: {
  engineer: ShortlistEngineer;
  onClose: () => void;
  onDecision: () => void;
}) {
  const next = engineerStatusMeta[engineer.status].next;
  const [activeTab, setActiveTab] = useState<"overview" | "timeline">("overview");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_80%,transparent)] px-4 py-6 backdrop-blur-2xl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="engineer-profile-title"
    >
      <div className="relative flex max-h-[calc(100svh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_95%,transparent),color-mix(in_srgb,var(--surface)_85%,transparent))] shadow-[0_32px_120px_color-mix(in_srgb,var(--bg-deep)_50%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)]">
        <div className="flex items-start justify-between gap-4 border-b border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] p-6 sm:p-8">
          <div className="flex min-w-0 gap-5">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.15rem] border border-[color-mix(in_srgb,var(--primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] font-mono text-[1.1rem] text-[var(--primary)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_15%,transparent)]">
              {initials(engineer.name)}
            </span>
            <div className="min-w-0">
              <p className="label-caps text-[var(--primary)]">
                Developer profile
              </p>
              <h2
                id="engineer-profile-title"
                className="title-serif mt-2 break-words text-[1.65rem] font-medium leading-tight text-[var(--on-surface)]"
              >
                {engineer.name}
              </h2>
              <p className="mt-1.5 text-[0.96rem] text-[var(--on-surface-dim)]">
                {engineer.role} / {engineer.location}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] text-[var(--on-surface-dim)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface-high)_80%,transparent)] hover:text-[var(--on-surface)] shadow-sm"
            aria-label="Close developer profile"
          >
            <IconX size={18} stroke={1.6} />
          </button>
        </div>

        <div className="border-b border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] px-6 sm:px-8 bg-[color-mix(in_srgb,var(--surface)_30%,transparent)]">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "relative pb-3 pt-4 text-[0.92rem] font-medium transition-colors",
                activeTab === "overview"
                  ? "text-[var(--on-surface)]"
                  : "text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
              )}
            >
              Overview
              {activeTab === "overview" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-[var(--primary)]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("timeline")}
              className={cn(
                "relative pb-3 pt-4 text-[0.92rem] font-medium transition-colors",
                activeTab === "timeline"
                  ? "text-[var(--on-surface)]"
                  : "text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
              )}
            >
              Timeline
              {activeTab === "timeline" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-[var(--primary)]" />
              )}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
           {activeTab === "overview" ? (
               <EngineerDrawerContent engineer={engineer} />
           ) : (
               <div className="rounded-[1.25rem] border border-dashed border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-10 text-center backdrop-blur-sm">
                   <p className="text-[1.05rem] font-medium text-[var(--on-surface)]">
                     No timeline events
                   </p>
                   <p className="mt-2 text-[0.92rem] text-[var(--on-surface-dim)] max-w-lg mx-auto">
                     Interaction history and placement progression for this engineer will appear here once actions are taken.
                   </p>
               </div>
           )}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] bg-[color-mix(in_srgb,var(--surface)_40%,transparent)] p-6 sm:flex-row sm:justify-end sm:p-6">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[2.8rem] cursor-pointer rounded-full border border-[var(--glass-border)] px-6 text-[0.9rem] font-medium text-[var(--on-surface)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface-high)_60%,transparent)]"
          >
            Close
          </button>
          {next && (
            <button
              type="button"
              onClick={onDecision}
              className="inline-flex min-h-[2.8rem] cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 text-[0.9rem] font-medium text-[var(--bg)] shadow-[0_12px_28px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition-all duration-300 hover:scale-[1.02]"
            >
              Move to {engineerStatusMeta[next].label}
              <IconArrowRight size={16} stroke={1.6} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EngineerDecisionModal({
  engineer,
  onClose,
  onConfirm,
}: {
  engineer: ShortlistEngineer;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const next = engineerStatusMeta[engineer.status].next;
  const nextLabel = next ? engineerStatusMeta[next].label : "next stage";
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => firstButtonRef.current?.focus(), 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (!next) return null;

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_80%,transparent)] px-4 py-6 backdrop-blur-2xl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="engineer-decision-title"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_95%,transparent),color-mix(in_srgb,var(--surface)_85%,transparent))] shadow-[0_32px_120px_color-mix(in_srgb,var(--bg-deep)_50%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)]">
        <div className="border-b border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-caps text-[var(--primary)]">
                Developer decision
              </p>
              <h2
                id="engineer-decision-title"
                className="title-serif mt-2 text-[1.5rem] font-medium text-[var(--on-surface)]"
              >
                Move {engineer.name} to {nextLabel}?
              </h2>
              <p className="mt-2.5 max-w-2xl text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
                This records the next client-facing signal for the developer
                inside this shortlist. Use it for viewed profiles, intro
                requests, and accepted candidates before the pipeline handoff.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] text-[var(--on-surface-dim)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface-high)_80%,transparent)] hover:text-[var(--on-surface)] shadow-sm"
              aria-label="Close decision modal"
            >
              <IconX size={18} stroke={1.6} />
            </button>
          </div>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
          <InfoTile label="Current" value={engineerStatusMeta[engineer.status].label} />
          <InfoTile label="Next" value={nextLabel} />
          <InfoTile label="Fit" value={`${engineer.score}%`} />
        </div>
        <div className="border-t border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] p-6 sm:p-8">
          <div className="rounded-[1.15rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-5 shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md">
            <p className="text-[0.74rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">
              Talent manager note
            </p>
            <p className="mt-2.5 text-[0.92rem] leading-relaxed text-[var(--on-surface)]">
              {engineer.adminNotes}
            </p>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              ref={firstButtonRef}
              type="button"
              onClick={onClose}
              className="min-h-[2.8rem] cursor-pointer rounded-full border border-[var(--glass-border)] px-6 text-[0.9rem] font-medium text-[var(--on-surface)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface-high)_60%,transparent)]"
            >
              Keep current
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex min-h-[2.8rem] cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 text-[0.9rem] font-medium text-[var(--bg)] shadow-[0_12px_28px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition-all duration-300 hover:scale-[1.02]"
            >
              <IconCheck size={16} stroke={1.6} />
              Confirm {nextLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommandModal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_80%,transparent)] px-4 py-6 backdrop-blur-2xl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortlist-command-title"
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_95%,transparent),color-mix(in_srgb,var(--surface)_85%,transparent))] shadow-[0_32px_120px_color-mix(in_srgb,var(--bg-deep)_50%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)]">
        <div className="flex items-start justify-between gap-4 border-b border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] p-6 sm:p-8">
          <div>
            <p className="label-caps text-[var(--primary)]">
              Focused command
            </p>
            <h2
              id="shortlist-command-title"
              className="title-serif mt-2 text-[1.6rem] font-medium text-[var(--on-surface)]"
            >
              {title}
            </h2>
            <p className="mt-2 max-w-2xl text-[0.96rem] leading-relaxed text-[var(--on-surface-dim)]">
              Review curation state, update notes, add talent, or move the
              slate without crowding the workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] text-[var(--on-surface-dim)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface-high)_80%,transparent)] hover:text-[var(--on-surface)] shadow-sm"
            aria-label="Close command modal"
          >
            <IconX size={18} stroke={1.6} />
          </button>
        </div>
        <div className="max-h-[calc(100svh-13rem)] overflow-y-auto p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

function SendShortlistModal({
  onClose,
  onSubmit,
  shortlist,
}: {
  onClose: () => void;
  onSubmit: (payload: { deadline: string; note: string }) => void;
  shortlist: Shortlist;
}) {
  const [deadline, setDeadline] = useState(shortlist.responseDeadline);
  const [note, setNote] = useState(shortlist.adminNotes);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => firstFieldRef.current?.focus(), 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ deadline, note });
  };

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_80%,transparent)] px-4 py-6 backdrop-blur-2xl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-shortlist-title"
    >
      <form
        onSubmit={submit}
        className="relative w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_95%,transparent),color-mix(in_srgb,var(--surface)_85%,transparent))] shadow-[0_32px_120px_color-mix(in_srgb,var(--bg-deep)_50%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] p-6 sm:p-8">
          <div>
            <p className="label-caps text-[var(--primary)]">
              Client package
            </p>
            <h2
              id="send-shortlist-title"
              className="title-serif mt-2 text-[1.6rem] font-medium text-[var(--on-surface)]"
            >
              Send shortlist to {shortlist.client}
            </h2>
            <p className="mt-2.5 max-w-2xl text-[0.96rem] leading-relaxed text-[var(--on-surface-dim)]">
              Confirm the response deadline and client-facing admin note before
              this slate moves out of draft.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] text-[var(--on-surface-dim)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface-high)_80%,transparent)] hover:text-[var(--on-surface)] shadow-sm"
            aria-label="Close modal"
          >
            <IconX size={18} stroke={1.6} />
          </button>
        </div>

        <div className="grid gap-6 p-6 sm:p-8">
          <div className="grid gap-4 rounded-[1.25rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-5 sm:grid-cols-3 shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md">
            <InfoTile label="Brief" value={shortlist.domain} />
            <InfoTile
              label="Slate"
              value={`${shortlist.engineers.length}/${shortlist.maxSlots}`}
            />
            <InfoTile
              label="Avg fit"
              value={`${average(shortlist.engineers.map((engineer) => engineer.score))}%`}
            />
          </div>

          <label>
            <span className="flex items-center gap-2 text-[0.92rem] font-medium text-[var(--on-surface)]">
              <IconCalendarEvent size={16} stroke={1.6} />
              Response deadline
            </span>
            <input
              ref={firstFieldRef}
              className="mt-2.5 h-12 w-full rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] px-4 text-[0.96rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md"
              onChange={(event) => setDeadline(event.target.value)}
              required
              type="date"
              value={deadline}
            />
          </label>

          <label>
            <span className="text-[0.92rem] font-medium text-[var(--on-surface)]">
              Client-facing note
            </span>
            <textarea
              className="mt-2.5 min-h-36 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-4 text-[0.96rem] leading-relaxed text-[var(--on-surface)] outline-none focus:border-[var(--primary)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md"
              onChange={(event) => setNote(event.target.value)}
              value={note}
            />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] bg-[color-mix(in_srgb,var(--surface)_40%,transparent)] p-6 sm:flex-row sm:justify-end sm:p-6">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[2.8rem] cursor-pointer rounded-full border border-[var(--glass-border)] px-6 text-[0.9rem] font-medium text-[var(--on-surface)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface-high)_60%,transparent)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex min-h-[2.8rem] cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 text-[0.9rem] font-medium text-[var(--bg)] shadow-[0_12px_28px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition-all duration-300 hover:scale-[1.02]"
          >
            <IconSend size={16} stroke={1.6} />
            Send shortlist
          </button>
        </div>
      </form>
    </div>
  );
}

function EngineerDrawerContent({ engineer }: { engineer: ShortlistEngineer }) {
  return (
    <div className="grid gap-6">
      <div className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_30%,transparent)] p-6 shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-start">
          <div>
            <StatusBadge
              label={engineerStatusMeta[engineer.status].label}
              tone={engineerStatusMeta[engineer.status].tone}
            />
            <h3 className="mt-4 text-[1.5rem] font-medium text-[var(--on-surface)]">
              {engineer.name}
            </h3>
            <p className="mt-2.5 text-[0.98rem] leading-relaxed text-[var(--on-surface-dim)]">
              {engineer.adminNotes}
            </p>
          </div>
          <PerformanceScore score={engineer.score} />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-6 shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md">
          <p className="text-[1.05rem] font-medium text-[var(--on-surface)]">
            Fit dimensions
          </p>
          <div className="my-8 grid gap-5">
            {Object.entries(engineer.dimensions).map(([label, value]) => (
              <ScoreBar
                key={label}
                label={formatDimensionLabel(label)}
                value={value}
                large
              />
            ))}
          </div>
        </div>
        <div className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-6 shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md">
          <p className="text-[1.05rem] font-medium text-[var(--on-surface)]">
            Profile facts
          </p>
          <div className="mt-5 grid gap-4">
            <InfoTile label="Location" value={engineer.location} />
            <InfoTile
              label="Monthly rate"
              value={formatRate(engineer.rateUsd)}
            />
            <InfoTile
              label="Availability"
              value={availabilityLabel(engineer.availability)}
            />
            <InfoTile label="Experience" value={`${engineer.yearsExp} years`} />
          </div>
        </div>
      </div>
      <div className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-6 shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md">
        <p className="text-[1.05rem] font-medium text-[var(--on-surface)]">
          Skills
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {engineer.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] px-4 py-2 text-[0.88rem] font-medium text-[var(--on-surface-dim)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] hover:text-[var(--on-surface)]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  description,
  eyebrow,
  plain = false,
  title,
}: {
  description: string;
  eyebrow: string;
  plain?: boolean;
  title: string;
}) {
  return (
    <div className={cn(!plain && "min-w-0")}>
      <p className="label-caps text-[var(--primary)]">{eyebrow}</p>
      <h2 className="title-serif mt-2 text-[clamp(1.48rem,2vw,1.9rem)] font-medium tracking-tight text-[var(--on-surface)]">
        {title}
      </h2>
      <p className="mt-2.5 max-w-2xl text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
        {description}
      </p>
    </div>
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
        className="h-11 w-full cursor-pointer appearance-none rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] pl-10 pr-8 text-[0.92rem] text-[var(--on-surface)] outline-none transition-colors hover:border-[color-mix(in_srgb,var(--primary)_30%,var(--glass-border))] focus:border-[var(--primary)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-md"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}

function AnalyticsCard({
  chart,
  description,
  metric,
  metricTone = "secondary",
  title,
}: {
  chart: React.ReactNode;
  description: string;
  metric: string;
  metricTone?: "primary" | "secondary" | "success";
  title: string;
}) {
  const tone =
    metricTone === "success"
      ? "var(--tertiary)"
      : metricTone === "primary"
        ? "var(--primary)"
        : "var(--secondary)";

  return (
    <article className="flex min-h-[30rem] flex-col rounded-[1.45rem] border border-[var(--glass-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-high)_50%,transparent),color-mix(in_srgb,var(--surface)_20%,transparent))] p-6 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_8%,transparent),inset_0_1px_0_color-mix(in_srgb,white_8%,transparent)] backdrop-blur-xl sm:p-7">
      <div className="flex min-h-[6rem] items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[1.1rem] font-medium text-[var(--on-surface)]">
            {title}
          </p>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">
            {description}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full border px-3 py-1 font-mono text-[0.8rem] font-medium shadow-sm backdrop-blur-sm"
          style={{
            background: `color-mix(in srgb, ${tone} 12%, transparent)`,
            borderColor: `color-mix(in srgb, ${tone} 30%, var(--glass-border))`,
            color: tone,
          }}
        >
          {metric}
        </span>
      </div>
      <div className="mt-6 grid min-h-[20rem] flex-1 rounded-[1.15rem] border border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-4 shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-sm">
        <div className="h-full w-full">{chart}</div>
      </div>
    </article>
  );
}

function ChartAccent({
  children,
  primary,
  secondary,
}: {
  children: React.ReactNode;
  primary?: string;
  secondary?: string;
}) {
  return (
    <div
      className="h-full w-full"
      style={
        {
          ...(primary ? { "--primary": primary } : {}),
          ...(secondary ? { "--secondary": secondary } : {}),
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[1.15rem] border border-[color-mix(in_srgb,var(--glass-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_30%,transparent)] p-4 shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-sm">
      <p className="text-[0.74rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">
        {label}
      </p>
      <p className="mt-1.5 truncate text-[0.94rem] font-medium text-[var(--on-surface)]">
        {value}
      </p>
    </div>
  );
}

function InlineMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[1.05rem] font-medium text-[var(--on-surface)]">
        {value}
      </p>
      <p className="mt-1 truncate text-[0.76rem] text-[var(--on-surface-dim)]">
        {label}
      </p>
    </div>
  );
}

function SignalCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="font-mono text-[0.9rem] font-medium leading-none text-[var(--on-surface)]">
        {value}
      </p>
      <p className="mt-2 text-[0.66rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">
        {label}
      </p>
    </div>
  );
}

function PerformanceScore({
  compact = false,
  score,
}: {
  compact?: boolean;
  score: number;
}) {
  const signal = scoreSignal(score);

  return (
    <div
      className={cn(
        "shrink-0 rounded-[1.25rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_40%,transparent)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_5%,transparent)] backdrop-blur-md",
        compact ? "w-[7rem] p-3" : "p-5",
      )}
      aria-label={`Fit score ${score}, ${signal.label}`}
    >
      <div className="flex items-end justify-between gap-2.5">
        <p
          className={cn(
            "font-mono font-medium leading-none text-[var(--on-surface)]",
            compact ? "text-[1.3rem]" : "text-[2.4rem]",
          )}
        >
          {score}
        </p>
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 font-mono uppercase font-medium leading-none shadow-sm",
            compact ? "text-[0.55rem]" : "text-[0.66rem]",
          )}
          style={{
            background: `color-mix(in srgb, ${signal.tone} 15%, transparent)`,
            borderColor: `color-mix(in srgb, ${signal.tone} 35%, transparent)`,
            color: signal.tone,
          }}
        >
          {signal.label}
        </span>
      </div>
      <div className="mt-3 h-[0.35rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_12%,transparent)]">
        <span
          className="block h-full rounded-full transition-all duration-500"
          style={{ background: signal.tone, width: `${score}%` }}
        />
      </div>
      {!compact && (
        <p className="mt-3.5 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
          {signal.summary}
        </p>
      )}
    </div>
  );
}

function ScoreBar({
  label,
  large = false,
  tone,
  value,
}: {
  label: string;
  large?: boolean;
  tone?: string;
  value: number;
}) {
  const barTone = tone ?? "var(--on-surface)";

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-[0.82rem] text-[var(--on-surface-dim)]">
        <span className="capitalize">{label}</span>
        <span className="font-mono font-medium text-[var(--on-surface)]">{value}</span>
      </div>
      <div
        className={cn(
          "mt-2.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]",
          large ? "h-[0.45rem]" : "h-1.5",
        )}
      >
        <span
          className="block h-full rounded-full transition-all duration-500"
          style={{ background: barTone, width: `${value}%` }}
        />
      </div>
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
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_40%,transparent)] text-[var(--on-surface-dim)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface-high)_60%,transparent)] hover:text-[var(--on-surface)] shadow-sm backdrop-blur-sm",
        danger && "hover:text-[var(--error)] hover:border-[color-mix(in_srgb,var(--error)_30%,transparent)]",
      )}
    >
      {children}
    </button>
  );
}

function buildMetrics(shortlists: Shortlist[]) {
  const engineers = shortlists.flatMap((shortlist) => shortlist.engineers);
  const active = shortlists.filter(
    (shortlist) => shortlist.status !== "decided",
  ).length;
  const clientReviewing = shortlists.filter(
    (shortlist) => shortlist.status === "client_reviewing",
  ).length;
  const draft = shortlists.filter(
    (shortlist) => shortlist.status === "draft",
  ).length;
  const sent = shortlists.filter(
    (shortlist) => shortlist.status === "sent",
  ).length;
  const introRequests = engineers.filter(
    (engineer) => engineer.status === "intro_requested",
  ).length;
  const totalSlots = shortlists.reduce(
    (sum, shortlist) => sum + shortlist.maxSlots,
    0,
  );
  const filledSlots = engineers.length;

  return {
    active,
    averageScore: average(engineers.map((engineer) => engineer.score)),
    clientReviewing,
    draft,
    introRequests,
    sent,
    slotFill: totalSlots ? Math.round((filledSlots / totalSlots) * 100) : 0,
  };
}

function advanceEventForStatus(
  event: EngagementEvent,
  status: ShortlistStatus,
  now: string,
) {
  if (event.done) return event;
  if (status === "sent" && event.label === "Sent to client")
    return { ...event, at: now, done: true };
  if (status === "client_reviewing" && event.label === "Client viewed")
    return { ...event, at: now, done: true };
  if (status === "decided" && event.label === "Decision")
    return { ...event, at: now, done: true };
  return event;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

function averageDimensions(engineers: ShortlistEngineer[]) {
  return {
    availability: average(
      engineers.map((engineer) => engineer.dimensions.availability),
    ),
    domain: average(engineers.map((engineer) => engineer.dimensions.domain)),
    seniority: average(
      engineers.map((engineer) => engineer.dimensions.seniority),
    ),
    stack: average(engineers.map((engineer) => engineer.dimensions.stack)),
  };
}

function scoreSignal(score: number) {
  if (score >= 90) {
    return {
      label: "Prime",
      summary: "Lead recommendation",
      tone: "var(--tertiary)",
    };
  }
  if (score >= 84) {
    return {
      label: "Strong",
      summary: "Client-ready with minor tradeoffs",
      tone: "var(--primary)",
    };
  }
  return {
    label: "Watch",
    summary: "Review gaps before client emphasis",
    tone: "var(--on-surface-dim)",
  };
}

function dimensionTone(value: string) {
  if (value === "availability") return "var(--tertiary)";
  if (value === "domain") return "var(--primary)";
  if (value === "seniority") return "var(--on-surface)";
  return "var(--on-surface-dim)";
}

function formatDimensionLabel(value: string) {
  if (value === "availability") return "Availability";
  if (value === "seniority") return "Seniority";
  if (value === "domain") return "Domain";
  return "Stack";
}

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function formatRate(value: number) {
  return `$${(value / 1000).toFixed(1).replace(".0", "")}k/mo`;
}

function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function availabilityLabel(value: ShortlistEngineer["availability"]) {
  if (value === "immediate") return "Available now";
  if (value === "2_weeks") return "2 weeks";
  return "1 month";
}
