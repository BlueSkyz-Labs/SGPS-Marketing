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

## Open at this record

- #604 U7 Verify cards, #607 P2-9 home capture crop, #609 P2-7 action tiers: each
  regenerates visual baselines and waits for the Owner's `owner-approved` label.
- P2-6 display tier: waits for an Owner choice. Either (a) inner short-title H1 moves to the
  display step `--size-9`, or (b) the item closes as is.
- P2-9 "strengthen the Sổ Tâm strip": not started. The red-team synthesis text for it is not
  in the repository.
- Remote branch cleanup: the session proxy refuses ref deletion (HTTP 403). Branches of
  merged PRs need deletion by the Owner.
