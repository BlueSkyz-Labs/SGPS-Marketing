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

## AUDIT ledger — `/support` and Contact boundary (baseline `main@6b07adc`)

Production owner: `src/pages/{en,vi,zh,zh-hant}/support.astro` and the Contact pages, fed by `SITE.supportEmail` (`src/data/site.ts` → `src/lib/public-mailbox.ts`). Baseline status: all listed tests green on CI runs `39108039423` and `39105626506`.

| Test                                                                                                    | Fault it catches (independent oracle)                                                       | Layer       | Disposition                                                                                           |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| `cx1-support-path` "first CTA is the support mailbox, Security is secondary"                            | Primary action swapped, security-first order, a second primary (rendered DOM vs Owner A-02) | e2e         | R, keeper for primary order                                                                           |
| `cx1-support-path` "one mailbox, no response-time promise"                                              | Invented SLA copy, duplicate or wrong mailto                                                | e2e         | R, keeper for no-promise rule                                                                         |
| `cx1-support-path` "Contact destination is a real page"                                                 | Contact recourse becomes a dead end                                                         | e2e         | R                                                                                                     |
| `cx1-support-path` "Sổ Trọ guide button is Contact"                                                     | Product page re-promises "support"                                                          | e2e         | R (different page)                                                                                    |
| `cx1-support-path` negative proof                                                                       | The guard passes on security-first order                                                    | unit-in-e2e | R                                                                                                     |
| `ux-cx-review-fixes` F2 "links each destination once" + negative                                        | Any destination repeated (contact, security, mailbox)                                       | e2e         | R. Overlaps the mailto count above, but its oracle is broader (all hrefs unique), so no consolidation |
| `exp-s8-empty-states` Contact rows                                                                      | Support row on Contact becomes primary, or the role order flips                             | e2e         | R (different page)                                                                                    |
| `v7-truth-content` Verify support row + negative                                                        | `/verify` says "published" while `/support` has no mailto, or the reverse                   | e2e         | R (cross-page consistency)                                                                            |
| `tests/architecture/trust-surfaces.test.mjs` "support empty state offers contact and security recourse" | The no-mailbox fallback branch is deleted from the template                                 | source      | R, the only guard for the fallback branch                                                             |
| `public-organization-identity.test.mjs` allowlist cases                                                 | Admin or non-role address passes as a public mailbox                                        | unit        | R                                                                                                     |

Route-only suites (`trust-routes`, `ux-p2-7-action-tiers`, `s-plus-journey`, `mission-paths`) visit `/support` for reachability or styling. They are outside this boundary and untouched.

**Result:** 10 R, 0 F, 0 C, 0 D. No test retired.

**Gap (NOT VERIFIED):** the rendered fallback (no mailbox → Contact is primary) is never exercised end to end. The production build always sets `PUBLIC_SUPPORT_EMAIL`, so only the source-regex guard covers it. Closing this needs a second build without the variable, which is a test-harness change and is not made here.

## Remaining to reach ADOPTED

1. The canonical skill leaves Candidate status in sgps-core, or the Owner accepts it as is.
2. Optional: a fallback-build e2e lane for the gap above.
