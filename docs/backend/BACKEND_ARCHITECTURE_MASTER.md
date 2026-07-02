# Andishi v3 — Backend Architecture Master

**Version**: 1.0 (initial)
**Date**: July 1, 2026
**Status**: Source of truth for the **backend / ERP** phase.
**Owner roles**: Senior Backend Engineer (build) + Senior DevOps/Product (integration, observability, sequencing).
**Scope**: Server-side data model, RBAC, service layer, API contracts, ERP domain modules, CMS/CRM, careers/talent-supply, finance ledger, observability, and phased delivery.

> Relationship to existing docs
> - `docs/DASHBOARD_MASTER_IMPLEMENTATION.md` governs **dashboard UI/UX**. This document governs the **backend that powers it**. Where they overlap (entities, RBAC), this document is authoritative for server-side behaviour.
> - `docs/backend/adr/*` holds the individual **Architecture Decision Records**. Read those for the "why" behind each choice summarised here.

---

## Part 0 — How to read this document

The pivot (talent-placement-first → software-studio + talent-supply) means the backend must grow from a **marketplace** into a **multi-module internal ERP** that also powers the public site's CMS. The admin dashboard is the operating system for the whole company: delivery, finance, CRM/sales, marketing, content, talent supply (freelance + internal recruitment + third-party outsourcing), and support.

The public frontend is **pivot-accurate** and is treated as a requirements source. Anywhere the current backend lags the frontend (careers, CMS-backed blog/work, lead capture, studio positioning), the frontend wins and the backend is built to serve it.

---

## Part 1 — Current-state assessment (ground truth, July 1 2026)

### 1.1 What exists and is production-grade (keep)

| Area | State |
|------|-------|
| Runtime | Next.js 16 App Router, React 19, TypeScript 5, Node/Neon serverless |
| ORM/DB | Drizzle ORM + Neon Postgres; migrations via `drizzle-kit generate` → `src/db/migrations` |
| Auth | JWT-in-DB sessions (`sessions` table), bcrypt, Google OAuth, email verification tokens, idempotent seed admin |
| Route protection | Server-side guards in `src/lib/auth/session.ts`: `requireSession`, `requireRole`, `getRoleForPath`, `getSafeRedirectForRole` |
| Validation | Zod schemas in `src/lib/validation/*`; shared `jsonError` / `validationError` helpers |
| Activity feed | `activity_events` table + consistent write pattern in mutating routes |
| Existing tables (13) | `users, organizations, engineers, briefs (build\|hire), matches, placements, projects, timesheets, invoices, activity_events, sessions, tokens` |
| API routes (~28) | `auth/*, users, engineers, organizations, briefs, matches, placements, projects, timesheets, invoices, activity, work, contact, general-inquiry, upload` |

### 1.2 Gaps / bottlenecks (the work)

| # | Gap | Consequence |
|---|-----|-------------|
| G1 | **Coarse RBAC** — 3 roles only, enforced by inline `session.user.role === "admin"` in ~28 routes. No permissions, admin sub-roles, or team/department scoping. | Cannot express finance-only, PM-only, recruiter-only staff. Blocks ERP. |
| G2 | **No service/domain layer** — business logic in route handlers; no shared transactional workflows. | Multi-table transitions (accept match → placement → project → billing schedule) are non-atomic and non-reusable. |
| G3 | **Finance is a stub** — only `invoices`; no bill/pay **rates**, expenses, payouts, ledger, revenue recognition, margin, budgets. | Revenue and margin cannot be computed at all. |
| G4 | **CRM/Sales absent** — `/contact`, `/general-inquiry`, `/start-project`, `/hire`, and the homepage newsletter form only email or hold local state, none persist. No leads, deals, proposals, source attribution. | Entire top-of-funnel — including a fully-built-but-unwired newsletter signup — is invisible to the business. |
| G5 | **PM is shallow** — milestones are a JSONB blob on `projects`; no tasks, sprints, dependencies, capacity/allocation. | Cannot run delivery ops. **(First module to build.)** |
| G6 | **No CMS, and existing content is triplicated** — blog, skills, and especially services (split across `content/landing.ts` + `data/services.ts`, joined at render) and case studies (split across `content/landing.ts`, `data/projects.ts`, and the `projects` table's own public fields) all describe the same entities from multiple hardcoded sources. | No admin CRUD; editors must ship code to publish; content sources can drift out of sync with each other. |
| G7 | **Careers/talent-supply missing** — freelance projects, internal recruitment, third-party outsourcing exist only as marketing copy. | No pipeline, no jobs, no applications. |
| G11 | **No testimonials/reviews model** — confirmed absent from DB, `src/data/*`, and every component (full-codebase check). A homepage testimonials marquee is planned next (replacing the `BlogTicker` topic strip between the Founder and Blog sections). | Needs a `testimonials` table + admin CRUD before that UI can be data-driven. |
| G12 | **Homepage stats are hardcoded, not computed** — "50+ engineers placed", "8 days avg match speed", "32+ products shipped" (`TalentTrack`, `ServicesMarquee`) are copy, not queries. | Once real placement/project data exists, these numbers will silently drift from reality unless replaced by a live metrics endpoint. |
| G8 | **No true audit log** — `activity_events` is a user-facing feed, not an immutable actor/delta/IP trail. | Compliance & accountability gap. |
| G9 | **Platform hygiene** — no Drizzle relations, likely missing indexes on hot filters (`organizationId`, `status`, `briefType`, `engineerId`), no background jobs, no notifications table, no persisted settings, no rate limiting/idempotency, no error tracking (Sentry). | Performance, reliability, and operability gaps. |
| G10 | **Admin UI still mock-backed** via `src/data/dashboard-mock.ts` (revenue, payments, support, audit, settings). | UI exists; persistence does not. |

---

## Part 2 — Architecture principles

1. **Layered, not fat routes.** `route handler → service (domain logic) → repository (data access) → Drizzle/Neon`. Routes only do auth, parse/validate, call a service, and shape the response.
2. **Authorize on capability, not role string.** Every protected action checks a **permission** (+ scope), resolved from the user's roles. Role strings never appear in business logic.
3. **Transactional workflows.** Any state change spanning >1 table runs inside a DB transaction and emits both an **audit record** (immutable) and, where user-visible, an **activity event**.
4. **The frontend is the requirements contract.** CMS/CRM/careers models are derived from what the public and dashboard pages need.
5. **Provider-agnostic money.** Finance is an internal ledger with rates and integer-minor-unit amounts; Stripe/Wise plug in later without reshaping the model.
6. **Observable by default.** Sentry, structured logging, request IDs, and health checks are part of "done," not an afterthought.
7. **Migrations are the only way to change the DB.** No manual schema edits; every change is a generated, reviewed, committed migration.
8. **Backwards-safe.** New columns are nullable or defaulted; enums are extended, not repurposed; existing routes keep working while the layer is introduced behind them.
9. **Serverless-native infrastructure only.** Every piece of infra (DB driver, cache, rate limiter) must work as stateless serverless functions with no persistent connections - see ADR-0002's driver swap and ADR-0008's Upstash choice for why this isn't optional.
10. **Stay unified until a real trigger fires.** One Next.js codebase for frontend + API, deliberately, until a concrete condition (second consumer, non-serverless workload, dedicated backend team, proven platform limit) makes a separate backend service worth its cost - see [ADR-0010](adr/ADR-0010-monolith-vs-separated-backend.md). The service layer is already structured so that split would be an extraction, not a rewrite, if/when it happens.

---

## Part 3 — Layered architecture

```
src/
├── app/api/**/route.ts        ← HTTP boundary: authn, parse, validate, call service, format
├── lib/
│   ├── auth/                  ← session, permission resolution, guards (EXTEND)
│   ├── authz/                 ← NEW: permission catalog, can(), scope resolution
│   ├── services/              ← NEW: domain logic, one module per folder (transactional)
│   ├── repositories/          ← NEW: typed data-access helpers per aggregate (optional thin)
│   ├── validation/            ← Zod input schemas (EXTEND per module)
│   ├── jobs/                  ← NEW: background/scheduled tasks (invoice runs, SLA sweeps)
│   ├── observability/         ← NEW: Sentry init, logger, request context
│   └── api/                   ← response helpers (EXTEND: pagination, error envelope)
└── db/
    ├── schema/                ← Drizzle tables, one file per aggregate (EXTEND heavily)
    ├── relations.ts           ← NEW: Drizzle relations for relational queries
    └── migrations/            ← generated SQL (append-only)
```

### 3.1 Service layer contract

- A service function is the **only** place a workflow is defined. Example: `delivery.createTaskFromMilestone`, `finance.generateInvoiceForPeriod`, `talent.advanceApplicationStage`.
- Services accept a **caller context** `{ user, permissions, scope }` and typed input, and return typed results or a typed domain error.
- Services own **transactions**: `await db.transaction(async (tx) => { ... })`.
- Services emit **audit** + **activity** + **notification** side effects through shared helpers, never ad-hoc.

### 3.2 Standard error envelope

All API errors return `{ error: string, field?: string, code?: string }` with correct HTTP status. Domain errors map to codes (`FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `VALIDATION`, `RATE_LIMITED`). Unexpected errors are caught, logged to Sentry with a request ID, and returned as `500 { error, code: "INTERNAL", requestId }`.

---

## Part 4 — RBAC & permissions model (ADR-0001)

**Decision**: DB-driven permission-based RBAC with composable custom roles and scoping. Supersedes the 3-role string model for authorization (the `users.role` column remains as a coarse "primary persona" + redirect hint, but is not the authorization source of truth for admin capabilities).

### 4.1 Tables

```
permissions        (id, key, description, module)          -- seeded catalog, e.g. "delivery.task.write"
roles              (id, name, slug, description, is_system, scope_type)  -- scope_type: "global"|"team"|"self"
role_permissions   (role_id, permission_id)                -- M:N
user_roles         (user_id, role_id, scope_id?)           -- scope_id: team/department/org when scoped
teams              (id, name, slug, kind)                  -- kind: "delivery"|"finance"|"sales"|"marketing"|"talent_ops"|"support"
team_members       (team_id, user_id, title)
```

- `users.role` keeps values `admin | client | developer` for **route-group routing** only (`/admin`, `/dashboard`, `/dev`).
- Fine-grained staff capability comes from `user_roles` → `roles` → `permissions`.
- **System roles** (seeded, non-deletable): `super_admin` (all permissions), `sales_manager`, `finance_manager`, `delivery_pm`, `recruiter`, `marketer`, `content_editor`, `support_agent`. Each also carries a small set of justified cross-module read permissions for real business handoffs (e.g. finance reads approved delivery time to invoice it) - see [ADR-0007](adr/ADR-0007-role-interconnections.md). Admins can create custom roles from the permission catalog.

### 4.2 Permission catalog (naming)

`<module>.<resource>.<action>` — actions: `read | write | delete | approve | export`.
Modules: `identity, crm, delivery, finance, talent, careers, marketing, cms, support, platform`.
Examples: `finance.invoice.approve`, `delivery.task.write`, `cms.blog.write`, `talent.engineer.verify`, `careers.application.read`.

### 4.3 Enforcement

- `lib/authz/can(user, permission, resource?)` resolves the user's permission set (cached per request) and evaluates scope (global / team / self / owning-org).
- API guard helper: `await authorize(session, "delivery.task.write", { teamId })` → throws `ForbiddenError` (mapped to 403) otherwise.
- **Client/developer** external users keep resource-ownership rules (an org sees only its own briefs/projects/invoices; a developer sees only their own work) — expressed as `self`/`owning-org` scopes, not special-cased in each route.
- Authorization is enforced in the **service layer** (so jobs and admin actions share it), with a thin re-check at the route boundary.

### 4.4 Audit

Every `write/delete/approve` goes through `lib/authz` and writes an immutable `audit_log` row (see Part 6.9).

---

## Part 5 — ERP domain module map

Ten modules. Each has: owning team(s), permission namespace, tables, key services, and public/admin surfaces.

| Module | Purpose | Primary team | Public surface |
|--------|---------|--------------|----------------|
| **Identity & Access** | Users, roles, permissions, teams, sessions | super_admin | login/register |
| **CRM / Sales** | Leads → deals → proposals; source attribution; briefs as intake | sales_manager | `/contact`, `/start-project`, `/hire` |
| **Delivery / PM** ⭐ | Projects, tasks, sprints, milestones, allocation, timesheets | delivery_pm | client/dev dashboards |
| **Finance** | Rates, ledger, invoices, expenses, payouts, revenue/margin, budgets | finance_manager | client `/payments`, dev `/earnings` |
| **Talent / People Ops** | Engineer profiles, skills taxonomy, vetting, availability, matching, placements | recruiter | `/engineers`, `/skills` |
| **Careers / Talent Supply** | Freelance projects, internal recruitment, third-party outsourcing | recruiter | `/careers` (new) |
| **Marketing** | Campaigns, newsletter, attribution, SEO/analytics ingestion | marketer | site-wide |
| **CMS** | Blog, work/case studies, services, skills, static pages | content_editor | `/blog`, `/work`, `/services`, `/skills` |
| **Support** | Cases, threads, resolver queue | support_agent | dashboard support chat |
| ↳ delivery mechanism | Polling first (15-20s notifications, 5-8s active chat), managed realtime or SSE only if proven necessary | — | see [ADR-0009](adr/ADR-0009-messaging-delivery-strategy.md) |
| **Platform** | Settings, integrations, notifications, audit, jobs | super_admin | `/admin/settings` |

⭐ = first build module.

System roles: `super_admin, sales_manager, finance_manager, delivery_pm, recruiter, marketer, content_editor, support_agent` (ADR-0001). Matching/placement moved from delivery_pm to recruiter's ownership after the end-to-end interconnection review - see [ADR-0007](adr/ADR-0007-role-interconnections.md) for the full flow map, the cross-module read grants each role carries and why, and the activity-feed visibility model that enforces the same boundaries outside the API layer.

---

## Part 6 — Data model (new & extended tables)

Conventions: `id uuid pk default random`, `created_at/updated_at timestamptz`, money as `*_cents integer` + `currency text`, soft references via uuid + explicit FKs, JSONB only for genuinely schemaless data. **Add indexes** on every FK and on hot filter columns.

### 6.1 Delivery / PM (build FIRST) ✅ implemented July 1, 2026

```
projects            (EXTEND) + health text, budget_cents int, billing_type text('fixed'|'time_and_materials'|'retainer'),
                              lead_pm_user_id uuid, code text unique
milestones          (PROMOTE from jsonb → table): id, project_id, title, description, status(enum), due_date,
                              amount_cents int?, submitted_at, approved_at, order int
tasks               id, project_id, milestone_id?, title, description, status(enum:'todo'|'in_progress'|'in_review'|'done'|'blocked'),
                              assignee_engineer_id?, reporter_user_id, priority(enum), estimate_minutes int?,
                              due_date, sprint_id?, parent_task_id?, order int
task_dependencies   task_id, depends_on_task_id
sprints             id, project_id, name, goal, start_date, end_date, status(enum)
allocations         id, engineer_id, project_id, week_start date, planned_minutes int, note   -- capacity planning
timesheet_entries   (EXTEND) + task_id?, invoice_id? (link logged time → billing)
```

Key services: `createProject`, `promoteBriefToProject`, `addTask`, `moveTask`, `openSprint/closeSprint`, `logTime`, `submitMilestone/approveMilestone`, `computeProjectHealth`.

Implemented in `src/lib/services/delivery/`: `access.ts` (shared project-ownership scoping reused by every delivery service), `health.ts` (`computeProjectHealth`/`recomputeProjectHealth` - off_track on any blocked task or overdue unapproved milestone, at_risk on any overdue incomplete task, recomputed after task status changes and milestone approval), `milestones.ts`, `tasks.ts`, `sprints.ts` (enforces one active sprint per project), `allocations.ts`, `timesheets.ts` (full draft→submitted→approved/rejected lifecycle, migrated off the old ungated route). `promoteBriefToProject` is **not yet implemented** - `projects.briefId` and the schema support it, but the actual promotion workflow is deferred to when CRM (P3) creates real briefs to promote from.

### 6.2 Finance (ledger — ADR-0003)

```
rate_cards          id, subject_type('engineer'|'client'|'org'), subject_id, kind('bill'|'pay'),
                              amount_cents int, unit('hour'|'day'|'month'|'project'), currency, effective_from, effective_to?
ledger_accounts     id, code, name, type('asset'|'liability'|'revenue'|'expense'|'equity')
ledger_entries      id, txn_id, account_id, direction('debit'|'credit'), amount_cents, currency, memo, occurred_at
ledger_transactions id, kind('invoice'|'payout'|'expense'|'adjustment'), reference_type, reference_id, description, posted_at
invoices            (EXTEND) + subtotal_cents, tax_cents, line source = generated from timesheets/milestones
invoice_line_items  id, invoice_id, description, quantity, unit_amount_cents, amount_cents, source_type, source_id
expenses            id, org_id?, project_id?, category, amount_cents, currency, incurred_on, status(enum), receipt_url, entered_by
payouts             id, engineer_id, period_start, period_end, amount_cents, currency, status(enum), method, reference,
                              paid_at, ledger_transaction_id?
budgets             id, scope_type('org'|'project'|'department'), scope_id, period, amount_cents, currency
```

Derived views/services: revenue (sum bill), cost (sum pay + expenses + payouts), **margin = revenue − cost**, MTD/YTD, outstanding AR, DSO. Provider fields (`stripe_*`, `wise_*`) are added but null until integration.

### 6.3 CRM / Sales

```
leads               id, source(enum:'contact'|'start_project'|'hire'|'referral'|'campaign'|'manual'|'newsletter'), name, email, company,
                              phone, message, intended_track(enum:'build'|'hire'), service_type?, brief_type?, utm jsonb,
                              status(enum:'new'|'qualified'|'nurturing'|'won'|'lost'), owner_user_id?, org_id?, created_at
deals               id, lead_id?, org_id?, title, value_cents, currency, stage(enum), probability int, expected_close, owner_user_id, lost_reason?
proposals           id, deal_id, title, body_md, amount_cents, currency, status(enum:'draft'|'sent'|'accepted'|'rejected'), sent_at, pdf_url
deal_activities     id, deal_id, type, note, user_id, occurred_at
```

**Change**: `/contact`, `/general-inquiry`, `/start-project`, `/hire` POST handlers **persist a `lead`** (keeping the Resend notification) instead of email-only.

### 6.4 Talent / People Ops

```
engineers           (EXTEND) + vetting_status(enum), rate_card ref, engagement_type(enum:'freelance'|'internal'|'outsourced'|'partner'),
                              supply_source text, internal boolean
skills              id, name, slug, category                      -- taxonomy (replaces free-text skill arrays over time)
engineer_skills     engineer_id, skill_id, level int, years int
vetting_stages      id, engineer_id, stage, status, reviewer_user_id, notes, decided_at
availability_windows id, engineer_id, start_date, end_date, capacity_hours_per_week
```

### 6.5 Careers / Talent Supply (ADR-0006) ✅ implemented July 1, 2026

Handles three supply channels from one admin surface: **freelance project work**, **internal recruitment** (Andishi hires), and **third-party outsourcing** (place external talent with clients).

```
job_openings        id, title, slug, kind(enum:'freelance'|'internal'|'outsourced'), department, location, remote bool,
                              seniority, description_md, skills jsonb, compensation_note, status(enum:'draft'|'open'|'closed'),
                              published_at, organization_id? (for outsourced/client-facing)
applications        id, job_opening_id, applicant_name, applicant_email, resume_url, links jsonb, cover_note,
                              engineer_id? (if existing network), stage(enum:'applied'|'screening'|'interview'|'offer'|'hired'|'rejected'),
                              source, owner_user_id, rating int?, created_at
application_events  id, application_id, type, note, user_id (null = system event), occurred_at
```

Implemented in `src/lib/services/careers/{openings,applications}.ts`, `src/db/schema/careers.ts`. Public: `GET /api/careers` (list, `?kind=`), `GET /api/careers/[slug]` (detail - 404s on draft/closed, doesn't leak existence), `POST /api/careers/[slug]/apply` (rate-limited, ADR-0008). Staff: `GET/POST /api/careers/openings`, `PATCH /api/careers/openings/[id]`, `POST .../publish`, `POST .../close`, `GET /api/careers/applications`, `GET /api/careers/applications/[id]` (includes event trail), `PATCH .../stage`, `PATCH .../rating` - all gated by `careers.job.*`/`careers.application.*` (recruiter owns these per ADR-0007). Verified live: 17-check e2e run (draft/publish/apply/stage-progress/rate/close, plus client-forbidden checks) against real Neon data.

Column names were derived directly from the frontend's already-built `src/data/careers.ts` TypeScript interfaces (`JobOpening`/`Application`/`ApplicationEvent`), which independently converged on nearly the same shape as this ADR - confirming the design. Note: the frontend currently uses snake_case field names in its local interfaces (a prototyping-stage inconsistency with the rest of the app's camelCase convention); the backend keeps camelCase for consistency with every other table, so wiring the frontend to these live endpoints later will need a small field-name adapter, not a schema change.

**Not yet built**: `talent_pool_entries` (cross-channel supply-side pipeline view) - deferred until there's a concrete UI need for it beyond what `applications`/`stage` already provide.

### 6.6 CMS (ADR-0004 — migrate hardcoded content to DB)

```
content_authors     id, name, role, avatar_url, user_id?
blog_posts          id, slug unique, title, category, excerpt, cover_image, author_id, body_md/jsonb,
                              status(enum:'draft'|'scheduled'|'published'|'archived'), featured bool, read_time int,
                              seo jsonb, published_at, date_modified
case_studies        (backed by projects.isPublic today) → keep on projects table; add revisions + editorial status.
                              Public /work AND homepage showcase both read published projects ordered by featuredOrder.
services_content    id, slug(ServiceType), title, description, icon, timeline, group, tagline, image_url, scope,
                              engagement_options jsonb, faq jsonb, stack_highlights jsonb, glow, order int, published bool
skill_domains       id, slug, label, h1, subheadline, technologies jsonb, use_cases jsonb, differentiators jsonb, faq jsonb
testimonials ✅     id, author_name, author_role, content, avatar_url, project_url?, rating, date, status(enum:'active'|'archived'),
                              featured bool, order int, project_id?, organization_id?, engineer_id?, created_at
faqs                id, section(enum:'landing'|'services'|'hire'|'careers'|'general'), question, answer, order int, published bool
content_revisions   id, content_type, content_id, snapshot jsonb, editor_user_id, created_at  -- version history
```

**Consolidation note (derived from landing-page audit, July 1 2026):** three content sources currently overlap and must converge into single tables during migration, not be preserved as-is:
- **Services**: `src/content/landing.ts` (`services`: icon/image/timeline/body) and `src/data/services.ts` (`ServiceDefinition`: scope/engagementOptions/faq/stackHighlights) are joined by slug at render time in `services-bento.tsx`. `services_content` becomes the single merged source for both the homepage bento grid and `/services/[slug]`.
- **Case studies**: `src/content/landing.ts` (`showcaseProjects`), `src/data/projects.ts` (`ProjectEntry`), and the `projects` table's existing public fields (`challenge/solution/outcome/clientQuote/clientQuoteAttribution/clientName/isPublic/publicSlug/featuredOrder`) all describe the same entity. The `projects` table is already the richest shape — the homepage showcase and `/work` should both query it directly (`isPublic = true ORDER BY featuredOrder`), and the two hardcoded arrays are retired, not dual-sourced.
- **Testimonials** are net-new (no existing data model, confirmed by full-codebase search) — needed for the founder→testimonials marquee planned for the homepage (GSAP-driven infinite scroll, replacing the current topic-tag `BlogTicker` strip in `blog-faq-newsletter.tsx`). Build the table + admin CRUD first; the frontend marquee consumes `GET /api/testimonials?featured=true`.
- **FAQs** are currently duplicated per page (`landing.ts faqItems`, service FAQs, skill-domain FAQs, `/hire/faq`). The `faqs` table with a `section` discriminator lets each page query its own slice from one editable source.

Migration path: seed these tables from the current `src/data/*.ts` / `src/content/*.ts` so nothing regresses; public pages switch to reading DB with the static files as fallback until cutover, then the static files are deleted (not kept as permanent dual-source).

**Status (July 1, 2026)**: `testimonials` ✅ implemented (`src/db/schema/testimonials.ts`, `src/lib/services/cms/testimonials.ts`) - column names mirror the frontend's existing `Testimonial` interface (`src/data/testimonials.ts`) closely for a low-friction future swap. Public `GET /api/testimonials` (`?featured=true`), staff `GET /api/testimonials?all=true`, `POST`, `PATCH/DELETE /api/testimonials/[id]` gated by `cms.testimonial.write`. Verified live (create/publish/archive/staff-vs-client visibility). `blog_posts`, `services_content`, `skill_domains`, `faqs`, `content_revisions` remain **not built** - deferred to a dedicated CMS pass since they involve the consolidation work described above, which testimonials (being net-new with no prior source to reconcile) didn't need.

### 6.7 Marketing

```
campaigns           id, name, channel, status, start_date, end_date, budget_cents, utm jsonb, owner_user_id
newsletter_subscribers id, email unique, status(enum:'subscribed'|'unsubscribed'), source, subscribed_at
campaign_metrics    id, campaign_id, date, impressions, clicks, conversions, spend_cents  -- ingestion target (GA4/manual)
```

### 6.8 Support & Notifications

```
support_cases       id, subject, status(enum), priority, requester_user_id, org_id?, assignee_user_id?, channel, created_at
support_messages    id, case_id, author_user_id, body, attachments jsonb, internal bool, created_at
notifications       id, user_id, type, title, body, entity_type?, entity_id?, read_at?, created_at
notification_prefs  user_id, channel, event_type, enabled
```

### 6.9 Platform: audit, settings, jobs

```
audit_log           id, actor_user_id?, actor_ip, action, resource_type, resource_id, before jsonb, after jsonb,
                              request_id, created_at        -- immutable, append-only
settings            key text pk, value jsonb, updated_by, updated_at   -- matching params, integration keys(status), feature flags
job_runs            id, job_key, status, started_at, finished_at, error, payload jsonb  -- observability for background jobs
idempotency_keys    key text pk, user_id, route, response_hash, created_at
```

---

## Part 7 — API design conventions

- **REST resource routes** under `src/app/api/<module>/<resource>`. Collection `GET/POST`, item `GET/PATCH/DELETE`. Sub-actions as `POST /<resource>/[id]/<action>` (e.g. `/api/matches/[id]/accept`).
- **Pagination**: `?page`, `?pageSize` (default 25, max 100) → `{ data, page, pageSize, total }`. Cursor pagination for large feeds (activity, audit).
- **Filtering/sort**: explicit whitelisted query params per resource; never interpolate raw input into SQL (Drizzle parameterises).
- **Validation**: one Zod schema per input in `lib/validation/<module>.ts`; `safeParse` → `validationError`.
- **Idempotency**: mutating POSTs that create money/records accept an `Idempotency-Key` header checked against `idempotency_keys`.
- **Rate limiting** ✅: `src/lib/rate-limit.ts` (Upstash, [ADR-0008](adr/ADR-0008-caching-and-jobs.md)), wired into `login`, `register`, `contact`, `general-inquiry`. Fails open until `UPSTASH_REDIS_REST_URL`/`TOKEN` are provisioned. Extend to careers `apply` in P5.
- **Response envelope**: success `{ <resource>: ... }` or `{ data, ... }`; error `{ error, field?, code? }`.
- **Versioning**: internal API is co-deployed with the app; breaking changes are gated behind additive fields, not URL versions, for now.

---

## Part 8 — Cross-cutting concerns

- **Transactions**: `db.transaction()` around every multi-table workflow; audit + activity written inside the txn.
- **Background jobs** (`lib/jobs`): invoice generation per billing period, timesheet→invoice rollup, SLA/overdue sweeps, payout runs, notification digests. Triggered by scheduled routes (cron) with `job_runs` bookkeeping; can move to a queue later.
- **File storage** (`lib/storage`): already present; extend for resumes, receipts, invoice PDFs, case-study covers with content-type + size validation.
- **Email** (`lib/email` + Resend): transactional (verification, notifications, invoice sent, application received) via templated senders.
- **Caching**: request-scoped memoization for permission resolution and session (`react.cache` already used); consider short TTL cache for public CMS reads.
- **Search**: start with Postgres `ILIKE`/trigram + indexed columns; revisit only if needed.
- **Public metrics endpoint**: the homepage `TalentTrack` section (`src/app/page.tsx`) and `ServicesMarquee` hardcode operational stats ("50+ engineers placed", "8 days avg match speed", "32+ products shipped"). Once P1/P6 data exists, add `GET /api/public/metrics` computing these live (placed engineer count, avg time-to-placement, shipped project count from `projects.status = completed`) with a short cache TTL, and wire the homepage to it instead of copy. Low priority — do only after the underlying tables are populated with real records.
- **Newsletter capture is UI-complete, backend-missing**: `blog-faq-newsletter.tsx`'s subscribe form currently only sets local component state on submit — no request is sent anywhere. Wiring `POST /api/newsletter/subscribe` against `newsletter_subscribers` (Part 6.7) is a near-zero-frontend-effort fast follow once that table exists; do not wait for the full P7 Marketing phase to close this one out if it's convenient to ship earlier.

---

## Part 9 — Observability & DevOps (ADR-0005) — DevOps owner

- **Error tracking**: Sentry (`@sentry/nextjs`) for server + client, with release + environment tagging, PII scrubbing, and `requestId` on every server error.
- **Logging**: structured JSON logs with request ID, user ID, module, action; no secrets or PII in logs.
- **Tracing**: Sentry performance + Vercel analytics for route timing; slow-query logging in dev.
- **Health**: `GET /api/health` (db ping + build info); job liveness via `job_runs`.
- **Testing strategy**:
  - Unit: services + `can()`/scope resolution + finance math (Vitest).
  - Integration: API routes against a disposable Neon branch DB.
  - E2E smoke: auth + one critical flow per module (Playwright).
  - **Gate**: `tsc --noEmit` (existing default) + `lint`; add `test` to CI before deploy.
- **Secrets/config**: all keys in env (`DATABASE_URL`, `JWT_SECRET`, `RESEND_*`, `SENTRY_DSN`, future `STRIPE_*`/`WISE_*`); `settings` table stores non-secret operational config + integration on/off status only.
- **CI/CD**: PR → typecheck+lint+test → preview deploy; main → migrations applied → production. Migrations reviewed like code.

---

## Part 10 — Security

- Authorize every mutation via `lib/authz` (permission + scope), enforced in services.
- Ownership scoping for client/developer users (org-owned / self-owned rows only).
- Input hardening: Zod on all bodies; whitelist query params; escape all user content in emails (already done in `general-inquiry`).
- Rate limiting + idempotency on sensitive/public endpoints.
- Session hygiene: httpOnly, secure in prod, rev?ocation supported (already present); add "sign out everywhere".
- PII: minimise, scrub from logs/Sentry; resumes/receipts stored with restricted access URLs.
- Audit log is append-only and admin-readable only.

---

## Part 11 — Migration & seeding strategy

1. Every schema change = new file in `src/db/schema/*`, then `npm run db:generate`, review SQL, commit, apply with `npm run db:migrate` (push) or `migrate` in CI.
2. Additive-first: new columns nullable/defaulted; enums extended.
3. Seed scripts (`scripts/`): extend `seed-admin` to also seed the **permission catalog + system roles**; add `seed-cms` to import current `src/data/*.ts`; keep `seed-demo` for realistic ERP demo data.
4. Content cutover: dual-read (DB → fallback to `src/data`) until each CMS table is populated and verified, then remove the static fallback.

---

## Part 12 — Phased delivery roadmap

Sequenced so authorization + service layer exist before modules, PM ships first, and money is correct before automation.

| Phase | Deliverable | Exit criteria |
|-------|-------------|---------------|
| **P0 Foundation** ✅ | `authz` (permissions, roles, `can`, scope), `audit_log`, service/repository skeleton, error envelope, Sentry, health check, seed permission catalog + system roles. Refactored briefs + projects routes onto the layer as the reference pattern. | Done July 1, 2026. DB driver swapped `neon-http` → `neon-serverless` Pool to support real transactions (ADR-0002 addendum). 87 permissions / 7 system roles seeded and verified live against Neon, including a real allow-path and deny-path test. Sentry fully instrumented (tracing, replay, error boundaries, server-action wrapping) via `charanos-org/andishi` project. `/api/health` verified live. Role interconnection review added `sales_manager` (8th role) and moved match/placement ownership to recruiter - see [ADR-0007](adr/ADR-0007-role-interconnections.md). Dev tooling added: Biome (format-only), `eslint-plugin-drizzle`, Vitest, husky+lint-staged. |
| **P1 Delivery/PM** ⭐✅ | Milestones→table, tasks, sprints, allocations, timesheet↔task links; PM services; admin + dev/client PM APIs. | Done July 1, 2026. `src/db/schema/delivery.ts` (milestones, tasks, task_dependencies, sprints, allocations) + `projects` extended (code/health/budgetCents/billingType/leadPmUserId) + `timesheet_entries` extended (taskId, invoiceId) - migration `0002_damp_chronomancer.sql` applied directly (drizzle-kit push required an interactive TTY prompt this environment can't provide; the reviewed SQL was applied atomically via a one-off script instead - `db:migrate` still works normally for future non-ambiguous changes). `src/db/relations.ts` added for `db.query.*` relational reads. Full service layer (`src/lib/services/delivery/*`): access scoping, health rollup (`computeProjectHealth`/`recomputeProjectHealth`), milestones (submit/approve), tasks (create/move/delete with staff-vs-own-assignee rules), sprints (open/close with single-active-sprint enforcement), allocations (staff-only, engineer self-read), timesheets (log/submit/approve/reject, migrated off the old ungated route). 15 Vitest unit tests + a 13-check live end-to-end run against real Neon data (sprint lifecycle, health recompute on block/unblock, milestone approval, developer time-logging, client/developer authorization boundaries) all passed. Admin/client/dev **dashboard UI still reads mock data** - wiring the UI to these live endpoints is a follow-up, not done in this pass. |
| **P2 Finance ledger** ✅ | rate_cards, ledger, invoice line items, expenses, payouts, budgets; revenue/cost/margin services; invoice generation job. | Done July 2, 2026 - see [ADR-0003](adr/ADR-0003-finance-ledger.md) implementation notes. `src/db/schema/finance.ts` (rate_cards, ledger_accounts/entries/transactions, invoice_line_items, expenses, payouts, budgets) + `src/db/schema/jobs.ts` (`job_runs`, pulled forward from P8) + `invoices` extended - migration `0005_dark_guardian.sql`. Full service layer (`src/lib/services/finance/*`): `postTransaction()` as the single balanced-ledger write path (`assertBalanced()` extracted pure for unit testing), rate cards, invoice generation from timesheets (grouped per engineer at their active bill rate) and from fixed-price milestones (both structurally prevent double-billing by marking source rows in the same transaction), expenses (record→approve→reimburse, each ledger-posting), payouts (create→approve→paid, each ledger-posting), budgets CRUD, and a company-wide revenue/cost/margin/AR/DSO report (`getFinanceSummary`, `?period=mtd\|ytd`). `/api/invoices` refactored off its old ungated pre-service-layer form onto this layer (`DELETE` now cancels rather than hard-deleting). Background job (`src/lib/jobs/generate-invoices.ts`) runs monthly via Vercel Cron (`vercel.json`) as a synthetic "system actor" session, fails closed without `CRON_SECRET`. 12 new Vitest unit tests (ledger balance invariant, margin/DSO math) + a 12-step live end-to-end run against real Neon data, all passing. Per-project/org revenue drilldowns and the `/admin/revenue` + client `/payments` + dev `/earnings` dashboard UI are explicitly deferred - see ADR-0003 notes for why. |
| **P3 CRM/Sales** | leads (persist all intake forms), deals, proposals, activities; source attribution. | Every contact/brief/hire submission creates a lead; pipeline board live in admin. |
| **P4 CMS** | blog_posts, services_content, skill_domains, case-study editorial on projects, revisions; seed from `src/data/*`; public pages dual-read. | Admin can CRUD blog/work/services; public pages render from DB. |
| **P5 Careers/Talent Supply** | job_openings, applications, application_events, talent_pool; public `/careers` + apply; recruiter queue. | Openings published, applications captured and progressed across freelance/internal/outsourced channels. |
| **P6 Talent Ops depth** | skills taxonomy, engineer_skills, vetting_stages, availability_windows. | Vetting workflow + skill-based matching inputs live. |
| **P7 Marketing** | campaigns, newsletter, campaign_metrics; GA4/analytics ingestion. | Campaign ROI + subscriber management in admin. |
| **P8 Support & Notifications** | support_cases/messages, notifications, prefs; wire floating support chat + notification menu. | Support threads and notifications persisted and role-scoped. |
| **P9 Hardening** | idempotency, rate limiting, background job scheduling, indexes/perf pass, full test coverage of critical flows, provider-integration seams (Stripe/Wise) documented. | Load-sane, observable, tested; provider integration is a config change, not a refactor. |

Each phase: schema → migration → services (+authz+audit) → API → validation → tests → replace mock → docs update.

---

## Part 13 — Definition of done (per phase)

- Migration generated, reviewed, applied; schema typed and exported.
- Services authorize via `can()` + scope, run in transactions, emit audit + activity.
- API routes validate input, page/filter correctly, return the standard envelope.
- Mock data for the surface removed; dashboard reads live endpoints.
- Unit tests for service logic + authz; integration test for the primary flow.
- `tsc --noEmit` + lint clean; Sentry wired for the new routes.
- This document + relevant ADR updated.

---

_This is the authoritative backend/ERP source of truth. ADRs in `docs/backend/adr/` record the decisions. Update this file whenever a phase completes or a decision changes._
