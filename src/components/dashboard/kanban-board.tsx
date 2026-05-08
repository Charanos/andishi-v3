import { StatusBadge } from "@/components/dashboard/status-badge";

const columns = [
  ["New Briefs", ["AI workflow", "Backend API", "AWS audit"]],
  ["Shortlisting", ["Full-stack SaaS", "Web3 launch"]],
  ["Intro Requested", ["Kwame / SaaS", "Amina / fintech"]],
  ["Placed", ["Zainab / cloud"]],
] as const;

export function KanbanBoard() {
  return (
    <div className="grid gap-4 overflow-x-auto lg:grid-cols-4">
      {columns.map(([title, cards]) => (
        <section key={title} className="min-w-64 rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between">
            <p className="label-caps text-[var(--on-surface)]">{title}</p>
            <StatusBadge label={String(cards.length)} />
          </div>
          <div className="grid gap-3">
            {cards.map((card) => (
              <article key={card} className="rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] p-3">
                <p className="text-[0.92rem] font-medium text-[var(--on-surface)]">{card}</p>
                <p className="mt-2 text-[0.78rem] text-[var(--on-surface-dim)]">Owner · Next action today</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
