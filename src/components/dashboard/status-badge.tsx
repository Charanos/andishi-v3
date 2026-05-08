import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  active: "border-[color-mix(in_srgb,var(--tertiary)_30%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] text-[var(--tertiary)]",
  pending: "border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_9%,transparent)] text-[var(--secondary)]",
  available: "border-[color-mix(in_srgb,var(--tertiary)_30%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] text-[var(--tertiary)]",
  overdue: "border-[color-mix(in_srgb,var(--error)_30%,transparent)] bg-[color-mix(in_srgb,var(--error)_10%,transparent)] text-[var(--error)]",
};

export function StatusBadge({
  label,
  tone = "pending",
}: {
  label: string;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 font-mono text-[0.68rem] leading-none tracking-tight",
        tones[tone] ?? tones.pending,
      )}
    >
      {label}
    </span>
  );
}
