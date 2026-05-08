"use client";

import { useTheme } from "next-themes";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { cosmicSpring } from "@/lib/motion";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = (resolvedTheme ?? "dark") === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      suppressHydrationWarning
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_72%,transparent)] text-[var(--on-surface)] transition-colors duration-300 hover:border-[color-mix(in_srgb,var(--on-surface)_34%,transparent)] hover:bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={cosmicSpring}
            className="absolute"
          >
            <IconSun size={17} stroke={1.5} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
            transition={cosmicSpring}
            className="absolute"
          >
            <IconMoon size={17} stroke={1.5} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
