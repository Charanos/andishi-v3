"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DashboardTopNav } from "@/components/dashboard/shell/dashboard-top-nav";
import { FloatingSupportChat } from "@/components/dashboard/shell/floating-support-chat";
import { RoleSidebar } from "@/components/dashboard/shell/role-sidebar";
import { ToastProvider } from "@/components/dashboard/shared/toast-provider";
import { AppearanceProvider, contrastOnColor, useAppearance } from "@/components/dashboard/shared/appearance-provider";
import type { AuthUser } from "@/types/auth";

type DashboardShellContextValue = {
  collapsed: boolean;
  mobileNavOpen: boolean;
  closeMobileNav: () => void;
  openMobileNav: () => void;
  toggleCollapsed: () => void;
  hasModalOpen: boolean;
};

const DashboardShellContext = createContext<DashboardShellContextValue | null>(null);

function AppShellInner({
  user,
  children,
}: {
  user: AuthUser;
  children: ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [hasModalOpen, setHasModalOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkModal = () => {
      const modal = document.querySelector(
        '[role="dialog"]:not([aria-label="Command search"]), [aria-modal="true"]:not([aria-label="Command search"])'
      );
      setHasModalOpen(!!modal);
    };
    checkModal();
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const { appearance, updateAppearance } = useAppearance();
  // Single source of truth: sidebar collapse state IS appearance.sidebarState,
  // not a separately-tracked local boolean. Every earlier version of this
  // (mirroring it into local state, syncing once on load, syncing on every
  // change) created a way for the two to drift - most visibly, the Settings
  // page's collapse/expand toggle updating appearance but nothing ever
  // reapplying it to the shell. Deriving it directly makes that class of bug
  // impossible: there is nothing left to fall out of sync.
  const collapsed = appearance.sidebarState === "collapsed";

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const toggleCollapsed = useCallback(() => {
    updateAppearance("sidebarState", collapsed ? "expanded" : "collapsed");
  }, [collapsed, updateAppearance]);
  const handleOpenChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    setChatOpen(true);
  }, []);

  // Apply the persisted accent color scoped to this shell node only (never
  // document.documentElement/body) so it can't bleed into public marketing
  // routes, which share the same root layout and would otherwise keep the
  // override after navigating away since nothing would ever unmount it.
  useEffect(() => {
    const node = shellRef.current;
    if (!node || !appearance.primaryAccent) return;
    node.style.setProperty("--primary", appearance.primaryAccent);
    node.style.setProperty("--on-primary", contrastOnColor(appearance.primaryAccent));
  }, [appearance.primaryAccent]);

  const shell = useMemo(
    () => ({
      collapsed,
      mobileNavOpen,
      closeMobileNav,
      openMobileNav,
      toggleCollapsed,
      hasModalOpen,
    }),
    [closeMobileNav, collapsed, mobileNavOpen, openMobileNav, toggleCollapsed, hasModalOpen],
  );

  return (
    <DashboardShellContext.Provider value={shell}>
      <ToastProvider>
        <div ref={shellRef} className="dashboard-typography min-h-svh bg-[color-mix(in_srgb,var(--bg)_94%,var(--surface)_6%)] text-[var(--on-surface)]">
          <RoleSidebar user={user} activeChatId={activeChatId} onOpenChat={handleOpenChat} />
          <div className={collapsed ? "min-w-0 lg:pl-[5.7rem] transition-all duration-300" : "min-w-0 lg:pl-[17.5rem] transition-all duration-300"}>
            {appearance.topBarState !== "hidden" && (
               <DashboardTopNav user={user} onOpenMobileNav={shell.openMobileNav} />
            )}
            <main className="px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-8">
              <div className="mx-auto w-full max-w-[92rem]">{children}</div>
            </main>
            <FloatingSupportChat
              user={user}
              activeChatId={activeChatId}
              setActiveChatId={setActiveChatId}
              open={chatOpen}
              setOpen={setChatOpen}
            />
          </div>
        </div>
      </ToastProvider>
    </DashboardShellContext.Provider>
  );
}

export function AppShell({
  user,
  children,
}: {
  user: AuthUser;
  children: ReactNode;
}) {
  return (
    <AppearanceProvider>
      <AppShellInner user={user}>{children}</AppShellInner>
    </AppearanceProvider>
  );
}

export function useDashboardShell() {
  const value = useContext(DashboardShellContext);

  if (!value) {
    throw new Error("useDashboardShell must be used inside AppShell");
  }

  return value;
}
