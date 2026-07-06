# Andishi v3 Progress Tracker

Last updated: July 6, 2026

## Project Status ✅

The project has transitioned from a talent supply service to a **software development studio** (primary) with staff augmentation as a secondary service.

- **Phase A - Backend Architecture Revamp**: Complete. We have updated schemas, validation libraries, public API endpoints for inquiry intake and portfolio retrieval, email templates, and executed Neon DB migrations successfully.
- **Phase B - Frontend Pivot & Docs Updates**: Complete. All navigation configurations, public marketing landing pages, dynamic services sub-pages, sitemap, capability pages, onboarding forms, and type-checks are now functional.
- **Phase C - Contact & Communication Overhaul**: Complete. General inquiries API, map integrations, collapsible coordinates banner, branded WhatsApp FAB, and typography pivot to Nunito are fully implemented.

This tracker covers the public marketing site pivot (Phases A-C). The much larger internal admin/dev/client dashboard and ERP backend build (RBAC, finance ledger, CRM, CMS, careers, delivery/PM, support, scheduling, and the ongoing admin-dashboard-UI wiring pass) is tracked separately in [docs/backend/BACKEND_ARCHITECTURE_MASTER.md](backend/BACKEND_ARCHITECTURE_MASTER.md) (Part 12's phased roadmap) - see that doc for current status on the backend/dashboard side, and [docs/PLATFORM_GROUP_REFINEMENT_GUIDE.md](PLATFORM_GROUP_REFINEMENT_GUIDE.md) for the most recent admin-dashboard refinement pass (Platform nav group: User Mgmt, Audit Reports, Profile, Settings - real backend wiring, a new governance-controls feature, and fixes to shared components used across ~16 admin pages).

---

## Completed Milestones

### Phase A: Backend Revamp
- **Database Schemas**: Migrated tables (`briefs`, `projects`, `organizations`) with full support for build vs. hire briefs, service types, and client verticals.
- **Types & Validations**: Implemented strict discriminator types (`BuildBrief`, `HireBrief`) and Zod schemas for client contact and scoping intakes.
- **API Endpoints**: Deployed public endpoints (`GET /api/work`, `POST /api/contact`, `/api/briefs`).
- **Database Migration**: Executed Neon DB migrations using a custom standalone migration script.

### Phase B: Frontend Pivot & Docs
- **B1: Outdated Documentation Revamp**: Updated progress trackers, specs, and current state audits. Archived legacy files under `docs/archive/`.
- **B2: Navigation & Footer Restructure**: Re-ordered header nav links (Services, Work, Skills, About), updated header CTA to "Start a Project", and built the five-column footer.
- **B3: Homepage Landing Page Overhaul**: Upgraded hero copy, dual-track CTAs, product statistics, services grid (2x4 layout), four-step process delivery timeline, comparison table, and founder section.
- **B4: Services Hub & Slug Sub-pages**: Overhauled `/services` with a clean `ServiceCard` grid, created dynamic `/services/[slug]` detail page mapping with full SEO rich schemas (`FAQPage`, `Service`, `BreadcrumbList`).
- **B5: Copy Updates & Public Files**: Revamped `/about`, `/contact`, and `/start-project` steps to default to product scoping. Updated `public/llms.txt`, `pricing.md`, and generated `services.md`.
- **B6: Capability & Portfolio Pages**: Added service and vertical filters to the `/work` client case study grid. Upgraded all four `/skills/[domain]` sub-pages with `DualTrackCTA`, schema updates, and studio copy.
- **B7: Verification & Optimization**: Integrated the dynamic service slugs in `sitemap.ts`. Resolved all workspace compiler warnings (unescaped characters, type safety checks on dynamic verticals, unused variables).

### Phase C: Contact & Communication Overhaul (June 2026)
- **General Inquiry API**: Integrated `POST /api/general-inquiry` with input validations, console logging, and admin Resend email routing.
- **Collapsible Coordinates Banner**: Added centered address & coordinates bar above the navbar in `navbar.tsx`, tracking closed state via `localStorage`.
- **Branded WhatsApp FAB**: Implemented branded WhatsApp green trigger button (`#25D366`) and popover chat widget, with path-hiding filters for admin/contact pages.
- **Contact Page Revamp**: Overhauled `/contact` into a sleek general inquiry portal featuring direct contact widgets and standard color Google Map centered at `1°11'37.1"S 36°54'18.9"E`.
- **Global Typography Pivot**: Switched global branding font from Outfit to Nunito across layouts and CSS style variables.
- **Lint Warning Cleanups**: Resolved sync setState warnings, unused imports, and generic catches.
- **Header Nav Adjustments**: Replaced the Skills link with the Contact link in `siteConfig` config, and included a glassmorphic Login button on both desktop and mobile header bars.
- **Mobile Card Destructuring**: Destructured cards and sections (FounderContext, Values, StudioStatus, and Signoff) on both About and Service Detail pages to form borderless list panels on mobile.
- **Timeline & Sidebar Overhauls**: Replaced card-based grids with a real vertical line timeline on the About page. Designed a custom dotted visual timeline tracker within the left story sidebar.
- **Mobile Nav Sheet Revamp**: Upgraded the expanded mobile drawer into a premium slide-down navigation overlay with side-by-side rounded action buttons, numbered links, and location details inline at the footer.
- **Location Banner UX**: Bound location banner displaying visibility conditionally (`bannerOpen && !mobileOpen`) to gracefully resolve header layout space and avoid overlapping expanded mobile menus.

---

## Technical Audit & Verification Pass
- **Type Safety**: Verified via `npx tsc --noEmit` and `npm run typecheck` (Passes cleanly with exit code 0).
- **Production Build**: Verified successful production bundling via `npm run build` (Passes cleanly with exit code 0).
- **Environment**: PowerShell script execution policy set to `RemoteSigned` for the local workspace current user.

