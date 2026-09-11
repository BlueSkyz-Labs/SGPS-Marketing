# SGPS Marketing S+ Experience Design

**Status:** Approved direction — implementation governed by the companion plan.

**Date:** 2026-09-11

**Repository baseline used for this design:** `main@0ebab58d1f39a4d445ac732f93c0eda404ccf840` plus the open premium-craft Wave 1 work in PR #94. Runtime implementation must refresh live `main` and PR state before execution.

## Purpose

Elevate SGPS Marketing from a strong premium product-house site into a recognizable BlueSkyz experience without sacrificing the repository's existing truth, accessibility, performance, bilingual, and progressive-enhancement contracts.

The target is not “more effects.” The target is a coherent experience in which visual polish improves orientation, comprehension, trust, or action. Decorative novelty by itself does not qualify.

## Strategic direction

The approved direction is **Trust-native Intelligence with cinematic restraint**.

- Trust is treated as a first-class interaction and information model, not a decorative badge layer.
- BlueSkyz receives a recognizable visual signature through a restrained horizon/elevation motif.
- Native HTML/CSS/SVG remain the default implementation tools.
- JavaScript is introduced only where it creates measurable usability value and remains progressive enhancement.
- WebGL/3D is explicitly optional and evidence-gated.

## Non-negotiable constraints

1. Preserve Astro static-first architecture and current Cloudflare delivery model.
2. Preserve bilingual `/en/` and `/vi/` routes, reciprocal hreflang, and route parity.
3. No critical content, navigation, trust information, or conversion action may depend on JavaScript or animation completing.
4. Respect `prefers-reduced-motion`; reduced-motion users must receive equivalent information and action affordances.
5. Preserve keyboard, focus, semantic-heading, skip-link, and WCAG 2.2 AA behavior.
6. Do not invent products, customer numbers, security certifications, partner logos, maturity scores, testimonials, legal guarantees, trust claims, or evidence.
7. Existing product/trust truth remains fail-closed. Unknown stays unknown; missing evidence is omitted or explicitly labelled.
8. Cobalt remains a signal color, not a flood color. The base system remains Ink / Porcelain / Cobalt.
9. No scroll-jacking, mandatory parallax, custom cursor, autoplay video, decorative canvas dependency, or animation-gated reveal.
10. All runtime waves must pass repository source gates, Browser Assurance, Cloudflare candidate build, and exact-head verification before merge.
11. PR #94 must be reconciled and merged or superseded cleanly before S+ runtime implementation starts; this spec does not authorize layering runtime changes on an unexplained red candidate.
12. Open issues #95–#102 remain part of the execution context; this design must reuse their contracts instead of duplicating or silently weakening them.

## S+ experience system

### 1. BlueSkyz Horizon — signature hero system

The current hero already contains an Ink atmosphere, Cobalt glow, and horizon-oriented brand art. S+ evolves that into a reusable **Horizon primitive** rather than replacing it with a heavy 3D scene.

The primitive should:

- use CSS gradients and/or a lightweight inline SVG as the default implementation;
- derive all visible color from existing brand tokens;
- create depth through controlled light falloff, one horizon line, and restrained mark/field relationships;
- work on mobile as an intentional composition, not merely by hiding the desktop artwork;
- keep hero H1, proposition, CTA, and brand lockup immediately present in server-rendered HTML;
- remain fully legible with CSS animation disabled.

The horizon becomes a repeatable BlueSkyz motif that may reappear subtly in transitions, section dividers, Atlas, and trust surfaces.

### 2. Elevation Spine — narrative orientation system

The homepage should read as one intentional story rather than a stack of unrelated premium sections.

The spine communicates the current stage of the story:

`Intelligence → Elevation → Trust → Impact`

Requirements:

- semantic section order remains normal document flow;
- no scroll snapping or scroll locking;
- static fallback presents all stage labels and content without scripting;
- enhanced state may indicate the current section using IntersectionObserver or native/CSS techniques only after a no-JS baseline exists;
- reduced-motion mode removes animated travel while retaining current-stage orientation if technically inexpensive;
- screen-reader users receive semantic headings/landmarks rather than decorative stage chatter.

### 3. Verifiable Trust Ledger — trust as a product surface

Privacy, Security, Support, and future product proof should use one evidence-oriented model:

`Claim / Surface → Status → Evidence or route → Last reviewed → Source/provenance where safe`

The ledger is not a certification wall. It must never infer a badge, maturity score, or assurance level that the repository cannot prove.

Initial ledger entries should be derived only from facts already encoded by the current site and source model, for example:

- corporate privacy route exists;
- private vulnerability reporting path exists;
- support route exists;
- product proof is absent when the public product registry is empty.

A missing fact is represented as omitted, unavailable, or not yet published—not as a guessed green status.

### 4. One House Intelligence Matrix

The four BlueSkyz principles remain:

- Intelligence
- Elevation
- Trust
- Impact

S+ turns them from isolated cards into a coherent operating model. Each principle should visibly map to practical dimensions such as product design, customer understanding, trust/evidence, and real-world use.

Requirements:

- all principle content remains available in HTML;
- keyboard users can operate any enhancement;
- no hover-only information;
- EN and VI content remain semantically equivalent even if line length differs;
- interaction should feel analytical rather than gamified.

### 5. Intent Lens — self-selected visitor intent

The visitor may optionally choose one of four intents:

1. Evaluate a product
2. Understand BlueSkyz
3. Verify trust
4. Work with us

The lens does not profile or identify the visitor. It is explicit, first-party interaction state used only to prioritize navigation/next-action presentation.

Rules:

- the unselected/default site remains complete;
- choosing a lens must not hide facts required to understand the site;
- no remote personalization service is introduced;
- analytics, if later enabled under #100, records only the lens identifier and not free-text or personal data;
- the lens should survive only as long as justified by UX evidence; local persistence is not required for V1.

### 6. Contextual Journey Bar

Pages should answer two questions clearly: “Where am I?” and “What is the next useful action?”

The Journey Bar uses route-aware context and approved IA to expose a restrained next-step model, for example:

- About → Trust → Products
- Security → Privacy → Contact/About
- Products → Evidence → Contact/About

The component must not become a sticky conversion banner. It is an orientation tool, with mobile and desktop variants that preserve equivalent destinations.

### 7. Native Language Morph

EN ⇄ VI switching should preserve route context and feel intentional.

Baseline remains ordinary links generated by the current language helper. Progressive enhancement may use the native View Transition API when available.

Rules:

- normal link navigation is the source of truth;
- View Transitions are optional and capability-detected;
- `prefers-reduced-motion: reduce` disables decorative transition motion;
- focus and URL updates follow normal navigation semantics;
- route parity and hreflang remain unchanged.

### 8. BlueSkyz Motion Grammar

Motion is categorized by purpose rather than by component:

- **Orientation:** clarifies where content came from or where the user moved.
- **Emphasis:** draws attention to a state change or important relationship.
- **Confirmation:** confirms a press, selection, or completed action.
- **Continuity:** preserves context across navigation/language changes.

The repository already has motion duration tokens. S+ formalizes easing, distance, opacity, and reduced-motion rules and removes ad hoc motion drift.

Motion must never be the only carrier of state.

### 9. Command Navigator (Cmd/Ctrl + K)

A small optional navigator provides keyboard-first access to approved routes and actions.

Initial index contains only existing public routes and verified product routes. Search operates on EN/VI labels and approved aliases.

Requirements:

- normal header/footer navigation remains fully sufficient;
- accessible dialog semantics, focus trap/restore, Escape close, and visible keyboard focus;
- no third-party command-menu framework unless a later evidence review proves it necessary;
- index is generated from site/route truth rather than duplicated manually;
- client cost is bounded by #99 performance budgets.

### 10. BlueSkyz Atlas — living product/trust constellation

Atlas is the culmination of the system, not the starting point.

V1 is SVG/HTML-first and visualizes only real relationships among:

- BlueSkyz masterbrand;
- published products;
- principles;
- trust surfaces;
- evidence routes.

If no public products exist, Atlas must not fabricate product nodes. It can legitimately visualize the masterbrand/principles/trust system alone.

WebGL/3D is governed by issue #102 and is not part of the default implementation. A WebGL prototype may proceed only after #99 defines budgets and a written business/UX hypothesis establishes measurable expected value.

## Information architecture impact

The S+ system does not create a new parallel IA. It enhances the current BlueSkyz product-house routes and global shell.

Authoritative route truth at execution time comes from live `src/data/site.ts`, `src/lib/i18n.ts`, the public product registry, and the current C1.1 experience specification.

Issue #97 contains route language from an earlier or broader marketing concept; execution must reconcile that issue against live routes before implementing IA changes. Do not introduce borrower/lender/sectors/risk/technology routes unless they exist in approved source truth at that future execution point.

## Component boundaries

Expected reusable units:

- `HorizonField.astro` — decorative/static horizon visual primitive.
- `ExperienceSpine.astro` — narrative orientation wrapper/rail.
- `TrustLedger.astro` + `src/data/trust-ledger.ts` — evidence-driven trust display.
- `OneHouseMatrix.astro` — principle operating-model presentation.
- `IntentLens.astro` + minimal enhancement script if warranted.
- `JourneyBar.astro` + `src/lib/journey.ts` — route-aware next actions.
- `LanguageSwitcher.astro` enhancement — native language transition only.
- `CommandNavigator.astro` + small client module — optional command UX.
- `Atlas.astro` + `src/lib/atlas.ts` — truth-derived SVG graph.
- shared motion tokens/rules in `src/styles/global.css` or a narrowly separated experience stylesheet if `global.css` becomes unwieldy.

Each unit must be understandable and testable independently. Do not create one monolithic “SPlusExperience” component.

## Performance contract

Issue #99 is a hard dependency for the heavier S+ waves.

Until measured baselines are refreshed, the following design constraints apply:

- Horizon, Spine, Ledger, Matrix, Journey Bar, and Atlas V1 must prefer zero-JS HTML/CSS/SVG.
- Intent Lens, native transition enhancement, and Command Navigator must use small vanilla modules and no new framework/runtime dependency by default.
- Existing repository client-JS hard ceiling remains authoritative.
- New large raster/video hero assets are disallowed without measured evidence.
- Atlas V1 must not require WebGL.
- Each wave records before/after client bytes and Lighthouse/Browser Assurance results.

## Accessibility contract

Every S+ component must satisfy:

- keyboard parity with pointer interaction;
- no hover-only information;
- visible focus;
- semantic headings/landmarks;
- touch targets consistent with existing 44px intent;
- reduced-motion equivalence;
- content readable at 200% zoom;
- no horizontal overflow at 320px;
- axe critical/serious violations = 0 on affected routes;
- current screen-reader-relevant states exposed through native semantics or appropriate ARIA only where native HTML is insufficient.

## Truth and evidence contract

S+ visual sophistication must never outrun source truth.

- Trust status originates from verified repository/site facts.
- Product nodes originate from the public product registry.
- CTA destinations originate from existing route/action helpers.
- No generated product UI may be presented as runtime proof.
- “Last verified” dates must come from real evidence/update metadata, not build time unless explicitly defined as build verification.
- Human E4 acceptance remains a separate evidence class; automated browser evidence must not be misreported as real-user acceptance.

## Wave order

### Wave 0 — Reconcile and measure

- close/reconcile PR #94;
- complete or reconcile relevant #95/#97 semantics;
- establish #99 performance budgets and exact baseline;
- refresh S+ target files against final `main`.

### Wave 1 — Signature foundation

1. Motion Grammar
2. Horizon Hero
3. Elevation Spine
4. Trust Ledger
5. One House Matrix

This wave creates the recognizable BlueSkyz experience without requiring a large client runtime.

### Wave 2 — Adaptive orientation

6. Intent Lens
7. Contextual Journey Bar
8. Native Language Morph

This wave improves pathfinding and continuity after the signature foundation is stable.

### Wave 3 — Power-user discovery

9. Command Navigator
10. Atlas V1 (SVG/HTML-first)

### Wave 4 — Production hardening and evidence

- #98 SEO/discoverability verification;
- #100 privacy-conscious event taxonomy/instrumentation where approved;
- #101 production smoke/observability/rollback verification;
- human E4 study required by the canonical experience contract.

### Wave 5 — Optional halo experiment

- #102 WebGL/3D hypothesis and GO/NO-GO only after the SVG Atlas and performance evidence exist.

## Acceptance definition

The S+ program is successful only when all of the following are true:

1. The site remains understandable with JavaScript disabled.
2. The BlueSkyz horizon/elevation/trust language is recognizable across homepage and core trust/product surfaces.
3. A user can identify what BlueSkyz is, verify trust paths, and find a next action without relying on decorative effects.
4. EN and VI journeys remain equivalent and correct.
5. Reduced-motion behavior preserves all meaning and actions.
6. No new unsupported claim, product, proof, badge, score, or certification is introduced.
7. Performance remains within the enforced budgets established by #99.
8. Exact-head Quality Gates, Browser Assurance, and Cloudflare candidate evidence are green for every promoted runtime wave.
9. Human E4 records real-user comprehension/credibility findings separately from automated test results.
10. WebGL/3D remains optional and removable; the core S+ identity succeeds without it.

## Red-team rejection criteria

Reject or redesign an implementation if any of these occur:

- the experience resembles a generic aurora/particle/glass AI template;
- a decorative effect adds substantial JS/GPU cost without a measured user benefit;
- mobile becomes a stripped-down version with broken hierarchy;
- motion hides content, delays CTA access, or causes focus instability;
- a trust visualization implies evidence the source model does not contain;
- a component duplicates route/product/trust truth in a second manually maintained registry;
- a new dependency is introduced for behavior achievable cleanly with platform-native HTML/CSS/SVG/JS;
- a wave weakens existing accessibility, source assurance, performance, or truth gates to pass.
