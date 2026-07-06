"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconSettings,
  IconUserCircle,
  IconUsers,
  IconReportAnalytics,
  type Icon,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type PlatformStep = "users" | "audit" | "profile" | "settings";

const platformLinks: Array<{
  description: string;
  href: string;
  icon: Icon;
  id: PlatformStep;
  label: string;
}> = [
  {
    description: "Access control",
    href: "/admin/users",
    icon: IconUsers,
    id: "users",
    label: "User Mgmt",
  },
  {
    description: "Security review",
    href: "/admin/audit",
    icon: IconReportAnalytics,
    id: "audit",
    label: "Audit Reports",
  },
  {
    description: "My account",
    href: "/admin/profile",
    icon: IconUserCircle,
    id: "profile",
    label: "Profile",
  },
  {
    description: "Platform config",
    href: "/admin/settings",
    icon: IconSettings,
    id: "settings",
    label: "Settings",
  },
];

export function AdminPlatformNav() {
  const pathname = usePathname();
  
  // Determine active tab based on pathname
  let active: PlatformStep = "settings";
  if (pathname.includes("/admin/users")) active = "users";
  else if (pathname.includes("/admin/audit")) active = "audit";
  else if (pathname.includes("/admin/profile")) active = "profile";
  else if (pathname.includes("/admin/settings")) active = "settings";

  const activeIndex = platformLinks.findIndex((link) => link.id === active);

  return (
    <section className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_10%,var(--surface)),var(--surface))] px-3 py-3 shadow-[0_14px_38px_color-mix(in_srgb,var(--bg-deep)_5%,transparent)] sm:px-4 mb-8">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="shrink-0 px-1">
            <p className="label-caps text-[var(--primary)]">Platform</p>
            <p className="mt-1 text-[0.76rem] text-[var(--on-surface-dim)]">
              Governance & Identity
            </p>
          </div>
          <div className="min-w-0">
            <div className="grid min-w-0 grid-cols-2 gap-1.5 rounded-[1.1rem] border border-[color-mix(in_srgb,var(--glass-border)_78%,transparent)] bg-[var(--glass-bg)] p-1.5 sm:flex sm:flex-wrap sm:items-center sm:rounded-full">
              {platformLinks.map((link, index) => {
                const current = active === link.id;
                const LinkIcon = link.icon;
                return (
                  <span
                    className="flex min-w-0 items-center gap-1.5"
                    key={link.href}
                  >
                    <Link
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "group inline-flex min-h-9 min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 text-[0.82rem] font-medium transition-all duration-200 sm:flex-none sm:justify-start",
                        current
                          ? "bg-[var(--on-surface)] text-[var(--bg)] shadow-[0_10px_24px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]"
                          : "text-[var(--on-surface-dim)] hover:bg-[color-mix(in_srgb,var(--on-surface)_5%,transparent)] hover:text-[var(--on-surface)]",
                      )}
                      href={link.href}
                    >
                      <LinkIcon size={15} stroke={1.7} />
                      <span className="truncate">{link.label}</span>
                      {current && (
                        <span className="hidden rounded-full bg-[color-mix(in_srgb,var(--bg)_12%,transparent)] px-2 py-0.5 text-[0.65rem] text-[var(--bg)] md:inline">
                          {link.description}
                        </span>
                      )}
                    </Link>
                    {index < platformLinks.length - 1 && (
                      <span
                        aria-hidden
                        className={cn(
                          "hidden h-px w-5 shrink-0 lg:block",
                          index < activeIndex
                            ? "bg-[var(--primary)]"
                            : "bg-[var(--glass-border)]",
                        )}
                      />
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
