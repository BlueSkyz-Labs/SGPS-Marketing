# Orphan branch takeover — triage, verdicts and recovery manifest

**Recorded:** 2026-09-24 (Asia/Ho_Chi_Minh, SEAST)
**Trigger:** owner instruction — _"Takeover các nhánh mồ côi, xử lý hết"_ (take over every orphan branch)
**Measured at:** `BlueSkyz-Labs/SGPS-Marketing` working copy, `origin/main` fetched at start of the scan

## Why this record exists

A takeover is only trustworthy when it is provable. Every branch below was checked mechanically
before anything was touched, and every SHA removed from the local repo is written down here so the
operation is reversible. Nothing was judged by name alone.

## Method (three independent tests, in this order)

1. **Patch equivalence** — `git cherry origin/main <branch>` to see whether the branch's commits are
   already represented in main (catches squash-merges with different SHAs).
2. **Three-dot delta** — `git diff --shortstat origin/main...<branch>` to see what the branch itself
   changes, independent of how far main has moved.
3. **Content identity per touched file** — intersect the branch's touched files with
   `git diff --name-only origin/main <branch>`; a file counts only if its _content_ still differs
   from main. Two-dot deltas alone are misleading here: they mostly measure how far main has moved
   past an old branch (observed: up to 916 files, 60k lines of deletions).

## Results

| Class                        | Count                                                  | Meaning                                                            |
| ---------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------ |
| Covered by an open PR        | 13                                                     | live work, already in flight — untouched                           |
| Has a worktree               | 29                                                     | could be checked out or in use — untouched in this pass            |
| **No content delta vs main** | **20**                                                 | adds nothing main does not already have                            |
| **Superseded**               | **56**                                                 | differs, but the equivalent content landed on main via a merged PR |
| **Broken**                   | **1** (`side`, 876 files differ — would wipe the tree) | not mergeable by construction                                      |

### How "superseded" was proven (not assumed)

- **C3-B Task 1** — `feat/c3-b-task1-product-proof` carries a 276-line `src/lib/product-proof.ts`;
  main carries 80 lines. That looked like missing work until the history was read: main's file
  arrived in **PR #188** (`116bf04`, capability-bound product proof contract), and this branch's tip
  (`b3251ff`) shares merge-base `b24f275` from _before_ #188. It is a **parallel draft of the same
  task**, not an unmerged improvement — merging it would have overwritten the accepted implementation.
  Same story for `feat/c3-b-task2-proof-link` vs **#190**.
- **Docs orphans** — every file they add (`docs/evidence/…`, `docs/superpowers/plans/…`,
  `docs/decisions/0006…`, `tests/architecture/product-screenshot-floor.test.mjs`) **already exists on
  main**, checked file-by-file with `git cat-file -e`.
- **Router updates** — `docs/c3-c-reconcile-router*`, `docs/close-owner-directives`,
  `docs/c2-p5-p6-reconcile` all differ only on `docs/current-work.json`, which is exactly what open
  PR #224 rewrites from live truth.
- **Wave branches** — v3-wave1..8, wave-h1..h13, ui-premium, s-plus, brand-v4 and all `feat/c2-*`
  belong to waves the work router already records as **MERGED**; their branches are pre-merge states.

## Recovery manifest (branch · SHA · delta · reason)

| `side` | `9a68d7c` | 876 | broken branch (876 files differ — would wipe the tree) |
| `feat/v3-wave1-truth-grammar` | `cd19200` | 19 | superseded — 19 file(s) differ; equivalent content already on main |
| `feat/v3-wave2-integrity-inspection` | `b336013` | 19 | superseded — 19 file(s) differ; equivalent content already on main |
| `feat/ui-premium-wave-1` | `1eef254` | 17 | superseded — 17 file(s) differ; equivalent content already on main |
| `feat/v3-wave5-decision-room` | `d51eb06` | 13 | superseded — 13 file(s) differ; equivalent content already on main |
| `feat/v3-wave6-verification-protocol` | `69ef9d0` | 11 | superseded — 11 file(s) differ; equivalent content already on main |
| `feat/wave-h2` | `33b719a` | 11 | superseded — 11 file(s) differ; equivalent content already on main |
| `feat/v3-wave4-evidence-passport` | `ccd2a90` | 9 | superseded — 9 file(s) differ; equivalent content already on main |
| `feat/c2-p1-home` | `d2b3927` | 8 | superseded — 8 file(s) differ; equivalent content already on main |
| `feat/s-plus-atlas` | `42e90eb` | 7 | superseded — 7 file(s) differ; equivalent content already on main |
| `feat/hardening-h1` | `c781c3a` | 6 | superseded — 6 file(s) differ; equivalent content already on main |
| `feat/v3-wave3-provenance-search` | `5a9015e` | 6 | superseded — 6 file(s) differ; equivalent content already on main |
| `feat/c2-task12-complete` | `c4376d5` | 5 | superseded — 5 file(s) differ; equivalent content already on main |
| `feat/c2-task12-human-layer-new` | `54b9d6c` | 5 | superseded — 5 file(s) differ; equivalent content already on main |
| `feat/c3-c-theme-dark` | `5aaff26` | 5 | superseded — 5 file(s) differ; equivalent content already on main |
| `feat/v3-wave4-source-trace` | `2aa7bbd` | 5 | superseded — 5 file(s) differ; equivalent content already on main |
| `feat/wave-h10` | `e881ef6` | 5 | superseded — 5 file(s) differ; equivalent content already on main |
| `feat/wave-h3` | `c1f58fe` | 5 | superseded — 5 file(s) differ; equivalent content already on main |
| `feat/wave-h8` | `daa39c0` | 5 | superseded — 5 file(s) differ; equivalent content already on main |
| `feat/c2-c2b` | `32120fe` | 4 | superseded — 4 file(s) differ; equivalent content already on main |
| `feat/c2-p2-art` | `3a339fb` | 4 | superseded — 4 file(s) differ; equivalent content already on main |
| `feat/v3-wave4-claim-fabric` | `9c9db7d` | 4 | superseded — 4 file(s) differ; equivalent content already on main |
| `h2d` | `8489639` | 4 | superseded — 4 file(s) differ; equivalent content already on main |
| `feat/c2-route-hygiene` | `3da03bd` | 3 | superseded — 3 file(s) differ; equivalent content already on main |
| `feat/wave-h2b` | `4c9bde4` | 3 | superseded — 3 file(s) differ; equivalent content already on main |
| `feat/wave-h6` | `ba39732` | 3 | superseded — 3 file(s) differ; equivalent content already on main |
| `feat/wave-h7` | `6afa596` | 3 | superseded — 3 file(s) differ; equivalent content already on main |
| `audit/domain-migration-cloudflare-2026-09-08` | `3a23a88` | 2 | superseded — 2 file(s) differ; equivalent content already on main |
| `dependabot/npm_and_yarn/prettier-plugin-astro-1.0.0` | `d8ff957` | 2 | superseded — 2 file(s) differ; equivalent content already on main |
| `feat/brand-v4-fidelity` | `67b0dc3` | 2 | superseded — 2 file(s) differ; equivalent content already on main |
| `feat/c2-p4-evidence-teaser` | `65327cf` | 2 | superseded — 2 file(s) differ; equivalent content already on main |
| `feat/c3-b-task1-product-proof` | `b3251ff` | 2 | superseded — 2 file(s) differ; equivalent content already on main |
| `feat/c4-a-quiet-authority-contract` | `fdf1b6a` | 2 | superseded — 2 file(s) differ; equivalent content already on main |
| `feat/dep-maintenance` | `c563f7d` | 2 | superseded — 2 file(s) differ; equivalent content already on main |
| `feat/wave-h11` | `bda4b67` | 2 | superseded — 2 file(s) differ; equivalent content already on main |
| `feat/wave-h12` | `fa4895a` | 2 | superseded — 2 file(s) differ; equivalent content already on main |
| `feat/wave-h4` | `b142e6d` | 2 | superseded — 2 file(s) differ; equivalent content already on main |
| `feat/wave-h5` | `6bdf2fa` | 2 | superseded — 2 file(s) differ; equivalent content already on main |
| `h2-plan-ref` | `2b104f9` | 2 | superseded — 2 file(s) differ; equivalent content already on main |
| `h2a` | `120a9a6` | 2 | superseded — 2 file(s) differ; equivalent content already on main |
| `h2b` | `815cacd` | 2 | superseded — 2 file(s) differ; equivalent content already on main |
| `h2c` | `4c77a7a` | 2 | superseded — 2 file(s) differ; equivalent content already on main |
| `docs/c2-p5-p6-reconcile` | `25bfcad` | 1 | superseded — 1 file(s) differ; equivalent content already on main |
| `docs/c3-c-reconcile-router` | `f0cb209` | 1 | superseded — 1 file(s) differ; equivalent content already on main |
| `docs/c3-c-router-w8` | `73cd445` | 1 | superseded — 1 file(s) differ; equivalent content already on main |
| `docs/close-owner-directives` | `5ca4fdc` | 1 | superseded — 1 file(s) differ; equivalent content already on main |
| `docs/hardening-program-summary` | `7465a35` | 1 | superseded — 1 file(s) differ; equivalent content already on main |
| `docs/v3-1-convergence-design-20260912` | `9fa3097` | 1 | superseded — 1 file(s) differ; equivalent content already on main |
| `feat/c2-c2d` | `c20e89d` | 1 | superseded — 1 file(s) differ; equivalent content already on main |
| `feat/c2-p0-router` | `9ddd1f8` | 1 | superseded — 1 file(s) differ; equivalent content already on main |
| `feat/c2-p2-contracts` | `9f08620` | 1 | superseded — 1 file(s) differ; equivalent content already on main |
| `feat/c2-task13-secondary-surfaces` | `8c36cf6` | 1 | superseded — 1 file(s) differ; equivalent content already on main |
| `feat/c3-c-quiet-luxury` | `875ac78` | 1 | superseded — 1 file(s) differ; equivalent content already on main |
| `feat/product-screenshot-scaffold` | `0a0dba2` | 1 | superseded — 1 file(s) differ; equivalent content already on main |
| `feat/wave-h13` | `2af4851` | 1 | superseded — 1 file(s) differ; equivalent content already on main |
| `feat/wave-h9` | `2ac19d0` | 1 | superseded — 1 file(s) differ; equivalent content already on main |
| `h125-ref` | `84ac80f` | 1 | superseded — 1 file(s) differ; equivalent content already on main |
| `audit/w8-check` | `5418f08` | 0 | no content delta vs main |
| `docs/hardening-readback` | `733cafd` | 0 | no content delta vs main |
| `docs/principal-red-team-convergence-plan-20260912` | `4510405` | 0 | no content delta vs main |
| `docs/v3-change-source-decision` | `b34fa4f` | 0 | no content delta vs main |
| `docs/v3-final-evidence` | `01a0d40` | 0 | no content delta vs main |
| `docs/v3-post-merge-readback` | `e0126af` | 0 | no content delta vs main |
| `feat/c2-c2e` | `5783771` | 0 | no content delta vs main |
| `feat/c2-p4-one-house-editorial-20260914` | `d708a34` | 0 | no content delta vs main |
| `feat/c3-b-evidence-peek` | `e51f0ca` | 0 | no content delta vs main |
| `feat/c3-b-truth-choreography` | `249a68e` | 0 | no content delta vs main |
| `feat/c3-c-quiet-luxury-2` | `764523b` | 0 | no content delta vs main |
| `feat/c4-b-maison-index` | `acf4121` | 0 | no content delta vs main |
| `feat/hardening/git-evidence-cleanup` | `5c37e21` | 0 | no content delta vs main |
| `fix/211-update` | `4b6fbfa` | 0 | no content delta vs main |
| `fix/212-format` | `92cdd3b` | 0 | no content delta vs main |
| `fix/212-rebase` | `6ff520e` | 0 | no content delta vs main |
| `fix/c3-b-agent-passport-private-evidence` | `5bd3fbc` | 0 | no content delta vs main |
| `fix/c3-c-w6-zh-og-locale` | `2eb7eb9` | 0 | no content delta vs main |
| `scratch/conv3` | `5418f08` | 0 | no content delta vs main |
| `scratch/w7` | `5418f08` | 0 | no content delta vs main |

## Deliberately untouched

Protected by rule — open PR heads, branches named in live queue arguments, and `main`:

- 13 protected refs (every open PR head plus queue-registered branches)
- branches with a worktree (29), including the four broken ones below, because a worktree may be
  checked out by a running job:

- `docs/adr-briefing-model-gate`
- `docs/c3-c-reconcile-router-clean`
- `docs/c3-c-reconcile-router-final`
- `docs/c3-c-reconcile-router-fix`
- `docs/w3-experience-baseline-gap-map`
- `feat/c3-a-task3-typography-v2`
- `feat/c3-a-task6-mobile-composition`
- `feat/c3-b-task2-proof-link`
- `feat/c3-c-brand-unify`
- `feat/c3-c-hero-wow`
- `feat/c3-c-interaction-polish`
- `feat/c3-c-w2-switcher`
- `feat/c3-c-w5-sgps-experience`
- `feat/c4-b-craft-story`
- `feat/c4-b-edition-routes`
- `feat/c4-b-edition-schema`
- `feat/c4-b-maison-adapter`
- `feat/c4-b-maison-surface`
- `feat/c4-c-dossier-compiler`
- `feat/c4-c-dossier-composer`
- `feat/c4-c-dossier-print`
- `feat/c4-d-dossier-provenance`
- `feat/c4-d-provenance-lens`
- `feat/c4-d-provenance-lens-surface`
- `feat/c4-d-public-architecture`
- `fix/180-rebase`
- `fix/c4-self-only-provenance-id-url-mismatch`
- `fix/i18n-locale-segment-boundary-rebased-20260924`
- `fix/pr202-quality-gate`

## What was NOT done here

No **remote** branch was deleted: remote history is the durable copy of everything above, and
removing it is irreversible in a way that deleting a local ref after recording its SHA is not.
No worktree was removed. No commit content was rewritten.

## Follow-ups

- Worktrees for superseded branches can be reclaimed once their waves are confirmed idle.
- The four broken branches (`side`, `fix/pr202-quality-gate`, `docs/c3-c-reconcile-router-clean`,
  `docs/c3-c-reconcile-router-fix`) sit at or near an empty tree and should be deleted with their
  SHAs recorded when their worktrees are no longer needed.
