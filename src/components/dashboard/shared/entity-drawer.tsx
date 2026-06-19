"use client";

import { useEffect, useRef } from "react";
import { IconX } from "@tabler/icons-react";

export function EntityDrawer({
  children,
  open,
  onClose,
  title,
}: {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  title: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="entity-drawer-title"
    >
      <button
        type="button"
        aria-label="Close drawer"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--bg-deep)_70%,transparent)] backdrop-blur-lg"
        onClick={onClose}
      />
      <aside className="relative ml-auto flex h-dvh w-full max-w-[min(62rem,calc(100vw-1rem))] flex-col overflow-hidden border-l border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] shadow-[0_24px_90px_color-mix(in_srgb,var(--bg-deep)_38%,transparent)] backdrop-blur-2xl sm:my-2 sm:h-[calc(100dvh-1rem)] sm:rounded-l-[1.5rem]">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--glass-border)] px-5 py-4 sm:px-6">
          <h2
            id="entity-drawer-title"
            className="title-serif min-w-0 truncate text-[1.28rem] font-medium leading-tight text-[var(--on-surface)]"
          >
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close drawer"
            onClick={onClose}
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
          >
            <IconX size={18} stroke={1.6} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 lg:p-7">
          {children}
        </div>
      </aside>
    </div>
  );
}
