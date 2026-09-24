# ADR 0011 — Model-assisted briefing synthesis stays off until it is explicitly approved

- **Status:** Proposed — **NO-GO (default deny)**
- **Date:** 2026-09-24
- **Scope:** C4-G phase 2 only. Phase 1 (deterministic briefing compiler) is unaffected.
- **Owner decision required:** yes — provider, runtime, logging/retention, abuse controls and cost ceiling.
- **Supersedes:** nothing. **Reserves the `0010` slot explanation:** see ADR 0010's numbering note.

## Context

C4-G Phase 1 ships a deterministic briefing compiler over canonical public truth: no
model, no network, no storage, no clock, no randomness. The approved plan allows an
optional phase 2 that would let a model phrase wording, but only if the architecture,
privacy and security questions are answered first.

The repository has never answered them for this project:

- The C3-E plan states plainly: _"Do not implement remote model calls until a dedicated
  ADR is approved"_ and _"No provider is selected by this plan."_
- No such ADR exists in `docs/decisions/` — the file list ends at ADR 0010 before this
  document — so the concierge's model phase never obtained a GO either.
- `docs/current-work.json` still carries the Concierge provider/privacy gate as an open
  owner decision.

Approval must therefore be an explicit owner act, not a side effect of shipping the
deterministic baseline.

## Decision

**Model-assisted briefing synthesis is NO-GO by default.** Until this ADR's status moves
to _Accepted_ with every field below filled in by the owner:

1. No remote model, provider SDK, inference endpoint or vendor API is called, bundled or
   reachable from any briefing surface.
2. The deterministic template remains the required baseline and must stay functional if a
   model runtime is absent, down or disabled — which is also what Phase 1 already proves.
3. Nothing about a visitor's selection is transmitted, retained or profiled.

### Fields the owner must fill before GO

| Field                                           | Current value               |
| ----------------------------------------------- | --------------------------- |
| Provider and model identity                     | undecided                   |
| Runtime and where it executes                   | undecided                   |
| Data sent / prompt corpus boundary              | undecided                   |
| Log retention and whether prompts are stored    | undecided                   |
| Abuse, rate limit and prompt-injection handling | undecided                   |
| Cost ceiling and who is notified on breach      | undecided                   |
| Outage behaviour                                | deterministic baseline only |

## Threat model — prompt and source abuse (phase 2, for the record)

- **Injected instruction in user text.** User text is untrusted input; it may never
  change which sources are cited or bypass the citation policy check.
- **Source poisoning.** Only the approved public corpus may be retrieved; a model may not
  introduce product, claim, evidence, architecture, release, pricing, certification,
  availability, customer-outcome or security-state facts.
- **Citation laundering.** Output must pass the existing citation/claim policy checks
  before rendering; unsupported content returns an explicit unknown/out-of-scope, never
  best-effort wording.
- **Retention creep.** Conversation text must not become profiling or marketing data by
  default.
- **Cost and availability.** The site must not depend on the model; failure degrades to
  the deterministic briefing.

## Consequences

- C4-G phase 1 ships and is verified without any model decision pending on it.
- Any future phase-2 implementation must first update this ADR's status and table, then
  proceed under the C4-G plan's remaining tasks.
- If this ADR is never accepted, the deterministic compiler is the finished product —
  that is a complete, valid outcome.

## Authority

- Plan: `docs/superpowers/plans/2026-09-16-c4-g-verifiable-briefing-generator.md`
  (Global Constraints: model runtime/provider intentionally undecided and gated).
- Plan: `docs/superpowers/plans/2026-09-13-c3-e-verifiable-concierge.md`
  (dedicated ADR required before remote model calls; no provider selected).
- Design: `docs/superpowers/specs/2026-09-13-c3-living-verifiable-product-experience-design.md`
- Evidence: `docs/evidence/2026-09-16-c4-briefing-model-go-gate.md`
