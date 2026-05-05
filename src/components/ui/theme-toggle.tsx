"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { cosmicSpring } from "@/lib/motion";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-xl border border-[var(--outline-variant)] bg-[var(--color-bg-elevated)]" />;
  }

  const isDark = resolvedTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--outline-variant)] bg-[var(--color-bg-elevated)] transition-colors duration-300 hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
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
            <IconSun size={17} stroke={1.5} className="text-[var(--color-text-muted)]" />
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
            <IconMoon size={17} stroke={1.5} className="text-[var(--color-text-muted)]" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
