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

const glowMap = {
  violet: "hover:shadow-[0_0_30px_rgba(208,188,255,0.12)] border-[rgba(208,188,255,0.12)]",
  cyan:   "hover:shadow-[0_0_30px_rgba(76,215,246,0.12)] border-[rgba(76,215,246,0.12)]",
  amber:  "hover:shadow-[0_0_30px_rgba(255,184,105,0.12)] border-[rgba(255,184,105,0.12)]",
};

export function ServiceCard({
  title,
  description,
  icon,
  timeline,
  href,
  glow = "violet",
}: ServiceCardProps) {
  return (
    <Link href={href} className="group block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0bcff]/50 rounded-xl">
      <div className={cn(
        "relative overflow-hidden rounded-xl p-8 h-full flex flex-col justify-between",
        "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]",
        "transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.14] hover:-translate-y-1",
        glowMap[glow]
      )}>
        {/* Subtle decorative inner gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#d0bcff]/[0.02] via-transparent to-[#4cd7f6]/[0.01] pointer-events-none rounded-xl" />

        <div>
          {/* Top line with Icon and Timeline chip */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] border border-white/[0.08] text-[var(--on-surface)] transition-transform duration-300 group-hover:scale-110">
              {icon}
            </div>
            {timeline && (
              <span className="inline-block px-2.5 py-0.5 rounded-full font-mono text-[11px] bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/20">
                {timeline}
              </span>
            )}
          </div>

          {/* Service Title */}
          <h3 className="text-[1.2rem] font-normal tracking-tight text-[var(--on-surface)] mb-3 group-hover:text-[var(--primary)] transition-colors duration-200">
            {title}
          </h3>

          {/* Description */}
          <p className="text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)] mb-6">
            {description}
          </p>
        </div>

        {/* Bottom indicator & link action */}
        <div className="mt-auto pt-4 border-t border-white/[0.05] flex items-center justify-between">
          <span className="text-[0.78rem] font-medium uppercase tracking-[0.1em] text-[var(--on-surface-dim)] group-hover:text-[var(--on-surface)] transition-colors duration-200">
            Learn More
          </span>
          <IconArrowRight size={16} stroke={1.8} className="text-[var(--on-surface-dim)] group-hover:text-[var(--on-surface)] group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </div>
    </Link>
  );
}
