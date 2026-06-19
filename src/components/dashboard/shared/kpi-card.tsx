import type { Icon } from "@tabler/icons-react";
import { IconChartBar } from "@tabler/icons-react";
import { KpiCardClientBody } from "./kpi-card-client";

export function KpiCard({
  chart = "line",
  data,
  icon: Icon = IconChartBar,
  label,
  trend,
  value,
  metricType,
  breakdownData,
  slaTarget,
}: {
  chart?: "bar" | "line";
  data?: number[];
  icon?: Icon;
  label: string;
  trend: string;
  value: string;
  metricType?: "satisfaction" | "capacity" | "pipeline" | "sla" | "standard";
  breakdownData?: { label: string; value: number; percent: number; color: string }[];
  slaTarget?: number;
}) {
  return (
    <article className="group relative flex h-full min-h-[14rem] min-w-0 flex-col overflow-hidden rounded-[1.2rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_44%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] backdrop-blur-2xl shadow-[0_12px_34px_color-mix(in_srgb,var(--bg-deep)_6%,transparent),inset_0_1px_0_color-mix(in_srgb,white_14%,transparent)] transition-all duration-500 hover:border-[color-mix(in_srgb,var(--secondary)_38%,var(--glass-border))] hover:shadow-[0_20px_48px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]">
      <div className="flex h-full min-w-0 flex-col w-full">
        <KpiCardClientBody
          chart={chart}
          data={data}
          label={label}
          trend={trend}
          value={value}
          metricType={metricType}
          breakdownData={breakdownData}
          slaTarget={slaTarget}
          iconElement={<Icon size={15} stroke={1.8} />}
        />
      </div>
    </article>
  );
}
