# RUM gate C3: Cloudflare Web Analytics primary-source check, 2026-10-11

**Scope.** SGPS-DEC-2026-039 §3.4 gate C3 for the provider the Owner chose on 2026-10-05 (`rum-provider` in `docs/current-work.json`). This record is E0 desk evidence. It does not open collection, change the CSP or ship a beacon.

**Verdict:** C3 is **PARTIAL / NOT CLOSED**. Retention is now documented. The payload fields are not enumerated by the provider, and the manual beacon conflicts with two existing site invariants. The fallback question in DEC-039 §3.3 goes to the Owner.

## What the provider documents (read 2026-10-11)

| Question                              | Provider statement                                                                                                                                                                                          | Source                                             |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Metrics                               | Navigation timing (`performance.getEntriesByType('navigation')`, with `performance.timing` fallback) and Core Web Vitals, sent when the page first becomes hidden after load                                | Data origin and collection (page dated 2026-04-17) |
| Script host                           | `https://static.cloudflareinsights.com/beacon.min.js`                                                                                                                                                       | same                                               |
| Beacon endpoint                       | `https://<own domain>/cdn-cgi/rum` for proxied sites; `https://cloudflareinsights.com/cdn-cgi/rum` otherwise                                                                                                | same                                               |
| Retention                             | "We retain unsampled beacon data for the past 7 days, after this point data is aggregated down to around 10%." Dashboard shows the previous six months                                                      | FAQ (page dated 2026-07-14)                        |
| Query strings                         | Not logged                                                                                                                                                                                                  | FAQ                                                |
| Version pinning                       | "we do not support version-pinning our beacon script"; a manual embed therefore cannot safely use `integrity`; automatic injection adds one                                                                 | FAQ                                                |
| CSP                                   | `script-src` must allow `https://static.cloudflareinsights.com/beacon.min.js`; `connect-src 'self'` for automatic injection, `cloudflareinsights.com` for manual embed                                      | FAQ                                                |
| Cookies, localStorage, IP, user agent | Not stated on these two documentation pages. Cloudflare's product and blog pages say no cookies or localStorage and no identification by IP or user agent; those are marketing statements, not a field list | product page, blog                                 |

Sources:

- https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/
- https://developers.cloudflare.com/web-analytics/faq
- https://developers.cloudflare.com/web-analytics/about/
- https://www.cloudflare.com/web-analytics/
- https://blog.cloudflare.com/privacy-first-web-analytics/

## Conflicts with current site invariants

1. **Third-party script.** The site's budget counts third-party requests (`scripts/check-performance-budget.mjs`) and the Horizon/Sail plan W5 keeps the zero-third-party-request rule. The beacon script is served from `static.cloudflareinsights.com` in both setups.
2. **Unpinned code in our origin.** The manual embed cannot carry SRI because the provider does not pin versions. Automatic injection adds `integrity`, but the provider can still change what is injected. This weakens the fail-closed supply-chain posture of `public/_headers` (`script-src 'self'`, `require-trusted-types-for 'script'`). Trusted Types compatibility of the beacon is NOT VERIFIED.
3. **Field list.** DEC-039 §3.4 C3 asks for the data fields from a primary source. The provider documents metric families, not the payload schema. A network capture of the beacon on a non-production host would close this, but it is an external action that is NOT VERIFIED here.

## Options for the Owner (DEC-039 §3.3 fallback)

- **A. Keep Cloudflare Web Analytics, automatic injection.** Least work. Needs an exception to the zero-third-party rule, a CSP host allowance and acceptance of unpinned provider code. Beacon data stays same-origin (`/cdn-cgi/rum`).
- **B. First-party beacon to the site's own Worker** (the fallback DEC-039 §3.3 already names). No third-party script, pinned and reviewed code, the field list is ours by construction. Costs a small client script within the 120 kB budget and a Worker endpoint plus storage choice.
- **C. Edge analytics only, no browser beacon.** Server-side request counts need no client code but give no Core Web Vitals, so #451 stays open.

Recommendation: **B**. It is the only option that keeps every existing invariant and makes C3 closable from our own source. Its weakest point: we own collection code and storage, so a bug there becomes our privacy defect.

Unchanged: C1 (SGPS-DEC-2026-032 G3 legal review) is open and Owner-held, and the privacy notice must name the processor before any beacon ships.
