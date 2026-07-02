import Link from "next/link";
import {
  IconAlertCircle,
  IconArrowNarrowRight,
  IconBriefcase,
  IconCalendar,
  IconClock,
  IconFileText,
  IconGitMerge,
  IconReportAnalytics,
  IconRocket,
  IconUserExclamation,
  IconUsersGroup,
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
import { MetricCard } from "@/components/dashboard/shared/metric-card";
import { MetricStrip } from "@/components/dashboard/shared/metric-strip";
import { PipelineFunnelChart } from "@/components/dashboard/admin/pipeline-funnel-chart";
import type { PipelineColumn } from "@/components/dashboard/admin/pipeline-board";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { SectionDivider } from "@/components/ui/section-divider";
import { adminDashboardMock } from "@/data/dashboard-mock";

const platformMetrics = [
  { icon: IconBriefcase, label: "Active briefs", value: "18", delta: "+2" },
  { icon: IconGitMerge, label: "Pending scopes", value: "5", delta: "-1" },
  {
    icon: IconUsersGroup,
    label: "Active builds",
    value: "24",
    delta: "+3",
  },
  {
    icon: IconReportAnalytics,
    label: "MTD revenue",
    value: "$284K",
    delta: "+18.6%",
  },
];

const pipelineColumns: PipelineColumn[] = [
  {
    count: 18,
    title: "Brief Received",
    items: [
      {
        avatars: ["MK", "DM"],
        meta: "Fintech / Seed",
        status: "New",
        time: "2h ago",
        title: "AI chat platform",
      },
      {
        avatars: ["AO"],
        meta: "Healthcare / Series A",
        time: "5h ago",
        title: "Data analytics engine",
      },
    ],
  },
  {
    count: 14,
    title: "Project Scoping",
    items: [
      {
        avatars: ["KM", "AO"],
        meta: "SaaS / Series B",
        time: "6h ago",
        title: "Infrastructure rewrite",
      },
      {
        avatars: ["KM"],
        meta: "Consumer / Seed",
        time: "1d ago",
        title: "Mobile app revamp",
      },
    ],
  },
  {
    count: 9,
    title: "Proposals Sent",
    items: [
      {
        avatars: ["AO", "KM", "DM"],
        meta: "Logistics / Series A",
        time: "1d ago",
        title: "Real-time dashboard",
      },
      {
        avatars: ["AO"],
        meta: "Fintech / Seed",
        time: "2d ago",
        title: "API integration layer",
      },
    ],
  },
  {
    count: 6,
    title: "Discovery Scheduled",
    items: [
      {
        avatars: ["AO"],
        meta: "E-commerce / Series B",
        time: "2d ago",
        title: "ML recommendation",
      },
      {
        avatars: ["KM", "DM"],
        meta: "SaaS / Series A",
        time: "2h ago",
        title: "DevOps automation",
      },
    ],
  },
  {
    count: 5,
    title: "Builds Confirmed",
    items: [
      {
        avatars: ["AO"],
        meta: "Fintech / Series B",
        status: "Confirmed",
        time: "3d ago",
        title: "Fintech Checkout Engine",
      },
      {
        avatars: ["KM"],
        meta: "HealthTech / Series A",
        status: "Confirmed",
        time: "4d ago",
        title: "Health Portal Build",
      },
    ],
  },
];

const attentionItems: AttentionItem[] = [
  {
    count: 2,
    description: "2 briefs have passed the 48h response threshold",
    href: "/admin/briefs?filter=sla-risk",
    icon: IconAlertCircle,
    label: "SLA at risk",
    priority: "critical",
  },
  {
    count: 3,
    description: "3 availability updates pending vetting",
    href: "/admin/engineers?filter=review-needed",
    icon: IconUserExclamation,
    label: "Engineers to review",
    priority: "warning",
  },
  {
    count: 1,
    description: "1 brief with no activity in 5 days",
    href: "/admin/briefs?filter=stale",
    icon: IconFileText,
    label: "Stale brief",
    priority: "warning",
  },
  {
    count: 2,
    description: "2 scheduled intros awaiting post-call notes",
    href: "/admin/matches?filter=intro-pending",
    icon: IconCalendar,
    label: "Intros to confirm",
    priority: "info",
  },
];

const kpiIcons = [
  IconFileText,
  IconGitMerge,
  IconBriefcase,
  IconClock,
  IconUsersGroup,
  IconReportAnalytics,
  IconRocket,
];

export default async function AdminPage() {
  const secondaryKpis = [
    adminDashboardMock.metrics[0],
    adminDashboardMock.metrics[1],
    adminDashboardMock.metrics[2],
    {
      label: "Avg Scoping Velocity",
      value: "3.6 days",
      trend: "+0.8 vs last 7 days",
      data: [4.4, 4.1, 3.9, 3.8, 3.6],
    },
    {
      label: "Specialists on Bench",
      value: "148",
      trend: "+12 vs last 7 days",
      data: [124, 128, 136, 141, 148],
    },
    {
      label: "Client Satisfaction",
      value: "4.8 / 5",
      trend: "+0.3 vs last 30 days",
      data: [4.2, 4.4, 4.5, 4.7, 4.8],
    },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-9 overflow-hidden py-10 md:gap-10 lg:gap-12 lg:py-12">
      <header className="min-w-0">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2.5 flex items-center gap-1.5 text-[0.82rem]">
              <span className="text-[var(--on-surface-dim)]">Operations</span>
              <span className="font-mono text-[var(--on-surface-dim)] opacity-40">
                /
              </span>
              <span className="font-medium text-[var(--secondary)]">
                Overview
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="title-serif text-[clamp(2.15rem,4vw,3rem)] font-medium leading-[0.98] tracking-tight text-[var(--on-surface)]">
                Platform Overview
              </h1>
            </div>

            <p className="mt-2 max-w-3xl text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
              Executive command across demand, matching, delivery, talent
              supply, and account motion.
            </p>
            <p className="mt-2 font-mono text-[0.78rem] text-[var(--on-surface-dim)] opacity-75">
              Jun 01, 2026 / updated 2 min ago
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3 pt-1">
            <PipelineDrawerButton columns={pipelineColumns} />
            <NewBriefButton />
          </div>
        </div>

        <div className="mt-8">
          <MetricStrip items={platformMetrics} variant="grid" />
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
            description="Stage volumes with conversion rates across the 5-stage placement funnel."
            title="Pipeline Flow"
          />
          <div className="my-6 overflow-hidden rounded-[1.15rem] border border-[color-mix(in_srgb,var(--glass-border)_72%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_22%,transparent)] p-5 shadow-[0_10px_28px_color-mix(in_srgb,var(--bg-deep)_5%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-2xl md:p-6">
            <PipelineFunnelChart columns={pipelineColumns} />
          </div>
        </div>

        <div className="min-w-0">
          <SectionHeader
            action={<AttentionQueueSummary items={attentionItems} />}
            description="Critical, review, and informational work."
            title="Needs Attention"
          />
          <div className="my-6">
            <AttentionQueue chrome="body" items={attentionItems} />
          </div>
        </div>
      </section>

      <SectionDivider />

      <section>
        <SectionHeader
          description="Revenue, matching, placement, availability, satisfaction, and conversion signals."
          title="Operating Metrics"
        />
        <div className="mt-6 grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <MetricCard
              data={[185, 196, 212, 205, 239, 248, 284]}
              detail="+18.6% vs Apr 2026"
              icon={IconReportAnalytics}
              label="MTD Revenue"
              size="large"
              value="$284,560"
            />
          </div>

          {secondaryKpis.slice(0, 2).map((metric, index) => (
            <KpiCard
              chart={index === 0 ? "bar" : "line"}
              data={[...metric.data]}
              icon={kpiIcons[index]}
              key={metric.label}
              label={metric.label}
              trend={metric.trend}
              value={metric.value}
            />
          ))}

          {secondaryKpis.slice(2, 6).map((metric, index) => (
            <KpiCard
              chart={index === 1 ? "bar" : "line"}
              data={[...metric.data]}
              icon={kpiIcons[index + 2]}
              key={metric.label}
              label={metric.label}
              trend={metric.trend}
              value={metric.value}
            />
          ))}
        </div>
      </section>

      <SectionDivider />

      <section className="grid min-w-0 items-start gap-8 2xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-8">
          <div className="min-w-0">
            <SectionHeader
              action={<StatusBadge label="live" tone="active" />}
              description="Activity across briefs, matches, and placements."
              title="Platform Pulse"
            />
            <div className="my-6 overflow-hidden">
              <DashboardLineChart
                data={[18, 20, 19, 23, 24, 27, 31, 33, 37, 42]}
                height={420}
                variant="area"
              />
            </div>
          </div>

          <AdminEventsPanel />
        </div>

        <div className="flex min-w-0 flex-col gap-8">
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
                  value: adminDashboardMock.supplyHealth.reduce(
                    (sum, item) => sum + item.available,
                    0,
                  ),
                },
                {
                  label: "Soon",
                  tone: "secondary",
                  value: adminDashboardMock.supplyHealth.reduce(
                    (sum, item) => sum + item.soon,
                    0,
                  ),
                },
                {
                  label: "Engaged",
                  tone: "muted",
                  value: adminDashboardMock.supplyHealth.reduce(
                    (sum, item) => sum + item.engaged,
                    0,
                  ),
                },
              ]}
              height={190}
            />

            <div className="mt-7 grid gap-5">
              {adminDashboardMock.supplyHealth.map((item) => (
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
          <div className="my-6 ">
            <DataTable
              columns={["Client", "Brief", "Status", "SLA", "Owner"]}
              rows={adminDashboardMock.priorityBriefs.map((brief) => ({
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
          <SectionHeader
            action={
              <Link
                href="/admin/content"
                className="shrink-0 cursor-pointer text-[0.88rem] font-medium text-[var(--secondary)] underline-offset-4 transition-opacity duration-200 hover:opacity-70"
              >
                View all
              </Link>
            }
            description="Recent movement across briefs, matches, billing, and delivery operations."
            title="Activity"
          />
          <div className="my-6">
            <ActivityFeed
              cta={{ href: "/admin/content", label: "View all activity" }}
              items={[...adminDashboardMock.activity]}
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
        <p className="font-mono text-[0.82rem] text-[var(--on-surface-dim)]">
          {total} total
        </p>
      </div>

      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
        <span
          className="bg-[var(--tertiary)] transition-all duration-700 ease-out"
          style={{ width: availableWidth }}
        />
        <span
          className="bg-[var(--secondary)] transition-all duration-700 ease-out"
          style={{ width: soonWidth }}
        />
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
