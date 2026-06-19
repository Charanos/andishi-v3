"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconArrowRight,
  IconCommand,
  IconSearch,
  IconSparkles,
  IconX,
} from "@tabler/icons-react";
import { roleNav } from "@/data/dashboard";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";

type CommandMenuProps = {
  className?: string;
  compact?: boolean;
  role: AuthUser["role"];
};

type CommandItem = {
  group: string;
  href: string;
  label: string;
  parent?: string;
};

const placeholders: Record<AuthUser["role"], string> = {
  admin: "Search clients, engineers, briefs, payments...",
  client: "Search briefs, profiles, projects, messages...",
  developer: "Search projects, time, earnings, messages...",
};

const roleHints: Record<AuthUser["role"], string[]> = {
  admin: ["payments", "audit", "users", "shortlists"],
  client: ["brief", "profiles", "payments", "support"],
  developer: ["time", "earnings", "profile", "support"],
};

export function CommandMenu({ className, compact = false, role }: CommandMenuProps) {
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const commands = useMemo(() => flattenRoleCommands(role), [role]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;
    return commands.filter((item) =>
      `${item.label} ${item.group} ${item.parent ?? ""} ${item.href}`
        .toLowerCase()
        .includes(needle),
    );
  }, [commands, query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-full border border-[var(--glass-border)] bg-[var(--surface)] text-left text-[0.9rem] text-[var(--on-surface-dim)] shadow-[0_12px_35px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] transition-colors duration-300 hover:text-[var(--on-surface)]",
          compact ? "min-h-10 w-full px-3" : "min-h-12 min-w-[18rem] px-4",
          className,
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open command search"
      >
        <IconSearch size={17} stroke={1.65} />
        <span className="min-w-0 flex-1 truncate">{placeholders[role]}</span>
        <span className="rounded-md border border-[var(--glass-border)] px-1.5 py-0.5 font-mono text-[0.68rem]">
          Ctrl K
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[95] grid place-items-start bg-[color-mix(in_srgb,var(--bg-deep)_72%,transparent)] px-3 py-20 backdrop-blur-xl sm:px-6 lg:py-28"
          role="dialog"
          aria-modal="true"
          aria-label="Command search"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_42%,transparent)]">
            <div className="flex items-center gap-3 border-b border-[var(--glass-border)] px-4 py-3">
              <IconSearch size={18} stroke={1.7} className="shrink-0 text-[var(--secondary)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholders[role]}
                className="h-11 min-w-0 flex-1 bg-transparent text-[0.98rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)]"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
                aria-label="Close command search"
              >
                <IconX size={16} stroke={1.7} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-[var(--glass-border)] px-4 py-3">
              {roleHints[role].map((hint) => (
                <button
                  key={hint}
                  type="button"
                  onClick={() => setQuery(hint)}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--glass-border)] px-3 text-[0.76rem] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
                >
                  <IconSparkles size={12} stroke={1.7} />
                  {hint}
                </button>
              ))}
            </div>

            <div className="max-h-[min(29rem,calc(100dvh-16rem))] overflow-y-auto p-2">
              {filtered.length ? (
                filtered.map((item) => {
                  const active = commandPathMatches(item.href, pathname);
                  return (
                    <Link
                      key={`${item.href}-${item.label}`}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-200",
                        active
                          ? "bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--on-surface)]"
                          : "text-[var(--on-surface-dim)] hover:bg-[color-mix(in_srgb,var(--on-surface)_6%,transparent)] hover:text-[var(--on-surface)]",
                      )}
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--secondary)]">
                        <IconCommand size={15} stroke={1.7} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[0.9rem] font-medium">{item.label}</span>
                        <span className="mt-1 block truncate font-mono text-[0.68rem] text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)]">
                          {item.parent ? `${item.parent} / ${item.group}` : item.group}
                        </span>
                      </span>
                      <IconArrowRight
                        size={15}
                        stroke={1.8}
                        className="text-[var(--on-surface-dim)] transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </Link>
                  );
                })
              ) : (
                <div className="px-5 py-10 text-center">
                  <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">No matching command</p>
                  <p className="mt-2 text-[0.82rem] text-[var(--on-surface-dim)]">
                    Try a page, workflow, client, billing, or support term.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function commandPathMatches(href: string, pathname: string) {
  if (href === "/admin" || href === "/dashboard" || href === "/dev") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function flattenRoleCommands(role: AuthUser["role"]): CommandItem[] {
  return roleNav[role].flatMap((item) => {
    const parent: CommandItem = {
      group: item.group,
      href: item.href,
      label: item.label,
    };
    const children =
      item.children?.map((child) => ({
        group: item.group,
        href: child.href,
        label: child.label,
        parent: item.label,
      })) ?? [];
    return [parent, ...children];
  });
}
