"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconEdit,
  IconFilter,
  IconKey,
  IconLock,
  IconMail,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconUserCheck,
  IconUsers,
  IconX,
  type Icon,
} from "@tabler/icons-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import {
  DashboardBarChart,
  DashboardDonutChart,
  DashboardLineChart,
} from "@/components/dashboard/shared/dashboard-chart";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { EntityDrawer } from "@/components/dashboard/shared/entity-drawer";
import { KpiCard } from "@/components/dashboard/shared/kpi-card";
import { ModalShell } from "@/components/dashboard/shared/modal-shell";
import {
  OperationalDataTable,
  type OperationalTableColumn,
} from "@/components/dashboard/shared/operational-data-table";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { useToast } from "@/components/dashboard/shared/toast-provider";
import { AdminPlatformNav } from "@/components/dashboard/admin/admin-platform-nav";
import { SectionDivider } from "@/components/ui/section-divider";
import type { AdminAuthIntakeRecord } from "@/lib/dashboard/admin-auth-intake";
import { cn } from "@/lib/utils";

type UserRecord = AdminAuthIntakeRecord;
type UserRole = UserRecord["role"];
type UserStatus = UserRecord["status"];
/** Derived purely from real fields (status/verification) - never stored. */
type UserFlag = "low" | "review" | "locked";

type RoleFilter = UserRole | "all";
type StatusFilter = UserStatus | "all";
type SortKey = "recent" | "flag" | "role" | "status";

const roleLabel: Record<UserRole, string> = {
  admin: "Admin",
  client: "Client",
  developer: "Developer",
};

const statusMeta: Record<UserStatus, { label: string; tone: "active" | "neutral" | "overdue" | "pending" }> = {
  active: { label: "Active", tone: "active" },
  disabled: { label: "Disabled", tone: "overdue" },
  invited: { label: "Invited", tone: "pending" },
};

const flagMeta: Record<UserFlag, { label: string; tone: "active" | "overdue" | "pending" }> = {
  locked: { label: "Disabled", tone: "overdue" },
  low: { label: "Low risk", tone: "active" },
  review: { label: "Unverified", tone: "pending" },
};

async function readError(res: Response, fallback: string) {
  try {
    const body = await res.json();
    return typeof body?.error === "string" ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export function AdminUsersPage({ authIntake }: { authIntake: AdminAuthIntakeRecord[] }) {
  const [users, setUsers] = useState<UserRecord[]>(authIntake);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(authIntake[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [drawerUser, setDrawerUser] = useState<UserRecord | null>(null);
  const [confirmUser, setConfirmUser] = useState<UserRecord | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { notify } = useToast();

  const selected = users.find((user) => user.id === selectedId) ?? users[0] ?? null;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users ?? []);
        }
      } catch {
        // Keep the server-rendered authIntake seed if the client refresh fails.
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  useGSAP(() => {
    gsap.fromTo(
      ".gsap-user-kpi",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" }
    );
    gsap.fromTo(
      ".gsap-user-card",
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.1 }
    );
  }, [users]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users
      .filter((user) => {
        const haystack = `${user.name} ${user.email} ${user.role} ${user.status} ${user.owner ?? ""}`.toLowerCase();
        return (
          (!needle || haystack.includes(needle)) &&
          (roleFilter === "all" || user.role === roleFilter) &&
          (statusFilter === "all" || user.status === statusFilter)
        );
      })
      .sort((a, b) => {
        if (sortKey === "flag") return flagPriority(deriveUserFlag(b)) - flagPriority(deriveUserFlag(a));
        if (sortKey === "role") return a.role.localeCompare(b.role);
        if (sortKey === "status") return a.status.localeCompare(b.status);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [query, roleFilter, sortKey, statusFilter, users]);

  const stats = useMemo(() => buildUserStats(users), [users]);

  const columns = useMemo<Array<OperationalTableColumn<UserRecord>>>(
    () => [
      {
        key: "name",
        label: "User",
        priority: true,
        render: (user) => (
          <div className="min-w-0">
            <p className="truncate text-[0.88rem] font-medium text-[var(--on-surface)]">{user.name}</p>
            <p className="mt-1 truncate text-[0.74rem] text-[var(--on-surface-dim)]">{user.email}</p>
          </div>
        ),
      },
      { key: "role", label: "Role", render: (user) => roleLabel[user.role] },
      { key: "status", label: "Status", render: (user) => <StatusBadge label={statusMeta[user.status].label} tone={statusMeta[user.status].tone} /> },
      { key: "emailVerified", label: "Email", hideOnMobile: true, render: (user) => user.emailVerified ? "Verified" : "Unverified" },
      { key: "flag", label: "Flag", hideOnMobile: true, render: (user) => { const flag = deriveUserFlag(user); return <StatusBadge label={flagMeta[flag].label} tone={flagMeta[flag].tone} />; } },
      { key: "owner", label: "Owner", hideOnMobile: true, render: (user) => user.owner || "Unassigned" },
    ],
    [],
  );

  const runMutation = async (id: string, task: () => Promise<void>) => {
    setPendingId(id);
    try {
      await task();
    } finally {
      setPendingId(null);
    }
  };

  const createInvite = (payload: { email: string; name: string; role: UserRole }) =>
    runMutation("invite", async () => {
      try {
        const res = await fetch("/api/users/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await readError(res, "Failed to invite user."));
        const { user } = await res.json();
        setUsers((current) => [user, ...current]);
        setSelectedId(user.id);
        setInviteOpen(false);
        notify(`Invite sent to ${user.email}`, "success");
      } catch (error) {
        notify(error instanceof Error ? error.message : "Failed to invite user.", "error");
      }
    });

  const saveAccess = (
    user: UserRecord,
    patch: Partial<Pick<UserRecord, "accessNotes" | "engineerId" | "organizationId" | "owner" | "role" | "status">>,
    successMessage: string,
  ) =>
    runMutation(user.id, async () => {
      try {
        const res = await fetch(`/api/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error(await readError(res, "Failed to update user."));
        const { user: updated } = await res.json();
        setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        setDrawerUser((current) => (current?.id === updated.id ? updated : current));
        setEditUser(null);
        setConfirmUser(null);
        notify(successMessage, "success");
      } catch (error) {
        notify(error instanceof Error ? error.message : "Failed to update user.", "error");
      }
    });

  const resendInvite = (user: UserRecord) =>
    runMutation(user.id, async () => {
      try {
        const res = await fetch("/api/users/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, name: user.name, role: user.role }),
        });
        if (!res.ok) throw new Error(await readError(res, "Failed to resend invite."));
        notify(`Invite re-sent to ${user.email}`, "success");
      } catch (error) {
        notify(error instanceof Error ? error.message : "Failed to resend invite.", "error");
      }
    });

  const restoreUser = (user: UserRecord) => saveAccess(user, { status: "active" }, "Access restored");
  const disableUser = () => confirmUser && saveAccess(confirmUser, { status: "disabled" }, "Access disabled");

  return (
    <div ref={containerRef} className="relative grid min-w-0 gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--primary)_6%,transparent),transparent_60%)] pointer-events-none" />
      <div className="relative z-10 grid gap-9 md:gap-10 lg:gap-12">
        <DashboardPageHeader
          className="mb-0"
        title="User management"
        description="Invite, edit, disable, and govern admin, client, and developer accounts without mixing access operations into platform settings."
        status={<StatusBadge label={loading ? "Syncing..." : `${stats.review} access reviews`} tone={loading ? "neutral" : stats.review ? "pending" : "active"} />}
        actions={
          <>
            <button type="button" onClick={() => setStatusFilter("invited")} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]">
              <IconMail size={16} stroke={1.7} />
              Pending invites
              <span className="font-mono text-[0.76rem] text-[var(--primary)]">{stats.invited}</span>
            </button>
            <button type="button" onClick={() => setInviteOpen(true)} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)] shadow-[0_14px_30px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)]">
              <IconPlus size={16} stroke={1.8} />
              Invite user
            </button>
          </>
        }
      />

        <AdminPlatformNav />

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="gsap-user-kpi"><KpiCard chart="bar" data={[8, 10, 12, 14, users.length]} icon={IconUsers} label="Total users" trend={`${stats.active} active`} value={String(users.length)} /></div>
          <div className="gsap-user-kpi"><KpiCard data={[52, 64, 72, 82, stats.verifiedRate]} icon={IconUserCheck} label="Verified email" trend={`${stats.unverified} unverified`} value={`${stats.verifiedRate}%`} /></div>
          <div className="gsap-user-kpi"><KpiCard chart="bar" data={[1, 2, 3, 3, stats.admins]} icon={IconKey} label="Admins" trend="Privileged accounts" value={String(stats.admins)} /></div>
          <div className="gsap-user-kpi"><KpiCard data={[88, 84, 81, 79, stats.review]} icon={IconAlertTriangle} label="Access review" trend={`${stats.disabled} disabled`} value={String(stats.review)} /></div>
        </section>

        <SectionDivider />

      <section className="grid min-w-0 gap-7 2xl:grid-cols-[minmax(0,1fr)_minmax(23rem,27rem)]">
        <UserAccessMap users={users} />
        <UserCommandPanel
          busy={selected?.id === pendingId}
          onDisable={selected ? () => setConfirmUser(selected) : undefined}
          onEdit={selected ? () => setEditUser(selected) : undefined}
          onInspect={selected ? () => setDrawerUser(selected) : undefined}
          onResend={selected && selected.status === "invited" ? () => resendInvite(selected) : undefined}
          onRestore={selected && selected.status === "disabled" ? () => restoreUser(selected) : undefined}
          user={selected}
        />
      </section>

      <SectionDivider />

      <section className="grid gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <SectionHeader eyebrow="Access registry" title="Accounts and role assignments" description="Search, filter, edit, disable, and inspect users across admin, client, and developer workspaces." />
          <UserToolbar query={query} roleFilter={roleFilter} setQuery={setQuery} setRoleFilter={setRoleFilter} setSortKey={setSortKey} setStatusFilter={setStatusFilter} sortKey={sortKey} statusFilter={statusFilter} />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((user) => (
            <UserCard
              key={user.id}
              busy={user.id === pendingId}
              onDisable={() => setConfirmUser(user)}
              onEdit={() => setEditUser(user)}
              onInspect={() => setDrawerUser(user)}
              onResend={user.status === "invited" ? () => resendInvite(user) : undefined}
              onRestore={user.status === "disabled" ? () => restoreUser(user) : undefined}
              onSelect={() => setSelectedId(user.id)}
              selected={selected?.id === user.id}
              user={user}
            />
          ))}
          {!filtered.length && <EmptyState title="No users match" body="Clear filters or invite a user into the access registry." />}
        </div>
      </section>

      <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <ChartPanel title="Access health" description="Verified, active, and review-state movement across recent auth intake." value={`${stats.verifiedRate}%`}>
          <DashboardLineChart data={[62, 67, 73, 78, 84, stats.verifiedRate]} height={300} labels={["Jan", "Feb", "Mar", "Apr", "May", "Now"]} variant="area" />
        </ChartPanel>
        <ChartPanel title="Role mix" description="User distribution by workspace role." value={`${users.length} users`}>
          <DashboardDonutChart data={(["admin", "client", "developer"] as UserRole[]).map((role) => ({ label: roleLabel[role], value: users.filter((user) => user.role === role).length, tone: role === "admin" ? "primary" as const : role === "client" ? "secondary" as const : "success" as const }))} height={210} />
        </ChartPanel>
      </section>

        <OperationalDataTable columns={columns} description="User governance matrix for role, account state, verification, access flag, and owner." empty="No users match the active filters." onRowSelect={(user) => { setSelectedId(user.id); setDrawerUser(user); }} rows={filtered} title="User access matrix" />

        <InviteUserModal onClose={() => setInviteOpen(false)} onSubmit={createInvite} open={inviteOpen} />
        <EditUserModal onClose={() => setEditUser(null)} onSubmit={(user, patch) => saveAccess(user, patch, "User updated")} user={editUser} />

        <EntityDrawer onClose={() => setDrawerUser(null)} open={Boolean(drawerUser)} title={drawerUser?.name ?? "User details"}>
          {drawerUser && (
            <UserDrawer
              user={drawerUser}
              onDisable={() => setConfirmUser(drawerUser)}
              onEdit={() => setEditUser(drawerUser)}
              onResend={drawerUser.status === "invited" ? () => resendInvite(drawerUser) : undefined}
              onRestore={drawerUser.status === "disabled" ? () => restoreUser(drawerUser) : undefined}
            />
          )}
        </EntityDrawer>

        <ConfirmDialog confirmLabel="Disable access" description={`${confirmUser?.email ?? "This user"} will lose the ability to sign in until access is restored. The account record itself is kept.`} onCancel={() => setConfirmUser(null)} onConfirm={disableUser} open={Boolean(confirmUser)} title="Disable user access?" />
      </div>
    </div>
  );
}

function UserAccessMap({ users }: { users: UserRecord[] }) {
  const statusCounts = (["active", "invited", "disabled"] as UserStatus[]).map((status) => users.filter((user) => user.status === status).length);
  return (
    <div className="min-w-0">
      <SectionHeader eyebrow="Identity governance" title="Access safety map" description="User management owns identity lifecycle, role scope, verification, and account state before those users touch client, developer, or admin workspaces." />
      <div className="mt-6 grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-h-[27rem] rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] sm:p-5">
          <DashboardBarChart data={statusCounts} height={330} labels={["Active", "Invited", "Disabled"]} />
        </div>
        <div className="grid gap-3 md:grid-cols-3 2xl:grid-cols-1">
          <ContextTile icon={IconLock} label="Admin" value="Full platform access; review often." />
          <ContextTile icon={IconShieldCheck} label="Client" value="Organization-scoped hiring and billing." />
          <ContextTile icon={IconUserCheck} label="Developer" value="Engineer-scoped profile, work, and payout." />
        </div>
      </div>
    </div>
  );
}

function UserToolbar({ query, roleFilter, setQuery, setRoleFilter, setSortKey, setStatusFilter, sortKey, statusFilter }: { query: string; roleFilter: RoleFilter; setQuery: (value: string) => void; setRoleFilter: (value: RoleFilter) => void; setSortKey: (value: SortKey) => void; setStatusFilter: (value: StatusFilter) => void; sortKey: SortKey; statusFilter: StatusFilter }) {
  return (
    <div className="grid w-full gap-3 xl:w-auto xl:min-w-[44rem]">
      <label className="relative min-w-0"><span className="sr-only">Search users</span><IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]" size={16} stroke={1.7} /><input className="h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-10 pr-4 text-[0.9rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]" onChange={(event) => setQuery(event.target.value)} placeholder="Search users, emails, roles, owners..." value={query} /></label>
      <div className="grid gap-2 sm:grid-cols-3">
        <SelectPill icon={IconFilter} label="Role" value={roleFilter} onChange={(value) => setRoleFilter(value as RoleFilter)}><option value="all">All roles</option>{(["admin", "client", "developer"] as UserRole[]).map((role) => <option key={role} value={role}>{roleLabel[role]}</option>)}</SelectPill>
        <SelectPill icon={IconShieldCheck} label="Status" value={statusFilter} onChange={(value) => setStatusFilter(value as StatusFilter)}><option value="all">All statuses</option>{(["active", "invited", "disabled"] as UserStatus[]).map((status) => <option key={status} value={status}>{statusMeta[status].label}</option>)}</SelectPill>
        <SelectPill icon={IconRefresh} label="Sort" value={sortKey} onChange={(value) => setSortKey(value as SortKey)}><option value="recent">Recent</option><option value="flag">Flag</option><option value="role">Role</option><option value="status">Status</option></SelectPill>
      </div>
    </div>
  );
}

function UserCard({ busy, onDisable, onEdit, onInspect, onResend, onRestore, onSelect, selected, user }: { busy: boolean; onDisable: () => void; onEdit: () => void; onInspect: () => void; onResend?: () => void; onRestore?: () => void; onSelect: () => void; selected: boolean; user: UserRecord }) {
  const flag = deriveUserFlag(user);
  return (
    <article className={cn("gsap-user-card min-w-0 overflow-hidden rounded-[1.35rem] border transition-all duration-200", selected ? "border-[color-mix(in_srgb,var(--primary)_38%,var(--glass-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_7%,var(--surface)),var(--surface))] shadow-[0_18px_50px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]" : user.status === "disabled" ? "border-[color-mix(in_srgb,var(--error)_34%,var(--glass-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--error)_6%,var(--surface)),var(--surface))]" : "border-[var(--glass-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-high)_24%,var(--surface)),var(--surface))] hover:border-[color-mix(in_srgb,var(--primary)_20%,transparent)] hover:shadow-[0_10px_30px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)]", busy && "opacity-60")}>
      <button className="block w-full cursor-pointer p-5 text-left sm:p-6" onClick={onSelect} type="button">
        <div className="flex flex-wrap items-center gap-2"><h3 className="break-words text-[1rem] font-medium text-[var(--on-surface)]">{user.name}</h3><StatusBadge label={statusMeta[user.status].label} tone={statusMeta[user.status].tone} /></div>
        <p className="mt-2 truncate text-[0.86rem] text-[var(--on-surface-dim)]">{user.email}</p>
        <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]"><SignalCell label="Role" value={roleLabel[user.role]} /><SignalCell label="Email" value={user.emailVerified ? "verified" : "unverified"} /></div>
        <p className="mt-5 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">{buildVisibleScope(user)}</p>
      </button>
      <div className="flex flex-col gap-3 border-t border-[var(--glass-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <StatusBadge label={flagMeta[flag].label} tone={flagMeta[flag].tone} />
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          {onResend && <IconButton label="Resend invite" onClick={onResend}><IconMail size={16} stroke={1.8} /></IconButton>}
          <IconButton label="Edit" onClick={onEdit}><IconEdit size={16} stroke={1.8} /></IconButton>
          <IconButton label="Inspect" onClick={onInspect}><IconArrowRight size={16} stroke={1.8} /></IconButton>
          {onRestore ? <IconButton label="Restore access" onClick={onRestore}><IconCheck size={16} stroke={1.8} /></IconButton> : <IconButton danger label="Disable access" onClick={onDisable}><IconLock size={16} stroke={1.8} /></IconButton>}
        </div>
      </div>
    </article>
  );
}

function UserCommandPanel({ busy, onDisable, onEdit, onInspect, onResend, onRestore, user }: { busy?: boolean; onDisable?: () => void; onEdit?: () => void; onInspect?: () => void; onResend?: () => void; onRestore?: () => void; user: UserRecord | null }) {
  if (!user) return <EmptyState title="Select a user" body="Pick an account to inspect access state." />;
  const flag = deriveUserFlag(user);
  return <aside className={cn("2xl:sticky 2xl:top-28 2xl:self-start", busy && "opacity-60")}><div className="relative overflow-hidden rounded-[1.35rem] border border-[color-mix(in_srgb,var(--primary)_20%,var(--glass-border))] bg-[var(--surface)] p-5 shadow-[0_24px_60px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] sm:p-6"><div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--primary)_8%,transparent),transparent_60%)] pointer-events-none" /><div className="relative z-10"><StatusBadge label={statusMeta[user.status].label} tone={statusMeta[user.status].tone} /><h2 className="title-serif mt-3 text-[1.15rem] font-medium text-[var(--on-surface)]">{user.name}</h2><p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{user.email}</p><div className="mt-5 grid grid-cols-2 gap-2.5"><InfoTile label="Role" value={roleLabel[user.role]} /><InfoTile label="Owner" value={user.owner || "Unassigned"} /><InfoTile label="Flag" value={flagMeta[flag].label} /><InfoTile label="Last login" value={formatDate(user.lastLoginAt)} /></div><div className="mt-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4"><p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Access scope</p><p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">{buildVisibleScope(user)}</p></div><div className="mt-5 grid grid-cols-2 gap-2">{onResend && <ActionButton icon={IconMail} label="Resend invite" onClick={onResend} />}<ActionButton icon={IconEdit} label="Edit" onClick={onEdit} /><ActionButton icon={IconArrowRight} label="Inspect" onClick={onInspect} />{onRestore ? <ActionButton icon={IconCheck} label="Restore" onClick={onRestore} /> : <ActionButton danger icon={IconLock} label="Disable" onClick={onDisable} />}</div></div></div></aside>;
}

function UserDrawer({ onDisable, onEdit, onResend, onRestore, user }: { onDisable: () => void; onEdit: () => void; onResend?: () => void; onRestore?: () => void; user: UserRecord }) {
  const flag = deriveUserFlag(user);
  const activity = buildActivitySnapshot(user);
  return <div className="grid gap-6 min-h-[calc(100vh-10rem)]"><div className="grid gap-6"><section className="gsap-drawer-item"><StatusBadge label={statusMeta[user.status].label} tone={statusMeta[user.status].tone} /><h3 className="mt-3 text-[1.4rem] font-medium text-[var(--on-surface)]">{user.name}</h3><p className="mt-2 text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">{user.email} / {roleLabel[user.role]}</p></section><section className="gsap-drawer-item grid gap-4 md:grid-cols-2 xl:grid-cols-4"><InfoTile label="Owner" value={user.owner || "Unassigned"} /><InfoTile label="Flag" value={flagMeta[flag].label} /><InfoTile label="Created" value={formatDate(user.createdAt)} /><InfoTile label="Last login" value={formatDate(user.lastLoginAt)} /></section><section className="gsap-drawer-item grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]"><div className="rounded-[1.4rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6"><p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Access notes</p><p className="mt-3 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">{user.accessNotes || "No notes recorded yet."}</p><p className="mt-5 text-[0.82rem] leading-relaxed text-[var(--primary)]">{buildVisibleScope(user)}</p></div><ActivityPanel activity={activity} /></section></div><div className="gsap-drawer-item mt-auto sticky bottom-[-1.25rem] sm:bottom-[-2rem] -mx-5 sm:-mx-8 px-5 sm:px-8 pb-5 sm:pb-8 pt-5 bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] backdrop-blur-2xl flex flex-col-reverse gap-3 border-t border-[color-mix(in_srgb,var(--glass-border)_50%,transparent)] sm:flex-row sm:justify-end z-20">{onRestore ? <ActionButton icon={IconCheck} label="Restore access" onClick={onRestore} /> : <ActionButton danger icon={IconLock} label="Disable access" onClick={onDisable} />}{onResend && <ActionButton icon={IconMail} label="Resend invite" onClick={onResend} />}<ActionButton icon={IconEdit} label="Edit" onClick={onEdit} /></div></div>;
}

function InviteUserModal({ onClose, onSubmit, open }: { onClose: () => void; onSubmit: (payload: { email: string; name: string; role: UserRole }) => void; open: boolean }) {
  if (!open) return null;
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); onSubmit({ email: String(form.get("email") || ""), name: String(form.get("name") || ""), role: String(form.get("role") || "client") as UserRole }); };
  return (
    <ModalShell labelledBy="invite-user-title" onClose={onClose}>
      <form className="gsap-modal-content max-h-[85vh] overflow-y-auto scrollbar-hide w-full max-w-3xl rounded-[2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-6 sm:p-8 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_60%,transparent)] relative" onSubmit={submit}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--primary)_8%,transparent),transparent_60%)] pointer-events-none" />
        <div className="relative z-10">
          <ModalHeader eyebrow="Access intake" id="invite-user-title" onClose={onClose} title="Invite user" />
          <div className="mt-6 grid gap-5 border-t border-[color-mix(in_srgb,var(--glass-border)_50%,transparent)] pt-6 sm:grid-cols-2">
            <FormInput label="Name" name="name" placeholder="Maya Kamau" className="gsap-modal-field" />
            <FormInput label="Email" name="email" placeholder="maya@company.com" className="gsap-modal-field" />
            <SelectField label="Role" name="role" options={["admin", "client", "developer"]} className="gsap-modal-field sm:col-span-2" />
          </div>
          <ModalActions onClose={onClose} submitLabel="Send invite" />
        </div>
      </form>
    </ModalShell>
  );
}

function EditUserModal({ onClose, onSubmit, user }: { onClose: () => void; onSubmit: (user: UserRecord, patch: Partial<Pick<UserRecord, "accessNotes" | "owner" | "role" | "status">>) => void; user: UserRecord | null }) {
  if (!user) return null;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit(user, {
      accessNotes: String(form.get("accessNotes") ?? ""),
      owner: String(form.get("owner") ?? ""),
      role: String(form.get("role") || user.role) as UserRole,
      status: String(form.get("status") || user.status) as UserStatus,
    });
  };
  return (
    <ModalShell labelledBy="edit-user-title" onClose={onClose}>
      <form className="gsap-modal-content max-h-[85vh] overflow-y-auto scrollbar-hide w-full max-w-4xl rounded-[2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-6 sm:p-8 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_60%,transparent)] relative" onSubmit={submit}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--primary)_6%,transparent),transparent_70%)] pointer-events-none" />
        <div className="relative z-10">
          <ModalHeader eyebrow="Access editor" id="edit-user-title" onClose={onClose} title={`Edit ${user.name}`} />
          <p className="mt-2 text-[0.82rem] text-[var(--on-surface-dim)]">Display name is self-managed by the account owner from their own profile.</p>
          <div className="mt-6 grid gap-5 border-t border-[color-mix(in_srgb,var(--glass-border)_50%,transparent)] pt-6 sm:grid-cols-2">
            <SelectField label="Role" name="role" options={["admin", "client", "developer"]} defaultValue={user.role} className="gsap-modal-field" />
            <SelectField label="Status" name="status" options={["active", "invited", "disabled"]} defaultValue={user.status} className="gsap-modal-field" />
            <FormInput label="Owner" name="owner" placeholder="Dennis" defaultValue={user.owner ?? ""} className="gsap-modal-field sm:col-span-2" />
            <label className="sm:col-span-2 flex flex-col gap-2 gsap-modal-field">
              <span className="text-[0.78rem] uppercase tracking-wider font-medium text-[var(--on-surface-dim)]">Access notes</span>
              <textarea className="h-28 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 text-[0.92rem] text-[var(--on-surface)] outline-none transition-colors focus:border-[color-mix(in_srgb,var(--primary)_60%,transparent)] focus:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)]" defaultValue={user.accessNotes ?? ""} name="accessNotes" />
            </label>
          </div>
          <ModalActions onClose={onClose} submitLabel="Update user" />
        </div>
      </form>
    </ModalShell>
  );
}

function SectionHeader({ description, eyebrow, title }: { description: string; eyebrow: string; title: string }) {
  return <div><p className="label-caps text-[var(--primary)]">{eyebrow}</p><h2 className="title-serif mt-3 text-[clamp(1.48rem,2vw,1.9rem)] font-medium text-[var(--on-surface)]">{title}</h2><p className="mt-2 max-w-3xl text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">{description}</p></div>;
}

function ChartPanel({ children, description, title, value }: { children: ReactNode; description: string; title: string; value: string }) {
  return <article className="min-w-0 rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] sm:p-5"><div className="flex min-h-[4.75rem] items-start justify-between gap-4"><div><h3 className="text-[1rem] font-medium text-[var(--on-surface)]">{title}</h3><p className="mt-1 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">{description}</p></div><span className="shrink-0 rounded-full border border-[var(--glass-border)] px-3 py-1.5 font-mono text-[0.72rem] text-[var(--on-surface)]">{value}</span></div><div className="mt-4">{children}</div></article>;
}

function ContextTile({ icon: Icon, label, value }: { icon: Icon; label: string; value: string }) {
  return <article className="rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4"><Icon className="text-[var(--primary)]" size={19} stroke={1.7} /><p className="mt-3 text-[0.9rem] font-medium text-[var(--on-surface)]">{label}</p><p className="mt-2 text-[0.8rem] leading-relaxed text-[var(--on-surface-dim)]">{value}</p></article>;
}

function SelectPill({ children, icon: Icon, label, onChange, value }: { children: ReactNode; icon: Icon; label: string; onChange: (value: string) => void; value: string }) {
  return <label className="relative"><span className="sr-only">{label}</span><Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]" size={15} stroke={1.7} /><select className="h-10 w-full cursor-pointer appearance-none rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-9 pr-8 text-[0.82rem] text-[var(--on-surface)] outline-none transition-colors hover:border-[color-mix(in_srgb,var(--primary)_20%,transparent)] focus:border-[var(--primary)]" onChange={(event) => onChange(event.target.value)} value={value}>{children}</select></label>;
}

function IconButton({ children, danger, label, onClick }: { children: ReactNode; danger?: boolean; label: string; onClick: () => void }) {
  return <button aria-label={label} className={cn("grid h-9 w-9 cursor-pointer place-items-center rounded-full border transition-colors duration-200", danger ? "border-[color-mix(in_srgb,var(--error)_30%,var(--glass-border))] text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]" : "border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:bg-[var(--glass-bg)] hover:text-[var(--on-surface)]")} onClick={onClick} type="button">{children}</button>;
}

function ActionButton({ danger, icon: Icon, label, onClick }: { danger?: boolean; icon: Icon; label: string; onClick?: () => void }) {
  return <button className={cn("inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border px-3 text-[0.82rem] font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45", danger ? "border-[color-mix(in_srgb,var(--error)_30%,var(--glass-border))] text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]" : "border-[var(--glass-border)] text-[var(--on-surface)] hover:bg-[var(--glass-bg)]")} disabled={!onClick} onClick={onClick} type="button"><Icon size={15} stroke={1.7} />{label}</button>;
}

function SignalCell({ label, value }: { label: string; value: string }) {
  return <div className="border-r border-[var(--glass-border)] px-3 py-3 last:border-r-0"><p className="text-[0.66rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">{label}</p><p className="mt-1 truncate font-mono text-[0.84rem] text-[var(--on-surface)]">{value}</p></div>;
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5"><p className="text-[0.66rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)]">{label}</p><p className="mt-1 truncate font-mono text-[0.82rem] text-[var(--on-surface)]">{value}</p></div>;
}

function ActivityPanel({ activity }: { activity: string[] }) {
  return <div className="rounded-[1.4rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6"><p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Access snapshot</p><div className="mt-5 grid gap-4">{activity.map((item, index) => <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2" key={`${item}-${index}`}><span className={cn("mt-1.5 h-1.5 w-1.5 rounded-full", index === 0 ? "bg-[var(--tertiary)] shadow-[0_0_10px_var(--tertiary)]" : "bg-[var(--on-surface-dim)]")} /><p className={cn("text-[0.86rem] leading-relaxed", index === 0 ? "text-[var(--on-surface)]" : "text-[var(--on-surface-dim)]")}>{item}</p></div>)}</div></div>;
}

function ModalHeader({ eyebrow, id, onClose, title }: { eyebrow: string; id: string; onClose: () => void; title: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[0.75rem] uppercase tracking-[0.15em] text-[var(--primary)] font-medium">{eyebrow}</p>
        <h2 id={id} className="title-serif mt-2 text-[1.4rem] font-medium text-[var(--on-surface)]">{title}</h2>
      </div>
      <button aria-label="Close modal" className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] hover:text-[var(--on-surface)]" onClick={onClose} type="button">
        <IconX size={18} stroke={1.7} />
      </button>
    </div>
  );
}

function ModalActions({ onClose, submitLabel }: { onClose: () => void; submitLabel: string }) {
  return (
    <div className="mt-8 sticky bottom-[-1.5rem] sm:bottom-[-2rem] -mx-6 sm:-mx-8 px-6 sm:px-8 pb-6 sm:pb-8 pt-5 border-t border-[color-mix(in_srgb,var(--glass-border)_50%,transparent)] bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] backdrop-blur-2xl flex flex-col-reverse gap-3 sm:flex-row sm:justify-end z-20 gsap-modal-field">
      <button className="h-11 cursor-pointer rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-6 text-[0.88rem] font-medium text-[var(--on-surface)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)]" onClick={onClose} type="button">Cancel</button>
      <button className="h-11 cursor-pointer rounded-full bg-[var(--primary)] px-6 text-[0.88rem] font-medium text-[var(--bg)] transition-opacity hover:opacity-90" type="submit">{submitLabel}</button>
    </div>
  );
}

function FormInput({ className, defaultValue, label, name, placeholder }: { className?: string; defaultValue?: string; label: string; name: string; placeholder: string }) {
  return <label className={cn("flex flex-col gap-2", className)}><span className="text-[0.78rem] uppercase tracking-wider font-medium text-[var(--on-surface-dim)]">{label}</span><input defaultValue={defaultValue} className="h-12 w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.92rem] text-[var(--on-surface)] outline-none transition-colors placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_60%,transparent)] focus:border-[color-mix(in_srgb,var(--primary)_60%,transparent)] focus:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)]" name={name} placeholder={placeholder} /></label>;
}

function SelectField({ className, defaultValue, label, name, options }: { className?: string; defaultValue?: string; label: string; name: string; options: string[] }) {
  return <label className={cn("flex flex-col gap-2", className)}><span className="text-[0.78rem] uppercase tracking-wider font-medium text-[var(--on-surface-dim)]">{label}</span><select defaultValue={defaultValue} className="h-12 w-full cursor-pointer appearance-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.92rem] text-[var(--on-surface)] outline-none transition-colors focus:border-[color-mix(in_srgb,var(--primary)_60%,transparent)] focus:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)]" name={name}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return <div className="rounded-[1.5rem] border border-dashed border-[color-mix(in_srgb,var(--primary)_20%,var(--glass-border))] bg-[color-mix(in_srgb,var(--glass-bg)_50%,transparent)] p-12 text-center lg:col-span-2 flex flex-col items-center"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--glass-bg)] border border-[color-mix(in_srgb,var(--primary)_40%,var(--glass-border))] text-[var(--primary)] mb-4"><IconSearch size={20} /></span><p className="text-[1.05rem] font-medium text-[var(--on-surface)]">{title}</p><p className="mx-auto mt-2 max-w-md text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">{body}</p></div>;
}

/** Honest, real-signal flag - status/verification only. No fabricated MFA or risk-scoring. */
function deriveUserFlag(user: Pick<UserRecord, "emailVerified" | "status">): UserFlag {
  if (user.status === "disabled") return "locked";
  if (!user.emailVerified) return "review";
  return "low";
}

function buildVisibleScope(record: Pick<UserRecord, "engineerId" | "organizationId" | "role">) {
  if (record.role === "admin") return "Full admin command surface with finance, users, content, support, network, and operations visibility.";
  if (record.role === "client") return `Organization scope ${record.organizationId ?? "pending"} with client-safe project and billing visibility.`;
  return `Engineer scope ${record.engineerId ?? "pending"} with developer-safe workbench and payout visibility.`;
}

/** Read-only snapshot computed from the real record each render - not a stored/mutable log. */
function buildActivitySnapshot(user: UserRecord): string[] {
  return [
    user.lastLoginAt ? `Last login ${formatDate(user.lastLoginAt)}` : "No login recorded",
    user.emailVerified ? "Email verified" : "Email verification pending",
    `${roleLabel[user.role]} workspace access assigned`,
    user.status === "disabled" ? "Access currently disabled" : null,
  ].filter((item): item is string => Boolean(item));
}

function buildUserStats(users: UserRecord[]) {
  const active = users.filter((user) => user.status === "active").length;
  const verified = users.filter((user) => user.emailVerified).length;
  const disabled = users.filter((user) => user.status === "disabled").length;
  const review = users.filter((user) => deriveUserFlag(user) !== "low").length;
  return {
    active,
    admins: users.filter((user) => user.role === "admin").length,
    disabled,
    invited: users.filter((user) => user.status === "invited").length,
    review,
    unverified: users.length - verified,
    verifiedRate: users.length ? Math.round((verified / users.length) * 100) : 0,
  };
}

function flagPriority(flag: UserFlag) {
  return flag === "locked" ? 3 : flag === "review" ? 2 : 1;
}

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}
