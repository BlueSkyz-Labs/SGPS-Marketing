# C3-B — Trust Continuum Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make product capability, evidence, provenance, and truth state inspectable in context without turning public product pages into governance dashboards.

**Architecture:** Reuse Claim Fabric, evidence/passport/provenance selectors, truth-state vocabulary, and public product truth. Add contextual evidence adapters and machine serialization as derived views only. Text remains the source of meaning; choreography is supplemental.

**Tech Stack:** Astro 7, TypeScript 6, native HTML/CSS/SVG, `<details>`, optional dialog/sheet enhancement, Node tests, Playwright, axe.

**Spec:** `docs/superpowers/specs/2026-09-13-c3-living-verifiable-product-experience-design.md`

## Global Constraints

- Implements G4, G8, G9, S8 only.
- No trust score, maturity score, verification badge, or blanket green state.
- Missing evidence is explicit and never auto-promoted.
- Machine output is derived from canonical public sources and must not leak internal/private facts.
- Product context remains primary; evidence depth is progressive.

---

### Task 1: Define product-to-proof selector contract (G4)

**Files:**

- Read: canonical product, claim, evidence, boundary, passport and provenance modules
- Create or extend: `src/lib/product-proof.ts`
- Create: `tests/architecture/c3-product-proof.test.mjs`

**Interfaces:**

- Consumes: product slug/capability identifiers plus canonical public Claim Fabric/evidence selectors.
- Produces: `getProductProofLinks(productSlug, capabilityId)` returning only resolvable public proof items with explicit truth state/boundary metadata.

- [ ] **Step 1: write failing tests for resolvable, missing, private, and unknown proof**

- [ ] **Step 2: prove RED**

```bash
node --test tests/architecture/c3-product-proof.test.mjs
```

- [ ] **Step 3: implement the smallest pure selector**

Do not author new claims inside `product-proof.ts`.

- [ ] **Step 4: prove GREEN and verify deterministic output**

### Task 2: Add contextual Product-to-Proof UI (G4)

**Files:**

- Create: `src/components/integrity/ProductProofLink.astro`
- Integrate into C2/C3 product capability surfaces only where proof exists
- Create: `tests/e2e/c3-product-proof.spec.ts`

**Interfaces:**

- Consumes: output from `getProductProofLinks`.
- Produces: compact contextual proof affordance with boundary/truth wording and deep evidence destination.

- [ ] **Step 1: test no-proof state renders no fake trust chrome**

- [ ] **Step 2: implement semantic link/disclosure**

- [ ] **Step 3: test keyboard, mobile, no-JS, and valid destination**

### Task 3: Build Evidence Drawer / Evidence Peek (S8)

**Files:**

- Create: `src/components/integrity/EvidencePeek.astro`
- Optional small enhancement module: `src/scripts/evidence-peek.ts`
- Create: `tests/e2e/c3-evidence-peek.spec.ts`

**Interfaces:**

- Consumes: canonical proof item(s).
- Produces: native document disclosure as baseline; optional desktop side sheet that never replaces canonical evidence routes.

- [ ] **Step 1: implement `<details>` or normal route fallback first**

- [ ] **Step 2: prove keyboard/no-JS behavior**

- [ ] **Step 3: add desktop enhancement only if it stays within client budget**

- [ ] **Step 4: verify focus trap/restore if a dialog pattern is used**

### Task 4: Define Evidence-Aware Choreography grammar (G8)

**Files:**

- Extend C3 craft stylesheet or create focused trust-motion tokens
- Extend truth-state component only if needed
- Create: `tests/architecture/c3-truth-choreography.test.mjs`
- Create: `tests/e2e/c3-truth-choreography.spec.ts`

**Interfaces:**

- Consumes: existing truth-state vocabulary.
- Produces: optional presentation classes such as `truth-known`, `truth-preview`, `truth-unavailable`, `truth-unknown` without changing semantic labels.

- [ ] **Step 1: write tests rejecting quality/assurance scoring semantics**

- [ ] **Step 2: implement restrained visual grammar**

- [ ] **Step 3: neutralize non-essential motion under reduced motion**

- [ ] **Step 4: verify forced-colors still exposes textual truth state**

### Task 5: Build Agent-Readable Product & Trust Passport (G9)

**Files:**

- Create: `src/lib/agent-passport.ts`
- Create route such as: `src/pages/.well-known/product-trust.json.ts` or the repository-approved machine route
- Create: `tests/architecture/c3-agent-passport.test.mjs`
- Extend static-link/manifest tests where relevant

**Interfaces:**

- Consumes: canonical public products, claims, evidence references, public routes, review/freshness metadata already approved.
- Produces: deterministic versioned JSON with no internal/private fields.

- [ ] **Step 1: define strict public schema in the test**

Allowed top-level shape should include only version, generated-from-public-source marker, products, claims/evidence references, public URLs, and explicit freshness/source metadata that already exists.

- [ ] **Step 2: write negative leakage tests**

Reject:

- repository file paths;
- GitHub workflow names;
- unpublished product names;
- private evidence identifiers;
- secret/token-like values;
- corporate emails unless already explicitly public and required by the canonical route;
- unsupported assurance wording.

- [ ] **Step 3: prove RED, implement deterministic serializer, prove GREEN**

```bash
node --test tests/architecture/c3-agent-passport.test.mjs
```

- [ ] **Step 4: verify stable ordering and locale-safe public URLs**

### Task 6: Red-team Trust Continuum

**Files:**

- Create evidence ledger under `docs/evidence/`

- [ ] **Step 1: test forged/unknown capability ids**

- [ ] **Step 2: test missing evidence and stale metadata**

- [ ] **Step 3: test no-JS and reduced-motion paths**

- [ ] **Step 4: verify machine passport contains no hidden/private source**

- [ ] **Step 5: run public assurance language scanner/integrity firewall**

## Verification

Run:

```bash
pnpm test:architecture
pnpm check:integrity-firewall
pnpm check:publishability
pnpm check:static-links
pnpm build
npx playwright test tests/e2e/c3-product-proof.spec.ts tests/e2e/c3-evidence-peek.spec.ts tests/e2e/c3-truth-choreography.spec.ts --project=chromium --project=mobile-chromium
```

Then run the full repository source/browser assurance before merge.

## Exit Criteria

C3-B is complete when product capability can reach real proof without losing context; evidence preview remains progressive and accessible; truth choreography never implies a score; machine passport is deterministic/leak-safe; and all existing SGPS integrity/provenance gates remain green.
