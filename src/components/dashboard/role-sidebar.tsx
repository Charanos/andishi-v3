"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { DashboardRole } from "@/data/dashboard";
import { roleLabels, roleNav } from "@/data/dashboard";
import { cn } from "@/lib/utils";

export function RoleSidebar({ role }: { role: DashboardRole }) {
  const pathname = usePathname();
  const groups = [...new Set(roleNav[role].map((item) => item.group))];

  return (
    <aside className="hidden h-svh w-72 shrink-0 border-r border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg-deep)_88%,transparent)] p-4 backdrop-blur-2xl lg:sticky lg:top-0 lg:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 px-2 py-2">
          <Link href="/" aria-label="Andishi home">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
        <div className="mt-6 rounded-[1rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
          <p className="label-caps text-[var(--secondary)]">{roleLabels[role]}</p>
          <p className="mt-2 text-[0.9rem] text-[var(--on-surface-dim)]">
            Static v3 workspace preview
          </p>
        </div>
        <nav className="mt-6 flex-1 overflow-y-auto pr-1">
          {groups.map((group) => (
            <div key={group} className="mb-5">
              <p className="label-caps mb-2 px-2 text-[0.66rem] text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)]">
                {group}
              </p>
              <div className="grid gap-1">
                {roleNav[role].filter((item) => item.group === group).map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9rem] transition-colors duration-300",
                        active
                          ? "bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--on-surface)]"
                          : "text-[var(--on-surface-dim)] hover:bg-[color-mix(in_srgb,var(--on-surface)_7%,transparent)] hover:text-[var(--on-surface)]",
                      )}
                    >
                      <Icon size={18} stroke={active ? 1.9 : 1.5} className={active ? "text-[var(--secondary)]" : undefined} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <Link
          href="/hire"
          className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 text-[0.9rem] text-[var(--on-surface-dim)] transition-colors duration-300 hover:text-[var(--on-surface)]"
        >
          Back to public site
        </Link>
      </div>
    </aside>
  );
}
