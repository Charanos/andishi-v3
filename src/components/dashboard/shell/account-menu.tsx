"use client";

import Link from "next/link";
import { IconLogout, IconSettings, IconUserCircle, IconWorld } from "@tabler/icons-react";
import { signOutAction } from "@/app/(app)/actions";
import { useDetailsPopover } from "@/components/dashboard/shell/use-details-popover";
import type { AuthUser } from "@/types/auth";
import { roleHome, roleNames } from "@/types/auth";

export function AccountMenu({ user }: { user: AuthUser }) {
  const popoverRef = useDetailsPopover();
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <details ref={popoverRef} className="group relative">
      <summary
        className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--surface)] font-mono text-[0.72rem] text-[var(--on-surface)] transition-colors duration-300 hover:border-[color-mix(in_srgb,var(--secondary)_34%,transparent)]"
        aria-label="Open account menu"
      >
        <span>{initials}</span>
      </summary>
      <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-2 shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)]">
        <div className="px-3 py-3">
          <p className="truncate text-[0.9rem] font-medium text-[var(--on-surface)]">{user.name}</p>
          <p className="mt-1 truncate font-mono text-[0.72rem] text-[var(--on-surface-dim)]">{user.email}</p>
          <p className="mt-2 w-fit rounded-full border border-[var(--glass-border)] px-2.5 py-1 text-[0.72rem] text-[var(--secondary)]">
            {roleNames[user.role]}
          </p>
        </div>
        <MenuLink href={profileHref(user.role)} icon={<IconUserCircle size={17} stroke={1.6} />}>
          View profile
        </MenuLink>
        <MenuLink href={`${roleHome[user.role]}/settings`} icon={<IconSettings size={17} stroke={1.6} />}>
          Settings
        </MenuLink>
        <MenuLink href="/" icon={<IconWorld size={17} stroke={1.6} />}>
          Public site
        </MenuLink>
        <div className="my-2 h-px bg-[var(--glass-border)]" />
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[0.86rem] text-[var(--on-surface-dim)] transition-colors duration-300 hover:bg-[color-mix(in_srgb,#f85149_10%,transparent)] hover:text-[color-mix(in_srgb,#f85149_86%,var(--on-surface))]"
          >
            <IconLogout size={17} stroke={1.6} />
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}

function profileHref(role: AuthUser["role"]) {
  if (role === "admin") return "/admin/profile";
  if (role === "developer") return "/dev/profile";
  return "/dashboard/settings";
}

function MenuLink({
  children,
  href,
  icon,
}: {
  children: React.ReactNode;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[0.86rem] text-[var(--on-surface-dim)] transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--on-surface)_7%,transparent)] hover:text-[var(--on-surface)]"
    >
      {icon}
      {children}
    </Link>
  );
}
