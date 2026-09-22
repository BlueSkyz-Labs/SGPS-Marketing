# C4-E — Decision Atelier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the existing deterministic Decision Room into a calmer, more useful enterprise Decision Atelier that organizes sourced public options by explicit visitor goals and constraints without ranking, scoring, profiling, or remote inference.

**Architecture:** Extend the existing `src/lib/decision-room.ts`, `src/components/experience/DecisionRoom.astro`, and `src/scripts/decision-room.ts` contracts. Add a pure atelier adapter for explicit goals/constraints; do not create a parallel decision engine. Public claims, trust ledger, products, architecture, and evidence remain authoritative.

**Tech Stack:** Astro 7, TypeScript 6, small vanilla client module, HTML/CSS, Node tests, Playwright, axe.

**Spec:** `docs/superpowers/specs/2026-09-16-c4-quiet-authority-digital-maison-design.md`

## Global Constraints

- Implements G7 only.
- The existing Decision Room remains the single decision-system authority; C4-E extends it.
- No “best”, “winner”, tier, score, grade, hidden weighting, probability, or personalized ranking.
- No storage, cookie, network transmission, visitor profiling, or free-text remote analysis.
- Visitor-selected goals/constraints change grouping/prominence only; underlying facts and route availability do not change.
- Unknown/unsupported constraints are explicit and fail closed.
- Comparison remains bounded by the existing `MAX_COMPARISON`/density contracts unless a separately approved measured change exists.

---

### Task 1: Inventory and freeze existing Decision Room invariants

**Files:**

- Read: `src/lib/decision-room.ts`
- Read: `src/components/experience/DecisionRoom.astro`
- Read: `src/scripts/decision-room.ts`
- Read: `tests/architecture/decision-room-contract.test.mjs`
- Read: `tests/e2e/decision-room.spec.ts`
- Create: `tests/architecture/c4-decision-atelier-contract.test.mjs`

**Interfaces:**

- Produces an explicit C4 extension contract without changing existing no-storage/no-network/no-grading invariants.

- [ ] **Step 1: write contract assertions**

Assert the Atelier imports/reuses Decision Room source models, no second item registry exists, no ranking vocabulary exists, and no network/storage primitive is introduced.

- [ ] **Step 2: prove RED before the extension exists**

```bash
node --test tests/architecture/c4-decision-atelier-contract.test.mjs
```

### Task 2: Define explicit goal/constraint model

**Files:**

- Create: `src/lib/decision-atelier.ts`
- Extend: `tests/architecture/c4-decision-atelier-contract.test.mjs`

**Interfaces:**

- Produces `arrangeDecisionItems(items, selection)` where selection contains allowlisted goal/constraint IDs.
- Output preserves source item identity and returns grouped/filtered relevance reasons, not scores or ordering-by-quality.

- [ ] **Step 1: write RED tests for allowed selection vocabulary**

Cover explore/evaluate/verify/architecture/work-with-BlueSkyz style intents plus bounded technical/trust/availability constraints derived from public truth. Reject arbitrary strings and injection-like values.

- [ ] **Step 2: implement deterministic arrangement**

Use explicit predicates and stable grouping. Do not calculate numeric relevance or hidden weights.

- [ ] **Step 3: write non-vacuity test against hidden ranking**

Synthetic attempts to add `score`, `rank`, `weight`, `winner`, or sort-by-quality fields must fail the architecture contract.

### Task 3: Build Atelier controls over existing Decision Room

**Files:**

- Modify: `src/components/experience/DecisionRoom.astro`
- Modify: `src/scripts/decision-room.ts`
- Modify: `src/styles/c4-quiet-authority.css`
- Extend: `tests/e2e/decision-room.spec.ts`
- Create: `tests/e2e/c4-decision-atelier.spec.ts`

**Interfaces:**

- Consumes explicit allowlisted goal/constraint options and `arrangeDecisionItems`.
- Produces visitor-controlled grouping with clear reset and source visibility.

- [ ] **Step 1: write keyboard/touch/reset tests**

Controls must be operable and named; reset restores baseline; state must not survive through hidden storage; URL state, if used, must be allowlisted and safe.

- [ ] **Step 2: implement progressive controls**

Baseline Decision Room remains usable without JS. Enhanced Atelier state is local and reversible.

- [ ] **Step 3: verify density ceiling**

Do not increase simultaneous chips/status UI beyond existing measured ceiling merely to expose more filters.

### Task 4: Add sourced “why this is shown” explanations

**Files:**

- Modify: `src/lib/decision-atelier.ts`
- Modify: `src/components/experience/DecisionRoom.astro`
- Extend architecture/E2E tests

**Interfaces:**

- Each grouped item may expose a deterministic reason tied to the visitor’s explicit selection and public item metadata.

- [ ] **Step 1: write truth-bound reason tests**

Reason text cannot imply product superiority, fitness, certification, or outcome not present in public truth.

- [ ] **Step 2: implement localized reason templates**

Templates explain the matching dimension only, e.g. that an item carries architecture/evidence relevant to the selected lens; they do not claim recommendation quality.

### Task 5: Integrate Dossier handoff

**Files:**

- Modify: Decision Room/Atelier UI only after C4-C exists
- Reuse: dossier selection interface
- Create/extend: `tests/e2e/c4-decision-to-dossier.spec.ts`

**Interfaces:**

- Produces explicit user-selected public IDs for dossier composition; does not auto-select hidden items.

- [ ] **Step 1: write user-agency tests**

Only explicitly checked items transfer to the dossier. No hidden default recommendation set.

- [ ] **Step 2: implement local handoff**

Use validated public IDs and ordinary links/URL state according to C4-C contract.

## Verification and exit criteria

C4-E exits when:

- there remains one Decision Room/Atelier authority;
- no score/rank/winner/hidden weighting exists;
- selection state is explicit, bounded, local, non-transmitting, and reversible;
- every displayed item/reason remains source-backed;
- comparison/density ceilings remain enforced;
- no-JS baseline, EN/VI, keyboard/touch, reduced motion, forced colors, 320/390, axe, Lighthouse and client budget pass; and
- exact-head plus production read-back evidence is green.
