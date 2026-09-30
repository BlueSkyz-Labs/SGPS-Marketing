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

## Known trade-off

An in-flow strip pushes the page down by its own height (about 87 px at 390 px) once, when a visitor with a mismatching browser language and no saved choice loads a localized page. Default en-US visitors and Lighthouse never see it.
