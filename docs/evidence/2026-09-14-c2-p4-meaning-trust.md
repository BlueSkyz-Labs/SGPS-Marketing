# C2 P4 — Meaning + Trust progressive disclosure

Date: 2026-09-14
Wave: C2 P4 (plan Tasks 10–11, PR-E)
Status: IN_PROGRESS

## Scope

P4 is only complete when both approved tasks are objectively implemented and verified:

1. **Task 10 — One House editorial interlude**: pending at the start of this ledger. The live homepage still renders `OneHouseMatrix`, so the approved plain-language editorial treatment has not converged yet.
2. **Task 11 — compact Trust / Evidence Teaser**: agent-side implementation already merged through PR #167. Its focused evidence remains in `docs/evidence/2026-09-13-c2-p4-evidence-teaser.md`.

This aggregate ledger corrects the prior router state that marked the whole P4 wave `MERGED` after only Task 11 had landed.

## Current truth

- Evidence Teaser consumes canonical claim/evidence selectors, is fail-closed, uses native `details`/`summary`, works without JavaScript, and has no independent claim registry.
- One House still depends on `src/components/experience/OneHouseMatrix.astro` on the homepage and therefore still uses the framework/matrix presentation superseded by the approved C2 design.
- Public product registry remains empty. This P4 work must not create product facts or imply all products use AI/the same technology.

## Applicable SGPS alignment

- SGPS:Experience 1.4 is applicable to the public experience and remains the normative portfolio experience standard.
- Existing project guards for public truth, brand fidelity, accessibility, performance, change assurance and evidence remain mandatory.
- Candidate portfolio overlays such as Task Context Routing, Architecture Authority and Decision Architecture do not create website implementation scope for this wave without an explicit project adoption decision.

## P4 exit evidence required

Before this wave can move to `MERGED`:

- One House renders the four approved plain-language concepts with EN/VI parity: Clarity, Human agency, Purposeful intelligence, Trust by design.
- Homepage no longer renders the equal matrix treatment for One House.
- HTML remains complete without animation/JavaScript and copy does not universalize AI or a shared technology stack.
- Bilingual, mobile, zoom, architecture, source and browser assurance remain green on the exact PR head.
- Exact-head `Quality Gates` and `Browser Assurance` are both successful before merge.

## Owner/external boundaries

This wave does not resolve the product screenshot/publication floor, Human E4, legal/trademark review or RUM-provider decision.