# Experience v5 — verification round 4 (measured, 2026-09-30 GMT+7)

**Audited revision:** `main@37040b6` (after #347, #313, #339, #341 and #348 landed).
**Evidence class:** E1/E2 — local static build, headless Chromium, axe-core, Lighthouse. Firefox and WebKit were **not** run locally. Nothing here is Human E4, served-revision proof, anonymous-access proof or Owner acceptance.
**Verifier role:** `[cloud-verifier]`, distinct from the `[local-agent]` makers. No `src/` or `tests/` file is changed by this document's PR.

## Result

| Check                                                                                | Result                                                                                               |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| axe `color-contrast`, 6 routes × 4 theme modes (24 combinations) on `main@37040b6`   | **0 violations**. This closes the r3 gap: r3's 0 was measured on a merged local tree, not on `main`. |
| `theme-contrast-matrix.spec.ts` (#344) on `main` + #344, Chromium                    | 25 passed, 0 failed                                                                                  |
| `lhci autorun --config=./lighthouserc.mobile.json` (the CI command) on `main` + #344 | exit 0; error-level assertions pass; `seo` warnings only                                             |

Method is as in r3: Node 24.20.0, pnpm 11.25.0, `pnpm install --frozen-lockfile`, `pnpm build`; theme mode set through `localStorage["blueskyz-theme"]` and the OS colour scheme.

## Finding: the `/en/` mobile LCP margin is a measurement artefact (new: F-35 candidate)

r3 reported `/en/` mobile LCP at about 2489 ms against a 2500 ms `error` ceiling and left the cause of the roughly 425 ms gap to `/vi/` open. It is now established.

`lighthouserc.mobile.json` (from #344) requests `http://127.0.0.1:3000/`. That URL is the **language chooser page** (654 bytes and a module script) which redirects on the client to `/en/`. Lighthouse reports `finalUrl=/en/`, so the run reads as an `/en/` measurement.

| Requested URL                | LCP, 5 runs, mobile (ms)     | FCP median (ms) |
| ---------------------------- | ---------------------------- | --------------- |
| `/` (chooser, then redirect) | 2483, 2483, 2483, 2483, 2487 | 1883            |
| `/en/` directly              | 2106, 2127, 2135, 2145, 2259 | 1358            |

About 525 ms of FCP is the chooser plus the redirect. `/en/` itself is in line with `/vi/` (2104–2109 ms).

**Consequences.**

- The gate as configured passes `/` by about 17 ms against the ceiling on this machine. A slower CI runner can turn it red for a reason unrelated to the change under test. Options are recorded on #344: add `/en/` as a fifth URL and keep `/`; replace `/` with `/en/`; or accept flapping. None was applied.
- The 2500 ms ceiling must not be loosened.
- First-time visitors who land on `/` pay about 500 ms on simulated slow 4G. Whether to fix that (for example by an edge redirect) is a product decision, not made here.

## Pull requests at exact heads

| PR   | State                                                                                                                                                                                                                                                                                                                               |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #344 | Branch updated from `main` (clean merge). Needs the Owner's `owner-approved` label because it edits `.github/workflows/quality-gates.yml`. Auto-merge not enabled. Exact-head CI after the update is not yet read.                                                                                                                  |
| #338 | Branch updated from `main` (`32e7d8e`). One conflict in `OneHouseMatrix.astro`, resolved by keeping the card markup (theme tokens only; the #346 hover fix is subsumed). Architecture 724/724 and the local source gate pass. Owner decisions pending: halo glow, and mounting the principle matrix (F-30). Auto-merge not enabled. |
| #311 | Held. SGPS v3.7 discovery waits on the Owner's governance decision.                                                                                                                                                                                                                                                                 |

## Not in this lane's authority

- **SGPS_CONSOLE #35** waits on the Owner clearing "Require approval of the most recent reviewable push". Repository administration is outside this session's GitHub scope.
- **Rulesets for the nine portfolio repositories** (`sgps_repo_bootstrap.py` `protect`, then `enforce --checks-app-id 5123606`) need the Owner's admin `gh` login.

## NOT VERIFIED

Production and anonymous access; Firefox and WebKit locally; real-user comprehension; native VI/ZH review; exact-head CI for #344 and #338 after their updates; the runner's LCP spread on GitHub Actions; whether the F-34 cue satisfies WCAG 1.4.11 (measured in r3, conformance not decided).
