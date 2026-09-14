# C2 P2 — Horizon Arrival art direction

Date: 2026-09-13
Wave: C2 P2 (design §9 W1, plan Task 5)
Status: COMPLETED (agent-side)

## Change

- New focused stylesheet `src/styles/cinematic-product-house.css`, imported from
  `global.css`: hero semantic layers (ink plane, content layering, horizon seam),
  the Ink/Porcelain act rhythm, the closing signature, and the motion-conditioned
  decorative block (`@media (prefers-reduced-motion: no-preference)`).
- `src/components/sections/Hero.astro`: the framed 16:9 brand-art card is gone —
  the Horizon field now renders as an integrated scene element
  (`.horizon-container` → `.horizon-signature`) instead of a right-side card, and
  the text hierarchy is semantic (`hero-headline`, `hero-tagline`,
  `hero-supporting`, `hero-actions`). The now-unused brand-asset import was
  removed.
- Reduced motion: `.horizon-signature` carries `transition: none` and a fixed
  opacity under `prefers-reduced-motion: reduce`; the decorative seam transition
  is declared only under `no-preference`, so the static path is the default.

## Evidence

Measured on the built output (`pnpm build` → local server, chromium):

| Viewport | horizon width vs hero | h1 size | actions             | overflow |
| -------- | --------------------- | ------- | ------------------- | -------- |
| 1440px   | full hero width       | 72px    | 2, both in viewport | 0px      |
| 390px    | 390 / 390             | 36px    | 2, both in viewport | 0px      |

- `tests/e2e/c2-reduced-motion.spec.ts` rewritten to use the real browser
  preference (`test.use({ reducedMotion })` / `page.emulateMedia`) instead of an
  injected style tag, and to assert: complete hero content and both actions in
  both motion states, no sideways scroll at 320/390px, and a genuinely
  neutralised signature (`transition-duration: 0s`, `animation-name: none`).
- Suites: `pnpm test:architecture` 306/306, client budget PASS (2600 B site-wide
  / 2069 B worst page), chromium e2e 74/74 across the P2-affected specs
  (c2-reduced-motion, home-c1, text-zoom, mobile-overflow, print-surface,
  s-plus-journey).

## Supersession recorded

`tests/architecture/brand-v4-experience.test.mjs` previously required
`brandAssets.hero.*` **inside the hero**. The approved C2 design (§9 W1: the
Horizon motif "transformed from a framed brand artwork into an integrated
spatial field") and plan Task 5 ("Remove the old framed 16:9 artwork presentation
as the dominant right-side content card. A Brand Kit raster may remain
atmospheric only if it adds real visual value") supersede that expectation, so
the guard now asserts what brand fidelity still means for the C2 hero: the v4
`BrandLockup`, the ink plane, the tagline contract — and explicitly forbids the
removed framed card from returning. Brand-kit mirror byte-equality guards are
untouched.

## Residual

The hero's horizon is CSS/SVG only (no raster), so no new image weight and no new
remote request. Product-dependent hero states remain on the owner gate
(`docs/current-work.json` → `screenshot-mandatory-floor`); the hero still routes
an empty registry to the Act soft-land, not a dead end.
