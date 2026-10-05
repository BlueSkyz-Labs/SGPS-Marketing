# SGPS-DEC-2026-028 — Experience Performance & Friction local adoption

**Owner directive:** 2026-10-03  
**Local disposition:** ADOPT  
**Lifecycle:** ADOPTED (lab-verified, bound 2026-10-04)  
**Go-Live:** READY for the DEC-028 lab gate: exact-head evidence, negative and positive proof are bound to `main@ecc67e7` in `.sgps/experience-performance-friction.json` (`node tools/verify-experience-performance-friction.mjs go-live` → `DEC028_GO_LIVE_PASS`). Residual: field CWV (p75) is NOT VERIFIED until the Owner decides `rum-provider`.  
**Canonical candidate:** sgps-core PR #257 @ `278abbcfc789ea2081c9653bfe4e6c1697071c69`.  
**Canonical merged:** sgps-core `3a71af89fe6c525c63c3242c88417a0e3ffa76a5` (merge commit of #257; compare `278abbc...3a71af8` is ahead by 1 commit with 0 changed files, so the merged content equals the reviewed candidate).  
**Tracking:** #451

## Local mapping

Critical journeys:

- landing page first usable render
- primary navigation
- product detail pages
- CTA/contact handoff where enabled
- locale/theme route transitions

Reuse before adding machinery:

- `existing Lighthouse CI`
- `Experience v10 baseline`
- `axe/redirect/engine verification`
- `field CWV only when privacy-approved`

## Enforced invariants

- User time, responsiveness, continuity and avoidable friction are engineering budgets.
- Measure before optimizing; preserve correctness, accessibility, security, privacy and recovery.
- Missing applicable evidence is non-PASS, never green-by-absence.
- Do not weaken budgets, monitored journeys or tests merely to obtain PASS.
- Waiting/degraded states must acknowledge work truthfully and expose safe recovery where applicable.
- The local verifier is `tools/verify-experience-performance-friction.mjs`.
- `source` validates adoption wiring. `go-live` fails closed until canonical merged SHA, exact-head evidence and negative/positive proofs are bound.
- Existing stronger local thresholds and product-specific gates remain authoritative.

## Adoption truth

This branch prepares enforcement before canonical merge. It MUST NOT set `gaps.adopted=true`, `go_live.state=READY`, or evidence/proof status to PASS without exact merged canonical provenance and project-local evidence.
