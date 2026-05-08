import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconMapPin, IconRosetteDiscountCheck } from "@tabler/icons-react";
import type { Engineer } from "@/data/engineers";

export function availabilityLabel(availability: Engineer["availability"]) {
  if (availability === "now") return "Available now";
  return `From ${new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(availability))}`;
}

export function timezoneLabel(offset: number) {
  if (offset === 0) return "UTC+0";
  return `UTC${offset > 0 ? "+" : ""}${offset}`;
}

export function EngineerCard({
  engineer,
  compact = false,
}: {
  engineer: Engineer;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/engineers/${engineer.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.3rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_36%,transparent)] p-5 shadow-[0_20px_70px_color-mix(in_srgb,var(--bg-deep)_20%,transparent)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--secondary)_28%,transparent)]"
    >
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-high)]">
          <Image
            src={engineer.avatar}
            alt={`${engineer.name} profile photo`}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[1.05rem] font-medium leading-tight text-[var(--on-surface)]">
              {engineer.name}
            </h3>
            <span className="rounded-full border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_9%,transparent)] px-2 py-0.5 font-mono text-[0.68rem] text-[var(--secondary)]">
              {engineer.yearsExp} yrs
            </span>
          </div>
          <p className="mt-1 text-[0.9rem] leading-snug text-[var(--on-surface-dim)]">
            {engineer.role}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {engineer.skills.slice(0, compact ? 3 : 5).map((skill) => (
          <span
            key={skill}
            className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2.5 py-1 text-[0.74rem] font-medium text-[var(--on-surface-dim)]"
          >
            {skill}
          </span>
        ))}
      </div>

      {!compact && (
        <p className="mt-5 line-clamp-3 text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">
          {engineer.bio}
        </p>
      )}

      <div className="mt-auto grid gap-2 pt-5 text-[0.84rem] text-[var(--on-surface-dim)]">
        <span className="flex items-center gap-2">
          <IconMapPin size={15} stroke={1.6} className="text-[var(--secondary)]" />
          {engineer.location.city}, {engineer.location.country} ·{" "}
          {timezoneLabel(engineer.location.utcOffset)}
        </span>
        <span className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--tertiary)]" />
            {availabilityLabel(engineer.availability)}
          </span>
          <span className="flex items-center gap-1 text-[var(--secondary)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Request intro
            <IconArrowRight size={14} stroke={1.8} />
          </span>
        </span>
        <span className="mt-1 inline-flex items-center gap-2 text-[0.78rem] text-[var(--on-surface-dim)]">
          <IconRosetteDiscountCheck size={15} stroke={1.5} className="text-[var(--tertiary)]" />
          System design · Code review · Architecture
        </span>
      </div>
    </Link>
  );
}
