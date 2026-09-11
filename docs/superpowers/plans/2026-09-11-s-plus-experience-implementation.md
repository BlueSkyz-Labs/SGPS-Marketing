# SGPS Marketing S+ Experience Implementation Plan

> **Execution mode:** Use `superpowers:subagent-driven-development` or
> `superpowers:executing-plans`. Implement one bounded wave at a time, with
> TDD, exact-head verification, review, and protected promotion between waves.

## Goal

Build the approved S+ BlueSkyz experience without weakening the repository's
truth, accessibility, performance, bilingual, or promotion contracts.

The target experience includes:

1. BlueSkyz Horizon signature system.
2. Elevation Spine narrative orientation.
3. Verifiable Trust Ledger.
4. One House Intelligence Matrix.
5. Intent Lens.
6. Contextual Journey Bar.
7. Native EN/VI continuity.
8. Purpose-based Motion Grammar.
9. Cmd/Ctrl+K Command Navigator.
10. BlueSkyz Atlas, with WebGL/3D remaining optional and evidence-gated.

## Source of Truth

At the start of every runtime wave, refresh live repository state rather than
executing blindly from this document's authoring snapshot.

Read at minimum:

- current `main` SHA;
- open pull requests and required checks;
- PR #94 and its final merge/supersession state;
- issues #95 through #102;
- `SPEC.md`;
- the current canonical design spec;
- current architecture tests, browser tests, Lighthouse config, client budget,
  and Cloudflare deployment contract.

The authoring baseline was `main@0ebab58d1f39a4d445ac732f93c0eda404ccf840`.
It is historical context, not an execution pin.

## Non-Negotiable Constraints

- Keep Astro static-first and preserve the current static deployment model.
- Critical content, trust information, navigation, and CTA paths must work with
  JavaScript disabled.
- Preserve `/en/` and `/vi/` parity, canonical URLs, hreflang, and language
  switching semantics.
- Preserve WCAG 2.2 AA intent, keyboard parity, visible focus, touch-target
  sizing, 200% zoom usability, and 320px no-overflow behavior.
- Respect `prefers-reduced-motion` and never gate information behind animation.
- Never invent product availability, certifications, scores, customer counts,
  testimonials, security maturity, partners, legal claims, or research results.
- Do not add scroll-jacking, scroll lock, custom cursors, autoplay media, or
  mandatory parallax.
- Default to HTML, CSS, and SVG. New runtime dependencies require explicit
  written justification.
- Do not weaken tests, checks, rulesets, or source gates to obtain green status.
- Promotion remains branch -> PR -> exact-head checks -> Cloudflare candidate
  evidence -> merge -> post-merge read-back.
- Automated/browser PASS and human E4 PASS are separate evidence classes.

## Runtime Entry Gate

Runtime S+ implementation is blocked until PR #94 is reconciled.

Proceed only when one of these conditions is true:

1. PR #94 is merged and post-merge `main` is green; or
2. PR #94 is explicitly superseded/closed and its retained intent is already
   represented on `main`.

If #94 still has unexplained Browser Assurance failure, stop S+ runtime work and
fix/reconcile #94 first. Planning documents are not runtime evidence.

## Standard Verification Matrix

Use the repository's current scripts. The baseline full matrix is:

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

For every user-facing wave, also verify:

- 320px mobile layout;
- keyboard-only operation;
- visible focus;
- reduced-motion behavior;
- EN/VI parity;
- no-JS critical path when relevant;
- exact-head Cloudflare candidate build;
- accidental scope creep in the final diff.

---

## Wave 0 — Reconcile Existing State

### Task 0.1: Close the PR #94 uncertainty

**Purpose:** Remove the current execution blocker before new runtime work.

**Procedure:**

- [ ] Refresh PR #94 head SHA, base SHA, mergeability, reviews, and checks.
- [ ] Read the exact failing Browser Assurance assertion/log if any red remains.
- [ ] Classify the failure as product defect, test defect, or CI contract defect.
- [ ] Write or retain the failing reproduction before changing behavior.
- [ ] Apply the smallest root-cause fix on the PR branch.
- [ ] Re-run exact-head source and browser assurance.
- [ ] Confirm Cloudflare candidate evidence belongs to the same head SHA.
- [ ] Merge only when no unexplained red remains.
- [ ] Read back post-merge `main` before declaring the dependency closed.

**Exit criterion:** #94 is either safely merged or explicitly superseded with its
retained intent represented on green `main`.

---

## Wave 1 — S+ Foundation and Signature

### Task 1: Lock performance and motion contracts (#99, #96)

**Purpose:** Establish measurable budgets before adding premium interaction.

**Likely files:**

- `src/styles/global.css`
- `scripts/check-client-budget.mjs`
- `lighthouserc.json`
- `tests/architecture/s-plus-experience-contract.test.mjs`
- `docs/evidence/2026-09-11-s-plus-baseline.md`

**TDD sequence:**

- [ ] Record the fresh exact-SHA baseline before modifying motion or runtime.
- [ ] Add a failing architecture test for purpose-based motion tokens and the
      reduced-motion override.
- [ ] Add minimal tokens for orientation, emphasis, confirmation, continuity,
      easing, and motion distance.
- [ ] Measure current client-JS Brotli bytes, hero asset weight, CLS, Lighthouse
      accessibility, and relevant LCP proxy.
- [ ] Define the allowed regression envelope from real measurements.
- [ ] Enforce any hard numeric budget in the existing budget script/config,
      rather than creating a parallel checker.

**Acceptance:**

- Wave 1 visual primitives target zero added client JavaScript.
- No later interactive wave may exceed the repository hard client-JS ceiling.
- Every interactive wave reports incremental Brotli client bytes.
- Lighthouse accessibility may not regress below the current enforced threshold.
- CLS may not become less strict than the current config.
- A mobile-sensitive LCP regression greater than 10% from the recorded baseline
  requires explicit review rather than silent acceptance.

**Focused verification:**

```bash
pnpm test:architecture
pnpm build
pnpm check:client-budget
pnpm test:e2e -- motion.spec.ts
pnpm lighthouse
```

### Task 2: Build the BlueSkyz Horizon

**Purpose:** Create a recognizable premium signature without adding a runtime
visualization dependency.

**Target files:**

- `src/components/experience/HorizonField.astro`
- `src/components/sections/Hero.astro`
- `src/styles/global.css`
- `tests/e2e/s-plus-horizon.spec.ts`

**TDD sequence:**

- [ ] Write a failing test that requires a decorative Horizon on `/en/` and
      `/vi/` without hiding the H1 or CTA.
- [ ] Add a 320px overflow assertion.
- [ ] Implement Horizon with HTML/CSS gradients and decorative markup only.
- [ ] Mark decorative content `aria-hidden="true"`.
- [ ] Integrate against the final merged hero composition, not stale markup.
- [ ] Give mobile an intentional crop/composition instead of deleting the
      signature completely.

**Acceptance:**

- H1 and CTA remain server-rendered and dominant.
- Zero incremental client JavaScript.
- No canvas, WebGL, remote asset, or animation library.
- Reduced-motion and no-JS paths remain equivalent.

### Task 3: Add the Elevation Spine

**Purpose:** Give the long-form homepage a clear narrative orientation model.

**Target files:**

- `src/components/experience/ExperienceSpine.astro`
- `src/data/experience.ts`
- `src/pages/en/index.astro`
- `src/pages/vi/index.astro`
- targeted homepage section roots
- optionally `src/scripts/experience-spine.ts`
- `tests/e2e/s-plus-spine.spec.ts`

**Narrative stages:**

1. Intelligence.
2. Elevation.
3. Trust.
4. Impact.

**TDD sequence:**

- [ ] Write failing tests for four semantic stages in document order.
- [ ] Render a static semantic `<nav>` that links to real section IDs.
- [ ] Localize labels in the shared experience model when repeated.
- [ ] Keep stage IDs on actual sections; do not add hidden anchor shims.
- [ ] Add `IntersectionObserver` current-stage enhancement only if usability
      evidence justifies it after the static version works.

**Acceptance:**

- Static navigation is complete without JavaScript.
- Optional JS only toggles orientation state; it never hides or reorders content.
- No scroll lock or scroll-jacking.
- Keyboard and reduced-motion tests remain green.

---

## Wave 2 — Trust, Coherence, and Journey

### Task 4: Build the Verifiable Trust Ledger

**Purpose:** Replace generic trust cards with a truthful, evidence-oriented
presentation model.

**Target files:**

- `src/data/trust-ledger.ts`
- `src/components/experience/TrustLedger.astro`
- `src/components/sections/Trust.astro`
- `tests/architecture/s-plus-truth-contract.test.mjs`
- `tests/e2e/s-plus-trust-ledger.spec.ts`

**Data contract:**

```ts
export type TrustState = "available" | "not-published";

export interface TrustLedgerEntry {
  id: "privacy" | "security" | "support";
  state: TrustState;
  href: { en: string; vi: string };
  label: { en: string; vi: string };
  summary: { en: string; vi: string };
  evidenceKind: "route" | "private-reporting";
}
```

**TDD sequence:**

- [ ] Add a failing anti-fabrication architecture test.
- [ ] Populate privacy, security, and support from existing public facts only.
- [ ] Use `not-published` when a public fact does not exist.
- [ ] Render a semantic mobile-readable list or table-like structure.
- [ ] Make the Ledger the authoritative S+ trust display model.

**Forbidden fields without future formal evidence:**

- `verified`;
- `certified`;
- `trustScore`;
- `maturityScore`.

### Task 5: Upgrade One House into an Intelligence Matrix

**Purpose:** Turn four isolated principle cards into a coherent system view.

**Target files:**

- `src/data/experience.ts`
- `src/components/experience/OneHouseMatrix.astro`
- `src/components/sections/OneHouse.astro`
- `tests/e2e/s-plus-one-house.spec.ts`

**Matrix dimensions:**

- product;
- people;
- evidence;
- real-world impact.

**TDD sequence:**

- [ ] Require every principle to expose all four dimensions.
- [ ] Require EN/VI parity.
- [ ] Move repeated principle copy into `experience.ts`.
- [ ] Render all information with native markup on mobile/no-JS.
- [ ] Add desktop relationship emphasis with CSS only.

**Acceptance:**

- No hover-only critical information.
- No unsupported product/security claim in explanatory copy.
- Zero new client JavaScript.

### Task 6: Complete IA semantics and add Contextual Journey Bar (#97)

**Purpose:** Make the next useful step obvious without adding a sticky sales
banner or stale route model.

**Target files:**

- `src/lib/journey.ts`
- `src/components/experience/JourneyBar.astro`
- `src/components/layout/Header.astro`
- `src/components/layout/Footer.astro` when needed
- `src/layouts/BaseLayout.astro`
- `tests/e2e/s-plus-journey.spec.ts`

**Rules:**

- Derive destinations from the live approved route set.
- Do not add borrower/lender/sectors/risk/technology routes solely because stale
  backlog text mentions them.
- When no public product exists, preserve honest empty-registry behavior.
- Add `aria-current="page"` to the actual current global-nav destination.
- Keep mobile and desktop critical navigation equivalent.

**TDD sequence:**

- [ ] Write route-to-next-action tests in EN and VI.
- [ ] Implement a deterministic `getJourneyActions()` helper.
- [ ] Render the Journey Bar near the end of content, not as a sticky overlay.
- [ ] Run static-link, shell, and accessibility tests.

---

## Wave 3 — Adaptive Premium Interaction

### Task 7: Add the Intent Lens

**Purpose:** Let visitors explicitly state intent without profiling them.

**Intent IDs:**

```ts
export type VisitorIntent =
  "evaluate-product" | "understand-blueskyz" | "verify-trust" | "work-with-us";
```

**Target files:**

- `src/components/experience/IntentLens.astro`
- `src/scripts/intent-lens.ts`
- homepage composition
- `tests/e2e/s-plus-intent.spec.ts`

**Rules:**

- State is DOM/in-memory for V1.
- No cookies, fingerprinting, remote profile storage, or account association.
- Selection changes emphasis, not factual availability.
- Trust/legal/product facts stay in the DOM.
- Future analytics may consume a semantic custom event, but analytics does not
  own the interaction.

**Acceptance:**

- Complete default experience without selecting an intent.
- Complete critical content with JavaScript disabled.
- Native buttons expose `aria-pressed` correctly.
- Incremental JS is measured against Task 1 budgets.

### Task 8: Add Native Language Continuity

**Purpose:** Make EN/VI switching feel deliberate while retaining normal links.

**Target files:**

- `src/components/layout/LanguageSwitcher.astro`
- `src/scripts/language-transition.ts`
- `src/styles/global.css`
- `tests/e2e/s-plus-language.spec.ts`

**Rules:**

- Real `href` and `hreflang` remain canonical behavior.
- No second router or fake SPA navigation.
- View Transition enhancement is capability-detected.
- Reduced-motion users receive ordinary navigation.
- If interception harms focus or navigation reliability, remove interception and
  retain CSS-only continuity.

### Task 9: Build the Cmd/Ctrl+K Command Navigator

**Purpose:** Provide fast premium navigation without duplicating route/product
truth.

**Target files:**

- `src/lib/navigator.ts`
- `src/components/experience/CommandNavigator.astro`
- `src/scripts/command-navigator.ts`
- `src/components/layout/Header.astro`
- `tests/e2e/s-plus-command.spec.ts`

**Data sources:**

- approved global routes;
- Trust Ledger entries;
- real public products from `getPublicProducts()`.

**TDD sequence:**

- [ ] Require Cmd/Ctrl+K open behavior and Escape close behavior.
- [ ] Require a visible discoverable trigger in addition to the shortcut.
- [ ] Require focus to move to search on open.
- [ ] Require focus to return to the invoking control on close.
- [ ] Render results as real links.
- [ ] Keep implementation dependency-free, preferring native `<dialog>`.

**Acceptance:**

- No manual parallel product registry.
- No command-menu library.
- Keyboard and screen-reader behavior pass.
- Incremental client JS stays inside the measured budget.

### Task 10: Build BlueSkyz Atlas V1

**Purpose:** Visualize relationships between brand, principles, trust, and real
products without fabricating graph facts.

**Target files:**

- `src/lib/atlas.ts`
- `src/components/experience/Atlas.astro`
- `tests/e2e/s-plus-atlas.spec.ts`
- `tests/architecture/s-plus-truth-contract.test.mjs`

**Node kinds:**

- brand;
- principle;
- trust;
- product.

**Truth rules:**

- Brand node is BlueSkyz.
- Principle nodes come from `experience.ts`.
- Trust nodes come from `trust-ledger.ts`.
- Product nodes come only from `getPublicProducts()`.
- When there are zero public products, there are zero product nodes.

**Presentation rules:**

- SVG may provide the visual relationship map.
- An HTML semantic representation exposes all meaningful nodes/actions.
- Decorative edges are hidden from assistive technology.
- Focus/hover relationship emphasis is CSS-first.
- No required JavaScript for V1.

---

## Wave 4 — Production Hardening

### Task 11: Complete feedback states when a real async flow exists (#95)

**Purpose:** Ensure real forms/interactions have complete accessible states without
inventing a backend merely to satisfy an issue.

**Procedure:**

- [ ] Refresh source and determine whether a real async/contact submission exists.
- [ ] If none exists, document #95 as not currently applicable to a submission
      flow and do not create a fake form/backend.
- [ ] If one exists, write failing success, error, validation, retry, pending,
      and duplicate-submit tests.
- [ ] Associate field errors with fields and move focus deterministically to the
      first invalid field.
- [ ] Announce async outcomes through an appropriate live region.
- [ ] Preserve user-entered data on recoverable errors unless privacy policy
      requires otherwise.

### Task 12A: Finish production SEO baseline (#98)

**Purpose:** Make every stabilized public route discoverable without inventing
structured-data claims.

**Verify:**

- unique title and description intent;
- canonical/hreflang agreement;
- robots and sitemap alignment;
- OG/social fallback assets;
- structured data backed by real public facts;
- no unintended production `noindex`.

Reuse the current SEO helpers and route truth rather than creating parallel
metadata sources.

### Task 12B: Define privacy-conscious conversion instrumentation (#100)

**Purpose:** Measure experience utility without coupling analytics to behavior or
collecting unnecessary content.

**Initial event taxonomy:**

```text
intent_selected { intent }
trust_route_opened { surface }
journey_action_opened { kind, destination }
command_navigator_opened {}
command_result_opened { kind }
atlas_node_opened { kind }
```

**Privacy rules:**

- No free-text search payload.
- No email, form body, credentials, IP, or arbitrary DOM text.
- Navigation/actions still succeed when analytics is unavailable or throws.
- Deduplicate event emission.
- If no provider/privacy approval exists, land taxonomy/tests only and keep
  transmission disabled.

### Task 12C: Production smoke, observability, and rollback (#101)

**Purpose:** Tie release confidence to exact deployed evidence.

**Post-deploy smoke contract:**

- EN home responds correctly.
- VI home responds correctly.
- privacy/security/support routes respond correctly.
- canonical metadata is correct.
- production is not unexpectedly `noindex`.
- critical navigation links work.
- evidence records exact commit SHA and Cloudflare build/version.

Document the repository's real rollback/fix-forward path using the actual
Cloudflare deployment model. Never commit credentials or secrets.

---

## Wave 5 — Acceptance and Optional 3D

### Task 13: Run S+ E4 validation

**Purpose:** Separate automated/browser confidence from real-user comprehension
and credibility evidence.

**Evidence file:**

- `docs/evidence/2026-09-11-s-plus-e4.md`

**Automated matrix:**

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

**Viewport and interaction matrix:**

- 320px;
- 360px;
- 390/393px;
- 430px;
- 1280px;
- 1440px;
- 1920px;
- keyboard-only;
- 200% zoom;
- reduced motion;
- Chromium;
- Firefox;
- WebKit/Safari-class;
- mobile Chromium.

**Canonical real-user tasks:**

1. Explain what BlueSkyz does after brief exposure.
2. Find a relevant product or correctly conclude none is publicly available.
3. Determine whether an available product can be used now.
4. Find help/support.
5. Find who is responsible for BlueSkyz.
6. Explain why the products/principles belong together.
7. Identify anything exaggerated, fake, unclear, or untrustworthy.

**Additional S+ probes:**

- Is the Horizon recognizable but restrained?
- Is the Trust Ledger understandable and credible?
- Does the Intent Lens help without feeling invasive?
- Does Journey Bar improve orientation?
- Does Command Navigator improve speed?
- Does Atlas clarify relationships or add noise?

If real-user evidence is missing, record human E4 as `OPEN`; automated PASS does
not upgrade it to PASS.

### Task 14: Evaluate optional WebGL/3D only after Atlas V1 (#102)

**Default decision:** NO-GO unless evidence identifies a concrete user problem
that 3D could plausibly solve.

**GO prerequisites:**

- Atlas V1 is already implemented and measured.
- #99 budgets are current and numeric.
- E4 or approved analytics identifies a concrete comprehension, orientation, or
  conversion problem.
- One measurable success signal is defined from the approved measurement
  contract.
- SVG/HTML Atlas remains the fallback.

**If prerequisites are absent, record:**

```text
Decision: NO-GO — no evidence-backed user problem justifies WebGL/3D runtime cost.
Fallback retained: SVG/HTML BlueSkyz Atlas.
```

**If a prototype is approved:**

- isolate it on a dedicated branch/PR;
- keep default content and CTA paths independent of WebGL;
- automatically fall back for reduced motion, unsupported GPU/browser, and
  low-capability paths;
- compare client bytes, Lighthouse/CWV proxies, device behavior, and the agreed
  user-task signal;
- do not promote on visual preference alone.

---

## PR and Wave Boundaries

Use these default PR boundaries unless live code coupling proves a smaller split
is safer:

1. **S+ Foundation:** Task 1 only.
2. **Signature Horizon:** Task 2.
3. **Narrative Spine:** Task 3.
4. **Trust Ledger:** Task 4.
5. **One House Matrix:** Task 5.
6. **IA + Journey:** Task 6.
7. **Intent Lens:** Task 7.
8. **Language Continuity:** Task 8.
9. **Command Navigator:** Task 9.
10. **Atlas V1:** Task 10.
11. **Feedback completion:** Task 11 only when applicable.
12. **SEO:** Task 12A.
13. **Analytics:** Task 12B.
14. **Operability:** Task 12C.
15. **E4 remediation:** one small PR per P0/P1 root cause.
16. **WebGL experiment:** isolated branch/PR, never bundled into Atlas V1.

Never combine the entire S+ program into one runtime PR.

## Promotion Checklist for Every Runtime PR

- [ ] Branch starts from current verified `main`.
- [ ] Scope matches one bounded wave.
- [ ] Failing test/evidence is observed before implementation when behavior
      changes.
- [ ] No unsupported public claim or route is invented.
- [ ] EN/VI parity is checked for user-facing changes.
- [ ] 320px path is checked.
- [ ] Keyboard path is checked.
- [ ] Reduced-motion path is checked for motion/interaction changes.
- [ ] No-JS critical path is checked when relevant.
- [ ] Focused tests are green.
- [ ] Full source gates are green.
- [ ] Browser Assurance is green on the exact PR head.
- [ ] Cloudflare candidate build is green on the exact PR head.
- [ ] Review threads are resolved.
- [ ] Final diff is reviewed for accidental scope creep.
- [ ] Merge uses the expected head SHA to prevent stale promotion.
- [ ] Post-merge `main` checks and deployment are read back before completion.

## Dependency Map

```text
PR #94 reconciliation
        |
        v
Task 1: performance + motion foundation (#99, #96)
        |
        +--> Task 2: Horizon
        +--> Task 3: Spine
        +--> Task 4: Trust Ledger
        +--> Task 5: One House Matrix
                    |
                    v
             Task 6: IA + Journey (#97)
                    |
                    +--> Task 7: Intent Lens
                    +--> Task 8: Language Continuity
                    |
                    v
             Task 9: Command Navigator
                    |
                    v
             Task 10: Atlas V1
                    |
                    v
        Task 12A/B/C: SEO + analytics + operability
                    |
                    v
             Task 13: E4
                    |
                    v
             Task 14: WebGL GO/NO-GO (#102)
```

Task 11 (#95) is conditional on a real async/contact submission flow. When such
a flow exists, feedback semantics must be complete before #100 measures form
conversion behavior.

## Issue Mapping

- #95 -> Task 11, conditional on a real async flow.
- #96 -> Task 1 and motion validation across interactive waves.
- #97 -> Task 6, reconciled against live route truth.
- #98 -> Task 12A.
- #99 -> Task 1 and all later performance reviews.
- #100 -> Task 12B, after relevant interaction semantics exist.
- #101 -> Task 12C.
- #102 -> Task 14 only after Atlas V1 and E4 evidence.

Do not create duplicate issues for these scopes unless a materially distinct root
cause is discovered.

## Completion Definition

The S+ program is not complete merely because all UI components exist.
Completion requires:

- bounded runtime PRs merged through protected promotion;
- exact-head source, browser, and Cloudflare evidence for every promoted wave;
- no unresolved truth/accessibility/performance regression;
- production smoke and recovery procedure verified;
- human E4 evidence recorded separately from automated checks;
- WebGL/3D either explicitly approved by evidence or explicitly recorded as
  NO-GO.

## Agent Handoff

Start by refreshing live `main` and reconciling PR #94. Then execute the tasks in
dependency order using TDD and one bounded PR at a time. Never use this plan's
historical authoring SHA as a blind checkout target, and never promote a wave
while an exact-head required check is unexplained red.
