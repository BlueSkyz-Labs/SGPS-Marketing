# C4 — Quiet Authority / Digital Maison Design

**Status:** Owner-approved direction; planning authority only until C3 convergence and explicit activation through `docs/current-work.json`.

**Date:** 2026-09-16

**Planning baseline:** `main@5aa98a4e336f5cc0adc39a48dee683d9d7419d8a`. Every execution session MUST refresh live `main`, open PRs/issues, `AGENTS.md`, `docs/current-work.json`, applicable SGPS decisions, provider state, and newer approved specs before editing.

## 1. Purpose

C4 evolves BlueSkyz Labs from a premium verifiable product experience into a **quiet, authoritative digital maison**: a technology house where product, architecture, evidence, releases, craft, and decision support feel curated, inspectable, calm, and boardroom-grade.

C4 extends C3. It does not replace C3, create a third truth system, or use luxury styling to hide missing product truth.

The desired experience is:

`Arrive → Orient → Inspect → Understand → Verify → Compose → Present → Decide`

Quiet luxury means confidence through omission: fewer competing objects, stronger typography, richer material discipline, deliberate pacing, scarce motion, and evidence that is easy to inspect without becoming dashboard chrome.

## 2. Strategic doctrine

**Quiet authority. Verifiable craft. Boardroom clarity.**

C4 has five pillars:

1. **Maison, not catalog.** Public surfaces feel like one coherent house with Products, Proof, Architecture, Journal, and Studio relationships rather than disconnected landing pages.
2. **Editorial hierarchy before effects.** Typography, composition, whitespace, image treatment, and material surfaces carry status; spectacle is not a substitute for craft.
3. **Decision utility.** Executive dossiers, presentation mode, provenance, architecture lenses, and decision support make the site more useful in enterprise evaluation.
4. **Truth remains inspectable.** Product, claim, evidence, architecture, and release truth keep canonical ownership and explicit unknowns/boundaries.
5. **Scarcity is a quality control.** Motion, accents, CTAs, status objects, badges, decorative surfaces, and focal objects are deliberately bounded.

## 3. Source-of-truth and SGPS authority

C4 inherits the repository authority chain:

`Safety/Policy/Provider Controls > Mandatory SGPS Strategic Decisions > newest approved ADR/spec > active approved plan/wave > repository contracts/tests/interfaces > implementation > conventions/assumptions`

C4 experience components consume canonical truth through pure selectors/adapters:

`Product / Claim / Evidence / Architecture / Release Truth → public-safe selectors → C4 experience composition → optional enhancement`

Forbidden:

`C4 visual/AI/decision component → invented product/claim/evidence/architecture/release fact`

A dossier, briefing, salon, journal issue, comparison, or presentation view is a **derived view**, never a new authority source.

## 4. Non-negotiable constraints

1. C3 remains the active successor program until it reaches its approved convergence state; C4 stays `PLANNED` unless `docs/current-work.json` explicitly activates one C4 child wave.
2. Astro static-first remains authoritative for public critical content and actions.
3. No product image, capability, customer, certification, outcome, architecture fact, release fact, review date, security state, or freshness signal may be fabricated.
4. No second registry for product, claims, evidence, architecture, releases, routes, or brand assets.
5. No hidden behavioral profiling, fingerprinting, ad-tech personalization, cross-site tracking, or analytics/RUM transmission without a separately approved privacy/provider decision.
6. No scroll hijacking, custom cursor, autoplay audio, loader theatre, particle field, generic AI aurora, fake telemetry, glowing trust badge, ranking score, or artificial exclusivity language.
7. No generic glassmorphism layer as a visual system. Depth comes from hierarchy, tone, line, spacing, and real content.
8. Existing Brand v4 semantic tokens remain authoritative. Do not introduce a decorative gold palette or a second brand palette.
9. Existing client JavaScript budget is a hard ceiling; raising it is not the first remediation for a regression.
10. Every runtime wave preserves semantic DOM, ordinary links, keyboard/touch parity, visible focus, reduced-motion equivalence, forced colors, 320/390px, 200% text zoom, text-spacing overrides, EN/VI parity, axe, Lighthouse, and no-JS behavior where applicable.
11. Every runtime wave must be independently reversible and must define rollback/fix-forward behavior before promotion.
12. High-risk capabilities (private evaluation, remote AI synthesis, authenticated workspaces, persistent storage) require dedicated architecture/privacy/security decisions and threat models before implementation.
13. Human-review, legal/trademark, and real-user evidence are never auto-promoted by an agent.
14. C4 must remain valuable with all optional enhancement disabled.

## 5. Approved God-tier capabilities

### G1 — Digital Maison

Create a coherent information architecture that presents BlueSkyz as one technology house: **Products / Proof / Architecture / Journal / Studio**. This is an organizational and narrative layer over real routes and truth, not a decorative 3D lobby or duplicate navigation system.

### G2 — Executive Dossier Composer

Allow visitors to compose a boardroom-ready dossier from approved public product, capability, architecture, evidence, and release truth. Selection state may be local/ephemeral; generated content must show provenance, freshness, unknowns, and boundaries. Print/export is a derived representation, not a new record of truth.

### G3 — Boardroom Presentation Mode

Provide a presentation-optimized view of the same canonical content: one dominant idea per screen, large typography, predictable keyboard/touch navigation, inspectable sources, and a complete static fallback. Presentation mode never hides material caveats needed for a decision.

### G4 — Verifiable Architecture Salon

Turn approved public architecture into an inspectable experience with lenses such as **System / Data / Trust / Recovery / Evidence**. Every node/relationship must derive from the public-safe architecture adapter; repository/internal evidence paths and private topology never leak.

### G5 — Provenance Lens

Provide a consistent site-wide path from a visible statement to canonical fact, evidence, source identity, freshness, and boundary. It extends C3 Product-to-Proof into site-wide truth lineage without turning pages into governance dashboards.

### G6 — BlueSkyz Collected Edition

Publish curated editorial editions built from real release stories, architecture notes, product craft stories, and approved research. An edition curates existing truth; it does not create release significance, capability, customer impact, or proof.

### G7 — Decision Atelier

Evolve the existing deterministic Decision Room into a decision-support atelier. Visitors select goals/constraints and receive a sourced arrangement of relevant products, architecture, evidence, and next actions. No ranking, score, winner declaration, hidden weighting, or remote profiling.

### G8 — Private Evaluation Room

A separately gated authenticated enterprise evaluation surface for approved prospect-specific packages, architecture/security material, evidence, and decision artifacts. It requires explicit identity, RBAC, data classification, retention, audit, revocation, incident response, and recovery decisions. It must remain isolated from the public-site critical path.

### G9 — Craft Provenance Stories

For real products and systems, tell `problem → design choice → constraint → implementation → evidence → limitation`. Craft stories are sourced narratives, not retrospective invention or marketing embellishment.

### G10 — Verifiable Briefing Generator

Compose an executive briefing from approved public truth and explicit user-selected context. Deterministic templating is the baseline. Any model-assisted synthesis inherits C3 Concierge source/citation/refusal policy and requires the same or stronger privacy/security/provider controls.

## 6. Approved Tier S+ craft capabilities

### S1 — Editorial Grid System v3

A restrained asymmetric editorial grid and baseline rhythm that prevents every section from degenerating into the same centered max-width card layout.

### S2 — Optical Typography Calibration

Calibrate line length, responsive scale, cap-height relationships, numerals, captions, punctuation, EN/VI breaks, widows/orphans, evidence typography, and long-form reading measure.

### S3 — Material Surface Grammar

Converge surfaces onto a small semantic material set: **Ink / Porcelain / Quiet Paper / Cobalt Accent**. Hairlines and tonal separation outrank shadow/glass effects.

### S4 — Luxury Density Budget

Measure and guard simultaneous visual competition: CTAs, badges/chips, focal media, labels, cards, status objects, and headings. The default target is one dominant idea per viewport with bounded secondary signals.

### S5 — Editorial Folio System

Use restrained chapter/folio/caption/running-context treatments to make long journeys legible without a generic progress bar or dashboard chrome.

### S6 — Signature Colophon

Evolve the footer into a quiet publication colophon with identity, public truth/freshness links, security, architecture/trust, and language context. It must not expose internal build metadata or claim blanket assurance.

### S7 — BlueSkyz Line Icon Grammar

A tiny, monochrome, geometry-consistent icon vocabulary used only when an icon clarifies navigation/state. Decorative icon proliferation is rejected.

### S8 — Quiet Motion Budget

Add a scarcity contract on top of existing motion tokens: only a small number of focal continuity/entrance moments may compete in a scene; no perpetual motion and no content dependency on animation.

### S9 — Gallery Mount ProductVisual

Evolve real product imagery toward exhibition-grade mounting: intrinsic artifact, fine edge, deliberate tonal backing, caption/provenance, no fake device shell, no invented screenshot content.

### S10 — Microcopy Decrescendo

Reduce adjective density, CTA verbosity, repeated promises, and self-congratulatory premium language. Prefer calm action labels such as `Explore`, `Inspect evidence`, `Architecture`, `Read the release`, while retaining clear EN/VI semantics.

## 7. Program decomposition

C4 is split into seven independently shippable child waves:

- **C4-A Editorial Craft & Luxury Density** — S1–S10.
- **C4-B Digital Maison & Collected Edition** — G1, G6, G9.
- **C4-C Executive Dossier & Boardroom Mode** — G2, G3.
- **C4-D Architecture Salon & Provenance Lens** — G4, G5.
- **C4-E Decision Atelier** — G7; extends the existing Decision Room instead of creating a parallel decision system.
- **C4-F Private Evaluation Room** — G8; high-risk isolated subsystem with explicit security/privacy/identity gates.
- **C4-G Verifiable Briefing Generator** — G10; deterministic baseline, optional model synthesis gated behind C3-E-equivalent controls.

## 8. Default execution order

Default after C3 convergence:

1. C4-A Editorial Craft & Luxury Density.
2. C4-D Architecture Salon & Provenance Lens.
3. C4-B Digital Maison & Collected Edition.
4. C4-C Executive Dossier & Boardroom Mode.
5. C4-E Decision Atelier.
6. C4-G Verifiable Briefing Generator after C3-E/provider readiness.
7. C4-F Private Evaluation Room only after dedicated identity/security/privacy GO decision.
8. Cross-system C4 Elite QA / red-team / production read-back.

C4-F and any remote/model part of C4-G are never blockers for lower-risk C4 convergence.

## 9. Quiet-luxury review heuristics

A C4 UI change should pass all of these questions:

- Is there one obvious dominant idea in the current viewport?
- Would the page still feel premium with motion disabled?
- Is typography doing more work than effects?
- Did we remove at least as much visual competition as we added?
- Is every decorative element subordinate to product/evidence comprehension?
- Does mobile feel authored, not compressed?
- Does Vietnamese receive equal optical care rather than translated afterthought treatment?
- Is evidence easier to inspect without becoming louder?
- Does the design avoid generic SaaS/AI visual clichés?
- Can the entire visual argument be defended without saying “because it looks luxurious”?

## 10. Security, privacy, RCR, and abuse contract

Every C4 child plan must specify:

- trust boundary and authoritative inputs;
- untrusted inputs and validation/fail-closed behavior;
- secret/private/internal data exclusion;
- abuse cases and negative tests;
- no-JS/degraded behavior where public;
- rollback and fix-forward path;
- kill/disable path for optional runtime enhancements;
- provider/runtime outage behavior;
- data retention and deletion semantics if persistence is ever introduced;
- exact evidence needed before promotion.

Private Evaluation and model-assisted Briefing additionally require threat modeling for IDOR/BOLA, privilege escalation, auth/session theft, data exfiltration, prompt injection, source poisoning, unsafe rendering, link injection, rate-limit abuse, log leakage, provider compromise, stale entitlement, and recovery after credential loss.

## 11. Verification envelope

For each runtime C4 PR, use targeted TDD plus the repository full gates. At minimum preserve:

```bash
pnpm install --frozen-lockfile
pnpm audit --audit-level=moderate
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

Public UI changes additionally require cross-browser Playwright/axe, Lighthouse, 1440/390/320 visual evidence, reduced motion, forced colors, 200% zoom, text spacing, EN/VI parity, no-JS when relevant, and exact before/after client-byte measurement.

Security-sensitive waves require dedicated negative tests and a written red-team record before promotion.

## 12. SGPS handoff hardening

Before C4 activation, evolve the work router through a separately tested governance change so an incoming agent can distinguish durable planning from live execution. The target machine-readable execution fields are:

- `activeProgram`
- `activeWave`
- `activeTask`
- `activePr`
- `activeBranch`
- `headSha`
- `executionStatus`
- `lastVerifiedState`
- `nextAction`
- `lastVerifiedAt`

This schema change must be introduced with architecture tests and migration compatibility; do not silently mutate the current router contract during an unrelated runtime wave.

## 13. Exit criteria

C4 may be declared converged only when:

1. approved C4 public capabilities remain derived from canonical truth;
2. quiet-luxury craft is measurable through density, typography, responsive, accessibility, and motion contracts rather than subjective adjectives alone;
3. product/evidence comprehension is at least as strong with enhancement disabled;
4. dossier/presentation/provenance views expose sources, boundaries, unknowns, and freshness honestly;
5. architecture views are leak-safe and derived from approved public architecture;
6. Decision Atelier never ranks or fabricates recommendations;
7. optional AI synthesis is citation-bound, fail-closed, privacy-safe, abuse-protected, and removable;
8. any private evaluation capability has proven authentication/authorization, revocation, retention, recovery, and incident controls;
9. exact-head Quality + Browser/Lighthouse + provider gates are green for every promoted runtime wave;
10. production read-back confirms the deployed revision and public surfaces; and
11. `docs/current-work.json` and evidence accurately record remaining owner/external blockers without auto-resolving them.
