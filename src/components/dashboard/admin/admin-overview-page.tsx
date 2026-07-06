import Link from "next/link";
import {
  IconAlertCircle,
  IconArrowNarrowRight,
  IconBriefcase,
  IconCoin,
  IconFileText,
  IconReceipt,
  IconReportAnalytics,
  IconUserCheck,
} from "@tabler/icons-react";
import { ActivityFeed } from "@/components/dashboard/shared/activity-feed";
import {
  AttentionQueue,
  AttentionQueueSummary,
  type AttentionItem,
} from "@/components/dashboard/admin/attention-queue";
import {
  AdminEventsPanel,
  AdminScheduleIntelligencePanel,
} from "@/components/dashboard/admin/admin-events-panel";
import {
  NewBriefButton,
  PipelineDrawerButton,
} from "@/components/dashboard/admin/admin-overview-actions";
import { DataTable } from "@/components/dashboard/shared/data-table";
import {
  DashboardDonutChart,
  DashboardLineChart,
} from "@/components/dashboard/shared/dashboard-chart";
import { KpiCard } from "@/components/dashboard/shared/kpi-card";
import type { PipelineColumn } from "@/components/dashboard/admin/pipeline-board";
import { PipelineFunnelChart } from "@/components/dashboard/admin/pipeline-funnel-chart";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { SectionDivider } from "@/components/ui/section-divider";
import { adminOverviewMock } from "@/data/dashboard-mock";

/**
 * Every KPI/section here mirrors a real, already-built backend read path -
 * see docs/backend/BACKEND_ARCHITECTURE_MASTER.md and the guide this page
 * was overhauled from. Still mock data (dev/prod DB split is in place, but
 * this page isn't wired to the API yet), shaped so wiring later is a
 * drop-in rather than a reshape. Each section is tagged with the
 * permission domain it belongs to (crm/delivery/finance/talent/support/
 * platform) so per-role visibility (sales_manager, finance_manager,
 * delivery_pm, recruiter, marketer, content_editor, support_agent all
 * share this same route tree with different permission grants) is a
 * mechanical retrofit later, not a redesign.
 */

// ── Pipeline Flow - crm + delivery (hire-track matching pipeline) ───────
// Canonical 5-stage taxonomy from admin-pipeline-page.tsx - kept identical
// so the funnel here and the full pipeline board never disagree on names.
const pipelineColumns: PipelineColumn[] = [
  {
    count: 14,
    title: "Brief Received",
    items: [
      { avatars: [], meta: "Kijani Analytics / Series A", status: "New", time: "2h ago", title: "Senior AI engineer for RAG platform" },
      { avatars: [], meta: "Cloudify Inc / Series B", time: "5h ago", title: "AWS platform engineer for migration" },
    ],
  },
  {
    count: 9,
    title: "Shortlisting",
    items: [
      { avatars: ["KA", "ZN"], meta: "BuildFlow / Series B", time: "1d ago", title: "Infrastructure rewrite for SaaS monolith" },
      { avatars: ["AM"], meta: "StartupHub / Seed", time: "1d ago", title: "Full-stack engineer for analytics dashboard" },
    ],
  },
  {
    count: 6,
    title: "Profiles Sent",
    items: [
      { avatars: ["AO", "KA", "ZN"], meta: "Freight.io / Series A", time: "2d ago", title: "Real-time dashboard for logistics" },
      { avatars: ["AO"], meta: "WealthPilot / Series A", time: "2d ago", title: "API integration layer for fintech" },
    ],
  },
  {
    count: 4,
    title: "Intro Scheduled",
    items: [
      { avatars: ["FA"], meta: "Cloudify Inc / Series B", status: "Intro Wed", time: "3d ago", title: "DevOps automation for cloud platform" },
      { avatars: ["AM"], meta: "OperateHQ / Series A", status: "Intro Tue", time: "4d ago", title: "Senior full-stack for B2B SaaS rebuild" },
    ],
  },
  {
    count: 3,
    title: "Placement Confirmed",
    items: [
      { avatars: ["AO"], meta: "KashiPay / Series B", status: "Confirmed", time: "5d ago", title: "CTO placement for fintech scale-up" },
      { avatars: ["KA"], meta: "CareStream / Series A", status: "Confirmed", time: "1w ago", title: "Lead engineer for HealthTech Series A" },
    ],
  },
];

// ── Needs Attention - one item per cross-cutting domain ─────────────────
const attentionItems: AttentionItem[] = [
  {
    count: 2,
    description: "2 briefs have passed the 48h response threshold",
    href: "/admin/briefs?filter=sla-risk",
    icon: IconAlertCircle,
    label: "SLA at risk", // crm
    priority: "critical",
  },
  {
    count: 3,
    description: "3 milestones are past due, still awaiting approval",
    href: "/admin/placements/timeline?filter=overdue",
    icon: IconBriefcase,
    label: "Milestones overdue", // delivery
    priority: "warning",
  },
  {
    count: 1,
    description: "1 invoice is 12 days past due",
    href: "/admin/payments?filter=overdue",
    icon: IconReceipt,
    label: "Invoice overdue", // finance
    priority: "warning",
  },
  {
    count: 2,
    description: "2 support cases have been escalated to admin",
    href: "/admin/support?filter=escalated",
    icon: IconUserCheck,
    label: "Support escalations", // support
    priority: "info",
  },
];

export function AdminOverviewPage() {
  return (
    <div className="flex min-w-0 flex-col gap-9 overflow-hidden py-10 md:gap-10 lg:gap-12 lg:py-12">
      <header className="min-w-0">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2.5 flex items-center gap-1.5 text-[0.82rem]">
              <span className="text-[var(--on-surface-dim)]">Operations</span>
              <span className="font-mono text-[var(--on-surface-dim)] opacity-40">/</span>
              <span className="font-medium text-[var(--secondary)]">Overview</span>
            </div>

            <h1 className="title-serif text-[clamp(2.15rem,4vw,3rem)] font-medium leading-[0.98] tracking-tight text-[var(--on-surface)]">
              Platform Overview
            </h1>

            <p className="mt-2 max-w-3xl text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
              Executive command across demand, matching, delivery, talent
              supply, and account motion.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3 pt-1">
            <PipelineDrawerButton columns={pipelineColumns} />
            <NewBriefButton />
          </div>
        </div>

        {/* KPI row - crm (briefs, pipeline value) + finance (revenue) + talent (engineers) */}
        <div className="mt-8 grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            chart="line"
            data={[...adminOverviewMock.kpis.revenueInFlight.data]}
            icon={IconReportAnalytics}
            label={adminOverviewMock.kpis.revenueInFlight.label}
            trend={adminOverviewMock.kpis.revenueInFlight.trend}
            value={adminOverviewMock.kpis.revenueInFlight.value}
          />
          <KpiCard
            chart="bar"
            data={[...adminOverviewMock.kpis.activeBriefs.data]}
            icon={IconFileText}
            label={adminOverviewMock.kpis.activeBriefs.label}
            trend={adminOverviewMock.kpis.activeBriefs.trend}
            value={adminOverviewMock.kpis.activeBriefs.value}
          />
          <KpiCard
            chart="bar"
            data={[...adminOverviewMock.kpis.pipelineValue.data]}
            icon={IconCoin}
            label={adminOverviewMock.kpis.pipelineValue.label}
            trend={adminOverviewMock.kpis.pipelineValue.trend}
            value={adminOverviewMock.kpis.pipelineValue.value}
          />
          <KpiCard
            chart="line"
            data={[...adminOverviewMock.kpis.vettedEngineers.data]}
            icon={IconUserCheck}
            label={adminOverviewMock.kpis.vettedEngineers.label}
            trend={adminOverviewMock.kpis.vettedEngineers.trend}
            value={adminOverviewMock.kpis.vettedEngineers.value}
          />
        </div>
      </header>

      <SectionDivider />

      <section className="grid min-w-0 gap-7 2xl:grid-cols-[minmax(0,3fr)_minmax(24rem,2fr)]">
        <div className="min-w-0">
          <SectionHeader
            action={
              <Link
                href="/admin/matches"
                className="inline-flex shrink-0 items-center gap-1.5 text-[0.86rem] font-medium text-[var(--secondary)] transition-opacity duration-200 hover:opacity-70"
              >
                Full pipeline
                <IconArrowNarrowRight size={15} stroke={1.6} />
              </Link>
            }
            description="Stage volumes across the 5-stage placement funnel: Brief Received to Placement Confirmed."
            title="Pipeline Flow"
          />
          <div className="my-6 overflow-hidden rounded-[1.15rem] border border-[color-mix(in_srgb,var(--glass-border)_72%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_22%,transparent)] p-5 shadow-[0_10px_28px_color-mix(in_srgb,var(--bg-deep)_5%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-2xl md:p-6">
            <PipelineFunnelChart columns={pipelineColumns} />
          </div>
        </div>

        <div className="min-w-0">
          <SectionHeader
            action={<AttentionQueueSummary items={attentionItems} />}
            description="Critical, review, and informational work across every module."
            title="Needs Attention"
          />
          <div className="my-6">
            <AttentionQueue chrome="body" items={attentionItems} />
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="grid min-w-0 items-start gap-8 2xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-8">
          <div className="min-w-0">
            <SectionHeader
              action={<StatusBadge label="live" tone="active" />}
              description="Active project count (delivery.project.read) across the last 10 weeks."
              title="Platform Pulse"
            />
            <div className="my-6 overflow-hidden">
              <DashboardLineChart
                data={[...adminOverviewMock.activeProjectsTrend]}
                height={420}
                variant="area"
              />
            </div>
          </div>

          <AdminEventsPanel />
        </div>

        <div className="flex min-w-0 flex-col gap-8">
          {/* talent.engineer.read - engineers.availability enum directly */}
          <SectionHeader
            description="Real-time delivery bench capacity by domain."
            title="Squad Capacity"
          />
          <div className="overflow-hidden rounded-[1.15rem] border border-[color-mix(in_srgb,var(--glass-border)_72%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_22%,transparent)] p-5 shadow-[0_10px_28px_color-mix(in_srgb,var(--bg-deep)_5%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-2xl md:p-6">
            <DashboardDonutChart
              data={[
                {
                  label: "Available",
                  tone: "success",
                  value: adminOverviewMock.supplyHealth.reduce((sum, item) => sum + item.available, 0),
                },
                {
                  label: "Soon",
                  tone: "secondary",
                  value: adminOverviewMock.supplyHealth.reduce((sum, item) => sum + item.soon, 0),
                },
                {
                  label: "Engaged",
                  tone: "muted",
                  value: adminOverviewMock.supplyHealth.reduce((sum, item) => sum + item.engaged, 0),
                },
              ]}
              height={190}
            />

            <div className="mt-7 grid gap-5">
              {adminOverviewMock.supplyHealth.map((item) => (
                <SupplyRow key={item.label} {...item} />
              ))}
            </div>
          </div>
          <AdminScheduleIntelligencePanel />
        </div>
      </section>

      <SectionDivider />

      <section className="grid min-w-0 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="min-w-0">
          {/* crm.brief.read */}
          <SectionHeader
            action={
              <Link
                href="/admin/briefs"
                className="shrink-0 cursor-pointer text-[0.88rem] font-medium text-[var(--secondary)] underline-offset-4 transition-opacity duration-200 hover:opacity-70"
              >
                Open queue
              </Link>
            }
            description="High-signal requests requiring immediate review or client engagement."
            title="Priority Briefs"
          />
          <div className="my-6">
            <DataTable
              columns={["Client", "Brief", "Status", "SLA", "Owner"]}
              rows={adminOverviewMock.priorityBriefs.map((brief) => ({
                Brief: brief.brief,
                Client: brief.client,
                Owner: brief.owner,
                SLA: brief.sla,
                Status: brief.status,
              }))}
            />
          </div>
        </div>

        <div className="min-w-0">
          {/* platform.audit.read - activity_events, visibleTo contains "admin" */}
          <SectionHeader
            action={
              <Link
                href="/admin/audit"
                className="shrink-0 cursor-pointer text-[0.88rem] font-medium text-[var(--secondary)] underline-offset-4 transition-opacity duration-200 hover:opacity-70"
              >
                View all
              </Link>
            }
            description="Recent movement across briefs, milestones, hiring, and finance."
            title="Activity"
          />
          <div className="my-6">
            <ActivityFeed
              cta={{ href: "/admin/audit", label: "View full audit trail" }}
              items={[...adminOverviewMock.activity]}
              variant="timeline"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  action,
  description,
  title,
}: {
  action?: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 border-b border-[color-mix(in_srgb,var(--glass-border)_62%,transparent)] pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="title-serif text-[clamp(1.48rem,2vw,1.9rem)] font-medium leading-tight text-[var(--on-surface)]">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-3xl text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function SupplyRow({
  available,
  engaged,
  label,
  soon,
}: {
  available: number;
  engaged: number;
  label: string;
  soon: number;
}) {
  const total = Math.max(available + engaged + soon, 1);
  const availableWidth = `${(available / total) * 100}%`;
  const engagedWidth = `${(engaged / total) * 100}%`;
  const soonWidth = `${(soon / total) * 100}%`;

  return (
    <article className="group">
      <div className="mb-2.5 flex items-end justify-between gap-3">
        <p className="text-[0.98rem] font-medium text-[var(--on-surface)] transition-colors duration-200 group-hover:text-[var(--secondary)]">
          {label}
        </p>
        <p className="font-mono text-[0.82rem] text-[var(--on-surface-dim)]">{total} total</p>
      </div>

      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
        <span className="bg-[var(--tertiary)] transition-all duration-700 ease-out" style={{ width: availableWidth }} />
        <span className="bg-[var(--secondary)] transition-all duration-700 ease-out" style={{ width: soonWidth }} />
        <span
          className="bg-[color-mix(in_srgb,var(--on-surface-dim)_34%,transparent)] transition-all duration-700 ease-out"
          style={{ width: engagedWidth }}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[0.78rem] uppercase tracking-[0.08em] text-[var(--on-surface-dim)]">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--tertiary)]" />
          {available} avail
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--secondary)]" />
          {soon} soon
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[color-mix(in_srgb,var(--on-surface-dim)_42%,transparent)]" />
          {engaged} busy
        </span>
      </div>
    </article>
  );
}
