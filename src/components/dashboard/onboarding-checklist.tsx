import { IconCircleCheck, IconCircle } from "@tabler/icons-react";

export function OnboardingChecklist({ items }: { items: Array<[string, boolean]> }) {
  const done = items.filter(([, complete]) => complete).length;
  const progress = Math.round((done / items.length) * 100);

  return (
    <div className="rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-4">
        <p className="label-caps text-[var(--secondary)]">Onboarding</p>
        <span className="font-mono text-[0.75rem] text-[var(--on-surface-dim)]">{progress}%</span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
        <div className="h-full rounded-full bg-[var(--secondary)]" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-5 grid gap-3">
        {items.map(([label, complete]) => (
          <p key={label} className="flex items-center gap-2 text-[0.92rem] text-[var(--on-surface-dim)]">
            {complete ? (
              <IconCircleCheck size={17} stroke={1.8} className="text-[var(--tertiary)]" />
            ) : (
              <IconCircle size={17} stroke={1.5} className="text-[var(--on-surface-dim)]" />
            )}
            {label}
          </p>
        ))}
      </div>
    </div>
  );
}
