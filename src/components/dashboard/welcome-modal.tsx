"use client";

import { useState } from "react";
import { IconX } from "@tabler/icons-react";
import type { DashboardRole } from "@/data/dashboard";
import { roleLabels } from "@/data/dashboard";

export function WelcomeModal({ role }: { role: DashboardRole }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[color-mix(in_srgb,var(--bg-deep)_78%,transparent)] p-5 backdrop-blur-xl">
      <div className="relative w-full max-w-xl rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--surface)] p-6 shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_38%,transparent)]">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)]"
          aria-label="Close welcome"
        >
          <IconX size={17} stroke={1.7} />
        </button>
        <p className="label-caps text-[var(--secondary)]">Welcome</p>
        <h2 className="mt-4 text-[clamp(2rem,7vw,3.4rem)] font-normal leading-[1] tracking-tight text-[var(--on-surface)]">
          {roleLabels[role]}
        </h2>
        <p className="body-md mt-5 text-[var(--on-surface-dim)]">
          This workspace is ready for the next activation step. Review the checklist, open the highest-signal page, and keep the handoff moving.
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-7 rounded-full bg-[var(--on-surface)] px-5 py-2.5 text-[0.94rem] font-medium text-[var(--bg)]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
