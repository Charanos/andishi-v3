"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconBriefcase,
  IconBuilding,
  IconCalendarEvent,
  IconCheck,
  IconCurrencyDollar,
  IconFilter,
  IconFlag,
  IconGitMerge,
  IconExternalLink,
  IconLayoutKanban,
  IconListDetails,
  IconMessageCircle,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUsersGroup,
  IconX,
  type Icon,
} from "@tabler/icons-react";
import { AdminWorkflowNav } from "@/components/dashboard/admin/admin-workflow-nav";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import {
  DashboardBarChart,
  DashboardDonutChart,
  DashboardLineChart,
} from "@/components/dashboard/shared/dashboard-chart";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import {
  OperationalDataTable,
  type OperationalTableColumn,
} from "@/components/dashboard/shared/operational-data-table";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { SectionDivider } from "@/components/ui/section-divider";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type PipelineStage =
  | "brief_received"
  | "shortlisting"
  | "profiles_sent"
  | "intro_scheduled"
  | "placement_confirmed";

type Priority = "high" | "normal" | "low";
type CardStatus = "on_track" | "at_risk" | "blocked" | "new";
type PipelineFilter = PipelineStage | "all";
type StatusFilter = CardStatus | "all";
type PriorityFilter = Priority | "all";
type DetailTab = "context" | "timeline";

type StageEvent = {
  date: string;
  label: string;
  note?: string;
  owner: string;
  stage: PipelineStage;
};

type PipelineCard = {
  briefTitle: string;
  cardStatus: CardStatus;
  client: string;
  clientTier: string;
  daysInStage: number;
  engineerInitials: string[];
  engineers: string[];
  estimatedValue: number;
  id: string;
  introSlot?: string;
  nextStep: string;
  notes: string;
  owner: string;
  priority: Priority;
  stage: PipelineStage;
  stageHistory: StageEvent[];
  tags: string[];
  totalDays: number;
  vertical: string;
};

// ─── Constants & Configuration ────────────────────────────────────────────────

const stages: Array<{ avgDays: number; conversionFromPrev?: number; id: PipelineStage; label: string; slaHours: number }> = [
  { avgDays: 0.8, id: "brief_received", label: "Brief Received", slaHours: 24 },
  { avgDays: 1.4, conversionFromPrev: 78, id: "shortlisting", label: "Shortlisting", slaHours: 48 },
  { avgDays: 2.1, conversionFromPrev: 64, id: "profiles_sent", label: "Profiles Sent", slaHours: 72 },
  { avgDays: 1.9, conversionFromPrev: 67, id: "intro_scheduled", label: "Intro Scheduled", slaHours: 96 },
  { avgDays: 0, conversionFromPrev: 83, id: "placement_confirmed", label: "Placement Confirmed", slaHours: 9999 },
];

const stageDescriptions: Record<PipelineStage, string> = {
  brief_received: "New demand awaiting triage",
  intro_scheduled: "Intro confirmed with client",
  placement_confirmed: "Signed and ready for delivery",
  profiles_sent: "Profiles shared for review",
  shortlisting: "Candidates being ranked",
};

const stageOrder = stages.map((s) => s.id);
const stageConfig = Object.fromEntries(stages.map((s) => [s.id, s])) as Record<PipelineStage, typeof stages[number]>;

const stageAccent: Record<PipelineStage, { border: string; dot: string; fill: string; text: string }> = {
  brief_received: { border: "border-[color-mix(in_srgb,var(--on-surface-dim)_24%,var(--glass-border))]", dot: "bg-[var(--on-surface-dim)]", fill: "bg-[color-mix(in_srgb,var(--on-surface-dim)_18%,transparent)]", text: "text-[var(--on-surface-dim)]" },
  intro_scheduled: { border: "border-[color-mix(in_srgb,var(--tertiary)_30%,var(--glass-border))]", dot: "bg-[var(--tertiary)]", fill: "bg-[var(--tertiary)]", text: "text-[var(--tertiary)]" },
  placement_confirmed: { border: "border-[color-mix(in_srgb,var(--tertiary)_36%,var(--glass-border))]", dot: "bg-[var(--tertiary)]", fill: "bg-[color-mix(in_srgb,var(--tertiary)_86%,var(--primary)_14%)]", text: "text-[var(--tertiary)]" },
  profiles_sent: { border: "border-[color-mix(in_srgb,var(--primary)_32%,var(--glass-border))]", dot: "bg-[var(--primary)]", fill: "bg-[var(--primary)]", text: "text-[var(--primary)]" },
  shortlisting: { border: "border-[color-mix(in_srgb,var(--secondary)_24%,var(--glass-border))]", dot: "bg-[var(--secondary)]", fill: "bg-[color-mix(in_srgb,var(--secondary)_72%,var(--primary)_28%)]", text: "text-[var(--secondary)]" },
};

const statusMeta: Record<CardStatus, { label: string; tone: "active" | "available" | "neutral" | "overdue" | "pending" }> = {
  at_risk: { label: "At risk", tone: "overdue" },
  blocked: { label: "Blocked", tone: "overdue" },
  new: { label: "New", tone: "neutral" },
  on_track: { label: "On track", tone: "active" },
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seedCards: PipelineCard[] = [
  { briefTitle: "Senior AI engineer for RAG platform", cardStatus: "new", client: "Kijani Analytics", clientTier: "Series A", daysInStage: 0.3, engineerInitials: [], engineers: [], estimatedValue: 9200, id: "pc-001", nextStep: "Clarify vector database requirements", notes: "Urgent client window closes Friday. Needs LangChain and Pinecone depth with evaluation practice.", owner: "Dennis", priority: "high", stage: "brief_received", stageHistory: [{ date: "Today 09:14", label: "Brief received", note: "Submitted from client hiring form", owner: "Maya", stage: "brief_received" }], tags: ["AI", "RAG", "Python"], totalDays: 0.3, vertical: "Fintech" },
  { briefTitle: "AWS platform engineer for migration", cardStatus: "on_track", client: "Cloudify Inc", clientTier: "Series B", daysInStage: 1.2, engineerInitials: [], engineers: [], estimatedValue: 11400, id: "pc-002", nextStep: "Brief clarification call scheduled Tuesday", notes: "Migration from bare metal to EKS. Six month engagement preferred.", owner: "Ops", priority: "normal", stage: "brief_received", stageHistory: [{ date: "Yesterday 14:30", label: "Brief received", note: "Inbound from website", owner: "Sales", stage: "brief_received" }], tags: ["AWS", "Terraform", "K8s"], totalDays: 1.2, vertical: "Cloud" },
  { briefTitle: "Mobile lead for patient app rebuild", cardStatus: "at_risk", client: "MedLink", clientTier: "Series A", daysInStage: 2.1, engineerInitials: [], engineers: [], estimatedValue: 8500, id: "pc-003", nextStep: "Waiting on brief update from client", notes: "React Native preferred. Healthcare compliance experience is useful.", owner: "Dennis", priority: "normal", stage: "brief_received", stageHistory: [{ date: "Jun 1 11:00", label: "Brief received", owner: "Ops", stage: "brief_received" }], tags: ["Mobile", "RN", "Healthcare"], totalDays: 2.1, vertical: "HealthTech" },
  { briefTitle: "Infrastructure rewrite for SaaS monolith", cardStatus: "on_track", client: "BuildFlow", clientTier: "Series B", daysInStage: 1, engineerInitials: ["KA", "ZN"], engineers: ["Kwame Asante", "Zola Ndlovu"], estimatedValue: 13200, id: "pc-004", nextStep: "Rank profiles and send top two to client", notes: "Client wants modular monolith approach. Kwame is the recommended lead candidate.", owner: "Dennis", priority: "high", stage: "shortlisting", stageHistory: [{ date: "May 31 10:00", label: "Brief received", owner: "Maya", stage: "brief_received" }, { date: "Jun 1 09:30", label: "Moved to shortlisting", note: "Three candidates identified", owner: "Dennis", stage: "shortlisting" }], tags: ["Backend", "NestJS", "Postgres"], totalDays: 2, vertical: "SaaS" },
  { briefTitle: "Full-stack engineer for analytics dashboard", cardStatus: "at_risk", client: "StartupHub", clientTier: "Seed", daysInStage: 2.5, engineerInitials: ["AM"], engineers: ["Ada Mensah"], estimatedValue: 9800, id: "pc-005", nextStep: "Ada profile needs vetting signoff", notes: "Client is moving fast and wants an intro before Thursday.", owner: "Talent ops", priority: "normal", stage: "shortlisting", stageHistory: [{ date: "May 30 14:00", label: "Brief received", owner: "Sales", stage: "brief_received" }, { date: "May 31 11:45", label: "Moved to shortlisting", owner: "Talent ops", stage: "shortlisting" }], tags: ["Full-stack", "TypeScript", "Charts"], totalDays: 3.5, vertical: "SaaS" },
  { briefTitle: "Web3 smart contract engineer", cardStatus: "blocked", client: "ChainLedger", clientTier: "Series A", daysInStage: 3.8, engineerInitials: ["BK"], engineers: ["Binta Kouyate"], estimatedValue: 12800, id: "pc-006", nextStep: "Client has not responded to follow-ups", notes: "Binta is ready but the client has gone quiet. Escalate today.", owner: "Dennis", priority: "high", stage: "shortlisting", stageHistory: [{ date: "May 27 09:00", label: "Brief received", owner: "Sales", stage: "brief_received" }, { date: "May 29 10:00", label: "Moved to shortlisting", owner: "Dennis", stage: "shortlisting" }], tags: ["Web3", "Solidity", "Hardhat"], totalDays: 5.8, vertical: "Web3" },
  { briefTitle: "Real-time dashboard for logistics", cardStatus: "on_track", client: "Freight.io", clientTier: "Series A", daysInStage: 1.3, engineerInitials: ["AO", "KA", "ZN"], engineers: ["Amina Otieno", "Kwame Asante", "Zola Ndlovu"], estimatedValue: 10200, id: "pc-007", nextStep: "Awaiting client profile review by Wednesday", notes: "Three profiles sent Monday. Client shortlist review is scheduled.", owner: "Dennis", priority: "normal", stage: "profiles_sent", stageHistory: [{ date: "May 28", label: "Brief received", owner: "Sales", stage: "brief_received" }, { date: "May 30", label: "Shortlisted", owner: "Dennis", stage: "shortlisting" }, { date: "Jun 1 12:00", label: "Profiles sent", note: "Three profiles shared via client portal", owner: "Dennis", stage: "profiles_sent" }], tags: ["Data viz", "Real-time", "React"], totalDays: 4.3, vertical: "Logistics" },
  { briefTitle: "API integration layer for fintech", cardStatus: "at_risk", client: "WealthPilot", clientTier: "Series A", daysInStage: 2.8, engineerInitials: ["AO"], engineers: ["Amina Otieno"], estimatedValue: 9600, id: "pc-008", nextStep: "Follow up with client after profile review window", notes: "Amina is a strong fit. Need client feedback urgently.", owner: "Dennis", priority: "high", stage: "profiles_sent", stageHistory: [{ date: "May 26", label: "Brief received", owner: "Maya", stage: "brief_received" }, { date: "May 28", label: "Shortlisted", owner: "Dennis", stage: "shortlisting" }, { date: "May 30 15:30", label: "Profile sent", owner: "Dennis", stage: "profiles_sent" }], tags: ["API", "Fintech", "Node"], totalDays: 6.8, vertical: "Fintech" },
  { briefTitle: "DevOps automation for cloud platform", cardStatus: "on_track", client: "Cloudify Inc", clientTier: "Series B", daysInStage: 0.4, engineerInitials: ["FA"], engineers: ["Fatima Al-Zahrawi"], estimatedValue: 10800, id: "pc-009", introSlot: "Wed Jun 4, 15:00 EAT", nextStep: "Intro call Wednesday 15:00 EAT", notes: "Fatima confirmed. Client lead is the VP Engineering.", owner: "Dennis", priority: "normal", stage: "intro_scheduled", stageHistory: [{ date: "May 25", label: "Brief received", owner: "Sales", stage: "brief_received" }, { date: "May 27", label: "Shortlisted", owner: "Dennis", stage: "shortlisting" }, { date: "May 29", label: "Profile sent", owner: "Dennis", stage: "profiles_sent" }, { date: "Jun 1 11:00", label: "Intro scheduled", note: "Client selected Fatima", owner: "Dennis", stage: "intro_scheduled" }], tags: ["DevOps", "AWS", "K8s"], totalDays: 7.4, vertical: "Cloud" },
  { briefTitle: "Senior full-stack for B2B SaaS rebuild", cardStatus: "at_risk", client: "OperateHQ", clientTier: "Series A", daysInStage: 1.5, engineerInitials: ["AM"], engineers: ["Ada Mensah"], estimatedValue: 12400, id: "pc-010", introSlot: "Tue Jun 3, 14:00 GMT", nextStep: "Post-call notes pending after Tuesday intro", notes: "Intro happened yesterday. Waiting on Ada's call debrief.", owner: "Dennis", priority: "high", stage: "intro_scheduled", stageHistory: [{ date: "May 24", label: "Brief received", owner: "Maya", stage: "brief_received" }, { date: "May 26", label: "Shortlisted", owner: "Talent ops", stage: "shortlisting" }, { date: "May 28", label: "Profile sent", owner: "Dennis", stage: "profiles_sent" }, { date: "May 31", label: "Intro scheduled", owner: "Dennis", stage: "intro_scheduled" }], tags: ["Full-stack", "Next.js", "SaaS"], totalDays: 9.5, vertical: "SaaS" },
  { briefTitle: "CTO placement for fintech scale-up", cardStatus: "on_track", client: "KashiPay", clientTier: "Series B", daysInStage: 1, engineerInitials: ["AO"], engineers: ["Amina Otieno"], estimatedValue: 13800, id: "pc-011", nextStep: "Onboarding docs sent. Start date June 9", notes: "Contract signed. Amina starts June 9. Monthly rate confirmed.", owner: "Dennis", priority: "normal", stage: "placement_confirmed", stageHistory: [{ date: "May 21", label: "Brief received", owner: "Sales", stage: "brief_received" }, { date: "May 23", label: "Shortlisted", owner: "Dennis", stage: "shortlisting" }, { date: "May 25", label: "Profile sent", owner: "Dennis", stage: "profiles_sent" }, { date: "May 27", label: "Intro scheduled", owner: "Dennis", stage: "intro_scheduled" }, { date: "Jun 1 16:00", label: "Placement confirmed", note: "Contract countersigned", owner: "Dennis", stage: "placement_confirmed" }], tags: ["Fintech", "Leadership", "Full-stack"], totalDays: 12, vertical: "Fintech" },
  { briefTitle: "Lead engineer for HealthTech Series A", cardStatus: "on_track", client: "CareStream", clientTier: "Series A", daysInStage: 3, engineerInitials: ["KA"], engineers: ["Kwame Asante"], estimatedValue: 10500, id: "pc-012", nextStep: "Placement active from June 1", notes: "Kwame onboarded. Timesheet access granted. First week in progress.", owner: "Ops", priority: "normal", stage: "placement_confirmed", stageHistory: [{ date: "May 19", label: "Brief received", owner: "Maya", stage: "brief_received" }, { date: "May 21", label: "Shortlisted", owner: "Talent ops", stage: "shortlisting" }, { date: "May 23", label: "Profile sent", owner: "Dennis", stage: "profiles_sent" }, { date: "May 26", label: "Intro scheduled", owner: "Dennis", stage: "intro_scheduled" }, { date: "May 30", label: "Placement confirmed", owner: "Dennis", stage: "placement_confirmed" }], tags: ["Healthcare", "Backend", "APIs"], totalDays: 14, vertical: "HealthTech" },
];

const velocityLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const velocityData = [4, 7, 5, 9, 11, 8, 12];

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AdminPipelinePage({ boardFocus = false }: { boardFocus?: boolean } = {}) {
  const [cards, setCards] = useState<PipelineCard[]>(seedCards);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<PipelineFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [selectedId, setSelectedId] = useState(seedCards[0]?.id ?? "");
  const [drawerCard, setDrawerCard] = useState<PipelineCard | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [scheduleCard, setScheduleCard] = useState<PipelineCard | null>(null);
  const [confirmCard, setConfirmCard] = useState<PipelineCard | null>(null);

  const filteredCards = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return cards.filter((c) => {
      const searchable = [c.briefTitle, c.client, c.clientTier, c.vertical, c.owner, c.nextStep, c.tags.join(" "), c.engineers.join(" ")].join(" ").toLowerCase();
      const matchesQuery = !needle || searchable.includes(needle);
      const matchesStage = stageFilter === "all" || c.stage === stageFilter;
      const matchesStatus = statusFilter === "all" || c.cardStatus === statusFilter;
      const matchesPriority = priorityFilter === "all" || c.priority === priorityFilter;
      return matchesQuery && matchesStage && matchesStatus && matchesPriority;
    });
  }, [cards, priorityFilter, query, stageFilter, statusFilter]);

  const selectedCard = cards.find((c) => c.id === selectedId) ?? filteredCards[0] ?? null;
  const metrics = useMemo(() => buildMetrics(cards), [cards]);
  const atRiskCount = cards.filter((c) => c.cardStatus === "at_risk" || c.cardStatus === "blocked").length;

  const moveCard = (id: string, nextStage: PipelineStage) => {
    setCards((cur) =>
      cur.map((c) => {
        if (c.id !== id) return c;
        const nextConfig = stageConfig[nextStage];
        return {
          ...c,
          cardStatus: nextStage === "placement_confirmed" ? "on_track" : c.cardStatus,
          daysInStage: 0,
          stage: nextStage,
          stageHistory: [...c.stageHistory, { date: "Now", label: `Moved to ${nextConfig.label}`, owner: "Dennis", stage: nextStage }],
          totalDays: Number((c.totalDays + 0.1).toFixed(1)),
        };
      })
    );
  };

  const advanceCard = (card: PipelineCard) => {
    const next = nextStage(card.stage);
    if (!next) return;
    moveCard(card.id, next);
  };

  const togglePriority = (card: PipelineCard) => {
    setCards((cur) => cur.map((item) => (item.id === card.id ? { ...item, priority: item.priority === "high" ? "normal" : "high" } : item)));
  };

  const markAtRisk = (card: PipelineCard) => {
    setCards((cur) => cur.map((item) => (item.id === card.id ? { ...item, cardStatus: item.cardStatus === "at_risk" ? "on_track" : "at_risk" } : item)));
  };

  const archiveCard = () => {
    if (!confirmCard) return;
    setCards((cur) => cur.filter((c) => c.id !== confirmCard.id));
    if (selectedId === confirmCard.id) setSelectedId("");
    setConfirmCard(null);
  };

  const createCard = (payload: { briefTitle: string; client: string; estimatedValue: number; owner: string; priority: Priority; tags: string[]; vertical: string }) => {
    const created: PipelineCard = {
      briefTitle: payload.briefTitle,
      cardStatus: "new",
      client: payload.client,
      clientTier: "New",
      daysInStage: 0,
      engineerInitials: [],
      engineers: [],
      estimatedValue: payload.estimatedValue,
      id: `pc-${Date.now()}`,
      nextStep: "Review intake and confirm matching criteria",
      notes: "Created from the pipeline command modal.",
      owner: payload.owner,
      priority: payload.priority,
      stage: "brief_received",
      stageHistory: [{ date: "Now", label: "Brief received", owner: payload.owner, stage: "brief_received" }],
      tags: payload.tags,
      totalDays: 0,
      vertical: payload.vertical,
    };
    setCards((cur) => [created, ...cur]);
    setSelectedId(created.id);
    setDrawerCard(created);
    setCreateOpen(false);
  };

  const scheduleIntro = (card: PipelineCard, introSlot: string) => {
    setCards((cur) =>
      cur.map((item) =>
        item.id === card.id
          ? {
              ...item,
              cardStatus: "on_track",
              introSlot,
              nextStep: `Intro scheduled for ${introSlot}`,
              stage: "intro_scheduled",
              stageHistory: [...item.stageHistory, { date: "Now", label: "Intro scheduled", note: introSlot, owner: "Dennis", stage: "intro_scheduled" }],
            }
          : item
      )
    );
    setScheduleCard(null);
  };

  const modalLayer = (
    <>
      <CreatePipelineModal onClose={() => setCreateOpen(false)} onSubmit={createCard} open={createOpen} />
      <ScheduleIntroModal card={scheduleCard} onClose={() => setScheduleCard(null)} onSubmit={scheduleIntro} />
      <PipelineDetailModal card={drawerCard} onClose={() => setDrawerCard(null)} onAdvance={advanceCard} onSchedule={setScheduleCard} />
      <ConfirmDialog confirmLabel="Archive" description={`This removes ${confirmCard?.briefTitle ?? "this item"} from the active talent pipeline while keeping the audit trail conceptually available for backend persistence.`} onCancel={() => setConfirmCard(null)} onConfirm={archiveCard} open={Boolean(confirmCard)} title="Archive pipeline item?" />
    </>
  );

  if (boardFocus) {
    return (
      <div className="grid min-h-[calc(100svh-5rem)] min-w-0 grid-rows-[auto_minmax(0,1fr)] gap-4 py-4 lg:py-5">
        <section className="grid min-h-0 min-w-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-3">
          <PipelineToolbar boardFocus onCreate={() => setCreateOpen(true)} priorityFilter={priorityFilter} query={query} setPriorityFilter={setPriorityFilter} setQuery={setQuery} setStageFilter={setStageFilter} setStatusFilter={setStatusFilter} stageFilter={stageFilter} statusFilter={statusFilter} />
          <SectionDivider />
          <TalentPipelineBoard focus cards={filteredCards} onAdvance={advanceCard} onFlag={togglePriority} onMove={moveCard} onRisk={markAtRisk} onSchedule={setScheduleCard} onSelect={(c) => { setSelectedId(c.id); setDrawerCard(c); }} selectedId={selectedCard?.id} />
        </section>
        {modalLayer}
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <DashboardPageHeader
        className="mb-0"
        title="Pipeline command room"
        description="Move briefs from intake to confirmed placement with the conversion, SLA, value, candidate, and stakeholder signals a talent manager needs at first glance."
        status={<StatusBadge label={`${cards.length} active cards`} tone="neutral" />}
        actions={
          <>
            <button
              type="button"
              onClick={() => { setStatusFilter("at_risk"); setPriorityFilter("all"); setStageFilter("all"); }}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--error)_26%,var(--glass-border))] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
            >
              <IconAlertTriangle size={16} stroke={1.7} />
              Review risk
              <span className="font-mono text-[0.78rem] text-[var(--error)]">{atRiskCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)] shadow-[0_14px_30px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] transition-transform duration-300 hover:-translate-y-px"
            >
              <IconPlus size={16} stroke={1.8} />
              Add pipeline item
            </button>
          </>
        }
      />

      <AdminWorkflowNav active="pipeline" />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => <MetricTile key={metric.label} {...metric} />)}
      </section>

      <SectionDivider />

      <section className="grid min-w-0 gap-7">
        <PipelineObservability cards={cards} />
      </section>

      <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <PipelineDecisionReadiness cards={cards} />
        <PipelineCommandRail
          card={selectedCard}
          onAdvance={() => selectedCard && advanceCard(selectedCard)}
          onArchive={() => selectedCard && setConfirmCard(selectedCard)}
          onInspect={() => selectedCard && setDrawerCard(selectedCard)}
          onMarkRisk={() => selectedCard && markAtRisk(selectedCard)}
          onSchedule={() => selectedCard && setScheduleCard(selectedCard)}
          onTogglePriority={() => selectedCard && togglePriority(selectedCard)}
        />
      </section>

      <SectionDivider />

      <section className="grid gap-5">
        <PipelineToolbar boardFocus={false} onCreate={() => setCreateOpen(true)} priorityFilter={priorityFilter} query={query} setPriorityFilter={setPriorityFilter} setQuery={setQuery} setStageFilter={setStageFilter} setStatusFilter={setStatusFilter} stageFilter={stageFilter} statusFilter={statusFilter} />
        <TalentPipelineBoard cards={filteredCards} onAdvance={advanceCard} onFlag={togglePriority} onMove={moveCard} onRisk={markAtRisk} onSchedule={setScheduleCard} onSelect={(c) => { setSelectedId(c.id); setDrawerCard(c); }} selectedId={selectedCard?.id} />
      </section>

      <PipelineMatrix cards={filteredCards} onSelect={(c) => { setSelectedId(c.id); setDrawerCard(c); }} />

      {modalLayer}
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function MetricTile({ detail, icon: Icon, label, tone, value }: { detail: string; icon: Icon; label: string; tone: "neutral" | "primary" | "risk" | "success"; value: string }) {
  const toneClass = {
    neutral: "border-[var(--glass-border)] text-[var(--on-surface-dim)]",
    primary: "border-[color-mix(in_srgb,var(--primary)_26%,var(--glass-border))] text-[var(--primary)]",
    risk: "border-[color-mix(in_srgb,var(--error)_28%,var(--glass-border))] text-[var(--error)]",
    success: "border-[color-mix(in_srgb,var(--tertiary)_28%,var(--glass-border))] text-[var(--tertiary)]",
  }[tone];
  const railWidth = tone === "success" ? "86%" : tone === "risk" ? "72%" : tone === "primary" ? "64%" : "46%";

  return (
    <article className={cn("flex min-h-[9.5rem] min-w-0 flex-col justify-between overflow-hidden rounded-[1.25rem] border bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_44%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] p-5 shadow-[0_12px_34px_color-mix(in_srgb,var(--bg-deep)_6%,transparent),inset_0_1px_0_color-mix(in_srgb,white_14%,transparent)] backdrop-blur-2xl transition-all duration-300 hover:shadow-[0_20px_48px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]", toneClass)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.76rem] uppercase tracking-[0.12em] font-medium text-[var(--on-surface-dim)]">{label}</p>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_60%,transparent)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-md transition-colors duration-300">
          <Icon size={16} stroke={1.6} />
        </span>
      </div>
      <div className="mt-5">
        <p className="font-mono text-[1.8rem] font-medium leading-none text-[var(--on-surface)]">{value}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[0.82rem] font-medium text-[var(--on-surface-dim)]">{detail}</p>
          <span aria-hidden className="h-[0.35rem] w-16 shrink-0 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
            <span className="block h-full rounded-full transition-all duration-700 ease-out" style={{ width: railWidth, background: `linear-gradient(90deg, color-mix(in srgb, current 30%, transparent), current)` }} />
          </span>
        </div>
      </div>
    </article>
  );
}

function PipelineObservability({ cards }: { cards: PipelineCard[] }) {
  const stageCounts = stages.map((s) => cards.filter((c) => c.stage === s.id).length);
  const activeValue = cards.reduce((s, c) => s + c.estimatedValue, 0);

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="label-caps text-[var(--primary)]">Pipeline observability</p>
          <h2 className="title-serif mt-2 text-[clamp(1.45rem,2vw,1.85rem)] font-medium leading-tight text-[var(--on-surface)]">Stage load and movement</h2>
          <p className="mt-2 max-w-3xl text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">Counts by stage, daily movement, and active monthly value are visible together so bottlenecks are not hidden inside the board.</p>
        </div>
        <span className="w-fit rounded-full border border-[var(--glass-border)] px-3 py-2 font-mono text-[0.8rem] text-[var(--on-surface)]">${Math.round(activeValue / 1000)}k/mo</span>
      </div>
      <div className="mt-6 grid min-w-0 gap-5 lg:grid-cols-2">
        <ChartPanel description="Active cards by current stage." label="Stage distribution" value={`${cards.length} active`}>
          <DashboardBarChart data={stageCounts} height={280} labels={stages.map((s) => compactStageLabel(s.label))} />
        </ChartPanel>
        <ChartPanel description="Cards moved per day this week." label="Velocity" value="+12 today">
          <DashboardLineChart data={velocityData} height={280} labels={velocityLabels} variant="area" />
        </ChartPanel>
      </div>
    </div>
  );
}

function PipelineDecisionReadiness({ cards }: { cards: PipelineCard[] }) {
  const healthData = [
    { label: "On track", tone: "success" as const, value: cards.filter((c) => c.cardStatus === "on_track").length },
    { label: "New", tone: "muted" as const, value: cards.filter((c) => c.cardStatus === "new").length },
    { label: "Risk", tone: "primary" as const, value: cards.filter((c) => c.cardStatus === "at_risk" || c.cardStatus === "blocked").length },
  ];
  const riskCount = healthData.find((item) => item.label === "Risk")?.value ?? 0;
  const readiness = cards.length > 0 ? Math.round(((cards.length - riskCount) / cards.length) * 100) : 0;

  return (
    <article className="min-w-0 overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] p-5 shadow-[0_16px_45px_color-mix(in_srgb,var(--bg-deep)_6%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-2xl sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-caps text-[var(--primary)]">Health mix</p>
          <h2 className="title-serif mt-2 text-[1.35rem] font-medium leading-tight text-[var(--on-surface)]">Decision readiness</h2>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">Risk and fresh intake split across the active board.</p>
        </div>
        <span className="rounded-full border border-[var(--glass-border)] px-3 py-1.5 font-mono text-[0.72rem] text-[var(--on-surface)]">{readiness}% ready</span>
      </div>
      <div className="mt-5">
        <DashboardDonutChart data={healthData} height={180} thickness="slim" />
      </div>
    </article>
  );
}

function ChartPanel({ children, description, label, value }: { children: ReactNode; description: string; label: string; value: string }) {
  return (
    <div className="flex min-h-[24rem] min-w-0 flex-col overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-2xl sm:p-6">
      <div className="flex min-h-[4.75rem] items-start justify-between gap-3">
        <div>
          <p className="text-[1rem] font-medium text-[var(--on-surface)]">{label}</p>
          <p className="mt-1 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{description}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--glass-border)] px-3 py-1.5 font-mono text-[0.72rem] text-[var(--on-surface)]">{value}</span>
      </div>
      <div className="mt-5 grid min-h-0 flex-1 place-items-stretch rounded-[1rem] border border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--surface)_62%,transparent)] p-3">
        <div className="min-h-0 w-full">{children}</div>
      </div>
    </div>
  );
}

function PipelineCommandRail({ card, onAdvance, onArchive, onInspect, onMarkRisk, onSchedule, onTogglePriority }: { card: PipelineCard | null; onAdvance: () => void; onArchive: () => void; onInspect: () => void; onMarkRisk: () => void; onSchedule: () => void; onTogglePriority: () => void }) {
  if (!card) {
    return (
      <aside className="rounded-[1.5rem] border border-dashed border-[var(--glass-border)] p-6 text-center">
        <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">No item selected</p>
        <p className="mt-2 text-[0.84rem] text-[var(--on-surface-dim)]">Select a pipeline card to see next actions.</p>
      </aside>
    );
  }

  return (
    <aside className="grid min-w-0 gap-5 overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] p-5 shadow-[0_18px_50px_color-mix(in_srgb,var(--bg-deep)_7%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-2xl lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="label-caps text-[var(--primary)]">Command rail</p>
            <h2 className="title-serif mt-2 line-clamp-2 text-[1.4rem] font-medium leading-tight text-[var(--on-surface)]">{card.client}</h2>
            <p className="mt-1 text-[0.86rem] text-[var(--on-surface-dim)]">{stageConfig[card.stage].label} / {card.owner}</p>
          </div>
          <StatusBadge label={statusMeta[card.cardStatus].label} tone={statusMeta[card.cardStatus].tone} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <SignalCell label="Value" value={`$${(card.estimatedValue / 1000).toFixed(1)}k`} />
          <SignalCell label="In stage" value={`${card.daysInStage.toFixed(1)}d`} />
          <SignalCell label="Engineers" value={String(card.engineers.length)} />
          <SignalCell label="Total age" value={`${card.totalDays.toFixed(1)}d`} />
        </div>

        <div className="mt-5 rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-4">
          <p className="text-[0.78rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">Operator signal</p>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-[var(--on-surface)]">{getOperatorInsight(card)}</p>
        </div>
      </div>

      <div className="grid content-start gap-2">
        <button type="button" onClick={onInspect} className="flex min-h-10 cursor-pointer items-center justify-between rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] transition-colors duration-200 hover:bg-[var(--glass-bg)] hover:text-[var(--primary)]">
          Inspect item <IconListDetails size={16} stroke={1.7} />
        </button>
        <button type="button" onClick={onAdvance} disabled={!nextStage(card.stage)} className="flex min-h-10 cursor-pointer items-center justify-between rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)] shadow-[0_8px_20px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)] transition-transform duration-200 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45">
          Move forward <IconArrowRight size={16} stroke={1.7} />
        </button>
        {card.stage === "placement_confirmed" && (
          <Link href="/admin/placements" className="flex min-h-10 cursor-pointer items-center justify-between rounded-full border border-[color-mix(in_srgb,var(--tertiary)_28%,var(--glass-border))] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] hover:bg-[color-mix(in_srgb,var(--tertiary)_7%,transparent)]">
            Open placements <IconBriefcase size={16} stroke={1.7} />
          </Link>
        )}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <button type="button" onClick={onSchedule} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.84rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]">
            <IconCalendarEvent size={15} stroke={1.7} /> Schedule
          </button>
          <button type="button" onClick={onMarkRisk} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--error)_24%,var(--glass-border))] px-4 text-[0.84rem] font-medium text-[var(--on-surface)] hover:bg-[color-mix(in_srgb,var(--error)_7%,transparent)]">
            <IconAlertTriangle size={15} stroke={1.7} /> Toggle risk
          </button>
          <button type="button" onClick={onTogglePriority} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.84rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]">
            <IconFlag size={15} stroke={1.7} /> Priority
          </button>
          <button type="button" onClick={onArchive} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--error)_28%,var(--glass-border))] px-4 text-[0.84rem] font-medium text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]">
            <IconTrash size={15} stroke={1.7} /> Archive
          </button>
        </div>
      </div>
    </aside>
  );
}

function SignalCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_18%,transparent)] p-3">
      <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">{label}</p>
      <p className="mt-1 font-mono text-[1.1rem] font-medium text-[var(--on-surface)]">{value}</p>
    </div>
  );
}

function PipelineToolbar({ boardFocus = false, onCreate, priorityFilter, query, setPriorityFilter, setQuery, setStageFilter, setStatusFilter, stageFilter, statusFilter }: { boardFocus?: boolean; onCreate?: () => void; priorityFilter: PriorityFilter; query: string; setPriorityFilter: (v: PriorityFilter) => void; setQuery: (v: string) => void; setStageFilter: (v: PipelineFilter) => void; setStatusFilter: (v: StatusFilter) => void; stageFilter: PipelineFilter; statusFilter: StatusFilter }) {
  return (
    <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", boardFocus && "px-1")}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="label-caps text-[var(--primary)]">{boardFocus ? "Board focus" : "Board command"}</p>
        </div>
        <h2 className="title-serif mt-2 text-[1.2rem] font-medium text-[var(--on-surface)]">{boardFocus ? "Pipeline operating board" : "Pipeline board"}</h2>
        <p className={cn("mt-1 max-w-2xl text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]", boardFocus && "hidden 2xl:block")}>
          {boardFocus ? "Move briefs, inspect risk, schedule intros, and keep every stage readable on a workspace built for board work." : "Search, filter, inspect, schedule, and advance client work without leaving the board context."}
        </p>
        {!boardFocus && (
          <Link href="/admin/matches/board" target="_blank" className="mt-3 inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-3 text-[0.8rem] font-medium text-[var(--on-surface)] transition-colors duration-300 hover:bg-[var(--glass-bg)] hover:text-[var(--primary)]">
            <IconExternalLink size={15} stroke={1.6} /> Open board focus
          </Link>
        )}
      </div>
      <div className={cn("grid gap-2 sm:grid-cols-2", boardFocus ? "lg:grid-cols-[minmax(18rem,1fr)_9.5rem_9.5rem_9rem_auto_auto]" : "lg:grid-cols-[19rem_10rem_10rem_9rem]")}>
        <label className="relative min-w-0">
          <span className="sr-only">Search pipeline</span>
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]" size={16} stroke={1.6} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search client, brief, engineer..." className="h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-10 pr-4 text-[0.88rem] text-[var(--on-surface)] outline-none transition-colors placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]" />
        </label>
        <FilterSelect label="Stage filter" onChange={(v) => setStageFilter(v as PipelineFilter)} value={stageFilter}>
          <option value="all">All stages</option>
          {stages.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </FilterSelect>
        <FilterSelect label="Status filter" onChange={(v) => setStatusFilter(v as StatusFilter)} value={statusFilter}>
          <option value="all">All status</option>
          <option value="on_track">On track</option>
          <option value="new">New</option>
          <option value="at_risk">At risk</option>
          <option value="blocked">Blocked</option>
        </FilterSelect>
        <FilterSelect label="Priority filter" onChange={(v) => setPriorityFilter(v as PriorityFilter)} value={priorityFilter}>
          <option value="all">Priority</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </FilterSelect>
        {boardFocus && (
          <>
            <Link href="/admin/matches" className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] transition-colors duration-200 hover:bg-[var(--glass-bg)] hover:text-[var(--primary)]">
              <IconArrowLeft size={16} stroke={1.7} /> Exit
            </Link>
            <button type="button" onClick={onCreate} className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)] shadow-[0_14px_30px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] transition-transform duration-200 hover:-translate-y-px">
              <IconPlus size={16} stroke={1.8} /> Add
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ children, label, onChange, value }: { children: ReactNode; label: string; onChange: (v: string) => void; value: string }) {
  return (
    <label className="relative min-w-0">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full cursor-pointer appearance-none rounded-full border border-[var(--glass-border)] bg-[var(--surface)] px-4 pr-10 text-[0.86rem] text-[var(--on-surface)] outline-none transition-colors focus:border-[var(--primary)]">
        {children}
      </select>
      <IconFilter className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]" size={15} stroke={1.6} />
    </label>
  );
}

function TalentPipelineBoard({ cards, focus = false, onAdvance, onFlag, onMove, onRisk, onSchedule, onSelect, selectedId }: { cards: PipelineCard[]; focus?: boolean; onAdvance: (c: PipelineCard) => void; onFlag: (c: PipelineCard) => void; onMove: (id: string, s: PipelineStage) => void; onRisk: (c: PipelineCard) => void; onSchedule: (c: PipelineCard) => void; onSelect: (c: PipelineCard) => void; selectedId?: string }) {
  return (
    <div className={cn("min-w-0 overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface)_72%,transparent)] to-[color-mix(in_srgb,var(--surface)_40%,transparent)] p-2 shadow-[0_18px_52px_color-mix(in_srgb,var(--bg-deep)_7%,transparent)] sm:p-3", focus && "h-full min-h-[34rem] rounded-[1.25rem]")}>
      <div className="h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-3 [scrollbar-gutter:stable]">
        <div className={cn("grid grid-flow-col gap-4", focus ? "h-full auto-cols-[minmax(22rem,25rem)] sm:auto-cols-[minmax(25rem,29rem)] xl:auto-cols-[minmax(28rem,32rem)]" : "auto-cols-[minmax(20rem,22rem)] sm:auto-cols-[minmax(22rem,24rem)] xl:auto-cols-[minmax(23rem,25rem)]")}>
          {stages.map((stage) => {
            const columnCards = cards.filter((c) => c.stage === stage.id);
            return <PipelineColumn key={stage.id} cards={columnCards} onAdvance={onAdvance} onFlag={onFlag} onMove={onMove} onRisk={onRisk} onSchedule={onSchedule} onSelect={onSelect} selectedId={selectedId} focus={focus} stage={stage} />;
          })}
        </div>
      </div>
    </div>
  );
}

function PipelineColumn({ cards, focus, onAdvance, onFlag, onMove, onRisk, onSchedule, onSelect, selectedId, stage }: { cards: PipelineCard[]; focus: boolean; onAdvance: (c: PipelineCard) => void; onFlag: (c: PipelineCard) => void; onMove: (id: string, s: PipelineStage) => void; onRisk: (c: PipelineCard) => void; onSchedule: (c: PipelineCard) => void; onSelect: (c: PipelineCard) => void; selectedId?: string; stage: typeof stages[number] }) {
  const accent = stageAccent[stage.id];
  const stageValue = cards.reduce((s, c) => s + c.estimatedValue, 0);

  return (
    <section className={cn("flex min-w-0 snap-start flex-col overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-3 backdrop-blur-md sm:p-4", focus ? "h-full max-h-none" : "max-h-[74svh] xl:max-h-[calc(100svh-11rem)]")}>
      <div className="shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", accent.dot)} />
              <h3 className="truncate text-[0.95rem] font-medium text-[var(--on-surface)]">{stage.label}</h3>
            </div>
            <p className="mt-1 font-mono text-[0.72rem] text-[var(--on-surface-dim)]">{cards.length} cards / ${Math.round(stageValue / 1000)}k</p>
            <p className="mt-1 truncate text-[0.76rem] text-[var(--on-surface-dim)]">{stageDescriptions[stage.id]}</p>
          </div>
          <span className="rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_40%,transparent)] px-2.5 py-1 font-mono text-[0.68rem] font-medium text-[var(--on-surface-dim)]">
            {stage.slaHours >= 9999 ? "won" : `${stage.slaHours}h SLA`}
          </span>
        </div>
        <div className="mt-4 h-[0.22rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_9%,transparent)]">
          <span className={cn("block h-full rounded-full transition-all duration-500", accent.fill)} style={{ width: `${Math.min(100, cards.length * 18 + 12)}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[0.72rem] text-[var(--on-surface-dim)] font-medium uppercase tracking-[0.05em]">
          <span>Avg {stage.avgDays}d</span>
          <span className="text-right">{stage.conversionFromPrev ? `${stage.conversionFromPrev}% conv.` : "Intake"}</span>
        </div>
      </div>
      <div className="mt-4 flex min-h-0 flex-1 flex-col content-start gap-3 overflow-y-auto pr-1 pb-1">
        {cards.map((card) => <PipelineWorkCard key={card.id} card={card} onAdvance={() => onAdvance(card)} onFlag={() => onFlag(card)} onMove={(n) => onMove(card.id, n)} onRisk={() => onRisk(card)} onSchedule={() => onSchedule(card)} onSelect={() => onSelect(card)} selected={card.id === selectedId} />)}
        {!cards.length && (
          <div className="rounded-[1.2rem] border border-dashed border-[var(--glass-border)] px-3 py-8 text-center">
            <p className="text-[0.82rem] font-medium text-[var(--on-surface-dim)]">No cards in stage.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function PipelineWorkCard({ card, onAdvance, onFlag, onMove, onRisk, onSchedule, onSelect, selected }: { card: PipelineCard; onAdvance: () => void; onFlag: () => void; onMove: (s: PipelineStage) => void; onRisk: () => void; onSchedule: () => void; onSelect: () => void; selected: boolean }) {
  const accent = stageAccent[card.stage];
  const overSla = isOverSla(card);
  const progress = ((stageOrder.indexOf(card.stage) + 1) / stageOrder.length) * 100;
  const cardBorder = card.cardStatus === "blocked" ? "border-[color-mix(in_srgb,var(--error)_46%,var(--glass-border))] bg-gradient-to-br from-[color-mix(in_srgb,var(--error)_4%,var(--surface))] to-[var(--surface)]" : card.cardStatus === "at_risk" ? "border-[color-mix(in_srgb,var(--primary)_36%,var(--glass-border))] bg-gradient-to-br from-[color-mix(in_srgb,var(--primary)_4%,var(--surface))] to-[var(--surface)]" : selected ? `${accent.border} bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,var(--surface))] to-[var(--surface)] shadow-[0_12px_24px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)]` : "border-[var(--glass-border)] bg-[var(--surface)] hover:border-[color-mix(in_srgb,var(--primary)_20%,var(--glass-border))] hover:shadow-[0_12px_24px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]";

  return (
    <article className={cn("group overflow-hidden rounded-[1.3rem] border p-4 transition-all duration-300", cardBorder)}>
      <button type="button" onClick={onSelect} className="block w-full cursor-pointer text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {card.priority === "high" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--error)_28%,transparent)] px-2 py-0.5 text-[0.64rem] uppercase tracking-[0.08em] font-medium text-[var(--error)]">
                  <IconFlag size={10} stroke={1.8} /> High
                </span>
              )}
              <StatusBadge label={statusMeta[card.cardStatus].label} tone={statusMeta[card.cardStatus].tone} />
            </div>
            <h4 className="mt-2.5 line-clamp-2 text-[0.96rem] font-medium leading-snug text-[var(--on-surface)]">{card.briefTitle}</h4>
          </div>
          <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl border bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] backdrop-blur-sm transition-colors duration-300", accent.border, accent.text)}>
            <IconGitMerge size={18} stroke={1.6} />
          </span>
        </div>

        <div className="mt-3.5 grid gap-2 text-[0.8rem] text-[var(--on-surface-dim)]">
          <span className="flex min-w-0 items-center gap-2">
            <IconBuilding size={14} stroke={1.6} />
            <span className="truncate">{card.client} / {card.clientTier}</span>
          </span>
          <span className="flex min-w-0 items-center gap-2">
            <IconUsersGroup size={14} stroke={1.6} />
            <EngineerAvatars initials={card.engineerInitials} />
          </span>
        </div>

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {card.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_16%,transparent)] px-2 py-1 text-[0.68rem] text-[var(--on-surface-dim)]">{tag}</span>)}
        </div>

        <div className="mt-4.5 grid grid-cols-3 gap-2">
          <CardStat label="Age" value={`${card.totalDays.toFixed(1)}d`} />
          <CardStat label="Stage" value={`${card.daysInStage.toFixed(1)}d`} />
          <CardStat label="Value" value={`$${(card.estimatedValue / 1000).toFixed(1)}k`} />
        </div>
        <div className="mt-4 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_10%,transparent)] p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-[0.66rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)] font-medium">Pipeline path</span>
            <span className="font-mono text-[0.72rem] font-medium text-[var(--on-surface-dim)]">{stageOrder.indexOf(card.stage) + 1}/{stageOrder.length}</span>
          </div>
          <div className="mt-2 h-[0.22rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
            <span className={cn("block h-full rounded-full transition-all duration-500", accent.fill)} style={{ width: `${progress}%` }} />
          </div>
        </div>
        <p className="mt-3.5 line-clamp-2 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">{getOperatorInsight(card)}</p>
        {overSla && <p className="mt-3 rounded-xl border border-[color-mix(in_srgb,var(--error)_28%,transparent)] bg-[color-mix(in_srgb,var(--error)_8%,transparent)] px-3 py-2 text-[0.76rem] text-[var(--error)]">SLA needs attention in this stage.</p>}
      </button>

      <div className="mt-4.5 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--glass-border)] pt-3.5">
        <button type="button" onClick={onRisk} className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-[0.76rem] font-medium text-[var(--on-surface-dim)] transition-colors duration-200 hover:bg-[var(--glass-bg)] hover:text-[var(--primary)]">
          <IconAlertTriangle size={14} stroke={1.6} /> Risk
        </button>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <button type="button" onClick={onSchedule} className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors duration-200 hover:bg-[var(--glass-bg)] hover:text-[var(--on-surface)]" aria-label="Schedule">
            <IconCalendarEvent size={14} stroke={1.6} />
          </button>
          <MoveMenu card={card} onMove={onMove} />
          <button type="button" onClick={onFlag} className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors duration-200 hover:bg-[var(--glass-bg)] hover:text-[var(--on-surface)]" aria-label="Toggle priority">
            <IconFlag size={14} stroke={1.6} />
          </button>
          <button type="button" onClick={onAdvance} disabled={!nextStage(card.stage)} className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors duration-200 hover:bg-[var(--glass-bg)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Advance">
            <IconArrowRight size={14} stroke={1.6} />
          </button>
        </div>
      </div>
    </article>
  );
}

function MoveMenu({ card, onMove }: { card: PipelineCard; onMove: (s: PipelineStage) => void }) {
  return (
    <label className="relative grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors duration-200 hover:bg-[var(--glass-bg)] hover:text-[var(--on-surface)]">
      <span className="sr-only">Move card</span>
      <IconLayoutKanban className="pointer-events-none" size={14} stroke={1.6} />
      <select value={card.stage} onChange={(e) => onMove(e.target.value as PipelineStage)} className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0">
        {stages.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
    </label>
  );
}

function CardStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[0.9rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_12%,transparent)] p-2">
      <p className="font-mono text-[0.82rem] font-medium text-[var(--on-surface)]">{value}</p>
      <p className="mt-1 text-[0.62rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">{label}</p>
    </div>
  );
}

function EngineerAvatars({ initials }: { initials: string[] }) {
  if (!initials.length) return <span className="text-[0.78rem] text-[var(--on-surface-dim)]">No engineers yet</span>;
  return (
    <span className="flex items-center gap-0.5">
      {initials.slice(0, 4).map((i, idx) => (
        <span key={i} className="grid h-6 w-6 place-items-center rounded-full border border-[color-mix(in_srgb,var(--glass-border)_80%,transparent)] bg-[var(--surface-high)] font-mono text-[0.6rem] font-medium text-[var(--on-surface)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)]" style={{ marginLeft: idx > 0 ? "-6px" : 0 }}>
          {i}
        </span>
      ))}
    </span>
  );
}

function PipelineMatrix({ cards, onSelect }: { cards: PipelineCard[]; onSelect: (c: PipelineCard) => void }) {
  const columns = useMemo<Array<OperationalTableColumn<PipelineCard>>>(
    () => [
      { key: "briefTitle", label: "Brief", priority: true, render: (c) => (<div className="min-w-0"><p className="truncate text-[0.88rem] font-medium text-[var(--on-surface)]">{c.briefTitle}</p><p className="mt-1 truncate text-[0.76rem] text-[var(--on-surface-dim)]">{c.client} / {c.vertical}</p></div>) },
      { key: "stage", label: "Stage", render: (c) => <span className="font-medium text-[var(--on-surface)]">{stageConfig[c.stage].label}</span> },
      { key: "cardStatus", label: "Status", render: (c) => <StatusBadge label={statusMeta[c.cardStatus].label} tone={statusMeta[c.cardStatus].tone} /> },
      { key: "owner", label: "Owner" },
      { key: "estimatedValue", label: "Value", mono: true, render: (c) => `$${(c.estimatedValue / 1000).toFixed(1)}k/mo` },
      { key: "daysInStage", label: "Stage age", mono: true, render: (c) => `${c.daysInStage.toFixed(1)}d` },
      { key: "nextStep", label: "Next action", hideOnMobile: true },
    ],
    []
  );

  return <OperationalDataTable columns={columns} description="A table view for comparing stage, owner, SLA age, value, and next action across the filtered pipeline." empty="No pipeline cards match the current filters." onRowSelect={onSelect} rows={cards} title="Pipeline data matrix" />;
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function CreatePipelineModal({ onClose, onSubmit, open }: { onClose: () => void; onSubmit: (payload: { briefTitle: string; client: string; estimatedValue: number; owner: string; priority: Priority; tags: string[]; vertical: string }) => void; open: boolean }) {
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const tags = String(fd.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean);
    onSubmit({
      briefTitle: String(fd.get("briefTitle") ?? "").trim() || "New talent pipeline brief",
      client: String(fd.get("client") ?? "").trim() || "New client",
      estimatedValue: Number(fd.get("estimatedValue") ?? 8500) || 8500,
      owner: String(fd.get("owner") ?? "").trim() || "Dennis",
      priority: (String(fd.get("priority") ?? "normal") as Priority) || "normal",
      tags: tags.length ? tags : ["New", "Review"],
      vertical: String(fd.get("vertical") ?? "").trim() || "General",
    });
  };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-8 backdrop-blur-xl" role="dialog" aria-modal="true" aria-labelledby="create-pipeline-title" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form onSubmit={handleSubmit} className="w-full max-w-4xl rounded-[1.75rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,var(--surface))] to-[var(--surface)] p-6 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-7">
        <ModalHeader description="Create an intake-ready pipeline item with enough operational detail for matching and follow-up." icon={IconGitMerge} onClose={onClose} title="Add pipeline item" />
        <div className="mt-7 grid gap-4 border-t border-[color-mix(in_srgb,var(--glass-border)_70%,transparent)] pt-6 md:grid-cols-2">
          <FormField ref={firstInputRef} label="Brief title" name="briefTitle" placeholder="Senior AI engineer for support workflow" />
          <FormField label="Client" name="client" placeholder="Kijani Analytics" />
          <FormField label="Vertical" name="vertical" placeholder="Fintech, SaaS, HealthTech" />
          <FormField label="Owner" name="owner" placeholder="Dennis" />
          <label>
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">Priority</span>
            <select name="priority" className="mt-2 h-11 w-full cursor-pointer rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none transition-colors focus:border-[var(--primary)]">
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
          </label>
          <FormField label="Monthly value" name="estimatedValue" placeholder="9200" type="number" />
          <label className="md:col-span-2">
            <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">Tags</span>
            <input name="tags" placeholder="AI, RAG, Python" className="mt-2 h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none transition-colors placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]" />
          </label>
        </div>
        <ModalActions onClose={onClose} submitLabel="Create item" />
      </form>
    </div>
  );
}

function ScheduleIntroModal({ card, onClose, onSubmit }: { card: PipelineCard | null; onClose: () => void; onSubmit: (c: PipelineCard, slot: string) => void }) {
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!card) return;
    firstInputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [card, onClose]);

  if (!card) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const date = String(fd.get("date") ?? "").trim() || "Jun 4";
    const time = String(fd.get("time") ?? "").trim() || "15:00";
    const tz = String(fd.get("timezone") ?? "").trim() || "EAT";
    onSubmit(card, `${date}, ${time} ${tz}`);
  };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-8 backdrop-blur-xl" role="dialog" aria-modal="true" aria-labelledby="schedule-pipeline-title" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form onSubmit={handleSubmit} className="w-full max-w-3xl rounded-[1.75rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,var(--surface))] to-[var(--surface)] p-6 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-7">
        <ModalHeader description={`Attach an intro slot and move ${card.client} into scheduled-intro context.`} icon={IconCalendarEvent} onClose={onClose} title="Schedule intro" />
        <div className="mt-7 rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-5">
          <p className="text-[1.05rem] font-medium text-[var(--on-surface)]">{card.briefTitle}</p>
          <p className="mt-1 text-[0.88rem] text-[var(--on-surface-dim)]">{card.client} / {card.engineers.length ? card.engineers.join(", ") : "engineer TBD"}</p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <FormField ref={firstInputRef} label="Date" name="date" placeholder="Jun 4" />
          <FormField label="Time" name="time" placeholder="15:00" />
          <FormField label="Timezone" name="timezone" placeholder="EAT" />
        </div>
        <ModalActions onClose={onClose} submitLabel="Save intro" />
      </form>
    </div>
  );
}

function ModalHeader({ description, icon: Icon, onClose, title }: { description: string; icon: Icon; onClose: () => void; title: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)]">
        <Icon size={24} stroke={1.6} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="label-caps text-[var(--primary)]">Pipeline command</p>
        <h2 id={title === "Schedule intro" ? "schedule-pipeline-title" : "create-pipeline-title"} className="title-serif mt-2 text-[1.4rem] font-medium text-[var(--on-surface)]">{title}</h2>
        <p className="mt-2 max-w-2xl text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">{description}</p>
      </div>
      <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors duration-200 hover:bg-[var(--glass-bg)] hover:text-[var(--on-surface)]" aria-label="Close modal">
        <IconX size={18} stroke={1.6} />
      </button>
    </div>
  );
}

function ModalActions({ onClose, submitLabel }: { onClose: () => void; submitLabel: string }) {
  return (
    <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button type="button" onClick={onClose} className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.88rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]">Cancel</button>
      <button type="submit" className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-5 text-[0.88rem] font-medium text-[var(--bg)] shadow-[0_12px_24px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)] hover:-translate-y-px transition-transform duration-200">{submitLabel}</button>
    </div>
  );
}

const FormField = forwardRef<HTMLInputElement, { label: string; name: string; placeholder: string; type?: string }>(function FormField({ label, name, placeholder, type = "text" }, ref) {
  return (
    <label>
      <span className="text-[0.78rem] font-medium text-[var(--on-surface)]">{label}</span>
      <input ref={ref} name={name} placeholder={placeholder} type={type} className="mt-2 h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none transition-colors placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]" />
    </label>
  );
});

// ─── Pipeline Detail Modal (Tabbed Rewrite) ──────────────────────────────────

function PipelineDetailModal({ card, onAdvance, onClose, onSchedule }: { card: PipelineCard | null; onAdvance: (c: PipelineCard) => void; onClose: () => void; onSchedule: (c: PipelineCard) => void }) {
  const [tab, setTab] = useState<DetailTab>("context");

  useEffect(() => {
    if (!card) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [card, onClose]);

  if (!card) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="pipeline-detail-title">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-[color-mix(in_srgb,var(--bg-deep)_76%,transparent)] backdrop-blur-xl" onClick={onClose} />

      <div className="relative flex h-full max-h-[92dvh] w-full max-w-[72rem] flex-col overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_40%,var(--surface))] to-[var(--surface)] shadow-[0_32px_120px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)]">
        
        {/* Header */}
        <div className="flex shrink-0 flex-col gap-4 border-b border-[var(--glass-border)] px-6 pb-0 pt-6 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="label-caps text-[var(--primary)]">Pipeline Inspector</p>
              <h2 id="pipeline-detail-title" className="title-serif mt-2 text-[clamp(1.4rem,2vw,1.8rem)] font-medium leading-tight text-[var(--on-surface)]">
                {card.briefTitle}
              </h2>
              <p className="mt-1.5 text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
                {card.client} · {stageConfig[card.stage].label} · Owner: {card.owner}
              </p>
            </div>
            <button aria-label="Close" className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors duration-200 hover:bg-[var(--glass-bg)] hover:text-[var(--on-surface)]" onClick={onClose} type="button">
              <IconX size={18} stroke={1.6} />
            </button>
          </div>

          <nav className="flex gap-1">
            {(["context", "timeline"] as DetailTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-t-xl px-4 py-2.5 text-[0.84rem] font-medium capitalize transition-all duration-200",
                  tab === t ? "border-b-2 border-[var(--primary)] text-[var(--on-surface)]" : "text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]",
                )}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>

        {/* Scrollable Body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 sm:p-7">
          {tab === "context" && <PipelineContextTab card={card} />}
          {tab === "timeline" && <PipelineTimelineTab card={card} />}
        </div>

        {/* Footer Actions */}
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_30%,transparent)] px-6 py-4 sm:px-7">
          <button type="button" onClick={() => onSchedule(card)} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)] transition-colors duration-200 hover:bg-[var(--glass-bg)]">
            <IconCalendarEvent size={16} stroke={1.6} /> Schedule
          </button>
          <button type="button" onClick={() => onAdvance(card)} disabled={!nextStage(card.stage)} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-5 text-[0.86rem] font-medium text-[var(--bg)] shadow-[0_12px_24px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)] transition-transform duration-200 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45">
            Advance <IconArrowRight size={16} stroke={1.6} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PipelineContextTab({ card }: { card: PipelineCard }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid gap-5 content-start">
        <section className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-5">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <StatusBadge label={statusMeta[card.cardStatus].label} tone={statusMeta[card.cardStatus].tone} />
            <span className="rounded-full border border-[var(--glass-border)] px-3 py-1 font-mono text-[0.72rem] text-[var(--on-surface-dim)]">{stageConfig[card.stage].label}</span>
            {card.priority === "high" && <span className="rounded-full border border-[color-mix(in_srgb,var(--error)_28%,transparent)] px-3 py-1 text-[0.66rem] uppercase tracking-[0.08em] font-medium text-[var(--error)] bg-[color-mix(in_srgb,var(--error)_8%,transparent)]">High Priority</span>}
          </div>
          <p className="max-w-3xl text-[0.94rem] leading-relaxed text-[var(--on-surface)]">{card.notes}</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <SignalCell label="Client" value={card.client} />
          <SignalCell label="Owner" value={card.owner} />
          <SignalCell label="Value" value={`$${(card.estimatedValue / 1000).toFixed(1)}k`} />
          <SignalCell label="Total age" value={`${card.totalDays.toFixed(1)}d`} />
        </section>
      </div>

      <div className="grid gap-5 content-start">
        <section className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-5">
          <p className="text-[1.05rem] font-medium text-[var(--on-surface)]">Stakeholder match context</p>
          <div className="mt-5 grid gap-3.5">
            <ContextRow icon={IconBuilding} label="Client Tier" value={`${card.client} / ${card.clientTier}`} />
            <ContextRow icon={IconBriefcase} label="Vertical" value={card.vertical} />
            <ContextRow icon={IconUsersGroup} label="Engineers" value={card.engineers.length ? card.engineers.join(", ") : "Not assigned"} />
            <ContextRow icon={IconMessageCircle} label="Next action" value={card.nextStep} />
          </div>
        </section>
      </div>
    </div>
  );
}

function PipelineTimelineTab({ card }: { card: PipelineCard }) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] p-6 sm:p-7">
        <p className="text-[1.1rem] font-medium text-[var(--on-surface)]">Stage progression history</p>
        <div className="mt-8 grid gap-0">
          {card.stageHistory.map((event, index) => {
            const isLast = index === card.stageHistory.length - 1;
            return (
              <div key={`${event.stage}-${event.date}-${index}`} className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-4 pb-6 last:pb-0">
                {!isLast && <div className="absolute left-[0.95rem] top-8 bottom-0 w-px bg-[var(--glass-border)]" />}
                <span className={cn("mt-1 grid h-8 w-8 place-items-center rounded-full border text-[0.72rem] font-medium", stageAccent[event.stage].border, stageAccent[event.stage].text, "bg-[var(--surface)]")}>
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[0.96rem] font-medium text-[var(--on-surface)]">{event.label}</p>
                    <span className="font-mono text-[0.78rem] text-[var(--on-surface-dim)]">{event.date}</span>
                  </div>
                  <p className="mt-1 text-[0.82rem] text-[var(--on-surface-dim)]">Action by {event.owner}</p>
                  {event.note && (
                    <p className="mt-3 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2.5 text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
                      {event.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ContextRow({ icon: Icon, label, value }: { icon: Icon; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 rounded-[1.1rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 items-center">
      <span className="grid h-11 w-11 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--primary)_16%,transparent)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] text-[var(--primary)]">
        <Icon size={18} stroke={1.6} />
      </span>
      <div className="min-w-0">
        <p className="text-[0.66rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">{label}</p>
        <p className="mt-1 truncate text-[0.88rem] font-medium text-[var(--on-surface)]">{value}</p>
      </div>
    </div>
  );
}

function buildMetrics(cards: PipelineCard[]) {
  const activeValue = cards.reduce((sum, card) => sum + card.estimatedValue, 0);
  const strongMatches = cards.filter((c) => c.engineers.length >= 2 && c.cardStatus !== "blocked").length;
  const introScheduled = cards.filter((c) => c.stage === "intro_scheduled").length;
  const confirmed = cards.filter((c) => c.stage === "placement_confirmed").length;
  const risk = cards.filter((c) => c.cardStatus === "at_risk" || c.cardStatus === "blocked").length;
  const conversion = cards.length ? Math.round((confirmed / cards.length) * 100) : 0;

  return [
    { detail: "Across active client demand", icon: IconLayoutKanban, label: "Active cards", tone: "neutral" as const, value: String(cards.length) },
    { detail: "Profiles with credible fit", icon: IconUsersGroup, label: "Strong matches", tone: "success" as const, value: String(strongMatches) },
    { detail: "Client meetings in motion", icon: IconCalendarEvent, label: "Intro scheduled", tone: "primary" as const, value: String(introScheduled) },
    { detail: "Brief to placement conversion", icon: IconCheck, label: "Conversion", tone: "success" as const, value: `${conversion}%` },
    { detail: `$${Math.round(activeValue / 1000)}k active monthly value`, icon: risk ? IconAlertTriangle : IconCurrencyDollar, label: "Risk queue", tone: risk ? ("risk" as const) : ("neutral" as const), value: String(risk) },
  ];
}

function getOperatorInsight(card: PipelineCard) {
  if (card.cardStatus === "blocked") return "Escalate client response and assign a direct owner before end of day.";
  if (card.cardStatus === "at_risk") return "Review stage age, tighten follow-up, and remove the blocker before the next SLA window.";
  if (card.stage === "brief_received") return "Clarify requirements and open a shortlisting session today.";
  if (card.stage === "shortlisting") return card.engineers.length >= 2 ? "Rank candidates and package the strongest profiles for client review." : "Continue sourcing until at least two credible candidates are ready.";
  if (card.stage === "profiles_sent") return "Track client review and prepare a backup profile batch if feedback stalls.";
  if (card.stage === "intro_scheduled") return card.introSlot ? `Prep both sides for ${card.introSlot} and capture post-call notes.` : "Confirm the intro slot and brief the engineer before the call.";
  return "Route the confirmed work into placements and start onboarding handoff.";
}

function nextStage(stage: PipelineStage) {
  const index = stageOrder.indexOf(stage);
  return index >= 0 && index < stageOrder.length - 1 ? stageOrder[index + 1] : null;
}

function isOverSla(card: PipelineCard) {
  const config = stageConfig[card.stage];
  if (!config || config.slaHours >= 9999) return false;
  return card.daysInStage * 24 > config.slaHours;
}

function compactStageLabel(label: string) {
  if (label === "Brief Received") return "Intake";
  if (label === "Placement Confirmed") return "Placed";
  return label.replace(" ", "\n");
}
