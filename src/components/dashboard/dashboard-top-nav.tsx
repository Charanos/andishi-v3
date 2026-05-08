"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBell, IconMenu2 } from "@tabler/icons-react";
import type { DashboardRole } from "@/data/dashboard";
import { roleLabels, roleNav } from "@/data/dashboard";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function DashboardTopNav({ role }: { role: DashboardRole }) {
  const pathname = usePathname();
  const current = roleNav[role].find((item) => item.href === pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_84%,transparent)] px-4 py-3 backdrop-blur-2xl sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
            {roleLabels[role]} / {current?.label ?? "Workspace"}
          </p>
          <h1 className="mt-1 truncate text-[1.15rem] font-medium text-[var(--on-surface)]">
            {current?.label ?? "Workspace"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden rounded-full border border-[var(--glass-border)] px-3 py-2 text-[0.82rem] text-[var(--on-surface-dim)] sm:inline-flex"
          >
            Public site
          </Link>
          <button className="grid h-10 w-10 place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)]" aria-label="Notifications">
            <IconBell size={17} stroke={1.6} />
          </button>
          <ThemeToggle />
          <button className="grid h-10 w-10 place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] lg:hidden" aria-label="Open navigation">
            <IconMenu2 size={18} stroke={1.7} />
          </button>
        </div>
      </div>
    </header>
  );
}
