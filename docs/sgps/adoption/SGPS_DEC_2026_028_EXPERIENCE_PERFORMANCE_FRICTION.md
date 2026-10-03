# SGPS-DEC-2026-028 — Experience Performance & Friction local adoption

**Owner directive:** 2026-10-03  
**Local disposition:** ADOPT  
**Lifecycle:** IMPLEMENTING  
**Go-Live:** BLOCKED for the DEC-028 experience gate until exact-head evidence closes.  
**Canonical candidate:** sgps-core PR #257 @ `278abbcfc789ea2081c9653bfe4e6c1697071c69`.  
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
