# Experience Performance & Friction contract (SGPS-DEC-2026-025 / Experience 1.5)

**Project:** SGPS-Marketing, the public brand surface at `https://blueskyzlabs.com`
**Tracking:** issue #449 (P0, mandatory GAPS lane)
**Authority state:** `PREPARED / WAIT_CANONICAL_MERGE / NOT_ADOPTED`

- DEC-025 is Owner-approved LOCK (2026-10-03) in `sgps-core` PR #256, which is **not merged yet**.
- Per issue #449, this file is reversible local preparation. It is not adoption.
- When #256 merges, record its exact merged revision here.

**Baseline revision:** `main@5b4a335` plus the below-the-fold Atlas change in #450. No Lighthouse route is affected by that change.
**Status vocabulary:** PASS / FAIL / NOT VERIFIED / NOT APPLICABLE. Missing evidence is never PASS.
**Protected wiring:** the budget numbers below become blocking only when they are wired into the protected gate files (`lighthouserc.mobile.json`, `scripts/`). That needs the Owner `owner-approved` label (card E0b). This document alone does not gate anything.

## 1. Critical journeys (user jobs)

| ID  | User job                                          | Route(s) in the gate                                | Form factor                        |
| --- | ------------------------------------------------- | --------------------------------------------------- | ---------------------------------- |
| J1  | Understand what the studio is                     | `/en/`, `/vi/`                                      | mobile (gate) + desktop (evidence) |
| J2  | Find a product and its real status (Sổ Trọ first) | `/en/products/`, `/vi/products/sotro/`              | mobile (gate) + desktop (evidence) |
| J3  | Verify a public claim                             | `/en/verify/` (Verify layer, Atlas, evidence links) | mobile (evidence)                  |

Every journey above is reachable without JavaScript. The no-JS state is part of the C2 content and action contract.

## 2. Budgets (web adapter, DEC-025 §4.1)

**Lab environment:** Lighthouse 13.4.1 mobile emulation (default throttling), Chromium 141, production build, median of 3 runs per route. **Field:** NOT VERIFIED. No RUM provider is approved, and the site's no-tracking truth means none is added for this decision (DEC-025 §8; v10 O-10.3).

### 2.1 Timing budgets (mobile, lab median)

| Metric | Ceiling (blocking)                                      | Warning at 85 % | Current baseline (worst route)                        | Current gate | Gap                                                                                                 |
| ------ | ------------------------------------------------------- | --------------- | ----------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| LCP    | 2500 ms                                                 | 2125 ms         | 1968 ms local (`/vi/`); CI is about 300–400 ms slower | error 2500   | Add the 85 % warning                                                                                |
| CLS    | 0.05 (stricter local truth than the DEC default of 0.1) | 0.0425          | 0.000                                                 | error 0.05   | None                                                                                                |
| TBT    | 200 ms (DEC lab proxy)                                  | 170 ms          | 10 ms                                                 | **warn** 150 | **Make TBT blocking** (error ≤ 200; the existing 150 warning can stay as the stricter early signal) |

### 2.2 Deterministic resource budgets (per gate route, transfer bytes)

> **CI calibration (2026-10-03):** the first CI run of the gate (exact head `6646cc6`, Lighthouse job 111228203272) measured `/vi/products/sotro/` at **181,611 B images / 295,564 B total**. The local-lab figure below (21.4 KB images) did not reproduce CI's Chrome, which fetches the showcase phone captures just below the fold through its native lazy-load distance threshold; real Chrome users fetch them too. That route therefore carries a recorded `routeOverrides` entry in `performance-budget.json`: image 240 KB and total 390 KB, about 1.35× the CI value. Overrides may only change resource bytes for a named route, require a reason and an evidence reference, and are guarded with negative proofs. Timing and zero-count budgets are never relaxed per route. Follow-up (not a gate): serving the 288 px phone-capture variants below the fold would cut those bytes.
>
> **Re-calibration (2026-10-04, #472):** root cause found. Desktop captures shipped only 1920px masters with no `srcset`, so phones downloaded them. With 768w derivatives offered through `srcset`, CI (exact head `07fe766`, Lighthouse job 111290412367) measured **114,349 B images / 228,416 B total** (−37% images). The global caps are still exceeded (images 81,920 B; total by 3 KB), so the override stays but tightens to image 128 KiB and total 256 KiB (about 1.15× the CI value; was 240 / 390 KB). The remaining image bytes are the phone captures inside Chrome's lazy-load distance.

Lighthouse `resource-summary`, mobile, transfer bytes. Run of 2026-10-03 on the baseline above, 3 runs per route (resource bytes are identical across runs).

| Resource                  | `/en/`          | `/vi/`        | `/en/products/` | `/vi/products/sotro/` | Worst    | Proposed ceiling (blocking)           | Warning (85 %) |
| ------------------------- | --------------- | ------------- | --------------- | --------------------- | -------- | ------------------------------------- | -------------- |
| Document                  | 9.0 KB          | 9.5 KB        | 7.7 KB          | 12.3 KB               | 12.3 KB  | 20 KB                                 | 17 KB          |
| Script                    | 11.9 KB / 9 req | 11.9 KB / 9   | 11.2 KB / 8     | 11.2 KB / 8           | 11.9 KB  | 25 KB                                 | 21 KB          |
| Stylesheet                | 23.8 KB / 3     | 23.8 KB / 3   | 22.0 KB / 2     | 22.9 KB / 3           | 23.8 KB  | 35 KB                                 | 30 KB          |
| Font                      | 55.6 KB / 4     | 55.6 KB / 4   | 51.7 KB / 3     | 55.6 KB / 4           | 55.6 KB  | 70 KB                                 | 60 KB          |
| Image                     | 54.6 KB / 5     | 54.6 KB / 5   | 22.9 KB / 4     | 21.4 KB / 4           | 54.6 KB  | 80 KB                                 | 68 KB          |
| Third-party               | 0               | 0             | 0               | 0                     | 0        | **0** (any third-party request fails) | —              |
| Render-blocking resources | 0               | 0             | 0               | 0                     | 0        | **0**                                 | —              |
| Total                     | 164.3 KB / 25   | 164.8 KB / 25 | 124.8 KB / 21   | 132.7 KB / 23         | 164.8 KB | 220 KB                                | 187 KB         |

Timing medians in this run: LCP 1817 / 1968 / 1817 / 1961 ms, TBT 0 ms and CLS 0.000 on all four routes.

The rule for setting these ceilings is the measured worst route in the same environment plus headroom, rounded up. A ceiling is not a design target (DEC-025 §4.1). The client JS hard budget (`scripts/check-client-budget.mjs`, 120 000 bytes) stays. The resource budgets add document, stylesheet, font, image and third-party ceilings.

## 3. Friction and recovery budget (DEC-025 §5)

| Invariant                                 | Applicability                                                                                   | Evidence today                                                                                                                                                                                                    | State                                                                                                                                                                                                                                |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Acknowledgement (no dead action)          | APPLICABLE: theme toggle, language switcher, mobile menu, Verify layer tabs, disclosures, video | e2e covers theme (9 specs), menu (22), language (26), Verify layer (6), video (7), disclosures (38)                                                                                                               | GUARDED (lab, 4 engines)                                                                                                                                                                                                             |
| Duplicate irreversible side effect        | NOT APPLICABLE                                                                                  | The only `<form>` (`DossierComposer`) calls `preventDefault()` and never navigates or transmits (`src/scripts/dossier-composer.ts:153–157`). No `fetch`, XHR or `sendBeacon` exists in `src/scripts` or `src/lib` | NOT APPLICABLE (with evidence)                                                                                                                                                                                                       |
| Progress truth (no indefinite busy state) | APPLICABLE only to media                                                                        | The video uses native controls; no custom spinner exists                                                                                                                                                          | **GUARDED** (E0b): `friction-invariants.test.mjs` bans `aria-busy`, progressbar roles, spinners and spin keyframes in `src/`, with negative proof                                                                                    |
| Continuity (no loss of input or context)  | APPLICABLE: dossier selection, language choice                                                  | Dossier selection is written to the URL with replace semantics (Back leaves the page). A stored language choice wins (DEC-019, 26/26 tests)                                                                       | GUARDED                                                                                                                                                                                                                              |
| Recovery (back / cancel / undo)           | APPLICABLE: navigation, dialogs                                                                 | Static links; Boardroom close returns focus (`dossier-composer.ts:145`)                                                                                                                                           | **GUARDED** (E0b): the only modal dialog (CommandNavigator) has an Escape e2e (`s-plus-command.spec.ts`); `friction-invariants.test.mjs` fails any new dialog without one (negative proof)                                           |
| Partial or stale truth                    | APPLICABLE: product status, evidence dates                                                      | Availability line, localized review dates and the evidence-freshness guard (`evidence-freshness.test.mjs`)                                                                                                        | GUARDED                                                                                                                                                                                                                              |
| Step friction                             | APPLICABLE: J2, J3                                                                              | No baseline step count is recorded yet                                                                                                                                                                            | **GUARDED** (E0b): base counts J1 = 0, J2 = 1, J3 = 1 steps from the locale home (`friction-step-counts.spec.ts`, en + vi, 390 px); negative proof: removing the home Verify link fails J3                                           |
| Confirmation proportionality              | NOT APPLICABLE                                                                                  | No consequential actions on the site                                                                                                                                                                              | NOT APPLICABLE                                                                                                                                                                                                                       |
| Motion must not delay feedback            | APPLICABLE: cross-document view transition, view-rise, blur                                     | Reduced-motion opt-out (`global.css:583`); the reduced-motion state is contract-tested (C2)                                                                                                                       | **GUARDED** (E0b): the cross-document route transition is ≤ 400 ms (320 ms today), is CSS-only (no scripted `startViewTransition` call in `src/`), and is 0 ms under reduced motion (`friction-invariants.test.mjs`, negative proof) |
| Error actionability                       | APPLICABLE: 404, broken links                                                                   | Localized 404s with next actions; static-link checker; redirect asset-safety tests                                                                                                                                | GUARDED                                                                                                                                                                                                                              |
| Accessibility under load                  | APPLICABLE                                                                                      | axe 0 violations in 180 scans; keyboard walk; 44 px targets; reduced motion                                                                                                                                       | GUARDED (automated)                                                                                                                                                                                                                  |

## 4. Development loop (mandatory from adoption)

Every material user-visible PR states the following, from **completed** CI runs only (v9 §8.3):

- base and head revisions;
- the Lighthouse medians per gate route (LCP, CLS, TBT), base and head;
- the resource-budget delta;
- the friction invariants it touches.

The loop is BASELINE → PROFILE → ROOT CAUSE → OPTIMIZE → RE-MEASURE → REGRESSION TEST. Speculative optimization without a measured benefit is rejected in review.

## 5. Negative proofs required at E0b (DEC-025 §6)

1. **Performance/resource regression:** add a 300 KB unoptimized image above the fold on `/en/`, and show the resource budget and LCP fail.
2. **Budget weakening or route omission:** remove `/vi/products/sotro/` from the gate URL list, or raise a ceiling, and show that a guard test fails. The gate file is protected, so this also needs the Owner label.
3. **Friction regression:** make the theme toggle ignore the click (no state change), and show that the acknowledgement test fails.

Revert each one and show the gate returns green.

## 6. Go-live boundary

For the go-live of the public site, DEC-025 §7 makes this gate **non-compensatory** once #256 merges.

PASS needs all of the following:

- the budgets in §2 wired and green on the exact revision;
- every friction item in §3 either GUARDED or NOT APPLICABLE with evidence;
- the negative proofs captured;
- production (runtime-class) evidence from the v9 §3E smoke, including one production Lighthouse run per gate route.

Field CWV remains NOT VERIFIED with a stated reason: no approved privacy-qualified RUM. DEC-025 §8 forbids adding tracking only to satisfy the decision. The orchestrator treats this as an explicit residual within the lab and runtime evidence classes, not as a PASS, and asks the Owner to accept it as a bounded deviation, with scope, compensating control and a revisit trigger (first CrUX availability or an O-10.3 decision).

## 7. Rollback

All budgets and gates are config-only. To roll back, revert the E0b PR; no runtime code depends on them. A production regression follows the existing rollback runbook (`docs/operations/production-smoke-and-rollback.md`).
