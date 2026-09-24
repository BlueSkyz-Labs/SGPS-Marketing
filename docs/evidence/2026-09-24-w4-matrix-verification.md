# C3-C W4 — full-matrix verification: CI evidence vs an invalid local run

**Recorded:** 2026-09-24 (Asia/Ho_Chi_Minh, SEAST) · **Wave:** C3-C W4 (polish + verification)
**Question this answers:** does the repo's own cross-browser/axe matrix actually pass on the current
`main`, and is a _local_ full-matrix run trustworthy evidence on this host?

## Authoritative evidence — CI, on the current main

Workflow `Source Assurance`, branch `main`, run **35976468617** @ **`668ed744`** (the tip of `main`):

| Job                 | Conclusion  |
| ------------------- | ----------- |
| `Quality Gates`     | **success** |
| `Browser Assurance` | **success** |

`Source Assurance` is the repo's gate for the deterministic source stages _and_ the E4
Playwright/axe matrix across Chromium, Firefox, WebKit/Safari-class and mobile Chromium, followed by
Lighthouse evidence (see `README.md`, `docs/QA_STRATEGY.md`). A green `Browser Assurance` on `668ed744`
therefore means the matrix passed **at the exact SHA now on main**, not on some older candidate.

Consecutive mains are green too (`9a0f4842`, `062fcbfb`, `687aa920`, `33b4ef76`), so the green result is
not a one-off.

## The local run, and why it is NOT evidence of regression

A local `pnpm test:e2e` (the full four-project matrix) finished with `status: failed` and
**1426** entries in `failedTests`. Taken at face value that reads like a mass accessibility failure.
It is not, and the reasoning matters more than the number:

- Every failure sampled carries a **timeout signature**, in one of two forms:
  `Test timeout of 30000ms exceeded` or `Tearing down "context" exceeded the test timeout of 30000ms`.
  A scan of the retained failure directories found 130 with the first form and the remainder — checked
  individually — carrying the **teardown** form; no assertion-level, axe-violation or contrast error
  was found in the newest failures.
- The failures cluster in the **slowest project (Firefox)** and span unrelated specs (accessibility,
  SEO, source-trace, text-zoom, safe-action, s-plus) — the signature of a starved host, not of a
  regression with a cause.
- `playwright.config.ts` runs `workers: process.env.CI ? 2 : "50%"`. Locally that is ~50% of this
  host's cores while **five** merge-queue lanes were concurrently running typecheck/vitest/build, plus
  a transient dip to ~367 MB free RAM on a 16 GB machine. CI runs the same matrix with **2** workers on
  a dedicated runner.
- The merge pipeline depended on the same host: the queue lanes died during that window, which is
  independent corroboration that the machine, not the product, was the limiting factor.

**Conclusion:** the local run is **discarded as evidence**; the CI run on `668ed744` is the evidence.
A local matrix run on this host is only meaningful when the merge queue is idle — running both is a
measurement error, not diligence.

## What would make a local run trustworthy

1. No merge-queue lanes running (or at most one).
2. `CI=true` (pins workers to 2) or an explicit `--workers=2`.
3. Free RAM above the documented spawn gate before starting.

## What this evidence does not claim

It does not substitute for real-user evidence: automated matrix green is preflight, and the E4-RED
human acceptance lane remains open and owner-gated. It also does not claim the legacy host is retired —
that is recorded separately after the owner's decommission directive.
