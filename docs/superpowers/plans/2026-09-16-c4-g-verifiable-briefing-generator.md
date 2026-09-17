# C4-G — Verifiable Briefing Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate boardroom-ready executive briefings from approved BlueSkyz public truth with deterministic source/boundary/freshness handling, while keeping any optional model synthesis citation-bound, privacy-safe, fail-closed, and separately gated.

**Architecture:** Phase 1 is a deterministic briefing compiler/template over canonical public product, claim, evidence, architecture, release, and dossier/provenance adapters. Phase 2 may add model-assisted wording only if C3-E-equivalent provider/runtime/privacy/security decisions are approved; the model never becomes an authority source and cannot add unsupported facts.

**Tech Stack:** Phase 1 Astro 7 + TypeScript 6 + static/public selectors. Phase 2 runtime/model/provider intentionally undecided and gated. Node tests, Playwright, axe, security/adversarial tests.

**Spec:** `docs/superpowers/specs/2026-09-16-c4-quiet-authority-digital-maison-design.md`

## Global Constraints

- Implements G10 only.
- Deterministic template generation is the required baseline and must remain functional if model runtime is absent/down/disabled.
- ADR number `0010` is reserved by this approved C4 plan; execution must refresh `docs/decisions/` first and resolve any numbering conflict through repository authority rather than overwriting an unrelated decision.
- Remote/model synthesis inherits or strengthens C3 Verifiable Concierge controls: allowed public corpus, source citation, explicit unknown/refusal, prompt-injection defenses, output validation, privacy/log retention, rate limits, abuse controls, outage fallback, cost ceiling.
- No visitor text is repurposed for profiling/marketing by default.
- No unsupported pricing, certification, availability, customer outcome, security state, architecture fact, or release claim may be added by generated prose.
- Every substantive briefing statement must remain traceable to source references or be clearly labeled as non-factual framing derived from user selection.
- No model HTML/script is executed; rendered output is escaped/structured through safe components.

---

### Task 1: Define deterministic briefing compiler

**Files:**

- Create: `src/lib/briefing.ts`
- Reuse when available: `src/lib/dossier.ts`, `src/lib/provenance-lens.ts`, public architecture/release/product selectors
- Create: `tests/architecture/c4-briefing-contract.test.mjs`

**Interfaces:**

- Produces `compilePublicBriefing(input, lang)` from allowlisted public IDs plus a bounded briefing purpose such as `executive`, `technical`, `trust`, or `release`.
- Returns structured sections with source refs, boundaries, authored freshness where available, and unknown/missing items.

- [ ] **Step 1: write RED compiler tests**

Cover valid source combinations, unknown/private IDs, empty selection, invalid purpose, duplicate refs, missing freshness, and injection-like IDs.

- [ ] **Step 2: prove RED**

```bash
node --test tests/architecture/c4-briefing-contract.test.mjs
```

- [ ] **Step 3: implement pure deterministic compiler**

No network, model, storage, random values, generated dates, or free-text factual additions.

- [ ] **Step 4: prove source lineage**

Assert each factual section includes the exact public provenance/source identities returned by canonical adapters.

### Task 2: Build deterministic Briefing UI and print/export view

**Files:**

- Create: `src/components/briefing/BriefingComposer.astro`
- Create: `src/components/briefing/BriefingDocument.astro`
- Create: `src/scripts/briefing-composer.ts` only if local interaction is required
- Add localized routes according to the live route pattern
- Modify: `src/styles/c4-quiet-authority.css`
- Create: `tests/e2e/c4-briefing.spec.ts`

**Interfaces:**

- Consumes deterministic compiler output.
- Produces readable/printable briefing with sources, limitations, unknowns, and clear purpose label.

- [ ] **Step 1: write local-state/no-network tests**

No storage/cookie/beacon/fetch/XHR/WebSocket for deterministic mode. Invalid URL state fails closed.

- [ ] **Step 2: implement static-first composer/document**

Source pages remain authoritative; interaction only selects public IDs/purpose.

- [ ] **Step 3: verify print, EN/VI, no-JS source access, keyboard/touch, 320/390**

### Task 3: Write Model-Assisted Briefing ADR before any remote synthesis

**Files:**

- Create: `docs/decisions/0010-c4-model-assisted-briefing.md`
- Create: `docs/security/2026-09-16-c4-briefing-threat-model.md`; record actual review timestamps/revisions inside the document
- Create: `docs/evidence/2026-09-16-c4-briefing-model-go-gate.md`; record exact approved/rejected revision and observed timestamp

**Interfaces:**

- Produces approved model/provider/runtime, allowed corpus, retrieval model, prompt policy, source freshness, output schema, citation enforcement, refusal semantics, logging/retention, rate limits, abuse controls, cost ceiling, outage fallback, and kill switch.

- [ ] **Step 1: reuse C3-E decisions where applicable**

Do not create a second model/provider governance regime if C3-E already has approved contracts. Record inheritance and any C4-specific delta in ADR 0010.

- [ ] **Step 2: threat model prompt/source abuse**

Cover prompt injection, poisoned source content, citation spoofing, source omission, unsupported synthesis, malicious links, HTML/script output, jailbreaks, model/provider logging, data exfiltration, excessive input, rate-limit abuse, stale corpus, provider compromise/outage, and cost exhaustion.

- [ ] **Step 3: explicit GO/NO-GO**

No remote runtime code until ADR 0010 is approved.

### Task 4: Build model-output policy validator after GO

**Files:**

- Create provider-independent module such as `src/lib/briefing-output-policy.ts` or the server-runtime equivalent defined by ADR 0010
- Create: `tests/security/c4-briefing-output-policy.test.mjs` or the repository-conformant security-test path defined by ADR 0010

**Interfaces:**

- Consumes structured model response plus allowed source IDs.
- Produces accepted structured briefing sections or fail-closed rejection/fallback.

- [ ] **Step 1: write adversarial tests first**

Reject missing citations, unknown citations, unsupported facts, script/HTML payloads, unapproved URLs, false assurance/certification, fabricated dates, hidden instructions, and output that cannot map substantive claims to allowed sources.

- [ ] **Step 2: implement schema + citation validation**

Do not render raw model HTML. Validate structured fields and source IDs before presentation.

- [ ] **Step 3: deterministic fallback**

Any model/policy failure returns the Phase 1 deterministic briefing, not a partially trusted model answer.

### Task 5: Implement minimum-data model request after GO

**Files:**

- Runtime/provider adapter path defined by ADR 0010 before this task begins
- Provider adapter tests colocated with the approved runtime boundary

**Interfaces:**

- Sends only explicit user purpose/request plus minimum approved public source excerpts/IDs required for the request.

- [ ] **Step 1: test request minimization**

No cookies, identity/profile history, unrelated page behavior, private evidence, internal paths, or hidden analytics payload.

- [ ] **Step 2: implement provider boundary with timeout/rate/cost guards**

- [ ] **Step 3: verify logs/retention behavior matches ADR 0010**

### Task 6: Red-team source-bound synthesis

**Files:**

- Create: `docs/evidence/2026-09-16-c4-briefing-red-team.md`; record actual execution timestamp and exact candidate revision
- Extend adversarial test suites

- [ ] **Step 1: attack with conflicting/malicious corpus text**

Source content attempting to instruct the model must remain data, not executable authority.

- [ ] **Step 2: attack citation and hallucination paths**

Ask for unsupported pricing/certification/customer/security claims; expected output is explicit unknown/refusal or deterministic source-only content.

- [ ] **Step 3: test provider outage and kill switch**

Deterministic generator remains available and public site stays healthy.

### Task 7: Promotion and production read-back

**Files:**

- Create: `docs/evidence/2026-09-16-c4-briefing-production-readback.md`; record exact deployed revision and observed timestamp

- [ ] **Step 1: require exact-head source/browser/security gates**

- [ ] **Step 2: verify production citations/unknown behavior with safe public probes**

- [ ] **Step 3: verify model runtime is absent from homepage critical path**

- [ ] **Step 4: verify disable/fallback path**

## Verification and exit criteria

C4-G deterministic baseline may converge independently when it is source-bound, static-first, non-transmitting, printable, accessible, bilingual, and exact-head green.

Model-assisted C4-G may be marked complete only when:

- ADR 0010/inherited C3-E controls and the threat model are approved;
- input corpus is public/allowlisted and minimum-data;
- output citations are enforced against real allowed source IDs;
- unsupported questions fail closed;
- adversarial prompt/source injection and unsafe rendering tests pass;
- privacy/log retention/rate/cost/outage controls are operational;
- deterministic fallback and kill switch work; and
- exact deployed revision passes production read-back without placing model runtime on the default critical path.
