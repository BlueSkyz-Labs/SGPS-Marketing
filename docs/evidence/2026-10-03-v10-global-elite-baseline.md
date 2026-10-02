# v10 Experience FULL: baseline, target and gap matrix (Global-Elite benchmark)

**Plan:** `docs/superpowers/plans/2026-10-03-v10-global-elite-experience-full.md`
**Bound to:** `main@2cfb15c` (CI push run on `2cfb15c`: Quality Gates, four browser shards, Browser Assurance and Lighthouse CI all `completed / success`)
**Recorded:** 2026-10-03 06:20 GMT+7, orchestrator (verifier lane)
**SGPS context:** release pin v1.13.0 (unchanged); overlays discovered at `sgps-core@24617f7`
**Benchmark:** BPXS 1.4 §6 Global-Elite Quality Bar. This is an **internal composite bar, not an external standard or certification**. External numeric anchors are informed-by references only: Core Web Vitals "good" at p75 (web.dev) and WCAG 2.2 AA (W3C).

## Environment

| Item       | Value                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------- |
| Host       | Linux cloud container, 4 vCPU                                                                     |
| Node       | 22.22.2 (repo wants ≥ 24; CI uses 24.20)                                                          |
| Build      | `pnpm build`, exit 0, 94 pages                                                                    |
| Lighthouse | 13.4.1 via `lhci collect --config=./lighthouserc.mobile.json`, mobile emulation, 3 runs per route |
| Browser    | Chromium 141.0.7390.37                                                                            |

These are lab numbers. Field Core Web Vitals are **NOT VERIFIED**: there is no RUM provider and the site is pre-launch.

## 1. Lab baseline (local medians, n = 3 per route)

| Route                 | LCP     | FCP     | CLS   | TBT   | Perf | A11y | Best practices | SEO  | Transfer |
| --------------------- | ------- | ------- | ----- | ----- | ---- | ---- | -------------- | ---- | -------- |
| `/en/`                | 1958 ms | 1208 ms | 0.000 | 10 ms | 0.99 | 1.00 | 1.00           | 0.69 | 165 KB   |
| `/vi/`                | 1961 ms | 1215 ms | 0.000 | 0 ms  | 0.99 | 1.00 | 1.00           | 0.69 | 165 KB   |
| `/en/products/`       | 1887 ms | 1359 ms | 0.000 | 0 ms  | 0.99 | 1.00 | 1.00           | 0.69 | 125 KB   |
| `/vi/products/sotro/` | 1959 ms | 1204 ms | 0.000 | 0 ms  | 0.99 | 1.00 | 1.00           | 0.69 | 133 KB   |

- **SEO 0.69:** the only failing audit is `is-crawlable`. The lab build uses a non-production origin, so `src/layouts/BaseLayout.astro:96` emits `noindex` by design. CI shows the same: Lighthouse CI job `111062965403` on `2cfb15c`, SEO 0.69 on all 4 routes, warning level. Production `noindex` applies only to `workers.dev` hosts (`public/_headers:15–21`). Result: **NOT A PRODUCT DEFECT**, but a lab-truth gap (G5). A real SEO regression would currently hide inside a permanent warning.
- **Budget headroom:** LCP is about 540–610 ms under the 2.5 s budget locally. CI runs about 300–400 ms slower (v8 handoff §4), so the CI headroom is about 150–300 ms.

## 2. Product Experience DNA (summary; full DNA is in the C2/C3 specs)

| Field                       | Value                                                                                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Product Truth / objective   | The studio's public brand surface: understand the studio, find product status (Sổ Trọ first), verify claims                      |
| Character                   | Static-first, product-led, cinematic at the moments that matter, evidence-rich underneath (C2)                                   |
| Constraints                 | No cookies or analytics transmission; CSP `script-src 'self'`; the no-JS and reduced-motion states meet the content contract     |
| Default cultural expression | C0 (no cultural claims, so G6 passes at C0)                                                                                      |
| Forbidden                   | Fabricated product facts, screenshots or claims; elite or luxury wording; decorative motion that competes with tasks (BPXS §7.3) |

## 3. Global-Elite dimensions (BPXS §6): current state

| #   | Dimension                                   | Evidence on or before `2cfb15c`                                                                                                                                                       | State                                                                                  |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | Task success and information clarity        | Word and action caps guarded (W6); home height 3110 → 2362 px (W2). Real-user E4 missing                                                                                              | Lab **GUARDED**; real-user **NOT VERIFIED** (Owner, O-10.4)                            |
| 2   | Accessibility                               | axe 0 violations in 180 scans, all routes × 2 themes (#445); keyboard walk PASS (W11); 44 px target floor guarded; Lighthouse a11y 1.00. **No guard for WCAG 2.2 2.4.11**             | **PASS (automated)**; 2.4.11 **NOT VERIFIED** (gap G1); screen reader **NOT VERIFIED** |
| 3   | Trustworthy state and consequence           | Claim registry + Verify centre; public-truth gate; availability lines. F-11 Atlas principle links                                                                                     | **GUARDED** with finding G3                                                            |
| 4   | Responsive, reliable runtime                | 4 engines green in CI; lab LCP ≤ 1.96 s, CLS 0, TBT ≤ 10 ms; client JS 41 KB raw in total across `dist/_astro`                                                                        | Lab **PASS**; field **NOT VERIFIED** (O-10.3)                                          |
| 5   | Typography, spacing and alignment precision | Tokens and raw-size map (W6); **0 visual-regression specs**                                                                                                                           | **NOT VERIFIED** (gap G2)                                                              |
| 6   | Calm, intentional motion                    | Cross-document view transition with a `prefers-reduced-motion` opt-out (`global.css:573–590`); the reduced-motion state is independently contract-tested (C2)                         | **GUARDED**                                                                            |
| 7   | Resilient error recovery                    | Localized 404s (noindex); redirect matrix + asset-safety negatives (#445); static site with no forms                                                                                  | **PASS** (applicable scope)                                                            |
| 8   | Vietnamese-first, global-ready              | 4 locales; VI glossary sweep PASS (`dist/` HTML + `public/` vtt after F-10); DEC-019 locale **suggestion** contract (`locale-suggestion-contract.test.mjs`). Native zh review missing | VI **PASS (lab)**; zh **NOT VERIFIED** (O-10.6)                                        |
| 9   | Brand distinctiveness                       | Brand Kit v4 applied. No Beauty-Blind review or anti-failure check on record; E5/E6 recognition missing                                                                               | **NOT VERIFIED** (gap G7; recognition is Owner/market)                                 |
| 10  | Cultural integrity where claims are made    | No cultural claims made (C0)                                                                                                                                                          | **NOT APPLICABLE**                                                                     |

**Maturity (BPXS §21):** M3 ASSURED reached, M4 HOUSE COHERENT partial. M5 is not applicable at C0. M6 must not be self-declared.

**Gates (BPXS §20):**

| Gate                   | State                         |
| ---------------------- | ----------------------------- |
| G1 USEFUL              | NOT VERIFIED (needs human E4) |
| G2 USABLE              | PASS (automated)              |
| G3 TRUSTWORTHY         | PASS with finding F-11        |
| G4 CRAFTED             | NOT VERIFIED (no visual gate) |
| G5 DISTINCTIVE         | NOT VERIFIED                  |
| G6 CULTURALLY INTEGRAL | PASS at C0                    |

## 4. Gap matrix

See plan §3 (G1–G9). Material gaps found: **YES**. The required convergence plan is v10 Track A (E1–E7). The Owner-gated residuals are Track B (O-10.1 … O-10.7).

## 5. Plan corrections recorded here

- v9 §3E and F1 said "HSTS without `includeSubDomains`". That is incorrect. Production config has served `max-age=31536000; includeSubDomains` since #43/#46 (2026-09-04), guarded by `tests/architecture/security-headers.test.mjs:14`. Only `preload` is withheld (`seo-contract.test.mjs:125`).
- An earlier v10 idea, "add cross-document view transitions", was dropped: they already exist with a reduced-motion opt-out.
- Navigation prefetch is not a new idea. It is the already-approved experiment M02 (`docs/superpowers/plans/2026-09-24-marketing-full-audit-experience-convergence.md:381`), which keeps its constraints: no prerender, an allowlist, measure first, NO-GO is valid.

## 6. Not verified by this record

- Production: Access is still on, and `https://blueskyzlabs.com/` returns 302.
- Field CWV, real devices, native Safari/Firefox, screen readers, native VI/zh review, Human E4, E5/E6.
- Firefox and WebKit results come from CI only. Local runs were Chromium only.

## References (informed-by, read 2026-10-03)

- web.dev, "Web Vitals": https://web.dev/articles/vitals
- web.dev, "How the Core Web Vitals metrics thresholds were defined": https://web.dev/articles/defining-core-web-vitals-thresholds
- W3C WAI, "What's New in WCAG 2.2": https://w3.org/WAI/standards-guidelines/wcag/new-in-22/
- Chrome for Developers, "Page is blocked from indexing" (Lighthouse `is-crawlable`): https://developer.chrome.com/docs/lighthouse/seo/is-crawlable
- MDN, "Speculation Rules API": https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API
- Chrome for Developers, "Cross-document view transitions for multi-page applications": https://developer.chrome.com/docs/web-platform/view-transitions/cross-document
