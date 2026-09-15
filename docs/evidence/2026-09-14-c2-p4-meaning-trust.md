# C2 P4 — Meaning + Trust progressive disclosure

Date: 2026-09-14
Wave: C2 P4 (plan Tasks 10–11, PR-E)
Status: MERGED

## Scope

P4 completes with both approved tasks implemented and verified:

1. **Task 10 — One House editorial interlude**: Merged through PR #169 (`b38ea97`).
   - Reframed One House as an editorial interlude celebrating the four approved concepts (Clarity, Human agency, Purposeful intelligence, Trust by design) with strict EN/VI parity.
   - Removed equal principle matrix from the homepage.
   - Replaced by `data-one-house-editorial` and `data-one-house-concept` semantics.
   - Full Playwright E2E matrix and cross-browser suite verified green.

2. **Task 11 — Evidence Teaser**: Merged through PR #167 (`43240ea`).
   - Consumes canonical claim/evidence selectors without independent registry.
   - Fully accessible, fail-closed without JavaScript.

## Current truth

- Evidence Teaser consumes canonical claim/evidence selectors.
- It is fail-closed and works without JavaScript.
- It maintains no independent claim registry.
- One House renders as an editorial philosophy interlude on the homepage.
- The public product registry remains empty.
- P4 does not invent product claims or universalize AI usage.

## Applicable SGPS alignment

SGPS:Experience 1.4 remains applicable and normative for this public surface.

Existing public-truth, brand, accessibility, performance, change-assurance, and
evidence guards remain mandatory.

## Evidence summary

- PR #167: Commit `43240ea`
  - Quality Gates: PASS
  - Browser Assurance: PASS
  - Workers Builds: PASS
- PR #169: Commit `b38ea97`
  - Quality Gates: PASS
  - Browser Assurance: PASS
  - Workers Builds: PASS

## Owner/external boundaries

P4 does not resolve the product screenshot floor, Human E4, legal review, or
RUM-provider decision.
