"use client";

import { forwardRef, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  IconBell,
  IconBrandGithub,
  IconCheck,
  IconClock,
  IconDeviceLaptop,
  IconEdit,
  IconKey,
  IconLock,
  IconMail,
  IconMapPin,
  IconRefresh,
  IconShieldCheck,
  IconTrash,
  IconUserCircle,
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
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { SectionDivider } from "@/components/ui/section-divider";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";
import { roleNames } from "@/types/auth";

type AdminProfileState = {
  bio: string;
  escalationEmail: string;
  location: string;
  name: string;
  notificationWindow: string;
  phone: string;
  title: string;
};

type SecuritySession = {
  device: string;
  id: string;
  ip: string;
  lastSeen: string;
  location: string;
  trusted: boolean;
};

const profileSeed = {
  bio: "Owns Andishi admin command, commercial boundaries, talent-network quality, and cross-role operating controls.",
  escalationEmail: "dennis@andishi.dev",
  location: "Nairobi, Kenya",
  notificationWindow: "08:00-19:00 EAT",
  phone: "+254 700 000 000",
  title: "Founder / Admin Operator",
};

const sessionSeed: SecuritySession[] = [
  { device: "Windows workstation", id: "session-main", ip: "102.68.84.21", lastSeen: "Now", location: "Nairobi", trusted: true },
  { device: "Chrome mobile", id: "session-mobile", ip: "102.68.84.44", lastSeen: "2h ago", location: "Nairobi", trusted: true },
  { device: "Vercel preview", id: "session-preview", ip: "34.74.90.12", lastSeen: "Yesterday", location: "Iowa", trusted: false },
];

const profileChannels = [
  { icon: IconMail, label: "Email", value: "Critical finance, identity, and support alerts" },
  { icon: IconBell, label: "In-app", value: "Brief, pipeline, audit, and content movement" },
  { icon: IconBrandGithub, label: "Engineering", value: "Deployment, repo, and implementation review signals" },
];

export function AdminProfilePage({ user }: { user: AuthUser }) {
  const [profile, setProfile] = useState<AdminProfileState>({ ...profileSeed, name: user.name });
  const [sessions, setSessions] = useState(sessionSeed);
  const [editOpen, setEditOpen] = useState(false);
  const [drawerSession, setDrawerSession] = useState<SecuritySession | null>(null);
  const [confirmSession, setConfirmSession] = useState<SecuritySession | null>(null);
  const stats = useMemo(() => buildProfileStats(sessions), [sessions]);

  const revokeSession = () => {
    if (!confirmSession) return;
    setSessions((current) => current.filter((session) => session.id !== confirmSession.id));
    setDrawerSession((current) => current?.id === confirmSession.id ? null : current);
    setConfirmSession(null);
  };

  const trustSession = (session: SecuritySession) => {
    const updated = { ...session, trusted: true };
    setSessions((current) => current.map((entry) => entry.id === session.id ? updated : entry));
    setDrawerSession((current) => current?.id === session.id ? updated : current);
  };

  return (
    <div className="grid min-w-0 gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <DashboardPageHeader
        className="mb-0"
        title="Admin profile"
        description="Control the admin identity, escalation routes, notification preferences, security posture, and operator context attached to Andishi command actions."
        status={<StatusBadge label={roleNames[user.role]} tone="active" />}
        actions={
          <>
            <button type="button" onClick={() => setSessions((current) => current.map((session) => ({ ...session, lastSeen: session.id === "session-main" ? "Now" : session.lastSeen })))} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.86rem] font-medium text-[var(--on-surface)] hover:bg-[var(--glass-bg)]">
              <IconRefresh size={15} stroke={1.8} />
              Refresh sessions
            </button>
            <button type="button" onClick={() => setEditOpen(true)} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.86rem] font-medium text-[var(--bg)]">
              <IconEdit size={15} stroke={1.8} />
              Edit profile
            </button>
          </>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard data={[70, 74, 79, 84, stats.securityScore]} icon={IconShieldCheck} label="Security posture" trend={`${stats.untrusted} sessions need review`} value={`${stats.securityScore}%`} />
        <KpiCard chart="bar" data={[1, 1, 2, 2, sessions.length]} icon={IconDeviceLaptop} label="Active sessions" trend={`${stats.trusted} trusted devices`} value={String(sessions.length)} />
        <KpiCard data={[60, 68, 76, 82, 94]} icon={IconBell} label="Routing readiness" trend={profile.notificationWindow} value="94%" />
        <KpiCard chart="bar" data={[3, 4, 5, 5, 6]} icon={IconUsers} label="Admin scope" trend="Full command access" value="6" />
      </section>

      <section className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)]">
        <ProfileCommandRoom profile={profile} user={user} />
        <ProfileRoutingPanel profile={profile} />
      </section>

      <SectionDivider />

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <SecuritySessions sessions={sessions} onInspect={setDrawerSession} onRevoke={setConfirmSession} onTrust={trustSession} />
        <SecurityPanel stats={stats} />
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <ChartPanel title="Admin activity posture" description="Security, notifications, and command readiness over the current operating cycle." value={`${stats.securityScore}%`}>
          <DashboardLineChart data={[64, 70, 73, 79, 84, stats.securityScore]} height={300} labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Now"]} variant="area" />
        </ChartPanel>
        <ChartPanel title="Profile controls" description="Distribution across identity, notification, security, and command settings." value="4 domains">
          <DashboardDonutChart data={[{ label: "Identity", value: 3, tone: "secondary" }, { label: "Security", value: 4, tone: "primary" }, { label: "Routing", value: 3, tone: "success" }, { label: "Command", value: 2, tone: "muted" }]} height={210} />
        </ChartPanel>
      </section>

      <EditProfileModal onClose={() => setEditOpen(false)} onSubmit={(next) => { setProfile(next); setEditOpen(false); }} open={editOpen} profile={profile} />

      <EntityDrawer onClose={() => setDrawerSession(null)} open={Boolean(drawerSession)} title={drawerSession?.device ?? "Session detail"}>
        {drawerSession && <SessionDrawer session={drawerSession} onRevoke={() => setConfirmSession(drawerSession)} onTrust={() => trustSession(drawerSession)} />}
      </EntityDrawer>

      <ConfirmDialog cancelLabel="Keep session" confirmLabel="Revoke session" description={`Revoke ${confirmSession?.device ?? "this session"} from the active admin profile.`} onCancel={() => setConfirmSession(null)} onConfirm={revokeSession} open={Boolean(confirmSession)} title="Revoke admin session?" />
    </div>
  );
}

function ProfileCommandRoom({ profile, user }: { profile: AdminProfileState; user: AuthUser }) {
  const initials = profile.name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <section className="overflow-hidden rounded-[1.6rem] border border-[var(--glass-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-high)_22%,var(--surface)),var(--surface))] shadow-[0_22px_70px_color-mix(in_srgb,var(--bg-deep)_10%,transparent)]">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <div className="grid place-items-center rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
          <span className="grid h-24 w-24 place-items-center rounded-full bg-[var(--on-surface)] font-mono text-[1.6rem] text-[var(--bg)]">{initials}</span>
          <StatusBadge label="Active admin" tone="active" />
        </div>
        <div className="min-w-0">
          <p className="label-caps text-[var(--primary)]">Operator identity</p>
          <h2 className="title-serif mt-3 text-[1.55rem] font-medium leading-tight text-[var(--on-surface)]">{profile.name}</h2>
          <p className="mt-1 text-[0.96rem] text-[var(--on-surface-dim)]">{profile.title}</p>
          <p className="mt-4 max-w-3xl text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">{profile.bio}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3"><InfoTile label="Email" value={user.email} /><InfoTile label="Location" value={profile.location} /><InfoTile label="Created" value={formatDate(user.createdAt)} /></div>
        </div>
      </div>
      <div className="grid border-t border-[var(--glass-border)] md:grid-cols-3">
        <BoundaryTile icon={IconLock} label="Commercial access" value="Full client invoice, developer payout, margin, reserve, and collection context." />
        <BoundaryTile icon={IconUserCircle} label="Identity access" value="User invites, role changes, auth intake, and access review controls." />
        <BoundaryTile icon={IconShieldCheck} label="Governance access" value="Audit reports, settings policy, support escalations, and proof controls." />
      </div>
    </section>
  );
}

function ProfileRoutingPanel({ profile }: { profile: AdminProfileState }) {
  return (
    <aside className="rounded-[1.6rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_7%,transparent)] sm:p-6">
      <SectionHeader eyebrow="Routing" title="Escalation profile" description="Critical admin signals route through these account-level controls before they become action queues." />
      <div className="mt-5 grid gap-3">
        <ContextTile icon={IconMail} label="Escalation email" value={profile.escalationEmail} />
        <ContextTile icon={IconClock} label="Coverage window" value={profile.notificationWindow} />
        <ContextTile icon={IconMapPin} label="Operating base" value={profile.location} />
      </div>
      <div className="mt-5 grid gap-3">{profileChannels.map((channel) => <ContextTile key={channel.label} icon={channel.icon} label={channel.label} value={channel.value} />)}</div>
    </aside>
  );
}

function SecuritySessions({ onInspect, onRevoke, onTrust, sessions }: { onInspect: (session: SecuritySession) => void; onRevoke: (session: SecuritySession) => void; onTrust: (session: SecuritySession) => void; sessions: SecuritySession[] }) {
  return (
    <section className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] sm:p-6">
      <SectionHeader eyebrow="Security" title="Active admin sessions" description="Review devices with privileged admin access and revoke anything that should not retain command permissions." />
      <div className="mt-5 grid gap-3">
        {sessions.map((session) => (
          <article key={session.id} className="grid gap-4 rounded-[1.25rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><StatusBadge label={session.trusted ? "Trusted" : "Review"} tone={session.trusted ? "active" : "overdue"} /><span className="rounded-full border border-[var(--glass-border)] px-2.5 py-1 font-mono text-[0.68rem] text-[var(--on-surface-dim)]">{session.lastSeen}</span></div>
              <h3 className="mt-3 text-[0.98rem] font-medium text-[var(--on-surface)]">{session.device}</h3>
              <p className="mt-1 text-[0.82rem] text-[var(--on-surface-dim)]">{session.location} / {session.ip}</p>
            </div>
            <div className="flex flex-wrap gap-2"><ActionButton icon={IconDeviceLaptop} onClick={() => onInspect(session)}>Inspect</ActionButton>{!session.trusted && <ActionButton icon={IconCheck} onClick={() => onTrust(session)}>Trust</ActionButton>}<ActionButton danger icon={IconTrash} onClick={() => onRevoke(session)}>Revoke</ActionButton></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SecurityPanel({ stats }: { stats: ReturnType<typeof buildProfileStats> }) {
  return (
    <aside className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] sm:p-6">
      <SectionHeader eyebrow="Controls" title="Security posture" description="MFA, trusted device coverage, and route discipline for admin command." />
      <div className="mt-5 grid gap-3"><ContextTile icon={IconKey} label="MFA" value="Enabled" /><ContextTile icon={IconDeviceLaptop} label="Trusted devices" value={`${stats.trusted} / ${stats.total}`} /><ContextTile icon={IconShieldCheck} label="Route guard" value="Admin-only" /></div>
      <div className="mt-5"><DashboardBarChart data={[stats.trusted, stats.untrusted, stats.total]} height={180} labels={["Trusted", "Review", "Total"]} /></div>
    </aside>
  );
}

function SessionDrawer({ onRevoke, onTrust, session }: { onRevoke: () => void; onTrust: () => void; session: SecuritySession }) {
  return <div className="grid gap-5"><section className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><StatusBadge label={session.trusted ? "Trusted" : "Needs review"} tone={session.trusted ? "active" : "overdue"} /><h2 className="title-serif mt-3 text-[1.25rem] font-medium text-[var(--on-surface)]">{session.device}</h2><p className="mt-2 text-[0.9rem] text-[var(--on-surface-dim)]">{session.location} / {session.ip}</p></div><div className="flex flex-wrap gap-2">{!session.trusted && <ActionButton icon={IconCheck} onClick={onTrust}>Trust device</ActionButton>}<ActionButton danger icon={IconTrash} onClick={onRevoke}>Revoke</ActionButton></div></div></section><section className="grid gap-4 md:grid-cols-3"><InfoTile label="Last seen" value={session.lastSeen} /><InfoTile label="Location" value={session.location} /><InfoTile label="IP address" value={session.ip} /></section></div>;
}

function EditProfileModal({ onClose, onSubmit, open, profile }: { onClose: () => void; onSubmit: (profile: AdminProfileState) => void; open: boolean; profile: AdminProfileState }) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  if (!open) return null;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({ bio: String(form.get("bio") ?? profile.bio), escalationEmail: String(form.get("escalationEmail") ?? profile.escalationEmail), location: String(form.get("location") ?? profile.location), name: String(form.get("name") ?? profile.name), notificationWindow: String(form.get("notificationWindow") ?? profile.notificationWindow), phone: String(form.get("phone") ?? profile.phone), title: String(form.get("title") ?? profile.title) });
  };
  return <ModalShell onClose={onClose}><form onSubmit={submit} className="w-full max-w-3xl rounded-[1.65rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:p-6"><ModalHeader title="Edit admin profile" onClose={onClose} /><div className="mt-6 grid gap-4 border-t border-[var(--glass-border)] pt-6 sm:grid-cols-2"><FormInput ref={firstInputRef} defaultValue={profile.name} label="Name" name="name" /><FormInput defaultValue={profile.title} label="Title" name="title" /><FormInput defaultValue={profile.escalationEmail} label="Escalation email" name="escalationEmail" /><FormInput defaultValue={profile.phone} label="Phone" name="phone" /><FormInput defaultValue={profile.location} label="Location" name="location" /><FormInput defaultValue={profile.notificationWindow} label="Notification window" name="notificationWindow" /><label className="grid gap-2 sm:col-span-2"><span className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">Bio</span><textarea name="bio" defaultValue={profile.bio} rows={4} className="resize-none rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-3 text-[0.9rem] text-[var(--on-surface)] outline-none" /></label></div><ModalActions onClose={onClose} submitLabel="Save profile" /></form></ModalShell>;
}

function ChartPanel({ children, description, title, value }: { children: ReactNode; description: string; title: string; value: string }) {
  return <article className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]"><div className="flex items-start justify-between gap-4"><div><h2 className="title-serif text-[1rem] font-medium text-[var(--on-surface)]">{title}</h2><p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">{description}</p></div><span className="rounded-full border border-[var(--glass-border)] px-3 py-1.5 font-mono text-[0.72rem] text-[var(--on-surface)]">{value}</span></div><div className="mt-5">{children}</div></article>;
}

function BoundaryTile({ icon: Icon, label, value }: { icon: Icon; label: string; value: string }) {
  return <div className="grid gap-3 border-b border-[var(--glass-border)] p-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"><span className="grid h-10 w-10 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)] text-[var(--secondary)]"><Icon size={18} stroke={1.7} /></span><div><p className="text-[0.84rem] font-medium text-[var(--on-surface)]">{label}</p><p className="mt-1.5 text-[0.78rem] leading-relaxed text-[var(--on-surface-dim)]">{value}</p></div></div>;
}

function ContextTile({ icon: Icon, label, value }: { icon: Icon; label: string; value: string }) {
  return <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3"><span className="grid h-9 w-9 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] text-[var(--secondary)]"><Icon size={16} stroke={1.7} /></span><div className="min-w-0"><p className="text-[0.84rem] font-medium text-[var(--on-surface)]">{label}</p><p className="mt-1 truncate font-mono text-[0.78rem] text-[var(--on-surface-dim)]">{value}</p></div></div>;
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3"><p className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">{label}</p><p className="mt-1.5 truncate font-mono text-[0.9rem] text-[var(--on-surface)]">{value}</p></div>;
}

function SectionHeader({ description, eyebrow, title }: { description: string; eyebrow: string; title: string }) {
  return <div><p className="label-caps text-[var(--primary)]">{eyebrow}</p><h2 className="title-serif mt-2 text-[clamp(1.48rem,2vw,1.9rem)] font-medium text-[var(--on-surface)]">{title}</h2><p className="mt-2 max-w-2xl text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">{description}</p></div>;
}

function ActionButton({ children, danger = false, icon: Icon, onClick }: { children: ReactNode; danger?: boolean; icon: Icon; onClick?: () => void }) {
  return <button type="button" disabled={!onClick} onClick={onClick} className={cn("inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 text-[0.76rem] font-medium transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50", danger ? "border-[color-mix(in_srgb,var(--error)_30%,transparent)] text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]" : "border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]")}><Icon size={13} stroke={1.8} />{children}</button>;
}

function buildProfileStats(sessions: SecuritySession[]) {
  const trusted = sessions.filter((session) => session.trusted).length;
  const untrusted = sessions.length - trusted;
  return { securityScore: Math.max(0, 96 - untrusted * 12), total: sessions.length, trusted, untrusted };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function ModalShell({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-[90] grid place-items-center bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-6 backdrop-blur-xl" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>{children}</div>;
}

function ModalHeader({ onClose, title }: { onClose: () => void; title: string }) {
  return <div className="flex items-start justify-between gap-4"><div><p className="label-caps text-[var(--primary)]">Admin identity</p><h2 className="title-serif mt-2 text-[1.2rem] font-medium text-[var(--on-surface)]">{title}</h2></div><button type="button" onClick={onClose} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]" aria-label="Close modal"><IconX size={18} stroke={1.6} /></button></div>;
}

const FormInput = forwardRef<HTMLInputElement, { defaultValue?: string; label: string; name: string }>(function FormInput({ defaultValue, label, name }, ref) {
  return <label className="grid gap-2"><span className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--on-surface-dim)]">{label}</span><input ref={ref} name={name} defaultValue={defaultValue} className="h-11 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.9rem] text-[var(--on-surface)] outline-none" /></label>;
});

function ModalActions({ onClose, submitLabel }: { onClose: () => void; submitLabel: string }) {
  return <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[var(--glass-border)] pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="min-h-10 cursor-pointer rounded-full border border-[var(--glass-border)] px-5 text-[0.9rem] font-medium text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]">Cancel</button><button type="submit" className="min-h-10 cursor-pointer rounded-full bg-[var(--on-surface)] px-5 text-[0.9rem] font-medium text-[var(--bg)]">{submitLabel}</button></div>;
}
