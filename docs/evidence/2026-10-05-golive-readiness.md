# Go-live readiness record — audited head `11d5aec5`

**Historical status at 2026-10-05:** agent-side checks were complete and the
owner actions below were still pending. For the latest public runtime
observation, see [2026-10-07-golive-runtime-observation.md](2026-10-07-golive-runtime-observation.md).
Every claim below was produced by execution against the exact revision
`11d5aec58d6e8a58da49e403c176c0c522f57e99` (fresh worktree, production-origin
build). Evidence classes: EXACT_HEAD + RUNTIME_VERIFIED where stated.

## What was executed (all green)

| Stage                                                                | Result                                                                                                                                                                                                |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Production-origin build (`PUBLIC_SITE_URL=https://blueskyzlabs.com`) | 98 pages, static export verified                                                                                                                                                                      |
| Canonical / robots / sitemap / product-trust                         | apex baked, 0 localhost, `Allow: /`, 77 locs, apex manifest                                                                                                                                           |
| Architecture guards                                                  | **1267 pass / 0 fail** (1 jq-dependent skip)                                                                                                                                                          |
| Client JS budget                                                     | PASS (site-wide 14872 < 120000 Brotli)                                                                                                                                                                |
| Static links                                                         | PASS (0 broken)                                                                                                                                                                                       |
| Publishability                                                       | PASS (public truth, evidence, locale parity, product, claim integrity)                                                                                                                                |
| Rollback candidate (this head)                                       | **ELIGIBLE** (`--candidate <sha>`; provider mapping NOT_VERIFIED by design)                                                                                                                           |
| Deployment-evidence binding                                          | full SHA → PASS; abbreviated → FAIL; stale → FAIL (fail-closed proven)                                                                                                                                |
| Production smoke vs the local Workers runtime                        | **33 PASS / 3 FAIL — the 3 are the documented `--site`-origin artifacts**, each proven satisfiable at the apex (canonical/robots/sitemap compare against the argument while the build bakes the apex) |

## The Owner's remaining acts (in order)

1. **Lift Cloudflare Access** — dashboard → Zero Trust → Access → app
   `blueskyzlabs.com` → Delete. Precondition check:
   `curl -s -o /dev/null -w "%{http_code}" https://blueskyzlabs.com/en/` → 200.
2. **Read the deployed revision from the Cloudflare dashboard** (Worker →
   Deployments → version → commit) — the 40-char SHA for the smoke and the
   ledger comes from there; the smoke's own echo is not SHA proof.
3. Optional decisions recorded in `docs/current-work.json`: contact/security
   emails (#281), RUM transmission order (Cloudflare Web Analytics chosen
   2026-10-05), `/.well-known/*` bypass if any Access policy remains,
   HSTS preload.

## Then §3E (operator runbook)

`docs/operations/production-smoke-and-rollback.md` (fixed in #503) +
the scratch one-pager `SECTION-3E-RUNBOOK.md`. Key traps already recorded:
no `--` before the ledger path; ledger filename contains `post-merge`;
smoke runs without `--site`; rollback target at/after the D-0 floor.

## Known non-blockers (owner-domain)

Human E4 self-tests, VI copy cross-check, trademark/legal clearance,
specialty print, native zh copy review of one claim titleLabel — all
recorded as non-blockers per `docs/current-work.json`.

## Addendum — 2026-10-07

Cloudflare Access is now lifted on the public path observed: the apex returned
HTTP 200 and `www` redirected to the apex. The production smoke passed 37/37
checks. The served revision was not read back from Cloudflare, so this does not
complete §3E or certify a deployment. Production contact, support, and security
routes currently contain no `mailto:` links; mailbox readiness remains open.
See [the observation record](2026-10-07-golive-runtime-observation.md) for the
full result and remaining provider gates.
