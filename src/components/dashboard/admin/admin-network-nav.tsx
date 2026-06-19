"use client";

import Link from "next/link";
import {
  IconBuilding,
  IconChevronRight,
  IconUsersGroup,
  type Icon,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type NetworkStep = "clients" | "engineers";

const networkLinks: Array<{
  description: string;
  href: string;
  icon: Icon;
  id: NetworkStep;
  label: string;
}> = [
  {
    description: "Talent supply",
    href: "/admin/engineers",
    icon: IconUsersGroup,
    id: "engineers",
    label: "Engineers",
  },
  {
    description: "Account network",
    href: "/admin/clients",
    icon: IconBuilding,
    id: "clients",
    label: "Clients",
  },
];

export function AdminNetworkNav({ active }: { active: NetworkStep }) {
  return (
    <section className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_10%,var(--surface)),var(--surface))] px-3 py-3 shadow-[0_14px_38px_color-mix(in_srgb,var(--bg-deep)_5%,transparent)] sm:px-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center">
          <div className="shrink-0 px-1">
            <p className="label-caps text-[var(--primary)]">Network</p>
            <p className="mt-1 text-[0.76rem] text-[var(--on-surface-dim)]">
              Supply and accounts
            </p>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-1.5 rounded-[1.1rem] border border-[color-mix(in_srgb,var(--glass-border)_78%,transparent)] bg-[var(--glass-bg)] p-1.5 sm:flex sm:flex-wrap sm:items-center sm:rounded-full">
            {networkLinks.map((link) => {
              const current = active === link.id;
              const LinkIcon = link.icon;
              return (
                <Link
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "group inline-flex min-h-9 min-w-0 items-center justify-center gap-2 rounded-full px-3 text-[0.82rem] font-medium transition-all duration-200 sm:justify-start",
                    current
                      ? "bg-[var(--on-surface)] text-[var(--bg)] shadow-[0_10px_24px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]"
                      : "text-[var(--on-surface-dim)] hover:bg-[color-mix(in_srgb,var(--on-surface)_5%,transparent)] hover:text-[var(--on-surface)]",
                  )}
                  href={link.href}
                  key={link.href}
                >
                  <LinkIcon size={15} stroke={1.7} />
                  <span className="truncate">{link.label}</span>
                  {current && (
                    <span className="hidden rounded-full bg-[color-mix(in_srgb,var(--bg)_12%,transparent)] px-2 py-0.5 text-[0.65rem] text-[var(--bg)] md:inline">
                      {link.description}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
        <Link
          className="inline-flex min-h-9 min-w-0 items-center justify-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--primary)_26%,var(--glass-border))] bg-[var(--glass-bg)] px-3 text-[0.78rem] font-medium text-[var(--on-surface)] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--primary)_7%,transparent)] sm:w-fit"
          href="/admin/briefs/shortlist"
        >
          <span className="truncate">Open shortlist workspace</span>
          <IconChevronRight size={14} stroke={1.7} />
        </Link>
      </div>
    </section>
  );
}
