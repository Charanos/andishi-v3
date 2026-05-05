# Andishi v3 — Complete Project Specification

**andishi.dev · Cosmic Identity · Market-Resonant Copy · AI-SEO Ready**

> **This is the single source of truth.** Design system, copy, component recipes,
> migration notes from v2, implementation guidance, and launch checklist — unified.
> Hand this to a developer and they build the full page without asking a single question.
>
> **Design authority:** DESIGN.md (Cosmic Identity) is primary.
> Component patterns from Future School (Component_Library + THEME_GUIDE) are
> adopted selectively — fonts, animation springs, tooltip patterns, glass card structure.
> **Codebase reality:** v2 audit (V3_CURRENT_STATE_AUDIT.md) is the ground truth for
> what exists, what to preserve, and what to surgically replace.

> **Current implementation status, May 5, 2026:** the v3 visual foundation is now
> established in code. The homepage hero, brand/client divider, and "The real
> situation" content have been consolidated into one seamless section in
> `src/components/sections/hero-section.tsx`. This section is the current quality
> bar for the remaining homepage sections and supporting landing pages.

---

# CONTENTS

1. [Identity & Philosophy](#1-identity--philosophy)
2. [Tech Stack — v2 Confirmed + v3 Deltas](#2-tech-stack)
3. [Design Tokens — Colors](#3-design-tokens--colors)
4. [Typography System](#4-typography-system)
5. [Glassmorphism Recipe](#5-glassmorphism-recipe)
6. [Elevation & Depth Model](#6-elevation--depth-model)
7. [Spacing & Layout Grid](#7-spacing--layout-grid)
8. [Animation & Motion](#8-animation--motion)
9. [Component Library](#9-component-library)
10. [Route Map — Full Site](#10-route-map)
11. [Database & Auth — Preserve Entirely](#11-database--auth)
12. [Section-by-Section: Copy + Design + Migration](#12-section-by-section)
13. [AI-SEO Technical Setup](#13-ai-seo-technical-setup)
14. [Launch Sequence](#14-launch-sequence)
15. [Developer Checklist](#15-developer-checklist)

---

# 1. Identity & Philosophy

## Concept: Cosmic Order

**Not:** generic dark SaaS, cheap sci-fi, sparkle icons, mesh gradients, purple-on-white.
**Is:** cinematic, gallery-grade, orbital. The interface of a precision instrument that also happens to run a business.

The metaphor is a **layered orbital system.** Content exists in glass planes floating above a deep-space void. The user is the observer — looking through lenses, reading signals, making decisions. Every surface has refraction depth. Nothing is flat. Depth is communicated through Z-stacking and refractive opacity — not traditional shadows.

## Brand Voice

- Direct. No filler copy.
- Specific over vague. "11 days" not "fast."
- Confident without being loud.
- Technical precision paired with human warmth.
- Nairobi-grounded. Globally readable.

## What v3 explicitly kills from v2

- `font-bold` / `font-semibold` — used extensively across v2, zero tolerance in v3
- `Nunito` + `Montserrat` — replaced by `Outfit` + `JetBrains Mono`
- `.monty` custom class — retire it, replace all instances
- `react-icons/fa`, `react-icons/si`, `lucide-react` — replaced by `@tabler/icons-react`
- Hardcoded hex colors — `#0B0D0E`, `#05122273`, `#96aeff`, `#c156ff`, `purple-400/500/900` etc. — replaced by CSS tokens
- `animate-pulse` for ambient effects — replaced by CSS glow orbs and spring-based Framer Motion
- `ease: "easeOut"` Framer configs — replaced by spring physics
- Sparkle / star decorative icons — removed entirely

---

# 2. Tech Stack

## Confirmed Stack (from v2 audit — keep as-is)

| Layer         | Technology                         | Version            | v3 Action                  |
| ------------- | ---------------------------------- | ------------------ | -------------------------- |
| Framework     | Next.js App Router                 | 15.3.3             | ✅ Keep                    |
| Language      | TypeScript                         | ^5                 | ✅ Keep                    |
| Styling       | Tailwind CSS v4 + tw-animate-css   | ^4.1.8             | ✅ Keep                    |
| Animation     | Framer Motion                      | ^12.16.0           | ✅ Keep, update configs    |
| Database      | MongoDB via Prisma + native driver | —                  | ✅ Keep, no schema changes |
| ORM           | Prisma Client                      | ^6.10.1            | ✅ Keep                    |
| Auth          | Custom JWT (jose) + next-auth      | ^6.0.11 / ^4.24.11 | ✅ Keep entirely           |
| Forms         | React Hook Form + Zod              | ^7.58.0 / ^3.25.64 | ✅ Keep                    |
| Charts        | Chart.js + Recharts                | ^4.5.0 / ^3.0.2    | ✅ Keep (dashboards)       |
| Maps          | Leaflet                            | ^1.9.4             | ✅ Keep (contact page)     |
| Smooth Scroll | Lenis                              | ^1.3.4             | ✅ Keep                    |
| Analytics     | Vercel Analytics + GA4 + FB Pixel  | —                  | ✅ Keep all tags           |

## v3 Package Changes

| Action    | Package                                      | Notes                          |
| --------- | -------------------------------------------- | ------------------------------ |
| ➕ ADD    | `@tabler/icons-react`                        | Replaces all icon libraries    |
| ➕ ADD    | `@fontsource/outfit` OR Google Fonts         | Replaces Nunito + Montserrat   |
| ➕ ADD    | `@fontsource/jetbrains-mono` OR Google Fonts | New numeric font               |
| ❌ REMOVE | `react-icons`                                | After full replacement audit   |
| ❌ REMOVE | `lucide-react`                               | After full replacement audit   |
| ⚠️ AUDIT  | Radix UI primitives                          | Keep what's used in dashboards |

## Google Fonts Import (globals.css)

```css
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap");
```

---

# 3. Design Tokens — Colors

## Current Implemented Token Direction

The codebase now uses a dual-theme violet/cyan system that avoids overloading the
interface with purple while preserving Andishi's cosmic identity.

```css
/* Light mode */
--on-surface: #160B2F;       /* high-contrast violet ink */
--on-surface-dim: #46365F;   /* readable secondary text */
--primary: #56309B;          /* deeper violet for light surfaces */
--secondary: #00BFEA;        /* cyan signal */
--gradient-brand: linear-gradient(135deg, #4D2A91 0%, #6554D9 48%, #00BFEA 100%);

/* Dark mode */
--on-surface: #F4EEFF;       /* luminous violet-white primary text */
--on-surface-dim: #C5B8E8;   /* softer violet secondary text */
--primary: #D8C8FF;          /* light violet accent */
--secondary: #4CD7F6;        /* cyan signal */
--gradient-brand: linear-gradient(135deg, #D8C8FF 0%, #8F77FF 42%, #4CD7F6 100%);
```

Primary text should feel violet-tinted, not pure black/white. CTA gradients use
violet-to-cyan with a professional mid-violet transition, plus `--cta-shadow` for
depth. Use raw `text-white` only where a filled gradient button needs maximum
legibility.

## CSS Custom Properties (globals.css — replace all hardcoded values)

```css
:root {
  /* ── Backgrounds ─────────────────────────────── */
  --bg: #100c1a; /* page base — violet-tinted void */
  --bg-deep: #0f0d15; /* deepest layer — behind cosmic art */
  --surface-low: #1d1a23;
  --surface: #211e27;
  --surface-high: #2c2832;
  --surface-highest: #37333d;
  --surface-bright: #3b3742;

  /* ── Text ────────────────────────────────────── */
  --on-surface: #e7e0ed; /* primary text */
  --on-surface-dim: #cbc3d7; /* secondary / captions */
  --inverse-surface: #e7e0ed;
  --inverse-on-surface: #322f39;

  /* ── Primary — Violet ────────────────────────── */
  --primary: #d0bcff;
  --on-primary: #3c0091;
  --primary-container: #a078ff;
  --on-primary-container: #340080;
  --primary-fixed: #e9ddff;
  --primary-fixed-dim: #d0bcff;
  --inverse-primary: #6d3bd7;

  /* ── Secondary — Cyan ────────────────────────── */
  --secondary: #4cd7f6;
  --on-secondary: #003640;
  --secondary-container: #03b5d3;
  --on-secondary-container: #00424e;
  --secondary-fixed: #acedff;
  --secondary-fixed-dim: #4cd7f6;

  /* ── Tertiary — Amber ────────────────────────── */
  --tertiary: #ffb869;
  --on-tertiary: #482900;
  --tertiary-container: #ca801e;
  --on-tertiary-container: #3f2300;

  /* ── Structural ──────────────────────────────── */
  --outline: #958ea0;
  --outline-variant: #494454;
  --surface-tint: #d0bcff;

  /* ── Error ───────────────────────────────────── */
  --error: #ffb4ab;
  --error-container: #93000a;
  --on-error-container: #ffdad6;
}
```

## Semantic Color Usage

| Token                 | Where                                           |
| --------------------- | ----------------------------------------------- |
| `--bg`                | Page background, never replaced                 |
| `--bg-deep`           | Behind cosmic art layers, deepest z-level       |
| `--surface-low`       | Subtle section dividers, inactive states        |
| `--surface`           | Default glass card base                         |
| `--surface-high`      | Elevated cards, hover states                    |
| `--surface-highest`   | Modals, tooltips, top-layer overlays            |
| `--on-surface`        | All primary body text                           |
| `--on-surface-dim`    | Labels, captions, secondary descriptions        |
| `--primary`           | Interactive links, glow accents, CTA highlights |
| `--primary-container` | Button fills, active pill backgrounds           |
| `--secondary`         | Cyan data signals, timelines, border glows      |
| `--tertiary`          | Amber accents, stat highlights, testimonials    |
| `--outline-variant`   | Glass card borders (default)                    |
| `--outline`           | Focused/active borders                          |

## v2 → v3 Color Migration Map

```
purple-400 / purple-500       →  var(--primary) / #d0bcff
purple-900/50                 →  bg-[#d0bcff]/5
#00C6FB (v2 primary cyan)     →  var(--secondary) / #4cd7f6
#0B0D0E (v2 background)       →  var(--bg) / #15121b
#96aeff, #c156ff (hardcoded)  →  var(--primary) or var(--primary-container)
bg-purple-500/20              →  bg-[#d0bcff]/8
text-white                    →  text-[--on-surface]
text-gray-400                 →  text-[--on-surface-dim]
```

## Glassmorphism Color Formulas (Tailwind v4)

```
Card base:        bg-white/[0.04]
Card border:      border border-white/[0.08]
Card border glow: shadow-[0_0_0_1px_rgba(76,215,246,0.2)]
Blur:             backdrop-blur-xl  (24px) or backdrop-blur-2xl (40px)
Shadow:           shadow-xl shadow-black/25
Violet glow orb:  absolute bg-[#6d3bd7]/15 blur-[120px] rounded-full
Cyan glow orb:    absolute bg-[#4cd7f6]/10 blur-[100px] rounded-full
```

---

# 4. Typography System

## Font Stack

### Primary — Outfit (Headlines, UI, Body)

Replaces Nunito (body) and Montserrat (headings). Geometric, humanistic, airy at light weights.

### Numeric — JetBrains Mono (Stats, Metrics, IDs, Tables)

Used exclusively for data. Creates "technical instrumentation" contrast against Outfit.

> **Why this pairing:** Outfit 300 feels like open space. JetBrains Mono grounds numbers
> like "11 days" or "14 clients" in precision. One font feels like cosmos; the other like
> the instrument reading it. In dashboards, JetBrains Mono replaces body font for all
> stat values, currency, IDs, and table data — directly mirroring the Future School pattern.

## Type Scale

```css
/* Display — hero headlines */
.display-xl {
  font-family: "Outfit", sans-serif;
  font-size: clamp(48px, 6vw, 80px);
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

/* Section headlines */
.headline-lg {
  font-family: "Outfit", sans-serif;
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* Subsection / card titles */
.headline-md {
  font-family: "Outfit", sans-serif;
  font-size: clamp(22px, 2.5vw, 32px);
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

/* Body text */
.body-lg {
  font-family: "Outfit", sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: 0em;
}

.body-md {
  font-family: "Outfit", sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: 0em;
}

/* Nav labels, caps tags, section markers */
.label-caps {
  font-family: "Outfit", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

/* Stats, numbers, metrics */
.mono-stat {
  font-family: "JetBrains Mono", monospace;
  font-size: clamp(28px, 3vw, 48px);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* Table data, IDs, small numbers */
.mono-sm {
  font-family: "JetBrains Mono", monospace;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.02em;
}
```

## Typography Hard Rules

- **NEVER use `font-bold` (700) or `font-semibold` (600).** Emphasis from scale and color — not thickness. Zero exceptions.
- Weight 300 for display and large headlines only
- Weight 400 for body, card descriptions, FAQ text
- Weight 500 for labels, nav, caps tags only
- `JetBrains Mono` for numbers exclusively: stats, timelines, prices, client counts, table data, IDs
- `.monty` class — retire completely, find all usages and replace

## v2 Typography Migration

```
font-bold / font-semibold   →  remove; use scale or color for emphasis
Nunito (body)               →  Outfit 400
Montserrat (headings)       →  Outfit 300
.monty class                →  delete class, replace with Outfit weight 400/300
All stat values             →  wrap in font-['JetBrains_Mono']
Dashboard table numbers     →  font-['JetBrains_Mono'] text-[--on-surface]
```

---

# 5. Glassmorphism Recipe

## Standard Glass Card

```css
.glass-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 32px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
}

/* Inner light gradient — top-left to bottom-right (orbital light direction) */
.glass-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(208, 188, 255, 0.04) 0%,
    transparent 50%,
    rgba(76, 215, 246, 0.02) 100%
  );
  border-radius: inherit;
  pointer-events: none;
}
```

## Gradient Border Glow Variants

```css
/* Violet — primary services, CTA cards, featured items */
.glass-card--violet {
  box-shadow:
    0 0 0 1px rgba(208, 188, 255, 0.15),
    0 24px 48px rgba(0, 0, 0, 0.25);
}

/* Cyan — timelines, process steps, data cards */
.glass-card--cyan {
  box-shadow:
    0 0 0 1px rgba(76, 215, 246, 0.2),
    0 24px 48px rgba(0, 0, 0, 0.25);
}

/* Amber — testimonials, social proof, founder */
.glass-card--amber {
  box-shadow:
    0 0 0 1px rgba(255, 184, 105, 0.2),
    0 24px 48px rgba(0, 0, 0, 0.25);
}

/* Hover — all cards */
.glass-card:hover {
  background: rgba(255, 255, 255, 0.065);
  border-color: rgba(255, 255, 255, 0.14);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}
```

## Ghost Glass Button

```css
/* Secondary actions, nav CTAs, ghost buttons */
.btn-ghost-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(208, 188, 255, 0.25);
  border-radius: 9999px;
  padding: 12px 28px;
  color: var(--primary);
  font-family: "Outfit", sans-serif;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: all 0.3s ease;
}

.btn-ghost-glass:hover {
  border-color: rgba(76, 215, 246, 0.5);
  background: rgba(208, 188, 255, 0.08);
  box-shadow: 0 0 20px rgba(76, 215, 246, 0.15);
}

/* Primary CTA — one per page, hero only */
.btn-primary {
  background: rgba(160, 120, 255, 0.2);
  border: 1px solid rgba(208, 188, 255, 0.4);
  border-radius: 9999px;
  padding: 14px 32px;
  color: var(--primary-fixed);
  font-family: "Outfit", sans-serif;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: rgba(160, 120, 255, 0.35);
  box-shadow: 0 0 32px rgba(208, 188, 255, 0.2);
}
```

---

# 6. Elevation & Depth Model

Five Z-levels. Never skip a level or mix properties between them.

```
Level 0 — Deep Space
  z-index:  0
  bg:       --bg-deep (#0f0d15)
  Use:      Cosmic background art, radial glow orbs
  Rule:     No blur, no border. The void.

Level 1 — Orbital Planes
  z-index:  1
  bg:       rgba(255,255,255,0.02)
  blur:     backdrop-blur-[60px]
  border:   1px solid rgba(255,255,255,0.04)
  Use:      Full-section structural overlays, hero backdrop, footer

Level 2 — Active Glass Cards  (default)
  z-index:  2
  bg:       rgba(255,255,255,0.04)   [bg-white/[0.04]]
  blur:     backdrop-blur-xl (24px)
  border:   1px solid rgba(255,255,255,0.08)
  shadow:   inset 0 1px 0 rgba(255,255,255,0.08)
  Use:      Service cards, FAQ items, case studies, stat blocks

Level 3 — Elevated / Hover
  z-index:  3
  bg:       rgba(255,255,255,0.07)
  blur:     backdrop-blur-2xl (40px)
  border:   1px solid rgba(208,188,255,0.2)
  Use:      Hovered cards, featured/highlighted items, Andishi column in table

Level 4 — Interaction Layer
  z-index:  100   ← z-[100] in Tailwind (define in globals.css)
  bg:       rgba(55,51,61,0.95)   (--surface-highest near-opaque)
  blur:     backdrop-blur-2xl
  border:   1px solid rgba(76,215,246,0.25)   (Stellar border — cyan)
  Use:      Tooltips, dropdowns, modals, command palette
```

## z-index Tokens (add to globals.css)

```css
/* Tailwind v4 — define custom z-index utilities */
@layer utilities {
  .z-100 {
    z-index: 100;
  }
}
```

---

# 7. Spacing & Layout Grid

## Spacing Units

```
Base:    8px
space-1:   8px
space-2:  16px
space-3:  24px   ← gutter between cards
space-4:  32px   ← glass-padding (card interior)
space-5:  40px
space-6:  48px
space-8:  64px   ← margin-safe (page sides on desktop)
space-10: 80px
space-20: 160px  ← section-gap (breathe between sections)
```

## Grid

- 12-column, max-width `1280px`, centered, `64px` side margins
- Asymmetric column splits encouraged: 7+3, 8+4, 5+7 — not everything 6+6
- Grid-breaking elements allowed: headlines that overflow their column, images bleeding edge
- Mobile: single column, `24px` side margin, section-gap compresses to `80px`

## Corner Radius

```
--rounded-sm:   4px    (tags, chips, small labels)
--rounded:      8px    (inputs, small buttons)
--rounded-md:  12px    (icon wrappers)
--rounded-lg:  16px    (cards — primary)
--rounded-xl:  24px    (large feature cards)
--rounded-full: 9999px (pills, avatars, CTA buttons)
```

---

# 8. Animation & Motion

## Philosophy

Staggered, physics-based. One well-orchestrated page-load sequence beats scattered micro-interactions. Think planetary alignment — items entering orbit one at a time.

## Spring Configs (lib/motion.ts)

```ts
// Standard card / section entrance
export const cosmicSpring = {
  type: "spring" as const,
  damping: 28,
  stiffness: 180,
  mass: 0.8,
};

// Lighter — tooltips, hover state lifts
export const floatSpring = {
  type: "spring" as const,
  damping: 22,
  stiffness: 220,
};

// NOTE: v2 used ease: "easeOut" — replace all instances with cosmicSpring
```

## Stagger Pattern

```ts
// lib/motion.ts — shared across all sections
export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: cosmicSpring },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { ...cosmicSpring, delay: 0.1 } },
};
```

## Standard Transitions

```css
transition-all duration-300   /* all hover effects */
focus-visible:ring-2 focus-visible:ring-[#d0bcff]/50 focus-visible:outline-none
```

## Glow Orb CSS (no JS needed)

```css
.glow-orb {
  position: absolute;
  border-radius: 9999px;
  pointer-events: none;
  filter: blur(80px);
}

.glow-orb--violet {
  width: 600px;
  height: 600px;
  background: radial-gradient(
    circle,
    rgba(109, 59, 215, 0.18) 0%,
    transparent 70%
  );
}

.glow-orb--cyan {
  width: 500px;
  height: 500px;
  background: radial-gradient(
    circle,
    rgba(76, 215, 246, 0.12) 0%,
    transparent 70%
  );
  filter: blur(100px);
}

/* v2 used animate-pulse for ambient — replace with these static orbs + subtle CSS keyframe */
@keyframes orb-drift {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(20px, -15px) scale(1.05);
  }
}
.glow-orb {
  animation: orb-drift 12s ease-in-out infinite;
}
```

---

# 9. Component Library

## 9.1 GlassCard

The core container. Replaces v2's `<Card />` component (`app/components/Card.tsx`).

```tsx
// app/components/ui/GlassCard.tsx
interface GlassCardProps {
  children: React.ReactNode;
  glow?: "violet" | "cyan" | "amber" | "none";
  level?: 2 | 3;
  bento?: boolean; // adds group class for hover-triggered children
  className?: string;
}

const glowMap = {
  violet:
    "shadow-[0_0_0_1px_rgba(208,188,255,0.15),0_24px_48px_rgba(0,0,0,0.25)]",
  cyan: "shadow-[0_0_0_1px_rgba(76,215,246,0.2),0_24px_48px_rgba(0,0,0,0.25)]",
  amber:
    "shadow-[0_0_0_1px_rgba(255,184,105,0.2),0_24px_48px_rgba(0,0,0,0.25)]",
  none: "shadow-xl shadow-black/25",
};

// Base classes
const base = [
  "relative overflow-hidden rounded-xl p-8",
  "bg-white/[0.04] backdrop-blur-xl",
  "border border-white/[0.08]",
  "transition-all duration-300",
  "hover:bg-white/[0.065] hover:border-white/[0.14] hover:-translate-y-0.5",
].join(" ");

// Inner gradient overlay — always render this child div inside
// <div className="absolute inset-0 bg-gradient-to-br from-[#d0bcff]/[0.04]
//                 via-transparent to-[#4cd7f6]/[0.02] rounded-xl pointer-events-none" />
```

## 9.2 Button

Replaces v2's `<CTAButton />` (`app/components/CTAButton.tsx`).

```tsx
// app/components/ui/Button.tsx
// variants: 'primary' | 'ghost' | 'glass' | 'danger'

// Ghost Glass — nav, secondary CTAs
const ghost = [
  "px-7 py-3 rounded-full backdrop-blur-sm",
  "bg-white/[0.05] border border-[#d0bcff]/25",
  "text-[#d0bcff] text-[15px] font-[500] tracking-[0.02em]",
  "transition-all duration-300",
  "hover:border-[#4cd7f6]/50 hover:bg-[#d0bcff]/[0.08]",
  "hover:shadow-[0_0_20px_rgba(76,215,246,0.15)]",
  "focus-visible:ring-2 focus-visible:ring-[#d0bcff]/50 focus-visible:outline-none",
].join(" ");

// Primary — hero CTA only
const primary = [
  "px-8 py-3.5 rounded-full",
  "bg-[#a078ff]/20 border border-[#d0bcff]/40",
  "text-[#e9ddff] text-[15px] font-[500] tracking-[0.02em]",
  "transition-all duration-300",
  "hover:bg-[#a078ff]/35 hover:shadow-[0_0_32px_rgba(208,188,255,0.2)]",
  "focus-visible:ring-2 focus-visible:ring-[#d0bcff]/50 focus-visible:outline-none",
].join(" ");

// Danger — destructive actions in dashboards
const danger = [
  "px-6 py-2.5 rounded-full",
  "bg-[#93000a]/30 border border-[#ffb4ab]/25",
  "text-[#ffb4ab] text-[14px] font-[500]",
  "transition-all duration-300",
  "hover:bg-[#93000a]/50 hover:border-[#ffb4ab]/40",
].join(" ");
```

## 9.3 Label / Tag Chip

```tsx
// Section label — above headlines
"inline-block px-3 py-1 rounded-full text-[11px] font-[500]
 uppercase tracking-[0.15em]
 bg-[#d0bcff]/10 border border-[#d0bcff]/20 text-[#d0bcff]"

// Status chip — timelines, case studies (JetBrains Mono)
"inline-block px-2.5 py-0.5 rounded-full
 font-['JetBrains_Mono'] text-[12px]
 bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/20"

// Role badge — dashboards (replaces existing badge styles)
"inline-block px-2.5 py-1 rounded-full text-[11px] font-[500]
 uppercase tracking-[0.1em]
 bg-[#d0bcff]/10 border border-[#d0bcff]/15 text-[#d0bcff]"   /* ADMIN */
"bg-[#4cd7f6]/10 border-[#4cd7f6]/15 text-[#4cd7f6]"          /* CLIENT */
"bg-[#ffb869]/10 border-[#ffb869]/15 text-[#ffb869]"          /* DEVELOPER */
```

## 9.4 Tooltip

Applied to all KPI stats, case study metrics, timeline numbers. Uses Framer Motion.
Replaces existing tooltip patterns in v2 dashboards.

```tsx
// app/components/ui/Tooltip.tsx
// z-[100] — floating above all other layers

const tooltipVariants = {
  hidden: { opacity: 0, y: 4, scale: 0.96 },
  show:   { opacity: 1, y: 0, scale: 1,
            transition: { type: "spring", damping: 22, stiffness: 220 } }
}

// Styling
"absolute z-[100] px-3 py-2 rounded-lg text-[13px] font-[400]
 bg-[#37333d]/95 backdrop-blur-xl
 border border-[#4cd7f6]/25
 text-[#e7e0ed] shadow-xl shadow-black/30
 pointer-events-none whitespace-nowrap"
```

## 9.5 Stat Block (Insights Pattern)

Used in social proof strip, dashboard KPIs, case study results.

```tsx
// Wrap in GlassCard with bento + group className

// Top row
<div className="flex items-center justify-between mb-3">
  <span className="text-[11px] font-[500] uppercase tracking-[0.15em] text-[--on-surface-dim]">
    CLIENTS SHIPPED
  </span>
  <div className="w-8 h-8 rounded-lg bg-[#d0bcff]/10 flex items-center justify-center">
    <IconBuildingStore size={16} stroke={1.5} className="text-[#d0bcff]" />
  </div>
</div>

// Value — JetBrains Mono always
<div className="font-['JetBrains_Mono'] text-[40px] font-[400]
                tracking-tight leading-none text-[--on-surface] mb-2">
  14+
</div>

// Trend / context
<div className="text-[13px] text-[--on-surface-dim] flex items-center gap-1.5">
  <IconTrendingUp size={14} stroke={1.5} className="text-[#4cd7f6]" />
  Nairobi · Mombasa · East Africa
</div>

// Ghost icon background
<div className="absolute -right-2 -bottom-2 opacity-[0.04]
                group-hover:opacity-[0.07] group-hover:scale-110
                transition-all duration-500">
  <IconBuildingStore size={80} stroke={1} className="text-[--on-surface-dim]" />
</div>
```

## 9.6 Avatar

Adapted for Andishi — preserves v2's `DevProfileModal` and talent pool display.

```tsx
// app/components/ui/Avatar.tsx
// 3-layer: initials → Dicebear SVG → user image

// Ring style for profile contexts
"ring-2 ring-[#d0bcff]/20 ring-offset-2 ring-offset-[--bg]";

// Initials gradient (name-based — preserves v2 brand-specific gradient logic)
// Keep existing gradient logic, just remap colors to new token set
// purple brand gradient → bg-gradient-to-br from-[#6d3bd7] to-[#a078ff]
// cyan brand gradient   → bg-gradient-to-br from-[#03b5d3] to-[#4cd7f6]
```

## 9.7 Input / Form Fields

Preserves React Hook Form + Zod. Visual update only.

```tsx
// app/components/ui/Input.tsx
// base input — glass well style

"w-full px-4 py-3 rounded-lg
 bg-white/[0.04] backdrop-blur-sm
 border border-white/[0.08] border-b-[#494454]
 text-[--on-surface] placeholder:text-[--on-surface-dim]
 font-['Outfit'] text-[15px] font-[400]
 transition-all duration-300
 focus:border-[#d0bcff]/40 focus:bg-white/[0.07]
 focus-visible:ring-2 focus-visible:ring-[#d0bcff]/30 focus-visible:outline-none"

// Numeric inputs — JetBrains Mono
"font-['JetBrains_Mono'] text-[15px]"
```

## 9.8 Separator

```tsx
// Section break with orbital dot
<div className="flex items-center gap-4 my-16">
  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#494454]" />
  <div className="w-1.5 h-1.5 rounded-full bg-[#d0bcff]/40" />
  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#494454]" />
</div>
```

## 9.9 Navigation (Navbar.tsx update)

Preserves existing auth-aware logic. Visual update only.

```tsx
// Keep: ConditionalLayout pattern, auth state, role-based display
// Update: colors, fonts, button styles

// Sticky glass bar
"fixed top-0 inset-x-0 z-50
 bg-[#15121b]/80 backdrop-blur-xl
 border-b border-white/[0.06]"

// Logo — Outfit 400, --on-surface
// Nav links — label-caps style, --on-surface-dim → --on-surface on hover
// CTA — Ghost Glass pill button
// Mobile hamburger → IconMenu2 from Tabler (stroke 1.5)
// Keep existing mobile drawer logic, apply glass card styling to drawer
```

## 9.10 Iconography

**Single source: `@tabler/icons-react`** — replaces all of react-icons/fa, react-icons/si, lucide-react.

```tsx
import {
  IconDeviceDesktop,
  IconShoppingCart,
  IconWorldWww,
  IconCircuitBoard,
  IconTrendingUp,
  IconChevronDown,
  IconCheck,
  IconX,
  IconMenu2,
  IconBuildingStore,
  IconArrowRight,
  IconCircleCheck,
} from "@tabler/icons-react";

// Stroke rules
// Active / primary: stroke={2}
// Inactive / secondary: stroke={1.5}
// Ghost background decorative: stroke={1}

// Sizes
// Standard UI: size={20}
// Navigation: size={22}
// Ghost background: size={80} at opacity 0.03–0.05

// Icon in colored wrapper
<div className="w-10 h-10 rounded-xl bg-[#d0bcff]/10 flex items-center justify-center">
  <IconDeviceDesktop size={20} stroke={1.5} className="text-[#d0bcff]" />
</div>;
```

---

# 10. Route Map — Full Site

## Public / Marketing Routes (v3 revamp scope)

| Route               | v2 File                                | v3 Status        | Notes                              |
| ------------------- | -------------------------------------- | ---------------- | ---------------------------------- |
| `/`                 | `app/page.tsx` (3.7KB, 11 sections)    | 🔄 Full revamp   | Core v3 landing page — this spec   |
| `/about-us`         | `app/about-us/page.tsx` (30KB)         | 🔄 Visual revamp | Preserve team data, update design  |
| `/contact-us`       | `app/contact-us/`                      | 🔄 Visual revamp | Preserve Leaflet map + form logic  |
| `/our-portfolio`    | `app/our-portfolio/`                   | 🔄 Visual revamp | Preserve project data              |
| `/tech-talent-pool` | `app/tech-talent-pool/page.tsx` (62KB) | 🔄 Visual revamp | Preserve DevProfileModal + filters |
| `/start-project`    | `app/start-project/page.tsx` (54KB)    | 🔄 Visual revamp | Preserve RHF + Zod schemas         |
| `/join-talent-pool` | `app/join-talent-pool/`                | 🔄 Visual revamp | Preserve form logic                |
| `/featured-blog`    | `app/featured-blog/`                   | 🔄 Visual revamp |                                    |
| `/login`            | `app/login/page.tsx` (754 lines)       | 🔄 Visual revamp | Keep JWT auth, update split layout |
| `/thank-you-*`      | Various                                | 🔄 Minor update  | Apply token colors                 |

## Dashboard Routes (v3 scope: design tokens + typography only)

| Route                  | Role      | Size               | v3 Approach                                                |
| ---------------------- | --------- | ------------------ | ---------------------------------------------------------- |
| `/admin-dashboard`     | ADMIN     | 117KB / 3143 lines | Apply tokens + typography only. Do NOT refactor structure. |
| `/client-dashboard`    | CLIENT    | 78KB / 2014 lines  | Apply tokens + typography only.                            |
| `/developer-dashboard` | DEVELOPER | 17KB / 455 lines   | Apply tokens + typography. Lighter lift.                   |

> **Dashboard strategy:** These are large monolithic files. v3 does NOT refactor their
> architecture. Scope is: swap colors to CSS tokens, replace fonts, replace icon imports,
> remove bold weights, apply GlassCard pattern to existing card wrappers, add JetBrains Mono
> to stat values. Do this as a separate pass after the landing page is complete.

## API Routes (preserve — no changes)

```
/api/auth/*           — JWT login/verify
/api/users            — User management
/api/projects         — Project CRUD
/api/client-projects  — Client-scoped
/api/start-project    — Public submission
/api/join-talent-pool — Developer application
/api/developer-profiles — Public listing
/api/developer-profile  — Auth'd single profile
/api/project-assignments — Assignment management
/api/project-chat     — Chat per project
```

## New Routes (add in v3)

```
/llms.txt             — AI search visibility file (static)
/pricing.md           — Machine-readable pricing (static)
/sitemap.xml          — Auto-generated via next-sitemap
```

## Recommended Route Group Structure (v3 refactor)

```
app/
├── (marketing)/          ← public pages group
│   ├── page.tsx          ← homepage
│   ├── about-us/
│   ├── contact-us/
│   ├── our-portfolio/
│   └── ...
├── (auth)/               ← login, unauthorized
├── (dashboard)/          ← protected routes
│   ├── admin-dashboard/
│   ├── client-dashboard/
│   └── developer-dashboard/
├── api/                  ← unchanged
├── components/
│   ├── ui/               ← GlassCard, Button, Tooltip, Input, Avatar...
│   ├── layout/           ← Navbar, Footer, ConditionalLayout
│   └── sections/         ← homepage sections
└── lib/
    ├── motion.ts         ← spring configs + variants
    └── ...existing...
```

---

# 11. Database & Auth — Preserve Entirely

**These systems are stable and functional. v3 is a UI/UX revamp, not a backend overhaul.**

## Auth System (DO NOT MODIFY)

```
Custom JWT via jose
Token: auth_token cookie (httpOnly) + localStorage
Middleware: middleware.ts — JWT verification, user headers injection
Hook: hooks/useAuth.ts — user, login, logout, redirectToDashboard
Roles: UserRole (ADMIN | CLIENT | DEVELOPER) in types/auth.ts
RBAC: utils/rbac.ts
Rate limiting: 5 attempts / 15-min lockout (client-side)
```

## Database Models (DO NOT MODIFY)

```
User              → id, email, firstName, lastName, role, status, isActive,
                    isOnline, lastSeen, accountCreated, projectCount, progress
DeveloperProfile  → id, data (JSON), userId
Project           → id, title, description, status, priority, budget, timeline,
                    techStack[], requiredSkills[], clientId
ProjectAssignment → projectId, developerId, role, status
ChatParticipant   → projectId, userId, role, lastRead
ChatMessage       → projectId, senderId, content, messageType, timestamp
ProjectAdminAssignment → projectId, adminId, assignedBy
```

## Third-Party Integrations (DO NOT MODIFY)

```
Google Analytics: GA4  G-8668KBDWFZ       (next/script)
Google Ads:            AW-16686798799      (next/script)
Facebook Pixel:        721165943984672     (next/script)
Vercel Analytics:      @vercel/analytics/next
Vercel Speed Insights: @vercel/speed-insights/next
WhatsApp FAB:          FloatingWhatsappButton.tsx — keep, restyle only
```

## Key Patterns to Preserve

```
ConditionalLayout   — route-based navbar/footer visibility
useProjectCRUD      — project data hooks
useProjectChat      — chat hooks
useProjectOperation — operation hooks
services/clientProjects.ts — service layer → API → Prisma
lib/formSchema.ts   — Zod schemas for all forms
PageTransition.tsx  — Framer Motion page transitions (update spring config)
SmoothScrollProvider.tsx — Lenis (keep as-is)
```

---

# 12. Section-by-Section: Copy + Design + Migration

---

## SECTION 0 — Navigation

### Copy

```
Logo:  Andishi  (logomark + wordmark)
Links: Services · Our Process · Comparison · About Us · Contact
CTA:   Book a Call
```

### Design

- Sticky `top-0 z-50`
- `bg-[#15121b]/80 backdrop-blur-xl border-b border-white/[0.06]`
- Logo: Outfit 400, `--on-surface`
- Nav links: label-caps 11px, `--on-surface-dim`, hover → `--on-surface`
- CTA: Ghost Glass pill
- Mobile: `IconMenu2` (Tabler, stroke 1.5) → glass drawer

### Migration from v2 `Navbar.tsx`

- Keep: ConditionalLayout logic, auth state, role-aware links, mobile drawer state
- Update: colors (purple → tokens), fonts (Montserrat → Outfit), icons (FA → Tabler)
- Remove: `font-bold` / `font-semibold` from logo or nav items

---

## SECTION 1 — Hero

### Current Implementation Notes

- Implemented in `src/components/sections/hero-section.tsx`.
- The hero and adjacent "The real situation" content are now one section, not two
  independent sections. This keeps the Nairobi background illustration continuous.
- The background image layer intentionally overflows the content container to
  full viewport scale so it can bleed through the hero, brand divider, and adjacent
  copy without visible repetition.
- The brand/client card sits in normal flow as the divider between hero and
  adjacent content. It should remain visually centered in the transition and never
  collide with stacked dashboard cards.
- Right-side product illustrations are compact stacked glass cards: growth
  cockpit, projects, system architecture, and KPI badge. Preserve this desktop
  direction while optimizing mobile stacking.
- Card texture uses subtle plus/cross and dot texture only. Do not use stripe
  patterns.
- Numerals in metric cards, KPI badges, and proof stats must use `font-mono`.
- Styling is intentionally Tailwind-first; do not reintroduce a hero CSS module
  unless the abstraction is truly shared.

### Copy

**Headline:** We build digital products that work.

**Subheadline:** For Kenyan and African businesses ready to move from idea to live product — without the missed deadlines, scope creep, or three-month wait.

**CTA Primary:** See Our Work
**CTA Secondary:** Book a scoping call →

**Headline A/B alternatives:**

- A: `Your competitor is already online. Let's close the gap.`
- B: `From brief to live product in weeks, not months.`
- C: `Andishi ships. Most agencies plan. There's a difference.`

### Design

- `min-h-screen`, `--bg-deep` background
- Two glow orbs: violet top-right, cyan bottom-left
- Cosmic art or 3D depth asset — circular mask `rounded-full overflow-hidden`, right side
- Headline: display-xl, Outfit 300, `--on-surface`
- Subheadline: body-lg, `--on-surface-dim`, max-width 560px
- CTAs: Primary pill + Ghost pill, side by side
- Stagger entrance: headline (0s) → sub (0.15s) → CTAs (0.3s)

### Migration from v2 `HeroSection.tsx`

- Keep: layout structure, trust indicators concept, split layout idea
- Update: colors, fonts, background (replace SVG overlay with glow orbs), buttons
- Remove: `font-semibold` from headline, `animate-pulse` on ambient elements
- Replace: FA icons in CTAs → Tabler (`IconArrowRight`)

---

## SECTION 2 — Social Proof Bar

### Current Implementation Notes

The social proof bar has been absorbed into the hero transition as the brand
divider. Treat it as a structural bridge, not a standalone section. Its job is to
separate the hero promise from the market pain section while keeping the background
art and glass depth continuous.

### Copy

**Label:** Brands we've built for

**Stat strip:**
`14+` Kenyan businesses shipped · Projects delivered from `11` days · Clients in Nairobi, Mombasa & East Africa

_(Numbers: JetBrains Mono, `--primary` color. Surrounding text: Outfit, `--on-surface-dim`)_

### Design

- Full-width Level 1 glass panel, `py-12`
- Logos: flex row, `opacity-60 hover:opacity-100 transition-opacity`
- Stats: 3-block row with orbital dot separators, each stat wrapped in `<Tooltip>`
- Number: `mono-stat` class, `--primary`

### Migration from v2 `MiniStats.tsx`

- Preserve existing stat values and data
- Replace hardcoded colors with tokens
- Wrap all numbers in JetBrains Mono span
- Add Tooltip on each stat (new pattern)

---

## SECTION 3 — Problem Statement

### Copy

**Section label:** THE REAL SITUATION

**Headline:** Building a digital product in Kenya is harder than it should be.

**Body:**
You've briefed three agencies. Got three proposals full of jargon. Paid a deposit. Waited six weeks. Got a prototype that missed the point.

Or you hired a freelancer who disappeared two months in.

Andishi works differently. We scope in a single call. We ship a working product in weeks. And we measure success by what changes for your business — not by the length of our deliverables list.

### Design

- Centered, max-width 720px, no cards — let text breathe
- Section label chip: `--primary`
- Headline: headline-lg, Outfit 300
- Body: three short paragraphs, body-lg, `--on-surface-dim`, `leading-[1.7]`
- Subtle violet glow orb behind text
- Entrance: fade-up on scroll (`useInView` with Framer Motion)

---

## SECTION 4 — Services Grid

### Copy

**Section label:** WHAT WE BUILD
**Intro:** We're a product studio, not a project factory.

| Card | Title                          | Body                                                                                                                                                           | Timeline    | Icon                |
| ---- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------- |
| 1    | Web Applications               | Custom-built web apps for businesses that have outgrown spreadsheets and off-the-shelf tools. We scope, design, build, and hand over production-ready systems. | `3–8 weeks` | `IconDeviceDesktop` |
| 2    | E-Commerce & Retail Systems    | Online stores built for the Kenyan and East African market — with local payment integrations, inventory logic, and mobile-first design.                        | `2–5 weeks` | `IconShoppingCart`  |
| 3    | Websites That Convert          | Not brochureware. Landing pages and product pages designed around one goal: turning visitors into inquiries.                                                   | `1–3 weeks` | `IconWorldWww`      |
| 4    | Digital Systems & Integrations | APIs, automations, and backend systems that connect your tools and give your team back hours every week.                                                       | `2–6 weeks` | `IconCircuitBoard`  |

### Design

- `2×2` grid desktop, `1×4` mobile
- GlassCard `glow="violet"` + `bento` + `group`
- Icon: Tabler 20px in `rounded-xl bg-[#d0bcff]/10 p-2.5 w-10 h-10`
- Timeline chip: JetBrains Mono, cyan chip
- Bottom progress bar: `h-px bg-gradient-to-r from-[#d0bcff]/20 via-[#4cd7f6]/30 to-transparent`
- Hover: card lifts + icon wrapper scales 110%
- Stagger: 0.1s offset between cards

### Migration from v2 `Services.tsx`

- Replace expandable mosaic pattern with 2×2 glass grid
- Preserve service descriptions — copy updated above
- Replace FA icons → Tabler
- Remove `font-semibold` from card titles

---

## SECTION 5 — Process Steps

### Copy

**Section label:** OUR PROCESS
**Headline:** How a project with Andishi actually goes

| Step | Title                                           | Body                                                                                                                                                                  |
| ---- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01   | One scoping call (free, 30 minutes)             | Tell us what you're building and why. We'll tell you what's realistic, what it takes, and whether we're the right fit. No pitch. No deck. Just a direct conversation. |
| 02   | We write the brief, not you                     | After the call, we produce a one-page project brief: scope, timeline, deliverables, and cost. You approve it or we adjust. No back-and-forth for weeks.               |
| 03   | We build in sprints, not silos                  | You see working progress every week — not a 90-day blackout followed by a big reveal. Feedback rounds are structured. Scope changes are flagged immediately.          |
| 04   | You get a live product, not a handover document | When we ship, the product is live, tested, and documented. We stay available for 30 days post-launch. No disappearing act.                                            |

### Design

- Horizontal timeline desktop, vertical stack mobile
- GlassCard `glow="cyan"` per step, connected by dashed `--secondary/20` lines
- Step number: 56px, JetBrains Mono, `--secondary` at 30% opacity — watermark behind card title
- Connector: `h-px w-full bg-gradient-to-r from-[--secondary]/30 to-transparent` (desktop)
- Orbital dot at each connector: 6px `rounded-full bg-[--secondary]/60`

### Migration from v2 `HowWeDoIt.tsx`

- Preserve 4-step structure and logical content
- Replace colors, fonts, add JetBrains Mono step numbers
- Apply GlassCard pattern

---

## SECTION 6 — Case Studies

### Copy

**Section label:** RECENT WORK

**Card template:**

```
[Cyan chip: Industry · Location]          [JetBrains Mono: Timeline]

[Project / Client Name — headline-md]
[Problem: one sentence — body-md, --on-surface-dim]

What we shipped
[Deliverable: one sentence]

The result
[Metric: mono-stat, --tertiary, 56px]     ← wrap in Tooltip
[Context: one sentence]

"[Client quote, max 25 words]"
— [Name, Title]

[See the full case study →]
```

**Placeholder data (replace with real):**

- Industry: E-Commerce · Nairobi
- Problem: Manual order management was costing 6 hours per staff member per week
- Shipped: Custom inventory + order system with M-Pesa integration
- Result: `6hrs` saved per staff member weekly
- Quote: "We went from chaos to a system that just runs."

### Design

- Grid: first card `col-span-7`, second `col-span-5`, third full-width horizontal
- GlassCard `glow="amber"`
- Result metric: 56px JetBrains Mono, `--tertiary`, wrapped in Tooltip
- Quote: `border-l-2 border-[--tertiary]/40 pl-4 italic body-md`
- Industry chip: cyan, JetBrains Mono

### Migration from v2 `ProjectsShowcase.tsx`

- Pull existing project data into new card template
- Apply amber GlassCard glow
- Add JetBrains Mono to metrics
- Add Tooltip to result stats

---

## SECTION 7 — Comparison Table

### Copy

**Section label:** WHY ANDISHI
**Headline:** Why founders choose Andishi over a freelancer or a bigger agency

| Criteria                 | Freelancer    | Big Agency            | Andishi                 |
| ------------------------ | ------------- | --------------------- | ----------------------- |
| Scoping speed            | Days to weeks | Weeks to months       | One call                |
| Accountability           | One person    | Account manager layer | Founder-direct          |
| Timeline transparency    | Variable      | Milestone-gated       | Weekly visible progress |
| Nairobi market knowledge | Depends       | Often imported        | Built in                |
| Post-launch support      | Rare          | Retainer-only         | 30 days included        |
| Project start time       | 2–4 weeks     | 4–8 weeks             | Within 5 business days  |

### Design

- Full-width GlassCard container, Level 2
- Header row: `--surface-highest`, label-caps
- Andishi column: highlighted `bg-[#d0bcff]/8 border border-[#d0bcff]/20`
- Checks: `IconCircleCheck` size 18 stroke 2, `--secondary`
- X marks: `IconX` size 16 stroke 1.5, `--outline`
- Row hover: `hover:bg-white/[0.03]`
- Mobile: horizontal scroll, sticky first column

### Migration from v2 `WhyAndishi.tsx`

- v2 has 6 stat cards — complement with this comparison table (or replace)
- Remove `InteractiveTalentVisualization` component from this section (move to talent pool page)
- Apply table design above

---

## SECTION 8 — Founder

### Copy

**Section label:** FOUNDER

**Pull quote:** "Built in Nairobi. Thinking about what comes next."

**Body:**
Andishi was started because we kept seeing the same thing: businesses with real ambition, stuck with digital partners who didn't understand the market, couldn't hit a deadline, or treated Kenyan clients as a lower-priority account.

We build for the African market because we work in it. We know local payment infrastructure, mobile-first usage patterns, connectivity constraints, and what it actually takes to ship a product that performs here — not just in a demo.

**Attribution:** [Founder Name], Founder, Andishi

### Design

- Two-column: photo left (circular mask, `ring-2 ring-[--secondary]/20`), text right
- Quote: headline-md, Outfit 300, italic, `--on-surface`
- Body: body-lg, `--on-surface-dim`
- Name: label-caps, `--primary`
- Amber glow orb behind photo

### Migration from v2 `about-us` team section

- Pull founder photo and bio
- Apply new layout and typography
- No `font-bold` on name or title

---

## SECTION 9 — FAQ

### Copy

**Section label:** COMMON QUESTIONS
**Headline:** Questions we get before every project

| Q                                              | A                                                                                                                                                                                                                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| How long does a typical project take?          | Most web applications take 3–8 weeks from brief approval to launch. E-commerce builds take 2–5 weeks. Landing pages take 1–3 weeks. Timeline depends on scope, content readiness, and revision cycles — we'll give you a specific estimate after the scoping call. |
| What does an Andishi project cost?             | Projects are scoped and priced individually. We don't use day-rates or open-ended retainers — you get a fixed price before we start. Book a scoping call and we'll give you a number within 48 hours.                                                              |
| Do you work with businesses outside Nairobi?   | Yes. We've delivered for clients in Mombasa, Kisumu, and across East Africa. Most work runs remote — weekly calls, shared project boards, documented feedback rounds.                                                                                              |
| What happens after launch?                     | Every project includes 30 days of post-launch support covering bug fixes, adjustments, and technical questions. After that, we offer retainer support for ongoing development.                                                                                     |
| Do you build on WordPress, Shopify, or custom? | Depends on what the project needs. We use the right tool for the job. If Shopify or a headless build is the better fit, we'll tell you in the scoping call — not after the contract.                                                                               |
| What do you need from us to get started?       | A 30-minute call and clarity on what you're trying to solve. No brief, spec document, or wireframe needed. We handle the scoping.                                                                                                                                  |

### Design

- Accordion: each FAQ is a GlassCard row `py-5 px-6 rounded-xl`
- Closed: Q in body-md `--on-surface` + `IconChevronDown` stroke 1.5
- Open: Q in `--primary` tint + A in body-md `--on-surface-dim` + `IconChevronUp`
- Animation: `AnimatePresence` + `height: auto` spring
- Open border: `border-[--primary]/20`

---

## SECTION 10 — Final CTA

### Copy

**Headline:** Ready to scope your project?

**Subheadline:** The first call is 30 minutes and costs nothing. You'll leave with a clear picture of what's possible and what it takes.

**CTA Primary:** Book a Scoping Call
**CTA Secondary:** hello@andishi.dev

**Trust micro-copy:** No pitch. No retainer required. Response within 24 hours.

### Design

- Centered, `py-40`
- Most dramatic glow on the page — large violet + cyan orbs, higher opacity than any other section
- Headline: display-xl, centered
- Subheadline: body-lg, `--on-surface-dim`, centered, max-width 500px
- Trust copy: label-caps, `--outline`, `tracking-[0.12em]`

---

## SECTION 11 — Footer

### Copy

**Tagline:** Andishi — Building what comes next, from Nairobi.

**Columns:**

- Work: Case Studies, Portfolio, Process
- Company: About, Founders, Careers
- Contact: Email, LinkedIn, Twitter/X

**Legal:** © 2025 Andishi. Registered in Kenya.

### Design

- Level 1 glass panel
- 3-column link grid, label-caps headers
- Logo + tagline left, links right
- Thin separator + legal bottom bar

### Migration from v2 `Footer.tsx`

- Preserve 5-column structure or simplify to 3
- Replace `font-bold` on section headers with label-caps Outfit 500
- Replace colors with tokens
- Keep social links, WhatsApp reference

---

# 13. AI-SEO Technical Setup

## One-Time Files (Before Launch)

### /llms.txt

```
Andishi is a Nairobi-based digital product studio that designs, builds, and ships
web applications, e-commerce systems, and custom digital solutions for businesses
in Kenya and across Africa. Clients include founders, SMEs, and growth-stage
companies who need a technical partner, not just a vendor. Andishi scopes projects
in days, ships working products in weeks, and measures success by client outcomes
— not deliverables.

Key pages: /our-portfolio (case studies), /start-project (begin a project),
/tech-talent-pool (developer profiles), /about-us, /contact-us.

Services: Web Applications (3–8 weeks), E-Commerce (2–5 weeks),
Conversion Websites (1–3 weeks), Digital Systems & Integrations (2–6 weeks).
```

### robots.txt — Verify NOT blocked

```
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /

User-agent: CCBot
Disallow: /
```

### FAQPage Schema (Section 9)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long does a typical project take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most web applications take 3–8 weeks from brief approval to launch. E-commerce builds take 2–5 weeks. Landing pages take 1–3 weeks."
      }
    },
    {
      "@type": "Question",
      "name": "Do you work with businesses outside Nairobi?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. We've delivered for clients in Mombasa, Kisumu, and across East Africa. Most work runs remote with weekly calls and shared project boards."
      }
    }
    // add remaining 4 FAQs in same pattern
  ]
}
```

### Organization Schema (layout.tsx — site-wide)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Andishi",
  "url": "https://andishi.dev",
  "foundingLocation": "Nairobi, Kenya",
  "description": "Digital product studio building web applications, e-commerce platforms, and digital systems for Kenyan and African businesses.",
  "areaServed": ["Kenya", "East Africa"],
  "serviceType": [
    "Web Application Development",
    "E-Commerce Development",
    "Website Design",
    "Systems Integration"
  ]
}
```

### Page Meta (app/page.tsx)

```tsx
export const metadata = {
  title: "Andishi — Digital Products Built and Shipped in Nairobi",
  description:
    "Andishi builds web products, systems, and digital experiences for Kenyan and African businesses. We scope fast, ship clean, and measure results.",
  openGraph: {
    title: "Andishi — Digital Products Built and Shipped in Nairobi",
    description: "...",
    url: "https://andishi.dev",
    type: "website",
  },
};
```

## UTM Link Structure

```
https://andishi.dev/[page]?utm_source=[source]&utm_medium=[medium]&utm_campaign=[campaign]&utm_content=[content]
```

| Placement        | utm_source   | utm_medium     | utm_campaign     |
| ---------------- | ------------ | -------------- | ---------------- |
| Hero CTA         | landing_page | internal       | hero_cta         |
| Services CTA     | landing_page | internal       | services_section |
| Final CTA        | landing_page | internal       | final_cta        |
| LinkedIn post    | linkedin     | social_organic | launch_wk1       |
| Email newsletter | email        | newsletter     | site_launch      |
| Facebook boost   | facebook     | social_paid    | boost_launch     |

---

# 14. Launch Sequence

## Week 1 — Owned Channels First

- Deploy to production, verify schema, llms.txt, robots.txt
- Submit to Google Search Console
- Email existing list: UTM `utm_source=email&utm_medium=newsletter&utm_campaign=site_launch`
- Update LinkedIn + Instagram bio links

## Week 2 — Rented Channels

- LinkedIn: founder post, first person — why the brand and positioning changed. No "thrilled to announce."
- X: thread — three things that surprised us about positioning for the African market
- IG: Reel or carousel using the comparison table or process steps visual

## Week 3 — Borrowed Channels

- Pitch one Kenyan startup/tech podcast — topic: "what it actually takes to build digital products in Kenya"
- Comment on 5 LinkedIn posts from founders in the target segment — add value, no promotion
- Submit to BetaList or East Africa startup directories (backlink signal)

## Ongoing Monthly

- Query "digital agency Kenya," "web development Nairobi," "build web app Kenya" in ChatGPT, Perplexity, and Google AI Overviews
- Log citation presence. Track month-over-month
- Every new case study = update FAQ and social calendar

---

# 15. Developer Checklist

## Current Completed Foundation

- [x] Hero and adjacent problem section consolidated into one seamless section.
- [x] Brand/client bar implemented as the transition divider.
- [x] Hero uses full-bleed background art that can overflow beyond the content container.
- [x] Hero dashboard illustrations stacked on the right side for large screens.
- [x] Subtle plus/dot texture used on hero cards; stripe pattern removed.
- [x] Sparkle/star icons avoided in hero UI.
- [x] Hero numerals and proof stats use JetBrains Mono via `font-mono`.
- [x] Primary text token direction adjusted for stronger light-mode contrast and softer dark-mode violet luminosity.
- [x] CTA gradient tokens and sizing foundation established.
- [x] Hero styling moved to Tailwind-first implementation; hero CSS module removed.

## Setup

- [ ] `@tabler/icons-react` installed
- [ ] `Outfit` + `JetBrains Mono` loaded via Google Fonts in `globals.css`
- [ ] CSS custom properties defined in `:root` (Section 3)
- [ ] `lib/motion.ts` created with spring configs and variants
- [ ] `z-[100]` utility defined in `globals.css`
- [ ] `transition-all duration-300` confirmed on all interactive elements
- [ ] `ConditionalLayout`, `PageTransition`, `SmoothScrollProvider` preserved

## Component Build Order

1. CSS tokens + `globals.css`
2. `lib/motion.ts` (spring configs)
3. `GlassCard` component
4. `Button` variants (primary, ghost, glass, danger)
5. `Tooltip` component (z-100)
6. `Label` / tag chip
7. `Input` / `Select` (visual update)
8. `Avatar` (visual update)
9. `Separator`
10. Updated `Navbar.tsx`
11. Homepage sections (order follows Section 12)
12. Updated `Footer.tsx`
13. Background glow orbs

## v2 → v3 Migration Pass

- [ ] Global find: `font-bold` → remove or replace with weight context
- [ ] Global find: `font-semibold` → remove
- [ ] Global find: `Nunito` / `Montserrat` / `.monty` → `Outfit`
- [ ] Global find: `react-icons/fa` imports → `@tabler/icons-react`
- [ ] Global find: `lucide-react` imports → `@tabler/icons-react`
- [ ] Global find: `purple-400` / `purple-500` / `#96aeff` → CSS tokens
- [ ] Global find: `animate-pulse` (ambient use) → CSS glow orb or remove
- [ ] Global find: `ease: "easeOut"` in Framer configs → `cosmicSpring`
- [ ] Wrap all stat/number values in `font-['JetBrains_Mono']` span
- [ ] Add `bg-[#15121b]` to `body` in `globals.css` (replaces any v2 background)

## SEO & Accessibility

- [ ] FAQPage JSON-LD in `<head>` (Section 9)
- [ ] Organization JSON-LD in `layout.tsx`
- [ ] `/llms.txt` deployed to site root
- [ ] `robots.txt` — AI bots NOT blocked
- [ ] All images: descriptive `alt` text
- [ ] All CTAs: accessible labels
- [ ] Focus rings: `focus-visible:ring-2 focus-visible:ring-[#d0bcff]/50` on every interactive element
- [ ] "Last updated" visible in footer
- [ ] Author attribution on founder section
- [ ] Google Search Console submission post-deploy
- [ ] GA4 tag `G-8668KBDWFZ` preserved
- [ ] FB Pixel `721165943984672` preserved
- [ ] Google Ads tag `AW-16686798799` preserved
- [ ] UTM parameters on all CTA links

## Quality Gates Before Launch

- [ ] Lighthouse performance ≥ 80
- [ ] Zero `font-bold` / `font-semibold` anywhere in codebase
- [ ] Zero sparkle/star icons
- [ ] Zero solid card fills — all glass
- [ ] JetBrains Mono on numbers only
- [ ] Tooltips on all stat values in social proof + case studies
- [ ] Mobile tested: 375px and 390px
- [ ] Scroll entrance animations: no layout shift
- [ ] Auth flow tested: login → dashboard redirect for all 3 roles
- [ ] Rate limiting tested: 5 attempts → lockout
- [ ] Dashboard pages render correctly with new tokens (spot check each role)

---

_Andishi v3 Complete Project Specification_
_Cosmic Identity Design System × Market-Resonant Copy × v2 Codebase Integration × AI-SEO_
_Version 2.0 · Built from: DESIGN.md + Component_Library.md + THEME_GUIDE.md + V3_CURRENT_STATE_AUDIT.md_
_Review quarterly or after 3 new case studies published_
