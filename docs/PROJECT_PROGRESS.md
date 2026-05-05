# Andishi v3 Progress Tracker

Last updated: May 5, 2026

## Current Phase

Foundation pass complete. The hero, brand divider, theme tokens, typography rules, and CTA baseline now define the visual league for the rest of the site.

## Completed

- Hero section rebuilt as a premium split layout with strong copy, compact glass dashboard illustrations, and mobile-aware stacking.
- Hero and the adjacent "The real situation" content merged into one continuous section so the background illustration bleeds naturally.
- Brand/client card positioned as the divider between hero promise and market pain content.
- Purple overuse reduced at token level:
  - Light mode uses deeper violet primary text for contrast.
  - Dark mode uses lighter violet-white primary text for readability and atmosphere.
  - Cyan is reserved for signal, CTA energy, chart accents, and data highlights.
- CTA foundation upgraded:
  - Shared `--gradient-brand` and `--cta-shadow` tokens.
  - Larger vertical rhythm and touch targets.
  - Larger CTA text.
  - More refined violet-to-cyan gradients.
- Hero card texture standardized to subtle plus/dot texture. Stripe patterns are out.
- Numerals in hero metrics, stats, percentages, and proof points use `font-mono`.
- Hero implementation is Tailwind-first; the old hero CSS module has been removed.
- Sparkle/star icons remain forbidden.

## In Progress

- Foundation documentation updated in:
  - `docs/andishi-v3-complete-spec-v2.md`
  - `docs/THEME_GUIDE.md`
  - `docs/PROJECT_PROGRESS.md`

## Next Milestones

1. Homepage section uplift
   - Services
   - Process
   - Work/case studies
   - Comparison/trust content
   - Founder/about preview
   - FAQ
   - Final CTA

2. Supporting landing pages
   - Services page
   - Work page
   - About page
   - Contact page
   - Not found page

3. System cleanup
   - Remove remaining stale hardcoded gradients where shared tokens should be used.
   - Replace any lingering non-Tabler icon usage.
   - Confirm zero decorative sparkle/star icons.
   - Confirm all numerals use `font-mono`.
   - Reduce one-off inline styles where Tailwind utilities or tokens are clearer.

4. Quality gates
   - `npx tsc --noEmit --pretty false`
   - `npm run build`
   - Mobile visual checks at 375px, 390px, 768px.
   - Desktop visual checks at 1440px and wide screens.
   - Accessibility pass for focus states, CTA labels, and color contrast.

5. GitLab publishing
   - Initialize repository if needed.
   - Add remote: `https://gitlab.com/charanos1/Andishi.git`
   - Commit foundation pass.
   - Push `main` with upstream tracking.

## Design Rules To Preserve

- The hero is the current quality bar.
- The brand card is a transition device, not a standalone section.
- Use Tailwind-first styling for section work.
- Use CSS only for theme tokens, shared typography utilities, and reusable global primitives.
- No `font-bold` or `font-semibold`.
- `font-medium` is allowed for compact UI labels, buttons, nav, and card titles.
- No sparkle/star decorative icons.
- No stripe patterns in hero/product card textures.
- Avoid generic dark SaaS styling and cheap sci-fi effects.
