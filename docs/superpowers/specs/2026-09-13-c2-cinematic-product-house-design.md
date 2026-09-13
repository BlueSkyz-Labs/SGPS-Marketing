# C2 — Cinematic Product House Design

**Status:** OWNER-APPROVED — design authority for the next public-experience program.

**Date:** 2026-09-13

**Repository baseline:** `main@cf65cbc4467b24d125fcbb37fdf00a8a7a658f03`

**Parent authorities:**

- `docs/superpowers/specs/2026-09-03-blueskyz-web-v1-c1-1-design.md`
- `docs/superpowers/specs/2026-09-11-s-plus-experience-design.md`
- `docs/superpowers/specs/2026-09-11-s-plus-v2-trust-native-design.md`
- `docs/superpowers/specs/2026-09-12-god-tier-v3-trust-experience-design.md`
- `docs/superpowers/specs/2026-09-12-v3-1-convergence-hardening-design.md`
- `architecture/sgps-model.json`
- `AGENTS.md`

## 1. Executive decision

The next BlueSkyz Labs public-experience direction is **C2 — Cinematic Product House**.

C2 is a hybrid of two previously explored directions:

- **Product House Recomposition** is the permanent structural foundation.
- **Cinematic Experience** is a progressive, bounded experience layer applied only to moments that deserve additional attention.

The governing doctrine is:

> **Static-first. Product-led. Cinematic at the moments that matter. Evidence-rich underneath.**

C2 does not replace SGPS. It changes how SGPS is exposed to visitors. SGPS becomes the invisible trust and truth infrastructure beneath a much simpler, more desirable public experience.

The public site must feel like a premium product company first and a verifiable evidence system second. A visitor should experience rigor without being forced to understand the internal rigor framework.

## 2. Why this program is necessary

The repository is technically more mature than its public visual experience.

At the design baseline:

- Source assurance, deployment assurance, public-truth semantics, provenance, recovery, accessibility, text zoom, forced colors, security surface, bilingual parity, and production smoke are already strongly governed.
- Brand Kit v4 is already adopted and guarded.
- The public product registry remains empty: `src/content/products/` contains no public product entries.
- Homepage composition still exposes many experience systems sequentially: Hero, Experience Spine, Intent Lens, Featured Products, One House, Flagship Proof, Trust, About, Next Step, and Atlas.
- The latest full-surface visual audit recorded Home desktop at 7/10 and Home mobile at 6.5/10 before bounded polish; Products and About remained visibly weaker than the technical system beneath them.

The core problem is therefore not insufficient engineering quality. It is **attention architecture**.

The current site makes too many legitimate systems simultaneously visible. The result risks reading as a documentation/control surface rather than a memorable premium product house.

## 3. Supersession boundary

C2 supersedes the **homepage/public-composition guidance** of earlier S+ specs where that guidance conflicts with this document.

Specifically:

- `ExperienceSpine` is no longer a required prominent homepage rail.
- `IntentLens` is no longer a required homepage-above-product control.
- `Atlas` is no longer a required homepage closing surface.
- Evidence traces, passports, decision tooling, and provenance search remain valid capabilities but move deeper in the visitor journey.
- Existing truth, state, provenance, accessibility, bilingual, security, deployment, and fail-closed contracts remain fully authoritative.

C2 does **not** authorize deleting SGPS capabilities simply because they are removed from the homepage. It changes their placement and disclosure depth.

## 4. North star

The target perception is:

> **Premium Product House powered by verifiable truth.**

The target emotional model is:

> **Calm authority × Product desire × Verifiable substance.**

The target public sequence remains compatible with C1.1 but becomes more cinematic:

> **Understand → Desire → Discover → Believe → Verify → Act**

The experience should communicate:

- BlueSkyz builds real products.
- Those products are considered, distinctive, and useful.
- BlueSkyz has a coherent point of view across different product categories.
- Claims and maturity are bounded by evidence.
- A visitor can verify deeper facts when they choose to do so.

## 5. Five non-negotiable principles

1. **Real product is the hero, not SGPS.**
2. **One signature visual language, not ten unrelated effects.**
3. **Native web platform before animation framework.**
4. **Static fallback must itself meet the premium bar.**
5. **No spectacle may weaken truth, accessibility, privacy, security, or performance.**

A sixth operational rule governs every prominent object:

> **Attention must be earned by user value.**

Every prominent visual object must primarily serve one of four jobs:

- Brand
- Product
- Evidence
- Action

Decorative objects must retreat behind those jobs.

## 6. Experience architecture

C2 is a layered architecture:

### Layer 1 — Assurance / Security / Deployment

Existing repository and production controls remain authoritative. This layer includes CI/source gates, deployment read-back, rollback rules, edge security, provenance, and public-truth validation.

### Layer 2 — Public Product Truth

Product schema, lifecycle, availability, public labels, actions, proof, screenshot, source revision, and publication contracts determine whether a product may appear publicly.

The cinematic layer cannot create or infer any of these facts.

### Layer 3 — SGPS Experience

Claims, truth states, boundaries, evidence IDs, source traces, passports, manifest, decision-room data, and trust routes provide verification depth.

### Layer 4 — Product Experience

This is the primary public layer: product outcomes, real screenshots, product identity, concise maturity, product-house relationships, and useful next actions.

### Layer 5 — Cinematic Experience

Native motion, spatial composition, cross-page continuity, and signature transitions enhance the product experience. This layer must remain removable without loss of meaning or action.

The dependency direction is one-way: higher layers consume truth from lower layers. No cinematic component may become a second source of truth.

## 7. Homepage narrative

The C2 homepage becomes six acts.

### Act I — Arrival

#### 7.1 Horizon Hero

The hero establishes BlueSkyz, the proposition, and one next action.

Required content:

- BlueSkyz brand identity.
- One short masterbrand proposition.
- One concise supporting statement.
- One primary CTA.
- At most one secondary text action.

The hero must not contain evidence graphs, product-status clusters, command controls, or multiple competing card systems.

The existing Horizon motif is retained but transformed from a framed brand artwork into an integrated spatial field.

The initial frame must already contain the H1 and actionable content. No loader, intro gate, delayed-copy reveal, or animation completion may be required.

#### 7.2 Brand-to-product seam

The horizon becomes a narrative seam between brand promise and product proof.

As the visitor advances, the composition transitions from Ink into a product-led Porcelain scene. The preferred implementation is CSS/SVG/native-scroll enhancement. The static document order remains normal and meaningful.

The semantic message is: **the brand promise materializes into a real product.**

### Act II — Desire

#### 7.3 Flagship Theatre

The first real public flagship receives the largest product moment on the homepage.

Required ingredients:

- real screenshot from the public product record;
- product identity;
- one sharp customer outcome;
- truthful public status;
- platform where useful;
- valid primary action;
- two or three verified capabilities only when schema truth supplies them.

The screenshot is the principal visual object. It should not be trapped inside a generic card grid.

Desktop may use restrained spatial overlap, small perspective or rotation, and scroll-linked settling. Mobile uses a direct editorial composition with no cramped overlays.

If no product satisfies the publication contract, Flagship Theatre does not fabricate content. The homepage falls back honestly and the release cannot claim completion of the Product House activation milestone.

#### 7.4 Product House

After the flagship, the remaining public portfolio is presented with editorial hierarchy:

- one flagship;
- up to two secondary featured products;
- selected ecosystem products;
- explicit route to the full product index when needed.

Products do not receive equal visual weight by default.

The default interaction is semantic HTML and normal links. An enhanced desktop rail may use native scrolling/scroll snap or a small enhancement module, but mobile defaults to a vertical editorial stack.

### Act III — Meaning

#### 7.5 One House editorial interlude

One House becomes a brand-philosophy interlude rather than a framework matrix.

Public language should express four ideas without forcing SGPS terminology:

- Clarity
- Human agency
- Purposeful intelligence
- Trust by design

The section uses large editorial type, space, and restrained transitions rather than four equal icon cards.

The section must not imply that every product uses AI or the same technology.

### Act IV — Trust

#### 7.6 Proof without trust theatre

The homepage trust layer is concise. It should demonstrate the operating posture without exposing the entire evidence model.

Preferred public concepts include:

- Real products
- Clear status
- Privacy-conscious operation
- Verifiable evidence

Each item may expose a contextual `See evidence` action when the repository contains a real destination.

#### 7.7 Progressive Evidence Reveal

Evidence is disclosed on demand.

The first reveal may show:

- claim statement;
- authored truth state;
- concise boundary where present;
- one or more safe public evidence destinations;
- link to the full evidence passport or trust route.

The compact reveal must derive from existing claim/evidence sources. It cannot maintain independent claim text or stronger state wording.

Deep verification remains available through existing Evidence Passport, Source Trace, Decision Room, Trust surfaces, and the public SGPS manifest.

### Act V — Human

#### 7.8 About / Founder layer

This section is short, factual, and intentional.

Founder visibility is a human trust signal, not a substitute for product proof and not a personal-portfolio takeover.

No team size, office footprint, customer list, biography detail, or photography may be invented.

### Act VI — Action and signature

#### 7.9 Final next step

The final action prioritizes the strongest truthful customer path, normally products when a public product exists.

Contact is secondary and only promoted when a real contact path exists.

#### 7.10 Horizon closing signature

The Horizon motif may return once as a closing house signature. This is the second and final strong signature use.

Signature motion must remain rare. Repetition reduces its value and is rejected.

## 8. Placement of existing SGPS/S+ capabilities

C2 uses **progressive depth**.

### Homepage

- Hero
- Flagship Theatre
- Product House
- One House editorial
- compact trust/proof
- founder/about
- final action

### Product discovery/evaluation

- Intent Lens, if retained after usefulness review
- product index filters/orientation
- product-specific truth and evidence links

### Trust/verification

- Trust Ledger
- Source Trace
- Evidence Passport
- Decision Room
- provenance search

### Machine-facing

- `/.well-known/sgps.json`
- deployment/provenance evidence
- machine-readable security policy

### Dedicated exploration

- Atlas

Atlas may remain available as a deliberate explore/verification tool but is not required in the homepage narrative.

## 9. Signature wow moments

C2 allows a small number of memorable moments.

### W1 — Horizon Arrival

A restrained Ink field, integrated R4d/Horizon geometry, subtle Cobalt illumination, and immediate content establish identity.

Implementation preference:

- CSS gradients;
- CSS masks/clip-path where justified;
- lightweight SVG;
- transforms/opacity;
- no Canvas/WebGL dependency.

### W2 — Brand-to-product materialization

The Horizon seam gives way to the flagship product scene.

Motion may connect the hero field to the first product image through scale, crop, transform, and tonal transition. The static flow remains correct without animation.

### W3 — Flagship Theatre

A large real screenshot becomes the visual protagonist. Small callouts may connect verified capabilities to regions of the real screenshot only when the relation is truthful and understandable.

No generated concept UI may be used as proof.

### W4 — Product continuity

Where platform support exists, cross-document View Transitions may preserve identity between homepage/index product visuals and product detail pages.

Normal navigation remains authoritative. Reduced-motion mode disables decorative continuity.

### W5 — Closing Horizon Signature

A restrained closing signature reinforces house identity without adding another interaction system.

## 10. Optional cinematic media

C2 permits one pre-rendered visual media enhancement only if a later implementation wave proves it useful.

The contract is:

1. premium static poster is authoritative;
2. page is immediately understandable and usable with the poster only;
3. media enhancement loads outside the critical content path;
4. muted media contains no required information;
5. reduced-motion users receive the static composition;
6. low-capability/bandwidth contexts may remain static;
7. the asset must fit the performance envelope before promotion.

Autoplay audio is prohibited.

## 11. WebGL / 3D wow gate

WebGL is not part of the default C2 implementation.

A later isolated WebGL scene requires all of the following before a GO:

1. a real product/object benefits from 3D representation;
2. 3D materially improves comprehension, inspection, or decision quality;
3. a static fallback independently meets the visual acceptance bar;
4. the scene is lazy-loaded outside critical rendering;
5. context loss and unsupported-device behavior are defined;
6. measured CPU/GPU/memory/network budgets remain acceptable;
7. the scene is isolated and removable without breaking navigation, truth, or conversion.

Particle fields, generic AI neural imagery, decorative galaxies, and 3D used solely to signal technical sophistication are rejected.

## 12. Visual system

### 12.1 Distribution

C2 may use a slightly more cinematic dark/light rhythm than C1.1 while preserving the masterbrand palette.

Directional homepage rhythm:

- Ink/dark acts: approximately 30–38%;
- Porcelain/light acts: approximately 55–63%;
- Cobalt remains a signal/accent primitive, approximately 5–7% of perceived visual field.

These are art-direction heuristics, not pixel-count gates.

### 12.2 Surface language

Prefer:

- planes;
- spatial separation;
- asymmetric editorial composition;
- large product imagery;
- restrained hairlines;
- contrast between Ink and Porcelain;
- space before shadow;
- occlusion/scale before heavy elevation.

Reduce:

- nested cards;
- universal bordered boxes;
- repeated pills;
- decorative shadows;
- equal-weight grids;
- status chrome above the fold.

### 12.3 Typography

C2 keeps the current sans-first strategy during the first implementation wave. Typeface replacement is a separate evidence-backed decision because Vietnamese glyph quality, licensing, payload, and portability must be verified.

Typography direction:

- stronger display scale;
- restrained display weight;
- larger, calmer body text where space permits;
- fewer micro-labels;
- sentence case;
- editorial text measures;
- no all-caps giant tech slogans.

### 12.4 R4d rhythm

R4d follows:

> **Introduce → retreat → remind → sign.**

Strong uses are limited to arrival and closure. Product acts prioritize product identity and evidence.

## 13. Motion grammar VNext

C2 formalizes five motion purposes:

1. **Response** — direct interaction feedback.
2. **Reveal** — introduces information already present in document flow.
3. **Continuity** — preserves context across navigation or related states.
4. **Narrative** — explains progression such as brand-to-product materialization.
5. **Signature** — rare brand-defining event.

Rules:

- motion is never the only state carrier;
- no scroll locking or scroll hijacking;
- no custom cursor;
- no mandatory parallax;
- no continuous mouse-follow effects;
- no decorative marquee dependency;
- no text-scramble effect for critical copy;
- no animation-gated content;
- signature motion appears at most in the arrival and closing house moments;
- `prefers-reduced-motion: reduce` removes non-essential transform travel, not merely duration.

Implementation preference order:

1. CSS/native transitions and animations;
2. CSS scroll/view timelines where supported and progressive;
3. small vanilla JavaScript for state/feature detection only when necessary;
4. no animation framework dependency without a separate architectural decision.

## 14. Responsive doctrine

C2 does not shrink desktop spectacle into mobile.

### Desktop

- cinematic composition;
- controlled overlap;
- large screenshot scale;
- optional scroll-linked transforms;
- cross-page continuity where supported.

### Tablet

- reduced overlap and transform travel;
- preserved hierarchy;
- fewer simultaneous visual layers.

### Mobile

- editorial film-strip rhythm;
- vertical product story;
- strong image crop and typography;
- short motion distances;
- no cramped overlays;
- no requirement to render desktop rail interactions;
- no content loss.

Mobile quality is a first-class acceptance target, not a fallback target.

## 15. Product Truth Activation gate

C2 cannot claim full completion while the public product registry is empty.

Before Flagship Theatre is promoted as complete, at least one real product must satisfy the public publication contract.

The target floor for a public C2 flagship is:

- `public === true`;
- coherent lifecycle, availability, and publicLabel;
- real local screenshot under `/products/...`;
- real screenshot metadata and meaningful alt text;
- 2–3 verified capabilities;
- at least one valid public evidence destination;
- valid HTTPS primary action;
- real source revision reachable from repository history;
- authored review date;
- required privacy/security/support evidence for the product risk profile.

The existing owner decision in `product-schema.ts` must be resolved by real assets, never by weakening the contract.

No agent may invent a public product record simply to make the homepage visually complete.

## 16. Performance envelope

C2 uses an **Experience Performance Envelope**.

The existing repository `check:client-budget` remains authoritative. C2 does not silently raise that hard ceiling.

For C2-specific runtime additions, the design target is:

- zero new framework runtime;
- no WebGL on initial load;
- no render-blocking animation library;
- hero critical content server-rendered;
- hero image/poster, when used, is responsive and size-appropriate;
- new C2 client JavaScript should target **≤15 KB Brotli total incremental cost** across the site and must remain inside the stricter existing repository budget;
- each runtime wave records before/after total and worst-page client bytes;
- no cinematic enhancement may create a worse LCP candidate than the required product/brand content;
- interactions must avoid long main-thread tasks attributable to decorative motion;
- unsupported native enhancement features fail back to the premium static state.

The 15 KB value is an incremental design target, not authorization to consume the repository's remaining hard ceiling.

## 17. Accessibility envelope

All existing accessibility hardening remains mandatory.

C2 additionally requires:

- critical content present without animation;
- no meaning conveyed only by depth, position, color, or motion;
- reduced-motion equivalence for all narrative transitions;
- keyboard and focus behavior unchanged or improved;
- no hover-only product information;
- text remains readable at 200% zoom;
- no horizontal overflow at 320px and 390px;
- text-spacing overrides remain safe;
- forced-colors mode keeps the content model usable;
- DOM order follows reading order even when desktop art direction overlaps visually;
- product screenshots have meaningful alt text when informative;
- decorative cinematic layers are hidden from assistive technology.

## 18. Privacy and telemetry

C2 introduces no new tracking requirement.

Analytics/RUM transmission remains OFF until the existing owner privacy/provider decision is made.

Cinematic interactions must not create fingerprints, persistent visitor profiles, hidden localStorage state, or remote personalization.

## 19. Rejected patterns

The following are rejected by default:

- custom cursors;
- scroll hijacking;
- full-page mandatory scroll snap;
- mouse-follow glow everywhere;
- text scramble for primary copy;
- infinite marquees as navigation/content dependency;
- generic aurora/particle/glass AI template language;
- 3D floating blobs;
- particle galaxies;
- autoplay sound;
- loader theatre;
- horizontal-scroll-only story;
- animated counters without real measurement meaning;
- pseudo-terminal decoration;
- fake telemetry;
- fake customer logos or testimonials;
- generated concept screenshots presented as proof;
- unsupported assurance language.

## 20. Implementation boundaries

Expected new or substantially revised units include:

- `src/components/sections/Hero.astro` — C2 arrival composition;
- `src/components/experience/HorizonField.astro` — signature visual primitive, simplified and made reusable for arrival/closure;
- a focused flagship theatre component under `src/components/product/` or `src/components/sections/`;
- a focused product-house editorial component using the existing public registry;
- `src/components/sections/OneHouse.astro` — editorial reframe;
- `src/components/sections/Trust.astro` — compact proof-first surface;
- a small evidence-reveal component that consumes canonical claim/evidence selectors;
- `src/components/sections/AboutBlueSkyz.astro` — intentional human layer;
- `src/components/sections/NextStep.astro` — simplified final action;
- `src/pages/en/index.astro` and `src/pages/vi/index.astro` — new six-act composition;
- `src/styles/global.css` only for global/token-level rules; if C2 causes it to grow further, create a focused `src/styles/cinematic-product-house.css` imported by the global entry rather than adding unrelated blocks indefinitely.

Existing capability components such as `ExperienceSpine`, `IntentLens`, and `Atlas` should not be deleted merely because the homepage stops rendering them. Their future route placement is handled in later tasks.

Do not create a monolithic `CinematicHomepage.astro` or a second product registry.

## 21. Acceptance bar

### 21.1 Visitor comprehension

Owner-run E4 target:

- within 10 seconds: visitor understands BlueSkyz builds digital products;
- within 30 seconds: visitor can identify at least one real product when one is published;
- within 90 seconds: visitor can understand the selected product outcome and maturity;
- within 2 minutes: visitor can verify deeper evidence or reach the appropriate action.

Automation cannot mark this human study PASS.

### 21.2 Visual acceptance

Independent rendered review target:

- Home desktop: **≥9.0/10**;
- Home mobile: **≥9.0/10**;
- Products: **≥8.5/10**;
- About: **≥8.5/10**;
- Security/Trust: **≥8.5/10**;
- no core public surface below 8.0/10.

Scores are review targets, not machine truth. Evidence must include screenshots and written critique, not a fabricated automated score.

### 21.3 Premium density contract

Above the fold:

- at most one primary CTA;
- at most one secondary action;
- no evidence graph;
- no more than one status-vocabulary family;
- no more than two simultaneous card/boxed visual systems;
- no permanent power-user control that competes with the proposition.

### 21.4 Engineering acceptance

No regression in:

- architecture tests;
- typecheck;
- lint;
- format;
- static build;
- static links;
- client budget;
- publishability;
- integrity firewall;
- provenance;
- promotion state;
- product provenance;
- Browser Assurance across configured projects;
- axe requirements;
- mobile overflow;
- 200% text zoom;
- text spacing;
- forced colors;
- reduced motion;
- production smoke;
- security surface;
- deployment evidence.

## 22. Program waves

### P0 — Product Truth Activation

Resolve the owner-gated product publication floor with real assets and publish at least one real product only when source truth supports it.

This is the blocker for the final flagship visual state, but the C2 structural shell may be implemented against honest empty-registry behavior.

### P1 — Experience Recomposition

Replace the homepage sequence with the six-act C2 information architecture. Remove prominent homepage dependency on Experience Spine, Intent Lens, and Atlas without deleting their underlying capabilities.

### P2 — Art Direction Foundation

Implement Horizon Arrival, dark/light act rhythm, typography hierarchy, cinematic spacing, product-scale image treatment, and closing signature using native HTML/CSS/SVG.

### P3 — Product Storytelling

Implement Flagship Theatre, Product House editorial hierarchy, real screenshot treatment, and cross-page product continuity where supported.

### P4 — Trust Progressive Disclosure

Simplify homepage trust, add canonical evidence reveal, and move deep verification to existing dedicated surfaces.

### P5 — Secondary Surface Convergence

Bring Products, About, Security/Privacy/Support, Contact, Evidence Passport, and 404 into the same visual hierarchy without turning every route into a cinematic scene.

### P6 — Elite QA / Red Team / Production Evidence

Run multi-viewport visual critique, accessibility, no-JS, reduced-motion, performance, browser, truth, security, deployment, production smoke, and honest residual-risk recording. Human E4 stays owner-run.

## 23. Release doctrine

C2 is not promoted as one mega-PR.

Each runtime wave must:

1. refresh live `main` and current work;
2. use an isolated branch/worktree;
3. write failing contracts before implementation when behavior changes;
4. implement the smallest root-cause change;
5. run relevant local gates and targeted E2E;
6. run full required source gates before PR readiness;
7. obtain exact-head GitHub Source Assurance and Browser Assurance;
8. merge only on green, conflict-free evidence;
9. perform Cloudflare/post-merge production read-back where runtime changed;
10. record evidence and update the current-work router honestly.

No merge-on-red. No test weakening. No direct-to-main fallback.

## 24. Definition of success

C2 succeeds when the visitor perceives a premium product house before noticing the machinery that makes it trustworthy.

The final experience should feel restrained because BlueSkyz knows what deserves attention, not sparse because there is nothing to show.

The intended result is:

> **The product earns desire. The evidence earns belief. SGPS makes both durable.**
