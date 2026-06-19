# Admin Dashboard Page Revamp Pattern

Last updated: June 10, 2026

This guide documents the pattern established by the `/admin/briefs`, `/admin/briefs/shortlist`, `/admin/matches`, `/admin/matches/board`, `/admin/placements`, `/admin/placements/timeline`, `/admin/engineers`, `/admin/clients`, `/admin/revenue`, `/admin/payments`, `/admin/support`, `/admin/content`, `/admin/users`, `/admin/audit`, `/admin/notifications`, `/admin/profile`, and `/admin/settings` revamps. Use it when decomposing future admin pages out of the shared scaffold and when adapting the same discipline to client and developer pages.

## Purpose

The first admin scaffold used `AdminWorkspacePage` to prove shell, CRUD, drawer, chart, relationship, and support patterns quickly. That shared engine remains useful, but production pages should become purpose-built workspaces.

A decomposed admin page should:

- Represent one operational job clearly.
- Avoid repeating the same values across every card.
- Keep data actionable: SLA, owner, next action, risk, stage, relationship, and latest movement.
- Expose explicit CRUD shape: create/intake, inspect, edit/update, domain action, and archive/void/remove confirmation.
- Use shared primitives for shell consistency.
- Own its local interaction model until backend mutations replace mock state.
- Prefer full-width queues with grid/list switching, pagination, and modalized command actions when a sticky side rail makes cards cramped.
- Treat observability cards as real panels: compact header metrics, dedicated full-height chart wells, and distinct status colors.
- Carry the current typography hierarchy through `dashboard-typography`: serif page titles, serif major section titles, Outfit for dense operational UI, and mono only for structured values.
- Reuse `AdminWorkflowNav` for the operations handoff path: Briefs -> Shortlists -> Pipeline -> Placements. It should wrap on mobile, never force a horizontal scrollbar, and match the sidebar order.

## Current Reference Pages

`/admin/briefs` is the reference queue implementation for demand intake, qualification, and clean progression into shortlist and placement workspaces.
`/admin/briefs/shortlist` is the reference curation implementation for fit observability and candidate slates.
`/admin/matches` is the reference talent pipeline implementation for stage movement, conversion observability, intro scheduling, and talent-manager command actions.
`/admin/placements` is the reference delivery implementation for ongoing work, billing, renewal risk, and stakeholder actions.
`/admin/placements/timeline` is the reference weekly approval implementation for timesheets, billable hours, and placement activity review.
`/admin/engineers` is the reference talent-network implementation for availability, vetting, profile quality, domain capacity, and supply readiness.
`/admin/clients` is the reference account-network implementation for account health, stakeholders, briefs, billing posture, and expansion or recovery motion.
`/admin/revenue` is the reference CFO boardroom implementation for revenue forecast, recognition posture, client billings, developer payout liability, Andishi spread, reserves, and role-scoped commercial visibility.
`/admin/payments` is the reference payment-operations implementation for invoices, collections, payout release, settlement lanes, and role-safe payment execution.
`/admin/support` is the reference resolver implementation for stakeholder conversations, SLA risk, client/developer/project context, and cross-role escalation control.
`/admin/content` is the reference proof-operations implementation for marketing truth, case-study assets, developer/client proof signals, publishing workflow, and quality observability.
`/admin/users` is the reference identity-governance implementation for user invites, role assignment, verification, disabling, access review, and auth-intake operations.
`/admin/audit` is the reference governance-ledger implementation for audit reports, commercial boundary evidence, identity changes, role-safe visibility, exports, schedules, and exception review.
`/admin/notifications` is the reference notification-command implementation for admin alert routing, operational signal triage, delivery channels, owner movement, and alert-ledger review.
`/admin/profile` is the reference admin-identity implementation for operator profile, security sessions, escalation routes, notification preferences, and privileged access posture.
`/admin/settings` is the reference control-plane implementation for RBAC, auth intake, integrations, audit controls, and role-safe policy boundaries.

Implemented file:

- `src/components/dashboard/admin/admin-briefs-page.tsx`
- `src/components/dashboard/admin/admin-shortlists-page.tsx`
- `src/components/dashboard/admin/admin-pipeline-page.tsx`
- `src/components/dashboard/admin/admin-placements-page.tsx`
- `src/components/dashboard/admin/admin-placement-timeline-page.tsx`
- `src/components/dashboard/admin/admin-engineers-page.tsx`
- `src/components/dashboard/admin/admin-clients-page.tsx`
- `src/components/dashboard/admin/admin-revenue-page.tsx`
- `src/components/dashboard/admin/admin-payments-page.tsx`
- `src/components/dashboard/admin/admin-support-page.tsx`
- `src/components/dashboard/admin/admin-content-page.tsx`
- `src/components/dashboard/admin/admin-users-page.tsx`
- `src/components/dashboard/admin/admin-audit-page.tsx`
- `src/components/dashboard/admin/admin-notifications-page.tsx`
- `src/components/dashboard/admin/admin-profile-page.tsx`
- `src/components/dashboard/admin/admin-settings-page.tsx`

Route wrapper:

- `src/app/(app)/admin/briefs/page.tsx`
- `src/app/(app)/admin/briefs/shortlist/page.tsx`
- `src/app/(app)/admin/matches/page.tsx`
- `src/app/(app)/admin/placements/page.tsx`
- `src/app/(app)/admin/placements/timeline/page.tsx`
- `src/app/(app)/admin/engineers/page.tsx`
- `src/app/(app)/admin/clients/page.tsx`
- `src/app/(app)/admin/revenue/page.tsx`
- `src/app/(app)/admin/payments/page.tsx`
- `src/app/(app)/admin/support/page.tsx`
- `src/app/(app)/admin/content/page.tsx`
- `src/app/(app)/admin/users/page.tsx`
- `src/app/(app)/admin/audit/page.tsx`
- `src/app/(app)/admin/notifications/page.tsx`
- `src/app/(app)/admin/profile/page.tsx`
- `src/app/(app)/admin/settings/page.tsx`

Shared primitives used:

- `AdminWorkflowNav`
- `DashboardPageHeader`
- `KpiCard`
- `StatusBadge`
- `EntityDrawer`
- `ConfirmDialog`
- `DashboardLineChart`
- `DashboardBarChart`
- `DashboardDonutChart`
- `SectionDivider`

## Page Structure

The briefs page follows this sequence:

1. Page header with role-specific action buttons.
2. KPI row focused on brief health, not generic platform metrics.
3. Demand queue section with search, stage filter, sort, grid/list switcher, pagination, and stage strip.
4. Modalized brief command surface for selected brief context, note editing, shortlist preparation, detail opening, archive, and stage advancement.
5. Shared workflow nav that links to `/admin/briefs/shortlist`, `/admin/matches`, and `/admin/placements` without mutating briefs into placement/project records.
6. Analytics section with refined observability cards, compact metric pills, full-height chart wells, and line, bar, and donut chart types.
7. Create modal, detail drawer, and archive confirmation.

The brief boundary adds:

1. A four-stage brief queue: submitted, under review, matching, and shortlisted.
2. Brief-only actions for qualification, note capture, SLA handling, archive, and shortlist preparation.
3. Candidate recommendations as signals for the shortlist workspace, not placement creation.
4. Backend alignment through brief CRUD only; confirmed placement and project delivery are owned by their dedicated routes.

The updated brief queue pattern adds:

1. Grid/list mode parity with placements: grid for scan density, list for wide-screen operational review.
2. Card layout that avoids nested mini dashboards; use a title/status header, metadata row, three hard metrics, progress bars, owner/budget/next-action row, description, tags, and icon actions.
3. Pagination at the queue boundary, resetting to page 1 whenever search, stage, or sort changes.
4. Command modal for focused brief decisions; use the drawer only for deep entity inspection.
5. Stage color mapping with distinct tones for submitted, under review, matching, and shortlisted states.
6. Chart cards with fixed header rhythm and a dedicated chart well so Recharts components use the available vertical space.

The shortlist page adds:

1. Talent-slate workspace for curation, client signal, and handoff discipline.
2. Briefs -> Shortlists -> Pipeline -> Placements handoff ribbon so talent managers see the natural progression without blending page ownership.
3. Slate flight path stage filter with active filter state, count, portfolio percentage, and progression copy for draft, sent, client-reviewing, and decided slates.
4. Client slate selector with search, status, sort, and natural page scrolling on mobile and standard desktop widths.
5. List-only developer cards that show enough fit signal to scan quickly while pushing the full decision matrix into a profile modal. Do not add a grid/list switcher when the grid view creates duplicated density without a different decision path.
6. Developer decision modal for client-viewed, intro-requested, and accepted progression.
7. Command modal at normal desktop widths, reserving sticky command rails for truly wide canvases where the shell leaves enough working width.
8. Send-shortlist package modal with response deadline and client-facing note.
9. Compact fit observability and client engagement panels paired in one row when shell-adjusted width allows it.
10. Add-engineer modal, remove confirmation, and refined analytics cards with full-height wells, taller chart renders, and restrained color semantics.

The pipeline page adds:

1. Talent-manager command surface for briefs moving from intake to confirmed placement.
2. Five-stage Kanban board with stage counts, SLA context, conversion signals, monthly value, candidate avatars, and next actions.
3. Board filters for search, stage, card status, and priority.
4. Shared workflow nav that makes Briefs -> Shortlists -> Pipeline -> Placements explicit in the page and in sidebar order.
5. Full-width observability section for stage distribution and velocity charts, followed by a separate full-width command context section so large screens do not create dead space under charts.
6. Command rail for the selected pipeline item with value, owner, stage age, operator signal, scheduling, risk, priority, archive, placement handoff, and advance actions.
7. Create-pipeline-item modal, intro-scheduling modal, detail modal, archive confirmation, and data matrix table.

The operations workflow nav pattern adds:

1. Use `AdminWorkflowNav` on `/admin/briefs`, `/admin/briefs/shortlist`, `/admin/matches`, and `/admin/placements`.
2. Keep the order consistent everywhere: Briefs, Shortlists, Pipeline, Placements.
3. Keep page-local child navs only where they represent a sub-workspace, such as Placements active work vs Timeline.
4. On mobile, wrap workflow items into rows instead of relying on horizontal scrolling.
5. Keep the workflow nav as wayfinding only. Do not add summary stat pills here; KPI rows and page cards own those metrics.

The network nav pattern adds:

1. Use `AdminNetworkNav` on `/admin/engineers` and `/admin/clients`.
2. Keep the nav focused on the relationship between talent supply and account demand, not on duplicated stats.
3. The nav should wrap on mobile and preserve the same compact pill language as the operations workflow nav.
4. Use focused modals for mutable network decisions such as engineer profile edits and vetting evidence updates; reserve drawers for deep inspection.
5. Network queues must be pagination-ready. Render the active page slice for cards and companion matrices, reset to page 1 on filter/sort/view changes, and expose page-size controls for large talent/account datasets.

The placement operations pages now add:

1. Active placements preserve the stronger developer-card design while moving selected detail into modal and command surfaces where small screens would clip.
2. Placement timeline uses denser approval cards, clearer weekly command context, and compact metric tiles that avoid empty white space.
3. Both pages share the same compact metric-card rhythm: icon, value, detail, and progress rail rather than tall empty tiles.

The placements page adds:

1. Delivery-focused header with health check and create placement actions.
2. Portfolio KPIs for active work, health, watchlist, hours, and billed revenue.
3. Shared placements workspace switcher for moving between active work and timeline review without losing context.
4. Filterable/searchable placement roster with grid/list modes and stronger large-screen placement cards.
5. Desktop sticky detail rail and mobile drawer for selected placement.
6. Delivery, communication, billing, milestone, and hours observability.
7. Create placement modal, stakeholder message modal, invoice action, pause/resume action, and terminate confirmation.
8. Placement matrix table for cross-placement comparison.

The placement timeline page adds:

1. Weekly timesheet command surface nested under placements.
2. Shared placements workspace switcher with pending, approved, and billable context.
3. Total, pending, approved, billable, and engineer-count metrics.
4. Working week navigator, daily hours chart, and per-day pending signals.
5. Sticky approval queue with approve/dispute actions.
6. Engineer-level hours breakdown and billable distribution.
7. Filterable timeline entries with row selection, bulk approval, detail drawer, and manual entry modal.
8. Timesheet matrix for cross-checking engineer, client, date, hours, billable state, and approval state.

The engineers page adds:

1. Talent-network command surface focused on senior supply readiness, not generic user administration.
2. KPI row for network supply, readiness, availability, blended admin rate, and evidence coverage.
3. Talent intelligence room for the selected engineer with shortlist narrative, evidence pack, compensation boundary, payout target, and client-fit proof.
4. Domain capacity map that exposes available, vetting, and placed supply by specialization.
5. Filterable/searchable engineer queue with grid/list modes, readiness rings, vetting status, profile quality, evidence signals, and compensation abstraction.
6. Paginated engineer directory with page-size controls so the page can scale to hundreds or thousands of records without rendering the full filtered set.
7. Sticky command panel for selected engineer with vetting checklist, availability, owner, profile state, proof pack, and next network move.
8. Invite engineer modal, profile edit modal, vetting evidence modal, note editing, lifecycle advancement, detail drawer, archive confirmation, and current-page engineer matrix table.

The clients page adds:

1. Account-network command surface for account health, stakeholder coverage, briefs, billing posture, margin-safe visibility, and expansion or recovery motion.
2. KPI row for portfolio count, account health, brief load, MRR exposure, and protected spread signal.
3. Paginated account queue before selected-account detail so relationship cards establish context before the command room opens.
4. Portfolio pressure map with lifecycle distribution and top account cards by revenue exposure.
5. Filterable/searchable client queue with grid/list modes, stakeholder context, billing posture, risk actions, account promise, and health indicators.
6. Sticky command panel for selected account with stakeholder map, visibility policy, next account move, billing/brief context, and risk state.
7. Account command room for the selected client with account promise, decision health, next milestone, commercial abstraction, and role-safe visibility.
8. Add client modal, profile edit modal, stakeholder-map modal, stakeholder message modal, note editing, lifecycle advancement, risk recovery, detail drawer, archive confirmation, and current-page client matrix table.

The revenue page adds:

1. CFO-style boardroom surface for revenue forecast, recognition posture, margin thesis, reserves, and collection risk.
2. Explicit commercial abstraction model: admin sees full economics, clients see invoice/project value only, developers see approved payout only.
3. KPI row for client billings, payout liability, retained spread, and collection risk.
4. Strategy room for the selected commercial record with forecast posture, recognition policy, margin ring, cash policy, and role visibility.
5. Revenue waterfall, model-mix forecast, margin bands, cash conversion, and finance status charts.
6. Filterable/searchable commercial execution queue with margin rings, risk badges, role visibility strips, and finance action buttons.
7. Sticky command panel for selected finance record with margin policy, role-safe visibility, next finance move, collection escalation, and reconciliation actions.
8. Draft commercial record modal, finance note modal, internal note editing, status advancement, detail drawer, archive confirmation, and commercial abstraction matrix.

The payments page adds:

1. Payment-operations command surface for invoice issue, collection, payout release, and settlement execution.
2. KPI row for receivables, payout hold, ready-to-settle value, blocked payouts, and settlement score.
3. Settlement desk for the selected invoice with client bill, developer payout, aging, rail, settlement policy, and role-safe payment boundaries.
4. Lane-based invoice-to-payout flow: issue, collect, release, and settle.
5. Filterable/searchable payment ledger with invoice state, collection risk, payout state, owner, and role-safe settlement policy.
6. Payment note modal, create-invoice modal, payment detail drawer, escalation flow, status advancement, archive confirmation, and payment execution matrix.

The support page adds:

1. Resolver command surface for client, developer, billing, payout, project, and internal support cases.
2. KPI row for open load, SLA pressure, escalations, and resolved work.
3. Support intelligence map with SLA trend, topic load, source mix, and priority distribution.
4. Filterable/searchable resolver queue with grid/list modes, priority badges, source markers, and SLA context.
5. Sticky command panel for selected case with cross-role context, next resolver action, latest messages, and safe escalation/resolve actions.
6. Create case modal, edit resolver-plan modal, reply modal, status advancement, detail drawer, archive confirmation, and support resolver matrix.
7. Role-aware case language that lets admin coordinate between client and developer without exposing private commercial terms.

The content page adds:

1. Proof-operations command surface that ties marketing pages back to actual clients, developers, outcomes, and publishing cadence.
2. KPI row for scheduled assets, proof quality, refresh risk, and conversion lift.
3. Marketing truth pipeline with impact trend, content type mix, audience mix, and quality bands.
4. Filterable/searchable content queue with grid/list modes, proof signals, linked client/developer context, and publish targets.
5. Sticky command panel for selected asset with quality score, truth source, next content action, and publishing controls.
6. Create proof asset modal, proof editor modal, lifecycle advancement, detail drawer, archive confirmation, and content operations matrix.

The users page adds:

1. Identity-governance command surface for admin, client, and developer accounts.
2. KPI row for total users, verified email, privileged admin accounts, pending invites, and access-review load.
3. Access safety map with active, invited, disabled, role scope, and workspace-boundary signals.
4. Filterable/searchable user registry with role, status, risk, verification, MFA, owner, and visible scope.
5. Invite user modal, access editor modal, verify action, resend invite action, disable/restore action, detail drawer, archive confirmation, and user access matrix.

The settings page adds:

1. Admin control-plane command surface for RBAC, integrations, policy, audit controls, and platform safety configuration.
2. KPI row for healthy controls, reviews due, locked policy boundaries, and auth intake volume.
3. Governance observability with control health trend, area distribution, status mix, and auth intake stream.
4. Filterable/searchable control registry with grid/list modes, owner, risk, visibility boundaries, and latest changes.
5. Sticky command panel for selected control with policy summary, role visibility, risk posture, and lock/review actions.
6. Create control modal, policy editor modal, lifecycle advancement, detail drawer, archive confirmation, and governance matrix.
7. Auth-intake preservation from the existing server utility so settings remains tied to onboarding and access requests.

## Functional Expectations

Every decomposed admin page should implement at least:

- Create or primary action flow.
- Inspect/detail drawer.
- Edit/update flow for the core operational record. Status advancement alone is not enough when the page owns mutable business data.
- Safe destructive action confirmation.
- Status or stage transition where relevant.
- Search/filter/sort where the page is queue-like.
- Empty state for filtered results.
- Local state that mirrors future backend mutation shape.
- Clear relation context when client/developer/admin/project entities intersect.

## Data Rules

Do not scatter mock data randomly inside several components.

Acceptable during mock phase:

- Page-specific seed records inside the page component when they describe page behavior.
- Centralized shared seed entities from `src/data/dashboard-mock.ts`.
- Derived page state that simulates backend mutations.

Required before persistence handoff:

- Extract page data builders into `src/lib/dashboard/admin/*` or server data utilities.
- Replace local state mutations with server actions or API mutations.
- Preserve the UI state model: optimistic local updates, drawer refresh, confirmation flow, and error states.

## Visual Rules

Use the refreshed admin overview as baseline:

- Breathable section rhythm: `gap-8 pb-16 md:gap-9 lg:gap-10` for dense operational pages, expanding only when the page uses open editorial panels.
- Major data cards offset from section headers by `my-8` or `mt-6`.
- Section headings outside dense cards where possible.
- Stable chart/card heights.
- No tiny operational text.
- Dashboard page titles should use `DashboardPageHeader` with `.title-serif`, `font-medium`, and a restrained clamp around `1.7rem` to `2.2rem`.
- Major page section headings should use `.title-serif` with a clamp around `1.32rem` to `1.62rem`; card titles and table labels should generally remain Outfit unless they are selected-record/entity titles.
- No nested decorative cards.
- Delay major split layouts until the actual shell-adjusted content width can carry them. `xl` alone is not enough when the dashboard sidebar and top shell consume meaningful width.
- Prefer modalized command/detail surfaces over cramped side rails on normal laptop and large-desktop dashboards; reserve sticky rails for truly wide canvases.
- Queue/sidebar lists should not use internal scroll cages on mobile, tablet, or standard desktop widths. Let the page scroll naturally unless an ultra-wide sticky layout needs a bounded rail.
- Segmented controls need explicit light/dark contrast for both active and inactive states; do not rely on subtle token inversion when the control sits on dark glass.
- Avoid overusing cyan/secondary as the only signal. Use `var(--primary)` for neutral operational emphasis, `var(--tertiary)` for healthy/complete states, `var(--error)` for risk, and reserve `var(--secondary)` for selected command/navigation emphasis or explicit matching signals.
- Fix whitespace by strengthening existing data surfaces before adding a new repeated card. If a row feels empty, prefer a better status strip, table, or observability panel over duplicating the selected record summary.
- Use visual separators sparingly. Prefer section spacing, grouped controls, and surface contrast; avoid stacking full-width horizontal dividers between every block.
- Dashboard page titles should be inherited from `DashboardPageHeader` and the shell-level `dashboard-typography` class.
- Major dashboard section titles should use the current `clamp(1.48rem,2vw,1.9rem)` range or the shared dashboard heading primitives.
- Eyebrows should remain visibly subordinate to serif titles; do not let all-caps labels or body copy appear larger than the title they introduce.

## What Not To Do

- Do not keep adding unrelated logic to `AdminWorkspacePage`.
- Do not duplicate the same count in the page header, KPI, right rail, and table unless each instance adds a different decision.
- Do not build a visual-only card when it does not support an action, risk, status, or decision.
- Do not introduce page-specific color systems. Use theme tokens.
- Do not use `font-bold` or `font-semibold`.

## Next Admin Pages

The current admin sidebar pages in this revamp set have standalone workspaces. Next production work should focus on:

1. Extracting mock data builders and business rules into server-side dashboard utilities.
2. Replacing local mutations with server actions or API mutations.
3. Reusing role-safe commercial and visibility policies in client and developer dashboards.

## Role Transfer

Client and developer pages should reuse the same decomposition discipline, not the same admin UI.

Client pages should emphasize:

- Confidence, clarity, and next step.
- Brief status, profiles, intro requests, project milestones, billing, and support.
- Client-safe actions only: approve, request, schedule, comment, upload, confirm.

Developer pages should emphasize:

- Workbench clarity, profile quality, projects, time, earnings, support, and communication.
- Developer-owned actions only: update profile, submit time, respond, upload, request support.

The shared lesson is structural: page-specific workspace, real next actions, readable charts/tables, and consistent shell primitives.
