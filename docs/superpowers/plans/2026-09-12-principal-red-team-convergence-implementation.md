# SGPS Marketing Principal Red-Team Convergence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Use `superpowers:test-driven-development` for behavior changes, `superpowers:systematic-debugging` for unexpected failures, and `superpowers:verification-before-completion` before any PASS/merge claim. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the highest-leverage truth, provenance, promotion, agent-governance, and UX-semantic drift risks identified by the 2026-09-12 Principal Engineer / Product Architect / Security / UX / SGPS red-team audit without weakening the static-first, bilingual, low-JS architecture.

**Architecture:** Preserve the existing Astro static system, product registry, `src/lib/truth.ts`, and `architecture/sgps-model.json` as authoritative in their existing domains. Add narrow validation and mapping layers rather than a new platform: Git-object provenance validation, a current-work router for agents, explicit promotion-stage semantics, product publishability reconciliation, localized accessibility chrome, canonical deep links, assurance-vocabulary guards, and evidence anti-cycle rules. Generated views and public renderers remain derived artifacts, never sources of truth.

**Tech Stack:** Astro 7.3+, TypeScript 6, Tailwind CSS 4, vanilla browser APIs, Node test runner, Playwright 1.63, axe-core, Lighthouse CI, Cloudflare Workers Static Assets, Node >=24.20.0, pnpm 11.25.x.

**Spec:** `docs/superpowers/specs/2026-09-12-god-tier-v3-trust-experience-design.md`

**Parent plan:** `docs/superpowers/plans/2026-09-12-god-tier-v3-trust-experience-implementation.md`

**Architecture decisions:**

- `docs/decisions/0007-sgps-architecture-canonical-model.md`
- `docs/decisions/0008-bilingual-architecture.md`

**Planning baseline:** `main@c430e7efc2812697dc4f05c8c17740bb50a318b5`. This SHA is only a planning anchor. Execution MUST refresh live state before Task 0.1.

## Global Constraints

- This is a planning artifact. Its merge authorizes no runtime implementation by itself.
- Refresh `origin/main`, open PRs/issues, exact-head checks, and provider evidence before every wave.
- Historical SHAs are evidence anchors, never instructions to reset to stale state.
- `src/lib/truth.ts` remains production public-truth authority.
- `architecture/sgps-model.json` remains canonical architecture truth; derived views never become architecture truth.
- Public product existence remains derived from the Astro products collection and `getPublicProducts()`.
- Do not create a second manually maintained product, route, claim, architecture, or evidence registry.
- Critical content, navigation, evidence, and actions work with JavaScript disabled.
- No React/Vue/Svelte runtime, LLM, vector database, remote semantic search, account system, fingerprinting, cookie personalization, or localStorage personalization.
- Analytics transmission remains disabled unless separately approved.
- WebGL/3D remains NO-GO unless a later evidence-backed decision supersedes it.
- Never invent products, emails, users, customers, certifications, scores, review dates, proof, deployment outcomes, or human-study results.
- EN/VI parity includes visible copy and assistive-technology-facing chrome.
- Maintain keyboard operation, visible focus, 44px target intent, 200% text zoom, 320px no-overflow, reduced-motion equivalence, and no-JS critical paths.
- Client-JS ceiling remains 120,000 B Brotli site-wide and worst-page. The current ~1,644 B posture is a baseline to preserve, not a budget to spend.
- GitHub Actions remains secretless/read-only source assurance unless an explicit ADR changes that architecture.
- Do not weaken tests, security controls, branch rules, source assurance, public-truth validation, or evidence semantics to go green.
- Promotion remains branch → PR → exact-head Source Assurance → applicable Cloudflare evidence → merge → exact-main deployment/read-back.
- Human E4 remains OPEN until real representative participants produce recorded evidence. Agent/LLM simulation is preflight only.
- **MAKER != JUDGE:** implementers may run deterministic checks but may not self-issue a Premium UX PASS.
- Maximum two active runtime PRs; prefer one. No unrelated refactors.

---

## 1. Reconciled Current State

At commit-time refresh:

- `main` = `c430e7efc2812697dc4f05c8c17740bb50a318b5` (v3 Wave 1 / PR #123).
- PR #124 is open v3 Wave 2 candidate work; refreshed head `b3360136e5918c28d8648a50085125b543ffa4df`. Its exact-head Source Assurance run `34669107313` was still in progress during this planning commit. It is candidate evidence, not `main` truth.
- PR #125 is an open docs-only v3.1 convergence design candidate and is not authoritative until merged.
- No open non-PR issues were found during the audit refresh.
- `src/content/products/` contained no product data entry; only its README.
- `architecture/sgps-model.json` is canonical architecture truth, while current provenance tests validate revision shape more strongly than Git-object existence at the cited revision.
- `AGENTS.md`, root `README.md`, and `docs/QA_STRATEGY.md` still contain older C1.1/current-work routing that can mislead a fresh coding agent.
- Human E4 remains OPEN unless a newer real-participant artifact appears before execution.

Execution MUST overwrite this snapshot with fresh evidence rather than trusting it.

### Findings this plan closes

| Finding | Severity      | Root problem                                                         | Primary tasks    |
| ------- | ------------- | -------------------------------------------------------------------- | ---------------- |
| F1      | P1            | Agent current-work pointers can go stale                             | T1               |
| F2      | P1            | SHA-shaped provenance can false-green                                | T2-T3            |
| F3      | P1            | Product publishability prose and schema can diverge                  | T3               |
| F4      | P1            | Source/deploy/public-truth semantics can be conflated                | T4-T7            |
| F5      | P1 candidate  | Candidate Integrity Lens can become self-referential                 | T11              |
| F6      | P2            | Browser install retries can fail away from root cause                | T6               |
| F7      | P2            | Public state vocabularies can imply stronger states                  | T8               |
| F8      | P2            | Unqualified assurance wording can outrun evidence                    | T8               |
| F9      | P2            | VI visible parity does not guarantee VI AT chrome                    | T9               |
| F10     | P2            | Object-level Navigator/Atlas links can collapse to collection routes | T10              |
| F11     | P1 evidence   | Old runtime smoke can be misread as current-main proof               | T7               |
| F12     | P2 UX         | Trust-system density can exceed product/comprehension value          | T12              |
| F13     | P2 governance | Human separation-of-duty remains conditional on a real reviewer      | T12 / owner gate |
| F14     | P2 candidate  | Review dates need semantic authored-date rendering                   | T11              |

---

## 2. Target State

The repository should answer these questions deterministically:

1. What spec and plan are current for an execution agent?
2. Does a cited Git revision actually exist, and did the cited path exist at that revision?
3. What exactly makes a public product publishable?
4. Which evidence class passed: source, deployment, public truth, or human UX?
5. Can any supported production deploy path bypass the public-truth gate?
6. Can a page use itself as its only evidence while saying “Verify this page”?
7. Does bilingual parity include accessibility semantics?
8. Do product-level navigation items land on product-level routes?
9. Can wording such as “verified,” “certified,” or “available” silently upgrade evidence strength?
10. Can more SGPS UI be added without independent comprehension evidence?

---

## 3. Scope

### IN

- Agent bootstrap/current-work truth routing.
- Git-object provenance validation.
- Architecture and product provenance regression guards.
- Product publication-contract reconciliation.
- Promotion-stage state model and fallback deploy hardening.
- Browser bootstrap fail-closed behavior.
- Exact-main deployment/read-back evidence validation.
- Domain-state anti-conflation and assurance vocabulary rules.
- EN/VI accessibility chrome.
- Navigator/Atlas object-level deep links.
- Integrity Lens anti-cycle semantics if PR #124 or equivalent lands.
- Semantic review dates if authored review metadata exists.
- Homepage/evidence-surface cognitive-density guardrails.
- Independent UX review and Human E4 protocol.

### OUT

- New UI framework.
- New analytics provider or analytics transmission.
- WebGL/3D.
- LLM/AI generated verification answers.
- Accounts, persistence, personalization, or profiles.
- Cryptographic release-signing infrastructure.
- Graph database.
- Governance dashboard / digital twin UI.
- Product federation across repositories.
- Customer portal.
- Design-system rewrite.
- Large homepage redesign before independent evidence identifies a need.
- Fictitious product entries created only to make UI look complete.
- Fabricated human-study results.

---

## 4. Invariants

- **CANONICAL TRUTH ≠ OBSERVED EVIDENCE ≠ INFERENCE ≠ DIAGRAM.**
- Current-checkout path existence does not prove path existence at a cited historical revision.
- SHA-shaped text is not provenance.
- Same-surface context is not independent verification.
- `available` is not `reviewed`; `public` is not `verified`; `source-linked` is not `certified`.
- Build, Git, file-mtime, and deployment timestamps are not authored evidence-review dates.
- Zero public product entries is a truthful state, not a defect to hide.
- A public proof requirement must exist in machine-enforced truth, not only prose.
- Production facts are never fabricated to satisfy automation.
- Deployment evidence belongs only to the exact source revision it observed.
- Green source/browser assurance is not production deployment proof.
- Automated/browser E4 is not Human E4.

---

## 5. Dependency DAG and Change Budget

```text
T0 Live reconciliation
 |
 +--> T1 Current-work router
 |
 +--> T2 Git provenance verifier
 |     +--> T3 Product provenance + publishability
 |
 +--> T4 Promotion assurance model
 |     +--> T5 Deploy contract hardening
 |     +--> T7 Exact-main read-back evidence
 |
 +--> T6 Browser bootstrap fail-closed
 |
 +--> T8 Public-state / assurance vocabulary
 |     +--> T9 Bilingual a11y chrome
 |     +--> T10 Object-level deep links
 |
 +--> [PR #124 merged or equivalent?]
       +--> T11 Integrity evidence anti-cycle + semantic dates
       +--> T12 UX density + independent/Human E4 protocol
```

Parallel lanes:

- After T0, Lane A (T1-T3) and Lane B (T4/T6) may run independently.
- Maximum two active PRs.
- T11 must wait for PR #124 disposition because it overlaps integrity/evidence files.
- T12 may create protocol/templates early, but runtime UX changes require independent findings.

---

# Wave 0 — Reconcile and Repair the Agent Execution Surface

## Task 0.1 — Fresh Live-State Reconciliation

**Files:**

- Read current repo/provider state.
- Create in first implementation PR: `docs/evidence/YYYY-MM-DD-principal-convergence-live-reconciliation.md`.

**Read before changing code:**

- live `main`
- all open PRs/issues
- current ruleset and required checks
- current v3 spec/plan and any newer design/plan
- `AGENTS.md`
- `README.md`
- `docs/QA_STRATEGY.md`
- `architecture/sgps-model.json`
- `src/lib/truth.ts`
- `src/lib/products.ts`
- `src/lib/product-schema.ts`
- integrity modules actually present on live `main`
- exact-head Source Assurance and provider deployment evidence where available

- [ ] Record live `main` SHA.
- [ ] Mark every open PR as `MERGED`, `OPEN-GREEN`, `OPEN-RED`, `OPEN-PENDING`, or `SUPERSEDED`.
- [ ] Search for newer canonical specs/plans/ADRs.
- [ ] If PR #124 merged, adopt its actual interfaces rather than candidate snippets in this document.
- [ ] If PR #125 merged, reconcile its design with this plan and avoid duplicate contracts.
- [ ] Record exact required checks and no-bypass status.
- [ ] Record whether exact-main deployment identity is observable.
- [ ] Record Human E4 as OPEN unless a real-participant artifact exists.

**Stop conditions:**

- Main changed in a way that removes/invalidates a P1 finding.
- A newer canonical plan explicitly supersedes this plan.
- A live overlapping PR cannot be safely reconciled.

**DoD:** The first implementation PR contains a fresh, explicit execution baseline.

---

## Task 1 — Canonical Current-Work Router

**Finding:** F1.

**Files:**

- Create: `docs/current-work.json`
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `docs/QA_STRATEGY.md`
- Create: `tests/architecture/current-work-contract.test.mjs`

**Interface:**

```ts
type CurrentWork = {
  schemaVersion: "sgps.current-work/v1";
  canonicalSpec: string;
  canonicalPlan: string;
  architectureDecision: string;
  architectureModel: string;
  latestAssuranceEvidence: string;
  humanE4Status: "OPEN" | "PASS";
};
```

`docs/current-work.json` is a routing index only. It cannot become architecture, product, or evidence truth.

- [ ] **RED:** write the contract test before the file exists.
- [ ] Require every referenced path to exist.
- [ ] Require AGENTS/README/QA current-work references to agree with the index.
- [ ] Reject a closed historical implementation plan being described as current active work.
- [ ] Reject `humanE4Status: PASS` unless the referenced evidence meets the real-participant contract.
- [ ] Add the minimum JSON index and update bootstrap prose.
- [ ] Preserve historical documents rather than rewriting history.
- [ ] Run `node --test tests/architecture/current-work-contract.test.mjs`.
- [ ] Run `pnpm test:architecture && pnpm format:check`.

**Negative tests:**

- Missing canonical plan.
- Nonexistent path.
- AGENTS/index disagreement.
- Human E4 PASS without qualifying evidence.

**Rollback:** Revert this PR; no runtime behavior changes.

**DoD:** A fresh coding agent resolves current work from one tested routing point.

---

# Wave 1 — Provenance and Publishability Integrity

## Task 2 — Git-Object Provenance Verifier

**Finding:** F2.

**Files:**

- Create: `scripts/verify-git-evidence.mjs`
- Create: `tests/architecture/git-evidence.test.mjs`
- Modify: `package.json`
- Modify: `tests/architecture/sgps-architecture-model.test.mjs`
- Modify CI checkout depth/fetch strategy only if required by the verified historical revisions.

**Interfaces:**

```js
export function assertCommitExists(revision) {}
export function assertPathExistsAtRevision(revision, path) {}
```

Use local Git objects:

```bash
git cat-file -e <revision>^{commit}
git cat-file -e <revision>:<path>
```

Never interpolate revision/path into a shell string. Use `execFileSync("git", args)` after validation.

- [ ] **RED:** fake 40-hex revision must fail even though it matches the old regex shape.
- [ ] **RED:** real commit + path that did not exist at that commit must fail.
- [ ] **RED:** blob SHA used where commit is required must fail.
- [ ] Implement commit resolution.
- [ ] Implement path-at-revision resolution.
- [ ] Validate every local `sourceEvidence` record in `architecture/sgps-model.json`.
- [ ] Do not rewrite historical evidence revisions to current HEAD merely to get green.
- [ ] Determine the smallest Git fetch needed in Source Assurance for the cited revisions.
- [ ] Run focused tests and full architecture suite.

**Negative tests:**

- fake commit
- blob-as-commit
- missing historical path
- empty revision/path
- path traversal such as `../`
- known valid historical commit/path

**DoD:** “Immutable Git evidence” means Git resolves both commit and path at that commit.

---

## Task 3 — Product Provenance + Publishability Reconciliation

**Findings:** F2, F3.

**Files:**

- Modify: `src/lib/product-schema.ts`
- Modify: `src/components/product/ProofFirstEmptyState.astro`
- Modify: `src/data/site.ts`
- Modify: `tests/architecture/product-schema-behavior.test.mjs`
- Create: `tests/architecture/product-publication-contract.test.mjs`
- Modify: `tests/e2e/product-empty-state.spec.ts`
- Modify `src/lib/products.ts` only if a selector change is actually necessary.

**Selected smaller contract:** Do not force every public product to have a screenshot. A repository, documentation surface, live public destination, or local screenshot may be the correct evidence depending on the product. The public promise must describe exactly what the schema enforces.

```text
publishable public product =
  coherent lifecycle/availability/publicLabel
  + 2–3 bounded capabilities
  + valid production primary action
  + at least one real public proof destination/artifact
  + sourceRevision that resolves to a real commit when promoted
```

- [ ] **RED:** documentation-only proof fixture remains valid, while copy that claims screenshot+working-build are mandatory is rejected by the contract test.
- [ ] **RED:** public product with no proof fails schema.
- [ ] **RED:** incoherent lifecycle/publicLabel fails.
- [ ] Define one exported `PUBLIC_PRODUCT_PUBLICATION_REQUIREMENTS` helper/constant or equivalent single contract; do not create another registry.
- [ ] Make empty-state and featured copy describe that machine contract exactly.
- [ ] Replace blanket “verified public evidence” wording with bounded language unless a concrete verification predicate exists.
- [ ] Validate promoted product `sourceRevision` using Task 2 infrastructure.
- [ ] Exercise zero-product state and temporary positive product fixture.
- [ ] Verify EN/VI copy parity.

**Acceptance:**

- Machine schema and public publication promise cannot disagree.
- Zero-product state remains honest.
- Product provenance cannot be satisfied by SHA syntax alone.

**Rollback:** Atomic schema/copy revert. Re-check registry before implementation; the planning baseline had no product entries.

**DoD:** Publishability is one tested concept rather than prose plus unrelated schema rules.

---

# Wave 2 — Promotion, Deployment, and Source-Assurance Semantics

## Task 4 — Promotion Assurance State Model

**Findings:** F4, F11.

**Files:**

- Create: `scripts/lib/promotion-state.mjs` unless a real runtime consumer proves `src/lib/` is necessary.
- Create: `scripts/check-promotion-state.mjs`
- Create: `tests/architecture/promotion-state.test.mjs`
- Modify: `docs/QA_STRATEGY.md`
- Update `AGENTS.md` only through the current-work contract from Task 1.

**Interface:**

```ts
type AssuranceStage = "source" | "deployment" | "public-truth" | "human-e4";

type AssuranceResult = "PASS" | "FAIL" | "BLOCKED" | "UNKNOWN";

type PromotionState = {
  candidateSha: string;
  source: AssuranceResult;
  deployment: AssuranceResult;
  publicTruth: AssuranceResult;
  humanE4: AssuranceResult;
};
```

Rules:

- Source PASS never implies deployment/public-truth/human PASS.
- Missing provider evidence is `UNKNOWN`, not PASS.
- Missing owner-supplied public facts are `BLOCKED`, not fabricated values.
- Human E4 remains OPEN/UNKNOWN without qualifying human evidence.

- [ ] **RED:** source PASS + absent deployment evidence cannot produce “production verified.”
- [ ] **RED:** missing owner production facts yield BLOCKED.
- [ ] Implement minimal state calculation and JSON/terminal output.
- [ ] Do not build a dashboard.
- [ ] Document authority for each stage.
- [ ] Add state-conflation regression tests.

**DoD:** Every future release/evidence record can say exactly which assurance class passed.

---

## Task 5 — Fail-Closed Production / Preview Deploy Contract

**Finding:** F4.

**Files:**

- Modify: `scripts/deploy-workers.mjs`
- Modify: `package.json`
- Create: `tests/architecture/deploy-contract.test.mjs`
- Modify: `README.md`
- Modify: `docs/QA_STRATEGY.md`

**Target interface:**

```text
pnpm deploy:workers:production
pnpm deploy:workers:preview   # only if provider configuration actually supports it
```

Production mode must execute:

```text
validate:public-truth → build → client budget → static links → wrangler deploy
```

- [ ] **RED:** current/manual deploy path that can reach `wrangler deploy` without public-truth validation must fail the new contract test.
- [ ] Add explicit production mode or separate commands.
- [ ] Require production truth before build/deploy.
- [ ] If current Wrangler configuration does not support a meaningful one-shot preview path, remove misleading preview documentation rather than inventing a route.
- [ ] Reject production identity using workers.dev, pages.dev, tonydemo, local, alternate path/query, or noncanonical origin.
- [ ] Keep Cloudflare secrets out of GitHub Actions.
- [ ] Test command order without performing a real deployment.

**Negative tests:**

- production with missing contact/security email facts
- production with preview URL
- failed truth gate prevents deploy
- failed build prevents deploy
- preview cannot label itself production

**Rollback:** Revert source scripts/docs; do not weaken truth gates as a rollback technique.

**DoD:** No supported operator fallback silently weakens production truth requirements.

---

## Task 6 — Browser Runtime Bootstrap Fails at Root Cause

**Finding:** F6.

**Files:**

- Modify: `.github/workflows/quality-gates.yml`
- Create: `tests/architecture/playwright-bootstrap.test.mjs`

**Target behavior:**

```bash
success=0
for attempt in 1 2 3; do
  if pnpm exec playwright install --with-deps chromium firefox webkit; then
    success=1
    break
  fi
  if [ "$attempt" -lt 3 ]; then sleep 20; fi
done
test "$success" -eq 1
```

- [ ] **RED:** contract test detects a retry loop without explicit terminal failure.
- [ ] Implement bounded retry with explicit final failure.
- [ ] Do not sleep after the final failed attempt.
- [ ] Reject `continue-on-error` for browser installation.
- [ ] Run focused architecture test.
- [ ] Use exact-head Browser Assurance as the real workflow proof.

**DoD:** Browser-install failures are reported at browser installation, not displaced into later browser tests.

---

## Task 7 — Exact-Main Deployment / Runtime Read-Back Contract

**Finding:** F11.

**Files:**

- Create: `scripts/validate-deployment-evidence.mjs`
- Create: `tests/architecture/deployment-evidence.test.mjs`
- Add a focused evidence schema/README under `docs/evidence/`.
- Modify: `scripts/smoke-production.mjs` only if it cannot safely report the observed deployment identity needed by the schema.

**Evidence record minimum:**

```json
{
  "sourceSha": "<40 hex>",
  "deploymentAuthority": "cloudflare-workers-builds",
  "deploymentObserved": true,
  "publicTruthGate": "PASS|BLOCKED|UNKNOWN",
  "smoke": "PASS|FAIL|NOT_RUN",
  "observedAt": "explicit observed timestamp",
  "evidenceRefs": ["provider-id-or-artifact-path"]
}
```

Provider IDs are internal evidence metadata, not customer-facing proof.

- [ ] **RED:** evidence for SHA A cannot certify SHA B.
- [ ] **RED:** old smoke evidence cannot certify a newer main SHA.
- [ ] Add validator only; do not create a second deploy pipeline.
- [ ] If provider tooling cannot expose exact source identity, record `UNKNOWN`; do not infer from timestamps.
- [ ] Run production smoke only after deployment is observed.
- [ ] During execution, record current exact-main read-back if provider access exists.

**DoD:** Stale runtime evidence cannot silently certify a newer source revision.

---

# Wave 3 — Semantic UX, Bilingual Accessibility, and Evidence Integrity

## Task 8 — Public-State Semantics + Assurance Vocabulary Guard

**Findings:** F7, F8.

**Files:**

- Create: `src/lib/public-state-semantics.ts`
- Create: `tests/architecture/public-state-semantics.test.mjs`
- Create: `tests/architecture/public-assurance-language.test.mjs`
- Modify public copy only where a confirmed finding requires it.

Do not build a mega-enum. Preserve domain-specific state models and make illegal implications explicit.

```ts
type PublicSemanticDomain =
  | "product-lifecycle"
  | "product-availability"
  | "product-label"
  | "trust-ledger"
  | "integrity";

type PublicStateMeaning = {
  domain: PublicSemanticDomain;
  value: string;
  mayRenderAsTruthState?:
    "source-linked" | "reviewed" | "changed" | "not-published" | "unavailable";
};
```

Forbidden implications:

- `availability: public` → `reviewed`
- `TrustState: available` → `verified`
- `publicLabel: Available` → security assurance
- `source-linked` → `certified`

- [ ] **RED:** encode forbidden mapping tests.
- [ ] Add a runtime/public-copy scanner for unqualified `verified`, `certified`, `guaranteed`, `audited`, `compliant`, and blanket `secure`.
- [ ] Scope the scanner to public/runtime copy, not historical evidence prose or test names.
- [ ] Require narrow explicit exceptions with a source-scoped reason.
- [ ] Replace vague assurance language found by the scanner with bounded evidence language.
- [ ] Run architecture and affected E2E tests.

**DoD:** Public wording and state mapping cannot silently upgrade evidence strength.

---

## Task 9 — Bilingual Accessibility Chrome Contract

**Finding:** F9.

**Files:**

- Modify: `src/data/site.ts` or create `src/data/a11y-labels.ts`.
- Modify: `src/layouts/BaseLayout.astro`.
- Modify: `src/components/layout/Header.astro`.
- Modify: `src/components/layout/Footer.astro`.
- Modify: `src/components/layout/LanguageSwitcher.astro`.
- Modify: `src/components/experience/CommandNavigator.astro` only if shared labels remain hard-coded.
- Modify: `tests/architecture/bilingual-shared-components.test.mjs`.
- Create: `tests/e2e/bilingual-accessibility-chrome.spec.ts`.

Required localized chrome:

- skip-to-main
- primary navigation
- mobile navigation
- footer navigation
- language navigation
- search/dialog labels shared across locales
- meaningful figure labels

- [ ] **RED:** `/vi/` must not expose English-only landmark names when a localized equivalent is required.
- [ ] Centralize AT-facing labels.
- [ ] Keep proper nouns and language names stable when intentional.
- [ ] Run axe on EN and VI.
- [ ] Verify keyboard landmarks and accessible names.

**DoD:** Bilingual parity covers accessibility semantics, not only visible text.

---

## Task 10 — True Object-Level Deep Links

**Finding:** F10.

**Files:**

- Modify: `src/lib/navigator.ts`
- Modify: `src/lib/atlas.ts`
- Reuse: `src/lib/product-routes.ts`
- Modify relevant architecture tests.
- Create: `tests/e2e/product-deep-links.spec.ts`

- [ ] **RED:** a product fixture in Navigator resolves to `/en/products/<slug>/` and `/vi/products/<slug>/`.
- [ ] **RED:** Atlas product node resolves to the same canonical profile route.
- [ ] Reuse `getProductProfilePath(lang, slug)`.
- [ ] Preserve collection-level “Products” navigation as collection-level.
- [ ] Add principle-level anchors only if current One House markup has canonical stable IDs; otherwise leave collection context unchanged.
- [ ] Reject bare `/products/` paths.
- [ ] Verify no-JS navigation.

**DoD:** Object-level navigation preserves object identity and locale.

---

## Task 11 — Integrity Lens Anti-Cycle + Semantic Review Dates

**Findings:** F5 candidate, F14 candidate.

**Activation gate:** Execute only if PR #124 or equivalent Integrity Lens/EvidenceDetails behavior is merged into live `main`. If it is closed or superseded, adapt to the final merged implementation rather than copying candidate code.

**Likely files:**

- Modify: `src/data/integrity.ts`
- Modify: `src/lib/integrity.ts`
- Modify: `src/components/integrity/IntegrityLens.astro`
- Modify: `src/components/integrity/EvidenceDetails.astro`
- Create: `tests/architecture/integrity-evidence-topology.test.mjs`
- Modify/create: `tests/e2e/integrity-lens.spec.ts`
- Modify/create: `tests/e2e/evidence-freshness.spec.ts`

**Interface:**

```ts
type EvidenceRelationship =
  "independent-source" | "same-surface-context" | "action-destination";
```

A surface labelled “Verify this page” must not have only `same-surface-context` evidence.

- [ ] **RED:** entry whose only evidence href equals its own canonical route fails verification semantics.
- [ ] **RED:** same-surface context is allowed but cannot be sole verification evidence.
- [ ] Add relationship semantics without duplicating route truth.
- [ ] If no independent source exists, either use bounded “Sources and boundaries” language or omit the verification Lens until evidence exists.
- [ ] Render authored review dates as `<time datetime="YYYY-MM-DD">`.
- [ ] Localize visible formatting without deriving review freshness from runtime date.
- [ ] Preserve no-JS `<details>` behavior.
- [ ] Verify 320px, 200% zoom, reduced motion, keyboard, EN/VI, and no-JS.

**DoD:** Trust UX cannot prove itself with itself, and authored review dates are semantically represented.

---

# Wave 4 — UX Convergence and Human Evidence

## Task 12 — Conceptual Density Guard + Independent UX / Human E4 Protocol

**Findings:** F12, F13.

**Files:**

- Create: `tests/architecture/experience-density.test.mjs`
- Create: `docs/evidence/templates/independent-ux-review.md`
- Create: `docs/evidence/templates/human-e4-study.md`
- Change runtime UX only after independent findings identify a defect.

Automated density checks are structural proxies only. They can guard against obvious dashboard creep but cannot prove comprehension.

Suggested structural guardrails:

- one primary CTA cluster per major region
- bounded simultaneous truth-state/status chrome
- valid heading hierarchy
- evidence disclosure follows an executive summary
- no persistent dashboard/sidebar shell
- no second decorative visualization without a distinct information job
- existing 320px, 200% zoom, reduced-motion, keyboard, and no-JS contracts remain intact

**Required UX sequence:**

```text
BASELINE
→ TARGET
→ IMPLEMENT
→ RENDER
→ INDEPENDENT CRITIQUE
→ REAL-USER AUDIT
→ RED TEAM UX
→ FIX
→ VERIFY
```

- [ ] Record baseline page inventory and concept sequence.
- [ ] Define user tasks from the authoritative experience contract.
- [ ] Render the exact candidate after UX changes.
- [ ] Reviewer must not be the implementer.
- [ ] Use real participants for Human E4.
- [ ] Record anonymized findings/defects, not fabricated scores.
- [ ] P0/P1 comprehension or credibility defects block Premium PASS.
- [ ] Re-run affected human tasks after P0/P1 fixes.
- [ ] If participants are unavailable, Human E4 remains OPEN.

Minimum human tasks:

1. Explain what BlueSkyz Labs does after first exposure.
2. Find public products and correctly interpret an empty registry if it is still empty.
3. Find privacy and security reporting information.
4. Explain the difference between a public statement, its source, and its boundary.
5. Identify anything that feels exaggerated, fake, unclear, or untrustworthy.
6. Complete equivalent core tasks on the participant’s EN or VI path.
7. State whether Atlas/Intent/Trust systems aid or hinder orientation.

**Governance conditional:** If a genuinely independent reviewer/CODEOWNER becomes available, propose a targeted critical-path approval rule. Do not invent a team or block all documentation changes behind ceremony with no reviewer.

**DoD:** Automated tests remain proxies; Premium UX closure requires independent critique plus real-user evidence.

---

## 6. Runtime Evidence Matrix

Every runtime PR must produce fresh exact-head evidence:

```bash
pnpm install --frozen-lockfile
pnpm audit --audit-level=moderate
pnpm test:architecture
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm check:client-budget
pnpm check:static-links
pnpm test:e2e
pnpm lighthouse
```

Additional evidence by wave:

- Provenance: fake SHA, wrong object type, and missing historical path negatives.
- Publishability: zero-registry plus positive/negative product fixtures.
- Promotion: blocked owner-fact state and command-order tests.
- Deployment evidence: exact source identity or explicit `UNKNOWN`.
- Semantic UX: EN/VI axe, keyboard, no-JS, reduced motion, 320px, and 200% zoom.
- Human E4: real-participant artifact only.

---

## 7. Recommended PR / Merge Order

1. **PR A — Agent truth router:** Task 1 only.
2. **PR B — Provenance + publishability:** Tasks 2-3.
3. **PR C1 — Promotion model + browser bootstrap:** Tasks 4 and 6.
4. **PR C2 — Deploy + exact-main evidence:** Tasks 5 and 7.
5. **PR D — Semantic UX correctness:** Tasks 8-10.
6. **PR E — Integrity evidence hardening:** Task 11 only after #124 disposition.
7. **PR F — UX density/human protocol:** Task 12; runtime changes only from independent findings.

Merge rules:

- A dependent PR does not merge before its prerequisite contract is on `main`.
- Required exact-head checks must be green.
- Provider/deploy changes require applicable provider evidence and post-merge read-back.
- Human E4 may remain OPEN for security/correctness work but blocks final Premium UX completion claims.
- Never merge on stale green evidence from an earlier head SHA.

---

## 8. Rollback

- **PR A:** revert docs/index; no runtime effect.
- **PR B:** revert provenance/schema/copy atomically. Re-check live product registry before implementation.
- **PR C1/C2:** revert source-controlled scripts/workflow through a protected revert PR. Do not weaken truth/security gates as a rollback.
- **PR D:** revert localized labels/deep-link helpers; no external data migration.
- **PR E:** keep Integrity Lens hardening isolated so it can be reverted without deleting underlying truth data.
- **PR F:** keep UX changes small and evidence-backed so individual comprehension regressions can be reverted.

Never use direct-to-main mutation as a normal rollback path.

---

## 9. Stop Conditions

Stop and escalate instead of improvising when:

- Live `main` or a newer canonical plan invalidates this plan’s interfaces.
- A cited provenance revision cannot be verified without destructive history rewriting.
- Provider tooling cannot prove which source SHA production serves; record `UNKNOWN` rather than infer.
- Owner-supplied production truth facts are missing.
- A public copy change requires a legal/compliance/security claim absent from authoritative evidence.
- PR #124 or a successor introduces a conflicting integrity evidence model.
- A proposed dependency only replaces functionality available via Node/Git/native browser APIs.
- A change requires weakening CSP, branch rules, dependency audit, a11y gates, or public-truth validation.
- Human reviewer/participants are unavailable; keep human gates OPEN.
- A proposed PR crosses more than two tightly coupled responsibilities; split it.

---

## 10. Definition of Done

The convergence program is complete only when:

- Agents resolve canonical current work without stale active-plan pointers.
- Every local architecture `sourceEvidence` commit/path pair is Git-object verified.
- Promoted product provenance is real, not SHA-shaped text.
- Product schema and public publication copy express the same rule.
- Source, deployment, public-truth, and human assurance remain distinct states.
- Supported production deploy paths cannot bypass `validate:public-truth`.
- Browser bootstrap failures stop at their root cause.
- Exact-main deployment/read-back evidence cannot reuse older-revision results.
- Public state vocabularies cannot silently upgrade evidence meaning.
- Assurance-sensitive public language is bounded.
- VI accessibility chrome is genuinely localized.
- Navigator/Atlas product items deep-link to canonical product profiles.
- Integrity Lens, if present, cannot use same-surface context as sole verification evidence.
- Authored review dates use semantic `<time>` and are never runtime-inferred.
- Existing performance/a11y/no-JS/EN-VI invariants remain green.
- Human E4 is backed by a real study or explicitly remains OPEN.
- Every material recommendation preserves the trace:
  `FINDING → IDEA → PLAN TASK → TEST/EVIDENCE`.

---

## 11. Plan Red-Team Review Applied Before Handoff

### Dependency conflict

- PR #124 overlaps integrity/evidence files; Task 11 is gated on its disposition.
- PR #125 is not authoritative unless merged; Task 0.1 reconciles it if that changes.

### Hidden migration cost

- Product registry was empty at planning time, so publishability tightening currently has low content migration cost; execution must re-check this fact.
- Domain state vocabularies remain separate; no mega-enum migration is planned.

### Security regression

- No new remote service is required.
- Git validation uses argument-safe process execution.
- GitHub source assurance remains read-only and secretless.
- Production truth becomes stricter, not weaker.

### UX regression

- No major redesign is pre-authorized.
- Runtime UX changes require render plus independent critique.
- Human acceptance remains a separate evidence class.

### Verification gap

- If exact deployed SHA cannot be observed, status is `UNKNOWN`.
- Human evidence cannot be automated or simulated into PASS.

### Rollback weakness

- Concerns are split into bounded PRs with no planned external-state schema migration.
- Provider configuration is not silently mutated by source-only tasks.

### Excessive scope

- Governance Twin, federation, graph DB, release-signing platform, and dashboard UI are explicitly excluded.
- Maximum two active runtime PRs.

### Agent ambiguity

- Every task names files, interfaces, RED-first behavior, negative tests, acceptance/DoD, and stop conditions.
- Task 0.1 forces live reconciliation before code.

**Plan status:** `EXECUTION_READY` for technical NOW/NEXT work, with explicit external gates for Cloudflare provider proof, independent review, and Human E4.
