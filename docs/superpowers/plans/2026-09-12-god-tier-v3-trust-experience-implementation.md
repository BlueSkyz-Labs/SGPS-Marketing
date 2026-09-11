# SGPS Marketing God-Tier v3 Trust-Native Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task by task. Use test-driven development for behavior changes and verification-before-completion before claiming a task or wave complete.

**Goal:** Complete the remaining S+ trust-native runtime capabilities, then add the God-tier evidence fabric, decision experience, public interoperability layer, and regression firewall without weakening SGPS truth discipline, static-first delivery, bilingual parity, accessibility, privacy, security, or performance.

**Architecture:** Preserve all merged v1/v2 systems as authoritative. Complete the ten unimplemented v2 SGPS capabilities first. Then add a typed claim/evidence graph that references existing route, product, trust, and integrity sources instead of duplicating them. Use semantic HTML, CSS, and SVG by default; add small external vanilla TypeScript modules only for bounded stateful interactions.

**Tech stack:** Astro 7.3+, TypeScript 6, Tailwind CSS 4, vanilla browser APIs, Playwright 1.63, axe-core, Node test runner, Lighthouse CI, Cloudflare Workers Builds, Node >=24.20.0, pnpm 11.25.x.

**Design spec:** `docs/superpowers/specs/2026-09-12-god-tier-v3-trust-experience-design.md`

## Reconciled Baseline

Authoring baseline: `main@e68c109212102bdb94d0132dc71ed4db31fa61b8`.

Already merged and authoritative:

- Motion Grammar and reduced-motion contract;
- site-wide and worst-page client-JS budget;
- BlueSkyz Horizon;
- Elevation Spine;
- One House Intelligence Matrix;
- Verifiable Trust Ledger;
- Contextual Journey Bar;
- Intent Lens;
- native EN/VI language continuity;
- Cmd/Ctrl+K Command Navigator;
- BlueSkyz Atlas V1;
- privacy-conscious analytics taxonomy with transmission disabled;
- SEO, canonical, and legacy-root 301 hardening;
- production smoke and rollback evidence;
- automated E4 matrix;
- bilingual shared-component hardening;
- fail-closed integrity primitives.

Current verified source facts:

- `src/lib/integrity.ts` exposes `getIntegrityEntriesForSurface()` and `getIntegrityEntry()`.
- `INTEGRITY_ENTRIES` currently starts empty and fail-closed.
- `src/lib/products.ts` exposes `getPublicProducts()` and remains the public-product authority.
- `src/components/experience/CommandNavigator.astro` uses the live navigator builder plus `getPublicProducts()`.
- `src/components/experience/Atlas.astro` uses the live Atlas builder plus `getPublicProducts()`.
- The ten unimplemented v2 capabilities remain the canonical S+ completion track.

## Global Constraints

- Refresh live `main`, open PRs, checks, deployment state, current source interfaces, and overlapping work before every wave.
- Historical SHAs are evidence anchors only; never implement against a stale SHA blindly.
- Preserve `src/lib/truth.ts` as the production public-truth validation authority.
- Public product existence is derived from `getPublicProducts()` only.
- Do not create a second manually maintained route, product, or public-evidence truth registry.
- Critical content, navigation, evidence, and actions work with JavaScript disabled.
- Do not add a UI framework, LLM, vector database, remote semantic search, account system, fingerprinting, cookie personalization, or localStorage personalization.
- Analytics transmission remains disabled unless separately approved.
- WebGL/3D remains NO-GO unless a later evidence-backed decision supersedes it.
- Do not invent customer, product, partner, certification, testimonial, evidence, review-date, trust-score, maturity-score, or guarantee content.
- Brand assets do not authorize product publication.
- Build, Git, and CI timestamps are not public review timestamps.
- Truth state is never color-only.
- EN and VI remain behaviorally equivalent.
- Maintain keyboard parity, visible focus, 44px target intent, 200% text zoom, 320px no-overflow, reduced-motion equivalence, and no-JS critical paths.
- Keep the client-JS hard ceiling at 120,000 B Brotli for both site-wide unique scripts and the worst page.
- Do not weaken tests, checks, security headers, source assurance, or truth validation to get green.
- Runtime promotion remains branch → PR → exact-head CI and Cloudflare evidence → merge → post-merge read-back.

## Standard Verification Matrix

Run the full matrix at the end of every runtime PR unless the PR is provably docs-only:

```bash
pnpm install --frozen-lockfile
pnpm audit --audit-level=moderate
pnpm test:architecture
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm check:client-budget
pnpm check:static-links
pnpm test:e2e
```

Add focused tests and production smoke whenever a task changes public routes, redirects, manifest output, canonical URLs, or deployed behavior.

---

# Wave 0 — Reconcile and Lock the v3 Execution Surface

## Task 0.1 — Live-State Reconciliation and Completion Matrix

**Files:**

- Read `docs/superpowers/specs/2026-09-12-god-tier-v3-trust-experience-design.md`.
- Read this plan.
- Read `docs/superpowers/plans/2026-09-11-s-plus-v2-trust-native-implementation.md`.
- Read `src/data/integrity.ts`, `src/lib/integrity.ts`, `src/lib/truth.ts`, `src/lib/products.ts`, `src/lib/navigator.ts`, and `src/lib/atlas.ts`.
- Read current open PRs, checks, workflows, and deployment authority.
- Create `docs/evidence/2026-09-12-v3-live-reconciliation.md` in the first runtime PR.

**Execution steps:**

- [ ] Refresh `origin/main` and record the exact SHA.
- [ ] Search for every planned component and module before creating new files.
- [ ] Record the live navigator builder, Atlas builder, product selector, integrity selectors, route/i18n helpers, analytics emitter, and smoke command.
- [ ] Mark every task `SATISFIED`, `OPEN`, `BLOCKED`, or `NO-GO`.
- [ ] If the live source already satisfies a task, adopt it instead of creating a parallel implementation.
- [ ] If the live source invalidates a public interface in this plan, update the plan before runtime work rather than improvising incompatible architecture.
- [ ] Commit the reconciliation note with the first runtime PR.

**Acceptance:** No v3 implementation starts from an unverified stale assumption.

---

# Wave 1 — S+ Completion: Truth Grammar and Safe Public Actions

## Task 1 — S+1 Truth-State Visual Grammar

**Files:**

- Create `src/components/integrity/TruthState.astro`.
- Modify `src/styles/global.css`.
- Create `tests/architecture/truth-state-contract.test.mjs`.
- Create `tests/e2e/truth-state-grammar.spec.ts`.

**Public contract:**

```text
TruthState.astro
- state: existing TruthState union
- lang: en | vi
- visible localized state label
- decorative non-color glyph
```

**Execution steps:**

- [ ] Write an architecture test that fails because the component does not yet exist.
- [ ] Require every existing truth state to have EN and VI text.
- [ ] Reject `trustScore`, `maturityScore`, confidence percentages, `verified` badges, and `certified` badges.
- [ ] Implement one localized state map keyed by the existing `TruthState` union.
- [ ] Render visible text plus a decorative glyph with `aria-hidden="true"`.
- [ ] Use existing brand and motion tokens; no continuous state animation.
- [ ] Add Playwright coverage for EN/VI labels, accessible names, 200% zoom, reduced motion, and non-color meaning.
- [ ] Run focused tests, then the standard verification matrix.

**Commit:**

```bash
git add src/components/integrity/TruthState.astro src/styles/global.css tests/architecture/truth-state-contract.test.mjs tests/e2e/truth-state-grammar.spec.ts
git commit -m "feat(trust): add accessible truth-state grammar"
```

**Acceptance:** Every public truth state can be read without relying on color, animation, or unsupported assurance language.

## Task 2 — S+2 Proof-First Empty States

**Files:**

- Create `src/components/product/ProofFirstEmptyState.astro`.
- Modify `src/pages/en/products/index.astro`.
- Modify `src/pages/vi/products/index.astro`.
- Modify `tests/architecture/integrity-truth-contract.test.mjs`.
- Create `tests/e2e/product-empty-state.spec.ts`.

**Execution steps:**

- [ ] Write a failing zero-product test against the current empty registry.
- [ ] Require the empty state to explain the proof-backed publication rule.
- [ ] Require locale-correct useful internal actions.
- [ ] Reject imports or enumeration of product brand assets from the empty-state component.
- [ ] Reject unpublished product names in rendered output.
- [ ] Implement copy that says only proof-backed public products appear; never say BlueSkyz has no products.
- [ ] Reuse current empty-registry CTA helpers instead of duplicating route logic.
- [ ] Run `pnpm validate:public-truth`, EN/VI parity, no-JS, and 320px checks.

**Commit:**

```bash
git add src/components/product/ProofFirstEmptyState.astro src/pages/en/products/index.astro src/pages/vi/products/index.astro tests/architecture/integrity-truth-contract.test.mjs tests/e2e/product-empty-state.spec.ts
git commit -m "feat(products): add proof-first publication empty state"
```

**Acceptance:** Empty public inventory communicates publication restraint without implying product nonexistence.

## Task 3 — S+3 Boundary Cards

**Files:**

- Create `src/components/integrity/BoundaryCard.astro`.
- Modify `src/data/integrity.ts`.
- Modify EN/VI Security and Privacy pages.
- Create `tests/e2e/boundary-card.spec.ts`.

**Public contract:**

```text
BoundaryCard.astro
- boundary: existing BoundaryStatement
- lang: en | vi
- visible "establishes" concept
- visible "does not establish" concept
```

**Execution steps:**

- [ ] Write failing semantic tests for both visible boundary concepts in EN and VI.
- [ ] Author only concrete source-backed boundaries.
- [ ] Do not create a boundary merely to fill a visual component slot.
- [ ] Render semantic aside/definition content with no client JS.
- [ ] Reject unsupported assurance wording.
- [ ] Verify 320px, 200% zoom, keyboard reading order, and no-JS behavior.

**Commit:**

```bash
git add src/components/integrity/BoundaryCard.astro src/data/integrity.ts src/pages/en/security.astro src/pages/vi/security.astro src/pages/en/privacy.astro src/pages/vi/privacy.astro tests/e2e/boundary-card.spec.ts
git commit -m "feat(trust): expose evidence boundaries"
```

**Acceptance:** Visitors can distinguish what a source establishes from what it does not establish.

## Task 4 — S+4 Safe Action Preflight

**Files:**

- Create `src/components/integrity/SafeAction.astro`.
- Modify eligible actions on EN/VI Security and Contact pages.
- Create `tests/e2e/safe-action.spec.ts`.

**Public contract:**

```text
SafeAction.astro
- href
- label
- boundary = external | mailto | private-reporting
- lang = en | vi
```

**Execution steps:**

- [ ] Write failing tests requiring destination context for external, mail, and private-reporting actions.
- [ ] Confirm ordinary internal links receive no extra friction.
- [ ] Implement a real anchor with visible contextual microcopy.
- [ ] Never intercept click or require a confirmation modal.
- [ ] Preserve the repository’s safe external-link rel contract.
- [ ] Verify keyboard behavior, no-JS behavior, destination correctness, and EN/VI parity.

**Commit:**

```bash
git add src/components/integrity/SafeAction.astro src/pages/en/security.astro src/pages/vi/security.astro src/pages/en/contact.astro src/pages/vi/contact.astro tests/e2e/safe-action.spec.ts
git commit -m "feat(trust): add transparent action boundaries"
```

**Wave 1 exit gate:** Truth state, empty-state restraint, evidence boundaries, and external-action boundaries are visible without adding client JS or fabricated evidence.

---

# Wave 2 — S+ Completion: Inspection, Depth, Freshness, and Bilingual Evidence

## Task 5 — S+5 SGPS Integrity Lens

**Files:**

- Modify `src/data/integrity.ts` and `src/lib/integrity.ts`.
- Create `src/components/integrity/IntegrityLens.astro`.
- Modify `src/layouts/BaseLayout.astro`.
- Modify `tests/architecture/integrity-truth-contract.test.mjs`.
- Create `tests/e2e/integrity-lens.spec.ts`.

**Public contract:**

```text
IntegrityLens.astro
- surface: stable page/surface id
- lang: en | vi
- consumes getIntegrityEntriesForSurface(surface)
- renders nothing when no entries exist
```

**Execution steps:**

- [ ] Write failing no-JS and keyboard tests for a modeled surface.
- [ ] Require unmodeled surfaces to render no hollow Lens shell.
- [ ] Populate `INTEGRITY_ENTRIES` only by referencing facts already public in routes, trust data, and the public product registry.
- [ ] Never duplicate product truth in integrity data.
- [ ] Implement V1 with semantic `<details>` and ordinary links.
- [ ] Reject raw user-facing `SHA`, `CI`, workflow-run, branch-protection, and deployment jargon as public proof labels.
- [ ] Integrate through `BaseLayout` only when the page supplies a stable modeled surface.
- [ ] Verify zero incremental JS, EN/VI parity, and no-JS operation.

**Commit:**

```bash
git add src/data/integrity.ts src/lib/integrity.ts src/components/integrity/IntegrityLens.astro src/layouts/BaseLayout.astro tests/architecture/integrity-truth-contract.test.mjs tests/e2e/integrity-lens.spec.ts
git commit -m "feat(trust): add page-level SGPS Integrity Lens"
```

## Task 6 — S+6 Executive ↔ Evidence Reading Depth

**Files:**

- Create `src/components/integrity/EvidenceDetails.astro`.
- Modify Trust Ledger, Integrity Lens, and Flagship Proof to reuse it.
- Create `tests/e2e/evidence-depth.spec.ts`.

**Public contract:**

```text
EvidenceDetails.astro
- summary
- evidence[]
- optional boundary
- optional review metadata
- lang = en | vi
```

**Execution steps:**

- [ ] Write failing progressive-disclosure tests.
- [ ] Require executive summary content to remain visible by default.
- [ ] Require evidence depth to be reachable through a native semantic control without JS.
- [ ] Implement `EvidenceDetails` once and remove parallel evidence markup from consumers.
- [ ] Ensure print output contains the evidence information needed to understand the claim.
- [ ] Verify accessible summary names, keyboard toggle, print, no-JS, and EN/VI parity.

**Commit:**

```bash
git add src/components/integrity/EvidenceDetails.astro src/components/experience/TrustLedger.astro src/components/integrity/IntegrityLens.astro src/components/sections/FlagshipProof.astro tests/e2e/evidence-depth.spec.ts
git commit -m "feat(trust): add executive-to-evidence reading depth"
```

## Task 7 — S+7 Evidence Pulse

**Files:**

- Modify `EvidenceDetails.astro`, `TruthState.astro`, and `src/data/integrity.ts`.
- Create `tests/architecture/evidence-freshness.test.mjs`.
- Create `tests/e2e/evidence-freshness.spec.ts`.

**Execution steps:**

- [ ] Write failing tests that reject `new Date()`, `Date.now()`, file mtime, Git timestamps, and build timestamps as public review-date sources.
- [ ] Render freshness only when explicit authored `ReviewMetadata` exists.
- [ ] When metadata is absent, omit the freshness row rather than inventing a date.
- [ ] If a changed state receives emphasis, use a finite existing Motion Grammar transition.
- [ ] Never add a perpetual pulse animation.
- [ ] Verify reduced motion and EN/VI output.

**Commit:**

```bash
git add src/components/integrity/EvidenceDetails.astro src/components/integrity/TruthState.astro src/data/integrity.ts tests/architecture/evidence-freshness.test.mjs tests/e2e/evidence-freshness.spec.ts
git commit -m "feat(trust): expose authored evidence freshness"
```

## Task 8 — S+8 Selective Bilingual Mirror

**Files:**

- Create `src/components/integrity/BilingualMirror.astro`.
- Modify `src/data/integrity.ts`.
- Modify EN/VI Security pages.
- Create `tests/e2e/bilingual-mirror.spec.ts`.

**Public contract:**

```text
BilingualMirror.astro
- pairs[] with stable id, authored EN text, authored VI text
- normal localized route remains primary
```

**Execution steps:**

- [ ] Write failing explicit-pair tests.
- [ ] Reject runtime translation APIs and DOM scraping.
- [ ] Implement side-by-side desktop and paired stacked mobile layout.
- [ ] Keep Mirror supplemental rather than replacing localized route content.
- [ ] Verify 320px layout, screen-reader reading order, and no duplicate-heading confusion.

**Commit:**

```bash
git add src/components/integrity/BilingualMirror.astro src/data/integrity.ts src/pages/en/security.astro src/pages/vi/security.astro tests/e2e/bilingual-mirror.spec.ts
git commit -m "feat(i18n): add selective bilingual evidence mirror"
```

**Wave 2 exit gate:** Page-level evidence is inspectable, layered, honestly dated, and bilingual without introducing a dashboard shell.

---

# Wave 3 — S+ Completion: Discovery and Change Intelligence

## Task 9 — S+9 Deterministic Provenance Search

**Files:**

- Modify `src/lib/navigator.ts` and `src/lib/integrity.ts`.
- Modify Command Navigator component and script.
- Modify `tests/architecture/integrity-truth-contract.test.mjs`.
- Create `tests/e2e/provenance-search.spec.ts`.

**Execution steps:**

- [ ] Read the live navigator builder and item types before changing them.
- [ ] Write failing evidence-query tests against the exact live interface.
- [ ] Add an evidence or provenance item kind without removing existing kinds.
- [ ] Derive provenance items from integrity data, Trust Ledger, and public products only.
- [ ] Reject LLM, vector-database, remote-search, generated-answer, and personalization dependencies.
- [ ] Reject free-text search query content from analytics telemetry.
- [ ] Add localized evidence-result type text without claiming that search verifies anything.
- [ ] Verify Vietnamese diacritic-insensitive search, focus restore, no-JS fallback navigation, and client-JS delta.

**Commit:**

```bash
git add src/lib/navigator.ts src/lib/integrity.ts src/components/experience/CommandNavigator.astro src/scripts/command-navigator.ts tests/architecture/integrity-truth-contract.test.mjs tests/e2e/provenance-search.spec.ts
git commit -m "feat(trust): extend navigator with provenance search"
```

## Task 10 — S+10 Curated Evidence Change Intelligence

**Decision file:** `docs/evidence/2026-09-12-public-change-source-decision.md`

**Runtime files only when GO:**

- `src/data/public-evidence-changes.ts`.
- `src/components/integrity/EvidenceChangeTimeline.astro`.
- `tests/architecture/public-change-contract.test.mjs`.
- `tests/e2e/evidence-change-timeline.spec.ts`.

**Execution steps:**

- [ ] Determine whether deliberately authored and approved public change metadata exists.
- [ ] Treat raw Git history, PR titles, commit dates, and deployment timestamps as invalid public change sources.
- [ ] If no source exists, write a NO-GO decision and create no runtime timeline.
- [ ] If a source exists, write schema tests that reject Git and CI derivation before implementation.
- [ ] On GO, add only explicitly approved changes with authored date, subject id, change kind, and localized summary.
- [ ] On GO, render a semantic localized timeline with links to the changed public subject.
- [ ] Commit the decision in either path; commit runtime files only on GO.

**Acceptance:** Change intelligence is evidence-backed or explicitly absent. There is no activity theater.

**Wave 3 exit gate:** All ten v2 SGPS capabilities are runtime-complete or explicitly evidence-gated NO-GO.

---

# Wave 4 — God Tier: Claim-to-Evidence Fabric

## Task 11 — G1 Claim-to-Evidence Fabric

**Files:**

- Create `src/data/claims.ts`.
- Create `src/lib/claims.ts`.
- Modify integrity data only when references are required; do not duplicate source content.
- Create `tests/architecture/claim-fabric-contract.test.mjs`.

**Target contracts:**

```text
PublicClaim
- id
- kind = brand | principle | trust | product | policy | support
- surface
- statement.en
- statement.vi
- evidenceIds[]
- optional boundaryId
- optional reviewId

ClaimGraphNode
- id
- kind = claim | evidence | boundary | surface | product

ClaimGraphEdge
- from
- to
- relation = supported-by | bounded-by | appears-on | about-product
```

**Execution steps:**

- [ ] Write failing anti-duplication tests.
- [ ] Require product claims to resolve public products through `getPublicProducts()`.
- [ ] Reject product brand assets as publication truth.
- [ ] Reject a second hard-coded route registry.
- [ ] Seed only claims that can point to existing public evidence or boundary data.
- [ ] Implement fail-closed selectors: missing evidence, product, or surface means the claim cannot become a valid public graph node.
- [ ] Test duplicate claim ids, orphan evidence ids, EN/VI statement completeness, and forbidden score fields.
- [ ] Run public-truth validation and the full architecture suite.

**Commit:**

```bash
git add src/data/claims.ts src/lib/claims.ts src/data/integrity.ts tests/architecture/claim-fabric-contract.test.mjs
git commit -m "feat(sgps): add fail-closed claim-to-evidence fabric"
```

## Task 12 — G2 Source-to-Surface Trace

**Files:**

- Create `src/components/integrity/SourceTrace.astro`.
- Modify `src/lib/claims.ts`.
- Modify `IntegrityLens.astro`.
- Create `tests/e2e/source-trace.spec.ts`.

**Target trace:**

```text
claim → source/evidence → optional boundary → public surface
```

**Execution steps:**

- [ ] Write a failing test for deterministic trace order on a modeled claim.
- [ ] Confirm optional missing nodes disappear cleanly rather than generating placeholders.
- [ ] Implement `getClaimTrace()` from the Claim Fabric.
- [ ] Render semantic ordered or definition markup.
- [ ] Keep connector lines decorative and hidden from assistive technology.
- [ ] Reject raw SHA, CI, workflow, branch, and deployment vocabulary from public trace labels.
- [ ] Verify no-JS, print, 320px, and EN/VI behavior.

**Commit:**

```bash
git add src/components/integrity/SourceTrace.astro src/lib/claims.ts src/components/integrity/IntegrityLens.astro tests/e2e/source-trace.spec.ts
git commit -m "feat(sgps): add source-to-surface evidence trace"
```

## Task 13 — G3 Evidence Passport

**Files:**

- Create `src/components/integrity/EvidencePassport.astro`.
- Create `src/pages/en/evidence/[id].astro`.
- Create `src/pages/vi/evidence/[id].astro`.
- Modify `src/lib/claims.ts`.
- Modify shared SEO helpers only when required by the existing route conventions.
- Create `tests/e2e/evidence-passport.spec.ts`.
- Extend static-link and SEO contract tests as required.

**Passport model:**

```text
EvidencePassportModel
- stable id
- localized claim
- truth state
- public evidence links[]
- optional boundary
- optional authored reviewedOn
- contextHref
```

**Execution steps:**

- [ ] Write failing static-path tests so only modeled public claim ids generate passport routes.
- [ ] Ensure unknown ids never become public pages.
- [ ] Generate locale-aware static paths from the Claim Fabric.
- [ ] Render claim, source links, boundary, optional authored review date, and “view in context” link.
- [ ] Make the passport print-friendly.
- [ ] Reject certificate, seal, attestation, and guaranteed-verification language unless a future explicit source authorizes such wording.
- [ ] Add canonical, hreflang, robots, and sitemap behavior using existing SEO conventions.
- [ ] Verify static links, print, EN/VI parity, and no-JS operation.

**Commit:**

```bash
git add src/components/integrity/EvidencePassport.astro src/pages/en/evidence/[id].astro src/pages/vi/evidence/[id].astro src/lib/claims.ts src/lib/seo.ts tests/e2e/evidence-passport.spec.ts
git commit -m "feat(sgps): add shareable evidence passports"
```

**Wave 4 exit gate:** Claims have a typed provenance graph, readable source trace, and stable public passport without scores or certificate theater.

---

# Wave 5 — God Tier: Decision Experience

## Task 14 — G4 Decision Room

**Files:**

- Create `src/components/experience/DecisionRoom.astro`.
- Create `src/scripts/decision-room.ts`.
- Create `src/lib/decision-room.ts`.
- Add safe decision hooks to selected claim, trust, and product renderers.
- Create `tests/architecture/decision-room-contract.test.mjs`.
- Create `tests/e2e/decision-room.spec.ts`.

**Decision item contract:**

```text
DecisionItem
- id
- kind = claim | trust | product
- label
- summary
- optional evidenceHref
- optional boundary
```

**Execution steps:**

- [ ] Write architecture tests rejecting localStorage, sessionStorage, cookies, fetch, XHR, sendBeacon, ranking scores, and unpublished products.
- [ ] Build allowed items from public claims, Trust Ledger, and `getPublicProducts()` only.
- [ ] Server-render a complete page and an empty comparison workspace; base content remains useful without JS.
- [ ] Implement in-memory add, remove, and reset with a bounded `Set`.
- [ ] Cap visible comparison at four items.
- [ ] Announce changes through a polite live region.
- [ ] Never calculate best, worst, recommended, trust, confidence, or maturity scores.
- [ ] Render sourced facts and boundaries side by side.
- [ ] Verify reload clears state, JS-disabled navigation remains complete, keyboard removal works, mobile stacks correctly, and budget delta is reported.

**Commit:**

```bash
git add src/components/experience/DecisionRoom.astro src/scripts/decision-room.ts src/lib/decision-room.ts src/components tests/architecture/decision-room-contract.test.mjs tests/e2e/decision-room.spec.ts
git commit -m "feat(experience): add ephemeral evidence Decision Room"
```

## Task 15 — G5 Evidence-First Mission Paths

**Files:**

- Modify `src/data/experience.ts` and `src/lib/journey.ts`.
- Modify Intent Lens and Journey Bar.
- Modify the existing Intent Lens script only if the event payload remains bounded.
- Create `tests/e2e/mission-paths.spec.ts`.

**Mission contract:**

```text
MissionId
- evaluate-product
- understand-blueskyz
- verify-trust
- work-with-us

MissionStep
- href
- label
- optional evidenceFirst flag
```

**Execution steps:**

- [ ] Write tests for all four explicit missions in EN and VI.
- [ ] Cover the homepage and at least one subpage.
- [ ] Build deterministic mission maps from live routes and public evidence surfaces only.
- [ ] Never infer a mission from identity, history, tracking, or hidden behavior.
- [ ] When intent changes, update emphasis or step order only.
- [ ] Never hide trust, legal, product, or boundary facts.
- [ ] Keep the no-selection server state complete and useful.
- [ ] Verify no persistence, no cookies, no-JS baseline, screen-reader order, and budget delta.

**Commit:**

```bash
git add src/data/experience.ts src/lib/journey.ts src/components/experience/IntentLens.astro src/components/experience/JourneyBar.astro src/scripts/intent-lens.ts tests/e2e/mission-paths.spec.ts
git commit -m "feat(experience): add evidence-first mission paths"
```

## Task 16 — G6 Atlas V2 Evidence Constellation

**Files:**

- Modify `src/lib/atlas.ts` and `src/components/experience/Atlas.astro`.
- Modify the existing truth-contract architecture test.
- Create `tests/e2e/atlas-v2-evidence.spec.ts`.

**Execution steps:**

- [ ] Read the current Atlas type names before editing.
- [ ] Add claim and evidence node relationships without removing existing brand, principle, trust, and product semantics.
- [ ] Write a zero-product test proving an empty public product registry still yields zero product nodes.
- [ ] Require claim and evidence nodes to equal only Claim Fabric entries safe for public display.
- [ ] Derive relationships from the Claim Fabric; do not duplicate claim content in `atlas.ts`.
- [ ] Keep the semantic HTML node list authoritative.
- [ ] Keep SVG decorative or secondary and correctly hidden from assistive technology.
- [ ] Re-measure mobile and desktop composition when node density changes.
- [ ] Do not add WebGL, canvas, a pan/zoom framework, or required client JS.
- [ ] Verify 320px, 390px, 1440px, no-JS, reduced motion, and EN/VI behavior.

**Commit:**

```bash
git add src/lib/atlas.ts src/components/experience/Atlas.astro tests/architecture/integrity-truth-contract.test.mjs tests/e2e/atlas-v2-evidence.spec.ts
git commit -m "feat(experience): evolve Atlas into evidence constellation"
```

**Wave 5 exit gate:** Visitors can choose an explicit mission, inspect relationships, and compare bounded public evidence without profiling or scoring.

---

# Wave 6 — God Tier: Open Verification Protocol

## Task 17 — G7 Public SGPS Manifest

**Files:**

- Create `src/lib/sgps-manifest.ts`.
- Create `src/pages/.well-known/sgps.json.ts`.
- Create `tests/architecture/sgps-manifest-contract.test.mjs`.
- Create `tests/e2e/sgps-manifest.spec.ts`.
- Extend the production smoke script after the endpoint exists.

**Manifest contract:**

```text
PublicSgpsManifest
- schemaVersion = 1.0
- generatedFrom = public-runtime-data
- claims[]
  - id
  - kind
  - urls.en
  - urls.vi
  - optional truth state
  - evidenceIds[]
```

**Execution steps:**

- [ ] Write failing privacy and source tests.
- [ ] Reject email addresses, private-reporting target values, internal repo paths, SHAs, workflow ids, branches, unpublished product names, and arbitrary free-text fields.
- [ ] Build the manifest from public claims, canonical locale helpers, safe public evidence ids, and public product selector results only.
- [ ] Return deterministic JSON with explicit schema version and JSON content type.
- [ ] Assert manifest claim ids equal public Claim Fabric ids.
- [ ] Add production smoke for HTTP 200 and schema version.
- [ ] Verify no internal or unpublished value appears in serialized output.

**Commit:**

```bash
git add src/lib/sgps-manifest.ts src/pages/.well-known/sgps.json.ts tests/architecture/sgps-manifest-contract.test.mjs tests/e2e/sgps-manifest.spec.ts scripts/smoke-production.mjs
git commit -m "feat(sgps): publish privacy-safe SGPS manifest"
```

## Task 18 — G8 Verification Deep Links

**Files:**

- Modify `src/lib/claims.ts`.
- Modify Integrity Lens, Evidence Passport, and Source Trace.
- Modify `src/styles/global.css`.
- Create `tests/e2e/verification-deep-links.spec.ts`.

**Deep-link contract:**

```text
getClaimAnchor(id) -> stable claim-* anchor
getEvidencePassportPath(lang, id) -> locale-aware public path
```

**Execution steps:**

- [ ] Write collision tests for stable slug-safe claim ids.
- [ ] Test EN/VI path generation.
- [ ] Add real ids to meaningful claim and evidence headings; do not add hidden shim targets.
- [ ] Ensure deep-linked URLs work with JavaScript disabled.
- [ ] Preserve locale and evidence context.
- [ ] Use existing sticky-header and spine spacing for scroll margin.
- [ ] Verify direct navigation reading order, focus behavior where applicable, static links, and canonical routes.

**Commit:**

```bash
git add src/lib/claims.ts src/components/integrity/IntegrityLens.astro src/components/integrity/EvidencePassport.astro src/components/integrity/SourceTrace.astro src/styles/global.css tests/e2e/verification-deep-links.spec.ts
git commit -m "feat(sgps): add stable verification deep links"
```

**Wave 6 exit gate:** Human and machine consumers can address the same public claim and evidence structure without exposing internal governance data.

---

# Wave 7 — God Tier: Fail-Closed Publication and Regression Firewall

## Task 19 — G9 Publishability Compiler

**Files:**

- Create `src/lib/publishability.ts`.
- Create `scripts/check-publishability.mjs`.
- Modify `package.json`.
- Modify product/content schema only if an existing truth field must be exposed explicitly; never loosen validation.
- Create `tests/architecture/publishability-contract.test.mjs`.
- Add bounded fixtures under `tests/fixtures/publishability/` if consistent with repository convention.
- Modify the quality workflow only after deterministic local fixture coverage passes.

**Failure categories:**

```text
MISSING_PUBLIC_TRUTH
MISSING_EVIDENCE
INVALID_LOCALE_PARITY
UNKNOWN_PRODUCT
ORPHAN_CLAIM
```

**Execution steps:**

- [ ] Write RED fixtures for each failure category.
- [ ] Prove a public product absent from the public product selector cannot be referenced by a public claim.
- [ ] Prove unknown evidence fails.
- [ ] Prove missing EN/VI statement fails.
- [ ] Prove the valid empty-registry state passes.
- [ ] Implement validation by composing existing truth, product, and claim selectors instead of copying their logic.
- [ ] Add `pnpm check:publishability` with deterministic actionable output and non-zero exit on failures.
- [ ] Prove the checker performs no network call and never mutates or repairs content.
- [ ] Run it twice from clean installs before adding it to the quality workflow.

**Commit:**

```bash
git add src/lib/publishability.ts scripts/check-publishability.mjs package.json tests/architecture/publishability-contract.test.mjs tests/fixtures/publishability .github/workflows
git commit -m "feat(sgps): add fail-closed publishability compiler"
```

## Task 20 — G10 Integrity Regression Firewall

**Files:**

- Create `scripts/check-integrity-firewall.mjs`.
- Create `tests/architecture/integrity-firewall.test.mjs`.
- Modify `package.json`.
- Modify the quality workflow after deterministic local validation.
- Preserve focused architecture and end-to-end tests.

**Required drift classes:**

- duplicate or orphan claim ids;
- unknown evidence references;
- public product claim not resolvable through `getPublicProducts()`;
- EN/VI statement or route parity drift;
- bare locale-sensitive product or trust paths from shared components;
- forbidden scoring or blanket-verification language;
- generated review dates;
- manifest ids diverging from the Claim Fabric;
- telemetry allowlists accepting query, free text, email, IP, or body values;
- public evidence links to non-public or unknown internal destinations.

**Execution steps:**

- [ ] Write RED fixtures proving all ten drift classes are detected.
- [ ] Implement `pnpm check:integrity-firewall` as a deterministic source/data validator.
- [ ] Import pure selectors where Node-safe; use source contracts only where Astro runtime imports prevent pure execution.
- [ ] Print one failure per line with category, subject, and remediation hint.
- [ ] Never auto-fix.
- [ ] Keep existing focused tests rather than consolidating them away.
- [ ] Run from a clean install twice before adding the workflow gate.
- [ ] Run the complete standard verification matrix after workflow integration.

**Commit:**

```bash
git add scripts/check-integrity-firewall.mjs tests/architecture/integrity-firewall.test.mjs package.json .github/workflows
git commit -m "feat(sgps): add cross-system integrity regression firewall"
```

**Wave 7 exit gate:** Public SGPS truth fails closed across data, runtime, manifest, i18n, telemetry, and public-product relationships.

---

# Wave 8 — Final Hardening, Human Evidence, and Promotion

## Task 21 — Full v3 Red-Team Verification

**Files:**

- Create `docs/evidence/2026-09-12-v3-final-red-team.md`.
- Modify runtime only for concrete defects found.
- Add a regression test in the closest focused suite for every runtime defect fixed.

**Required probes:**

- empty public product registry;
- one synthetic publishable-product fixture;
- missing evidence reference;
- broken EN/VI claim pair;
- malicious or invalid external URL fixture;
- Decision Room reload and no-storage behavior;
- JavaScript-disabled critical-route pass;
- 320px, 360px, 390px, 430px, 1280px, and 1440px layouts;
- 200% text zoom;
- reduced motion;
- keyboard-only Lens, Navigator, Decision Room, and Passport flow;
- print Passport and Source Trace;
- manifest privacy scan;
- free-text query telemetry non-leak;
- CSP external-script compliance;
- production legacy 301 preservation;
- no WebGL, canvas, or new UI framework dependency;
- site-wide and worst-page client-JS budget measurements.

**Execution steps:**

- [ ] Run the standard verification matrix from a clean install.
- [ ] Run focused v3 suites and the repository’s browser assurance matrix.
- [ ] Record every defect as `DETECTED → REMEDIATED` or `OPEN` with exact evidence.
- [ ] Never silently omit a failing probe.
- [ ] Re-run exact-head verification after every fix.
- [ ] Record VI owner copy review and Human E4 as OPEN unless real manual evidence exists.

## Task 22 — Human E4 Protocol Extension

**File:** `docs/evidence/2026-09-12-v3-human-e4.md`

**Real-participant tasks:**

- Explain a truth state without prompting.
- Open “Verify this page” and identify a supporting source.
- Explain “establishes” versus “does not establish.”
- Find and use an Evidence Passport.
- Compare two public items in Decision Room and explain why there is no score or recommendation.
- Switch EN/VI and retain evidence context.
- Use Provenance Search to find a security or privacy evidence destination.
- Explain whether “not published” means “does not exist.”

**Execution steps:**

- [ ] Define participant and session protocol before collecting data.
- [ ] Record observations separately from interpretation.
- [ ] Never fabricate participant data.
- [ ] If no real study occurs, keep status `NOT RUN`.
- [ ] File bounded follow-up issues from real failures.
- [ ] Do not allow automated browser evidence to promote Human E4 status.

## Task 23 — Exact-Head Promotion and Post-Merge Read-Back

**Execution steps:**

- [ ] Refresh `main` and reconcile concurrent PRs before final merge.
- [ ] Require exact-head Quality Gates, Browser Assurance, and Cloudflare evidence applicable to the PR.
- [ ] Merge only when objectively green; no unexplained red.
- [ ] After merge, run production smoke.
- [ ] Explicitly read back EN/VI homes, an Evidence Passport, `.well-known/sgps.json`, products truth behavior, Security and Privacy surfaces, and the seven legacy-root 301s.
- [ ] Record deployed commit SHA and production read-back result in a post-merge evidence ledger.

---

# Recommended PR Boundaries

- **PR A — S+ Truth Foundation:** Tasks 1–4.
- **PR B — S+ Integrity Inspection:** Tasks 5–8.
- **PR C — S+ Provenance Search:** Task 9.
- **PR D — S+ Change Intelligence:** Task 10, docs-only on NO-GO or runtime on GO.
- **PR E — Claim Fabric:** Task 11.
- **PR F — Source Trace:** Task 12.
- **PR G — Evidence Passport:** Task 13.
- **PR H — Decision Room:** Task 14.
- **PR I — Mission Paths:** Task 15.
- **PR J — Atlas V2:** Task 16.
- **PR K — Public SGPS Manifest:** Task 17.
- **PR L — Verification Deep Links:** Task 18.
- **PR M — Publishability Compiler:** Task 19.
- **PR N — Integrity Firewall:** Task 20.
- **PR O — Final red-team fixes:** Task 21 only when concrete defects require runtime changes.
- **Evidence-only records:** Tasks 22–23 as appropriate.

Do not bundle all v3 runtime work into one mega-PR.

# Dependency Graph

```text
main v2 foundation
  |
  +--> S+1 Truth Grammar -----+
  +--> S+2 Proof Empty -------+--> S+5 Integrity Lens --> S+6 Evidence Depth --> S+7 Evidence Pulse
  +--> S+3 Boundaries --------+
  +--> S+4 Safe Action -------+
                                  +--> S+8 Bilingual Mirror
                                  +--> S+9 Provenance Search
                                  +--> S+10 Change Intelligence, GO only with authored source

S+5..S+9 --> G1 Claim Fabric --> G2 Source Trace --> G3 Evidence Passport
                         |            |
                         |            +--> G8 Deep Links
                         +--> G4 Decision Room
                         +--> G5 Mission Paths
                         +--> G6 Atlas V2
                         +--> G7 Public SGPS Manifest
                         +--> G9 Publishability Compiler --> G10 Integrity Firewall

All runtime tracks --> Final Red Team --> Exact-head Promotion --> Production Read-back
```

# Promotion Gates by Capability Class

**S+1 through S+8:** no-JS required, no client JS by default, existing public routes only.

**S+9 Provenance Search:** base navigation remains no-JS; existing navigator JS may grow only within measured budget.

**S+10 Change Intelligence:** no-JS required; runtime exists only on an evidence-backed GO decision.

**G1 Claim Fabric:** data only, no client JS, no new public route.

**G2 Source Trace:** no-JS required, existing surfaces.

**G3 Evidence Passport:** no-JS required, new public routes, production read-back required.

**G4 Decision Room:** base content remains useful without JS; bounded external client module; production interaction smoke required.

**G5 Mission Paths:** no-selection content remains complete; existing Intent Lens JS only.

**G6 Atlas V2:** no required JS; existing Atlas surface.

**G7 Manifest:** no client JS; new public endpoint; production read-back required.

**G8 Deep Links:** no-JS navigation required; existing and Passport routes.

**G9 and G10:** build-time gates; no runtime client JS; exact-head CI evidence required.

# Explicit Non-Goals

Do not implement the following as part of this plan:

- authenticated customer portal;
- CMS or admin authoring UI;
- AI chatbot or generated evidence answers;
- recommendation engine;
- trust, confidence, or maturity scoring;
- user tracking or cross-session personalization;
- marketing automation provider integration;
- WebGL/3D Atlas;
- public raw Git, CI, or deployment history;
- certificate or seal generator;
- product publication from branding assets alone;
- automated Human E4 claims.

# Final Definition of Done

v3 is DONE only when all of the following are true:

1. All ten S+ completion items are `DONE` or evidence-gated `NO-GO` with a written record.
2. God-tier G1–G10 are implemented and individually tested, except any capability explicitly gated by a prerequisite that remains absent.
3. Public product and evidence behavior still fails closed.
4. EN/VI parity is green.
5. No-JS critical paths are green.
6. Keyboard, reduced-motion, 200%-zoom, and 320px checks are green.
7. Client JS remains under the unchanged hard ceiling with measured deltas.
8. Manifest, Passport, and deep-link outputs expose no internal or private data.
9. Publishability Compiler and Integrity Regression Firewall are green on exact head.
10. Existing SEO, legacy 301s, CSP, static links, analytics privacy contract, and production smoke remain green.
11. No unexplained CI or Cloudflare red exists at merge.
12. Post-merge production read-back is recorded.
13. Human E4 and VI owner review are reported PASS only when real manual evidence exists.
