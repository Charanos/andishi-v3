# Andishi System AI: Skills, Roles, & Design Uniformity Guidelines

This document serves as the absolute source of truth and execution playbook for all AI agents working on the Andishi v3 project. It captures the roles, capabilities, design token semantics, layout architectures, GSAP/motion patterns, and component rules established on the landing page, linking them directly to the official documentation and page/dashboard implementation specifications.

---

## 1. Multi-Disciplinary Roles & Capabilities
When operating within this repository, the AI must assume and execute under the following concurrent roles:
- **Senior UI/UX Designer:** Championing the **Cosmic Theme** identity, layered glassmorphism, precise color schemes, typography, and spatial aesthetics.
- **Professional Fullstack Developer:** Implementing strict schema validations (Zod), database mutations, backend integrations, and server action flows.
- **Frontend Developer:** Building high-fidelity React (React 19), Next.js (Next.js 16 App Router), Tailwind CSS (Tailwind v4), and custom animations.
- **DevOps Engineer:** Managing TypeScript compilation validation (`npx tsc --noEmit`), code linting, database migrations, and clean builds.

---

## 2. Design System & Aesthetics (Source of Truth)
All UI design and layout implementations must follow the design rules specified in [docs/DESIGN.md](file:///c:/Users/user/OneDrive/Documents/andishi-v3-main/docs/DESIGN.md).

### The Light/Dark Mode Color Pivot
We have established a clear visual pivot for light and dark modes in [src/app/globals.css](file:///c:/Users/user/OneDrive/Documents/andishi-v3-main/src/app/globals.css):
* **Stellar Light Mode (Decyanized):**
  - **Background Swap:** The dashboard sidebar uses a subtle hueish purple background (`bg-[var(--dashboard-sidebar)]` / `--dashboard-sidebar`), while the main dashboard canvas is clean and elevated to structure depth.
  - **KPI Cards Color Balance:** Avoid saturation or over-utilization of deep purple fills in metrics blocks. KPI cards should feel clean, minimal, and editorial.
  - **No Cyan or Green Accents:** All tags, eyebrows, badges, active components, and accents have been stripped of cyan and green.
  - **Theme Colors:** `--primary` (`#19073b`), `--secondary` (`#2a1058`), and `--tertiary` (`#341369`) are mapped strictly to deep purple and violet shades.
  - **Gradients:** `--gradient-brand` is defined as a purely purple/violet gradient terminating in `#56309B`.
* **Nebula Dark Mode (Vibrant Accents):**
  - **Vibrant Interactive Elements:** Glows and interactive items use light purple (`#D8C8FF`) and cyan (`#4CD7F6`).
  - **Success / Status Markers:** Emerald green (`var(--tertiary)`: `#10B981`) is reserved exclusively for timelines, status cards, and complete markers.

### Typography Constraints (Strict Rules)
- **Zero Bold Weight:** Never use `font-bold` or `font-semibold` anywhere in navigation lists, page header labels, account user dropdowns, sidebar badges, or chat dialog boxes. All typography follows the Nunito medium (500) and normal (400) hierarchy system. Emphasis is created strictly through spacing, scale, hierarchy, or subtle color transitions.
- **Font Pairing:** Use **Outfit** (weight 400 for body, 500 for navigation/labels) for standard copy and controls. Use **Cormorant Garamond** (via the `.title-serif` helper) for page titles, headlines, and major sections.
- **Numeric Data:** Use `font-mono` (**JetBrains Mono**) strictly for IDs, monetary figures, timestamps, percentages, and metrics.

### Layout, Sidebar Pinned Chats & Floating Chat Spec
- **Pinned Sidebar Chats (Bottom Aligned):** Pinned chats (Support Desk, Alpha Project Chat, Team Sync) reside at the very bottom of the sidebar, right above the user profile badge (`MissionBadge`), separated by linear-gradient dividers.
  - They render circular photo avatars matching those in the floating panel, alongside dynamic active indicator status dots and unread counter tags.
- **Floating Chat Dialog (Compact & Scroll-Free):** The dialog drawer is restricted to a narrow, sleek `w-80` width card layout. Messages use `flex flex-col gap-2.5` (avoiding grid containers) and are aligned using `self-start` (others) and `self-end` (self) to wrap text natively without introducing horizontal scrollbars.
  - The chat remains accessible for all dashboard roles (Admin, Client, Developer). Logged-in admin user avatars (e.g. Dennis Munge) default to a male professional business photo if empty and reflect in both the top bar switcher and sidebar badge.
- **Layered Glassmorphism:** Use variable backdrop-blur (30px to 60px) and a subtle 1px border (`var(--glass-border)`) to simulate transparency. Solid fills are prohibited.
- **Native Layouts (No Performance Jank):** GSAP / ScrollTrigger scroll-jacking or heavy JS layout recalculations for layout headers and footers are strictly prohibited. Utilize native CSS (`sticky`, `absolute` positioning, native scrolling) for overlays and text placements.
- **Gutters & Content Widths:**
  - Outer page or section wrapper owns the responsive gutters: `px-5 sm:px-8 lg:px-10`
  - Inner content container controls the max-width: `mx-auto w-full max-w-[92rem]`
  - Standard section gap: `gap-9 md:gap-10 lg:gap-12` for dashboard canvases, `gap-5/gap-6` for internal cards/panels.

---

## 3. Motion & Animation Standards
Animations must feel premium, physics-based, and weighted, avoiding linear transitions or floaty/jittery effects.

### GSAP & ScrollTrigger Guidelines
GSAP handles high-performance timeline sequences, horizontal marquees, and page transitions.
- **Page Transitions:** Defined in [src/app/template.tsx](file:///c:/Users/user/OneDrive/Documents/andishi-v3-main/src/app/template.tsx). Uses a smooth slide-up, fade-in, and unblur:
  - Initial: `{ opacity: 0, y: 16, filter: "blur(12px)" }`
  - Final: `{ opacity: 1, y: 0, filter: "blur(0px)", duration: 0.85, ease: "power3.out", clearProps: "all" }`
- **Plugin Registration:** Always register ScrollTrigger explicitly in component files:
  ```ts
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  gsap.registerPlugin(ScrollTrigger);
  ```
- **Context & Lifecycle Cleanup:** To prevent memory leaks, target element duplication, or ghost triggers on route changes, always clean up GSAP configurations within `useGSAP` or React cleanup hooks using GSAP contexts or scroll-trigger kills.
- **GSAP MatchMedia:** For animations that differ on mobile (e.g. infinite marquees changing scroll directions or disabling parallax), wrap tweens inside `gsap.matchMedia()` hooks.

### Framer Motion & Spring Physics
Framer Motion handles declarative UI states, cards, lists, and hover interactions. Utilize the pre-configured physics profiles in [src/lib/motion.ts](file:///c:/Users/user/OneDrive/Documents/andishi-v3-main/src/lib/motion.ts):
- **`cosmicSpring` (Default spring profile):** `{ damping: 28, stiffness: 180, mass: 0.8 }`. Perfect for item entrances and subtle structural movements.
- **`floatSpring` (High rebound profile):** `{ damping: 22, stiffness: 220 }`. Used for buttons, hover transitions, and badge movements.
- **Entrance Helpers:** Leverage `fadeUp` and `itemVariants` staggered children options (`staggerChildren: 0.1` or `staggerChildren: 0.15`) to create a fluid, planetary alignment sequence when grids mount.

---

## 4. Dashboard Implementation Spec
Dashboard pages must align with the architectural blueprints in:
- [docs/DASHBOARD_MASTER_IMPLEMENTATION.md](file:///c:/Users/user/OneDrive/Documents/andishi-v3-main/docs/DASHBOARD_MASTER_IMPLEMENTATION.md) (Primary Execution Authority)
- [docs/Andishi-v3-Internal-Pages-Dashboard-Implementation-spec.md](file:///c:/Users/user/OneDrive/Documents/andishi-v3-main/docs/Andishi-v3-Internal-Pages-Dashboard-Implementation-spec.md) (Route Spec & Public Pages Map)
- [docs/Component_Library.md](file:///c:/Users/user/OneDrive/Documents/andishi-v3-main/docs/Component_Library.md) (Shared Primitives Tracker)

### Shared App Shell & Navigation
All dashboards inherit their structural layouts from a shared, authenticated layout wrapper:
- **`AppShell`** ([src/components/dashboard/shell/app-shell.tsx](file:///c:/Users/user/OneDrive/Documents/andishi-v3-main/src/components/dashboard/shell/app-shell.tsx)): Handles user contexts, mobile drawer states, topbar headers, and desktop sidebar offset margins.
- **`RoleSidebar`** ([src/components/dashboard/shell/role-sidebar.tsx](file:///c:/Users/user/OneDrive/Documents/andishi-v3-main/src/components/dashboard/shell/role-sidebar.tsx)): Renders collapsible side navigation, matching path highlights, sign-out actions, and user contextual stats.
- **`DashboardTopNav`** ([src/components/dashboard/shell/dashboard-top-nav.tsx](file:///c:/Users/user/OneDrive/Documents/andishi-v3-main/src/components/dashboard/shell/dashboard-top-nav.tsx)): Contains the keyboard search trigger, notifications bell, quick actions drop-down, and account switcher.
- **`roleNav` Registry** ([src/data/dashboard.ts](file:///c:/Users/user/OneDrive/Documents/andishi-v3-main/src/data/dashboard.ts)): The single source of truth for dashboard navigation. Never duplicate nav arrays in local routes.

### Role Mappings & Access Control (RBAC)
User scopes are mapped according to the `UserRole` definition in [src/types/auth.ts](file:///c:/Users/user/OneDrive/Documents/andishi-v3-main/src/types/auth.ts):
```ts
export type UserRole = "admin" | "client" | "developer";
```
- **Super Admin (`/admin`):** Global operations view (hiring briefs, matching pipelines, placements, invoices, system configurations).
- **Client (`/dashboard`):** Focuses on submitted briefs, shortlisted matching engineer profiles, active team members, and payments.
- **Developer (`/dev`):** Focuses on profile management, logged timesheets, earnings summaries, and active code projects.
- **Authentication Guards:** Route guards are validated on server-side route boundaries (not just client middleware), redirecting unauthorized actions to the user's correct home route.

---

## 5. Backend & API Guidelines
All backend development and model updates are governed by [docs/BACKEND_ARCHITECTURE_SPEC.md](file:///c:/Users/user/OneDrive/Documents/andishi-v3-main/docs/BACKEND_ARCHITECTURE_SPEC.md).
- **Zod & Discriminator Types:** Maintain strict schema verification for all forms and intake flows. Leverage distinct shapes (e.g., `BuildBrief` vs `HireBrief`) to represent project paths.
- **Database & Migrations:** Any model changes must be reflected in Neon PostgreSQL database schemas and migrated cleanly.
- **Data Scoping:** Enforce strict privacy filters so clients never receive admin-specific metadata, and developers only access timesheet/project arrays matched to their specific identifier.

---

## 6. Verification Rules
Before completing any task, compiling code, or committing changes:
1. **Type Safety:** Always run `npx tsc --noEmit` locally in the workspace to verify there are zero TypeScript compiler errors.
2. **Build Runs:** Avoid running full production builds (`npm run build`) unless explicitly asked, as `tsc` is the designated verification gate.
3. **Git Best Practices:** Always verify code compiles cleanly before staging changes. Use descriptive commit messages and sync changes with the remote origin (`https://github.com/Charanos/andishi-v3.git`).
