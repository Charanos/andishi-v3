import { cn } from "@/lib/utils";

export function DashboardSection({
  action,
  children,
  className,
  description,
  title,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  description?: string;
  title?: string;
}) {
  return (
    <section className={cn("grid gap-4", className)}>
      {(title || description || action) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && (
              <h2 className="title-serif text-[clamp(1.48rem,2vw,1.9rem)] font-medium leading-tight text-[var(--on-surface)]">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
