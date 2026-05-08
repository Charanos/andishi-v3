"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconArrowRight,
  IconBrandGoogle,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cosmicSpring } from "@/lib/motion";

type AuthMode = "password" | "magic";

const controlSurfaceClass =
  "border-[color-mix(in_srgb,var(--on-surface)_20%,transparent)] bg-[color-mix(in_srgb,var(--surface)_94%,var(--bg)_6%)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_42%,transparent),0_10px_28px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)] dark:border-[var(--glass-border)] dark:bg-[var(--glass-bg)] dark:shadow-none";

const panelSurfaceClass =
  "border-[color-mix(in_srgb,var(--on-surface)_18%,transparent)] bg-[color-mix(in_srgb,var(--surface)_92%,var(--bg)_8%)] shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] dark:border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] dark:bg-[color-mix(in_srgb,var(--surface)_52%,transparent)] dark:shadow-[0_30px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)]";

export function LoginPageExperience() {
  const [mode, setMode] = useState<AuthMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "signed">(
    "idle",
  );
  const [attempted, setAttempted] = useState(false);

  const emailValid = useMemo(() => isEmail(email), [email]);
  const passwordValid = password.length >= 8;
  const canSubmit = mode === "magic" ? emailValid : emailValid && passwordValid;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    if (!canSubmit) return;

    setStatus("loading");
    window.setTimeout(() => {
      setStatus(mode === "magic" ? "sent" : "signed");
    }, 800);
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setAttempted(false);
    setStatus("idle");
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[var(--bg)] px-5 pb-14 pt-32 sm:px-8 lg:pt-36">
      <HeroArtwork />
      <section className="relative z-[1] mx-auto grid min-h-[calc(100svh-11rem)] w-full max-w-[96rem] items-center gap-10 lg:grid-cols-[0.95fr_1fr] md:px-20">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={cosmicSpring}
          className="max-w-2xl"
        >
          <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]">
            <span className="h-px w-7 bg-[var(--secondary)]" />
            Hiring workspace
          </p>
          <h1 className="max-w-[12ch] text-[clamp(3rem,9vw,5.8rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)]">
            Welcome back to Andishi.
          </h1>
          <p className="body-md mt-7 max-w-xl text-[var(--on-surface-dim)]">
            Sign in to review engineer matches, interview notes, onboarding
            status, placement guarantees, and the talent conversations moving
            through your workspace.
          </p>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {[
              ["Profiles", "matched engineers"],
              ["Interviews", "technical notes"],
              ["Onboarding", "start dates"],
            ].map(([label, detail]) => (
              <div
                key={label}
                className={`rounded-xl border px-4 py-3 backdrop-blur-xl ${controlSurfaceClass}`}
              >
                <p className="font-mono text-[0.78rem] tracking-tight text-[var(--on-surface)]">
                  {label}
                </p>
                <p className="mt-1 text-[0.8rem] leading-snug text-[var(--on-surface-dim)]">
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...cosmicSpring, delay: 0.08 }}
          className="mx-auto w-full max-w-xl rounded-[1.6rem] bg-[color-mix(in_srgb,var(--surface)_86%,transparent)] p-1 shadow-[0_30px_100px_color-mix(in_srgb,var(--bg-deep)_18%,transparent)] backdrop-blur-2xl dark:bg-[color-mix(in_srgb,var(--surface)_52%,transparent)] dark:shadow-[0_30px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)]"
        >
          <div
            className={`overflow-hidden rounded-[1.6rem] border backdrop-blur-2xl ${panelSurfaceClass}`}
          >
            <div className="px-6 pt-7 text-center sm:px-7">
              <h2 className="mt-5 text-[1.55rem] font-normal leading-tight tracking-tight text-[var(--on-surface)]">
                Secure access.
              </h2>
              <p className="mt-2 text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
                Use the method attached to your Andishi workspace.
              </p>
            </div>

            <div className="mx-6 mt-6 grid grid-cols-2 gap-1 rounded-xl border border-[color-mix(in_srgb,var(--on-surface)_18%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_74%,var(--surface)_26%)] p-1 sm:mx-7 dark:border-[var(--glass-border)] dark:bg-[color-mix(in_srgb,var(--surface-high)_40%,transparent)]">
              {(["password", "magic"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => switchMode(item)}
                  className={cn(
                    "rounded-lg px-3 cursor-pointer py-2.5 text-[0.9rem] font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_35%,transparent)]",
                    mode === item
                      ? "border border-[color-mix(in_srgb,var(--primary)_34%,transparent)] bg-[color-mix(in_srgb,var(--surface)_98%,var(--primary)_2%)] text-[var(--on-surface)] shadow-[0_8px_20px_color-mix(in_srgb,var(--bg-deep)_12%,transparent)] dark:border-[var(--glass-border)] dark:bg-[var(--glass-bg)] dark:shadow-[0_8px_20px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)]"
                      : "text-[color-mix(in_srgb,var(--on-surface-dim)_86%,var(--on-surface))] hover:text-[var(--on-surface)] dark:text-[color-mix(in_srgb,var(--on-surface-dim)_64%,transparent)]",
                  )}
                >
                  {item === "password" ? "Password" : "Magic link"}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="px-6 py-6 sm:px-7">
              {status === "sent" ? (
                <SentState email={email} onReset={() => setStatus("idle")} />
              ) : status === "signed" ? (
                <SignedState />
              ) : (
                <div className="grid gap-4">
                  {mode === "magic" && (
                    <div className="flex gap-3 rounded-xl border border-[color-mix(in_srgb,var(--secondary)_34%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,var(--surface)_90%)] p-4 dark:border-[color-mix(in_srgb,var(--secondary)_20%,transparent)] dark:bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)]">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]">
                        <IconMail size={16} stroke={1.7} />
                      </span>
                      <p className="text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">
                        We will prepare a one-click sign-in link for this
                        workspace email.
                      </p>
                    </div>
                  )}

                  <FieldShell
                    error={
                      attempted && !emailValid
                        ? "Enter a valid email address"
                        : ""
                    }
                    icon={<IconMail size={17} stroke={1.6} />}
                    label="Email address"
                  >
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      className="min-w-0 flex-1 bg-transparent text-[1rem] text-[var(--on-surface)] outline-none placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_76%,transparent)] dark:placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]"
                    />
                  </FieldShell>

                  {mode === "password" && (
                    <>
                      <FieldShell
                        error={
                          attempted && !passwordValid
                            ? "Password must be at least 8 characters"
                            : ""
                        }
                        icon={<IconLock size={17} stroke={1.6} />}
                        label="Password"
                        labelAction={
                          <button
                            type="button"
                            onClick={() => switchMode("magic")}
                            className="text-[0.82rem] text-[var(--primary)] cursor-pointer transition-opacity duration-300 hover:opacity-75"
                          >
                            Forgot password?
                          </button>
                        }
                      >
                        <input
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Enter password"
                          className="min-w-0 flex-1 bg-transparent text-[1rem] text-[var(--on-surface)] outline-none placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_76%,transparent)] dark:placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className="grid h-8 w-8 place-items-center rounded-lg text-[color-mix(in_srgb,var(--on-surface-dim)_86%,var(--on-surface))] transition-colors duration-300 hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_35%,transparent)] dark:text-[color-mix(in_srgb,var(--on-surface-dim)_60%,transparent)]"
                        >
                          {showPassword ? (
                            <IconEyeOff size={16} stroke={1.6} />
                          ) : (
                            <IconEye size={16} stroke={1.6} />
                          )}
                        </button>
                      </FieldShell>

                      <button
                        type="button"
                        onClick={() => setRemember((current) => !current)}
                        aria-pressed={remember}
                        className="flex w-fit cursor-pointer items-center gap-2 text-[0.86rem] text-[var(--on-surface-dim)] transition-opacity duration-300 hover:opacity-75"
                      >
                        <span
                          className={cn(
                            "grid h-5 w-5 place-items-center rounded-md border text-transparent",
                            remember
                              ? "border-[color-mix(in_srgb,var(--tertiary)_34%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_12%,transparent)] text-[var(--tertiary)]"
                              : "border-[color-mix(in_srgb,var(--on-surface)_22%,transparent)] dark:border-[var(--glass-border)]",
                          )}
                        >
                          <IconCheck size={12} stroke={2.3} />
                        </span>
                        Remember this workspace for 30 days
                      </button>
                    </>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={status === "loading"}
                    className="mt-1 w-full cursor-pointer items-center justify-center gap-2 flex-nowrap"
                  >
                    {status === "loading" ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[color-mix(in_srgb,var(--bg)_26%,transparent)] border-t-[var(--bg)]" />
                        {mode === "magic" ? "Preparing link" : "Signing in"}
                      </>
                    ) : (
                      <>
                        {mode === "magic" ? "Send magic link" : "Sign in"}
                        <IconArrowRight size={16} stroke={1.8} />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] dark:bg-[var(--glass-border)]" />
                    <span className="text-[0.7rem] font-medium uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--on-surface-dim)_82%,var(--on-surface))] dark:text-[color-mix(in_srgb,var(--on-surface-dim)_50%,transparent)]">
                      or
                    </span>
                    <span className="h-px flex-1 bg-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] dark:bg-[var(--glass-border)]" />
                  </div>

                  <button
                    type="button"
                    className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 text-[0.9rem] text-[var(--on-surface-dim)] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--primary)_34%,transparent)] hover:bg-[color-mix(in_srgb,var(--primary)_7%,var(--surface)_93%)] hover:text-[var(--on-surface)] dark:hover:bg-[color-mix(in_srgb,var(--primary)_7%,transparent)] ${controlSurfaceClass}`}
                  >
                    <IconBrandGoogle size={16} stroke={1.7} />
                    Continue with Google
                  </button>
                </div>
              )}
            </form>

            <div className="border-t border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] px-6 py-4 text-center text-[0.92rem] text-[var(--on-surface-dim)] sm:px-7 dark:border-[var(--glass-border)]">
              Need access?{" "}
              <Link
                href="/start-project"
                className="font-medium text-[var(--primary)] transition-opacity duration-300 hover:opacity-75"
              >
                Start hiring
              </Link>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {["SSL secured", "Workspace only", "Data encrypted"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 text-[0.76rem] font-medium uppercase tracking-[0.08em] text-[var(--on-surface-dim)]"
              >
                <IconShieldCheck
                  size={12}
                  stroke={1.8}
                  className="text-[var(--tertiary)]"
                />
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
}

function HeroArtwork() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute left-1/2 top-0 bottom-0 w-[min(1500px,112vw)] -translate-x-1/2 bg-no-repeat opacity-[var(--hero-overlay-opacity)] [background-image:var(--hero-overlay-src)] [background-position:center_top] [background-size:100%_auto] [mix-blend-mode:var(--hero-overlay-blend)] max-[899px]:w-[185vw] max-[899px]:[background-position:center_4rem]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--bg)_0%,color-mix(in_srgb,var(--bg)_90%,transparent)_30%,color-mix(in_srgb,var(--bg)_70%,transparent)_62%,color-mix(in_srgb,var(--bg)_82%,transparent)_100%)] dark:bg-[linear-gradient(90deg,var(--bg)_0%,color-mix(in_srgb,var(--bg)_82%,transparent)_30%,color-mix(in_srgb,var(--bg)_48%,transparent)_62%,color-mix(in_srgb,var(--bg)_72%,transparent)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--bg)_0%,color-mix(in_srgb,var(--bg)_78%,transparent)_28%,color-mix(in_srgb,var(--bg)_70%,transparent)_62%,var(--bg)_100%)] dark:bg-[linear-gradient(180deg,var(--bg)_0%,color-mix(in_srgb,var(--bg)_64%,transparent)_28%,color-mix(in_srgb,var(--bg)_54%,transparent)_62%,var(--bg)_100%)]" />
    </div>
  );
}

function FieldShell({
  children,
  error,
  icon,
  label,
  labelAction,
}: {
  children: React.ReactNode;
  error?: string;
  icon: React.ReactNode;
  label: string;
  labelAction?: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between gap-3 text-[0.9rem] font-medium text-[var(--on-surface)]">
        {label}
        {labelAction}
      </span>
      <span
        className={cn(
          "flex min-h-12 items-center gap-3 rounded-xl border px-4 transition-all duration-300 focus-within:border-[color-mix(in_srgb,var(--primary)_58%,transparent)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)] dark:focus-within:border-[color-mix(in_srgb,var(--secondary)_40%,transparent)] dark:focus-within:ring-[color-mix(in_srgb,var(--secondary)_18%,transparent)]",
          controlSurfaceClass,
          error ? "border-[color-mix(in_srgb,#ff6b6b_48%,transparent)]" : "",
        )}
      >
        <span className="text-[color-mix(in_srgb,var(--on-surface-dim)_84%,var(--on-surface))] dark:text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
          {icon}
        </span>
        {children}
      </span>
      {error && <span className="text-[0.84rem] text-[#ff6b6b]">{error}</span>}
    </label>
  );
}

function SentState({ email, onReset }: { email: string; onReset: () => void }) {
  return (
    <div className="py-3 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[color-mix(in_srgb,var(--tertiary)_28%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_12%,transparent)] text-[var(--tertiary)]">
        <IconMail size={24} stroke={1.8} />
      </span>
      <h3 className="mt-5 text-[1.15rem] font-medium text-[var(--on-surface)]">
        Check your inbox
      </h3>
      <p className="mt-2 text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
        A sign-in link is ready for:
      </p>
      <p className="mx-auto mt-3 w-fit rounded-lg border border-[color-mix(in_srgb,var(--secondary)_22%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] px-3 py-1.5 font-mono text-[0.74rem] tracking-tight text-[var(--secondary)]">
        {email}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 text-[0.9rem] font-medium text-[var(--primary)] transition-opacity duration-300 hover:opacity-75"
      >
        Use a different email
      </button>
    </div>
  );
}

function SignedState() {
  return (
    <div className="py-5 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[color-mix(in_srgb,var(--tertiary)_28%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_12%,transparent)] text-[var(--tertiary)]">
        <IconCheck size={25} stroke={2} />
      </span>
      <h3 className="mt-5 text-[1.15rem] font-medium text-[var(--on-surface)]">
        Credentials accepted
      </h3>
      <p className="mt-2 text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
        Hiring workspace routing will connect here once authentication is wired.
      </p>
    </div>
  );
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
