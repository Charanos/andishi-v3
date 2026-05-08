"use client";

import { useMemo, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { EngineerCard } from "@/components/marketing/engineer-card";
import { Button } from "@/components/ui/button";
import type { Engineer } from "@/data/engineers";
import { engineerRoles } from "@/data/engineers";
import { cn } from "@/lib/utils";

function matchesRole(engineer: Engineer, role: string) {
  if (role === "All") return true;
  const haystack = `${engineer.role} ${engineer.skills.join(" ")}`.toLowerCase();
  if (role === "AI/ML") return haystack.includes("ai") || haystack.includes("rag") || haystack.includes("ml");
  if (role === "Cloud/AWS") return haystack.includes("cloud") || haystack.includes("aws") || haystack.includes("terraform");
  return haystack.includes(role.toLowerCase().replace("-", ""));
}

export function EngineerDirectory({ engineers }: { engineers: Engineer[] }) {
  const [role, setRole] = useState<(typeof engineerRoles)[number]>("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(12);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return engineers
      .filter((engineer) => matchesRole(engineer, role))
      .filter((engineer) => !availableOnly || engineer.availability === "now")
      .filter((engineer) => {
        if (!normalized) return true;
        return `${engineer.name} ${engineer.role} ${engineer.skills.join(" ")} ${engineer.location.country}`
          .toLowerCase()
          .includes(normalized);
      });
  }, [availableOnly, engineers, query, role]);

  const shown = filtered.slice(0, visible);

  return (
    <div>
      <div className="sticky top-24 z-20 mb-8 rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg-deep)_88%,transparent)] p-3 shadow-[0_18px_60px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)] backdrop-blur-2xl">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {engineerRoles.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setRole(item);
                  setVisible(12);
                }}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-[0.78rem] font-medium transition-all duration-300",
                  role === item
                    ? "border-[color-mix(in_srgb,var(--secondary)_32%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]"
                    : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]",
                )}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAvailableOnly((value) => !value)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-[0.78rem] font-medium transition-all duration-300",
                availableOnly
                  ? "border-[color-mix(in_srgb,var(--tertiary)_34%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] text-[var(--tertiary)]"
                  : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]",
              )}
            >
              Available now
            </button>
          </div>
          <label className="relative block min-w-0 lg:w-80">
            <IconSearch
              size={17}
              stroke={1.5}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]"
            />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisible(12);
              }}
              placeholder="Search skills, country, role..."
              className="h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] pl-10 pr-4 text-[0.92rem] text-[var(--on-surface)] outline-none transition-colors duration-300 placeholder:text-[var(--on-surface-dim)] focus:border-[color-mix(in_srgb,var(--secondary)_42%,transparent)]"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((engineer) => (
          <EngineerCard key={engineer.slug} engineer={engineer} />
        ))}
      </div>

      {shown.length === 0 && (
        <div className="rounded-[1.3rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-8 text-center text-[var(--on-surface-dim)]">
          No engineers match those filters yet. Try another role or search term.
        </div>
      )}

      {filtered.length > visible && (
        <div className="mt-8 flex justify-center">
          <Button type="button" variant="glass" onClick={() => setVisible((value) => value + 12)}>
            Load more profiles
          </Button>
        </div>
      )}
    </div>
  );
}
