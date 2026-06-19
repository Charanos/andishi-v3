import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { cn } from "@/lib/utils";

export type PipelineColumn = {
  count: number;
  items: Array<{
    avatars?: string[];
    meta: string;
    owner?: string;
    status?: string;
    time: string;
    title: string;
  }>;
  title: string;
};

export function PipelineBoard({
  actionSlot,
  columns,
}: {
  actionSlot?: React.ReactNode;
  columns: PipelineColumn[];
}) {
  const total = columns.reduce((sum, column) => sum + column.count, 0);

  return (
    <div className="rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_14px_44px_color-mix(in_srgb,var(--bg-deep)_6%,transparent),inset_0_1px_0_color-mix(in_srgb,white_16%,transparent)]">
      <div className="flex flex-col gap-3 border-b border-[var(--glass-border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[1.05rem] font-medium text-[var(--on-surface)]">
            Delivery Pipeline
          </p>
          <p className="mt-1 text-[0.9rem] text-[var(--on-surface-dim)]">
            Live overview of briefs moving through the placement pipeline.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--glass-border)] px-3 py-1.5 font-mono text-[0.76rem] text-[var(--on-surface-dim)]">
            Total active briefs {total}
          </span>
          {actionSlot}
        </div>
      </div>
      <div className="my-8 overflow-x-auto pb-2">
        <div className="grid min-w-[68rem] grid-cols-5 gap-4">
          {columns.map((column, index) => (
            <section key={column.title} className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.88rem] font-medium text-[var(--on-surface)]">
                    {column.title}
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
                    <span
                      className="block h-full rounded-full bg-[var(--secondary)]"
                      style={{
                        width: `${Math.max(18, Math.min(100, column.count * 7))}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="font-mono text-[0.76rem] text-[var(--on-surface-dim)]">
                  {column.count}
                </span>
              </div>
              <div className="grid gap-3">
                {column.items.map((item) => (
                  <article
                    key={`${column.title}-${item.title}`}
                    className={cn(
                      "min-h-[7.25rem] rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_42%,var(--surface)_58%)] p-3 shadow-[inset_0_1px_0_color-mix(in_srgb,white_12%,transparent)] transition-colors duration-300 hover:border-[color-mix(in_srgb,var(--secondary)_24%,var(--glass-border))]",
                      index === columns.length - 1 &&
                        "bg-[color-mix(in_srgb,var(--tertiary)_7%,var(--surface)_93%)]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[0.84rem] font-medium leading-snug text-[var(--on-surface)]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-[0.8rem] text-[var(--on-surface-dim)]">
                          {item.meta}
                        </p>
                      </div>
                      {item.status && (
                        <StatusBadge
                          label={item.status}
                          tone={
                            item.status === "Confirmed" ? "active" : "pending"
                          }
                        />
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
                        {item.time}
                      </p>
                      <div className="flex -space-x-1">
                        {(item.avatars ?? []).slice(0, 3).map((avatar) => (
                          <span
                            key={avatar}
                            className="grid h-5 w-5 place-items-center rounded-full border border-[var(--surface)] bg-[var(--on-surface)] font-mono text-[0.55rem] text-[var(--bg)]"
                          >
                            {avatar}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
