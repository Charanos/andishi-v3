"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronRight, IconMenu2 } from "@tabler/icons-react";
import { Logo } from "@/components/brand/logo";
import { AccountMenu } from "@/components/dashboard/shell/account-menu";
import { CommandMenu } from "@/components/dashboard/shell/command-menu";
import { DashboardCalendarMenu } from "@/components/dashboard/shell/dashboard-calendar-menu";
import { DashboardQuickActions } from "@/components/dashboard/shell/dashboard-quick-actions";
import { NotificationMenu } from "@/components/dashboard/shell/notification-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";
import { useDashboardShell } from "@/components/dashboard/shell/app-shell";
import { useAppearance } from "@/components/dashboard/shared/appearance-provider";

const routeLabels: Record<string, string> = {
  "/admin": "Overview",
  "/admin/audit": "Audit Reports",
  "/admin/briefs": "Briefs",
  "/admin/briefs/shortlist": "Shortlists",
  "/admin/matches": "Pipeline",
  "/admin/matches/board": "Pipeline Board",
  "/admin/engineers": "Engineers",
  "/admin/clients": "Clients",
  "/admin/placements": "Placements",
  "/admin/placements/timeline": "Timeline",
  "/admin/payments": "Payments",
  "/admin/profile": "Profile",
  "/admin/revenue": "Revenue",
  "/admin/notifications": "Notifications",
  "/admin/content": "Content",
  "/admin/settings": "Settings",
  "/admin/support": "Support",
  "/admin/users": "User Mgmt",
  "/dashboard": "Overview",
  "/dashboard/brief": "Brief",
  "/dashboard/matches": "Matches",
  "/dashboard/team": "My Team",
  "/dashboard/projects": "Projects",
  "/dashboard/messages": "Messages",
  "/dashboard/payments": "Payments",
  "/dashboard/settings": "Settings",
  "/dashboard/support": "Support",
  "/dev": "Overview",
  "/dev/profile": "My Profile",
  "/dev/projects": "Projects",
  "/dev/time": "Time Tracking",
  "/dev/earnings": "Earnings",
  "/dev/messages": "Messages",
  "/dev/settings": "Settings",
  "/dev/support": "Support",
};

const roleRoots: Record<AuthUser["role"], { href: string; label: string }> = {
  admin: { href: "/admin", label: "Admin" },
  client: { href: "/dashboard", label: "Workspace" },
  developer: { href: "/dev", label: "Workbench" },
};

type Crumb = {
  current: boolean;
  href: string;
  label: string;
};

export function DashboardTopNav({
  onOpenMobileNav,
  user,
}: {
  onOpenMobileNav: () => void;
  user: AuthUser;
}) {
  const pathname = usePathname();
  const scrolled = useScrolled(20);
  const { hasModalOpen } = useDashboardShell();
  const { appearance } = useAppearance();
  const page = useMemo(
    () => getDashboardPage(pathname, user.role),
    [pathname, user.role],
  );

  return (
    <header
      aria-label="Dashboard top navigation"
      className={cn(
        "sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8 transition-all duration-300",
        hasModalOpen ? "opacity-0 pointer-events-none -translate-y-4" : "opacity-100 translate-y-0"
      )}
    >
      <div
        data-topnav-theme={appearance.topNavTheme}
        className={cn(
          "dashboard-topnav-pill mx-auto flex w-full max-w-[92rem] items-center gap-3 rounded-[1.35rem] border p-2 backdrop-blur-2xl sm:p-2.5",
          "transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
          scrolled
            ? "border-[color-mix(in_srgb,var(--glass-border)_75%,transparent)] bg-[color-mix(in_srgb,var(--surface)_93%,transparent)] shadow-[0_16px_44px_color-mix(in_srgb,var(--bg-deep)_12%,transparent)]"
            : "border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] shadow-[0_10px_30px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <MobileLocation isRoot={page.isRoot} title={page.title} />

          <div className="hidden min-w-0 shrink-0 lg:flex lg:w-[min(31rem,38vw)]">
            <CommandMenu className="w-full" role={user.role} />
          </div>

          <Breadcrumbs crumbs={page.crumbs} />
        </div>

        <div className="flex shrink-0 items-center">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <DashboardCalendarMenu role={user.role} />
            <NotificationMenu user={user} />
            <ThemeToggle />
          </div>

          <Divider className="sm:mx-4" />

          <div className="flex items-center gap-1 sm:gap-1.5">
            <DashboardQuickActions role={user.role} />
            <AccountMenu user={user} />
          </div>

          <Divider className="lg:hidden" />

          <button
            type="button"
            aria-label="Open navigation"
            aria-haspopup="dialog"
            onClick={onOpenMobileNav}
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors duration-200 hover:text-[var(--on-surface)] lg:hidden"
          >
            <IconMenu2 size={18} stroke={1.7} />
          </button>
        </div>
      </div>
    </header>
  );
}

function MobileLocation({ isRoot, title }: { isRoot: boolean; title: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 lg:hidden">
      <Link
        href="/"
        aria-label="Andishi home"
        className="shrink-0 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_40%,transparent)]"
      >
        <Logo
          showWordmark={false}
          wordmarkClassName="text-[var(--on-surface)]"
        />
      </Link>
      {!isRoot && (
        <>
          <IconChevronRight
            aria-hidden
            className="shrink-0 text-[var(--on-surface-dim)] opacity-45"
            size={12}
            stroke={2.2}
          />
          <span className="truncate text-[0.92rem] font-medium text-[var(--on-surface)]">
            {title}
          </span>
        </>
      )}
    </div>
  );
}

function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  if (crumbs.length < 2) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden min-w-0 flex-1 items-center gap-1.5 overflow-hidden lg:flex"
    >
      {crumbs.map((crumb, index) => (
        <span key={crumb.href} className="flex min-w-0 items-center gap-1.5">
          {index > 0 && (
            <IconChevronRight
              aria-hidden
              className="shrink-0 text-[var(--on-surface-dim)] opacity-35"
              size={11}
              stroke={2.2}
            />
          )}
          {crumb.current ? (
            <span
              aria-current="page"
              className="truncate text-[0.92rem] font-medium text-[var(--on-surface)]"
            >
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="truncate text-[0.92rem] text-[var(--on-surface-dim)] transition-colors duration-200 hover:text-[var(--on-surface)]"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

function Divider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "mx-1.5 h-4 w-px shrink-0 rounded-full bg-[var(--glass-border)] opacity-70",
        className,
      )}
    />
  );
}

function getDashboardPage(pathname: string, role: AuthUser["role"]) {
  const root = roleRoots[role];
  const currentPath = normalizeDashboardPath(pathname);
  const isRoot = currentPath === root.href;
  const title =
    routeLabels[currentPath] ??
    titleize(currentPath.split("/").filter(Boolean).at(-1) ?? "Overview");
  const crumbs: Crumb[] = isRoot
    ? [{ current: true, href: currentPath, label: title }]
    : [
        { current: false, href: root.href, label: root.label },
        { current: true, href: currentPath, label: title },
      ];

  return { crumbs, isRoot, title };
}

function normalizeDashboardPath(pathname: string) {
  if (routeLabels[pathname]) return pathname;
  const knownRoute = Object.keys(routeLabels)
    .filter((route) => pathname === route || pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length)[0];
  if (knownRoute) return knownRoute;

  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) return pathname;
  const root =
    segments[0] === "admin" || segments[0] === "dev"
      ? segments[0]
      : "dashboard";
  const child = segments[1];
  return child ? `/${root}/${child}` : `/${root}`;
}

function titleize(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > threshold);
        frameRef.current = null;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameRef.current !== null)
        window.cancelAnimationFrame(frameRef.current);
    };
  }, [threshold]);

  return scrolled;
}
