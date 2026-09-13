# C3 — Living Verifiable Product Experience Design

**Status:** Owner-approved successor direction; planning only until C2 readiness gates are satisfied.

**Date:** 2026-09-13

**Planning baseline:** `main@386aaaca9c839bbe3d3c430f1a8c419904dfee49`. Runtime execution must always refresh live repository and provider state before editing.

## 1. Purpose

C3 evolves BlueSkyz Labs from the C2 **Cinematic Product House** into a **Living Verifiable Product Experience**.

C2 establishes premium composition, product-led storytelling, cinematic restraint, progressive evidence disclosure, native motion, accessibility, and performance boundaries. C3 does not replace those foundations. It makes the product experience more alive, more inspectable, more adaptive, and more useful while preserving the same truth/security doctrine.

The visitor journey becomes:

`See → Understand → Interact → Ask → Verify → Act`

C3 is successful only if every added interaction improves at least one of these jobs:

- understand a real product;
- inspect real capability;
- compare or navigate real choices;
- verify a real claim;
- adapt the experience to the visitor's declared intent or device capability;
- reach the correct next action.

Decorative novelty by itself is not a product requirement.

## 2. Program doctrine

**Living product. Verifiable intelligence. Adaptive premium experience.**

C3 has three strategic pillars:

1. **Product becomes alive.** Real product UI and product truth become interactive, inspectable, and narratively understandable.
2. **Trust becomes experiential.** Claims, evidence, provenance, and truth state are revealed in context instead of being detached compliance surfaces.
3. **Premium adapts intelligently.** Fidelity, information density, and navigation adapt to explicit visitor intent and device/user preferences without surveillance profiling.

C3 inherits all C2, C1.1, SGPS, accessibility, source-assurance, privacy, and deployment constraints unless this design explicitly strengthens them.

## 3. Sequencing rule: C3 follows C2

C3 is a successor program, not a parallel redesign.

Runtime C3 work must not begin until the relevant C2 foundation exists in live `main`. The full program should normally wait for C2 exit criteria, but an individual C3 subsystem may begin earlier only when all of its dependencies are demonstrably satisfied and doing so does not destabilize active C2 work.

Minimum C3 readiness conditions:

- C2 composition authority is merged and implemented for the surfaces the C3 subsystem touches;
- public product truth remains canonical and fail-closed;
- no C3 work fabricates a product/screenshot/evidence item to unblock itself;
- exact-head Quality Gates and Browser Assurance are green for the C2 baseline being extended;
- open owner decisions remain explicit rather than inferred away;
- client/performance budgets are known and have not been weakened.

## 4. Non-negotiable constraints

1. Astro static-first remains authoritative for the public site.
2. Critical product identity, capability explanation, evidence, navigation, and actions must remain available without JavaScript.
3. Product UI shown as proof must originate from real product artifacts. Generated concept UI may never be presented as runtime proof.
4. C3 components may consume canonical product/claim/evidence/release truth but may never create a second truth registry.
5. Unknown, missing, stale, private, preview, or unverified facts must fail closed.
6. No behavioural fingerprinting, covert visitor profiling, ad-tech personalization, or cross-site tracking.
7. Visitor personalization must be explicit or capability-based and must never hide required truth.
8. Analytics/RUM transmission remains OFF until the existing owner privacy/provider decision is resolved.
9. No animation framework, WebGL, model provider, vector database, server runtime, or new client framework may be introduced merely because a C3 idea mentions it. Each requires a justified subsystem decision.
10. `prefers-reduced-motion`, forced colors, keyboard, touch, 320/390px, 200% text zoom, text spacing, and bilingual EN/VI parity remain first-class requirements.
11. Static fallback must itself look premium. Enhancement failure must not collapse the narrative.
12. No scroll hijacking, custom cursor, autoplay audio, loader theatre, particle galaxy, fake AI-neural visuals, fake telemetry, or animation-gated content.
13. Performance budgets are hard safety rails. Raising a budget is never the first remediation for a C3 regression.
14. Human E4 findings remain human evidence. Automated or LLM review cannot be relabelled as real-user acceptance.
15. Each C3 subsystem ships through a separate branch/PR and can be rejected or rolled back independently.

## 5. Approved God-tier capabilities

### G1 — Living Product Scene Engine

Turn a real product screenshot or product artifact into a structured scene with focal regions, depth, optional motion, and capability-linked inspection.

The scene engine consumes real product artifacts and authored scene metadata. It does not redraw the product or synthesize unsupported UI.

Static render remains authoritative. Motion is enhancement only.

### G2 — Verifiable Product Concierge

Provide an optional question-answer experience over canonical public product, claim, evidence, support, release, and route truth.

The concierge is not a general chatbot. It must:

- answer only within approved public sources;
- attach source/provenance references to every substantive answer;
- distinguish supported fact from interpretation;
- return explicit unknown/unavailable when evidence is insufficient;
- never claim certification, availability, capability, pricing, customer outcome, or security state not present in source truth;
- work behind an explicit privacy/runtime/provider decision;
- degrade to deterministic navigation/search when the model service is unavailable.

A model/provider is an implementation choice, not part of the public truth model.

### G3 — Guided Product Story Playback

Create a visitor-controlled walkthrough of a real flow:

`Problem → Product action → UI state → Outcome → Evidence`

Playback is semantic HTML first. Visitor controls navigation and can skip, pause, or inspect. No scroll lock or mandatory autoplay.

### G4 — Product-to-Proof Continuum

Let a product capability lead directly to its supporting public evidence/provenance without forcing the visitor into a separate trust journey.

Capability, proof, boundary, and evidence state remain canonical and fail-closed.

### G5 — Visitor-Controlled Experience Graph

Allow a visitor to explicitly select an intent such as:

- Explore products;
- Evaluate a product;
- Verify trust;
- Understand architecture;
- Work with BlueSkyz.

Intent changes prominence and recommended next actions, not underlying truth or route availability. Default experience remains complete.

### G6 — Adaptive Fidelity Engine

Select an experience fidelity tier from user preferences and browser/device capabilities.

Proposed tiers:

- `static-premium` — full content, no cinematic dependency;
- `restrained` — lightweight motion and native transitions;
- `cinematic` — richer supported motion where capability and preference allow.

The engine may use standards-based signals such as reduced motion, reduced data where supported, viewport/layout constraints, and feature detection. It must not fingerprint devices or transmit capability signatures.

### G7 — Spatial Product House 2.5D

A post-foundation halo experiment for spatial product navigation.

Default implementation target is HTML/CSS/SVG/native platform features. WebGL is a separate GO/NO-GO experiment and may ship only if measured product comprehension/memorability gains outweigh client/GPU/accessibility cost.

### G8 — Evidence-Aware Experience Choreography

Use restrained visual/motion semantics to reinforce known truth states without replacing textual state labels.

Examples may include different transition treatment for published, preview, unavailable, or unknown states, but no color/motion treatment may imply a quality score or assurance level.

### G9 — Agent-Readable Product & Trust Passport

Expose a deterministic machine-readable public representation of canonical product/trust truth for search agents, procurement automation, and AI discovery.

The representation must be generated from existing canonical sources, versioned, privacy-safe, and incapable of leaking internal repository paths, unpublished products, private evidence, secret identifiers, or unsupported claims.

### G10 — Living Release Story System

Represent meaningful product releases as structured public stories:

`What changed → Why it matters → Product surface → Evidence/source → Version/freshness`

Release stories come from real release truth. Minor technical changes must not be inflated into marketing milestones.

## 6. Approved S+ capabilities

### S1 — Product Anatomy Hotspots

Accessible, keyboard/touch-capable capability hotspots on real product images. Hotspots reveal canonical capability explanation and optional evidence links.

### S2 — Cinematic Screenshot Art Direction System

Standardize crop, focal point, intrinsic size, aspect treatment, perspective limits, surface background, loading priority, responsive behavior, and accessibility for product imagery.

### S3 — BlueSkyz Editorial Typography v2

Refine responsive scale, line length, optical hierarchy, evidence typography, and EN/VI line-breaking so premium quality is carried by typography rather than effects.

### S4 — Scene-Aware Global Header

Let the header adapt contrast/density across Ink/Porcelain/product scenes while preserving stable navigation, semantics, focus visibility, and predictable action placement.

### S5 — Route Transition Grammar

Define distinct native transition purposes for Home→Product, Product→Evidence, Product→Product, and EN↔VI. Ordinary navigation remains authoritative.

### S6 — Brief / Technical Reading Modes

Offer visitor-controlled content density using the same canonical information. `Brief` prioritizes outcomes and essential proof. `Technical` reveals architecture, boundaries, evidence, and deeper product detail.

No mode may hide legally/security-relevant truth required for a decision.

### S7 — Truthful Product Compare

Compare compatible public products across canonical dimensions without ranking, scoring, or declaring a winner. Unknown or not-applicable remains explicit.

### S8 — Evidence Drawer / Evidence Peek

Provide contextual evidence preview without losing product context. Desktop may use a side sheet or anchored panel; mobile and no-JS use native document disclosure/navigation.

### S9 — Mobile Cinematic Composition

Treat mobile as a dedicated editorial composition with image bleed, readable product UI, thumb-safe actions, and restrained vertical motion rather than a compressed desktop scene.

### S10 — Microinteraction Quality Pass

Standardize hover, focus, active, pressed, disclosure, selection, navigation, image focus, and loading feedback into a small purpose-based interaction grammar.

## 7. Capability architecture

C3 should be implemented through seven isolated subsystems.

### A. Experience Craft Foundation

Owns S2, S3, S4, S5, S9, and S10.

This is the lowest-risk, highest-coverage layer and should normally be the first C3 runtime program after C2 stabilizes.

### B. Living Product System

Owns G1, G3, S1, S6, and S7.

Depends on real public product truth and real product artifacts.

### C. Trust Continuum

Owns G4, G8, G9, and S8.

Depends on Claim Fabric, evidence/passport/provenance contracts, public product truth, and current SGPS fail-closed behavior.

### D. Adaptive Experience

Owns G5 and G6.

Must remain local, privacy-preserving, explicit/capability-based, and reversible.

### E. Verifiable Concierge

Owns G2.

This is a distinct application subsystem. It requires separate architecture/privacy/security decisions for model/provider/runtime, input controls, retrieval, source policy, logging, rate limits, abuse handling, and graceful degradation.

### F. Living Release Publication

Owns G10.

Requires a canonical release-story schema and adapters from real release truth. It must remain decoupled from marketing prose generation.

### G. Spatial Halo Experiment

Owns G7.

This is explicitly optional. It is a hypothesis-driven halo experiment after the static/native product experience is already excellent.

## 8. Data and truth flow

Authoritative direction:

`Product/Claim/Evidence/Release Truth → Pure selectors/adapters → Experience components → Optional enhancement`

Forbidden direction:

`Cinematic/AI component → invented product/claim/evidence/release fact`

The concierge may retrieve and summarize public truth but does not become an authority source. The machine passport serializes truth but does not become a second registry. Reading modes and experience intent alter presentation but not truth membership.

## 9. Experience state model

C3 introduces presentation state, not business truth state.

Allowed visitor-local presentation state may include:

- selected intent;
- brief/technical reading mode;
- opened hotspot/evidence item;
- selected comparison products;
- active guided-story step;
- supported fidelity tier.

Presentation state must remain separable from product lifecycle, claim state, evidence state, assurance state, or deployment state.

## 10. Concierge safety and privacy boundary

The Verifiable Product Concierge is the highest-risk C3 capability.

Before implementation, a dedicated ADR/design decision must establish:

- model/provider or local inference choice;
- server/runtime boundary;
- allowed public corpus;
- retrieval/indexing model;
- source freshness strategy;
- prompt-injection and content-origin controls;
- output citation enforcement;
- refusal/unknown behavior;
- rate limiting and abuse protection;
- privacy and log retention policy;
- monitoring/error budget;
- model/vendor outage fallback;
- security review and cost ceiling.

No visitor conversation data may be repurposed for profiling or marketing without a separately approved privacy decision.

## 11. Performance and fidelity contract

C3 keeps the existing repository client budget as the hard authority.

Program rules:

- native HTML/CSS/SVG before JS;
- CSS/native View Transitions before animation libraries;
- product imagery must use measured responsive formats and intrinsic dimensions;
- enhancement modules lazy-load only when the surface needs them;
- concierge payload/runtime must not be part of initial homepage critical JS;
- spatial/3D code must never be in the default critical path;
- device capability adaptation must not perform expensive benchmark loops;
- every subsystem records before/after client bytes and Core Web Vitals/Lighthouse evidence.

## 12. Accessibility contract

Every C3 subsystem must preserve or improve:

- semantic DOM and normal reading order;
- keyboard and pointer parity;
- touch usability;
- visible focus;
- no hover-only information;
- reduced-motion equivalence;
- no horizontal overflow at 320px;
- readable 390px mobile composition;
- 200% text zoom;
- text-spacing overrides;
- forced-colors behavior;
- axe critical/serious = 0 on affected routes;
- screen-reader names/states for hotspot, drawer, compare, story, reading mode, and concierge controls.

## 13. Security and abuse contract

C3 must not weaken existing security controls.

Additional requirements:

- user-supplied concierge text is untrusted input;
- rendered model output must never execute HTML/script;
- external links are canonical/allowlisted according to current public truth helpers;
- machine passport must never expose secrets or internal evidence paths;
- compare/intent state must not permit URL/script injection;
- release adapters must validate source identity/freshness;
- no third-party script receives product/visitor interaction data by default;
- optional remote AI/runtime must receive the minimum data required for the explicit user request.

## 14. Anti-gimmick rejection criteria

Reject or redesign a C3 change if any of the following is true:

- the effect is memorable but does not improve comprehension, verification, orientation, or action;
- product UI becomes smaller or less inspectable in order to make room for decoration;
- the site resembles a generic AI/aurora/particle template;
- motion becomes continuous background noise;
- evidence is converted into badges, scores, or false certainty;
- personalization changes facts instead of prominence;
- mobile becomes a degraded desktop replica;
- a new runtime/dependency exists mainly to make an effect easier to code;
- a model answer can appear without source support;
- a machine-readable surface exposes unpublished/private truth;
- performance/accessibility budgets are loosened to accommodate spectacle.

## 15. Program order

Recommended post-C2 sequence:

1. **C3-A Experience Craft Foundation** — S2/S3/S4/S5/S9/S10.
2. **C3-B Trust Continuum** — G4/G8/G9/S8.
3. **C3-C Living Product System** — G1/G3/S1/S6/S7 once real product artifacts exist.
4. **C3-D Adaptive Experience** — G5/G6.
5. **C3-E Verifiable Concierge** — G2 after dedicated architecture/privacy/security decision.
6. **C3-F Living Release Publication** — G10 when release truth adapter exists.
7. **C3-G Spatial Halo Experiment** — G7 only after GO gate.
8. **C3-H Cross-system elite QA/red team** — final convergence and evidence.

B and C may swap based on product-truth readiness. E and G must never block the rest of C3.

## 16. Exit criteria

C3 may be declared complete only when:

1. all implemented capabilities derive truth from canonical sources;
2. real products can be understood and inspected without cinematic effects or AI;
3. product capability can reach evidence/provenance without losing context;
4. reading/intent/fidelity adaptation is visitor-controlled or capability-based and privacy-safe;
5. concierge, if shipped, is source-bound, citation-enforced, fail-closed, abuse-protected, and gracefully degradable;
6. machine-readable product/trust passport is deterministic and leak-safe;
7. meaningful releases can be represented from canonical release truth;
8. mobile composition is independently premium;
9. all exact-head source/browser/accessibility/performance/security gates are green;
10. no client budget or assurance control was weakened to make C3 pass;
11. optional spatial/3D work has a written GO decision based on measured value;
12. real-human E4 remains separately recorded and never fabricated.

## 17. Approved outcome

The desired BlueSkyz experience is no longer merely a polished site or a cinematic portfolio.

It should feel like a **living product publication with inspectable truth**:

- products demonstrate themselves;
- claims reveal their evidence;
- the interface adapts without surveilling;
- AI answers only what the public truth can support;
- machine agents can consume the same truth safely;
- premium quality comes from clarity, composition, interaction precision, and evidence-backed intelligence.
