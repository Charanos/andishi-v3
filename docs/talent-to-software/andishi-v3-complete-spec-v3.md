# Andishi v3 - Complete Project Specification

**andishi.dev · Cosmic Identity · Software Studio · AI-SEO Ready**

> **This is the single source of truth.** Design system, copy, component recipes,
> route map, implementation guidance, and launch checklist - unified.
> Hand this to a developer and they build the full page without asking a single question.
>
> **Positioning update, June 2026:** Andishi is now a software development company.
> Primary: custom software, SaaS, AI systems, web, mobile, enterprise, and blockchain.
> Secondary: engineering talent placement and staff augmentation.
> All copy, schemas, routes, and CTAs in this document reflect that order.
>
> **Design authority:** The Cosmic Identity design system (sections 3–9) is unchanged.
> **Backend authority:** `BACKEND_ARCHITECTURE_SPEC_V2.md` governs all data layer decisions.
> **Dashboard authority:** `docs/DASHBOARD_MASTER_IMPLEMENTATION.md` governs all dashboard
> auth, RBAC, shell, route, and QA sequencing.
>
> **Current implementation status, June 16, 2026:** Public marketing pages completed
> through the May 2026 pass. Homepage hero, project showcase, process section, visual
> interlude, Why Andishi decision cockpit, founder section, blog/FAQ/newsletter block,
> and masked final CTA are shipped. The `/work` page is rebuilt with filters, sticky
> sidebar, project grid, and case-study drawer. Dashboard is scaffolded with static data.
> The June 2026 pass focuses on: copy updates across all public pages, `/services` hub
> revamp, `/services/[slug]` sub-page implementation, and navigation restructure.

---

# CONTENTS

1. [Identity & Philosophy](#1-identity--philosophy)
2. [Tech Stack](#2-tech-stack)
3. [Design Tokens - Colors](#3-design-tokens--colors)
4. [Typography System](#4-typography-system)
5. [Glassmorphism Recipe](#5-glassmorphism-recipe)
6. [Elevation & Depth Model](#6-elevation--depth-model)
7. [Spacing & Layout Grid](#7-spacing--layout-grid)
8. [Animation & Motion](#8-animation--motion)
9. [Component Library](#9-component-library)
10. [Route Map - Full Site](#10-route-map)
11. [Database & Auth](#11-database--auth)
12. [Section-by-Section: Copy + Design](#12-section-by-section)
13. [AI-SEO Technical Setup](#13-ai-seo-technical-setup)
14. [Launch Sequence](#14-launch-sequence)
15. [Developer Checklist](#15-developer-checklist)

---

# 1. Identity & Philosophy

## Concept: Cosmic Order

**Not:** generic dark SaaS, cheap sci-fi, sparkle icons, mesh gradients, purple-on-white.
**Is:** cinematic, gallery-grade, orbital. The interface of a precision instrument that also runs a serious business.

The metaphor is a layered orbital system. Content exists in glass planes floating above a deep-space void. The user is the observer - looking through lenses, reading signals, making decisions. Every surface has refraction depth. Nothing is flat. Depth comes from Z-stacking and refractive opacity, not shadows.

## Brand Voice

- Direct. No filler copy. No slogans.
- Specific over vague: "shipped in 6 weeks" not "fast turnaround."
- Confident without being loud. Earned authority, not claimed.
- Technical precision paired with human warmth.
- Nairobi-grounded but globally readable. The work is the credential, not the geography.
- Proof-first. Case studies, shipped metrics, and technical decisions outrank any descriptor.

## Positioning Update - What Changed in June 2026

The primary offering is no longer talent supply. Andishi's headline product is software delivery.

The buyer is no longer only a CTO looking to extend headcount. The buyer is anyone who needs software built, shipped, and owned - from a Nairobi founder launching their first SaaS to a Series B engineering lead in Berlin who needs a mobile app shipped in eight weeks.

Talent placement remains a real, profitable service. It is surfaced as one delivery mode, not the company's reason for existing.

Every section, CTA, schema, and headline in this document reflects that shift.

## What v3 Explicitly Kills from v2

- `font-bold` / `font-semibold` - zero tolerance. Emphasis from scale and color only.
- `Nunito` + `Montserrat` - replaced by `Outfit` + `JetBrains Mono`.
- `.monty` custom class - retire it, replace all instances.
- `react-icons/fa`, `react-icons/si`, `lucide-react` - replaced by `@tabler/icons-react`.
- Hardcoded hex colors - `#0B0D0E`, `#05122273`, `#96aeff`, `#c156ff`, `purple-400/500/900` - replaced by CSS tokens.
- `animate-pulse` for ambient effects - replaced by CSS glow orbs and spring-based Framer Motion.
- `ease: "easeOut"` Framer configs - replaced by spring physics.
- Sparkle / star decorative icons - removed entirely.
- Talent-only CTAs as the single above-the-fold action - replaced by dual-track (build / hire) with build as the default.

---

# 2. Tech Stack

## Confirmed Stack

| Layer | Technology | Version | Action |
|---|---|---|---|
| Framework | Next.js App Router | 16.x | Keep |
| Language | TypeScript | ^5 | Keep |
| Styling | Tailwind CSS v4 + tw-animate-css | ^4.1.8 | Keep |
| Animation | Framer Motion | ^12.16.0 | Keep, configs updated |
| Database | Neon Postgres via Drizzle ORM | - | Keep per backend spec |
| Auth | Custom JWT (jose) - no third-party auth | - | Keep entirely |
| Forms | React Hook Form + Zod | ^7.58.0 / ^3.25.64 | Keep |
| Charts | Recharts | ^3.0.2 | Keep (dashboards) |
| Smooth Scroll | Lenis | ^1.3.4 | Keep |
| Analytics | Vercel Analytics + GA4 + FB Pixel | - | Keep all tags |

## Package Changes

| Action | Package | Notes |
|---|---|---|
| ADD | `@tabler/icons-react` | Replaces all icon libraries |
| ADD | `@fontsource/outfit` | Replaces Nunito + Montserrat |
| ADD | `@fontsource/jetbrains-mono` | Numeric font |
| REMOVE | `react-icons` | After full replacement audit |
| REMOVE | `lucide-react` | After full replacement audit |

## Google Fonts Import (globals.css)

```css
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap");
```

---

# 3. Design Tokens - Colors

## Current Implemented Token Direction

The codebase uses a dual-theme violet/cyan system avoiding purple overload while preserving the cosmic identity.

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

## CSS Custom Properties (globals.css)

```css
:root {
  /* ── Backgrounds ─────────────────────────────── */
  --bg: #100c1a;
  --bg-deep: #0f0d15;
  --surface-low: #1d1a23;
  --surface: #211e27;
  --surface-high: #2c2832;
  --surface-highest: #37333d;
  --surface-bright: #3b3742;

  /* ── Text ────────────────────────────────────── */
  --on-surface: #e7e0ed;
  --on-surface-dim: #cbc3d7;
  --inverse-surface: #e7e0ed;
  --inverse-on-surface: #322f39;

  /* ── Primary - Violet ────────────────────────── */
  --primary: #d0bcff;
  --on-primary: #3c0091;
  --primary-container: #a078ff;
  --on-primary-container: #340080;
  --primary-fixed: #e9ddff;
  --primary-fixed-dim: #d0bcff;
  --inverse-primary: #6d3bd7;

  /* ── Secondary - Cyan ────────────────────────── */
  --secondary: #4cd7f6;
  --on-secondary: #003640;
  --secondary-container: #03b5d3;
  --on-secondary-container: #00424e;
  --secondary-fixed: #acedff;
  --secondary-fixed-dim: #4cd7f6;

  /* ── Tertiary - Amber ────────────────────────── */
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

| Token | Where |
|---|---|
| `--bg` | Page background |
| `--bg-deep` | Behind cosmic art layers, deepest z-level |
| `--surface-low` | Subtle section dividers, inactive states |
| `--surface` | Default glass card base |
| `--surface-high` | Elevated cards, hover states |
| `--surface-highest` | Modals, tooltips, top-layer overlays |
| `--on-surface` | All primary body text |
| `--on-surface-dim` | Labels, captions, secondary descriptions |
| `--primary` | Interactive links, glow accents, CTA highlights |
| `--primary-container` | Button fills, active pill backgrounds |
| `--secondary` | Cyan data signals, timelines, border glows |
| `--tertiary` | Amber accents, stat highlights, testimonials |
| `--outline-variant` | Glass card borders (default) |
| `--outline` | Focused/active borders |

## v2 Color Migration Map

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

### Primary - Outfit (Headlines, UI, Body)
Replaces Nunito (body) and Montserrat (headings). Geometric, humanistic, airy at light weights.

### Numeric - JetBrains Mono (Stats, Metrics, IDs, Tables)
Used exclusively for data. Creates "technical instrumentation" contrast against Outfit.

## Type Scale

```css
.display-xl {
  font-family: "Outfit", sans-serif;
  font-size: clamp(48px, 6vw, 80px);
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.headline-lg {
  font-family: "Outfit", sans-serif;
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.headline-md {
  font-family: "Outfit", sans-serif;
  font-size: clamp(22px, 2.5vw, 32px);
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

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

.label-caps {
  font-family: "Outfit", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.mono-stat {
  font-family: "JetBrains Mono", monospace;
  font-size: clamp(28px, 3vw, 48px);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.mono-sm {
  font-family: "JetBrains Mono", monospace;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.02em;
}
```

## Typography Hard Rules

- **NEVER use `font-bold` (700) or `font-semibold` (600).** Emphasis from scale and color only. Zero exceptions.
- Weight 300 for display and large headlines only.
- Weight 400 for body, card descriptions, FAQ text.
- Weight 500 for labels, nav, caps tags only.
- `JetBrains Mono` for numbers exclusively: stats, timelines, prices, client counts, table data, IDs.
- `.monty` class: retire completely, find all usages and replace.

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
/* Violet - primary services, CTA cards, featured items */
.glass-card--violet {
  box-shadow:
    0 0 0 1px rgba(208, 188, 255, 0.15),
    0 24px 48px rgba(0, 0, 0, 0.25);
}

/* Cyan - timelines, process steps, data cards */
.glass-card--cyan {
  box-shadow:
    0 0 0 1px rgba(76, 215, 246, 0.2),
    0 24px 48px rgba(0, 0, 0, 0.25);
}

/* Amber - testimonials, social proof, founder */
.glass-card--amber {
  box-shadow:
    0 0 0 1px rgba(255, 184, 105, 0.2),
    0 24px 48px rgba(0, 0, 0, 0.25);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.065);
  border-color: rgba(255, 255, 255, 0.14);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}
```

## Ghost Glass Button

```css
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
Level 0 - Deep Space
  z-index:  0
  bg:       --bg-deep (#0f0d15)
  Use:      Cosmic background art, radial glow orbs

Level 1 - Orbital Planes
  z-index:  1
  bg:       rgba(255,255,255,0.02)
  blur:     backdrop-blur-[60px]
  border:   1px solid rgba(255,255,255,0.04)
  Use:      Full-section structural overlays, hero backdrop, footer

Level 2 - Active Glass Cards  (default)
  z-index:  2
  bg:       rgba(255,255,255,0.04)
  blur:     backdrop-blur-xl (24px)
  border:   1px solid rgba(255,255,255,0.08)
  shadow:   inset 0 1px 0 rgba(255,255,255,0.08)
  Use:      Service cards, FAQ items, case studies, stat blocks

Level 3 - Elevated / Hover
  z-index:  3
  bg:       rgba(255,255,255,0.07)
  blur:     backdrop-blur-2xl (40px)
  border:   1px solid rgba(208,188,255,0.2)
  Use:      Hovered cards, featured/highlighted items, Andishi column in comparison table

Level 4 - Interaction Layer
  z-index:  100
  bg:       rgba(55,51,61,0.95)
  blur:     backdrop-blur-2xl
  border:   1px solid rgba(76,215,246,0.25)
  Use:      Tooltips, dropdowns, modals, command palette
```

## z-index Tokens

```css
@layer utilities {
  .z-100 { z-index: 100; }
}
```

---

# 7. Spacing & Layout Grid

## Spacing Units

```
Base:     8px
space-1:   8px
space-2:  16px
space-3:  24px   ← gutter between cards
space-4:  32px   ← glass-padding (card interior)
space-5:  40px
space-6:  48px
space-8:  64px   ← margin-safe (page sides on desktop)
space-10: 80px
space-20: 160px  ← section-gap
```

## Grid

- 12-column, max-width `1280px`, centered, `64px` side margins.
- Asymmetric column splits encouraged: 7+3, 8+4, 5+7 - not everything 6+6.
- Grid-breaking elements allowed: headlines that overflow their column, images bleeding edge.
- Mobile: single column, `24px` side margin, section-gap compresses to `80px`.

## Corner Radius

```
--rounded-sm:    4px    (tags, chips, small labels)
--rounded:       8px    (inputs, small buttons)
--rounded-md:   12px    (icon wrappers)
--rounded-lg:   16px    (cards - primary)
--rounded-xl:   24px    (large feature cards)
--rounded-full: 9999px  (pills, avatars, CTA buttons)
```

---

# 8. Animation & Motion

## Philosophy

Staggered, physics-based. One well-orchestrated page-load sequence beats scattered micro-interactions. Items enter orbit one at a time.

## Spring Configs (lib/motion.ts)

```ts
export const cosmicSpring = {
  type: "spring" as const,
  damping: 28,
  stiffness: 180,
  mass: 0.8,
};

export const floatSpring = {
  type: "spring" as const,
  damping: 22,
  stiffness: 220,
};
```

## Stagger Pattern

```ts
export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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
transition-all duration-300
focus-visible:ring-2 focus-visible:ring-[#d0bcff]/50 focus-visible:outline-none
```

## Glow Orb CSS

```css
.glow-orb {
  position: absolute;
  border-radius: 9999px;
  pointer-events: none;
  filter: blur(80px);
}

.glow-orb--violet {
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(109,59,215,0.18) 0%, transparent 70%);
}

.glow-orb--cyan {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(76,215,246,0.12) 0%, transparent 70%);
  filter: blur(100px);
}

@keyframes orb-drift {
  0%, 100% { transform: translate(0,0) scale(1); }
  50%       { transform: translate(20px,-15px) scale(1.05); }
}
.glow-orb { animation: orb-drift 12s ease-in-out infinite; }
```

---

# 9. Component Library

## 9.1 GlassCard

```tsx
// src/components/ui/GlassCard.tsx
interface GlassCardProps {
  children: React.ReactNode;
  glow?: "violet" | "cyan" | "amber" | "none";
  level?: 2 | 3;
  bento?: boolean;
  className?: string;
}

const glowMap = {
  violet: "shadow-[0_0_0_1px_rgba(208,188,255,0.15),0_24px_48px_rgba(0,0,0,0.25)]",
  cyan:   "shadow-[0_0_0_1px_rgba(76,215,246,0.2),0_24px_48px_rgba(0,0,0,0.25)]",
  amber:  "shadow-[0_0_0_1px_rgba(255,184,105,0.2),0_24px_48px_rgba(0,0,0,0.25)]",
  none:   "shadow-xl shadow-black/25",
};

const base = [
  "relative overflow-hidden rounded-xl p-8",
  "bg-white/[0.04] backdrop-blur-xl",
  "border border-white/[0.08]",
  "transition-all duration-300",
  "hover:bg-white/[0.065] hover:border-white/[0.14] hover:-translate-y-0.5",
].join(" ");

// Always render this overlay inside every GlassCard:
// <div className="absolute inset-0 bg-gradient-to-br from-[#d0bcff]/[0.04]
//                 via-transparent to-[#4cd7f6]/[0.02] rounded-xl pointer-events-none" />
```

## 9.2 Button

```tsx
// src/components/ui/Button.tsx
// variants: 'primary' | 'ghost' | 'glass' | 'danger'

const ghost = [
  "px-7 py-3 rounded-full backdrop-blur-sm",
  "bg-white/[0.05] border border-[#d0bcff]/25",
  "text-[#d0bcff] text-[15px] font-[500] tracking-[0.02em]",
  "transition-all duration-300",
  "hover:border-[#4cd7f6]/50 hover:bg-[#d0bcff]/[0.08]",
  "hover:shadow-[0_0_20px_rgba(76,215,246,0.15)]",
  "focus-visible:ring-2 focus-visible:ring-[#d0bcff]/50 focus-visible:outline-none",
].join(" ");

const primary = [
  "px-8 py-3.5 rounded-full",
  "bg-[#a078ff]/20 border border-[#d0bcff]/40",
  "text-[#e9ddff] text-[15px] font-[500] tracking-[0.02em]",
  "transition-all duration-300",
  "hover:bg-[#a078ff]/35 hover:shadow-[0_0_32px_rgba(208,188,255,0.2)]",
  "focus-visible:ring-2 focus-visible:ring-[#d0bcff]/50 focus-visible:outline-none",
].join(" ");

const danger = [
  "px-6 py-2.5 rounded-full",
  "bg-[#93000a]/30 border border-[#ffb4ab]/25",
  "text-[#ffb4ab] text-[14px] font-[500]",
  "transition-all duration-300",
  "hover:bg-[#93000a]/50 hover:border-[#ffb4ab]/40",
].join(" ");
```

## 9.3 DualTrackCTA (New - June 2026)

Replaces single-intent CTAs on `/skills/[domain]` pages and the homepage secondary CTA zone.

```tsx
// src/components/marketing/DualTrackCTA.tsx
interface DualTrackCTAProps {
  primaryLabel?: string;       // default: "Start a Project"
  primaryHref?: string;        // default: "/start-project"
  secondaryLabel?: string;     // default: "Hire an Engineer"
  secondaryHref?: string;      // default: "/hire"
  context?: string;            // e.g. "Need a full-stack team?" - shown above buttons
}

// Layout: context label (optional) → Primary pill button → Ghost pill button
// Primary routes to /start-project (build intent)
// Secondary routes to /hire (talent intent)
// Used on: homepage below-fold CTA, all /skills/[domain] pages, /studio
```

## 9.4 ServiceCard (New - June 2026)

Used on the `/services` hub and homepage services preview section.

```tsx
// src/components/marketing/ServiceCard.tsx
interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;       // Tabler icon, size={20} stroke={1.5}
  timeline?: string;           // e.g. "4–10 weeks" - JetBrains Mono chip
  href: string;                // routes to /services/[slug]
  glow?: "violet" | "cyan" | "amber";
}

// Wraps in GlassCard with bento + group className
// Icon in rounded-xl bg-[#d0bcff]/10 wrapper
// Timeline chip: cyan, JetBrains Mono
// Bottom gradient bar: h-px bg-gradient-to-r from-[#d0bcff]/20 via-[#4cd7f6]/30 to-transparent
// Hover: card lifts + icon wrapper scales 110%
```

## 9.5 Label / Tag Chip

```tsx
// Section label - above headlines
"inline-block px-3 py-1 rounded-full text-[11px] font-[500]
 uppercase tracking-[0.15em]
 bg-[#d0bcff]/10 border border-[#d0bcff]/20 text-[#d0bcff]"

// Status / timeline chip (JetBrains Mono)
"inline-block px-2.5 py-0.5 rounded-full
 font-['JetBrains_Mono'] text-[12px]
 bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/20"

// Role badge - dashboards
"bg-[#d0bcff]/10 border-[#d0bcff]/15 text-[#d0bcff]"   /* ADMIN */
"bg-[#4cd7f6]/10 border-[#4cd7f6]/15 text-[#4cd7f6]"   /* CLIENT */
"bg-[#ffb869]/10 border-[#ffb869]/15 text-[#ffb869]"   /* DEVELOPER */
```

## 9.6 Tooltip

```tsx
// src/components/ui/Tooltip.tsx - z-[100]

const tooltipVariants = {
  hidden: { opacity: 0, y: 4, scale: 0.96 },
  show:   { opacity: 1, y: 0, scale: 1,
            transition: { type: "spring", damping: 22, stiffness: 220 } }
};

"absolute z-[100] px-3 py-2 rounded-lg text-[13px] font-[400]
 bg-[#37333d]/95 backdrop-blur-xl
 border border-[#4cd7f6]/25
 text-[#e7e0ed] shadow-xl shadow-black/30
 pointer-events-none whitespace-nowrap"
```

## 9.7 Stat Block

```tsx
// Top row
<div className="flex items-center justify-between mb-3">
  <span className="text-[11px] font-[500] uppercase tracking-[0.15em] text-[--on-surface-dim]">
    PROJECTS SHIPPED
  </span>
  <div className="w-8 h-8 rounded-lg bg-[#d0bcff]/10 flex items-center justify-center">
    <IconCode size={16} stroke={1.5} className="text-[#d0bcff]" />
  </div>
</div>

// Value - JetBrains Mono always
<div className="font-['JetBrains_Mono'] text-[40px] font-[400]
                tracking-tight leading-none text-[--on-surface] mb-2">
  32+
</div>

// Trend / context
<div className="text-[13px] text-[--on-surface-dim] flex items-center gap-1.5">
  <IconTrendingUp size={14} stroke={1.5} className="text-[#4cd7f6]" />
  Web · Mobile · SaaS · AI
</div>
```

## 9.8 Avatar

```tsx
// Ring style for profile contexts
"ring-2 ring-[#d0bcff]/20 ring-offset-2 ring-offset-[--bg]";

// Initials gradient
// violet: bg-gradient-to-br from-[#6d3bd7] to-[#a078ff]
// cyan:   bg-gradient-to-br from-[#03b5d3] to-[#4cd7f6]
```

## 9.9 Input / Form Fields

```tsx
"w-full px-4 py-3 rounded-lg
 bg-white/[0.04] backdrop-blur-sm
 border border-white/[0.08] border-b-[#494454]
 text-[--on-surface] placeholder:text-[--on-surface-dim]
 font-['Outfit'] text-[15px] font-[400]
 transition-all duration-300
 focus:border-[#d0bcff]/40 focus:bg-white/[0.07]
 focus-visible:ring-2 focus-visible:ring-[#d0bcff]/30 focus-visible:outline-none"
```

## 9.10 Separator

```tsx
<div className="flex items-center gap-4 my-16">
  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#494454]" />
  <div className="w-1.5 h-1.5 rounded-full bg-[#d0bcff]/40" />
  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#494454]" />
</div>
```

## 9.11 Navigation (Updated June 2026)

```tsx
// Keep: ConditionalLayout pattern, auth state, role-aware links, mobile drawer state
// Update: colors, fonts, button styles, nav items

// Sticky glass bar
"fixed top-0 inset-x-0 z-50
 bg-[#15121b]/80 backdrop-blur-xl
 border-b border-white/[0.06]"

// Primary nav links (in order): Services · Work · Skills · About
// CTA button: "Start a Project" → /start-project
// Secondary (footer only): /hire, /engineers
// Mobile hamburger: IconMenu2, stroke 1.5
```

## 9.12 Iconography

```tsx
import {
  IconCode,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconBrain,
  IconCurrencyBitcoin,
  IconBuildingSkyscraper,
  IconDatabase,
  IconCloudComputing,
  IconShoppingCart,
  IconWorldWww,
  IconCircuitBoard,
  IconTrendingUp,
  IconChevronDown,
  IconCheck,
  IconX,
  IconMenu2,
  IconArrowRight,
  IconCircleCheck,
  IconUsers,
  IconBuildingStore,
} from "@tabler/icons-react";

// Stroke rules
// Active / primary:     stroke={2}
// Inactive / secondary: stroke={1.5}
// Ghost background:     stroke={1}

// Sizes
// Standard UI:   size={20}
// Navigation:    size={22}
// Ghost bg:      size={80} at opacity 0.03–0.05
```

---

# 10. Route Map - Full Site

## Public / Marketing Routes

| Route | Status | Role |
|---|---|---|
| `/` | Implemented - copy update required | Software studio landing page. Hero leads with build capability. Talent track is below the fold. Sections: hero, proof strip, services preview (4 cards), case studies, process, comparison table, founder, FAQ/newsletter, dual-track final CTA. |
| `/services` | Implemented - full revamp required | Primary software services hub. Replaces the legacy/hybrid implementation. Service card grid with all eight service lines. Each card routes to its `/services/[slug]` sub-page. `Service` schema with `hasOfferCatalog`. |
| `/services/custom-software` | Not yet implemented | Custom software development service page. Scope definition, case studies, stack, engagement options, FAQ, CTA. |
| `/services/saas-development` | Not yet implemented | SaaS product development service page. |
| `/services/ai-systems` | Not yet implemented | AI and intelligent systems service page. |
| `/services/mobile-apps` | Not yet implemented | Mobile application development service page. |
| `/services/enterprise-software` | Not yet implemented | Enterprise software and internal platforms page. |
| `/services/blockchain` | Not yet implemented | Blockchain and Web3 development page. |
| `/studio` | Implemented - copy update required | Local-market delivery track for African businesses. Elevated from "secondary arm" framing. Cross-links to `/services` for global scope. Schema: `Service`, `BreadcrumbList`. |
| `/work` | Implemented - elevation required | Primary proof mechanism. Filter-by-service and filter-by-vertical added to existing grid. Schema: `ItemList`, `BreadcrumbList`. |
| `/work/[slug]` | Implemented | Individual case study. Technical decisions and outcomes lead. Schema: `Article`, `BreadcrumbList`. |
| `/skills` | Implemented - copy update required | Technical capabilities index. Now links to both `/skills/[domain]` pages and `/services` hub. |
| `/skills/fullstack` | Implemented - copy update required | Full-stack capability page. Dual-track: build-with-us leads, hire-an-engineer secondary. |
| `/skills/ai` | Implemented - copy update required | AI capability page. Delivery track leads. |
| `/skills/web3` | Implemented - copy update required | Blockchain/Web3 capability page. Delivery track leads. |
| `/skills/aws` | Implemented - copy update required | Cloud/AWS infrastructure capability page. Delivery track leads. |
| `/hire` | Implemented - copy update required, nav priority reduced | Talent hiring process page. Secondary in nav. Content retained. |
| `/hire/faq` | Implemented | Talent hiring FAQ. Retained as-is. |
| `/engineers` | Implemented - role description updated | Engineer directory. Proof of team depth, not primary product. |
| `/engineers/[slug]` | Implemented | Individual engineer profiles. Retained. |
| `/blog` | Implemented - content plan update | New pillar categories: `product-development`, `engineering-process`, `case-studies`. |
| `/blog/[slug]` | Implemented | Blog post template. Unchanged. |
| `/blog/category/[slug]` | Implemented + new categories | New categories needed per above. |
| `/about` | Implemented - copy update required | Company story leads with delivery capability. Talent network is bench evidence. |
| `/contact` | Implemented - copy update required | Project inquiry leads. Talent inquiry secondary. |
| `/start-project` | Implemented - copy update required | Project and engagement intake form. Build-with-us default track. Hire-an-engineer secondary path. |
| `/login` | Implemented | Client workspace login. No changes. |
| `/legal/privacy` | Implemented | No changes. |
| `/legal/terms` | Implemented | No changes. |
| `/sitemap.xml` | Implemented - update required | Include all `/services/[slug]` routes. Update priority weights. |

## API Routes

```
/api/auth/*           - JWT login/verify/logout (custom, no library)
/api/auth/google      - Google OAuth2 PKCE initiation
/api/auth/google/callback
/api/users/me         - Authenticated user profile
/api/users/[id]       - User management (admin)
/api/organizations    - Organization CRUD
/api/engineers        - Engineer directory + filtering
/api/engineers/[id]
/api/briefs           - Project + talent intake briefs (dual-track)
/api/briefs/[id]
/api/matches          - Match proposals
/api/matches/[id]
/api/placements       - Active placements
/api/placements/[id]
/api/projects         - Authenticated project management
/api/projects/[id]
/api/work             - PUBLIC: returns public case studies for /work page
/api/contact          - PUBLIC: dual-track inquiry intake (build | hire)
/api/timesheets
/api/timesheets/[id]
/api/invoices
/api/invoices/[id]
/api/activity
/api/upload
```

## Route Group Structure

```
src/app/
├── (marketing)/              ← public pages
│   ├── page.tsx              ← homepage
│   ├── services/
│   │   ├── page.tsx          ← services hub
│   │   └── [slug]/
│   │       └── page.tsx      ← per-service detail
│   ├── work/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── skills/
│   │   ├── page.tsx
│   │   └── [domain]/page.tsx
│   ├── hire/
│   │   ├── page.tsx
│   │   └── faq/page.tsx
│   ├── engineers/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── studio/page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   ├── [slug]/page.tsx
│   │   └── category/[slug]/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   └── start-project/page.tsx
├── (auth)/
│   └── login/page.tsx
├── (app)/                    ← protected dashboard routes
│   ├── layout.tsx            ← auth guard
│   ├── admin/
│   ├── dashboard/
│   └── dev/
├── api/
└── components/
    ├── ui/                   ← GlassCard, Button, Tooltip, Input, Avatar
    ├── marketing/            ← ServiceCard, DualTrackCTA, EngineerCard, PostCard
    ├── layout/               ← Navbar, Footer, ConditionalLayout
    └── dashboard/            ← shell, shared, admin, client, dev
```

## Machine-Readable Files

```
public/llms.txt        ← AI-system summary (software studio first)
public/services.md     ← NEW: machine-readable service catalog
public/engineers.md    ← Engineering network (team depth proof)
public/pricing.md      ← Delivery pricing leads; talent rates secondary
```

---

# 11. Database & Auth

**Authority for all backend decisions:** `BACKEND_ARCHITECTURE_SPEC_V2.md`

This section summarises what is relevant to frontend implementers. Do not make backend decisions from this spec alone; always cross-reference the backend spec.

Key patterns to preserve:

```
ConditionalLayout        - route-based navbar/footer visibility
requireSession           - auth guard, used in (app)/layout.tsx
requireRole              - role-specific layout guard
roleHome                 - { admin: "/admin", client: "/dashboard", developer: "/dev" }
services/clientProjects.ts - service layer → API → Drizzle/Neon
lib/formSchema.ts        - Zod schemas for all forms
PageTransition.tsx       - Framer Motion page transitions (cosmicSpring config)
SmoothScrollProvider.tsx - Lenis (keep as-is)
```

Analytics tags (preserve):

```
GA4:      G-8668KBDWFZ
Google Ads: AW-16686798799
FB Pixel:  721165943984672
```

---

# 12. Section-by-Section: Copy + Design

---

## SECTION 0 - Navigation

### Copy

```
Logo:  Andishi
Links: Services · Work · Skills · About
CTA:   Start a Project
```

Secondary (footer only): Hire Engineers · Engineers · Blog · Contact

### Design

- Sticky `top-0 z-50`
- `bg-[#15121b]/80 backdrop-blur-xl border-b border-white/[0.06]`
- Logo: Outfit 400, `--on-surface`
- Nav links: label-caps 11px, `--on-surface-dim`, hover `--on-surface`
- CTA: Ghost Glass pill, routes to `/start-project`
- Mobile: `IconMenu2` (Tabler, stroke 1.5) → glass drawer

### Migration Notes

- Remove `/hire` and `/engineers` from primary nav.
- Add `/services` as the first primary nav item.
- Update CTA label from "Book a Call" / "Hire Engineers" to "Start a Project."
- Keep: ConditionalLayout logic, auth state, role-aware links, mobile drawer state.

---

## SECTION 1 - Hero

### Copy

**Headline (Primary):**
We design, build, and ship software products.

**Subheadline:**
Custom software, SaaS platforms, AI systems, mobile apps, and enterprise tools. For founders and teams who need working software, not another project plan.

**CTA Primary:** See Our Work
**CTA Secondary:** Start a Project →

---

**Headline Alternatives for A/B:**

- A: `From brief to live product. No delays, no scope creep.`
  *Rationale: Speaks directly to the delivery frustration. Works for both local and global buyers.*

- B: `Software that ships. Built by a team that owns the outcome.`
  *Rationale: Differentiates on accountability rather than geography or price.*

- C: `Your next product. Designed, built, and deployed by Andishi.`
  *Rationale: Simple, direct, covers the full delivery cycle.*

---

### Design

- `min-h-screen`, `--bg-deep` background
- Two glow orbs: violet top-right, cyan bottom-left
- Right side: stacked glass product illustration cards (dashboard mockups, shipped product previews)
- Headline: display-xl, Outfit 300, `--on-surface`
- Subheadline: body-lg, `--on-surface-dim`, max-width 560px
- CTAs: Primary pill + Ghost pill, side by side
- Stagger entrance: headline (0s) → sub (0.15s) → CTAs (0.3s)
- Card texture: subtle plus/dot texture only. No stripe patterns.
- Numerals in metric cards and KPI badges: `font-mono` (JetBrains Mono)

### Implementation Notes

- Implemented in `src/components/sections/hero-section.tsx`.
- Hero and "the real situation" are one continuous section; keep the background art continuous.
- Right-side product illustrations: compact stacked glass cards showing project/product UI, not engineer profile cards.
- Hero styling is Tailwind-first; do not reintroduce a hero CSS module.

---

## SECTION 2 - Social Proof Bar

### Copy

**Label:** Clients and products we've shipped for

**Stat strip:**
`32+` products shipped · Clients in Nairobi, London, San Francisco & beyond · `8` service domains · `50+` engineers placed

_(Numbers: JetBrains Mono, `--primary` color. Surrounding text: Outfit, `--on-surface-dim`)_

**Trust flags:**
- Delivery-first team. You own the IP.
- 30-day delivery commitment on scoped builds.
- 50+ engineers placed globally with senior-only vetting.
- Local presence. Global delivery.

### Design

- Full-width Level 1 glass panel, `py-12`
- Stats: 4-block row with orbital dot separators, each stat wrapped in `<Tooltip>`
- Number: `mono-stat` class, `--primary`
- Trust flags: label-caps, `--on-surface-dim`, with `IconCircleCheck` in cyan

### Notes

Update `CLIENTS SHIPPED` stat label to `PRODUCTS SHIPPED`. Update icon from `IconBuildingStore` to `IconCode`. Retain proof strip layout structure.

---

## SECTION 3 - Problem Statement

### Copy

**Section label:** THE REAL SITUATION

**Headline:** Building software is straightforward. Getting it delivered is not.

**Body:**

You've briefed an agency. Got a proposal with a six-week start date and a 90-day timeline. Paid a deposit. Got a product that didn't match the brief.

Or you hired freelancers. Three of them. Each owned a different piece. Nobody owned the whole thing.

Andishi works differently. We scope in a single call. We write the brief, not you. We ship in weeks, not quarters. And we measure success by what changes for your business, not by the length of the deliverables list.

We also place senior engineers with teams who'd rather extend their own team than hand a project to us. Both options are on the table.

### Design

- Centered, max-width 720px, no cards - let text breathe
- Section label chip: `--primary`
- Headline: headline-lg, Outfit 300
- Body: four short paragraphs, body-lg, `--on-surface-dim`, `leading-[1.7]`
- Subtle violet glow orb behind text
- Entrance: fade-up on scroll with `useInView`

---

## SECTION 4 - Services Grid (Primary)

### Copy

**Section label:** WHAT WE BUILD
**Intro:** Eight service lines. One team that owns the outcome.

### Card Set A - Product Delivery (Row 1, 2×2)

| Card | Title | Body | Timeline | Icon |
|---|---|---|---|---|
| 1 | Web Applications | Custom-built web products for businesses that have outgrown off-the-shelf tools. We scope, design, build, and hand over production-ready systems. | `4–10 weeks` | `IconDeviceDesktop` |
| 2 | SaaS Products | From MVP to multi-tenant platform. We design the product architecture, build it, and ship it - with the technical foundations to scale. | `6–14 weeks` | `IconCode` |
| 3 | Mobile Applications | iOS and Android apps built for real usage patterns. Native or cross-platform, depending on what the product actually needs. | `6–12 weeks` | `IconDeviceMobile` |
| 4 | AI & Intelligent Systems | LLM integrations, AI-powered features, and intelligent automation built into production software. Not demos - shipped products. | `3–8 weeks` | `IconBrain` |

### Card Set B - Specialist Builds (Row 2, 2×2)

| Card | Title | Body | Timeline | Icon |
|---|---|---|---|---|
| 5 | Enterprise Software | Internal platforms, workflow systems, and business tools that replace spreadsheets and manual processes at scale. | `8–20 weeks` | `IconBuildingSkyscraper` |
| 6 | Blockchain & Web3 | Smart contracts, on-chain integrations, DeFi tooling, and token-gated product features. Production-level, not tutorial-level. | `4–12 weeks` | `IconCurrencyBitcoin` |
| 7 | APIs & Integrations | Backend systems, data pipelines, and service integrations that connect your tools and eliminate manual work. | `2–6 weeks` | `IconCircuitBoard` |
| 8 | Product Strategy & Design | Scope definition, information architecture, UX design, and technical advisory for founders who need to make the right product decisions before building. | `1–3 weeks` | `IconCloudComputing` |

### Design

- `2×4` grid (two rows, four columns each) on desktop. `1×8` stack on mobile.
- GlassCard `glow="violet"` for Card Set A, `glow="cyan"` for Card Set B.
- Each card: `bento` + `group` classes.
- Icon: Tabler `size={20}` in `rounded-xl bg-[#d0bcff]/10 p-2.5 w-10 h-10`.
- Timeline chip: JetBrains Mono, cyan chip variant.
- Bottom progress bar: `h-px bg-gradient-to-r from-[#d0bcff]/20 via-[#4cd7f6]/30 to-transparent`.
- Hover: card lifts + icon wrapper scales 110%.
- Stagger: 0.1s between cards, 0.2s delay between rows.
- Below grid: Ghost Glass CTA - "See all services →" routes to `/services`.

---

## SECTION 5 - Process Steps

### Copy

**Section label:** HOW A PROJECT GOES
**Headline:** From brief to live product, here is exactly what happens

| Step | Title | Body |
|---|---|---|
| 01 | One scoping call | Tell us what you're building and why. We'll tell you what's realistic, what it will take, and whether we're the right fit. No pitch. No deck. A direct conversation. |
| 02 | We write the brief, not you | After the call, we produce a one-page project brief: scope, timeline, deliverables, and cost. You approve it or we adjust. No drawn-out back-and-forth. |
| 03 | We build in sprints, not silos | You see working progress every week. Feedback rounds are structured. Scope changes are flagged the moment they appear - never buried in a final review. |
| 04 | You get a live product | When we ship, the product is live, tested, and documented. You own the IP entirely. We stay available for 30 days post-launch. |

### Design

- Horizontal timeline desktop, vertical stack mobile.
- GlassCard `glow="cyan"` per step, connected by dashed `--secondary/20` lines.
- Step number: 56px, JetBrains Mono, `--secondary` at 30% opacity - watermark behind card title.
- Connector: `h-px w-full bg-gradient-to-r from-[--secondary]/30 to-transparent` (desktop).
- Orbital dot at each connector: 6px `rounded-full bg-[--secondary]/60`.

---

## SECTION 6 - Case Studies

### Copy

**Section label:** RECENT WORK

**Card template:**

```
[Cyan chip: Service · Location]          [JetBrains Mono: Delivery timeline]

[Project Name - headline-md]
[Problem: one sentence - body-md, --on-surface-dim]

What we built
[Deliverable: one sentence]

The result
[Metric: mono-stat, --tertiary, 56px]    ← wrap in Tooltip
[Context: one sentence]

"[Client quote, max 25 words]"
- [Name, Title]

[See the full case study →]
```

**Card layout:** first card `col-span-7`, second `col-span-5`, third full-width horizontal.

### Design

- GlassCard `glow="amber"`.
- Result metric: 56px JetBrains Mono, `--tertiary`, wrapped in `<Tooltip>`.
- Quote: `border-l-2 border-[--tertiary]/40 pl-4 italic body-md`.
- Service/industry chip: cyan, JetBrains Mono.
- "See all work →" ghost link below grid, routes to `/work`.

---

## SECTION 7 - Comparison Table

### Copy

**Section label:** WHY ANDISHI
**Headline:** Why founders and engineering teams choose Andishi over a freelancer or a larger agency

| Criteria | Freelancer | Large Agency | Andishi |
|---|---|---|---|
| Scoping speed | Days to weeks | Weeks to months | One call |
| Accountability | One person | Account manager layer | Founder-direct |
| Timeline transparency | Variable | Milestone-gated | Weekly visible progress |
| IP ownership | Shared or unclear | Contracted, but checked | You own everything, always |
| Talent depth | One generalist | Junior-heavy teams | Senior engineers across 8 domains |
| Post-launch support | Rare | Retainer-only | 30 days included |
| Delivery start | 2–4 weeks | 4–8 weeks | Within 5 business days |
| Talent hire option | No | No | Yes - same vetted team |

### Design

- Full-width GlassCard container, Level 2.
- Header row: `--surface-highest`, label-caps.
- Andishi column: highlighted `bg-[#d0bcff]/8 border border-[#d0bcff]/20`.
- Checks: `IconCircleCheck` size 18 stroke 2, `--secondary`.
- X marks: `IconX` size 16 stroke 1.5, `--outline`.
- Row hover: `hover:bg-white/[0.03]`.
- Mobile: horizontal scroll, sticky first column.

---

## SECTION 8 - Talent Track (Secondary)

This section sits below the comparison table and surfaces the hire-an-engineer track for visitors who want to extend their own team rather than hand off a project.

### Copy

**Section label:** ALTERNATIVELY

**Headline:** Need to extend your engineering team instead?

**Body:**
If you're not looking for a product partner but for a senior engineer to embed in your existing team - that's also something we do. We source, vet, and place senior engineers from across Africa with global teams who need to move fast without the six-month recruiting cycle.

**Proof strip:** `50+` engineers placed globally · Average time-to-placement: `8` days · 30-day replacement guarantee

**CTA:** Hire a Senior Engineer →  (routes to `/hire`)

### Design

- Single GlassCard `glow="violet"`, centered, max-width 800px.
- Proof strip: 3-stat row with JetBrains Mono numbers, orbital dot separators.
- CTA: Ghost Glass pill, `--secondary` border on hover.
- Section visually de-emphasized relative to Section 4 (Services Grid) - smaller headline size, more `--on-surface-dim` text.

---

## SECTION 9 - Founder

### Copy

**Section label:** FOUNDER

**Pull quote:** "Built from Nairobi. Shipping for the world."

**Body:**
Andishi was started because we kept seeing the same problem: founders with real ambition, stuck with digital partners who missed deadlines, padded budgets, or didn't understand what the product was actually for.

We build software for clients across Africa, Europe, and North America because delivery quality doesn't have an address. Our engineers are senior, our process is structured, and every project we take on has an owner who answers directly to you.

We also place engineers because the talent is real and the arbitrage is real. Both services come from the same network and the same standards.

**Attribution:** Ian Mwangi, Founder, Andishi

### Design

- Two-column: photo left (circular mask, `ring-2 ring-[--secondary]/20`), text right.
- Quote: headline-md, Outfit 300, italic, `--on-surface`.
- Body: body-lg, `--on-surface-dim`.
- Name: label-caps, `--primary`.
- Amber glow orb behind photo.

---

## SECTION 10 - FAQ

### Copy

**Section label:** QUESTIONS

**Questions:**

1. **What kinds of products do you build?**
   Web applications, SaaS platforms, AI-powered tools, mobile apps (iOS and Android), enterprise internal tools, blockchain and Web3 products, APIs, and data integrations. If the product needs to be built and shipped, it's in scope.

2. **How long does a typical project take?**
   A scoped web app takes 4–10 weeks. A full SaaS product is typically 6–14 weeks from scoping to initial launch. Mobile apps run 6–12 weeks. We give you a specific timeline in the brief after the first call.

3. **Do you also place engineers directly?**
   Yes. If you'd rather extend your own team than hand off a project, we source and place senior engineers from our vetted network. Average time-to-placement is 8 days. There's a 30-day replacement guarantee.

4. **Who do you work with?**
   Founders launching their first product, CTOs extending their engineering capacity, and established businesses replacing manual systems with purpose-built software. We work with clients in Nairobi, across East Africa, and internationally.

5. **What happens if something's not right after you ship?**
   We stay available for 30 days post-launch at no additional cost. If the problem is inside the scope we defined, we fix it. If it's a scope change, we scope and price it separately.

6. **How do I get started?**
   The `/start-project` form takes five minutes. We'll schedule a scoping call within one business day.

### Design

- Accordion, GlassCard `glow="none"`, Level 2.
- Chevron: `IconChevronDown`, rotates 180° on open, `cosmicSpring`.
- Open state: `bg-white/[0.065] border-[#d0bcff]/20`.
- Body text: body-md, `--on-surface-dim`, `leading-[1.7]`.

---

## SECTION 11 - Final CTA

### Copy

**Headline:** Ready to build something?

**Body:** Tell us what you're working on. We'll come back with a scope, timeline, and honest assessment of fit within one business day.

**CTA Primary:** Start a Project (routes to `/start-project`)
**CTA Secondary:** Or hire an engineer → (routes to `/hire`)

### Design

- Full-width masked section: `min-h-[40vh]`, centered content, deep void background.
- Two radial glow orbs: violet left, cyan right, both at reduced opacity.
- Headline: display-xl, Outfit 300.
- Dual-track CTAs: Primary pill + Ghost pill, side by side.
- No extra decoration. Let the copy carry it.

---

# 13. AI-SEO Technical Setup

## Organization Schema (layout.tsx - site-wide)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Andishi",
  "url": "https://andishi.dev",
  "foundingLocation": "Nairobi, Kenya",
  "description": "Andishi is a software development company building custom software, SaaS products, AI systems, web applications, mobile applications, enterprise platforms, and blockchain solutions for global and local clients.",
  "areaServed": ["Kenya", "East Africa", "United States", "United Kingdom", "European Union"],
  "serviceType": [
    "Custom Software Development",
    "SaaS Product Development",
    "AI Systems Integration",
    "Mobile Application Development",
    "Enterprise Software",
    "Blockchain Development",
    "Engineering Talent Placement"
  ]
}
```

## Services Hub Schema (/services)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Software Development Services",
  "provider": { "@type": "Organization", "name": "Andishi" },
  "description": "End-to-end software development across custom software, SaaS, AI, mobile, enterprise, and blockchain.",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Andishi Services",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Custom Software Development", "url": "https://andishi.dev/services/custom-software" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "SaaS Product Development", "url": "https://andishi.dev/services/saas-development" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "AI Systems Integration", "url": "https://andishi.dev/services/ai-systems" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Mobile App Development", "url": "https://andishi.dev/services/mobile-apps" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Enterprise Software", "url": "https://andishi.dev/services/enterprise-software" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Blockchain Development", "url": "https://andishi.dev/services/blockchain" } }
    ]
  }
}
```

## Per-Service Schema (/services/[slug])

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "SaaS Product Development",
  "provider": { "@type": "Organization", "name": "Andishi" },
  "serviceType": "SaaS Product Development",
  "description": "Andishi designs, builds, and launches SaaS products - from MVP architecture through multi-tenant platform delivery. Includes product strategy, UX, engineering, and deployment.",
  "areaServed": ["Kenya", "East Africa", "United States", "United Kingdom", "European Union"],
  "url": "https://andishi.dev/services/saas-development"
}
```

Apply the same pattern to all six `/services/[slug]` pages, replacing `name`, `serviceType`, and `description` per service.

## Skills Domain Schema Update (/skills/[domain])

Replace the existing `Service.description` values on all four domain pages with delivery-first descriptions:

```json
// /skills/ai
{
  "serviceType": "AI Software Development",
  "description": "Andishi builds AI-integrated products and intelligent systems using LLM APIs, machine learning pipelines, and production-grade AI tooling for startups and enterprises."
}

// /skills/fullstack
{
  "serviceType": "Full-Stack Web Development",
  "description": "Andishi designs and ships full-stack web products using React, Next.js, Node.js, and PostgreSQL. Clients receive production-ready codebases, not proof-of-concepts."
}

// /skills/web3
{
  "serviceType": "Blockchain and Web3 Development",
  "description": "Andishi builds smart contracts, DeFi tooling, and on-chain product integrations using Solidity, Ethereum, and compatible chains."
}

// /skills/aws
{
  "serviceType": "Cloud Infrastructure Engineering",
  "description": "Andishi designs and implements AWS cloud infrastructure, DevOps pipelines, and scalable backend architectures for production software products."
}
```

## FAQ Schema (/services/[slug] and homepage)

Add `FAQPage` schema to all six service sub-pages. Each FAQ block should cover: what the service includes, typical timeline, what's needed to start, cost range, and what happens after delivery.

## Page Meta (app/page.tsx - homepage)

```tsx
export const metadata = {
  title: "Andishi - Software Development Studio",
  description:
    "Andishi builds custom software, SaaS products, AI systems, mobile apps, and enterprise platforms. Delivery-first team. You own everything we ship.",
  openGraph: {
    title: "Andishi - Software Development Studio",
    description: "Custom software, SaaS, AI, mobile, enterprise. Delivered.",
    url: "https://andishi.dev",
    type: "website",
  },
};
```

## public/llms.txt (Updated)

```
Andishi is a software development company based in Nairobi, Kenya, building custom software,
SaaS products, AI systems, web applications, mobile applications, enterprise platforms, and
blockchain solutions for global and local clients.

Primary services: custom software development, SaaS product development, AI and intelligent
systems integration, mobile app development (iOS and Android), enterprise software and
internal tools, blockchain and Web3 development, product strategy and design.

Andishi also places vetted senior African engineers with global startups and technology
companies as a secondary service. The engineering network covers full-stack web, AI/ML,
AWS and cloud infrastructure, Web3, and API systems.

Clients range from Nairobi-based founders to seed-stage and Series B startups across the
US, UK, EU, and GCC.

Key pages: /services (service lines), /work (shipped projects and case studies),
/skills (technical capabilities), /hire (talent placement process), /engineers (team directory),
/about, /contact, /start-project.
```

## public/services.md (New)

```markdown
# Andishi Services

Andishi is a software development company. The following services are available.

## Custom Software Development
Scope: end-to-end design, build, and delivery of web-based software applications.
Typical timeline: 4–10 weeks for an initial working product.
Engagement: fixed-scope or iterative sprint-based.

## SaaS Product Development
Scope: MVP through multi-tenant platform. Includes architecture, UX, engineering, and launch.
Typical timeline: 6–14 weeks from scoping to initial release.

## AI and Intelligent Systems
Scope: LLM API integrations, AI-powered feature development, intelligent workflow automation.
Typical timeline: 3–8 weeks depending on integration complexity.

## Mobile Applications
Scope: iOS and Android app development. React Native or native per project requirements.
Typical timeline: 6–12 weeks.

## Enterprise Software
Scope: internal platforms, workflow systems, and business tools replacing manual processes.
Typical timeline: 8–20 weeks.

## Blockchain and Web3
Scope: smart contracts, on-chain integrations, DeFi tooling, token-gated features.
Typical timeline: 4–12 weeks.

## APIs and Integrations
Scope: backend systems, data pipelines, third-party service integrations.
Typical timeline: 2–6 weeks.

## Product Strategy and Design
Scope: scoping, information architecture, UX design, technical advisory.
Typical timeline: 1–3 weeks.

## Engineering Talent Placement (Secondary)
Scope: sourcing, vetting, and placing senior African engineers with global teams.
Typical time-to-placement: 8 days average.
Guarantee: 30-day replacement guarantee.

Contact: /start-project (software build) or /hire (talent placement)
```

## AI Visibility Monitoring Queries

Test monthly across ChatGPT, Perplexity, and Google AI Overviews:

**Primary - software delivery:**
- "software development company Kenya"
- "custom software development Africa"
- "build SaaS product Africa"
- "AI development company Nairobi"
- "mobile app development Kenya"

**Talent track - retained:**
- "hire senior African software engineers"
- "African developer outsourcing for startups"

**Comparison:**
- "Andishi vs software agency Nairobi"
- "software development company East Africa"

## UTM Link Structure

```
https://andishi.dev/[page]?utm_source=[source]&utm_medium=[medium]&utm_campaign=[campaign]
```

| Placement | utm_source | utm_medium | utm_campaign |
|---|---|---|---|
| Hero CTA | landing_page | internal | hero_cta |
| Services CTA | landing_page | internal | services_section |
| Final CTA | landing_page | internal | final_cta |
| LinkedIn post | linkedin | social_organic | studio_launch |
| Email | email | newsletter | site_reposition |

---

# 14. Launch Sequence

## Phase 0 - Copy updates (no new routes required, 1–2 days)

1. Update homepage copy, proof strip, CTA labels.
2. Update `public/llms.txt`, `public/pricing.md`.
3. Update `/about`, `/contact`, `/start-project` copy.
4. Update root layout `Organization` schema description.
5. Push to production. Verify schema at schema.org/validator.

## Week 1 - Owned channels first

- Update Google Search Console sitemap submission.
- Email existing contacts: two paragraphs. "Here's what Andishi builds now, and what that means for you." Link to `/services` with UTM.
- Update LinkedIn and Instagram bio and pinned link.
- LinkedIn founder post: first person. "Here's what we decided to lead with - and why." Specific. One data point. No announcement language.

## Week 2 - Rented channels

- LinkedIn thread: "Eight software products we shipped in the last year and what we learned from each." Specific, technical, no promotion.
- X: "The difference between a project partner and a talent marketplace: a short thread for CTOs."
- Instagram: carousel using the comparison table or process steps as the visual.

## Week 3 - Borrowed reach

- Pitch one East African tech podcast: "What it actually takes to ship software products from Nairobi at a global standard."
- Guest post pitch to one startup publication: "Why African engineering talent will dominate the next decade of software delivery."
- Submit site to Wellfound, startup directories, and African tech communities for inbound link building.
- Comment in two to three CTOs/founders Slack groups or subreddits - add genuine value to a software delivery thread, no promotion.

## Ongoing Monthly

- Add one new case study per completed project within 30 days of delivery.
- Each case study feeds: one social post, one SEO page update, one FAQ answer update.
- Monthly AI visibility check against the query list in Section 13. Log citations. Adjust content based on what language is being used in citations.
- Quarterly: update proof strip stats, case study count, service delivery timeline data. Freshness signals affect AI citation weight.

---

# 15. Developer Checklist

## Current Completed Foundation

- [x] Hero and adjacent problem section consolidated into one seamless section.
- [x] Brand/client bar implemented as the transition divider.
- [x] Hero uses full-bleed background art.
- [x] Hero dashboard illustrations stacked on the right side for large screens.
- [x] Subtle plus/dot texture on hero cards; stripe pattern removed.
- [x] Sparkle/star icons avoided.
- [x] Hero numerals use JetBrains Mono via `font-mono`.
- [x] Primary text token direction established.
- [x] CTA gradient tokens and sizing foundation established.
- [x] Hero styling Tailwind-first; hero CSS module removed.
- [x] `/work` page rebuilt with filters, sticky sidebar, project grid, case-study drawer.

## Setup (if not already done)

- [ ] `@tabler/icons-react` installed.
- [ ] `Outfit` + `JetBrains Mono` loaded via Google Fonts in `globals.css`.
- [ ] CSS custom properties defined in `:root` (Section 3).
- [ ] `lib/motion.ts` created with `cosmicSpring`, `floatSpring`, `containerVariants`, `itemVariants`, `fadeUp`.
- [ ] `z-[100]` utility defined in `globals.css`.
- [ ] `ConditionalLayout`, `PageTransition`, `SmoothScrollProvider` preserved.

## June 2026 - Phase 0 Tasks

- [ ] Homepage hero copy updated.
- [ ] Homepage proof strip stats updated (delivery metrics lead).
- [ ] Homepage CTA primary label changed to "Start a Project."
- [ ] `/about` copy updated.
- [ ] `/contact` copy updated.
- [ ] `/start-project` copy updated.
- [ ] `public/llms.txt` content updated.
- [ ] `public/pricing.md` content updated.
- [ ] Root layout `Organization` schema `description` field updated.

## June 2026 - Phase 1 Tasks (Services Hub)

- [ ] `src/data/services.ts` created with all eight service line definitions.
- [ ] `/services` route rebuilt as services hub with `ServiceCard` grid.
- [ ] All six `/services/[slug]` sub-pages implemented.
- [ ] `Service`, `FAQPage`, and `BreadcrumbList` schema on each sub-page.
- [ ] `public/services.md` created.
- [ ] Sitemap updated to include all service routes.
- [ ] Primary nav updated: `/services` replaces `/hire`.
- [ ] Header CTA label changed to "Start a Project."

## June 2026 - Phase 2 Tasks (Capability + Proof)

- [ ] `src/data/work.ts` updated: `service` and `vertical` tags added to all case study entries.
- [ ] `/work` filter-by-service and filter-by-vertical implemented.
- [ ] `ItemList` schema added to `/work`.
- [ ] All four `/skills/[domain]` pages updated to dual-track structure.
- [ ] `Service` schema updated on all `/skills/[domain]` pages.
- [ ] `DualTrackCTA` component implemented and deployed on skills pages.
- [ ] `/studio` copy updated.
- [ ] `/hire` intro copy updated.
- [ ] New blog categories created: `product-development`, `case-studies`, `engineering-process`.

## June 2026 - Phase 3 Tasks (Navigation + Links)

- [ ] Footer nav restructured into five link groups.
- [ ] All internal CTA links audited across public pages.
- [ ] `/engineers` CTAs updated to route through `/hire`.
- [ ] `public/engineers.md` updated with opening note.
- [ ] Visual QA at 375px, 768px, 1280px, 1440px across all updated public pages.

## v2 Migration Pass (if not completed)

- [ ] Global: `font-bold` removed or replaced with scale/color.
- [ ] Global: `font-semibold` removed.
- [ ] Global: `Nunito` / `Montserrat` / `.monty` replaced with Outfit.
- [ ] Global: `react-icons/fa` imports replaced with `@tabler/icons-react`.
- [ ] Global: `lucide-react` imports replaced with `@tabler/icons-react`.
- [ ] Global: `purple-400` / `purple-500` / `#96aeff` replaced with CSS tokens.
- [ ] Global: `animate-pulse` (ambient) replaced with CSS glow orb or removed.
- [ ] Global: `ease: "easeOut"` in Framer configs replaced with `cosmicSpring`.
- [ ] All stat/number values wrapped in `font-['JetBrains_Mono']` span.
- [ ] `bg-[#15121b]` set on `body` in `globals.css`.

## SEO & Accessibility

- [ ] `FAQPage` JSON-LD on homepage and all service sub-pages.
- [ ] `Service` + `hasOfferCatalog` JSON-LD on `/services`.
- [ ] `Organization` JSON-LD updated in `layout.tsx`.
- [ ] `ItemList` JSON-LD on `/work`.
- [ ] `/llms.txt` content updated and deployed to site root.
- [ ] `/services.md` deployed to site root.
- [ ] `robots.txt` - AI bots NOT blocked: `GPTBot`, `PerplexityBot`, `ClaudeBot`, `anthropic-ai`, `Google-Extended`, `Bingbot`.
- [ ] All images: descriptive `alt` text.
- [ ] All CTAs: accessible labels with `aria-label`.
- [ ] Focus rings: `focus-visible:ring-2 focus-visible:ring-[#d0bcff]/50` on every interactive element.
- [ ] "Last updated" visible in footer.
- [ ] Google Search Console sitemap resubmission post-deploy.
- [ ] GA4 tag `G-8668KBDWFZ` preserved.
- [ ] FB Pixel `721165943984672` preserved.
- [ ] Google Ads tag `AW-16686798799` preserved.
- [ ] UTM parameters on all primary CTA links.

## Quality Gates Before Launch

- [ ] Lighthouse performance: 80 minimum.
- [ ] Zero `font-bold` / `font-semibold` anywhere in codebase.
- [ ] Zero sparkle/star icons.
- [ ] Zero solid card fills - all glass.
- [ ] JetBrains Mono on numbers only.
- [ ] Tooltips on all stat values in proof strip and case studies.
- [ ] Mobile tested: 375px and 390px.
- [ ] Scroll entrance animations: no layout shift.
- [ ] Auth flow tested: login → dashboard redirect for all 3 roles.
- [ ] Dashboard pages render correctly with new CSS tokens.
- [ ] `/services` hub and all six sub-pages render correctly.
- [ ] All internal CTAs route to correct destination (build vs hire track).

---

_Andishi v3 Complete Project Specification_
_Version 3.0 · June 2026_
_Software Development Studio · Cosmic Identity Design System · AI-SEO Ready_
_Built from: DESIGN.md + Component_Library.md + BACKEND_ARCHITECTURE_SPEC_V2.md + V3_CURRENT_STATE_AUDIT_REVISED.md_
_Review quarterly or after every three case studies published._
