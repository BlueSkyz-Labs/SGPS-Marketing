# SGPS Marketing God-Tier v3 Trust-Native Experience Design

**Status:** Approved direction, docs-only architecture specification

**Baseline:** `main@e68c109212102bdb94d0132dc71ed4db31fa61b8` (2026-09-12 reconciliation)

**Parent specifications:**

- `docs/superpowers/specs/2026-09-11-s-plus-experience-design.md`
- `docs/superpowers/specs/2026-09-11-s-plus-v2-trust-native-design.md`

## 1. Purpose

SGPS Marketing v3 turns the current premium static marketing site into a trust-native decision surface without turning it into a dashboard, SaaS application, or pseudo-audit product. The experience must remain fast, bilingual, accessible, static-first, and visually restrained while making claims, evidence, boundaries, source relationships, and publication state materially easier to inspect.

The v3 objective is not “more effects.” It is to make **truth structure itself become the differentiated product experience**.

## 2. Reconciled Current State

The following v1/v2 capabilities are already authoritative on `main` and must be reused rather than rebuilt:

- purpose-based Motion Grammar and reduced-motion contract;
- 120,000-byte site-wide/worst-page client-JS ceiling;
- BlueSkyz Horizon signature field;
- Elevation Spine;
- One House Intelligence Matrix;
- Verifiable Trust Ledger;
- Contextual Journey Bar;
- Intent Lens with ephemeral in-memory state only;
- native EN/VI language continuity;
- Cmd/Ctrl+K Command Navigator;
- BlueSkyz Atlas V1;
- privacy-conscious local analytics taxonomy with transmission disabled;
- SEO/canonical/legacy-root 301 hardening;
- production smoke and rollback evidence;
- automated E4 matrix;
- bilingual shared-component hardening;
- fail-closed integrity primitives in `src/data/integrity.ts` and `src/lib/integrity.ts`.

The following v2 capabilities were planned but are not yet runtime-complete. They become the **S+ Completion Track** in v3 and remain conceptually authoritative:

1. Truth-State Visual Grammar.
2. Proof-First Empty States.
3. Boundary Cards.
4. Safe Action Preflight.
5. SGPS Integrity Lens.
6. Executive ↔ Evidence reading depth.
7. Evidence Pulse from explicit review metadata only.
8. Selective Bilingual Mirror.
9. Deterministic Provenance Search.
10. Curated Evidence Change Intelligence, only when an approved public change source exists.

## 3. Non-Negotiable Constraints

- Astro static rendering remains authoritative.
- Critical content, evidence, navigation, and conversion actions work with JavaScript disabled.
- No React/Vue/Svelte runtime is introduced.
- No LLM, vector database, remote semantic-search service, or generated answer is required for public verification.
- No account, login, user profile, fingerprinting, cookie-based personalization, or localStorage persistence is introduced for v3 experience state.
- No external analytics transmission until separately approved by privacy/provider decision.
- No WebGL/3D unless a later evidence-backed GO decision supersedes the current NO-GO.
- No fabricated products, customers, partners, certifications, scores, testimonials, evidence, review dates, maturity levels, guarantees, or publication states.
- Brand assets never authorize product publication.
- Git timestamps, build timestamps, file mtimes, commit messages, and CI metadata are not public evidence-review metadata.
- `src/lib/truth.ts` remains the production public-truth validation authority; v3 does not bypass it.
- The product registry remains the only source of public product existence.
- Every EN user-visible capability has VI parity or is explicitly withheld in both languages.
- Truth state is never color-only.
- Automated/browser evidence never upgrades human E4 status.
- Every runtime wave refreshes live `main`, open PRs, current checks, source truth, and overlapping work before changing code.
- Promotion remains branch → PR → exact-head checks → Cloudflare evidence → merge → post-merge read-back. No direct-to-main runtime bypass.

## 4. Design Principle: Claims Are First-Class, Scores Are Not

v3 introduces a stronger information architecture around **claims**. A claim is a bounded public statement that can reference zero or more public evidence items, optional review metadata, and an explicit boundary. A claim does not receive a confidence percentage, trust score, maturity score, or AI-generated grade.

The public experience should answer five questions cleanly:

1. What is being stated?
2. What public source supports that statement?
3. What does that source not establish?
4. Has an explicit content/evidence review date been authored?
5. Where can the visitor go next to inspect or act?

## 5. S+ Completion Track

### S+1 — Truth-State Visual Grammar

Use one compact, accessible grammar for `source-linked`, `reviewed`, `changed`, `not-published`, and `unavailable`. State uses localized text plus a non-color symbol, border, or typographic distinction. Do not use perpetual pulsing, traffic-light dashboard styling, or a misleading “verified” badge.

### S+2 — Proof-First Empty States

When a public registry is empty, explain the publication rule and useful next actions instead of presenting a generic “nothing here” card. The copy must never imply that unpublished products do not exist.

### S+3 — Boundary Cards

Where a source-backed boundary is useful, show paired concepts: **What this establishes** and **What this does not establish**. Boundaries are authored facts, not generated disclaimers.

### S+4 — Safe Action Preflight

For external, `mailto:`, and private-reporting actions, provide concise destination context without intercepting or blocking the real link. Internal links receive no unnecessary friction.

### S+5 — SGPS Integrity Lens

Eligible pages expose a lightweight “Verify this page” disclosure backed by `INTEGRITY_ENTRIES`. V1 uses semantic `<details>`, works without JS, and hides itself when the page has no modeled evidence.

### S+6 — Executive ↔ Evidence Reading Depth

Default view remains executive and concise. Evidence depth is progressive disclosure through native semantic controls; no separate “technical mode” application shell is created.

### S+7 — Evidence Pulse

Freshness and change cues render only from explicit authored review metadata. Missing metadata is shown by omission or honest state, never inferred from deployment activity.

### S+8 — Selective Bilingual Mirror

High-value legal and trust statements may show authored EN/VI pairs side by side or stacked. Normal localized routes remain primary; no runtime translation or DOM scraping is allowed.

### S+9 — Provenance Search

Extend Command Navigator with deterministic evidence items sourced from typed public integrity, trust, and product data. Search returns destinations and source types, not generated answers.

### S+10 — Curated Evidence Change Intelligence

A public change timeline exists only after the repository has deliberately authored public change metadata. Raw Git history is never transformed into a public evidence timeline.

## 6. God-Tier Track

### G1 — Claim-to-Evidence Fabric

Introduce a typed public claim graph joining claims, evidence references, boundaries, review metadata, routes, trust surfaces, principles, and published products. This becomes the canonical composition layer for future evidence-aware UI while leaving existing source registries authoritative.

Core rule: the graph may reference authoritative data; it may not become a second manually maintained product or route registry.

### G2 — Source-to-Surface Trace

From an eligible claim, visitors can inspect a deterministic trace:

`claim → source/evidence → boundary → public surface`

The trace is semantic HTML first. Visual connectors are decorative enhancement only. It never exposes repository internals such as commit SHA, workflow ID, branch name, or CI vocabulary as user-facing proof.

### G3 — Evidence Passport

Give stable public claims and evidence a shareable, print-friendly passport surface with a stable public ID, localized summary, evidence links, boundary, explicit review metadata when available, and canonical route back to context.

A passport is not a certificate and must not use certification or seal language.

### G4 — Decision Room

Provide an optional client-side, in-memory comparison workspace where a visitor can select a small bounded set of public claims, trust surfaces, or published products and compare their sourced facts side by side.

Rules:

- no persistence across reload;
- no ranking or recommendation score;
- no hidden personalization;
- no unpublished item can enter the workspace;
- every compared statement retains its source and boundary context.

### G5 — Evidence-First Mission Paths

Extend the existing Intent Lens and Journey model into deterministic mission paths such as evaluate product, understand BlueSkyz, verify trust, or work with us. Paths reorder or emphasize links and evidence destinations only; they never hide facts or infer user identity.

### G6 — Atlas V2: Evidence Constellation

Evolve Atlas V1 from a brand, principle, trust, and product relationship map into an evidence-aware constellation by adding claim and evidence relationships from the Claim Fabric. Keep SVG/HTML-first rendering, a semantic alternate representation, zero required JS, and zero product nodes when the public registry is empty.

### G7 — Public SGPS Manifest

Expose a machine-readable public manifest, preferably under a well-known route, containing only already-public claim and evidence identifiers, localized canonical URLs, truth states, and schema version. It is designed for transparency and interoperability, not external trust scoring.

No private reporting destination, unpublished product name, internal repository metadata, or secret may appear.

### G8 — Verification Deep Links

Every public claim, passport, and lens item receives stable locale-aware anchors or routes that can be copied and shared without JavaScript. Deep links preserve language and land at a meaningful heading with correct focus and scroll-margin behavior.

### G9 — Publishability Compiler

Add a build-time, fail-closed contract that prevents a product or evidence-driven surface from becoming public unless its required truth fields pass explicit schema and source validation. This extends, but does not replace, `src/lib/truth.ts`.

The compiler reports actionable developer errors; it does not silently repair content or derive missing evidence.

### G10 — Integrity Regression Firewall

Create a consolidated architecture gate that detects cross-system truth drift: orphaned claims, evidence pointing to non-public routes, EN/VI parity mismatches, bare locale paths, unsupported truth labels, public product references absent from the registry, forbidden scoring language, telemetry free-text leakage, and manifest/runtime disagreement.

This is a regression firewall, not a replacement for focused unit and end-to-end tests.

## 7. Data Architecture

The v3 data direction is additive and reference-based.

```text
PublicClaimKind = brand | principle | trust | product | policy | support

PublicClaim
- id
- kind
- surface
- statement.en
- statement.vi
- evidenceIds[]
- optional boundaryId
- optional reviewId

PublicEvidenceNode
- id
- kind = route | artifact | private-reporting
- href.en
- href.vi
- label.en
- label.vi
```

Selectors build graph views from authoritative sources. Product nodes must always be derived from `getPublicProducts()`; routes must be produced from existing locale and route helpers; integrity data must remain fail-closed.

## 8. Interaction Architecture

Client JavaScript is permitted only where it adds clear interaction value:

- Decision Room selection, removal, and reset;
- optional copy-link feedback;
- existing Command Navigator and Intent Lens behavior.

Everything else defaults to semantic HTML, CSS, and SVG. Client modules must be external files compatible with the existing CSP. No critical content or destination becomes JS-only.

## 9. Visual Direction

v3 should look like a premium editorial intelligence system, not a cyber-security control panel.

Use:

- typographic hierarchy;
- thin rules and ledgers;
- restrained cobalt signal accents;
- semantic state glyphs;
- evidence connectors and relationship lines;
- spacious progressive disclosure;
- existing Horizon visual language.

Avoid:

- neon or glow overload;
- glass-card soup;
- gauges, trust meters, or confidence percentages;
- permanent animated pulses;
- terminal or console cosplay;
- badge inflation;
- dense enterprise-dashboard chrome.

## 10. Accessibility and Bilingual Acceptance

Every new capability must pass:

- keyboard-only operation;
- visible focus and deterministic focus return where dialogs are used;
- 44px target intent for interactive controls;
- 200% text zoom;
- 320px no-horizontal-overflow;
- reduced-motion equivalence;
- JavaScript-disabled critical path;
- EN/VI parity for labels, routes, canonical links, and evidence semantics;
- accessible names that do not include decorative status noise.

## 11. Performance Envelope

The existing 120,000-byte Brotli hard ceiling remains unchanged. A v3 wave must report both site-wide unique client JS and worst-page client JS. The design preference is to remain far below the ceiling rather than treat it as a target.

No new large dependency is justified for v3. Native browser APIs, Astro, CSS, SVG, and focused vanilla TypeScript remain the default.

## 12. Security and Privacy Red-Team Rules

- No arbitrary HTML from evidence data.
- No URL is trusted merely because it is present in content; route and external destination classes must be explicit.
- No `target=_blank` without the repository’s safe rel contract.
- No free-text search query enters analytics telemetry.
- No Decision Room selection is transmitted or persisted.
- No manifest includes internal or unpublished data.
- No public surface renders internal GitHub, CI, or Cloudflare identifiers as proof.
- No dynamic date source upgrades evidence freshness.
- Any future asynchronous contact flow requires its own bounded state, error, and security design.

## 13. Promotion and Evidence Doctrine

Each runtime PR must:

1. refresh current `main` and overlapping work;
2. start from failing focused tests where behavior changes;
3. run focused tests, architecture suite, typecheck, lint, format, build, client budget, static links, and relevant end-to-end tests;
4. run Browser Assurance and Cloudflare checks required by the repository;
5. merge only on objectively green exact-head evidence;
6. perform post-merge production read-back for any public route, redirect, or manifest behavior changed;
7. record residual manual and human gates honestly.

## 14. Success Criteria

v3 is successful when a visitor can move from a high-level BlueSkyz statement to its public provenance and boundary in a few understandable steps, compare public evidence without opaque scoring, share a stable Evidence Passport, and inspect the same truth structure in EN or VI while the site remains static-first, extremely fast, accessible, privacy-conscious, and incapable by construction of silently inventing product or evidence truth.
