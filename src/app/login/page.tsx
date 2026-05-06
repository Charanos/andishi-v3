import { IconArrowRight, IconLock, IconMail } from "@tabler/icons-react";
import Link from "next/link";

export const metadata = {
  title: "Login - Andishi",
  description: "Sign in to your Andishi workspace.",
};

export default function LoginPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[var(--bg)] px-5 py-32 sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_12%,color-mix(in_srgb,var(--secondary)_10%,transparent),transparent_24rem),radial-gradient(circle_at_80%_20%,color-mix(in_srgb,var(--on-surface)_7%,transparent),transparent_30rem)]"
      />

      <section className="relative z-[1] mx-auto grid min-h-[calc(100vh-16rem)] w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1fr]">
        <div>
          <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]">
            <span className="h-px w-7 bg-[var(--secondary)]" />
            Workspace access
          </p>
          <h1 className="max-w-[11ch] text-[clamp(2.7rem,8vw,5rem)] font-normal leading-[0.98] tracking-normal text-[var(--on-surface)]">
            Welcome back to Andishi.
          </h1>
          <p className="body-md mt-6 max-w-md text-[var(--on-surface-dim)]">
            Sign in to review project progress, shared briefs, launch notes,
            and the work currently moving through your workspace.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md rounded-[1.5rem] border border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] bg-[var(--glass-bg)] p-5 shadow-[0_30px_90px_color-mix(in_srgb,var(--bg-deep)_48%,transparent)] backdrop-blur-2xl sm:p-7">
          <div className="mb-7">
            <p className="font-mono text-[0.78rem] tracking-normal text-[var(--secondary)]">
              SECURE ACCESS
            </p>
            <h2 className="mt-2 text-[1.45rem] font-medium text-[var(--on-surface)]">
              Client workspace
            </h2>
          </div>

          <form className="space-y-4">
            <label className="block">
              <span className="label-caps mb-2 block text-[color-mix(in_srgb,var(--on-surface-dim)_72%,transparent)]">
                Email
              </span>
              <span className="flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_44%,transparent)] px-4">
                <IconMail
                  size={17}
                  stroke={1.6}
                  className="text-[var(--on-surface-dim)]"
                />
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="min-w-0 flex-1 bg-transparent text-[0.95rem] text-[var(--on-surface)] outline-none placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_52%,transparent)]"
                />
              </span>
            </label>

            <label className="block">
              <span className="label-caps mb-2 block text-[color-mix(in_srgb,var(--on-surface-dim)_72%,transparent)]">
                Password
              </span>
              <span className="flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_44%,transparent)] px-4">
                <IconLock
                  size={17}
                  stroke={1.6}
                  className="text-[var(--on-surface-dim)]"
                />
                <input
                  type="password"
                  placeholder="Enter password"
                  className="min-w-0 flex-1 bg-transparent text-[0.95rem] text-[var(--on-surface)] outline-none placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_52%,transparent)]"
                />
              </span>
            </label>

            <button
              type="submit"
              className="inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-3.5 text-[0.98rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
            >
              Sign in
              <IconArrowRight size={16} stroke={1.8} />
            </button>
          </form>

          <p className="mt-6 text-center text-[0.82rem] text-[var(--on-surface-dim)]">
            Need access?{" "}
            <Link href="/contact" className="text-[var(--on-surface)]">
              Contact the studio
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
