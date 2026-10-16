# SGPS Marketing — Implementation Master Plan v1.0

Date: 2026-10-16, Asia/Ho_Chi_Minh. State: OWNER-APPROVED DIRECTION / IMPLEMENTATION-READY PLAN / NO PRODUCTION RELEASE AUTHORITY.

Initial plan readback: `main@e9179388235b5336d6d2caac313bdbaa9afbad43` at 2026-10-16 07:32 +07. Historical plan baseline was `7f8474006d737c31d5b2c04a1a8fdbff6391373e`.

Current live recheck: `main@72729f58294868369fdff2c27a28b3233c138663` at 2026-10-16 08:14 +07. #621 is merged. #615 remains behind and Owner-gated; #616 is behind with all checks green on its old head and its current-state note refreshed in this revision; #618 is rebased and its new Quality Gates run is in progress; #619 remains Draft with Chromium/WebKit running; #622's old head has failing browser/visual checks while local foldable fixes are in progress; #623 remains Draft and behind. Re-read live refs and checks before acting.

Source of scope: docs/audit/2026-10-15-sgps-marketing-premium-experience-10g-10s.md in PR #616. The core files remain AGENTS.md, docs/current-work.json, ADR 0014, Brand Kit v4, SGPS performance/friction contract, product/public claims graph and protected main ruleset 22500299.

## Outcome contract

Marketing is a customer-centric, static-first BlueSkyz Labs public product house. Visitors should understand the studio, Sổ Trọ and Sổ Tâm and their development stage in 30 seconds, inspect actual sample-data screenshots, verify claims with limits and sources, and reach an appropriate honest next action. Design DNA: Horizon/Sail, Ink/Porcelain/Cobalt, Inter Variable, quiet craftsmanship, no decorative noise.

Never recreate merged work, publish hidden products, invent customer proof or screenshots, misstate Paid/production readiness, introduce unapproved fonts/WebGL/autoplay, rebuild shadow claim registries, put payments/auth on Marketing or violate privacy. Keep /verify the one prominent trust door; advanced dossier and editions routes remain available but not marketed in the global navigation; no public product sign-in link.

## Order of execution and dependencies

W0 (P0/P1): fetch live main, PR queue, current-work router, ADR and provider ruleset. Capture independent built screenshots and actual task walkthrough. Mark historical October 12 measurements HISTORIC. Check served SHA and security/public contact claims separately.

W1 (P1): #604, #607 and #609 are SOURCE_DONE, so validate residual behavior only. Do not reopen or duplicate their source work without a reproducible regression.

W2 (P1/P2): S04-S10 as small, reversible work after reproducible current-head evidence. S06 needs native review; S08 needs Owner/Cloudflare build authority. Do not run simultaneous PRs that edit the same CSS, screenshot baseline or claim source.

W3 (P2 pilots): G01, G02, G05, G07, G10. Establish real before/after comprehension and logo-hidden evaluation. A customer-tested improvement can be retained; speculative decoration must be reverted.

W4 (conditional research): G03, G04, G06, G08, G09. No implementation before approved public source facts, analytics privacy gates and separate authority where applicable.

Explicit DAG: W0 → W1 → W2 → W3. W4 requires W2 truth+privacy evidence and individual Owner/technical GO gates. Every runtime change requires its own PR → independent exact-head trusted CI → reviewer → protected merge → separate served-environment and human proof.

## Implementation and promotion contract

D0 source-safe UX/copy/test improvements: agent may implement a single measured root cause using approved Product Truth. D1 visual baselines/build/dependency/config: protected paths, semantic diff and Owner policy apply. D2 public claims, provider mail, RUM, privacy, analytics, legal and release source: Owner/provider authorization required. D3 production: no release without exact serving revision, permitted traffic/risk, rollback and independent qualification.

GitHub ruleset 22500299 requires PRs, resolved conversations, strict integration-15368 Quality Gates and Browser Assurance. Never self-apply owner-approved or call a skipped/stale check PASS. No direct push to main, forced ref promotion or CI waiver. Re-fetch PR labels and checks after any commit; passing local source gate alone is insufficient.

Required source commands: pnpm typecheck; pnpm lint; pnpm format:check; pnpm build; pnpm check:client-budget; pnpm check:static-links; pnpm test:architecture; pnpm validate:public-truth; pnpm test:e2e; pnpm lighthouse. Check actual package scripts and active CI instead of inventing exit statuses.

Lab thresholds: LCP ≤ 2500ms, CLS ≤ 0.05, TBT ≤ 200ms, plus stricter route byte/JS budgets. WCAG 2.2 AA includes 320 CSS px reflow, 200% text, keyboard focus not obscured, target sizes, contrast, forced colors, no-JS and reduced motion. Field p75 LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 only after a verified aggregate provider source.

## UX and test evidence matrix

Nine critical routes per locale: Home; Products; Sổ Trọ; Sổ Tâm; Verify; About; Contact; Support; 404. Four locales EN/VI/zh/zh-hant; light/dark; 320×568, 390×844 and 1440×900, up to 216 relevant baseline combinations. Add reduced motion, forced colors, text zoom, no-JS, keyboard and screenshot-viewer real-device cases by risk. This is a planned denominator, not evidence that 216 screenshots were executed.

Journey A: first visit → identify products and development status → appropriate product profile. Journey B: inspect real screen → see sample-data boundary → recover scroll/focus. Journey C: claim → /verify → limit/source → return. Journey D: appropriate contact/support/private security channel. Journey E: locale/theme/search navigation and empty/error recovery.

Human E4: use 5 exploratory first-time EN/VI users for initial qualitative comprehension, not a conversion experiment or statistical proof; separately qualify native zh/zh-hant meaning and device behaviors. Capture task success, misunderstanding, first action, device, locale, reviewer, screenshot and feedback without leaking personal data. Missing real participants remains NOT VERIFIED.

Per-PR evidence: source/base SHA, reproducible failure or hypothesis, affected file list, product proof/source revision, test/negative logs, screenshot matrix with before/after diff, accessibility and performance delta, exact-head CI URL/check identity, independent reviewer, Owner-controlled path approvals and rollback. The next agent may implement D0 code, but should not claim production verification from this plan.

## 20 execution cards

### S01 — Real screenshot clarity

Status and owner lane: SOURCE_DONE #607; device QA pending.

Implementation: Validate FlagshipCapture/FlagshipTheatre and showcase source at 320/390/768/1024/1440. Preserve crop/sourceRevision, alt text, sample-data label, original-image inspection and one visible capture; do not reopen #607 without reproducible failure.

Tests and acceptance: ux-p2-9-home-capture, c2-flagship-theatre, client budget, visual and real phone. AC: source-backed readable image, unchanged URL/provenance, no duplicate download and no CLS regression.

Negative proof and rollback: Wrong capture, old tiny scaling, dual download or lost provenance must fail; revert follow-up only.

### S02 — Claim/limit/source cards

Status and owner lane: SOURCE_DONE #604; runtime QA pending.

Implementation: Re-read VerifyCentre, claims.ts and the merged ux-u7-verify-cards test. On four locales, ensure each card binds one claim to its real limitation and link; no shadow claims or cosmetic verified badge.

Tests and acceptance: Run Verify/axe/link/no-JS and negative absent-source fixtures. AC: semantic grouping and direct source navigation without false third-party certification.

Negative proof and rollback: Missing source/limit, unknown claim or fake verification seal fails; revert only extra UI change.

### S03 — One action and link grammar

Status and owner lane: SOURCE MERGED through #609; runtime and user-comprehension evidence remain separate.

Implementation: Re-read merged #609 at `1ea2b5060fd0155cb071a52cb10a0a187e3d57e7` only to diagnose a reproducible regression. Review ButtonLink, JourneyBar, HomeNextSteps, ProfileNextSteps, breadcrumb references and four locales. Never duplicate the refactor.

Tests and acceptance: Run ux-p2-7-action-tiers, four browser Quality/Browser Assurance, visual baseline Owner gate and keyboard/44px target tests. AC: pill action, underlined source link, preserved destination/accessible name.

Negative proof and rollback: Old 20px boxed CTA, hover-only proof link or bad tap target fails. Rollback: standard revert PR if real comprehension regresses.

### S04 — Capture viewer touch recovery

Status and owner lane: PARTIAL / real devices NOT_VERIFIED.

Implementation: Test src/scripts/capture-viewer.ts in iOS Safari, Android and Zalo/Facebook/Messenger in-app browser; preserve raw source href for no-JS or unsupported dialog; repair focus/scroll/back only after reproducible failure.

Tests and acceptance: ux-p2-4-capture-viewer plus device logs and screen captures. AC: visible close, Escape/back, focus return, no trapped visitor and correct modifier click.

Negative proof and rollback: Unsupported dialog and repeated-open must degrade to source link; revert enhancement when recovery fails.

### S05 — Locale suggestion footprint

Status and owner lane: HYPOTHESIS; W0 hero displacement.

Implementation: Measure LocaleSuggestion.astro + public/locale-suggestion-early.js at 320x568, 390x667, text zoom and no-JS. Pilot a smaller optional in-flow suggestion only if first-task evidence supports change.

Tests and acceptance: locale-suggestion.spec and 4-locale short-viewport snapshots. AC: no auto redirect, no initial-focus hijack, no CLS increase, clear dismiss and preserved hero readability.

Negative proof and rollback: Looping suggestion, tracking inferred language or covering CTA fails; restore current banner.

### S06 — Native language and line breaks

Status and owner lane: PARTIAL; native CJK/VI review OPEN.

Implementation: Inspect Hero, display-type.css, home-copy.ts and locale YAML for mid-word Chinese breaks and 200% zoom; seek native EN/VI/zh/zh-hant approvals and make scoped text/layout changes only.

Tests and acceptance: ux-u3-zh-hant-type, reflow, text spacing, 320/390/1440 snapshots. AC: meaning-preserving approved copy, no clipping and no added remote fonts.

Negative proof and rollback: Unreviewed translation, hidden limitations or claim strengthening fails; revert locale slice.

### S07 — Command menu keyboard continuity

Status and owner lane: NOT_VERIFIED.

Implementation: Walk CommandNavigator, mobile-menu.ts and Header keyboard sequence Ctrl/Meta+K, tab, Escape, reopen, focus back and no-JS; only patch a reproducible focus/ARIA bug.

Tests and acceptance: ux-u1-search, multi-engine Playwright, VoiceOver/TalkBack spot check. AC: accessible menu/search, no focus trap, useful static navigation.

Negative proof and rollback: Broken keyboard route, stuck dialog or swallowed modifier fails; revert isolated script.

### S08 — Truthful last-updated metadata

Status and owner lane: PARTIAL / Cloudflare shallow clone.

Implementation: Review git-lastmod.ts, last-updated.ts, sitemap.xml.ts and #606. Owner compares unshallow build with deterministic authoritative source dates; never emit deployment date as content update.

Tests and acceptance: ux-p2-10-last-updated and shallow/full clone tests. AC: matching valid date when known, omission when unknown, exact served Worker readback.

Negative proof and rollback: Future/stale fabricated date fails; Owner rolls back build config to truthful omission.

### S09 — Empty/error/recovery stories

Status and owner lane: PARTIAL.

Implementation: Audit BusinessRouteState, NoCaptureStage, ProofFirstEmptyState and 404/Support; root-cause fix only for measured dead ends across locales and no-JS.

Tests and acceptance: empty-and-404, static links, publishability and mobile keyboard tests. AC: one useful return path, honest unavailable state, no invented release/support.

Negative proof and rollback: Unknown product published by fallback or misleading support action fails; revert component/copy slice.

### S10 — Motion, WCAG and speed budget

Status and owner lane: ONGOING QUALITY LANE.

Implementation: Audit global.css, c3-craft.css, c4-quiet-authority.css and reveal.css before changing visual tokens. Avoid repeated overrides, autoplay, new external fonts/scripts and animated LCP heading.

Tests and acceptance: WCAG 2.2 AA incl 320px reflow/200% text/focus; mobile lab LCP ≤2500ms, CLS ≤0.05, TBT ≤200ms, resource/JS budgets and four-engine CI. AC: static/no-JS/reduced-motion functional parity.

Negative proof and rollback: Forced motion, over-budget asset or weakened gate fails; revert isolated CSS, never loosen threshold.

### G01 — Understand BlueSkyz in 30 seconds

Status and owner lane: W3 PILOT, not shipped.

Implementation: Use Hero, ProductHouse, HomeNextSteps and home-copy.ts to test if a new visitor understands Sổ Trọ and Sổ Tâm, development status and next action. Begin with logo-hidden task baseline, then change one verified content/spacing cause per PR.

Tests and acceptance: Qualitative five-participant exploratory walk (not statistical proof), four-locale Product Truth and no-JS tests. AC: no observed lifecycle misconception; before/after comprehension improves without second competing primary CTA.

Negative proof and rollback: Hidden status, fictitious launch or extra CTA maze fails; revert narrative experiment.

### G02 — Contextual source-backed proof

Status and owner lane: W3 PROTOTYPE.

Implementation: Use ProductProofLink/SourceTrace and canonical claims graph after #604. Attach product statement to /verify anchor and its limit, with static HTML first and progressive reveal only if useful.

Tests and acceptance: c3-product-proof, stale/missing-claim negative fixtures, keyboard and no-JS. AC: 1:1 canonical claim IDs and visible limitations without pseudo-certification.

Negative proof and rollback: Shadow claim store or unbacked assurance fails; remove optional layer.

### G03 — Shareable product passport

Status and owner lane: W4 RESEARCH; Owner public-fact gate.

Implementation: Inspect DossierDocument, dossier.ts, product and claim registries. Design an optional static A4 summary of factual lifecycle, preview, screenshots/provenance and public evidence; preserve hidden advanced routes and no payment data.

Tests and acceptance: Print/share, four-locale, source mismatch and no-JS fixtures. AC: only owner-approved public facts, unknown fields omitted, evidence links valid.

Negative proof and rollback: Invented pricing, case study, seller entity or availability fails; remove optional passport.

### G04 — Verifiable release history

Status and owner lane: BLOCKED: C3-F public release source missing.

Implementation: Only design schema around release-schema.ts and release-adapter.ts now. Do not publish chronology until Owner provides a real authorized public release/changelog feed.

Tests and acceptance: Date/publishability/source tests. AC: every milestone carries approved source and explicit product lifecycle; unknown timeline is not displayed.

Negative proof and rollback: Fake sample launch, assumed git commit as release date fails; defer entire surface.

### G05 — Guided genuine-app inspection

Status and owner lane: W3 PILOT after device QA.

Implementation: Use FeatureStory, ProductShowcase and recorded Sổ Trọ showcase only. Attach brief task-led explanations to genuine screen regions with original image link and explicit sample-data label; no synthetic UI.

Tests and acceptance: Source image digest, 320/390 mobile, no-JS and touch/keyboard. AC: evaluator understands actual screen task and knows it is development sample data.

Negative proof and rollback: Unsupported feature marker or fake UI overlay fails; drop annotations.

### G06 — Optional ephemeral intent lens

Status and owner lane: W4 RESEARCH / privacy gate.

Implementation: Prototype existing IntentLens as optional presentation-only navigation to rental, journal or BlueSkyz info. No persisted inferred visitor traits, remote personalization or mandatory modal.

Tests and acceptance: Task-step comparison with neutral navigation, static fallback, data-flow audit. AC: improved task discovery without profiling or product truth mutations.

Negative proof and rollback: Network/storage of inferred goals or forced segmentation fails; terminate experiment.

### G07 — Native editorial quality across four locales

Status and owner lane: W3/W4 HUMAN REVIEW.

Implementation: Build reviewer-owned locale × route editorial sheet for Home, Product, Verify, About, Contact and recovery pages; approved copy remains anchored to English claim truth and native regional idioms.

Tests and acceptance: Trilingual parity tests, screenshots 320/390/1440 and signed native review. AC: no mistranslated privacy/recovery/product limitation or awkward headline splits.

Negative proof and rollback: Machine-only approval or altered capability promise fails; revert localization slice.

### G08 — Real contact/support/security recourse

Status and owner lane: BLOCKED #281/#522 provider evidence.

Implementation: Owner/provider verify actual contact, support, security alias routing, receive/reply, monitoring/recovery and incident confidentiality. Then align contact/support page messaging; no CRM, mail automation or analytics activation in Marketing plan.

Tests and acceptance: External-domain send/receive/reply receipts and fail-closed public truth tests. AC: separately staffed general/support and restricted security path with named escalation.

Negative proof and rollback: MX-only assumption, fake mailbox or security issue to marketing CRM fails; retain truthful verified fallback.

### G09 — Aggregate-only experience feedback

Status and owner lane: PARTIAL RUM C3 / Owner gate.

Implementation: Before p75 claims, inspect one real authorized Cloudflare beacon request against rum-beacon-fields.json; kill-switch if identifiers appear. Then compare aggregated LCP/INP/CLS with qualitative journey findings; no extra script/PII.

Tests and acceptance: rum-beacon-contract privacy/CSP tests, field request capture, rollback drill. AC: documented allowlist match and no visitor/session identifiers.

Negative proof and rollback: visitorId/session_id/IP, wildcard CSP, fabricated field percentile fails; Owner disables analytics.

### G10 — Logo-hidden Horizon/Sail memorability

Status and owner lane: W3 HUMAN PILOT.

Implementation: Work only within approved HorizonField, HorizonSeam, SailReveal and existing brand tokens. Compare logo-hidden renders for recognition, then implement restrained CSS only for demonstrated weak spots.

Tests and acceptance: Independent brand review, signature asset SHA, performance, reduced-motion and contrast. AC: recognizable composition without reduced product comprehension or CTA visibility.

Negative proof and rollback: Unauthorized new logo, gold/serif/WebGL/parallax or decorative overload fails; revert isolated art-direction patch.

## Priority PR dispatch

PR-01: #609 action tiers are source-merged; qualify current runtime evidence and do not duplicate the refactor.

PR-02: S04/S07 device viewer and keyboard issues only when real current-head failures are reproduced. Keep one small PR per root cause.

PR-03: S05/S06 localization/typography friction after native evidence; split CSS and content when appropriate.

PR-04: S09 empty/error states, S10 token/performance if a reproducible defect justifies change. Use scoped reversions, no budget relaxation.

PR-05 and PR-06: G01/G05 comprehension pilot, G02 source-backed evidence prototype; only retain if real evaluator can show task value.

PR-07+: gated research packs for G03/G04/G06/G08/G09; optional product/provider activation is not authorized by this plan.

## Red-team fail-closed matrix

RT01 false paid/QR action on Marketing; RT02 hidden product auto-publication; RT03 fabricated UI image; RT04 evidence without limit/source; RT05 fake freshness date; RT06 zoom/reflow/keyboard trap; RT07 high-cost/third-party motion; RT08 unsafe dialog/no-JS dead end; RT09 mistranslated legal/privacy claim; RT10 stale SHA or forged check; RT11 RUM identifier payload; RT12 nonexistent mailbox or leaked security report. Each must be rejected by an existing/new negative test or truthfully degraded, never silently green.

## Convergence and handoff

Never call SGPS FULL, pixel-perfect or production-ready without current independently qualified evidence. Report separate numerators/denominators for source work packages, current-head critical route captures, eligible acceptance gates, Human E4/native reviews and provider served-revision. SOURCE_DONE S01/S02 is not device/production DONE. Unknown denominator means convergence percent N/A.

The next coding agent starts with live main, open PRs and this refreshed plan. Move PLAN → DO → CHECK → IMPROVE → RED TEAM → NEXT for safe independently scoped tasks, continuously updating GitHub PR evidence. Stop unsafe gates, but continue nonconflicting source-safe improvements. Summarize DONE / PARTIAL / BLOCKED / NOT VERIFIED and the exact best next action for the Owner.
