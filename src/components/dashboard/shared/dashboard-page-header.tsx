import { cn } from "@/lib/utils";

export function DashboardPageHeader({
  actions,
  className,
  description,
  status,
  title,
}: {
  actions?: React.ReactNode;
  className?: string;
  description?: string;
  status?: React.ReactNode;
  title: string;
}) {
  return (
    <header
      className={cn(
        "mb-8 flex flex-col gap-5 border-b border-[var(--glass-border)] pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="title-serif text-[clamp(2.05rem,3vw,2.75rem)] font-medium leading-none tracking-tight text-[var(--on-surface)]">
            {title}
          </h1>
          {status}
        </div>
        {description && (
          <p className="mt-2 max-w-4xl text-[0.92rem] leading-[1.65] text-[var(--on-surface-dim)]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
