# C2 — Cinematic Product House Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recompose BlueSkyz Labs into a premium, product-led Cinematic Product House where real products dominate the public experience, cinematic effects are progressive and bounded, and SGPS remains the verifiable trust infrastructure underneath.

**Architecture:** Keep the existing Astro static-first, truth-first, bilingual architecture. Recompose the homepage into six narrative acts, move power-user SGPS surfaces deeper into the journey, add a small native cinematic layer using HTML/CSS/SVG/View Transitions, and preserve all existing security, provenance, accessibility, performance, and deployment gates. Product truth remains fail-closed; no cinematic component can create product or evidence facts.

**Tech Stack:** Astro 7.3.x, TypeScript 6, Tailwind CSS 4, native HTML/CSS/SVG, small vanilla TypeScript/JavaScript only where progressive enhancement is justified, Playwright, Node test runner, axe, Lighthouse, Cloudflare Workers Builds.

**Spec:** `docs/superpowers/specs/2026-09-13-c2-cinematic-product-house-design.md`

## Global Constraints

- Baseline at planning time: `main@cf65cbc4467b24d125fcbb37fdf00a8a7a658f03`; every execution session MUST refresh live `main`, open PRs, `docs/current-work.json`, `AGENTS.md`, and newer specs before editing.
- Normal execution is branch/worktree → PR → exact-head `Quality Gates` + `Browser Assurance` → merge. Direct-to-`main` is prohibited.
- Astro static-first remains authoritative. No React/Vue/Svelte runtime is introduced.
- Critical content, product identity, truth/evidence, navigation, and actions must work with JavaScript disabled.
- No WebGL/3D is part of the default C2 implementation. A later isolated experiment requires the separate GO gate in the spec.
- No new animation framework dependency. Prefer CSS/SVG/native View Transitions and at most small vanilla modules.
- No scroll hijacking, custom cursor, mandatory parallax, autoplay audio, loader theatre, particle galaxy, generic AI-neural decoration, or animation-gated reveal.
- `prefers-reduced-motion: reduce` must remove non-essential transform travel and preserve all meaning/actions.
- Do not invent products, screenshots, product claims, customers, testimonials, team size, certifications, review dates, proof, legal text, contact facts, or human-study outcomes.
- Public products come only from the existing products collection and schema. Do not create a second public product registry.
- Public claims/evidence come only from the existing claim/integrity fabric. Do not duplicate claim truth inside cinematic components.
- Existing `check:client-budget` remains the hard client-JS authority. C2 incremental design target is ≤15 KB Brotli, never permission to raise the repository ceiling.
- Analytics/RUM transmission remains OFF until the existing owner privacy/provider decision changes.
- EN/VI route parity, canonical/hreflang behavior, bilingual accessibility chrome, and no-JS behavior remain mandatory.
- Existing accessibility hardening remains mandatory: 320/390px overflow, 200% text zoom, text spacing, forced colors, focus/keyboard, axe, reduced motion, one-H1/heading order.
- Every runtime PR must carry evidence for before/after client bytes and targeted browser behavior; final promotion additionally requires production read-back.
- Human E4 remains owner-run. Automated/agent review may prepare evidence but cannot mark real-user comprehension PASS.

---

## 0. File and Responsibility Map

### Existing source files expected to change

- `src/pages/en/index.astro` — EN six-act homepage composition.
- `src/pages/vi/index.astro` — VI six-act homepage composition.
- `src/components/sections/Hero.astro` — C2 Horizon Arrival content/composition.
- `src/components/experience/HorizonField.astro` — reusable arrival/closing signature primitive.
- `src/components/sections/FlagshipProof.astro` — superseded or refactored into flagship theatre while preserving real screenshot/evidence behavior.
- `src/components/sections/FeaturedProducts.astro` — product-house editorial hierarchy, no equal-weight generic grid as the only presentation.
- `src/components/sections/OneHouse.astro` — editorial interlude.
- `src/components/sections/Trust.astro` — compact proof-first homepage trust layer.
- `src/components/sections/AboutBlueSkyz.astro` — intentional human layer.
- `src/components/sections/NextStep.astro` — simplified final action/closing transition.
- `src/styles/global.css` — token-level/global behavior only. If C2 adds substantial component-specific rules, create the focused stylesheet below rather than growing one global file indefinitely.
- `src/lib/product-schema.ts` — public screenshot/publication floor only after real asset truth exists.
- `docs/current-work.json` — wave/evidence routing.

### Expected focused additions

- `src/styles/cinematic-product-house.css` — C2 act layout, cinematic planes, Horizon transitions, flagship/product-house art direction, and focused reduced-motion overrides.
- `src/components/product/FlagshipTheatre.astro` — flagship visual narrative consuming only one real public product entry.
- `src/components/product/ProductHouse.astro` — editorial portfolio composition consuming the existing public product list.
- `src/components/integrity/EvidenceTeaser.astro` — compact progressive disclosure derived from canonical claim/evidence selectors.
- `src/lib/c2-home.ts` — pure selector/composition helpers only if needed; no authored product or claim truth.

### Expected tests

- `tests/architecture/c2-home-composition.test.mjs` — homepage ordering, density, and supersession contract.
- `tests/architecture/c2-truth-boundary.test.mjs` — cinematic layer cannot define product/claim truth and must use canonical selectors.
- `tests/architecture/c2-performance-contract.test.mjs` — prevents new framework/animation/WebGL critical dependencies and pins progressive-media rules.
- `tests/e2e/c2-home.spec.ts` — desktop/mobile six-act flow and content.
- `tests/e2e/c2-reduced-motion.spec.ts` — reduced-motion equivalence.
- `tests/e2e/c2-evidence-teaser.spec.ts` — progressive evidence disclosure and no-JS baseline.
- `tests/e2e/c2-product-continuity.spec.ts` — ordinary navigation authoritative; View Transition enhancement optional.
- Existing suites remain authoritative where touched: `accessibility`, `bilingual-*`, `mobile-overflow`, `text-zoom`, `text-spacing`, `forced-colors`, `evidence-*`, `product-*`, `source-trace`, `empty-and-404`, `markup-baseline`, `print-surface`, command, and atlas suites.

---

# Wave P0 — Product Truth Activation

## Task 1: Refresh live state and establish the C2 execution router

**Files:**

- Read: `AGENTS.md`.
- Read/Modify: `docs/current-work.json`.
- Read: `docs/superpowers/specs/2026-09-13-c2-cinematic-product-house-design.md`.
- Read: `docs/superpowers/plans/2026-09-13-c2-cinematic-product-house-implementation.md`.
- Test: `tests/architecture/current-work-router.test.mjs`.

**Interface:** consume current repository governance and the approved C2 design; produce exactly one active C2 runtime wave in the current-work router.

- [ ] **Step 1: refresh live repository truth before creating a runtime branch.**

Run:

```bash
git fetch origin --prune
git checkout main
git pull --ff-only origin main
git log -10 --oneline
```

Also inspect open PRs/issues and compare newer spec/plan/current-work changes. If `main` materially changed after the planning baseline, record the reconciliation in wave evidence before runtime edits. The SHA in this plan is a handoff reference, not authority over newer repository truth.

- [ ] **Step 2: create an isolated worktree/branch.**

Use `superpowers:using-git-worktrees`. Scope the branch to the smallest active wave, for example `feat/c2-p1-home-contract`, never `feat/c2-all`.

- [ ] **Step 3: update the router honestly.**

Only the current runtime wave may become `IN_PROGRESS`; later C2 waves stay `PLANNED`. Preserve owner decisions and external/human residuals.

- [ ] **Step 4: verify the router contract.**

```bash
pnpm test:architecture -- --test-name-pattern="router"
```

Expected: current-work router tests pass and no owner/human item is promoted by automation.

- [ ] **Step 5: commit routing-only changes separately if the router changed.**

```bash
git add docs/current-work.json
git commit -m "docs(c2): activate current cinematic product house wave"
```

## Task 2: Resolve the public screenshot floor without inventing a product

**Files:**

- Modify only when evidence exists: `src/lib/product-schema.ts`.
- Modify: `tests/architecture/product-screenshot-floor.test.mjs`.
- Read: `src/content/products/README.md`.
- Create only from owner/repository truth: `src/content/products/<real-slug>.*`.
- Add only a real asset: `public/products/<real-slug>/<real-screenshot>.(avif|webp|png|jpg)`.
- Reuse existing publication and provenance suites.

**Interface:** consume real owner-approved/repository-verifiable identity, screenshot, action, lifecycle/availability, capabilities, evidence, source revision, and review metadata; produce public entries that fail closed when screenshot truth is absent.

- [ ] **Step 1: inventory facts, not aspirations.**

For each candidate, collect only facts already present in its repository, deployed artifact, or owner-approved source: product identity, customer outcome, lifecycle, availability, primary action, real screenshot, two or three capabilities, proof destinations, applicable privacy/security/support paths, source revision, and authored review date.

If no candidate has a real screenshot and sufficient truth, record the owner-fact blocker and **do not create a public record**. Later C2 structural work may continue against the honest empty-registry fallback.

- [ ] **Step 2: change the scaffold test first when real assets exist.**

The test must prove drafts can remain flexible while `public === true` cannot pass without screenshot proof. It must also prove the obsolete C1c open-decision marker is removed only when the real asset-backed flip happens.

- [ ] **Step 3: verify RED before schema implementation.**

```bash
node --test tests/architecture/product-screenshot-floor.test.mjs
```

Expected before implementation: the new public-floor assertion fails for the intended reason.

- [ ] **Step 4: implement the smallest public-only schema guard.**

Keep `proof.screenshot` structurally optional for non-public drafts if that remains useful, but inside the existing public-validation path emit a custom validation issue when a public record has no screenshot. Do not make the entire draft schema artificially stricter than the public publication contract requires.

- [ ] **Step 5: add real product content only from source truth.**

Use the existing collection format documented by `src/content/products/README.md`. Do not infer missing lifecycle, capability, contact, review date, or proof values from visual-design needs.

- [ ] **Step 6: verify product truth.**

```bash
pnpm test:architecture
pnpm check:publishability
pnpm check:product-provenance
pnpm build
pnpm check:static-links
```

Expected: repository-owned facts pass. Production-only owner facts remain explicitly blocked when unavailable rather than being converted into fake PASS evidence.

- [ ] **Step 7: commit the product-truth change independently.**

```bash
git add src/lib/product-schema.ts tests/architecture/product-screenshot-floor.test.mjs src/content/products public/products
git commit -m "feat(product): enforce real screenshot floor for public products"
```

If P0 is blocked, commit only router/evidence changes and leave runtime product truth untouched.

---

# Wave P1 — Experience Recomposition

## Task 3: Lock the six-act homepage contract before changing markup

**Files:**

- Create: `tests/architecture/c2-home-composition.test.mjs`.
- Modify later: `src/pages/en/index.astro`.
- Modify later: `src/pages/vi/index.astro`.

**Interface:** consume the approved six-act C2 narrative; produce a source-level regression contract that prevents homepage hierarchy from drifting back toward an SGPS/control-surface composition.

- [ ] **Step 1: write the failing composition contract.**

Both locale homepages must eventually render this source order: Hero → Flagship Theatre → Product House → One House → Trust → About → Next Step.

The same contract must reject direct homepage rendering of `ExperienceSpine`, `IntentLens`, and `Atlas`. Those capabilities remain valid elsewhere and must not be deleted simply because their homepage prominence is removed.

- [ ] **Step 2: run the new architecture test and prove RED.**

```bash
node --test tests/architecture/c2-home-composition.test.mjs
```

Expected: FAIL because the current homepage still follows the older S+ composition.

- [ ] **Step 3: add structural density proxies.**

The contract may enforce bounded CTA/status/control density and reject permanent power-user chrome, but it must not pretend to automate subjective visual quality.

- [ ] **Step 4: keep the failing test and implementation in the same task branch unless repository practice explicitly accepts a red intermediate commit.**

Final task commit should remain coherent and green.

## Task 4: Recompose EN/VI homepages into six acts

**Files:**

- Modify: `src/pages/en/index.astro`.
- Modify: `src/pages/vi/index.astro`.
- Create: `src/components/product/FlagshipTheatre.astro`.
- Create: `src/components/product/ProductHouse.astro`.
- Retire from homepage only: `src/components/sections/FlagshipProof.astro` and `src/components/sections/FeaturedProducts.astro` as needed.
- Test: `tests/architecture/c2-home-composition.test.mjs`.
- Create: `tests/e2e/c2-home.spec.ts`.

**Interface:** `FlagshipTheatre` consumes `CollectionEntry<"products"> | null`; `ProductHouse` consumes `CollectionEntry<"products">[]`; neither component authors product truth.

- [ ] **Step 1: implement semantic shell components with no cinematic dependency.**

`FlagshipTheatre` receives a real flagship or `null`. If it receives `null`, it renders no fabricated product. `ProductHouse` derives hierarchy only from the existing product collection and `featuredTier` metadata; it does not maintain a second featured registry.

- [ ] **Step 2: replace homepage component order in both locales.**

The source order must match the six-act contract. Remove homepage imports/renders of `ExperienceSpine`, `IntentLens`, and `Atlas`, but leave their components and tests intact.

- [ ] **Step 3: add desktop/mobile narrative E2E.**

Assert the hero and the Meaning, Trust, Human, and Action acts are present in EN and VI at desktop and 390px. When registry truth is empty, assert there is no fake flagship/product card. Fixture-backed tests may prove the published-product path without pretending fixture content is production truth.

- [ ] **Step 4: run targeted tests.**

```bash
node --test tests/architecture/c2-home-composition.test.mjs
pnpm build
npx playwright test tests/e2e/c2-home.spec.ts --project=chromium --project=mobile-chromium
```

- [ ] **Step 5: commit the semantic recomposition.**

```bash
git add src/pages/en/index.astro src/pages/vi/index.astro src/components/product tests/architecture/c2-home-composition.test.mjs tests/e2e/c2-home.spec.ts
git commit -m "feat(experience): recompose homepage into C2 narrative acts"
```

---

# Wave P2 — Art Direction Foundation

## Task 5: Build Horizon Arrival and the light/dark act system

**Files:**

- Modify: `src/components/sections/Hero.astro`.
- Modify: `src/components/experience/HorizonField.astro`.
- Create: `src/styles/cinematic-product-house.css`.
- Modify: `src/styles/global.css` only to import the focused stylesheet and expose genuinely global tokens.
- Create: `tests/e2e/c2-reduced-motion.spec.ts`.
- Modify: `tests/e2e/c2-home.spec.ts`.
- Reuse existing reduced-motion architecture contracts.

**Interface:** consume current brand lockup/assets/tokens and CTA/locale helpers; produce an immediately usable static hero with one primary CTA, at most one secondary action, and an integrated Horizon field rather than a framed brand-art card as the dominant visual.

- [ ] **Step 1: write hero/density E2E first.**

At desktop and mobile, assert the H1 and primary CTA are visible immediately, there are no more than two hero actions, animation completion is not required, and the hero causes no horizontal overflow.

- [ ] **Step 2: integrate the Horizon into the scene.**

Preserve server-rendered lockup, H1, supporting copy, and action. Remove the old framed 16:9 artwork presentation as the dominant right-side content card. A Brand Kit raster may remain atmospheric only if it adds real visual value without competing with the proposition.

- [ ] **Step 3: build a focused C2 act stylesheet.**

Define stable semantic classes for Ink/Porcelain acts, hero content layering, flagship/product-house composition, Horizon seams, and the closing signature. Reuse existing palette and motion tokens instead of creating a second design system.

- [ ] **Step 4: add narrative motion only behind motion-friendly conditions.**

Decorative transform/opacity/mask effects may run under `prefers-reduced-motion: no-preference`. Critical copy and actions must never start hidden.

- [ ] **Step 5: prove reduced-motion equivalence.**

With reduced motion emulated, hero content and actions remain visible and usable, signature/narrative transform travel is neutralized, and normal navigation remains unchanged.

- [ ] **Step 6: run gates.**

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
node --test tests/architecture/motion-reduce-contract.test.mjs
npx playwright test tests/e2e/c2-home.spec.ts tests/e2e/c2-reduced-motion.spec.ts --project=chromium --project=mobile-chromium
```

- [ ] **Step 7: commit the art-direction foundation.**

```bash
git add src/components/sections/Hero.astro src/components/experience/HorizonField.astro src/styles tests/e2e/c2-home.spec.ts tests/e2e/c2-reduced-motion.spec.ts
git commit -m "feat(brand): create C2 Horizon Arrival art direction"
```

## Task 6: Add C2 performance and truth-boundary contracts

**Files:**

- Create: `tests/architecture/c2-performance-contract.test.mjs`.
- Create: `tests/architecture/c2-truth-boundary.test.mjs`.
- Read: `package.json` and C2 components created above.

**Interface:** produce fail-closed guardrails preventing future agents from silently adding a UI framework, animation framework, initial-load WebGL/canvas scene, or duplicate product/claim registry.

- [ ] **Step 1: assert the current dependency boundary.**

The test should reject new C2 dependencies on React, Vue, Svelte, GSAP, Three.js, or equivalent runtime spectacle libraries unless a newer approved ADR explicitly changes the contract.

- [ ] **Step 2: assert canonical truth imports.**

`FlagshipTheatre`, `ProductHouse`, and future `EvidenceTeaser` must consume canonical product/claim selectors. Reject obvious local arrays that redefine product identity, claim text, evidence references, or truth-state meaning.

- [ ] **Step 3: assert no initial homepage WebGL/canvas dependency.**

A later experimental 3D scene needs its own approved GO gate; C2 core remains static-first.

- [ ] **Step 4: run the new contracts and commit.**

```bash
node --test tests/architecture/c2-performance-contract.test.mjs tests/architecture/c2-truth-boundary.test.mjs
git add tests/architecture/c2-performance-contract.test.mjs tests/architecture/c2-truth-boundary.test.mjs
git commit -m "test(c2): lock cinematic performance and truth boundaries"
```

---

# Wave P3 — Product Storytelling

## Task 7: Implement Flagship Theatre from real product truth

**Files:**

- Modify: `src/components/product/FlagshipTheatre.astro`.
- Refactor/remove homepage use of: `src/components/sections/FlagshipProof.astro` as appropriate.
- Reuse: `src/components/product/ProductStatus.astro`, product route helpers, and existing evidence details only where secondary.
- Modify: `tests/e2e/c2-home.spec.ts`.
- Reuse existing product/evidence tests.

**Interface:** consume the single real flagship chosen by `getFlagshipProduct()`; produce a product-led visual with screenshot, status, outcome, capabilities, and canonical action/profile route. No authored facts live inside the component.

- [ ] **Step 1: add fixture-backed product-path tests.**

Use the existing product parity fixture to prove name, status, screenshot, capability, and action rendering without pretending fixture data is production publication truth.

- [ ] **Step 2: make the screenshot the visual protagonist.**

Use intrinsic screenshot dimensions and meaningful alt text. Measure before choosing eager/lazy loading because the theatre sits immediately after hero and may affect LCP.

- [ ] **Step 3: keep status and capabilities subordinate.**

Show one factual status family and two or three capabilities directly from product data. Do not write new marketing capability claims in the component.

- [ ] **Step 4: add restrained desktop-only spatial enhancement.**

Small perspective/rotation/settling is allowed only when motion is welcome and viewport/context support it. Mobile gets a direct frontal editorial layout.

- [ ] **Step 5: verify empty-registry honesty.**

No real public product means no invented product art, fake screenshot, placeholder app shell, or fake product CTA.

- [ ] **Step 6: run product and evidence gates.**

```bash
pnpm build
pnpm check:publishability
pnpm check:product-provenance
npx playwright test tests/e2e/c2-home.spec.ts tests/e2e/evidence-depth.spec.ts tests/e2e/empty-and-404.spec.ts --project=chromium --project=mobile-chromium
```

- [ ] **Step 7: commit.**

```bash
git add src/components/product/FlagshipTheatre.astro src/components/sections/FlagshipProof.astro tests/e2e/c2-home.spec.ts
git commit -m "feat(product): add truth-driven flagship theatre"
```

## Task 8: Implement Product House editorial hierarchy

**Files:**

- Modify: `src/components/product/ProductHouse.astro`.
- Reuse/refactor: `src/components/product/ProductCard.astro`.
- Leave `src/components/sections/FeaturedProducts.astro` as compatibility wrapper or retire only its homepage use.
- Modify: `tests/e2e/c2-home.spec.ts`.

**Interface:** consume the public product list; produce semantic product links with flagship, secondary, and ecosystem hierarchy. Mobile is a vertical editorial stack; desktop may use a native scroll/rail treatment only as enhancement.

- [ ] **Step 1: prove hierarchy against fixture products.**

`featuredTier=hero` must be distinguished without hiding secondary/ecosystem products or giving every product equal visual weight.

- [ ] **Step 2: implement no-JS semantic layout first.**

Use normal DOM order and normal links. If desktop uses native horizontal overflow/scroll snap, every product remains reachable by keyboard and ordinary scrolling, and mobile does not inherit a cramped rail.

- [ ] **Step 3: preserve literal action semantics.**

Reuse existing action labels and product route helpers. Do not replace truthful actions with cinematic copy such as “Enter the future”.

- [ ] **Step 4: verify mobile and 200% text.**

```bash
npx playwright test tests/e2e/c2-home.spec.ts tests/e2e/mobile-overflow.spec.ts tests/e2e/text-zoom.spec.ts --project=chromium --project=mobile-chromium
```

- [ ] **Step 5: commit.**

```bash
git add src/components/product/ProductHouse.astro src/components/product/ProductCard.astro src/components/sections/FeaturedProducts.astro tests/e2e/c2-home.spec.ts
git commit -m "feat(product): add editorial Product House hierarchy"
```

## Task 9: Add native product continuity while ordinary navigation remains authority

**Files:**

- Create: `tests/e2e/c2-product-continuity.spec.ts`.
- Modify only product image/link components that need stable native transition names.
- Modify `src/styles/cinematic-product-house.css` only if transition styling is needed.

**Interface:** consume canonical product slug/profile helpers; produce optional cross-document visual continuity without click interception or SPA routing.

- [ ] **Step 1: write the normal-navigation baseline first.**

With decorative motion effectively disabled, clicking a product link must load the canonical localized product profile URL and heading.

- [ ] **Step 2: add stable native transition names from the already-constrained product slug.**

Ensure only one source and one destination element per document use a matching transition name; duplicate names must never break navigation.

- [ ] **Step 3: capability-detect only.**

Use native View Transition support where available. Do not intercept clicks or add a client router.

- [ ] **Step 4: verify reduced motion and browser fallbacks.**

```bash
npx playwright test tests/e2e/c2-product-continuity.spec.ts --project=chromium --project=firefox --project=webkit
```

- [ ] **Step 5: commit.**

```bash
git add tests/e2e/c2-product-continuity.spec.ts src/components/product src/styles/cinematic-product-house.css
git commit -m "feat(experience): add native product continuity"
```

---

# Wave P4 — Meaning and Trust Progressive Disclosure

## Task 10: Reframe One House as an editorial interlude

**Files:**

- Modify: `src/components/sections/OneHouse.astro`.
- Stop homepage dependency on `src/components/experience/OneHouseMatrix.astro` unless a simplified non-card version still has a distinct information job.
- Preserve the matrix component/tests if used elsewhere.
- Modify: `src/styles/cinematic-product-house.css`.
- Modify: `tests/e2e/c2-home.spec.ts`.

**Interface:** consume approved BlueSkyz philosophy; produce four plain-language ideas with EN/VI parity: Clarity, Human agency, Purposeful intelligence, Trust by design.

- [ ] **Step 1: write EN/VI parity assertions for the four concepts.**

Internal architecture names are not visitor prerequisites.

- [ ] **Step 2: replace equal icon/card treatment with editorial hierarchy.**

Use semantic headings/list structure, large type, space, and restrained transitions. Every concept remains present in HTML without animation.

- [ ] **Step 3: verify the copy does not imply every product uses AI or the same technology.**

- [ ] **Step 4: run bilingual/mobile/zoom suites.**

```bash
npx playwright test tests/e2e/c2-home.spec.ts tests/e2e/bilingual-parity.spec.ts tests/e2e/text-zoom.spec.ts --project=chromium --project=mobile-chromium
```

- [ ] **Step 5: commit.**

```bash
git add src/components/sections/OneHouse.astro src/styles/cinematic-product-house.css tests/e2e/c2-home.spec.ts
git commit -m "feat(brand): reframe One House as editorial philosophy"
```

## Task 11: Add compact Trust and canonical Evidence Teaser

**Files:**

- Modify: `src/components/sections/Trust.astro`.
- Create: `src/components/integrity/EvidenceTeaser.astro`.
- Reuse: `src/lib/claims.ts`, `src/data/integrity.ts`, route helpers, and existing truth-state presentation primitives.
- Create: `tests/e2e/c2-evidence-teaser.spec.ts`.
- Modify: `tests/architecture/c2-truth-boundary.test.mjs`.

**Interface:** consume the canonical public claim/evidence graph; produce a compact homepage proof layer and on-demand evidence disclosure that deep-links to existing passport/context surfaces.

- [ ] **Step 1: select only claims already modeled for the relevant public surface.**

Do not create a new marketing claim array. If a pure selector is missing, add a selector that returns existing modeled claims without duplicating truth.

- [ ] **Step 2: write the truth-boundary test first.**

Require `EvidenceTeaser` to import canonical selectors and reject a local claim/evidence registry.

- [ ] **Step 3: implement native disclosure first.**

Prefer semantic `details`/`summary` so no-JS remains functional. Render claim, authored truth-state wording, optional boundary, safe public evidence links, and a deep-verification destination when available.

- [ ] **Step 4: write E2E for keyboard, disclosure, no-JS, deep-link resolution, and assurance-language boundaries.**

- [ ] **Step 5: run integrity/evidence suites.**

```bash
pnpm check:integrity-firewall
npx playwright test tests/e2e/c2-evidence-teaser.spec.ts tests/e2e/evidence-passport.spec.ts tests/e2e/source-trace.spec.ts --project=chromium
```

- [ ] **Step 6: commit.**

```bash
git add src/components/sections/Trust.astro src/components/integrity/EvidenceTeaser.astro src/lib/claims.ts tests/architecture/c2-truth-boundary.test.mjs tests/e2e/c2-evidence-teaser.spec.ts
git commit -m "feat(trust): add progressive evidence disclosure"
```

---

# Wave P5 — Human Layer, Closing Signature, Secondary Surfaces

## Task 12: Refine About, final action, and closing Horizon signature

**Files:**

- Modify: `src/components/sections/AboutBlueSkyz.astro`.
- Modify: `src/components/sections/NextStep.astro`.
- Reuse: `src/components/experience/HorizonField.astro`.
- Modify: `src/styles/cinematic-product-house.css`.
- Modify: `tests/e2e/c2-home.spec.ts`.

**Interface:** consume existing factual About/founder content and `src/lib/act.ts` fallback/action rules; produce an intentional human trust moment and one strong final customer action.

- [ ] **Step 1: inventory factual content and remove placeholder feeling without inventing facts.**

No new biography, team size, office claims, customer logos, or photography unless independently source-authorized.

- [ ] **Step 2: make the final CTA data-driven.**

When real products exist, product exploration is normally primary. When registry/contact truth is empty, preserve the existing `act.ts` safe soft-land behavior.

- [ ] **Step 3: reuse Horizon once as the closing signature.**

The closing field is decorative and secondary to the CTA, hidden from assistive technology, and motion-neutral under reduced motion.

- [ ] **Step 4: test CTA count and destinations.**

C2 home E2E must enforce one primary final action and at most one secondary action with valid destinations.

- [ ] **Step 5: commit.**

```bash
git add src/components/sections/AboutBlueSkyz.astro src/components/sections/NextStep.astro src/components/experience/HorizonField.astro src/styles/cinematic-product-house.css tests/e2e/c2-home.spec.ts
git commit -m "feat(experience): refine human layer and closing signature"
```

## Task 13: Converge secondary public surfaces without cloning homepage cinema

**Files:**

- Review and modify only where hierarchy is inconsistent: product index/profile, About, Security, Privacy, Support, Contact, Evidence Passport, 404, BaseLayout/shared section primitives.
- Reuse C2 plane/typography tokens rather than adding unique cinematic scenes to every route.
- Add focused E2E only for changed behavior; otherwise extend existing suites.

**Interface:** consume C2 visual primitives and existing route truth; produce coherent family resemblance while keeping task/verification pages calm, readable, and fast.

- [ ] **Step 1: render a route matrix at 1440px and 390px.**

Inspect at minimum EN/VI home, product index, one product-profile fixture, About, Security, Privacy, Support, Contact, Evidence Passport, and 404.

- [ ] **Step 2: classify each real defect.**

Use hierarchy, spacing, typography, surface, action, evidence-density, or mobile categories. Do not touch routes with no meaningful defect.

- [ ] **Step 3: fix root causes with shared C2 primitives.**

Avoid one-off page gradients/shadows. Secondary routes inherit the Product House frame; they do not each become a marketing microsite.

- [ ] **Step 4: run all affected existing suites.**

Include markup baseline, accessibility, evidence/passport, recovery/404, mobile overflow, text zoom, text spacing, and forced colors.

- [ ] **Step 5: split commits/PRs if the surface set becomes broad.**

Prefer coherent groups such as product/about convergence and trust/recovery convergence over one giant visual patch.

---

# Wave P6 — Elite QA, Red Team, Promotion, Production Evidence

## Task 14: Run the full quality, security, and performance gate set

**Files:**

- Create wave evidence under `docs/evidence/`.
- Update: `docs/current-work.json`.
- Do not alter runtime unless verification reproduces a real defect.

**Interface:** produce exact-head evidence only. No stale run survives a material push.

- [ ] **Step 1: run deterministic source gates on exact head.**

```bash
pnpm install --frozen-lockfile
pnpm audit
pnpm test:architecture
pnpm architecture:views:check
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm check:client-budget
pnpm check:static-links
pnpm check:publishability
pnpm check:integrity-firewall
pnpm verify:git-evidence
pnpm check:promotion-state
pnpm check:deployment-evidence
pnpm check:product-provenance
```

Production-owner facts that are unavailable in source context remain blocked honestly; do not coerce them into PASS.

- [ ] **Step 2: run browser assurance locally when the environment supports it.**

```bash
pnpm test:e2e
pnpm lighthouse
```

If a local environment cannot execute a configured browser family, record the exact limitation and rely on the repository's exact-head Browser Assurance rather than claiming a local PASS that did not occur.

- [ ] **Step 3: measure client delta.**

Record total site client JS and worst-page Brotli bytes before/after the wave. If C2 adds an unexpectedly large delta, identify the exact module/asset and reduce it before promotion. Raising the budget is not the first fix.

- [ ] **Step 4: verify edge modes explicitly.**

Cover no-JS critical journeys, reduced motion, forced colors, text spacing, 200% zoom, 320px/390px mobile, keyboard-only operation, and print for evidence surfaces.

- [ ] **Step 5: commit evidence/router updates.**

```bash
git add docs/evidence docs/current-work.json
git commit -m "docs(evidence): record C2 exact-head verification"
```

## Task 15: Independent visual and red-team review

**Files:**

- Evidence ledger under `docs/evidence/`.
- Runtime changes only when review finds a reproducible defect.

**Interface:** produce honest visual findings and dispositions. Visual score targets are review heuristics, never machine truth.

- [ ] **Step 1: capture the core matrix.**

Capture at least 1440px and 390px for all changed core surfaces, plus a representative 320px homepage/product view.

- [ ] **Step 2: review against the C2 acceptance bar.**

Evaluate first-impression clarity, product visual primacy, premium restraint, cinematic memorability, hierarchy/density, mobile composition, bilingual typography, trust/evidence depth, CTA clarity, and generic-template risk.

- [ ] **Step 3: red-team the wow factor.**

Reject any effect where motion competes with product, screenshots become too small to inspect, card/pill density returns, mobile becomes a crippled desktop port, evidence jumps ahead of product value, generic AI/aurora/template styling appears, or accessibility/performance regresses.

- [ ] **Step 4: fix only reproduced defects and rerun affected gates.**

Do not change runtime solely to chase a subjective score when the change would reduce clarity, truth, accessibility, or performance.

## Task 16: PR promotion and production read-back

**Files:**

- PR description/evidence.
- Deployment evidence/current-work only after real provider results.

**Interface:** produce a merged wave only when exact-head evidence is objectively green, then use provider/runtime evidence to prove the promoted revision.

- [ ] **Step 1: push the wave branch and open a PR.**

PR body must state wave scope, exact truth sources, before/after behavior, client-byte delta, tests run, owner-gated facts still open, and explicit non-goals.

- [ ] **Step 2: require exact-head `Quality Gates` and `Browser Assurance`.**

Never merge red, stale, unexpectedly skipped, or different-head checks.

- [ ] **Step 3: resolve review threads/conflicts and merge only when repository governance permits it.**

No bypass.

- [ ] **Step 4: verify Cloudflare production deployment/read-back for runtime waves.**

Use the repository smoke path against the actual deployed revision. Verify EN/VI home, affected product/trust routes, branded 404, SGPS manifest, security.txt, redirects, and C2 homepage markers.

- [ ] **Step 5: record post-merge evidence and mark only the proven wave `MERGED`.**

Provider/runtime evidence outranks authored intent.

---

# Execution Sequence and PR Boundaries

Use this dependency order. Do not combine the full program into one PR.

1. **P0 / PR-A — Product truth floor.** Execute only when real product assets/facts exist; otherwise record the blocker and continue structural C2 work honestly.
2. **P1 / PR-B — Homepage composition contract + semantic recomposition.** No heavy art direction yet.
3. **P2 / PR-C — Horizon Arrival + act visual system + C2 architecture guards.**
4. **P3 / PR-D — Flagship Theatre + Product House hierarchy.** If P0 remains blocked, implement/test against fixture truth without faking production product content.
5. **P4 / PR-E — One House editorial + progressive Evidence Teaser.**
6. **P5 / PR-F — About/final action/closing signature + secondary surface convergence.** Split secondary-surface work again if the file set becomes broad.
7. **P6 / PR-G — Final cross-surface red-team hardening/evidence only if defects require runtime changes.** Otherwise attach evidence to the final relevant runtime PR/post-merge ledger.

At every PR boundary, refresh `main` and re-evaluate whether later tasks are still necessary. Do not mechanically implement work that newer evidence makes obsolete.

# Program Exit Criteria

C2 may be declared complete only when:

- EN and VI homepages follow the six-act narrative.
- Experience Spine, Intent Lens, and Atlas no longer compete on the homepage while their capabilities remain available or intentionally routed.
- Every published product visual comes from real product truth.
- At least one real public product exists before the full Flagship Theatre outcome is claimed complete.
- Static/no-JS state is independently premium and usable.
- Reduced-motion state carries identical information and actions.
- Homepage/mobile rendered review reaches the target quality bar without fabricated evidence.
- Architecture/source/browser/accessibility/performance/security gates remain green.
- Client budget is not weakened.
- No new telemetry is introduced without the existing privacy/provider decision.
- Exact-head production deployment is read back successfully for runtime waves.
- Human E4 remains owner-run until real participants actually run it.

# Self-Review Result

- **Spec coverage:** P0–P6, six-act IA, five signature moments, progressive SGPS depth, native motion, View Transitions, mobile doctrine, performance, accessibility, privacy, WebGL gate, and release doctrine all map to explicit tasks.
- **Placeholder scan:** no task relies on invented product/customer/evidence facts. Missing real product facts become explicit blockers rather than TODO content.
- **Type/interface consistency:** `FlagshipTheatre` consumes `CollectionEntry<"products"> | null`; `ProductHouse` consumes `CollectionEntry<"products">[]`; both remain consumers of the existing public product collection. `EvidenceTeaser` consumes canonical claim/evidence selectors rather than a new registry.
- **Scope:** broad but sequential. Every PR boundary yields independently testable working software and can be revised without forcing the whole program to merge.
