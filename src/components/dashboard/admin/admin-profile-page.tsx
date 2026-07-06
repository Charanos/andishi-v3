"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  IconCalendar,
  IconCheck,
  IconDeviceLaptop,
  IconKey,
  IconLogout,
  IconMail,
  IconShieldCheck,
  IconUserCircle,
  IconCamera,
  IconLoader2,
  IconClock
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { EntityDrawer } from "@/components/dashboard/shared/entity-drawer";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import {
  OperationalDataTable,
  type OperationalTableColumn,
} from "@/components/dashboard/shared/operational-data-table";
import { useToast } from "@/components/dashboard/shared/toast-provider";
import { AdminPlatformNav } from "@/components/dashboard/admin/admin-platform-nav";
import type { PublicSession } from "@/lib/services/identity/sessions";
import type { AuthUser } from "@/types/auth";
import { roleNames } from "@/types/auth";

function parseUserAgent(ua: string | null): { browser: string; os: string } {
  if (!ua) return { browser: "Unknown browser", os: "Unknown device" };

  let browser = "Unknown browser";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\//.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua)) browser = "Safari";

  let os = "Unknown OS";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";

  return { browser, os };
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function timeAgo(value: string | Date) {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

export function AdminProfilePage({ user }: { user: AuthUser }) {
  const router = useRouter();
  const { notify } = useToast();

  // Identity form
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [isSaving, setIsSaving] = useState(false);

  // Security
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Sessions
  const [sessions, setSessions] = useState<PublicSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [inspectSession, setInspectSession] = useState<PublicSession | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<PublicSession | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isMassRevoking, setIsMassRevoking] = useState(false);

  const handleMassRevoke = async (selectedIds: string[], clearSelection: () => void) => {
    setIsMassRevoking(true);
    try {
      await Promise.all(
        selectedIds.map(async (id) => {
          const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error(`Failed to revoke ${id}`);
        })
      );
      setSessions((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
      notify(`Successfully signed out ${selectedIds.length} devices`, "success");
      clearSelection();
    } catch {
      notify("Some devices failed to sign out.", "error");
    } finally {
      setIsMassRevoking(false);
    }
  };

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await fetch("/api/sessions");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions ?? []);
          setCurrentSessionId(data.currentSessionId ?? null);
        } else {
          notify("Failed to load active sessions", "error");
        }
      } catch {
        notify("Failed to load active sessions", "error");
      } finally {
        setSessionsLoading(false);
      }
    };
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const dirty = name.trim() !== user.name || (avatarUrl.trim() || null) !== (user.avatarUrl ?? null);

  const [accountAgeDays] = useState(() =>
    Math.max(0, Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86_400_000)),
  );

  const handleSave = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (!dirty) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), avatarUrl: avatarUrl.trim() || null }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Save failed");
      }

      notify("Profile updated", "success");
      router.refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUploadSuccess = async (url: string) => {
    setAvatarUrl(url);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: url.trim() }),
      });

      if (!res.ok) throw new Error("Failed to save avatar URL to profile");
      notify("Profile picture updated", "success");
      router.refresh();
    } catch {
      notify("Avatar uploaded but failed to save to profile.", "error");
    }
  };

  const handleSendResetLink = async () => {
    setIsSendingReset(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      notify(`Password reset link sent to ${user.email}`, "success");
    } catch {
      notify("Failed to send reset link", "error");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setIsRevoking(true);
    try {
      const res = await fetch(`/api/sessions/${revokeTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Failed to revoke session");
      }
      setSessions((prev) => prev.filter((s) => s.id !== revokeTarget.id));
      notify("Device signed out", "success");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Failed to revoke session", "error");
    } finally {
      setIsRevoking(false);
      setRevokeTarget(null);
      setInspectSession(null);
    }
  };

  const sessionColumns: OperationalTableColumn<PublicSession>[] = [
    {
      key: "device",
      label: "Device",
      priority: true,
      render: (s) => {
        const { browser, os } = parseUserAgent(s.userAgent);
        return (
          <div className="flex items-center gap-2 min-w-0">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)]">
              <IconDeviceLaptop size={15} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[0.86rem] font-medium text-[var(--on-surface)]">
                {browser} on {os}
              </p>
              <p className="truncate text-[0.72rem] text-[var(--on-surface-dim)]">
                {s.ipAddress ?? "Unknown IP"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (s) =>
        s.id === currentSessionId ? (
          <StatusBadge label="This device" tone="active" />
        ) : (
          <StatusBadge label="Other device" tone="neutral" />
        ),
    },
    {
      key: "createdAt",
      label: "Signed in",
      mono: true,
      hideOnMobile: true,
      render: (s) => timeAgo(s.createdAt),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (s) =>
        s.id === currentSessionId ? null : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setRevokeTarget(s);
            }}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-2.5 text-[0.72rem] font-medium text-red-400 transition-all duration-200 hover:scale-105 hover:bg-red-500/20"
          >
            <IconLogout size={13} />
            Sign out
          </button>
        ),
    },
  ];

  return (
    <div className="grid min-w-0 gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <DashboardPageHeader
        className="mb-0"
        title="Super Admin Profile"
        description="Manage your platform identity, security settings, and active session footprint."
        status={<StatusBadge label={roleNames[user.role]} tone="active" />}
      />

      <AdminPlatformNav />

      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] items-start">
        {/* Left Column: Profile Card & Security Overview */}
        <div className="grid gap-6">
          <aside className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] overflow-hidden shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] relative">
            <div className="h-24 bg-[var(--primary)] border-b border-[var(--glass-border)]"></div>
            <div className="px-6 pb-6 relative">
              <div className="flex justify-center -mt-12 mb-4">
                <AvatarUpload 
                  initials={initials} 
                  avatarUrl={avatarUrl} 
                  onUploadSuccess={handleAvatarUploadSuccess} 
                  notify={notify}
                />
              </div>
              <div className="text-center">
                <h2 className="text-[1.2rem] font-medium text-[var(--on-surface)] title-serif">{name}</h2>
                <p className="text-[0.85rem] text-[var(--on-surface-dim)] mt-1">{user.email}</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1">
                   <IconShieldCheck size={14} className="text-[var(--primary)]" />
                   <span className="text-[0.75rem] font-medium text-[var(--on-surface)]">Full Platform Control</span>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[var(--glass-border)] pt-6">
                 <div className="text-center">
                    <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">Account Age</p>
                    <p className="mt-1.5 font-mono text-[1.1rem] text-[var(--on-surface)]">{accountAgeDays}d</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">Sessions</p>
                    <p className="mt-1.5 font-mono text-[1.1rem] text-[var(--on-surface)]">{sessions.length}</p>
                 </div>
              </div>
            </div>
          </aside>

          {/* Security sidebar */}
          <aside className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-6 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]">
            <div className="flex items-center gap-2 mb-5">
              <IconShieldCheck size={18} className="text-[var(--primary)]" />
              <h2 className="text-[1.02rem] font-medium text-[var(--on-surface)]">Security Action</h2>
            </div>

            <div className="grid gap-3">
              <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
                <p className="text-[0.86rem] font-medium text-[var(--on-surface)]">Password Reset</p>
                <p className="mt-1 text-[0.78rem] leading-relaxed text-[var(--on-surface-dim)]">
                  Send yourself a secure link to change your password.
                </p>
                <button
                  type="button"
                  onClick={handleSendResetLink}
                  disabled={isSendingReset}
                  className="mt-3 inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.8rem] font-medium text-[var(--on-surface)] transition-colors hover:bg-[color-mix(in_srgb,var(--on-surface)_6%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSendingReset ? (
                    <IconLoader2 size={14} className="animate-spin" />
                  ) : (
                    <IconKey size={14} stroke={1.8} />
                  )}
                  {isSendingReset ? "Sending…" : "Send reset link"}
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Right Column: Identity Form & Sessions Table */}
        <div className="grid gap-6">
          <form
            onSubmit={handleSave}
            className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-6 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]"
          >
            <div className="flex items-center gap-2 mb-6">
              <IconUserCircle size={18} className="text-[var(--primary)]" />
              <h2 className="text-[1.02rem] font-medium text-[var(--on-surface)]">Identity Details</h2>
            </div>

            <div className="grid gap-5 max-w-xl">
              <label className="grid gap-2">
                <span className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">
                  Full name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  className="h-11 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.9rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)] transition-colors"
                />
              </label>

              <div className="grid gap-2">
                <span className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">
                  Email address
                </span>
                <div className="flex h-11 items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--glass-bg)_60%,transparent)] px-3 text-[0.9rem] text-[var(--on-surface-dim)]">
                  <IconMail size={15} />
                  {user.email}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-[var(--glass-border)] pt-5">
              <button
                type="submit"
                disabled={!dirty || isSaving}
                className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-5 text-[0.86rem] font-medium text-[var(--bg)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <IconLoader2 size={15} className="animate-spin" />
                ) : (
                  <IconCheck size={15} stroke={1.8} />
                )}
                {isSaving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>

          {/* Active sessions */}
          <OperationalDataTable
            columns={sessionColumns}
            rows={sessions}
            title="Active sessions"
            description="Devices currently signed in to your account. Sign out anything you don't recognize."
            empty={sessionsLoading ? "Loading sessions…" : "No active sessions."}
            onRowSelect={setInspectSession}
            selectable={true}
            pageSize={5}
            bulkActions={(selectedIds, clearSelection) => (
              <button
                type="button"
                onClick={() => handleMassRevoke(selectedIds, clearSelection)}
                disabled={isMassRevoking}
                className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 text-[0.8rem] font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
              >
                {isMassRevoking ? <IconLoader2 size={14} className="animate-spin" /> : <IconLogout size={14} stroke={1.8} />}
                Sign out {selectedIds.length} device{selectedIds.length > 1 ? "s" : ""}
              </button>
            )}
          />
        </div>
      </div>

      <EntityDrawer
        open={Boolean(inspectSession)}
        onClose={() => setInspectSession(null)}
        title="Session Detail"
      >
        {inspectSession && (
          <div className="grid gap-6">
            <section className="relative overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-6 text-center shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--secondary)]/10 to-transparent pointer-events-none" />
              {(() => {
                const { browser, os } = parseUserAgent(inspectSession.userAgent);
                const isCurrent = inspectSession.id === currentSessionId;
                return (
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-sm">
                      <IconDeviceLaptop size={32} stroke={1.2} className="text-[var(--on-surface)]" />
                    </div>
                    <StatusBadge
                      label={isCurrent ? "Current Session" : "Other Device"}
                      tone={isCurrent ? "active" : "neutral"}
                    />
                    <h2 className="title-serif mt-4 text-[1.4rem] font-medium text-[var(--on-surface)]">
                      {browser} on {os}
                    </h2>
                    <div className="mt-3 flex items-center justify-center gap-2 text-[0.85rem] text-[var(--on-surface-dim)]">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      {inspectSession.ipAddress ?? "Unknown IP"}
                    </div>
                  </div>
                );
              })()}
            </section>
            
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 shadow-sm">
                <div className="mb-1 flex items-center gap-2 text-[var(--on-surface-dim)]">
                  <IconCalendar size={14} stroke={1.8} />
                  <p className="text-[0.68rem] uppercase tracking-[0.12em]">Signed In</p>
                </div>
                <p className="font-mono text-[0.9rem] text-[var(--on-surface)]">
                  {formatDate(inspectSession.createdAt)}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 shadow-sm">
                <div className="mb-1 flex items-center gap-2 text-[var(--on-surface-dim)]">
                  <IconClock size={14} stroke={1.8} />
                  <p className="text-[0.68rem] uppercase tracking-[0.12em]">Expires</p>
                </div>
                <p className="font-mono text-[0.9rem] text-[var(--on-surface)]">
                  {formatDate(inspectSession.expiresAt)}
                </p>
              </div>
            </section>

            {inspectSession.id !== currentSessionId && (
              <div className="mt-4 border-t border-[var(--glass-border)] pt-6">
                <button
                  type="button"
                  onClick={() => setRevokeTarget(inspectSession)}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 text-[0.9rem] font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:scale-[1.02]"
                >
                  <IconLogout size={16} stroke={1.8} />
                  Revoke Device Access
                </button>
                <p className="mt-3 text-center text-[0.75rem] text-[var(--on-surface-dim)] leading-relaxed">
                  This action will immediately terminate the session. The user will be logged out on this device.
                </p>
              </div>
            )}
          </div>
        )}
      </EntityDrawer>

      <ConfirmDialog
        open={Boolean(revokeTarget)}
        title="Sign out this device?"
        description="This immediately ends that session. The device will need to sign in again to regain access."
        confirmLabel={isRevoking ? "Signing out…" : "Sign out device"}
        onCancel={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
      />
    </div>
  );
}

// ----------------------------------------------------------------------
// Avatar Upload Component
// ----------------------------------------------------------------------
function AvatarUpload({
  initials,
  avatarUrl,
  onUploadSuccess,
  notify,
}: {
  initials: string;
  avatarUrl: string;
  onUploadSuccess: (url: string) => void;
  notify: (msg: string, type: "success" | "error") => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = previewUrl || avatarUrl;

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      notify("Only image files are allowed", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify("Image must be smaller than 5MB", "error");
      return;
    }

    setIsUploading(true);
    setPreviewUrl(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (data.url) {
         onUploadSuccess(data.url);
      }
    } catch {
      notify("Failed to update profile", "error");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[3px] border-[var(--surface)] bg-[var(--surface)] shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        accept="image/*"
        className="hidden"
      />

      <div className="h-full w-full overflow-hidden rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] relative">
        {displayUrl && !hasError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={displayUrl}
            alt="Profile Avatar"
            className="h-full w-full object-cover transition-transform duration-500 ease-out"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--on-surface)] text-[1.4rem] font-medium font-mono text-[var(--bg)]">
            {initials}
          </div>
        )}
      </div>

      <AnimatePresence>
        {(isHovered || isDragging || isUploading) && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center rounded-full transition-colors duration-300 ${
              isDragging ? "bg-[var(--primary)]/80" : "bg-black/60 backdrop-blur-[2px]"
            }`}
          >
            {isUploading ? (
              <IconLoader2 size={24} className="text-white animate-spin" />
            ) : (
              <IconCamera size={24} stroke={1.5} className="text-white mb-1" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
