# SGPS Marketing — Premium Experience Implementation Master Plan v1.0

**Date:** 2026-10-16 (Asia/Ho_Chi_Minh). **Owner authorization:** user approval on 2026-10-16 for a detailed plan and PR, building on the accepted 10 GOD-TIER + 10 TIER S+ discovery. **Plan status:** IMPLEMENTATION-READY WORK PACKAGES / NOT A PRODUCTION RELEASE CERTIFICATION.

**Fresh source census:** `BlueSkyz-Labs/SGPS-Marketing` main at `7f8474006d737c31d5b2c04a1a8fdbff6391373e`; PR #604 and #607 MERGED, PR #609 OPEN at `bcfe23b5ef47a5e87486483b7a31f200cd3ee4f4`, PR #616 OPEN. Source statuses can change: refresh before every execution slice. Related discovery document: `docs/audit/2026-10-15-sgps-marketing-premium-experience-10g-10s.md` in PR #616. Source ≠ served Cloudflare revision ≠ independent Human E4.

## Scope, product outcomes and immutable decisions

**Primary user:** an anonymous first-time BlueSkyz visitor evaluating real published Sổ Trọ / Sổ Tâm product profiles, legal/trust boundaries or contacting the studio. **Secondary:** a returning evaluator who needs truthful provenance and an existing user looking for support. Prioritize comprehension and trust ahead of decoration.

**North Star:** 30-second accurate understanding, clear product truth/status, one meaningful next action, approachable and verifiable evidence, legible real screenshots, elegant accessible mobile-first presentation, four-language consistency. Quiet luxury means disciplined hierarchy, visual calm and behavior that works on slow devices; no decorative noise, overengineering, or unsupported wow-factor assertion.

**Design authority:** ADR 0014 Horizon / Sail; Brand Kit v4 (Ink/Porcelain/Cobalt and self-hosted Inter), Astro 7 static-first; Owner 2026-10-12 decision to use `/verify` as the single prominent trust door, keep `/dossier`, `/decision-room`, `/editions` off primary menus, no public app sign-in. Do not resurrect superseded Quiet Luxury gold/serif, old closed PRs, WebGL, autoplay or shadow claims. Marketing remains a public brand site, not a billing/payment, authentication, journaling or ledger application.

**Hard security and governance constraints:** `AGENTS.md`, `docs/current-work.json`, `architecture/sgps-model.json`, SGPS pin discipline, Product Truth, privacy/analytics ADR0015, owner-approved Brand Kit SHA and effective GitHub ruleset 22500299. Never self-apply `owner-approved`, self-certify visual proof, alter a paid/security release gate, weaken CI or promote remote AI without its owner/provider/privacy gate. Decisions about unapproved public facts, mail, RUM, analytics/consent, product launch, localization claim meaning, payment and production remain Owner-controlled.

## Execution mode, work lanes and explicit precedence

**Precedence:** existing code merged to current HEAD outranks 2026-10-12 baseline; ADR and Owner facts outrank an aesthetic prompt; canonical upstream Product Truth outranks author copy; protected repository rules outrank agent convenience. This plan is additive to existing v5/v6/C2/C3/Horizon plans and must not open duplicate work.

**D0 reversible:** source-only UI/copy/test improvements to existing approved facts, in one root-cause PR at a time. **D1 guarded:** package/build/performance config and visual snapshots: semantic diff, independent checks and repository Owner path control. **D2 Owner/provider:** published identities, claim release sources, privacy/RUM, native reviewers, design authority/locked Brand Kit, protected policies, production publication. **D3 release:** independent exact-head CI, qualified device/Human E4 and served revision plus rollback evidence. A planning approval is not an automatic D2/D3 authorization.

**Coding agent workflow:** `PLAN → DO → CHECK → IMPROVE → RED TEAM → NEXT`. On every new work session, fetch latest main, open PRs, decisions, `docs/current-work.json`, provider/ruleset and source pins; do not assume the SHA in this document is still HEAD. A PR scoped to one problem may deliver several tiny commits, but avoid combining separate work-package owners or touching snapshots merely to green a failing gate.

**Existing active source ownership:** #604 Verify card has merged and should not be recreated; #607 genuine capture responsive fix has merged; #609 action grammar remains a pending implementation PR. #615 is a distinct dependency update, not an experience work package. Preserve Owner label review on protected visual baselines even though Owner approved roadmap.

## Operational order and dependency DAG

**W0 — Fresh verification and recovery baseline (P0/P1):** reconcile PR #616/#609 and approved docs, capture served SHA and current exact-head critical-route screenshots, read failure modes; no new UX code until a root cause is reproduced. Join existing #561; mark historical proof as HISTORIC, not current PASS.

**W1 — Finish already built slices (P1):** maintain #604/#607 as SOURCE_DONE with residual post-merge evaluation; shepherd #609 through owner-protected visual review and independent required checks. New PRs only for residual reproducible defects.

**W2 — Craftsmanship and customer friction (P1/P2):** S04, S05, S06, S07, S08, S09, S10 in independent slices after W0, with S08 provider-gated and S06 native-review-gated. At most two non-overlapping code PRs at a time; do not edit the same component or visual baselines concurrently.

**W3 — Customer-tested differentiation pilots (P2):** G01, G02, G05, G07, G10 only after W1/W2 have current evidence, each as hypothesis → baseline → a narrow prototype → blinded task walkthrough → keep/revert. G02 must never become a shadow evidence registry.

**W4 — Later opt-in/owner fact gates:** G03 Product Passport, G04 public release story, G06 ephemeral intent, G08 real contact operations, G09 aggregate RUM. Write a fresh scoped ADR/design and prove owner/provider/data source before turning research into runtime. No generic mega-feature PR.

**Dependency chain:** `W0 → W1 (#609 + residual #604/#607 checks) → W2 → W3`; `W2 evidence + explicit Owner/source authorization → W4`; `each change → exact-head checks + visual/device proof → protected merge → post-merge/served verification`. Cross-work parallelism allowed only when files, authorities and reviewers do not overlap.

## Customer journey contract and measurable evidence

**J01:** `/vi/` or `/en/` → identify BlueSkyz purpose and two real public products → status → appropriate profile. **J02:** Home → Sổ Trọ real screenshot → inspect original image → return → understand sample data and lifecycle. **J03:** product claim → `/verify` anchored statement → limit/source → return. **J04:** relevant profile → contact/support, or private security report (distinct). **J05:** change language/theme, search product and navigate with keyboard/touch. No forced profiling, no broken fallback under JS-off, no invented purchase path.

**Core route matrix:** Home, Products, Sổ Trọ profile, Sổ Tâm profile, Verify, About, Contact, Support and 404; EN, VI, zh-Hans (`zh`) and zh-Hant; light/dark; 320×568, 390×844 and 1440×900 (216 baseline combinations if each route/state is applicable). Add 200% text zoom, 400% CSS-equivalent reflow where practical, text spacing, reduced motion, forced colors, no-JS, keyboard focus and low-bandwidth for risk-bearing variants. This is a new **planned** matrix, not a claim 216 screenshots were captured.

**Human E4 qualitative walkthrough:** propose five independent EN/VI first-time visitors for initial research and native zh/zh-Hant reviewers for language-specific flows; collect participant count, role, locale, device, time-to-first-correct-action, comprehension errors, confusion points and approval/limitations. Five users are discovery data, not a statistical conversion claim; safety/truth errors are zero-tolerance. Do not invent respondents/results; keep personal information out of public artifacts.

**Proof bundle per PR:** source HEAD and base SHAs, exact code diff, affected claim and approved asset provenance, test command/environment, per-engine CI URLs and outcomes, before/after 320/390/1440 captures (or N/A with reason), contrast/focus/a11y notes, performance byte/LCP/CLS/TBT deltas, negative fixture result, qualified independent reviewer and rollback command. An absence of proof is NOT_VERIFIED.

## DoD / acceptance gates (all blocking when applicable)

**A0 — Truth:** only `getPublicProducts`, canonical showcase and claim fabric; each screenshot provenance and 'development/sample data' visible; unknown source and hidden product fail closed. No fake pay/subscription, customer quote, release, certification, screenshot, seller/legal status or trust guarantee.

**A1 — Visual DNA:** locked Brand Kit v4 assets, brand hash and Horizon/Sail direction verified with actual renders; no new remote fonts, visual noise or unapproved global overrides; H1/CTA/status survive 320 px and 200% zoom.

**A2 — Accessibility:** WCAG 2.2 AA (not merely axe=0), focus-not-obscured, reflow at 320 CSS px, keyboard/screen reader, color contrast, names/labels, ≥44px product target lattice where local test requires it, reduced-motion/forced colors, dialog recovery, no-JS path.

**A3 — Performance:** active project contract applies: Lighthouse mobile lab LCP ≤ 2500ms, CLS ≤ 0.05, TBT ≤ 200ms; honor per-route transfer and JS budgets, no unapproved third-party network. Field p75 LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 only once independent aggregate field source is qualified; one-run Lighthouse or historic W0 metrics cannot be declared current field PASS.

**A4 — Localization:** locale keys, action links, screenshot disclosures, lifecycle, claim sources/limits and fallback states maintain four-language parity. Machine translation without a qualified native reviewer remains NOT_VERIFIED, especially zh-Hant.

**A5 — Engineering:** targeted test first, then `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm check:client-budget`, `pnpm check:static-links`, `pnpm test:architecture`, `pnpm validate:public-truth`, `pnpm test:e2e`, Lighthouse and CI snapshots. Do not weaken tests to get green.

**A6 — Promotion:** GitHub main ruleset 22500299 currently requires strict integration 15368 `Quality Gates` plus `Browser Assurance`, resolved conversations, PR and no forced push. Check trust/provider identity on current run. Authoritative cloud preview/production and served-SHA, independent real-device E4, Owner production authorization and rollback are separate gates; source merge ≠ prod ready.

## Red-team trials and fail-closed response

**Adversarial set RT01–RT12:** RT01 reinsert historical false bank/paid CTA into Marketing; RT02 publish hidden product; RT03 fabricate sample UI or source revision; RT04 detach claim/limit/source; RT05 missing original image; RT06 force 320 CSS px and 200% zoom; RT07 inject endless motion/third-party script; RT08 keyboard/dialog focus trap and blocked JS; RT09 machine-reviewed zh-Hant claim strengthening; RT10 stale SHA/forged approval/failed required checks; RT11 analytics payload with `visitorId`, `session_id` or IP; RT12 false mailbox delivery or leaked security incident into general sales. Each must have an existing or new relevant negative proof, an expected explicit FAIL or truthful degraded state, and an accountable remediation lane.

**Rollback doctrine:** disable a new presentation layer through a small reversible PR; never roll back Product Truth security or relax CI. If served production deviates from tested SHA, mark BLOCKED and use the existing provider deploy/rollback controls (Owner/provider only). If live analytics payload includes identifiers, the Owner executes the documented Cloudflare Web Analytics kill switch; never silently retain collection.

## Package implementation cards (10 S+; 10 GOD-TIER)

Each card states user problem, exact touched surface, actions, tests, acceptance criteria, negative cases, dependencies and rollback. Work listed as SOURCE_DONE is a verification lane, not permission to rewrite merged work. Later research-only cards do not grant data/product publication authority.

### S01 — Responsive genuine-screen readability

**Execution:** W0 / W1. **Status:** SOURCE_DONE (#607); RUNTIME_NOT_VERIFIED. **Effort:** S follow-up.

**Dependencies:** #607 merged at main@7f847400; latest true screenshots and QA environment.

**Code surfaces:** src/components/product/FlagshipCapture.astro; src/components/product/FlagshipTheatre.astro; src/content/showcases/sotro.yaml; tests/e2e/ux-p2-9-home-capture.spec.ts.

**Customer scenario:** Landlord opens Home on a 320px/390px phone and wants to see what the real collection screen does; desktop evaluator sees a readable, cropped panel without a fabricated mockup.

**Implementation steps:** Read back #607 on HEAD; test real visible screenshot and selected srcset at 320, 390, 768, 1024 and 1440 CSS pixels; compare alt, sourceRevision, sample-data caption and original image; fix only reproduced asset-loading, crop or reading errors in a new small PR.

**Verification:** Reuse ux-p2-9-home-capture, c2-flagship-theatre and client-budget guards; add iOS Safari manual screenshot/provenance and an image network inventory. Use visual snapshots only with authorized owner control.

**Acceptance criteria:** One genuine source-backed visible capture at each width, fully inspectable original image, no misleading crop, 0 newly introduced duplicate downloads, no regression against performance/CLS budget; blind evaluator can name the screen's task.

**Red-team / negative proof:** Substitute identity art for running UI, corrupt source revision, make both captures visible/downloaded, omit sample-data label, or restore the 4–7px original scale: gate must fail or pilot must reject.

**Rollback:** Revert only follow-up capture CSS/source PR; retain #607 merge unless independently shown incorrect.

### S02 — Claim / Limit / Source card

**Execution:** W0 / W1. **Status:** SOURCE_DONE (#604); RUNTIME_NOT_VERIFIED. **Effort:** S follow-up.

**Dependencies:** #604 merged at main@0fa376a; #564 trust-signature evidence gate.

**Code surfaces:** src/components/verify/VerifyCentre.astro; src/lib/claims.ts; tests/e2e/ux-u7-verify-cards.spec.ts; tests/e2e/exp-s3-verify.spec.ts.

**Customer scenario:** Buyer reviews one trust claim, its boundary and its link, without confusing an internal source with external certification.

**Implementation steps:** Inspect merged #604 in latest source; audit four locale mobile/desktop rendered grouping and keyboard source focus; do not rebuild cards or author a second claims list; if gap persists, deliver a minimal targeted PR.

**Verification:** Run ux-u7-verify-cards, Verify route accessibility, link integrity, fail-closed claim fixtures and no-JS assertions.

**Acceptance criteria:** Each displayed claim's limitation and clickable evidence are in the same semantic card; matching claim IDs and source references derive from canonical graph; no false 'verified' seal.

**Red-team / negative proof:** Remove cited source, move limit outside card, publish an unknown claim ID, or replace citation with a decorative badge: test FAIL.

**Rollback:** Revert only new enhancement; keep existing verified truth pipeline.

### S03 — One action tier + one reference-link tier

**Execution:** W1. **Status:** ACTIVE (#609; not merged at read-back). **Effort:** S/M.

**Dependencies:** #609 head bcfe23b5; latest exact-head Quality Gates + Browser Assurance and protected snapshot rule.

**Code surfaces:** src/components/ui/ButtonLink.astro; src/components/experience/HomeNextSteps.astro; src/components/experience/JourneyBar.astro; src/components/experience/ProfileNextSteps.astro; tests/e2e/ux-p2-7-action-tiers.spec.ts.

**Customer scenario:** Visitor distinguishes the product action from text citations and receives consistent focus/touch affordances.

**Implementation steps:** Shepherd existing PR #609; inspect changed routes including zh/zh-hant, snapshot deltas and conflict after #607; never open duplicate CTA refactor; merge only via effective protected rules and exact-head independently green checks.

**Verification:** Use #609's action tier E2E + 4-locale critical-route visual and WCAG focus/target checks, run all trusted check shards; re-run after any rebase/commit.

**Acceptance criteria:** Pill buttons use ButtonLink; text references underlined at rest; accessible names, targets and URLs unchanged; no business/product truth mutation.

**Red-team / negative proof:** An old 20px boxed action, hover-only underlined reference or 44px tap target regression fails.

**Rollback:** Revert #609 via normal PR if measured comprehension/a11y regresses; no direct-main patch.

### S04 — Real-device screenshot dialog recovery

**Execution:** W2. **Status:** PARTIAL (#605/#611 source merged; real devices pending). **Effort:** S/M.

**Dependencies:** Real iOS Safari and Zalo/Facebook/Messenger/Android in-app-browser access, #605 viewer baseline.

**Code surfaces:** src/scripts/capture-viewer.ts; tests/e2e/ux-p2-4-capture-viewer.spec.ts; src/components/product/FeatureStory.astro.

**Customer scenario:** A visitor opens a full-size image in an in-app browser, dismisses with close/back/Escape and returns to the same reading position.

**Implementation steps:** Reproduce on real devices first; check dialog unsupported behavior, back/focus restoration and scroll locking; preserve original href when JS fails; fix smallest script issue, not add a heavy viewer library.

**Verification:** Desktop keyboard, mobile touch, reduced-motion, modified click/open-in-new-tab, no-JS, iOS/in-app human evidence.

**Acceptance criteria:** Visible accessible close, focus restored to trigger, no stranded raw-image page after JS interaction, no scroll jump; plain link remains useful without JS.

**Red-team / negative proof:** Unsupported HTMLDialogElement, repeated trigger, back gesture, modifier click, double-open and image loading error degrade safely.

**Rollback:** Disable enhanced interception and keep genuine source href if non-recoverable device issue appears.

### S05 — Locale suggestion without hero displacement

**Execution:** W2. **Status:** HYPOTHESIS; measured W0 60–90px hero push. **Effort:** S.

**Dependencies:** Fresh short-height capture at current HEAD plus user-comprehension evidence; ADR 0009.

**Code surfaces:** src/components/layout/LocaleSuggestion.astro; src/scripts/locale-suggestion.ts; public/locale-suggestion-early.js; tests/e2e/locale-suggestion.spec.ts.

**Customer scenario:** Vietnamese page opened with English browser presents one calm optional suggestion, with the main proposition still understandable.

**Implementation steps:** Re-measure 320×568 and 390×667 with banner present and dismissed before changing UX; try one compact in-flow version only if it helps; never force auto-redirect or store behavioral profile.

**Verification:** Pre-paint CLS, keyboard dismiss, EN/VI/zh/zh-hant, no-JS, 200% font zoom and repeated visit.

**Acceptance criteria:** Single dismissible readable suggestion, user remains in control, content/action remain accessible; any changed footprint improves measured first-task friction.

**Red-team / negative proof:** Cover/obscure hero, bounce between locales, steal initial focus, send analytics preference data, trigger layout shift.

**Rollback:** Restore current conservative in-flow banner if pilot does not improve task outcome.

### S06 — Native CJK/Vietnamese typographic fit

**Execution:** W2. **Status:** PARTIAL; native editorial review pending. **Effort:** M.

**Dependencies:** Qualified native zh/zh-hant and VI reviewers; W0 historic broken phrases.

**Code surfaces:** src/styles/display-type.css; src/components/sections/Hero.astro; src/content/pages/{vi,zh,zh-hant}/*; src/data/home-copy.ts; tests/e2e/ux-u3-zh-hant-type.spec.ts.

**Customer scenario:** Traditional Chinese mobile visitor reads the entire headline and disclaimer at 320px without ugly mid-word breaks.

**Implementation steps:** Capture 320/390/1440 × themes × 200% text and CJK OS fallback; record reviewer-specific line-break fixes; use existing font stack and locale-scoped line-breaking before adding copy overrides; require translation signoff.

**Verification:** WCAG text-spacing/reflow, 200% font, CJK native screenshots, language parity, heading semantics, no extra remote fonts.

**Acceptance criteria:** No clipping/mid-word failure in tested locale matrix and all product lifecycle/limit language remains semantically faithful.

**Red-team / negative proof:** Fake an approved native review, introduce a new external font, change product meaning via translation, or hide long wording at mobile.

**Rollback:** Restore localized wrapping/copy via scoped revert; keep canonical English product claim source intact.

### S07 — Search and menu focus continuity

**Execution:** W2. **Status:** NOT_VERIFIED at 2026-10-16 source HEAD. **Effort:** S/M.

**Dependencies:** Reproducible keyboard/screen-reader defect; do not modify otherwise.

**Code surfaces:** src/components/experience/CommandNavigator.astro; src/scripts/command-navigator.ts; src/scripts/mobile-menu.ts; src/components/layout/Header.astro; tests/e2e/ux-u1-search.spec.ts.

**Customer scenario:** Keyboard user searches Sổ Trọ, navigates back, reopens menu and preserves route/focus without trapped input.

**Implementation steps:** First execute Ctrl/Meta+K, Escape, tab cycle, outside click and deep-link in 4 locales; record broken cases only; patch a single focus/ARIA/root-cause gap if found.

**Verification:** Playwright Chromium/Firefox/WebKit/mobile, VoiceOver/TalkBack spot check, no-JS fallback, link naming and modifier navigation.

**Acceptance criteria:** Every interactive action reachable and labelled, focus visible and not obscured, Escape returns focus, no duplicate persistent menu in source.

**Red-team / negative proof:** Orphaned overlay, focus trapped after close, invalid search route, or JS-disabled critical navigation.

**Rollback:** Revert scoped script change without removing static primary navigation.

### S08 — Truthful freshness and sitemap timestamps

**Execution:** W2 / provider gate. **Status:** PARTIAL; shallow Cloudflare git clone omits lastmod. **Effort:** S/M.

**Dependencies:** #606 merged, Cloudflare build configuration owner and actual served-SHA evidence.

**Code surfaces:** src/lib/git-lastmod.ts; src/lib/last-updated.ts; src/pages/sitemap.xml.ts; tests/e2e/ux-p2-10-last-updated.spec.ts; provider build settings (Owner only).

**Customer scenario:** Returning evaluator can tell whether public content is current; missing git history must never be replaced with a fake timestamp.

**Implementation steps:** Prove shallow-clone behavior with current provider; compare approved provider unshallow command versus reproducible content-sourced version metadata, not deploy time; require owner-controlled build setting if changed.

**Verification:** Shallow/full git source fixtures, sitemap/colophon parity, real Cloudflare build/revision and no inaccurate lastmod.

**Acceptance criteria:** When reliable history exists, date consistent with source; when absent, omit date with no misleading promise; served result matches authorized build evidence.

**Red-team / negative proof:** Shallow clone with fake 'today', invalid/future timestamp, stale served SHA, broken sitemap hreflang.

**Rollback:** Revert build command under provider change process; preserve truthful omission fallback.

### S09 — Purposeful empty, degraded and recovery journeys

**Execution:** W2. **Status:** PARTIAL; components present, exact-head journey audit pending. **Effort:** M.

**Dependencies:** Reproduced journey dead-end and Owner-approved support/recovery information.

**Code surfaces:** src/components/empty-state/BusinessRouteState.astro; src/components/empty-state/NoCaptureStage.astro; src/components/product/ProofFirstEmptyState.astro; src/pages/{en,vi,zh,zh-hant}/404.astro; tests/e2e/empty-and-404.spec.ts.

**Customer scenario:** A product has no published captures, visitor is offline, or URL is unknown: the user gets a truthful state and useful return path.

**Implementation steps:** Audit each current route's empty/degraded/404 state with JS blocked and translations; unify only duplicate broken patterns; avoid claims of unpublished product readiness.

**Verification:** No captures/empty public registry fixture, 404 routes, link integrity, keyboard, network error/retry and no-JS snapshots.

**Acceptance criteria:** No unbacked claims, broken link or misleading primary CTA; one useful next step with context in four locales; fail-safe under unknown records.

**Red-team / negative proof:** Publish hidden product via fallback, nonexistent contact route, fabricated estimate/release date, infinite recovery loop.

**Rollback:** Revert scoped copy/component change and retain legacy conservative fallback.

### S10 — Motion, contrast, speed and craftsmanship stability

**Execution:** W2 / all PR gates. **Status:** PARTIAL; historic lab strong, HEAD field/user NOT_VERIFIED. **Effort:** M ongoing.

**Dependencies:** Active SGPS Performance/Friction contract; quality gates.

**Code surfaces:** src/styles/global.css; src/styles/c3-craft.css; src/styles/c4-quiet-authority.css; src/styles/reveal.css; tests/e2e/a11y-wcag22-sweep.spec.ts; lighthouserc.mobile.json.

**Customer scenario:** Motion-sensitive or low-end-device visitor completes product task without flicker, jank or blocked main thread.

**Implementation steps:** Audit cascade/specificity and real rendered before/after; prefer token-level single source change; keep LCP heading static, reduced-motion/forced-colors independent and zero third-party script unless explicitly granted exception.

**Verification:** Full protected exact-head four browser CI, Lighthouse median per route, axe, text zoom, 320 CSS px, forced colors, CLS and negative budget fixtures.

**Acceptance criteria:** Strict local lab LCP ≤ 2.5s, CLS ≤ 0.05, TBT ≤ 200ms; resource/JS budgets intact; WCAG 2.2 AA applicable checks, static/no-JS equivalent content.

**Red-team / negative proof:** Force endless animation, remove motion preference, simulate 160px target, loosen Lighthouse budget, inject new external script/font.

**Rollback:** Small independent CSS PR revert; do not rewrite budget definitions to green a regression.

### G01 — 30-second customer-first comprehension journey

**Execution:** W3 pilot. **Status:** DISCOVERY_APPROVED; NOT YET VALIDATED. **Effort:** M.

**Dependencies:** Fresh W0 independent screenshots; S01/S03 source availability; human task study.

**Code surfaces:** src/components/sections/Hero.astro; src/components/product/ProductHouse.astro; src/components/experience/HomeNextSteps.astro; src/data/home-copy.ts; tests/e2e/c2-home.spec.ts.

**Customer scenario:** Unknown visitor on 390px answers: who is BlueSkyz for, which two products exist, which are in development, and what to click next.

**Implementation steps:** Run five participant exploratory tasks with logo-hidden first-impression (qualitative, not statistical); map confusion points to root causes; adjust only one content hierarchy/spacing cause per PR, retaining one flagship CTA.

**Verification:** Task-script + evaluator notes, multi-locale source truth, before/after screenshots, semantic heading and interaction step counts.

**Acceptance criteria:** No lifecycle misunderstanding or invented CTA in every observed interview; approved post-fix task result better or no more friction than baseline and users identify both products and status.

**Red-team / negative proof:** Remove lifecycle label, put trust complexity before product understanding, add competing prominent CTAs, claim commercial launch.

**Rollback:** Revert copy/order treatment if user-task comprehension does not improve.

### G02 — Contextual evidence continuum

**Execution:** W3 pilot. **Status:** READY_FOR_DESIGN after #604 merged; pilot not authorized for production. **Effort:** M.

**Dependencies:** S02 post-merge QA, #564, canonical claim/source semantics.

**Code surfaces:** src/components/integrity/ProductProofLink.astro; src/components/integrity/SourceTrace.astro; src/components/verify/VerifyCentre.astro; src/lib/claims.ts; tests/e2e/c3-product-proof.spec.ts.

**Customer scenario:** Prospect encounters one product promise, sees its limitation first and can inspect canonical evidence using an anchor.

**Implementation steps:** Prototype one product-scoped inline clarification only; derive IDs and source limits from canonical public graph; static href/HTML as base with optional progressive reveal; do not create shadow registry.

**Verification:** Every claim maps to stable Verify deep-link, source present, stale/unpublished claim disappears, with and without JS.

**Acceptance criteria:** Canonical claim/limit/source semantics remain identical across surfaces and locale, no visual styling implies independent certification.

**Red-team / negative proof:** Unbacked claim, missing URL, unsupported trust assurance, stale product or invented provider badge must fail closed.

**Rollback:** Remove supplementary inline presentation and preserve existing /verify route.

### G03 — Source-bound product passport for evaluation

**Execution:** W4 conditional. **Status:** DISCOVERY_ONLY; Owner product-fact gate. **Effort:** L.

**Dependencies:** Owner-approved public product records; existing Dossier/Decision Room hidden-page decision.

**Code surfaces:** src/components/dossier/DossierDocument.astro; src/lib/dossier.ts; src/lib/products.ts; src/lib/claims.ts; src/pages/{en,vi,zh,zh-hant}/products/[slug].astro.

**Customer scenario:** Enterprise evaluator wants a printer-friendly, accurate one-page summary of Sổ Trọ without a fabricated reference customer.

**Implementation steps:** First draft schema mapping from product, claim and showcase source; compare reuse vs extension of existing dossier; owner reviews content authority before a single optional product link, no global-navigation exposure.

**Verification:** Print A4, source/date integrity, unknown product omission, static output and no-JS, four-locale layout.

**Acceptance criteria:** No field sourced from marketing prose if product source absent; passport includes development status and evidence caveats; cannot become checkout/payment page.

**Red-team / negative proof:** Invent logo/customer quote, availability, pricing, legal entity, beta access or release timestamp.

**Rollback:** Remove optional passport view with no impact on published product routes.

### G04 — Honest milestone and product evolution

**Execution:** W4 blocked. **Status:** BLOCKED (C3-F release-publication source missing). **Effort:** L / dependent.

**Dependencies:** Explicit approved public release/changelog source and source adapter; C3-F.

**Code surfaces:** src/lib/release-schema.ts; src/lib/release-adapter.ts; src/content/products/*.yaml; src/components/editorial/EditionStory.astro.

**Customer scenario:** Returning visitor reads a dated meaningful improvement for a product rather than vague promise or fake launch.

**Implementation steps:** Write schema decision and data provenance model; do not create public milestone interface while source is missing; after Owner supplies real published releases, render a tiny reversible timeline from canonical adapter.

**Verification:** No-source fallthrough, date parsing, publishability, 4-locale semantic parity and source audit.

**Acceptance criteria:** Every date and release statement points to approved source; missing source has no misleading shell and never counts as completed.

**Red-team / negative proof:** Fake sample release, use git commit date as feature launch, infer public readiness from repository existence.

**Rollback:** Do not publish until qualified; disable optional chronology without modifying upstream fact store.

### G05 — Guided inspection of actual Sổ Trọ interface

**Execution:** W3 pilot. **Status:** READY_FOR_RESEARCH; #607 source merged. **Effort:** M.

**Dependencies:** S01/S04 actual device evidence, approved showcase capture source, user comprehension.

**Code surfaces:** src/components/product/FeatureStory.astro; src/components/product/ProductShowcase.astro; src/components/product/FlagshipCapture.astro; src/content/showcases/sotro.yaml.

**Customer scenario:** First-time landlord understands paid/due/overdue and the sample-data boundary by inspecting real app screenshots and two task-led captions.

**Implementation steps:** Select one approved source screen and user task; attach optional grounded caption markers tied to source capture region, never a drawn replacement app screen; link original-size inspection and plain-text alternative.

**Verification:** Screenshot source SHA and alt, tablet/phone real viewport, touch/keyboard, no-JS and image download accounting.

**Acceptance criteria:** No new capability promises; participant understands task and recognizes 'development + sample data'; legible on small screens.

**Red-team / negative proof:** Annotate an unknown feature, hide sample-data disclosure, overlay fake UI control or detach original source.

**Rollback:** Disable extra guidance layer while retaining real captures.

### G06 — Ephemeral customer-intent choice

**Execution:** W4 research-only. **Status:** RESEARCH_ONLY; privacy design gate. **Effort:** M.

**Dependencies:** Human evidence that opt-in choice reduces effort; existing IntentLens presentation-only contract.

**Code surfaces:** src/components/experience/IntentLens.astro; src/lib/experience-intent.ts; src/lib/journey.ts; tests/e2e/friction-step-counts.spec.ts.

**Customer scenario:** User optionally chooses 'rental management' or 'private journaling' and sees existing product content in the same neutral house, without behavioral tracking.

**Implementation steps:** Run an uninstrumented prototype with no remembered personal traits; document strong null hypothesis that simple navigation is better; avoid production implementation unless measurable reduction in search friction.

**Verification:** No preference persistence, unchanged canonical claims/URLs/status, screen-reader optional path, no forced choice or network requests.

**Acceptance criteria:** Opt-out and no-JS are first-class; task time/steps improve in pilot; no inference or profile collection.

**Red-team / negative proof:** Persist inferred intent, change publication status based on intent, leak choice to analytics or require a dialog.

**Rollback:** Experiment is removed cleanly; default task paths remain.

### G07 — Editorial-native four-locale language quality

**Execution:** W3 / W4. **Status:** PARTIAL; native reviews NOT_VERIFIED. **Effort:** L.

**Dependencies:** S06 language QA, native EN/VI/zh-Hans/zh-Hant approval and owner copy truth.

**Code surfaces:** src/content/pages/{en,vi,zh,zh-hant}/*.yaml; src/data/home-copy.ts; src/components/editorial/*.astro; tests/e2e/c3-trilingual-parity.spec.ts.

**Customer scenario:** Person reading Vietnamese, Simplified or Traditional Chinese sees culturally coherent copy, readable typography and no difference in product honesty.

**Implementation steps:** Build locale-by-route editorial review sheet with owner of each translation; have native reviewers approve 9 critical route kinds and caveats; apply concise copy/line-break edits as separate PRs.

**Verification:** Route snapshots across 4 locales/themes, native linguistic signoff, baseline/no-JS/text-zoom and Product Truth parity.

**Acceptance criteria:** No unreviewed claim strengthening, no mistranslated recovery/privacy limitation; relevant native reviewer signoff attached with exact content revision.

**Red-team / negative proof:** Machine-translated zh-Hant automatically signed off, removed disclaimer, false local currency/availability.

**Rollback:** Revert only approved copy slice and preserve source English truth.

### G08 — Verified human contact/support/security pathways

**Execution:** W4 provider-gated. **Status:** BLOCKED on real inbox/provider ownership proof. **Effort:** M / external operations.

**Dependencies:** #281/#522 provider + Owner decisions; SGPS email/identity separation.

**Code surfaces:** src/pages/{en,vi,zh,zh-hant}/contact.astro; src/pages/{en,vi,zh,zh-hant}/support.astro; src/components/empty-state/PublicContactEmails.astro; src/data/site.ts.

**Customer scenario:** Prospect can receive a real reply, existing customer finds support without breaking privacy, security researcher reaches restricted disclosure.

**Implementation steps:** Inventory actual routing, aliases, SPF/DKIM/DMARC and fallback owner; perform independent outside-domain send/receive/reply with timestamps, then alter only truth-backed public contact copy; no CRM/OTP/newsletter activation.

**Verification:** Public truth code guards, workflow receipt evidence, bounce/unreachable negative proof, separated security mailbox and incident ownership.

**Acceptance criteria:** Named owner/deputy verified on provider; tested mailbox works end to end, incident/security channel is private, published copy matches actual operational capability.

**Red-team / negative proof:** Only MX DNS presence without inbox delivery, catch-all assumption, exposed security reports in CRM, nonfunctional support mailto.

**Rollback:** Use previously independently verified contact channel or truthful degraded recourse; never invent alias.

### G09 — Aggregate field-friction improvement loop

**Execution:** W4 provider-gated. **Status:** PARTIAL RUM C3; field verification missing. **Effort:** M/L.

**Dependencies:** #451 and ADR0015, Owner privacy/provider control.

**Code surfaces:** src/lib/analytics.ts; src/scripts/analytics-bridge.ts; public/_headers; docs/sgps/adoption/rum-beacon-fields.json; tests/architecture/rum-beacon-contract.test.mjs.

**Customer scenario:** Operator observes aggregate p75 route friction without collecting tenant data, login IDs or visitor sessions.

**Implementation steps:** Capture owner-authorized real beacon request, compare keys with declared allowlist and kill-switch if identifier appears; only after proof, read aggregate p75 LCP/INP/CLS and pair with qualitative journey observations; do not add provider script.

**Verification:** Negative PII payload fixtures, CSP path restriction, no wildcard or additional script, field data retention/privacy disclosure and rollback drill.

**Acceptance criteria:** Field request allowlist verified or transmission disabled; no user/session PII, no production analytics expansion without approval.

**Red-team / negative proof:** visitorId/session_id/IP to analytics, wildcards for third-party CSP, secret leakage, asserted p75 from one synthetic lab sample.

**Rollback:** Owner disables Cloudflare Web Analytics dashboard; follow-up scoped CSP/privacy PR per ADR0015.

### G10 — Recognizable but restrained Horizon / Sail signature

**Execution:** W3 pilot. **Status:** DISCOVERY_APPROVED; independent logo-hidden verdict pending. **Effort:** M.

**Dependencies:** ADR0014, Brand Kit v4 original hash, W0 current rendered baseline.

**Code surfaces:** src/components/experience/HorizonField.astro; src/components/experience/HorizonSeam.astro; src/components/motion/SailReveal.astro; src/styles/c3-craft.css; src/styles/c4-quiet-authority.css.

**Customer scenario:** Visitor remembers the visual identity with logo temporarily hidden while product CTA remains immediately usable.

**Implementation steps:** Conduct blind recognition and usability on real screenshot sheets; change only approved CSS/token composition if proof points to an actual weakness; no gold/serif/WebGL/parallax, no animated H1.

**Verification:** Logo-hidden reviewer, before/after viewport matrices, brand hash guard, reduced-motion, Lighthouse, AAA contrast where available but WCAG AA minimum.

**Acceptance criteria:** Recognizable composed signature without sacrificing product comprehension, verified brand DNA, all performance/contrast thresholds retained.

**Red-team / negative proof:** Replace approved logo, introduce uncontrolled background motion, over-decorate home, degrade mobile CTA discoverability.

**Rollback:** Revert scoped visual wave; keep approved ADR and Brand Kit unchanged.

## Ordered coding-agent handoff and PR slicing

**PR-01 (existing #609, no duplicate):** review the four-engine pending suite, visual protected snapshots, rebase conflict, Owner label and exactly tested HEAD. If the gate is green and GitHub protection allows merge, use existing authorized promotion. No change to design values unless reproduced.

**PR-02 (proposed, source-safe):** current-HEAD keyboard/menu/capture-dialog failure discovery and one verified repair from S04/S07, but create only if real head proves a defect. Do not call a test-only document a shipped feature.

**PR-03 (proposed, native-gated):** CJK/VI wrapping and locale suggestion S05/S06, with 320px short-height visual evidence and reviewer signoff; isolate copy vs CSS to preserve provenance.

**PR-04 (proposed, source-safe):** S09 empty/recovery state root-cause correction and S10 isolated token/performance polish; split if touching same global CSS/visual snapshot paths.

**PR-05/06 (research-first):** G01/G05 user comprehension prototype and G02 claim deep-link prototype only after source and Human E4 baseline exists. These are not preapproved production enhancements; show what problem improved or revert.

**PR-07 (design-only, owner gates):** G03/G04/G06/G08/G09 feasibility/ADR packages with explicit GO/NO-GO criteria. Never implement unauthorized public claim/release/provider/analytics/seller fact from this plan.

**For every PR:** add `Related: #557 #616`, exact current dependency refs and acceptance IDs. Keep PR body concise: WHY, BEFORE evidence, root cause, files, tests, negatives, risk/rollback, blocked provider/human checks. Track DONE / PARTIAL / BLOCKED / NOT_VERIFIED rather than silently closing cards.

## Stop / escalation and convergence accounting

**Stop immediately on:** untrusted or stale source-assurance checks, Owner-protected file approval missing, false product/legal/security/payment claim, sensitive analytics key, wrong branding source, broken 320px/keyboard, significant performance regression, missing truthful recovery path, missing approved public release source, or verified provider/served-SHA mismatch. Safe independent work continues in other non-overlapping packages.

**No invented percentage:** convergence denominators are defined only after the W0 exact-head matrix and applicable gate inventory. Report (1) source work packages DONE / 20, (2) independently verified applicable acceptance gates / eligible gate count, (3) current-environment screenshot coverage / planned matrix, (4) separate Human E4/Native/Provider gates. SOURCE_DONE #604/#607 does not equal full S02/S01 closure; no SGPS FULL, 'pixel-perfect' or production-ready label before independent proof.

**Session handoff:** the next agent should first read this plan, its parent audit in #616, `AGENTS.md`, `docs/current-work.json`, ADR0014, the performance contract, and latest PR/issue states. Resume W0/W1; do not re-implement SOURCE_DONE work. Keep a short end-of-session owner action report covering exact HEAD, PR links, DONE/PARTIAL/BLOCKED/NOT_VERIFIED, safe next action, remaining verification and whether additional source work is possible.
