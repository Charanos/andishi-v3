import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { VettingBadges } from "@/components/dashboard/vetting-badges";
import type { Engineer } from "@/data/engineers";

export function ProfileCard({
  engineer,
  variant = "client",
}: {
  engineer: Engineer;
  variant?: "public" | "client" | "admin" | "developer";
}) {
  const action = variant === "admin" ? "Open record" : variant === "developer" ? "Edit profile" : "Request intro";

  return (
    <article className="rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-2xl">
      <div className="flex gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[var(--glass-border)]">
          <Image src={engineer.avatar} alt={engineer.name} fill sizes="64px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[1rem] font-medium text-[var(--on-surface)]">{engineer.name}</h3>
            <StatusBadge label={`${engineer.yearsExp} yrs`} tone="pending" />
          </div>
          <p className="mt-1 text-[0.9rem] text-[var(--on-surface-dim)]">{engineer.role}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {engineer.skills.slice(0, 5).map((skill) => (
          <span key={skill} className="rounded-lg border border-[var(--glass-border)] px-2 py-1 text-[0.72rem] text-[var(--on-surface-dim)]">
            {skill}
          </span>
        ))}
      </div>
      <div className="mt-4">
        <VettingBadges />
      </div>
      <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--glass-border)] pt-4">
        <p className="font-mono text-[0.75rem] text-[var(--secondary)]">Strong match</p>
        <Link href={`/engineers/${engineer.slug}`} className="inline-flex items-center gap-1.5 text-[0.88rem] font-medium text-[var(--on-surface)]">
          {action}
          <IconArrowRight size={14} stroke={1.8} />
        </Link>
      </div>
    </article>
  );
}
