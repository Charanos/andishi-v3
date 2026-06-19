import type { Icon } from "@tabler/icons-react";
import { IconCircle } from "@tabler/icons-react";

const ACCENT_COLORS = [
  "var(--secondary)",
  "var(--tertiary)",
  "var(--primary)",
  "color-mix(in srgb, var(--secondary) 60%, var(--tertiary) 40%)",
];

export function MetricStrip({
  items,
  variant = "stack",
}: {
  items: Array<{ icon?: Icon; label: string; value: string; delta?: string }>;
  variant?: "grid" | "stack";
}) {
  return (
    <div
      className={
        variant === "grid"
          ? "grid overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_44%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_8%,transparent)] shadow-[0_14px_38px_color-mix(in_srgb,var(--bg-deep)_6%,transparent),inset_0_1px_0_color-mix(in_srgb,white_14%,transparent)] backdrop-blur-2xl sm:grid-cols-2 xl:grid-cols-4"
          : "overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_44%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_8%,transparent)] shadow-[0_14px_38px_color-mix(in_srgb,var(--bg-deep)_6%,transparent),inset_0_1px_0_color-mix(in_srgb,white_14%,transparent)] backdrop-blur-2xl"
      }
    >
      {items.map((item, i) => {
        const Icon = item.icon ?? IconCircle;
        const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
        const isLast = i === items.length - 1;
        return (
          <div
            key={item.label}
            className={`group flex min-w-0 items-center gap-3 px-5 py-5 transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--secondary)_4%,transparent)] sm:gap-4 sm:px-6 ${
              variant === "grid"
                ? "border-b border-[var(--glass-border)] sm:[&:nth-child(odd)]:border-r xl:border-b-0 xl:border-r xl:last:border-r-0"
                : !isLast
                  ? "border-b border-[var(--glass-border)]"
                  : ""
            }`}
          >
            {/* Colored accent bar */}
            <div
              className="h-8 w-[3px] shrink-0 rounded-full transition-all duration-500 group-hover:h-10"
              style={{ background: accent }}
            />

            {/* Icon */}
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors duration-300"
              style={{ background: `color-mix(in srgb, ${accent} 10%, transparent)`, color: accent }}
            >
              <Icon size={18} stroke={1.65} />
            </span>

            {/* Label + value */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.86rem] leading-none text-[var(--on-surface-dim)]">{item.label}</p>
              <p className="mt-2 font-mono text-[clamp(1.28rem,7vw,1.62rem)] leading-none tracking-tight text-[var(--on-surface)]">
                {item.value}
              </p>
            </div>

            {/* Delta badge */}
            {item.delta && (
              <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--tertiary)_14%,transparent)] px-2.5 py-1 font-mono text-[0.8rem] text-[var(--tertiary)]">
                {item.delta}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
