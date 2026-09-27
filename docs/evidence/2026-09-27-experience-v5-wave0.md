# Experience Convergence v5 — Wave 0 evidence

**Base:** `main@e21c954` + plan commit `c859074` on `claude/marketing-project-audit-623e4t` (PR #302).  
**Authority:** Owner decisions 2026-09-27 recorded in `docs/superpowers/plans/2026-09-27-experience-design-convergence-v5.md`.  
**Evidence class:** source + local gates. Not deployment, served-SHA, anonymous-access or Human E4 evidence.

| Task                       | Change                                                                                                                                                                                                                                       | Guard / negative proof                                                                                                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1 VietQR (F-01, D-0)     | Removed `VietQRCalculator.astro`, `src/lib/vietqr.ts`, `src/lib/qrcode.ts`, their unit/E2E specs and the mount on the VI Sổ Trọ profile                                                                                                      | `tests/architecture/no-payment-authority.test.mjs` fails on NAPAS GUID, service code, `vietqr`/`napas`/`emvco` markers in `src/`; mutation proof in-test and by restoring `src/lib/vietqr.ts` (RED) |
| 0.2 Footer switcher (F-03) | `LanguageSwitcher variant="dark"` no longer inherits the theme-dependent primary surface                                                                                                                                                     | E2E contrast is covered in Wave 1 (axe `incomplete` triage); measured locally below                                                                                                                 |
| 0.3 Grey band (F-02)       | Root cause: the closing `HorizonField` (`position: absolute; inset: 0`) had no positioned ancestor and resolved against the initial containing block, painting its ink depth gradient under the hero. It now has its own bounded in-flow box | `c2-p5-human-layer.spec.ts` asserts the closing horizon sits > 1000 px below `main` top                                                                                                             |
| 0.4 Identity art (F-04)    | `--c3-image-surface-background` → `var(--brand-ink)`; profile brand-media images use the same token                                                                                                                                          | `c3-craft-contract.test.mjs` pins the new Brand v4 token                                                                                                                                            |
| 0.5 Hermetic guard test    | `post-merge-landing-guard (b)` builds its orphan fixture in a throwaway repo instead of requiring commit `dcfb121` locally                                                                                                                   | Passes on a fresh clone without extra fetches                                                                                                                                                       |

## Residual findings routed to later waves

- F-18: in OS dark mode the header logo on non-hero pages (e.g. `/en/products/`) uses the dark wordmark on ink, so "BLUESKYZ" disappears. Needs a theme-aware lockup swap that also honours an explicit `data-theme` (Wave 1 visual matrix will pin it; fix in Wave 2).
- F-19: `/en/products/` "Verify this page" still says `Not published` / "the public registry stays quiet by design" while five products are listed; truth-copy drift after #269/#292 (Wave 1 locale/truth probe, fix with product owners' state ladder, Council G02).
- F-20: Atlas graph labels overlap at 1440 px (Wave 4 craft).

## Handover (residual, product-owned)

Any VietQR/bill-calculator capability belongs to the Sổ Trọ repository under `SGPS-DEC-2026-016` (and `-020` if adopted there): product threat model, no default bank/account, human-confirmed payment state. The removed implementation remains in history at `4ac2e80` for reference; it is not endorsed as-is (it shipped a default BIN `970422` and account `0901234567`).

## Measurements

Recorded in the PR description for the exact head that CI verifies.

## Atlas premium plate (Owner request 2026-09-27)

`src/components/experience/Atlas.astro` redesigned as an evidence constellation on an ink plate: deterministic radial sectors per node kind on three orbits, footnote codes (C1…, E1…) for claims/evidence so long statements never collide, legend with counts, grouped authoritative index (house / trust & evidence / products), and CSS-only `:has()` linking — focusing or hovering an index row lights its node and brand edge while others dim to 0.22. No client script, no node animation, one `circle` per node (existing E2E contract), 0 overflow at 320–1440 px. Guards: `tests/architecture/atlas-premium-contract.test.mjs`; E2E `focusing an index entry lights its plate node`. Screenshots are attached to PR #302.
