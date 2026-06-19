"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = {
  id: string;
  message: string;
  tone: "success" | "error" | "info";
};

type ToastContextValue = {
  notify: (message: string, tone?: Toast["tone"]) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, tone: Toast["tone"] = "info") => {
    const id = crypto.randomUUID();
    setToasts((current) => [{ id, message, tone }, ...current].slice(0, 3));
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-[90] grid w-[min(24rem,calc(100vw-2.5rem))] gap-2"
        aria-live="polite"
      >
        <Toaster toasts={toasts} />
      </div>
    </ToastContext.Provider>
  );
}

export function Toaster({ toasts }: { toasts: Toast[] }) {
  const toneClass = {
    error: "border-[color-mix(in_srgb,#f85149_30%,var(--glass-border))]",
    info: "border-[var(--glass-border)]",
    success: "border-[color-mix(in_srgb,var(--tertiary)_30%,var(--glass-border))]",
  };

  return (
    <>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-2xl border bg-[var(--surface)] px-4 py-3 text-[0.9rem] text-[var(--on-surface)] shadow-[0_18px_50px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)] ${toneClass[toast.tone]}`}
        >
          {toast.message}
        </div>
      ))}
    </>
  );
}

export function useToast() {
  const value = useContext(ToastContext);

  if (!value) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return value;
}
