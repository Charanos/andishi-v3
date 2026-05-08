"use client";

import { useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function FilterBar({
  filters,
  placeholder = "Search...",
}: {
  filters: string[];
  placeholder?: string;
}) {
  const [active, setActive] = useState(filters[0]);

  return (
    <div className="rounded-[1.1rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 backdrop-blur-2xl">
      <div className="grid gap-3 lg:grid-cols-[1fr_18rem] lg:items-center">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActive(filter)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-2 text-[0.78rem] font-medium transition-colors duration-300",
                active === filter
                  ? "border-[color-mix(in_srgb,var(--secondary)_30%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_9%,transparent)] text-[var(--secondary)]"
                  : "border-[var(--glass-border)] text-[var(--on-surface-dim)]",
              )}
            >
              {filter}
            </button>
          ))}
        </div>
        <label className="relative">
          <IconSearch size={16} stroke={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]" />
          <input
            placeholder={placeholder}
            className="h-10 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] pl-9 pr-4 text-[0.9rem] outline-none placeholder:text-[var(--on-surface-dim)]"
          />
        </label>
      </div>
    </div>
  );
}
