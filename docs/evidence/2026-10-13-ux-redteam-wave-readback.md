# UX red-team wave 2026-10-12/13: merge and production read-back

Scope: the UX red-team synthesis (2026-10-12) U-items and approved P2 items, plus the
customer-experience (CX) and zh review follow-ups. Website repository only.

## Merged (squash, pinned to the tested head; 8 required checks green on that head)

| PR   | Item                                                 | Merge   |
| ---- | ---------------------------------------------------- | ------- |
| #593 | U2 forced-colors brand lockup                        | 18ebb75 |
| #596 | U1 whole-word search                                 | 8f6c2ab |
| #594 | U6 Horizon signature on inner pages                  | 441bb03 |
| #599 | P2-5 unique product link names, real headings        | a97e8a4 |
| #592 | CX2 plain-language Verify/About link text            | c9469d2 |
| #600 | U4 Sổ Trọ profile: PC/web up front, tighter chapters | d6503e6 |
| #598 | U8 locale-aware gateways for unprefixed routes       | a896462 |
| #602 | zh / zh-Hant review fixes (52 rows)                  | 5424c35 |
| #595 | U3 zh-Hant Traditional-first display type            | b4a21c3 |
| #603 | Cloudflare beacon path in CSP, analytics copy        | 500c02a |
| #601 | U5 Sổ Tâm home entry chip, profile next steps        | 7e95eb2 |
| #605 | P2-4 in-page capture viewer                          | b7f9c85 |
| #606 | P2-10 git-derived "Last updated" line                | c3d440a |
| #597 | U10 Owner-approved VI copy, interim note             | 45198bf |
| #608 | P2-8 footer: one column per link group               | 6e81db2 |
| #604 | U7 Verify claims as claim/limit/source cards         | 0fa376a |
| #607 | P2-9 flagship capture: cropped wide, phone narrow    | 7f84740 |
| #609 | P2-7 one pill tier and one link tier for actions     | 1ea2b50 |

Production read-back (curl of https://blueskyzlabs.com after each Workers Build) found the
string or markup each PR introduced, except where noted below. #608: `--footer-groups: 2`
served on /en/ and /vi/ after 6e81db2.

## Not verified / residual

- **#606 "Last updated" line and sitemap `<lastmod>`:** the line is omitted on production,
  and sitemap.xml has 0 `<lastmod>` (read 2026-10-13). The Cloudflare build clone is
  shallow, so git dates are unavailable. This is the truthful fallback. It needs an Owner
  change to the Build command: prefix `git fetch --unshallow --quiet || true && `.
- **#603 RUM beacon:** the production CSP carries
  `script-src … https://static.cloudflareinsights.com/beacon.min.js/` and
  `connect-src 'self'`, with Trusted Types required. No beacon script is injected in the
  served HTML today, so Web Analytics is not yet enabled for all visitors. Whether CSP or
  Trusted Types block the beacon, and whether its payload keys match
  `docs/sgps/adoption/rum-beacon-fields.json`, are **NOT VERIFIED**.
- **#605 capture viewer:** real in-app browsers (Zalo, Facebook, Messenger) and iOS Safari
  `<dialog>` behaviour are NOT VERIFIED. They need an Owner device check.
- Automated/browser evidence does not substitute for Human E4 or native zh review.

## Merged 2026-10-15 (Owner added `owner-approved`)

#604, #607 and #609 were each brought up to date with `main`, re-tested (8 required
checks green on that exact head) and merged in that order, pinned to the tested head.
Production read-back: #604 serves `data-sources-line` on /en/verify/; #607 serves
`data-capture-crop` on /en/ and /vi/; #609 serves the at-rest underlined link
(`underline underline-offset-4 hover:no-underline`) on /en/privacy/. The same day, dependency PRs #612
(`actions/setup-node`, 65013fb) and #613 (`actions/upload-artifact`, c99d26e) merged the
same way; #614 (astro 7.3.8, a484a25) was merged by the Owner.

The P2-7 action-tier spec now also runs on zh and zh-Hant (it covered en and vi only).
Locally, against the #609 head build, it passed for all four locales.

## Open at this record

- P2-6 display tier: waits for an Owner choice. Either (a) inner short-title H1 moves to the
  display step `--size-9`, or (b) the item closes as is.
- P2-9 "strengthen the Sổ Tâm strip": not started. The red-team synthesis text for it is not
  in the repository.
- #615 dev-dependency group (Playwright 1.64.0): the browser shards run in an image pinned
  by digest, so the PR also pins `mcr.microsoft.com/playwright:v1.64.0-noble` to the index
  digest read from mcr.microsoft.com. That changes a protected path and waits for the
  Owner's `owner-approved` label. Visual baselines under 1.64 are NOT VERIFIED until CI
  runs.
- Remote branch cleanup: the session proxy refuses ref deletion (HTTP 403). Branches of
  merged PRs need deletion by the Owner.
