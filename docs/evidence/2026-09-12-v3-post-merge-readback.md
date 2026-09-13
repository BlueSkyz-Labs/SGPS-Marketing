# v3 Exact-Head Promotion & Post-Merge Production Read-Back (Task 23)

**Deployed head:** `64285ac` (main, 2026-09-12) — merges #134 brand guard,
#135 evidence ledgers, #136 UI premium waves 1+2.
**Deploy authority:** Cloudflare Workers Builds on `main` (check-run success
on `64285ac`; no local deployment).

## Read-back results (live, https://blueskyzlabs.com)

| Surface                                     | Result                                                                                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| EN home `/en/`                              | 200, localized hero, critical nav links present                                                                                                |
| VI home `/vi/`                              | 200, localized hero                                                                                                                            |
| Privacy `/en/privacy/`, `/vi/privacy/`      | 200                                                                                                                                            |
| Security `/en/security/`, `/vi/security/`   | 200 (private reporting CTA intact)                                                                                                             |
| Support `/en/support/`, `/vi/support/`      | 200                                                                                                                                            |
| Evidence Passport (security claim)          | 200, public, `data-evidence-passport` present                                                                                                  |
| `.well-known/sgps.json`                     | 200, schemaVersion 1.0, claims mirror the fabric                                                                                               |
| Decision Room `/en/decision-room/`          | 200, workspace present (`data-decision-room`)                                                                                                  |
| Products truth behavior                     | 200; empty registry honest (smoke + sitemap checks)                                                                                            |
| Seven legacy-root 301s                      | ALL PASS (`/`, `/about/`, `/contact/`, `/privacy/`, `/security/`, `/support/`, `/products/`)                                                   |
| robots.txt + sitemap                        | PASS: canonical localized routes only                                                                                                          |
| **Unknown path → branded 404** (new P0 fix) | **status 404 + 16,274 B real page** on `/en/*`, `/vi/*`, root, and unknown passport ids — the previous blank 15-byte 404 is gone in production |

Smoke command: `SMOKE_COMMIT_SHA=64285ac node scripts/smoke-production.mjs` →
**ALL PRODUCTION SMOKE CHECKS PASS**.

## Exact-head CI evidence

- #129 `337a111`, #130 `6c9e0ca`, #131 `9a06762`, #132 `b672169`, #133
  `9030a02`, #134 `ab6db40`, #135 `88e4dcc`, #136 `64285ac` — Quality Gates +
  Browser Assurance + Workers Builds all green at their heads (strict
  up-to-date enforcement exercised after every merge).

## Residual (unchanged, owner/external)

- Human E4 — **NOT RUN** (protocol `2026-09-12-v3-human-e4.md`).
- VI copy review by owner; RUM/analytics provider decision (transmission OFF).
- Owner PRs #125 (v3.1 design) / #126 (principal red-team plan) remain open
  with failing checks; their NEW-ACTIONABLE items were triaged in the recon
  brief (bilingual a11y chrome adopted and shipped in #136).
