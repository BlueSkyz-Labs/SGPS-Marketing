# §3E production-smoke — partial run via the public `www` deployment

- **Date:** 2026-10-03 (evening). **Verifier:** coordinator lane, executed in-session.
- **Script:** `scripts/smoke-production.mjs` at `f4434ac9` (`origin/main`), invoked as
  `node scripts/smoke-production.mjs --site https://www.blueskyzlabs.com`.
- **Context:** §3E was owner-gated on the Cloudflare Access lift (apex `blueskyzlabs.com` → **302**).
  During preflight the **`www.blueskyzlabs.com` host was found to be fully public** (HTTP 200, real
  site, full header set) while the apex stays gated. This run therefore exercises the §3E suite
  against the public hostname, covering everything except apex-specific gates.
- **Verdict rule:** PASS / FAIL / NOT VERIFIED only; artifacts are classified, never silently dropped.

## Result: 22 PASS · 3 FAIL (classified) · 1 finding → fixed

### Deployment freshness (why www counts as production evidence)

- `GET https://www.blueskyzlabs.com/products/sotro` (no trailing slash) → **301 in ONE hop** to
  `/vi/products/sotro/` — the RT-03 single-hop fix merged today (#465, main `9ad35a3e`) is live.
- `GET /vi/khong-ton-tai/` → 404 with the branded VI page (`Không tìm thấy trang này`), 37,800 bytes.
- Header set on `/`: HSTS, CSP, COOP, CORP, Permissions-Policy, Referrer-Policy (full contract — the
  smoke's `_headers` assertions passed).
- **Served SHA:** no public marker exists (`/deployment.json` 404; no meta); exact-revision
  certification (`SMOKE_COMMIT_SHA` + ledger + `check:deployment-evidence`) stays **owner-side**
  per runbook §2 (CF dashboard is the deployment authority).

### The 3 FAILs — all `--site=www` harness artifacts, PASS-equivalent against the apex

| FAIL                                                                                                                       | Raw evidence                                                                                                                     | Classification                         |
| -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `canonical metadata matches the production domain on /en/about/: unexpected canonical: https://blueskyzlabs.com/en/about/` | the page canonicals the **apex** — correct per ADR 0006; the check compares against the `--site` argument                        | artifact (would pass against the apex) |
| `robots.txt … sitemap link missing`                                                                                        | served `robots.txt` names `Sitemap: https://blueskyzlabs.com/sitemap.xml` (apex — correct); check requires `${site}/sitemap.xml` | artifact                               |
| `sitemap … same-origin localized canonical routes`                                                                         | `sitemap.xml` lists apex URLs — correct; check's same-origin test uses the `--site` argument                                     | artifact                               |

### Finding F-11 → FIXED (PR #470, owner-label pending)

`branded 404 … /vi/khong-ton-tai/: branded 404 content missing` — **a real smoke-script bug**: the
check used a case-sensitive literal (`"Page not found"` / `"không tìm thấy"`) while the VI page
renders capitalised `"Không tìm thấy trang này"`; it fails on the apex too, so §3E would be red at
go-live for a non-defect. Fix (PR **#470**, `scripts/` → `owner-approved` pending):
`/page not found|không tìm thấy/i.test(html)`.

Proof: old expression fails on the served body = true; new regex matches = true; unbranded stub
still rejected = true; full re-run shows `PASS branded 404 is served on unknown paths`.

## Open items (owner / not verifiable here)

- **Apex anonymous access** — Access lift is the owner gate; until then apex = 302. NOT VERIFIED.
- **`www` → apex 301 (RT-01)** — still pending; `www` currently serves 200 while the apex is
  canonical. The site's canonical/hreflang tags already point at the apex, so search indexing is
  coherent, but the redirect itself is an Owner Cloudflare action.
- **Served-SHA ledger certification** — owner-side (CF dashboard read-back), per runbook §2.
- Field CWV, real devices, human E4 — unchanged, NOT VERIFIED.

**CAN-CONTINUE:** after the Access lift, re-run this exact command with `--site https://blueskyzlabs.com`
and the deployed SHA, then record the full-SHA ledger entry.
