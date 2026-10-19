# RUM beacon observed payload, 2026-10-20

**Purpose:** the last open step of the RUM decision (`docs/current-work.json` `rum-provider`, issue #451). Capture one Cloudflare Web Analytics beacon on production and compare its keys with `docs/sgps/adoption/rum-beacon-fields.json`.
**Kind:** agent (E3) observation. It is not a legal review, and it does not close #451 by itself.

## Method

- Opened `https://blueskyzlabs.com/en/` and then `/en/about/` in headless Chromium 130 with a desktop browser user agent.
  - Without a browser user agent, Cloudflare does not inject the beacon tag.
- The production HTML carries `https://static.cloudflareinsights.com/beacon.min.js/<version>` with an `integrity` attribute.
- Each `POST /cdn-cgi/rum` was intercepted, recorded and answered locally with `204`, so nothing reached the provider and no visit was counted.
- Every other request was fetched by Node with TLS verification on. The container's Chromium does not trust the egress proxy CA.
- **Result:** two beacons were captured, one per page load. Both had `eventType: 1` (page load) and the same 39 keys.

## Observed keys and comparison

| Observed keys                                                                                                                                                      | Declared group      | Assessment                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `startTime`, `nt`, `firstPaint`, `firstContentfulPaint`, `timingsV2.*` (DNS, connect, TLS, request/response, DOM, load timings, transfer and body sizes, protocol) | `navigation-timing` | Declared                                                                                                         |
| `location` (full page URL)                                                                                                                                         | `page-path`         | Declared. It is the full URL, so a query string would be sent if a page had one.                                 |
| `eventType`, `versions.fl`, `versions.js`, `versions.timings`, `st`, `siteToken`                                                                                   | not declared        | Beacon and site metadata. `siteToken` identifies the site, not the visitor.                                      |
| `pageloadId`                                                                                                                                                       | not declared        | A 36-character random ID per page load. It differed between the two loads, and no cookie or storage was written. |
| `bi.be`, `bi.bev`, `bi.bv`                                                                                                                                         | not declared        | Browser engine and version (`Blink`, `130`).                                                                     |
| `memory.totalJSHeapSize`, `memory.usedJSHeapSize`, `memory.jsHeapSizeLimit`                                                                                        | not declared        | JavaScript heap figures (Chromium only).                                                                         |
| no `referrer` key                                                                                                                                                  | —                   | Not sent on these navigations.                                                                                   |
| no LCP, CLS or INP keys                                                                                                                                            | `core-web-vitals`   | **NOT VERIFIED.** No Web Vitals event was observed in this headless run.                                         |

## Findings

1. **No visitor identifier was observed.** There was no cookie, user, session or IP field in the payload. The visitor IP is visible to Cloudflare at the transport layer, as for any request to the site.
2. **Three field groups go beyond the declared contract:** `pageloadId`, `bi.*` and `memory.*`.
   - `pageloadId` is a per-page-load identifier. It is not a persistent or cross-page one.
   - The decision text says to "fall back to a first-party beacon" if identifiers are found. Whether a per-page-load random ID counts is an Owner call.
3. **Core Web Vitals delivery is still NOT VERIFIED.** It needs a real-browser visit with interaction, or the provider dashboard.

`rum-beacon-fields.json` `declaredFields` is unchanged. Widening the contract, or falling back to a first-party beacon, waits for that decision.
