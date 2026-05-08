export function DrawerPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-2xl lg:sticky lg:top-24">
      <p className="label-caps text-[var(--secondary)]">Detail panel</p>
      <h2 className="mt-4 text-[1.2rem] font-medium text-[var(--on-surface)]">{title}</h2>
      <div className="mt-5">{children}</div>
    </aside>
  );
}
