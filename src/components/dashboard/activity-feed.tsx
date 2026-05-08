export function ActivityFeed({ items }: { items: string[][] }) {
  return (
    <div className="rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-2xl">
      <p className="label-caps mb-5 text-[var(--secondary)]">Recent activity</p>
      <div className="grid gap-4">
        {items.map(([time, label]) => (
          <div key={`${time}-${label}`} className="grid grid-cols-[4.8rem_1fr] gap-3 text-[0.9rem]">
            <span className="font-mono text-[0.72rem] text-[var(--on-surface-dim)]">{time}</span>
            <span className="text-[var(--on-surface-dim)]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
