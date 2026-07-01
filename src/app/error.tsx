"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the exception to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-24 text-center">
      {/* Background glow matching the not-found glow style */}
      <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--primary)_18%,transparent)] blur-[130px]" />

      <div className="relative mx-auto max-w-xl">
        <Logo className="mb-8 justify-center" />
        <p className="label-caps mb-4 text-[var(--secondary)]">Error</p>
        <h1 className="headline-lg">Something went out of bounds.</h1>
        <p className="body-lg my-8 text-[var(--on-surface-dim)]">
          An unexpected error occurred. It has been logged and we&apos;ve notified our engineers.
        </p>

        {error.digest && (
          <p className="font-mono text-xs text-[color-mix(in_srgb,var(--on-surface-dim)_50%,transparent)] mb-8">
            Diagnostic ID: {error.digest}
          </p>
        )}

        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => reset()} variant="primary">
            Try again
          </Button>
        </div>
      </div>
    </main>
  );
}
