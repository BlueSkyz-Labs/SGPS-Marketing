# W4 — Homepage narrative & craft (Brand Kit v4 W4, v2.0 T9)

Depends on W2.1. No new client JS beyond budget; motion is progressive enhancement.

## W4.1 Hero centerpiece & image delivery (F-07)

- Replace the self-referential `website_hero_1920x1080.webp` with the Prismatic R4d mark from the brand kit (`brand/blueskyz-production-v4/02_LOGOS/02_PNG_TRANSPARENT/blueskyzlabs_prismatic_r4d_mark_transparent.png`), served via `<picture>`: AVIF → WebP, `media="(min-width: 1024px)"`, so mobile downloads nothing. Use `astro:assets` `getImage` for responsive widths 640/960/1280.
- Mobile: remove the duplicate hero logo (header already carries the lockup).
- **Acceptance:** Lighthouse mobile shows no hero image request; LCP ≤ 2.5 s.

## W4.2 Density & rhythm (F-08)

- Remove the stray footer-like nav row above "Next steps" (`MaisonIndex`/closing nav) or restyle it as a deliberate index with a heading.
- Fold the three bold trust statements under the Trust cards into the `TrustLedger` component as a styled "Commitments" list.
- Target: mobile homepage ≤ 5 500 px (today ≈ 7 700 px vi) without removing a required C2 act; measure and record before/after heights for en/vi/zh.

## W4.3 Brand principles as cards

- `OneHouseMatrix.astro`: four cards using `public/brand/blueskyz/v4/principles/{intelligence,elevation,trust,impact}.svg`, trilingual copy from `PRINCIPLE_MATRIX` (no new claims). Replace the oversized list typography.

## W4.4 Motion (progressive, CSS only)

- Press micro-tick on `ButtonLink` (`:active` 60 ms translate/scale), off under `prefers-reduced-motion` and `static-premium` tier.
- Section reveals via `@supports (animation-timeline: view())` (Chromium, Safari 26+; Firefox stable still behind a flag as of mid-2026 — content must be fully visible without it).
- Cross-document View Transitions via `@view-transition { navigation: auto; }` (Chromium, Safari 18.2+; Firefox ignores it).
- **Acceptance:** reduced-motion E2E shows no animation; content visible with animations unsupported (Firefox project in CI).

## W4.5 Atlas follow-ups (post-premium plate)

- Optional: product nodes carry the product icon glyph (from W3.3) inside the plate; keep one `circle` per node (E2E contract).
- Verify the highlight map still covers the node count (`atlas-premium-contract.test.mjs`) if claims/evidence grow beyond 40 nodes; extend selectors, do not remove the bound.
