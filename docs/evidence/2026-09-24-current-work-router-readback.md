# Current-work router read-back — 2026-09-24

## Scope

This evidence records the live reconciliation used to update `docs/current-work.json`.
It is a read-back of repository and GitHub state, not a claim that the remaining
open PRs are merged or that owner-gated work is complete.

## Exact source

- Target base: `origin/main`
- Base observed at reconciliation: `ff53bd5`
- Repository: `BlueSkyz-Labs/SGPS-Marketing`
- Router change: `docs/current-work.json`

## Verified merged work

The following merge commits were read back from GitHub and confirmed reachable from
`origin/main` with `git merge-base --is-ancestor`:

| Work | Merge commit | Verification |
| --- | --- | --- |
| #234 development-dependency group | `8b067e4` | reachable from `origin/main` |
| #235 Prettier Astro plugin | `8aa3202` | reachable from `origin/main` |
| #256 gate-surface baseline | `2d2b84c` | reachable from `origin/main` |
| #257 convergence wave read-back | `82e6b5a` | reachable from `origin/main` |
| #253 legacy deployment decommission | `cef3f19` | reachable from `origin/main` |
| #258 provenance re-land (#248) | `f9c6165` | reachable from `origin/main`; dossier guard present in `src/lib/dossier.ts` |
| #229 Decision Atelier Task 3 | `32c6a7c` | reachable from `origin/main` |

The convergence evidence file from #257 is present at
`docs/evidence/2026-09-24-convergence-wave-readback.md`. This document is the
current router reconciliation evidence for the seven entries above because the
individual merge commits do not each have a separate evidence file.

## Remaining work and gates

Open PRs remain independently classified by their exact head and live checks.
In particular, #259, #260, #261, #262, #225, #228, and #230 are not represented
here as merged. Browser Assurance and repository protection remain promotion gates;
this read-back does not override them.

The five owner decisions in `docs/current-work.json` remain gated. No product fact,
customer evidence, screenshot, participant result, provider approval, or production
state is invented by this reconciliation.

## Reproduction commands

```text
git fetch origin
git rev-parse origin/main
git merge-base --is-ancestor <merge-commit> origin/main
git cat-file -e origin/main:docs/evidence/2026-09-24-convergence-wave-readback.md
```
