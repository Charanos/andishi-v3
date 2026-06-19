# Comprehensive Dashboard Visual Revamp + Clients Page Modalization

## Overview

A full-scope upgrade across all admin dashboard pages with three main goals:
1. **Visual elevation** - sleeker cards, charts, tables, modals and stat tiles using consistent glassmorphism, micro-animations, and the theme's non-bold typography.
2. **Engineer & Client cards revamp** - premium redesign of the `EngineerCard` and `ClientCard` with richer data display (using onboarding reference data for clients).
3. **Client detail modalization** - clicking a `ClientCard` opens a full-screen premium modal (not just a side drawer) that shows a comprehensive client profile, their stakeholders, briefs, placements, billing history, and account context.

---

## Design Principles (from theme guide)
- Font weight: `font-medium` maximum - never `font-bold` or `font-semibold`
- Glassmorphism: `backdrop-blur-2xl`, `bg-gradient-to-br from-[...surface-high...] to-[...transparent]`, `inset shadow` for depth
- Border: `var(--glass-border)` with tone-accented hover states
- Radius: `1.2rem`–`1.6rem` for cards; `1rem`–`1.35rem` for inner elements
- Shadows: `0 12px 34px color-mix(in srgb, var(--bg-deep) 6%, transparent)` standard; deeper on modals
- Motion: `transition-all duration-300/500`, `hover:-translate-y-0.5`
- Icons: `stroke={1.6}` to `stroke={1.75}`

---

## Phase 1 - Shared Component Upgrades

### [MODIFY] [entity-drawer.tsx](file:///e:/Charanos/Documents/andishi/src/components/dashboard/shared/entity-drawer.tsx)
- Upgrade header with premium glassmorphism panel  
- Add gradient backdrop behind drawer
- Title styling: `font-medium`, cleaner close button pill

### [MODIFY] [confirm-dialog.tsx](file:///e:/Charanos/Documents/andishi/src/components/dashboard/shared/confirm-dialog.tsx)
- Deeper shadow, frosted panel, better icon badge styling
- Subtle entrance animation via CSS

### [MODIFY] [operational-data-table.tsx](file:///e:/Charanos/Documents/andishi/src/components/dashboard/shared/operational-data-table.tsx)
- Cleaner row hover states with glass highlight
- Better header typography and separator styling

### [MODIFY] [status-badge.tsx](file:///e:/Charanos/Documents/andishi/src/components/dashboard/shared/status-badge.tsx)
- Rounder pill, subtle gradient fill, micro-animation on mount

---

## Phase 2 - Client Page Modalization + Card Revamp

### [MODIFY] [admin-clients-page.tsx](file:///e:/Charanos/Documents/andishi/src/components/dashboard/admin/admin-clients-page.tsx)

#### ClientCard Revamp
- **Replace** the flat two-section layout with a premium single-surface card featuring:
  - Gradient header section with client name, tier badge, status badge, and health ring
  - Industry pill + MRR displayed inline with the industry tag
  - Key signal row: Briefs / Placements / Open invoices in a clean minimal row
  - Relationship score + health progress as thin gradient bars
  - Next action as an eyebrow text with `→` caret
  - Stakeholder avatars shown as stacked initials (max 3 + overflow count)
  - Hover: lift shadow + border accent transition

#### New `ClientDetailModal` - Full-Screen Premium Profile
When a ClientCard is clicked (`onInspect`), instead of the side `EntityDrawer`, open a large centered modal with:
- **Header section**: Client logo placeholder (initial avatar, large), name, industry, tier, status badge, owner pill, `lastTouched` timestamp
- **Tab navigation** (4 tabs using pill switcher):
  1. **Overview** - `accountPromise`, `commercialModel`, `marginGuardrail`, `nextAction`, `risk` note, `notes`
  2. **Stakeholders** - card for each stakeholder with role, influence badge, contact email
  3. **Financials** - MRR, billing posture, open invoices, protected spread estimate, `decisionHealth` ring
  4. **Activity** - scrollable activity feed with timestamps
- **Signal bars** at the bottom: Relationship score, Account health, Expansion readiness
- Action buttons: Advance, Mark risk, Edit, Message, Archive - in a sticky footer
- Close button (X) top-right, keyboard `Escape` to close
- Animated entrance/exit using `transition`

---

## Phase 3 - Engineer Card & Page Revamp

### [MODIFY] [admin-engineers-page.tsx](file:///e:/Charanos/Documents/andishi/src/components/dashboard/admin/admin-engineers-page.tsx)

#### EngineerCard Revamp
- Monogram avatar: larger (14×14), deeper glow ring with domain-accented border color
- Domain badge next to status badge
- Skills as subtle `font-mono` pill tags
- Signal trio: `Availability%` / `Profile%` / `Rate` in clean 3-column pill
- Fit signal bars: Depth, Delivery, Reliability, Communication - compact, color-graded
- Readiness ring: larger, with percentage label
- Vetting progress: a horizontal `N/4 items complete` indicator pill
- On hover: lift + secondary border glow

#### EngineerDetailModal
When `onInspect` is fired (currently opens `EntityDrawer`), open a premium **full-screen modal** with:
- **Header**: Avatar, name, role, domain badge, status badge, timezone + location pill
- **Tabs**:
  1. **Profile** - `clientFitNarrative`, `shortlistReadiness`, `evidencePack` items as cards, skills
  2. **Vetting** - Checklist with animated checkmarks, progress ring
  3. **Compensation** - `adminCompensationNote`, admin rate, developer payout, rate slider visual
  4. **Activity** - scrollable activity list

---

## Phase 4 - Dashboard-Wide Chart & Table Visual Lift

### All chart containers (`ChartPanel` wrappers in engineers, clients, placements, pipeline pages)
- Upgrade border to `from-[surface-high 44%]` gradient background
- Reduce chart padding waste, tighten label typography
- Panel shadow: `0 22px 60px color-mix(in srgb, var(--bg-deep) 8%, transparent)`

### Signal bars + domain capacity maps
- Gradient bar fills instead of solid colors
- Thinner tracks (`h-[0.3rem]`) for sleeker appearance

### `MetricStrip` component
- Add animated accent bar height transition on hover (already has `group-hover:h-10`)
- Add `transition-colors` on icon background

---

## Open Questions

> [!NOTE]
> The `EntityDrawer` is currently used for both engineer and client detail. The plan replaces them with centered modals for richer data presentation. The `EntityDrawer` will remain for other uses (e.g., pipeline cards).

> [!IMPORTANT]
> Client onboarding data (`stakeholders`, `commercialModel`, `marginGuardrail`, `accountPromise`, `roleVisibility`) is already in the `ClientRecord` type - we just need to surface it elegantly in the new modal.

---

## Verification Plan

### Automated
- `npm run dev` is already running - hot reload will verify each change
- TypeScript errors shown inline in dev server output

### Manual
- Verify ClientCard click opens `ClientDetailModal` with all 4 tabs functional
- Verify EngineerCard click opens `EngineerDetailModal` with all 4 tabs functional
- Verify modal closes on Escape key and backdrop click
- Verify all stat cards, chart panels, tables look elevated on pipeline, placements, engineers, clients pages
