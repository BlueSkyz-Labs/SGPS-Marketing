# v10 E5: Lighthouse SEO lab truth

**Recorded:** 2026-10-03, by the orchestrator. **Base:** `main@5b76df4`. Lighthouse 13.4.1, Chromium 141, local lab only (not field data).

## Problem (gap G5)

The two performance lanes build with `PUBLIC_SITE_URL=http://127.0.0.1:3000`. `BaseLayout` correctly treats that origin as non-production and emits `noindex, nofollow`. So `categories:seo` was 0.69 on every route, and was only a warning. A real SEO regression would have been hidden inside that permanent warning.

## Change

- A third Lighthouse step, `node scripts/run-lighthouse-seo.mjs`:
  - rebuilds `dist/` with the canonical origin `https://blueskyzlabs.com` and serves it locally;
  - runs `lighthouserc.seo.json`, which collects **SEO only** on the 4 mobile gate routes, 3 runs each.
- `categories:seo ≥ 0.95` is an **error**. These audits are also errors: `is-crawlable`, `canonical`, `hreflang`, `http-status-code`, `document-title`, `meta-description`, `robots-txt`, `crawlable-anchors`, `link-text` and `image-alt`.
- Reports go to `.lighthouseci-seo/`, so the performance report directory and any budget script reading it stay clean.
- The step runs **after** the desktop and mobile lanes, because it overwrites `dist/`.
- `lighthouserc.mobile.json` and `lighthouserc.seo.json` are added to `PROTECTED_PATHS`.
- The existing performance lanes are unchanged. `is-crawlable: off` stays there, because the lab origin's `noindex` is correct behaviour.

## Evidence

| Check                                                          | Result                                                                                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Production-origin build                                        | No `<meta name="robots">`; canonical is `https://blueskyzlabs.com/en/`; `robots.txt` contains `Allow: /` and the production sitemap  |
| SEO lane, 4 routes × 3 runs                                    | **12/12 runs score 1.00**; no failing weighted audit                                                                                 |
| Negative proof 1: an invalid hreflang code (`vn-XX`) on `/en/` | **FAIL**: `hreflang` and `categories:seo`                                                                                            |
| Negative proof 2: injected `noindex, nofollow`                 | **FAIL**: `is-crawlable` and `categories:seo`                                                                                        |
| Negative proof 3: meta description removed                     | **FAIL**: `meta-description` and `categories:seo`                                                                                    |
| Control (restored file)                                        | PASS                                                                                                                                 |
| Guard `lighthouse-seo-lane.test.mjs`                           | 6/6 pass. Its own negative proofs each fail 1 test: SEO downgraded to `warn`, reports in `.lighthouseci`, launcher on the lab origin |
| Architecture suite                                             | 1087/1087                                                                                                                            |
| Lint and format                                                | PASS                                                                                                                                 |

## Deviation from the card

The card's negative proof was "remove one hreflang alternate". Lighthouse's `hreflang` audit checks only code validity, not reciprocity, so that mutation would not fail this lane. Reciprocity is already guarded by `tests/architecture/hreflang-contract.test.mjs`. Proof 1 uses an invalid code, which this lane does detect.

## Limits

This is lab evidence only. It does not prove indexing or ranking. Production SEO, meaning a crawl of the live apex after Access is lifted, stays **NOT VERIFIED** until the v9 §3E smoke has run.
