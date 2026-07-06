"use client";

import { useEffect, useRef } from "react";
import { IconX } from "@tabler/icons-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
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

  useGSAP(() => {
    if (!open) return;
    gsap.fromTo(backdropRef.current, { opacity: 0, backdropFilter: "blur(0px)" }, { opacity: 1, backdropFilter: "blur(24px)", duration: 0.4, ease: "power2.out" });
    gsap.fromTo(drawerRef.current, { x: "100%", opacity: 0 }, { x: "0%", opacity: 1, duration: 0.5, ease: "power3.out" });
    gsap.fromTo(".gsap-drawer-item", { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.2 });
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[80] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="entity-drawer-title"
    >
      <button
        ref={backdropRef}
        type="button"
        aria-label="Close drawer"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--bg-deep)_80%,transparent)]"
        onClick={onClose}
      />
      <aside ref={drawerRef} className="relative ml-auto flex h-dvh w-full max-w-[min(62rem,calc(100vw-1rem))] flex-col overflow-hidden border-l border-[var(--glass-border)] bg-[var(--surface)] shadow-[-24px_0_90px_color-mix(in_srgb,var(--bg-deep)_60%,transparent)] sm:my-2 sm:h-[calc(100dvh-1rem)] sm:rounded-l-[2rem]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--primary)_8%,transparent),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 flex shrink-0 items-center justify-between gap-4 border-b border-[color-mix(in_srgb,var(--glass-border)_50%,transparent)] px-5 py-5 sm:px-8">
          <h2
            id="entity-drawer-title"
            className="title-serif min-w-0 truncate text-[1.4rem] font-medium leading-tight text-[var(--on-surface)]"
          >
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close drawer"
            onClick={onClose}
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] hover:text-[var(--on-surface)]"
          >
            <IconX size={18} stroke={1.6} />
          </button>
        </div>
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-8 scrollbar-hide">
          {children}
        </div>
      </aside>
    </div>
  );
}
