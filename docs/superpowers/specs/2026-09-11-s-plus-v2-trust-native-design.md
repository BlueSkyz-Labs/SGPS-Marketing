# SGPS Marketing S+ Experience Design v2 — Trust-Native Integrity

**Status:** Canonical approved design for future S+ execution.

**Date:** 2026-09-11

**Live design baseline:** `main@24f5eef78db9cb5fa7ec0ee9c65ea2df46403536`.

**Supersedes for future design decisions:** `docs/superpowers/specs/2026-09-11-s-plus-experience-design.md`.

The original S+ design remains historical context for PR #103. This v2 document is canonical for new S+ design decisions after the 2026-09-11 deep/red-team audit. Runtime executors must refresh live `main`, issues, open PRs, checks, route truth, and product truth before every wave.

## 1. Purpose

Elevate BlueSkyz Labs from a strong premium static product-house site into a distinctive trust-native product experience where SGPS principles become understandable visitor value through evidence, provenance, boundaries, freshness, and transparent actions.

The site must not become a governance dashboard, security portal, or visual-effects showroom. The target is:

> **Trust-native Intelligence with cinematic restraint and human-readable integrity.**

Translate SGPS into:

`Source → Confidence → Evidence → Boundary → Freshness → Action`

Do not substitute internal vocabulary such as commit SHA, CI, rulesets, workflow IDs, or repository implementation details for user-facing trust.

## 2. Live implementation state at authorship

The v2 design was reconciled against live work before promotion.

### Already merged and satisfied

PR #104 is merged and materially satisfies the original foundation work for:

- purpose-based Motion Grammar tokens under #96;
- reduced-motion token override;
- stronger client-JS budget enforcement under #99 across every built page, including site-wide unique and worst-case page measurement;
- exact-SHA baseline evidence;
- zero client JS at that baseline;
- recorded hero asset sizes and Lighthouse/CWV proxies.

PR #105 is merged into `main@24f5eef78db9cb5fa7ec0ee9c65ea2df46403536` and materially satisfies the BlueSkyz Horizon foundation:

- reusable `HorizonField.astro`;
- CSS-only decorative horizon primitive;
- server-rendered H1 and CTA remain dominant;
- intentional mobile composition;
- zero incremental client JavaScript;
- EN/VI, 320px, and reduced-motion browser coverage.

The v2 program must **reuse and preserve #104 and #105**, not implement parallel motion, performance-budget, or Horizon systems.

## 3. Current-state audit incorporated into v2

### Strengths to preserve

- Astro static-first architecture.
- Zero/small client-runtime posture and hard JS budget.
- EN/VI route model and ordinary-link language switching.
- Truth-gated product publishing.
- Local proof-artifact requirement.
- Privacy, Security, and Support as first-class routes.
- WCAG-oriented keyboard, focus, reduced-motion, and browser assurance.
- Ink / Porcelain / Cobalt brand system.
- Exact-head CI and Cloudflare promotion discipline.
- Existing `src/lib/truth.ts` production-origin/email validation.
- Merged BlueSkyz Horizon implementation from #105.

### Audit findings still requiring v2 work

#### A. SGPS governance is stronger than SGPS user experience

Repository governance already enforces proof, provenance, truth, static-first behavior, and promotion evidence. Visitors currently see only a fraction of that integrity model.

#### B. Latent bilingual shared-component defects

Some shared components contain English-only copy or non-locale product paths that are masked while the public product registry is empty. These must be fixed before public products appear.

Affected categories include:

- header CTA labels;
- mobile-menu label;
- featured-product headings/actions;
- flagship-profile action;
- proof caption;
- product/profile route prefixes.

#### C. Product truth and brand assets are correctly separate but easy to misuse

Brand assets exist for multiple products. They are branding resources, not publication evidence. No product may appear in public UX solely because its asset exists.

#### D. User-visible trust is still route-oriented rather than evidence-oriented

“Trust you can verify” currently points to real routes, which is good, but v2 should make the relationship between claim, source, boundary, and freshness inspectable without implying certification.

#### E. Historical state can drift quickly under concurrent agent execution

v2 must distinguish historical plan text from live execution state and require reconciliation at each wave.

## 4. Strategic model

### Layer A — S+ Experience Foundation

The original ten systems remain conceptually valid:

1. BlueSkyz Horizon.
2. Elevation Spine.
3. Verifiable Trust Ledger.
4. One House Intelligence Matrix.
5. Intent Lens.
6. Contextual Journey Bar.
7. Native Language Morph.
8. BlueSkyz Motion Grammar.
9. Cmd/Ctrl+K Command Navigator.
10. BlueSkyz Atlas.

At this baseline, Motion Grammar/client budget are already merged through #104, and BlueSkyz Horizon is already merged through #105.

### Layer B — SGPS Integrity Experience

The newly approved systems are:

11. SGPS Integrity Lens — Verify this page.
12. Evidence Pulse — explicit freshness.
13. Truth-State Visual Grammar.
14. Executive ↔ Evidence Mode.
15. Proof-First Empty States.
16. Provenance Search.
17. Boundary Cards.
18. Evidence Change Intelligence.
19. Bilingual Mirror.
20. Safe Action Preflight.

The two layers share data and primitives. Do not build twenty disconnected widgets.

## 5. Non-negotiable constraints

1. Preserve Astro static-first architecture and current Cloudflare deployment.
2. Preserve Node `>=24.20.0` and pnpm `>=11.25.0 <12`.
3. Preserve EN/VI route parity, canonical behavior, language switching, and hreflang intent.
4. Critical content, navigation, trust/evidence explanation, and actions must work without JavaScript.
5. JavaScript may enhance orientation/search/continuity only after a static baseline exists.
6. Respect `prefers-reduced-motion`; motion is never the only carrier of meaning.
7. Preserve keyboard operation, visible focus, semantic landmarks/headings, 44px target intent, 200% zoom, and 320px no-overflow behavior.
8. Never invent products, certifications, partners, counts, performance claims, testimonials, maturity/trust scores, review dates, evidence, or guarantees.
9. Brand assets do not authorize product publication.
10. Build time is not evidence-review time.
11. Cobalt is a signal color; state is never color-only.
12. No scroll-jacking, mandatory parallax, custom cursor, autoplay video, or decorative canvas dependency.
13. Default to semantic HTML, CSS, and SVG; no new UI framework.
14. Preserve #104 motion/budget contracts; do not fork them.
15. Preserve #105 Horizon architecture; extend it rather than replace it.
16. WebGL/3D remains gated by #99/#102 and is not default S+.
17. Do not create a second manually maintained route/product/evidence truth registry.
18. Preserve `src/lib/truth.ts` as production public-truth validation.
19. Do not weaken source assurance, accessibility, truth, or performance gates.
20. Automated assurance and human E4 remain separate evidence classes.
21. Every runtime promotion requires exact-head and post-merge read-back.

## 6. Experience integrity primitives

### 6.1 TruthState

```ts
export type TruthState =
  "source-linked" | "reviewed" | "changed" | "not-published" | "unavailable";
```

These are presentation states, not certification levels.

Forbidden generic state constructs without a stronger contract:

- blanket `verified: true`;
- `trusted`;
- `certified`;
- numeric trust/maturity/confidence scores;
- `secure` used as a scored assurance state.

### 6.2 EvidenceReference

```ts
export interface EvidenceReference {
  kind: "route" | "artifact" | "private-reporting";
  href: { en: string; vi: string };
  label: { en: string; vi: string };
}
```

An evidence link proves only what its source actually establishes.

### 6.3 ReviewMetadata

```ts
export interface ReviewMetadata {
  reviewedOn: string;
  source: "content-review" | "evidence-update";
}
```

Rules:

- explicit source data only;
- never generated at build time;
- if unavailable, omit freshness;
- content review does not imply external security audit.

### 6.4 BoundaryStatement

```ts
export interface BoundaryStatement {
  claim: { en: string; vi: string };
  doesNotImply: { en: string; vi: string };
}
```

Boundary copy must be grounded in published behavior/policy and must not become speculative legal language.

## 7. Foundation systems

### 7.1 BlueSkyz Horizon

Already merged through #105. The Horizon remains the reusable CSS/SVG signature for mobile and desktop, keeps server-rendered H1/CTA dominant, and requires no WebGL/runtime animation dependency.

Future work may refine composition only when it preserves #105 tests, performance, and semantic boundaries.

### 7.2 Elevation Spine

Connect homepage narrative through:

`Intelligence → Elevation → Trust → Impact`

Static anchors/document flow are authoritative. No scroll lock, snap, or JS requirement.

### 7.3 Verifiable Trust Ledger

Represent Privacy, Security reporting, Support, and future proof surfaces as evidence-oriented entries. Route existence is evidence of route existence, not certification.

### 7.4 One House Intelligence Matrix

Map Intelligence / Elevation / Trust / Impact to practical dimensions while keeping all content accessible without hover/JS.

### 7.5 Intent Lens

Visitors may self-select:

- evaluate a product;
- understand BlueSkyz;
- verify trust;
- work with us.

Selection changes emphasis, never factual availability. V1 is ephemeral and privacy-safe.

### 7.6 Contextual Journey Bar

Expose route-aware next actions near content end. It is orientation, not a sticky conversion banner.

### 7.7 Native Language Morph

Real language links remain canonical; native View Transitions may enhance continuity when capability/reduced-motion constraints allow.

### 7.8 BlueSkyz Motion Grammar

Already materially implemented by #104. Preserve the four roles:

- Orientation.
- Emphasis.
- Confirmation.
- Continuity.

Future motion must map to these tokens rather than introduce ad-hoc duration/easing systems.

### 7.9 Command Navigator

Cmd/Ctrl+K provides keyboard-first access to real routes, trust surfaces, and published products. Normal navigation remains sufficient.

### 7.10 BlueSkyz Atlas

V1 is SVG/HTML-first and uses BlueSkyz, principles, trust surfaces, and published products only. Empty registry means zero product nodes.

## 8. SGPS Integrity Experience systems

### 8.1 SGPS Integrity Lens — Verify this page

A lightweight surface-level disclosure exposes modeled public integrity entries:

- summary;
- source/evidence route;
- truth state;
- optional explicit review metadata;
- boundary statement where relevant.

It must not enumerate every sentence, expose raw CI/repository details by default, imply certification, or generate evidence from prose using an LLM.

V1 should prefer semantic `<details>` and zero JS.

### 8.2 Evidence Pulse

Display freshness only from explicit trustworthy metadata:

- Reviewed on `<date>`;
- Evidence updated `<date>`;
- Changed since prior public evidence state.

No constantly animated “live” dot.

### 8.3 Truth-State Visual Grammar

Use text + glyph + border/typography + restrained signal color. No color-only semantics and no green-badge wall.

### 8.4 Executive ↔ Evidence Mode

Provide concise executive reading plus optional evidence detail from one source model. Prefer native progressive disclosure; do not create duplicate page trees.

### 8.5 Proof-First Empty States

When product registry is empty, `/products/` explains that only proof-backed public products are listed. It must not reveal unpublished names or imply no private/unpublished products exist.

### 8.6 Provenance Search

Extend Command Navigator with deterministic local evidence search over modeled public integrity, trust, and product sources. No LLM, vector DB, remote search API, or generated answer.

### 8.7 Boundary Cards

State what evidence establishes and what it does not establish. Example: private vulnerability reporting establishes a reporting channel, not an external certification.

### 8.8 Evidence Change Intelligence

Only implement when an authoritative deliberately authored public change source exists. Never expose raw Git history as public change intelligence.

```ts
export interface PublicEvidenceChange {
  id: string;
  date: string;
  kind: "added" | "updated" | "superseded" | "status-changed";
  subjectId: string;
  summary: { en: string; vi: string };
}
```

### 8.9 Bilingual Mirror

Selected trust/evidence surfaces may show explicitly paired EN/VI content side-by-side/stacked. No runtime machine translation or DOM scraping.

### 8.10 Safe Action Preflight

Eligible external/private-reporting/mailto actions expose concise destination/data-boundary context without mandatory confirmation. Ordinary internal links get no extra friction.

## 9. Data architecture

### `src/lib/truth.ts`

Existing production public-truth validation remains authoritative for canonical origin and required production configuration. v2 integrity UX does not replace it.

### `src/data/experience.ts`

Owns localized principle/narrative copy and stable experience IDs.

### `src/data/trust-ledger.ts`

Owns truth-safe trust display entries for Privacy, Security, and Support.

### `src/data/integrity.ts`

Owns typed page/surface integrity entries, boundary statements, evidence references, and explicit review metadata. It may reference trust/public facts but must not duplicate product truth.

### `src/data/public-evidence-changes.ts`

Created only if real approved public change metadata exists.

### `src/lib/products.ts`

Remains authoritative for published products.

### `src/lib/i18n.ts` and `src/data/site.ts`

Remain authoritative for supported languages/global route behavior/site-level labels.

### `src/lib/integrity.ts`

Provides deterministic selection/search helpers over integrity data; it is not another content store.

## 10. Component boundaries

Expected reusable units:

- `src/components/experience/HorizonField.astro` — already merged via #105.
- `src/components/experience/ExperienceSpine.astro`.
- `src/components/experience/TrustLedger.astro`.
- `src/components/experience/OneHouseMatrix.astro`.
- `src/components/experience/IntentLens.astro`.
- `src/components/experience/JourneyBar.astro`.
- `src/components/experience/CommandNavigator.astro`.
- `src/components/experience/Atlas.astro`.
- `src/components/integrity/IntegrityLens.astro`.
- `src/components/integrity/TruthState.astro`.
- `src/components/integrity/BoundaryCard.astro`.
- `src/components/integrity/EvidenceDetails.astro`.
- `src/components/integrity/SafeAction.astro`.
- `src/components/integrity/BilingualMirror.astro`.

Do not create monolithic `SPlusExperience` or `IntegrityDashboard` components.

## 11. Performance contract

PR #104 established a stronger site-wide/worst-case built-page JS budget than the original root-only checker. That merged contract is authoritative unless a later evidence-backed change supersedes it.

Rules:

- Preserve the 120,000-byte hard client-JS ceiling unless repository governance explicitly changes it.
- Preserve site-wide unique and worst-case page measurement.
- Record incremental JS for interactive waves.
- Horizon, Spine, Ledger, Matrix, Boundary Cards, empty states, Integrity Lens V1, Atlas V1, and evidence content should require zero client JS.
- Intent Lens, language continuity, Command Navigator, and Provenance Search use small vanilla modules.
- No new UI framework.
- No WebGL in default S+.
- No autoplay media.
- Preserve #104 performance evidence and add fresh evidence for later waves.

## 12. Accessibility contract

Every new component must satisfy:

- keyboard parity;
- visible focus;
- no hover-only information;
- no color-only state;
- semantic headings/landmarks;
- native disclosure/dialog semantics where appropriate;
- focus management for any future modal behavior;
- reduced-motion equivalence;
- 44px target intent;
- readable 200% zoom;
- no 320px horizontal overflow;
- axe critical/serious = 0 on affected routes;
- static intelligibility when enhancement scripts fail.

## 13. Bilingual contract

Before public-product publication or S+ rollout:

- shared labels are typed/locale-aware;
- product links preserve locale where route parity exists;
- EN/VI share semantic IDs;
- translation differs only in expression/length, not meaning;
- Bilingual Mirror uses explicit authored pairs;
- no automatic translation service.

## 14. Empty-registry contract

The experience must remain coherent with zero public products:

- no fabricated product cards;
- no product nodes in Atlas/search;
- useful header CTAs remain;
- `/products/` explains proof-first publication;
- no unpublished name inferred from brand assets;
- “not published” is used only for modeled publication surfaces.

## 15. Promotion contract

For every runtime PR:

1. refresh `main`, issues, open PRs, and checks;
2. reconcile in-flight work touching the same surface;
3. implement on isolated branch/worktree;
4. use TDD;
5. run focused + full verification;
6. inspect final diff for truth/scope drift;
7. confirm exact-head Quality Gates and Browser Assurance;
8. confirm Cloudflare evidence where applicable;
9. merge only with no unexplained red;
10. read back merged `main` and post-merge checks;
11. record human E4 separately.

## 16. Program waves after live reconciliation

### Wave 0 — Truth-safe foundation

- treat #104 motion/budget work as satisfied and preserve it;
- treat #105 Horizon work as satisfied and preserve it;
- fix latent EN/VI shared-component defects;
- add integrity type/anti-fabrication contracts.

### Wave 1 — Remaining signature and narrative

- Elevation Spine;
- One House Intelligence Matrix.

### Wave 2 — Trust-native foundation

- Trust Ledger;
- Truth-State Visual Grammar;
- Proof-First Empty States;
- Boundary Cards;
- Safe Action Preflight.

### Wave 3 — Integrity inspection

- SGPS Integrity Lens;
- Executive ↔ Evidence Mode;
- Evidence Pulse when explicit metadata exists;
- selective Bilingual Mirror.

### Wave 4 — Adaptive orientation and discovery

- Contextual Journey Bar;
- Intent Lens;
- Native Language Morph;
- Command Navigator;
- Provenance Search.

### Wave 5 — Atlas and change intelligence

- BlueSkyz Atlas V1;
- Evidence Change Intelligence only on evidence-backed GO.

### Wave 6 — Production hardening and human evidence

- reconcile #95 with real contact behavior;
- #98 SEO/discoverability;
- #100 privacy-conscious event contract/provider decision;
- #101 smoke/rollback;
- human E4;
- #102 optional WebGL/3D GO/NO-GO.

## 17. Red-team rejection criteria

Reject/redesign any implementation that:

- duplicates merged #104 motion/budget architecture;
- replaces or competes with merged #105 Horizon architecture without evidence;
- resembles generic aurora/glass/particle AI design;
- exposes raw governance machinery instead of human value;
- displays unsupported “verified”/trust badges;
- invents review dates or uses build time as review time;
- treats brand assets as product-publication proof;
- duplicates route/product/evidence registries;
- makes mobile materially less intentional;
- adds large JS/GPU cost for novelty;
- makes evidence/search dependent on an LLM;
- machine-translates Bilingual Mirror at runtime;
- renders raw Git history as public evidence history;
- adds confirmation friction to ordinary internal links;
- hides critical information behind interaction;
- weakens accessibility/performance/source/truth gates;
- claims human acceptance from automation;
- requires WebGL for core identity.

## 18. Acceptance definition

S+ v2 succeeds only when:

1. merged #104 contracts remain intact;
2. merged #105 Horizon remains the single canonical Horizon system;
3. site remains understandable/actionable without JS;
4. mobile and desktop both have intentional BlueSkyz identity;
5. EN/VI shared components are semantically equivalent;
6. visitors can understand what evidence establishes and does not establish;
7. empty product registry remains honest/useful;
8. integrity data is source-backed and fail-closed;
9. freshness appears only from explicit review metadata;
10. deeper evidence is available without forcing technical detail;
11. no S+ feature requires a front-end framework;
12. site-wide/worst-case JS budget remains enforced;
13. Atlas/search contain only public authoritative entities;
14. exact-head source/browser/deployment evidence is green before promotion;
15. E4 is real human evidence or explicitly NOT RUN;
16. WebGL remains optional/removable.

## 19. Design decision

Approved direction:

> **SGPS-native Trust OS as the core, cinematic restraint as the visual layer, and selective decision-workspace interaction where it measurably improves orientation or verification.**

Every future effect/component/interaction must improve at least one of orientation, understanding, trust, evidence inspection, boundary clarity, or action transparency. Decorative novelty alone does not qualify.
