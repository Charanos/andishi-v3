"use client";

import { useState } from "react";
import {
  IconArrowRight,
  IconBriefcase,
  IconClock,
  IconLifebuoy,
  IconMessageCircle,
  IconSend,
  IconShieldCheck,
  IconUserCheck,
} from "@tabler/icons-react";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";

export function SupportWorkspacePage({ user }: { user: AuthUser }) {
  const [activeCase, setActiveCase] = useState("project");
  const [messages, setMessages] = useState([
    {
      author: "Andishi Support",
      role: "Admin resolver",
      message:
        "We can help with project delivery, matching, invoices, profile setup, timesheets, and payouts.",
      time: "09:20",
    },
    {
      author: user.name,
      role: user.role,
      message:
        user.role === "client"
          ? "I need confirmation on the next intro window for the AI support workflow."
          : "I need scope clarification before I estimate the next milestone.",
      time: "09:34",
    },
  ]);
  const [draft, setDraft] = useState("");

  const cases = [
    {
      id: "project",
      title:
        user.role === "client"
          ? "Project and intro support"
          : "Project scope support",
      detail: "Admin resolver attached to active project context.",
      status: "Open",
      icon: IconBriefcase,
    },
    {
      id: "account",
      title:
        user.role === "client"
          ? "Workspace and billing"
          : "Profile and payouts",
      detail: "Account operations with admin visibility.",
      status: "Waiting",
      icon: IconUserCheck,
    },
    {
      id: "urgent",
      title: "Escalation lane",
      detail: "High-priority thread routed to Andishi operations.",
      status: "Monitored",
      icon: IconShieldCheck,
    },
  ];

  return (
    <div className="grid gap-6 pb-12">
      <DashboardPageHeader
        title="Support"
        description="A direct support workspace connected to Andishi admin resolvers, with project and stakeholder context attached."
        status={<StatusBadge label="Admin resolver" tone="active" />}
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <article className="rounded-[1.45rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="label-caps text-[var(--secondary)]">Support Desk</p>
              <h1 className="title-serif mt-4 max-w-2xl text-[clamp(2.38rem,3.6vw,3.5rem)] font-normal leading-none text-[var(--on-surface)]">
                Admin-resolved workspace support
              </h1>
              <p className="mt-4 max-w-2xl text-[0.95rem] leading-[1.7] text-[var(--on-surface-dim)]">
                Keep questions tied to projects, invoices, profiles, matches,
                and delivery context so Andishi can resolve them cleanly.
              </p>
            </div>
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]">
              <IconLifebuoy size={26} stroke={1.7} />
            </span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["18m", "Median response"],
              ["3", "Open threads"],
              ["Admin", "Resolver"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4"
              >
                <p className="font-mono text-[1.4rem] text-[var(--on-surface)]">
                  {value}
                </p>
                <p className="mt-1 text-[0.8rem] text-[var(--on-surface-dim)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.45rem] border border-[var(--glass-border)] bg-[var(--surface)] p-5">
          <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
            Support routing
          </p>
          <div className="mt-4 grid gap-2">
            {cases.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveCase(item.id)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                  activeCase === item.id
                    ? "border-[color-mix(in_srgb,var(--secondary)_42%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)]"
                    : "border-[var(--glass-border)] bg-[var(--glass-bg)]",
                )}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]">
                  {(() => {
                    const CaseIcon = item.icon;
                    return <CaseIcon size={18} stroke={1.7} />;
                  })()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.86rem] font-medium text-[var(--on-surface)]">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-[0.76rem] leading-relaxed text-[var(--on-surface-dim)]">
                    {item.detail}
                  </span>
                </span>
                <StatusBadge
                  label={item.status}
                  tone={item.status === "Open" ? "pending" : "active"}
                />
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <article className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--glass-border)] p-4">
            <div>
              <p className="text-[1rem] font-medium text-[var(--on-surface)]">
                Support thread
              </p>
              <p className="mt-1 text-[0.82rem] text-[var(--on-surface-dim)]">
                Visible to you and the Andishi admin resolver.
              </p>
            </div>
            <IconMessageCircle
              className="text-[var(--secondary)]"
              size={21}
              stroke={1.7}
            />
          </div>
          <div className="grid max-h-[28rem] gap-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <article
                key={`${message.time}-${index}`}
                className={cn(
                  "max-w-[86%] rounded-2xl border p-3",
                  message.author === user.name
                    ? "ml-auto border-transparent bg-[var(--on-surface)] text-[var(--bg)]"
                    : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface)]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[0.82rem] font-medium">{message.author}</p>
                  <span className="font-mono text-[0.66rem] opacity-70">
                    {message.time}
                  </span>
                </div>
                <p className="mt-1 text-[0.66rem] uppercase tracking-[0.08em] opacity-70">
                  {message.role}
                </p>
                <p className="mt-2 text-[0.84rem] leading-relaxed">
                  {message.message}
                </p>
              </article>
            ))}
          </div>
          <form
            className="flex gap-2 border-t border-[var(--glass-border)] p-4"
            onSubmit={(event) => {
              event.preventDefault();
              const message = draft.trim();
              if (!message) return;
              setMessages((current) => [
                ...current,
                { author: user.name, role: user.role, message, time: "Now" },
              ]);
              setDraft("");
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Send a support update..."
              className="h-11 min-w-0 flex-1 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.88rem] text-[var(--on-surface)] outline-none focus:border-[var(--secondary)]"
            />
            <button
              type="submit"
              aria-label="Send support update"
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-[var(--on-surface)] text-[var(--bg)]"
            >
              <IconSend size={17} stroke={1.8} />
            </button>
          </form>
        </article>

        <article className="rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-4">
          <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
            Resolver context
          </p>
          <div className="mt-4 grid gap-3">
            {[
              ["Admin resolver", "Ian Mwangi"],
              [
                user.role === "client"
                  ? "Client workspace"
                  : "Developer workbench",
                user.name,
              ],
              ["Linked project", "AI support workflow"],
              ["SLA", "Same business day"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3"
              >
                <p className="text-[0.68rem] uppercase tracking-[0.08em] text-[var(--on-surface-dim)]">
                  {label}
                </p>
                <p className="mt-1 text-[0.86rem] font-medium text-[var(--on-surface)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-4 flex min-h-10 w-full cursor-pointer items-center justify-between rounded-full border border-[var(--glass-border)] px-4 text-[0.84rem] font-medium text-[var(--on-surface)]"
          >
            View all cases
            <IconArrowRight size={15} stroke={1.7} />
          </button>
          <p className="mt-4 inline-flex items-center gap-2 text-[0.78rem] text-[var(--on-surface-dim)]">
            <IconClock size={15} stroke={1.7} />
            Updates are mirrored to admin support.
          </p>
        </article>
      </section>
    </div>
  );
}
