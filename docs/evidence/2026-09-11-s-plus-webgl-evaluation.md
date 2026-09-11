# S+ WebGL / 3D Evaluation — issue #102 — 2026-09-11

**Decision: NO-GO** — do not implement WebGL/3D now. No prototype branch was
created; Atlas V1 remains the SVG/HTML-first (zero-JS) realization.

## Gate check against the approved spec

The S+ design spec states: _"A WebGL prototype may proceed only after #99
defines budgets and a written business/UX hypothesis establishes measurable
expected value."_

| Prerequisite                                                  | Status                                                                                                                                                                                                                                            |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #99 budgets defined and enforced                              | **DONE** — Task 1: hard client-JS ceiling (per-page + site-wide, 120 KB Brotli), budget script fails inline-script CSP violations, Lighthouse a11y/LCP/CLS error thresholds, exact-SHA baseline in `docs/evidence/2026-09-11-s-plus-baseline.md`. |
| Written business/UX hypothesis with measurable expected value | **ABSENT** — no such document exists in the repository. The prerequisite is therefore not met, and the correct outcome is NO-GO.                                                                                                                  |

## Supporting rationale (measured, not speculative)

- Current client JS: **1,644 B Brotli** site-wide/worst page; LCP ≈ 440 ms;
  CLS 0.0000 (Lighthouse desktop; per-PR evidence).
- A WebGL runtime typically adds 100 KB+ JavaScript plus GPU variance,
  battery cost, and device-class risk — against the repository's stated
  posture (progressive enhancement first, zero-JS where possible,
  320px/mobile parity, reduced-motion equivalence).
- The problem WebGL would ostensibly serve here (relationship visualization)
  is already delivered by **Atlas V1**: SVG/HTML, decorative plates hidden
  from AT, truth-derived, zero added JavaScript.
- Any 3D surface would additionally need first-class handling for
  accessibility, reduced motion, and the static-export model.

## Conditions to revisit (GO criteria)

1. A written business/UX hypothesis naming a measurable success metric;
2. An isolated, lazily-loaded bundle that fits the #99 budget envelope;
3. A progressive-enhancement fallback that keeps the SVG Atlas path intact;
4. A device-class + reduced-motion E4 evidence plan approved before build.
