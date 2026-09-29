# Experience v5 — independent verification round 3 (measured, 2026-09-29, GMT+7)

**Audited revision:** `main@396f6c2` (after #342, #345 and #346 landed).
**Evidence class:** E1/E2 — local static build, headless Chromium, axe-core, Lighthouse. Firefox and WebKit were **not** run locally. Nothing here is Human E4, served-revision proof, anonymous-access proof or Owner acceptance.
**Verifier role:** distinct lane from the maker of each PR (`[cloud-verifier]` vs `[local-agent]`). No `src/` or `tests/` file is changed by this document's PR.

## Method

| Item     | Value                                                                                                                                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Runtime  | Node 24.20.0, pnpm 11.25.0, `pnpm install --frozen-lockfile`, `pnpm build`                                                                                                                                                                                                           |
| Contrast | `@axe-core/playwright` rule `color-contrast`, Chromium 1280×800. Routes: `/en/`, `/vi/`, `/zh/`, `/en/products/`, `/en/products/sotro/`, `/vi/products/sotam/`. Modes: OS dark, `data-theme=dark`, OS light, `data-theme=light` (24 combinations, `localStorage["blueskyz-theme"]`). |
| Control  | The same measurement on `main@298c39c` before #346: **58 violations**.                                                                                                                                                                                                               |
| Limits   | Simulated slow-4G Lighthouse numbers vary by machine; the measurement script was not committed.                                                                                                                                                                                      |

## Finding status

| ID         | State                        | Evidence                                                                                                                                                                                                                                                                                    |
| ---------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-21       | **Resolved** (#342)          | Switcher text 12.02–18.93:1 in all four modes; accessible name contains the visible code.                                                                                                                                                                                                   |
| F-23       | **Resolved** (#342)          | 0 targets under 44 px at 390 px on `/zh/`, `/zh/products/sotro/`, `/vi/`, `/en/`; overflow 0.                                                                                                                                                                                               |
| F-27       | **Resolved** (#346)          | Flagship CTA: 3.67:1 → 0 violations on `/en/`, `/vi/`, `/zh/` in all four modes. Fill is `#2564ff` and hover is `#1d4ed8`, both kit v4 values.                                                                                                                                              |
| F-28       | **Resolved** (#346)          | Trust-ledger chips: 3.39:1 → 0 violations.                                                                                                                                                                                                                                                  |
| F-33       | **Resolved** (#346)          | Pressed `.intent-chip` on `/en/products/`: 3.39:1 → 0 violations.                                                                                                                                                                                                                           |
| F-29       | Fix verified, **not merged** | #347 at `0391284`: 0 violations on `/en/products/sotro/` and `/vi/products/sotam/` in all four modes (control 3.3–3.69:1 dark, 3.78:1 light). Conflicts with `main` in `global.css`.                                                                                                        |
| F-22       | Open                         | #341 (`1bb424c`) is green but its base `2595d76` is stale; not re-verified this round.                                                                                                                                                                                                      |
| F-25       | Open                         | Mobile homepage height 6 413 px (en), 6 707 px (vi), 5 660 px (zh); target ≤ 5 500 px.                                                                                                                                                                                                      |
| F-30, F-31 | Open, not re-measured        | Unchanged since round 2.                                                                                                                                                                                                                                                                    |
| F-34 (new) | Candidate, **not verified**  | In dark, the active language label measures 14.63:1 against 12.02:1 for the idle labels, and the active pill against the shell 1.22:1. The selected state may rest on text brightness alone. WCAG 1.4.11 (non-text contrast) was not evaluated; whether another cue exists was not checked. |

Total `color-contrast` violations: **58** (`main@298c39c`) → **32** (#346 head `416f8df`) → **26** (#347 head alone) → **0** (#346 + #347 combined, conflict resolved by keeping both sides).

## Open PRs at exact heads

| PR   | Head      | Result                                                                                                                                                                                                                                                                              |
| ---- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #346 | `416f8df` | Verified, then merged as `396f6c2` with the head SHA pinned.                                                                                                                                                                                                                        |
| #347 | `0391284` | Verified. Needs `main` merged in; `global.css` has three same-position hunks (`--action-fill` and `--action-primary-hover` from #346, `--badge-ink` from #347). Keep both sides. Combined tree: architecture 715/715, typecheck 0 errors, build and format clean.                   |
| #344 | `e43cfee` | Red `Browser Assurance` is real signal: its new `theme-contrast-matrix.spec.ts` fails on exactly F-27, F-28, F-33 and F-29. With #346 and #347 present it passes 25/25 on Chromium. It edits `.github/workflows/quality-gates.yml`, so it needs the Owner's `owner-approved` label. |
| #341 | `1bb424c` | Stale base; sync needed.                                                                                                                                                                                                                                                            |
| #339 | `fe90a41` | Not re-verified. It conflicted with `main` in round 2 (`FlagshipTheatre.astro`, three `[slug].astro` files, the parity fixture). #346 also touched `FlagshipTheatre.astro`, so the conflict was not re-checked.                                                                     |
| #338 | `119073d` | Not re-verified. The halo glow is an Owner design decision (F-30: the principle matrix is mounted by no page).                                                                                                                                                                      |

Recommended order: #346 (done) → #347 → #344 → #341 → #339 → #338.

## Lighthouse mobile (`lighthouserc.mobile.json`, #344 config, on the combined tree)

Passes locally: 12 reports, 4 routes × 3 runs. LHCI aggregates "optimistic" (best of three) by default.

| Route                 | Performance | Accessibility | LCP median | Worst LCP |
| --------------------- | ----------- | ------------- | ---------- | --------- |
| `/en/`                | 0.96        | 1.00          | 2489 ms    | 2636 ms   |
| `/vi/`                | 0.99        | 1.00          | 2064 ms    | 2091 ms   |
| `/en/products/`       | 0.99        | 0.98          | 2190 ms    | 2210 ms   |
| `/vi/products/sotro/` | 0.99        | 1.00          | 2189 ms    | 2193 ms   |

The assertion ceiling is 2500 ms (`error`). `/en/` is the risk: a mobile-only re-run of 5 runs on an idle machine gave 2126–2149 ms, so the spread between runs on one machine is about 350 ms. A slower CI runner can exceed the ceiling.

- **LCP element:** `<p class="hero-tagline">` (text), observed at about 156 ms unthrottled.
- **Font preload:** removing the JS-injected preload in `public/theme-init.js` left LCP unchanged (2112 vs 2134 and 2149 ms) and worsened FCP from about 1358 to 1809 ms. It must stay.
- **`/en/` vs `/vi/`:** the cause of the roughly 425 ms gap is **not established**.
- **Gate rule:** the 2500 ms ceiling must not be loosened. A red run on `/en/` is a real LCP finding (v5 W2.3, W4.2).
- **Pitfall:** `lhci collect` picks up the repository root `lighthouserc.json` (desktop preset) unless `--config` names the mobile file. A first attempt without it reported LCP 519 ms and was discarded.

## NOT VERIFIED

Production and anonymous access; Firefox and WebKit locally; real-user comprehension; native VI/ZH review; the exact-head CI result of #347 and #344 after they are updated; #341, #339 and #338 at current `main`; whether the F-34 candidate is a WCAG failure.
