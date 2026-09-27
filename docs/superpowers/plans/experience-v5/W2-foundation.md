# W2 — Design foundation (Brand Kit v4 tokens, type, material)

Owner decisions: D-1 header-only translucent material; D-2 self-host Inter / Inter Display (`brand/blueskyz-production-v4/00_START_HERE/BRAND_STANDARDS.md:44`). Depends on W1.1 baselines so every visual change is reviewed as a diff.

## W2.1 One token layer synced from the brand kit

- **Source of truth:** `brand/blueskyz-production-v4/07_DESIGN_TOKENS/tokens.json` (verify against `00_START_HERE/SHA256SUMS.txt`).
- **Files:** new `scripts/sync-brand-tokens.mjs` (reads tokens.json → writes `src/styles/tokens.generated.css` with `:root` light + dark blocks), `src/styles/global.css` (import generated file, delete duplicated literals), new `tests/architecture/brand-token-sync.test.mjs` (runs the script in `--check` mode; fails on drift).
- **Structure:** `@layer tokens, base, materials, components, utilities;` — move `global.css`, `c3-craft.css`, `c4-quiet-authority.css`, `cinematic-product-house.css` rules into those layers without changing selectors first (pure move, visual diff must be zero), then dedupe in a second commit.
- **Keep:** `--surface-raised`, `--surface-inverse`, C4 material roles (`c4-material-grammar.test.mjs`), theme contract tests.
- **Acceptance:** W1.1 visual job shows zero diff for the pure-move commit; CSS gzip does not grow.

## W2.2 Fluid type & spacing scale, Vietnamese tuning

- `clamp()` scale tokens `--step--1 … --step-5`, `--space-*` fluid; headings `text-wrap: balance`, body `text-wrap: pretty`.
- Vietnamese: `:lang(vi)` line-height +0.05–0.1 for body and display, avoid negative tracking on stacked diacritics (`:lang(vi) h1 { letter-spacing: -0.01em }` max).
- **Acceptance:** 320 px + 200 % text zoom no overflow (existing `text-zoom.spec.ts`), W1.1 diffs reviewed.

## W2.3 Self-hosted Inter / Inter Display (D-2)

- **Obtain** official Inter release WOFF2 (SIL OFL 1.1) from the upstream project; record version, source URL and SHA-256 in `public/fonts/README.md` and the licence text in `public/fonts/OFL.txt`. Do not fetch from Google Fonts at runtime (CSP `font-src 'self'`).
- Subset to latin, latin-ext, vietnamese via `unicode-range` (separate files). Variable weight axis 400–700 only.
- `@font-face` with `font-display: swap`; metric-matched fallback `@font-face { font-family: "Inter Fallback"; src: local("Arial"); size-adjust; ascent-override; descent-override; line-gap-override }` so CLS stays ≤ 0.02.
- Preload only the latin text face in `BaseLayout.astro`.
- **Acceptance:** W1.5 font budget passes; Lighthouse CLS unchanged; VI diacritics render in Inter on a machine without Inter installed (CI screenshot).

## W2.4 Theme-aware brand lockup (F-18)

- **Files:** `src/components/brand/BrandLockup.astro`, `src/components/layout/Header.astro` (`lockupSurface(scene)`).
- Render both light and reverse wordmarks and toggle with CSS: `[data-theme="dark"]`, `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])`, and the ink hero scene. No JS.
- **Acceptance:** W1.8 flips from expected-fail to pass (remove `test.fail`).

## W2.5 Shell material (D-1)

- Sticky header: `background: color-mix(in srgb, var(--surface-primary) 82%, transparent)` + `backdrop-filter: blur(12px) saturate(1.2)` inside `@supports (backdrop-filter: blur(1px))`.
- Solid fallbacks: `@media (prefers-reduced-transparency: reduce)`, `@media (forced-colors: active)`, `[data-fidelity-tier="static-premium"]` → opaque `--surface-primary`.
- Write ADR `docs/decisions/0008-shell-material-exception.md` (header only; content surfaces keep C4 no-blur). Update `tests/architecture/c4-material-grammar.test.mjs` with an explicit allow for the shell selector only, plus a negative test that blur on any other selector fails.
- **Acceptance:** Lighthouse mobile Performance ≥ 0.95 unchanged; scroll jank check (Chromium performance trace, no long frames > 50 ms attributed to backdrop-filter on a 4× CPU throttle).

**Exit criteria W2:** tokens generated and drift-guarded; Inter self-hosted within budget; lockup legible in all themes; shell material behind ADR.
