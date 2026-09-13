# C3-E — Verifiable Product Concierge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional source-bound product concierge that answers only from approved public BlueSkyz truth, cites its sources, fails closed when unsupported, and degrades to deterministic navigation/search when AI is unavailable.

**Architecture:** Treat the concierge as a separate application subsystem, not a homepage widget with direct model calls. A deterministic public corpus adapter feeds a retrieval boundary; model/runtime/provider remains behind a dedicated ADR. Output must pass citation/claim policy checks before rendering. The public site loads no concierge model/runtime on the initial critical path.

**Tech Stack:** Existing Astro site plus a separately approved server/runtime/model stack. No provider is selected by this plan. Repository test stack remains Node/Playwright; security and abuse tests are mandatory.

**Spec:** `docs/superpowers/specs/2026-09-13-c3-living-verifiable-product-experience-design.md`

## Global Constraints

- Implements G2 only.
- Do not implement remote model calls until a dedicated ADR is approved.
- Allowed corpus is public canonical product/claim/evidence/support/release/route truth only.
- Every substantive answer requires source references.
- Unsupported questions return explicit unknown/out-of-scope, not best-effort hallucination.
- User text is untrusted input.
- No conversation data is used for profiling/marketing by default.
- Concierge failure must not break product navigation or the rest of the site.

---

### Task 1: Write and approve the Concierge Architecture / Privacy / Security ADR

**Files:**
- Create: `docs/decisions/<next>-verifiable-product-concierge.md`
- Update: `docs/decisions/README.md`
- Update architecture model/views only if the approved runtime adds a new deployed component

**Interfaces:**
- Produces: explicit decisions for model/provider, runtime, retrieval, source freshness, prompt-injection controls, citations, logging/retention, privacy, rate limits, abuse controls, cost ceiling, outage fallback, and deployment ownership.

- [ ] **Step 1: inventory constraints and providers without committing code**

- [ ] **Step 2: document at least two viable architectures and trade-offs**

Examples may include provider-hosted inference with server-side retrieval versus an approved edge/server runtime. Do not pick from convenience alone.

- [ ] **Step 3: require owner approval for privacy/provider/logging decisions**

If no decision exists, mark C3-E blocked and stop runtime implementation.

### Task 2: Build deterministic public concierge corpus adapter

**Files:**
- Create: `src/lib/concierge-corpus.ts`
- Create: `tests/architecture/c3-concierge-corpus.test.mjs`

**Interfaces:**
- Consumes: canonical public product, claim/evidence, support/security/privacy, release and route selectors.
- Produces: bounded public corpus records `{id, kind, title, text, publicUrl, freshness?, sourceIds[]}`.

- [ ] **Step 1: write negative leakage tests first**

Reject unpublished products, internal repo paths, workflow names, private evidence, secrets, and unsupported public claims.

- [ ] **Step 2: prove RED, implement serializer, prove GREEN**

- [ ] **Step 3: verify deterministic stable ids and ordering**

### Task 3: Define retrieval and citation policy

**Files:**
- Create: `src/lib/concierge-policy.ts`
- Create: `tests/architecture/c3-concierge-policy.test.mjs`

**Interfaces:**
- Produces policy functions for corpus allowlist, minimum source support, answerable/out-of-scope classification, and citation requirements.

- [ ] **Step 1: write tests for supported, ambiguous, unknown, adversarial, and prompt-injection queries**

- [ ] **Step 2: implement fail-closed policy before any model integration**

- [ ] **Step 3: reject answer objects missing source ids or containing unapproved source ids**

### Task 4: Implement runtime adapter behind approved ADR

**Files:**
- Determined by approved ADR; keep provider code isolated from public presentation components
- Create provider contract tests and failure-path tests

**Interfaces:**
- Consumes: sanitized visitor question + bounded retrieved public corpus context.
- Produces structured answer `{answer, citations[], confidenceState}` where confidenceState is descriptive support state, not a quality score.

- [ ] **Step 1: write adapter contract test with fake local test implementation**

- [ ] **Step 2: implement provider-specific adapter only after ADR approval**

- [ ] **Step 3: enforce timeout, maximum input/output, rate limit and cost ceiling**

- [ ] **Step 4: sanitize output as text/structured data; never render provider HTML**

### Task 5: Build accessible concierge UI

**Files:**
- Create: `src/components/concierge/ProductConcierge.astro`
- Create minimal client module only if required
- Create: `tests/e2e/c3-concierge.spec.ts`

**Interfaces:**
- Consumes: concierge API/adapter; falls back to deterministic search/navigation.
- Produces: accessible question input, source-linked answer, unknown/outage states.

- [ ] **Step 1: render deterministic fallback navigation/search in base HTML**

- [ ] **Step 2: progressively enable ask flow**

- [ ] **Step 3: make every answer citation inspectable**

- [ ] **Step 4: test keyboard, screen reader status, mobile, rate-limit, timeout, provider outage, and unknown answer**

### Task 6: Red-team prompt injection and data leakage

**Files:**
- Create dedicated security test fixtures/evidence ledger

- [ ] **Step 1: submit instructions requesting system prompt/private repository facts**

Expected: no disclosure; answer remains bounded to public corpus or refuses.

- [ ] **Step 2: submit hostile markup/script/URL input**

Expected: rendered as inert text or rejected.

- [ ] **Step 3: submit unsupported product/security/certification questions**

Expected: explicit unknown/out-of-scope plus relevant public navigation if available.

- [ ] **Step 4: verify logs/telemetry against approved retention/privacy policy**

- [ ] **Step 5: verify provider outage leaves site/product actions fully usable**

## Verification

In addition to full repository gates, require subsystem-specific security review, privacy decision evidence, rate-limit/abuse tests, source citation tests, and provider/runtime deployment read-back.

## Exit Criteria

C3-E ships only when the ADR is approved; public corpus is leak-safe; every substantive answer is source-bound/cited; unsupported questions fail closed; prompt injection/data leakage tests pass; privacy/logging/rate-limit/cost policies are enforced; and provider failure does not degrade the core site.
