# Andishi v3 Progress Tracker

Last updated: May 8, 2026

## Current Phase

Talent-first repositioning is implemented across the public site. The project has moved from a project-studio-first language system to a tech talent outsourcing narrative based on `docs/andishi-v3-content-system.md`.

Current workstream: documentation sync, TypeScript verification, commit, and GitHub push.

## Completed in the Current Pass

- Reframed the public site around senior African engineers for global startups.
- Updated metadata, Open Graph, Twitter metadata, Organization schema, and `public/llms.txt`.
- Updated navbar, footer, CTAs, and shared site labels to point toward hiring engineers.
- Reworked homepage copy across hero, proof, problem framing, process, case studies, comparison, FAQ, founder preview, newsletter, and final CTA.
- Reworked services page into a talent capability and engagement-model page.
- Reworked work page language so case studies act as proof of engineer capability.
- Reworked about page to explain the talent mission while preserving the studio as proof-of-work.
- Reworked contact, start hiring, and login pages around hiring briefs, shortlists, interviews, onboarding, and placement progress.
- Increased supporting text sizes where task-critical copy was too small.
- Strengthened text contrast and glass borders through global CSS tokens.
- Preserved the existing visual direction: glass surfaces, patterned artwork, Tabler icons, mono numerals, and restrained violet/cyan brand energy.

## Implemented Public Routes

| Route | Current status |
|---|---|
| `/` | Talent-first landing page complete. |
| `/services` | Talent services/capabilities page updated. |
| `/work` | Case-study proof page updated. |
| `/about` | Talent mission and founder story updated. |
| `/contact` | Hiring conversation page updated. |
| `/start-project` | Legacy route name, now functioning as a hiring brief/onboarding flow. |
| `/login` | Hiring workspace login page updated. |

## Documentation Updated

- `docs/V3_CURRENT_STATE_AUDIT.md`
- `docs/PROJECT_PROGRESS.md`
- `docs/THEME_GUIDE.md`
- `docs/andishi-v3-content-system.md` remains the content strategy source of truth.

## Next Milestones

1. Information architecture
   - Add `/hire` as the canonical hiring process page.
   - Add `/engineers` for talent directory/profile-led proof.
   - Decide whether `/services` remains a talent-services hub or moves studio content to `/studio`.

2. Skill landing pages
   - `/skills/fullstack`
   - `/skills/ai`
   - `/skills/aws`
   - `/skills/web3`

3. AI-search and machine-readable content
   - Add `/engineers.md`.
   - Add `/pricing.md`.
   - Add expanded `/hire/faq`.
   - Add glossary or blog entries for African tech talent terms.

4. Structured data
   - Expand FAQPage schema.
   - Add Service schema for skill domains.
   - Add Person schema for founder content.
   - Enrich Organization schema as the public entity matures.

5. Cleanup
   - Resolve the remaining unused `Comparison` lint warning in `src/app/page.tsx`.
   - Replace remaining raw `<img>` usage where `next/image` is appropriate.
   - Review legacy deleted assets/docs before final long-term cleanup.

## Verification

Requested verification gate for this handoff:

- `npx tsc --noEmit`

Already completed earlier in the pass:

- `npm run lint`: passed with warnings only.
- `npm run build`: passed before the requested verification scope was narrowed.

Visual/browser verification is intentionally left to the user for this pass.

## GitHub

Active source remote:

- `https://github.com/Charanos/andishi-v3.git`

Publishing goal for this pass:

- Commit the talent-first copy, typography, and documentation updates.
- Push the current branch to GitHub.

## Design Rules To Preserve

- Talent is the primary product. Studio is secondary and should read as proof-of-work.
- Use `hire@andishi.dev` for direct hiring inquiries.
- Preferred CTA language: "Hire engineers", "Start matching", "Start a conversation", "See our engineers".
- Avoid leading with "project studio", "digital product studio", or local SME delivery language unless the context is explicitly the studio arm.
- Keep body copy factual, specific, and extraction-friendly for AI search.
- Keep supporting copy readable; avoid tiny helper text on forms and onboarding flows.
- No `font-bold` or `font-semibold`.
- `font-medium` is allowed for nav labels, buttons, compact UI, chips, and card titles.
- Use Tabler icons only.
- Use `font-mono` for stats, percentages, timelines, IDs, and structured technical values.
- Avoid decorative sparkle/star icons and generic grid-pattern backgrounds.
