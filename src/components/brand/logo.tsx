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
          "grid h-8 w-8 place-items-center",
          markClassName,
        )}
      >
        <Image src="/logo.svg" alt="" width={22} height={22} priority />
      </span>
      <span className="font-mono text-sm font-normal tracking-normal text-[var(--on-surface)]">
        Andishi
      </span>
    </span>
  );
}
