"use client";

import { useEffect, useState } from "react";
import { IconBell, IconBellRinging, IconCheck, IconChecks } from "@tabler/icons-react";
import type { Notification } from "@/db/schema/support";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { useToast } from "@/components/dashboard/shared/toast-provider";
import { cn } from "@/lib/utils";

export function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications ?? []);
        } else {
          notify("Failed to load notifications", "error");
        }
      } catch {
        notify("Failed to load notifications", "error");
      } finally {
        setIsLoading(false);
      }
    };
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = notifications.filter((n) => !n.readAt).length;
  const visible = filter === "unread" ? notifications.filter((n) => !n.readAt) : notifications;

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setNotifications((prev) => prev.map((n) => (n.id === id ? data.notification : n)));
    } catch {
      notify("Failed to mark as read", "error");
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      setNotifications((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date() })));
      notify("All notifications marked as read", "success");
    } catch {
      notify("Failed to mark all as read", "error");
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="grid min-w-0 gap-8 py-10 md:gap-9 lg:py-12 max-w-3xl">
      <DashboardPageHeader
        className="mb-0"
        title="Notifications"
        description="Alerts and updates addressed to your account."
        status={
          unreadCount > 0 ? (
            <StatusBadge label={`${unreadCount} unread`} tone="pending" />
          ) : (
            <StatusBadge label="All caught up" tone="active" />
          )
        }
        actions={
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || isMarkingAll}
            className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] transition-colors hover:bg-[var(--glass-bg)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconChecks size={16} stroke={1.8} />
            Mark all read
          </button>
        }
      />

      <div className="flex gap-1.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-1 w-fit">
        {(["all", "unread"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={cn(
              "cursor-pointer rounded-lg px-4 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider transition-all",
              filter === tab
                ? "bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] text-[var(--on-surface)]"
                : "text-[var(--on-surface-dim)] opacity-60 hover:opacity-100",
            )}
          >
            {tab === "all" ? "All" : "Unread"}
          </button>
        ))}
      </div>

      <div className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <IconBell size={28} className="text-[var(--on-surface-dim)] opacity-50" />
            <p className="text-[0.9rem] text-[var(--on-surface-dim)]">
              {filter === "unread" ? "No unread notifications." : "No notifications yet."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--glass-border)]">
            {visible.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "flex items-start gap-3 p-4 sm:p-5",
                  !n.readAt && "bg-[color-mix(in_srgb,var(--primary)_4%,transparent)]",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border",
                    n.readAt
                      ? "border-[var(--glass-border)] text-[var(--on-surface-dim)]"
                      : "border-[color-mix(in_srgb,var(--primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]",
                  )}
                >
                  {n.readAt ? <IconBell size={15} /> : <IconBellRinging size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.9rem] font-medium text-[var(--on-surface)]">{n.title}</p>
                  {n.body && (
                    <p className="mt-1 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">
                      {n.body}
                    </p>
                  )}
                  <p className="mt-1.5 text-[0.68rem] uppercase tracking-wider text-[var(--on-surface-dim)] opacity-60">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.readAt && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(n.id)}
                    className="shrink-0 cursor-pointer rounded-full border border-[var(--glass-border)] p-2 text-[var(--on-surface-dim)] transition-all duration-200 hover:scale-105 hover:text-[var(--on-surface)]"
                    title="Mark as read"
                  >
                    <IconCheck size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
