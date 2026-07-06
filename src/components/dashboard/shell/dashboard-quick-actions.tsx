"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  IconBriefcase,
  IconCalendarPlus,
  IconCreditCard,
  IconFilePlus,
  IconHelp,
  IconMessageCircle,
  IconPlus,
  IconReceipt,
  IconReportAnalytics,
  IconSparkles,
  IconUserPlus,
  type Icon,
} from "@tabler/icons-react";
import { useDetailsPopover } from "@/components/dashboard/shell/use-details-popover";
import type { AuthUser } from "@/types/auth";

type QuickAction = {
  description: string;
  href: string;
  icon: Icon;
  label: string;
};

const roleActions: Record<AuthUser["role"], QuickAction[]> = {
  admin: [
    { description: "Review or create a demand signal.", href: "/admin/briefs", icon: IconFilePlus, label: "New brief" },
    { description: "Invite an operator, client, or engineer.", href: "/admin/users", icon: IconUserPlus, label: "Invite user" },
    { description: "Open collection, payout, and invoice controls.", href: "/admin/payments", icon: IconReceipt, label: "Issue invoice" },
    { description: "Inspect governance, exports, and audit trails.", href: "/admin/audit", icon: IconReportAnalytics, label: "Audit report" },
    { description: "Resolve client or developer escalations.", href: "/admin/support", icon: IconHelp, label: "Support desk" },
  ],
  client: [
    { description: "Create or refine the hiring brief.", href: "/dashboard/brief", icon: IconFilePlus, label: "Brief update" },
    { description: "Review prepared developer profiles.", href: "/dashboard/matches", icon: IconSparkles, label: "View matches" },
    { description: "Message the Andishi team.", href: "/dashboard/messages", icon: IconMessageCircle, label: "Message admin" },
    { description: "Review invoices and payment status.", href: "/dashboard/payments", icon: IconCreditCard, label: "Payments" },
  ],
  developer: [
    { description: "Submit today’s work evidence.", href: "/dev/time", icon: IconCalendarPlus, label: "Log time" },
    { description: "Refresh proof, availability, and signals.", href: "/dev/profile", icon: IconUserPlus, label: "Update profile" },
    { description: "Check payout status and monthly earnings.", href: "/dev/earnings", icon: IconCreditCard, label: "Earnings" },
    { description: "Open project delivery context.", href: "/dev/projects", icon: IconBriefcase, label: "Projects" },
  ],
};

const roleCopy: Record<AuthUser["role"], { description: string; title: string }> = {
  admin: {
    description: "Create, govern, and jump into command workflows.",
    title: "Admin actions",
  },
  client: {
    description: "Move hiring, communication, and billing forward.",
    title: "Workspace actions",
  },
  developer: {
    description: "Update delivery, profile, and payment workflows.",
    title: "Workbench actions",
  },
};

export function DashboardQuickActions({ role }: { role: AuthUser["role"] }) {
  const popoverRef = useDetailsPopover();
  const copy = roleCopy[role];

  return (
    <details
      ref={popoverRef}
      name="dashboard-topbar-menu"
      className="group relative hidden sm:block"
    >
      <summary
        aria-label="Open quick actions"
        className="grid h-8 w-8 cursor-pointer list-none place-items-center rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] text-[var(--bg)] shadow-[0_12px_28px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)] transition-transform duration-300 hover:-translate-y-px"
      >
        <IconPlus size={16} stroke={1.8} />
      </summary>
      <div className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-2 shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)]">
        <div className="px-3 py-3">
          <p className="text-[0.9rem] font-medium text-[var(--on-surface)]">{copy.title}</p>
          <p className="mt-1 text-[0.78rem] leading-relaxed text-[var(--on-surface-dim)]">{copy.description}</p>
        </div>
        <div className="grid gap-1">
          {roleActions[role].map((action) => {
            const ActionIcon = action.icon;
            return (
              <QuickLink
                key={action.href}
                description={action.description}
                href={action.href}
                icon={<ActionIcon size={17} stroke={1.6} />}
              >
                {action.label}
              </QuickLink>
            );
          })}
        </div>
      </div>
    </details>
  );
}

function QuickLink({
  children,
  description,
  href,
  icon,
}: {
  children: ReactNode;
  description: string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="grid cursor-pointer grid-cols-[1.75rem_minmax(0,1fr)] gap-2 rounded-xl px-3 py-2.5 text-[0.86rem] text-[var(--on-surface-dim)] transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--on-surface)_7%,transparent)] hover:text-[var(--on-surface)]"
    >
      <span className="mt-0.5 text-[var(--secondary)]">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-[var(--on-surface)]">{children}</span>
        <span className="mt-1 block text-[0.72rem] leading-snug text-[var(--on-surface-dim)]">
          {description}
        </span>
      </span>
    </Link>
  );
}
