# Andishi v3 Progress Tracker

Last updated: May 7, 2026

## Current Phase

Foundation building complete. The landing page refurbishment and work-page foundation are now the baseline for the remaining public pages and product surfaces.

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
- Common `Navbar` and `Footer` now live in the app layout and are shared by public pages.
- GitHub is the active deployment/source remote: `https://github.com/Charanos/andishi-v3.git`.
- Homepage project showcase replaces the old product-studio block below the hero.
- Process section now uses realistic mini app artifacts: chat window, brief/insight window, sprint progress window, design board, delivery checks, and terminal handoff.
- Full-width visual interlude uses theme-swapped `light-blob.svg` and `dark-blob.svg`.
- Why Andishi section has been rebuilt as a right-headed decision cockpit with mini-window comparison cards.
- Founder preview has been rebuilt as an editorial profile section with portrait, stats, quote, and operating rules.
- Work page now uses a dedicated `WorkPageExperience` with filters, sticky desktop sidebar, project cards, case-study drawer, and patterned CTA.
- Login route added and Login moved into the central nav links.
- Blog, FAQ, and newsletter sections replaced the old bottom FAQ with a reading-friendly editorial grid, FAQ accordion, and terminal-style newsletter signup.
- Final CTA now uses `final-cta.svg` as a masked atmospheric backdrop while keeping the CTA copy centered and glass-readable.
- Shared custom cursor behavior has been extracted and reused on Why Andishi, the final CTA, and the work page.
- Smooth-scroll route transition warning addressed through `data-scroll-behavior="smooth"` on the root HTML element.
- Project showcase image sizing was tuned to remove Next image performance warnings.
- Landing page foundation pass has been type-checked with `tsc --noEmit --pretty false --incremental false`.

## Documentation Updated

- `docs/andishi-v3-complete-spec-v2.md`
- `docs/THEME_GUIDE.md`
- `docs/PROJECT_PROGRESS.md`

## Next Milestones

1. Supporting landing pages
   - Services page refinement
   - About page refinement
   - Contact page refinement
   - Login page integration
   - Not found page

2. System cleanup
   - Remove remaining stale hardcoded gradients where shared tokens should be used.
   - Replace any lingering non-Tabler icon usage.
   - Confirm zero decorative sparkle/star icons.
   - Confirm all numerals use `font-mono`.
   - Reduce one-off inline styles where Tailwind utilities or tokens are clearer.

3. Quality gates
   - `npx tsc --noEmit --pretty false`
   - `npm run build` when local hardware allows.
   - Mobile visual checks at 375px, 390px, 768px.
   - Desktop visual checks at 1440px and wide screens.
   - Accessibility pass for focus states, CTA labels, and color contrast.

4. GitHub publishing
   - Remote: `https://github.com/Charanos/andishi-v3.git`
   - Commit foundation-complete pass.
   - Push `main` with upstream tracking.

## Previous Milestone Notes

1. Homepage section uplift
   - Project showcase
   - Process
   - Visual interlude
   - Comparison/trust content
   - Founder/about preview
   - FAQ
   - Final CTA

## Design Rules To Preserve

- The hero, project showcase, process artifacts, Why Andishi cockpit, editorial blog/FAQ/newsletter, final CTA, and work page are the current quality bar.
- The brand card is a transition device, not a standalone section.
- Use Tailwind-first styling for section work.
- Use CSS only for theme tokens, shared typography utilities, and reusable global primitives.
- No `font-bold` or `font-semibold`.
- `font-medium` is allowed for compact UI labels, buttons, nav, and card titles.
- No sparkle/star decorative icons.
- No stripe patterns in hero/product card textures.
- Prefer plus/dot and semi-pattern textures over radial color blobs.
- Avoid ordinary grid patterns.
- Avoid dual-tone/gradient headings unless there is a specific rendering-safe reason.
- Avoid generic dark SaaS styling and cheap sci-fi effects.
