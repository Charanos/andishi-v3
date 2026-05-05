import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
  accent?: "primary" | "secondary" | "tertiary";
  className?: string;
};

const accentMap = {
  primary: "text-[var(--primary)]",
  secondary: "text-[var(--secondary)]",
  tertiary: "text-[var(--tertiary)]",
};

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  accent = "primary",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <p className={cn("label-caps mb-4", accentMap[accent])}>{eyebrow}</p>
      <h2 className="headline-lg text-[var(--on-surface)]">{title}</h2>
      {body ? <div className="body-lg mt-5 text-[var(--on-surface-dim)]">{body}</div> : null}
    </div>
  );
}
