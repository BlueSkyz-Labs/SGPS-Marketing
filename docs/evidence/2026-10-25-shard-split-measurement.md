# Shard split measurement (W2, DEC-034 R5) — 2026-10-25

Plan: `docs/superpowers/plans/2026-10-21-next-waves.md` W2. Change under test:
#659 (239ad24, merged 2026-10-21 03:12 UTC) runs firefox and webkit as two
Playwright shards each. Rule: keep the split only if the critical path drops.

## Method

- Source: GitHub Actions `Source Assurance` runs created after 239ad24 was
  committed, up to run 40176670198 (2026-10-25 09:00 UTC). 290 completed runs:
  141 success, 80 failure, 69 cancelled.
- Timings use the 141 successful runs where all six browser shards succeeded.
- Wall time = first job start to last job completion in the run.
- Per-browser time = the longest shard of that browser in the run; the
  critical shard is the slowest browser in the run.
- Medians over the 141 runs. Baseline: `.claude/OPERATING_RULES.md` O2 (last
  60 runs before the split).

## Result

| Metric                  | Baseline (before #659) | After #659 (n = 141)       |
| ----------------------- | ---------------------- | -------------------------- |
| CI wall time, median    | 39 min                 | 31.1 min (p90 33.0)        |
| Critical shard, median  | 33 min (webkit)        | 29.6 min (mobile-chromium) |
| webkit (slowest shard)  | 33 min                 | 22.1 min                   |
| firefox (slowest shard) | 26 min                 | 14.5 min                   |
| mobile-chromium         | 22 min                 | 29.6 min                   |
| chromium                | 17 min                 | 24.1 min                   |
| Cancelled runs          | 28% (17 of 60)         | 24% (69 of 290)            |

## Decision

KEEP the split: the critical path dropped from 33 to 29.6 min and median wall
time from 39 to 31.1 min. No revert PR is needed.

## Limits

- The baseline's exact wall-time definition is not recorded; the "after"
  numbers use the method above, so the wall-time comparison is approximate.
  The per-shard comparison is like for like.
- The suite grew between the two windows (unsharded chromium went from 17 to
  24 min and mobile-chromium from 22 to 29.6 min), so part of the shard gain
  is masked by new tests.
- mobile-chromium is now the critical path. Sharding it is a candidate next
  step; it changes `.github/` (protected) and needs the Owner label.
