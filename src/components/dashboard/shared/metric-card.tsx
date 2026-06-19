import type { Icon } from "@tabler/icons-react";
import { IconTrendingUp } from "@tabler/icons-react";
import { DashboardLineChart } from "@/components/dashboard/shared/dashboard-chart";
import { cn } from "@/lib/utils";

export function MetricCard({
  data,
  detail,
  icon: Icon = IconTrendingUp,
  label,
  size = "default",
  value,
}: {
  data?: number[];
  detail?: string;
  icon?: Icon;
  label: string;
  size?: "default" | "large";
  value: string;
}) {
  const isPositive = detail?.startsWith("+");
  const isNegative = detail?.startsWith("-");

  return (
    <article
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.15rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_60%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_10%,transparent)] backdrop-blur-2xl shadow-[0_16px_45px_color-mix(in_srgb,var(--bg-deep)_7%,transparent),inset_0_1px_0_color-mix(in_srgb,white_16%,transparent)] transition-all duration-500 hover:border-[color-mix(in_srgb,var(--secondary)_40%,var(--glass-border))] hover:shadow-[0_24px_54px_color-mix(in_srgb,var(--bg-deep)_12%,transparent)]",
        size === "large" ? "min-h-[16rem]" : "min-h-[13.75rem]",
      )}
    >
      {/* Content */}
      <div className={cn("flex min-w-0 flex-1 flex-col", size === "large" ? "p-5 sm:p-6 lg:p-7" : "p-5 lg:p-6")}>
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 break-words text-[0.9rem] leading-snug text-[var(--on-surface-dim)]">{label}</p>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--secondary)_20%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)] text-[var(--secondary)]">
            <Icon size={17} stroke={1.65} />
          </span>
        </div>

        <p
          className={cn(
            "mt-4 break-words font-mono leading-none tracking-tight text-[var(--on-surface)] font-medium",
            size === "large" ? "text-[clamp(2.15rem,10vw,2.85rem)]" : "text-[clamp(1.55rem,8vw,1.9rem)]",
          )}
        >
          {value}
        </p>

        {detail && (
          <p
            className={`mt-2.5 text-[0.88rem] leading-snug ${
              isPositive
                ? "text-[var(--tertiary)]"
                : isNegative
                ? "text-[color-mix(in_srgb,var(--error)_80%,var(--on-surface-dim))]"
                : "text-[var(--on-surface-dim)]"
            }`}
          >
            {detail}
          </p>
        )}
      </div>

      {/* Chart pinned to bottom, with padding for labels. */}
      {data && (
        <div className={cn("mt-auto w-full pt-2", size === "large" ? "px-5 sm:px-6 lg:px-7 pb-5 sm:pb-6 lg:pb-7" : "px-5 lg:px-6 pb-5 lg:pb-6")}>
          <DashboardLineChart
            data={data}
            height={size === "large" ? 96 : 72}
            variant="sparkline"
          />
        </div>
      )}
    </article>
  );
}
