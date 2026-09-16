# C4-A — Editorial Craft & Luxury Density Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise BlueSkyz visual craft from premium software presentation to quiet-authority editorial quality through measurable typography, composition, material, density, motion, imagery, colophon, icon, and microcopy contracts.

**Architecture:** Extend C3 craft and Brand v4 semantic tokens; do not create a second design system. C4-A adds one focused quiet-authority stylesheet plus small pure helpers/guards where objective measurement is needed. Existing route/content truth is unchanged.

**Tech Stack:** Astro 7, TypeScript 6, Tailwind CSS 4, CSS/SVG, native motion/view transitions, Node tests, Playwright, axe, Lighthouse.

**Spec:** `docs/superpowers/specs/2026-09-16-c4-quiet-authority-digital-maison-design.md`

## Global Constraints

- Implements S1–S10 only.
- Requires C3-A convergence and live baseline green before activation.
- Existing Brand v4 color/tokens remain authoritative; no gold palette, generic glassmorphism, or second motion grammar.
- No new font family without separate measured approval.
- Quiet authority must be measurable through hierarchy/density/accessibility/performance, not a subjective score.
- EN/VI, 1440/390/320, reduced motion, forced colors, 200% zoom, text spacing, no horizontal overflow, axe and Lighthouse are hard gates.
- No new animation/framework dependency.

---

### Task 1: Establish Quiet Authority craft contract

**Files:**
- Create: `src/styles/c4-quiet-authority.css`
- Modify: `src/styles/global.css`
- Create: `tests/architecture/c4-quiet-authority-contract.test.mjs`

**Interfaces:**
- Produces semantic aliases for editorial grid, reading measure, material surfaces, folio, colophon, gallery mount, and motion-scarcity roles.
- Consumes existing Brand v4 and C3 semantic tokens only.

- [ ] **Step 1: write failing architecture assertions**

Assert one C4 stylesheet, exactly one declaration source per C4 semantic role, no hard-coded decorative gold palette, no duplicated keyframes, and no imported runtime animation framework.

- [ ] **Step 2: prove RED**

```bash
node --test tests/architecture/c4-quiet-authority-contract.test.mjs
```

Expected: FAIL because the C4 role layer does not yet exist.

- [ ] **Step 3: add minimal semantic role layer**

Define aliases such as `--c4-reading-measure`, `--c4-display-measure`, `--c4-material-ink`, `--c4-material-paper`, `--c4-hairline`, `--c4-folio-gap`, and motion-scarcity aliases using existing tokens. Do not author new brand truth.

- [ ] **Step 4: prove GREEN and full architecture compatibility**

```bash
node --test tests/architecture/c4-quiet-authority-contract.test.mjs
pnpm test:architecture
```

### Task 2: Editorial Grid System v3

**Files:**
- Modify: `src/styles/c4-quiet-authority.css`
- Modify representative authority surfaces: `src/components/sections/Hero.astro`, `src/components/sections/OneHouse.astro`, `src/components/sections/AboutBlueSkyz.astro`
- Create: `tests/e2e/c4-editorial-grid.spec.ts`

**Interfaces:**
- Produces `c4-editorial-grid`, `c4-reading-column`, and `c4-focal-span` composition roles.

- [ ] **Step 1: write RED layout assertions**

At 1440px require deliberate asymmetric composition on selected surfaces; at 390/320 require authored single-column ordering with no horizontal overflow. Assert DOM reading order remains semantic and unchanged by visual placement.

- [ ] **Step 2: prove RED against current uniform layout**

```bash
npx playwright test tests/e2e/c4-editorial-grid.spec.ts --project=chromium --project=mobile-chromium
```

- [ ] **Step 3: implement shared grid roles**

Use CSS Grid and existing spacing tokens. Do not add route-local arbitrary grids where a shared role applies.

- [ ] **Step 4: verify EN/VI and zoom**

Run editorial grid test plus existing mobile-overflow/text-zoom/text-spacing/bilingual suites.

### Task 3: Optical Typography Calibration

**Files:**
- Modify: `src/styles/c4-quiet-authority.css`
- Modify: `src/components/sections/Hero.astro`
- Modify shared page heading/prose surfaces identified on live main at execution
- Create: `tests/architecture/c4-typography-contract.test.mjs`
- Create: `tests/e2e/c4-optical-type.spec.ts`

**Interfaces:**
- Produces semantic roles for display, section, product, evidence, meta, caption, and long-form reading without changing the font family.

- [ ] **Step 1: write source contract**

Reject a second font family, arbitrary route-local type scales, and over-wide long-form measures.

- [ ] **Step 2: write browser assertions**

Check EN/VI line wrapping at 1440/390/320, no clipped diacritics, stable heading hierarchy, bounded reading measure, and no overflow under 200% zoom/text spacing.

- [ ] **Step 3: implement calibrated type roles**

Prefer fluid clamp ranges and semantic aliases over one-off utility stacks. Preserve actual heading semantics.

- [ ] **Step 4: verify**

```bash
node --test tests/architecture/c4-typography-contract.test.mjs
npx playwright test tests/e2e/c4-optical-type.spec.ts tests/e2e/text-zoom.spec.ts tests/e2e/text-spacing.spec.ts tests/e2e/bilingual-parity.spec.ts --project=chromium --project=mobile-chromium
```

### Task 4: Material Surface Grammar

**Files:**
- Modify: `src/styles/c4-quiet-authority.css`
- Modify only affected shared surface components after live inventory
- Create: `tests/architecture/c4-material-grammar.test.mjs`

**Interfaces:**
- Produces four semantic materials: Ink, Porcelain, Quiet Paper, Cobalt Accent; consumes existing brand tokens.

- [ ] **Step 1: write RED guard**

Reject new raw palette clusters, universal glass/blur surfaces, excessive shadow declarations, and route-local alternative material systems.

- [ ] **Step 2: implement semantic material aliases**

Use hairlines, tonal separation, restrained radius, and existing surfaces. Cobalt remains accent, not large-area visual noise.

- [ ] **Step 3: verify forced colors and contrast**

Run architecture tests, axe matrix, and forced-colors E2E on affected routes.

### Task 5: Luxury Density Budget

**Files:**
- Modify: `tests/architecture/experience-density.test.mjs`
- Create: `src/lib/quiet-density.ts`
- Create: `tests/architecture/c4-density-budget.test.mjs`

**Interfaces:**
- Produces deterministic counters/ceilings for simultaneous primary actions, chips/status objects, focal media, card groups, and active motion hooks.
- Never produces a “luxury score”.

- [ ] **Step 1: add negative synthetic fixtures**

Prove the guard catches a scene with multiple competing primary CTAs, excessive chips/status objects, or too many simultaneous focal media regions.

- [ ] **Step 2: prove RED against missing C4 budget implementation**

```bash
node --test tests/architecture/c4-density-budget.test.mjs
```

- [ ] **Step 3: implement deterministic counters and conservative ceilings**

Start from current measured production density; reduce competition without hiding required actions or evidence.

- [ ] **Step 4: verify all live routes pass**

Run architecture suite and record baseline/after values in C4-A evidence.

### Task 6: Editorial Folio System

**Files:**
- Create: `src/components/editorial/Folio.astro`
- Modify: `src/styles/c4-quiet-authority.css`
- Apply only to long multi-act/long-form surfaces after live route inventory
- Create: `tests/e2e/c4-folio.spec.ts`

**Interfaces:**
- Consumes authored section identity/labels; produces decorative chapter/running-context affordance with text remaining authoritative.

- [ ] **Step 1: write keyboard/screen-reader/zoom-safe assertions**

Folio decoration must not duplicate heading semantics, become a progress score, or trap focus.

- [ ] **Step 2: implement semantic decorative folio**

Use `aria-hidden` only for redundant ornamental numbering; any meaningful context remains real text.

- [ ] **Step 3: verify mobile and print**

Run folio test plus print-surface and zoom suites.

### Task 7: Signature Colophon

**Files:**
- Modify: `src/components/layout/Footer.astro`
- Modify: `src/styles/c4-quiet-authority.css`
- Read: public truth/security/architecture route helpers
- Create: `tests/architecture/c4-colophon-contract.test.mjs`
- Create: `tests/e2e/c4-colophon.spec.ts`

**Interfaces:**
- Produces a restrained footer colophon with identity, language, public trust/security/architecture links, and only approved public freshness context.

- [ ] **Step 1: write fail-closed contract**

Reject Git SHAs, internal repo paths, workflow names, private evidence, blanket assurance language, and invented review dates.

- [ ] **Step 2: implement colophon from approved public helpers**

Do not duplicate route labels or truth vocabularies in the component.

- [ ] **Step 3: verify links, EN/VI and 320px**

Run architecture/static-link/browser suites.

### Task 8: BlueSkyz Line Icon Grammar

**Files:**
- Create: `src/components/icon/BlueSkyzIcon.astro`
- Create: `src/lib/icon-registry.ts`
- Create: `tests/architecture/c4-icon-grammar.test.mjs`
- Modify only controls where an icon materially improves comprehension

**Interfaces:**
- Produces a bounded allowlisted icon set with one geometry/stroke grammar.

- [ ] **Step 1: write RED allowlist tests**

Reject arbitrary inline icon collections and decorative icon use without a semantic/control purpose.

- [ ] **Step 2: implement a minimal registry**

Start with only icons required by live controls; do not create a broad library speculatively.

- [ ] **Step 3: verify accessible names remain textual**

Icons cannot replace required control labels unless a tested accessible name exists.

### Task 9: Quiet Motion Budget

**Files:**
- Modify: `src/styles/c4-quiet-authority.css`
- Extend: existing reduced-motion architecture/E2E tests
- Create: `tests/architecture/c4-motion-scarcity.test.mjs`

**Interfaces:**
- Produces scarcity rules over existing purpose-motion tokens; no new animation engine.

- [ ] **Step 1: write negative tests for perpetual/multi-focal motion**

Reject continuous decorative animation and multiple competing entrance hooks in one scene.

- [ ] **Step 2: implement scarcity classes/tokens**

One focal continuity/entrance moment per scene is the default ceiling; exceptions require explicit evidence and reduced-motion equivalence.

- [ ] **Step 3: verify reduced motion neutralization**

Run architecture + affected browser suites.

### Task 10: Gallery Mount ProductVisual

**Files:**
- Modify after C3-A ownership stabilizes: `src/components/product/ProductVisual.astro`
- Modify: `src/styles/c4-quiet-authority.css`
- Extend: `tests/e2e/c3-product-visual.spec.ts`
- Create: `tests/e2e/c4-gallery-mount.spec.ts`

**Interfaces:**
- Consumes only real/source-authorized screenshot truth and optional canonical caption/provenance.
- Produces an exhibition-style mount with no fake device chrome or invented product UI.

- [ ] **Step 1: assert real media and provenance boundary**

No screenshot truth means no fabricated gallery object. Intrinsic dimensions/alt remain mandatory when media exists.

- [ ] **Step 2: implement mount treatment**

Use fine edge, tonal backing, deliberate caption spacing, and responsive image scale. Perspective remains optional and decorative.

- [ ] **Step 3: verify image size, CLS, mobile, reduced motion and evidence links**

### Task 11: Microcopy Decrescendo

**Files:**
- Modify only approved public copy sources discovered on live main; prefer `src/data/site.ts` and centralized locale sources over component literals
- Create: `tests/architecture/c4-copy-restraint.test.mjs`
- Extend bilingual parity tests

**Interfaces:**
- Produces calmer, shorter action language without changing factual meaning or hiding boundaries.

- [ ] **Step 1: inventory adjective/CTA repetition and hard-coded copy**

Document candidate reductions before changing text.

- [ ] **Step 2: write source guard**

Keep shared actions centralized/localized and reject known hype phrases introduced by C4 work.

- [ ] **Step 3: apply minimal copy reductions**

Prefer direct verbs and evidence-oriented labels. Preserve approved brand proposition unless a separate brand decision changes it.

- [ ] **Step 4: verify EN/VI semantic parity and navigation clarity**

## Verification and exit criteria

C4-A exits only when all 10 S+ capabilities are either implemented and evidenced or explicitly scoped out by an approved decision, and when:

- density/motion contracts pass without a subjective score;
- typography/grid/material rules are shared rather than route-local forks;
- no new runtime dependency or palette exists;
- mobile/zoom/text-spacing/forced-colors/EN-VI/accessibility remain green;
- client bytes and Lighthouse do not regress beyond existing hard budgets;
- ProductVisual remains truth-bound; and
- exact-head source + browser + provider evidence is green before merge and after production promotion.
