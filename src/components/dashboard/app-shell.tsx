import type { ReactNode } from "react";
import { DashboardTopNav } from "@/components/dashboard/dashboard-top-nav";
import { RoleSidebar } from "@/components/dashboard/role-sidebar";
import type { DashboardRole } from "@/data/dashboard";

export function AppShell({
  role,
  children,
}: {
  role: DashboardRole;
  children: ReactNode;
}) {
  return (
    <div className="min-h-svh bg-[var(--bg)] text-[var(--on-surface)] lg:flex">
      <RoleSidebar role={role} />
      <div className="min-w-0 flex-1">
        <DashboardTopNav role={role} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
