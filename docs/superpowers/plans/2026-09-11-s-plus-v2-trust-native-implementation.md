# SGPS Marketing S+ v2 Trust-Native Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the canonical S+ v2 BlueSkyz experience by preserving the already-merged S+ foundation and adding SGPS-native integrity UX without weakening static-first architecture, bilingual parity, accessibility, performance, public truth, or exact-head promotion.

**Architecture:** Keep Astro static rendering authoritative. Reuse merged #104 motion/performance contracts and merged #105 Horizon. Add small isolated browser modules only where they improve orientation, verification, or continuity. Reuse `src/lib/truth.ts`, centralize user-facing integrity facts in typed data, derive public products from `getPublicProducts()`, and default to semantic HTML/CSS/SVG.

**Tech Stack:** Astro 7.3+, TypeScript 6, Tailwind CSS 4, vanilla browser APIs, Playwright 1.63, axe-core, Node test runner, Lighthouse CI, Cloudflare Workers Builds, Node >=24.20.0, pnpm 11.25.x.

**Spec:** `docs/superpowers/specs/2026-09-11-s-plus-v2-trust-native-design.md`

## Authoring State Reconciled Before This Plan

- Live `main` at final authoring: `24f5eef78db9cb5fa7ec0ee9c65ea2df46403536`.
- PR #104 is merged. It provides purpose-based Motion Grammar, reduced-motion token override, site-wide/worst-case built-page client-JS enforcement, and exact-SHA performance baseline evidence.
- PR #105 is merged. It provides the canonical CSS-only BlueSkyz Horizon, mobile composition, zero incremental JS, and Horizon browser coverage.
- The public product registry remains intentionally truth-gated; product brand assets do not authorize public product rendering.

## Global Constraints

- Refresh live `main`, open PRs, issues #95–#102, checks, route truth, product truth, and current test/config files at the start of every wave.
- The SHA above is historical as soon as `main` moves.
- Preserve #104. Do not build a second motion grammar or second client-budget mechanism.
- Preserve #105. Do not build a competing Horizon primitive or replace its semantics without evidence.
- Preserve Astro static-first rendering and current Cloudflare delivery.
- Preserve Node `>=24.20.0` and pnpm `>=11.25.0 <12`.
- Preserve `/en/` and `/vi/` route parity, ordinary-link language switching, canonical behavior, and hreflang intent.
- Critical content, navigation, trust/evidence explanation, and conversion actions must work with JavaScript disabled.
- Respect `prefers-reduced-motion`; animation is never the sole carrier of state.
- Preserve keyboard parity, visible focus, semantic headings/landmarks, 44px target intent, 200% zoom, and 320px no-overflow behavior.
- Never invent products, product status, customer claims, partners, certifications, trust scores, maturity scores, testimonials, review dates, evidence, or guarantees.
- A brand asset is not authorization to publish a product.
- A build timestamp is not an evidence-review timestamp.
- Cobalt is a signal color; truth state must never be color-only.
- Default to semantic HTML, CSS, and SVG. Do not add a UI framework or command-menu dependency.
- WebGL/3D remains outside the default implementation and is gated by #99 and #102.
- Do not create a second manually maintained product, route, or evidence truth registry.
- Preserve and reuse `src/lib/truth.ts`; the integrity UX model does not replace production public-truth validation.
- Do not weaken tests, checks, accessibility assertions, source assurance, or truth validation to get green.
- Automated/browser assurance and human E4 acceptance remain separate evidence classes.
- Runtime promotion follows branch -> PR -> exact-head checks -> Cloudflare evidence -> merge -> post-merge read-back.

## Standard Verification Matrix

At the reconciled baseline:

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
pnpm lighthouse
```

Every user-facing wave also verifies 320px mobile layout, keyboard-only operation, visible focus, reduced motion, EN/VI parity, no-JS critical paths, final-diff scope, and exact-head CI/Cloudflare association.

---

# Wave 0 — Preserve Completed Foundations, Fix Locale Safety, Add Integrity Primitives

## Task 0.1: Refresh live state and reconcile concurrent S+ work

**Files:**

- Read: `docs/superpowers/specs/2026-09-11-s-plus-v2-trust-native-design.md`
- Read: `docs/superpowers/plans/2026-09-11-s-plus-v2-trust-native-implementation.md`
- Read: `SPEC.md`
- Read: `.github/workflows/*`
- Read: issues #95–#102
- Read: open PRs touching experience/layout/styles/tests

**Interfaces:**

- Consumes: current repository state.
- Produces: active-PR execution note recording current base SHA, overlapping work, issue state, and reconciled dependencies.

- [ ] **Step 1: Refresh current `main`, open PRs, checks, issue states, and deployment authority.**
- [ ] **Step 2: Confirm #104 and #105 intent remains present on live `main`.**
- [ ] **Step 3: Diff v2 assumptions against live `site.ts`, `i18n.ts`, `products.ts`, product content, shared layout/sections, budget scripts, Lighthouse config, tests, and workflows.**
- [ ] **Step 4: If live source invalidates a public interface in this plan, update the docs before runtime implementation instead of improvising incompatible architecture.**

**Exit:** No unexplained overlap with concurrent agents; current source matches execution assumptions.

---

## Task 0.2: Fix latent bilingual shared-component defects before public products appear

**Files:**

- Modify: `src/data/site.ts`
- Modify: `src/components/layout/Header.astro`
- Modify: `src/components/sections/FeaturedProducts.astro`
- Modify: `src/components/sections/FlagshipProof.astro`
- Create: `src/lib/product-routes.ts`
- Create: `tests/architecture/bilingual-shared-components.test.mjs`
- Create: `tests/e2e/bilingual-parity.spec.ts`

**Interfaces:**

```ts
export interface LocalizedLabel {
  en: string;
  vi: string;
}

export function getProductIndexPath(lang: "en" | "vi"): string;
export function getProductProfilePath(lang: "en" | "vi", slug: string): string;
```

- [ ] **Step 1: Write failing architecture tests** — reject hard-coded English public labels that can leak into VI for mobile menu, header CTA, Featured Products heading/CTA, flagship profile CTA, and proof caption; reject bare `/products/` paths from locale-aware shared components.

```js
assert.doesNotMatch(featuredProductsSource, /href="\/products\/"/);
assert.doesNotMatch(flagshipSource, />View profile</);
```

- [ ] **Step 2: Confirm RED**

```bash
node --test tests/architecture/bilingual-shared-components.test.mjs
```

- [ ] **Step 3: Centralize shared EN/VI labels in `src/data/site.ts`.**
- [ ] **Step 4: Implement locale-prefixed product index/profile helpers in `src/lib/product-routes.ts`.**
- [ ] **Step 5: Pass `lang` explicitly into `FeaturedProducts` and `FlagshipProof` from EN/VI composition.**
- [ ] **Step 6: Add Playwright parity coverage using the repository-supported fixture strategy so product-present behavior is tested while production registry is empty.**
- [ ] **Step 7: Verify**

```bash
pnpm test:architecture
pnpm test:e2e --grep "bilingual parity"
pnpm check:static-links
```

- [ ] **Step 8: Commit**

```bash
git add src/data/site.ts src/components/layout/Header.astro src/components/sections/FeaturedProducts.astro src/components/sections/FlagshipProof.astro src/lib/product-routes.ts tests/architecture/bilingual-shared-components.test.mjs tests/e2e/bilingual-parity.spec.ts
git commit -m "fix(i18n): harden shared EN VI experience parity"
```

**Acceptance:** Shared product/header UI is locale-safe before public products are introduced.

---

## Task 0.3: Preserve #104 and #105 as authoritative foundation contracts

**Files:**

- Read: `src/styles/global.css`
- Read: `scripts/check-client-budget.mjs`
- Read: `tests/architecture/s-plus-experience-contract.test.mjs`
- Read: `docs/evidence/2026-09-11-s-plus-baseline.md`
- Read: `src/components/experience/HorizonField.astro`
- Read: `src/components/sections/Hero.astro`
- Read: `tests/e2e/s-plus-horizon.spec.ts`

**Interfaces:**

- Consumes: #104 purpose-based motion tokens and site-wide/worst-case page JS budget.
- Consumes: #105 canonical Horizon primitive and browser contract.
- Produces: no duplicate runtime mechanism.

- [ ] **Step 1: Verify motion tokens still cover orientation, emphasis, confirmation, continuity, standard easing, distances, and reduced-motion override.**
- [ ] **Step 2: Verify the client-budget checker still measures every built page and reports site-wide unique + worst-case page while preserving the 120,000-byte hard ceiling.**
- [ ] **Step 3: Verify `HorizonField.astro` remains CSS-only, decorative, present for mobile/desktop, and zero-JS.**
- [ ] **Step 4: Verify exact-SHA baseline evidence remains historical evidence, not a substitute for fresh later-wave measurements.**
- [ ] **Step 5: Add no code if these contracts remain intact. If live changes weaken them, treat that as a bounded regression fix rather than a v2 alternative architecture.**

**Acceptance:** v2 has one motion system, one client-budget system, and one Horizon primitive.

---

## Task 0.4: Add truth-safe integrity types without replacing public-truth validation

**Files:**

- Create: `src/data/integrity.ts`
- Create: `src/lib/integrity.ts`
- Preserve: `src/lib/truth.ts`
- Create: `tests/architecture/integrity-truth-contract.test.mjs`

**Interfaces:**

```ts
export type TruthState =
  "source-linked" | "reviewed" | "changed" | "not-published" | "unavailable";

export interface LocalizedText {
  en: string;
  vi: string;
}

export interface EvidenceReference {
  kind: "route" | "artifact" | "private-reporting";
  href: { en: string; vi: string };
  label: LocalizedText;
}

export interface ReviewMetadata {
  reviewedOn: string;
  source: "content-review" | "evidence-update";
}

export interface BoundaryStatement {
  claim: LocalizedText;
  doesNotImply: LocalizedText;
}

export interface IntegrityEntry {
  id: string;
  surface: string;
  state: TruthState;
  summary: LocalizedText;
  evidence: EvidenceReference[];
  review?: ReviewMetadata;
  boundary?: BoundaryStatement;
}

export const INTEGRITY_ENTRIES: readonly IntegrityEntry[];
export function getIntegrityEntriesForSurface(
  surface: string,
): IntegrityEntry[];
export function getIntegrityEntry(id: string): IntegrityEntry | undefined;
```

- [ ] **Step 1: Write failing anti-fabrication tests** — reject `trustScore`, `maturityScore`, blanket `verified: true`, runtime-generated review dates, and imports from `brand-assets.ts` as product evidence.
- [ ] **Step 2: Confirm RED because the new module does not exist.**
- [ ] **Step 3: Implement types/selectors with `INTEGRITY_ENTRIES = [] as const` initially** — create the contract without speculative public entries.
- [ ] **Step 4: Assert `src/lib/truth.ts` remains production-origin/email validation and is not bypassed by integrity UX.**
- [ ] **Step 5: Verify**

```bash
pnpm test:architecture
pnpm typecheck
```

- [ ] **Step 6: Commit**

```bash
git add src/data/integrity.ts src/lib/integrity.ts tests/architecture/integrity-truth-contract.test.mjs
git commit -m "feat(trust): add fail-closed integrity data contract"
```

**Wave 0 exit gate:** #104/#105 preserved, bilingual risk removed, integrity model fail-closed, full verification green.

---

# Wave 1 — Remaining Signature and Narrative

## Task 1.1: Add zero-JS Elevation Spine

**Files:**

- Create: `src/data/experience.ts`
- Create: `src/components/experience/ExperienceSpine.astro`
- Modify: `src/pages/en/index.astro`
- Modify: `src/pages/vi/index.astro`
- Modify: homepage section roots to expose stable IDs
- Create: `tests/e2e/s-plus-spine.spec.ts`

**Interfaces:**

```ts
export type ExperienceStageId =
  "intelligence" | "elevation" | "trust" | "impact";

export interface ExperienceStage {
  id: ExperienceStageId;
  label: { en: string; vi: string };
  href: string;
}
```

- [ ] **Step 1: Write failing order/anchor tests** — four stages, stable targets, EN/VI labels, ordinary anchor navigation.
- [ ] **Step 2: Implement static semantic `<nav>`; no observer in v1, no scroll snap/lock.**
- [ ] **Step 3: Use CSS-only focus/hover/context styling without pretending to track viewport state.**
- [ ] **Step 4: Verify keyboard/reduced-motion/no-JS and #104 budget.**
- [ ] **Step 5: Commit**

```bash
git add src/data/experience.ts src/components/experience/ExperienceSpine.astro src/pages/en/index.astro src/pages/vi/index.astro src/components/sections tests/e2e/s-plus-spine.spec.ts
git commit -m "feat(experience): add semantic Elevation Spine"
```

---

## Task 1.2: Upgrade One House to Intelligence Matrix

**Files:**

- Modify: `src/data/experience.ts`
- Create: `src/components/experience/OneHouseMatrix.astro`
- Modify: `src/components/sections/OneHouse.astro`
- Create: `tests/e2e/s-plus-one-house.spec.ts`

**Interfaces:**

```ts
export type PrincipleId = "intelligence" | "elevation" | "trust" | "impact";

export interface PrincipleModel {
  id: PrincipleId;
  name: { en: string; vi: string };
  summary: { en: string; vi: string };
  dimensions: {
    product: { en: string; vi: string };
    people: { en: string; vi: string };
    evidence: { en: string; vi: string };
    impact: { en: string; vi: string };
  };
}
```

- [ ] **Step 1: Write failing completeness/parity tests** — four principles × four dimensions × EN/VI.
- [ ] **Step 2: Move principle copy into typed `experience.ts`; remove component-local translation maps.**
- [ ] **Step 3: Render all matrix content with semantic HTML and no hover-only facts.**
- [ ] **Step 4: Use CSS-only relationship emphasis; verify axe/mobile/#104 budgets.**
- [ ] **Step 5: Commit**

```bash
git add src/data/experience.ts src/components/experience/OneHouseMatrix.astro src/components/sections/OneHouse.astro tests/e2e/s-plus-one-house.spec.ts
git commit -m "feat(experience): turn One House into intelligence matrix"
```

**Wave 1 exit gate:** Spine/Matrix remain static-first; merged Horizon remains untouched except evidence-backed refinements.

---

# Wave 2 — Trust-Native Foundation

## Task 2.1: Build Verifiable Trust Ledger

**Files:**

- Create: `src/data/trust-ledger.ts`
- Create: `src/components/experience/TrustLedger.astro`
- Modify: `src/components/sections/Trust.astro`
- Create: `tests/architecture/trust-ledger-truth.test.mjs`
- Create: `tests/e2e/s-plus-trust-ledger.spec.ts`

**Interfaces:**

```ts
import type { ReviewMetadata } from "@/data/integrity";

export type TrustSurfaceId = "privacy" | "security" | "support";

export interface TrustLedgerEntry {
  id: TrustSurfaceId;
  state: "source-linked" | "not-published" | "unavailable";
  href: { en: string; vi: string };
  label: { en: string; vi: string };
  summary: { en: string; vi: string };
  evidenceKind: "route" | "private-reporting";
  review?: ReviewMetadata;
}

export const TRUST_LEDGER: readonly TrustLedgerEntry[];
export function getTrustLedger(lang: "en" | "vi"): TrustLedgerEntry[];
```

- [ ] **Step 1: Write anti-badge tests** — reject `certified`, `trustScore`, `maturityScore`, blanket `verified`, and unsupported assurance wording.
- [ ] **Step 2: Populate Privacy/Security/Support from live public facts only.**
- [ ] **Step 3: Render mobile-readable semantic ledger; avoid horizontal-overflow desktop tables.**
- [ ] **Step 4: Verify links, EN/VI parity, and absent review dates when no explicit metadata exists.**
- [ ] **Step 5: Commit**

```bash
git add src/data/trust-ledger.ts src/components/experience/TrustLedger.astro src/components/sections/Trust.astro tests/architecture/trust-ledger-truth.test.mjs tests/e2e/s-plus-trust-ledger.spec.ts
git commit -m "feat(trust): expose evidence-oriented trust ledger"
```

---

## Task 2.2: Create Truth-State Visual Grammar

**Files:**

- Create: `src/components/integrity/TruthState.astro`
- Modify: `src/styles/global.css`
- Create: `tests/architecture/truth-state-contract.test.mjs`
- Create: `tests/e2e/truth-state-grammar.spec.ts`

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

- [ ] **Step 1: Write failing text/non-color tests** — localized text plus non-color glyph/shape semantic.
- [ ] **Step 2: Implement restrained glyph + label + border/typography treatments using existing brand tokens and #104 motion rules.**
- [ ] **Step 3: Verify contrast and no continuous state animation.**
- [ ] **Step 4: Commit**

```bash
git add src/components/integrity/TruthState.astro src/styles/global.css tests/architecture/truth-state-contract.test.mjs tests/e2e/truth-state-grammar.spec.ts
git commit -m "feat(trust): add human-readable truth-state grammar"
```

---

## Task 2.3: Implement Proof-First Empty States

**Files:**

- Modify: `src/pages/en/products/index.astro`
- Modify: `src/pages/vi/products/index.astro`
- Create: `src/components/product/ProofFirstEmptyState.astro`
- Modify: `tests/architecture/integrity-truth-contract.test.mjs`
- Create: `tests/e2e/product-empty-state.spec.ts`

**Interfaces:**

```astro
---
interface Props {
  lang: "en" | "vi";
}
---
```

- [ ] **Step 1: Write failing zero-product tests** — explain proof-backed publication, provide useful internal next actions, reveal no unpublished product names.
- [ ] **Step 2: Add anti-leak assertion** — empty state may not import/enumerate `brandAssets.products`.
- [ ] **Step 3: Implement localized copy saying only proof-backed public products appear; never say BlueSkyz has no products.**
- [ ] **Step 4: Verify**

```bash
pnpm validate:public-truth
pnpm test:e2e --grep "proof-first empty"
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/en/products/index.astro src/pages/vi/products/index.astro src/components/product/ProofFirstEmptyState.astro tests/architecture/integrity-truth-contract.test.mjs tests/e2e/product-empty-state.spec.ts
git commit -m "feat(products): add proof-first publication empty state"
```

---

## Task 2.4: Add Boundary Cards

**Files:**

- Create: `src/components/integrity/BoundaryCard.astro`
- Modify: `src/data/integrity.ts`
- Modify: `src/pages/en/security.astro`
- Modify: `src/pages/vi/security.astro`
- Modify: `src/pages/en/privacy.astro`
- Modify: `src/pages/vi/privacy.astro`
- Create: `tests/e2e/boundary-card.spec.ts`

**Interfaces:**

```astro
---
import type { BoundaryStatement } from "@/data/integrity";
interface Props {
  boundary: BoundaryStatement;
  lang: "en" | "vi";
}
---
```

- [ ] **Step 1: Write failing semantic tests** — visible localized “establishes” and “does not establish” concepts.
- [ ] **Step 2: Add only concrete source-backed boundaries; keep absent where no safe statement exists.**
- [ ] **Step 3: Render native neutral trust styling; no JS.**
- [ ] **Step 4: Commit**

```bash
git add src/components/integrity/BoundaryCard.astro src/data/integrity.ts src/pages/en/security.astro src/pages/vi/security.astro src/pages/en/privacy.astro src/pages/vi/privacy.astro tests/e2e/boundary-card.spec.ts
git commit -m "feat(trust): make evidence boundaries explicit"
```

---

## Task 2.5: Add Safe Action Preflight

**Files:**

- Create: `src/components/integrity/SafeAction.astro`
- Modify: `src/pages/en/security.astro`
- Modify: `src/pages/vi/security.astro`
- Modify: `src/pages/en/contact.astro`
- Modify: `src/pages/vi/contact.astro`
- Create: `tests/e2e/safe-action.spec.ts`

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

- [ ] **Step 1: Write failing destination-context tests** — eligible actions expose concise boundary context; internal links do not receive confirmation friction.
- [ ] **Step 2: Implement as ordinary real links; never intercept with mandatory confirmation.**
- [ ] **Step 3: Replace eligible security/contact actions in both languages.**
- [ ] **Step 4: Verify keyboard/accessibility and commit.**

```bash
git add src/components/integrity/SafeAction.astro src/pages/en/security.astro src/pages/vi/security.astro src/pages/en/contact.astro src/pages/vi/contact.astro tests/e2e/safe-action.spec.ts
git commit -m "feat(trust): add transparent external action boundaries"
```

**Wave 2 exit gate:** User-visible trust communicates source, state, publication restraint, boundaries, and action destination without unsupported badges.

---

# Wave 3 — Integrity Inspection and Reading Depth

## Task 3.1: Build zero-JS SGPS Integrity Lens — Verify this page

**Files:**

- Modify: `src/data/integrity.ts`
- Modify: `src/lib/integrity.ts`
- Create: `src/components/integrity/IntegrityLens.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `tests/architecture/integrity-truth-contract.test.mjs`
- Create: `tests/e2e/integrity-lens.spec.ts`

**Interfaces:**

```astro
---
interface Props {
  surface: string;
  lang: "en" | "vi";
}
---
```

`IntegrityLens` consumes `getIntegrityEntriesForSurface(surface)`.

- [ ] **Step 1: Write failing no-JS/keyboard tests** — modeled surfaces expose a localized Verify affordance and only modeled evidence.
- [ ] **Step 2: Populate `INTEGRITY_ENTRIES` by referencing existing trust/public-route facts; never duplicate product truth.**
- [ ] **Step 3: Implement V1 with semantic `<details>`; no client script.**
- [ ] **Step 4: Add internal-jargon rejection test** — user-facing labels may not expose raw `SHA`, `CI`, `ruleset`, or `workflow run` vocabulary.
- [ ] **Step 5: Integrate through `BaseLayout` only when a surface has entries.**
- [ ] **Step 6: Verify #104 budget remains zero for the Lens and commit.**

```bash
git add src/data/integrity.ts src/lib/integrity.ts src/components/integrity/IntegrityLens.astro src/layouts/BaseLayout.astro tests/architecture/integrity-truth-contract.test.mjs tests/e2e/integrity-lens.spec.ts
git commit -m "feat(trust): add page-level Integrity Lens"
```

---

## Task 3.2: Add Executive ↔ Evidence reading depth

**Files:**

- Create: `src/components/integrity/EvidenceDetails.astro`
- Modify: `src/components/experience/TrustLedger.astro`
- Modify: `src/components/integrity/IntegrityLens.astro`
- Modify: `src/components/sections/FlagshipProof.astro`
- Create: `tests/e2e/evidence-depth.spec.ts`

**Interfaces:**

```astro
---
import type {
  BoundaryStatement,
  EvidenceReference,
  ReviewMetadata,
} from "@/data/integrity";
interface Props {
  summary: string;
  evidence: EvidenceReference[];
  boundary?: BoundaryStatement;
  review?: ReviewMetadata;
  lang: "en" | "vi";
}
---
```

- [ ] **Step 1: Write failing progressive-disclosure tests** — executive summary visible by default; evidence reachable by native control/no JS.
- [ ] **Step 2: Implement `EvidenceDetails` with localized `<details>` labels.**
- [ ] **Step 3: Refactor Ledger/Lens/Flagship proof to reuse it instead of parallel evidence markup.**
- [ ] **Step 4: Verify print/no-JS/accessibility and commit.**

```bash
git add src/components/integrity/EvidenceDetails.astro src/components/experience/TrustLedger.astro src/components/integrity/IntegrityLens.astro src/components/sections/FlagshipProof.astro tests/e2e/evidence-depth.spec.ts
git commit -m "feat(trust): add executive and evidence reading depth"
```

---

## Task 3.3: Add Evidence Pulse only from explicit review metadata

**Files:**

- Modify: `src/components/integrity/EvidenceDetails.astro`
- Modify: `src/components/integrity/TruthState.astro`
- Modify: `src/data/integrity.ts`
- Create: `tests/architecture/evidence-freshness.test.mjs`
- Create: `tests/e2e/evidence-freshness.spec.ts`

- [ ] **Step 1: Write failing no-generated-date test** — reject `new Date()`, `Date.now()`, build timestamps, and file mtime as public review metadata sources.
- [ ] **Step 2: Render freshness only when explicit `ReviewMetadata` exists; no metadata means no freshness row.**
- [ ] **Step 3: Any transient change emphasis uses #104 Motion Grammar; never infinite pulse animation.**
- [ ] **Step 4: Verify and commit.**

```bash
git add src/components/integrity/EvidenceDetails.astro src/components/integrity/TruthState.astro src/data/integrity.ts tests/architecture/evidence-freshness.test.mjs tests/e2e/evidence-freshness.spec.ts
git commit -m "feat(trust): expose evidence freshness without fabricated dates"
```

---

## Task 3.4: Add selective Bilingual Mirror

**Files:**

- Create: `src/components/integrity/BilingualMirror.astro`
- Modify: `src/data/integrity.ts`
- Modify: `src/pages/en/security.astro`
- Modify: `src/pages/vi/security.astro`
- Create: `tests/e2e/bilingual-mirror.spec.ts`

**Interfaces:**

```astro
---
interface Props {
  pairs: Array<{ id: string; en: string; vi: string }>;
}
---
```

- [ ] **Step 1: Write failing explicit-pair tests** — stable IDs + authored EN/VI; reject runtime translation/DOM scraping.
- [ ] **Step 2: Implement side-by-side desktop and paired stacked mobile layout.**
- [ ] **Step 3: Keep normal localized route primary; Mirror remains optional.**
- [ ] **Step 4: Verify 320px and commit.**

```bash
git add src/components/integrity/BilingualMirror.astro src/data/integrity.ts src/pages/en/security.astro src/pages/vi/security.astro tests/e2e/bilingual-mirror.spec.ts
git commit -m "feat(i18n): add selective bilingual evidence mirror"
```

**Wave 3 exit gate:** Deeper evidence and language correspondence are inspectable without a technical-console aesthetic or client dependency.

---

# Wave 4 — Adaptive Orientation and Discovery

## Task 4.1: Complete IA semantics and Contextual Journey Bar (#97)

**Files:**

- Create: `src/lib/journey.ts`
- Create: `src/components/experience/JourneyBar.astro`
- Modify: `src/components/layout/Header.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Create: `tests/e2e/s-plus-journey.spec.ts`

**Interfaces:**

```ts
export interface JourneyAction {
  href: string;
  label: string;
  kind: "next" | "related";
}

export function getJourneyActions(
  pathname: string,
  lang: "en" | "vi",
): JourneyAction[];
```

- [ ] **Step 1: Write EN/VI route-map tests** — home, About, Products, Privacy, Security, Support, Contact; live approved routes only.
- [ ] **Step 2: Add real current-route matching with `aria-current="page"` to primary nav.**
- [ ] **Step 3: Implement Journey Bar near content end; no sticky sales overlay.**
- [ ] **Step 4: Verify static links/mobile parity and commit.**

```bash
git add src/lib/journey.ts src/components/experience/JourneyBar.astro src/components/layout/Header.astro src/layouts/BaseLayout.astro tests/e2e/s-plus-journey.spec.ts
git commit -m "feat(nav): add contextual journey orientation"
```

---

## Task 4.2: Add privacy-safe Intent Lens

**Files:**

- Create: `src/components/experience/IntentLens.astro`
- Create: `src/scripts/intent-lens.ts`
- Modify: `src/pages/en/index.astro`
- Modify: `src/pages/vi/index.astro`
- Create: `tests/e2e/s-plus-intent.spec.ts`

**Interfaces:**

```ts
export type VisitorIntent =
  "evaluate-product" | "understand-blueskyz" | "verify-trust" | "work-with-us";
export const INTENT_EVENT = "blueskyz:intent-change";
```

- [ ] **Step 1: Write failing no-selection/no-JS tests** — all critical content remains available.
- [ ] **Step 2: Render native buttons with `aria-pressed`.**
- [ ] **Step 3: Implement ephemeral memory/DOM state; no cookies/localStorage/fingerprinting/account/remote personalization.**
- [ ] **Step 4: Change emphasis only; never hide trust/legal/product facts.**
- [ ] **Step 5: Emit `blueskyz:intent-change` with `{ intent }` only.**
- [ ] **Step 6: Measure with #104 budget and commit.**

```bash
git add src/components/experience/IntentLens.astro src/scripts/intent-lens.ts src/pages/en/index.astro src/pages/vi/index.astro tests/e2e/s-plus-intent.spec.ts
git commit -m "feat(experience): add privacy-safe Intent Lens"
```

---

## Task 4.3: Add Native Language Morph

**Files:**

- Modify: `src/components/layout/LanguageSwitcher.astro`
- Create: `src/scripts/language-transition.ts`
- Modify: `src/styles/global.css`
- Create: `tests/e2e/s-plus-language.spec.ts`

**Interfaces:** Existing `getAlternatePath()` remains source of truth; no new router.

- [ ] **Step 1: Write ordinary-link preservation tests** — real `href`, `hreflang`, active-language semantics before enhancement.
- [ ] **Step 2: Add capability-detected View Transition enhancement; skip when unsupported or reduced motion requested.**
- [ ] **Step 3: Verify focus/URL correctness; remove interception if unreliable.**
- [ ] **Step 4: Measure with #104 budget and commit.**

```bash
git add src/components/layout/LanguageSwitcher.astro src/scripts/language-transition.ts src/styles/global.css tests/e2e/s-plus-language.spec.ts
git commit -m "feat(i18n): add native language continuity"
```

---

## Task 4.4: Build Cmd/Ctrl+K Command Navigator

**Files:**

- Create: `src/lib/navigator.ts`
- Create: `src/components/experience/CommandNavigator.astro`
- Create: `src/scripts/command-navigator.ts`
- Modify: `src/components/layout/Header.astro`
- Create: `tests/e2e/s-plus-command.spec.ts`

**Interfaces:**

```ts
export type NavigatorItemKind = "route" | "trust" | "product";

export interface NavigatorItem {
  id: string;
  kind: NavigatorItemKind;
  href: string;
  label: string;
  aliases: string[];
}

export async function buildNavigatorItems(
  lang: "en" | "vi",
): Promise<NavigatorItem[]>;
```

- [ ] **Step 1: Write keyboard/focus tests** — visible trigger, Cmd/Ctrl+K, Escape, search focus, focus restore, real-link results.
- [ ] **Step 2: Build index from route truth + trust ledger + `getPublicProducts()` only.**
- [ ] **Step 3: Implement native `<dialog>` + vanilla JS; no command-menu dependency.**
- [ ] **Step 4: Ensure normal navigation remains sufficient.**
- [ ] **Step 5: Measure #104 budget and commit.**

```bash
git add src/lib/navigator.ts src/components/experience/CommandNavigator.astro src/scripts/command-navigator.ts src/components/layout/Header.astro tests/e2e/s-plus-command.spec.ts
git commit -m "feat(nav): add lightweight command navigator"
```

---

## Task 4.5: Extend Navigator into deterministic Provenance Search

**Files:**

- Modify: `src/lib/navigator.ts`
- Modify: `src/lib/integrity.ts`
- Modify: `src/components/experience/CommandNavigator.astro`
- Modify: `src/scripts/command-navigator.ts`
- Modify: `tests/architecture/integrity-truth-contract.test.mjs`
- Create: `tests/e2e/provenance-search.spec.ts`

**Interfaces:**

```ts
export type NavigatorItemKind = "route" | "trust" | "product" | "evidence";
```

- [ ] **Step 1: Write failing evidence-query tests** — localized privacy/security-reporting/proof/support queries resolve deterministic public evidence destinations.
- [ ] **Step 2: Add evidence items from explicit integrity/trust/public-product data only.**
- [ ] **Step 3: Forbid LLM, vector DB, remote search API, generated answer, and personalization dependencies.**
- [ ] **Step 4: Add localized evidence-result type label without claiming search itself verifies anything.**
- [ ] **Step 5: Commit**

```bash
git add src/lib/navigator.ts src/lib/integrity.ts src/components/experience/CommandNavigator.astro src/scripts/command-navigator.ts tests/architecture/integrity-truth-contract.test.mjs tests/e2e/provenance-search.spec.ts
git commit -m "feat(trust): add deterministic provenance search"
```

**Wave 4 exit gate:** Adaptive features remain optional; source truth stays centralized and #104 site-wide/worst-page budgets remain green.

---

# Wave 5 — Atlas and Public Change Intelligence

## Task 5.1: Build BlueSkyz Atlas V1

**Files:**

- Create: `src/lib/atlas.ts`
- Create: `src/components/experience/Atlas.astro`
- Modify: `src/pages/en/about.astro`
- Modify: `src/pages/vi/about.astro`
- Modify: `tests/architecture/integrity-truth-contract.test.mjs`
- Create: `tests/e2e/s-plus-atlas.spec.ts`

**Interfaces:**

```ts
export type AtlasNodeKind = "brand" | "principle" | "trust" | "product";

export interface AtlasNode {
  id: string;
  kind: AtlasNodeKind;
  label: string;
  href?: string;
}

export interface AtlasEdge {
  from: string;
  to: string;
  relation: "principle" | "trust-surface" | "published-product";
}

export async function buildAtlas(lang: "en" | "vi"): Promise<{
  nodes: AtlasNode[];
  edges: AtlasEdge[];
}>;
```

- [ ] **Step 1: Write zero-product truth test** — current empty registry yields zero product nodes despite product brand assets.
- [ ] **Step 2: Build nodes from BlueSkyz + `experience.ts` + `trust-ledger.ts` + `getPublicProducts()` only.**
- [ ] **Step 3: Render SVG visual + semantic HTML; decorative edges hidden from assistive technology.**
- [ ] **Step 4: CSS-first focus/hover emphasis; no required JS.**
- [ ] **Step 5: Integrate on About EN/VI and commit.**

```bash
git add src/lib/atlas.ts src/components/experience/Atlas.astro src/pages/en/about.astro src/pages/vi/about.astro tests/architecture/integrity-truth-contract.test.mjs tests/e2e/s-plus-atlas.spec.ts
git commit -m "feat(experience): add truth-derived BlueSkyz Atlas"
```

---

## Task 5.2: Gate Evidence Change Intelligence on a real public change source

**Files when GO:**

- Create: `src/data/public-evidence-changes.ts`
- Create: `src/components/integrity/EvidenceChangeTimeline.astro`
- Create: `tests/architecture/public-change-contract.test.mjs`
- Create: `tests/e2e/evidence-change-timeline.spec.ts`

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

- [ ] **Step 1: Determine whether deliberately authored/approved public change metadata exists. Raw Git history is not acceptable.**
- [ ] **Step 2A: NO-GO** — record NO-GO in the active issue/PR and create no timeline files/events.
- [ ] **Step 2B: GO** — write failing schema/source tests rejecting commit-message/timestamp derivation.
- [ ] **Step 3: Implement only approved events and localized semantic timeline.**
- [ ] **Step 4: Commit only on GO**

```bash
git add src/data/public-evidence-changes.ts src/components/integrity/EvidenceChangeTimeline.astro tests/architecture/public-change-contract.test.mjs tests/e2e/evidence-change-timeline.spec.ts
git commit -m "feat(trust): add curated public evidence change history"
```

**Wave 5 exit gate:** Atlas stays truthful with an empty registry; change history is evidence-backed or explicitly NO-GO.

---

# Wave 6 — Production Hardening, Measurement, Human Evidence, Optional Halo

## Task 6.1: Resolve #95 against the actual contact model

**Current authoring-baseline fact:** EN contact is static, exposing GitHub private vulnerability reporting and optional `mailto:` business contact; there is no async form state machine.

**Files:**

- Read: `src/pages/en/contact.astro`
- Read: `src/pages/vi/contact.astro`
- Read: issue #95

- [ ] **Step 1: Re-read live contact implementation.**
- [ ] **Step 2: If it remains static/mailto, record #95 as not applicable to current runtime and do not invent a backend/form to close it.**
- [ ] **Step 3: If a real async form has since appeared, create a bounded design/spec for that concrete flow before implementation.**

**Acceptance:** No fake loading/success/error states without a real async operation.

---

## Task 6.2: Finish SEO/discoverability baseline (#98)

**Files:**

- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/lib/seo.ts`
- Modify: `src/pages/robots.txt.ts`
- Modify: `src/pages/sitemap.xml.ts`
- Create: `tests/architecture/seo-metadata-contract.test.mjs`

- [ ] **Step 1: Write failing metadata/indexability tests** — intentional title/description/canonical per indexable EN/VI route; canonical/robots/sitemap agree.
- [ ] **Step 2: Add deterministic OG/social fallbacks using approved brand assets.**
- [ ] **Step 3: Add structured data only for provable facts; no invented products/reviews/ratings/awards/certifications/addresses.**
- [ ] **Step 4: Verify build/static-links/browser metadata.**
- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro src/lib/seo.ts src/pages/robots.txt.ts src/pages/sitemap.xml.ts tests/architecture/seo-metadata-contract.test.mjs
git commit -m "feat(seo): harden production discoverability contracts"
```

---

## Task 6.3: Add provider-neutral privacy-conscious event contracts (#100)

**Files:**

- Create: `src/lib/analytics-events.ts`
- Modify: `src/scripts/intent-lens.ts`
- Create: `tests/architecture/analytics-event-contract.test.mjs`

**Interfaces:**

```ts
export type PublicExperienceEvent =
  | "intent_selected"
  | "integrity_opened"
  | "evidence_opened"
  | "primary_cta_activated"
  | "contact_started"
  | "contact_succeeded"
  | "contact_failed";

export interface PublicExperienceEventDetail {
  route?: string;
  intentId?: string;
  evidenceId?: string;
  actionKind?: string;
}

export function emitExperienceEvent(
  name: PublicExperienceEvent,
  detail: PublicExperienceEventDetail,
): void;
```

- [ ] **Step 1: Write failing schema tests** — reject free-text message/form-body fields, credentials, email addresses, arbitrary object payloads, and duplicate event names.
- [ ] **Step 2: Implement provider-neutral local `CustomEvent` dispatch only.**
- [ ] **Step 3: Wire Intent Lens once it exists; analytics failure never blocks product behavior.**
- [ ] **Step 4: Do not add an external provider until a separate privacy/provider decision approves it.**
- [ ] **Step 5: Commit**

```bash
git add src/lib/analytics-events.ts src/scripts/intent-lens.ts tests/architecture/analytics-event-contract.test.mjs
git commit -m "feat(analytics): define privacy-safe experience events"
```

---

## Task 6.4: Production smoke and rollback contract (#101)

**Files:**

- Create: `docs/operations/production-smoke-and-rollback.md`
- Create: `scripts/check-production-smoke.mjs`
- Create: `tests/architecture/production-smoke-contract.test.mjs`

**Critical routes:** `/en/`, `/vi/`, `/en/products/`, `/vi/products/`, `/en/security/`, `/vi/security/`, `/en/contact/`, `/vi/contact/`.

- [ ] **Step 1: Write failing script-contract test** — deterministic canonical route list and expected marker/title checks.
- [ ] **Step 2: Implement smoke script** — HTTP success, expected marker/title, reject obvious platform/deployment error pages.
- [ ] **Step 3: Document exact commit/deployment evidence and last-known-good identification.**
- [ ] **Step 4: Document bounded rollback/recovery plus mandatory post-recovery smoke.**
- [ ] **Step 5: Rehearse safely against current Cloudflare mechanics without destructive production experiments.**
- [ ] **Step 6: Commit**

```bash
git add docs/operations/production-smoke-and-rollback.md scripts/check-production-smoke.mjs tests/architecture/production-smoke-contract.test.mjs
git commit -m "docs(ops): add verified deploy smoke and rollback contract"
```

---

## Task 6.5: Human E4 comprehension and credibility acceptance

**Files:**

- Create: `docs/evidence/s-plus-v2-e4-study.md`

**Study tasks:**

1. Explain what BlueSkyz is after first exposure.
2. Find how to inspect privacy/security/support evidence.
3. Explain a Boundary Card.
4. Distinguish “not published” from “does not exist”.
5. Switch EN/VI and retain context.
6. Find a next useful action.

- [ ] **Step 1: Define participant/session protocol before collection.**
- [ ] **Step 2: Record observations separately from interpretation.**
- [ ] **Step 3: Report confusion/failure honestly.**
- [ ] **Step 4: File bounded follow-up issues from real findings.**
- [ ] **Step 5: Keep automated PASS separate from E4.**

**Acceptance:** Never fabricate participant data. If no human study occurs, status is `NOT RUN`.

---

## Task 6.6: WebGL/3D GO/NO-GO (#102)

**Files when decision work starts:**

- Create: `docs/evidence/s-plus-v2-webgl-decision.md`

**GO requires all:** #104/#99 budgets remain enforced; Atlas V1 exists; written user/business hypothesis; measurable expected benefit; mobile/reduced-motion/no-WebGL fallback; removable prototype boundary; measured incremental JS/GPU/asset estimate.

- [ ] **Step 1: Write hypothesis and success metric before code.**
- [ ] **Step 2: Compare expected value with SVG/HTML Atlas V1.**
- [ ] **Step 3: Default to NO-GO when evidence is weak.**
- [ ] **Step 4: If GO, create a separate experimental design/PR.**
- [ ] **Step 5: Never make WebGL required for core identity/navigation.**

---

# PR Boundaries From the Reconciled Baseline

1. **Already complete:** #104 Motion Grammar + client budget/performance baseline.
2. **Already complete:** #105 BlueSkyz Horizon signature field.
3. **PR A — v2 Foundation safety:** Tasks 0.2 and 0.4.
4. **PR B — Remaining narrative:** Tasks 1.1–1.2.
5. **PR C — Trust foundation:** Tasks 2.1–2.5.
6. **PR D — Integrity inspection:** Tasks 3.1–3.4.
7. **PR E — Adaptive discovery:** Tasks 4.1–4.5.
8. **PR F — Atlas:** Task 5.1.
9. **PR G — Change intelligence:** Task 5.2 only on GO.
10. **PR H — SEO:** Task 6.2.
11. **PR I — Provider-neutral events:** Task 6.3 after Intent Lens exists.
12. **PR J — Operations:** Task 6.4.
13. **Human evidence record:** Task 6.5 only from real sessions.
14. **Experimental PR:** Task 6.6 only after GO.

# Dependency Graph

```text
#104 Motion / Budget = SATISFIED
#105 Horizon         = SATISFIED

0.2 bilingual safety ─┐
0.4 integrity types ──┼─> 2 trust foundation ────────> 3 integrity inspection
#104 + #105 ──────────┤
                     └─> 1 Spine + Matrix ───────────> 5.1 Atlas
2 trust foundation ──────────────────────────────────> 4 adaptive discovery
0.4 + real public change source ─────────────────────> 5.2 change intelligence
stable runtime waves ─────────────────────────────────> 6 hardening + E4
#104 budgets + 5.1 Atlas + real hypothesis ──────────> 6.6 WebGL GO/NO-GO
```

# Exact-Head Promotion Checklist for Every Runtime PR

- [ ] Current base SHA recorded.
- [ ] Overlapping open PRs reconciled.
- [ ] Final diff contains only intended files.
- [ ] No secret, private evidence, or unpublished product fact added.
- [ ] `pnpm install --frozen-lockfile` succeeds.
- [ ] `pnpm audit --audit-level=moderate` succeeds under current repo policy.
- [ ] `pnpm test:architecture` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm lint` passes.
- [ ] `pnpm format:check` passes.
- [ ] `pnpm build` passes.
- [ ] `pnpm check:client-budget` preserves #104 site-wide/worst-page contract.
- [ ] `pnpm check:static-links` passes.
- [ ] `pnpm test:e2e` passes across configured projects.
- [ ] `pnpm lighthouse` passes.
- [ ] 320px, keyboard, reduced-motion, no-JS, EN/VI checks pass.
- [ ] PR head SHA matches authoritative source/browser checks.
- [ ] Cloudflare evidence belongs to the same promoted head where applicable.
- [ ] No unexplained red/pending authoritative gate remains.
- [ ] Merge uses expected-head guard where tooling supports it.
- [ ] Merged `main` SHA is read back.
- [ ] Post-merge source/browser/deployment state is read back before completion claim.

# Agent Handoff

```text
Repository: BlueSkyz-Labs/SGPS-Marketing
Canonical design: docs/superpowers/specs/2026-09-11-s-plus-v2-trust-native-design.md
Canonical plan: docs/superpowers/plans/2026-09-11-s-plus-v2-trust-native-implementation.md

Refresh live main, issues, and open PRs before acting. #104 Motion Grammar / client
budget and #105 Horizon are already merged and must be preserved; do not create
parallel systems. Use TDD. Preserve static-first, src/lib/truth.ts, EN/VI parity,
WCAG/reduced-motion, #104 site-wide/worst-page client budgets, and exact-head
evidence. Do not invent products, claims, review dates, certifications, trust
scores, or human-study results. Translate SGPS into human-readable integrity
rather than exposing internal governance jargon. No merge on unexplained red.
```

# Completion Definition

The v2 program is complete only when #104/#105 remain intact; approved systems are live on green `main`; EN/VI shared-component defects are gone; trust surfaces expose source/boundary/freshness truth without unsupported assurance; product-empty behavior is proof-first; Integrity Lens is static-safe; search/Atlas use authoritative public entities only; evidence change history is evidence-backed or explicitly NO-GO; #104 site-wide/worst-page budget remains green; accessibility/no-JS/reduced-motion/320px pass; #101 operational evidence exists when completed; E4 is real human evidence or `NOT RUN`; WebGL is absent unless its separate GO gate passes; and final post-merge checks are read back from the exact promoted `main`.
