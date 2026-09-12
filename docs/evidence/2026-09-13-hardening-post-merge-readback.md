# Hardening program — post-merge production read-back

Date: 2026-09-13 (Asia/Ho_Chi_Minh)
Deployed revision (declared): `5194e15b0ec460826026f46a89fcf3ff2bc93a4f`
(`docs(ops): wave H10 — production smoke/observability/rollback contract + live 404 check (#148)`, merged to `main`)

This ledger certifies runtime read-back for the hardening program (waves H1–H10)
against the live site **https://blueskyzlabs.com**.

## Smoke suite — ALL PRODUCTION SMOKE CHECKS PASS

`SMOKE_COMMIT_SHA=5194e15 node scripts/smoke-production.mjs`

Verified, in order: EN home 200 (hero tagline, no unexpected noindex) · VI home
200 localized · privacy/security/support in both locales · canonical metadata
on `/en/about/` · seven legacy redirects · `robots.txt` (allow + sitemap link) ·
sitemap (≥14 canonical localized URLs) · decision room workspace · evidence
passport surface · public SGPS manifest (`schemaVersion` 1.0) ·
**`/.well-known/security.txt` (Contact + Expires)** · **branded 404 on EN, VI and
root unknown paths (404 status, branded content, > 5 KB)** · critical navigation
links.

Result line: **ALL PRODUCTION SMOKE CHECKS PASS**

## Edge header read-back (live)

`curl -sI https://blueskyzlabs.com/en/` returns: `strict-transport-security:
max-age=31536000; includeSubDomains` · `content-security-policy: default-src
'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; …;
script-src 'self'` · `permissions-policy: camera=(), microphone=(),
geolocation=(), payment=(), usb=(), interest-cohort=()` · `referrer-policy:
strict-origin-when-cross-origin` · `x-content-type-options: nosniff` ·
`x-frame-options: DENY`.

## Notes

- Workers Builds is the deployment authority; GitHub Actions remains
  source-assurance only (verified in `tests/architecture/deploy-contract.test.mjs`).
- The observability posture and the rollback/fix-forward path are documented in
  `docs/operations/production-smoke-and-rollback.md`.
- Human E4 remains **NOT RUN** — automated read-back does not substitute for
  real participant evidence.
