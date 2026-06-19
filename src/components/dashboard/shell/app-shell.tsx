"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DashboardTopNav } from "@/components/dashboard/shell/dashboard-top-nav";
import { FloatingSupportChat } from "@/components/dashboard/shell/floating-support-chat";
import { RoleSidebar } from "@/components/dashboard/shell/role-sidebar";
import { ToastProvider } from "@/components/dashboard/shared/toast-provider";
import type { AuthUser } from "@/types/auth";

type DashboardShellContextValue = {
  collapsed: boolean;
  mobileNavOpen: boolean;
  closeMobileNav: () => void;
  openMobileNav: () => void;
  toggleCollapsed: () => void;
};

const DashboardShellContext = createContext<DashboardShellContextValue | null>(null);

export function AppShell({
  user,
  children,
}: {
  user: AuthUser;
  children: ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const toggleCollapsed = useCallback(() => setCollapsed((value) => !value), []);
  const shell = useMemo(
    () => ({
      collapsed,
      mobileNavOpen,
      closeMobileNav,
      openMobileNav,
      toggleCollapsed,
    }),
    [closeMobileNav, collapsed, mobileNavOpen, openMobileNav, toggleCollapsed],
  );

  return (
    <DashboardShellContext.Provider value={shell}>
      <ToastProvider>
        <div className="dashboard-typography min-h-svh bg-[color-mix(in_srgb,var(--bg)_94%,var(--surface)_6%)] text-[var(--on-surface)]">
          <RoleSidebar user={user} />
          <div className={collapsed ? "min-w-0 lg:pl-[5.7rem]" : "min-w-0 lg:pl-[17.5rem]"}>
            <DashboardTopNav user={user} onOpenMobileNav={shell.openMobileNav} />
            <main className="px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-8">
              <div className="mx-auto w-full max-w-[92rem]">{children}</div>
            </main>
            <FloatingSupportChat user={user} />
          </div>
        </div>
      </ToastProvider>
    </DashboardShellContext.Provider>
  );
}

export function useDashboardShell() {
  const value = useContext(DashboardShellContext);

  if (!value) {
    throw new Error("useDashboardShell must be used inside AppShell");
  }

  return value;
}
