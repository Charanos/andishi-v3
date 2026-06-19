import { IconAlertTriangle } from "@tabler/icons-react";

export function PanelError({
  action,
  message,
  title = "Panel unavailable",
}: {
  action?: React.ReactNode;
  message: string;
  title?: string;
}) {
  return (
    <div className="rounded-[1.15rem] border border-[color-mix(in_srgb,#f85149_24%,var(--glass-border))] bg-[color-mix(in_srgb,#f85149_6%,var(--surface)_94%)] p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[color-mix(in_srgb,#f85149_24%,transparent)] text-[color-mix(in_srgb,#f85149_82%,var(--on-surface))]">
          <IconAlertTriangle size={17} stroke={1.7} />
        </span>
        <div>
          <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">{title}</p>
          <p className="mt-1 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">{message}</p>
          {action && <div className="mt-4">{action}</div>}
        </div>
      </div>
    </div>
  );
}

