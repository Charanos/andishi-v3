import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  glow?: "violet" | "cyan" | "amber" | "none";
  bento?: boolean;
};

const glowBorders: Record<string, string> = {
  violet: "rgba(111,75,170,0.22)",
  cyan:   "rgba(0,198,251,0.22)",
  amber:  "rgba(255,184,105,0.22)",
  none:   "transparent",
};

const glowShadows: Record<string, string> = {
  violet: "0 0 0 1px rgba(111,75,170,0.12), 0 1px 2px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08)",
  cyan:   "0 0 0 1px rgba(0,198,251,0.12),  0 1px 2px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08)",
  amber:  "0 0 0 1px rgba(255,184,105,0.12), 0 1px 2px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08)",
  none:   "0 1px 2px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.06)",
};

export function GlassCard({
  children,
  className,
  glow = "none",
  bento = false,
  style,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl transition-all duration-300",
        bento ? "p-5 sm:p-7" : "p-6 sm:p-8",
        className,
      )}
      style={{
        backgroundColor: "var(--glass-bg)",
        border:          `1px solid ${glowBorders[glow] ?? "var(--glass-border)"}`,
        backdropFilter:  "blur(24px)",
        boxShadow:       glowShadows[glow] ?? glowShadows.none,
        /* Neumorphic inner highlight — top-left light catch */
        backgroundImage: `linear-gradient(135deg,
          color-mix(in srgb, var(--glass-highlight) 60%, transparent) 0%,
          transparent 50%,
          color-mix(in srgb, var(--surface-high) 18%, transparent) 100%)`,
        ...style,
      }}
      {...props}
    >
      {/* Subtle inner border glow */}
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.04)",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
