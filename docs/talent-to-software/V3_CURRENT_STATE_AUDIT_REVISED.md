# Andishi v3 Current State Audit - Revised

Last updated: June 16, 2026

This revision supersedes the June 9, 2026 audit. The primary driver is a strategic repositioning enacted June 2026: Andishi's public identity shifts from a talent-placement-first company to a software development studio. Talent placement, staff augmentation, and outsourced engineering remain active, billable services but are no longer the headline product.

All route descriptions, navigation priorities, machine-readable file content, meta copy, and schema recommendations in this document reflect the updated positioning. The technology stack, dashboard scaffold, and verification gates are unchanged from the prior audit. Route URLs are preserved wholesale to protect existing SEO equity; this pass is a content and role update, not a structural migration.

---

## 1. Current Positioning

Andishi's lead identity is a software development company that designs, builds, and ships Software Products for global and local clients. The primary deliverable is working software, not talent supply.

**Primary service lines (ordered by public prominence):**

- Custom software development
- SaaS product development and launch
- AI and intelligent systems integration
- Web application development
- Mobile application development
- Enterprise software and internal platforms
- Blockchain and Web3 product development
- Product strategy, design, and end-to-end engineering execution

**Secondary services (retained, de-emphasized):**

- Senior engineering talent placement
- Dedicated remote team and staff augmentation
- Outsourced engineering

**Primary buyer:**

Founders, CTOs, product leads, and business owners who need software designed and shipped, spanning seed-stage startups through established SMEs and enterprises across Kenya, East Africa, the US, UK, EU, and GCC. The talent buyer (a CTO extending headcount) remains a valid audience but is no longer the only audience the site speaks to first.

**Primary promise:**

Andishi takes a product from concept through design, build, and launch. Clients receive working software delivered by a team that owns the outcome, not a marketplace of CVs to filter through.

**Core proof mechanism:**

Shipped products across fintech, healthtech, logistics, SaaS, and Web3 verticals are now the lead credibility signal. The engineering talent network (50+ engineers placed globally) is retained as proof of team depth, not as the product itself. Specific proof metrics to surface publicly:

- Projects shipped across defined service verticals (update with live count).
- Average time to first deployable milestone (update with live figure).
- 30-day delivery commitment on defined-scope engagements.
- 30-day replacement guarantee for talent placements, retained as a secondary proof point.
- Case studies as the primary evidence layer across all service pages.

**Studio arm (elevated):**

Previously framed as a secondary revenue line for African businesses, the studio function is now the primary delivery track. All project delivery, whether for global SaaS clients or local African enterprises, falls under this positioning.

**Talent arm (repositioned):**

Talent placement and dedicated-team engagements remain available and are surfaced as one delivery mode rather than the headline product. The "hire an engineer" track stays visible on skill and capability pages but no longer anchors the hero or primary nav.

---

## 2. Technology Stack

Unchanged from the June 9, 2026 audit.

| Layer | Current stack |
|---|---|
| Framework | Next.js App Router |
| Runtime package version | Next.js 16.x |
| UI | React 19.x |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 with project CSS tokens |
| Typography | Outfit (UI/body), Cormorant Garamond (title accent), JetBrains Mono (structured values and numerics) |
| Motion | Framer Motion |
| Theme | next-themes |
| Icons | `@tabler/icons-react` exclusively |
| Content/data | Static TypeScript data files for launch speed |

---

## 3. Public Route Map

Route implementation statuses are carried forward from the June 9, 2026 audit. Descriptions are updated throughout to reflect the revised positioning. Routes marked "copy update required" need editorial changes only; routes marked "revamp required" need structural or component-level changes.

| Route | Status | Current role |
|---|---|---|
| `/` | Implemented - copy update required | Software studio landing page. The hero now leads with build capability and product delivery as the primary value proposition. The talent placement track is retained but surfaces below the fold as a secondary option. Page structure: hero (build), capability proof strip (delivery metrics), selected project showcase, service overview, case studies, dual-track CTA surface (build with us / hire engineers), founder section, FAQ/newsletter, and final CTA. |
| `/services` | Implemented - full revamp required | Primary software services hub. The legacy/hybrid route is retired and replaced by a purpose-built services index carrying all primary service lines: custom software, SaaS, AI, web, mobile, enterprise, and blockchain. Each service entry links to its own sub-page. The old `/studio` cross-link is removed from this page; `/studio` now cross-links here instead. `Service` schema with `hasOfferCatalog` and `BreadcrumbList`. |
| `/services/[slug]` | Not yet implemented - Phase 1 priority | Per-service detail pages. Required slugs: `custom-software`, `saas-development`, `ai-systems`, `mobile-apps`, `enterprise-software`, `blockchain`. Each page carries a scope definition, representative case studies, relevant technical stack, engagement model options, a FAQ block, and a CTA to `/start-project`. Schema: `Service`, `FAQPage`, `BreadcrumbList`. |
| `/studio` | Implemented - copy update required | Studio delivery track for local clients and African-market builds. Retains its own route for SEO equity and audience specificity. Reframed from "secondary arm" to a delivery execution surface for a defined client segment. Now cross-links to `/services` for clients needing to see the full service scope. Copy, process section, and CTA updated to match software-studio framing. Schema: `Service`, `BreadcrumbList`. |
| `/work` | Implemented - elevation required | Primary proof mechanism for software delivery. Now the lead credibility surface across the site rather than a supporting portfolio. Filter-by-service and filter-by-vertical should be added alongside existing case study grid. Case studies authored to lead with technical decisions and shipped outcomes, not engineer profiles. Schema: `ItemList`, `BreadcrumbList` (ItemList not yet implemented; add in Phase 2). |
| `/work/[slug]` | Implemented | Individual case study. Challenge, solution, technical stack decisions, shipped metrics, and CTA. Engineering talent is mentioned where directly relevant but is not the headline. Schema: `Article`, `BreadcrumbList`. |
| `/hire` | Implemented - copy update required, nav priority reduced | Talent hiring process page, now secondary in nav hierarchy. Full implementation retained: timeline, guarantees, engagement models, ICP callout, FAQ teaser, final CTA. Intro copy updated to position talent placement as one delivery mode within Andishi's broader capability. |
| `/hire/faq` | Implemented | Expanded buyer FAQ scoped to the talent hiring track. Retained as-is. Sticky desktop topic nav, accordion content, FAQPage JSON-LD. No copy changes required in this pass. |
| `/engineers` | Implemented - role description updated | Senior engineer directory. Repositioned from primary product surface to credibility proof of team depth. Profile cards, search, role filters, availability filters, and ItemList schema remain. Internal CTAs route toward `/start-project` or `/hire` rather than functioning as standalone conversion surfaces. |
| `/engineers/[slug]` | Implemented | Individual engineer profiles. Vetting badges, work history, and highlights serve as evidence of the team's caliber rather than marketable candidates. Person schema and BreadcrumbList retained. |
| `/skills` | Implemented - copy update required | Technical capabilities index. Reframed from a talent domain hub to a capability overview that links to both `/skills/[domain]` capability pages and the new `/services` hub. Intro copy updated to lead with what Andishi builds in each domain before what it places. |
| `/skills/fullstack` | Implemented - copy update required | Full-stack engineering capability page. Dual-track structure: build-with-us (project delivery) is the lead track; hire-an-engineer (placement) is secondary. Representative case studies lead the proof section. Schema: `Service`, `FAQPage`, `BreadcrumbList`. |
| `/skills/ai` | Implemented - copy update required | AI and intelligent systems capability page. Leads with AI product development, LLM integration, and intelligent workflow delivery. Talent placement secondary. Schema unchanged. |
| `/skills/web3` | Implemented - copy update required | Blockchain and Web3 capability page. Leads with delivered Web3 products and on-chain integrations. Talent placement secondary. Schema unchanged. |
| `/skills/aws` | Implemented - copy update required | Cloud and AWS infrastructure capability page. Leads with infrastructure architecture and cloud platform delivery. Talent placement secondary. Schema unchanged. |
| `/blog` | Implemented - content plan update required | Blog index. Topic cluster update needed: product development, software delivery process, and technical depth should be added as primary pillars alongside existing hiring and talent content. Featured post selection should prioritize delivery-relevant topics going forward. |
| `/blog/[slug]` | Implemented | Static blog post template. Author box, CTA surfaces, related posts, BlogPosting schema. No structural changes required. |
| `/blog/category/[slug]` | Implemented - new categories needed | Category archive pages. Add: `product-development`, `case-studies`, `engineering-process` to complement existing talent and hiring categories. |
| `/about` | Implemented - copy update required | Origin, mission, founder, and operating principles. Reframed: company story leads with software delivery capability and team depth; the talent network is retained as evidence of scale. Talent arbitrage narrative is de-emphasized. |
| `/contact` | Implemented - copy update required | Contact route for project conversations and talent inquiries. Lead intent shifts from "hire an engineer" to "start a project." Both tracks remain visible but with project inquiry as the default framing. |
| `/start-project` | Implemented - copy update required | Primary project and engagement intake form. Route name kept as-is to avoid breaking existing links and indexing. Copy shifts from "hiring brief" to "project brief and engagement intake." Build-with-us is the default track; hire-an-engineer is a secondary form path. |
| `/login` | Implemented | Client workspace login. No changes required in this pass. |
| `/legal/privacy` | Implemented | Lightweight privacy policy. No changes required. |
| `/legal/terms` | Implemented | Lightweight terms. No changes required. |
| `/sitemap.xml` | Implemented - update required | Must include `/services/[slug]` sub-routes once implemented. Update priority weights: `/services` and `/work` should carry `priority 0.9`; talent-specific routes (`/hire`, `/engineers`) can drop to `priority 0.7`. |
| Global `not-found.tsx` | Implemented | Branded fallback. No changes required. |
| Global `loading.tsx` | Implemented | App-level loading boundary. No changes required. |

**Redirect note:** No existing routes are removed or renamed in this pass. All current URLs are preserved. No 301 redirects are required at this stage. If `/services` slug sub-pages are introduced, they are net-new routes with no prior URL to redirect from.

---

## 4. Machine-Readable Files

| File | Status | Purpose |
|---|---|---|
| `public/llms.txt` | Implemented - content update required | AI-system summary of Andishi. Current copy frames Andishi as a talent placement company with a studio arm. New copy leads with software development. See suggested rewrite below. |
| `public/engineers.md` | Implemented - minor update required | Machine-readable overview of the engineering network. Retain structure. Add an opening note clarifying the network is Andishi's delivery team and bench, not the primary product on offer. |
| `public/pricing.md` | Implemented - content update required | Indicative pricing must now lead with project and delivery engagements (fixed-scope builds, monthly retainers, SaaS partnership structures) before surfacing talent placement rates. |

**New machine-readable file required:**

| File | Status | Purpose |
|---|---|---|
| `public/services.md` | Not yet implemented - Phase 1 | Plain-text service catalog readable by AI crawlers. Lists each primary service line with a one-paragraph scope definition, typical engagement structure, and indicative timeline. Enables AI systems to surface Andishi for project-based queries in addition to talent queries. No schema needed; structured for natural language extraction. |

**Suggested `public/llms.txt` rewrite:**

```
Andishi is a software development company based in Nairobi, Kenya, building custom software,
SaaS products, AI systems, web applications, mobile applications, enterprise platforms, and
blockchain products for global and local clients.

Primary services: custom software development, SaaS product development, AI and intelligent
systems, mobile app development, enterprise software, and Web3 and blockchain development.
Clients range from seed-stage startups to established enterprises across the US, UK, EU, GCC,
and East Africa.

Andishi also operates an engineering talent placement service, placing vetted senior African
engineers with global startups and tech companies. The talent network spans full-stack web,
AI/ML, AWS and cloud infrastructure, Web3 and blockchain, and API systems.

Key pages: /services (service lines), /work (case studies and shipped projects),
/skills (technical capabilities), /engineers (talent directory), /hire (hiring process),
/blog, /about, /contact, /start-project.
```

---

## 5. Dashboard Route Map

Unchanged from the June 9, 2026 audit. The dashboard scaffold is software-delivery-agnostic and requires no structural changes for this positioning pass. Auth, persistence, and external integrations remain governed by `docs/DASHBOARD_MASTER_IMPLEMENTATION.md`.

| Route group | Status | Current role |
|---|---|---|
| `/admin` | Polished scaffold | Super Admin overview command canvas: KPI cards, Recharts visualizations, event CRUD, pipeline detail drawers, attention queue, priority briefs, activity, and talent supply panels. |
| `/admin/briefs` | Page-specific revamp | Demand intake workspace: search/filter/sort queue, stage strip, SLA and priority signals, create modal, detail drawer, archive confirmation, shortlist preparation, mixed chart analytics. |
| `/admin/engineers` | Scaffolded | Admin engineer directory surface. |
| `/admin/clients` | Scaffolded | Client table surface. |
| `/admin/placements` | Scaffolded | Placement table surface. |
| `/admin/matches` | Scaffolded | Kanban matching pipeline surface. |
| `/admin/revenue` | Scaffolded | Revenue and earnings surface. |
| `/admin/content` | Scaffolded | Content operations table surface. |
| `/admin/settings` | Scaffolded | Settings table surface. |
| `/dashboard` | Scaffolded | Client overview: KPIs, matched profiles, onboarding checklist, activity feed. |
| `/dashboard/brief` | Scaffolded | Read/edit brief layout placeholder. |
| `/dashboard/matches` | Scaffolded | Client-specific developer profile cards and filters. |
| `/dashboard/team` | Scaffolded | Empty state for post-placement team members. |
| `/dashboard/projects` | Scaffolded | Project cards and milestone progress. |
| `/dashboard/messages` | Scaffolded | Crisp-wrapper placeholder. |
| `/dashboard/payments` | Scaffolded | Payment empty state placeholder. |
| `/dashboard/settings` | Scaffolded | Client settings placeholder. |
| `/dev` | Scaffolded | Developer overview: KPIs, earnings card, timer, projects, onboarding checklist. |
| `/dev/profile` | Scaffolded | Editable-profile placeholder surface. |
| `/dev/projects` | Scaffolded | Developer project cards. |
| `/dev/time` | Scaffolded | Time tracker surface. |
| `/dev/earnings` | Scaffolded | Earnings card and payment table surface. |
| `/dev/messages` | Scaffolded | Crisp-wrapper placeholder. |
| `/dev/settings` | Scaffolded | Developer settings placeholder. |

---

## 6. Shared Systems

Existing systems are unchanged. New data files and component needs are noted below.

**Existing public/marketing shared systems:**

- `src/data/hire.ts`
- `src/data/engineers.ts`
- `src/data/skills.ts`
- `src/data/blog.ts`
- `src/components/marketing/json-ld.tsx`
- `src/components/marketing/public-page.tsx`
- `src/components/marketing/faq-list.tsx`
- `src/components/marketing/engineer-card.tsx`
- `src/components/marketing/engineer-directory.tsx`
- `src/components/marketing/post-card.tsx`

**New data files required for repositioning:**

- `src/data/services.ts`: service line definitions, scope metadata, representative stack tags, and CTA targets for the `/services` hub and all `/services/[slug]` sub-pages.
- `src/data/work.ts` (update): add `service` (maps to a service line slug) and `vertical` (industry vertical) fields to all existing case study entries. These drive the filter-by-service and filter-by-vertical UI on `/work`.

**New components likely required:**

- `ServiceCard` (marketing): used on the `/services` hub to render each service line with scope summary, relevant stack badges, and a CTA. Follows the glassmorphism card pattern from the existing design system.
- `DualTrackCTA` (marketing): shared CTA surface accepting both "Start a Project" and "Hire Engineers" tracks with separate routing. Replaces single-intent CTA blocks on `/skills/[domain]` pages and the homepage secondary CTA zone.

**Existing dashboard systems (unchanged):**

- `src/data/dashboard.ts`
- `src/components/dashboard/shell/app-shell.tsx`
- `src/components/dashboard/shell/role-sidebar.tsx`
- `src/components/dashboard/shell/dashboard-top-nav.tsx`
- `src/components/dashboard/shared/workspace-page.tsx`
- `InsightsCard`, `OnboardingChecklist`, `WelcomeModal`, `EmptyState`, `ActivityFeed`, `ProfileCard`, `ProjectCard`, `KanbanBoard`, `DataTable`, `FilterBar`, `DrawerPanel`, `TimeTracker`, `EarningsCard`, `Sparkline`, `StatusBadge`, `VettingBadges`.

**Documentation (unchanged):**

- `docs/DASHBOARD_MASTER_IMPLEMENTATION.md`
- `docs/DASHBOARD_CLAUDE_CODE_PROMPT.md`
- `docs/DASHBOARD_IMPLEMENTATION_PLAYBOOK.md`
- `docs/Component_Library.md`

---

## 7. Navigation And Link State

Updated to reflect the June 2026 positioning shift. Software delivery surfaces take primary nav slots; talent-specific pages are retained but moved to secondary positions.

**Primary nav (updated):**

`/services` · `/work` · `/skills` · `/about` · `/login`

- `/services` replaces `/hire` as a primary nav item. This is the highest-priority nav change.
- `/work` retains its primary position and is elevated visually as the site's main proof surface.
- `/skills` remains in primary nav, now framed as the technical capabilities index.
- `/engineers` is removed from the primary nav and moved to the footer.
- `/hire` is moved to the footer under a "Hire Engineers" grouping rather than holding a primary nav slot.

**Header CTA (updated):**

Label: "Start a Project" - routes to `/start-project`.

Previously "Hire Engineers" routing to `/hire`. The CTA label changes; the route target remains `/start-project`.

**Footer navigation (updated groupings):**

- Services: `/services`, `/services/custom-software`, `/services/saas-development`, `/services/ai-systems`, `/services/mobile-apps`, `/services/enterprise-software`, `/services/blockchain` (add as sub-pages are implemented), `/studio`
- Work: `/work`, `/work/[slug]` (select case studies)
- Hire Engineers: `/hire`, `/hire/faq`, `/engineers`
- Company: `/about`, `/blog`, `/contact`
- Legal: `/legal/privacy`, `/legal/terms`

**CTA routing across public pages:**

- Homepage above-the-fold CTA: "Start a Project" → `/start-project`
- Homepage secondary CTA (below fold, talent track): "Hire Engineers" → `/hire`
- `/skills/[domain]` primary CTA: "Build with Us" → `/start-project`
- `/skills/[domain]` secondary CTA: "Hire a [Domain] Engineer" → `/hire`
- `/services/[slug]` CTA: "Start a Project" → `/start-project`
- `/work` and `/work/[slug]` CTA: "Work with us on something like this" → `/start-project`
- `/engineers` CTA: "Hire this Engineer" → `/hire` (talent track retained here specifically)

**Public shell standards (unchanged):**

- Outer route/section gutters: `px-5 sm:px-8 lg:px-10`
- Inner content container: `mx-auto w-full max-w-[92rem]`
- Narrow text/form bodies retain their own `max-w-*` constraints inside the shared shell.
- `.title-serif` Cormorant Garamond accent class and clamp ranges are unchanged.

**Homepage proof strip (updated signals):**

Previously surfaced: placement count, average time-to-placement, skill coverage, client geographies.

Updated to surface: projects shipped (primary), skill domains covered, average time to first milestone, client geographies, placement count (retained as secondary signal). Exact numbers to be confirmed against live data before deployment.

---

## 8. Structured Data Status

Existing JSON-LD coverage is preserved. Updates are required on routes where positioning copy changes. New schema targets are added below for the services hub and new routes.

**Existing implemented coverage (retained):**

- `/hire`: `HowTo`, `FAQPage`, `BreadcrumbList`
- `/hire/faq`: `FAQPage`, `BreadcrumbList`
- `/engineers`: `ItemList`
- `/engineers/[slug]`: `Person`, `BreadcrumbList`
- `/skills/[domain]`: `Service`, `FAQPage`, `BreadcrumbList`
- `/studio`: `Service`, `BreadcrumbList`
- `/work/[slug]`: `Article`, `BreadcrumbList`
- `/blog`: `Blog`, `BreadcrumbList`
- `/blog/[slug]`: `BlogPosting`, `BreadcrumbList`
- Root layout: `Organization`

**Updates required on existing schema:**

- Root layout `Organization.description`: currently frames Andishi as a talent company. Update to: `"Andishi is a software development company building custom software, SaaS products, AI systems, web applications, mobile applications, enterprise platforms, and blockchain solutions for global and local clients."` Retain existing `sameAs`, `url`, `name`, and `foundingDate` fields.
- `/skills/[domain]` `Service.description` and `Service.serviceType`: currently describes talent supply. Update each to describe what Andishi builds in that domain (the delivery service) before referencing the talent track. Example for `/skills/ai`: `serviceType: "AI Software Development"`, `description: "Andishi builds AI-integrated products and intelligent systems using LLM APIs, machine learning pipelines, and production-grade AI tooling for startups and enterprises."` The hire-an-engineer mention can remain as a secondary sentence.
- `/studio` `Service.description`: update from "studio for African business builds" to "software delivery track for local and regional clients requiring custom product development, web applications, and business platforms."

**New schema targets:**

- `/services`: `Service` with `hasOfferCatalog` listing each primary service as an `Offer`. `BreadcrumbList`. Priority: Phase 1.
- `/services/[slug]`: `Service` with full `description`, `serviceType`, `provider`, `areaServed`, and `BreadcrumbList`. Each sub-page also warrants a `FAQPage` schema for "how does [service] work" and "how much does [service] cost" queries. Priority: Phase 1 (implement alongside the routes).
- `/work` index: `ItemList` schema listing all case study slugs with `name` and `url` per item, matching the pattern on `/engineers`. Priority: Phase 2.

---

## 9. Known Remaining Work

**Technical items carried forward from June 9, 2026 (unchanged):**

- Dashboard routes are not yet protected by real auth. `docs/DASHBOARD_MASTER_IMPLEMENTATION.md` defines the source-of-truth auth, RBAC, redirect, shell, route, and QA requirements.
- Initial admin seed not yet implemented: email `dennis@andishi.dev`, password `dennis-andishi@123`, role `admin`, redirect `/admin`.
- Dashboard data is static. Future work replaces mock data with database and API-backed records.
- Client intro request flow surfaces exist but inline scheduling expansion is not fully interactive.
- Developer profile wizard is represented by the welcome/onboarding system but the full multi-step wizard needs implementation.
- Admin CRUD modals, TanStack Table sorting/filtering, dnd-kit drag-and-drop, real charts, Stripe/payment integration, Crisp API integration, and content write flows are not wired.
- Visual QA across 375px, 768px, 1280px, and 1440px has not been completed.

**New items from June 2026 repositioning:**

Public-facing copy updates (no new routes, no structural changes):

- Homepage: hero copy, proof strip signals, and CTA hierarchy shift to software-delivery-first.
- `public/llms.txt`: software development-first description (see Section 4 for suggested rewrite).
- `public/pricing.md`: project and delivery engagements lead; talent placement rates secondary.
- `/about`: reframe company narrative around software delivery.
- `/contact`: lead intent shifts to project inquiry.
- `/start-project`: shift default framing from hiring brief to project and engagement brief.
- `/hire`: intro copy updated to position talent as one delivery mode.
- All four `/skills/[domain]` pages: dual-track structure with delivery as the lead.
- `/studio`: reframe from "secondary arm" to local-market delivery track.
- Root layout `Organization` schema `description` field.

New routes and data (structural changes):

- `/services` full revamp: existing page rebuilt as primary software services hub.
- `/services/[slug]` implementation: six sub-pages for each service line.
- `public/services.md`: new machine-readable service catalog.
- `src/data/services.ts`: new data file for the services hub and sub-pages.
- `src/data/work.ts` update: `service` and `vertical` tags on all case study entries.
- `ServiceCard` component: for the `/services` hub layout.
- `DualTrackCTA` component: for `/skills/[domain]` and homepage secondary CTA zones.
- `/work` filter update: filter-by-service and filter-by-vertical controls.
- `/blog/category/[slug]`: new categories for `product-development`, `case-studies`, `engineering-process`.
- Sitemap update: add `/services/[slug]` routes, update priority weights.
- All new schema targets listed in Section 8.

Navigation changes:

- Primary nav: swap `/hire` for `/services`; remove `/engineers` from primary nav.
- Footer: restructure link groups per Section 7.
- Header CTA: update label from "Hire Engineers" to "Start a Project."
- All internal talent-adjacent CTAs on studio and skills pages updated to dual-track routing.

---

## 10. Verification Status

Current requested verification gate:

- `npx tsc --noEmit`

Latest known status:

- `npx tsc --noEmit`: passed as of June 9, 2026.
- Lint and build are not the current requested verification gates.
- Do not run production builds unless explicitly requested.
- After Phase 0 copy updates and Phase 1 route implementations are applied, re-run `npx tsc --noEmit` to confirm no regressions before moving to Phase 2.

---

## 11. Next Recommended Implementation Order

Updated to reflect the June 2026 repositioning. The public-facing software studio pivot takes priority before the next dashboard implementation phase. Phased to minimize scope overlap and allow content work to run in parallel with development work.

**Phase 0 - Copy and content updates (no new routes, no new components):**

1. Update `public/llms.txt`: software development-first description (see Section 4).
2. Update `public/pricing.md`: delivery engagements lead; talent rates secondary.
3. Update homepage (`/`) hero copy, proof strip signals, and CTA labels.
4. Update `/about`: reframe company narrative.
5. Update `/contact` and `/start-project`: project inquiry as default intent.
6. Update root layout `Organization` schema `description`.

Run `npx tsc --noEmit` after Phase 0 before proceeding.

**Phase 1 - Services hub (new route group, new data file):**

7. Create `src/data/services.ts` with all six service line definitions.
8. Revamp `/services` route: rebuild as primary software services hub with `ServiceCard` grid.
9. Implement all six `/services/[slug]` sub-pages.
10. Add `Service`, `FAQPage`, and `BreadcrumbList` schema to each sub-page.
11. Create `public/services.md`.
12. Update sitemap to include new service routes with correct priority weights.
13. Update primary nav: `/services` replaces `/hire`; move talent links to footer.
14. Update header CTA label to "Start a Project."

Run `npx tsc --noEmit` after Phase 1.

**Phase 2 - Proof layer and capability pages:**

15. Update `src/data/work.ts`: add `service` and `vertical` tags to all case study entries.
16. Add filter-by-service and filter-by-vertical to `/work`.
17. Add `ItemList` schema to `/work`.
18. Update all four `/skills/[domain]` pages to dual-track structure (delivery lead, talent secondary).
19. Update `Service` schema on all `/skills/[domain]` pages.
20. Implement `DualTrackCTA` component; replace single-intent CTAs on skills pages and homepage secondary zone.
21. Update `/studio` copy and cross-links.
22. Update `/hire` intro copy.
23. Add new blog categories: `product-development`, `case-studies`, `engineering-process`.

Run `npx tsc --noEmit` after Phase 2.

**Phase 3 - Footer and internal link audit:**

24. Restructure footer nav groups per Section 7.
25. Audit all internal CTA links across public pages: confirm build-with-us track routes to `/start-project` and hire-an-engineer track routes to `/hire`.
26. Update `public/engineers.md`: add opening note on team bench positioning.
27. Visual QA across 375px, 768px, 1280px, and 1440px for all updated public pages.

**Phase 4 - Dashboard (continue from June 9, 2026 plan):**

Follow `docs/DASHBOARD_MASTER_IMPLEMENTATION.md` Part 10. Condensed sequence:

28. Implement auth/session utilities, entity types, role redirects, route guards, and the seed admin account.
29. Upgrade the shared dashboard shell: mobile drawer, breadcrumbs, command menu, account menu, notification menu, and role context.
30. Build admin command surfaces: overview, briefs, matches, engineers, clients, placements, revenue, content, and settings.
31. Complete the client workspace: overview, brief, matches and intro request flow, team, projects, messages, invoices, and settings.
32. Complete the developer workspace: profile wizard, overview, profile, projects, time, earnings, messages, and settings.
33. Wire Crisp identity, GA4 dataLayer events, and Stripe placeholders as specified in the master doc.
34. Complete responsive, accessibility, loading, error, and empty-state QA across all dashboard routes.

Update this audit again after Phase 4 QA is complete.
