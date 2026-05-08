import { Sparkline } from "@/components/dashboard/sparkline";

export function EarningsCard() {
  return (
    <div className="rounded-[1.25rem] border border-[color-mix(in_srgb,var(--secondary)_26%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_28%,var(--surface)),color-mix(in_srgb,var(--secondary)_18%,var(--surface)))] p-6 shadow-[0_24px_80px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)]">
      <p className="label-caps text-[var(--on-surface-dim)]">Monthly earnings</p>
      <p className="mt-5 font-mono text-[3rem] leading-none text-[var(--on-surface)]">$7.8k</p>
      <p className="mt-3 text-[0.92rem] text-[var(--on-surface-dim)]">+12% vs last month</p>
      <div className="mt-6">
        <Sparkline data={[3, 4, 5, 4.8, 6.1, 6.7, 7.8]} />
      </div>
    </div>
  );
}
