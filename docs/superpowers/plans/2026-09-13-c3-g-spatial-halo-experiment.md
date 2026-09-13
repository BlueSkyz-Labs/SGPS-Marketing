# C3-G — Spatial Product House Halo Experiment Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Determine whether a restrained spatial Product House experience materially improves product understanding and memorability enough to justify its performance, accessibility, and maintenance cost.

**Architecture:** This is a gated experiment, not a default roadmap entitlement. Start with HTML/CSS/SVG/native transforms over real product artifacts. Only if that prototype demonstrates measurable value may a separate WebGL prototype be considered. Static Product House remains authoritative and removable.

**Tech Stack:** Phase 1: Astro 7, HTML/CSS/SVG, native platform features. Phase 2 WebGL/3D only after explicit GO decision and separate dependency/architecture approval.

**Spec:** `docs/superpowers/specs/2026-09-13-c3-living-verifiable-product-experience-design.md`

## Global Constraints

- Implements G7 only.
- C3-A/C3-C static/native product experience must already meet the premium quality bar before this experiment begins.
- No WebGL code in initial critical path.
- No scroll hijacking, custom cursor, mandatory parallax, or inaccessible spatial-only navigation.
- Every product remains reachable through ordinary semantic links.
- Reduced-motion/static/mobile alternatives are first-class, not afterthoughts.

---

### Task 1: Write the experiment hypothesis and GO metrics

**Files:**
- Create: `docs/evidence/<date>-c3-spatial-halo-hypothesis.md`

**Interfaces:**
- Produces: measurable hypothesis and rejection criteria before prototype code.

- [ ] **Step 1: state the user problem**

Example acceptable hypothesis: a spatial portfolio arrangement may improve recognition of product relationships and make product discovery more memorable without reducing task completion or performance.

- [ ] **Step 2: define comparison metrics**

Include at least:

- product identification/comprehension task success;
- time to reach a chosen product;
- visitor-reported clarity/memorability in owner-run E4 or approved evaluation;
- client-byte delta;
- Lighthouse/Core Web Vitals impact;
- keyboard/mobile/reduced-motion parity;
- maintenance complexity.

- [ ] **Step 3: define NO-GO thresholds**

NO-GO if product comprehension/navigation worsens, mobile becomes compromised, accessibility parity fails, or performance cost is disproportionate to measured benefit.

### Task 2: Build native 2.5D prototype first

**Files:**
- Create isolated experimental component under `src/components/experimental/`
- Create focused experimental stylesheet
- Create: `tests/e2e/c3-spatial-native.spec.ts`

**Interfaces:**
- Consumes: canonical public products and ProductVisual primitive.
- Produces: removable spatial composition over semantic product links.

- [ ] **Step 1: write static semantic navigation test**

- [ ] **Step 2: implement HTML/CSS/SVG prototype with no new dependency**

- [ ] **Step 3: add restrained depth/transform only for capable no-preference desktop contexts**

- [ ] **Step 4: keep mobile as editorial Product House, not a miniature 3D scene**

- [ ] **Step 5: measure client/performance delta**

### Task 3: Evaluate native prototype

- [ ] **Step 1: run rendered comparison against current C3 Product House**

- [ ] **Step 2: run keyboard, reduced motion, forced colors, mobile, zoom, and cross-browser tests**

- [ ] **Step 3: collect human/owner evaluation separately from automated evidence**

- [ ] **Step 4: record GO/NO-GO for native spatial treatment**

If native 2.5D provides sufficient value, stop. Do not escalate to WebGL just because the technology is available.

### Task 4: WebGL architecture gate — optional only

**Files:**
- Create ADR only if native evidence supports further experimentation

**Interfaces:**
- Produces: explicit dependency/runtime/fallback/budget decision, not implementation permission by implication.

- [ ] **Step 1: justify why native CSS/SVG is insufficient**

- [ ] **Step 2: evaluate library/runtime size, GPU behavior, context loss, memory/texture policy, lazy loading, CSP, accessibility fallback, mobile disablement, and maintenance ownership**

- [ ] **Step 3: define a hard lazy-load boundary outside initial critical path**

- [ ] **Step 4: obtain owner approval for the ADR before adding dependency/code**

### Task 5: If approved, build isolated WebGL prototype

**Files:**
- Determined by approved ADR
- Must remain isolated and removable

- [ ] **Step 1: write fallback and load-boundary tests first**

- [ ] **Step 2: implement smallest scene using real product assets**

- [ ] **Step 3: test context-loss/failure fallback to semantic Product House**

- [ ] **Step 4: profile low/medium/high capability cases without fingerprinting**

- [ ] **Step 5: compare against native version and issue final GO/NO-GO**

## Verification

A successful experiment requires product-task evidence, accessibility parity, exact client/performance delta, cross-browser behavior, static fallback, and explicit human evaluation. A beautiful prototype without measurable user value is a NO-GO.

## Exit Criteria

C3-G exits with one of three valid outcomes: **native spatial GO**, **WebGL GO under approved ADR**, or **NO-GO and retain standard Product House**. NO-GO is a successful experiment outcome and must not be treated as failure requiring more effects.
