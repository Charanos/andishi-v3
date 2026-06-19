"use client";

import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

interface DualTrackCTAProps {
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  context?: string;
}

export function DualTrackCTA({
  primaryLabel = "Start a Project",
  primaryHref = "/start-project",
  secondaryLabel = "Hire an Engineer",
  secondaryHref = "/hire",
  context,
}: DualTrackCTAProps) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-6">
      {context && (
        <span className="text-[11px] font-[500] uppercase tracking-[0.15em] text-[var(--on-surface-dim)]">
          {context}
        </span>
      )}
      <div className="flex flex-wrap justify-center items-center gap-3">
        <Link
          href={primaryHref}
          className="inline-flex min-h-[2.4rem] items-center justify-center gap-2 rounded-full border border-transparent bg-[var(--on-surface)] px-8 py-3.5 text-[15px] font-[500] tracking-[0.02em] text-[var(--bg)] no-underline shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_22px_52px_color-mix(in_srgb,var(--bg-deep)_48%,transparent)] active:scale-[0.98]"
        >
          {primaryLabel}
          <IconArrowRight size={16} stroke={1.8} />
        </Link>
        <Link
          href={secondaryHref}
          className="inline-flex min-h-[2.4rem] items-center justify-center rounded-full border border-[#d0bcff]/25 bg-white/[0.05] px-7 py-3 text-[15px] font-[500] tracking-[0.02em] text-[#d0bcff] no-underline backdrop-blur-sm transition-all duration-300 hover:-translate-y-px hover:border-[#4cd7f6]/50 hover:bg-[#d0bcff]/[0.08] hover:shadow-[0_0_20px_rgba(76,215,246,0.15)] active:scale-[0.98]"
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
