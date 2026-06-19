import {
  IconActivity,
  IconArrowRight,
  IconCircleCheck,
} from "@tabler/icons-react";
import Link from "next/link";

export type ActivityFeedItem = {
  id?: string;
  time: string;
  label: string;
  detail?: string;
};

export function ActivityFeed({
  cta,
  emptyLabel = "No activity yet.",
  items,
  variant = "default",
}: {
  cta?: { href: string; label: string };
  emptyLabel?: string;
  items: ActivityFeedItem[] | string[][];
  variant?: "default" | "timeline";
}) {
  const normalized = items.map((item) =>
    Array.isArray(item) ? { time: item[0], label: item[1] } : item,
  );

  return (
    <div className="min-w-0 rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 backdrop-blur-2xl sm:p-5">
      <p className="label-caps mb-5 border-b border-[var(--glass-border)] pb-3 text-[var(--secondary)]">
        Recent activity
      </p>
      {normalized.length && variant === "timeline" ? (
        <div className="relative grid gap-5">
          <span
            aria-hidden="true"
            className="absolute bottom-4 left-[1.1rem] top-2 w-px bg-[var(--glass-border)]"
          />
          {normalized.map((item) => (
            <div
              key={item.id ?? `${item.time}-${item.label}`}
              className="relative grid min-w-0 grid-cols-[2.2rem_minmax(0,1fr)] gap-3"
            >
              <span className="z-[1] grid h-9 w-9 place-items-center rounded-full border border-[color-mix(in_srgb,var(--secondary)_22%,transparent)] bg-[var(--surface)] text-[var(--secondary)]">
                <IconCircleCheck size={16} stroke={1.7} />
              </span>
              <div className="min-w-0">
                <p className="break-words text-[0.94rem] font-medium leading-snug text-[var(--on-surface)]">
                  {item.label}
                </p>
                {item.detail && (
                  <p className="mt-1.5 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
                    {item.detail}
                  </p>
                )}
                <p className="mt-1.5 font-mono text-[0.8rem] text-[var(--on-surface-dim)]">
                  {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : normalized.length ? (
        <div className="grid gap-4">
          {normalized.map((item) => (
            <div
              key={item.id ?? `${item.time}-${item.label}`}
              className="grid min-w-0 grid-cols-[4.6rem_minmax(0,1fr)] gap-3 text-[0.96rem] sm:grid-cols-[5rem_minmax(0,1fr)]"
            >
              <span className="font-mono text-[0.8rem] text-[var(--on-surface-dim)]">
                {item.time}
              </span>
              <span className="min-w-0 break-words text-[var(--on-surface-dim)]">
                <span className="block text-[var(--on-surface)]">
                  {item.label}
                </span>
                {item.detail && (
                  <span className="mt-1 block text-[0.9rem] leading-relaxed">
                    {item.detail}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--glass-border)] px-4 py-6 text-center">
          <IconActivity
            className="mx-auto text-[var(--on-surface-dim)]"
            size={22}
            stroke={1.5}
          />
          <p className="mt-3 text-[0.96rem] text-[var(--on-surface-dim)]">
            {emptyLabel}
          </p>
        </div>
      )}
      {cta && (
        <Link
          href={cta.href}
          className="my-8 flex items-center justify-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_65%,var(--surface)_35%)] px-4 py-3 text-[0.9rem] font-medium text-[var(--on-surface-dim)] transition-colors duration-300 hover:text-[var(--on-surface)]"
        >
          {cta.label}
          <IconArrowRight size={14} stroke={1.7} />
        </Link>
      )}
    </div>
  );
}
