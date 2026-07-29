"use client";

/**
 * src/components/ui/toast-provider.tsx
 *
 * Minimal toast notification system for admin feedback.
 * Usage: wrap your admin layout with <ToastProvider />, then call
 * useToast() from any client component to trigger toasts.
 *
 * Design: follows the Cosmic Order system — glass card, no-bold typography,
 * framer-motion AnimatePresence for smooth entrance/exit.
 */

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useId, useState } from "react";
import { IconCheck, IconAlertCircle, IconInfoCircle, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { cosmicSpring } from "@/lib/motion";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const icons: Record<ToastVariant, typeof IconCheck> = {
  success: IconCheck,
  error: IconAlertCircle,
  info: IconInfoCircle,
};

const colors: Record<ToastVariant, { icon: string; bg: string; border: string }> = {
  success: {
    icon: "text-[var(--tertiary)]",
    bg: "bg-[color-mix(in_srgb,var(--tertiary)_8%,var(--surface-highest))]",
    border: "border-[color-mix(in_srgb,var(--tertiary)_20%,transparent)]",
  },
  error: {
    icon: "text-[var(--error)]",
    bg: "bg-[color-mix(in_srgb,var(--error)_8%,var(--surface-highest))]",
    border: "border-[color-mix(in_srgb,var(--error)_20%,transparent)]",
  },
  info: {
    icon: "text-[var(--secondary)]",
    bg: "bg-[color-mix(in_srgb,var(--secondary)_8%,var(--surface-highest))]",
    border: "border-[color-mix(in_srgb,var(--secondary)_20%,transparent)]",
  },
};

const AUTO_DISMISS_MS = 4000;

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = icons[toast.variant];
  const c = colors[toast.variant];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: cosmicSpring }}
      exit={{ opacity: 0, y: 10, scale: 0.96, transition: { duration: 0.18 } }}
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-w-[240px] max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-2xl",
        c.bg,
        c.border,
      )}
    >
      <Icon size={16} className={cn("mt-0.5 shrink-0", c.icon)} />
      <p className="flex-1 text-[0.88rem] text-[var(--on-surface)]">{toast.message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="ml-1 rounded-lg p-0.5 text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_40%,transparent)]"
      >
        <IconX size={14} />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idPrefix = useId();

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = `${idPrefix}-${Date.now()}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [idPrefix, dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast viewport — fixed bottom-right, above all content */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2"
        style={{ pointerEvents: toasts.length ? "auto" : "none" }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
