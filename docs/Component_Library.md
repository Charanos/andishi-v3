# Future School: Core Component Library

This document tracks the verified, premium UI components implemented in the system. All components use **Tailwind CSS v4** and adhere to the **Glassmorphic** theme.

---

## 1. Layout & State

### `SidebarProvider`
**Location**: `app/components/providers/SidebarProvider.tsx`
A global context that synchronizes the sidebar's collapsed state across `Sidebar`, `AppShell`, and `TopNav`. This ensures the layout shifts smoothly and avoids occlusion.

### `AppShell`
**Location**: `app/components/layout/AppShell.tsx`
The primary layout wrapper. Optimized with a flex-based sibling pattern to ensure content "dodges" the sticky sidebar naturally.

---

## 2. Interactive Primitives

### `<Button />`
**Location**: `app/components/ui/Button.tsx`
Full-featured button with variants (`primary`, `secondary`, `glass`, `ghost`, `danger`) and loading states.
- **Glass variant**: Perfect for semi-transparent actions on dark backgrounds.
- **Shadows**: Uses `shadow-primary/20` for a soft glow.

### `<Input />` & `<Select />`
**Location**: `app/components/ui/Input.tsx`, `app/components/ui/Select.tsx`
Refined input fields with `JetBrains Mono` support for numeric data. Inputs support `leftIcon` and `rightIcon` props.

### `<Tooltip />`
**Location**: `app/components/ui/Tooltip.tsx`
A premium interactive utility using `framer-motion` for smooth entrance/exit.
- **Glassmorphic Styling**: Adheres to the core theme with backdrop-blur and semi-transparent borders.
- **Auto-Stacking**: Uses the dedicated `z-100` utility to float above all other UI layers.
- **Usage**: Mandatory for all KPI values and specific data points in charts for tactile discovery.

### `<Separator />`
**Location**: `app/components/ui/Separator.tsx`
A professional section transition component.
- **Visual Pivot**: Features an optional centered dot for elegant section breaks.
- **Implementation**: Used to delineate high-level analytics from directory/table views.

---

## 3. High-Fidelity Modules

### `<Avatar />`
**Location**: `app/components/ui/Avatar.tsx`
**3-Layer Robustness Strategy**:
1. **Initials (CSS)**: Instant static fallback.
2. **Dicebear (API)**: Generative SVG icons for empty profiles.
3. **User Image**: High-resolution photo support with fail-safe error handling.

### `<GlassCard />`
**Location**: `app/components/ui/GlassCard.tsx`
The hallmark of the "Future School" look. Subtle borders (`white/10`) and background blurs (`backdrop-blur-xl`) create depth.
- **`bento` prop**: Applies specialized padding and group hover triggers for complex grid layouts.
- **`gradient` prop**: Applies a colored glow to the top border (Purple, Blue, Emerald, Orange).

### `<Sparkline />` & `<MiniBarChart />`
**Pattern**: Pure SVG Data Viz.
Used for inline trends within cards without external charting overhead. Supports auto-scaling ranges and theme-aware gradients.

---

## 4. Feature Modules

### School Grid & Cards
**Location**: `app/(super-admin)/schools/page.tsx`
A high-fidelity grid system for managing multi-tenant schools. 
- **Detailed Interaction**: Cards elevate on hover and reveal contextual actions.
- **Multi-View**: System supports a **Grid/Table Toggle** to balance high-detail vs high-density workflows.
- **Adaptive Avatars**: Multi-colored initials with brand-specific gradients based on tenant name.

### `<SystemHealth />`
**Location**: `app/components/dashboard/SystemHealth.tsx`
Live infrastructure monitoring widget with animated "pulse" indicators for API, Database, and Storage.

---

## 4. Navigation

### `<TopNav />`
**Location**: `app/components/layout/TopNav.tsx`
Features a live `ClientClock`, search integration, and role-aware notifications. Now layout-resilient (no longer occluded by sidebar).

### `getNavigation(role)`
**Location**: `lib/navigation.ts`
Centralized navigation registry. Defines labels like **"System Control"** for Super Admins.
