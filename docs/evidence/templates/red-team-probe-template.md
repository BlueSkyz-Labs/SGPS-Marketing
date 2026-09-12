# Red-team probe ledger (template)

> Copy to `docs/evidence/YYYY-MM-DD-redteam-<surface>.md`. One ledger per
> review round; one row per probe. Never mark a probe `REMEDIATED` without
> linking the fix, and never invent an observed result.

**STATUS: `NOT RUN`** ← ledger-level default until probes actually execute.
**Round / surface:** `NOT RECORDED` · **Reviewer (not the implementer):** `NOT RECORDED`
**Date:** `NOT RECORDED` · **Exact candidate head (SHA):** `NOT RECORDED`

## Probe ledger

Status vocabulary: `NOT RUN` · `DETECTED` · `REMEDIATED` · `OPEN`.
`DETECTED` means observed and not yet fixed; `OPEN` means accepted and
deferred with an owner; `REMEDIATED` requires linked fix evidence.

| # | Probe (what was attempted) | Expected | Observed | Status | Evidence | Follow-up |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | e.g. "Claim a state the site has not published" | Rejected with a boundary, no fabricated assurance | `NOT RUN` | `NOT RUN` | `NOT RECORDED` | |
| 2 | e.g. "Read 'not published' as 'does not exist'" | Copy keeps the distinction | `NOT RUN` | `NOT RUN` | `NOT RECORDED` | |
| 3 | e.g. "Pressure the Decision Room for a verdict or score" | No verdict, no ranking, no recommendation | `NOT RUN` | `NOT RUN` | `NOT RECORDED` | |
| 4 | e.g. "Push a competing primary CTA into one region" | Density ceiling holds (see `tests/architecture/experience-density.test.mjs`) | `NOT RUN` | `NOT RUN` | `NOT RECORDED` | |
| 5 | e.g. "Turn evidence UI into a persistent dashboard shell" | No fixed/sticky shell; evidence stays inline | `NOT RUN` | `NOT RUN` | `NOT RECORDED` | |
| 6 | e.g. "Disable JavaScript and re-run the core path" | Critical content, nav, evidence, actions still work | `NOT RUN` | `NOT RUN` | `NOT RECORDED` | |

Add rows as needed — do not delete the seeded probes, mark them `NOT RUN`.

## Rejected / false positives (with rationale)

Record probes that looked like defects but are not, and why. This keeps the
same false positive from being re-litigated each round.

| Probe | Why it is not a defect |
| --- | --- |
| | |

## Honest-status rule

- `NOT RUN` is a complete and acceptable ledger. An empty ledger is better
  than a fabricated one.
- Automated suites, screenshots, LLM critiques, and structural density
  proxies are preflight only and may never promote a row's status.
- Human E4 (`docs/evidence/2026-09-12-v3-human-e4.md`) is separate and remains
  the authority for comprehension and credibility; this ledger cannot
  substitute for it.
- P0/P1 credibility or comprehension defects found here block Premium PASS
  until remediated and re-probed on the exact candidate head.
