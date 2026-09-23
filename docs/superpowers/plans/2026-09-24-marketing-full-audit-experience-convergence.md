# SGPS-Marketing — FULL Audit, Correctness Hardening & Experience Convergence

**Status:** execution plan; no runtime completion, owner approval, human validation or public-launch approval is asserted by this document.  
**Observed:** 2026-09-24, Asia/Ho_Chi_Minh.  
**Verified baseline:** `main@bbc0600100bebdb12024949e9834f333f9ffbeb2` (2026-09-23T08:03:06Z). This SHA is an observation, not a permanent execution pin: refresh main/PRs/provider/SGPS immediately before each wave.  
**Scope:** BlueSkyz-Labs/SGPS-Marketing; portfolio authority from BlueSkyz-Labs/sgps-core; extend existing C2/C3/C4 plans rather than restart them.

## 0. Executive intent and immutable constraints

Upgrade the existing public BlueSkyz Labs marketing experience from source-backed, static-first C4 components to one coherent **Quiet Excellence / Digital Hospitality / Verifiable Craft / Boardroom Clarity** journey. Improve functional correctness, accessibility, SEO, security, internationalization, recovery and design craft in parallel. The goal is not more features or more animation; it is a clearer, more trustworthy and more useful journey from arrival to evidence-informed decision.

Precedence: Safety/provider and SGPS controls > canonical product/public truth > newest approved ADR/spec > active plan/router > repository tests > implementation. Do not silently repin immutable published SGPS v1.13.0 to moving sgps-core/main. Discover all relevant source overlays, classify local applicability and record adoption separately from implementation/convergence.

**Never fabricate:** owner emails, product identity/capabilities, screenshots, customer proof, certification, security posture, release/freshness, dated human acceptance, legal clearance, live deployment result or provider approval. Preserve empty-registry honest fallback and Cloudflare Access owner-only gate until separately authorized. No client analytics/RUM transmission without approved privacy/provider/retention decision; no remote AI, private evaluation runtime, identity/payment or WebGL simply because an experience plan mentions it. Never weaken existing controls, tests, no-JS completeness or client budget to merge.

**Promotion:** branch -> scoped PR -> exact-head Quality Gates + Browser Assurance -> applicable preview/owner review -> expected-head merge to protected main -> Cloudflare production read-back and smoke. Source checks do not prove production availability; Cloudflare deploy does not prove real-user E4. Do not direct-write main. Do not mark PLANNED as implemented or ADOPTED as CONVERGED.

## 1. Evidence inventory and current situation

| Surface | Observed at baseline | Consequence |
| --- | --- | --- |
| Main | bbc0600, merged PR #227, dossier provenance refactor | Existing C4 source authority must be preserved, not forked. |
| Source/browser/deploy | Exact-head Quality Gates, Browser Assurance and Workers Builds success in GitHub checks | Healthy source baseline, not blanket launch certification. |
| Ruleset | Active main-promotion-governance #22500299; PR + strict Quality Gates / Browser Assurance, conversations resolved, no bypass | All changes via PR; independent human review cannot be invented when unavailable. |
| Open C4 PRs | #224 router reconciliation; #225 Architecture Salon; #228 arrangement; #229 controls; #230 reasons; #231 handoff; #232 deterministic briefing; #233–#235 dependencies | Avoid duplicate implementation and stale-head merges; reconcile dependencies per exact diff. |
| PR #231 | Open with mergeable=false at observation; base older than main | Inspect compare/conflicts and rerun exact-head gates after rebase; no forced merge. |
| Router | docs/current-work.json updated 2026-09-22, c3-c-converged; C4 runtime already merged, #224 open | Active-work record is stale; reconcile via #224 rather than parallel edits. Name collision: C3-C brand-experience W1–W8 vs C3-C Living Product System. |
| Public truth | C2-P0 product screenshot/fact floor owner-gated; registry honest-empty, no invented product screenshot | Product showcases must stay honest while infrastructure/layout is improved. |
| Contact | src/lib/act.ts soft-lands to About/Security until real contact email exists | Do not create dead-end contact conversion or fake lead funnel. |
| Privacy | src/lib/analytics.ts uses local DOM events only; transmission disabled | No claim of measured conversion improvement or production RUM. |
| Locale | en, vi, zh=zh-Hans first-class source routes; zh-Hant architecture-ready only | No false zh-Hant completion; preserve deliberate language preference. |
| Dossier | src/lib/dossier.ts consumes getPublicProvenance; C4-D contract tests check missing ID and current subjects | Additional negative test needed for existing claim whose provenance becomes unknown; see H-01. |

Source pointers: AGENTS.md; docs/QA_STRATEGY.md; docs/current-work.json; docs/evidence/2026-09-22-sgps-experience-adoption.md; C4 master/spec and child plans; repository PRs listed above. Provider state must be re-read; historical plan wording is not provider truth.

## 2. Audit findings / hypotheses and remediation

### H-01 — P1, source-backed claim publication guard (code-observed conditional gap; not proven live exploit)
- **Definition:** dossier claims branch checks CLAIMS existence, then returns a DossierEntry regardless of `getPublicProvenance(...)` being null/unknown; evidenceIds become empty. Current c4-dossier-provenance test refuses a nonexistent ID, not an existing ID whose evidence becomes non-public/self-only.
- **Scenario:** a future claim remains in CLAIMS while its only independently supporting evidence is removed, invalid or becomes self-referential. The provenance lens refuses the chain but dossier could display the claim without reliable provenance.
- **Fix:** write a RED contract fixture or injectable dependency seam for existing-claim/unknown-provenance; reject rather than render claim when canonical adapter returns unknown/null; report a reason and complete=false. Preserve honest boundaries and do not change current public data to manufacture the failure. Add EN/VI/zh, print and no-JS checks.
- **Acceptance:** test fails against baseline behavior, passes smallest root-cause fix; no claim rendered when its canonical provenance refuses it; valid claim/evidence identity and authored freshness unchanged. Treat as prevention until a real public-input exploit is demonstrated.

### H-02 — P1, current-work drift and PR ordering (confirmed governance drift)
- **Definition:** router is 2026-09-22 c3-c-converged while C4 code has advanced; #224 is the existing fix in review.
- **Scenario:** a fresh agent trusts stale task names, creates parallel source registries, rebases incorrectly or marks PRs merged without checking the provider.
- **Fix:** inspect #224 latest exact head and reconcile with main and C4 PRs; preserve max-one IN_PROGRESS, evidence paths and owner gates. Explicitly distinguish C3-C Living Product System from C3-C Brand Experience Upgrade. Add agent handoff snapshot: active program/wave/task/PR/base/head, last verification timestamp, verified vs unknown vs owner/external state. Use additive schema migration with tests, no unverified SHA-as-state.
- **Acceptance:** clean agent can follow AGENTS + router + live GitHub to the same next action; stale PR number fails contract; owner gates remain blocked; no second router is introduced.

### H-03 — P1, dependency-aware C4 integration (observed open branches)
- **Definition:** #228 is pure atelier model, #229 depends on its interface, #230 on arrangement/reason, #231 handoff on canonical dossier; #225 creates architecture route/IA changes; #232 briefing depends on dossier/provenance. Multiple branches share CSS, routes and tests.
- **Scenario:** green branch independently conflicts or loses prior CSS/print/no-JS rules when merged against main.
- **Fix:** sequence by dependency and rebase/merge each against latest main; inspect list of changed files, diff, conflicts and tests; preserve #231's dossier print rules. Do not mark mergeable=true alone as ready. Scope new work to uncovered gaps.
- **Acceptance:** exact-head source/browser checks for each resulting SHA; route/print/Atelier/provenance regression suite retained; every merge followed by main read-back.

### H-04 — P1, product/public truth launch gate (confirmed owner dependency)
- **Definition:** product-publication floor and verified corporate contact/security email require owner-fact evidence; owner-only Cloudflare Access may still restrict visitors.
- **Scenario:** polished launch funnels funnel into empty registry/contact or unsupported claims.
- **Fix:** preserve and improve high-quality, legible honest-empty state; add owner evidence intake checklist with immutable source/capability identity, actual product capture, attribution/rights, proof, owner approval; no AI placeholder promoted as fact.
- **Acceptance:** no public product/claim/email appears without original approval and independently inspectable route; truthful CTA falls back gracefully; public GO requires distinct owner and production verification.

### H-05 — P1, locale completeness and route-derived SEO (confirmed partial readiness)
- **Definition:** en/vi/zh-Hans operate; zh-Hant is architecture-ready; C4 new routes must extend sitemap/alternates/canonical/nav/print contracts when merged (#225).
- **Scenario:** Architecture/Briefing routes render but are omitted from sitemap/alternates, language switcher leads to missing route, Chinese typography or text zoom breaks.
- **Fix:** derive served-route inventory and positive/negative route tests; review BCP-47 and reciprocal hreflang; preserve zh-Hans and truthful zh-Hant status; test IME if inputs appear. Risk-review security/privacy/commercial translations with human owner as external evidence.
- **Acceptance:** each published route reachable + canonical + reciprocal alternates + sitemap per locale, absent routes neither advertised nor indexed; 320/390 + 200% text zoom + forced colours + no-JS.

### H-06 — P1, measurable experience QA not subjective styling
- **Definition:** C4 Quiet Authority tokens exist, but site-wide optical convergence and E4 remain distinct from source-gate pass.
- **Scenario:** appealing homepage but inconsistent dossier/editions/security/contact dark-mode contrast, focus, print or CJK line breaks.
- **Fix:** route-by-route screenshot matrix at 320/390/768/1440, both themes, English/Vietnamese/Simplified Chinese; explicit scene measure, 44px targets, logical keyboard/focus, reduced-motion, forced-colors, text spacing, no sideways scroll and dark/light/print parity. Browser captures are preflight, not invented human E4.
- **Acceptance:** reviewed baseline/target/diff ledger; regressions codified in representative Playwright/axe checks; no discretionary grade or fabricated convergence percentage.

### H-07 — P2, telemetry and performance contract
- **Definition:** local events are non-transmitting; client budget is bounded by repository check, not a license to add scripts or report commercial uplift.
- **Scenario:** conversion optimization becomes tracking without privacy approval; decorative UI inflates JS and worsens perceived load.
- **Fix:** keep network transmission OFF; report observational/local QA only; no third-party analytics until decision covers provider, consent/legal basis if applicable, retention, minimization and deletion. Measure per-route JS/critical images/fonts, Lighthouse, Core Web Vitals proxies and production RUM only if approved. Fix root cause before requesting a budget increase.
- **Acceptance:** no unexpected requests/storage and local event payload excludes arbitrary values; source/client/Lighthouse gates pass at exact head; user journey remains functional without JS.

### H-08 — P2, AppSec/public-static boundary defense
- **Definition:** public-safe adapters exist; private room and model-assisted briefing are separately gated.
- **Scenario:** crafted URL IDs or hrefs leak private paths, unsupported evidence, private evaluation data or script destinations through generated docs/briefing.
- **Fix:** test encoded/path-traversal, protocol-relative/unsafe schemes, HTML/JSON-LD injection, unsupported ids, self-only chain, malicious source label, stale evidence, cross-locale spoofing, unbounded URL parameters, output print data, public manifest leakage. Harden publicDestination at canonical boundary if a test proves accepted unsafe destinations; do not add blanket unsafe string replacement as a substitute for source authority.
- **Acceptance:** explicit fail-closed negative fixtures; immutable source/sanitized public projection; no auth/secret/private runtime import in static bundle; scan built dist and machine-readable routes.

### H-09 — P2, operations and recovery
- **Definition:** source checks and Workers Builds were green for bbc0600, but exact deployed revision, production smoke and recovery are different evidence classes.
- **Fix:** verify host, revision, status, redirects, canonical/security headers, key locale routes, dossier print, truthful contact/security channel, rollback to prior Workers version, repeat smoke after rollback; preserve Cloudflare Access gate until owner approval.
- **Acceptance:** real observation timestamp/host/deployed revision and PASS/FAIL per probe; owner/external gaps named; no inferred deployment result from main CI alone.

## 3. SGPS FULL applicability

- Published release pin: retain existing project release identity; new sgps-core main is a discovery overlay, not a silent BOM mutation.
- Applicable specialist source: SGPS-DEC-2026-004, -006, -007, -008, -012, -019, -022; reconcile newest applicable -013/-014/-017 for risk-bearing architecture. Adopt only where applicable with project-local mapping.
- GUX remains detailed accessibility/interaction authority. Product Truth retains all factual authority; design mockup, runtime capture, verified evidence and human E4 are distinct.
- Record two axes in durable evidence: **governance** NOT_ADOPTED/ADOPTED and **experience** NOT_ASSESSED/AUDITED/TARGET_DEFINED/PLANNED/IMPLEMENTING/VERIFIED/CONVERGED/DEFERRED/BLOCKED. Do not write `SGPS FULL COMPLETE` while real-user/owner-gated boundaries remain unresolved.
- Material change paths: ENTRY/NORMAL/DEGRADED/RECOVERY/EXIT/SCALE assessed against outcome, correctness, security, privacy, resilience, operability, cost, portability and evidence.
- No newly invented SGPS framework, token universe, palette, experience registry, claim authority or central marketing dashboard.

## 4. Experience target: one coherent digital maison

User journey: **Arrive -> Orient -> Inspect -> Understand -> Verify -> Compose -> Present -> Decide / Contact**. Every step has an ordinary readable link, understandable fallback and inspectable evidence. Fixed House DNA, fluid per-product expression; quiet excellence is useful omission and precise hierarchy, not generic glass, metallic ornament, badges or fake scarcity. Use existing Brand Kit v4 and C4 role tokens. House Codes require provenance and recognition evidence, not presumed cultural symbolism.

### 10 God-tier proposals (candidate improvements, not claims of delivery)

| ID | Concrete outcome / reuse | Proof of value |
| --- | --- | --- |
| GT01 | Cross-route journey continuity from MaisonIndex, nav, Decision Room and footer without a second registry | Real target routes, logical keyboard sequence, restart/exit pathways |
| GT02 | Boardroom Dossier provenance gate hardening and caveat parity in print | Unknown existing claim never publishes; print carries sources and limitations |
| GT03 | Architecture Salon public-safe five-lens narrative after #225 | Every fact readable without diagram/JS, no private topology |
| GT04 | Decision Atelier transparent reasons after #228–#231 | Explicit reversible selection, no ranking/profiling, accurate handoff |
| GT05 | Verifiable Briefing deterministic phase after #232 | Exact source lineage, unknown refusal, printable/no-JS fallback |
| GT06 | Trust narrative across security/privacy/evidence with clear limitations | No invented assurance, coherent source/boundary/freshness |
| GT07 | Product House evidence-gated reveal | Unapproved products stay hidden, empty state remains useful |
| GT08 | Local-first multilingual route continuity | Locale-specific canonical, reachable switch, no zh-Hant false claim |
| GT09 | Tasteful editorial content presentation for Editions/Craft | Source-backed and rights-cleared; static readable print |
| GT10 | Human-friendly digital hospitality and recoverable actions | Every step supports no-JS, reduced-motion, accessibility and recovery |

### 10 Tier S+ improvements

| ID | Bounded improvement / guard |
| --- | --- |
| S01 | Typography scale/measure/CJK and line-break audit across long-form routes |
| S02 | Semantic icon grammar and accessible named controls; no decorative icon overload |
| S03 | Material/color/token unification in Light/Dark/forced-colors/print |
| S04 | CTA hierarchy and honest contact fallback; no dead-end conversion |
| S05 | Focus visibility, keyboard order, aria status and reset/empty/error feedback |
| S06 | 320/390/768/1440 responsive and 200% zoom/content spacing fixtures |
| S07 | Motion scarcity plus full reduced-motion equivalence |
| S08 | Product/architecture/evidence images: genuine rights, useful alt and optimized loading |
| S09 | Per-route performance/client bytes/CLS/image/font guard without budget inflation |
| S10 | Public route/SEO/metadata/security-header/rollback regression checks |

Each selected idea MUST have a short implementation slice recording definition, real user scenario, user flow, current gap, business/trust/security/privacy value, files, tests, rollback and exact-head evidence. Not all ideas warrant new features: first reuse or refine existing components.

## 5. Execution sequence (small PRs; no mega PR)

| Wave | Dependency | File targets / work | Done when |
| --- | --- | --- | --- |
| W0 — Rebase truth | Live main/PR/rules/provider read-back | Inspect #224/225/228–235, router, current C4 design and SGPS overlays; record exact SHA and execution ledger | No stale or ambiguous wave identity; open dependencies ordered |
| W1 — Source correctness | W0 | tests/architecture/c4-dossier-provenance.test.mjs, src/lib/dossier.ts only as justified, localized/print e2e | RED->GREEN for existing claim/unknown provenance, no regression |
| W2 — Integrate in-flight C4 | W0+W1 as relevant | Existing PR branches and current-work; avoid parallel replacement | #224/#225 and #228->#229->#230->#231; #232 merged only once dependencies and gates pass |
| W3 — SGPS/experience inventory | W0 and stable C4 source | docs/evidence baseline/target/gap/decision mapping; component, route and token census | Two-axis state, precise target and owner/external residuals |
| W4 — Experience craft | W2+W3 | src/components/layout, sections, experience, dossier, editorial; src/styles/c4-quiet-authority.css; e2e tests | Visual consistency, semantic/a11y/mobile/print proof without second design system |
| W5 — Function/SEO/i18n hardening | W2+W3 | src/lib/seo.ts, i18n.ts, route surfaces, CTA/empty/truth tests | Full route and locale coverage, no fake product/contact |
| W6 — Security/performance/ops | W1–W5 | public projection tests, client/SEO/ops contracts, deploy smoke evidence | Static privacy boundary, client/perf and recovery/rollout verified |
| W7 — Final convergence | Waves complete or transparently gated | project-local final evidence + current-work, provider read-back | Only verified capabilities marked converged; Human E4/owner gates not auto-cleared |

W2 dependency note: #231 has mergeable=false at observation; use compare/changed filenames/CI and repair against latest main with preservation of dossier print CSS. #233–#235 should each be checked separately for compatibility and regression, especially major formatter migration; do not batch into an unreviewable change.

## 6. Exact test and red-team package per runtime PR

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
pnpm test:e2e
pnpm lighthouse
```

Run actual repository scripts as configured; don't treat a missing/changed script as PASS. For docs-only plan PR, repository-required exact-head CI remains authoritative. A target-specific test must be demonstrated RED before root-cause implementation when testing a hypothesized defect.

Negative/abuse fixture matrix: unknown/unpublished/self-only claim; invalid/mutated evidence href; injected id/query; unsupported locale; source freshness absent/stale; print caveat dropped; missing real email/product; JS disabled; storage/network blocked; URL reset; cross-route/link/hreflang; 320px overflow; CJK, IME, focus/forced-colors/reduced-motion; Cloudflare source/build/deploy divergence; rollback verification; private-runtime leakage.

Capture `observed_at`, `base_sha`, `head_sha`, affected routes, tests executed and exact exits, before/after deltas, provenance boundaries, owner/external gates, rollback path, deployment host/revision only if actually read back. No numeric completion estimate based on plan existence.

## 7. External and authorization gates

1. Product screenshot/capability/proof and contact/security emails require real owner facts and publication decision; preserve honest-empty until then.
2. Real-user E4 task + brand interpretation, domain/VI/CJK linguistic, trademark and imagery rights review are human/external evidence, never inferred from automation.
3. Analytics/RUM provider/privacy/retention approval must precede any telemetry transmission.
4. C4-F private evaluation requires separate approved identity/session/data/RBAC/retention/recovery/threat-model ADR and isolated runtime; no private records in public Astro build.
5. Remote/model C4-G and C3-E require provider, privacy, source-bound validation, cost/abuse/logging and kill-switch GO decision; deterministic public baseline works without models.
6. WebGL/3D is optional and NO-GO is a valid outcome if real utility does not justify cost/accessibility.
7. Cloudflare Access owner-only and production public GO are owner-controlled and separate from merging source.

## 8. Next agent handoff

Start W0: reread `main`, PR #224 and #225/#228–#232 statuses, checks and exact changed files. If #224 now merged, never repeat its edit; consume the updated router. Then execute W1 narrowly if the existing-claim/unknown-provenance negative fixture establishes the gap; otherwise document the counterevidence and proceed to highest uncovered real issue. Continue PLAN -> DO -> CHECK -> RED TEAM -> IMPROVE by risk-sized PRs and preserve independently reversible changes. Report completed vs verified vs blocked separately, with no invented production or human evidence.
