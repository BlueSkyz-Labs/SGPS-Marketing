# C3 — Living Verifiable Product Experience Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved C3 successor program as isolated, evidence-gated subsystems after the relevant C2 foundations are live.

**Architecture:** C3 extends C2 rather than replacing it. Product/claim/evidence/release truth remains canonical; each subsystem consumes that truth through pure selectors/adapters and adds optional interaction or presentation layers. High-risk capabilities such as AI concierge and spatial 3D are separately gated and must never block the lower-risk experience foundation.

**Tech Stack:** Astro 7, TypeScript 6, Tailwind CSS 4, native HTML/CSS/SVG/View Transitions, small vanilla client modules, Node test runner, Playwright, axe, Lighthouse, Cloudflare Workers Builds. Any model/runtime/WebGL dependency requires a later subsystem-specific approval gate.

**Spec:** `docs/superpowers/specs/2026-09-13-c3-living-verifiable-product-experience-design.md`

## Global Constraints

- Planning baseline: `main@386aaaca9c839bbe3d3c430f1a8c419904dfee49`; every execution session refreshes live `main`, PRs/issues, `AGENTS.md`, `docs/current-work.json`, and newer ADR/spec/plan truth.
- C3 is post-C2. Do not start a C3 runtime subsystem until its C2 dependencies are objectively present and green.
- Product, claim, evidence, release, and architecture truth remain canonical and fail-closed.
- Never fabricate product UI, screenshot, capability, customer, claim, proof, certification, release, review date, or human-study result.
- Static/no-JS remains authoritative for critical content and actions.
- No new React/Vue/Svelte runtime, animation framework, WebGL runtime, model provider, vector store, remote personalization service, or telemetry provider without an explicit subsystem decision.
- Reduced motion, forced colors, keyboard/touch parity, 320/390px, 200% text zoom, text spacing, bilingual EN/VI parity, axe, Lighthouse, and repository client budget remain mandatory.
- Analytics/RUM transmission remains OFF until the existing owner privacy/provider decision changes.
- Normal delivery is branch/worktree → PR → exact-head Quality Gates + Browser Assurance → merge → provider read-back where runtime changed.
- No mega-PR. Each C3 subsystem ships independently and can be rolled back independently.

---

## 1. Program Decomposition

C3 is intentionally split into seven implementation plans because the approved ideas span independent risk and runtime domains.

1. **C3-A Experience Craft Foundation** — S2, S3, S4, S5, S9, S10.
   - Plan: `docs/superpowers/plans/2026-09-13-c3-a-experience-craft-foundation.md`
2. **C3-B Trust Continuum** — G4, G8, G9, S8.
   - Plan: `docs/superpowers/plans/2026-09-13-c3-b-trust-continuum.md`
3. **C3-C Living Product System** — G1, G3, S1, S6, S7.
   - Plan: `docs/superpowers/plans/2026-09-13-c3-c-living-product-system.md`
4. **C3-D Adaptive Experience** — G5, G6.
   - Plan: `docs/superpowers/plans/2026-09-13-c3-d-adaptive-experience.md`
5. **C3-E Verifiable Product Concierge** — G2.
   - Plan: `docs/superpowers/plans/2026-09-13-c3-e-verifiable-concierge.md`
6. **C3-F Living Release Publication** — G10.
   - Plan: `docs/superpowers/plans/2026-09-13-c3-f-living-release-publication.md`
7. **C3-G Spatial Product House Halo** — G7 optional experiment.
   - Plan: `docs/superpowers/plans/2026-09-13-c3-g-spatial-halo-experiment.md`

## 2. Program Readiness Gate

### Task 1: Confirm C2 dependency readiness

**Files:**

- Read: `AGENTS.md`
- Read: `docs/current-work.json`
- Read: C2 design and implementation plan
- Read: C3 spec and the selected C3 child plan
- Modify only when status changes are real: `docs/current-work.json`

**Interfaces:**

- Consumes: live repository/provider evidence.
- Produces: explicit GO/BLOCKED state for one C3 subsystem; never a blanket fabricated C3 PASS.

- [ ] **Step 1: refresh live repository state**

```bash
git fetch origin --prune
git checkout main
git pull --ff-only origin main
git log -12 --oneline
```

Inspect open PRs/issues, latest `docs/current-work.json`, C2 evidence, active owner decisions, and the exact files the chosen C3 subsystem extends.

- [ ] **Step 2: verify C2 surface dependency**

For the selected child plan, confirm its required C2 components exist in live `main` and are not being concurrently replaced by another active PR.

If the dependency is missing, record `PLANNED`/blocked context and do not create runtime code for that subsystem.

- [ ] **Step 3: verify source/browser baseline**

Use provider evidence for the live base candidate. Do not treat stale or skipped checks as green.

- [ ] **Step 4: activate exactly one C3 subsystem**

If ready, update `docs/current-work.json` so one C3 child wave is `IN_PROGRESS`. C2 or another C3 subsystem must not be silently displaced if it is still the active work owner.

- [ ] **Step 5: run router tests**

```bash
pnpm test:architecture -- --test-name-pattern="router"
```

Expected: PASS with no owner/human decision auto-promoted.

## 3. Recommended Execution Order

Default order after C2 stabilizes:

1. **C3-A Experience Craft Foundation**
2. **C3-B Trust Continuum**
3. **C3-C Living Product System**
4. **C3-D Adaptive Experience**
5. **C3-E Verifiable Product Concierge**
6. **C3-F Living Release Publication**
7. **C3-G Spatial Halo Experiment**

B and C may swap if product truth/artifacts are ready sooner than the trust-continuum dependencies. E and G are never blockers for declaring the lower-risk C3 experience foundation complete.

## 4. Cross-Program Architecture Guard

### Task 2: Add C3 boundary contracts before broad runtime work

**Files:**

- Create: `tests/architecture/c3-program-boundary.test.mjs`
- Read: `package.json`
- Read: canonical product/claim/evidence/release selectors
- Read: C3 runtime modules created by child plans

**Interfaces:**

- Produces: repository-level guard against second truth registries, critical-path AI/3D dependencies, and hidden telemetry.

- [ ] **Step 1: write a failing program contract when first C3 runtime module lands**

The contract should verify:

- C3 product components import canonical product selectors;
- C3 trust components import canonical claim/evidence selectors;
- C3 release components import canonical release adapters;
- no C3 module declares a second product/claim/evidence/release registry;
- no concierge or spatial bundle is statically imported by the homepage critical path;
- no analytics/telemetry network primitive is introduced without the existing privacy decision.

- [ ] **Step 2: verify RED against the first unguarded C3 runtime branch**

```bash
node --test tests/architecture/c3-program-boundary.test.mjs
```

Expected: FAIL until the first child subsystem is wired through approved boundaries.

- [ ] **Step 3: implement the smallest boundary-compliant structure**

Do not change canonical truth sources unless the child plan explicitly requires a new canonical schema.

- [ ] **Step 4: verify GREEN and retain this contract for all later C3 waves**

```bash
node --test tests/architecture/c3-program-boundary.test.mjs
```

Expected: PASS.

## 5. Shared Verification Envelope

Every C3 runtime PR must run the repository's deterministic gates plus the child-plan targeted tests.

Minimum exact-head source checks:

```bash
pnpm install --frozen-lockfile
pnpm audit --audit-level=moderate
pnpm test:architecture
pnpm architecture:views:check
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm check:client-budget
pnpm check:static-links
pnpm check:publishability
pnpm check:integrity-firewall
pnpm verify:git-evidence
pnpm check:promotion-state
pnpm check:deployment-evidence
pnpm check:product-provenance
```

Browser assurance for affected routes must include Chromium, Firefox, WebKit/Safari-class, and mobile Chromium through the repository workflow, plus Lighthouse.

Each child PR records:

- exact head SHA;
- changed surfaces;
- before/after client-byte delta;
- no-JS behavior;
- reduced-motion behavior;
- mobile 390px and at least one 320px check;
- 200% text zoom and text-spacing behavior when the UI changed;
- forced-colors behavior when controls/visual state changed;
- truth source used;
- remaining owner/provider blockers;
- production read-back if runtime was promoted.

## 6. Visual and Experience Review Gate

Every C3 child subsystem that changes public UI must receive independent rendered review at a premium product-company bar.

Review questions:

- Does product content remain more important than the effect?
- Can a first-time visitor understand the purpose without interacting?
- Is the interaction useful rather than merely novel?
- Does mobile feel authored rather than compressed?
- Does reduced motion preserve hierarchy and meaning?
- Does trust remain inspectable without becoming dashboard chrome?
- Does the page still look premium with enhancement disabled?
- Does the feature make BlueSkyz more distinctive without making it look like a generic AI/3D showcase?

Subjective review scores are design evidence, not machine truth.

## 7. Program Exit and Convergence

### Task 3: Run final C3 convergence audit

**Files:**

- Create: `docs/evidence/<date>-c3-final-convergence.md`
- Modify: `docs/current-work.json`
- Runtime files only if a reproduced defect is found.

- [ ] **Step 1: verify every implemented God/S+ capability maps to the approved spec**

No capability may be marked complete merely because a placeholder shell exists.

- [ ] **Step 2: verify truth and privacy boundaries**

Confirm no second registry, no hidden telemetry, no unsupported model answer, no unpublished machine-passport leakage, and no release inflation.

- [ ] **Step 3: verify adaptive states**

Test default, static/no-JS, reduced motion, mobile, keyboard, forced colors, and any explicit intent/reading/fidelity mode.

- [ ] **Step 4: verify optional systems do not block core completion**

Concierge and Spatial Halo may remain intentionally deferred/NO-GO while C3-A through C3-D/F are complete.

- [ ] **Step 5: record final exact-head and production evidence**

Only provider/runtime evidence can support deployed-state claims.

## 8. Completion Definition

C3 core is complete when:

- C3-A, C3-B, C3-C, and C3-D meet their exit criteria where prerequisites exist;
- C3-F is implemented if a real release source is available, otherwise it remains an explicit source-blocked plan rather than fake release content;
- C3-E is either shipped under its dedicated security/privacy architecture or explicitly deferred;
- C3-G has an explicit GO/NO-GO result and never contaminates the default critical path;
- all implemented features remain fail-closed, static-safe, accessible, budget-safe, and evidence-backed;
- production read-back matches promoted source state;
- real-human E4 remains separately recorded.
