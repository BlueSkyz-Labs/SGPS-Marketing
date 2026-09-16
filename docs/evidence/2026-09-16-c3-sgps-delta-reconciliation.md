# C3 post-C2 + SGPS delta reconciliation — 2026-09-16

## Operating classification

- **MODE:** EXECUTE
- **PROJECT_STAGE:** PRODUCTION
- **Live project baseline:** C2 P1–P6 merged and production-verified; C2 P0 remains owner-fact gated for real public product activation.
- **Delivery authority:** `main` is protected by active ruleset `main-promotion-governance` (`22500299`) requiring PR flow, strict `Quality Gates` + `Browser Assurance`, conversation resolution, and blocking non-fast-forward/deletion; no bypass actor is configured.

## Objective contract

**OBJECTIVE** — Reconcile the already owner-approved C3 successor program onto the live post-C2 repository without reintroducing stale C2 state, then execute safe C3 work in independent evidence-gated waves beginning with C3-A Experience Craft Foundation.

**SUCCESS CRITERIA**

1. C3 design/master/child plans are present on live `main` through normal PR promotion.
2. `AGENTS.md` and `docs/current-work.json` describe the post-C2 state truthfully.
3. Current SGPS source-overlay deltas are explicitly classified for applicability instead of silently repinning the project.
4. C3-A may activate only after exact live readiness refresh and must retain static/no-JS, accessibility, bilingual, performance, public-truth and source-assurance invariants.
5. High-risk C3-E remote AI and C3-G WebGL remain separately gated.

**IN-SCOPE** — C3 planning/governance reconciliation; explicit SGPS delta classification; C3-A low-risk craft work once promoted and refreshed.

**OUT-OF-SCOPE / NON-GOALS** — fabricating product identity/screenshots/proof; enabling analytics/RUM; selecting or deploying a remote AI/model/retrieval provider; WebGL/3D dependency adoption; changing payment/identity/customer-platform authority; accepting material residual risk on behalf of the Owner.

**CONSTRAINTS** — branch → PR → exact-head gates → merge; no direct main fallback; provider/runtime evidence outranks authored claims; no test/scanner weakening; no silent SGPS moving-main adoption.

## Live repository refresh

The live default branch at reconciliation start is the post-C2 P6 state. The previously opened C3 planning PR `#159` was created from the earlier C2 planning baseline and is no longer mergeable against current `main`; its `docs/current-work.json` would regress C2 back to pre-execution state if merged blindly.

Therefore #159 is treated as an **approved design/plan source**, not as a merge-ready delivery artifact. The safe remediation is a clean post-C2 reconciliation branch containing the same approved C3 design/child plans plus refreshed router/agent guidance.

## SGPS FULL discovery boundary

Current `sgps-core` truth at this refresh:

- immutable published release remains `v1.13.0`;
- published decisions remain through `SGPS-DEC-2026-002`;
- current source overlays extend through `SGPS-DEC-2026-015`;
- source presence does **not** silently alter a project's pinned/effective context.

This project therefore classifies current overlays explicitly rather than treating moving `sgps-core/main` as automatic project authority.

## Strategic delta / applicability matrix

| Decision | Domain | Project classification | C3 consequence |
| --- | --- | --- | --- |
| `SGPS-DEC-2026-012` | Experience 1.4 — Brand Operationalization, Public Truth & Touchpoint Integrity | **APPLICABLE** | C3 must preserve public-truth fail-closed behavior, distinguish design/mockup/runtime/evidence, avoid invented public facts, and keep brand/product attribution truthful. Existing Brand v4/public-truth/provenance controls remain authoritative project evidence; this reconciliation does not claim new real-user convergence. |
| `SGPS-DEC-2026-013` | Architecture Authority & Customer-Platform Integrity | **NOT APPLICABLE to C3-A**; **CONDITIONALLY APPLICABLE to C3-E** | Experience Craft introduces no identity/payment/customer-platform authority. If remote Concierge/AI is later approved, authority separation and customer-platform review must be addressed in its dedicated architecture/privacy/security decision before runtime implementation. |
| `SGPS-DEC-2026-014` | RCR 1.0 — Risk, Control & Resilience | **APPLICABLE AS RISK/CONTROL LENS** | C3-A remains low blast-radius and operates under existing source assurance, rollback, accessibility/performance and production evidence controls. C3-E remote AI and C3-G WebGL require scoped risk/control/recovery treatment and evidence before GO. No autonomous R4/root-risk acceptance is authorized. |
| `SGPS-DEC-2026-015` | Decision Architecture / Solution Decision Contract | **NOT MANDATORY / CANDIDATE ONLY** | Current source explicitly forbids global mandatory routing before dual-pilot promotion. C3 may reuse its business-first reasoning principles, but this repository does not declare Decision Architecture adopted or require SDC artifacts by implication. |

### Adoption-state honesty

This reconciliation records **applicability and constraints**, not a fabricated blanket `SGPS CONVERGED` claim. Existing project evidence remains scoped to the controls/outcomes it actually verified. New C3 implementation must continue the chain:

`SGPS decision → project gap/constraint → plan task → implementation → exact-head test/runtime evidence → regression guard → convergence assessment`.

## C3 readiness result

### C3-A Experience Craft Foundation — GO

C2 route composition, art-direction foundation, cross-browser accessibility, client-budget, bilingual and production verification are present. C3-A can begin after this governance package is promoted and live state is refreshed again.

The honest empty public product registry does **not** block C3-A's shared craft foundation. However:

- public product imagery must remain absent unless real source-authorized screenshot truth exists;
- tests/components may prove fail-closed behavior with fixtures/contracts, but public runtime may not invent media to make the experience look complete;
- any task that genuinely requires owner-supplied product facts remains blocked at that boundary while dependency-independent craft work continues.

### C3-E Verifiable Concierge — BLOCKED_OWNER_DECISION for remote runtime

No remote model/provider/retrieval/logging/abuse/cost implementation is authorized by the C3 direction alone.

### C3-G Spatial Halo — EXPERIMENTAL / WebGL GO gate closed

Native HTML/CSS/SVG/2.5D exploration may be planned under its child contract; a WebGL dependency still requires separate measured evidence and owner GO.

## Reconciliation decision

1. Preserve the owner-approved C3 design and seven child plans.
2. Rebase them semantically onto post-C2 `main` using a clean branch rather than merging stale #159.
3. Update agent/router truth so C3-A becomes the next executable wave only after planning promotion.
4. Keep all owner/provider/high-risk gates explicit.
5. After merge, refresh `main`, activate C3-A alone, execute the smallest dependency-independent craft task first, and require exact-head source/browser evidence before promotion.
