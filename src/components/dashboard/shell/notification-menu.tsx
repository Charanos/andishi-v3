"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  IconBell,
  IconCheck,
  IconClock,
  IconPointFilled,
  IconTrash,
} from "@tabler/icons-react";
import { useDetailsPopover } from "@/components/dashboard/shell/use-details-popover";
import type { AuthUser } from "@/types/auth";

type NotificationItem = {
  href: string;
  label: string;
  time: string;
};

const roleItems: Record<AuthUser["role"], NotificationItem[]> = {
  admin: [
    { href: "/admin/briefs", label: "New client brief needs commercial review", time: "Now" },
    { href: "/admin/matches/board", label: "Two matches moved to intro readiness", time: "42m ago" },
    { href: "/admin/payments", label: "Developer payout is waiting on collection gate", time: "2h ago" },
    { href: "/admin/audit", label: "Weekly governance export is ready", time: "Yesterday" },
  ],
  client: [
    { href: "/dashboard/matches", label: "Three prepared profiles are ready for review", time: "Now" },
    { href: "/dashboard/messages", label: "Andishi replied with intro windows", time: "1h ago" },
    { href: "/dashboard/payments", label: "Invoice receipt was attached to your workspace", time: "Yesterday" },
  ],
  developer: [
    { href: "/dev/profile", label: "Profile strength increased after proof refresh", time: "Now" },
    { href: "/dev/time", label: "Timesheet draft is waiting for submission", time: "1h ago" },
    { href: "/dev/earnings", label: "Payout ETA updated after client collection", time: "Yesterday" },
  ],
};

const footerLinks: Record<AuthUser["role"], Array<{ href: string; label: string; primary?: boolean }>> = {
  admin: [
    { href: "/admin/notifications", label: "All alerts" },
    { href: "/admin/briefs", label: "Review queue", primary: true },
  ],
  client: [
    { href: "/dashboard/messages", label: "Messages" },
    { href: "/dashboard/brief", label: "Brief", primary: true },
  ],
  developer: [
    { href: "/dev/messages", label: "Messages" },
    { href: "/dev/time", label: "Log time", primary: true },
  ],
};

export function NotificationMenu({ user }: { user: AuthUser }) {
  const popoverRef = useDetailsPopover();
  const seededItems = useMemo(
    () =>
      roleItems[user.role].map((item, index) => ({
        ...item,
        id: `${user.role}-${index}`,
        read: index > 1,
      })),
    [user.role],
  );
  const [items, setItems] = useState(seededItems);
  const unread = items.filter((item) => !item.read).length;

  const markAllRead = () => {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
  };

  return (
    <details ref={popoverRef} className="group relative">
      <summary
        className="relative grid h-10 w-10 cursor-pointer list-none place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors duration-300 hover:text-[var(--on-surface)]"
        aria-label="Notifications"
      >
        <span>
          <IconBell size={17} stroke={1.6} />
        </span>
        {unread > 0 && (
          <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full border border-[var(--surface)] bg-[var(--secondary)] px-1 font-mono text-[0.56rem] leading-none text-[var(--on-secondary)]">
            {unread}
          </span>
        )}
      </summary>
      <div className="absolute right-[-3.25rem] top-12 z-50 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-2 shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)] sm:right-0">
        <div className="flex items-start justify-between gap-3 px-3 py-3">
          <div>
            <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">Notifications</p>
            <p className="mt-1 text-[0.8rem] text-[var(--on-surface-dim)]">{unread} unread workspace signals.</p>
          </div>
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--glass-border)] px-3 text-[0.72rem] font-medium text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
          >
            <IconCheck size={13} stroke={1.7} />
            Clear
          </button>
        </div>
        <div className="grid gap-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="group/item grid grid-cols-[1rem_1fr_auto] gap-3 rounded-xl px-3 py-2.5 text-[0.84rem] text-[var(--on-surface-dim)] transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--on-surface)_6%,transparent)]"
            >
              <IconPointFilled
                size={14}
                className={!item.read ? "mt-0.5 text-[var(--secondary)]" : "mt-0.5 text-[var(--glass-border)]"}
              />
              <Link href={item.href} className="min-w-0" onClick={() => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry))}>
                <p className="leading-snug text-[var(--on-surface)]">{item.label}</p>
                <p className="mt-1 flex items-center gap-1 font-mono text-[0.68rem] text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
                  <IconClock size={12} stroke={1.6} />
                  {item.time}
                </p>
              </Link>
              <button
                type="button"
                aria-label={`Dismiss ${item.label}`}
                onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-[var(--on-surface-dim)] opacity-70 transition-opacity duration-300 hover:text-[var(--on-surface)] group-hover/item:opacity-100"
              >
                <IconTrash size={14} stroke={1.6} />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[var(--glass-border)] p-3">
          {footerLinks[user.role].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.primary
                  ? "inline-flex h-9 items-center justify-center rounded-full bg-[var(--on-surface)] text-[0.78rem] font-medium text-[var(--bg)]"
                  : "inline-flex h-9 items-center justify-center rounded-full border border-[var(--glass-border)] text-[0.78rem] font-medium text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </details>
  );
}
