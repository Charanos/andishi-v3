# Andishi Dashboard Component Library

Last updated: June 9, 2026

This document tracks the shared components and UI primitives that should carry the next dashboard implementation phase. It replaces the older unrelated component-library notes and aligns the system with the current Andishi v3 brand.

Primary implementation authority: `docs/DASHBOARD_MASTER_IMPLEMENTATION.md`.

Use this file as the component companion to the master doc. If this library conflicts with the master doc, update this file or follow the master doc.

## 1. Layout And Shell

### `AppShell`

Location: `src/components/dashboard/shell/app-shell.tsx`

Primary dashboard frame for all authenticated workspaces.

Current responsibilities:

- Renders `RoleSidebar`.
- Renders `DashboardTopNav`.
- Provides desktop content offsets for the expanded/collapsed fixed sidebar.
- Provides the dashboard page gutter and `max-w-[92rem]` content container.
- Keeps mobile content clear of the floating bottom nav.

Next responsibilities from the master doc:

- Receive authenticated user/session context.
- Continue tightening role-specific server context as client/dev dashboards mature.
- Keep all dashboard pages on the same shell rhythm as landing sections:
  - shell gutter: `px-5 sm:px-8 lg:px-10`
  - content width: `mx-auto w-full max-w-[92rem]`

### `RoleSidebar`

Location: `src/components/dashboard/shell/role-sidebar.tsx`

Role-aware navigation using `roleNav` from `src/data/dashboard.ts`.

Current responsibilities:

- Groups nav items by role with accordion behavior.
- Shows active route state.
- Supports expanded desktop sidebar and compact collapsed icon rail.
- Pins desktop navigation to the far-left viewport edge.
- Shows five priority route icons in the mobile bottom nav, plus a More drawer for the full menu.
- Shows logo/wordmark in expanded mode and logo-only in collapsed mode.
- Includes compact account context without duplicate role copy.
- Includes support navigation for admin, client, and developer roles.

Next responsibilities from the master doc:

- Notification/count badges per route.
- Persist user sidebar preference when account settings are ready.
- Connect route badges to live data counts.
- Close on route change, backdrop click, outside click, and Escape in mobile drawer mode.

### `DashboardTopNav`

Location: `src/components/dashboard/shell/dashboard-top-nav.tsx`

Top route context bar.

Current responsibilities:

- Replaces duplicate mobile breadcrumbs with the Andishi mark.
- Keeps command/search left-aligned on desktop and places search inside the expanded mobile drawer on small screens.
- Shows calendar/date dropdown, notification menu, theme toggle, quick-action launcher, and account menu.
- Uses outside-click and Escape dismissal for details-based popovers.
- Keeps notification count absolutely positioned on the button container.

Next responsibilities from the master doc:

- Connect calendar events, notifications, and quick actions to backend records as dashboard persistence expands.

## 2. Role Registry

### `roleNav`

Location: `src/data/dashboard.ts`

Single source of truth for dashboard navigation.

Rules:

- Do not duplicate role nav arrays inside page components.
- Use route root by role:
  - `admin -> /admin`
  - `client -> /dashboard`
  - `developer -> /dev`
- Sidebar, mobile nav, breadcrumbs, and role guards should all reference the same registry.

### `DashboardRole`

Location: `src/data/dashboard.ts`

Current roles:

```ts
export type DashboardRole = "admin" | "client" | "developer";
```

Future auth utilities should map persisted user roles to this type.

## 3. Existing Dashboard Modules

These components already exist and should be improved rather than replaced:

| Component | Location | Purpose |
|---|---|---|
| `WorkspacePage` | `src/components/dashboard/shared/workspace-page.tsx` | Reusable scaffold for role overview pages. |
| `InsightsCard` | `src/components/dashboard/shared/insights-card.tsx` | KPI card with compact trend data. |
| `OnboardingChecklist` | `src/components/dashboard/shared/onboarding-checklist.tsx` | Progress checklist for activation. |
| `WelcomeModal` | `src/components/dashboard/shared/welcome-modal.tsx` | First-login welcome surface. |
| `EmptyState` | `src/components/dashboard/shared/empty-state.tsx` | Role-aware empty surfaces. |
| `ActivityFeed` | `src/components/dashboard/shared/activity-feed.tsx` | Timeline/list of operational events. |
| `ProfileCard` | `src/components/dashboard/shared/profile-card.tsx` | Engineer/profile cards for client/admin surfaces. |
| `ProjectCard` | `src/components/dashboard/shared/project-card.tsx` | Project and milestone status cards. |
| `KanbanBoard` | `src/components/dashboard/shared/kanban-board.tsx` | Matching pipeline view. |
| `DataTable` | `src/components/dashboard/shared/data-table.tsx` | Table foundation for admin/client data. |
| `FilterBar` | `src/components/dashboard/shared/filter-bar.tsx` | Search and filters. |
| `DrawerPanel` | `src/components/dashboard/shared/drawer-panel.tsx` | Detail drawer foundation. |
| `TimeTracker` | `src/components/dashboard/shared/time-tracker.tsx` | Developer time capture surface. |
| `EarningsCard` | `src/components/dashboard/shared/earnings-card.tsx` | Developer earnings summary. |
| `Sparkline` | `src/components/dashboard/shared/sparkline.tsx` | Small data visualization. |
| `StatusBadge` | `src/components/dashboard/shared/status-badge.tsx` | Status chip. |
| `VettingBadges` | `src/components/dashboard/shared/vetting-badges.tsx` | Engineer vetting proof. |
| `DashboardLineChart` | `src/components/dashboard/shared/dashboard-chart.tsx` | Recharts trend/area chart primitive. |
| `DashboardBarChart` | `src/components/dashboard/shared/dashboard-chart.tsx` | Recharts discrete-volume chart primitive. |
| `DashboardDonutChart` | `src/components/dashboard/shared/dashboard-chart.tsx` | Recharts composition chart primitive. |
| `PageLoader` | `src/components/dashboard/shared/page-loader.tsx` | Logo-only pulsing dashboard loading state. |
| `AdminWorkspacePage` | `src/components/dashboard/admin/admin-workspace-page.tsx` | Shared admin workspace engine for queues, CRUD modal, detail drawer, charts, support, and relationship maps. |
| `SupportWorkspacePage` | `src/components/dashboard/shared/support-workspace-page.tsx` | Client/developer support workspace with admin resolver context. |
| `FloatingSupportChat` | `src/components/dashboard/shell/floating-support-chat.tsx` | Floating client/developer support chat available across authenticated workspaces. |

## 4. New Shared Primitives To Add

Add these as dashboard complexity grows:

| Component | File | Purpose |
|---|---|---|
| `RoleGate` | `src/components/dashboard/shared/role-gate.tsx` | Client conditional rendering helper. Server-side route guards remain the security boundary. |
| `DashboardPageHeader` | `src/components/dashboard/shared/dashboard-page-header.tsx` | Page title, description, right-aligned actions, and optional status chip. |
| `DashboardSection` | `src/components/dashboard/shared/dashboard-section.tsx` | Consistent section spacing, heading, body, and optional right action. |
| `MetricStrip` | `src/components/dashboard/shared/metric-strip.tsx` | Dense row of `font-mono` KPI values for admin overview and revenue. |
| `CommandMenu` | `src/components/dashboard/shell/command-menu.tsx` | Role-aware keyboard-triggered command palette for searching and jumping to shell routes. |
| `NotificationMenu` | `src/components/dashboard/shell/notification-menu.tsx` | Bell icon, badge, popover, role-scoped activity items, and role-safe destination links. |
| `AccountMenu` | `src/components/dashboard/shell/account-menu.tsx` | Avatar dropdown for profile, settings, public site, and sign out. |
| `EntityDrawer` | `src/components/dashboard/shared/entity-drawer.tsx` | Standard detail drawer with tabs and sticky action footer. |
| `StatusTimeline` | `src/components/dashboard/shared/status-timeline.tsx` | Brief, match, placement, and project history timeline. |
| `AuditLog` | `src/components/dashboard/admin/audit-log.tsx` | Admin-only change history with actor, timestamp, and delta. |
| `InlineEditableField` | `src/components/dashboard/shared/inline-editable.tsx` | Low-friction editable fields for briefs, settings, and profile data. |
| `ConfirmDialog` | `src/components/dashboard/shared/confirm-dialog.tsx` | Focused confirmation modal for destructive or irreversible actions. |
| `ToastProvider` | `src/components/dashboard/shared/toast-provider.tsx` | Accessible save/action feedback. |
| `DashboardCalendarMenu` | `src/components/dashboard/shell/dashboard-calendar-menu.tsx` | Role-aware date dropdown, current-day highlight, quick event form, and event list. |
| `DashboardQuickActions` | `src/components/dashboard/shell/dashboard-quick-actions.tsx` | Role-aware topbar launcher for admin, client, and developer workflows. |
| `AdminEventsPanel` | `src/components/dashboard/admin/admin-events-panel.tsx` | Admin overview event CRUD, schedule intelligence, and event detail modal. |
| `OverviewHeroActions` | `src/components/dashboard/admin/admin-overview-actions.tsx` | New-brief modal and hero action controls. |
| `PipelineDrawerButton` | `src/components/dashboard/admin/admin-overview-actions.tsx` | Pipeline drawer with selectable event detail modal. |
| `useDetailsPopover` | `src/components/dashboard/shell/use-details-popover.ts` | Shared outside-click and Escape behavior for details popovers. |

## 5. Component Design Rules

- Use Tabler icons only.
- Do not use `font-bold` or `font-semibold`.
- Use `font-medium` for labels, buttons, and compact titles.
- Use `.title-serif` for dashboard page titles and major section titles. Keep compact labels, table headings, field labels, and status copy in Outfit.
- `DashboardPageHeader` owns the standard dashboard page title treatment; avoid recreating page title sizing locally.
- `DashboardSection` owns the standard shared section-title treatment; local `SectionHeader` helpers should match its serif rhythm when a decomposed page needs custom layout.
- Use `font-mono` only for IDs, money, timestamps, percentages, and technical metadata.
- Prefer single cards/panels over nested card stacks.
- Tables and dense admin panels should be quiet and scannable.
- Drawers are preferred for entity detail; modals are preferred only for focused decisions.
- Mobile interactions must be reachable without hover.
- Every interactive icon-only control needs an accessible label and, when helpful, a tooltip.

### Admin Queue Card Pattern

- Use grid/list switching for operational queues that need both scan density and wide-screen review.
- Grid cards should stay compact: title/status/priority, metadata, three hard metrics, one or two progress bars, owner/budget/next-action summary, tags, and icon actions.
- List cards should reuse the same data but widen the signal column instead of stretching whitespace.
- Avoid nested dashboard panels inside each queue card; reserve rich charts and multi-step checklists for command modals or drawers.
- Pagination belongs to the queue section, and search/filter/sort changes should reset to page 1.
- Use a modal for focused command actions when a sticky side rail would reduce card quality. Use an entity drawer for deeper record inspection.

### Analytics Panel Pattern

- Treat analytics cards as observability panels, not generic content cards.
- Give every analytics card a compact metric pill in the header so the chart has an immediate readout.
- Use a bordered chart well with enough minimum height for Recharts to fill the panel; avoid small charts floating in large empty cards.
- Keep chart colors stage-specific and meaningful. Do not map multiple meaningful statuses to the same muted color unless they are intentionally grouped.
- Donut charts should default to slim rings for dashboard readability; use medium rings only when the donut is the primary visual object.

## 6. Data And State Rules

- Keep role nav in `src/data/dashboard.ts`.
- Centralize seed/mock data until persistence is wired.
- Auth registration must create linked organization or engineer shells when the role is client/developer.
- Admin settings must surface auth intake records with role, status, verification state, and relationship IDs.
- Once auth is implemented, shell components should receive user/session state from server utilities.
- Client pages must never receive admin-only fields.
- Developer pages must never receive unrelated client/org fields.
- Admin pages may receive cross-entity operational data, but sensitive values should be clearly scoped.
- Brief qualification is isolated from delivery creation: `/admin/briefs` should prepare and route work into `/admin/briefs/shortlist`, while confirmed placement/project operations stay in their dedicated admin pages and backend routes.

## 7. Verification

Default verification gate for this phase:

```bash
npx tsc --noEmit
```

Do not run production builds unless explicitly requested.
