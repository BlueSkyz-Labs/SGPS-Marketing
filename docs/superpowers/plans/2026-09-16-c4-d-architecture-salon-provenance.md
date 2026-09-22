# C4-D — Architecture Salon & Provenance Lens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make approved BlueSkyz architecture and truth lineage inspectable as calm, public-safe experiences without leaking internal topology or turning trust into governance dashboard chrome.

**Architecture:** Introduce one public-safe architecture adapter over the canonical SGPS architecture model and one provenance adapter over canonical product/claim/evidence/release sources. Salon and Lens components consume only those derived public-safe view models.

**Tech Stack:** Astro 7, TypeScript 6, HTML/CSS/SVG, no required client framework, Node tests, Playwright, axe.

**Spec:** `docs/superpowers/specs/2026-09-16-c4-quiet-authority-digital-maison-design.md`

## Global Constraints

- Implements G4 and G5 only.
- Requires C3 Trust Continuum/public architecture evidence foundations to be green.
- Architecture model remains canonical; C4 must not duplicate topology in editorial content.
- Public-safe adapter must exclude repository paths, private evidence, branch/SHA/workflow internals, secrets, private hostnames, unpublished systems, and unsupported assurance claims.
- Provenance must expose source/boundary/freshness truth without ranking or verification scoring.
- Static HTML/text remains authoritative; diagrams are supplemental.

---

### Task 1: Define public-safe architecture adapter

**Files:**

- Create: `src/lib/public-architecture.ts`
- Read: `architecture/sgps-model.json`
- Read existing generated/public architecture views and evidence contracts
- Create: `tests/architecture/c4-public-architecture.test.mjs`

**Interfaces:**

- Produces `getPublicArchitectureView(lens)` for allowlisted lenses: `system`, `data`, `trust`, `recovery`, `evidence`.
- Returns stable public node/edge records with public labels/descriptions only.

- [ ] **Step 1: write RED leak-safety tests**

Reject any output containing repository paths, Git SHAs, workflow/branch names, private evidence IDs, secret-like values, unpublished system names, preview/private hosts, or fields outside the public schema.

- [ ] **Step 2: prove RED**

```bash
node --test tests/architecture/c4-public-architecture.test.mjs
```

- [ ] **Step 3: implement explicit allowlist projection**

Do not sanitize arbitrary internal records after the fact. Construct the public record from an allowlisted schema and approved public fields.

- [ ] **Step 4: add non-vacuity tests**

Synthetic internal-path/private-host records must be excluded/fail according to repository public-truth doctrine.

### Task 2: Build Architecture Salon

**Files:**

- Create: `src/components/architecture/ArchitectureSalon.astro`
- Create: `src/components/architecture/ArchitectureLens.astro`
- Modify localized architecture route(s) discovered on live main
- Modify: `src/styles/c4-quiet-authority.css`
- Create: `tests/e2e/c4-architecture-salon.spec.ts`

**Interfaces:**

- Consumes public-safe architecture view only.
- Produces text-first lens navigation plus optional SVG relationships.

- [ ] **Step 1: write lens/navigation tests**

All five lenses have semantic headings and ordinary links/controls; unknown lens fails to safe default; mobile reading order stays meaningful; no diagram-only information.

- [ ] **Step 2: implement static-first salon**

Prefer semantic lists/sections and small SVG connectors. Do not introduce WebGL, canvas-only graphs, physics, drag-only navigation, or scroll-jacking.

- [ ] **Step 3: verify forced colors, keyboard, no-JS, 320/390/1440**

### Task 3: Define site-wide provenance adapter

**Files:**

- Create: `src/lib/provenance-lens.ts`
- Read canonical product/claim/evidence/release/public architecture selectors
- Create: `tests/architecture/c4-provenance-lens.test.mjs`

**Interfaces:**

- Produces `getPublicProvenance(subject)` with `statement`, `sourceRefs`, `boundary`, optional authored freshness, and explicit `unknown` semantics.
- Subject identifiers are stable allowlisted public IDs only.

- [ ] **Step 1: write fail-closed tests**

Unknown/private/self-only evidence, internal paths, invalid URLs, fabricated freshness, and unsupported assurance vocabulary must not produce a convincing provenance chain.

- [ ] **Step 2: implement deterministic resolver**

No network access or runtime mutation. Resolve only canonical public references.

- [ ] **Step 3: prove source stability and locale parity**

EN/VI presentation can differ in copy but must resolve the same underlying public source identities where the canonical model requires parity.

### Task 4: Build Provenance Lens component

**Files:**

- Create: `src/components/provenance/ProvenanceLens.astro`
- Modify selected product/trust/architecture/release surfaces after live inventory
- Modify: `src/styles/c4-quiet-authority.css`
- Create: `tests/e2e/c4-provenance-lens.spec.ts`

**Interfaces:**

- Consumes validated provenance view model.
- Produces progressive disclosure from statement to source/boundary/freshness without hiding main content.

- [ ] **Step 1: write collapsed/expanded/no-JS tests**

Critical source/boundary information must remain reachable with ordinary navigation or native disclosure; no hover-only provenance.

- [ ] **Step 2: implement native disclosure first**

Prefer `<details>`/semantic links before custom JS. Desktop enhancements must not create mobile-only dead ends.

- [ ] **Step 3: verify axe, screen-reader names, touch targets, forced colors**

### Task 5: Add provenance-to-dossier integration contract

**Files:**

- Extend: `src/lib/dossier.ts` only after C4-C exists
- Extend: `tests/architecture/c4-dossier-contract.test.mjs`
- Extend C4-D tests

**Interfaces:**

- Dossier consumes provenance adapter; it must not duplicate provenance truth.

- [ ] **Step 1: write integration test**

Assert dossier source blocks are projections of provenance results for the same public subject IDs.

- [ ] **Step 2: remove duplicate source assembly if discovered**

Preserve one provenance authority.

## Verification and exit criteria

C4-D exits when:

- every architecture surface derives from an allowlisted public-safe adapter;
- no internal architecture/repository/private evidence metadata leaks;
- provenance is deterministic, source-bound, boundary-aware, and fail-closed;
- text remains authoritative when diagrams/enhancements are disabled;
- no ranking/verification score or blanket assurance UI appears;
- EN/VI, no-JS, keyboard/touch, forced colors, reduced motion, 320/390, axe, Lighthouse, client budget and static-link gates pass; and
- production read-back verifies the deployed public-safe surfaces.
