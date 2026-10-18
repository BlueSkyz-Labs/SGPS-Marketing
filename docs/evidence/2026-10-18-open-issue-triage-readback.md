# Open issue triage and production read-back (2026-10-18)

Bound to `main@6b07adc` (after #635, #636, #637, #639). Times GMT+7. Environment: cloud container, `curl` through the session proxy, public DNS over HTTPS, GitHub REST API. This is observation of public production responses, not a provider-served SHA.

## Production read-back (anonymous, 2026-10-18 ~9 PM)

| Check                                                | Result                                                                                                                                                                                  |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/robots.txt`                                        | 200, `Allow: /` for all agents, `Sitemap: https://blueskyzlabs.com/sitemap.xml`                                                                                                         |
| `/sitemap.xml`                                       | 200 `application/xml`, 73 `<loc>` entries                                                                                                                                               |
| Canonical on `/`, `/en/`, `/en/about/`, `/vi/about/` | Self-referencing `https://blueskyzlabs.com/...`                                                                                                                                         |
| `meta robots` / `X-Robots-Tag` on `/en/`             | absent (indexable)                                                                                                                                                                      |
| JSON-LD                                              | `Organization` (name, url, logo) and `WebSite` (4 languages) on every page checked; no founder, foundingDate, sameAs or email inferred                                                  |
| Published mailboxes                                  | `/en/contact/`: `tony@` and `support@`; `/en/support/` and `/vi/support/`: exactly one `mailto:support@blueskyzlabs.com` as the primary action                                          |
| Admin identity leakage                               | 0 occurrences on the pages checked                                                                                                                                                      |
| `/.well-known/security.txt`                          | 200, RFC 9116, contact = GitHub private advisory, expires 2027-09-12                                                                                                                    |
| CSP                                                  | `script-src` allows only `https://static.cloudflareinsights.com/beacon.min.js/`; `connect-src 'self'`                                                                                   |
| Cloudflare Web Analytics beacon                      | **Not present** in `/`, `/en/`, `/vi/` HTML (0 matches for `cloudflareinsights`). The 2026-10-13 observation of an injected tag does not hold today.                                    |
| Wave 4 (#637)                                        | Header shows Products, About, Contact; home Next steps includes Verify; Sổ Tâm has no early Next-steps band and its journey primary is Contact; `/verify` support row reads "published" |

## Provider identity for the exact commit

The `Workers Builds: blueskyz-web` check run on `6b07adc` reports build `245a0391-2762-4311-b8eb-725e4bfcc274` and **Version ID `58445d9b-dfa5-41af-b583-9abb050cdf26`** (success, 2026-10-18 13:58 UTC). This binds commit → Worker version. Which version is currently _deployed_ (served) still needs a provider deployment read-back (`wrangler deployments list` or the dashboard); the public HTML carries no build identity. Served SHA: NOT_VERIFIED.

## Public DNS (informational)

- MX: `blueskyzlabs-com.mail.protection.outlook.com` (Microsoft 365)
- SPF: `v=spf1 include:spf.protection.outlook.com -all`
- DMARC: `v=DMARC1; p=reject; adkim=s; aspf=s`

DNS shows a receive path exists. It does not prove that `support@` is a real alias, who reads it, or that a reply works.

## CI stability (for #284)

Browser shards of Source Assurance runs `39108039423` (`7232842`) and `39105626506` (`1861bb4`): 8 shard jobs, 0 failed, 0 flaky, 2145–2283 passed each. The `c2-product-continuity` cold-start budget was widened in #295. The Lighthouse SEO warning is the local `noindex` artifact (`is-crawlable` off in `lighthouserc.json`); production is indexable per the table above.

## Issue dispositions

| Issue                  | Disposition                  | Basis                                                                                                                                       |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| #561 W0                | Close (completed)            | `docs/evidence/2026-10-12-w0-render-truth.md` (164 captures). Human E4 stays an Owner residual in `docs/current-work.json`.                 |
| #562 W2                | Close (completed)            | #563, #618 merged                                                                                                                           |
| #564 W3                | Close (completed)            | #567, #568 merged                                                                                                                           |
| #565 W4                | Close (completed)            | #572 merged; 2026-10-18 audit waves #632, #633, #634, #636, #637 merged. Native VI/zh review stays an Owner residual.                       |
| #557 discovery         | Close (completed)            | Children W0–W4 done; W5 continues in #566                                                                                                   |
| #284                   | Close (completed)            | CI stability above                                                                                                                          |
| #281                   | Close (superseded by #522)   | `support@` is Owner-confirmed and published; Sổ Trọ copy now matches. Mailbox operating evidence is tracked as DEC-038 EI-03/EI-13 in #522. |
| #293 Council v2        | Close (completed/superseded) | P1 #291/#292 closed; roadmap superseded by the v5–v13 plans and #616                                                                        |
| #310 research pilot    | Close (not planned)          | Needs real consenting participants; zero exist. Folded into the Owner-executed Human E4 residual. Draft #311 closed unmerged.               |
| #638 APK landing       | Open — DEPENDENCY_WAIT       | Policy #639 merged, routing #640. Needs a Sổ Trọ signed artifact and public GO.                                                             |
| #566 W5                | Open — partial               | Commit → version bound above; served-version read-back needs provider access.                                                               |
| #523 P0 verification   | Open — partial               | Source PASS; runtime crawlability/canonical/JSON-LD/no-leak PASS above. Remaining: mailbox round trip, Search Console, served revision.     |
| #522 DEC-038           | Open — MAPPED                | `docs/sgps/adoption/SGPS_DEC_2026_038_EMAIL_IDENTITY.md`; five rules BLOCKED on tenant evidence.                                            |
| #451 DEC-028           | Open — residual              | Lab gate ADOPTED; field CWV needs the beacon, which is absent from production today.                                                        |
| #290 Test Intelligence | Open — executable            | Canonical `skills/test-audit/SKILL.md` exists in sgps-core; local mapping not yet written.                                                  |
