"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBuildingSkyscraper,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCode,
  IconDots,
  IconGridDots,
  IconLogout,
  IconSettings,
  IconShieldCheck,
  IconX,
  type Icon,
} from "@tabler/icons-react";
import { signOutAction } from "@/app/(app)/actions";
import { Logo } from "@/components/brand/logo";
import { CommandMenu } from "@/components/dashboard/shell/command-menu";
import { useDashboardShell } from "@/components/dashboard/shell/app-shell";
import { roleNav, type DashboardNavItem } from "@/data/dashboard";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";

type RoleMeta = {
  context: string;
  gradientColor: string;
  icon: Icon;
  pillClassName: string;
  pulseClassName: string;
  subtitle: string;
};

const roleMeta: Record<AuthUser["role"], RoleMeta> = {
  admin: {
    context: "Command",
    gradientColor: "var(--secondary)",
    icon: IconShieldCheck,
    pillClassName:
      "border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]",
    pulseClassName: "bg-[var(--secondary)] shadow-[0_0_8px_var(--secondary)]",
    subtitle: "Admin Console",
  },
  client: {
    context: "Workspace",
    gradientColor: "var(--tertiary)",
    icon: IconBuildingSkyscraper,
    pillClassName:
      "border-[color-mix(in_srgb,var(--tertiary)_24%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] text-[var(--tertiary)]",
    pulseClassName: "bg-[var(--tertiary)] shadow-[0_0_8px_var(--tertiary)]",
    subtitle: "Client Portal",
  },
  developer: {
    context: "Workbench",
    gradientColor: "var(--primary)",
    icon: IconCode,
    pillClassName:
      "border-[color-mix(in_srgb,var(--primary)_24%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]",
    pulseClassName: "bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]",
    subtitle: "Developer Portal",
  },
};

export function RoleSidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const {
    closeMobileNav,
    collapsed,
    mobileNavOpen,
    openMobileNav,
    toggleCollapsed,
  } = useDashboardShell();
  const role = user.role;
  const items = roleNav[role];
  const meta = roleMeta[role];

  useEffect(() => {
    closeMobileNav();
  }, [closeMobileNav, pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileNav();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeMobileNav, mobileNavOpen]);

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 hidden h-svh shrink-0 flex-col overflow-visible border-r border-[var(--dashboard-sidebar-border)] bg-[var(--dashboard-sidebar)] text-[var(--dashboard-sidebar-text)] transition-[width] duration-300 ease-out lg:flex",
          collapsed ? "w-[5.7rem]" : "w-[17.5rem]",
        )}
      >
        {/* <SidebarAtmosphere color={meta.gradientColor} /> */}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="absolute -right-4 top-8 z-[80] grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--surface)] text-[var(--on-surface-dim)] shadow-[0_10px_24px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)] transition-colors duration-200 hover:text-[var(--on-surface)]"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <IconChevronRight size={13} stroke={2.2} />
          ) : (
            <IconChevronLeft size={13} stroke={2.2} />
          )}
        </button>
        <SidebarContent
          collapsed={collapsed}
          items={items}
          meta={meta}
          pathname={pathname}
          role={role}
          user={user}
        />
      </aside>

      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-[70] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard navigation"
        >
          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeMobileNav}
            className="absolute inset-0 bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] backdrop-blur-xl"
          />
          <aside className="relative flex h-full w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden border-r border-[var(--dashboard-sidebar-border)] bg-[var(--dashboard-sidebar)] shadow-[0_0_80px_color-mix(in_srgb,var(--bg-deep)_50%,transparent)]">
            <SidebarAtmosphere color={meta.gradientColor} />
            <button
              type="button"
              onClick={closeMobileNav}
              className="absolute right-4 top-4 z-20 grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[var(--dashboard-sidebar-border)] text-[var(--dashboard-sidebar-muted)] transition-colors duration-200 hover:text-[var(--dashboard-sidebar-text)]"
              aria-label="Close navigation"
            >
              <IconX size={16} stroke={1.8} />
            </button>
            <SidebarContent
              collapsed={false}
              items={items}
              meta={meta}
              pathname={pathname}
              role={role}
              showSearch
              user={user}
            />
          </aside>
        </div>
      )}

      <MobileBottomNav
        items={items.slice(0, 5)}
        onOpen={openMobileNav}
        pathname={pathname}
      />
    </>
  );
}

function SidebarContent({
  collapsed,
  items,
  meta,
  pathname,
  role,
  showSearch = false,
  user,
}: {
  collapsed: boolean;
  items: DashboardNavItem[];
  meta: RoleMeta;
  pathname: string;
  role: AuthUser["role"];
  showSearch?: boolean;
  user: AuthUser;
}) {
  const initials = getInitials(user.name);
  const grouped = useMemo(() => groupItems(items), [items]);
  const activeGroups = useMemo(
    () =>
      grouped
        .filter(([, groupItems]) =>
          groupItems.some((item) => isItemActive(item, pathname)),
        )
        .map(([group]) => group),
    [grouped, pathname],
  );
  const [selectedGroup, setSelectedGroup] = useState<string | null | undefined>(
    undefined,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const RoleIcon = meta.icon;
  const openGroup =
    selectedGroup === undefined ? (activeGroups[0] ?? null) : selectedGroup;

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnPointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnPointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const toggleGroup = (group: string) => {
    setSelectedGroup((current) => {
      const visibleGroup =
        current === undefined ? (activeGroups[0] ?? null) : current;
      return visibleGroup === group ? null : group;
    });
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden p-4">
      <div
        className={cn(
          "flex shrink-0 items-center pb-3",
          collapsed ? "justify-center" : "gap-3",
        )}
      >
        <Link
          href="/"
          aria-label="Andishi home"
          className="text-[var(--dashboard-sidebar-text)]"
        >
          <Logo
            showWordmark={!collapsed}
            wordmarkClassName="text-[var(--dashboard-sidebar-text)]"
          />
        </Link>
      </div>

      <SidebarSeparator className="mb-4" />

      {collapsed ? (
        <div className="mb-4 flex shrink-0 justify-center">
          <div
            className={cn(
              "grid h-9 w-9 place-items-center rounded-xl border",
              meta.pillClassName,
            )}
            title={meta.subtitle}
            aria-label={meta.subtitle}
          >
            <RoleIcon size={15} stroke={1.9} />
          </div>
        </div>
      ) : (
        <div className="mb-4 flex shrink-0 items-center gap-2.5 rounded-xl border border-[var(--dashboard-sidebar-border)] bg-[var(--dashboard-sidebar-elevated)] px-3 py-2.5 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--dashboard-sidebar-text)_5%,transparent)]">
          <div
            className={cn(
              "grid h-7 w-7 shrink-0 place-items-center rounded-lg border",
              meta.pillClassName,
            )}
          >
            <RoleIcon size={13} stroke={1.9} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="label-caps text-[0.59rem] tracking-[0.16em] text-[var(--dashboard-sidebar-faint)]">
              {meta.context}
            </p>
            <p className="mt-0.5 truncate text-[0.78rem] font-medium text-[var(--dashboard-sidebar-text)]">
              {meta.subtitle}
            </p>
          </div>
          <span
            aria-hidden
            className={cn(
              "h-1.5 w-1.5 shrink-0 animate-pulse rounded-full",
              meta.pulseClassName,
            )}
          />
        </div>
      )}

      <SidebarSeparator className="mb-4" />

      {showSearch && !collapsed && (
        <div className="mb-4 shrink-0 lg:hidden">
          <CommandMenu
            compact
            role={role}
            className="border-[var(--dashboard-sidebar-border)] bg-[var(--dashboard-sidebar-elevated)] text-[var(--dashboard-sidebar-muted)] shadow-none hover:text-[var(--dashboard-sidebar-text)]"
          />
        </div>
      )}

      {collapsed ? (
        <CollapsedNav items={items} pathname={pathname} role={role} />
      ) : (
        <ExpandedNav
          grouped={grouped}
          onToggleGroup={toggleGroup}
          openGroup={openGroup}
          pathname={pathname}
          role={role}
        />
      )}

      <MissionBadge
        collapsed={collapsed}
        initials={initials}
        menuOpen={menuOpen}
        meta={meta}
        menuRef={menuRef}
        onToggleMenu={() => setMenuOpen((value) => !value)}
        role={role}
        user={user}
      />
    </div>
  );
}

function ExpandedNav({
  grouped,
  onToggleGroup,
  openGroup,
  pathname,
  role,
}: {
  grouped: Array<[string, DashboardNavItem[]]>;
  onToggleGroup: (group: string) => void;
  openGroup: string | null;
  pathname: string;
  role: AuthUser["role"];
}) {
  return (
    <nav className="flex-1 overflow-y-auto pr-1" aria-label="Main navigation">
      {grouped.map(([group, groupItems], groupIndex) => {
        const groupOpen = openGroup === group;

        return (
          <div
            key={group}
            className={cn(
              "py-2",
              groupIndex === 0 ? "pt-0" : "pt-3",
              groupIndex > 0 &&
                "border-t border-[var(--dashboard-sidebar-border)]",
            )}
          >
            <button
              type="button"
              onClick={() => onToggleGroup(group)}
              aria-expanded={groupOpen}
              className="mb-1.5 flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors duration-200 hover:bg-[var(--dashboard-sidebar-hover)]"
            >
              <span className="h-px w-4 bg-[color-mix(in_srgb,var(--dashboard-sidebar-faint)_54%,transparent)]" />
              <span className="label-caps flex-1 text-[0.63rem] tracking-[0.15em] text-[var(--dashboard-sidebar-faint)]">
                {group}
              </span>
              <span className="font-mono text-[0.62rem] tabular-nums text-[var(--dashboard-sidebar-faint)] opacity-55">
                {groupItems.length.toString().padStart(2, "0")}
              </span>
              <IconChevronDown
                size={11}
                stroke={2.2}
                className={cn(
                  "shrink-0 text-[var(--dashboard-sidebar-faint)] transition-transform duration-300",
                  groupOpen && "rotate-180",
                )}
              />
            </button>

            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-in-out",
                groupOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0 space-y-0.5 overflow-hidden">
                {groupItems.map((item) => (
                  <SidebarNavItem
                    key={`${item.href}-${item.label}`}
                    item={item}
                    pathname={pathname}
                    role={role}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function SidebarNavItem({
  item,
  pathname,
  role,
}: {
  item: DashboardNavItem;
  pathname: string;
  role: AuthUser["role"];
}) {
  const active = isItemActive(item, pathname);
  const Icon = item.icon;
  const signal = getNavSignal(item, role);

  return (
    <div>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex min-h-[2.6rem] w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-[0.86rem] font-medium transition-colors duration-200",
          active
            ? "bg-[var(--dashboard-sidebar-active)] text-[var(--dashboard-sidebar-text)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--secondary)_10%,transparent)]"
            : "text-[var(--dashboard-sidebar-muted)] hover:bg-[var(--dashboard-sidebar-hover)] hover:text-[var(--dashboard-sidebar-text)]",
        )}
      >
        {active && (
          <span
            className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-[var(--secondary)]"
            style={{ boxShadow: "0 0 10px var(--secondary)" }}
          />
        )}
        <span className="relative grid h-5 w-5 shrink-0 place-items-center transition-transform duration-200 group-hover:translate-x-0.5">
          <Icon
            size={17}
            stroke={active ? 2 : 1.5}
            className={
              active
                ? "text-[var(--secondary)] drop-shadow-[0_0_7px_var(--secondary)]"
                : undefined
            }
          />
          {signal && (
            <span
              className={cn(
                "absolute -right-1 -top-0.5 h-1.5 w-1.5 rounded-full",
                signal === "live"
                  ? "bg-[var(--tertiary)]"
                  : "bg-[var(--secondary)]",
              )}
            />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate transition-transform duration-200 group-hover:translate-x-0.5">
          {item.label}
        </span>
      </Link>

      {active && item.children?.length ? (
        <div className="ml-9 mt-1.5 grid gap-1 border-l border-[var(--dashboard-sidebar-border)] pb-1.5 pl-3">
          {item.children.map((child) => {
            const childActive = pathMatches(child.href, pathname);
            return (
              <Link
                key={child.href}
                href={child.href}
                aria-current={childActive ? "page" : undefined}
                className={cn(
                  "block cursor-pointer rounded-lg px-2.5 py-2 text-[0.82rem] font-medium leading-none tracking-[-0.01em] transition-colors duration-200",
                  childActive
                    ? "bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]"
                    : "text-[color-mix(in_srgb,var(--dashboard-sidebar-text)_72%,transparent)] hover:bg-[var(--dashboard-sidebar-hover)] hover:text-[var(--dashboard-sidebar-text)]",
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function CollapsedNav({
  items,
  pathname,
  role,
}: {
  items: DashboardNavItem[];
  pathname: string;
  role: AuthUser["role"];
}) {
  return (
    <nav
      className="flex-1 space-y-1 overflow-hidden"
      aria-label="Main navigation"
    >
      {items.map((item) => {
        const active = isItemActive(item, pathname);
        const Icon = item.icon;
        const signal = getNavSignal(item, role);

        return (
          <Link
            key={`${item.href}-${item.label}-collapsed`}
            href={item.href}
            title={item.label}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative mx-auto grid h-10 w-10 cursor-pointer place-items-center rounded-xl transition-colors duration-200",
              active
                ? "bg-[var(--dashboard-sidebar-active)] text-[var(--dashboard-sidebar-text)]"
                : "text-[var(--dashboard-sidebar-muted)] hover:bg-[var(--dashboard-sidebar-hover)] hover:text-[var(--dashboard-sidebar-text)]",
            )}
          >
            {active && (
              <span
                className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--secondary)]"
                style={{ boxShadow: "0 0 8px var(--secondary)" }}
              />
            )}
            <Icon
              size={17}
              stroke={active ? 2 : 1.5}
              className={cn(
                "transition-transform duration-200 group-hover:translate-x-0.5",
                active &&
                  "text-[var(--secondary)] drop-shadow-[0_0_7px_var(--secondary)]",
              )}
            />
            {(active || signal) && (
              <span
                className={cn(
                  "absolute right-2 top-2 rounded-full",
                  active
                    ? "h-1.5 w-1.5 bg-[var(--secondary)]"
                    : "h-1.5 w-1.5 bg-[var(--tertiary)]",
                )}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function MissionBadge({
  collapsed,
  initials,
  menuOpen,
  menuRef,
  meta,
  onToggleMenu,
  role,
  user,
}: {
  collapsed: boolean;
  initials: string;
  menuOpen: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  meta: RoleMeta;
  onToggleMenu: () => void;
  role: AuthUser["role"];
  user: AuthUser;
}) {
  return (
    <div className="mt-4 shrink-0">
      {collapsed ? (
        <div className="flex justify-center">
          <span
            className="relative grid h-10 w-10 place-items-center rounded-full bg-[var(--secondary)] font-mono text-[0.72rem] text-[var(--on-secondary)]"
            aria-label={user.name}
            title={`${user.name} - ${meta.subtitle}`}
          >
            {initials}
            <span
              className={cn(
                "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--dashboard-sidebar)]",
                meta.pulseClassName,
              )}
            />
          </span>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--dashboard-sidebar-border)] bg-[var(--dashboard-sidebar-elevated)] p-3">
          <div className="flex items-start gap-3">
            <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--secondary)] font-mono text-[0.74rem] text-[var(--on-secondary)]">
              {initials}
              <span
                className={cn(
                  "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--dashboard-sidebar-elevated)]",
                  meta.pulseClassName,
                )}
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.84rem] font-medium text-[var(--dashboard-sidebar-text)]">
                {user.name}
              </p>
              <p className="mt-0.5 truncate font-mono text-[0.67rem] text-[var(--dashboard-sidebar-muted)]">
                {user.email}
              </p>
            </div>
            <div ref={menuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={onToggleMenu}
                aria-label="User menu"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className={cn(
                  "grid h-7 w-7 cursor-pointer place-items-center rounded-full text-[var(--dashboard-sidebar-muted)] transition-colors duration-200 hover:bg-[var(--dashboard-sidebar-hover)] hover:text-[var(--dashboard-sidebar-text)]",
                  menuOpen &&
                    "bg-[var(--dashboard-sidebar-hover)] text-[var(--dashboard-sidebar-text)]",
                )}
              >
                <IconDots size={15} stroke={1.7} />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute bottom-9 right-0 z-20 w-48 overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--surface)] p-1 shadow-[0_16px_48px_color-mix(in_srgb,var(--bg-deep)_30%,transparent)]"
                >
                  <Link
                    href={settingsHref(role)}
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[0.82rem] text-[var(--on-surface-dim)] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--on-surface)_6%,transparent)] hover:text-[var(--on-surface)]"
                  >
                    <IconSettings size={14} stroke={1.6} />
                    Settings
                  </Link>
                  <div className="my-1 border-t border-[var(--glass-border)]" />
                  <form action={signOutAction}>
                    <button
                      role="menuitem"
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[0.82rem] text-[var(--on-surface-dim)] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--on-surface)_6%,transparent)] hover:text-[var(--on-surface)]"
                    >
                      <IconLogout size={14} stroke={1.6} />
                      Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileBottomNav({
  items,
  onOpen,
  pathname,
}: {
  items: DashboardNavItem[];
  onOpen: () => void;
  pathname: string;
}) {
  return (
    <nav
      className="fixed bottom-4 left-1/2 z-50 flex w-[min(32rem,calc(100vw-1.25rem))] -translate-x-1/2 items-center justify-between rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] p-1.5 shadow-[0_16px_48px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)] backdrop-blur-2xl lg:hidden"
      aria-label="Primary navigation"
    >
      {items.map((item) => {
        const active = isItemActive(item, pathname);
        const Icon = item.icon;

        return (
          <Link
            key={`${item.href}-mobile`}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-all duration-200 min-[390px]:h-11 min-[390px]:w-11",
              active
                ? "bg-[var(--on-surface)] text-[var(--bg)]"
                : "text-[var(--on-surface-dim)] hover:bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] hover:text-[var(--on-surface)]",
            )}
          >
            <Icon size={17} stroke={active ? 2 : 1.6} />
            {active && (
              <span
                className="absolute -bottom-0.5 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full bg-[var(--secondary)]"
                style={{ boxShadow: "0 0 6px var(--secondary)" }}
              />
            )}
          </Link>
        );
      })}
      <button
        type="button"
        aria-label="Open full navigation"
        onClick={onOpen}
        className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] hover:text-[var(--on-surface)] min-[390px]:h-11 min-[390px]:w-11"
      >
        <IconGridDots size={17} stroke={1.7} />
      </button>
    </nav>
  );
}

function SidebarAtmosphere({ color }: { color: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-60 opacity-[0.16]"
      style={{
        background: `radial-gradient(ellipse at 55% -15%, color-mix(in srgb, ${color} 50%, transparent), transparent 40%)`,
      }}
    />
  );
}

function SidebarSeparator({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-px shrink-0 bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--dashboard-sidebar-border)_85%,transparent),transparent)]",
        className,
      )}
    />
  );
}

function groupItems(items: DashboardNavItem[]) {
  const groups: Array<[string, DashboardNavItem[]]> = [];

  for (const item of items) {
    const existing = groups.find(([group]) => group === item.group);
    if (existing) {
      existing[1].push(item);
    } else {
      groups.push([item.group, [item]]);
    }
  }

  return groups;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getNavSignal(item: DashboardNavItem, role: AuthUser["role"]) {
  if (item.href.includes("support")) return "live";
  if (
    role === "admin" &&
    (item.href.includes("briefs") || item.href.includes("matches"))
  ) {
    return "attention";
  }
  if (role !== "admin" && item.href.includes("messages")) return "attention";
  return null;
}

function isItemActive(item: DashboardNavItem, pathname: string) {
  return (
    pathMatches(item.href, pathname) ||
    Boolean(item.children?.some((child) => pathMatches(child.href, pathname)))
  );
}

function pathMatches(href: string, pathname: string) {
  if (href === "/admin" || href === "/dashboard" || href === "/dev") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function settingsHref(role: AuthUser["role"]) {
  if (role === "admin") return "/admin/settings";
  if (role === "client") return "/dashboard/settings";
  return "/dev/settings";
}
