"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode, RefObject } from "react";
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
  IconTrash,
  IconUserCheck,
  IconUsers,
  IconX,
  type Icon,
} from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import {
  DashboardBarChart,
  DashboardDonutChart,
  DashboardLineChart,
} from "@/components/dashboard/shared/dashboard-chart";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { EntityDrawer } from "@/components/dashboard/shared/entity-drawer";
import { KpiCard } from "@/components/dashboard/shared/kpi-card";
import {
  OperationalDataTable,
  type OperationalTableColumn,
} from "@/components/dashboard/shared/operational-data-table";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { SectionDivider } from "@/components/ui/section-divider";
import type { AdminAuthIntakeRecord } from "@/lib/dashboard/admin-auth-intake";
import { cn } from "@/lib/utils";

type UserRole = AdminAuthIntakeRecord["role"];
type UserStatus = AdminAuthIntakeRecord["status"];
type UserRisk = "low" | "review" | "locked";

type UserRecord = AdminAuthIntakeRecord & {
  accessNotes: string;
  activity: string[];
  mfaState: "enabled" | "pending" | "missing";
  owner: string;
  risk: UserRisk;
  visibleScope: string;
};

type RoleFilter = UserRole | "all";
type StatusFilter = UserStatus | "all";
type SortKey = "recent" | "risk" | "role" | "status";

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

const riskMeta: Record<UserRisk, { label: string; tone: "active" | "overdue" | "pending" }> = {
  locked: { label: "Locked", tone: "overdue" },
  low: { label: "Low risk", tone: "active" },
  review: { label: "Review", tone: "pending" },
};

export function AdminUsersPage({ authIntake }: { authIntake: AdminAuthIntakeRecord[] }) {
  const [users, setUsers] = useState<UserRecord[]>(() => buildUserRecords(authIntake));
  const [selectedId, setSelectedId] = useState(authIntake[0]?.id ?? "seed-admin");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [drawerUser, setDrawerUser] = useState<UserRecord | null>(null);
  const [confirmUser, setConfirmUser] = useState<UserRecord | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);

  const selected = users.find((user) => user.id === selectedId) ?? users[0] ?? null;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users
      .filter((user) => {
        const haystack = `${user.name} ${user.email} ${user.role} ${user.status} ${user.owner} ${user.visibleScope}`.toLowerCase();
        return (
          (!needle || haystack.includes(needle)) &&
          (roleFilter === "all" || user.role === roleFilter) &&
          (statusFilter === "all" || user.status === statusFilter)
        );
      })
      .sort((a, b) => {
        if (sortKey === "risk") return riskPriority(b.risk) - riskPriority(a.risk);
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
      { key: "risk", label: "Risk", hideOnMobile: true, render: (user) => <StatusBadge label={riskMeta[user.risk].label} tone={riskMeta[user.risk].tone} /> },
      { key: "owner", label: "Owner", hideOnMobile: true },
    ],
    [],
  );

  const inviteUser = (payload: { email: string; name: string; owner: string; role: UserRole }) => {
    const created = enrichUserRecord({
      createdAt: new Date().toISOString(),
      email: payload.email,
      emailVerified: false,
      engineerId: null,
      id: `user-${Date.now()}`,
      lastLoginAt: null,
      name: payload.name,
      organizationId: null,
      role: payload.role,
      status: "invited",
    }, payload.owner);
    setUsers((current) => [created, ...current]);
    setSelectedId(created.id);
    setDrawerUser(created);
    setInviteOpen(false);
  };

  const updateUser = (user: UserRecord, patch: Pick<UserRecord, "accessNotes" | "mfaState" | "name" | "owner" | "role" | "status" | "visibleScope">) => {
    const updated: UserRecord = {
      ...user,
      ...patch,
      activity: ["User access record edited", ...user.activity],
      risk: deriveUserRisk({ ...user, ...patch }),
    };
    setUsers((current) => current.map((item) => (item.id === user.id ? updated : item)));
    setSelectedId(updated.id);
    setDrawerUser((current) => (current?.id === user.id ? updated : current));
    setEditUser(null);
  };

  const verifyUser = (user: UserRecord) => {
    const updated: UserRecord = {
      ...user,
      activity: ["Email marked verified by admin", ...user.activity],
      emailVerified: true,
      risk: user.status === "disabled" ? "locked" : "low",
      status: user.status === "invited" ? "active" : user.status,
    };
    setUsers((current) => current.map((item) => (item.id === user.id ? updated : item)));
    setSelectedId(updated.id);
    setDrawerUser((current) => (current?.id === user.id ? updated : current));
  };

  const resendInvite = (user: UserRecord) => {
    const updated = { ...user, activity: ["Invite email resent", ...user.activity] };
    setUsers((current) => current.map((item) => (item.id === user.id ? updated : item)));
    setDrawerUser((current) => (current?.id === user.id ? updated : current));
  };

  const toggleUser = (user: UserRecord) => {
    const nextStatus: UserStatus = user.status === "disabled" ? "active" : "disabled";
    const updated: UserRecord = {
      ...user,
      activity: [nextStatus === "disabled" ? "User access disabled" : "User access restored", ...user.activity],
      risk: nextStatus === "disabled" ? "locked" : deriveUserRisk({ ...user, status: nextStatus }),
      status: nextStatus,
    };
    setUsers((current) => current.map((item) => (item.id === user.id ? updated : item)));
    setSelectedId(updated.id);
    setDrawerUser((current) => (current?.id === user.id ? updated : current));
  };

  const archiveUser = () => {
    if (!confirmUser) return;
    const next = users.filter((user) => user.id !== confirmUser.id);
    setUsers(next);
    if (selectedId === confirmUser.id) setSelectedId(next[0]?.id ?? "");
    setConfirmUser(null);
  };

  return (
    <div className="grid min-w-0 gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <DashboardPageHeader
        className="mb-0"
        title="User management"
        description="Invite, verify, edit, disable, and govern admin, client, and developer accounts without mixing access operations into platform settings."
        status={<StatusBadge label={`${stats.review} access reviews`} tone={stats.review ? "pending" : "active"} />}
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

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard chart="bar" data={[8, 10, 12, 14, users.length]} icon={IconUsers} label="Total users" trend={`${stats.active} active`} value={String(users.length)} />
        <KpiCard data={[52, 64, 72, 82, stats.verifiedRate]} icon={IconUserCheck} label="Verified email" trend={`${stats.unverified} unverified`} value={`${stats.verifiedRate}%`} />
        <KpiCard chart="bar" data={[1, 2, 3, 3, stats.admins]} icon={IconKey} label="Admins" trend="Privileged accounts" value={String(stats.admins)} />
        <KpiCard data={[88, 84, 81, 79, stats.review]} icon={IconAlertTriangle} label="Access review" trend={`${stats.locked} locked`} value={String(stats.review)} />
      </section>

      <SectionDivider />

      <section className="grid min-w-0 gap-7 2xl:grid-cols-[minmax(0,1fr)_minmax(23rem,27rem)]">
        <UserAccessMap users={users} />
        <UserCommandPanel
          onArchive={selected ? () => setConfirmUser(selected) : undefined}
          onEdit={selected ? () => setEditUser(selected) : undefined}
          onInspect={selected ? () => setDrawerUser(selected) : undefined}
          onResend={selected ? () => resendInvite(selected) : undefined}
          onToggle={selected ? () => toggleUser(selected) : undefined}
          onVerify={selected ? () => verifyUser(selected) : undefined}
          user={selected}
        />
      </section>

      <SectionDivider />

      <section className="grid gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <SectionHeader eyebrow="Access registry" title="Accounts and role assignments" description="Search, filter, edit, verify, disable, and inspect users across admin, client, and developer workspaces." />
          <UserToolbar query={query} roleFilter={roleFilter} setQuery={setQuery} setRoleFilter={setRoleFilter} setSortKey={setSortKey} setStatusFilter={setStatusFilter} sortKey={sortKey} statusFilter={statusFilter} />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((user) => (
            <UserCard
              key={user.id}
              onArchive={() => setConfirmUser(user)}
              onEdit={() => setEditUser(user)}
              onInspect={() => setDrawerUser(user)}
              onResend={() => resendInvite(user)}
              onSelect={() => setSelectedId(user.id)}
              onToggle={() => toggleUser(user)}
              onVerify={() => verifyUser(user)}
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

      <OperationalDataTable columns={columns} description="User governance matrix for role, account state, verification, access risk, owner, and workspace scope." empty="No users match the active filters." onRowSelect={(user) => { setSelectedId(user.id); setDrawerUser(user); }} rows={filtered} title="User access matrix" />

      <InviteUserModal onClose={() => setInviteOpen(false)} onSubmit={inviteUser} open={inviteOpen} />
      <EditUserModal onClose={() => setEditUser(null)} onSubmit={updateUser} user={editUser} />

      <EntityDrawer onClose={() => setDrawerUser(null)} open={Boolean(drawerUser)} title={drawerUser?.name ?? "User details"}>
        {drawerUser && <UserDrawer user={drawerUser} onArchive={() => setConfirmUser(drawerUser)} onEdit={() => setEditUser(drawerUser)} onResend={() => resendInvite(drawerUser)} onToggle={() => toggleUser(drawerUser)} onVerify={() => verifyUser(drawerUser)} />}
      </EntityDrawer>

      <ConfirmDialog confirmLabel="Archive user" description={`This removes ${confirmUser?.email ?? "this user"} from the local admin access registry. In production this should become a server-authorized archive or disable action.`} onCancel={() => setConfirmUser(null)} onConfirm={archiveUser} open={Boolean(confirmUser)} title="Archive user record?" />
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
        <SelectPill icon={IconRefresh} label="Sort" value={sortKey} onChange={(value) => setSortKey(value as SortKey)}><option value="recent">Recent</option><option value="risk">Risk</option><option value="role">Role</option><option value="status">Status</option></SelectPill>
      </div>
    </div>
  );
}

function UserCard({ onArchive, onEdit, onInspect, onResend, onSelect, onToggle, onVerify, selected, user }: { onArchive: () => void; onEdit: () => void; onInspect: () => void; onResend: () => void; onSelect: () => void; onToggle: () => void; onVerify: () => void; selected: boolean; user: UserRecord }) {
  return (
    <article className={cn("min-w-0 overflow-hidden rounded-[1.35rem] border transition-all duration-200", selected ? "border-[color-mix(in_srgb,var(--primary)_38%,var(--glass-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_7%,var(--surface)),var(--surface))] shadow-[0_18px_50px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]" : user.status === "disabled" ? "border-[color-mix(in_srgb,var(--error)_34%,var(--glass-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--error)_6%,var(--surface)),var(--surface))]" : "border-[var(--glass-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-high)_24%,var(--surface)),var(--surface))]")}>
      <button className="block w-full cursor-pointer p-5 text-left sm:p-6" onClick={onSelect} type="button">
        <div className="flex flex-wrap items-center gap-2"><h3 className="break-words text-[1rem] font-medium text-[var(--on-surface)]">{user.name}</h3><StatusBadge label={statusMeta[user.status].label} tone={statusMeta[user.status].tone} /></div>
        <p className="mt-2 truncate text-[0.86rem] text-[var(--on-surface-dim)]">{user.email}</p>
        <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]"><SignalCell label="Role" value={roleLabel[user.role]} /><SignalCell label="MFA" value={user.mfaState} /><SignalCell label="Email" value={user.emailVerified ? "verified" : "open"} /></div>
        <p className="mt-5 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">{user.visibleScope}</p>
      </button>
      <div className="flex flex-col gap-3 border-t border-[var(--glass-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <StatusBadge label={riskMeta[user.risk].label} tone={riskMeta[user.risk].tone} />
        <div className="flex shrink-0 flex-wrap justify-end gap-2"><IconButton label="Verify" onClick={onVerify}><IconCheck size={16} stroke={1.8} /></IconButton><IconButton label="Resend invite" onClick={onResend}><IconMail size={16} stroke={1.8} /></IconButton><IconButton label="Edit" onClick={onEdit}><IconEdit size={16} stroke={1.8} /></IconButton><IconButton label="Inspect" onClick={onInspect}><IconArrowRight size={16} stroke={1.8} /></IconButton><IconButton danger label="Toggle access" onClick={onToggle}><IconLock size={16} stroke={1.8} /></IconButton><IconButton danger label="Archive" onClick={onArchive}><IconTrash size={16} stroke={1.8} /></IconButton></div>
      </div>
    </article>
  );
}

function UserCommandPanel({ onArchive, onEdit, onInspect, onResend, onToggle, onVerify, user }: { onArchive?: () => void; onEdit?: () => void; onInspect?: () => void; onResend?: () => void; onToggle?: () => void; onVerify?: () => void; user: UserRecord | null }) {
  if (!user) return <EmptyState title="Select a user" body="Pick an account to inspect access state." />;
  return <aside className="2xl:sticky 2xl:top-28 2xl:self-start"><div className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)] sm:p-6"><StatusBadge label={statusMeta[user.status].label} tone={statusMeta[user.status].tone} /><h2 className="title-serif mt-3 text-[1.15rem] font-medium text-[var(--on-surface)]">{user.name}</h2><p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{user.email}</p><div className="mt-5 grid grid-cols-2 gap-2.5"><InfoTile label="Role" value={roleLabel[user.role]} /><InfoTile label="Owner" value={user.owner} /><InfoTile label="MFA" value={user.mfaState} /><InfoTile label="Last login" value={formatDate(user.lastLoginAt)} /></div><div className="mt-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4"><p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Access scope</p><p className="mt-2 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">{user.visibleScope}</p></div><div className="mt-5 grid grid-cols-2 gap-2"><ActionButton icon={IconCheck} label="Verify" onClick={onVerify} /><ActionButton icon={IconMail} label="Invite" onClick={onResend} /><ActionButton icon={IconEdit} label="Edit" onClick={onEdit} /><ActionButton icon={IconArrowRight} label="Inspect" onClick={onInspect} /><ActionButton danger icon={IconLock} label={user.status === "disabled" ? "Restore" : "Disable"} onClick={onToggle} /><ActionButton danger icon={IconTrash} label="Archive" onClick={onArchive} /></div></div></aside>;
}

function UserDrawer({ onArchive, onEdit, onResend, onToggle, onVerify, user }: { onArchive: () => void; onEdit: () => void; onResend: () => void; onToggle: () => void; onVerify: () => void; user: UserRecord }) {
  return <div className="grid gap-6"><section><StatusBadge label={statusMeta[user.status].label} tone={statusMeta[user.status].tone} /><h3 className="mt-3 text-[1.35rem] font-medium text-[var(--on-surface)]">{user.name}</h3><p className="mt-2 text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">{user.email} / {roleLabel[user.role]}</p></section><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><InfoTile label="Owner" value={user.owner} /><InfoTile label="MFA" value={user.mfaState} /><InfoTile label="Created" value={formatDate(user.createdAt)} /><InfoTile label="Last login" value={formatDate(user.lastLoginAt)} /></section><section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]"><div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4"><p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Access policy</p><p className="mt-3 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">{user.accessNotes}</p><p className="mt-4 text-[0.82rem] leading-relaxed text-[var(--primary)]">{user.visibleScope}</p></div><ActivityPanel activity={user.activity} /></section><div className="flex flex-col-reverse gap-2 border-t border-[var(--glass-border)] pt-5 sm:flex-row sm:justify-end"><ActionButton danger icon={IconTrash} label="Archive" onClick={onArchive} /><ActionButton danger icon={IconLock} label={user.status === "disabled" ? "Restore" : "Disable"} onClick={onToggle} /><ActionButton icon={IconMail} label="Invite" onClick={onResend} /><ActionButton icon={IconEdit} label="Edit" onClick={onEdit} /><ActionButton icon={IconCheck} label="Verify" onClick={onVerify} /></div></div>;
}

function InviteUserModal({ onClose, onSubmit, open }: { onClose: () => void; onSubmit: (payload: { email: string; name: string; owner: string; role: UserRole }) => void; open: boolean }) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  useModalLifecycle(open, onClose, firstInputRef);
  if (!open) return null;
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); onSubmit({ email: String(form.get("email") || "user@example.com"), name: String(form.get("name") || "New User"), owner: String(form.get("owner") || "Admin"), role: String(form.get("role") || "client") as UserRole }); };
  return <ModalShell labelledBy="invite-user-title" onClose={onClose}><form className="w-full max-w-3xl rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-6" onSubmit={submit}><ModalHeader eyebrow="Access intake" id="invite-user-title" onClose={onClose} title="Invite user" /><div className="mt-6 grid gap-4 border-t border-[var(--glass-border)] pt-6 sm:grid-cols-2"><FormInput ref={firstInputRef} label="Name" name="name" placeholder="Maya Kamau" /><FormInput label="Email" name="email" placeholder="maya@company.com" /><FormInput label="Owner" name="owner" placeholder="Dennis" /><SelectField label="Role" name="role" options={["admin", "client", "developer"]} /></div><ModalActions onClose={onClose} submitLabel="Send invite" /></form></ModalShell>;
}

function EditUserModal({ onClose, onSubmit, user }: { onClose: () => void; onSubmit: (user: UserRecord, patch: Pick<UserRecord, "accessNotes" | "mfaState" | "name" | "owner" | "role" | "status" | "visibleScope">) => void; user: UserRecord | null }) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  useModalLifecycle(Boolean(user), onClose, firstInputRef);
  if (!user) return null;
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); onSubmit(user, { accessNotes: String(form.get("accessNotes") || user.accessNotes), mfaState: String(form.get("mfaState") || user.mfaState) as UserRecord["mfaState"], name: String(form.get("name") || user.name), owner: String(form.get("owner") || user.owner), role: String(form.get("role") || user.role) as UserRole, status: String(form.get("status") || user.status) as UserStatus, visibleScope: String(form.get("visibleScope") || user.visibleScope) }); };
  return <ModalShell labelledBy="edit-user-title" onClose={onClose}><form className="w-full max-w-4xl rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-6" onSubmit={submit}><ModalHeader eyebrow="Access editor" id="edit-user-title" onClose={onClose} title={`Edit ${user.name}`} /><div className="mt-6 grid gap-4 border-t border-[var(--glass-border)] pt-6 sm:grid-cols-2"><FormInput ref={firstInputRef} label="Name" name="name" placeholder={user.name} /><FormInput label="Owner" name="owner" placeholder={user.owner} /><SelectField label="Role" name="role" options={["admin", "client", "developer"]} /><SelectField label="Status" name="status" options={["active", "invited", "disabled"]} /><SelectField label="MFA" name="mfaState" options={["enabled", "pending", "missing"]} /><label className="sm:col-span-2"><span className="text-[0.78rem] font-medium text-[var(--on-surface)]">Visible scope</span><textarea className="mt-2 min-h-20 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]" defaultValue={user.visibleScope} name="visibleScope" /></label><label className="sm:col-span-2"><span className="text-[0.78rem] font-medium text-[var(--on-surface)]">Access notes</span><textarea className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]" defaultValue={user.accessNotes} name="accessNotes" /></label></div><ModalActions onClose={onClose} submitLabel="Update user" /></form></ModalShell>;
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
  return <label className="relative"><span className="sr-only">{label}</span><Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)]" size={15} stroke={1.7} /><select className="h-10 w-full cursor-pointer appearance-none rounded-full border border-[var(--glass-border)] bg-[var(--surface)] pl-9 pr-8 text-[0.82rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]" onChange={(event) => onChange(event.target.value)} value={value}>{children}</select></label>;
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
  return <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4"><p className="text-[0.92rem] font-medium text-[var(--on-surface)]">Access activity</p><div className="mt-4 grid gap-3">{activity.map((item, index) => <div className="grid grid-cols-[1rem_minmax(0,1fr)] gap-3" key={`${item}-${index}`}><span className={cn("mt-1 h-2 w-2 rounded-full", index === 0 ? "bg-[var(--tertiary)]" : "bg-[var(--on-surface-dim)]")} /><p className="text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]">{item}</p></div>)}</div></div>;
}

function ModalShell({ children, labelledBy, onClose }: { children: ReactNode; labelledBy: string; onClose: () => void }) {
  return <div aria-labelledby={labelledBy} aria-modal="true" className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-8 backdrop-blur-xl" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} role="dialog">{children}</div>;
}

function ModalHeader({ eyebrow, id, onClose, title }: { eyebrow: string; id: string; onClose: () => void; title: string }) {
  return <div className="flex items-start justify-between gap-4"><div><p className="label-caps text-[var(--primary)]">{eyebrow}</p><h2 id={id} className="title-serif mt-2 text-[1.25rem] font-medium text-[var(--on-surface)]">{title}</h2></div><button aria-label="Close modal" className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]" onClick={onClose} type="button"><IconX size={18} stroke={1.7} /></button></div>;
}

function ModalActions({ onClose, submitLabel }: { onClose: () => void; submitLabel: string }) {
  return <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.86rem] font-medium text-[var(--on-surface)]" onClick={onClose} type="button">Cancel</button><button className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-5 text-[0.86rem] font-medium text-[var(--bg)]" type="submit">{submitLabel}</button></div>;
}

const FormInput = forwardRef<HTMLInputElement, { label: string; name: string; placeholder: string }>(function FormInput({ label, name, placeholder }, ref) {
  return <label><span className="text-[0.78rem] font-medium text-[var(--on-surface)]">{label}</span><input ref={ref} className="mt-2 h-11 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--primary)]" name={name} placeholder={placeholder} /></label>;
});

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return <label><span className="text-[0.78rem] font-medium text-[var(--on-surface)]">{label}</span><select className="mt-2 h-11 w-full cursor-pointer rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]" name={name}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return <div className="rounded-[1.2rem] border border-dashed border-[var(--glass-border)] p-8 text-center lg:col-span-2"><p className="text-[0.98rem] font-medium text-[var(--on-surface)]">{title}</p><p className="mx-auto mt-2 max-w-md text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{body}</p></div>;
}

function useModalLifecycle<T extends HTMLElement>(open: boolean, onClose: () => void, ref: RefObject<T | null>) {
  useEffect(() => {
    if (!open) return;
    ref.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, open, ref]);
}

function buildUserRecords(records: AdminAuthIntakeRecord[]) {
  const source = records.length ? records : fallbackUsers;
  return source.map((record) => enrichUserRecord(record));
}

function enrichUserRecord(record: AdminAuthIntakeRecord, owner = record.role === "admin" ? "Founder" : record.role === "client" ? "Account ops" : "Talent ops"): UserRecord {
  const user: UserRecord = {
    ...record,
    accessNotes: buildAccessNotes(record),
    activity: [
      record.lastLoginAt ? `Last login ${formatDate(record.lastLoginAt)}` : "No login recorded",
      record.emailVerified ? "Email verified" : "Email verification pending",
      `${roleLabel[record.role]} workspace access assigned`,
    ],
    mfaState: record.role === "admin" ? "enabled" : record.emailVerified ? "pending" : "missing",
    owner,
    risk: "low",
    visibleScope: buildVisibleScope(record),
  };
  return { ...user, risk: deriveUserRisk(user) };
}

function deriveUserRisk(user: Pick<UserRecord, "emailVerified" | "mfaState" | "role" | "status">): UserRisk {
  if (user.status === "disabled") return "locked";
  if (!user.emailVerified || user.mfaState === "missing" || (user.role === "admin" && user.mfaState !== "enabled")) return "review";
  return "low";
}

function buildAccessNotes(record: AdminAuthIntakeRecord) {
  if (record.role === "admin") return "Admin account can operate full platform surfaces and must keep verification, MFA, and audit hygiene current.";
  if (record.role === "client") return "Client account receives organization-scoped briefs, profiles, projects, invoices, messages, and support context only.";
  return "Developer account receives engineer-scoped profile, project, time, support, messages, and payout context only.";
}

function buildVisibleScope(record: AdminAuthIntakeRecord) {
  if (record.role === "admin") return "Full admin command surface with finance, users, content, support, network, and operations visibility.";
  if (record.role === "client") return `Organization scope ${record.organizationId ?? "pending"} with client-safe project and billing visibility.`;
  return `Engineer scope ${record.engineerId ?? "pending"} with developer-safe workbench and payout visibility.`;
}

function buildUserStats(users: UserRecord[]) {
  const active = users.filter((user) => user.status === "active").length;
  const verified = users.filter((user) => user.emailVerified).length;
  const review = users.filter((user) => user.risk !== "low").length;
  return {
    active,
    admins: users.filter((user) => user.role === "admin").length,
    invited: users.filter((user) => user.status === "invited").length,
    locked: users.filter((user) => user.risk === "locked").length,
    review,
    unverified: users.length - verified,
    verifiedRate: users.length ? Math.round((verified / users.length) * 100) : 0,
  };
}

function riskPriority(risk: UserRisk) {
  return risk === "locked" ? 3 : risk === "review" ? 2 : 1;
}

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

const fallbackUsers: AdminAuthIntakeRecord[] = [
  {
    createdAt: "2026-06-01T08:00:00.000Z",
    email: "dennis@andishi.dev",
    emailVerified: true,
    engineerId: null,
    id: "seed-admin",
    lastLoginAt: "2026-06-04T08:30:00.000Z",
    name: "Dennis Munge",
    organizationId: null,
    role: "admin",
    status: "active",
  },
  {
    createdAt: "2026-06-02T10:00:00.000Z",
    email: "maya@kijani.example",
    emailVerified: true,
    engineerId: null,
    id: "seed-client",
    lastLoginAt: "2026-06-03T15:20:00.000Z",
    name: "Maya Kamau",
    organizationId: "org-kijani",
    role: "client",
    status: "active",
  },
  {
    createdAt: "2026-06-03T11:00:00.000Z",
    email: "amina@engineer.example",
    emailVerified: false,
    engineerId: "eng-amina",
    id: "seed-dev",
    lastLoginAt: null,
    name: "Amina Otieno",
    organizationId: null,
    role: "developer",
    status: "invited",
  },
];
