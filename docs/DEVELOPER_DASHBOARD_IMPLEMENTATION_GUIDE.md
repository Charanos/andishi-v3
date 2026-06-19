# Andishi Developer Dashboard Implementation Guide

Last updated: May 31, 2026

This guide defines how to build the developer dashboard after the admin dashboard foundation. It should be used with:

- `docs/DASHBOARD_MASTER_IMPLEMENTATION.md`
- `docs/DASHBOARD_IMPLEMENTATION_PLAYBOOK.md`
- `docs/Component_Library.md`
- `docs/THEME_GUIDE.md`
- `docs/BACKEND_ARCHITECTURE_SPEC.md`
- `docs/CLIENT_DASHBOARD_IMPLEMENTATION_GUIDE.md`

The developer dashboard is not an applicant portal. It is a professional workbench for vetted Andishi engineers: profile quality, active projects, timesheets, earnings, support, and communication with Andishi operations.

## 1. Product Intent

The developer dashboard answers:

1. What is expected of me this week?
2. What project or placement am I connected to?
3. What time, payout, or milestone needs action?
4. How strong and complete is my Andishi profile?
5. Where do I get help from Andishi?

Developer UI should be:

- Respectful: engineers should feel like senior collaborators, not gig workers.
- Precise: project expectations, time, and payout states should be unambiguous.
- Action-oriented: submit time, update profile, respond to support, review project context.
- Relationship-aware: show admin resolver, client, project, placement, invoice/payout where relevant.
- Mobile-ready: time and support workflows should work well from small screens.

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
- `ProfileCard`
- `ProjectCard`
- `TimeTracker`
- `EarningsCard`
- `EmptyState`
- `Skeleton`
- `PageLoader`
- `ToastProvider`

Admin components should inform structure, but developer pages must be optimized for work clarity and trust. Avoid admin-like batch operations unless the developer is managing their own records.

Use the refreshed admin overview rhythm as the shared dashboard baseline: generous section gaps, headings outside dense cards, readable chart/table text, and major split layouts delayed until the viewport can support them. Developer pages should feel like a professional workbench with room to inspect work, time, earnings, support, and profile health.

## 3. Shell Requirements

Developer dashboard uses the shared `AppShell`.

Sidebar:

- Role identity: `Developer Portal`.
- Support link must be present in the sidebar.
- Mobile bottom nav should prioritize:
  - Overview
  - My Projects
  - Support
  - Time Tracking
  - My Profile
- Full drawer should include Earnings, Messages, and Settings.

Top nav:

- Desktop command/search should search developer-visible objects only:
  - projects
  - milestones
  - timesheets
  - earnings
  - support threads
  - profile fields
- Quick actions should be role-aware:
  - Start timer
  - Submit timesheet
  - Update profile
  - Message support
  - View earnings

Support:

- `FloatingSupportChat` stays active on every developer route.
- `/dev/support` is the primary support workspace.
- Support messages route to `/admin/support` as resolver context.

## 4. Route Map

Existing developer route roots:

```txt
/dev
/dev/projects
/dev/time
/dev/profile
/dev/earnings
/dev/messages
/dev/settings
/dev/support
```

Recommended page intent:

| Route | Purpose | Primary user action |
|---|---|---|
| `/dev` | Developer overview | See work, time, earnings, profile health |
| `/dev/projects` | Active/scoped projects | Review milestones, client context, updates |
| `/dev/time` | Timesheets | Track and submit billable work |
| `/dev/profile` | Andishi profile | Improve marketable profile and public readiness |
| `/dev/earnings` | Earnings and payouts | View invoice/payout status |
| `/dev/messages` | Developer-facing messages | View operational messages |
| `/dev/settings` | Account preferences | Manage availability, notifications, account |
| `/dev/support` | Admin-resolved support | Get help with project, profile, time, payout |

## 5. Data Boundaries

Developer pages must receive only developer-safe data.

Allowed:

- Current developer user
- Linked engineer profile
- Placements involving that engineer
- Projects involving that engineer
- Source brief context for those projects when `Project.briefId` exists, limited to developer-safe fields
- Milestones assigned or visible to that engineer
- Timesheets for that engineer
- Earnings/payout summaries for that engineer
- Developer-visible activity
- Support cases involving that developer
- Client/project context needed to perform the work

Never expose:

- Other engineers' private profile data
- Client billing details beyond what is relevant to payout/timesheet context
- Admin margin or internal revenue notes
- Admin vetting notes not approved for developer visibility
- Other clients' project details
- Unrelated support cases

Server utilities should enforce developer ID filtering before data reaches client components.

## 6. Relationship Model

Every developer work surface should show the relevant relationship context:

```txt
Developer user
  -> Engineer profile
  -> Placement
  -> Project
  -> Client organization
  -> Admin resolver
  -> Timesheet
  -> Invoice/payout
  -> Support thread
```

Use this to guide UI:

- Project pages show client + admin resolver + milestones.
- Time pages show project + approved/billable state.
- Earnings pages show invoice/payout + approved timesheets.
- Profile pages show public readiness + admin review state.
- Support pages show linked project/profile/time/payout context.

## 7. Page Blueprints

### `/dev` Overview

Structure:

- Workbench hero:
  - current placement/project
  - weekly focus
  - admin resolver
  - availability state
- KPI cards:
  - hours this week
  - pending approval
  - month earned
  - profile completeness
- Main grid:
  - active projects
  - timesheet reminder
  - earnings snapshot
  - profile readiness
  - support status
  - activity feed

Actions:

- Start timer
- Submit timesheet
- Update profile
- Message support

### `/dev/projects`

Structure:

- Project list/card grid
- Project detail drawer
- Source brief context where useful for why the work exists and what outcome was promised
- Milestone timeline
- Linked support thread
- Client context panel

Actions:

- View milestone
- Add update
- Ask scope question
- Mark risk

Important:

- Developer can update delivery status but cannot change client-owned scope without an admin-mediated request.

### `/dev/time`

Structure:

- Active timer
- Weekly timesheet grid
- Submitted/approved/rejected states
- Billable summary
- Project selector
- Timesheet detail drawer

Actions:

- Start/stop timer
- Add manual time
- Submit week
- Edit draft entry
- Respond to rejection note

## Time Tracker Rules

- Draft entries can be edited by developer.
- Submitted entries are locked unless recalled or rejected.
- Approved entries become payout inputs.
- Rejected entries require a reason and resubmission.

### `/dev/profile`

Structure:

- Profile completion score
- Public profile preview
- Editable fields:
  - role
  - domain
  - bio
  - highlight
  - skills
  - work history
  - links
  - availability
- Admin review status
- Vetting badges

Actions:

- Save draft
- Submit for review
- Toggle public profile where allowed
- Request profile help

### `/dev/earnings`

Structure:

- Earnings summary
- Payout schedule
- Approved time
- Invoice/payout history
- Revenue chart
- Support CTA for payout questions

Actions:

- View payout
- Download statement
- Ask payout question
- View linked timesheets

### `/dev/messages`

Structure:

- Developer-facing conversation list
- Thread panel
- Linked project/support context

This should remain aligned with support strategy. Do not build a custom websocket system unless explicitly scoped.

### `/dev/settings`

Structure:

- Account info
- Availability preferences
- Notification preferences
- Security state
- Payout profile placeholder
- Support routing preferences

Actions:

- Update availability
- Update notification preferences
- Request account change
- Contact admin support

### `/dev/support`

Use `SupportWorkspacePage` and refine with developer-specific cases:

- Project scope support
- Timesheet support
- Payout support
- Profile support

Messages should be mirrored into admin support resolver context.

## 8. Component Reuse Strategy

Prefer extracting role-neutral primitives:

- `RelationshipMap`
- `WorkspaceHeroPanel`
- `SupportThread`
- `EntitySummaryDrawer`
- `MilestoneTimeline`
- `TimesheetGrid`
- `PayoutPanel`
- `ProfileReadinessCard`
- `AvailabilityControl`
- `DecisionNoteModal`

The developer dashboard can reuse:

- `ProjectCard` for project previews.
- `TimeTracker` for time capture.
- `EarningsCard` for payout overview.
- `ProfileCard` for profile preview, with developer-self variant.
- `FloatingSupportChat` for quick support.

Do not expose admin operations like archive, assign owner, or force state transitions unless they are developer-owned records.

## 9. CRUD And Actions

Developer actions should be self-service and work-focused:

- Create:
  - time entry
  - project update
  - support case
  - profile draft field
  - availability update
- Read:
  - projects
  - milestones
  - timesheets
  - earnings
  - profile
  - support thread
- Update:
  - draft timesheet
  - profile fields
  - availability
  - notification preferences
  - support messages
- Delete/archive:
  - draft timesheet entries only
  - draft profile links only

Use modals for focused action entry and drawers for project/profile/timesheet detail.

## 10. DevOps And Backend Path

Developer dashboard should be backed by server-side data access utilities:

```txt
src/lib/dashboard/developer/
  overview-data.ts
  projects-data.ts
  time-data.ts
  profile-data.ts
  earnings-data.ts
  support-data.ts
```

Each utility must:

- Require a developer session.
- Resolve `engineerId` from session.
- Filter records by engineer ID.
- Shape developer-safe view models.
- Avoid returning admin-only or other-engineer fields.

Suggested API/server actions:

- `startTimerAction`
- `stopTimerAction`
- `createTimesheetEntryAction`
- `submitTimesheetWeekAction`
- `updateProfileDraftAction`
- `submitProfileReviewAction`
- `updateAvailabilityAction`
- `openDeveloperSupportCaseAction`
- `sendDeveloperSupportMessageAction`
- `requestPayoutSupportAction`

## 11. Persistence Requirements

Priority persisted records:

- Engineer profile
- Availability state
- Projects and milestones
- Timesheet entries
- Invoice/payout records
- Support cases/messages
- Activity/audit events

Avoid scattering developer mock data in page files. Centralize temporary demo view models until DB queries are fully wired.

## 12. Visual Rules

- Keep developer pages crisp, practical, and respectful.
- Use workbench language, not marketplace/gig language.
- Use `font-mono` for hours, money, dates, IDs, percentages, and durations.
- No `font-bold` or `font-semibold`.
- Use Tabler icons only.
- Every icon button needs an `aria-label`.
- Use chart variety:
  - line for earnings/time trend
  - bar for weekly hours
  - donut for profile completeness or time allocation
- Support chat must not obscure mobile bottom navigation.

## 13. Validation Checklist

Run before handoff:

```bash
npx tsc --noEmit
git diff --check
```

Manual checks:

- Developer cannot see other engineers' private data.
- Developer cannot see admin-only vetting notes unless approved.
- Support link appears in sidebar and mobile drawer.
- Floating support chat appears for developer but not admin.
- Time tracker works at 375px.
- Earnings and profile pages are readable in light/dark modes.
- Modals lock background scroll.
- Drawers close on Escape and outside click.
- All key actions have clear pending/success/error states.

## 14. Implementation Phases

Phase 1:

- Build developer overview, support, projects, and time pages.
- Extract shared support/relationship primitives where useful.

Phase 2:

- Build profile, earnings, messages, and settings pages.
- Add developer-safe server data mappers.

Phase 3:

- Persist time entries, support cases/messages, profile review state, and activity events.
- Wire payout/invoice records.

Phase 4:

- Visual QA across 375px, 768px, 1280px, 1440px.
- Verify auth boundaries with seeded developer and admin users.
