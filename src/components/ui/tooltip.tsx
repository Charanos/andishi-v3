"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TooltipProps = {
  children: ReactNode;
  content: string;
};

export function Tooltip({ children, content }: TooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span tabIndex={0} className="cursor-help rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)]">
        {children}
      </span>
      <AnimatePresence>
        {open ? (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
            className="z-100 absolute bottom-full left-1/2 mb-3 w-56 -translate-x-1/2 rounded-xl border border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] bg-[var(--surface-highest)] px-3 py-2 text-center text-xs leading-5 text-[var(--on-surface)] shadow-2xl backdrop-blur-2xl"
            role="tooltip"
          >
            {content}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}
