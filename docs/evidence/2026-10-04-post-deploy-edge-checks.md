# Post-deploy edge checks: RT-07 Trusted Types, RT-03 single hop, edge-injected script

**Date:** 2026-10-04 03:50–04:00 GMT+7 (2026-10-03 20:47–20:57 UTC)
**Host measured:** `https://www.blueskyzlabs.com`. The apex is behind Cloudflare Access (302 to the Access login), so it could not be measured anonymously. `www` still serves the site with 200 (RT-01 www → apex is still open).
**Edge identity:** `server: cloudflare`, sample `cf-ray: a44edaa6cd8ad471-IAD`.
**Deployed revision:** NOT VERIFIED. The site exposes no revision marker. The deployed build contains #465 (single-hop rules answer) and #467 (`require-trusted-types-for 'script'` is present in the live CSP), so it is at or after `main` `1e6fa40`.

## Method

- Pages were fetched with `curl`, with TLS verification on. The session's egress proxy CA is not in the sandboxed Chromium trust store, and TLS checking was not disabled.
- Chromium (Playwright) received each live response unmodified, through request interception: the edge HTML body plus the edge response headers, including the CSP. CSP and Trusted Types were therefore enforced exactly as a visitor's browser enforces them.
- Requests to other origins were aborted and recorded. There were none.
- For each page the probe:
  - recorded `securitypolicyviolation` events and CSP/Trusted Types console messages;
  - recorded page errors;
  - clicked the first `aria-haspopup` button, `summary` and theme toggle, to exercise interactive code.

Routes: `/`, `/vi/`, `/en/`, `/vi/products/sotro/`, `/en/products/`, `/vi/journal/`, `/zh-hant/`, `/vi/products/sotro/guide/`, `/vi/verify/`.

## Results

| Check                                                        | Result       | Evidence                                                                                                                                                                      |
| ------------------------------------------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RT-07: live CSP carries `require-trusted-types-for 'script'` | PASS         | All 9 routes.                                                                                                                                                                 |
| RT-07: Trusted Types violations from site code               | PASS (0)     | No `require-trusted-types-for` violation and no page error on any route.                                                                                                      |
| RT-03: no-slash legacy paths answer with one 301             | PASS (10/10) | `/about`, `/contact`, `/privacy`, `/security`, `/support`, `/products`, `/en`, `/vi`, `/zh`, `/zh-hant` → 301 to the `/en/…/` or locale root with a trailing slash, then 200. |
| Third-party requests from pages                              | PASS (0)     | No cross-origin request was attempted.                                                                                                                                        |
| Inline script blocked by CSP                                 | FINDING      | 1 `script-src-elem` violation on every route (below).                                                                                                                         |

## Finding: Cloudflare JavaScript Detections is injected and blocked

Every HTML response carries an inline `<script>` that the site does not emit. It sets `window.__CF$cv$params` and loads `/cdn-cgi/challenge-platform/scripts/jsd/main.js`. This is Cloudflare **JavaScript Detections** (Bot Management / Bot Fight Mode), injected at the edge.

The CSP `script-src 'self'` blocks it ("Refused to execute inline script …"). Cloudflare's own documentation describes exactly this console error for a CSP without nonces. Source: [Cloudflare docs: JavaScript Detections](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/), last updated Sep 2026, read 2026-10-04.

Impact:

- **Functional:** none. The script never runs, so no `cf_clearance` cookie is set by it, and the page and its interactions work.
- **Hygiene:** one CSP console error on every production page. Lighthouse's console-errors audit can see it in production, though not in CI, which serves the local build.
- **Public truth:** the site states "no tracking on this site" (`privacy-no-tracking-on-this-site`). The script is blocked, so the claim holds in effect. Still, a bot-signal script being injected next to that claim is the wrong posture.

Options considered:

1. **Turn off JavaScript Detections / Bot Fight Mode for the zone (recommended, Owner action in the Cloudflare dashboard).** Cloudflare documents that for Bot Fight Mode customers JavaScript Detections is automatically enabled and cannot be disabled separately, so this means turning off Bot Fight Mode. Source: [Cloudflare docs: Bot Fight Mode](https://developers.cloudflare.com/bots/get-started/bot-fight-mode/), read 2026-10-04. This removes the injection without weakening the CSP. For a static, form-less brand site the bot signal has no consumer: no WAF rule reads `cf.bot_management.js_detection.passed`.
2. **Send `Cache-Control: no-transform` on HTML from `_headers`.** Rejected. Cloudflare documents that `no-transform` stops the injection, but it also disables edge compression when the origin payload is uncompressed, which would inflate HTML well past the DEC-025 document budget. Source: [Cloudflare docs: Origin Cache Control](https://developers.cloudflare.com/cache/concepts/cache-control/), read 2026-10-04.
3. **Allow the script with `'unsafe-inline'` or a nonce.** Rejected. It weakens the CSP. The injected loader also writes through `innerHTML`, which `require-trusted-types-for 'script'` blocks anyway.

## Limits

- Anonymous measurement of the apex awaits the Access lift at go-live. Re-run this probe against `https://blueskyzlabs.com` then.
- Chromium only. WebKit and Firefox enforcement were not exercised against the live edge. The CI E4 matrix covers them on the local build.
- The deployed SHA is not bound (see above).
