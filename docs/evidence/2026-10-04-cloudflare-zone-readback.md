# Cloudflare zone read-back: bot settings, Access coverage, `www` (RT-01)

**Date:** 2026-10-04, 02:48–03:00 UTC (09:48–10:00 GMT+7).
**Zone:** `blueskyzlabs.com`, plan **Free**.
**Method:** Cloudflare API, using the Owner's scoped token from the session environment. The token was never printed. Live edge checks used `curl` with TLS verification on.
**Supersedes:** the Bot Fight Mode diagnosis in `2026-10-04-post-deploy-edge-checks.md`, which was inferred from the injected script and never read back.

## Correction

Bot Fight Mode was **not** on. The bot settings read back as:

- `fight_mode: false`
- `enable_js: true`

The injected `/cdn-cgi/challenge-platform/scripts/jsd/main.js` came from the standalone **JavaScript Detections** setting. The earlier advice to turn off Bot Fight Mode, and the trade-off analysis around webhooks, rested on that wrong inference. Sổ Trọ's edge runbook requirement that Bot Fight Mode is off is already met.

## Change applied (Owner-authorised, 2026-10-04)

| Setting                    | Before | After   | Read-back diff          |
| -------------------------- | ------ | ------- | ----------------------- |
| `bot_management.enable_js` | `true` | `false` | Only this field changed |

**Live verification**, about 20 seconds after the change: `challenge-platform/scripts/jsd` occurs 0 times in the HTML of `/` and `/vi/` on `www.blueskyzlabs.com`, `sotro.blueskyzlabs.com` and `sotam.blueskyzlabs.com`. Before the change it occurred once on each.

**Effect:**

- The edge-injected inline script, and the CSP console error it caused, are gone on all three hosts.
- On the Free plan no rule consumed the JavaScript Detections signal, so no protection was removed.

**Rollback:** set `enable_js` back to `true`.

## Read-back: other zone state (no change made)

| Item                                               | Value                                                                                                                                      | Assessment                                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| TLS                                                | `ssl` `strict`, `min_tls_version` 1.2, TLS 1.3 on, Always Use HTTPS on, 0-RTT off                                                          | Meets baseline                                                                                               |
| HSTS                                               | max-age 31536000, `includeSubDomains`, preload **off**, nosniff                                                                            | Matches the Sổ Trọ runbook (preload deliberately off)                                                        |
| AI crawlers                                        | `ai_training: block`                                                                                                                       | OK                                                                                                           |
| WAF custom rules                                   | 2 rules (scanner paths, unexpected methods), both enabled, action Block                                                                    | Sổ Trọ `edge-rules.json` applied                                                                             |
| Rate limiting                                      | 1 rule: POST to auth/pair/register/incident/support on `sotro.`, 20 requests per 10 s per (colo + IP), timeout 10 s; webhook path excluded | Applied. The rule description says "block 60s" but the live timeout is 10 s, so the text should be corrected |
| `workers.dev` / preview URLs                       | Disabled for `blueskyz-web`, `sotam-web-production`, `sotro-production`                                                                    | No bypass there                                                                                              |
| Worker custom domains for `blueskyz-web`           | `blueskyzlabs.com`, `www.blueskyzlabs.com`                                                                                                 | `www` is served by the same Worker                                                                           |
| Access app `blueskyzlabs.com`                      | Destinations: `blueskyzlabs.com` only. One reusable allow policy (Owner only), 24 h session                                                | **Does not cover `www`**                                                                                     |
| Single Redirects (`http_request_dynamic_redirect`) | Empty at first read; now rule `www_to_apex_301` (see RT-01)                                                                                | RT-01 redirect not present                                                                                   |
| Email obfuscation                                  | On; no `email-decode` or `__cf_email__` found in sampled HTML                                                                              | Low priority: turn off for strict-CSP sites                                                                  |

## RT-01 status: CLOSED by Single Redirect (2026-10-04, about 04:10 UTC)

`www.blueskyzlabs.com` was the only path around the apex Access gate. The agent created a Single Redirect under the Owner's explicit instruction. The read-back of the `http_request_dynamic_redirect` entrypoint is:

- `ref`: `www_to_apex_301`, enabled;
- expression: `(http.host eq "www.blueskyzlabs.com")`;
- target expression: `concat("https://blueskyzlabs.com", http.request.uri.path)`;
- status 301;
- `preserve_query_string: true`.

**Live verification** (curl, TLS on). No response body below contained site HTML (`<main` absent):

| Request                                           | Result                                                                                                |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `https://www.blueskyzlabs.com/vi/`                | 301 → `https://blueskyzlabs.com/vi/`                                                                  |
| `https://www.blueskyzlabs.com/en/products/?utm=x` | 301 → `https://blueskyzlabs.com/en/products/?utm=x` (query kept)                                      |
| `https://www.blueskyzlabs.com/`                   | 301 → `https://blueskyzlabs.com/`                                                                     |
| `http://www.blueskyzlabs.com/vi/`                 | 301 → `https://blueskyzlabs.com/vi/` (one hop)                                                        |
| `https://www.blueskyzlabs.com//evil.example/`     | 301 → `https://blueskyzlabs.com/evil.example/`: the host stays fixed, so this is not an open redirect |
| Following redirects from `www/vi/`                | Ends at the Cloudflare Access login for `blueskyzlabs.com`                                            |
| Apex `/vi/`, `sotro.`, `sotam.`                   | Unchanged: 302 to Access, 200, 200                                                                    |

This settles the earlier NOT VERIFIED point: the Single Redirect runs **before** the Worker Custom Domain.

**Interim Access destination for `www`: not applied.** The session's safety controls held that account-level change. With the redirect in place it is defence-in-depth only. It would matter only if the redirect rule were disabled or deleted, in which case `www` would again serve the Worker publicly. The fully fail-closed variant remains an Owner option:

- add `www` to the Access app; or
- remove `www` from the Worker's custom domains and keep only a proxied placeholder record.

**Rollback:** delete or disable rule `www_to_apex_301`.

**Known side effect:** `/.well-known/security.txt` now has no anonymous path until go-live, because the apex returns 302 to Access. To keep the security contact public, add an Access Bypass policy for `/.well-known/*` on the apex (Owner decision pending), or accept this until go-live.

## Limits

- Security Events analytics (`firewallEventsAdaptiveGroups`) is not available to this zone on the Free plan, so the amount of blocked traffic is unknown.
- Dashboard menu names change over time. The API values above are authoritative.
