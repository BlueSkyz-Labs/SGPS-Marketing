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
| Single Redirects (`http_request_dynamic_redirect`) | No entrypoint ruleset (empty)                                                                                                              | RT-01 redirect not present                                                                                   |
| Email obfuscation                                  | On; no `email-decode` or `__cf_email__` found in sampled HTML                                                                              | Low priority: turn off for strict-CSP sites                                                                  |

## RT-01 status: still OPEN

`www.blueskyzlabs.com` is the only remaining path around the apex Access gate. Two actions close it. Both are prepared, but neither was executed by the agent: the session's safety controls held both production writes for the Owner.

1. **Interim, fail-closed.** Add `www.blueskyzlabs.com` as a second public destination of the existing Access app `blueskyzlabs.com`. Keep its policy unchanged.
2. **Final.** Create a Single Redirect:
   - match: `http.host eq "www.blueskyzlabs.com"`;
   - target expression: `concat("https://blueskyzlabs.com", http.request.uri.path)`;
   - status 301, query string preserved.

   The target host is fixed, so this is not an open redirect.

   Single Redirects run in the first request phase, before WAF custom rules and Access. Whether they run before a Worker Custom Domain is NOT VERIFIED in the documentation; verify it live.

**Verification after each step:**

- `curl -sI https://www.blueskyzlabs.com/vi/` returns 302 to Access after step 1, and 301 with `location: https://blueskyzlabs.com/vi/` after step 2.
- The body carries no site HTML.

**Known side effect:** after RT-01 closes, `/.well-known/security.txt` has no anonymous path until go-live, because the apex returns 302 to Access. To keep the security contact public, add an Access Bypass policy for `/.well-known/*` on the apex, or record this as accepted until go-live.

## Limits

- Security Events analytics (`firewallEventsAdaptiveGroups`) is not available to this zone on the Free plan, so the amount of blocked traffic is unknown.
- Dashboard menu names change over time. The API values above are authoritative.
