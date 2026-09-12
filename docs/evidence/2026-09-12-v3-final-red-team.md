# v3 Final Red-Team Verification — God-tier Trust Experience

**Scope:** God-tier v3 (Tasks 1–23, Waves 1–8) at the Wave 6/7 merge head.
Every probe below is `DETECTED → REMEDIATED`, `OPEN`, or `NOT RUN` — nothing is
silently omitted. Automated evidence never promotes Human E4 (`Task 22`).

## 1. Standard verification matrix (exact heads)

| Gate                      | Result                                                                                                                          | Evidence                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Frozen install / audit    | PASS (CI, every PR)                                                                                                             | Source Assurance `Quality Gates` on #129–#133                       |
| Architecture contracts    | **197/197**                                                                                                                     | `pnpm test:architecture` @ Wave 7 head `69ef9d0`                    |
| Typecheck / lint / format | 0 errors / 0 problems / clean                                                                                                   | same head                                                           |
| Static build              | `Static export verified`                                                                                                        | `pnpm build` — includes `dist/.well-known/sgps.json`                |
| Client budget             | site-wide **2567 B**, worst page 2036 B                                                                                         | `pnpm check:client-budget` (limits 120000/153600)                   |
| Static links              | PASS                                                                                                                            | `pnpm check:static-links`                                           |
| Publishability compiler   | PASS (5 failure classes clean)                                                                                                  | `pnpm check:publishability`                                         |
| Integrity firewall        | PASS (10 drift classes)                                                                                                         | `pnpm check:integrity-firewall`                                     |
| E4 automated matrix       | **ALL CHECKS PASS**                                                                                                             | `scripts/e4-matrix.mjs` (incl. 200% zoom, reduced motion, keyboard) |
| Browser Assurance (CI)    | Green on #129 `337a111` · #130 `6c9e0ca` · #131 `9a06762` · #132 `d51eb06`→`b672169`                                            | GitHub check-runs, exact heads                                      |
| Local chromium full suite | 224 passed · 5 failed → all 5 classified (3 stale-atlas on pre-fix tree; 2 resource-contention flakes that pass isolated 24/24) | `v3-full-chromium*.txt`                                             |

## 2. Required probes

| #   | Probe                                      | Status | Evidence                                                                                                       |
| --- | ------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------- |
| 1   | Empty public product registry              | PASS   | `atlas-v2-evidence` (0 product nodes + honest note), `product-empty-state`, publishability empty-registry pass |
| 2   | One synthetic publishable product          | PASS   | publishability product fixture; parity fixture product rendering (`bilingual-parity` 6/6)                      |
| 3   | Missing evidence reference                 | PASS   | firewall RED `unknown-evidence`; publishability RED `MISSING_EVIDENCE`                                         |
| 4   | Broken EN/VI claim pair                    | PASS   | publishability RED; firewall RED `locale-parity`                                                               |
| 5   | Malicious / invalid external URL           | PASS   | firewall `evidence-destination` (HTTPS-only + known-internal-routes)                                           |
| 6   | Decision Room reload + no-storage          | PASS   | `decision-room` e2e: reload→empty, zero network, no cookies/storage                                            |
| 7   | JS-disabled critical routes                | PASS   | no-JS specs: intent lens, passport, manifest, decision room, atlas, deep links, 404                            |
| 8   | Widths 320/360/390/430/1280/1440           | PASS   | atlas-v2 six-width sweep (no overflow)                                                                         |
| 9   | 200% text zoom                             | PASS   | E4 matrix (chromium+webkit), truth-state zoom test                                                             |
| 10  | Reduced motion                             | PASS   | E4 matrix; atlas no-animation probe                                                                            |
| 11  | Keyboard-only Lens/Navigator/Room/Passport | PASS   | E4 matrix keyboard check; room keyboard removal; navigator focus restore (#127)                                |
| 12  | Print Passport + Source Trace              | PASS   | passport print spec; trace print probe                                                                         |
| 13  | Manifest privacy scan                      | PASS   | manifest arch (8 tests) + e2e raw-output scan                                                                  |
| 14  | Free-text query telemetry non-leak         | PASS   | provenance-search spec; firewall `telemetry-allowlist`                                                         |
| 15  | CSP external-script compliance             | PASS   | budget guard requires external scripts; all v3 scripts external                                                |
| 16  | Production legacy 301 preservation         | PASS   | smoke 7 legacy roots (pre-merge live evidence `2026-09-11`); re-read in Task 23                                |
| 17  | No WebGL / canvas / new UI framework       | PASS   | source grep clean; zero new runtime dependencies                                                               |
| 18  | Site-wide + worst-page budget              | PASS   | 2567 B / 2036 B Brotli                                                                                         |

## 3. Defects found during v3 execution (all REMEDIATED)

| Defect                                                                                               | Class                                   | Fix                                                                                                   |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Atlas V1 spec asserted hardcoded node totals / single privacy link vs V2 constellations              | Test contract drift (CI BA red on #132) | Spec retargeted to derived per-kind counts; privacy presence, not single-count (`46febde`, `d51eb06`) |
| Parity fixture build skipped on stale `dist` → false local truth-state failures and hidden freshness | Tooling root cause                      | `build-parity-fixture.mjs` always rebuilds (`3f7b69a`)                                                |
| Publishability test carried an unused binding (lint red on #133 `28c31fa`)                           | Lint                                    | Binding removed (`4d7c7d2`)                                                                           |
| Formatting drift from scripted edits (QG red on #132 `d02fc80`)                                      | Format                                  | `pnpm format` + push (`46febde`)                                                                      |
| TruthState fixture suite failures (6) traced to stale fixture dist, not product code                 | False-negative local evidence           | Fresh fixture verified 6/6 after rebuild                                                              |
| Legacy root duplicates + missing 301s (S+ era, historical reference)                                 | Resolved earlier                        | `return Astro.redirect` + `_redirects` (already merged)                                               |

## 4. Known flakes (documented, not defects)

- Accessibility `vi-contact` axe and `boundary-card` failed once under heavy parallel
  load in the full local run; both pass isolated (24/24) and in CI BA.
- Local firefox/webkit GFX crashes under contention (unchanged from S+ E4 §2a).

## 5. OPEN items (cannot be closed by any automated evidence)

| Item                                                          | Status                                              | Owner |
| ------------------------------------------------------------- | --------------------------------------------------- | ----- |
| Human E4 real participants                                    | **NOT RUN** (protocol: `2026-09-12-v3-human-e4.md`) | Owner |
| VI copy review                                                | `EXTERNAL/MANUAL REQUIRED`                          | Owner |
| RUM / analytics provider                                      | `EXTERNAL/MANUAL REQUIRED` (transmission disabled)  | Owner |
| Owner PRs #125 (v3.1 design) / #126 (principal red-team plan) | OPEN, QG red — not merged, not superseded-executed  | Owner |
| Production read-back at deploy head                           | Task 23 ledger (below, post-merge)                  | Agent |

**Conclusion:** No open runtime defect found by the v3 verification matrix at
this head; remaining gaps are human/external or owner-owned artifacts.
