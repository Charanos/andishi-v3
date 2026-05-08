# Andishi v3 Current State Audit

Last updated: May 9, 2026

This audit reflects the current v3 site after the May 2026 shift from a project-studio-first website to a senior African engineering talent brand, plus the first internal-pages and dashboard execution pass from `docs/Andishi-v3-Internal-Pages-Dashboard-Implementation-spec.md`.

## 1. Current Positioning

Andishi leads with senior African engineering talent for global startups. The studio arm still exists, but it is now explicitly secondary: it functions as proof-of-work and as a separate build track for African businesses.

Primary buyer:

- Startup CTOs, founders, and engineering leads in the US, UK, EU, GCC, and similar global markets.

Primary promise:

- Vetted senior African engineers matched to real startup engineering needs without the long recruiting cycle, junior-heavy agency model, or marketplace filtering burden.

Core proof:

- 50+ engineers placed globally.
- Average time-to-placement framed around 8 days.
- 30-day replacement guarantee.
- Skill coverage across full-stack, AI, cloud/AWS, Web3/blockchain, backend/API systems, and mobile.
- Studio work retained as case-study evidence and separated into its own route.

## 2. Technology Stack

| Layer | Current stack |
|---|---|
| Framework | Next.js App Router |
| Runtime package version | Next.js 16.x |
| UI | React 19.x |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 with project CSS tokens |
| Motion | Framer Motion |
| Theme | next-themes |
| Icons | `@tabler/icons-react` |
| Content/data | Static TypeScript data files for launch speed |

## 3. Public Route Map

| Route | Status | Current role |
|---|---|---|
| `/` | Implemented | Talent-first landing page with hero, proof, process, case studies, founder authority, dual client/developer platform visibility, FAQ/newsletter, and final CTA. |
| `/hire` | Implemented | Canonical hiring process page with timeline, guarantees, engagement models, ICP callout, FAQ teaser, final CTA, and JSON-LD. |
| `/hire/faq` | Implemented | Expanded buyer FAQ with grouped accordion content, sticky desktop topic navigation, and FAQPage JSON-LD. |
| `/engineers` | Implemented | Static engineer directory with role filters, availability filter, search, profile cards, and ItemList schema. |
| `/engineers/[slug]` | Implemented | Individual engineer profiles with bio, work history, highlights, vetting badges, related engineers, and Person schema. |
| `/skills` | Implemented | Skill-domain hub linking to the active domain pages. |
| `/skills/fullstack` | Implemented | Domain page for senior full-stack engineering talent. |
| `/skills/ai` | Implemented | Domain page for AI product and LLM integration engineers. |
| `/skills/web3` | Implemented | Domain page for Web3/blockchain engineering talent. |
| `/skills/aws` | Implemented | Domain page for AWS/cloud infrastructure engineering talent. |
| `/studio` | Implemented | Separate studio arm page for African business builds, with studio services, process, featured work, and CTA. |
| `/blog` | Implemented | Blog index with featured post, category chips, and post grid. |
| `/blog/[slug]` | Implemented | Static blog post template with author box, CTA surfaces, related posts, and BlogPosting schema. |
| `/blog/category/[slug]` | Implemented | Category archive pages for blog content. |
| `/services` | Implemented | Talent capability and engagement-model page. Still retained as a legacy/hybrid route and now links to `/studio`. |
| `/work` | Implemented | Case-study and proof page framed as work shipped by Andishi engineers. |
| `/work/[slug]` | Implemented | Individual case-study template with challenge, solution, metrics, CTA, and Article schema. |
| `/about` | Implemented | Origin, mission, founder, operating principles, and talent network positioning. |
| `/contact` | Implemented | Talent brief/contact route for hiring conversations and studio inquiries. |
| `/start-project` | Implemented with legacy path name | Hiring brief/onboarding flow. Kept as the downstream conversion form. |
| `/login` | Implemented | Client hiring workspace login experience. |
| `/legal/privacy` | Implemented | Lightweight privacy policy route. |
| `/legal/terms` | Implemented | Lightweight terms route. |
| `/sitemap.xml` | Implemented | Expanded sitemap including static and dynamic public routes. |
| Global `not-found.tsx` | Implemented | Branded fallback route. |
| Global `loading.tsx` | Implemented | App-level loading boundary. |

## 4. Machine-Readable Files

| File | Status | Purpose |
|---|---|---|
| `public/llms.txt` | Implemented | AI-system summary of Andishi positioning and key pages. |
| `public/engineers.md` | Implemented | Machine-readable overview of the engineer network, skill coverage, availability models, and hiring path. |
| `public/pricing.md` | Implemented | Machine-readable indicative pricing ranges and quote path. |

## 5. Dashboard Route Map

The dashboard system is scaffolded under the App Router route group `src/app/(app)/`. It currently uses static TypeScript data and shared dashboard components; auth, persistence, and external integrations are intentionally future wiring.

| Route group | Status | Current role |
|---|---|---|
| `/admin` | Scaffolded | Super Admin overview with KPI cards and matching pipeline preview. |
| `/admin/engineers` | Scaffolded | Admin engineer directory surface. |
| `/admin/clients` | Scaffolded | Client table surface. |
| `/admin/placements` | Scaffolded | Placement table surface. |
| `/admin/briefs` | Scaffolded | Brief detail/table surface. |
| `/admin/matches` | Scaffolded | Kanban matching pipeline surface. |
| `/admin/revenue` | Scaffolded | Revenue/earnings surface. |
| `/admin/content` | Scaffolded | Content operations table surface. |
| `/admin/settings` | Scaffolded | Settings table surface. |
| `/dashboard` | Scaffolded | Client overview with KPIs, matched profiles, onboarding checklist, and activity feed. |
| `/dashboard/brief` | Scaffolded | Read/edit brief layout placeholder. |
| `/dashboard/matches` | Scaffolded | Client-specific developer profile cards and filters. |
| `/dashboard/team` | Scaffolded | Empty state for post-placement team members. |
| `/dashboard/projects` | Scaffolded | Project cards and milestone progress. |
| `/dashboard/messages` | Scaffolded | Crisp-wrapper placeholder, not custom WebSocket chat. |
| `/dashboard/payments` | Scaffolded | Payment empty state placeholder. |
| `/dashboard/settings` | Scaffolded | Client settings placeholder. |
| `/dev` | Scaffolded | Developer overview with KPIs, earnings card, timer, projects, and onboarding checklist. |
| `/dev/profile` | Scaffolded | Editable-profile placeholder surface. |
| `/dev/projects` | Scaffolded | Developer project cards. |
| `/dev/time` | Scaffolded | Time tracker surface. |
| `/dev/earnings` | Scaffolded | Earnings card and payment table surface. |
| `/dev/messages` | Scaffolded | Crisp-wrapper placeholder. |
| `/dev/settings` | Scaffolded | Developer settings placeholder. |

## 6. Shared Systems Added

Public/shared marketing:

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

Dashboard:

- `src/data/dashboard.ts`
- `src/components/dashboard/app-shell.tsx`
- `src/components/dashboard/role-sidebar.tsx`
- `src/components/dashboard/dashboard-top-nav.tsx`
- `src/components/dashboard/workspace-page.tsx`
- `InsightsCard`, `OnboardingChecklist`, `WelcomeModal`, `EmptyState`, `ActivityFeed`, `ProfileCard`, `ProjectCard`, `KanbanBoard`, `DataTable`, `FilterBar`, `DrawerPanel`, `TimeTracker`, `EarningsCard`, `Sparkline`, `StatusBadge`, and `VettingBadges`.

## 7. Navigation And Link State

- Primary nav now points to `/engineers`, `/hire`, `/skills`, `/work`, and `/login`.
- Header CTA routes to `/hire`.
- Landing-page CTAs now prefer `/hire`, `/engineers`, or `/start-project` depending on intent.
- Footer no longer uses dead `#` links; footer entries now route to live public pages, mailto, legal pages, and the brief form.
- `/services` includes a link to `/studio` for users looking for the studio arm.
- Dashboard routes suppress the public navbar/footer and use the app shell instead.

## 8. Structured Data Status

Implemented JSON-LD coverage includes:

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

## 9. Known Remaining Work

- Dashboard routes are scaffolded but not protected by real auth yet. The spec still calls for role-check redirects from `/login` once auth exists.
- Dashboard data is static. Future work should replace mock data with database/API-backed records.
- Client intro request flow is represented by profile/action surfaces, but the inline scheduling expansion is not fully interactive yet.
- Developer profile wizard is represented by the welcome/onboarding system and profile route, but the full multi-step wizard still needs implementation.
- Admin CRUD modals, TanStack Table sorting/filtering, dnd-kit drag-and-drop, real charts, Stripe/payment integration, Crisp API integration, and content write flows are not wired yet.
- `/services` and `/start-project` still carry legacy route names. Copy and links are talent-first, but future routing can decide whether `/services` remains a talent hub or redirects.
- Visual QA across 375px, 768px, 1280px, and 1440px has not been completed in this pass.

## 10. Verification Status

Current requested verification gate:

- `npx tsc --noEmit`

Latest known status before this audit update:

- `npx tsc --noEmit`: passed.
- `npx eslint src --max-warnings=0`: passed.
- `npm run build`: intentionally skipped after user direction. A previous build attempt timed out and was no longer part of the requested gate.

## 11. Next Recommended Implementation Order

1. Add auth and role redirects for `/login` to `/admin`, `/dashboard`, or `/dev`.
2. Replace static dashboard data with database-backed models for users, engineers, briefs, matches, placements, projects, invoices, and activity events.
3. Complete the client intro request flow inside `/dashboard/matches`.
4. Complete the developer onboarding/profile wizard.
5. Add admin CRUD modals and detail drawers for engineers, clients, briefs, placements, and content.
6. Wire Crisp for messages and keep custom realtime chat out of scope.
7. Add Stripe or manual invoice integration when payment scope is approved.
8. Complete mobile/desktop visual QA and update this audit again after that pass.
