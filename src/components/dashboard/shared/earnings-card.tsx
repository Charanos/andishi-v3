import { DashboardLineChart } from "@/components/dashboard/shared/dashboard-chart";

export function EarningsCard() {
  return (
    <div className="rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--surface)] p-6 shadow-[0_18px_55px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)]">
      <p className="label-caps text-[var(--on-surface-dim)]">
        Monthly earnings
      </p>
      <p className="my-8 font-mono text-[3rem] leading-none text-[var(--on-surface)]">
        $7.8k
      </p>
      <p className="mt-3 text-[0.92rem] text-[var(--on-surface-dim)]">
        +12% vs last month
      </p>
      <div className="mt-6">
        <DashboardLineChart
          data={[3, 4, 5, 4.8, 6.1, 6.7, 7.8]}
          height={70}
          variant="area"
        />
      </div>
    </div>
  );
}
