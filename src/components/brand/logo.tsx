import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  markClassName?: string;
};

export function Logo({ className, markClassName }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "grid h-8 w-8 place-items-center rounded-full border border-[color-mix(in_srgb,var(--secondary)_30%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)]",
          markClassName,
        )}
      >
        <Image src="/logo.svg" alt="" width={22} height={22} priority />
      </span>
      <span className="text-sm font-[500] tracking-[0.02em] text-[var(--on-surface)]">Andishi</span>
    </span>
  );
}
