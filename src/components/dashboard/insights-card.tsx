import type { Icon } from "@tabler/icons-react";
import { IconChartLine } from "@tabler/icons-react";
import { Sparkline } from "@/components/dashboard/sparkline";

export function InsightsCard({
  label,
  value,
  trend,
  data,
  icon: Icon = IconChartLine,
}: {
  label: string;
  value: string;
  trend: string;
  data: number[];
  icon?: Icon;
}) {
  return (
    <article className="relative overflow-hidden rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-caps text-[var(--on-surface-dim)]">{label}</p>
          <p className="mt-4 font-mono text-[2rem] leading-none tracking-tight text-[var(--on-surface)]">
            {value}
          </p>
          <p className="mt-3 text-[0.86rem] text-[var(--on-surface-dim)]">{trend}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_9%,transparent)] text-[var(--secondary)]">
          <Icon size={19} stroke={1.6} />
        </span>
      </div>
      <div className="mt-5">
        <Sparkline data={data} />
      </div>
    </article>
  );
}
