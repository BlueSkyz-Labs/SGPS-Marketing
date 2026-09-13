# C3-C — Living Product System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn real product artifacts into inspectable, guided, comparison-ready product experiences without fabricating UI or depending on heavy client runtime.

**Architecture:** Build semantic product-scene metadata as a presentation layer over the existing public product collection. Real screenshots/artifacts remain source evidence. Hotspots, guided stories, reading modes, and compare views consume canonical product/capability/proof selectors. Static product pages remain complete without enhancement.

**Tech Stack:** Astro 7, TypeScript 6, HTML/CSS/SVG, small vanilla modules, native scroll/view transitions, Playwright, axe.

**Spec:** `docs/superpowers/specs/2026-09-13-c3-living-verifiable-product-experience-design.md`

## Global Constraints

- Implements G1, G3, S1, S6, S7 only.
- Requires at least one real public product artifact before claiming the full living-product outcome complete.
- No generated concept UI may be represented as product proof.
- No authored product facts inside scene components.
- All controls work with keyboard/touch; no hover-only hotspots.
- Reading/compare/story state changes presentation, not truth.

---

### Task 1: Define Living Product scene metadata boundary (G1)

**Files:**
- Read: product schema and public product helpers
- Create: `src/lib/product-scene.ts`
- Create: `tests/architecture/c3-product-scene.test.mjs`

**Interfaces:**
- Consumes: canonical product slug, screenshot artifact, capability identifiers, optional authored focal coordinates.
- Produces: pure scene descriptor for rendering; it cannot introduce new capability text.

- [ ] **Step 1: write failing tests for valid/invalid scene metadata**

Require:

- referenced product exists and is public in fixture truth;
- screenshot reference matches canonical product proof artifact;
- hotspot capability ids resolve to canonical capability entries;
- focal coordinates are bounded 0–100%;
- unknown product/capability fails closed.

- [ ] **Step 2: prove RED**

```bash
node --test tests/architecture/c3-product-scene.test.mjs
```

- [ ] **Step 3: implement the smallest pure scene builder**

Do not duplicate product name, capability copy, CTA, status, or evidence in scene metadata.

### Task 2: Build Living Product Scene Engine (G1)

**Files:**
- Create: `src/components/product/LivingProductScene.astro`
- Modify: product theatre/profile consumers where appropriate
- Modify C3 craft stylesheet
- Create: `tests/e2e/c3-living-product-scene.spec.ts`

**Interfaces:**
- Consumes: scene descriptor + canonical product entry.
- Produces: real screenshot as dominant scene, with static focal/capability affordances and optional restrained motion.

- [ ] **Step 1: write static-first E2E assertions**

Assert product name, screenshot, capability access, CTA/profile route, and alt text are visible with JavaScript disabled.

- [ ] **Step 2: implement semantic scene markup**

Use normal figure/links/buttons/list semantics. Decorative depth must not obscure the screenshot.

- [ ] **Step 3: add optional motion under `prefers-reduced-motion: no-preference`**

- [ ] **Step 4: verify 1440/390/320px and 200% zoom**

### Task 3: Add Product Anatomy Hotspots (S1)

**Files:**
- Create or refine: `src/components/product/ProductHotspot.astro`
- Optional: `src/scripts/product-hotspots.ts`
- Extend: `tests/e2e/c3-living-product-scene.spec.ts`

**Interfaces:**
- Consumes: resolved capability id and optional product-proof link.
- Produces: numbered/labelled accessible hotspot with canonical capability explanation.

- [ ] **Step 1: write keyboard/touch tests**

- [ ] **Step 2: implement hotspot control with visible focus and no hover-only information**

- [ ] **Step 3: verify mobile placement does not cover critical UI**

- [ ] **Step 4: verify no proof link appears when proof is unresolved**

### Task 4: Implement Guided Product Story Playback (G3)

**Files:**
- Create: `src/lib/product-story.ts`
- Create: `src/components/product/ProductStory.astro`
- Optional: `src/scripts/product-story.ts`
- Create: `tests/architecture/c3-product-story.test.mjs`
- Create: `tests/e2e/c3-product-story.spec.ts`

**Interfaces:**
- Consumes: ordered story steps referencing canonical product capability/artifact/proof ids.
- Produces: visitor-controlled step sequence `Problem → Product action → UI state → Outcome → Evidence`.

- [ ] **Step 1: write schema/selector tests rejecting free-form unsupported product facts**

- [ ] **Step 2: implement all steps as server-rendered semantic content**

Enhancement may focus/advance steps but must not be required to access them.

- [ ] **Step 3: add explicit Next/Previous/Skip controls**

No autoplay and no scroll lock.

- [ ] **Step 4: test reduced motion, keyboard, and mobile**

### Task 5: Add Brief / Technical Reading Modes (S6)

**Files:**
- Create: `src/lib/reading-mode.ts`
- Create: `src/components/product/ReadingModeControl.astro`
- Modify product profile presentation only
- Create: `tests/e2e/c3-reading-mode.spec.ts`

**Interfaces:**
- Consumes: the same canonical product content tree.
- Produces: `brief` and `technical` presentation views; no duplicated content registry.

- [ ] **Step 1: define which semantic blocks are essential in both modes**

Always retain product identity, status, primary action, critical boundaries, and security/privacy/support routes that the product contract requires.

- [ ] **Step 2: write tests proving mode switching does not change product facts**

- [ ] **Step 3: implement visitor-local mode state**

Default must work without persistence. If URL state is used, allow only known enum values.

- [ ] **Step 4: verify screen-reader announcement and focus stability**

### Task 6: Implement Truthful Product Compare (S7)

**Files:**
- Create: `src/lib/product-compare.ts`
- Create: `src/components/product/ProductCompare.astro`
- Create: `tests/architecture/c3-product-compare.test.mjs`
- Create: `tests/e2e/c3-product-compare.spec.ts`

**Interfaces:**
- Consumes: 2–3 public product entries and canonical compare dimensions.
- Produces: comparison rows with known / unknown / not-applicable values; no score/winner.

- [ ] **Step 1: define a bounded compare-dimension allowlist from canonical schema fields**

Examples may include lifecycle/public label, platform/surface, verified capability ids, availability/action type, and public evidence availability if modeled.

- [ ] **Step 2: write negative tests rejecting rating/winner/score vocabulary**

- [ ] **Step 3: implement semantic table/list with mobile alternative**

- [ ] **Step 4: cap comparison count and test overflow/zoom**

### Task 7: Red-team living product truth

**Files:**
- Evidence ledger only unless a defect is reproduced

- [ ] **Step 1: remove/withhold screenshot in fixture and verify graceful honest fallback**

- [ ] **Step 2: inject unknown capability id and verify fail-closed behavior**

- [ ] **Step 3: verify story/compare cannot create stronger availability or assurance claims**

- [ ] **Step 4: inspect scene at 390/320px and reduced motion**

## Verification

Run targeted architecture/E2E suites plus existing product provenance, publishability, mobile, zoom, accessibility, and C3 trust-continuum tests where integrated.

## Exit Criteria

C3-C is complete when at least one real public product can be inspected through a scene, accessible hotspots, and guided story; reading mode and compare remain truth-equivalent; static/no-JS product understanding remains complete; and no product fact is authored by presentation code.
