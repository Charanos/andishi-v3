"use client";

import { useTheme } from "next-themes";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = (resolvedTheme ?? "dark") === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      suppressHydrationWarning
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_72%,transparent)] text-[var(--on-surface)] transition-colors duration-300 hover:border-[color-mix(in_srgb,var(--on-surface)_34%,transparent)] hover:bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
    >
      <span className="absolute scale-100 opacity-100 transition-all duration-300 dark:scale-75 dark:rotate-90 dark:opacity-0">
        <IconMoon size={17} stroke={1.5} />
      </span>
      <span className="absolute -rotate-90 scale-75 opacity-0 transition-all duration-300 dark:rotate-0 dark:scale-100 dark:opacity-100">
        <IconSun size={17} stroke={1.5} />
      </span>
    </button>
  );
}
