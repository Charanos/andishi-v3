import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]",
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="my-8 h-8 w-32" />
      <div className="my-8 grid gap-2">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-full" />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
      <div className="grid gap-3">
        <Skeleton className="h-4 w-44" />
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="grid grid-cols-4 gap-4">
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
          </div>
        ))}
      </div>
    </div>
  );
}
