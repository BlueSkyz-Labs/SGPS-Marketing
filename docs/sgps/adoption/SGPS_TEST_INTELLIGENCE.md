# SGPS Test Intelligence (test-audit) — local disposition

**Canonical source:** `BlueSkyz-Labs/sgps-core@96781f6` (#226), `skills/test-audit/SKILL.md` v0.1.0, marked **Candidate**. sgps-core `AGENTS.md` read order 11a routes it for writing, changing, reviewing or pruning tests.
**Recorded at:** Marketing `main@6b07adc` (2026-10-18 GMT+7). **Tracking:** #290 (parent sgps-core #225).
**Disposition:** RECOMMENDED (the skill is a candidate, not a pinned standard). Lifecycle: MAPPED, not `ADOPTED`.
**SGPS pin:** unchanged.

## What applies here

- **AUTHOR mode** applies to every new or materially changed test. The four questions (contract, fault, owner, seam) are already the house practice: each guard ships with a negative proof that breaks the protected invariant (AGENTS rule 15). Recent examples are the wave 4 specs (`cx1-support-path`, `ux-u5-sotam`, `cx4-home-next-step`, the inline-link exemption in `accessibility.spec.ts`).
- **AUDIT mode** is used only for one coherent boundary at a time, with an R/F/C/D ledger. Nothing has been deleted on the strength of this skill.
- **CAMPAIGN mode** does not apply. No audit has shown material maintenance or false-confidence waste, so there is no subsystem sweep and no deletion quota.

## Existing lanes and keepers

| Lane       | Owner                                                                          | Gate                                             |
| ---------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| FAST       | `tests/architecture/` (node test, deterministic guards, protected path)        | Quality Gates                                    |
| CONFIDENCE | `tests/e2e/` Playwright × Chromium, Firefox, WebKit, mobile Chromium, with axe | Browser Assurance (4 shards)                     |
| CONFIDENCE | `tests/visual/` committed Linux baselines, `maxDiffPixelRatio` 0.001           | Visual regression gate                           |
| DEEP       | Lighthouse CI (3-run), performance budget, LH13 render-blocking guard          | Lighthouse CI                                    |
| RUNTIME    | `scripts/smoke-production.mjs` and manual read-backs                           | Not a required check; Human E4 is Owner-executed |

Always retained regardless of shape: public-truth and mailbox allowlist guards, CSP and headers, source-assurance and merge-policy guards, accessibility journeys, visual baselines.

## Red-team counterexample (#290 step 4)

There is no form that submits a payload: the only `<form>` elements are the dossier composer (client-only) and a `method="dialog"` close. A misleading product promise is guarded against real rendered pages, not a mocked validator: `v7-truth-content.spec.ts` and `cx1-support-path.spec.ts` read the built HTML and fail if the support row or the response-time promise drift.

## Remaining to reach ADOPTED

1. One AUDIT ledger for a single boundary (proposed: the `/support` and Contact journey), with keeper names and R/F/C/D per test.
2. The canonical skill leaves Candidate status in sgps-core, or the Owner accepts it as is.
