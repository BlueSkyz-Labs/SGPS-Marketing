# S+ Baseline Evidence — 2026-09-11

**Exact SHA:** `7a382596435639336ead8e6fd85740e2b91d1972` (`main`, post PR #94)
**Purpose:** Record the pre-S+ Task 1 baseline for client JS, asset weight, the
motion contract, and Lighthouse/CWV proxies so later S+ waves have a measured
reference envelope (S+ implementation plan, Wave 1 / Task 1, #96 and #99).

## Client JavaScript (Brotli)

- `dist` local `.js` files: **none** (0 files; the site currently ships zero
  client JavaScript).
- `pnpm check:client-budget`: site-wide **0 B**, worst page **0 B** against the
  hard ceiling **120,000 B** — PASS.
- Hard ceiling: `CLIENT_JS_HARD_BUDGET_BYTES = 120_000`. Since Task 1 the
  existing `scripts/check-client-budget.mjs` measures **every built HTML page**
  (site-wide unique scripts plus worst-case single page) instead of only
  `dist/index.html`.

## Hero assets (`public/brand/blueskyz/v4/hero/`)

| Format | Bytes     |
| ------ | --------- |
| AVIF   | 89,464    |
| WebP   | 156,670   |
| PNG    | 1,974,749 |

The hero `<picture>` serves AVIF first with WebP and PNG fallbacks.

## Motion contract (state at baseline)

- Base scale: `--motion-fast: 120ms`, `--motion-normal: 200ms`,
  `--motion-slow: 320ms`.
- Entrance animations (`.reveal`, `.brand-signal`, `.hero-atmosphere`,
  `.hero-mark`, `.hero-mark-stage::after`) run 400–1100 ms with
  `cubic-bezier(0.22, 1, 0.36, 1)`, gated behind
  `@media (prefers-reduced-motion: no-preference)`.
- Reduced motion: global `animation-duration`/`transition-duration`
  `0.01ms !important` reset plus explicit `animation: none` for the named
  entrance elements.
- Task 1 adds purpose-based tokens (`--motion-orientation-duration`,
  `--motion-emphasis-duration`, `--motion-confirmation-duration`,
  `--motion-continuity-duration`, `--motion-ease-standard`,
  `--motion-distance-sm|md|lg`) with a `prefers-reduced-motion: reduce`
  override that zeroes durations and distances. Tokens are additive; runtime
  rendering is unchanged.

## Lighthouse / CWV proxies

Desktop preset, `lhci autorun`, 3 runs against `http://127.0.0.1:3000/`,
measured on the Task 1 working tree (additive CSS variables only; runtime
rendering identical to baseline).

| Metric                   | Result (3 runs)           | Enforced threshold |
| ------------------------ | ------------------------- | ------------------ |
| performance              | **1.00** (1.00/1.00/1.00) | ≥ 0.9 (error)      |
| accessibility            | **1.00** (1.00/1.00/1.00) | ≥ 0.9 (error)      |
| best-practices           | **1.00** (1.00/1.00/1.00) | ≥ 0.9 (error)      |
| largest-contentful-paint | **510 ms** (538/542/450)  | ≤ 2,500 ms (error) |
| cumulative-layout-shift  | **0.0000** (0/0/0)        | ≤ 0.05 (error)     |
| total-blocking-time      | **0 ms** (0/0/0)          | ≤ 150 ms (warn)    |

- SEO scored 0.69 on the local run as an expected warning only: the local
  default state is intentionally `noindex` (see `seo.spec.ts`) and
  `is-crawlable` is disabled in `lighthouserc.json`; production SEO remains
  verified by the SEO test suite.
- Local Lighthouse teardown on this Windows machine requires a local-only,
  uncommitted `chrome-launcher` EPERM workaround (destroyTmp catch); CI/Linux
  remains the promotion authority for exact-head Lighthouse evidence.

## Regression envelope for later S+ waves

- No later wave may exceed the client-JS hard ceiling on any route (now
  enforced site-wide and per worst-case page).
- Lighthouse accessibility may not regress below the enforced
  `categories:accessibility >= 0.9` error threshold.
- CLS may not become less strict than the current `<= 0.05` error assertion.
- A mobile-sensitive LCP regression greater than 10% from this recorded
  baseline requires explicit review rather than silent acceptance.
- Every interactive wave must report its incremental Brotli client bytes.

## Boundaries

- Automated/browser evidence is separate from human E4 evidence; human E4
  remains `OPEN` until real-user sessions are recorded (S+ plan Task 13).
- This baseline was recorded on a Windows development machine. CI remains the
  promotion authority for exact-head Lighthouse evidence.
