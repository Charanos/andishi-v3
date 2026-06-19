import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
};

export function Logo({
  className,
  markClassName,
  showWordmark = true,
  wordmarkClassName,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("grid h-8 w-8 place-items-center", markClassName)}>
        <Image src="/logo.svg" alt="" width={28} height={28} priority />
      </span>
      {showWordmark && (
        <span
          className={cn(
            "font-mono text-sm font-normal tracking-tight text-[var(--on-surface)]",
            wordmarkClassName,
          )}
        >
          Andishi
        </span>
      )}
    </span>
  );
}
