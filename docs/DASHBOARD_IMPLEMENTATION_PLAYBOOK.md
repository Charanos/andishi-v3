# Andishi Dashboard Implementation Playbook

Last updated: June 7, 2026

This is the working handoff for moving from the completed public marketing/auth foundation into production-grade dashboard implementation.

Primary source of truth for execution: `docs/DASHBOARD_MASTER_IMPLEMENTATION.md`.

Use this playbook as the compact companion checklist. If this file and the master implementation document conflict, follow `docs/DASHBOARD_MASTER_IMPLEMENTATION.md`.

For page-specific admin decomposition, also follow `docs/ADMIN_DASHBOARD_PAGE_REVAMP_PATTERN.md`.

## 1. Current Foundation

The public site now establishes the Andishi design language:

- Cosmic editorial surfaces with restrained glass, fine borders, large quiet whitespace, and real workflow artifacts.
- Talent-first positioning for senior African engineers serving global startups.
- Public route shells aligned around `max-w-[92rem]` with responsive gutters: `px-5 sm:px-8 lg:px-10`.
- Login and conversion pages styled as premium workspace entry points, not generic SaaS templates.
- Existing dashboard scaffolds under `src/app/(app)/` for admin, client, and developer workspaces.
- Existing shared dashboard primitives in `src/components/dashboard/` and role nav data in `src/data/dashboard.ts`.
- Admin overview has been upgraded into the current production reference surface: operational hero, Recharts metrics, event CRUD, pipeline drawers, activity timeline, mobile-safe cards, and centralized mock data.
- The admin overview visual direction now uses a more breathable command-canvas rhythm: larger inter-section gaps, headings outside dense cards, later two-column breakpoints, roomier metric/chart panels, and typography sized for active operational reading rather than miniature dashboard decoration.
- `/admin/briefs` has moved from the generic admin workspace engine into a dedicated briefs command page. It now establishes the admin page decomposition pattern: page-specific data model, search/filter/sort queue, grid/list view switching, pagination, stage strip, SLA and priority intelligence, modalized brief command surface, create modal, detail drawer, archive confirmation, candidate recommendations, and refined full-height analytics cards.
- `/admin/briefs/shortlist` is now a dedicated slate curation page with client shortlist selection, fit observability, engineer decision matrices, add/remove candidate actions, detail drawers, and compact status distribution.
- `/admin/matches` is now a dedicated talent pipeline page with a five-stage Kanban board, stage distribution and velocity observability, health mix donut labels, selected-item command rail, create-pipeline modal, intro scheduling modal, detail drawer, archive confirmation, and table matrix for cross-card comparison.
- `/admin/placements` is now a dedicated delivery operations page with placement health, hours, billing, renewal risk, grid/list roster views, desktop detail rail, mobile drawer, create placement, stakeholder message, invoice, pause/resume, and terminate flows.
- `/admin/placements/timeline` is now a dedicated placement timesheet page with weekly hours observability, day-level totals, approval queue, engineer breakdowns, bulk approval, entry drawer inspection, and manual entry creation.
- The shared shell now includes a far-left desktop sidebar, compact collapsed rail, five-link mobile bottom nav plus drawer, floating top nav, click-outside popovers, and functional calendar/notification/quick-action/account controls.
- Admin subpages now use a shared workspace engine for briefs, clients, engineers, matches, placements, revenue, content, settings, and support.
- Client/developer workspaces now include floating support chat plus dedicated support pages routed to admin resolver context.
- Registration creates a client organization or developer profile shell so auth inputs are visible in admin settings with relationship IDs.

The next phase is not to create a generic admin panel. The dashboards should feel like Andishi's private operating system: precise, calm, high-signal, premium, and built for repeated operational use.

## 2. Dashboard North Star

The dashboard experience should be Awwwards-level in visual craft while remaining professional full-stack software:

- Client dashboard: make the client feel matched, informed, and guided from brief to intro to placement.
- Developer dashboard: make the engineer feel respected, prepared, and paid with clarity.
- Admin dashboard: make Andishi operations feel like mission control for briefs, matches, placements, revenue, and content.

Every dashboard page must answer:

1. What is the user's role and current job to be done?
2. What is the next meaningful action?
3. What changed since the last visit?
4. What data can be trusted right now?
5. What is intentionally empty or pending?

## 3. Role Model And RBAC

Supported roles:

| Role        | Route root   | Primary identity    | Purpose                                                                                  |
| ----------- | ------------ | ------------------- | ---------------------------------------------------------------------------------------- |
| `admin`     | `/admin`     | Andishi operator    | Owns network, briefs, matches, placements, revenue, content, and settings.               |
| `client`    | `/dashboard` | Hiring company user | Reviews brief status, matches, team, projects, messages, invoices, and account settings. |
| `developer` | `/dev`       | Engineer in network | Manages profile, projects, time, earnings, messages, and settings.                       |

Minimum user shape:

```ts
type UserRole = "admin" | "client" | "developer";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: "active" | "invited" | "disabled";
  organizationId?: string;
  engineerId?: string;
  lastLoginAt?: string;
  createdAt: string;
};
```

Access rules:

- `/admin/*` requires `role === "admin"`.
- `/dashboard/*` requires `role === "client"`.
- `/dev/*` requires `role === "developer"`.
- Auth checks must happen in server-side route boundaries or server utilities, not only in client components.
- If a logged-in user visits the wrong workspace, redirect to their own root.
- If an unauthenticated user visits an app route, redirect to `/login?next=<encoded-path>`.
- Disabled users must be signed out or redirected to a clear disabled-account state.

## 4. Initial Seed Admin

Seed the first admin account for local/dev bootstrap:

| Field                | Value                |
| -------------------- | -------------------- |
| Email                | `dennis@andishi.dev` |
| Password             | `dennis-andishi@123` |
| Role                 | `admin`              |
| Status               | `active`             |
| Redirect after login | `/admin`             |

Implementation requirements:

- Store only a password hash in code/database seeds. Do not store the plaintext password in runtime data beyond the seed input.
- Gate the seed so it is idempotent: if `dennis@andishi.dev` exists, update role/status only when explicitly allowed.
- In production, prefer an environment-provided bootstrap secret or one-time admin invite flow.
- The seed account must never be shown in public UI.

Recommended seed command shape:

```bash
npm run seed:admin
```

Recommended environment override:

```bash
ADMIN_SEED_EMAIL=dennis@andishi.dev
ADMIN_SEED_PASSWORD=dennis-andishi@123
```

## 5. Login And Redirect Flow

The `/login` page already has the right design posture. The next implementation should make it functional:

1. User enters email/password.
2. Server validates credentials and user status.
3. Server creates session.
4. Redirect target is resolved:
   - `next` param if it belongs to the user's allowed route group.
   - Otherwise role root: `admin -> /admin`, `client -> /dashboard`, `developer -> /dev`.
5. Wrong-role `next` params are ignored.
6. Failed login uses the existing premium form surface for inline errors.

Role redirect utility:

```ts
const roleHome: Record<UserRole, string> = {
  admin: "/admin",
  client: "/dashboard",
  developer: "/dev",
};
```

## 6. Shared Dashboard Shell

Current source files:

- `src/components/dashboard/shell/app-shell.tsx`
- `src/components/dashboard/shell/role-sidebar.tsx`
- `src/components/dashboard/shell/dashboard-top-nav.tsx`
- `src/data/dashboard.ts`

Shell requirements:

- Keep the dashboard app independent from the public navbar/footer.
- Keep page content constrained by the same usable container pattern as landing sections:
  - outer page shell: `px-5 sm:px-8 lg:px-10`
  - inner content container: `mx-auto w-full max-w-[92rem]`
- Sidebar owns navigation and role context.
- Top nav owns route title, breadcrumbs, notifications, theme toggle, mobile menu trigger, and account menu.
- Mobile shell uses a floating bottom nav with five priority routes and a More drawer containing command/search plus grouped navigation.
- Desktop shell supports expanded and collapsed sidebar states without layout jumps.
- Role-specific nav comes from a single registry, not duplicated per route.

Role-aware sidebar states:

- Active route: subtle secondary-tinted surface, left accent, icon color shift.
- Group labels: compact `label-caps`, low contrast, no heavy bold.
- Role card: show role label, account/org context, and small operational status.
- Sign out must be accessible from account menu or sidebar footer.
- Support must be available from admin, client, and developer sidebars. Client/developer support includes a floating chat; admin support acts as the resolver queue.

Top navigation states:

- Desktop command/search is left-aligned inside the floating navbar.
- Small screens replace the search block with the Andishi mark and move search into the expanded mobile drawer.
- Calendar, notification, quick-action, and account menus close on outside click and Escape.
- The calendar dropdown highlights the current date visibly in both themes and supports quick event creation.
- Notification count sits absolutely on the icon button container, similar to a cart-count badge.

## 7. Visual System For Dashboards

Preserve the public site language, but adapt it for dense operational work:

- No marketing hero pages inside dashboards.
- No nested decorative cards.
- Use full-width bands, tables, panels, drawers, and compact cards.
- Cards should generally stay at `rounded-[1rem]` to `rounded-[1.35rem]`; avoid overly pill-shaped admin surfaces.
- Use `font-mono` only for IDs, timestamps, values, percentages, money, and technical metadata.
- Use `font-medium` for labels, buttons, and compact titles. Do not use `font-bold` or `font-semibold`.
- Use Tabler icons only.
- Avoid generic sparkle/star decoration.
- Empty states should be practical and role-specific, not whimsical.
- High-value pages may use editorial artifact panels, but those panels must display actual workflow information.
- Keep overview pages calm and spacious. Use generous page gaps (`gap-9 md:gap-10 lg:gap-12`), `my-8`/`mt-6` section offsets, and card padding that gives charts, forms, and tables room to breathe.
- Do not compress major analytical sections into side-by-side columns too early. Prefer single-column stacking through tablet sizes, then introduce split layouts at `xl` or wider where the data remains readable.
- Section headings and descriptions should usually sit outside the card surface. The card itself should focus on data visualization, table rows, CRUD controls, or activity content.
- Avoid tiny operational text. Labels, descriptions, timestamps, table cells, and chart annotations should remain readable without zoom; reserve smaller mono text for non-critical metadata only.

Dashboard color behavior:

- Continue using CSS tokens from `src/app/globals.css`.
- Use `var(--secondary)` selectively for active navigation, explicit matching signals, and rare command emphasis. Avoid letting cyan become the default accent for every dashboard state.
- Use `var(--tertiary)` for verified, paid, passed, or complete states.
- Use `var(--primary)` for neutral operational emphasis, selected data surfaces, and non-success/non-error observability.
- Use `var(--error)` for blocked, overdue, destructive, or risk states.
- Use glass surfaces only where depth helps grouping; tables and dense panels can be quieter.

## 8. Shared Components To Build Or Refine

Already present and should be refined rather than reinvented:

| Component               | Purpose                                  | Next refinement                                                                                             |
| ----------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `AppShell`              | Shared dashboard frame                   | Keep route protection wired, preserve fixed sidebar offsets, and extend role-specific page states.          |
| `RoleSidebar`           | Role-aware navigation                    | Maintain compact collapsed rail, five-link mobile bottom nav, grouped drawer search, and active accordions. |
| `DashboardTopNav`       | Route actions                            | Maintain left-aligned command search, calendar, notifications, theme, quick actions, and account menu.      |
| `DashboardCalendarMenu` | Date and event control                   | Connect created events to persistence and shared activity feed.                                             |
| `DashboardQuickActions` | Common action launcher                   | Expand role-specific action sets as subpages mature.                                                        |
| `AdminEventsPanel`      | Operational calendar panel               | Replace mock event state with backend event records and audit trail.                                        |
| `OverviewHeroActions`   | Admin overview modals                    | Connect new brief submission to real brief creation.                                                        |
| `PipelineDrawerButton`  | Pipeline detail drawer                   | Connect selected pipeline event to placement/match records.                                                 |
| `AdminWorkspacePage`    | Admin subpage engine                     | Replace client-side mock actions with persisted mutations and audit logs.                                   |
| `SupportWorkspacePage`  | Client/developer support surface         | Connect support cases and messages to persisted admin-resolved threads.                                     |
| `FloatingSupportChat`   | Global client/developer support launcher | Persist chat messages and unread counts.                                                                    |
| `WorkspacePage`         | Reusable overview template               | Split into role-specific composed sections where complexity grows.                                          |
| `InsightsCard`          | KPI card                                 | Add loading/skeleton and trend semantics.                                                                   |
| `DataTable`             | Admin/client tables                      | Add sort/filter/pagination and accessible row actions.                                                      |
| `DrawerPanel`           | Detail side panel                        | Standardize for brief, client, engineer, placement, invoice, content detail.                                |
| `KanbanBoard`           | Matching pipeline                        | Add drag/drop later only after data model is stable.                                                        |
| `ProfileCard`           | Engineer profile card                    | Support public, client-match, admin, and developer-self variants.                                           |
| `ProjectCard`           | Project/milestone status                 | Add client/developer variants.                                                                              |
| `EmptyState`            | Role-specific empty surfaces             | Centralize copy bank and action mapping.                                                                    |
| `TimeTracker`           | Developer time capture                   | Connect to timesheet records.                                                                               |
| `EarningsCard`          | Developer earnings                       | Connect to invoice/payment records.                                                                         |

New primitives likely needed:

- `RoleGate`
- `DashboardPageHeader`
- `DashboardSection`
- `MetricStrip`
- `CommandMenu`
- `NotificationMenu`
- `AccountMenu`
- `StatusTimeline`
- `AuditLog`
- `EntityDrawer`
- `InlineEditableField`
- `ConfirmDialog`
- `ToastProvider`

## 9. Data Model Direction

Start with server-side types and a thin persistence layer. Avoid scattering mock objects across pages.

Core entities:

- `User`
- `Organization`
- `ClientProfile`
- `EngineerProfile`
- `HiringBrief`
- `Match`
- `Placement`
- `Project`
- `Milestone`
- `TimesheetEntry`
- `Invoice`
- `Payment`
- `MessageThread`
- `ActivityEvent`
- `ContentItem`

Important relationships:

- Client users belong to an organization.
- Hiring briefs belong to an organization.
- Matches connect a hiring brief to one engineer profile.
- Placements are accepted matches with commercial terms.
- Projects can belong to a placement or organization.
- Developer time entries belong to a project and engineer.
- Activity events are role-scoped and entity-linked.

## 10. Page Implementation Order

Implement in the order defined in `docs/DASHBOARD_MASTER_IMPLEMENTATION.md` Part 10. Condensed sequence:

1. Auth/session utilities, role redirect, seed admin.
2. App shell upgrade: mobile sidebar, account menu, role guard, notification placeholder.
3. Admin overview: real operational command surface using seeded admin.
4. Admin briefs: table, filters, detail drawer.
5. Admin engineers: directory, profile drawer, availability/vetting actions.
6. Client overview and matches: because this is the buyer activation path.
7. Developer overview and profile wizard: because engineer readiness powers matching.
8. Projects, messages, payments/earnings.
9. Admin revenue/content/settings.
10. Polish, accessibility, responsive QA, and interaction states.

Do not skip admin auth just because the public login page already exists. The seed admin login is the first proof that the dashboard phase is real software rather than static UI.

## 11. Role Page Requirements

### Admin

Admin pages must prioritize density, scanning, and action.

- `/admin`: platform overview with KPIs, pipeline, recent activity, quick actions.
- `/admin/briefs`: grid/list brief queue, pagination, modalized command actions, detail drawer, shortlist progression, and refined analytics.
- `/admin/matches`: expanded pipeline with stage updates and audit trail.
- `/admin/engineers`: network directory with vetting, availability, skills, placement history.
- `/admin/clients`: organization and contact management.
- `/admin/placements`: active/completed placement records.
- `/admin/revenue`: revenue KPIs, invoices, monthly trend.
- `/admin/content`: blog/case-study operations.
- `/admin/settings`: users, integrations, matching parameters.

### Client

Client pages must make progress visible and reduce anxiety.

- `/dashboard`: brief status, profile readiness, next step, activity feed.
- `/dashboard/brief`: submitted brief, editable fields, Andishi notes, status timeline.
- `/dashboard/matches`: primary activation page; profile cards, vetting evidence, request intro.
- `/dashboard/team`: active engineers after placement.
- `/dashboard/projects`: milestone status and delivery context.
- `/dashboard/messages`: Crisp wrapper or conversation handoff.
- `/dashboard/payments`: invoices, payment state, billing contact.
- `/dashboard/settings`: company profile and workspace users.

### Developer

Developer pages must communicate professionalism, readiness, and financial clarity.

- `/dev`: active work, profile readiness, time summary, earnings preview.
- `/dev/profile`: profile wizard/editor, visibility toggle, vetting checklist.
- `/dev/projects`: project context, milestones, client expectations.
- `/dev/time`: active timer, week view, submitted logs.
- `/dev/earnings`: upcoming payout, paid invoices, payment method state.
- `/dev/messages`: Crisp wrapper or engagement communication handoff.
- `/dev/settings`: profile/account preferences.

## 12. Interaction Standards

- Tables: keyboard accessible, sortable, filterable, row action menus.
- Drawers: close on Escape, focus trap, clear title, persistent actions footer.
- Modals: use only for discrete decisions; prefer drawers for entity details.
- Forms: inline validation, persistent save affordance, optimistic UI only when reversible.
- Navigation: role-aware and predictable. Do not expose inaccessible routes.
- Loading: skeletons shaped like final content.
- Errors: actionable, short, and scoped to the affected panel.
- Empty states: include one next best action when possible.

## 13. Verification Gate

Per current project instruction, use TypeScript as the default verification gate unless broader verification is requested:

```bash
npx tsc --noEmit
```

Run lint or build only when explicitly requested or when a change materially needs that level of verification.

## 14. Completion Definition For Dashboard Phase

The dashboard phase is complete when:

- `dennis@andishi.dev` can sign in as admin and land on `/admin`.
- Client and developer users can sign in and are redirected to their correct workspace.
- Wrong-role routes redirect or deny access server-side.
- Dashboard shell is responsive across mobile, tablet, desktop, and wide desktop.
- Admin can inspect briefs, engineers, clients, matches, and placements from real or seed-backed data.
- Client can review brief status and request intros from match cards.
- Developer can complete profile readiness and see project/time/earnings state.
- Empty, loading, error, and disabled-account states exist.
- The visual language matches the public site while becoming denser and more operational.
