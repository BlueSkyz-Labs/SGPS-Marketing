# C3-A — Experience Craft Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Raise C2's public surfaces to a consistent elite interaction and art-direction system through product imagery, typography, header behavior, route transitions, mobile composition, and microinteractions.

**Architecture:** Extend existing C2 visual primitives instead of creating a second design system. Keep semantic HTML and static rendering authoritative, then add native CSS/View Transition enhancements. Shared rules live in focused style/primitives; route-specific decoration stays minimal.

**Tech Stack:** Astro 7, TypeScript 6, Tailwind CSS 4, CSS/SVG, native View Transitions, Playwright, axe, Lighthouse.

**Spec:** `docs/superpowers/specs/2026-09-13-c3-living-verifiable-product-experience-design.md`

## Global Constraints

- Implements S2, S3, S4, S5, S9, S10 only.
- Requires the relevant C2 route composition to be merged before changing it.
- No new animation library or SPA router.
- Ordinary links and static content remain authoritative.
- Product imagery must be real/source-authorized.
- EN/VI typography and route parity remain mandatory.
- Reduced motion, forced colors, 320/390px, 200% zoom, text spacing, focus, and client budget remain hard gates.

---

### Task 1: Inventory C2 visual primitives and write C3 craft contracts

**Files:**

- Read: `src/styles/global.css`
- Read: C2 focused stylesheet if present
- Read: global header, product image, navigation, and route-link components
- Create: `tests/architecture/c3-craft-contract.test.mjs`

**Interfaces:**

- Produces: source-level guard for one image grammar, one transition grammar, and one interaction grammar.

- [x] **Step 1: write failing assertions for C3 craft boundaries**

Require a focused C3 craft stylesheet/module and reject route-local duplicate transition keyframes or a second hard-coded brand palette.

- [x] **Step 2: prove RED**

```bash
node --test tests/architecture/c3-craft-contract.test.mjs
```

Expected: FAIL before the shared primitives exist.

- [x] **Step 3: create focused shared boundaries**

Prefer files such as:

- `src/styles/c3-craft.css` — shared editorial type, scene/header states, route transition and interaction tokens;
- `src/lib/experience-fidelity.ts` only if required for capability-independent class selection; do not implement C3-D here.

- [x] **Step 4: prove GREEN and commit**

```bash
node --test tests/architecture/c3-craft-contract.test.mjs
```

### Task 2: Build Cinematic Screenshot Art Direction System (S2)

**Files:**

- Create or refine: `src/components/product/ProductVisual.astro`
- Modify product theatre/cards/profile consumers to use it
- Modify: `src/styles/c3-craft.css`
- Create: `tests/e2e/c3-product-visual.spec.ts`

**Interfaces:**

- Consumes: real screenshot `{src, alt, width, height}` and optional authored focal metadata already approved by product truth.
- Produces: one responsive, intrinsic-size, accessible product visual primitive.

- [x] **Step 1: write fixture-backed E2E assertions**

Assert intrinsic dimensions, meaningful alt, no layout overflow, readable image size at 1440/390px, and no fabricated image when screenshot truth is absent.

- [x] **Step 2: prove RED on the existing inconsistent visual treatment**

```bash
npx playwright test tests/e2e/c3-product-visual.spec.ts --project=chromium --project=mobile-chromium
```

- [x] **Step 3: implement the single visual primitive**

Support restrained crop/focal/perspective classes without embedding product facts in the component.

- [x] **Step 4: verify reduced motion and image loading policy**

Perspective/settle effects are decorative only; image visibility never depends on them.

### Task 3: Implement Editorial Typography v2 (S3)

**Files:**

- Modify: `src/styles/c3-craft.css`
- Modify shared heading/prose primitives only where needed
- Extend: bilingual/text-zoom/text-spacing E2E suites

**Interfaces:**

- Produces: shared type roles for display, section, product, evidence, meta, and long-form reading.

- [x] **Step 1: define semantic type roles using existing font family/tokens**

Do not introduce a new display font unless separately approved and measured.

- [x] **Step 2: test EN/VI wrapping at 1440, 390, and 320px**

- [x] **Step 3: test 200% zoom and text-spacing overrides**

```bash
npx playwright test tests/e2e/text-zoom.spec.ts tests/e2e/text-spacing.spec.ts tests/e2e/bilingual-parity.spec.ts --project=chromium --project=mobile-chromium
```

### Task 4: Build Scene-Aware Global Header (S4)

**Files:**

- Modify global header component
- Modify: `src/styles/c3-craft.css`
- Create: `tests/e2e/c3-header-scenes.spec.ts`

**Interfaces:**

- Consumes: authored page/section surface markers only.
- Produces: stable header with contrast/density variants; navigation labels/order remain unchanged.

- [x] **Step 1: write tests for Ink, Porcelain, product, keyboard, and mobile states**

- [x] **Step 2: implement CSS-first scene variants**

Use explicit page/section classes or a minimal observer only if CSS cannot preserve required behavior. Avoid scroll-event loops.

- [x] **Step 3: verify focus visibility and forced colors**

### Task 5: Formalize Route Transition Grammar (S5)

**Files:**

- Modify product/global link/image components as required
- Modify: `src/styles/c3-craft.css`
- Create: `tests/e2e/c3-route-transitions.spec.ts`

**Interfaces:**

- Produces: named native transition roles for Home→Product, Product→Evidence, Product→Product, EN↔VI.

- [x] **Step 1: test ordinary navigation with transition support absent**

- [x] **Step 2: add stable unique `view-transition-name` values only to paired elements**

- [x] **Step 3: verify reduced-motion navigation remains immediate and complete**

- [x] **Step 4: cross-browser test**

```bash
npx playwright test tests/e2e/c3-route-transitions.spec.ts --project=chromium --project=firefox --project=webkit
```

### Task 6: Author Mobile Cinematic Composition (S9)

**Files:**

- Modify C2 homepage/product scene layout styles
- Modify shared product visual only where mobile rules belong
- Extend: `tests/e2e/c3-product-visual.spec.ts`
- Extend mobile-overflow suites

**Interfaces:**

- Produces: deliberate vertical mobile composition, not compressed desktop spatial layout.

- [x] **Step 1: capture baseline at 390 and 320px**

- [x] **Step 2: fix image scale, action reachability, overlay collisions, and vertical rhythm using shared rules**

- [x] **Step 3: verify no horizontal overflow and readable product UI**

### Task 7: Complete Microinteraction Quality Pass (S10)

**Files:**

- Modify shared ButtonLink/link/disclosure/tab-like controls actually used by C3/C2
- Modify: `src/styles/c3-craft.css`
- Create: `tests/e2e/c3-microinteractions.spec.ts`

**Interfaces:**

- Produces: purpose-based states for hover, focus, active/pressed, disclosure, selection, image focus, and loading feedback.

- [x] **Step 1: write keyboard/pointer state tests**

- [x] **Step 2: implement state grammar with existing tokens**

- [x] **Step 3: verify no perpetual animation and forced-color compatibility**

## Verification

Run targeted suites during each task, then full repository gates before PR.

Record before/after client JS bytes and rendered screenshots for EN/VI home plus representative product/trust routes at 1440/390/320px.

## Exit Criteria

C3-A is complete when product imagery, type, header, route continuity, mobile composition, and microinteraction behavior share one coherent grammar; static/reduced-motion states remain premium; no new runtime dependency is required; and exact-head source/browser/performance/accessibility gates are green.
