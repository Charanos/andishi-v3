"use client";

import { forwardRef, useEffect, useRef } from "react";
import { IconAlertTriangle, IconX } from "@tabler/icons-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  description,
  onCancel,
  onConfirm,
  open,
  title,
}: {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onCancel, open]);

  useGSAP(() => {
    if (!open) return;
    gsap.fromTo(
      backdropRef.current,
      { opacity: 0, backdropFilter: "blur(0px)" },
      { opacity: 1, backdropFilter: "blur(24px)", duration: 0.35, ease: "power2.out" },
    );
    gsap.fromTo(
      cardRef.current,
      { scale: 0.95, opacity: 0, y: 10 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.4)", delay: 0.05 },
    );
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[90] grid place-items-center bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        ref={cardRef}
        className="w-full max-w-xl overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_28px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)]"
      >
        <div className="flex items-start gap-4 border-b border-[var(--glass-border)] p-5 sm:p-6">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--secondary)_26%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)]">
            <IconAlertTriangle size={21} stroke={1.7} />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="confirm-dialog-title"
              className="title-serif text-[1.35rem] font-medium leading-tight text-[var(--on-surface)]"
            >
              {title}
            </h2>
            <p className="mt-2 text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
            aria-label="Close confirmation"
          >
            <IconX size={18} stroke={1.6} />
          </button>
        </div>
        <div className="flex flex-col-reverse gap-2 p-5 sm:flex-row sm:justify-end sm:p-6">
          <DialogButton ref={cancelRef} onClick={onCancel}>
            {cancelLabel}
          </DialogButton>
          <DialogButton intent="danger" onClick={onConfirm}>
            {confirmLabel}
          </DialogButton>
        </div>
      </div>
    </div>
  );
}

const DialogButton = forwardRef<
  HTMLButtonElement,
  {
    children: React.ReactNode;
    intent?: "neutral" | "danger";
    onClick: () => void;
  }
>(function DialogButton({ children, intent = "neutral", onClick }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-10 cursor-pointer rounded-full border px-5 text-[0.9rem] font-medium transition-colors duration-300",
        intent === "danger"
          ? "border-[color-mix(in_srgb,var(--error)_34%,transparent)] bg-[color-mix(in_srgb,var(--error)_12%,transparent)] text-[var(--error)]"
          : "border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]",
      )}
    >
      {children}
    </button>
  );
});
