# Andishi Hero — City Overlay & Dual Theme System
### Implementation Guide: SVG Assets + Global Theme Context

---

## ASSET ANALYSIS

Both uploaded SVGs (`hero-dark.svg`, `hero-light.svg`) are:
- **Dimensions**: 1536×1024px (viewBox 1152×768)
- **Format**: Embedded PNG inside SVG mask — white silhouette of the Nairobi city skyline
- **hero-dark.svg**: White city silhouette — designed to sit on dark backgrounds (the mask renders white-on-dark)
- **hero-light.svg**: Same silhouette inverted — designed to sit on light backgrounds

Both assets are large (embedded base64 PNG). They need optimization before use:
1. Move to `/public/assets/` — do NOT inline them in TSX
2. Reference via `<img>` or CSS `background-image` — let the browser cache them
3. Apply opacity and blend mode in CSS — not in the SVG file itself

---

## FILE PLACEMENT

```
public/
└── assets/
    ├── hero-dark.svg     ← Copy from uploads
    └── hero-light.svg    ← Copy from uploads
```

Do not modify the SVG files. All visual control (opacity, blend mode, color tinting) is applied via CSS classes on the wrapping element.

---

## PHASE 1 — GLOBAL THEME CONTEXT

The theme switcher lives in global context so every component — Navbar, Hero, all sections — reacts to it without prop drilling.

### `providers/ThemeProvider.tsx`

```tsx
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'andishi-theme';
const DEFAULT_THEME: Theme = 'dark'; // Andishi defaults to dark

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialise from localStorage or system preference
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'dark' || stored === 'light') {
      setThemeState(stored);
    } else {
      // Respect system preference if no stored value
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(systemDark ? 'dark' : 'light');
    }
  }, []);

  // Apply theme class to <html> element
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Prevent flash: render null until mounted
  if (!mounted) return null;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
```

### Wire into Root Layout

```tsx
// app/layout.tsx
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Outfit, JetBrains_Mono } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-outfit',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning prevents theme flash mismatch warning
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${mono.variable} font-outfit antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## PHASE 2 — DUAL THEME CSS TOKENS

Both themes share the same CSS variable names. The `html[data-theme]` selector swaps the values.

```css
/* app/globals.css */

/* ── DARK THEME (default) ── */
html,
html[data-theme="dark"] {
  /* Backgrounds */
  --color-bg:              #07050F;
  --color-bg-surface:      #0D0A1A;
  --color-bg-elevated:     #14102A;
  --color-bg-overlay:      #1C1838;

  /* Text */
  --color-text:            #EAE6FF;
  --color-text-secondary:  #8B82B8;
  --color-text-muted:      #3D3560;

  /* Borders */
  --color-border:          rgba(111, 75, 170, 0.16);
  --color-border-subtle:   rgba(234, 230, 255, 0.05);

  /* Navbar: frosted on scroll */
  --color-nav-scrolled-bg: rgba(13, 10, 26, 0.85);
  --color-nav-border:      rgba(234, 230, 255, 0.05);

  /* Hero city overlay */
  --hero-overlay-src:      url('/assets/hero-dark.svg');
  --hero-overlay-opacity:  0.08;
  --hero-overlay-blend:    screen;

  /* Hero glow */
  --hero-glow:             radial-gradient(
                             ellipse 90% 60% at 50% -10%,
                             rgba(111, 75, 170, 0.30) 0%,
                             transparent 70%
                           );

  /* Orbs */
  --hero-orb-primary:      rgba(111, 75, 170, 0.12);
  --hero-orb-secondary:    rgba(0, 198, 251, 0.08);
}

/* ── LIGHT THEME ── */
html[data-theme="light"] {
  /* Backgrounds */
  --color-bg:              #F8F6FF;
  --color-bg-surface:      #FFFFFF;
  --color-bg-elevated:     #EDE8FF;
  --color-bg-overlay:      #E2DAFF;

  /* Text */
  --color-text:            #1A1030;
  --color-text-secondary:  #5A5070;
  --color-text-muted:      #9890C0;

  /* Borders */
  --color-border:          rgba(111, 75, 170, 0.14);
  --color-border-subtle:   rgba(26, 16, 48, 0.07);

  /* Navbar: frosted on scroll */
  --color-nav-scrolled-bg: rgba(248, 246, 255, 0.88);
  --color-nav-border:      rgba(26, 16, 48, 0.08);

  /* Hero city overlay — light version */
  --hero-overlay-src:      url('/assets/hero-light.svg');
  --hero-overlay-opacity:  0.07;
  --hero-overlay-blend:    multiply;

  /* Hero glow — softer, warmer on light */
  --hero-glow:             radial-gradient(
                             ellipse 90% 60% at 50% -10%,
                             rgba(111, 75, 170, 0.12) 0%,
                             transparent 70%
                           );

  /* Orbs */
  --hero-orb-primary:      rgba(111, 75, 170, 0.07);
  --hero-orb-secondary:    rgba(0, 198, 251, 0.05);
}

/* ── BRAND TOKENS (theme-independent) ── */
:root {
  --color-primary:         #6f4baa;
  --color-primary-light:   #8c6cd9;
  --color-primary-dark:    #5a3a8e;
  --color-primary-muted:   rgba(111, 75, 170, 0.10);
  --color-primary-glow:    rgba(111, 75, 170, 0.20);

  --color-secondary:       #00C6FB;
  --color-secondary-muted: rgba(0, 198, 251, 0.10);

  --color-accent:          #10B981;
  --color-accent-muted:    rgba(16, 185, 129, 0.10);

  --color-success:         #10B981;
  --color-danger:          #EF4444;
  --color-warning:         #F59E0B;

  --gradient-brand:        linear-gradient(135deg, #6f4baa, #00C6FB);
}

/* ── CITY OVERLAY UTILITY ── */
/* Applied to the overlay div inside HeroSection */
.hero-city-overlay {
  background-image: var(--hero-overlay-src);
  background-size: cover;
  background-position: center bottom;
  background-repeat: no-repeat;
  opacity: var(--hero-overlay-opacity);
  mix-blend-mode: var(--hero-overlay-blend);
  transition: opacity 0.4s ease, background-image 0s;
}

/* ── FLOAT ANIMATIONS ── */
@keyframes float-slow {
  0%, 100% { transform: translateY(0px)   translateX(0px); }
  33%       { transform: translateY(-20px) translateX(10px); }
  66%       { transform: translateY(10px)  translateX(-10px); }
}

@keyframes float-slower {
  0%, 100% { transform: translateY(0px)  translateX(0px); }
  50%       { transform: translateY(15px) translateX(-15px); }
}

.animate-float-slow   { animation: float-slow   14s ease-in-out infinite; }
.animate-float-slower { animation: float-slower 20s ease-in-out infinite; }

/* ── TRANSITIONS ── */
/* Smooth theme switch on all bg/color/border properties */
*,
*::before,
*::after {
  transition-property: background-color, border-color, color, opacity;
  transition-duration: 0.25s;
  transition-timing-function: ease;
}

/* Override for elements that should NOT transition (images, SVGs) */
img, svg, video {
  transition: none;
}
```

---

## PHASE 3 — THEME TOGGLE BUTTON (Navbar)

### `components/ui/ThemeToggle.tsx`

```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useTheme } from '@/providers/ThemeProvider';
import { SPRING } from '@/lib/motion';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center
                 bg-bg-elevated border border-border
                 hover:border-primary/40 hover:bg-primary/10
                 transition-colors duration-300
                 focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={SPRING}
            className="absolute"
          >
            <IconSun size={17} stroke={1.5} className="text-text-secondary" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
            transition={SPRING}
            className="absolute"
          >
            <IconMoon size={17} stroke={1.5} className="text-text-secondary" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
```

### Updated Navbar with Theme Toggle

Add `<ThemeToggle />` to the right cluster in `Navbar.tsx`:

```tsx
// Inside Navbar.tsx — right side cluster
<div className="flex items-center gap-3">
  <ThemeToggle />

  <Link
    href="/start-project"
    className="hidden md:inline-flex items-center px-5 py-2 rounded-full
               bg-primary text-white font-medium text-sm
               hover:bg-primary-light transition-colors duration-300
               shadow-lg shadow-primary/20"
  >
    Book a Scoping Call
  </Link>

  <button
    onClick={() => setMobileOpen(!mobileOpen)}
    className="md:hidden p-2 text-text-secondary hover:text-text
               transition-colors duration-200"
    aria-label="Toggle menu"
  >
    {mobileOpen
      ? <IconX size={22} stroke={1.5} />
      : <IconMenu2 size={22} stroke={1.5} />
    }
  </button>
</div>

// Scroll-aware Navbar bg — reads CSS vars so it adapts automatically:
// No changes needed. --color-nav-scrolled-bg and --color-nav-border
// are defined per-theme in globals.css and applied via inline style:

style={{
  backgroundColor: scrolled ? 'var(--color-nav-scrolled-bg)' : 'transparent',
  borderBottomColor: scrolled ? 'var(--color-nav-border)' : 'transparent',
}}
// OR keep as Tailwind and let the CSS var do the swap automatically
// since bg-bg-surface/80 reads from --color-bg-surface which is theme-aware
```

---

## PHASE 4 — UPDATED HERO SECTION WITH CITY OVERLAY

Full `HeroSection.tsx` incorporating the city overlay asset with dual theme support:

```tsx
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { IconArrowRight, IconPlayerPlay } from '@tabler/icons-react';
import { SPRING, stagger, fadeUp } from '@/lib/motion';
import { useTheme } from '@/providers/ThemeProvider';

export function HeroSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { isDark } = useTheme();

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >

      {/* ── Layer 1: Radial gradient glow (top center) ── */}
      {/* Defined per theme in CSS via --hero-glow var */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'var(--hero-glow)' }}
      />

      {/* ── Layer 2: Ambient orbs ── */}
      <div
        className="absolute top-1/4 left-[15%] w-[520px] h-[520px]
                   rounded-full blur-[140px] animate-float-slow pointer-events-none
                   transition-colors duration-500"
        style={{ backgroundColor: 'var(--hero-orb-primary)' }}
      />
      <div
        className="absolute bottom-1/4 right-[10%] w-[400px] h-[400px]
                   rounded-full blur-[110px] animate-float-slower pointer-events-none
                   transition-colors duration-500"
        style={{ backgroundColor: 'var(--hero-orb-secondary)' }}
      />

      {/* ── Layer 3: Subtle grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          opacity: isDark ? 0.6 : 0.4,
        }}
      />

      {/* ── Layer 4: City overlay SVG ── */}
      {/*
        - Uses CSS var --hero-overlay-src to swap dark/light asset automatically
        - mix-blend-mode "screen" on dark: white silhouette glows through
        - mix-blend-mode "multiply" on light: dark silhouette stamps into bg
        - Positioned at bottom of section so skyline sits at the horizon
        - Width extends beyond container for cinematic feel
        - pointer-events-none so it never blocks clicks
      */}
      <div
        className="hero-city-overlay absolute inset-x-0 bottom-0
                   h-[65%] pointer-events-none"
        // Framer Motion: very slow fade in — city reveals as page loads
        // Done via CSS transition defined in globals.css
      />

      {/* ── Layer 5: Bottom fade — city blends into content below ── */}
      <div
        className="absolute bottom-0 inset-x-0 h-48 pointer-events-none"
        style={{
          background: isDark
            ? 'linear-gradient(to top, var(--color-bg) 0%, transparent 100%)'
            : 'linear-gradient(to top, var(--color-bg) 0%, transparent 100%)',
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6
                      pt-28 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* LEFT: Text content */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="flex flex-col gap-7"
        >
          {/* Eyebrow pill */}
          <motion.div variants={fadeUp}>
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                         text-xs font-medium tracking-widest uppercase
                         border transition-colors duration-300"
              style={{
                backgroundColor: 'var(--color-primary-muted)',
                borderColor: 'rgba(111,75,170,0.25)',
                color: 'var(--color-primary-light)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-pulse" />
              Nairobi&apos;s Premium Digital Studio
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            variants={fadeUp}
            className="font-medium leading-[1.06] tracking-tight"
            style={{
              fontSize: 'clamp(2.75rem, 5.5vw, 5rem)',
              color: 'var(--color-text)',
            }}
          >
            We build digital
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--gradient-brand)' }}
            >
              products that work.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            className="font-normal text-lg leading-relaxed max-w-[520px]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Partnering with Nairobi&apos;s ambitious founders and SMEs to create
            high-fidelity software and systems.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 pt-1">
            <Link
              href="/start-project"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                         bg-primary text-white font-medium text-sm
                         hover:bg-primary-light transition-colors duration-300
                         shadow-xl shadow-primary/25 focus:outline-none
                         focus:ring-2 focus:ring-primary/50"
            >
              Start a Project
              <IconArrowRight size={16} stroke={2} />
            </Link>

            <Link
              href="/our-portfolio"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                         font-medium text-sm border
                         hover:border-primary/30 transition-all duration-300
                         focus:outline-none focus:ring-2 focus:ring-primary/50"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(111,75,170,0.06)',
                borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(111,75,170,0.15)',
                color: 'var(--color-text)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <IconPlayerPlay size={16} stroke={1.5} />
              See Our Work
            </Link>
          </motion.div>

          {/* Social proof micro-line */}
          <motion.div variants={fadeUp} className="flex items-center gap-3 pt-1">
            {/* Mini avatar stack */}
            <div className="flex -space-x-2">
              {['#8c6cd9', '#00C6FB', '#10B981', '#F59E0B'].map((color, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 flex items-center
                             justify-center text-[10px] font-medium text-white shrink-0"
                  style={{
                    backgroundColor: color,
                    borderColor: 'var(--color-bg)',
                  }}
                />
              ))}
            </div>
            <p
              className="text-xs font-normal"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Trusted by Kenya&apos;s most ambitious companies
            </p>
          </motion.div>
        </motion.div>

        {/* RIGHT: Floating dashboard mockup card */}
        <motion.div
          initial={{ opacity: 0, x: 48, scale: 0.95 }}
          animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
          transition={{ ...SPRING, delay: 0.35 }}
          className="hidden lg:flex items-center justify-center"
        >
          <HeroMockupCard isDark={isDark} />
        </motion.div>
      </div>

      {/* ── Scroll cue ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.7 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2
                   flex flex-col items-center gap-2"
      >
        <span
          className="text-[10px] tracking-widest uppercase font-normal"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Scroll
        </span>
        <div
          className="w-px h-8"
          style={{
            background: `linear-gradient(to bottom, var(--color-text-muted), transparent)`,
          }}
        />
      </motion.div>
    </section>
  );
}

/* ── Floating Dashboard Mockup ── */
function HeroMockupCard({ isDark }: { isDark: boolean }) {
  const cardBg    = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.75)';
  const chipBg    = isDark ? 'var(--color-bg-elevated)' : 'rgba(237,232,255,0.90)';
  const statBg    = isDark ? 'var(--color-bg-elevated)' : 'var(--color-bg-elevated)';
  const border    = isDark ? 'rgba(255,255,255,0.10)'  : 'rgba(111,75,170,0.15)';

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut' }}
      className="relative w-full max-w-[460px]"
    >
      {/* Main glass card */}
      <div
        className="rounded-2xl p-6 shadow-2xl"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${border}`,
          backdropFilter: 'blur(20px)',
          boxShadow: isDark
            ? '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
            : '0 24px 64px rgba(111,75,170,0.15), 0 0 0 1px rgba(111,75,170,0.08)',
        }}
      >
        {/* Card header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p
              className="text-[10px] uppercase tracking-wider font-medium mb-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Active Project
            </p>
            <p
              className="font-medium text-sm"
              style={{ color: 'var(--color-text)' }}
            >
              Equity Bank — Mobile Banking
            </p>
          </div>
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
            style={{
              backgroundColor: 'var(--color-accent-muted)',
              border: '1px solid rgba(16,185,129,0.25)',
              color: 'var(--color-accent)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Live
          </span>
        </div>

        {/* Sprint progress bar */}
        <div className="mb-5">
          <div className="flex justify-between mb-1.5">
            <span
              className="text-xs font-normal"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Sprint Progress
            </span>
            <span
              className="text-xs font-mono"
              style={{ color: 'var(--color-text)' }}
            >
              78%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg-overlay)' }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '78%' }}
              transition={{ duration: 1.4, delay: 0.9, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundImage: 'var(--gradient-brand)' }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Delivered', value: '14' },
            { label: 'In Review', value: '3' },
            { label: 'Days Left', value: '8' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: statBg }}
            >
              <p
                className="font-mono text-lg"
                style={{ color: 'var(--color-text)' }}
              >
                {s.value}
              </p>
              <p
                className="text-[10px] font-normal mt-0.5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Team + engineers count */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {['#8c6cd9', '#00C6FB', '#10B981', '#F59E0B'].map((color, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 flex items-center
                           justify-center text-[10px] font-medium text-white"
                style={{
                  backgroundColor: color,
                  borderColor: isDark ? 'var(--color-bg-surface)' : '#ffffff',
                }}
              />
            ))}
          </div>
          <span
            className="text-xs font-mono"
            style={{ color: 'var(--color-text-muted)' }}
          >
            4 engineers
          </span>
        </div>
      </div>

      {/* Floating chip: tech stack */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -top-4 -right-4 rounded-xl px-3 py-2 shadow-lg"
        style={{
          backgroundColor: chipBg,
          border: `1px solid ${border}`,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-1.5">
          {[
            { label: 'React',  color: '#00C6FB' },
            { label: 'Next',   color: '#8c6cd9' },
            { label: 'Node',   color: '#10B981' },
          ].map((t, i) => (
            <span key={t.label} className="flex items-center gap-1">
              <span
                className="text-xs font-mono font-medium"
                style={{ color: t.color }}
              >
                {t.label}
              </span>
              {i < 2 && (
                <span style={{ color: 'var(--color-text-muted)' }}>·</span>
              )}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Floating chip: delivery status */}
      <motion.div
        animate={{ y: [0, 7, 0] }}
        transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut', delay: 1.1 }}
        className="absolute -bottom-4 -left-4 rounded-xl px-3 py-2 shadow-lg"
        style={{
          backgroundColor: chipBg,
          border: `1px solid ${border}`,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span
            className="text-xs font-normal"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            On track · 2 weeks left
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

---

## PHASE 5 — HOW THE CITY OVERLAY WORKS (Summary)

```
DARK MODE:
  Asset:      /public/assets/hero-dark.svg  (white silhouette)
  Opacity:    0.08  (very subtle — city is a ghost in the background)
  Blend mode: screen  (white silhouette literally screens/glows over dark bg)
  Effect:     Faint glowing Nairobi skyline at the horizon

LIGHT MODE:
  Asset:      /public/assets/hero-light.svg  (inverted/dark silhouette)
  Opacity:    0.07  (even more subtle on light — too heavy = muddy)
  Blend mode: multiply  (dark silhouette stamps into light bg like an ink print)
  Effect:     Delicate ink-sketch Nairobi skyline on light lavender bg

HOW THE SWAP HAPPENS:
  1. ThemeProvider updates html[data-theme]
  2. CSS selects the correct --hero-overlay-src, --hero-overlay-opacity,
     --hero-overlay-blend variables
  3. .hero-city-overlay class reads those vars
  4. background-image, opacity, mix-blend-mode all update in one paint
  5. transition: opacity 0.4s ease makes it fade gracefully between themes
  6. background-image: 0s — instant asset swap (no fade flash on wrong asset)
```

---

## PHASE 6 — VERIFICATION CHECKLIST

### Theme System
- [ ] `ThemeProvider` wraps entire app in root `layout.tsx`
- [ ] `suppressHydrationWarning` on `<html>` element — no hydration mismatch
- [ ] Theme persists in `localStorage` key `andishi-theme` across page refreshes
- [ ] System preference respected on first visit (no stored value)
- [ ] `html[data-theme="dark"]` and `html[data-theme="light"]` both defined in globals.css
- [ ] `useTheme()` throws descriptive error if used outside provider

### Theme Toggle (Navbar)
- [ ] `ThemeToggle` renders in Navbar right cluster, left of CTA button
- [ ] Sun icon shows in dark mode (click → switches to light)
- [ ] Moon icon shows in light mode (click → switches to dark)
- [ ] Icon swap animates with spring — no jarring cut
- [ ] Toggle button has visible focus ring (`focus:ring-2 focus:ring-primary/50`)
- [ ] `aria-label` updates dynamically: "Switch to light mode" / "Switch to dark mode"

### City Overlay
- [ ] `hero-dark.svg` placed at `/public/assets/hero-dark.svg`
- [ ] `hero-light.svg` placed at `/public/assets/hero-light.svg`
- [ ] `.hero-city-overlay` div present in HeroSection as a `position: absolute` layer
- [ ] City sits at bottom half of hero — skyline at horizon line
- [ ] Opacity is subtle: city is felt, not seen — does NOT compete with headline text
- [ ] Dark mode: blend mode is `screen` — silhouette glows softly
- [ ] Light mode: blend mode is `multiply` — silhouette stamps as ink
- [ ] Bottom fade gradient hides the hard edge of the city overlay
- [ ] `pointer-events: none` on overlay — never blocks CTA clicks
- [ ] Overlay does NOT appear on mobile (375px) — too busy; hide with `md:block hidden` or via CSS

### Hero Section
- [ ] H1 gradient (`from-primary-light to-secondary`) renders in both themes
- [ ] Eyebrow pill background and border use theme-aware CSS vars
- [ ] Glass CTA button adjusts opacity in dark vs light
- [ ] Orbs use `--hero-orb-primary` and `--hero-orb-secondary` CSS vars
- [ ] Grid overlay opacity adjusts per theme (0.6 dark, 0.4 light)
- [ ] Mockup card `cardBg` changes: semi-transparent dark vs white/75 light
- [ ] Avatar border colour in mockup card adapts to theme background
- [ ] Floating chips backdrop-filter blur works in both themes
- [ ] No `font-bold` or `font-semibold` anywhere in HeroSection or mockup
- [ ] All numeric values in mockup (`14`, `3`, `8`, `78%`, `4 engineers`) use `font-mono`

### Performance
- [ ] City overlay SVG loaded as `background-image` via CSS — NOT inlined in TSX
- [ ] No base64 data URI in component files — SVGs are external files in `/public`
- [ ] City overlay div does not cause layout shift (use `position: absolute`)
- [ ] Floating animations use CSS keyframes — not Framer Motion (cheaper for infinite loops)
- [ ] Mockup progress bar and card use Framer Motion only for entrance — not infinite
