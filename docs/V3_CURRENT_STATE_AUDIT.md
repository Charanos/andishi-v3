# Andishi v3 Current State Audit

Last updated: May 8, 2026

This audit reflects the current public v3 site after the May 2026 positioning shift from a project-studio-first website to a tech talent outsourcing brand. The source of truth for content direction is `docs/andishi-v3-content-system.md`.

## 1. Current Positioning

Andishi now leads with senior African engineering talent for global startups. The product studio still exists, but it is secondary: it functions as proof-of-work for the engineers Andishi places and as a separate build track for African businesses.

Primary buyer:
- Startup CTOs, founders, and engineering leads in the US, UK, EU, GCC, and similar global markets.

Primary promise:
- Vetted senior African engineers matched to real startup engineering needs without the long recruiting cycle, junior-heavy agency model, or marketplace filtering burden.

Core proof:
- 50+ engineers placed globally.
- Average time-to-placement framed around 8 days.
- Skill coverage across full-stack, AI, cloud/AWS, Web3/blockchain, backend/API systems, and mobile.
- Studio work retained as case-study evidence.

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
| Analytics | Vercel Analytics and Speed Insights packages present |

## 3. Implemented Route Map

| Route | Status | Current role |
|---|---|---|
| `/` | Implemented | Talent-first landing page with hero, proof, process, comparison, FAQ, founder, newsletter, and final CTA. |
| `/services` | Implemented | Talent capability and engagement-model page. Copy now represents engineer skill lines rather than classic studio services. |
| `/work` | Implemented | Case-study and proof page framed as work shipped by Andishi engineers. |
| `/about` | Implemented | Origin, mission, founder, operating principles, and talent network positioning. |
| `/contact` | Implemented | Talent brief/contact route for hiring conversations. |
| `/start-project` | Implemented with legacy path name | Hiring brief/onboarding flow. The route label is legacy, but the copy now asks for roles, stack, timeline, and engagement model. |
| `/login` | Implemented | Client hiring workspace login experience, positioned around shortlists, interviews, and onboarding. |
| `/sitemap.xml` | Implemented | Static sitemap route. |
| Global `not-found.tsx` | Implemented | Branded fallback route. |
| Global `loading.tsx` | Implemented | App-level loading boundary. |

## 4. Implemented Content Shift

Completed as part of the v3.1 content pass:

- Site metadata, Open Graph, Twitter metadata, and Organization schema now describe Andishi as an African engineering talent company.
- `public/llms.txt` now exposes the talent-first summary and key pages for AI systems.
- Navbar language now prioritizes engineers, case studies, services, about, contact, login, and a hiring CTA.
- Footer tagline, column labels, legal line, and CTA language now support the talent outsourcing narrative.
- Homepage hero, proof strip, process, problem framing, case studies, comparison rows, FAQ, founder preview, newsletter, and final CTA now speak to hiring senior engineers.
- Services page now presents six talent lines: full-stack, AI, cloud/AWS, Web3, backend/API systems, and mobile.
- Start hiring/onboarding page copy now asks about role needs, team gaps, engagement model, and timing.
- Contact page copy now supports hiring briefs rather than project-studio inquiries.
- Login page copy now frames the workspace around profiles, interviews, onboarding, and placement progress.
- Work and About pages now use studio output as proof of engineer capability rather than the primary product.

## 5. Typography and Legibility Improvements

The May 8 pass also adjusted the global type and contrast foundation:

- `--on-surface-dim` is stronger in light and dark themes for readable supporting copy.
- `.body-md` was increased slightly for more comfortable paragraph reading.
- `.label-caps` was increased slightly so section labels and small UI metadata do not feel fragile.
- Glass border tokens were strengthened to improve edge definition in both themes.
- Small helper text in contact, start hiring, login, services, and about surfaces was increased where it affected task comprehension.

## 6. Remaining Page Map From Content System

These pages are recommended by `docs/andishi-v3-content-system.md` but are not yet implemented as standalone routes:

| Page | Purpose | Priority |
|---|---|---|
| `/engineers` | Talent directory or profile-led proof page. | High |
| `/hire` | Dedicated explanation of the hiring process, guarantees, and engagement structure. | High |
| `/skills/ai` | AI and LLM engineer landing page. | High |
| `/skills/web3` | Web3/blockchain engineer landing page. | Medium |
| `/skills/aws` | Cloud/AWS engineer landing page. | Medium |
| `/skills/fullstack` | Full-stack engineer landing page. | High |
| `/studio` | Secondary studio arm page separated from the talent offer. | Medium |
| `/blog` | Authority, hiring education, and AI-search content hub. | Medium |
| `/hire/faq` | Expanded FAQ for buyer objections and AI extraction. | Medium |
| `/glossary` | African tech talent glossary and entity-building content. | Low |
| `/engineers.md` | Machine-readable talent directory for AI agents. | High |
| `/pricing.md` | Machine-readable engagement model and pricing/range information. | Medium |

## 7. Known Cleanup Items

- `/services` and `/start-project` still carry legacy route names from the studio-era site. Copy is now talent-first, but future routing can add `/hire` and `/studio` to make the IA clearer.
- `src/app/page.tsx` still has an ESLint warning for an unused `Comparison` function.
- A small number of `<img>` warnings remain from the Next.js lint rule recommending `next/image`.
- Browser verification was not completed in this pass because the requested verification gate is `npx tsc --noEmit`.
- Deleted legacy files are present in the worktree and should be reviewed as part of the commit scope: `docs/andishi-landing-page-content.md`, `docs/andishi-landing-page-content.pdf`, and `hero maybe.png`.

## 8. Verification Status

Latest completed checks during this pass:

- `npm run lint`: passed with warnings only.
- `npm run build`: passed before the user narrowed the requested verification gate.

Current requested release gate:

- `npx tsc --noEmit`

## 9. Next Recommended Implementation Order

1. Add `/hire` as the canonical hiring process page and route primary hiring CTAs there.
2. Add `/engineers` with profile cards, skill filters, seniority signals, timezone overlap, and availability states.
3. Add `/skills/fullstack` and `/skills/ai` first, then Web3 and AWS specialty pages.
4. Split the studio story into `/studio` so `/services` can either redirect, become a talent-services hub, or sit as a hybrid page intentionally.
5. Add machine-readable `/engineers.md` and `/pricing.md`.
6. Expand structured data: FAQPage, Service schema per skill domain, Person schema for founder, and richer Organization fields.
7. Resolve lint warnings and run the visual QA pass the user plans to handle separately.
