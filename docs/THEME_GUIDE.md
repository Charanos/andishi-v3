# Andishi v3 Theme Guide

Last updated: May 8, 2026

This guide documents the current visual, typography, and copy rules for the Andishi v3 public site. The site now positions Andishi as a senior African engineering talent company for global startups, with the studio arm kept as secondary proof-of-work.

## 1. Positioning Rules

- Primary offer: senior, vetted African engineers for global startups.
- Secondary offer: product studio/build work, used as proof that Andishi knows what strong engineering output looks like.
- Primary buyer: startup CTOs, founders, and engineering leads who need senior capacity quickly.
- Primary email: `hire@andishi.dev`.
- Preferred CTA language: "Hire engineers", "Start matching", "Start a conversation", "See our engineers".
- Avoid using "project studio" as the lead description of Andishi.
- When studio work appears, frame it as shipped proof by Andishi engineers or as a separate studio track.

## 2. Current Page Quality Bar

- Homepage: talent-first hero, concrete proof, hiring pain, process, skill/service proof, case-study evidence, FAQ, founder authority, newsletter, and final CTA.
- Services page: capability and engagement-model page for full-stack, AI, cloud/AWS, Web3, backend/API, and mobile engineering talent.
- Work page: case studies framed as proof of what Andishi engineers can ship.
- About page: founder, mission, operating principles, and Africa-wide talent network story.
- Contact page: hiring conversation and talent brief entry point.
- Start Project page: legacy route name, but current UX is a hiring brief/onboarding flow.
- Login page: client hiring workspace for profiles, interviews, onboarding, and placement progress.

## 3. Color System

Use the global CSS tokens in `src/app/globals.css`. Avoid one-off color palettes unless a component has a specific reason.

- Violet/purple: text depth, brand identity, atmospheric surfaces.
- Cyan: CTA energy, data signal, active accents, technical highlights.
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
- Avoid generic dark SaaS styling, heavy purple gradients, or decorative color blobs.

## 4. Typography Rules

Font families:

- Outfit: headings, body copy, labels, UI.
- JetBrains Mono: stats, percentages, IDs, durations, code-like labels, and structured technical values.

Weights:

- Do not use Tailwind `font-bold` or `font-semibold`.
- Use `font-normal` for display and body copy.
- Use `font-medium` for nav, buttons, chips, compact labels, and card titles.

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
- Primary filled CTAs should maintain strong contrast in both themes.
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
- `font-mono` for command text, durations, role IDs, percentages, and status values.

Artifacts should feel like actual outputs from a hiring or engineering workflow, not generic dashboard decoration.

## 10. Layout and Responsiveness

- Public pages should use the shared navbar and footer.
- Focused utility flows such as `/start-project` and `/login` may hide the footer.
- Text must not overlap controls or artwork on mobile or wide desktop.
- Fixed-format UI elements should have stable dimensions so hover states and labels do not shift layout.
- Do not scale font sizes with viewport width.
- Letter spacing should remain non-negative.

## 11. Accessibility and Legibility

- Keep focus states visible.
- Use descriptive labels for form inputs and CTAs.
- Do not rely on low opacity for important copy.
- Avoid text over busy image areas unless veiled by a controlled overlay.
- Confirm mobile helper text is large enough to read without zooming.

## 12. Verification Standard

Current requested gate:

- `npx tsc --noEmit`

Other checks remain useful when requested:

- `npm run lint`
- `npm run build`
- Mobile visual checks at 375px, 390px, and 768px.
- Desktop visual checks at 1440px and wide screens.

## 13. GitHub

Active source remote:

- `https://github.com/Charanos/andishi-v3.git`

Docs and implementation should stay in sync before publishing. When the copy system changes, update:

- `docs/andishi-v3-content-system.md`
- `docs/V3_CURRENT_STATE_AUDIT.md`
- `docs/PROJECT_PROGRESS.md`
- `docs/THEME_GUIDE.md`
- `public/llms.txt`
