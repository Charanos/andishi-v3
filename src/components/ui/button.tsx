import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "glass" | "ghost";
  size?: "sm" | "md";
};

type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type LinkButtonProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

const variants = {
  primary:
    "border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] hover:shadow-[0_22px_52px_color-mix(in_srgb,var(--bg-deep)_48%,transparent)]",
  glass:
    "border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--glass-bg)] text-[var(--on-surface)] hover:border-[color-mix(in_srgb,var(--on-surface)_34%,transparent)] hover:bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)]",
  ghost:
    "border-transparent bg-transparent text-[var(--on-surface-dim)] hover:border-[var(--glass-border)] hover:text-[var(--on-surface)]",
};

const sizes = {
  sm: "min-h-11 px-5 py-2.5 text-[0.92rem]",
  md: "min-h-[3.35rem] px-6 py-3.5 text-[0.98rem]",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full border backdrop-blur-xl transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)] disabled:pointer-events-none disabled:opacity-50";

export function Button({ className, variant = "glass", size = "md", ...props }: ButtonProps) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function LinkButton({
  className,
  variant = "glass",
  size = "md",
  href,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}
