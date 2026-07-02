"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconArrowRight,
  IconEye,
  IconEyeOff,
  IconLock,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cosmicSpring } from "@/lib/motion";

const controlSurfaceClass =
  "border-[color-mix(in_srgb,var(--on-surface)_20%,transparent)] bg-[color-mix(in_srgb,var(--surface)_94%,var(--bg)_6%)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_42%,transparent),0_10px_28px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)] dark:border-[var(--glass-border)] dark:bg-[var(--glass-bg)] dark:shadow-none";

const panelSurfaceClass =
  "border-[color-mix(in_srgb,var(--on-surface)_18%,transparent)] bg-[color-mix(in_srgb,var(--surface)_92%,var(--bg)_8%)] shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] dark:border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] dark:bg-[color-mix(in_srgb,var(--surface)_52%,transparent)] dark:shadow-[0_30px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)]";

export function ResetPasswordExperience({ token }: { token?: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const passwordValid = password.length >= 8;
  const matches = password === confirm && confirm.length > 0;
  const canSubmit = Boolean(token) && passwordValid && matches;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    if (!canSubmit || isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const result: { redirect?: string; error?: string } | null = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error ?? "This reset link is invalid or has expired.");
      }

      window.location.href = result?.redirect ?? "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] px-5 py-32">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={cosmicSpring}
        className="mx-auto w-full max-w-md rounded-[1.6rem] bg-[color-mix(in_srgb,var(--surface)_86%,transparent)] p-1 shadow-[0_30px_100px_color-mix(in_srgb,var(--bg-deep)_18%,transparent)] backdrop-blur-2xl dark:bg-[color-mix(in_srgb,var(--surface)_52%,transparent)] dark:shadow-[0_30px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)]"
      >
        <div
          className={cn(
            "overflow-hidden rounded-[1.6rem] border backdrop-blur-2xl",
            panelSurfaceClass,
          )}
        >
          <div className="px-6 pt-8 text-center sm:px-7">
            <h1 className="text-[1.55rem] font-normal leading-tight tracking-tight text-[var(--on-surface)]">
              Set a new password
            </h1>
            <p className="mt-2 text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
              Choose a password with at least 8 characters, including a number and an uppercase
              letter.
            </p>
          </div>

          {!token ? (
            <div className="px-6 py-8 text-center sm:px-7">
              <p className="text-[0.92rem] text-[var(--on-surface-dim)]">
                This reset link is missing its token. Request a new one from the login page.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-flex text-[0.9rem] font-medium text-[var(--secondary)] transition-opacity duration-300 hover:opacity-75"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="px-6 py-6 sm:px-7">
              <div className="grid gap-4">
                {error && (
                  <div className="my-1 border-b border-red-100 py-2 text-[0.9rem] text-[color-mix(in_srgb,#ff6b6b_86%,var(--on-surface))]">
                    {error}
                  </div>
                )}

                <FieldShell
                  error={
                    attempted && !passwordValid ? "Password must be at least 8 characters" : ""
                  }
                  icon={<IconLock size={17} stroke={1.6} />}
                  label="New password"
                >
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    className="min-w-0 flex-1 bg-transparent text-[1rem] text-[var(--on-surface)] outline-none placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_76%,transparent)] dark:placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="grid h-8 w-8 place-items-center rounded-lg text-[color-mix(in_srgb,var(--on-surface-dim)_86%,var(--on-surface))] transition-colors duration-300 hover:text-[var(--on-surface)]"
                  >
                    {showPassword ? (
                      <IconEyeOff size={16} stroke={1.6} />
                    ) : (
                      <IconEye size={16} stroke={1.6} />
                    )}
                  </button>
                </FieldShell>

                <FieldShell
                  error={attempted && !matches ? "Passwords do not match" : ""}
                  icon={<IconLock size={17} stroke={1.6} />}
                  label="Confirm password"
                >
                  <input
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                    className="min-w-0 flex-1 bg-transparent text-[1rem] text-[var(--on-surface)] outline-none placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_76%,transparent)] dark:placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]"
                  />
                </FieldShell>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="mt-1 w-full cursor-pointer items-center justify-center gap-2 flex-nowrap"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[color-mix(in_srgb,var(--bg)_26%,transparent)] border-t-[var(--bg)]" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save password
                      <IconArrowRight size={16} stroke={1.8} />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="my-8 flex flex-wrap justify-center gap-x-3 gap-y-1">
          {["SSL secured", "Workspace only", "Data encrypted"].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 text-[0.76rem] font-medium uppercase tracking-[0.08em] text-[var(--on-surface-dim)]"
            >
              <IconShieldCheck size={12} stroke={1.8} className="text-[var(--tertiary)]" />
              {item}
            </span>
          ))}
        </div>
      </motion.div>
    </main>
  );
}

function FieldShell({
  children,
  error,
  icon,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.9rem] font-medium text-[var(--on-surface)]">{label}</span>
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
