# Andishi v3 Theme Guide

Last updated: June 10, 2026

This guide documents the current visual, typography, and copy rules for the Andishi v3 public site and the dashboard workspaces that now inherit its design language. The site positions Andishi as a senior African engineering talent company for global startups, with the studio arm kept as secondary proof-of-work. For dashboard execution details, `docs/DASHBOARD_MASTER_IMPLEMENTATION.md` is the source of truth.

## 1. Positioning Rules

- Primary offer: senior, vetted African engineers for global startups.
- Secondary offer: product studio/build work, used as proof that Andishi knows what strong engineering output looks like.
- Primary buyer: startup CTOs, founders, and engineering leads who need senior capacity quickly.
- Primary email: `hire@andishi.dev`.
- Preferred CTA language: "Hire engineers", "Start matching", "Start a conversation", "See our engineers".
- Avoid using "project studio" as the lead description of Andishi.
- When studio work appears, frame it as shipped proof by Andishi engineers or as a separate studio track.

## 2. Current Page Quality Bar

- Homepage: talent-first hero, concrete proof, hiring pain, process, skill/service proof, case-study evidence, founder authority, dual client/developer platform visibility, FAQ/newsletter, and final CTA.
- Services page: capability and engagement-model page for full-stack, AI, cloud/AWS, Web3, backend/API, and mobile engineering talent.
- Work page: case studies framed as proof of what Andishi engineers can ship.
- About page: founder, mission, operating principles, and Africa-wide talent network story.
- Contact page: hiring conversation and talent brief entry point.
- Start Project page: legacy route name, but current UX is a hiring brief/onboarding flow.
- Login page: client hiring workspace for profiles, interviews, onboarding, and placement progress.
- Dashboard pages: role-aware internal workspaces for admin, client, and developer operations. They should inherit the public site's craft while becoming denser, calmer, and more task-oriented.

## 3. Color System

Use the global CSS tokens in `src/app/globals.css`. Avoid one-off color palettes unless a component has a specific reason.

- Brand depth: use the existing CSS tokens, not raw violet/purple utilities.
- Cyan/secondary token: data signal, live indicators, active accents, technical highlights, and subtle focus rings. It is not the default filled CTA background.
- Green: success/status only.
- Neutral surfaces: glass cards, panels, input surfaces, and page foundations.

Current high-legibility text tokens:

- Light mode `--on-surface`: `#160B2F`
- Light mode `--on-surface-dim`: `#3A2854`
- Dark mode `--on-surface`: `#F4EEFF`
- Dark mode `--on-surface-dim`: `#D8CEF5`

Rules:

- Do not use raw `text-white` unless the text sits inside a filled CTA or another surface where token text is less legible.
- Keep supporting copy on `--on-surface-dim` rather than low-opacity text.
- Glass borders should remain visible enough to define surfaces in both themes.
- Avoid generic dark SaaS styling, raw purple utilities, heavy purple gradients, or decorative color blobs.

## 4. Typography Rules

Font families:

- Outfit: body copy, labels, navigation, form controls, buttons, dense UI, and operational metadata.
- Cormorant Garamond via `--font-serif` / `.title-serif`: public display headlines, landing section titles, dashboard page titles, and major dashboard section titles.
- JetBrains Mono: stats, percentages, IDs, durations, code-like labels, and structured technical values.

Weights:

- Do not use Tailwind `font-bold` or `font-semibold`.
- Use `font-normal` for public display headlines when the serif face is used at hero scale.
- Use `font-medium` for dashboard page titles and major dashboard section titles so the serif accent stays crisp inside operational surfaces.
- Use `font-medium` for nav, buttons, chips, compact labels, and card titles.

Serif accent rules:

- Use `.title-serif`, not ad hoc font-family declarations.
- Do not apply the serif face to every UI label. It is an accent for hierarchy, not a full dashboard takeover.
- Public landing titles should use responsive clamp values that are slightly larger on mobile and restrained on large screens.
- Dashboard page titles should use the shared `DashboardPageHeader` treatment, currently around `clamp(2.05rem,3vw,2.75rem)` with `font-medium` and shell-level dashboard serif tuning.
- Dashboard section titles should use the shared/local section-header clamp, currently around `clamp(1.48rem,2vw,1.9rem)`.
- Dashboard title hierarchy is applied through the shell-level `.dashboard-typography` wrapper. This keeps serif titles consistent across admin, client, and developer dashboards without turning dense UI labels into serif text.
- Keep card labels, table headings, chips, body copy, and form labels in Outfit for readability and density.
- Eyebrows and supporting copy should never visually overpower the serif title they introduce. If they do, increase the title through the shared heading primitive rather than enlarging labels.

Global utility direction:

- `.body-md` is slightly larger than the original foundation size for better paragraph legibility.
- `.label-caps` is slightly larger so section labels and form metadata do not feel too small.
- Small form helper text should generally sit at `text-sm` or above unless the surrounding UI is very compact.

Readable ranges:

- Long body copy: around `1rem` to `1.08rem`, with generous line height.
- Card descriptions: avoid dropping below `0.92rem`.
- Form helper text: prefer `0.9rem` to `0.98rem`.
- Labels and eyebrow text: may be compact, but must remain legible on mobile.

## 5. CTA Treatment

- Primary CTAs should be short, concrete, and hiring-oriented.
- Use one primary action plus one restrained secondary action where needed.
- Primary filled CTAs on the public site use the current implementation pattern: `background: var(--on-surface)` with `color: var(--bg)`, rounded-full geometry, a restrained depth shadow, and a subtle hover lift. Dashboard primary actions should follow this same treatment so private surfaces feel connected to the landing pages.
- Secondary CTAs should use tokenized glass surfaces, neutral borders, and `--on-surface` text. Use cyan/secondary for focus, activity, badges, and data marks, not as the default filled button color.
- Hover states should use subtle lift, shadow, or border changes rather than opacity-only changes.
- Final CTA surfaces should reuse `src/components/ui/final-cta-artwork.tsx` where appropriate.

## 6. Glass and Surface Recipe

Standard glass cards:

- Background: tokenized glass surface or `bg-white/5` in dark mode and translucent white in light mode.
- Blur: `backdrop-blur-xl` or `backdrop-blur-2xl`.
- Border: tokenized glass border from global CSS.
- Shadow: restrained, soft, and tied to depth rather than glow.

Use cards for:

- Repeated items.
- Forms.
- Modals and framed tool surfaces.
- Case-study cards and profile cards.

Avoid cards for:

- Whole page sections.
- Nested card stacks.
- Decorative wrappers with no functional purpose.

## 7. Pattern and Artwork Direction

Preferred:

- Plus/dot textures.
- Etched panels and hairlines.
- Theme-swapped image layers.
- Realistic interface artifacts.
- Final CTA artwork inside CTA cards.

Avoid:

- Regular grid backgrounds.
- Large radial color blobs.
- Sparkle/star decorative icons.
- Generic sci-fi effects.
- SVG hero illustrations when a real or generated bitmap/image asset better communicates the subject.

## 8. Icons

- Use `@tabler/icons-react`.
- Active or primary icons may use `stroke={2}`.
- Secondary icons should generally use `stroke={1.5}`.
- Standard UI icon size: 18px to 22px depending on the control.
- Do not mix in Lucide, Font Awesome, or inline decorative icons for normal UI.

## 9. Artifact Windows

Process and proof sections can use realistic interface artifacts:

- Mini browser/window chrome.
- Terminal-like panels for technical handoff or status.
- Profile, shortlist, sprint, and onboarding surfaces.
- Dual client/developer workspace previews for showing both sides of a match.
- `font-mono` for command text, durations, role IDs, percentages, and status values.

Artifacts should feel like actual outputs from a hiring or engineering workflow, not generic dashboard decoration.

## 10. Layout and Responsiveness

- Public pages should use the shared navbar and footer.
- Focused utility flows such as `/start-project` and `/login` may hide the footer.
- Public and dashboard sections should use the same page-width rhythm:
  - outer shell gutters: `px-5 sm:px-8 lg:px-10`
  - inner content cap: `mx-auto w-full max-w-[92rem]`
  - intentionally narrow text, forms, drawers, and prose can use smaller inner caps.
- Dashboard overview pages should now favor breathable operational rhythm over compressed above-the-fold density:
  - page stack: `gap-9 md:gap-10 lg:gap-12`
  - major section card offset: `my-8` or `mt-6`, not `mt-2`
  - primary analytical grids should not force two-column layouts until the viewport can genuinely support them.
  - charts should have stable vertical room so data remains readable, especially in KPI and pulse panels.
- Operations pages should share the workflow order Briefs -> Shortlists -> Pipeline -> Placements through `AdminWorkflowNav` and sidebar order.
- Network pages should share `AdminNetworkNav` between Engineers and Clients so talent supply and account demand stay visibly connected.
- Workflow navs should wrap on mobile instead of creating horizontal scrollbars.
- Workflow navs are wayfinding, not KPI surfaces. Avoid duplicate stat pills when the page already has metric cards.
- Pipeline-style observability should be a full-width chart section; command context should sit below as its own full-width section when a side rail creates dead space.
- Pull section titles and descriptions outside dense cards when possible. Cards should hold the data and controls; headings should organize the canvas.
- Text must not overlap controls or artwork on mobile or wide desktop.
- Fixed-format UI elements should have stable dimensions so hover states and labels do not shift layout.
- Do not scale font sizes with viewport width.
- Letter spacing should remain non-negative.

## 11. Dashboard Design Rules

- Dashboard pages are private operating surfaces, not landing pages.
- Follow `docs/DASHBOARD_MASTER_IMPLEMENTATION.md` Part 4 for dashboard spacing, typography, colour semantics, surfaces, and mobile behaviour.
- Do not create marketing heroes inside `/admin`, `/dashboard`, or `/dev`.
- Use dense but breathable panels, tables, drawers, timelines, and metric strips.
- Do not shrink dashboard typography below practical readability for active work. Page titles and major section titles now use the serif accent, while body/helper copy should generally stay at `0.84rem` or larger and mono microcopy should only drop smaller when it is purely decorative metadata.
- Metric cards must share structural rules: stable minimum heights, consistent header/value/trend/chart placement, and chart regions pinned toward the lower part of the card.
- Use the right chart for the data: line or area charts for time trends, bar charts for discrete operational volume, and donut charts for composition such as talent supply. Avoid repeating line graphs everywhere.
- Sidebar behavior must stay precise: desktop sidebar pins to the far-left viewport edge, collapsed mode is logo-only with compact icons, and mobile uses five priority bottom-nav icons plus a More drawer.
- Support is a primary operational affordance: client/developer workspaces use a floating support chat, support pages keep admin resolver context visible, and admin support operates as the resolver queue.
- Topbar behavior must stay compact and functional: small screens show the Andishi mark instead of search, desktop search stays left-aligned inside the floating navbar, and dropdowns close on outside click and Escape.
- Notification badges should sit absolutely on the icon button container, not inline with the icon.
- Calendar current-day highlights must keep text readable in both light and dark mode.
- Full-page dashboard loading state is logo-only with a soft pulse; do not add loading copy unless a specific page requires it.
- Keep role context visible: admin command, client hiring workspace, developer workbench.
- Use glass only where it improves grouping; admin tables and operational panels may be quieter.
- Prefer drawers for entity detail and modals for focused decisions only.
- Large-screen modals and drawers should use the available width where detail density benefits from it, while mobile versions should become bottom/full-screen sheets with internal scroll.
- Background page scroll must be locked while modals, drawers, and focused overlay panels are open.
- Mobile cards must use `min-w-0`, wrapped text, stable chart heights, and card-style table rows when tabular data would otherwise overflow.
- Every dashboard page needs a clear next action, empty state, loading state, and error state.
- The first authenticated admin seed is `dennis@andishi.dev` with role `admin`; keep the plaintext password only in seed input/docs, never in runtime records.

## 12. Accessibility and Legibility

- Keep focus states visible.
- Use descriptive labels for form inputs and CTAs.
- Do not rely on low opacity for important copy.
- Avoid text over busy image areas unless veiled by a controlled overlay.
- Confirm mobile helper text is large enough to read without zooming.

## 13. Verification Standard

Current requested gate:

- `npx tsc --noEmit`

Other checks remain useful when requested:

- `npm run lint`
- `npm run build` only when explicitly requested or when a task requires production verification.
- Mobile visual checks at 375px, 390px, and 768px.
- Desktop visual checks at 1440px and wide screens.

## 14. GitHub

Active source remote:

- `https://github.com/Charanos/andishi-v3.git`

Docs and implementation should stay in sync before publishing. When the copy system changes, update:

- `docs/andishi-v3-content-system.md`
- `docs/V3_CURRENT_STATE_AUDIT.md`
- `docs/PROJECT_PROGRESS.md`
- `docs/THEME_GUIDE.md`
- `docs/DASHBOARD_MASTER_IMPLEMENTATION.md`
- `docs/DASHBOARD_CLAUDE_CODE_PROMPT.md`
- `docs/DASHBOARD_IMPLEMENTATION_PLAYBOOK.md`
- `docs/Component_Library.md`
- `public/llms.txt`
