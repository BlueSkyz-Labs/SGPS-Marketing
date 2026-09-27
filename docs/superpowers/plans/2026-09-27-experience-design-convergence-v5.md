# Experience & Design Convergence v5 — reconciled execution plan

**Status:** PROPOSED — awaiting Owner approval. It does not replace any approved spec on its own authority.  
**Date:** 2026-09-27  
**Baseline:** `main@e21c954` and the measured audit `docs/evidence/2026-09-27-experience-design-audit-baseline.md`.  
**Reconciles:** `2026-09-27-sgps-premium-experience-excellence-v2.md` (v2.0), `2026-09-27-brand-kit-v4-standardization.md` (BK4), Council issue #293 (W0–W7, G01–G10, S01–S10), issues #291/#281/#284/#290.  
**SGPS context:** published pin `v1.13.0` unchanged; applicable overlays per `docs/evidence/2026-09-16-c3-sgps-delta-reconciliation.md` and `2026-09-22-sgps-experience-adoption.md`. Newly applicable for Wave 0 only: `SGPS-DEC-2026-016` (Paid Go-Live) and `SGPS-DEC-2026-017` (Security-by-Default). `SGPS-DEC-2026-020` applies only if the Owner explicitly adopts it for a payment-adjacent surface. No silent repin.

## Why a reconciled plan

Two plans were written on the same day and route overlapping work into the same files. They conflict on material (glass vs. no-blur), they include product functionality that current Product Truth rules out, and neither plan's gates caught the visible defects in the audit (F-02, F-03, F-04 passed every check). This plan keeps the parts of v2.0 and BK4 that are consistent with Product Truth, decides the conflicts explicitly, and adds the missing gates _before_ the visual work so that the visual work is protected.

## Adjudication of existing plan items

| Source item                                     | Decision                          | Reason                                                                                                                                      |
| ----------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| v2.0 Ph1 (activate #269)                        | DONE                              | Merged `a2f822f`; corrected by #292 `e21c954`                                                                                               |
| v2.0 Ph2 T4–T5 VietQR engine                    | **RE-SCOPE (Wave 0)**             | Shipped in #294 with a live bank BIN and invented account (F-01); needs DEC-016 routing and an Owner decision                               |
| v2.0 Ph2 T6 VI typography                       | KEEP → Wave 2                     | Combine with the self-hosted font (F-06)                                                                                                    |
| v2.0 Ph3 T7 SoftwareApplication JSON-LD         | DONE in #292                      | Platform-bound; keep the regression tests                                                                                                   |
| v2.0 Ph3 T8 sitemap/hreflang                    | VERIFY in Wave 1                  | Test exists; add per-product OG image in Wave 5                                                                                             |
| v2.0 Ph4 T9 micro-tick                          | KEEP → Wave 4                     | CSS only, off under reduced motion                                                                                                          |
| v2.0 Ph4 T10 44 px lattice                      | DONE as a gate                    | 0 sub-44 px targets measured; keep the sweep                                                                                                |
| v2.0 Ph5 T11 Sổ Tâm local journal               | **REJECT on this surface**        | Private user data on a marketing origin; belongs in the product repository                                                                  |
| v2.0 Ph5 T12 ApexAgent kill-switch "simulation" | **REJECT**                        | A simulated safety control on a brand page reads as a capability claim                                                                      |
| v2.0 Ph5 T13 FluentArc skill tree               | **REJECT**                        | FluentArc Stage A excludes a graph/skill tree (#293 §G)                                                                                     |
| BK4 W1 T1.1 tokens / radii / shadow             | KEEP → Wave 2                     | One token layer, from the in-repo kit                                                                                                       |
| BK4 W1 T1.2 glass header                        | **KEEP WITH A DECISION → Wave 2** | See Decision D-1                                                                                                                            |
| BK4 W2 T2.1 bento card + icons                  | KEEP → Wave 3                     | Icons exist in `brand/…/03_ICONS/03_PRODUCT_ICONS`                                                                                          |
| BK4 W2 T2.2 device frame for "proof screenshot" | **MODIFY → Wave 3**               | There is no UI screenshot; a device frame around identity art would imply one. Use an "identity stage" instead until real UI captures exist |
| BK4 W3 bento feature grid, endorsed lockups     | KEEP → Wave 3                     |                                                                                                                                             |
| BK4 W4 principles SVGs, prismatic R4d hero      | KEEP → Wave 3/4                   | Replaces the self-referential website mockup (F-07)                                                                                         |
| BK4 "live pulse" status badge                   | **MODIFY**                        | A pulsing dot signals "live"; every product is "In development". Static badge only                                                          |
| `C:\00. AI Project\…` as authority (both plans) | REPLACE                           | Use `brand/blueskyz-production-v4/` + `SHA256SUMS.txt`                                                                                      |
| v2.0 "Lighthouse ≥ 98"                          | ALIGN in Wave 1                   | Set a measured, enforced budget instead of a figure no gate checks                                                                          |

## Decisions required (Owner)

- **D-0 VietQR widget (blocks Wave 0 closure).** Choose one: (a) remove it from Marketing and hand it to the Sổ Trọ repository; (b) keep it as a clearly labelled illustration that cannot produce a payable code unless the visitor types their own account, with no default account, no default bank and parity in `en`/`zh`. The recommendation is (a). Marketing should not be a second payment authority.
- **D-1 Material doctrine.** Recommendation: allow exactly one translucent material, the sticky shell (header/command bar), with `backdrop-filter` inside `@supports`, a solid fallback under `prefers-reduced-transparency`, `forced-colors` and the `static-premium` fidelity tier, and keep "no blur" for content surfaces. This changes `c4-material-grammar` intentionally, through an ADR, never by relaxing the test in place.
- **D-2 Font binaries.** `brand/blueskyz-production-v4/00_START_HERE/BRAND_STANDARDS.md:44` already names Inter / Inter Display and says binaries are not packaged. The remaining decision is only whether to self-host them (SIL OFL, WOFF2, latin + latin-ext + vietnamese subsets) in `public/fonts`. Recommendation: yes, because today the brand face renders only where Inter happens to be installed (F-06).

## Waves

Each wave is one or more small PRs: `branch → local source gate → PR → exact-head Quality Gates + Browser Assurance → squash merge`. Each task states acceptance, negative proof and rollback. Source merge is not deployment; deployment is not Human E4.

### Wave 0 — Safety & visible-defect hotfix (P0/P1, independent, first)

| Task                                 | Change                                                                                                                                                                                             | Acceptance                                                                                             | Negative proof                                   | Rollback         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------ | ---------------- |
| 0.1 VietQR containment (F-01)        | Apply D-0. Until the decision: remove the default account/BIN and the script fallback; render no QR until the visitor enters an account; add a visible "illustration — not a Sổ Trọ payment" label | No payable payload can be produced from defaults; architecture test asserts no default account literal | Mutation: reinstate `0901234567` → test RED      | Revert PR        |
| 0.2 Footer switcher contrast (F-03)  | Give `LanguageSwitcher variant="dark"` its own ink container in both themes                                                                                                                        | Contrast ≥ 4.5:1 light and dark                                                                        | Computed-contrast E2E fails on the pre-fix build | Revert CSS       |
| 0.3 Hero bleed (F-02)                | Clip decorative hero layers to the hero (`overflow: clip` on the plane, or bound `horizon-field__depth`)                                                                                           | No non-porcelain pixels between hero bottom and the flagship section                                   | Screenshot diff fails on the pre-fix build       | Revert CSS       |
| 0.4 Identity art legibility (F-04)   | Render identity art on an ink "identity stage" (matching the art's intended background), not a porcelain card                                                                                      | Wordmark in the art legible in both themes                                                             | Visual snapshot                                  | Revert component |
| 0.5 Hermetic test (audit gate table) | `post-merge-landing-guard (b)`: build the orphan fixture in a temporary repo instead of depending on `dcfb121`                                                                                     | Passes on a fresh clone                                                                                | Still fails if the guard is disabled             | Revert test      |

### Wave 1 — Gates that see what users see (before any redesign)

1. **Visual regression baseline (F-09):** Playwright `toHaveScreenshot` for 8 routes × {light, dark} × {390, 1440} in Chromium, with masks for non-deterministic regions and baselines committed from the Linux CI image only. Wave 2+ visual changes update baselines deliberately in the same PR.
2. **axe `incomplete` triage (F-03 class):** fail on `incomplete` `color-contrast` unless the node is on an explicit, reviewed allowlist, and add a computed-contrast probe for the theme × component matrix.
3. **Lighthouse (F-10):** add the mobile preset, `/vi/` and one product profile; enforce Performance ≥ 0.95, A11y 1.0, BP 1.0, LCP ≤ 2.5 s, CLS ≤ 0.02 on the served build (Cloudflare compression). Keep SEO `warn` locally because of noindex. Replace the "≥ 98" prose with these enforced numbers.
4. **CSS and font budgets (F-11, F-06):** CSS ≤ 20 KB gzip per page; fonts ≤ 90 KB WOFF2 total, preloaded ≤ 1 file.
5. **Locale leak probe (F-05):** for `vi` and `zh` routes, fail on known English UI strings in rendered chrome/content outside an allowlist (brand and product names).

### Wave 2 — Design foundation (BK4 W1 + v2.0 T6, after D-1/D-2)

1. **One token layer:** consolidate `global.css`, `c3-craft.css`, `c4-quiet-authority.css` and `cinematic-product-house.css` into `@layer tokens, base, materials, components, utilities`. Token values are synced from `brand/blueskyz-production-v4/07_DESIGN_TOKENS/tokens.json` by a checked script with a drift test (no hand-copied hex).
2. **Fluid type & space scale:** `clamp()` scale with separate VI line-height/tracking, `text-wrap: balance` for headings and `pretty` for body, and `hyphens` only where the language supports it.
3. **Self-hosted font (D-2)** with `font-display: swap`, a metric-matched fallback (`size-adjust`, `ascent-override`) so CLS stays at 0, and `unicode-range` subsets so VI loads only what it needs.
4. **Shell material (D-1):** sticky header with a translucent, `@supports`-guarded material and solid fallbacks, and C4 grammar test updated through the ADR.
5. **Theme parity:** every token has a light/dark pair; forced-colors mapping preserved (existing guards).

### Wave 3 — Product presentation (BK4 W2–W3 + Council S01/S05/G05)

1. `ProductCard`: product icon (brand kit `03_ICONS/03_PRODUCT_ICONS/*.svg`, inline or cached SVG), static status chip, platform chips from the registry, lifecycle→CTA mapper ("Learn / View development status / Try" only when eligible).
2. Homepage de-duplication: the flagship product is not repeated as the first featured card.
3. Profile page: endorsed lockup + icon header, bento "What it's for / Direction" grid replacing bullet lists, identity stage (0.4) until real UI captures exist. The media-kind typing from #292 stays the only source of captions.
4. **Localized product content (F-05, G06):** per-locale strings keyed to canonical claim IDs; missing translations fail the build instead of falling back to English. VI/ZH wording is `FEEDBACK_CHECKPOINT` for native review (Owner cross-check directive); zh promotion stays gated per DEC-019.
5. One shared `[lang]` product-profile route (F-12) generated with `getStaticPaths`, keeping URLs and the trilingual contracts identical. This is a behaviour-preserving refactor protected by Wave 1 snapshots.

### Wave 4 — Homepage narrative & craft (BK4 W4 + v2.0 T9)

1. Hero: Prismatic R4d mark via `<picture>` (AVIF → WebP) with `media="(min-width: 1024px)"` so mobile downloads nothing (F-07); a single logo on mobile.
2. Density: remove the stray nav row, fold the three trust statements into the Trust ledger, bring the mobile homepage to ≤ 5 500 px without removing a required act. Measure before and after.
3. Principles: the four official principle SVGs as cards (trilingual).
4. Motion as progressive enhancement only: CSS micro-tick on press, scroll-driven reveals behind `@supports (animation-timeline: view())`, cross-document View Transitions via `@view-transition` (Chromium/Safari; Firefox navigates without animation), all neutralised by `prefers-reduced-motion` and the `static-premium` tier. No JS animation library; the client budget stays < 120 KB (currently 13.5 KB).

### Wave 5 — Share & discovery surfaces

Per-product, per-locale Open Graph images generated at build time from the brand kit (no runtime service), verified dimensions and alt text, and a sitemap/hreflang regression across 5 products × 3 locales.

### Wave 6 — External & human gates (non-blocking for Waves 0–5)

Human E4 (Owner self-tests), native VI/ZH review, real UI screenshots from product owners, the #281 mailbox, served-SHA/anonymous-access read-back, and control-plane reconciliation of `portfolio-repositories.json` (F-16) by the control-plane single writer. These stay `NOT VERIFIED` until performed.

## DAG

`W0 → W1 → W2 → {W3, W4} → W5`; W6 runs in parallel and never blocks source waves. D-0 blocks closing 0.1 only; D-1/D-2 block W2 items 3–4 only.

## Out of scope

Payments/ledgers, remote AI, analytics/RUM transmission, WebGL (C3-G GO gate), and any product capability not present in owner-approved Product Truth.

## Known weakest point of this plan

Wave 1 visual baselines are only as good as the reviewer who approves a baseline change; a wrong baseline becomes the new truth. Mitigation: baseline updates need a before/after image in the PR and cannot share a PR with unrelated logic changes. The recommendations for D-1/D-2 are design judgements, not measured outcomes, and should be validated in Human E4.
