import type { Icon } from "@tabler/icons-react";
import { IconClock } from "@tabler/icons-react";
import Link from "next/link";

export function EmptyState({
  icon: Icon = IconClock,
  heading,
  body,
  cta,
}: {
  icon?: Icon;
  heading: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-[color-mix(in_srgb,var(--on-surface)_18%,transparent)] bg-[var(--glass-bg)] p-8 text-center backdrop-blur-2xl">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_9%,transparent)] text-[var(--secondary)]">
        <Icon size={28} stroke={1.5} />
      </span>
      <h2 className="mt-5 text-[1.25rem] font-medium text-[var(--on-surface)]">{heading}</h2>
      <p className="body-md mx-auto mt-3 max-w-md text-[var(--on-surface-dim)]">{body}</p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-6 inline-flex rounded-full border border-[var(--glass-border)] bg-[var(--on-surface)] px-5 py-2 text-[0.92rem] font-medium text-[var(--bg)]"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
