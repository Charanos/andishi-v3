# Andishi v3 - Dashboard Master Implementation Document

**Version**: 3.0 - Supersedes all previous dashboard notes
**Date**: May 2026
**Source of truth**: This document is the primary dashboard **UI/UX** execution authority.
**Backend authority**: `docs/backend/BACKEND_ARCHITECTURE_MASTER.md` governs the server-side data model, RBAC/permissions, service layer, ERP modules, CMS/CRM, careers, finance ledger, and observability that power these dashboards. Where the two overlap (entities, RBAC, persistence), the backend master is authoritative for server behaviour.
**Supporting docs**: DASHBOARD_CLAUDE_CODE_PROMPT.md -> DASHBOARD_IMPLEMENTATION_PLAYBOOK.md -> Component_Library.md -> THEME_GUIDE.md -> V3_CURRENT_STATE_AUDIT.md -> PROJECT_PROGRESS.md
**Page revamp pattern**: ADMIN_DASHBOARD_PAGE_REVAMP_PATTERN.md documents the page-specific decomposition pattern started with `/admin/briefs`.
**GitHub**: `https://github.com/Charanos/andishi-v3.git`
**Verification gate**: `npx tsc --noEmit` (never run production builds unless explicitly asked)

---

## AGENT INSTRUCTIONS

Read every section before touching a file. This document consolidates the full dashboard implementation brief. All decisions made here supersede any older dashboard notes. The public marketing and auth pages are complete - this document governs the dashboard phase exclusively.

When supporting docs disagree with this file, update the supporting doc or follow this file. Use `docs/DASHBOARD_CLAUDE_CODE_PROMPT.md` as the kickoff prompt and `docs/DASHBOARD_IMPLEMENTATION_PLAYBOOK.md` as a compact checklist, not as competing product direction.

Execute in the order given in Part 10. Do not skip sections. When in doubt, re-read Section 2 (North Star) and Section 4 (Visual System).

---

## PART 1: CURRENT FOUNDATION

### What is already done

All public marketing/auth routes are live. The design language is established:

- Cosmic editorial surfaces - restrained glass, fine borders, large quiet whitespace, real workflow artifacts
- CSS token system in `src/app/globals.css`: `--bg`, `--surface`, `--surface-high`, `--glass-bg`, `--glass-border`, `--on-surface`, `--on-surface-dim`, `--primary`, `--secondary`, `--tertiary`, `--bg-deep`
- `cosmicSpring` motion config from `src/lib/motion.ts`
- `@tabler/icons-react` exclusively
- `font-mono` for all stats/numerics, `font-medium` for labels/buttons, `font-normal` for body - no `font-bold` or `font-semibold` ever
- `PatternTexture`, `FinalCtaArtwork`, `CustomCursorRegion` shared components
- Dashboard scaffolds under `src/app/(app)/`: `/admin/*`, `/dashboard/*`, `/dev/*`
- Shared dashboard primitives in `src/components/dashboard/`
- Role nav data in `src/data/dashboard.ts`
- Backend/auth foundation is active for the app shell: Neon-backed auth/session flow, protected route groups, role-aware redirects, and an idempotent seed-admin path are in place.
- Admin dashboard overview now has an elevated operational shell, Recharts-backed metrics, delivery pipeline detail drawers, event CRUD panels, activity timeline, responsive priority briefs, and centralized mock data in `src/data/dashboard-mock.ts`.
- The admin overview is the current design reference for dashboard rhythm: breathable command-canvas spacing, headings outside dense cards, larger readable typography, later split breakpoints, roomier metric/chart cards, and functional panels that prioritize data visibility over above-the-fold compression.
- Dashboard shell refinements are implemented: far-left desktop sidebar, compact collapsed rail, five-link mobile bottom nav plus expanded drawer, floating top nav, account/notification/calendar/quick-action popovers, and click-outside/Escape dismissal.
- Admin subpages still have the generic workspace engine available, but purpose-built pages now exist for briefs, shortlists, pipeline, and placements.
- `/admin/briefs` uses a dedicated `AdminBriefsPage` with demand queue search/filter/sort, stage strip, grid/list cards, pagination, SLA/priority intelligence, modalized brief command actions, create modal, detail drawer, archive confirmation, candidate recommendations, refined briefing analytics, and route CTAs into shortlists and placements as separate workspaces.
- `/admin/briefs/shortlist` uses a dedicated `AdminShortlistsPage` with talent-slate curation, workflow handoff navigation, a creative slate flight path, list-only developer cards, compact fit and engagement panels, profile and decision modals, send-slate packaging, add/remove candidate actions, client engagement status, refined chart wells, and restrained cyan usage.
- `/admin/matches` uses a dedicated `AdminPipelinePage` with a five-stage talent pipeline board, stage/value/velocity observability, selected-item command rail, create item modal, intro scheduling modal, drawer inspection, archive confirmation, and pipeline matrix table.
- `/admin/placements` uses a dedicated `AdminPlacementsPage` with delivery health, hours, billing, renewal risk, roster grid/list modes, sticky detail rail, mobile drawer, create/message/invoice/pause/terminate actions, and placement matrix observability.
- `/admin/placements/timeline` uses a dedicated `AdminPlacementTimelinePage` with weekly hours observability, approval queue, engineer breakdowns, bulk approval, entry drawer inspection, and manual entry creation.
- Client and developer workspaces include a floating support chat routed to the admin resolver, plus dedicated support pages and sidebar links.
- Registration now creates the linked client organization or developer profile shell and admin settings displays auth intake records with role/status/verification/relationship IDs.

### What is scaffolded but not production-ready

- Admin overview is the most complete workspace surface; client and developer dashboards are seeded foundations and still need the same depth of role-specific interaction.
- Some admin overview panels still use centralized mock data while persistence endpoints are finalized.
- RBAC should continue moving deeper than route protection into per-action authorization and server-side data access helpers.
- Data tables and pipeline surfaces are visually production-shaped, but sort/filter/pagination, mutation persistence, and audit logging remain follow-up implementation work.
- Support chat and admin workspace actions are currently client-side mock interactions pending persisted message/case records.

### Current implementation status - June 1, 2026

- App shell, role sidebar, and top nav have been upgraded beyond the original scaffold: fixed far-left desktop sidebar, compact collapsed rail, mobile bottom nav plus drawer, and robust popover dismissal are implemented.
- Route protection and role redirects are active at the app boundary; remaining RBAC work is per-action and data-access authorization.
- Mock data is centralized for dashboard iteration; production persistence still needs to replace mock-backed admin overview panels.
- Admin overview polish now includes stronger typography, visual separators, roomier cards, expanded chart regions, event CRUD, pipeline detail drawers, and activity/priority sections that remain mobile-safe.
- Admin page decomposition now covers `/admin/briefs`, `/admin/briefs/shortlist`, `/admin/matches`, `/admin/placements`, and `/admin/placements/timeline`. The generic `AdminWorkspacePage` remains as the temporary scaffold for the remaining admin routes until each page gets a purpose-built implementation.

### Tech stack

| Layer         | Stack                                         |
| ------------- | --------------------------------------------- |
| Framework     | Next.js 16 App Router                         |
| UI runtime    | React 19                                      |
| Language      | TypeScript 5                                  |
| Styling       | Tailwind CSS 4 + CSS custom properties        |
| Motion        | Framer Motion                                 |
| Theme         | next-themes                                   |
| Icons         | `@tabler/icons-react` only                    |
| Tables        | TanStack Table v8                             |
| Drag-and-drop | dnd-kit (admin Kanban only)                   |
| Time tracking | Custom - connects to `TimesheetEntry` model   |
| Messaging     | Crisp SDK - no custom WebSocket chat          |
| Payments      | Stripe - separate sprint, placeholder for now |
| Analytics     | Vercel Analytics + GA4 dataLayer              |

---

## PART 2: NORTH STAR

The dashboards are Andishi's private operating system. They must be:

**For the client**: A workspace that makes the founder or CTO feel guided - from brief submitted, to profiles reviewed, to engineer onboarded, to product shipping.

**For the developer**: A workspace that makes the engineer feel respected, prepared, and paid with clarity - showing their work, their earnings, and their standing in the network.

**For the admin**: A command centre that gives the Andishi team full operational visibility - briefs, matches, engineers, clients, placements, revenue, and content in one place.

### The five questions every dashboard page must answer

1. What is the user's role and current job to be done right now?
2. What is the next meaningful action?
3. What changed since the last visit?
4. What data can be trusted right now vs what is pending?
5. What is intentionally empty and why?

### Anti-patterns to avoid

- Generic SaaS dashboard clutter - do not build everything at once, build what serves the role
- Nested card stacks - flat panels, tables, and drawers outperform recursive glassmorphic boxes in operational UI
- Hover-only interactions on mobile surfaces
- Decorative elements from the marketing pages (hero sections, large animated gradients) inside dashboards
- Any `font-bold` or `font-semibold` anywhere in the codebase

---

## PART 3: ROLE ARCHITECTURE AND RBAC

### Role model

```ts
// src/types/auth.ts
export type UserRole = "admin" | "client" | "developer";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  status: "active" | "invited" | "disabled";
  organizationId?: string; // client only
  engineerId?: string; // developer only
  lastLoginAt?: string;
  createdAt: string;
};

export const roleHome: Record<UserRole, string> = {
  admin: "/admin",
  client: "/dashboard",
  developer: "/dev",
};
```

### Route guard rules

```
/admin/*    → role === "admin"       else redirect roleHome[user.role]
/dashboard/* → role === "client"    else redirect roleHome[user.role]
/dev/*      → role === "developer"  else redirect roleHome[user.role]

Unauthenticated → /login?next=<encoded-current-path>
Disabled account → /login?error=account_disabled (clear surface)
Wrong role → silent redirect to own roleHome, no error shown
```

Auth checks happen at the **server-side route boundary** inside `(app)/layout.tsx` - not only in middleware, not only in client components.

### Seed admin

```
Email:    dennis@andishi.dev
Password: dennis-andishi@123 (hash only - never stored plaintext after seed)
Role:     admin
Status:   active
Redirect: /admin
```

Seed is idempotent. Run with: `npm run seed:admin`
Environment override: `ADMIN_SEED_EMAIL` + `ADMIN_SEED_PASSWORD`
Seed account is never surfaced in any public UI.

### Login redirect flow

1. User submits email + password
2. Server validates credentials + status check
3. Session created
4. Resolve `next` param - allowed only if it belongs to user's role route group
5. Redirect to `next` or `roleHome[user.role]`
6. Failed login: inline error on the existing premium login surface
7. Disabled: redirect to `/login?error=account_disabled`

---

## PART 4: VISUAL SYSTEM FOR DASHBOARDS

The dashboard visual language inherits from the public site but adapts for density and operational use.

### Spacing and layout

```
Shell gutter:      px-5 sm:px-8 lg:px-10
Content container: mx-auto w-full max-w-[92rem]
Dashboard cards:   rounded-[1rem] to rounded-[1.35rem]
Page header:       pb-6 mb-8, with metric strips offset by mt-7 or mt-8
Section gap:       gap-9 md:gap-10 lg:gap-12 for overview canvases; gap-5/gap-6 inside dense panels
Card offset:       my-8 or mt-6 after section headings
Card padding:      p-5 sm:p-6 for data-heavy cards; p-4 only for intentionally compact rows
```

### Typography inside dashboards

```
Page title:        text-[clamp(1.85rem,4vw,2.45rem)] font-medium tracking-tight text-[var(--on-surface)]
Section heading:   text-[1.08rem] to text-[1.2rem] font-medium text-[var(--on-surface)]
Table header:      label-caps text-[var(--on-surface-dim)] (uppercase, tracked)
Table cell:        text-[0.96rem] text-[var(--on-surface-dim)]
Mono values:       font-mono text-[var(--on-surface)] (IDs, money, times, %)
Body/description:  text-[0.88rem] to text-[0.96rem] leading-[1.65] text-[var(--on-surface-dim)]
Helper/meta:       generally text-[0.8rem]+ unless purely decorative metadata
```

### Overview whitespace rule

The admin overview should feel like an operational canvas, not a packed analytics wall.

- Keep section titles and descriptions outside card surfaces where the card is primarily for data or controls.
- Use visual separators and whitespace to organize the page instead of nesting card inside card.
- Delay major two-column splits until `xl` or wider when the secondary panel would otherwise smush form controls, chart labels, or tables.
- Give charts stable height and breathing room. KPI charts should not be squeezed into decorative slivers.
- Mobile and tablet layouts should stack important panels with generous gaps rather than forcing cramped paired columns.

### Color semantics

```
var(--secondary)   → active states, matched signals, selected rows, active nav
var(--tertiary)    → verified, paid, complete, passed, success states
var(--primary)     → brand accents, high-level CTAs only
danger color       → color-mix(in srgb, #f85149 80%, transparent) for errors/deletions
warning color      → color-mix(in srgb, #d29922 80%, transparent) for pending/review
```

Current dashboard revamp guidance: avoid treating `var(--secondary)` as the default dashboard accent. Use secondary selectively for active nav, explicit matching signals, and rare command emphasis; use `var(--primary)` for neutral operational emphasis and selected data surfaces; use `var(--tertiary)` for healthy/complete states; use `var(--error)` for blocked, overdue, destructive, or risk states.

### Component surface rules

```
Admin tables/panels:   Quieter bg - var(--surface) with var(--glass-border). No backdrop blur needed.
Client match cards:    Glass surface with secondary glow on hover - same as public EngineerCard
Drawers:               var(--surface) background, border-t/border-l, no backdrop blur on drawer itself
Modal overlays:        bg-[color-mix(in_srgb,var(--bg-deep)_74%,transparent)] backdrop-blur-xl
KPI cards:             Glass, readable, stable-height cards with chart regions pinned low; never tiny decorative cards
Empty states:          Centered, bordered, functional - no decorative illustrations
```

### Mobile-first breakpoints

All dashboard pages designed at 375px first:

- Sidebar: five-link floating mobile bottom nav plus expanded drawer on mobile, persistent far-left rail/sidebar on lg+
- Tables: mobile card rendering first, full table layout from md+ where appropriate
- KPI cards: single column → 2-col at sm → 4-col at lg
- Drawer panels: full-screen bottom sheet on mobile, side panel on lg+

---

## PART 5: SHARED SHELL ARCHITECTURE

### File locations

```
src/
├── app/
│   └── (app)/
│       ├── layout.tsx              ← Auth guard + AppShell wrapper
│       ├── admin/                  ← Admin routes
│       ├── dashboard/              ← Client routes
│       └── dev/                    ← Developer routes
├── components/
│   └── dashboard/
│       ├── app-shell.tsx           ← Primary frame (REFINE)
│       ├── role-sidebar.tsx        ← Role-aware nav (REFINE)
│       ├── dashboard-top-nav.tsx   ← Route header (REFINE)
│       └── [all other components]
├── data/
│   └── dashboard.ts                ← Role nav registry + seed data
└── types/
    └── auth.ts                     ← AuthUser, UserRole, roleHome
```

### AppShell - refined spec

```tsx
// Props
interface AppShellProps {
  user: AuthUser;
  children: React.ReactNode;
}

// Responsibilities
// 1. Render RoleSidebar (desktop: fixed far-left rail/sidebar, mobile: bottom nav + drawer)
// 2. Render DashboardTopNav with command, calendar, notifications, quick actions, and account menu
// 3. Provide mobile sidebar toggle state and desktop collapsed state
// 4. Apply shell gutter + max-width to children
// 5. Receive user context from server component parent
// 6. Preserve responsive content offsets without layout jumps

// Layout structure (desktop)
<div className="flex min-h-screen bg-[var(--bg)]">
  <RoleSidebar user={user} /> // fixed left, collapsible
  <div className="flex flex-1 flex-col min-w-0">
    <DashboardTopNav user={user} /> // sticky/floating content nav
    <main className="flex-1 px-5 sm:px-8 lg:px-10 py-8">
      <div className="mx-auto w-full max-w-[92rem]">{children}</div>
    </main>
  </div>
</div>;
```

### RoleSidebar - refined spec

```tsx
// Nav items come from roleNav[user.role] in src/data/dashboard.ts
// Never hardcode nav inside a page component

// Visual states
// Active item:   bg-[color-mix(in_srgb,var(--secondary)_9%,transparent)]
//                border-l-2 border-[var(--secondary)]
//                text-[var(--secondary)]
//                icon stroke=2
// Inactive item: text-[var(--on-surface-dim)], icon stroke=1.5
// Group label:   label-caps, low contrast, no separator line

// Required sections (top → bottom)
// 1. Logo + wordmark
// 2. Role nav items (from registry)
// 3. ── separator
// 4. Role context card (name, role badge, org/engineer context)
// 5. Settings link
// 6. Sign out button

// Desktop: expanded sidebar or compact icon rail, pinned to far-left viewport edge
// Mobile: floating bottom nav with five priority links plus More drawer
// Expanded mobile drawer includes command/search and grouped role navigation
// Close popovers/drawers on route change, backdrop click, outside click, and Escape
```

### DashboardTopNav - refined spec

```tsx
// Required elements (left to right)
// Mobile left:  [Andishi logo]
// Desktop left: [Command/Search menu, left-aligned within the floating nav]
// Right: [Calendar/date menu] [NotificationBell] [ThemeToggle] [QuickAction] [AccountMenu avatar]

// AccountMenu dropdown items:
// - View profile (role-appropriate)
// - Settings
// - Public site ↗
// - ── separator
// - Sign out

// CalendarMenu: highlighted current day, event creation form, operational event list
// NotificationBell: absolute count badge, popover with recent activity items
// ThemeToggle: IconSun/IconMoon, updates next-themes, no label
// All dropdowns: close on outside click and Escape without requiring button re-toggle
```

### Role nav registry - src/data/dashboard.ts

Current top-nav implementation update:

- Mobile left area shows the Andishi mark instead of duplicate breadcrumb text.
- Desktop command/search is left-aligned inside the floating navbar, not centered in the shell.
- Right controls include calendar/date dropdown, notification menu, theme toggle, quick action menu, and account menu.
- Calendar highlights the current date visibly in both themes and supports event entry from the dropdown.
- Notifications use an absolute count badge on the icon button container.
- Details-based topbar popovers close on outside click and Escape.

```ts
export const roleNav = {
  admin: [
    { label: "Overview", href: "/admin", icon: "IconLayoutDashboard" },
    { label: "Briefs", href: "/admin/briefs", icon: "IconFileText" },
    { label: "Matches", href: "/admin/matches", icon: "IconGitMerge" },
    { label: "Engineers", href: "/admin/engineers", icon: "IconUsersGroup" },
    { label: "Clients", href: "/admin/clients", icon: "IconBuilding" },
    { label: "Placements", href: "/admin/placements", icon: "IconBriefcase" },
    { label: "Revenue", href: "/admin/revenue", icon: "IconCurrencyDollar" },
    { label: "Content", href: "/admin/content", icon: "IconEdit" },
    { label: "Settings", href: "/admin/settings", icon: "IconSettings" },
  ],
  client: [
    { label: "Overview", href: "/dashboard", icon: "IconLayoutDashboard" },
    {
      label: "My Brief",
      href: "/dashboard/brief",
      icon: "IconFileDescription",
    },
    { label: "Matches", href: "/dashboard/matches", icon: "IconUsers" },
    { label: "My Team", href: "/dashboard/team", icon: "IconUsersGroup" },
    { label: "Projects", href: "/dashboard/projects", icon: "IconRocket" },
    { label: "Messages", href: "/dashboard/messages", icon: "IconMessage2" },
    { label: "Invoices", href: "/dashboard/payments", icon: "IconReceipt" },
    { label: "Settings", href: "/dashboard/settings", icon: "IconSettings" },
  ],
  developer: [
    { label: "Overview", href: "/dev", icon: "IconLayoutDashboard" },
    { label: "My Profile", href: "/dev/profile", icon: "IconUser" },
    { label: "Projects", href: "/dev/projects", icon: "IconCode" },
    { label: "Time", href: "/dev/time", icon: "IconClock" },
    { label: "Earnings", href: "/dev/earnings", icon: "IconCoin" },
    { label: "Messages", href: "/dev/messages", icon: "IconMessage2" },
    { label: "Settings", href: "/dev/settings", icon: "IconSettings" },
  ],
} as const;
```

---

## PART 6: SHARED COMPONENT LIBRARY

### Components to refine (already scaffolded)

| Component               | File                          | Refinements needed                                                                                    |
| ----------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| `AppShell`              | `app-shell.tsx`               | Auth context, mobile drawer state, account menu                                                       |
| `RoleSidebar`           | `role-sidebar.tsx`            | Mobile drawer mode, count badges, sign out, role card                                                 |
| `DashboardTopNav`       | `dashboard-top-nav.tsx`       | Breadcrumbs, nested-route labels, command menu, notification popover, account menu                    |
| `DashboardCalendarMenu` | `dashboard-calendar-menu.tsx` | Role-aware date dropdown, current-day visibility, event creation/list management                      |
| `DashboardQuickActions` | `dashboard-quick-actions.tsx` | Role-aware top-nav action launcher for admin, client, and developer workflows                         |
| `AdminEventsPanel`      | `admin-events-panel.tsx`      | Event CRUD, schedule intelligence, and event detail modal                                             |
| `OverviewHeroActions`   | `admin-overview-actions.tsx`  | New brief modal and pipeline drawer interactions                                                      |
| `PipelineDrawerButton`  | `admin-overview-actions.tsx`  | Pipeline entity detail drawer and selected-event modal                                                |
| `PipelineFunnelChart`   | `pipeline-funnel-chart.tsx`   | Admin overview funnel visualization with conversion and bottleneck annotations                        |
| `AttentionQueue`        | `attention-queue.tsx`         | Prioritized admin action queue with critical/review/info signals                                      |
| `AdminWorkspacePage`    | `admin-workspace-page.tsx`    | Shared admin subpage engine for queues, CRUD modal, detail drawer, charts, relationships, and support |
| `SupportWorkspacePage`  | `support-workspace-page.tsx`  | Client/developer support workspace connected to admin resolver context                                |
| `FloatingSupportChat`   | `floating-support-chat.tsx`   | Floating client/developer support chat visible across authenticated workspaces                        |
| `useDetailsPopover`     | `use-details-popover.ts`      | Shared outside-click/Escape behavior for details-based dropdowns                                      |
| `InsightsCard`          | `insights-card.tsx`           | Skeleton/loading state, trend semantics, size variants (compact vs default)                           |
| `DataTable`             | `data-table.tsx`              | TanStack Table integration, sortable columns, row actions menu, pagination                            |
| `DrawerPanel`           | `drawer-panel.tsx`            | Standard entity drawer - tabs, sticky action footer, Escape close, focus trap                         |
| `KanbanBoard`           | `kanban-board.tsx`            | dnd-kit drag/drop, stage counts, card overflow                                                        |
| `ProfileCard`           | `profile-card.tsx`            | Client-match variant, admin variant, developer-self variant                                           |
| `ProjectCard`           | `project-card.tsx`            | Client variant (milestone view), developer variant (task + time view)                                 |
| `EmptyState`            | `empty-state.tsx`             | Centralize copy bank per section, map to action component                                             |
| `TimeTracker`           | `time-tracker.tsx`            | Active timer with start/stop, project selector, weekly bar chart                                      |
| `EarningsCard`          | `earnings-card.tsx`           | Monthly summary, payout schedule, Stripe placeholder                                                  |
| `Sparkline`             | `sparkline.tsx`               | Colour-configurable, already SVG - just ensure theme-aware                                            |

### New primitives to build

| Component             | File                        | Purpose                                                                                       |
| --------------------- | --------------------------- | --------------------------------------------------------------------------------------------- |
| `RoleGate`            | `role-gate.tsx`             | Client wrapper for conditional role rendering (not a security boundary - that is server-side) |
| `DashboardPageHeader` | `dashboard-page-header.tsx` | Page title + description + right-aligned actions + optional status chip                       |
| `DashboardSection`    | `dashboard-section.tsx`     | Consistent section heading, body, optional right action                                       |
| `MetricStrip`         | `metric-strip.tsx`          | Dense row of font-mono KPI values - used in admin overview and revenue                        |
| `CommandMenu`         | `command-menu.tsx`          | Role-aware keyboard-triggered command palette and route launcher                              |
| `NotificationMenu`    | `notification-menu.tsx`     | Bell icon + popover + role-scoped activity items and destination links                        |
| `AccountMenu`         | `account-menu.tsx`          | Avatar dropdown - profile, settings, public site, sign out                                    |
| `EntityDrawer`        | `entity-drawer.tsx`         | Standard drawer with tabbed content and sticky footer actions                                 |
| `StatusTimeline`      | `status-timeline.tsx`       | Brief → match → placement → project history vertical timeline                                 |
| `AuditLog`            | `audit-log.tsx`             | Admin-only change history with actor, timestamp, delta                                        |
| `InlineEditableField` | `inline-editable.tsx`       | Click-to-edit field for brief/profile/settings inline updates                                 |
| `ConfirmDialog`       | `confirm-dialog.tsx`        | Destructive action confirmation modal - focused, not drawer                                   |
| `ToastProvider`       | `toast-provider.tsx`        | Save/action feedback using sonner or custom implementation                                    |
| `ActivityFeed`        | `activity-feed.tsx`         | Already exists - ensure role-scoped items and entity links                                    |
| `OnboardingChecklist` | `onboarding-checklist.tsx`  | Already exists - wire to real completion state                                                |
| `WelcomeModal`        | `welcome-modal.tsx`         | Already exists - trigger on first login, not on every visit                                   |

---

## PART 7: DATA MODEL

These are the core entities the dashboards operate on. Start with server-side TypeScript types. Static seed data until DB is wired.

```ts
// src/types/entities.ts

export type BriefStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "matching"
  | "shortlisted"
  | "closed";
export type MatchStatus =
  | "proposed"
  | "client_reviewing"
  | "intro_scheduled"
  | "intro_completed"
  | "accepted"
  | "declined";
export type PlacementStatus = "active" | "paused" | "completed" | "terminated";
export type ProjectStatus =
  | "scoping"
  | "active"
  | "review"
  | "completed"
  | "on_hold";
export type MilestoneStatus =
  | "pending"
  | "in_progress"
  | "submitted"
  | "approved"
  | "revision";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface HiringBrief {
  id: string;
  organizationId: string;
  title: string; // e.g. "Senior React Engineer for fintech MVP"
  role: string;
  domain: EngineerDomain;
  seniority: "mid" | "senior" | "lead" | "architect";
  stackTags: string[];
  timeline: string;
  engagementModel: "project" | "embedded" | "team_extension";
  description: string;
  status: BriefStatus;
  submittedAt: string;
  andishiNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  briefId: string;
  engineerId: string;
  status: MatchStatus;
  proposedAt: string;
  introScheduledAt?: string;
  introCompletedAt?: string;
  acceptedAt?: string;
  adminNotes?: string;
  clientNotes?: string;
}

export interface Placement {
  id: string;
  matchId: string;
  engineerId: string;
  organizationId: string;
  startDate: string;
  endDate?: string;
  engagementModel: "project" | "embedded" | "team_extension";
  status: PlacementStatus;
  weeklyHours: number;
  currency: "USD" | "EUR" | "GBP";
  createdAt: string;
}

export interface Project {
  id: string;
  briefId?: string;
  placementId?: string;
  organizationId: string;
  engineerIds: string[];
  title: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  targetDate: string;
  stackTags: string[];
  milestones: Milestone[];
  createdAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueDate: string;
  completedAt?: string;
}

export interface TimesheetEntry {
  id: string;
  engineerId: string;
  projectId: string;
  date: string;
  hoursLogged: number;
  description: string;
  approved: boolean;
  approvedAt?: string;
}

export interface Invoice {
  id: string;
  placementId: string;
  engineerId: string;
  organizationId: string;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  totalAmount: number;
  currency: "USD" | "EUR" | "GBP";
  status: InvoiceStatus;
  issuedAt?: string;
  paidAt?: string;
  stripeInvoiceId?: string;
}

export interface ActivityEvent {
  id: string;
  type: string; // "brief_submitted" | "match_proposed" | "intro_scheduled" etc.
  actorId: string;
  actorRole: UserRole;
  entityType: string;
  entityId: string;
  description: string;
  createdAt: string;
  visibleTo: UserRole[]; // role-scoped visibility
}

export interface MessageThread {
  id: string;
  participantIds: string[];
  crispConversationId?: string; // Crisp integration
  subject: string;
  lastMessageAt: string;
  createdAt: string;
}
```

---

## PART 8: DASHBOARD PAGES - DETAILED SPEC

### 8.1 SUPER ADMIN - /admin

#### /admin - Command Centre Overview

**DashboardPageHeader**: "Platform Overview" + today's date + quick action: "New brief match →"

**MetricStrip** (4 values, top of page):

```
Active briefs:     font-mono count, --secondary colour
Pending matches:   font-mono count, warning colour if > 3
Active placements: font-mono count, --tertiary colour
MTD revenue:       font-mono "$X,XXX", --on-surface colour
```

**Pipeline Kanban preview** (below MetricStrip):

- 5 columns: Brief Received · Shortlisting · Profiles Sent · Intro Scheduled · Placement Confirmed
- Compact cards: brief title + org name + days since submission
- "View full pipeline →" link to `/admin/matches`

**Two-column grid** (below Kanban):

- Left: Recent briefs table (5 rows: org, role, domain, days ago, status badge) + "View all →"
- Right: Engineers needing review (availability changed or vetting incomplete) + "View all →"

**Activity feed** (full-width, below grid):

- Last 10 system events, role-scoped to admin
- Actor avatar/initials + action + entity + timestamp

---

#### /admin/briefs - Brief Management

**Operational command room**:

- Queue stages: Submitted · Under review · Matching · Shortlisted.
- Shortlisted briefs remain brief records and continue in `/admin/briefs/shortlist`.
- Confirmed delivery, billing, hours, and active roster ownership remain in `/admin/placements`.
- Queue controls: Stage strip · Search · Stage select · Priority/SLA/Budget/Newest sort · Grid/List switcher · Pagination
- Card anatomy: Title/status/priority header · Client/domain/timeline metadata · SLA/quality/match metrics · Brief path and SLA progress bars · Owner/budget/next action · Description · Stack tags · Icon actions
- Command modal actions: Prepare shortlist · Save note · Open details · Advance · Archive
- Row/card actions: View details · Advance · Archive
- Detail: EntityDrawer with tabs:
  - **Brief** - full brief copy, stack tags, timeline, engagement model
  - **Matches** - proposed engineer cards (ProfileCard compact) with match status
  - **Timeline** - StatusTimeline from submission through shortlist
  - **Notes** - InlineEditableField for Andishi internal notes
- Observability: Analytics cards use compact header metrics and dedicated chart wells so line, bar, and donut charts occupy the available panel height.

---

#### /admin/matches - Full Matching Pipeline

**Current implementation**: Dedicated `AdminPipelinePage` talent-manager command workspace.

- Five-stage Kanban board: Brief Received, Shortlisting, Profiles Sent, Intro Scheduled, Placement Confirmed.
- Cards show brief, client, tier, vertical, assigned engineers, SLA age, total age, monthly value, priority, risk/status, and next action.
- Board controls include search, stage filter, status filter, and priority filter.
- Selected-card command rail supports inspect, move forward, schedule intro, risk toggle, priority toggle, and archive.
- Observability includes stage distribution, weekly velocity, active monthly value, health mix, and labeled chart legends.
- Detail drawer includes stage history, relationship context, next action, and stakeholder context.
- Local CRUD simulation covers create pipeline item, schedule intro, advance stage, archive, risk flag, and priority flag until backend mutations replace mock state.

---

#### /admin/engineers - Engineer Registry

**Filter bar**: Domain · Availability toggle · Vetting status · Search
**DataTable or card grid** (toggle):

- Table: Name · Domain · Location · Experience · Availability badge · Vetting badges · Actions
- Card: same as public EngineerCard but with admin actions visible
- Row/card actions: Edit profile · Change availability · View placements · Archive

**Add Engineer** (primary action button → full EntityDrawer/modal wizard):

- Step 1: Basic info (name, role, domain, location, timezone)
- Step 2: Skills and experience
- Step 3: Work history
- Step 4: Availability and engagement preferences
- Step 5: Review and save → creates `EngineerProfile` record

---

#### /admin/clients - Client Registry

**DataTable**:

- Organisation · Primary contact · Engineers placed · Active briefs · Joined · Status
- Row actions: View briefs · View placements · Edit · Disable

---

#### /admin/placements - Placement Tracker

**DataTable**:

- Engineer · Organisation · Model · Start · End · Status badge · MTD hours · Actions

**EntityDrawer** on click:

- Placement details
- Invoice history table
- TimeSheetEntry log
- Status action buttons: Pause · Complete · Terminate

---

#### /admin/revenue - Revenue Overview

**MetricStrip** (5 values): MTD revenue · YTD revenue · Outstanding invoices · Avg placement value · Active placements

**Monthly revenue chart** (recharts AreaChart or pure SVG, themed with --secondary colour):

- 12-month trailing view
- Tooltip with exact month value

**Invoice DataTable** (below chart):

- Invoice # · Organisation · Engineer · Period · Amount (mono) · Status · Issued · Actions
- Filter: Status chips, date range
- Row actions: Mark as paid, Download PDF, Void

---

#### /admin/content - Content Operations

**DataTable**:

- Title · Type (blog/case-study) · Status (draft/published) · Author · Published date · Actions
- Row actions: Edit (→ `/admin/content/[id]/edit`), Publish, Archive

Simple MDX write workflow: inline editor or GitHub file write via API - no external CMS.

---

#### /admin/settings - Platform Settings

**Sections** (DashboardSection components):

1. Team users - invite new admin, list users + role + status
2. Matching parameters - acceptance criteria labels, vetting stage config
3. Integrations - Crisp key, Stripe key status, GA4 status
4. Danger zone - platform maintenance mode toggle

---

### 8.2 CLIENT DASHBOARD - /dashboard

#### First Login Onboarding

**WelcomeModal** trigger: `user.createdAt === user.lastLoginAt` (first session only)

Content:

- "Welcome to your hiring workspace, [Name]."
- "Here's what happens next." → 3-step visual (Brief confirmed → Profiles arriving → Intro call)
- Primary CTA: "View my brief →"
- Secondary: "Dismiss"

---

#### /dashboard - Overview

**DashboardPageHeader**: "Good [morning/afternoon], [Name]." + org name + right action: "Edit brief →"

**OnboardingChecklist** (shown until all complete, then collapsed permanently):

```
Progress: 3 / 5 completed  ████████░░░░ 60%

✅  Brief submitted
✅  Account created
✅  Profiles received
○   Intro call scheduled
○   Developer onboarded
```

100% completion: framer-motion confetti + "Your engineer is ready. Time to ship. 🚀"

**Brief status card** (full-width, prominent):

- Brief title + role + domain + submitted date
- StatusTimeline: Submitted → Under Review → Shortlisting → Profiles Sent → Intro → Placed
- Current stage highlighted with --secondary colour + pulsing dot

**Matched profiles strip** (horizontal scroll, compact ProfileCards):

- Shows first 3 proposed engineers
- "View all matches →" → `/dashboard/matches`

**KPI strip** (3 values, compact):

```
Profiles received:  font-mono count
Days since brief:   font-mono days
Intro calls:        font-mono count
```

**Activity feed** (role-scoped, last 5 events):

- Profile proposed, intro scheduled, message received, etc.

---

#### /dashboard/brief - Hiring Brief

**Left column**: Brief detail - all fields, current values, InlineEditableField on editable items
**Right column**: StatusTimeline + Andishi notes (read-only for client, editable for admin)

Editable fields: description, timeline, stack tags, engagement model (if not yet matched)
Non-editable once matched: role, seniority, domain (require admin to unlock)

---

#### /dashboard/matches - Engineer Matches (Primary Activation Page)

**Filter bar**: Status chips (All · New · Intro Requested · Intro Scheduled)

**Profile card grid** (same glassmorphic treatment as `/engineers` page):
Each card extends public `EngineerCard` with match-specific additions:

- Match status badge (top-right of card)
- "Request Intro" amber button (bottom of card - primary CTA)
- "Decline" ghost link (secondary)

**Request Intro flow** (inline - no separate page):

1. Click "Request Intro" → card expands with a brief form:
   - "Any message to include in the intro?" (textarea, optional)
   - Preferred call times (date/time picker, 2 slots)
   - Submit → match status → `intro_scheduled`, activity event fires, GA4 event `intro_requested`
2. Confirmation: card status updates, success toast

**GA4 events**:

```javascript
{ event: 'profile_viewed', engineer_slug, source: 'dashboard' }
{ event: 'intro_requested', engineer_slug }
{ event: 'client_activated' }  // fired on first intro_requested
```

---

#### /dashboard/team - Active Engineers

Empty state (before first placement):

```
Icon: IconUsersGroup
Heading: "Your team starts here."
Body: "Once your first developer is onboarded, they'll appear here with project and comms context."
CTA: "Browse matches →"
```

After placement: ProfileCard with embedded context - active projects, last active, quick message button → Crisp

---

#### /dashboard/projects - Project Tracker

**Project cards** (ProjectCard client variant):

- Project name + stack tags + status badge
- Milestone progress bar + milestone list (5 max, + expand)
- Assigned engineers (avatar stack)
- "Last update" timestamp

Empty state: "Projects appear here once your engineer starts. Milestones and deliverables will track here."

---

#### /dashboard/messages - Communications

Crisp embed + wrapper:

```tsx
// src/components/dashboard/shared/crisp-inbox.tsx
// Initialise Crisp with user identity data
// Show Crisp inbox iframe in full available height
// No custom WebSocket - Crisp handles all real-time messaging
```

---

#### /dashboard/payments - Invoices

**InvoiceTable** (DataTable, compact):

- Invoice # · Period · Amount (mono) · Status badge · Issued · Paid · Download

Empty state: "Your first invoice will be generated once your first project milestone is approved."

Stripe integration: placeholder section below table - "Payment method" card with Stripe Elements embed (future sprint).

---

#### /dashboard/settings - Account Settings

**Sections**:

1. Company profile - org name, website, industry, logo upload
2. Contact details - primary contact name, email, phone
3. Workspace users - invite team members (future: multi-seat billing)
4. Notifications - email preferences per event type
5. Danger zone - close account request

---

### 8.3 DEVELOPER DASHBOARD - /dev

#### First Login Onboarding - Profile Wizard

**Trigger**: `engineer.profileComplete === false`
Shown as a full-page multi-step wizard before any dashboard content is accessible.

**Steps** (framer-motion step transitions):

```
Step 1 / 4: About you
  - Name, location, timezone
  - Bio (textarea, 100–300 chars, char counter)
  - Availability status + available-from date

Step 2 / 4: Your stack
  - Domain selection (single: fullstack/ai/web3/aws/mobile/backend)
  - Skills multi-select tag chips (up to 12)
  - Years of experience (slider: 1–20)

Step 3 / 4: Work history
  - Up to 3 entries: company · role · period · one-line achievement
  - Add/remove with animation

Step 4 / 4: Links and final
  - GitHub URL, LinkedIn URL, portfolio URL
  - Profile visibility toggle: "Show me in the Andishi network" (default: on)
  - "Complete my profile →" submit
```

On complete: `profileComplete = true`, `{ event: 'profile_completed' }` GA4 event, redirect to `/dev`

---

#### /dev - Developer Overview

**DashboardPageHeader**: "[Name]'s workspace" + availability badge + "Update availability →"

**Profile readiness card** (shown until 100%):

```
Profile strength: 80%  ████████████░░░░
Missing: 1 work history entry + portfolio link
[Complete profile →]
```

**Active projects strip**:

- Compact ProjectCard (developer variant): project name + client org + milestone + time logged today
- "View all →" → `/dev/projects`

**Time summary this week** (TimeTracker compact view):

- Total hours this week: font-mono
- Active timer if running
- "Start tracking →" CTA if no active timer

**Earnings preview card** (EarningsCard):

- This month earnings: font-mono large
- Pending invoice: font-mono
- Next payout date
- Trend sparkline

---

#### /dev/profile - Profile Editor

Full editable profile:

- Same data as wizard but non-stepped, all visible at once
- Inline save per section (InlineEditableField or section save button)
- VettingBadges component showing completed/pending vetting stages
- Profile preview link: "See how clients see your profile →" → public `/engineers/[slug]`
- Availability toggle + available-from date picker

---

#### /dev/projects - Active Projects

**ProjectCard** (developer variant):

- Project name + client org (anonymised if pre-placement) + status badge
- Milestone list with status indicators
- "Log time →" quick action → opens TimeTracker for this project
- Upcoming deadline chip (warning colour if < 3 days)

---

#### /dev/time - Time Tracking

**Active timer panel** (top, prominent):

```
[Project selector dropdown]   [Description input]   [▶ Start] / [■ Stop]
Running: 02:14:07  (font-mono, large, pulsing dot)
```

**Weekly timesheet** (grid: Mon–Sun, row per project):

- Hours per day per project, editable until approved
- Row totals + column totals in font-mono
- Submit week button → flags for admin approval

**Submitted logs table** (DataTable, below weekly grid):

- Date · Project · Hours · Description · Approved badge
- Filter: date range, project

---

#### /dev/earnings - Financial Dashboard

**EarningsCard** (full variant):

- Current month: font-mono large with --secondary colour
- Previous month: font-mono with trend arrow
- YTD: font-mono
- Avg monthly: font-mono

**Invoice table** (DataTable):

- Period · Hours · Amount (mono) · Status badge · Issued · Paid
- Download invoice button per row

**Payout method section**:

- Bank transfer or Wise details (form, saved, masked)
- Stripe Connect placeholder for future direct payout

**Earnings sparkline** (12-month trailing, pure SVG):

- --secondary colour gradient fill

---

#### /dev/messages

Same Crisp embed as client. Initialise with developer identity.

---

#### /dev/settings

**Sections**:

1. Account - email, password change
2. Profile preferences - public visibility toggle, timezone, notification prefs
3. Payment details - bank/Wise details (masked display + edit)
4. Danger zone - deactivate account, remove from network

---

## PART 9: INTEGRATIONS SPEC

### Crisp Chat (messaging + support)

```tsx
// src/components/providers/crisp-provider.tsx
// Load Crisp script post-hydration
// Initialise with user identity on dashboard routes:
$crisp.push(["set", "user:email", [user.email]]);
$crisp.push(["set", "user:nickname", [user.name]]);
$crisp.push([
  "set",
  "session:data",
  [
    [
      ["role", user.role],
      ["org", user.organizationId],
    ],
  ],
]);

// Auto-triggers (public marketing):
// /hire after 15s:             "Need help with your brief?"
// /tech-talent-pool after 20s: "Want a hand finding the right engineer?"

// Dashboard:
// /dashboard/matches: nudge after 60s if no profile opened
// "Chat Us" nav button: $crisp.push(["do", "chat:open"])
```

### Stripe (payments - placeholder sprint)

```tsx
// src/lib/stripe.ts
// Initialise Stripe client
// Client dashboard: Stripe Elements for payment method capture
// Admin: Stripe Dashboard link for invoice management
// Developer: Stripe Connect for payout routing (future)
```

### GA4 / dataLayer

All events from the existing analytics plan plus dashboard-specific events:

```javascript
// Auth events
{ event: 'login', role }
{ event: 'logout', role }

// Client activation funnel
{ event: 'client_onboarding_step', step: 1..5 }
{ event: 'profile_viewed', engineer_slug, source: 'dashboard' }
{ event: 'intro_requested', engineer_slug }
{ event: 'client_activated' }

// Developer activation funnel
{ event: 'dev_onboarding_step', step: 1..4 }
{ event: 'profile_completed' }
{ event: 'dev_activated' }

// Shared
{ event: 'checklist_item_completed', item_name }
{ event: 'checklist_completed' }
{ event: 'time_entry_logged', project_id, hours }
{ event: 'invoice_downloaded', invoice_id, role }
```

### Vercel Analytics + Speed Insights

Already installed. No additional setup - fires automatically on route change.

---

## PART 10: EXECUTION ORDER

Run in this exact sequence. Do not skip phases.

### Phase 1 - Auth foundation (2 days)

1. Create `src/types/auth.ts` - `AuthUser`, `UserRole`, `roleHome`
2. Create `src/types/entities.ts` - all entity interfaces
3. Implement auth utilities - session read, role check, redirect helper
4. Wire `(app)/layout.tsx` - server-side auth guard + role redirect
5. Wire `/login` form - submit → session → redirect by role
6. Seed admin: `npm run seed:admin` with `dennis@andishi.dev`
7. Test: login as admin → lands on `/admin`; unauthenticated → redirected to `/login`

### Phase 2 - Shell upgrade (2 days)

1. Refine `AppShell` - auth context prop, mobile drawer state via context
2. Refine `RoleSidebar` - mobile overlay, badges, role card, sign out
3. Refine `DashboardTopNav` - breadcrumbs, notification menu, account menu
4. Build new primitives: `RoleGate`, `DashboardPageHeader`, `DashboardSection`, `ToastProvider`, `ConfirmDialog`
5. Build: `NotificationMenu`, `AccountMenu`, `CommandMenu` (admin only)
6. Visual QA: shell at 375px, 768px, 1280px, 1440px - both themes

### Phase 3 - Admin dashboard (4 days)

1. `/admin` - MetricStrip, Kanban preview, brief table, activity feed
2. `/admin/briefs` - Grid/list queue + pagination + command modal + EntityDrawer + refined analytics
3. `/admin/matches` - full KanbanBoard with dnd-kit
4. `/admin/engineers` - DataTable/card toggle + Add engineer drawer
5. `/admin/clients` - DataTable
6. `/admin/placements` - DataTable + EntityDrawer
7. `/admin/revenue` - MetricStrip + chart + invoice DataTable
8. `/admin/content` - DataTable + edit route
9. `/admin/settings` - 4 sections

### Phase 4 - Client dashboard (3 days)

1. `/dashboard` - WelcomeModal, OnboardingChecklist, brief status card, profile strip, KPIs, activity feed
2. `/dashboard/brief` - detail + inline edit + StatusTimeline
3. `/dashboard/matches` - ProfileCard grid + Request Intro inline flow (GA4 events wired)
4. `/dashboard/team` - empty state + populated state
5. `/dashboard/projects` - ProjectCard client variant
6. `/dashboard/messages` - Crisp embed wrapper
7. `/dashboard/payments` - InvoiceTable + Stripe placeholder
8. `/dashboard/settings` - 4 sections

### Phase 5 - Developer dashboard (3 days)

1. Profile wizard - 4-step framer-motion flow, blocks dashboard until complete
2. `/dev` - profile readiness, project strip, time summary, earnings preview
3. `/dev/profile` - full editable profile + VettingBadges + public preview link
4. `/dev/projects` - ProjectCard developer variant
5. `/dev/time` - active timer, weekly grid, submitted logs DataTable
6. `/dev/earnings` - EarningsCard full + invoice DataTable + payout form + sparkline
7. `/dev/messages` - Crisp embed
8. `/dev/settings` - 4 sections

### Phase 6 - Integrations

1. Crisp provider - load post-hydration, user identity on auth, auto-triggers on public pages
2. GA4 dataLayer - all dashboard events from Part 9
3. Stripe placeholder - Elements in client payments, Connect placeholder in dev earnings

### Phase 7 - QA and polish

Default verification for this dashboard phase is intentionally narrow:

1. `npx tsc --noEmit` - zero errors
2. Visual QA: 375px, 768px, 1280px, 1440px, both themes, all roles
3. Keyboard navigation check: sidebar, tables, drawers, modals
4. Loading skeletons on all data-fetching surfaces
5. Error states on all data-fetching surfaces
6. Empty states verified for all 7 defined cases (Part 8 copy bank)
7. Replace all `<img>` with `next/image` in touched components

Do not run production builds unless explicitly requested. Run lint only when requested or when a specific implementation task needs it.

---

## PART 11: INTERACTION STANDARDS

| Surface      | Standard                                                                   |
| ------------ | -------------------------------------------------------------------------- |
| Tables       | Keyboard accessible, sortable, filterable, row action menus (⋯ button)     |
| Drawers      | Close on Escape + backdrop click, focus trap on open, sticky action footer |
| Modals       | Destructive actions only - brief, focused, not drawers                     |
| Forms        | Inline validation on blur, optimistic UI only where reversible             |
| Navigation   | Role-aware, active state always visible, no dead links                     |
| Loading      | Skeletons shaped like final content - not spinners on full pages           |
| Errors       | Actionable, scoped to affected panel, short                                |
| Empty states | One next best action minimum                                               |
| Toasts       | 4-second auto-dismiss, max 3 at once, accessible live region               |
| Timers       | Font-mono display, pulsing dot when active, accessible label               |

---

## PART 12: ACCESSIBILITY STANDARDS

- All icon-only controls: `aria-label` + Tooltip on hover/focus
- All interactive tables: `role="grid"`, column headers `scope="col"`, row actions keyboard reachable
- All drawers and modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to visible title
- All status badges: text label visible (not just colour - never colour-only meaning)
- All form fields: explicit `<label>` or `aria-label`, inline error with `aria-describedby`
- All dynamic content: `aria-live` regions where content updates without navigation
- Focus management: when drawer opens → focus first interactive element; when drawer closes → return focus to trigger
- Reduced motion: wrap all decorative framer-motion animations in `useReducedMotion()` check

---

## PART 13: DESIGN RULES - ALWAYS ACTIVE

No exceptions. These mirror the public site and apply everywhere in the codebase:

1. No `font-bold` or `font-semibold` - ever
2. `font-medium` for nav labels, buttons, compact UI, table headers, card titles
3. `font-mono` for IDs, money, timestamps, percentages, durations, stats
4. `@tabler/icons-react` exclusively - no Lucide, no Heroicons
5. Mobile-first - every component at 375px before 768px before 1280px+
6. No purple - the public design replaced it with the CSS token system
7. No decorative star/sparkle icons in dashboards
8. Empty states must be functional, not whimsical
9. No nested glass cards (glass inside glass) - one level of glass depth
10. Framer Motion springs: `{ type: "spring", damping: 25, stiffness: 200 }` - no `ease` or `linear` for UI transitions

---

## PART 14: COMPLETION DEFINITION

The dashboard phase is complete when all of the following are true:

- [ ] `dennis@andishi.dev` can sign in and lands on `/admin`
- [ ] A client user can sign in and lands on `/dashboard`
- [ ] A developer user can sign in and lands on `/dev`
- [ ] Wrong-role route visits redirect silently to the user's own root
- [ ] Unauthenticated visits to any `(app)` route redirect to `/login?next=...`
- [ ] Disabled accounts see a clear disabled-account state on login
- [ ] Dashboard shell is responsive at 375px, 768px, 1280px, 1440px
- [ ] Admin can inspect briefs, engineers, clients, matches, and placements
- [ ] Client can review brief status and request an intro from the matches page
- [ ] Developer can complete the profile wizard and see project/time/earnings state
- [ ] All 7 empty states exist with correct copy
- [ ] All loading and error states exist on data-fetching surfaces
- [ ] Crisp is initialised with user identity in the dashboard shell
- [ ] GA4 dataLayer events fire for all defined dashboard events
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Dark and light mode verified across all three workspaces

---

_This document is the single source of truth for dashboard implementation. It supersedes all previous dashboard notes. Every decision here is final unless this document is explicitly updated._
