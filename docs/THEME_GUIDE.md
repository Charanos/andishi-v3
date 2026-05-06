# Andishi v3: Design & Theme Standards

This guide captures the technical and aesthetic protocols required to maintain the current Andishi v3 visual system. The foundation pass has established the homepage landing experience and work page as the quality bar for the rest of the site.

---

## 0. Current Foundation Decisions

- The homepage hero and "The real situation" block now live inside one seamless section so the Nairobi line-art background can bleed naturally across the transition.
- The brand/client card is the divider between hero and adjacent content. It should feel suspended in the middle of the transition, not like a separate section header.
- Hero illustration cards use a compact stacked composition on desktop and must collapse without overlapping copy or the brand divider on mobile.
- Use Tailwind utilities for section/component styling where practical. Keep global CSS focused on tokens, typography utilities, and true shared primitives.
- Never use sparkle/star decorative icons. Tabler icons are the only icon family for UI.
- Numerals, stats, currency, percentages, timelines, and IDs use JetBrains Mono via `font-mono` or the `.mono-*` utilities.
- Avoid over-reliance on purple. Purple/violet is the text and depth language; cyan is the signal/CTA/data accent; green is success/status only.
- Navbar and footer are shared from `src/app/layout.tsx`. Public pages must not mount duplicate nav/footer instances.
- The active source/deployment remote is GitHub: `https://github.com/Charanos/andishi-v3.git`.
- Homepage section quality now includes the interactive project showcase, process artifacts, full-width visual interlude, Why Andishi decision cockpit, and editorial founder section.
- Work page quality now includes the sticky desktop filter rail, project-card grid, case-study drawer, and patterned bottom CTA.
- The bottom landing experience now uses a reading-first blog grid, indexed FAQ accordion, terminal newsletter signup, and masked final CTA artwork.
- The project-showcase custom cursor pattern is reusable via `src/components/ui/custom-cursor-region.tsx` and should be reserved for immersive showcase/decision/CTA surfaces.
- Foundation building is complete as of May 7, 2026. Future section work should extend these patterns instead of creating a new visual language.

---

## 1. The Glassmorphism Recipe

To create a standard **Glassmorphic Card**, use the following CSS/Tailwind cocktail:

- **Background**: `bg-white/5` (Dark Mode) or `bg-white/70` (Light Mode).
- **Blur**: `backdrop-blur-xl` or `backdrop-blur-2xl`.
- **Border**: `border border-white/10` (Dark) or `border border-black/5` (Light).
- **Shadow**: `shadow-xl shadow-black/20`.
- **Glass variant**: Perfect for semi-transparent actions on dark backgrounds.
- **Shadows**: Uses `shadow-primary/20` for a soft glow.
- **Bento Pattern**: Standard `p-6 relative overflow-hidden group` for high-end cards.
- **Gradient Glows**: Use the `gradient` prop in `GlassCard` to apply subtle colored border glows (e.g., `yellow`, `blue`, `green`, `orange`).

---

## 2. Metrics & Insights (The "Insights" Card Pattern)

All statistical overview metrics must follow the "Insights" layout for consistency:

1. **Top Row**: Label (uppercase, tracking-wider) and a stylized Icon in a `bg-primary/10` wrapper.
2. **Value Row**: High-visibility metric in `font-mono`.
3. **Trend Line**: Trending Up/Down icon + percentage + "vs last month" text.
4. **Background Layer**: A muted, large icon overlay (opacity 0.03 to 0.05) that scales/rotates on hover (`group-hover:scale-110`).

---

## 3. Data Visualization (Mini Sparklines)

For high-density dashboards (like the revamped Schools page), use **Tiny Sparklines**:

- Use pure SVG paths to avoid heavy charting dependencies.
- **Layout**: 100x40px standard.
- **Colors**: Use the theme's semantic colors (`primary`, `emerald`, `orange`).
- **Gradient Fill**: Always include a downward-fading linear gradient fill for depth.

- **Base Hex**: `#56309B` (Light primary) | `#D8C8FF` (Dark primary).
- **Usage**: Buttons, active states, icons, and focus rings.

---

## 4. Typography Rules

- **Font-Family**:
  - **Outfit**: Global Default (Headings, UI labels).
  - **JetBrains Mono**: Strictly for Numerics (Stats, Currency, IDs, Tables, Charts).
- **Interactive Tooltips**:
  - All high-level KPI cards must wrap values/trends in a `<Tooltip />` component.
  - Bar charts must provide tooltips for every individual data point for interactive data exploration.
- **Font-Weight**:
  - **HARD RULE**: Do not use Tailwind `font-bold` or `font-semibold`.
  - Use `font-normal` for large display text and body copy.
  - Use `font-medium` sparingly for buttons, nav labels, chips, card titles, and compact UI labels.

---

## 4.1 Text Contrast Tokens

Primary text is intentionally violet-tinted rather than neutral black/white.

- Light mode: `--on-surface: #160B2F`, `--on-surface-dim: #46365F`.
- Dark mode: `--on-surface: #F4EEFF`, `--on-surface-dim: #C5B8E8`.
- Use `--primary` for labels, links, stat numbers, active states, and focused accents.
- Do not use raw `text-white` except inside gradient-filled CTA buttons where `--on-primary` would reduce clarity.

---

## 4.2 CTA Treatment

Primary CTAs now use a sleeker neutral treatment aligned with the navbar:

- Dark mode: white/on-surface fill with dark text for maximum contrast.
- Light mode: dark/on-surface fill with light background text contrast via `text-[var(--bg)]`.
- Minimum height should stay compact but touch-safe; use shared button variants where possible.
- Hover: lift by `-translate-y-px`, preserve elegance with shadow changes instead of opacity-only feedback.
- Avoid purple CTA fills unless the component explicitly needs a brand-gradient moment.

---

## 4.3 Artifact Windows

The current homepage process and trust sections use realistic interface artifacts. Preserve this pattern for future high-impact sections:

- Use mini browser/window chrome with three traffic-light dots.
- Use `font-mono` for terminal commands, route IDs, progress values, percentages, and compact status labels.
- Process artifacts should feel like real work output:
  - chat transcript for discovery,
  - problem/insight/direction brief,
  - sprint/progress window,
  - design board/canvas,
  - terminal deploy/handoff.
- Keep artifacts theme-aware with tokenized surfaces; terminal panels can use a stable dark surface for command-line authenticity.
- Add subtle hover lift or progress-change affordances only when they clarify interactivity.

---

## 4.4 Pattern Direction

Use texture to break monotony instead of color blobs:

- Preferred: plus/dot textures, subtle hairlines, offset outline shapes, faint etched panels.
- Avoid regular grid patterns.
- Avoid large radial color blobs except for extremely subtle depth where no pattern will work.
- Full-width visual sections may use theme-swapped imagery through explicit light/dark layers or CSS tokens.

## 4.5 Reading Sections

Editorial and FAQ sections should prioritize legibility over visual density:

- Body copy should generally sit around `0.92rem` to `0.98rem` with `1.75`+ line-height.
- Article cards may use stronger imagery, but supporting text must not be cramped.
- FAQ answers should have enough open height for full copy after typography changes.
- Newsletter or terminal panels can use a stable dark command surface in both themes when it clarifies the metaphor.
- On mobile, inputs and action rows should stack rather than squeeze text.

---

## 5. Layering & Stacking (Z-Index)

To maintain a predictable UI hierarchy, the following custom Z-Index tokens are used:

- `z-100`: The standard for high-level overlays (Tooltips, Dropdowns, Floaties). Defined in `globals.css` via Tailwind 4 theme.
- `z-50`: Standard for non-floating navigation elements.

---

## 5. Sidebar & Navigation Logic

- **Single Open Accordion**: The sidebar navigation must only allow **one** dropdown group to be open at any given time.
- **Persistence**: Navigation state is managed at the layout level to preserve the open group during route changes.

---

## 3. Layout Conventions

### The Floating Sidebar Pattern

Sidebars must be implemented as siblings to the main content in a flex container, NOT as absolute overlays on desktop. This prevents "occlusion" (hiding) of search bars and navigation.

```tsx
<div className="flex">
  <Sidebar /> {/* Standard occupant of layout space */}
  <div className="flex-1 overflow-hidden">
    <TopNav />
    <main>...</main>
  </div>
</div>
```

---

## 4. Animation & Interaction

- **Transistions**: Always use `transition-all duration-300` for hover effects.
- **Micro-Animations**: Use `framer-motion` for page transitions.
  - **Springs**: `type: "spring", damping: 25, stiffness: 200` is our standard "soft" feel.
- **Focus States**: Every interactive element must have `focus:ring-2 focus:ring-primary/50`.

---

## 5. Iconography

- **Library**: Strictly use `@tabler/icons-react`.
- **Stroke Width**:
  - **Active**: `stroke={2}`.
  - **Inactive**: `stroke={1.5}`.
- **Sizes**: Standard UI icons: `20px` | Navigation icons: `22px`.
