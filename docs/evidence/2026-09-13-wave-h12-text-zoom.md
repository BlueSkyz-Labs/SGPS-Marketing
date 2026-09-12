# Wave H12 — text-zoom safety (WCAG 1.4.4)

Date: 2026-09-13 (Asia/Ho_Chi_Minh)
Branch: `feat/wave-h12` (base `15aa060`, squash of wave H11 / #149)
Status: **VERIFYING** — local gates green; awaiting exact-head Source Assurance.

## Findings (real, reproduced before fixing)

A 200% text-zoom probe (root font-size 200% at a 390 px viewport) across nine
routes failed on two of them:

1. **`/en/contact/` — 19 px horizontal overflow.** The contact cards are grid
   items with default `min-width: auto`, so they could not shrink below their
   min-content width under text zoom.
2. **`/en/security/` — 40 px overflow**, which bisection reduced to **2 px**
   after the first fix: the page `h1` ("Report privately, responsibly") has a
   single word that cannot fit a 310 px column at 72 px effective font size and
   could not break. A second trace-level contributor (`li.source-trace__step`
   pinning its min-content) was fixed in the same pass.

## What changed

- `src/pages/{en,vi}/contact.astro`: contact cards carry `min-w-0` so the grid
  tracks can shrink and the text can wrap.
- `src/styles/global.css`:
  - `.source-trace__step` and its children get `min-width: 0` +
    `overflow-wrap: anywhere` (a flex item must not pin its min-content);
  - `h1, h2, h3` get `overflow-wrap: break-word` so a long word breaks instead
    of scrolling the page at extreme text zoom.
- `tests/e2e/text-zoom.spec.ts`: 16 routes (EN/VI parity) at 390 px × 200%
  text zoom must not scroll sideways, naming the widest offender on failure.

## Evidence (local, exact this branch)

- Zoom probe before: `FAIL /en/contact/ (19px)`, `FAIL /en/security/ (40px)` → after: **Zoom probe: PASS** on all nine probe routes
- `pnpm exec playwright test text-zoom + source-trace + boundary-card --project=chromium --workers=1` → **32/32 pass** (no regression to the touched surfaces)
- `pnpm build` → Static export verified

## Residual risk

- The spec emulates text zoom via `root font-size: 200%`, which is the standard
  open-web approximation; browser page-zoom (which scales layout too) remains
  covered by the 320 px mobile sweep from wave H8.
- WCAG 1.4.10 reflow (320 CSS px) and 1.4.4 (text resize) are now both guarded;
  1.4.12 text-spacing (line-height/letter-spacing overrides) is not — it can be
  a later wave if the audit surface justifies it.
