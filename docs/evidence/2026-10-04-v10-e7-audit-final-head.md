# v10 E7 audit — final-head re-run (Track A complete)

- **Bound to:** `main@02549214` — the head where **Track A reached 8/8** (E3 and E4 merged).
- **Date:** 2026-10-04 ~11:45 (UTC+7). **Method:** identical to the E7 audit
  (`docs/evidence/2026-10-04-v10-e7-convergence-audit.md`): production-origin build
  (`PUBLIC_SITE_URL=https://blueskyzlabs.com`, 98 pages), repo preview, same probes.

## Results (all clean at the final head)

| Probe                                                   | Result                                                                                    |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Runtime — 64 pages (4 locales × 8 routes × 2 viewports) | **all 200**, max horizontal overflow **0**, console errors **0**, sub-24 px targets **0** |
| Axe — 89 routes × {light,dark} = **178 scans**          | **zero violations at any level**, zero errored                                            |
| Client budget                                           | PASS (unchanged; no client JS added by E3/E4)                                             |

## What changed vs the first audit (`5afe5f54`)

- E3 landed (visual regression gate + 24 Linux baselines; the CI job now verifies
  every PR's render against them).
- E4 landed (M02 prefetch: nav-derived allowlist, prefetch-only, production-origin
  gated; CDP-proven `fromPrefetchCache=true`).
- The probes are byte-identical in method; the clean result carries over.

## RT-01 (adjacent verification, same session)

`www.blueskyzlabs.com` now answers **301** on every probed path with
`Location: https://blueskyzlabs.com/<same path>` and the query preserved
(`/en/?q=1` → `https://blueskyzlabs.com/en/?q=1`); the body carries no site HTML.
The apex stays behind Access (302) until the Owner lifts it — the single remaining
go-live action. The §3E smoke's RT-01 assertion (merged in #478) will enforce this
from now on.
