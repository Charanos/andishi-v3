"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function ModalShell({
  children,
  labelledBy,
  onClose,
}: {
  children: ReactNode;
  labelledBy: string;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
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
  }, [onClose]);

  useGSAP(() => {
    gsap.fromTo(
      containerRef.current,
      { backdropFilter: "blur(0px)", backgroundColor: "transparent" },
      { backdropFilter: "blur(24px)", backgroundColor: "color-mix(in_srgb,var(--bg-deep)_80%,transparent)", duration: 0.4, ease: "power2.out" },
    );
    gsap.fromTo(".gsap-modal-content", { scale: 0.95, opacity: 0, y: 10 }, { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.1)", delay: 0.05 });
    gsap.fromTo(".gsap-modal-field", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power2.out", delay: 0.2 });
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      aria-labelledby={labelledBy}
      aria-modal="true"
      className="fixed inset-0 z-[90] grid place-items-center px-4 py-8 pointer-events-auto outline-none"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      {children}
    </div>
  );
}
