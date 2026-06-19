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
      <h2 className="title-serif mt-3 text-[1.38rem] font-medium leading-tight text-[var(--on-surface)]">
        {title}
      </h2>
      <div className="my-8">{children}</div>
    </aside>
  );
}
