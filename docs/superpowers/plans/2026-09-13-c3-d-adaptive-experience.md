# C3-D — Adaptive Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adapt information prominence and cinematic fidelity to explicit visitor intent and device/user preferences without profiling, fingerprinting, or changing underlying truth.

**Architecture:** Separate two local presentation layers: `intent` and `fidelity`. Intent is explicit visitor choice; fidelity is derived from standards-based preferences and feature support. Both feed pure presentation selectors and CSS/data attributes. They never modify canonical product/claim/evidence membership.

**Tech Stack:** Astro 7, TypeScript 6, CSS media queries/feature detection, small vanilla client modules, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-13-c3-living-verifiable-product-experience-design.md`

## Global Constraints

- Implements G5 and G6 only.
- Default experience is complete and useful without either state.
- No fingerprinting, hardware benchmarking loops, ad-tech profiling, cross-site identifiers, or remote personalization service.
- No required content is hidden based on intent/fidelity.
- Preference state is presentation state only.

---

### Task 1: Define explicit intent model (G5)

**Files:**
- Create: `src/lib/experience-intent.ts`
- Create: `tests/architecture/c3-experience-intent.test.mjs`

**Interfaces:**
- Produces enum-like intents: `explore-products`, `evaluate-product`, `verify-trust`, `understand-architecture`, `work-with-us`.
- Produces pure selector `prioritizeForIntent(items, intent)` that reorders/promotes existing items without inventing/hiding required truth.

- [ ] **Step 1: write tests for known, unknown, and default intent**

- [ ] **Step 2: write invariant test proving item membership is unchanged**

- [ ] **Step 3: implement pure prioritization**

- [ ] **Step 4: verify deterministic output**

### Task 2: Build Visitor-Controlled Experience Graph UI (G5)

**Files:**
- Create: `src/components/experience/IntentControl.astro`
- Optional: `src/scripts/experience-intent.ts`
- Modify only presentation/order hooks on C3/C2 surfaces
- Create: `tests/e2e/c3-experience-intent.spec.ts`

**Interfaces:**
- Consumes: current intent enum and existing routes/actions.
- Produces: explicit control and local page presentation priority.

- [ ] **Step 1: render all choices in server HTML**

- [ ] **Step 2: implement local enhancement with no remote call**

- [ ] **Step 3: test keyboard, screen-reader state, mobile, and reset/default behavior**

- [ ] **Step 4: verify same facts/routes remain reachable for every intent**

### Task 3: Define fidelity tier resolver (G6)

**Files:**
- Create: `src/lib/experience-fidelity.ts`
- Create: `tests/architecture/c3-experience-fidelity.test.mjs`

**Interfaces:**
- Produces `static-premium | restrained | cinematic` from explicit preference overrides and standards-based capability/preferences.

- [ ] **Step 1: write deterministic resolver tests**

Reduced motion must force `static-premium` or equivalent non-travel behavior. Unsupported native features must never cause critical content failure.

- [ ] **Step 2: reject fingerprinting primitives in the module**

The test should reject canvas fingerprinting, WebGL renderer inspection, audio fingerprinting, hardware benchmark loops, device identifiers, and network transmission.

- [ ] **Step 3: implement feature/preference resolver**

Prefer CSS/media queries where possible; JS only reads what is necessary to choose enhancement already available locally.

### Task 4: Apply Adaptive Fidelity Engine (G6)

**Files:**
- Create: `src/components/experience/FidelityBoundary.astro` only if a component boundary is useful
- Modify C3 craft/living-product enhancement entry points
- Create: `tests/e2e/c3-fidelity.spec.ts`

**Interfaces:**
- Consumes: fidelity tier.
- Produces: page/root data attribute or class controlling optional enhancement level.

- [ ] **Step 1: verify static-premium renders all critical content/actions**

- [ ] **Step 2: verify restrained adds only lightweight native transitions/motion**

- [ ] **Step 3: verify cinematic is enhancement-only and remains inside performance budget**

- [ ] **Step 4: test reduced motion and unsupported-feature fallback**

### Task 5: Privacy and abuse red team

- [ ] **Step 1: inspect bundle/source for storage/network primitives**

Persistence is not required for V1. If later added, it requires separate justification and must remain first-party/local.

- [ ] **Step 2: verify malformed URL/query state cannot inject arbitrary values**

- [ ] **Step 3: verify intent/fidelity cannot alter truth state, claim state, or product lifecycle**

## Verification

Run architecture tests, C3 experience E2E, no-JS, reduced-motion, mobile, accessibility, client-budget, and full repository gates.

## Exit Criteria

C3-D is complete when visitors can explicitly prioritize their journey and the site can lower/raise optional fidelity using privacy-safe standards signals; default/static states remain complete; no fingerprinting or remote profiling exists; and truth membership is invariant across presentation modes.
