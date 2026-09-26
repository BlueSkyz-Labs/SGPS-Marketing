# C3-F — Living Release Publication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish meaningful product releases as structured, source-backed stories without inflating minor technical changes or creating a parallel marketing truth source.

**Architecture:** Introduce a canonical public release-story schema that references real product/source revision/release evidence. Adapters transform approved release truth into a stable public record; presentation components render `what changed → why it matters → product surface → evidence/source → freshness`. Marketing copy never creates release existence or status.

**Tech Stack:** Astro 7, TypeScript 6, content collections or the repository's existing canonical data pattern, HTML/CSS, Node tests, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-13-c3-living-verifiable-product-experience-design.md`

## Global Constraints

- Implements G10 only.
- A release story requires a real product and resolvable release/source identity.
- No fabricated version, release date, customer impact, adoption metric, or significance claim.
- Minor maintenance must not be labelled as a major product milestone without authored source truth.
- Release pages remain static/public-truth surfaces; no runtime API is required by default.

---

### Task 1: Define public release-story schema

**Files:**

- Create: `src/lib/release-schema.ts` or the repository-standard content schema location
- Create: `tests/architecture/c3-release-schema.test.mjs`

**Interfaces:**

- Produces a validated record with fields such as `id`, `productSlug`, `title`, `summary`, `releaseDate`, `sourceRevision/sourceUrl`, `changes[]`, optional `productSurface`, and public evidence references.

- [x] **Step 1: write tests requiring resolvable product/source identity** — covered by `tests/architecture/c3-release-schema.test.mjs` and merged in PR #266.

- [x] **Step 2: write negative tests for future/generated date, unknown product, private source, unsupported metrics, and missing evidence** — the schema suite covers these cases (14/14 passed in PR #266).

- [ ] **Step 3: prove RED** — the merged PR/evidence does not preserve a failing pre-implementation run, so the historical RED is not claimed.
- [x] **Implementation: implement strict schema** — merged in PR #266 (`4efb49b`); exact-head verification recorded 14/14 schema tests and 562/562 architecture tests.

### Task 2: Build release source adapter

**Files:**

- Create: `src/lib/release-adapter.ts`
- Create: `tests/architecture/c3-release-adapter.test.mjs`

**Interfaces:**

- Consumes: explicitly approved release/changelog/source records.
- Produces: validated public release-story candidates; no prose-generation authority.

- [ ] **Step 1: define the first actual supported source type from live product truth**

If no reliable source exists, mark C3-F source-blocked and do not fabricate sample production releases.

- [ ] **Step 2: write fixture tests for source mapping and stale/unresolvable revisions**

- [ ] **Step 3: implement pure adapter and deterministic ordering**

### Task 3: Build release index and story page

**Files:**

- Create: public release index/detail routes under the approved IA
- Create: `src/components/release/ReleaseStory.astro`
- Create: `tests/e2e/c3-release-story.spec.ts`

**Interfaces:**

- Consumes: validated release-story records.
- Produces: accessible release index/detail experience with canonical product/evidence links.

- [ ] **Step 1: write route/build tests first**

- [ ] **Step 2: implement semantic story structure**

Sections: what changed, why it matters, relevant product surface, source/evidence, freshness/version.

- [ ] **Step 3: link product and evidence routes using existing canonical helpers**

- [ ] **Step 4: verify EN/VI policy**

If bilingual release copy is required by the live experience contract, do not publish a partial locale story without the repository-approved fallback/translation policy.

### Task 4: Add homepage/product-page release signal with restraint

**Files:**

- Modify C3/C2 product surfaces only if a real current release exists
- Create targeted E2E assertions

**Interfaces:**

- Produces: one concise recent-release affordance, not a feed wall.

- [x] **Step 1: show no release chrome when there is no valid release** — `tests/e2e/c3-release-empty-state.spec.ts` guards the empty public registry across EN/VI home and product index; the injected-marker mutation failed as expected and the restored build passed.

- [ ] **Step 2: display freshness/version literally**

- [ ] **Step 3: verify link to full release story**

### Task 5: Red-team release inflation and stale truth

- [ ] **Step 1: fixture with maintenance-only source must not become a flagship milestone automatically**

- [ ] **Step 2: unresolved source revision must fail closed**

- [ ] **Step 3: removed/unpublished product must remove or explicitly archive dependent public release according to product policy**

- [ ] **Step 4: run assurance-language and publishability gates**

## Verification

Run release schema/adapter tests, static links, product provenance, publishability, bilingual/SEO checks, affected E2E, then full source/browser assurance.

## Exit Criteria

C3-F is complete when meaningful real releases can be published from canonical release truth with deterministic provenance, no inflated claims, valid product/evidence links, correct locale/SEO behavior, and no release UI when source truth is absent.
