# ADR 0015: Field Core Web Vitals through Cloudflare Web Analytics

**Status:** Accepted by the Owner on 2026-10-11. The beacon stays off until the Owner enables it in the Cloudflare dashboard after this change is deployed.

**Decision owner:** BlueSkyz Labs (Human Owner).

**Authority:** SGPS-DEC-2026-039 Part C (sgps-core #284). SGPS-DEC-2026-032 aggregate-only rules. Local mapping: `docs/sgps/adoption/SGPS_DEC_2026_032_PORTFOLIO_OBSERVATION.md`.

**Evidence:** `docs/evidence/2026-10-11-rum-c3-cloudflare-web-analytics.md` (C3 primary-source check, PR #571).

## Context

Issue #451 cannot close without field Core Web Vitals. SGPS-DEC-2026-039 §3.5 sets the order:

1. a published privacy notice;
2. public traffic;
3. gates C1 and C3 closed;
4. then a beacon, with a CSP change scoped to the provider and a negative proof against identifiers.

State on 2026-10-11:

- The privacy notice is published (#556).
- The site is public (C4).
- The Owner chose Cloudflare Web Analytics (C2, 2026-10-05).
- The C3 check found three things:
  - retention is documented;
  - the payload fields are not enumerated by the provider;
  - the beacon script is third-party and cannot be version-pinned.

The Owner was given three options:

- **A:** automatic injection by Cloudflare.
- **B:** a first-party beacon.
- **C:** edge-only analytics.

## Decision

Option **A**, chosen by the Owner on 2026-10-11.

- **Script:** Cloudflare Web Analytics, automatic injection, on `blueskyzlabs.com` only.
- **CSP:** `script-src` admits exactly one third-party source, `https://static.cloudflareinsights.com/beacon.min.js/` (trailing slash, see the 2026-10-13 note). There is no host-wide or wildcard entry.
- **Endpoint:** `connect-src` stays `'self'`, because the proxied zone posts to `/cdn-cgi/rum`.
- **Trusted Types:** `require-trusted-types-for 'script'` stays on. If the beacon trips it, the beacon fails closed and we learn that from missing data, not from a weaker CSP.
- **Gate C1** (legal review of aggregate-only collection): the Owner accepts the residual risk (R2 privacy/legal) on 2026-10-11 in place of an independent legal opinion.
- **Gate C3:** stays **PARTIAL**, and the Owner accepts it. The declared fields are in `docs/sgps/adoption/rum-beacon-fields.json`. After enablement, one real beacon request is captured and its keys are compared with that file. Any identifier-like key means the kill switch.
- **Exception to the zero-third-party rule:** it covers this one script path in production only. CI builds carry no injected script, so the performance budget (`third-party: 0`) and its guards stay unchanged.
- **Privacy notice:** it names the processor, what is sent, cookie/storage use and retention in every locale. It is deployed **before** the Owner enables the beacon.

## Kill switch and rollback

1. Disable Web Analytics for the zone in the Cloudflare dashboard. This stops collection immediately.
2. Remove the script path from `public/_headers` and the processor sentence from the privacy copy in one PR.

## Note 2026-10-13: trailing slash on the script source

Automatic injection serves the beacon from `/beacon.min.js/<version>`, not from `/beacon.min.js`. In CSP path matching, a source path without a trailing slash matches that exact path only, so the original source blocked the injected tag and no data arrived. A trailing slash makes the source a prefix match on that one path. The host stays exact, there is no wildcard, and no other path on the host is admitted. The guard now pins the slash form, and its negative proof rejects a wildcard host, a different path, the slash-less form and a bare host.

## Guards

`tests/architecture/rum-beacon-contract.test.mjs`:

- **CSP:** exactly the one path, `connect-src 'self'`, and Trusted Types on.
- **Fields:** declared fields carry no identifier. A negative proof shows that `visitorId`, `session_id`, `client-ip` and similar names fail.
- **Notice:** the privacy notice names the processor in all four locales.

`scripts/smoke-assets.mjs` expects the exact `script-src` directive in production.

## Residual risk

- **Unpinned code:** the provider can change `beacon.min.js` at any time. Automatic injection adds SRI to the tag, but the provider controls both the script and that hash.
- **Field list not independently verified:** until the post-enable capture, the fields rest on the provider's own description.
- **Weakest point:** we cannot review the code that runs in our origin. A first-party beacon (option B) would remove this, at the cost of owning the collection code.

**Accountable:** Human Owner.
