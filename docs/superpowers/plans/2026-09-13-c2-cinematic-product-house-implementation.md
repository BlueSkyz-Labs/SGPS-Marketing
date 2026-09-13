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

## 0. File/Responsibility Map

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
- `src/styles/global.css` — token-level/global behavior only. If C2 styles add substantial component-specific blocks, create the focused stylesheet below rather than continuing to grow one global file.
- `src/lib/product-schema.ts` — public screenshot/publication floor only after real asset truth exists.
- `docs/current-work.json` — wave/evidence routing.

### Expected focused additions

- `src/styles/cinematic-product-house.css` — C2 act layout, cinematic planes, Horizon transitions, flagship/product-house art direction, reduced-motion overrides when those rules are not globally reusable.
- `src/components/product/FlagshipTheatre.astro` — flagship product visual narrative consuming only one real public product entry.
- `src/components/product/ProductHouse.astro` — editorial portfolio composition consuming the existing public product list.
- `src/components/integrity/EvidenceTeaser.astro` — compact progressive disclosure derived from canonical claim/evidence selectors, never a second registry.
- `src/lib/c2-home.ts` — pure selector/composition helpers only if needed; must not contain authored product/claim truth.

### Expected tests

- `tests/architecture/c2-home-composition.test.mjs` — homepage ordering/density/supersession contract.
- `tests/architecture/c2-truth-boundary.test.mjs` — cinematic layer cannot define product/claim truth and uses canonical selectors.
- `tests/architecture/c2-performance-contract.test.mjs` — bans new framework/animation/WebGL critical dependencies and pins progressive media rules.
- `tests/e2e/c2-home.spec.ts` — desktop/mobile six-act flow and content.
- `tests/e2e/c2-reduced-motion.spec.ts` — reduced-motion equivalence.
- `tests/e2e/c2-evidence-teaser.spec.ts` — progressive evidence disclosure + no-JS baseline.
- `tests/e2e/c2-product-continuity.spec.ts` — ordinary navigation authoritative; View Transition enhancement optional.
- Existing suites remain authoritative and must be run where touched: `accessibility`, `bilingual-*`, `mobile-overflow`, `text-zoom`, `text-spacing`, `forced-colors`, `evidence-*`, `product-*`, `source-trace`, `empty-and-404`, `markup-baseline`, `print-surface`, and relevant command/atlas tests.

---

# Wave P0 — Product Truth Activation

## Task 1: Refresh live state and establish the C2 execution router

**Files:**
- Read: `AGENTS.md`
- Read/Modify: `docs/current-work.json`
- Read: `docs/superpowers/specs/2026-09-13-c2-cinematic-product-house-design.md`
- Read: `docs/superpowers/plans/2026-09-13-c2-cinematic-product-house-implementation.md`
- Test: `tests/architecture/current-work-router.test.mjs`

**Interfaces:**
- Consumes: current repository governance and C2 approved design.
- Produces: exactly one active C2 wave in `docs/current-work.json`; all later tasks use it as the work router.

- [ ] **Step 1: refresh live repository truth before creating a runtime branch**

Run:

```bash
git fetch origin --prune
git checkout main
git pull --ff-only origin main
git log -10 --oneline
```

Also inspect open PRs/issues and compare any newer spec/plan/current-work changes. If `main` materially changed after the planning baseline, write the reconciliation into the wave evidence before runtime edits; never blindly use the SHA in this document.

- [ ] **Step 2: create an isolated C2 worktree/branch**

Use `superpowers:using-git-worktrees`. The first runtime branch should be scoped to the smallest approved wave, for example `feat/c2-p1-home-contract`, not `feat/c2-all`.

- [ ] **Step 3: mark only the current runtime wave `IN_PROGRESS`**

Update `docs/current-work.json` so only one wave is `IN_PROGRESS`; the remaining C2 waves remain `PLANNED`. Preserve open owner decisions and external/human residuals.

- [ ] **Step 4: verify router contract**

Run:

```bash
pnpm test:architecture -- --test-name-pattern="router"
```

Expected: current-work router tests pass; no owner/human item is promoted by automation.

- [ ] **Step 5: commit the routing-only change if needed**

```bash
git add docs/current-work.json
git commit -m "docs(c2): activate current cinematic product house wave"
```

## Task 2: Resolve the public screenshot floor without inventing a product

**Files:**
- Modify only when evidence exists: `src/lib/product-schema.ts`
- Modify: `tests/architecture/product-screenshot-floor.test.mjs`
- Read: `src/content/products/README.md`
- Potentially create from owner/repository truth only: `src/content/products/<real-slug>.*`
- Potentially add real asset only: `public/products/<real-slug>/<real-screenshot>.(avif|webp|png|jpg)`
- Test existing publication/provenance suites.

**Interfaces:**
- Consumes: real owner-approved/repository-verifiable product identity, screenshot asset, action, lifecycle/availability, capabilities, evidence, source revision.
- Produces: public product entries that cannot pass publication without a real screenshot; `getPublicProducts()` remains the only public product source.

- [ ] **Step 1: inventory facts, not aspirations**

For every candidate product, collect only facts already present in its repository/deployed artifact/owner-approved source: name, customer outcome, lifecycle, availability, action URL, real screenshot, 2–3 capabilities, proof destinations, support/privacy/security path as applicable, source revision, review date.

If no candidate has a real screenshot and sufficient product truth, record `BLOCKED_OWNER_FACT`/equivalent evidence and **do not create a public product record**. Continue later C2 structural tasks against the honest empty-registry fallback.

- [ ] **Step 2: change the scaffold test first when real assets exist**

Replace the old “screenshot optional / decision open” assertion with a public-floor assertion. The intended contract is that drafts may omit screenshots but `public === true` cannot.

Example test shape:

```js
test("a public product requires real screenshot proof", () => {
  assert.match(schema, /if \(!value\.proof\.screenshot\)/);
  assert.match(schema, /public product requires screenshot proof/);
  assert.doesNotMatch(schema, /OPEN DECISION \(owner, #125 C1c/);
});
```

Do not encode a brittle exact implementation if the schema can express the same fail-closed rule more clearly.

- [ ] **Step 3: run the architecture test and confirm it fails before the schema change**

```bash
node --test tests/architecture/product-screenshot-floor.test.mjs
```

Expected before implementation: FAIL on the new mandatory-public-floor assertion.

- [ ] **Step 4: implement the smallest public-only schema guard**

Prefer preserving draft flexibility while failing public products closed. In `superRefine`, inside the existing `if (!value.public) return` public section, add the screenshot requirement before publication can succeed:

```ts
if (!value.proof.screenshot) {
  ctx.addIssue({
    code: "custom",
    path: ["proof", "screenshot"],
    message: "public product requires screenshot proof",
  });
}
```

Remove the obsolete open-decision comment once the real asset-backed flip is actually executed.

- [ ] **Step 5: add the real product asset/record only from source truth**

Use the existing collection format documented by `src/content/products/README.md`. Do not infer missing lifecycle, capability, contact, or proof values from visual design needs.

- [ ] **Step 6: verify product truth**

Run:

```bash
pnpm test:architecture
pnpm check:publishability
pnpm check:product-provenance
pnpm build
pnpm check:static-links
```

Expected: PASS for all repository-owned facts. If production-only truth is unavailable locally, preserve its explicit blocked semantics rather than claiming PASS.

- [ ] **Step 7: commit separately**

```bash
git add src/lib/product-schema.ts tests/architecture/product-screenshot-floor.test.mjs src/content/products public/products
git commit -m "feat(product): enforce real screenshot floor for public products"
```

If P0 is blocked for lack of real owner facts, commit only the evidence/router state; do not commit fake product data.

---

# Wave P1 — Experience Recomposition

## Task 3: Lock the six-act homepage contract before changing markup

**Files:**
- Create: `tests/architecture/c2-home-composition.test.mjs`
- Modify later: `src/pages/en/index.astro`
- Modify later: `src/pages/vi/index.astro`

**Interfaces:**
- Consumes: C2 six-act design.
- Produces: source-level regression contract preventing Experience Spine, Intent Lens, or Atlas from returning as prominent homepage dependencies and preventing narrative-order drift.

- [ ] **Step 1: write the failing source contract**

The test should require both locale homepages to render the same C2 component order and reject the three demoted homepage systems.

Example core assertions:

```js
for (const path of ["src/pages/en/index.astro", "src/pages/vi/index.astro"]) {
  const source = readFileSync(path, "utf8");
  const hero = source.indexOf("<Hero");
  const flagship = source.indexOf("<FlagshipTheatre");
  const house = source.indexOf("<ProductHouse");
  const oneHouse = source.indexOf("<OneHouse");
  const trust = source.indexOf("<Trust");
  const about = source.indexOf("<AboutBlueSkyz");
  const next = source.indexOf("<NextStep");

  assert.ok(hero >= 0 && flagship > hero && house > flagship);
  assert.ok(oneHouse > house && trust > oneHouse && about > trust && next > about);
  assert.doesNotMatch(source, /<ExperienceSpine\b/);
  assert.doesNotMatch(source, /<IntentLens\b/);
  assert.doesNotMatch(source, /<Atlas\b/);
}
```

The implementation may conditionally render Flagship Theatre/Product House from real product truth; the components themselves must still occupy the narrative positions.

- [ ] **Step 2: run and prove RED**

```bash
node --test tests/architecture/c2-home-composition.test.mjs
```

Expected: FAIL because current homepages still render Experience Spine/Intent Lens/Atlas and do not use the C2 components.

- [ ] **Step 3: add a density guard to the same test**

Assert that the homepage source does not introduce additional permanent power-user systems. Keep the check structural, not aesthetic; human visual quality remains separate.

- [ ] **Step 4: commit the failing contract only if project TDD practice permits red commits on the feature branch; otherwise keep it in the same task commit after implementation**

Final task commit message:

```bash
git commit -m "test(experience): define C2 homepage composition contract"
```

## Task 4: Recompose EN/VI homepages into six acts

**Files:**
- Modify: `src/pages/en/index.astro`
- Modify: `src/pages/vi/index.astro`
- Create: `src/components/product/FlagshipTheatre.astro`
- Create: `src/components/product/ProductHouse.astro`
- Modify or retire from homepage only: `src/components/sections/FlagshipProof.astro`
- Modify or retire from homepage only: `src/components/sections/FeaturedProducts.astro`
- Test: `tests/architecture/c2-home-composition.test.mjs`
- Create: `tests/e2e/c2-home.spec.ts`

**Interfaces:**
- Consumes: `getPublicProducts()`, `getFlagshipProduct()`, existing locale types/labels and route helpers.
- Produces: `<FlagshipTheatre product={flagship} lang={...} />` and `<ProductHouse products={products} lang={...} />`; no new truth registry.

- [ ] **Step 1: implement semantic shell components with no cinematic dependency**

`FlagshipTheatre.astro` props:

```ts
interface Props {
  product: CollectionEntry<"products"> | null;
  lang: Language;
}
```

If `product` is null, render no fabricated flagship. The homepage remains coherent because Hero/OneHouse/Trust/About/NextStep still render and ProductHouse may render an honest empty product invitation only if existing contract copy supports it.

`ProductHouse.astro` props:

```ts
interface Props {
  products: CollectionEntry<"products">[];
  lang: Language;
}
```

Derive hierarchy only from `featuredTier` and existing display ordering; do not create a second manually-maintained featured list.

- [ ] **Step 2: replace homepage component order**

Target source order in both locale pages:

```astro
<Hero lang="..." />
<FlagshipTheatre product={flagship} lang="..." />
<ProductHouse products={products} lang="..." />
<OneHouse lang="..." />
<Trust lang="..." />
<AboutBlueSkyz lang="..." />
<NextStep lang="..." />
```

Remove homepage imports/renders of `ExperienceSpine`, `IntentLens`, and `Atlas`. Do **not** delete those components or their tests.

- [ ] **Step 3: add basic E2E narrative assertions**

In `tests/e2e/c2-home.spec.ts`, verify EN and VI at desktop and 390px:

```ts
await expect(page.locator("#hero-title")).toBeVisible();
await expect(page.locator("[data-c2-act='meaning']")).toBeVisible();
await expect(page.locator("[data-c2-act='trust']")).toBeVisible();
await expect(page.locator("[data-c2-act='human']")).toBeVisible();
await expect(page.locator("[data-c2-act='action']")).toBeVisible();
```

When the registry is empty, assert no fake flagship/product card is present. When fixture products are used in the parity fixture, assert the flagship appears from fixture truth.

- [ ] **Step 4: run targeted tests**

```bash
node --test tests/architecture/c2-home-composition.test.mjs
pnpm build
npx playwright test tests/e2e/c2-home.spec.ts --project=chromium --project=mobile-chromium
```

Expected: PASS.

- [ ] **Step 5: commit**

```bash
git add src/pages/en/index.astro src/pages/vi/index.astro src/components/product tests/architecture/c2-home-composition.test.mjs tests/e2e/c2-home.spec.ts
git commit -m "feat(experience): recompose homepage into C2 narrative acts"
```

---

# Wave P2 — Art Direction Foundation

## Task 5: Build Horizon Arrival and the light/dark act system

**Files:**
- Modify: `src/components/sections/Hero.astro`
- Modify: `src/components/experience/HorizonField.astro`
- Create: `src/styles/cinematic-product-house.css`
- Modify: `src/styles/global.css` to import the focused stylesheet and expose only genuinely global tokens.
- Create: `tests/e2e/c2-reduced-motion.spec.ts`
- Modify: `tests/e2e/c2-home.spec.ts`
- Existing test: motion/reduced-motion architecture contracts.

**Interfaces:**
- Consumes: current BrandLockup, Brand Kit assets/tokens, existing ButtonLink and locale labels.
- Produces: static-first hero with one primary CTA, at most one secondary action, integrated Horizon field, no framed brand-art card requirement.

- [ ] **Step 1: write hero/density E2E assertions first**

At desktop and mobile, assert:

- H1 visible immediately;
- primary CTA visible;
- no more than two hero actions;
- no dependency on animation for visibility;
- no horizontal overflow.

Use real DOM selectors (`data-c2-hero`, `data-c2-primary-action`) rather than screenshot pixel assumptions.

- [ ] **Step 2: change Hero from “copy + framed 16:9 brand artwork” to integrated scene**

Preserve server-rendered BrandLockup/H1/support/action. Remove the `hero-art-frame` presentation as the dominant right-side framed card. If the Brand Kit hero raster remains useful, use it only as an atmospheric/picture layer that does not become a second competing content card; otherwise the existing CSS/SVG Horizon primitive is sufficient.

- [ ] **Step 3: define C2 act classes in the focused stylesheet**

Create stable, semantic classes such as:

```css
.c2-act { position: relative; isolation: isolate; }
.c2-act--ink { background: var(--brand-ink); color: var(--brand-porcelain); }
.c2-act--porcelain { background: var(--brand-porcelain); color: var(--text-primary); }
.c2-hero__content { position: relative; z-index: 2; }
```

Use existing tokens. Do not invent a second color system.

- [ ] **Step 4: implement optional narrative motion behind `prefers-reduced-motion: no-preference`**

Use transforms/opacity/masks only for decorative layers. The H1, supporting text, and CTA must not begin hidden.

- [ ] **Step 5: implement explicit reduced-motion equivalence**

In `c2-reduced-motion.spec.ts`, emulate reduced motion and verify:

```ts
await page.emulateMedia({ reducedMotion: "reduce" });
await page.goto("/en/");
await expect(page.locator("#hero-title")).toBeVisible();
await expect(page.locator("[data-c2-primary-action]")).toBeVisible();
```

Also inspect computed styles for the signature/narrative transform elements and require `animation-name: none` or equivalent neutralization according to the existing motion contract.

- [ ] **Step 6: run gates**

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
node --test tests/architecture/motion-reduce-contract.test.mjs
npx playwright test tests/e2e/c2-home.spec.ts tests/e2e/c2-reduced-motion.spec.ts --project=chromium --project=mobile-chromium
```

- [ ] **Step 7: commit**

```bash
git add src/components/sections/Hero.astro src/components/experience/HorizonField.astro src/styles tests/e2e/c2-home.spec.ts tests/e2e/c2-reduced-motion.spec.ts
git commit -m "feat(brand): create C2 Horizon Arrival art direction"
```

## Task 6: Add the C2 performance/truth boundary contracts

**Files:**
- Create: `tests/architecture/c2-performance-contract.test.mjs`
- Create: `tests/architecture/c2-truth-boundary.test.mjs`
- Read: `package.json`
- Read: C2 components created in prior tasks.

**Interfaces:**
- Produces: guardrails that future agent changes cannot silently add framework/animation/WebGL dependencies or duplicate truth.

- [ ] **Step 1: write dependency bans**

Assert `package.json` contains Astro but no newly-added React/Vue/Svelte/GSAP/Three dependency for C2.

Example:

```js
for (const name of ["react", "vue", "svelte", "gsap", "three"]) {
  assert.equal(pkg.dependencies?.[name] ?? pkg.devDependencies?.[name], undefined);
}
```

Do not globally ban a dependency if a future ADR legitimately adds it; this contract represents current C2 authority and must change only with that ADR.

- [ ] **Step 2: assert homepage cinematic components consume canonical product/claim modules**

Reject local arrays that redefine product identities or claim/evidence text inside `FlagshipTheatre`, `ProductHouse`, and `EvidenceTeaser`. The exact test should look for imports from canonical selectors and reject obvious `const products = [...]` / duplicated claim registry patterns.

- [ ] **Step 3: assert no initial WebGL/canvas dependency in C2 home components**

Reject `<canvas>` and WebGL imports in the C2 homepage component set.

- [ ] **Step 4: run the new architecture tests**

```bash
node --test tests/architecture/c2-performance-contract.test.mjs tests/architecture/c2-truth-boundary.test.mjs
```

Expected: PASS.

- [ ] **Step 5: commit**

```bash
git add tests/architecture/c2-performance-contract.test.mjs tests/architecture/c2-truth-boundary.test.mjs
git commit -m "test(c2): lock cinematic performance and truth boundaries"
```

---

# Wave P3 — Product Storytelling

## Task 7: Implement Flagship Theatre from real product truth

**Files:**
- Modify: `src/components/product/FlagshipTheatre.astro`
- Potentially refactor/remove homepage use of: `src/components/sections/FlagshipProof.astro`
- Reuse: `src/components/product/ProductStatus.astro`
- Reuse: product route helpers and `EvidenceDetails` only where it remains secondary.
- Modify: `tests/e2e/c2-home.spec.ts`
- Existing product/evidence tests.

**Interfaces:**
- Consumes: one `CollectionEntry<"products"> | null` chosen by `getFlagshipProduct()`.
- Produces: product-led visual with screenshot, status, outcome, capabilities, action/profile route; no authored facts in component.

- [ ] **Step 1: add fixture-backed test for a real-shaped flagship**

Use the repository's existing product parity fixture rather than hard-coding a production product. Assert the theatre reads the fixture name/status/screenshot and the primary action from collection data.

- [ ] **Step 2: render screenshot as the dominant object**

Use the supplied intrinsic `width`/`height`, meaningful `alt`, responsive sizing, and lazy/eager policy based on measured location. Because Flagship Theatre sits immediately after hero, test LCP impact before making the screenshot eager.

- [ ] **Step 3: keep status and capabilities subordinate**

Status remains factual, visually small, and not duplicated across multiple badges. Capabilities are 2–3 items from `data.capabilities`; do not create marketing copy inside the component.

- [ ] **Step 4: add desktop-only restrained transform as enhancement**

Any perspective/rotation/settling lives behind no-preference motion and media/container conditions. Mobile receives a direct frontal layout.

- [ ] **Step 5: verify empty-registry honesty**

Without a real public product, the component must not render invented product art or placeholder UI. The homepage still builds and the empty/product route contracts remain green.

- [ ] **Step 6: run targeted suites**

```bash
pnpm build
pnpm check:publishability
pnpm check:product-provenance
npx playwright test tests/e2e/c2-home.spec.ts tests/e2e/evidence-depth.spec.ts tests/e2e/empty-and-404.spec.ts --project=chromium --project=mobile-chromium
```

- [ ] **Step 7: commit**

```bash
git add src/components/product/FlagshipTheatre.astro src/components/sections/FlagshipProof.astro tests/e2e/c2-home.spec.ts
git commit -m "feat(product): add truth-driven flagship theatre"
```

## Task 8: Implement Product House editorial hierarchy

**Files:**
- Modify: `src/components/product/ProductHouse.astro`
- Reuse/refactor: `src/components/product/ProductCard.astro`
- Potentially leave `src/components/sections/FeaturedProducts.astro` as compatibility wrapper or remove its homepage use only.
- Test: `tests/e2e/c2-home.spec.ts`

**Interfaces:**
- Consumes: all public product entries already sorted/selected through existing helpers.
- Produces: semantic product links with one flagship/secondary/ecosystem hierarchy; mobile vertical stack; desktop optional native horizontal/spatial rail.

- [ ] **Step 1: assert hierarchy against fixture products**

The fixture test must prove `featuredTier=hero` is visually/semantically distinguished and `featured`/`ecosystem` remain discoverable without equal-weight duplication.

- [ ] **Step 2: implement no-JS semantic layout first**

Use sections/articles/links in normal DOM order. If desktop uses `overflow-x`/scroll-snap, all products remain reachable by keyboard and normal scrolling and mobile does not inherit cramped horizontal behavior.

- [ ] **Step 3: keep product actions literal**

Reuse existing action labels/route helpers. Do not replace real action semantics with cinematic labels such as “Enter the future”.

- [ ] **Step 4: verify mobile and 200% text**

Run C2 home plus existing mobile/text-zoom suites.

```bash
npx playwright test tests/e2e/c2-home.spec.ts tests/e2e/mobile-overflow.spec.ts tests/e2e/text-zoom.spec.ts --project=chromium --project=mobile-chromium
```

- [ ] **Step 5: commit**

```bash
git add src/components/product/ProductHouse.astro src/components/product/ProductCard.astro src/components/sections/FeaturedProducts.astro tests/e2e/c2-home.spec.ts
git commit -m "feat(product): add editorial Product House hierarchy"
```

## Task 9: Add product continuity with ordinary navigation as authority

**Files:**
- Create: `tests/e2e/c2-product-continuity.spec.ts`
- Modify: product image/link components only as required for `view-transition-name`/native transition naming.
- Potentially modify: `src/styles/cinematic-product-house.css`

**Interfaces:**
- Consumes: canonical product slug/profile route helpers.
- Produces: optional cross-document visual continuity; URL/navigation remains normal anchor navigation.

- [ ] **Step 1: write baseline navigation test with animations disabled**

Click a product link and assert the real product profile URL/heading loads with no interception dependency.

- [ ] **Step 2: add stable transition names derived from the product slug**

Use a sanitized slug already constrained by product schema, for example:

```astro
style={`view-transition-name: product-${product.data.slug};`}
```

Only apply a matching name to one source and one destination element per document to avoid duplicate transition-name errors.

- [ ] **Step 3: capability-detect styling only**

Use CSS/native support. Do not intercept clicks or build an SPA router.

- [ ] **Step 4: reduced-motion verification**

The route still navigates and content appears with `reducedMotion: "reduce"`.

- [ ] **Step 5: run tests and commit**

```bash
npx playwright test tests/e2e/c2-product-continuity.spec.ts --project=chromium --project=firefox --project=webkit

git add tests/e2e/c2-product-continuity.spec.ts src/components/product src/styles/cinematic-product-house.css
git commit -m "feat(experience): add native product continuity"
```

---

# Wave P4 — Meaning and Trust Progressive Disclosure

## Task 10: Reframe One House as an editorial interlude

**Files:**
- Modify: `src/components/sections/OneHouse.astro`
- Stop homepage dependency on: `src/components/experience/OneHouseMatrix.astro` unless a simplified non-card version proves necessary.
- Preserve component/tests if used elsewhere.
- Modify: `src/styles/cinematic-product-house.css`
- Modify: `tests/e2e/c2-home.spec.ts`

**Interfaces:**
- Consumes: approved BlueSkyz shared philosophy only.
- Produces: four plain-language ideas — Clarity, Human agency, Purposeful intelligence, Trust by design — with EN/VI semantic parity.

- [ ] **Step 1: write EN/VI parity assertions for the four concepts**

Do not use architecture-internal names as visitor prerequisites.

- [ ] **Step 2: replace equal icon/card matrix on homepage with editorial list/sequence**

Use semantic headings/list structure. Visual reveal may be progressive, but all concepts are present in HTML.

- [ ] **Step 3: verify no implication that every product uses AI**

Copy must describe the way of thinking, not a universal technology claim.

- [ ] **Step 4: run bilingual/mobile/zoom tests and commit**

```bash
npx playwright test tests/e2e/c2-home.spec.ts tests/e2e/bilingual-parity.spec.ts tests/e2e/text-zoom.spec.ts --project=chromium --project=mobile-chromium

git add src/components/sections/OneHouse.astro src/styles/cinematic-product-house.css tests/e2e/c2-home.spec.ts
git commit -m "feat(brand): reframe One House as editorial philosophy"
```

## Task 11: Add compact trust and canonical Evidence Teaser

**Files:**
- Modify: `src/components/sections/Trust.astro`
- Create: `src/components/integrity/EvidenceTeaser.astro`
- Reuse: `src/lib/claims.ts`, `src/data/integrity.ts`, route helpers, existing truth-state presentation primitives.
- Create: `tests/e2e/c2-evidence-teaser.spec.ts`
- Modify: `tests/architecture/c2-truth-boundary.test.mjs`

**Interfaces:**
- Consumes: canonical public claim/evidence graph and existing public routes.
- Produces: compact homepage proof items and an on-demand evidence disclosure that can deep-link to full passport/context.

- [ ] **Step 1: choose only claims already modeled for the homepage/trust surface**

Do not author a new marketing claim array. Add or reuse a selector in `src/lib/claims.ts` only if a pure selector is missing; the selector must return existing modeled claims.

- [ ] **Step 2: write the truth-boundary test first**

Require `EvidenceTeaser.astro` to import canonical claim/evidence selectors and reject a local claim registry.

- [ ] **Step 3: implement `<details>`-first disclosure**

Prefer native `<details>/<summary>` so no-JS remains fully functional. Render claim, authored truth-state wording, optional boundary, safe public evidence links, and a deep-verification link when available.

- [ ] **Step 4: write E2E behavior**

Verify:

- collapsed summary is understandable;
- keyboard can toggle;
- evidence appears on open;
- deep link resolves;
- JavaScript disabled still works because native details is authoritative;
- no stronger assurance words are introduced.

- [ ] **Step 5: run evidence and integrity suites**

```bash
pnpm check:integrity-firewall
npx playwright test tests/e2e/c2-evidence-teaser.spec.ts tests/e2e/evidence-passport.spec.ts tests/e2e/source-trace.spec.ts --project=chromium
```

- [ ] **Step 6: commit**

```bash
git add src/components/sections/Trust.astro src/components/integrity/EvidenceTeaser.astro src/lib/claims.ts tests/architecture/c2-truth-boundary.test.mjs tests/e2e/c2-evidence-teaser.spec.ts
git commit -m "feat(trust): add progressive evidence disclosure"
```

---

# Wave P5 — Human Layer, Closing Signature, Secondary Surfaces

## Task 12: Refine About, final action, and closing Horizon signature

**Files:**
- Modify: `src/components/sections/AboutBlueSkyz.astro`
- Modify: `src/components/sections/NextStep.astro`
- Reuse: `src/components/experience/HorizonField.astro`
- Modify: `src/styles/cinematic-product-house.css`
- Modify: `tests/e2e/c2-home.spec.ts`

**Interfaces:**
- Consumes: existing factual About/founder content and `src/lib/act.ts` fallback/action rules.
- Produces: intentional human trust moment and one strong closing action with optional secondary path.

- [ ] **Step 1: inventory current factual content and remove placeholder styling, not facts**

Do not add biography, team size, office claims, customer logos, or photography that is not already source-authorized.

- [ ] **Step 2: make final CTA data-driven**

When products exist, product exploration is primary. When the public registry/contact truth is empty, preserve existing `act.ts` safe soft-land semantics.

- [ ] **Step 3: reuse Horizon as closing signature**

The closing use is decorative and secondary to the CTA. Hide it from assistive technology and neutralize motion under reduced motion.

- [ ] **Step 4: test CTA count and destinations**

C2 home E2E must require one primary final action and at most one secondary action, with valid destination response.

- [ ] **Step 5: commit**

```bash
git add src/components/sections/AboutBlueSkyz.astro src/components/sections/NextStep.astro src/components/experience/HorizonField.astro src/styles/cinematic-product-house.css tests/e2e/c2-home.spec.ts
git commit -m "feat(experience): refine human layer and closing signature"
```

## Task 13: Converge secondary public surfaces without cloning homepage cinema

**Files:**
- Review/modify only where visual hierarchy is inconsistent: product index/profile pages, About, Security, Privacy, Support, Contact, Evidence Passport, 404, BaseLayout/shared section primitives.
- Reuse C2 plane/typography tokens; do not add unique cinematic scenes to every route.
- Add focused E2E only for changed behavior; otherwise extend existing suites.

**Interfaces:**
- Consumes: C2 visual primitives and all existing route truth.
- Produces: coherent family resemblance across public routes while keeping task pages calm and fast.

- [ ] **Step 1: render a route matrix at 1440px and 390px**

At minimum inspect EN/VI home, product index, one product profile fixture, About, Security, Privacy, Support, Contact, Evidence Passport, and 404.

- [ ] **Step 2: classify each issue as hierarchy, spacing, typography, surface, action, evidence-density, or mobile**

Do not change routes with no meaningful defect.

- [ ] **Step 3: use shared C2 tokens/primitives to fix root causes**

Avoid one-off per-page gradients/shadows. Secondary routes should inherit the product-house frame, not each become a marketing microsite.

- [ ] **Step 4: run all affected existing E2E suites**

Include markup baseline, accessibility, evidence/passport, recovery/404, mobile overflow, text zoom, text spacing, forced colors.

- [ ] **Step 5: commit by coherent surface group, not one giant secondary-surface commit**

Example commit messages:

```bash
git commit -m "feat(ui): converge product and about surfaces with C2"
git commit -m "feat(ui): converge trust and recovery surfaces with C2"
```

---

# Wave P6 — Elite QA, Red Team, Promotion, Production Evidence

## Task 14: Run the full quality/security/performance gate set

**Files:**
- Create evidence ledger: `docs/evidence/2026-09-<execution-date>-c2-<wave>-verification.md`
- Update: `docs/current-work.json`
- No runtime change unless a real defect is found.

**Interfaces:**
- Produces: exact-head evidence only; no stale run may be reused after a material push.

- [ ] **Step 1: run deterministic source gates on exact head**

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

Do not coerce a production-owner fact into PASS if it is legitimately blocked outside repository context.

- [ ] **Step 2: run full browser assurance locally when environment supports it**

```bash
pnpm test:e2e
pnpm lighthouse
```

If the environment cannot execute a browser family, record the exact limitation and rely on the repository's configured exact-head Browser Assurance rather than claiming local PASS.

- [ ] **Step 3: measure client delta**

Record total site client JS and worst-page bytes before/after the wave. If the C2 delta is unexpectedly large, identify the exact asset/module and reduce it before promotion. Do not raise the budget as the first fix.

- [ ] **Step 4: verify motion/accessibility edge modes explicitly**

Run/inspect:

- no-JS critical journeys;
- reduced motion;
- forced colors;
- text spacing;
- 200% text zoom;
- 320px/390px mobile;
- keyboard-only;
- print for evidence surfaces.

- [ ] **Step 5: commit evidence/router update**

```bash
git add docs/evidence docs/current-work.json
git commit -m "docs(evidence): record C2 exact-head verification"
```

## Task 15: Independent visual/red-team review

**Files:**
- Evidence ledger under `docs/evidence/`.
- Runtime files only when review finds a reproducible defect.

**Interfaces:**
- Produces: honest visual findings and dispositions; review score is not machine truth.

- [ ] **Step 1: capture rendered screenshots for the core matrix**

Capture at least 1440px and 390px for all core surfaces changed in the wave, plus a representative 320px small viewport for the homepage/product route.

- [ ] **Step 2: review against the C2 acceptance bar**

Evaluate:

- first-impression clarity;
- product visual primacy;
- premium restraint;
- cinematic memorability;
- hierarchy/density;
- mobile composition;
- bilingual typography;
- trust/evidence disclosure depth;
- CTA clarity;
- generic-template risk.

- [ ] **Step 3: red-team the wow factor**

Reject any effect that produces one of these failures:

- generic AI/aurora/template appearance;
- motion competes with product;
- product screenshot becomes too small to inspect;
- card/pill density returns;
- mobile receives a crippled desktop layout;
- evidence UI returns above product value;
- visual effect causes performance or accessibility regression.

- [ ] **Step 4: fix only reproduced defects, rerun affected gates, and update evidence**

Never modify runtime merely to chase a subjective score if the change reduces clarity/truth/accessibility.

## Task 16: PR promotion and production read-back

**Files:**
- PR description/evidence.
- Deployment evidence/current-work only after real provider results.

**Interfaces:**
- Produces: merged wave only when exact head is objectively green; production read-back proves the promoted runtime.

- [ ] **Step 1: push the wave branch and open a PR**

PR body must state:

- wave scope;
- exact truth sources used;
- before/after visual behavior;
- client-byte delta;
- tests run;
- owner-gated facts still open;
- explicit non-goals.

- [ ] **Step 2: wait for exact-head `Quality Gates` and `Browser Assurance`**

Do not merge if checks are red, stale, skipped unexpectedly, or attached to a different head.

- [ ] **Step 3: inspect review threads/conflicts and merge only when objective gates are green**

Use the repository's preferred merge method. No bypass.

- [ ] **Step 4: verify Cloudflare production deployment/read-back**

Run the repository production smoke path against the actual deployed revision. Verify at minimum EN/VI home, product/trust routes affected, branded 404, SGPS manifest, security.txt, redirects, and the new C2 homepage markers.

- [ ] **Step 5: record post-merge evidence and mark the wave `MERGED`**

Only provider/runtime evidence can support deployed claims. Update `docs/current-work.json` and add the post-merge ledger through the normal PR flow if required by repository practice.

---

# Execution Sequence and PR Boundaries

Use this dependency order. Do not combine the entire program into one PR.

1. **P0 / PR-A — Product truth floor**: only if real product assets/facts exist; otherwise record blocker and continue structural C2 work honestly.
2. **P1 / PR-B — Homepage composition contract + semantic recomposition**: no heavy art direction yet.
3. **P2 / PR-C — Horizon Arrival + act visual system + C2 architecture guards.**
4. **P3 / PR-D — Flagship Theatre + Product House hierarchy.** If P0 remains blocked, implement/test with fixture truth but do not fake production product content.
5. **P4 / PR-E — One House editorial + progressive Evidence Teaser.**
6. **P5 / PR-F — About/final action/closing signature + secondary surface convergence**, split into two PRs if changed files become broad.
7. **P6 / PR-G — final cross-surface red-team hardening/evidence only if defects require runtime changes; otherwise evidence is attached to the final relevant PR/post-merge ledger.

At each boundary, refresh `main` and re-evaluate whether later tasks are still necessary. Do not mechanically implement a task that live evidence makes obsolete.

# Program Exit Criteria

C2 may be declared complete only when:

- homepage composition follows the six-act narrative in EN and VI;
- Experience Spine, Intent Lens, and Atlas no longer compete on the homepage but their capabilities remain available or intentionally routed;
- real product truth drives every published product visual;
- at least one real public product exists before the full Flagship Theatre outcome is claimed complete;
- static/no-JS state is independently premium and usable;
- reduced-motion state carries identical information/actions;
- homepage/mobile rendered review reaches the target quality bar without falsifying evidence;
- all architecture/source/browser/accessibility/performance/security gates remain green;
- client budget is not weakened;
- no new telemetry is introduced without the existing privacy decision;
- exact-head production deployment is read back successfully;
- Human E4 remains recorded as owner-run until real participants actually run it.

# Self-Review Result

- **Spec coverage:** P0–P6, six-act IA, five wow moments, progressive SGPS depth, native motion, View Transitions, mobile doctrine, performance, accessibility, privacy, WebGL gate, and release doctrine are all mapped to tasks.
- **Placeholder scan:** no implementation task relies on invented product/customer/evidence facts; missing real product facts are handled as an explicit blocked state rather than TODO content.
- **Type/interface consistency:** `FlagshipTheatre` consumes `CollectionEntry<"products"> | null`; `ProductHouse` consumes `CollectionEntry<"products">[]`; both continue to rely on the existing public product collection. `EvidenceTeaser` consumes canonical claim/evidence selectors rather than a new registry.
- **Scope:** broad but sequential. Each PR boundary yields independently testable working software and can be rejected/revised without requiring the entire program to merge.
