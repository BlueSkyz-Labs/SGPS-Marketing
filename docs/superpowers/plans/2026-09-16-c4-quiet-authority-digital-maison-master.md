# C4 Quiet Authority / Digital Maison Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the owner-approved C4 Quiet Authority program as independently reversible, evidence-gated subsystems that elevate BlueSkyz from premium product site to a calm, verifiable digital maison without weakening C3, SGPS, accessibility, security, privacy, or performance controls.

**Architecture:** C4 extends C3 through derived presentation/decision views over canonical Product, Claim, Evidence, Architecture, and Release truth. Low-risk editorial craft ships first; authenticated/private and model-assisted capabilities remain separately gated. No C4 subsystem becomes a new source of business truth.

**Tech Stack:** Astro 7, TypeScript 6, Tailwind CSS 4, HTML/CSS/SVG, native View Transitions, small vanilla client modules only when justified, Node test runner, Playwright, axe, Lighthouse, Cloudflare Workers Builds. Remote model/auth/storage providers require later subsystem-specific decisions.

**Spec:** `docs/superpowers/specs/2026-09-16-c4-quiet-authority-digital-maison-design.md`

## Global Constraints

- C4 remains `PLANNED` until C3 reaches approved convergence and `docs/current-work.json` explicitly activates one C4 child wave.
- Preserve the repository authority chain and refresh live state before every execution session.
- Product/claim/evidence/architecture/release truth remains canonical and fail-closed.
- No new brand palette, decorative gold system, generic glassmorphism layer, AI-aurora visual language, scroll hijack, custom cursor, autoplay audio, or perpetual animation.
- Static/no-JS remains authoritative for public critical content and actions.
- Existing client-JS ceiling is not raised as first remediation.
- EN/VI parity, 320/390px, 200% zoom, text spacing, forced colors, keyboard/touch, reduced motion, axe, Lighthouse, and provider read-back remain mandatory.
- C4-F Private Evaluation and remote/model C4-G require explicit architecture/privacy/security GO decisions and threat models before runtime implementation.
- Each child wave ships through its own branch/PR and can be rolled back independently.
- No merge on red; exact-head evidence is mandatory.

---

## 1. Program decomposition

1. **C4-A Editorial Craft & Luxury Density** — S1–S10.
   - Plan: `docs/superpowers/plans/2026-09-16-c4-a-editorial-craft-luxury-density.md`
2. **C4-B Digital Maison & Collected Edition** — G1, G6, G9.
   - Plan: `docs/superpowers/plans/2026-09-16-c4-b-digital-maison-collected-edition.md`
3. **C4-C Executive Dossier & Boardroom Mode** — G2, G3.
   - Plan: `docs/superpowers/plans/2026-09-16-c4-c-executive-dossier-boardroom.md`
4. **C4-D Architecture Salon & Provenance Lens** — G4, G5.
   - Plan: `docs/superpowers/plans/2026-09-16-c4-d-architecture-salon-provenance.md`
5. **C4-E Decision Atelier** — G7.
   - Plan: `docs/superpowers/plans/2026-09-16-c4-e-decision-atelier.md`
6. **C4-F Private Evaluation Room** — G8, separately gated.
   - Plan: `docs/superpowers/plans/2026-09-16-c4-f-private-evaluation-room.md`
7. **C4-G Verifiable Briefing Generator** — G10, deterministic first; model synthesis separately gated.
   - Plan: `docs/superpowers/plans/2026-09-16-c4-g-verifiable-briefing-generator.md`

## 2. Program activation gate

### Task 1: Prove C3 convergence before activating C4

**Files:**
- Read: `AGENTS.md`
- Read: `docs/current-work.json`
- Read: C3 design/master/active child plans and latest evidence
- Read: newest applicable SGPS decisions
- Modify only when evidence is real: `docs/current-work.json`

**Interfaces:**
- Consumes: live repository/provider evidence and C3 convergence evidence.
- Produces: one explicit `IN_PROGRESS` C4 child wave or an explicit blocked/PLANNED state.

- [ ] **Step 1: refresh live repository and provider state**

```bash
git fetch origin --prune
git checkout main
git pull --ff-only origin main
git log -12 --oneline
```

Inspect open PRs/issues, checks, active wave, current owner decisions, production read-back, and newer ADR/spec/plan authority.

- [ ] **Step 2: verify C3 dependency closure**

Require the C3 capabilities used by the selected C4 child plan to exist on live `main` and have exact-head + post-merge evidence. C4-F and model-assisted C4-G may remain gated without blocking low-risk C4.

- [ ] **Step 3: prove baseline health**

Require latest production baseline source/browser/provider evidence green. Do not activate C4 from a red or ambiguous baseline.

- [ ] **Step 4: activate exactly one child wave**

Update `docs/current-work.json` only after Steps 1–3 are evidenced. Preserve at most one `IN_PROGRESS` wave.

- [ ] **Step 5: verify router contract**

```bash
pnpm test:architecture -- --test-name-pattern="router"
```

Expected: PASS; no owner decision auto-resolved.

## 3. SGPS Live Execution Ledger migration

### Task 2: Make agent handoff state explicit and machine-readable

**Files:**
- Modify: `docs/current-work.json`
- Modify or create: architecture test that owns current-work schema/router validation
- Create: `docs/superpowers/specs/<date>-live-execution-ledger-design.md` only if the live router contract requires a schema-level design decision at execution time

**Interfaces:**
- Produces optional execution metadata: `activeProgram`, `activeWave`, `activeTask`, `activePr`, `activeBranch`, `headSha`, `executionStatus`, `lastVerifiedState`, `nextAction`, `lastVerifiedAt`.
- Durable plan/spec authority remains separate from live execution truth.

- [ ] **Step 1: write failing router tests**

Tests must prove a stale task/PR reference is detectable, execution metadata cannot mark a merged/closed PR active, and missing values fail closed rather than being invented.

- [ ] **Step 2: prove RED on schema 1.0**

```bash
pnpm test:architecture -- --test-name-pattern="current-work|router"
```

- [ ] **Step 3: implement backwards-compatible schema evolution**

Do not remove existing authorities/waves/openOwnerDecisions semantics. Add execution metadata as a distinct block and update parsers/tests atomically.

- [ ] **Step 4: prove GREEN and handoff fidelity**

Simulate a fresh agent reading only `AGENTS.md`, `docs/current-work.json`, referenced plan/spec, and live PR/check state; it must identify the same next action as repository evidence.

## 4. Default execution sequence

After Task 1 activation gate and Task 2 governance hardening:

1. C4-A — editorial craft and scarcity contracts.
2. C4-D — architecture/provenance utility.
3. C4-B — maison IA, editions, craft stories.
4. C4-C — dossiers and presentation mode.
5. C4-E — Decision Atelier over existing Decision Room.
6. C4-G deterministic briefing baseline; remote model synthesis only after C3-E-equivalent GO.
7. C4-F only after dedicated security/privacy/identity approval.
8. Final cross-system convergence.

C4-F and remote/model C4-G are optional for lower-risk C4 convergence and must never force weaker security or privacy controls.

## 5. Cross-program boundary guard

### Task 3: Add C4 architecture guard before first runtime wave

**Files:**
- Create: `tests/architecture/c4-program-boundary.test.mjs`
- Read: canonical product/claim/evidence/architecture/release selectors
- Read: `architecture/sgps-model.json`
- Read: C4 runtime modules as they land

**Interfaces:**
- Produces: fail-closed guard against second truth registries, public/private boundary leaks, unapproved remote runtimes, and duplicate decision systems.

- [ ] **Step 1: write RED assertions**

Require:
- C4 product/briefing/dossier modules consume canonical public selectors;
- architecture views consume one public-safe architecture adapter;
- Decision Atelier extends existing Decision Room contracts;
- private evaluation code is not statically imported by public critical routes;
- model/provider/network primitives do not appear outside explicitly approved gated modules;
- no C4 source declares a second product/claim/evidence/release/architecture registry.

- [ ] **Step 2: prove RED when the first unguarded runtime module lands**

```bash
node --test tests/architecture/c4-program-boundary.test.mjs
```

- [ ] **Step 3: implement smallest boundary-compliant wiring**

Use adapters over existing canonical sources; do not copy truth into C4-specific content files.

- [ ] **Step 4: retain guard for all C4 waves**

Expected: guard stays green through later PRs.

## 6. Shared Quiet Authority measurement envelope

### Task 4: Establish measurable luxury-craft contracts

**Files:**
- Extend: `tests/architecture/experience-density.test.mjs`
- Create or extend targeted C4 architecture tests from C4-A
- Create: `docs/evidence/<date>-c4-quiet-authority-baseline.md` during activation

**Interfaces:**
- Produces: objective baseline for CTA density, status/chip density, focal media competition, client bytes, typography measures, motion scarcity, and key responsive routes.

- [ ] **Step 1: capture pre-C4 baseline**

Record 1440/390/320 screenshots for EN/VI home, representative product/trust/architecture routes; record client bytes and Lighthouse.

- [ ] **Step 2: define bounded metrics**

At minimum track: simultaneous primary/secondary CTAs, badge/chip/status objects, animated focal objects, card groups, heading hierarchy, long-form measure, and motion-active elements per scene.

- [ ] **Step 3: add negative tests**

Synthetic over-dense fixtures must fail. Do not encode subjective “luxury scores”.

## 7. Full verification envelope

Every C4 runtime PR runs targeted tests first, then full deterministic gates:

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

Affected public routes additionally require repository Browser Assurance: Chromium, Firefox, WebKit/Safari-class, mobile Chromium, axe, Lighthouse, reduced motion, forced colors, 320/390, 200% zoom, text spacing, EN/VI, and no-JS where relevant.

Every child PR records exact head SHA, changed surfaces, before/after client bytes, truth sources, privacy/security boundary, remaining blockers, rollback path, and post-merge provider read-back if runtime changed.

## 8. Red-team review matrix

Before each child wave promotion, explicitly review:

- Product truth and unsupported claims.
- Architecture boundary and duplicate-source risk.
- AppSec/XSS/link/script injection.
- Privacy/tracking/fingerprinting.
- Authorization and entitlement where applicable.
- Data exfiltration and internal-path leakage.
- Prompt/source injection where model-assisted.
- Reliability, outage, rollback, stale state, and recovery.
- Performance and client budget.
- Accessibility and assistive-tech semantics.
- Mobile/zoom/text spacing/forced colors.
- Quiet-luxury anti-patterns: clutter, effect-first design, fake scarcity, generic AI visuals, excessive badges/cards, novelty without utility.
- EN/VI semantic and optical parity.

## 9. Final C4 convergence

### Task 5: Run cross-system elite QA and production read-back

**Files:**
- Create: `docs/evidence/<date>-c4-final-red-team.md`
- Create: `docs/evidence/<date>-c4-production-readback.md`
- Modify: `docs/current-work.json` only after objective evidence

- [ ] **Step 1: refresh all child-wave evidence**

No stale or skipped checks count as green.

- [ ] **Step 2: run full repository gates and browser assurance at exact candidate head**

- [ ] **Step 3: perform public truth and privacy red team**

Verify no internal paths/private evidence/unpublished products/private evaluation metadata leak into public static output or machine-readable surfaces.

- [ ] **Step 4: perform visual/experience review**

Verify hierarchy, typography, density, material grammar, motion scarcity, gallery imagery, colophon, EN/VI, and mobile composition remain coherent across routes.

- [ ] **Step 5: promote through protected main only when all mandatory gates pass**

No bypass; use expected-head merge guard.

- [ ] **Step 6: post-merge production read-back**

Verify deployed revision, smoke paths, security headers, public manifests, representative routes, and no regression in product truth/evidence semantics.

- [ ] **Step 7: mark only objectively converged waves complete**

Private Evaluation/model capabilities may remain separately gated and recorded without blocking lower-risk C4 convergence.
