# v10 E7 — visual/runtime convergence audit (SGPS-Marketing)

- **Bound to:** `main@5afe5f54` (the revision under audit; every result below belongs to this
  revision). **Date:** 2026-10-04, 07:55–08:10 (UTC+7).
- **Verifier:** orchestrator lane, executed in-session on the production-origin build
  (`PUBLIC_SITE_URL=https://blueskyzlabs.com pnpm build` → 98 pages, static export verified →
  repo preview on `127.0.0.1:3000`).
- **Verdict rule:** PASS / FAIL / NOT VERIFIED only; residuals are named, never omitted.

## 1. Runtime probes — 64 pages, all clean

4 locales × 8 routes (home, products, about, contact, security, privacy, support, verify) ×
2 viewports (390×844, 1440×900):

| Measure                                           | Result                                          |
| ------------------------------------------------- | ----------------------------------------------- |
| HTTP status                                       | **64/64 = 200**                                 |
| Horizontal overflow (`scrollWidth − clientWidth`) | **max 0** on every page/viewport                |
| Console errors + page errors                      | **0**                                           |
| Interactive targets < 24 px                       | **0** (of all `a/button/summary/[role=button]`) |

Home heights (no fixed budget asserted here — recorded for the next iteration's baseline):
390 px → en 3171 / vi 3310 / zh 3142 / zh-hant 3112; 1440 px → en 2314 / vi 2383 /
zh 2366 / zh-hant 2366.

## 2. Axe matrix — 178 scans, zero violations

Every built route (89 non-stub routes from `dist/`, redirect stubs skipped) × {light, dark},
tags `wcag2a/2aa/21a/21aa/22a/22aa`, CSP bypassed via CDP so axe can inject:

**`SCANS=178 ERRORED=0 WITH_ANY_VIOLATION=0`** — zero violations at any impact level.

## 3. Client budget

`node scripts/check-client-budget.mjs` → **PASS**: site-wide 14 941 / worst page 12 626 <
120 000 Brotli bytes; `inlineScripts: []`.

## 4. CI evidence for the head

- Four-engine + Lighthouse runs on the immediately preceding merged heads: `5b09ac7b` and
  `ef8c436f` — both **completed / success** (full matrix). The push run for `5afe5f54` was
  still in progress when this audit was written; it is the same tree modulo the #406 icon
  rasters (content-addressed assets, no runtime code).
- **Measurement-channel finding:** the CI Lighthouse job's numeric medians (LCP/CLS/TBT) are
  not retrievable from the run logs or artifacts (the job prints only warn-level assertion
  deltas; no `.lighthouseci` artifact is uploaded). The retrievable CI evidence is the
  performance-budget gate (`Performance budget PASS`, 12 reports) plus the assertion outcomes.
  If per-slice §7.2 numbers are required, the LH job should upload the reports or print the
  medians — a small CI change for a future PR.

## 5. v10 slice status at this head

- E0b/E1/E2/E5/E6: merged and verified (see the per-slice PRs).
- **E3 (visual regression gate):** in flight in its lane (draft PR #459, baselines pending) —
  NOT part of this audit.
- **E4 (M02 prefetch):** implemented and proven (PR #474, exact head `19bdd5d2`; CDP evidence:
  prefetch fires on hover, click served `fromPrefetchCache=true`) — awaiting the
  `owner-approved` label; not yet in this audit's head.
- When E3 and E4 land, re-run this audit at the final head (the probes are automated and
  take ~10 minutes) or fold the delta into the close-out report.

## 6. Explicitly NOT VERIFIED

- Local absolute Lighthouse numbers (host-contention-dominated; CI is authoritative).
- Field Core Web Vitals / CrUX; real devices and native browsers.
- Human E4 (real-visitor comprehension/brand evidence) — owner protocol, post-go-live.
- The 4-locales × light/dark **screenshot review** — this audit's screenshot set was not
  captured in this run; recorded as a next-iteration/owner-review residual (the axe matrix
  and probes cover the machine-checkable surface).
- zh / zh-Hant native review (owner).
