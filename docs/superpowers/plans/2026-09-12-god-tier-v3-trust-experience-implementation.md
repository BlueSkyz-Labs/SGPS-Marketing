# SGPS Marketing God-Tier v3 Trust-Native Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the remaining S+ trust-native runtime capabilities and then add a God-tier evidence fabric, decision experience, public interoperability layer, and regression firewall without weakening SGPS truth discipline, static-first delivery, bilingual parity, accessibility, privacy, or performance.

**Architecture:** Preserve all merged v1/v2 systems as authoritative. Complete the ten unimplemented v2 SGPS capabilities first, then add a typed claim/evidence graph that references existing authoritative route/product/trust/integrity sources rather than duplicating them. Build user-facing verification and decision features with semantic HTML/CSS/SVG by default; use small external vanilla TypeScript modules only for bounded stateful interactions.

**Tech Stack:** Astro 7.3+, TypeScript 6, Tailwind CSS 4, vanilla browser APIs, Playwright 1.63, axe-core, Node test runner, Lighthouse CI, Cloudflare Workers Builds, Node >=24.20.0, pnpm 11.25.x.

**Spec:** `docs/superpowers/specs/2026-09-12-god-tier-v3-trust-experience-design.md`

## Reconciled Baseline

Authoring baseline: `main@e68c109212102bdb94d0132dc71ed4db31fa61b8`.

Already merged and authoritative: Motion Grammar/client budget, Horizon, Elevation Spine, One House Matrix, Trust Ledger, Journey Bar, Intent Lens, native language continuity, Command Navigator, Atlas V1, analytics taxonomy with transmission disabled, SEO/301 repair, production smoke, automated E4, bilingual shared-component hardening, and fail-closed `IntegrityEntry` primitives.

Current verified source facts used by this plan:

- `src/lib/integrity.ts` exposes `getIntegrityEntriesForSurface()` and currently fails closed because `INTEGRITY_ENTRIES` is empty.
- `src/lib/products.ts` exposes `getPublicProducts()` and remains the public-product authority.
- `src/components/experience/CommandNavigator.astro` uses `buildNavigatorIndex` plus `getPublicProducts()`.
- `src/components/experience/Atlas.astro` uses `buildAtlasModel` plus `getPublicProducts()`.
- v2 tasks for Truth-State Grammar, Proof-First Empty States, Boundary Cards, Safe Action, Integrity Lens, Executive↔Evidence, Evidence Pulse, Bilingual Mirror, Provenance Search, and curated Change Intelligence remain the canonical unimplemented S+ track.

## Global Constraints

- Refresh live `main`, open PRs, checks, deployment state, current source interfaces, and overlapping work before every wave.
- Historical SHAs are evidence anchors only; never implement against a stale SHA blindly.
- Preserve `src/lib/truth.ts` as production public-truth validation authority.
- Public product existence is derived from `getPublicProducts()` only.
- Do not create a second manually maintained route, product, or public-evidence truth registry.
- Critical content/navigation/evidence/actions work with JavaScript disabled.
- No UI framework, LLM, vector DB, remote semantic search, account system, fingerprinting, cookie personalization, or localStorage personalization.
- Analytics transmission stays disabled unless separately approved.
- WebGL/3D remains NO-GO unless a later evidence-backed decision supersedes it.
- No invented customer/product/partner/certification/testimonial/evidence/review-date/trust-score/maturity-score/guarantee content.
- Brand assets do not authorize product publication.
- Build/Git/CI timestamps are not public review timestamps.
- Truth state is never color-only.
- EN and VI remain behaviorally equivalent.
- Maintain keyboard parity, visible focus, 44px target intent, 200% text zoom, 320px no-overflow, reduced-motion equivalence, and no-JS critical paths.
- Keep `check:client-budget` hard ceiling at 120,000 B Brotli site-wide and worst-page; every JS-adding PR reports the measured delta.
- No weakening tests/checks/security headers/truth validation to get green.
- Runtime promotion is branch -> PR -> exact-head CI/Browser Assurance/Cloudflare -> merge -> post-merge read-back.

## Standard Verification Matrix

Run at the end of every runtime PR unless the PR is provably docs-only:

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

Add focused tests and production smoke when the task changes public routes, redirects, manifest output, canonical URLs, or deployed behavior.

---

# Wave 0 — Reconcile and Lock the v3 Execution Surface

## Task 0.1: Live-state reconciliation and v2 completion matrix

**Files:**
- Read: `docs/superpowers/specs/2026-09-12-god-tier-v3-trust-experience-design.md`
- Read: `docs/superpowers/plans/2026-09-12-god-tier-v3-trust-experience-implementation.md`
- Read: `docs/superpowers/plans/2026-09-11-s-plus-v2-trust-native-implementation.md`
- Read: `src/data/integrity.ts`
- Read: `src/lib/integrity.ts`
- Read: `src/lib/truth.ts`
- Read: `src/lib/products.ts`
- Read: `src/lib/navigator.ts`
- Read: `src/lib/atlas.ts`
- Read: current open PRs/checks/workflows.
- Create in active execution PR: `docs/evidence/2026-09-12-v3-live-reconciliation.md`

**Interfaces:** Produces a table with each S+/God-tier task marked `SATISFIED`, `OPEN`, `BLOCKED`, or `NO-GO`, plus exact current base SHA and overlapping PRs.

- [ ] **Step 1: Refresh `main` and record exact SHA.**

```bash
git fetch origin
git rev-parse origin/main
```

- [ ] **Step 2: Search for every v3 component/module name before creating files.**

```bash
rg -n "TruthState|ProofFirstEmptyState|BoundaryCard|SafeAction|IntegrityLens|EvidenceDetails|BilingualMirror|provenance|EvidenceChange|PublicClaim|EvidencePassport|DecisionRoom|sgps" src tests docs
```

- [ ] **Step 3: Record live authoritative interfaces rather than copying stale v2 names.** At minimum record the actual navigator builder name, Atlas builder name, product selector, integrity selectors, route/i18n helpers, analytics emitter, and smoke command.
- [ ] **Step 4: Mark a task `SATISFIED` when current runtime already meets its acceptance contract; do not implement a duplicate.**
- [ ] **Step 5: Commit the reconciliation note inside the first runtime PR.**

**Acceptance:** No v3 task starts from an unverified stale assumption.

---

# Wave 1 — S+ Completion: Truth Grammar and Safe Public Actions

## Task 1: S+1 Truth-State Visual Grammar

**Files:**
- Create: `src/components/integrity/TruthState.astro`
- Modify: `src/styles/global.css`
- Test: `tests/architecture/truth-state-contract.test.mjs`
- Test: `tests/e2e/truth-state-grammar.spec.ts`

**Interfaces:**

```astro
---
import type { TruthState } from "@/data/integrity";
interface Props {
  state: TruthState;
  lang: "en" | "vi";
}
---
```

- [ ] **Step 1: Write the failing architecture test.**

```js
assert.match(source, /source-linked/);
assert.match(source, /not-published/);
assert.doesNotMatch(source, /trustScore|maturityScore|confidence\s*[:=]/i);
assert.match(source, /aria-hidden/);
```

Also parse the localized labels and require every state to have EN and VI text.

- [ ] **Step 2: Run RED.**

```bash
node --test tests/architecture/truth-state-contract.test.mjs
```

Expected: FAIL because `TruthState.astro` does not exist.

- [ ] **Step 3: Implement a single state component.** Use one localized text map keyed by the existing `TruthState` union. Render visible text plus a decorative glyph with `aria-hidden="true"`; do not use badge words such as `verified` or `certified`.
- [ ] **Step 4: Add CSS using existing brand/motion tokens.** No continuous animation. `changed` may use a static accent; reduced motion must not alter meaning.
- [ ] **Step 5: Add Playwright coverage for EN/VI labels, accessible name, contrast/visibility, 200% zoom, and no color-only meaning.**
- [ ] **Step 6: Run focused and full verification.**
- [ ] **Step 7: Commit.**

```bash
git add src/components/integrity/TruthState.astro src/styles/global.css tests/architecture/truth-state-contract.test.mjs tests/e2e/truth-state-grammar.spec.ts
git commit -m "feat(trust): add accessible truth-state grammar"
```

## Task 2: S+2 Proof-First Empty States

**Files:**
- Create: `src/components/product/ProofFirstEmptyState.astro`
- Modify: `src/pages/en/products/index.astro`
- Modify: `src/pages/vi/products/index.astro`
- Modify: `tests/architecture/integrity-truth-contract.test.mjs`
- Test: `tests/e2e/product-empty-state.spec.ts`

**Interfaces:**

```astro
---
interface Props { lang: "en" | "vi"; }
---
```

- [ ] **Step 1: Write failing tests asserting zero public products renders an explanation of the publication rule, locale-correct internal actions, and no unpublished product names.**

```js
assert.doesNotMatch(componentSource, /brandAssets\.products|BRAND_ASSETS.*products/s);
```

- [ ] **Step 2: Run RED against architecture + e2e fixture with an empty public registry.**
- [ ] **Step 3: Implement copy that says only proof-backed public products appear here; never state that BlueSkyz has no products.**
- [ ] **Step 4: Reuse existing empty-registry CTA helpers so destinations remain locale-safe.**
- [ ] **Step 5: Verify `pnpm validate:public-truth`, EN/VI parity, no-JS, 320px.**
- [ ] **Step 6: Commit.**

```bash
git add src/components/product/ProofFirstEmptyState.astro src/pages/en/products/index.astro src/pages/vi/products/index.astro tests/architecture/integrity-truth-contract.test.mjs tests/e2e/product-empty-state.spec.ts
git commit -m "feat(products): add proof-first publication empty state"
```

## Task 3: S+3 Boundary Cards

**Files:**
- Create: `src/components/integrity/BoundaryCard.astro`
- Modify: `src/data/integrity.ts`
- Modify: `src/pages/en/security.astro`
- Modify: `src/pages/vi/security.astro`
- Modify: `src/pages/en/privacy.astro`
- Modify: `src/pages/vi/privacy.astro`
- Test: `tests/e2e/boundary-card.spec.ts`

**Interfaces:**

```astro
---
import type { BoundaryStatement } from "@/data/integrity";
interface Props { boundary: BoundaryStatement; lang: "en" | "vi"; }
---
```

- [ ] **Step 1: Add a failing e2e contract requiring two visible concepts per rendered boundary: establishes + does-not-establish, localized in EN/VI.**
- [ ] **Step 2: Author only source-backed `BoundaryStatement` objects.** Do not create a boundary merely to fill a component slot.
- [ ] **Step 3: Implement semantic `<aside>`/definition markup; no JS.**
- [ ] **Step 4: Verify no unsupported assurance wording and no overflow at 320px/200% zoom.**
- [ ] **Step 5: Commit.**

```bash
git add src/components/integrity/BoundaryCard.astro src/data/integrity.ts src/pages/en/security.astro src/pages/vi/security.astro src/pages/en/privacy.astro src/pages/vi/privacy.astro tests/e2e/boundary-card.spec.ts
git commit -m "feat(trust): expose evidence boundaries"
```

## Task 4: S+4 Safe Action Preflight

**Files:**
- Create: `src/components/integrity/SafeAction.astro`
- Modify eligible actions in: `src/pages/en/security.astro`, `src/pages/vi/security.astro`, `src/pages/en/contact.astro`, `src/pages/vi/contact.astro`
- Test: `tests/e2e/safe-action.spec.ts`

**Interfaces:**

```astro
---
interface Props {
  href: string;
  label: string;
  boundary: "external" | "mailto" | "private-reporting";
  lang: "en" | "vi";
}
---
```

- [ ] **Step 1: Write tests requiring destination context for external/mail/private-reporting actions while internal links remain frictionless.**
- [ ] **Step 2: Implement as a real `<a>` with visible contextual microcopy.** Never intercept click or require confirmation.
- [ ] **Step 3: Preserve any existing safe external-link `rel` contract.**
- [ ] **Step 4: Verify keyboard, no-JS, link destination, accessible name, EN/VI parity.**
- [ ] **Step 5: Commit.**

```bash
git add src/components/integrity/SafeAction.astro src/pages/en/security.astro src/pages/vi/security.astro src/pages/en/contact.astro src/pages/vi/contact.astro tests/e2e/safe-action.spec.ts
git commit -m "feat(trust): add transparent action boundaries"
```

**Wave 1 exit:** Truth state, empty-state restraint, claim boundaries, and action boundaries are visible without adding client JS or invented evidence.

---

# Wave 2 — S+ Completion: Inspection, Depth, Freshness, Bilingual Evidence

## Task 5: S+5 SGPS Integrity Lens

**Files:**
- Modify: `src/data/integrity.ts`
- Modify: `src/lib/integrity.ts`
- Create: `src/components/integrity/IntegrityLens.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `tests/architecture/integrity-truth-contract.test.mjs`
- Test: `tests/e2e/integrity-lens.spec.ts`

**Interfaces:**

```astro
---
interface Props { surface: string; lang: "en" | "vi"; }
---
```

Consumes `getIntegrityEntriesForSurface(surface)`.

- [ ] **Step 1: Write failing tests: modeled surfaces expose a localized Verify control; unmodeled surfaces render no empty shell.**
- [ ] **Step 2: Populate `INTEGRITY_ENTRIES` only with references to facts already public in trust/routes/product registry.** No product registry duplication.
- [ ] **Step 3: Implement V1 with semantic `<details>` and ordinary links.**
- [ ] **Step 4: Add a source-contract test rejecting user-facing raw `SHA`, `CI`, `workflow run`, `branch protection`, or `Cloudflare build` jargon as proof labels.**
- [ ] **Step 5: Integrate from `BaseLayout` using a stable surface id supplied by the page/layout contract.**
- [ ] **Step 6: Verify zero incremental JS and commit.**

```bash
git add src/data/integrity.ts src/lib/integrity.ts src/components/integrity/IntegrityLens.astro src/layouts/BaseLayout.astro tests/architecture/integrity-truth-contract.test.mjs tests/e2e/integrity-lens.spec.ts
git commit -m "feat(trust): add page-level SGPS Integrity Lens"
```

## Task 6: S+6 Executive ↔ Evidence Reading Depth

**Files:**
- Create: `src/components/integrity/EvidenceDetails.astro`
- Modify: `src/components/experience/TrustLedger.astro`
- Modify: `src/components/integrity/IntegrityLens.astro`
- Modify: `src/components/sections/FlagshipProof.astro`
- Test: `tests/e2e/evidence-depth.spec.ts`

**Interfaces:**

```astro
---
import type { BoundaryStatement, EvidenceReference, ReviewMetadata } from "@/data/integrity";
interface Props {
  summary: string;
  evidence: readonly EvidenceReference[];
  boundary?: BoundaryStatement;
  review?: ReviewMetadata;
  lang: "en" | "vi";
}
---
```

- [ ] **Step 1: Write failing progressive-disclosure tests: summary visible by default; evidence reachable with a native control; no JS required.**
- [ ] **Step 2: Implement `EvidenceDetails` once and refactor Ledger/Lens/FlagshipProof to reuse it.**
- [ ] **Step 3: Ensure print CSS reveals evidence content or otherwise produces a complete printable representation.**
- [ ] **Step 4: Verify accessible `<summary>` names, keyboard toggle, print/no-JS, EN/VI.**
- [ ] **Step 5: Commit.**

```bash
git add src/components/integrity/EvidenceDetails.astro src/components/experience/TrustLedger.astro src/components/integrity/IntegrityLens.astro src/components/sections/FlagshipProof.astro tests/e2e/evidence-depth.spec.ts
git commit -m "feat(trust): add executive-to-evidence reading depth"
```

## Task 7: S+7 Evidence Pulse

**Files:**
- Modify: `src/components/integrity/EvidenceDetails.astro`
- Modify: `src/components/integrity/TruthState.astro`
- Modify: `src/data/integrity.ts`
- Test: `tests/architecture/evidence-freshness.test.mjs`
- Test: `tests/e2e/evidence-freshness.spec.ts`

- [ ] **Step 1: Write anti-generated-date tests.**

```js
for (const forbidden of [/new Date\s*\(/, /Date\.now\s*\(/, /mtime/i, /build.*time/i]) {
  assert.doesNotMatch(integritySource, forbidden);
}
```

- [ ] **Step 2: Render review/freshness only when explicit `ReviewMetadata` exists.** No metadata means no fake date row.
- [ ] **Step 3: If `changed` receives transient emphasis, use existing Motion Grammar and a single finite transition; never infinite pulse animation.**
- [ ] **Step 4: Verify reduced motion and commit.**

```bash
git add src/components/integrity/EvidenceDetails.astro src/components/integrity/TruthState.astro src/data/integrity.ts tests/architecture/evidence-freshness.test.mjs tests/e2e/evidence-freshness.spec.ts
git commit -m "feat(trust): expose authored evidence freshness"
```

## Task 8: S+8 Selective Bilingual Mirror

**Files:**
- Create: `src/components/integrity/BilingualMirror.astro`
- Modify: `src/data/integrity.ts`
- Modify: `src/pages/en/security.astro`
- Modify: `src/pages/vi/security.astro`
- Test: `tests/e2e/bilingual-mirror.spec.ts`

**Interfaces:**

```astro
---
interface Props { pairs: readonly { id: string; en: string; vi: string }[]; }
---
```

- [ ] **Step 1: Write tests requiring stable authored pairs and rejecting runtime translation APIs/DOM scraping.**
- [ ] **Step 2: Implement side-by-side desktop and stacked paired mobile representation with language labels.**
- [ ] **Step 3: Keep the current localized route as primary content; Mirror is supplemental and selectively rendered.**
- [ ] **Step 4: Verify 320px, screen-reader reading order, and no duplicate heading confusion.**
- [ ] **Step 5: Commit.**

```bash
git add src/components/integrity/BilingualMirror.astro src/data/integrity.ts src/pages/en/security.astro src/pages/vi/security.astro tests/e2e/bilingual-mirror.spec.ts
git commit -m "feat(i18n): add selective bilingual evidence mirror"
```

**Wave 2 exit:** Page-level evidence is inspectable, layered, honestly dated, and bilingual without a dashboard shell.

---

# Wave 3 — S+ Completion: Discovery and Change Intelligence

## Task 9: S+9 Deterministic Provenance Search

**Files:**
- Modify: `src/lib/navigator.ts`
- Modify: `src/lib/integrity.ts`
- Modify: `src/components/experience/CommandNavigator.astro`
- Modify: `src/scripts/command-navigator.ts`
- Modify: `tests/architecture/integrity-truth-contract.test.mjs`
- Test: `tests/e2e/provenance-search.spec.ts`

**Interfaces:** Extend the current live navigator types rather than replacing them. The final item-kind union must include an evidence/provenance kind while preserving all currently supported kinds.

Example target shape:

```ts
export interface ProvenanceNavigatorItem {
  id: string;
  kind: "evidence";
  href: string;
  label: string;
  aliases: readonly string[];
}
```

- [ ] **Step 1: Read current `buildNavigatorIndex` signature and write failing tests against that exact interface.**
- [ ] **Step 2: Add evidence items derived from `INTEGRITY_ENTRIES`/Trust Ledger/public products only.**
- [ ] **Step 3: Add architecture rejection for LLM/vector/remote-search dependencies and for free-text query telemetry.**
- [ ] **Step 4: Add localized result-type text without saying the search itself verifies a claim.**
- [ ] **Step 5: Verify diacritic-insensitive VI search, focus restore, no-JS navigation fallback, budget delta.**
- [ ] **Step 6: Commit.**

```bash
git add src/lib/navigator.ts src/lib/integrity.ts src/components/experience/CommandNavigator.astro src/scripts/command-navigator.ts tests/architecture/integrity-truth-contract.test.mjs tests/e2e/provenance-search.spec.ts
git commit -m "feat(trust): extend navigator with provenance search"
```

## Task 10: S+10 Curated Evidence Change Intelligence

**Files when GO:**
- Create: `src/data/public-evidence-changes.ts`
- Create: `src/components/integrity/EvidenceChangeTimeline.astro`
- Test: `tests/architecture/public-change-contract.test.mjs`
- Test: `tests/e2e/evidence-change-timeline.spec.ts`
- Evidence decision: `docs/evidence/2026-09-12-public-change-source-decision.md`

**Interfaces when GO:**

```ts
export interface PublicEvidenceChange {
  id: string;
  date: string;
  kind: "added" | "updated" | "superseded" | "status-changed";
  subjectId: string;
  summary: { en: string; vi: string };
}
```

- [ ] **Step 1: Determine whether deliberately authored/approved public change metadata exists.** Raw Git history, PR titles, deployment timestamps, and commit dates are explicitly invalid sources.
- [ ] **Step 2A — NO-GO path:** write the decision document stating the missing source and create no runtime timeline/data module.
- [ ] **Step 2B — GO path:** write schema/source tests rejecting Git/CI derivation, then add only explicitly approved events.
- [ ] **Step 3 on GO: Render semantic localized timeline with deep links to the changed public subject.**
- [ ] **Step 4: Commit the decision in either path; runtime files only on GO.**

**Acceptance:** Change intelligence is evidence-backed or explicitly absent; there is no “activity theater.”

**Wave 3 exit:** All ten v2 SGPS capabilities are either runtime-complete or explicitly evidence-gated NO-GO.

---

# Wave 4 — God Tier: Claim-to-Evidence Fabric

## Task 11: G1 Claim-to-Evidence Fabric

**Files:**
- Create: `src/data/claims.ts`
- Create: `src/lib/claims.ts`
- Modify: `src/data/integrity.ts` only for references required by the claim model; do not duplicate content.
- Test: `tests/architecture/claim-fabric-contract.test.mjs`
- Test: `tests/unit/claims.test.mjs` if repository unit-test convention permits; otherwise place pure-selector coverage in architecture tests.

**Interfaces:**

```ts
export type PublicClaimKind = "brand" | "principle" | "trust" | "product" | "policy" | "support";

export interface PublicClaim {
  id: string;
  kind: PublicClaimKind;
  surface: string;
  statement: { en: string; vi: string };
  evidenceIds: readonly string[];
  boundaryId?: string;
  reviewId?: string;
}

export interface ClaimGraphNode {
  id: string;
  kind: "claim" | "evidence" | "boundary" | "surface" | "product";
}

export interface ClaimGraphEdge {
  from: string;
  to: string;
  relation: "supported-by" | "bounded-by" | "appears-on" | "about-product";
}

export function getPublicClaims(): readonly PublicClaim[];
export async function buildClaimGraph(lang: "en" | "vi"): Promise<{
  nodes: readonly ClaimGraphNode[];
  edges: readonly ClaimGraphEdge[];
}>;
```

- [ ] **Step 1: Write failing anti-duplication tests.** Require product claims to resolve products through `getPublicProducts()`; reject imports from brand assets as publication truth; reject hard-coded duplicate public route arrays.
- [ ] **Step 2: Seed only claims that can point to existing public evidence/boundary data.** It is valid for the initial list to be small.
- [ ] **Step 3: Implement selectors that fail closed when referenced evidence/product/surface is missing.** Never fabricate fallback evidence.
- [ ] **Step 4: Add graph integrity tests: no orphan evidence IDs, no duplicate claim IDs, every claim has EN+VI statement, no unsupported state/score fields.**
- [ ] **Step 5: Run public-truth validation and full architecture suite.**
- [ ] **Step 6: Commit.**

```bash
git add src/data/claims.ts src/lib/claims.ts src/data/integrity.ts tests/architecture/claim-fabric-contract.test.mjs
git commit -m "feat(sgps): add fail-closed claim-to-evidence fabric"
```

## Task 12: G2 Source-to-Surface Trace

**Files:**
- Create: `src/components/integrity/SourceTrace.astro`
- Modify: `src/lib/claims.ts`
- Modify: `src/components/integrity/IntegrityLens.astro`
- Test: `tests/e2e/source-trace.spec.ts`

**Interfaces:**

```astro
---
interface Props { claimId: string; lang: "en" | "vi"; }
---
```

- [ ] **Step 1: Write failing tests asserting trace order `claim -> source/evidence -> boundary -> surface` for a modeled claim, while absent optional nodes simply disappear.**
- [ ] **Step 2: Implement a selector returning a deterministic trace from the Claim Fabric.**

```ts
export function getClaimTrace(claimId: string, lang: "en" | "vi"): readonly {
  kind: "claim" | "evidence" | "boundary" | "surface";
  label: string;
  href?: string;
}[];
```

- [ ] **Step 3: Render semantic ordered list/definition structure.** Decorative connector lines must be `aria-hidden` and CSS/SVG-only.
- [ ] **Step 4: Add a test rejecting raw SHA/CI/workflow/branch/deployment vocabulary in public trace labels.**
- [ ] **Step 5: Verify no-JS, print, 320px, EN/VI; commit.**

```bash
git add src/components/integrity/SourceTrace.astro src/lib/claims.ts src/components/integrity/IntegrityLens.astro tests/e2e/source-trace.spec.ts
git commit -m "feat(sgps): add source-to-surface evidence trace"
```

## Task 13: G3 Evidence Passport

**Files:**
- Create: `src/components/integrity/EvidencePassport.astro`
- Create: `src/pages/en/evidence/[id].astro`
- Create: `src/pages/vi/evidence/[id].astro`
- Modify: `src/lib/claims.ts`
- Modify: `src/lib/seo.ts` only if required for canonical metadata.
- Test: `tests/e2e/evidence-passport.spec.ts`
- Modify static-link/SEO contract tests as required.

**Interfaces:**

```ts
export interface EvidencePassportModel {
  id: string;
  claim: string;
  state: string;
  evidence: readonly { label: string; href: string }[];
  boundary?: { claim: string; doesNotImply: string };
  reviewedOn?: string;
  contextHref: string;
}

export function getEvidencePassport(id: string, lang: "en" | "vi"): EvidencePassportModel | undefined;
```

- [ ] **Step 1: Write failing static-path tests: only modeled public claim IDs generate passport pages; unknown IDs do not become public pages.**
- [ ] **Step 2: Implement locale-aware static paths from `getPublicClaims()`.**
- [ ] **Step 3: Render a print-friendly passport with claim, source links, boundary, optional authored review date, and “view in context” link.**
- [ ] **Step 4: Explicitly reject certification/seal language in component tests.**
- [ ] **Step 5: Add canonical/hreflang/robots/sitemap behavior using existing SEO conventions.**
- [ ] **Step 6: Verify static links, print layout, EN/VI parity, no-JS; commit.**

```bash
git add src/components/integrity/EvidencePassport.astro src/pages/en/evidence/[id].astro src/pages/vi/evidence/[id].astro src/lib/claims.ts src/lib/seo.ts tests/e2e/evidence-passport.spec.ts
git commit -m "feat(sgps): add shareable evidence passports"
```

**Wave 4 exit:** Claims have a typed provenance graph, readable source trace, and stable public passport without creating scores/certificates.

---

# Wave 5 — God Tier: Decision Experience

## Task 14: G4 Decision Room

**Files:**
- Create: `src/components/experience/DecisionRoom.astro`
- Create: `src/scripts/decision-room.ts`
- Create: `src/lib/decision-room.ts`
- Modify: selected claim/trust/product renderers to expose safe `data-decision-id` hooks.
- Test: `tests/architecture/decision-room-contract.test.mjs`
- Test: `tests/e2e/decision-room.spec.ts`

**Interfaces:**

```ts
export type DecisionItemKind = "claim" | "trust" | "product";
export interface DecisionItem {
  id: string;
  kind: DecisionItemKind;
  label: string;
  summary: string;
  evidenceHref?: string;
  boundary?: string;
}
export async function getDecisionItems(lang: "en" | "vi"): Promise<readonly DecisionItem[]>;
```

- [ ] **Step 1: Write architecture tests rejecting `localStorage`, `sessionStorage`, cookies, fetch/XHR/sendBeacon, ranking scores, and unpublished products in the Decision Room module.**
- [ ] **Step 2: Build allowed items from public claims + Trust Ledger + `getPublicProducts()` only.**
- [ ] **Step 3: Server-render an empty workspace plus available add-controls as progressive enhancement. Base pages remain complete when JS is off.**
- [ ] **Step 4: Implement an in-memory `Set<string>` with add/remove/reset; cap visible comparison at 4 items and announce state changes with a polite live region.**
- [ ] **Step 5: Never calculate best/worst/recommended scores.** Render sourced facts/boundaries side by side.
- [ ] **Step 6: Verify reload clears state, navigation remains usable when JS is disabled, keyboard removal/focus, 320px stacked layout, budget delta.**
- [ ] **Step 7: Commit.**

```bash
git add src/components/experience/DecisionRoom.astro src/scripts/decision-room.ts src/lib/decision-room.ts src/components tests/architecture/decision-room-contract.test.mjs tests/e2e/decision-room.spec.ts
git commit -m "feat(experience): add ephemeral evidence Decision Room"
```

## Task 15: G5 Evidence-First Mission Paths

**Files:**
- Modify: `src/data/experience.ts`
- Modify: `src/lib/journey.ts`
- Modify: `src/components/experience/IntentLens.astro`
- Modify: `src/components/experience/JourneyBar.astro`
- Modify: `src/scripts/intent-lens.ts` only if the existing event payload remains bounded.
- Test: `tests/e2e/mission-paths.spec.ts`

**Interfaces:**

```ts
export type MissionId = "evaluate-product" | "understand-blueskyz" | "verify-trust" | "work-with-us";
export interface MissionStep { href: string; label: string; evidenceFirst?: boolean; }
export function getMissionSteps(mission: MissionId, pathname: string, lang: "en" | "vi"): readonly MissionStep[];
```

- [ ] **Step 1: Write tests for all four explicit missions on EN/VI home and at least one subpage.**
- [ ] **Step 2: Build deterministic maps from live routes/evidence surfaces only; no user inference.**
- [ ] **Step 3: When Intent Lens changes mission, update emphasis/step ordering only. Never hide facts or legal/trust content.**
- [ ] **Step 4: Keep no-selection server state complete and useful.**
- [ ] **Step 5: Verify no persistence/cookies, no-JS baseline, screen-reader order, budget delta; commit.**

```bash
git add src/data/experience.ts src/lib/journey.ts src/components/experience/IntentLens.astro src/components/experience/JourneyBar.astro src/scripts/intent-lens.ts tests/e2e/mission-paths.spec.ts
git commit -m "feat(experience): add evidence-first mission paths"
```

## Task 16: G6 Atlas V2 Evidence Constellation

**Files:**
- Modify: `src/lib/atlas.ts`
- Modify: `src/components/experience/Atlas.astro`
- Modify: `tests/architecture/integrity-truth-contract.test.mjs`
- Test: `tests/e2e/atlas-v2-evidence.spec.ts`

**Interfaces:** Extend current live Atlas types after reading them. Target node kinds add `claim` and `evidence` without removing existing `brand|principle|trust|product`.

- [ ] **Step 1: Write failing model tests: zero public products still means zero product nodes; claim/evidence nodes equal only graph entries safe for public display.**
- [ ] **Step 2: Build evidence relationships from `buildClaimGraph()`; never duplicate claim data inside `atlas.ts`.**
- [ ] **Step 3: Keep semantic HTML node list authoritative. SVG remains decorative/secondary and hidden appropriately from AT.**
- [ ] **Step 4: Preserve mobile portrait/desktop landscape composition or re-measure if node density makes the existing geometry invalid.**
- [ ] **Step 5: Do not add WebGL, canvas, pan/zoom framework, or required JS.**
- [ ] **Step 6: Verify visual density at 320/390/1440px, no-JS, reduced motion, EN/VI; commit.**

```bash
git add src/lib/atlas.ts src/components/experience/Atlas.astro tests/architecture/integrity-truth-contract.test.mjs tests/e2e/atlas-v2-evidence.spec.ts
git commit -m "feat(experience): evolve Atlas into evidence constellation"
```

**Wave 5 exit:** Visitors can choose an explicit mission, inspect relationships, and compare bounded public evidence without profiling or scoring.

---

# Wave 6 — God Tier: Open Verification Protocol

## Task 17: G7 Public SGPS Manifest

**Files:**
- Create: `src/lib/sgps-manifest.ts`
- Create: `src/pages/.well-known/sgps.json.ts`
- Test: `tests/architecture/sgps-manifest-contract.test.mjs`
- Test: `tests/e2e/sgps-manifest.spec.ts`
- Modify: production smoke script to include the manifest endpoint after it exists.

**Interfaces:**

```ts
export interface PublicSgpsManifest {
  schemaVersion: "1.0";
  generatedFrom: "public-runtime-data";
  claims: readonly {
    id: string;
    kind: PublicClaimKind;
    urls: { en: string; vi: string };
    state?: string;
    evidenceIds: readonly string[];
  }[];
}
export async function buildPublicSgpsManifest(): Promise<PublicSgpsManifest>;
```

- [ ] **Step 1: Write failing privacy/source tests rejecting email addresses, private-reporting target values, internal repo paths, SHAs, workflow IDs, branches, unpublished product names, and arbitrary free text fields.**
- [ ] **Step 2: Build manifest only from public claims, localized canonical route helpers, safe public evidence IDs, and public product selector results.**
- [ ] **Step 3: Return deterministic JSON with stable key/schema semantics and `Content-Type: application/json; charset=utf-8`.**
- [ ] **Step 4: Add production smoke assertion for 200 + valid schemaVersion.**
- [ ] **Step 5: Verify runtime manifest IDs equal public claim graph IDs; commit.**

```bash
git add src/lib/sgps-manifest.ts src/pages/.well-known/sgps.json.ts tests/architecture/sgps-manifest-contract.test.mjs tests/e2e/sgps-manifest.spec.ts scripts/smoke-production.mjs
git commit -m "feat(sgps): publish privacy-safe SGPS manifest"
```

## Task 18: G8 Verification Deep Links

**Files:**
- Modify: `src/lib/claims.ts`
- Modify: `src/components/integrity/IntegrityLens.astro`
- Modify: `src/components/integrity/EvidencePassport.astro`
- Modify: `src/components/integrity/SourceTrace.astro`
- Modify: `src/styles/global.css`
- Test: `tests/e2e/verification-deep-links.spec.ts`

**Interfaces:**

```ts
export function getClaimAnchor(id: string): `claim-${string}`;
export function getEvidencePassportPath(lang: "en" | "vi", id: string): string;
```

- [ ] **Step 1: Write collision tests for stable slug-safe IDs and EN/VI path generation.**
- [ ] **Step 2: Add real `id` anchors to claim/evidence disclosure headings, not hidden shim elements.**
- [ ] **Step 3: Ensure copied/deep-linked URLs work with JS disabled and preserve locale.**
- [ ] **Step 4: Add `scroll-margin-top` using existing sticky-header/spine spacing.**
- [ ] **Step 5: Verify focus/read order after direct navigation and commit.**

```bash
git add src/lib/claims.ts src/components/integrity/IntegrityLens.astro src/components/integrity/EvidencePassport.astro src/components/integrity/SourceTrace.astro src/styles/global.css tests/e2e/verification-deep-links.spec.ts
git commit -m "feat(sgps): add stable verification deep links"
```

**Wave 6 exit:** Human and machine consumers can address the same public claim/evidence structure without exposing internal governance data.

---

# Wave 7 — God Tier: Fail-Closed Publication and Regression Firewall

## Task 19: G9 Publishability Compiler

**Files:**
- Create: `src/lib/publishability.ts`
- Create: `scripts/check-publishability.mjs`
- Modify: `package.json`
- Modify: product/content schema only if required to expose existing required truth fields explicitly; do not loosen it.
- Test: `tests/architecture/publishability-contract.test.mjs`
- Add fixture tests under `tests/fixtures/publishability/` if repository convention permits.

**Interfaces:**

```ts
export interface PublishabilityFailure {
  code: "MISSING_PUBLIC_TRUTH" | "MISSING_EVIDENCE" | "INVALID_LOCALE_PARITY" | "UNKNOWN_PRODUCT" | "ORPHAN_CLAIM";
  subjectId: string;
  message: string;
}
export async function validatePublishability(): Promise<readonly PublishabilityFailure[]>;
```

- [ ] **Step 1: Write fixture-based RED tests:** a public product absent from `getPublicProducts()` cannot be referenced by a public claim; a claim with unknown evidence fails; missing EN/VI statement fails; valid empty registry passes.
- [ ] **Step 2: Implement validation by composing existing truth/product/claim selectors, not by copying their validation logic wholesale.**
- [ ] **Step 3: Add `pnpm check:publishability` that prints deterministic actionable failures and exits non-zero when any exist.**
- [ ] **Step 4: Add the command to the appropriate quality workflow only after local fixture coverage proves deterministic behavior.**
- [ ] **Step 5: Verify it does not mutate/fix content and does not call the network.**
- [ ] **Step 6: Commit.**

```bash
git add src/lib/publishability.ts scripts/check-publishability.mjs package.json tests/architecture/publishability-contract.test.mjs tests/fixtures/publishability .github/workflows
git commit -m "feat(sgps): add fail-closed publishability compiler"
```

## Task 20: G10 Integrity Regression Firewall

**Files:**
- Create: `scripts/check-integrity-firewall.mjs`
- Create: `tests/architecture/integrity-firewall.test.mjs`
- Modify: `package.json`
- Modify: quality workflow after deterministic local validation.
- Read/compose existing architecture tests; do not delete focused guards.

**Required checks:**

1. duplicate/orphan claim IDs;
2. unknown evidence references;
3. public product claim not resolvable via `getPublicProducts()`;
4. EN/VI statement/path parity drift;
5. bare locale-sensitive `/products/` or trust links from shared components;
6. forbidden scoring/blanket-verification language in SGPS data/components;
7. generated review dates;
8. manifest IDs diverging from claim graph;
9. telemetry allowlists accepting query/free-text/email/IP/body values;
10. public evidence links to non-public/unknown internal destinations.

- [ ] **Step 1: Write RED fixtures proving each of the ten drift classes is caught.**
- [ ] **Step 2: Implement `pnpm check:integrity-firewall` as a deterministic local source/data validator.** Prefer importing pure selectors where Node-safe; use source contracts only where Astro runtime imports make pure execution impractical.
- [ ] **Step 3: Print one line per failure with category + subject + remediation hint; never auto-fix.**
- [ ] **Step 4: Keep existing focused architecture/e2e tests.** The firewall supplements them; it is not permission to consolidate away precise tests.
- [ ] **Step 5: Add workflow gate after local fixtures pass twice from clean installs.**
- [ ] **Step 6: Run the full standard verification matrix plus clean-build rerun.**
- [ ] **Step 7: Commit.**

```bash
git add scripts/check-integrity-firewall.mjs tests/architecture/integrity-firewall.test.mjs package.json .github/workflows
git commit -m "feat(sgps): add cross-system integrity regression firewall"
```

**Wave 7 exit:** SGPS public truth becomes fail-closed across data, runtime, manifest, i18n, telemetry, and public-product relationships.

---

# Wave 8 — Final Hardening, Human Evidence, and Promotion

## Task 21: Full red-team verification of the complete v3 stack

**Files:**
- Create: `docs/evidence/2026-09-12-v3-final-red-team.md`
- Modify runtime only for concrete defects found; every fix receives a regression test in the closest focused suite.

**Red-team probes:**

- empty public product registry;
- one synthetic publishable product fixture;
- missing evidence reference;
- broken EN/VI claim pair;
- malicious/invalid external URL fixture;
- Decision Room reload/no-storage check;
- JS-disabled full critical-route pass;
- 320/360/390/430/1280/1440px layout checks;
- 200% text zoom;
- reduced motion;
- keyboard-only Lens/Navigator/Decision Room/Passport flow;
- print Passport/Source Trace;
- manifest privacy scan;
- free-text query telemetry non-leak;
- CSP external-script compliance;
- production legacy 301s preserved;
- no WebGL/canvas/new framework dependency;
- client budget measured site-wide + worst page.

- [ ] **Step 1: Run standard verification from a clean install.**
- [ ] **Step 2: Run focused v3 suites and existing five-project/browser assurance matrix used by the repo.**
- [ ] **Step 3: Record every defect as `DETECTED -> REMEDIATED` or `OPEN` with exact evidence; never silently omit a failing probe.**
- [ ] **Step 4: Re-run after every fix on exact final head.**
- [ ] **Step 5: Record residual manual gates, including VI owner copy review and Human E4, as OPEN unless real evidence exists.**

## Task 22: Human E4 protocol extension

**Files:**
- Create or extend: `docs/evidence/2026-09-12-v3-human-e4.md`

**Tasks for real participants:**

1. Explain what a truth state means without prompting.
2. Open “Verify this page” and identify a supporting source.
3. Explain “establishes” vs “does not establish.”
4. Find and use a stable Evidence Passport.
5. Compare two public items in Decision Room and explain why there is no score/recommendation.
6. Switch EN/VI and retain evidence context.
7. Use Provenance Search to find a security/privacy evidence destination.
8. Explain whether “not published” means “does not exist.”

- [ ] **Step 1: Define participant/session protocol before collection.**
- [ ] **Step 2: Never fabricate participant observations.** If no study occurs, status remains `NOT RUN`.
- [ ] **Step 3: Separate observation from interpretation and file bounded follow-up issues for real failures.**

## Task 23: Exact-head promotion and post-merge read-back

- [ ] **Step 1: Refresh base and reconcile any concurrent PR before final merge.**
- [ ] **Step 2: Require exact-head quality checks, Browser Assurance, and Cloudflare preview/deployment evidence applicable to the PR.**
- [ ] **Step 3: Merge only when objectively green; no unexplained red.**
- [ ] **Step 4: After merge, run production smoke plus explicit reads for:** EN/VI homes, evidence passport sample, `.well-known/sgps.json`, products empty/present truth path, security/privacy surfaces, and seven legacy root 301s.
- [ ] **Step 5: Record deployed commit SHA and read-back result in a post-merge evidence ledger.**

---

# Recommended PR Boundaries

Use bounded PRs so reviewers can reject one capability without blocking unrelated work:

1. **PR A — S+ Truth Foundation:** Tasks 1–4.
2. **PR B — S+ Integrity Inspection:** Tasks 5–8.
3. **PR C — S+ Provenance Search:** Task 9.
4. **PR D — S+ Change Intelligence:** Task 10, docs-only NO-GO or runtime GO.
5. **PR E — Claim Fabric:** Task 11.
6. **PR F — Source Trace:** Task 12.
7. **PR G — Evidence Passport:** Task 13.
8. **PR H — Decision Room:** Task 14.
9. **PR I — Mission Paths:** Task 15.
10. **PR J — Atlas V2:** Task 16.
11. **PR K — Public SGPS Manifest:** Task 17.
12. **PR L — Verification Deep Links:** Task 18.
13. **PR M — Publishability Compiler:** Task 19.
14. **PR N — Integrity Firewall:** Task 20.
15. **PR O — Final red-team/evidence fixes:** Task 21 only if runtime defects require changes.
16. **Evidence-only records:** Tasks 22–23 as appropriate.

Do not bundle all v3 runtime work into one mega-PR.

# Dependency Graph

```text
main v2 merged foundation
  |
  +--> S+1 Truth Grammar -----+
  +--> S+2 Proof Empty -------+--> S+5 Integrity Lens --> S+6 Evidence Depth --> S+7 Evidence Pulse
  +--> S+3 Boundaries --------+
  +--> S+4 Safe Action -------+
                                  +--> S+8 Bilingual Mirror
                                  +--> S+9 Provenance Search
                                  +--> S+10 Change Intelligence (GO only with authored source)

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

| Capability | No-JS required | Adds client JS | Public route/API | Production read-back |
| --- | --- | --- | --- | --- |
| S+1–S+8 | Yes | No by default | Existing routes | If route output changes materially |
| S+9 Provenance | Base nav yes | Yes, extends existing navigator | No new route | Browser + smoke as applicable |
| S+10 Change | Yes | No | Maybe existing route/section | On GO |
| G1 Claim Fabric | N/A data | No | No | No |
| G2 Source Trace | Yes | No | Existing surfaces | If public rendering changes |
| G3 Passport | Yes | No | Yes | Yes |
| G4 Decision Room | Base content yes | Yes | Existing route/component | Browser + production smoke |
| G5 Mission Paths | Base content yes | Existing JS modified | Existing routes | Browser + production smoke |
| G6 Atlas V2 | Yes | No required | Existing surface | Visual/read-back |
| G7 Manifest | N/A | No | Yes | Yes |
| G8 Deep Links | Yes | Optional copy feedback only | Existing/passport routes | Yes |
| G9/G10 Gates | Build-time | No runtime | No | CI evidence |

# Explicit Non-Goals

Do not implement any of the following as part of this plan:

- authenticated customer portal;
- CMS/admin authoring UI;
- AI chatbot or generated evidence answers;
- recommendation engine;
- trust/confidence/maturity scoring;
- user tracking or cross-session personalization;
- marketing automation provider integration;
- WebGL/3D Atlas;
- public raw Git/CI/deployment history;
- certificate/seal generator;
- product publication from branding assets alone;
- automated Human E4 claims.

# Final Definition of Done

v3 is DONE only when:

1. all ten S+ completion items are `DONE` or evidence-gated `NO-GO` with a written record;
2. God-tier G1–G10 are implemented and individually tested, except any capability explicitly gated by a prerequisite that remains absent;
3. public product/evidence behavior still fails closed;
4. EN/VI parity is green;
5. no-JS critical path is green;
6. keyboard/reduced-motion/200%-zoom/320px checks are green;
7. client JS remains under the unchanged hard ceiling with measured deltas;
8. manifest/passport/deep-link outputs expose no internal/private data;
9. publishability compiler and integrity firewall are green on exact head;
10. existing SEO, legacy 301s, CSP, static links, analytics privacy contract, and production smoke remain green;
11. no unexplained CI/Cloudflare red exists at merge;
12. post-merge production read-back is recorded;
13. Human E4 and VI owner review are reported truthfully as PASS only when real manual evidence exists.
