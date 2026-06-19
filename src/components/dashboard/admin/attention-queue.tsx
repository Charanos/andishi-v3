import Link from "next/link";
import { IconArrowNarrowRight, type Icon } from "@tabler/icons-react";

export type AttentionPriority = "critical" | "info" | "warning";

export type AttentionItem = {
  count?: number;
  description: string;
  href: string;
  icon: Icon;
  label: string;
  priority: AttentionPriority;
};

const priorityStyles: Record<
  AttentionPriority,
  {
    badge?: string;
    border: string;
    icon: string;
    row: string;
  }
> = {
  critical: {
    badge: "bg-[color-mix(in_srgb,var(--error)_13%,transparent)] text-[var(--error)]",
    border: "var(--error)",
    icon: "text-[var(--error)]",
    row: "bg-[color-mix(in_srgb,var(--error)_4%,transparent)]",
  },
  warning: {
    badge: "bg-[color-mix(in_srgb,var(--secondary)_13%,transparent)] text-[var(--secondary)]",
    border: "var(--secondary)",
    icon: "text-[var(--secondary)]",
    row: "",
  },
  info: {
    border: "color-mix(in srgb, var(--primary) 72%, transparent)",
    icon: "text-[var(--primary)]",
    row: "",
  },
};

export function AttentionQueue({
  chrome = "full",
  items,
}: {
  chrome?: "body" | "full";
  items: AttentionItem[];
}) {
  const criticalCount = items.filter((item) => item.priority === "critical").length;
  const warningCount = items.filter((item) => item.priority === "warning").length;
  const infoCount = items.filter((item) => item.priority === "info").length;
  const activeLevels = new Set(items.map((item) => item.priority)).size;

  return (
    <aside className="flex min-w-0 flex-col overflow-hidden rounded-[1.15rem] border border-[color-mix(in_srgb,var(--glass-border)_72%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_22%,transparent)] shadow-[0_10px_28px_color-mix(in_srgb,var(--bg-deep)_5%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-2xl">
      {chrome === "full" && (
        <div className="flex items-center justify-between gap-3 border-b border-[var(--glass-border)] px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <p className="truncate text-[1rem] font-medium text-[var(--on-surface)]">
              Needs Attention
            </p>
            {criticalCount > 0 && (
              <span className="grid h-[1.35rem] min-w-[1.35rem] place-items-center rounded-full bg-[color-mix(in_srgb,var(--error)_85%,transparent)] px-1.5 font-mono text-[0.7rem] font-medium leading-none text-white">
                {criticalCount}
              </span>
            )}
          </div>
          <QueueSummary
            criticalCount={criticalCount}
            infoCount={infoCount}
            warningCount={warningCount}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col divide-y divide-[color-mix(in_srgb,var(--glass-border)_55%,transparent)]">
        {items.map((item) => {
          const styles = priorityStyles[item.priority];
          const Icon = item.icon;

          return (
            <Link
              key={`${item.priority}-${item.label}`}
              href={item.href}
              className={`group flex items-start gap-4 border-l-2 px-5 py-5 transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--on-surface)_4%,transparent)] md:px-6 ${styles.row}`}
              style={{ borderLeftColor: styles.border }}
            >
              <span className={`mt-0.5 shrink-0 opacity-85 ${styles.icon}`}>
                <Icon size={17} stroke={1.6} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="text-[0.92rem] font-medium leading-snug text-[var(--on-surface)]">
                    {item.label}
                  </span>
                  {item.count !== undefined && styles.badge && (
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[0.78rem] font-medium ${styles.badge}`}>
                      {item.count}
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
                  {item.description}
                </span>
              </span>
              <IconArrowNarrowRight
                className="mt-0.5 shrink-0 text-[var(--on-surface-dim)] opacity-0 transition-opacity duration-200 group-hover:opacity-50"
                size={16}
                stroke={1.6}
              />
            </Link>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--glass-border)] px-5 py-3">
        <p className="text-[0.8rem] text-[var(--on-surface-dim)] opacity-75">
          {items.length} items across {activeLevels} priority levels
        </p>
        <span className="flex shrink-0 items-center gap-1">
          <span className="relative flex h-1.5 w-1.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--secondary)] opacity-50" />
            <span className="relative inline-flex h-1 w-1 rounded-full bg-[var(--secondary)]" />
          </span>
          <span className="font-mono text-[0.8rem] text-[var(--on-surface-dim)] opacity-65">
            live
          </span>
        </span>
      </div>
    </aside>
  );
}

export function AttentionQueueSummary({ items }: { items: AttentionItem[] }) {
  const criticalCount = items.filter((item) => item.priority === "critical").length;
  const warningCount = items.filter((item) => item.priority === "warning").length;
  const infoCount = items.filter((item) => item.priority === "info").length;

  return (
    <QueueSummary
      criticalCount={criticalCount}
      infoCount={infoCount}
      warningCount={warningCount}
    />
  );
}

function QueueSummary({
  criticalCount,
  infoCount,
  warningCount,
}: {
  criticalCount: number;
  infoCount: number;
  warningCount: number;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2 font-mono text-[0.82rem] text-[var(--on-surface-dim)] opacity-80">
      {criticalCount > 0 && <span className="text-[var(--error)]">{criticalCount} critical</span>}
      {criticalCount > 0 && warningCount > 0 && <span>/</span>}
      {warningCount > 0 && <span>{warningCount} review</span>}
      {infoCount > 0 && warningCount === 0 && criticalCount === 0 && <span>{infoCount} info</span>}
    </div>
  );
}
