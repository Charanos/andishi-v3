"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconLifebuoy,
  IconMessageCircle,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";

type SupportMessage = {
  author: string;
  role: string;
  message: string;
  time: string;
};

export function FloatingSupportChat({ user }: { user: AuthUser }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      author: "Andishi Support",
      role: "Admin resolver",
      message:
        user.role === "client"
          ? "Tell us what you need on your brief, project, intro, or invoice. An admin resolver will pick it up."
          : "Tell us what you need on your project, timesheet, profile, or payout. An admin resolver will pick it up.",
      time: "Now",
    },
  ]);

  if (user.role === "admin") return null;

  const supportHref = user.role === "developer" ? "/dev/support" : "/dashboard/support";

  return (
    <div className="fixed bottom-24 right-4 z-50 lg:bottom-6 lg:right-6">
      {open && (
        <section className="mb-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[1.4rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] shadow-[0_24px_80px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)] backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--glass-border)] p-4">
            <div>
              <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">Andishi support</p>
              <p className="mt-1 text-[0.78rem] leading-relaxed text-[var(--on-surface-dim)]">
                Admin-resolved support for your active workspace.
              </p>
            </div>
            <button
              type="button"
              aria-label="Close support chat"
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
            >
              <IconX size={16} stroke={1.7} />
            </button>
          </div>

          <div className="grid max-h-72 gap-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <article
                key={`${message.time}-${index}`}
                className={cn(
                  "rounded-2xl border border-[var(--glass-border)] p-3",
                  message.author === user.name ? "ml-5 bg-[var(--on-surface)] text-[var(--bg)]" : "mr-5 bg-[var(--glass-bg)]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[0.8rem] font-medium">{message.author}</p>
                  <span className="font-mono text-[0.64rem] opacity-75">{message.time}</span>
                </div>
                <p className="mt-1 text-[0.66rem] uppercase tracking-[0.08em] opacity-75">{message.role}</p>
                <p className="mt-2 text-[0.82rem] leading-relaxed">{message.message}</p>
              </article>
            ))}
          </div>

          <form
            className="border-t border-[var(--glass-border)] p-3"
            onSubmit={(event) => {
              event.preventDefault();
              const message = draft.trim();
              if (!message) return;
              setMessages((current) => [
                ...current,
                { author: user.name, role: user.role, message, time: "Now" },
                {
                  author: "Andishi Support",
                  role: "Admin resolver",
                  message: "Received. This thread is visible to the admin support resolver.",
                  time: "Now",
                },
              ]);
              setDraft("");
            }}
          >
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Message admin support..."
                className="h-10 min-w-0 flex-1 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.84rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[var(--secondary)]"
              />
              <button
                type="submit"
                aria-label="Send support message"
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-[var(--on-surface)] text-[var(--bg)]"
              >
                <IconSend size={16} stroke={1.8} />
              </button>
            </div>
            <Link
              href={supportHref}
              className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-[0.78rem] font-medium text-[var(--secondary)]"
            >
              Open support workspace
              <IconArrowRight size={14} stroke={1.7} />
            </Link>
          </form>
        </section>
      )}

      <button
        type="button"
        aria-label="Open Andishi support chat"
        onClick={() => setOpen((value) => !value)}
        className="relative grid h-13 w-13 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--on-surface)] text-[var(--bg)] shadow-[0_18px_55px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)]"
      >
        <IconMessageCircle size={22} stroke={1.8} />
        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full border border-[var(--bg)] bg-[var(--secondary)] text-[var(--bg-deep)]">
          <IconLifebuoy size={12} stroke={2} />
        </span>
      </button>
    </div>
  );
}
