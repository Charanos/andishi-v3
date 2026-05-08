import type { ReactNode } from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const textureStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 11v12M11 17h12' stroke='%23c5b8e8' stroke-width='0.65' stroke-linecap='round' opacity='0.22'/%3E%3Cpath d='M4 4h4M26 30h4' stroke='%23c5b8e8' stroke-width='0.55' stroke-linecap='round' opacity='0.16'/%3E%3C/svg%3E\"), radial-gradient(circle, color-mix(in srgb, var(--secondary) 16%, transparent) 0 1px, transparent 1.8px)",
  backgroundPosition: "0 0, 17px 17px",
  backgroundSize: "34px 34px, 34px 34px",
};

export function PublicPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate overflow-hidden bg-[var(--bg)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
        style={textureStyle}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_8%,transparent),transparent_24rem),linear-gradient(90deg,color-mix(in_srgb,var(--bg)_88%,transparent),transparent_40%,color-mix(in_srgb,var(--bg)_72%,transparent))]"
      />
      <div className="relative z-[1]">{children}</div>
    </main>
  );
}

export function RouteHero({
  eyebrow,
  title,
  body,
  primary,
  secondary,
  meta,
}: {
  eyebrow: string;
  title: string;
  body: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  meta?: ReactNode;
}) {
  return (
    <section className="px-5 pb-12 pt-32 sm:px-8 lg:pb-16 lg:pt-40">
      <div className="mx-auto grid max-w-7xl gap-8 border-b border-[var(--glass-border)] pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,30rem)] lg:items-end lg:pb-14">
        <div>
          <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]">
            <span className="h-px w-7 bg-[var(--secondary)]" />
            {eyebrow}
          </p>
          <h1 className="max-w-[14ch] text-[clamp(2.7rem,9vw,6.2rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)]">
            {title}
          </h1>
        </div>
        <div className="max-w-xl lg:justify-self-end lg:text-right">
          <p className="body-md text-[var(--on-surface-dim)]">{body}</p>
          {(primary || secondary) && (
            <div className="mt-7 flex flex-wrap gap-3 lg:justify-end">
              {primary && (
                <LinkButton href={primary.href} variant="primary">
                  {primary.label}
                  <IconArrowRight size={16} stroke={1.8} />
                </LinkButton>
              )}
              {secondary && (
                <LinkButton href={secondary.href} variant="glass">
                  {secondary.label}
                </LinkButton>
              )}
            </div>
          )}
          {meta && <div className="mt-7">{meta}</div>}
        </div>
      </div>
    </section>
  );
}

export function SectionBlock({
  eyebrow,
  title,
  body,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("px-5 py-14 sm:px-8 lg:py-20", className)}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl lg:mb-10">
          {eyebrow && (
            <p className="label-caps mb-4 text-[var(--secondary)]">
              {eyebrow}
            </p>
          )}
          <h2 className="max-w-[14ch] text-[clamp(2rem,7vw,4.4rem)] font-normal leading-[0.96] tracking-tight text-[var(--on-surface)]">
            {title}
          </h2>
          {body && (
            <p className="body-md mt-5 max-w-2xl text-[var(--on-surface-dim)]">
              {body}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

export function GlassPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_38%,transparent)] p-5 shadow-[0_24px_80px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] backdrop-blur-2xl sm:p-6",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 right-4 h-24 w-36 opacity-[0.08]"
        style={textureStyle}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

export function FinalRouteCta({
  title,
  body,
  href = "/start-project",
  label = "Submit a hiring brief",
}: {
  title: string;
  body: string;
  href?: string;
  label?: string;
}) {
  return (
    <section className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[1.55rem] border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--surface)_46%,transparent)] px-6 py-12 text-center shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_30%,transparent)] backdrop-blur-2xl sm:px-10 lg:px-16 lg:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.1]"
            style={textureStyle}
          />
          <div className="relative z-[1] mx-auto max-w-2xl">
            <p className="label-caps mb-4 text-[var(--secondary)]">
              Start here
            </p>
            <h2 className="text-[clamp(2rem,6vw,3.8rem)] font-normal leading-[1.02] tracking-tight text-[var(--on-surface)]">
              {title}
            </h2>
            <p className="body-md mx-auto mt-5 max-w-lg text-[var(--on-surface-dim)]">
              {body}
            </p>
            <div className="mt-8">
              <LinkButton href={href} variant="primary">
                {label}
                <IconArrowRight size={16} stroke={1.8} />
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
