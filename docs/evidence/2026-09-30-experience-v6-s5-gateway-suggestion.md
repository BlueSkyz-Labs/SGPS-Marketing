# Experience v6 S5 — branded gateway and non-overlaying locale suggestion

- **Scope:** `/` language gateway and the locale suggestion placement only. No change to redirect/selection logic, the `blueskyz.ui.language` key, `public/_redirects` or `public/_headers` (ADR 0009 kept).
- **Evidence class:** E1/E2 source and headless Chromium (Linux) evidence; not field, device or Human E4 evidence.

## Findings addressed

- E-14: the gateway rendered as default serif with concatenated links and no `color-scheme`, so dark-scheme visitors saw a white page. It is now a static page with inline `<head>` CSS: lockup (`<picture>` swaps the reverse lockup for dark scheme), one H1, four native-name tiles (Tiếng Việt, English, 简体中文, 繁體中文, each with its own `lang`), `color-scheme`/`theme-color` metas, the site font stack with system fallbacks (no web-font request), 44 px+ targets, no cookie, no stylesheet/script needed for first paint. The former `noscript` "Continue in English" link was removed: the page is itself the no-JS experience and no language is presented as the default.
- E-16: the suggestion was `position: fixed` at the bottom and covered first-viewport content on a 390 px screen. It is now an in-flow compact strip inserted directly under the header (`header.after(region)`), so it cannot overlay content. Behaviour is unchanged: link-only accept, keep button persists the current language, no cookie/network/redirect, fail-closed storage.

## Guards

- `tests/e2e/gateway-and-suggestion.spec.ts`: JS-off gateway styled and readable in both schemes (computed font stack contains the site font, no underline, scheme background and text colours, no overflow, 44 px targets, no cookies); head carries inline scheme styles and no external stylesheet/script; dark first paint with scripts blocked; the suggestion at 390×844 does not intersect the first CTA or any first-viewport `main` content in either scheme, with an in-test negative proof that the old bottom-fixed placement is detected by the same predicate.
- `tests/architecture/locale-suggestion-contract.test.mjs`: the placement assertion changed from "fixed" to "never fixed/sticky/absolute, inserted after the header", plus a negative proof of the audit regex. All privacy/no-tracking/storage/accessibility assertions are unchanged.
- Negative proof: the new e2e spec run against the pre-change build turns all six cases RED.

## Layout shift (review fix)

An in-flow strip inserted by the deferred module script can land after first paint and shift the hero (measured CLS 0.0392 at 1440x900 for a vi-VN visitor on `/en/`). The decision and insertion now happen before first paint in `public/locale-suggestion-early.js`, a synchronous same-origin classic script placed right after the header (CSP `script-src 'self'`, same pattern as `theme-init.js`; no inline code). It runs before the parser reaches `<main>`, so nothing below it has been laid out yet. The module script only attaches the interactions (and still builds the strip itself if the early script did not run). The early script mirrors `src/lib/locale-suggestion.ts`; the architecture contract test runs both against the same vectors (with a drift negative proof) and audits the early file for the same no-cookie/no-network/read-only-storage rules.

Measured CLS (vi-VN, no saved choice, layout-shift observer, 1.5 s after load): before 0.0000 at 390x844 and 0.0392 at 1440x900; after 0.0000 at 390x844, 1440x900 and on `/en/about/`. The e2e guard asserts < 0.01 and includes a negative proof (a late in-flow insert is measured above 0.01).

The early script is a render-blocking same-origin request (4.7 KB raw) on every page that includes the layout; it exits immediately on non-localized paths. Its effect on LCP was not measured here.
