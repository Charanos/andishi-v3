"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  timeline?: string;
  href: string;
  glow?: "violet" | "cyan" | "amber";
}

// Light-mode safe glow map — no raw cyan.
// "cyan" maps to --tertiary (dark-purple in light, cyan in dark).
const glowMap = {
  violet: {
    card: "group-hover:shadow-[0_16px_48px_color-mix(in_srgb,var(--primary)_14%,transparent)] group-hover:border-[color-mix(in_srgb,var(--primary)_28%,transparent)]",
    iconBg: "bg-[var(--primary-container)]",
    chip: "bg-[var(--primary-container)] text-[var(--primary)] border-[var(--glass-border)]",
    accentColor: "var(--primary)",
  },
  cyan: {
    card: "group-hover:shadow-[0_16px_48px_color-mix(in_srgb,var(--tertiary)_12%,transparent)] group-hover:border-[color-mix(in_srgb,var(--tertiary)_28%,transparent)]",
    iconBg: "bg-[var(--tertiary-container)]",
    chip: "bg-[var(--tertiary-container)] text-[var(--tertiary)] border-[var(--glass-border)]",
    accentColor: "var(--tertiary)",
  },
  amber: {
    card: "group-hover:shadow-[0_16px_48px_rgba(180,120,0,0.12)] group-hover:border-[rgba(200,140,0,0.28)]",
    iconBg: "bg-[rgba(200,140,0,0.10)]",
    chip: "bg-[rgba(200,140,0,0.10)] text-[rgba(120,75,0,0.90)] border-[rgba(200,140,0,0.22)]",
    accentColor: "rgba(120,75,0,0.9)",
  },
};

export function ServiceCard({
  title,
  description,
  icon,
  timeline,
  href,
  glow = "violet",
}: ServiceCardProps) {
  const accent = glowMap[glow];

  return (
    <Link
      href={href}
      className="group block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 rounded-[1.2rem]"
    >
      <div
        className={cn(
          "relative flex h-full flex-col justify-between overflow-hidden rounded-[1.2rem]",
          "border border-[var(--glass-border)] bg-[var(--glass-bg)] p-7 backdrop-blur-xl",
          "transition-all duration-300 group-hover:-translate-y-1",
          accent.card,
        )}
      >
        {/* subtle inner gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--primary-container)]/[0.04] via-transparent to-transparent rounded-[1.2rem]" />

        <div className="relative">
          {/* icon + timeline chip */}
          <div className="mb-5 flex items-start justify-between gap-3">
            <div
              className={cn(
                "grid h-10 w-10 place-items-center rounded-xl border border-[var(--glass-border)] transition-transform duration-300 group-hover:scale-105",
                accent.iconBg,
              )}
            >
              <span style={{ color: accent.accentColor }}>{icon}</span>
            </div>
            {timeline && (
              <span
                className={cn(
                  "inline-block rounded-full border px-2.5 py-0.5 font-mono text-[0.68rem]",
                  accent.chip,
                )}
              >
                {timeline}
              </span>
            )}
          </div>

          <h3 className="mb-2.5 text-[1.12rem] font-normal tracking-tight text-[var(--on-surface)] transition-colors duration-200 group-hover:text-[var(--primary)]">
            {title}
          </h3>

          <p className="text-[0.88rem] leading-[1.65] text-[var(--on-surface-dim)]">
            {description}
          </p>
        </div>

        <div className="relative mt-6 flex items-center justify-between border-t border-[var(--glass-border)] pt-4">
          <span className="text-[0.76rem] tracking-[0.07em] text-[var(--on-surface-dim)] transition-colors duration-200 group-hover:text-[var(--on-surface)]">
            Learn more
          </span>
          <IconArrowRight
            size={15}
            stroke={1.8}
            className="text-[var(--on-surface-dim)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--on-surface)]"
          />
        </div>
      </div>
    </Link>
  );
}
