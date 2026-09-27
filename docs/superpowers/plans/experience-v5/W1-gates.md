# W1 — Gates that see what users see

Goal: make the defects found in the audit (F-02, F-03, F-04, F-17 all passed every gate) impossible to reintroduce silently. Land before any visual redesign.

## W1.1 Visual regression baseline

- **Files:** `tests/e2e/visual/visual-baseline.spec.ts` (new), `tests/e2e/visual/__screenshots__/` (committed baselines), `playwright.config.ts` (add a `visual` project limited to Chromium), `package.json` (`test:visual`, `test:visual:update`), `.github/workflows/quality-gates.yml` (run `test:visual` inside Browser Assurance).
- **Matrix:** routes `/en/`, `/vi/`, `/zh/`, `/en/products/`, `/vi/products/sotro/`, `/en/about/`, `/en/privacy/`, `/en/dossier/` × `colorScheme` light/dark × viewport 390×844 / 1440×900. Full-page `toHaveScreenshot` with `maxDiffPixelRatio: 0.01`, `animations: "disabled"`, masks for any time-dependent text.
- **Determinism:** baselines are generated **only** in the CI Linux image (fonts differ locally). Add a workflow_dispatch job or documented command that regenerates baselines in CI and uploads them as an artifact; commit the artifact output.
- **Acceptance:** CI green with committed baselines; changing a card background to `white` in dark mode fails the job.
- **Negative proof:** a temporary commit reverting `--surface-raised` in dark mode turns the visual job RED (record the run URL in the PR).
- **Rollback:** revert the PR; no runtime impact.

## W1.2 axe `incomplete` colour-contrast triage

- **Files:** `tests/e2e/accessibility.spec.ts`, new `tests/e2e/fixtures/axe-incomplete-allowlist.json`.
- **Change:** after `analyze()`, fail on `incomplete` entries with id `color-contrast` unless the target selector is on the reviewed allowlist (each entry needs a reason). Run in light and dark `colorScheme`.
- **Negative proof:** set the footer switcher container back to `bg-[var(--surface-primary)]` → RED.

## W1.3 Computed-contrast probe for theme × component

- Generalise `tests/e2e/os-dark-contrast.spec.ts` into `theme-contrast.spec.ts`: both schemes plus explicit `data-theme` light/dark (set via `localStorage` key `blueskyz-theme` before load), routes from W1.1, selectors: headings, body text, links, buttons, chips, footer. Floor 4.5:1 for text < 24 px, 3:1 otherwise.
- **Negative proof:** pre-W0 build (`git checkout e21c954 -- src && pnpm build`) is RED.

## W1.4 Lighthouse that matches the claim

- **Files:** `lighthouserc.json`, `scripts/run-lighthouse.mjs`.
- Collect `/`, `/vi/`, `/en/products/`, `/vi/products/sotro/` with **mobile** and desktop presets. Assert Performance ≥ 0.95, Accessibility = 1, Best Practices = 1, LCP ≤ 2.5 s, CLS ≤ 0.02, TBT ≤ 150 ms. Keep SEO as `warn` locally (noindex) and document why.
- Replace the unenforced "≥ 98" wording in `docs/superpowers/specs/2026-09-27-sgps-premium-experience-excellence-v2-design.md` §4 with a pointer to these enforced numbers (addendum, do not rewrite history).

## W1.5 CSS and font budgets

- **Files:** `scripts/check-client-budget.mjs` (extend) or new `scripts/check-asset-budget.mjs` + package script + workflow step.
- CSS ≤ 20 KB gzip per page (today ≈ 15.8 KB); fonts ≤ 90 KB WOFF2 total across a page, ≤ 1 preloaded font file. Fail with the offending file list.
- **Negative proof:** add a 30 KB dummy CSS import in a throwaway commit → RED.

## W1.6 Locale-leak probe (F-05)

- **Files:** `tests/e2e/locale-leak.spec.ts`, `tests/e2e/fixtures/locale-allowlist.json` (brand/product names, codes).
- For every `vi` and `zh` route in the sitemap, collect visible text nodes and fail on a curated deny-list of English UI strings (`In development`, `View profile`, `Explore`, `Preview`, `Main capabilities`, `What it's for`, `Web`, `Professional`, `Business`, …). Initially mark the test `test.fail()` **only** for the known F-05 routes with a linked issue, so it is RED-by-design and flips to pass in W3.4; do not skip.

## W1.7 Truth-copy probe (F-19)

- **Files:** `tests/architecture/truth-copy-consistency.test.mjs`.
- Fail when `src/data/integrity.ts` or any component renders the "not published / stays quiet" state for the products surface while `getPublicProducts()`-equivalent registry data has `public: true` entries. Fix the copy source (`src/data/integrity.ts:161` products surface record) to the correct state in the same PR; keep the empty-registry path intact for the zero-product case.
- **Negative proof:** flip one product `public: false` → the copy must switch; flip back → test enforces the published copy.

## W1.8 Theme-aware lockup guard (F-18)

- Add a visual/computed check that the header wordmark is legible on dark non-hero pages (`/en/products/` with OS dark). Expected RED until W2.4 lands; use `test.fail()` with a link to W2.4.

**Exit criteria W1:** all cards merged; CI runs visual, contrast, locale and truth probes on every PR.
