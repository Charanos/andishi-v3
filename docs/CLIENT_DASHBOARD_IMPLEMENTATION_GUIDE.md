# Andishi Client Dashboard Implementation Guide

Last updated: May 31, 2026

This guide defines how to build the client dashboard after the admin dashboard foundation. It should be used with:

- `docs/DASHBOARD_MASTER_IMPLEMENTATION.md`
- `docs/DASHBOARD_IMPLEMENTATION_PLAYBOOK.md`
- `docs/Component_Library.md`
- `docs/THEME_GUIDE.md`
- `docs/BACKEND_ARCHITECTURE_SPEC.md`

The client dashboard must feel like a calm hiring command workspace for a founder, CTO, or hiring lead. It should reuse the shared dashboard shell and component system, but it must not feel like an admin console with labels changed. Client pages should prioritize clarity, confidence, next action, and relationship visibility.

## 1. Product Intent

The client dashboard answers:

1. What did Andishi understand from my hiring need?
2. Who is being considered, and why?
3. What needs my decision now?
4. What is happening with my active engineer or project?
5. Where do I get support from Andishi?

Client UI should be:

- Guided: show next steps and reduce ambiguity.
- Trust-building: explain why profiles, matches, invoices, and milestones exist.
- Operational: enough detail for repeated use, but less dense than admin.
- Relationship-aware: always connect client, admin resolver, developer, project, brief, and invoice context.
- Mobile-first: founders will check this from small screens.

## 2. Current Foundation To Reuse

Use the existing shared infrastructure:

- `AppShell`
- `RoleSidebar`
- `DashboardTopNav`
- `FloatingSupportChat`
- `SupportWorkspacePage`
- `DashboardPageHeader`
- `DashboardSection`
- `MetricCard`
- `KpiCard`
- `MetricStrip`
- `ActivityFeed`
- `StatusBadge`
- `EntityDrawer`
- `ConfirmDialog`
- `DataTable`
- `DashboardLineChart`
- `DashboardBarChart`
- `DashboardDonutChart`
- `EmptyState`
- `Skeleton`
- `PageLoader`
- `ToastProvider`

Admin-only components can inform structure but must be adapted:

- `AdminWorkspacePage` is a pattern reference, not a direct client page. Extract shared primitives from it only when they are role-neutral.
- Keep CRUD modals client-safe: client actions usually request, approve, schedule, comment, upload, or confirm. They should not expose admin-only state transitions.
- Keep support chat visible across client routes through `FloatingSupportChat`.
- Follow the refreshed admin overview rhythm for spacing and legibility: generous section gaps, headings outside dense cards, readable table/chart text, and split layouts delayed until the viewport can support them. The client dashboard should feel guided and spacious, not like a compressed admin clone.

## 3. Shell Requirements

Client dashboard uses the same `AppShell` as admin.

Sidebar:

- Role identity: `Client Portal`.
- Top support link must remain visible in the sidebar.
- Mobile bottom nav should prioritize:
  - Overview
  - My Brief
  - Developer Profiles
  - Projects
  - Support
- Full drawer should include Messages, Payments, and Settings.

Top nav:

- Desktop command/search should search client-visible objects only:
  - briefs
  - profiles
  - projects
  - invoices
  - support threads
- Quick actions should be role-aware:
  - Update brief
  - Request intro
  - Message support
  - Upload document
  - View invoice
- Notifications must be client-safe and scoped to their organization.

Support:

- `FloatingSupportChat` stays active on every client route.
- `/dashboard/support` is the primary support workspace.
- Support messages are routed to `/admin/support` as resolver context.

## 4. Route Map

Existing client route roots:

```txt
/dashboard
/dashboard/brief
/dashboard/matches
/dashboard/team
/dashboard/projects
/dashboard/messages
/dashboard/payments
/dashboard/settings
/dashboard/support
```

Recommended page intent:

| Route | Purpose | Primary user action |
|---|---|---|
| `/dashboard` | Client overview | See hiring status and next action |
| `/dashboard/brief` | Hiring brief | Review/update requirement details |
| `/dashboard/matches` | Developer profiles | Compare, shortlist, request intro |
| `/dashboard/team` | Active team | View placed engineers and engagement health |
| `/dashboard/projects` | Delivery workspace | Track milestones, updates, and risks |
| `/dashboard/messages` | Conversation center | View client-facing messages |
| `/dashboard/payments` | Invoices and billing | View/pay/download invoices |
| `/dashboard/settings` | Account and organization | Manage contacts, preferences, security |
| `/dashboard/support` | Admin-resolved support | Get help with project, billing, matching |

## 5. Data Boundaries

Client pages must receive only client-safe data.

Allowed:

- Client organization
- Client users for that organization
- Hiring briefs owned by that organization
- Projects created from those briefs through `Project.briefId`
- Matches proposed to that organization
- Public/approved engineer profile fields
- Placements for that organization
- Projects for that organization
- Invoices for that organization
- Support cases for that organization
- Client-visible activity

Never expose:

- Admin notes that are not explicitly client-facing
- Engineer private vetting notes
- Other client data
- Internal payout margins
- Disabled user details outside the client's own org
- System audit records unrelated to the client

Server utilities should enforce these boundaries before data reaches client components.

## 6. Relationship Model

Every meaningful client surface should show a relationship map, but simplified:

```txt
Client organization
  -> Hiring brief
  -> Proposed match
  -> Engineer profile
  -> Placement
  -> Project
  -> Invoice
  -> Support thread
  -> Admin resolver
```

Use this to guide UI:

- Brief pages show client + admin resolver.
- Match pages show client + developer + brief + intro status.
- Project pages show client + developer + admin resolver + milestones.
- Payment pages show client + invoice + project + approved timesheets.
- Support pages show client + admin resolver + linked entity.

## 7. Page Blueprints

### `/dashboard` Overview

Structure:

- Large client intro panel:
  - Current hiring stage
  - Admin resolver
  - Next action
  - SLA or expected response window
- KPI strip:
  - Profiles ready
  - Intros requested
  - Active projects
  - Open invoices
- Main grid:
  - Hiring progress timeline
  - Recommended profiles preview
  - Project health panel
  - Support status
  - Recent activity

Actions:

- Update brief
- Request intro
- Message support
- View invoice

### `/dashboard/brief`

Structure:

- Brief summary panel
- Requirement sections:
  - role
  - seniority
  - stack
  - timeline
  - engagement model
  - budget visibility if allowed
- Update request modal
- Document upload placeholder
- Admin clarification thread

Actions:

- Request change
- Confirm brief accuracy
- Upload context
- Message admin resolver

### `/dashboard/matches`

Structure:

- Match pipeline header
- Compare profiles cards
- Fit explanation panel
- Intro availability modal
- Profile detail drawer

Actions:

- Request intro
- Shortlist
- Decline with reason
- Ask admin question

Important:

- Use approved engineer fields only.
- Include why-this-match copy.
- Avoid exposing admin-only notes.

### `/dashboard/team`

Structure:

- Active engineers
- Role/engagement summary
- Availability and hours
- Support CTA
- Renewal/extension prompts where relevant

Actions:

- View engineer
- Request schedule change
- Message support
- View project

### `/dashboard/projects`

Structure:

- Project health header
- Source brief context when `Project.briefId` exists
- Milestone board
- Recent updates
- Risk/decision log
- Stakeholder support thread
- Linked invoice/timesheet summary

Actions:

- Approve milestone
- Request revision
- Add decision note
- Message support

### `/dashboard/messages`

Structure:

- Client-visible conversation list
- Thread panel
- Linked entity sidebar
- Support escalation CTA

This can remain lightweight until persistent chat records are implemented. Do not build a custom websocket system; align with Crisp/support strategy unless backend messaging is explicitly scoped.

### `/dashboard/payments`

Structure:

- Billing overview
- Invoice table/card list
- Invoice detail drawer
- Approved timesheet summary
- Payment state chart

Actions:

- View invoice
- Download invoice
- Ask billing question
- Mark billing contact update requested

### `/dashboard/settings`

Structure:

- Organization profile
- Team contacts
- Notification preferences
- Security/account state
- Support routing preferences

Actions:

- Update org details
- Invite teammate
- Change notification preferences
- Contact admin resolver

### `/dashboard/support`

Use `SupportWorkspacePage` and refine with client-specific cases:

- Matching support
- Project support
- Billing support
- Account support

Support messages should be mirrored into admin resolver context.

## 8. Component Reuse Strategy

Prefer extracting role-neutral components:

- `RelationshipMap`
- `WorkspaceHeroPanel`
- `RecordQueue`
- `EntitySummaryDrawer`
- `SupportThread`
- `MilestoneBoard`
- `InvoicePanel`
- `DecisionModal`
- `ProfileCompareGrid`

Do not overfit client pages to `AdminWorkspacePage`. If a piece is useful in both admin and client, extract it into `src/components/dashboard/` with role-neutral props.

Recommended shared prop pattern:

```ts
type WorkspaceActor = {
  id: string;
  name: string;
  role: "admin" | "client" | "developer";
  avatar?: string;
};

type RelationshipContext = {
  organization?: EntityRef;
  adminResolver?: EntityRef;
  brief?: EntityRef;
  engineer?: EntityRef;
  project?: EntityRef;
  invoice?: EntityRef;
  supportCase?: EntityRef;
};
```

## 9. CRUD And Actions

Client actions should be request/decision oriented:

- Create:
  - support case
  - brief update request
  - intro request
  - decision note
  - document upload placeholder
- Read:
  - profiles
  - invoices
  - projects
  - support thread
- Update:
  - brief details
  - notification preferences
  - intro availability
  - milestone approval state
- Delete/archive:
  - only draft notes or uploaded context before submission

Use modals for focused actions and drawers for entity detail.

## 10. DevOps And Backend Path

Client dashboard should be backed by server-side data access utilities:

```txt
src/lib/dashboard/client/
  overview-data.ts
  brief-data.ts
  matches-data.ts
  projects-data.ts
  payments-data.ts
  support-data.ts
```

Each utility must:

- Require a client session.
- Resolve organization ID from session.
- Filter records by organization ID.
- Shape client-safe view models.
- Avoid returning admin-only fields.

Suggested API/server actions:

- `requestBriefUpdateAction`
- `requestIntroAction`
- `submitAvailabilityAction`
- `approveMilestoneAction`
- `openSupportCaseAction`
- `sendSupportMessageAction`
- `updateOrganizationSettingsAction`

## 11. Visual Rules

- Keep surfaces light in light mode and dark in dark mode.
- Use the same shell and topbar tokens.
- Client pages may be more guided and less dense than admin pages.
- Use `font-mono` for numbers, dates, IDs, amounts, and durations.
- No `font-bold` or `font-semibold`.
- Use Tabler icons only.
- Every icon button needs an `aria-label`.
- Support chat must not obscure mobile bottom navigation.

## 12. Validation Checklist

Run before handing off:

```bash
npx tsc --noEmit
git diff --check
```

Manual checks:

- Client cannot see admin-only notes.
- Client cannot access another organization's data.
- Support link appears in sidebar and mobile drawer.
- Floating support chat appears for client but not admin.
- Mobile bottom nav does not overlap main CTAs.
- Modals lock background scroll.
- Drawers close on Escape and outside click.
- Light/dark modes both keep readable contrast.

## 13. Implementation Phases

Phase 1:

- Build client overview, support, brief, and matches pages.
- Extract shared relationship/support primitives from admin workspace where useful.

Phase 2:

- Build projects, team, payments, messages, and settings pages.
- Add client-safe server data mappers.

Phase 3:

- Persist support cases/messages.
- Persist client actions and admin resolver state.
- Add audit/activity events.

Phase 4:

- Visual QA across 375px, 768px, 1280px, 1440px.
- Verify auth boundaries with seeded client and admin users.
