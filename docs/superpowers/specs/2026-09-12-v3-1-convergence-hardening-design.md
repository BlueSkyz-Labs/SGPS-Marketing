# SGPS Marketing v3.1 Convergence Hardening Design

**Status:** Proposed architecture; owner review required before implementation planning

**Baseline:** `main@c430e7efc2812697dc4f05c8c17740bb50a318b5` (v3 Wave 1 / PR #123 merged)

**Open candidate at reconciliation:** PR #124 (v3 Wave 2). Candidate code is not production truth until exact-head Browser Assurance, deployment evidence, merge, and post-merge read-back complete.

**Parent specifications:**

- `docs/superpowers/specs/2026-09-12-god-tier-v3-trust-experience-design.md`
- `docs/superpowers/plans/2026-09-12-god-tier-v3-trust-experience-implementation.md`

## 1. Purpose

v3.1 is a convergence hardening layer, not a new feature wave. Its purpose is to remove semantic and governance drift discovered after v3 Wave 1 before the site accumulates more evidence-aware surfaces.

The central design rule is:

> Make the public truth contract, code contract, deployment contract, accessibility contract, and visual contract agree before adding more power.

v3.1 must reduce ambiguity and duplicate semantics. It must not turn the marketing site into a governance dashboard, runtime control plane, or framework-heavy application.

## 2. Reconciled live state

At this design baseline, authoritative `main` contains v3 Wave 1:

- Truth-State Visual Grammar;
- Proof-First Empty States;
- Boundary Cards;
- Safe Action Preflight;
- all existing v1/v2 foundation preserved;
- client JavaScript remains approximately 1,644 B Brotli;
- Source Assurance and Browser Assurance passed for merged PR #123;
- Cloudflare deployment evidence exists for the merged candidate.

PR #124 is separate candidate work for Integrity Lens, Executive/Evidence depth, Evidence Pulse, and Bilingual Mirror. v3.1 must not assume those capabilities exist on `main`. Any implementation touching their files must refresh live state and adopt them only after they are merged.

## 3. Red-team findings that motivate v3.1

### F1 — Public proof promise and schema can disagree

The new empty-state copy states that publication requires a working build, real screenshot, and live destination. The current product schema permits a `proof` object with any single artifact. `getPublicProducts()` filters on `public` and does not independently enforce that richer publication promise.

This creates a future truth-drift path: a record can satisfy the schema while violating the public wording.

### F2 — Production truth validation is not the same as source assurance

`src/lib/truth.ts` correctly requires the canonical production origin plus verified contact and security email values. GitHub Source Assurance intentionally does not run `validate:public-truth`, because those environment facts are not repository-owned facts and historically remain owner-gated.

The problem is not that Source Assurance omits production-only facts. The problem is that the repository needs one explicit machine-readable promotion contract explaining which gate is authoritative at which stage.

### F3 — State vocabulary is fragmented by domain

The repository currently has several legitimate state systems:

- product lifecycle;
- product availability;
- product public label;
- Trust Ledger state;
- Integrity TruthState.

These should not be collapsed into one mega-enum, because they answer different questions. But their public rendering relationships must be explicit or future UI can map them inconsistently.

### F4 — EN/VI parity does not yet cover all accessibility chrome

Visible shared copy is increasingly centralized, but shared shell accessibility labels still contain hard-coded English in places such as skip navigation and navigation landmarks. EN/VI parity therefore needs to cover assistive-technology-facing strings, not only visible copy.

### F5 — Search and Atlas lose object-level destination precision

Product results and Atlas product nodes can point to a collection-level route instead of the localized object/profile route. The information is truthful but unnecessarily lossy.

### F6 — Assurance vocabulary can outrun evidence semantics

Some older shared copy still uses blanket `verified` wording while v3 TruthState intentionally distinguishes source-linked, reviewed, changed, unavailable, and not-published states. Public copy must not imply a stronger assurance state than the evidence model supports.

### F7 — Browser toolchain retry should fail at the root cause

The Playwright-install retry loop should explicitly fail after the final unsuccessful attempt. A downstream test failure is weaker evidence than a direct bootstrap failure.

### F8 — Governance is machine-strong but human-review-conditional

The `main-promotion-governance` ruleset is active, strict, non-fast-forward, deletion-protected, and has no bypass actor. It currently requires zero approvals. Human separation-of-duties should be improved only when an actual independent reviewer/CODEOWNER path exists; the repository must not create an impossible policy just to look mature.

### F9 — Cognitive density is now a first-class regression risk

The homepage already composes many conceptual systems. Adding Integrity Lens, provenance, passports, traces, mission paths, and future God-tier surfaces without a density contract could make SGPS architecture visible as UX clutter.

## 4. Alternatives considered

### Option A — Pause v3 and build a large v4 platform now

**Rejected.** It maximizes architectural churn while the current v3 data model is still converging. It also risks duplicating G1/G7/G9/G10 already defined in the canonical v3 design.

### Option B — Continue all v3 runtime waves and harden only at the end

**Rejected.** Known contract mismatches would be allowed to propagate into more components, increasing rework and making future regression tests encode inconsistent behavior.

### Option C — Insert a bounded v3.1 convergence hardening layer

**Selected.** Fix high-leverage contracts and guardrails now, preserve the approved v3 direction, and defer platform-scale ideas until their dependencies exist.

## 5. v3.1 NOW track

v3.1 consists of nine bounded convergence capabilities. They are ordered by dependency, not by visual prominence.

### C1 — Proof Contract Reconciliation

Create one authoritative definition of a publishable public product.

Selected public proof floor:

1. `public === true`;
2. product lifecycle / availability / publicLabel coherence passes;
3. a real local screenshot exists in the allowed product asset namespace;
4. at least one public evidence destination exists in `proof` (`publicUrl`, `repositoryUrl`, or `documentationUrl`);
5. the primary action remains a valid public HTTPS destination;
6. capabilities and existing public-field requirements continue to pass.

The empty-state copy must be updated so it describes this exact contract rather than promising a stricter “working build” requirement when a repository/documentation destination may be the valid public artifact.

The contract must fail closed at build/schema time. No inferred proof and no automatic repair.

### C2 — Promotion Contract Reconciler

Define three explicit assurance stages:

- **Source Assurance:** repository-owned facts; dependency audit, architecture tests, typecheck, lint, format, build, JS budget, static links, browser/axe/Lighthouse.
- **Deployment Assurance:** exact candidate was built/deployed by the intended Cloudflare path and can be read back.
- **Public Truth Assurance:** production-only environment facts satisfy `validate:public-truth`.

The machine-readable promotion contract must report `PASS`, `FAIL`, or an explicit blocked state such as `BLOCKED_OWNER_FACT`; it must never fabricate email addresses or silently downgrade a missing production truth requirement.

GitHub CI must not pretend to validate production-only environment facts it does not possess. Conversely, production promotion must not claim full public-truth assurance when that gate has not actually run.

### C3 — Canonical Public State Vocabulary

Keep domain-specific enums separate, but introduce an explicit mapping model that answers:

- what each state means;
- which subsystem owns it;
- whether it is public-facing;
- which `TruthState`, if any, may visually represent it;
- which mappings are forbidden.

Examples:

- `availability: public` does **not** mean `TruthState: reviewed`;
- `TrustLedger: available` means the public trust surface exists, not that an external auditor verified it;
- `publicLabel: Available` describes product availability, not security/privacy assurance.

No score or confidence percentage is introduced.

### C4 — Bilingual Accessibility Chrome Contract

Move shared assistive-technology-facing strings into the locale contract, including at minimum:

- skip-to-main-content;
- primary navigation label;
- mobile navigation label;
- footer navigation label;
- language navigation label;
- command/search dialog labels where shared;
- meaningful figure labels where they are not purely decorative.

Architecture tests must reject new hard-coded English accessibility chrome in shared EN/VI components.

Brand names and intentional language names such as “English” may remain language-specific by design.

### C5 — True Deep-Link Navigation

Object-level items must resolve to object-level destinations when a canonical destination exists.

- Command Navigator product items use localized product-profile helpers.
- Atlas product nodes use localized product-profile helpers.
- principle nodes use stable principle anchors instead of one shared collection anchor when such anchors exist.
- trust nodes may use stable evidence/section anchors only when those anchors are canonical and accessible without JavaScript.

Collection routes remain valid for collection-level commands such as “Products”.

### C6 — Assurance Vocabulary Linter

Add a public-copy contract for assurance-sensitive words.

At minimum, flag unqualified public use of:

- verified;
- certified;
- guaranteed;
- audited;
- compliant;
- secure, when used as a blanket assurance conclusion rather than a bounded security noun/adjective in context.

Approved state vocabulary is preferred: source-linked, reviewed, public artifact, published, available, not-published, unavailable.

The linter must support narrow allowlisted contexts where stronger wording is backed by a specific authoritative source. The allowlist must be explicit and reviewable; no broad directory exemption.

### C7 — Fail-Closed Browser Toolchain Bootstrap

The Playwright runtime install retry must explicitly exit non-zero after the final failed attempt and identify bootstrap failure as the reason.

Requirements:

- maximum attempts remain bounded;
- successful early attempts do not sleep or retry;
- final failure exits before browser tests;
- no `continue-on-error` or equivalent bypass.

### C8 — Review Metadata Semantics

This capability activates only after PR #124 or an equivalent authored-review model is merged.

Review presentation must distinguish:

- `reviewedOn` from changed/deployed timestamps;
- authored review source from Git/build metadata;
- “last reviewed” from “last changed”.

Dates should render with semantic `<time datetime="YYYY-MM-DD">` and locale-appropriate visible formatting. Relative-only wording such as “2 days ago” is not authoritative because it changes without evidence changes.

If no authored review metadata exists, the review row is omitted or explicitly unavailable according to the parent v3 design; no date is inferred.

### C9 — Visual and Cognitive Density Guard

Introduce a lightweight regression contract for the homepage and evidence-heavy surfaces.

The gate protects against:

- multiple competing primary CTAs in one region;
- excessive simultaneous status chips/badges;
- heading-level disorder;
- evidence controls before the executive summary;
- horizontal overflow at 320 px and 200% text zoom;
- evidence UI becoming a permanent dashboard shell;
- new decorative systems that do not add a distinct information job.

Automation may enforce structural proxies and screenshot baselines, but it must not claim human comprehension. Human E4 remains the authority for comprehension and credibility.

## 6. Conditional governance track

### C10 — Human Review Governance Level-Up

This is **CONDITIONAL**, not a v3.1 blocker.

Enable stronger human review rules only when a real independent reviewer path exists. The target mature policy is:

- at least one approving reviewer;
- stale approval dismissed after material push;
- last-push approval where operationally viable;
- CODEOWNER coverage for governance/security-critical files;
- unresolved review threads continue to block merge.

Until an independent reviewer exists, the repository should explicitly record `HUMAN_REVIEW_UNAVAILABLE` rather than installing a policy the owner must routinely bypass. Existing no-bypass machine gates remain authoritative.

## 7. Reconciliation of the 10 new God-tier ideas

These ideas are retained, but deliberately sequenced after their dependencies instead of being added to v3.1 runtime scope.

| Idea | Disposition | Dependency / reason |
| --- | --- | --- |
| G11 SGPS Governance Twin | AFTER-v3, first platform wave | Depends on C2; maps ADR/ruleset/workflow/deploy/read-back without changing public UX first. |
| G15 Product Publication Rail | AFTER-v3 | Depends on C1, C3, and v3 G9 Publishability Compiler. |
| G13 Truth Surface Compiler | AFTER-v3 | Depends on canonical Claim Fabric (G1), Publishability Compiler (G9), Regression Firewall (G10), and C3/C5. |
| G16 Adversarial SGPS Mutation Lab | AFTER-v3 | Best built after G10 so mutations prove the firewall fails closed. |
| G19 Semantic Design Compiler | AFTER-v3 | Depends on C3 and completion of v3 truth-state/evidence components. |
| G17 Truth Blast-Radius Explorer | AFTER-v3 | Depends on G1 claim graph and G13 generated surface dependency graph. |
| G12 Build-to-Browser Provenance Attestation | AFTER-v3 / evidence-gated | Depends on stable deployment identity and preferably G7 Public SGPS Manifest; signing is separate and must not be claimed without a real trust chain. |
| G18 Portable Evidence Bundle | AFTER-v3 | Depends on G3 Evidence Passport + G7 Manifest; export must contain only already-public evidence. |
| G14 Live Evidence Observatory | FUTURE / evidence-gated | Depends on stable public evidence identifiers and observation semantics; “reachable” must not be upgraded to “verified”. |
| G20 Federated BlueSkyz Product House Protocol | FUTURE | Requires per-product manifest/version policy and multiple real product repositories; premature today. |

## 8. Reconciliation with canonical v3 God-tier track

v3.1 does not replace the existing G1–G10 track.

- C1 strengthens the input contract for **G9 Publishability Compiler**.
- C2 provides governance truth later consumed by **G11 Governance Twin**.
- C3 prevents semantic drift across **G1 Claim Fabric**, **G6 Atlas V2**, **G7 Manifest**, and **G10 Firewall**.
- C5 prepares object-level canonical destinations for **G2 Trace**, **G3 Passport**, **G7 Manifest**, and **G8 Deep Links**.
- C6 becomes an input rule for **G10 Integrity Regression Firewall**.
- C8 strengthens **S+7 Evidence Pulse** without replacing authored review metadata.
- C9 constrains **G2–G6** so richer evidence UX does not become dashboard chrome.

## 9. Execution order relative to active v3 work

Recommended sequence:

1. Let PR #124 finish exact-head Browser Assurance and merge only if all existing promotion gates pass.
2. Refresh `main` after #124; do not copy candidate assumptions from this document.
3. Execute v3.1 C1–C7 as the convergence core.
4. Execute C8 only if authored review metadata is now live on `main`.
5. Add C9 structural/density regression coverage before additional evidence-heavy homepage surfaces.
6. Resume canonical v3 S+9/S+10 and G1–G10 waves on the hardened contracts.
7. Re-evaluate G11/G15/G13 as the first post-v3 platform program.

If PR #124 fails or materially changes, v3.1 must rebase conceptually on the merged result; it must not merge assumptions about an unmerged candidate.

## 10. File-boundary direction

The implementation plan should prefer existing modules and small focused additions.

Expected responsibility areas:

- `src/lib/product-schema.ts` — public product proof floor;
- `src/lib/products.ts` — selectors only; no second publication registry;
- `src/data/site.ts` or a focused shared locale module — accessibility chrome labels;
- `src/lib/navigator.ts`, `src/lib/atlas.ts`, product route helpers — canonical deep links;
- `src/data/integrity.ts` plus a focused mapping module — state semantics, without creating a second truth registry;
- `src/lib/truth.ts` + production verification script/docs — public truth authority and promotion-stage reporting;
- `.github/workflows/quality-gates.yml` — source assurance and fail-closed browser bootstrap only;
- architecture tests — vocabulary, state mapping, bilingual chrome, promotion contract, proof floor;
- E2E tests — deep links, localized accessibility chrome, no-JS, zoom/mobile, density proxies;
- evidence docs — exact-head and post-merge read-back.

Do not place all convergence logic into one “sgps.ts” or “governance.ts” mega-module.

## 11. Global non-negotiables

All v3 parent constraints remain binding, including:

- Astro static-first architecture;
- critical content/navigation/evidence/actions work without JavaScript;
- no UI framework runtime;
- no LLM/vector/remote semantic search for public verification;
- no cookie/localStorage/fingerprinting/account personalization;
- analytics transmission remains disabled until separately approved;
- no WebGL/3D without a later evidence-backed GO;
- no fabricated products, evidence, customers, certifications, review dates, or assurance states;
- brand assets do not authorize product publication;
- product registry remains the source of public product existence;
- `src/lib/truth.ts` remains production public-truth authority;
- truth state is not color-only;
- EN/VI parity includes accessibility chrome;
- automated checks never upgrade Human E4;
- client JS ceiling remains 120,000 B site-wide and worst-page, with the current ~1,644 B baseline treated as the performance posture to preserve, not a budget to spend casually;
- no direct-to-main runtime bypass; branch → PR → exact-head checks → deployment evidence → merge → post-merge read-back.

## 12. Acceptance criteria for v3.1

v3.1 is complete only when all applicable items below are evidenced on exact heads:

1. A public product cannot pass publication validation while violating the public proof-floor wording.
2. Source Assurance, Deployment Assurance, and Public Truth Assurance are explicitly distinguishable in code/docs/evidence.
3. No missing production owner fact is fabricated to make a gate green.
4. State mapping tests prevent availability/trust/integrity semantic conflation.
5. Shared Vietnamese routes expose localized accessibility chrome.
6. Product-level navigator/Atlas items resolve to canonical localized product destinations when those products exist.
7. Blanket assurance vocabulary is rejected unless explicitly source-scoped.
8. Browser runtime bootstrap fails directly after the final unsuccessful install attempt.
9. Authored review dates, if present, render semantically and are never derived from deployment metadata.
10. New evidence UI passes existing keyboard, no-JS, reduced-motion, 320 px, and 200% zoom contracts.
11. Structural density checks prevent evidence UX from becoming persistent dashboard clutter.
12. Full Source Assurance and Browser Assurance pass on the exact candidate.
13. Cloudflare candidate/deployment evidence is recorded according to the existing promotion doctrine.
14. Post-merge read-back confirms `main` contains the intended contracts.
15. Human E4 remains OPEN unless real participant evidence is separately collected.

## 13. Explicit non-goals

v3.1 does not build:

- Governance Twin;
- Product Publication Rail UI;
- Truth Surface Compiler;
- cryptographic signing infrastructure;
- federation across product repositories;
- background evidence monitoring;
- portable evidence exports;
- new analytics provider;
- public trust scores;
- customer portals or accounts;
- a dashboard redesign.

Those remain sequenced roadmap items, not hidden scope.

## 14. Decision summary

The correct next move is not “20 more features.” It is to use a short convergence layer to make the existing SGPS promises enforceable and composable.

After v3.1, the architecture should have one coherent answer to five questions:

1. What makes a public product publishable?
2. Which state vocabulary applies to which kind of fact?
3. Which gate proves source quality, deployment identity, and production truth?
4. Where is the canonical destination for each public object?
5. How do we add richer evidence UX without increasing semantic or cognitive debt?

Only after those answers are machine-enforced should the repository resume the remaining v3 God-tier runtime track and later graduate into G11/G15/G13 platform architecture.
