# Andishi v3 Progress Tracker

Last updated: May 9, 2026

## Current Phase

The public internal-pages pass and first dashboard scaffold from `docs/Andishi-v3-Internal-Pages-Dashboard-Implementation-spec.md` are implemented.

Andishi is now structured as a senior African engineering talent brand with a clearer public information architecture:

- `/hire` is the canonical hiring process page.
- `/engineers` and `/engineers/[slug]` provide profile-led proof.
- `/skills/*` pages describe priority talent domains.
- `/studio` separates the build arm from the talent narrative.
- `/blog` provides the foundation for hiring and engineering authority content.
- `/admin`, `/dashboard`, and `/dev` are scaffolded as role-scoped workspaces.

Current workstream: documentation sync and GitHub push to `main`.

## Completed in the Current Pass

- Added `docs/Andishi-v3-Internal-Pages-Dashboard-Implementation-spec.md` as the execution guide for internal pages and dashboards.
- Updated `docs/V3_CURRENT_STATE_AUDIT.md` to reflect the current route map, dashboard scaffold, schema coverage, and remaining work.
- Added public Phase 1 routes:
  - `/hire`
  - `/hire/faq`
  - `/engineers`
  - `/engineers/[slug]`
  - `/skills`
  - `/skills/fullstack`
  - `/skills/ai`
  - `/skills/web3`
  - `/skills/aws`
  - `/studio`
  - `/blog`
  - `/blog/[slug]`
  - `/blog/category/[slug]`
  - `/work/[slug]`
  - `/legal/privacy`
  - `/legal/terms`
- Added machine-readable files:
  - `public/engineers.md`
  - `public/pricing.md`
- Added static data modules for launch-speed content:
  - `src/data/hire.ts`
  - `src/data/engineers.ts`
  - `src/data/skills.ts`
  - `src/data/blog.ts`
  - `src/data/dashboard.ts`
- Added shared marketing components for route pages, JSON-LD, FAQs, engineer cards, engineer filters, and blog cards.
- Added a shared dashboard component library:
  - App shell, role sidebar, top nav, KPI cards, onboarding checklist, welcome modal, empty states, activity feed, profile cards, project cards, kanban board, data table, drawer panel, time tracker, earnings card, sparkline, status badge, and vetting badges.
- Added role-scoped dashboard route scaffolds:
  - Super Admin: `/admin`, `/admin/engineers`, `/admin/clients`, `/admin/placements`, `/admin/briefs`, `/admin/matches`, `/admin/revenue`, `/admin/content`, `/admin/settings`
  - Client: `/dashboard`, `/dashboard/brief`, `/dashboard/matches`, `/dashboard/team`, `/dashboard/projects`, `/dashboard/messages`, `/dashboard/payments`, `/dashboard/settings`
  - Developer: `/dev`, `/dev/profile`, `/dev/projects`, `/dev/time`, `/dev/earnings`, `/dev/messages`, `/dev/settings`
- Updated navigation and link paths so primary CTAs prefer `/hire`, `/engineers`, `/skills`, `/studio`, or `/start-project` according to intent.
- Expanded `src/app/sitemap.ts` to include the new public static and dynamic routes.
- Removed the unused `Comparison` function from the landing page.
- Replaced the lint-flagged raw image usage in touched active components where `next/image` was appropriate.

## Implemented Public Routes

| Route | Current status |
|---|---|
| `/` | Talent-first landing page complete and linked into the new IA. |
| `/hire` | Canonical hiring process page complete. |
| `/hire/faq` | Expanded buyer FAQ complete. |
| `/engineers` | Static engineer directory complete. |
| `/engineers/[slug]` | Static engineer profile pages complete. |
| `/skills` | Skill hub complete. |
| `/skills/fullstack` | Skill-domain page complete. |
| `/skills/ai` | Skill-domain page complete. |
| `/skills/web3` | Skill-domain page complete. |
| `/skills/aws` | Skill-domain page complete. |
| `/studio` | Separate studio arm page complete. |
| `/blog` | Blog index complete. |
| `/blog/[slug]` | Static blog post template complete. |
| `/blog/category/[slug]` | Blog category archive complete. |
| `/services` | Legacy/hybrid talent services page retained and linked to `/studio`. |
| `/work` | Case-study proof page retained. |
| `/work/[slug]` | Individual case-study pages complete. |
| `/about` | Talent mission and founder story retained. |
| `/contact` | Hiring conversation and contact page retained. |
| `/start-project` | Legacy route name retained as hiring brief flow. |
| `/login` | Hiring workspace login page retained. |
| `/legal/privacy` | Lightweight legal page complete. |
| `/legal/terms` | Lightweight legal page complete. |

## Implemented Dashboard Routes

| Route group | Current status |
|---|---|
| `/admin/*` | Super Admin workspace scaffold complete with overview, pipeline, tables, and admin surfaces. |
| `/dashboard/*` | Client workspace scaffold complete with overview, brief, matches, team, projects, messages, payments, and settings. |
| `/dev/*` | Developer workspace scaffold complete with overview, profile, projects, time tracking, earnings, messages, and settings. |

The dashboard system currently uses static data and layout-complete placeholders. Auth, persistence, real matching workflows, Crisp, Stripe, CRUD modals, and richer table/chart behavior remain future implementation work.

## Documentation Updated

- `docs/V3_CURRENT_STATE_AUDIT.md`
- `docs/PROJECT_PROGRESS.md`
- `docs/Andishi-v3-Internal-Pages-Dashboard-Implementation-spec.md`

Existing direction docs still relevant:

- `docs/THEME_GUIDE.md`
- `docs/andishi-v3-content-system.md`
- `public/llms.txt`

## Next Milestones

1. Auth and role routing
   - Add real login role-check redirects to `/admin`, `/dashboard`, or `/dev`.
   - Ensure dashboard access is validated in server-side route boundaries, not only middleware/proxy.

2. Dashboard data and workflows
   - Replace static dashboard data with API/database-backed records.
   - Complete client intro request flow in `/dashboard/matches`.
   - Complete developer profile wizard and onboarding review flow.
   - Add admin CRUD modals and detail drawers.

3. Integrations
   - Wire Crisp for message surfaces.
   - Add payment/invoice integration when scope is approved.
   - Add content write workflow or CMS bridge for blog/case-study operations.

4. Polish and QA
   - Mobile and desktop visual QA at 375px, 768px, 1280px, and 1440px.
   - Dark/light mode pass across new public pages and dashboards.
   - Accessibility pass for dashboard controls and public accordions.

## Verification

Requested verification gate for this handoff:

- `npx tsc --noEmit`

Latest known status before this documentation-only update:

- `npx tsc --noEmit`: passed.
- `npx eslint src --max-warnings=0`: passed.

Per user instruction, no additional verification was run after updating this document.

## GitHub

Active source remote:

- `https://github.com/Charanos/andishi-v3.git`

Publishing goal for this pass:

- Push the current implementation and documentation updates to `main`.

## Design Rules To Preserve

- Talent is the primary product. Studio is secondary and should read as proof-of-work or a separate studio track.
- Use `hire@andishi.dev` for direct hiring inquiries.
- Preferred CTA language: "Hire engineers", "Start matching", "Submit a hiring brief", "See our engineers".
- Avoid leading with "project studio", "digital product studio", or local SME delivery language unless the context is explicitly the studio arm.
- Keep body copy factual, specific, and extraction-friendly for AI search.
- Keep supporting copy readable; avoid tiny helper text on forms and onboarding flows.
- No `font-bold` or `font-semibold`.
- `font-medium` is allowed for nav labels, buttons, compact UI, chips, and card titles.
- Use Tabler icons only.
- Use `font-mono` for stats, percentages, timelines, IDs, and structured technical values.
- Avoid decorative sparkle/star icons and generic grid-pattern backgrounds.
