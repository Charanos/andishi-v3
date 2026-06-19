import { IconCircleCheck } from "@tabler/icons-react";

export function VettingBadges() {
  return (
    <div className="flex flex-wrap gap-2">
      {["System Design", "Code Review", "Architecture", "References"].map((badge) => (
        <span key={badge} className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--tertiary)_24%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_9%,transparent)] px-2.5 py-1 text-[0.72rem] text-[var(--on-surface-dim)]">
          <IconCircleCheck size={13} stroke={1.8} className="text-[var(--tertiary)]" />
          {badge}
        </span>
      ))}
    </div>
  );
}
