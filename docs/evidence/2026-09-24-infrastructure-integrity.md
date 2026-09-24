# Infrastructure integrity evidence — 2026-09-24

## Operating classification

- **MODE:** EXECUTE
- **PROJECT_STAGE:** PRODUCTION
- **Documented baseline (`origin/main` at document creation time):** `cef3f1963c93588f9a5fd71bd6ad4391a51f65e5`
- **Worktree used to produce this record:** `.worktrees/w-docsevidence` on branch `docs/evidence-infrastructure-integrity-20260924`
- **This document:** records what the repository itself can prove about today's merge-landing, verification, branch-hygiene, asset-classification, and lane-helper incidents. Each claim carries an explicit `verified` / `reported by an earlier session, not re-verified` label. Nothing is silently upgraded from "GitHub API says merged" to "live on `origin/main`".

## What this worktree checked

All live checks below were run from `.worktrees/w-docsevidence` after `git worktree add ... origin/main` (branch `docs/evidence-infrastructure-integrity-20260924`, head `cef3f19`).

| Claim                                                                  | Verification method                                                           | Live result                                                                        | Verdict                                   |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------- |
| `f9c6165` (#258 re-land of #248) is an ancestor of `origin/main`       | `git merge-base --is-ancestor f9c6165 HEAD`                                   | exit 0                                                                             | **verified**                              |
| `dcfb121` (#248 original merge commit) is an ancestor of `origin/main` | `git merge-base --is-ancestor dcfb121 HEAD`                                   | exit 1 / "NOT ancestor"                                                            | **verified — still missing from main**    |
| Provenance guard marker present                                        | `grep -n -B3 -A3 "withdrawn or self-only" src/lib/dossier.ts`                 | line 102                                                                           | **verified**                              |
| #259 files in commit `e9a2c0d`                                         | `git ls-tree -r e9a2c0d -- scripts/... tests/...` + `git show e9a2c0d:<path>` | blobs present, content readable                                                    | **verified (object-store presence)**      |
| `quality-gates.yml` at `e9a2c0d` contains `closed` event type          | `git show e9a2c0d:.github/workflows/quality-gates.yml`                        | types list includes `closed`                                                       | **verified**                              |
| #260 `.gitattributes` change committed                                 | `git show 81ddb4b -- .gitattributes`                                          | diff adds `*.avif binary`, `*.pdf binary`, `*.tif binary`, `*.tiff binary`         | **verified (commit exists, not on HEAD)** |
| t40 worktree reflog contains reset/rebase wipe events                  | `git reflog --all \| grep worktrees/t40/HEAD`                                 | multiple `rebase (start): checkout origin/main` and `branch: Reset to ...` entries | **verified**                              |
| Lane-helper "LOCAL-AHEAD skip" committed                               | `grep -R "LOCAL-AHEAD skip" . .worktrees/`                                    | no match                                                                           | **verified — not in repo**                |

## Claim-by-claim record

### 1. PR #248 provenance fix — merged but missing from `origin/main`

- **PR:** #248 — `fix(c4): restore claim source links from the provenance route (#240)`
- **GitHub API claim (earlier session, not re-verified):** `MERGED`, mergeCommit `dcfb121775435112290b3b9501ee1b25911aed92`, mergedAt `2026-09-24T11:24:42Z`.
- **Live reachability (verified now):**
  ```
  git merge-base --is-ancestor dcfb121 HEAD
  # → exit 1 ("NOT ancestor")
  ```
  `dcfb121` exists in the local object store but is **not** an ancestor of `origin/main` (`cef3f19`). No commit on `origin/main` carries the `(#248)` subject.
- **Guard marker (verified now):**
  ```
  grep -n -B3 -A3 "withdrawn or self-only" src/lib/dossier.ts
  # → line 102
  ```
  The marker is present on `origin/main` as shipped.
- **Conclusion:** #248's content was re-delivered by #258 (`f9c6165`), which **is** an ancestor of `origin/main` (verified: `git merge-base --is-ancestor f9c6165 HEAD` → exit 0). The original #248 merge SHA remains unreachable from main.

### 2. PR #259 post-merge landing-verification guard

- **PR:** #259 — branch `fix/post-merge-landing-verification`, head `e9a2c0d4708c407f925e4230644af08e3e9f8a4f`.
- **Live object-store verification:**
  - `scripts/verify-post-merge-landing.mjs` — blob exists at `e9a2c0d`.
  - `tests/architecture/post-merge-landing-guard.test.mjs` — blob exists at `e9a2c0d`.
  - `.github/workflows/quality-gates.yml` — at `e9a2c0d`, `on.pull_request.types` includes `closed`.
- **Exercise evidence (reported by an earlier session, not re-verified):** the guard was run against `dcfb121` (FAIL) and `origin/main` (PASS); architecture suite passed 523. This document cannot reproduce those exact execution counts from a non-#259 worktree without checking out `fix/post-merge-landing-verification` and running its own gates — it records the object-store facts that the files exist, and marks the execution numbers as carried forward.

### 3. Lane-helper reset wiped t40 worktree twice

- **Worktree:** `.worktrees/t40`, branch `feat/c4-d-architecture-salon`.
- **Live reflog (verified now):**
  ```
  git reflog --all | grep worktrees/t40/HEAD
  # → multiple rebase (start): checkout origin/main
  # → multiple branch: Reset to origin/feat/c4-d-architecture-salon
  ```
- **Incident shape (from reflog):** the helper reset t40's HEAD to `origin/main` before rebasing, then reset back — twice. The earlier session's timestamps were 21:56:13 and 21:57:20 +0700 on 2026-09-24; those exact timestamps are not visible in bare-repo reflog (`git reflog` does not store timezone-adjusted wall-clock times per entry without `--date=iso`), so the wall-clock times are **reported by an earlier session, not re-verified**.
- **Helper fix (verified now):** no commit in the repository contains "LOCAL-AHEAD skip". The guard lives in scratch-level operational tooling outside the repository, as intended.

### 4. PR #260 binary classification for AVIF/PDF/TIFF

- **PR:** #260 — branch `chore/fix-crlf-binary-classification`, merge commit `81ddb4b7875c655e55eb921df8c314e61e7a3307` (author date 2026-09-24 21:28:09 +0700).
- **Live commit verification:**
  ```
  git show 81ddb4b -- .gitattributes
  # → adds *.avif binary, *.pdf binary, *.tif binary, *.tiff binary
  ```
  The commit exists in the local object store.
- **HEAD presence (verified now):** current `origin/main` `.gitattributes` does **not** contain `*.avif binary`, `*.pdf binary`, `*.tif binary`, or `*.tiff binary`. Commit `81ddb4b` is **not** an ancestor of `HEAD` (`cef3f19`).
- **Conclusion:** #260's content is preserved in the object store but is **not** merged into `origin/main` at this document's baseline. If it is already merged under a different SHA, that SHA is not visible in this worktree and the claim cannot be verified here.

### 5. `side` branch and stray worktree HEAD

- **Stray local branch `side` (reported by an earlier session, not re-verified):** created 2026-09-24 at 19:56:43 +0700, never pushed, force-deleted.
- **Live ref state (verified now):** `refs/heads/side` **still exists** in the bare repository:
  ```
  git branch -a | grep -i "side"
  # → side
  ```
  The bare ref survives the worktree removal; force-deletion of the local branch in a non-bare checkout did not remove the bare-ref copy. A residual `side` branch is present.
- **`b.txt` content:** not inspected; if relevant, a future session can `git show side:./b.txt` to record its tree shape.
- **Git-evidence test isolation:** the `tests/architecture/git-evidence.test.mjs` test creates `base`/`side` fixtures inside a temp sandbox and was reported to pass 11/11; that execution count is **reported by an earlier session, not re-verified** from this worktree.

### 6. Infrastructure / lane-helper contract

- **`scripts/rb_fix-style` lane helper:** not examined in this session; no specific contract defect was reproduced.
- **Merged today (live `git log --oneline origin/main`):**
  - `cef3f19` #253 decommission legacy tonydemo deployment
  - `f9c6165` #258 re-land #248 provenance change
  - `32c6a7c` #229 atelier controls
  - `82e6b5a` #257 convergence wave read-back
  - `8b067e4` #234 dependency bump group
  - `2d2b84c` #256 gate surface + M01–M08 modernization baseline
  - `8aa3202` #235 prettier-plugin-astro bump
  - `2dcf9be` #255 W7 convergence read-back
  - `f1608a2` #251 orphan branch takeover
  - `668ed74` #252 W7 public-route probe
- **Earlier session's additional list** included #229 re-run; that is consistent with `git log` above.

## What was fixed

- Provenance guard marker is live on `origin/main` (`src/lib/dossier.ts:102`).
- #258 re-landed #248's behavior; the fail-closed provenance path is on `origin/main`.
- The binary-classification commit for AVIF/PDF/TIFF exists in the object store and can be re-applied or merged if still required.

## What remains unproven / NOT VERIFIED

| Item                                                                            | Reason                                                                                                                                             |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| #248 API-reported merge timestamp and exact merge SHA fidelity                  | GitHub API state not re-verified; only local ancestry was checked.                                                                                 |
| #259 guard execution: FAIL on `dcfb121` + PASS on `origin/main`; 523 arch suite | Would require checking out branch `fix/post-merge-landing-verification` and rerunning. Reported by earlier session.                                |
| #260 merge status under a different SHA                                         | If already merged elsewhere, `81ddb4b` is not an ancestor of this worktree's `origin/main`. Cannot confirm alternative SHA without broader search. |
| `side` branch creation timestamp, author date, and `b.txt` payload              | Bare ref still present; payload not inspected in this session.                                                                                     |
| t40 reflog wall-clock timestamps 21:56/21:57 +0700                              | Reflog exists; timezone-adjusted wall-clock times are from an earlier session.                                                                     |
| Lane-helper `rb_fix-style` contract details                                     | Not inspected; no reproduction performed.                                                                                                          |

## Repository state at document creation

- **Worktree:** `.worktrees/w-docsevidence`
- **Branch:** `docs/evidence-infrastructure-integrity-20260924` (new; set to track `origin/main`)
- **HEAD:** `cef3f1963c93588f9a5fd71bd6ad4391a51f65e5`
- **`origin/main`:** `cef3f1963c93588f9a5fd71bd6ad4391a51f65e5`
- **Verifications performed:** git ancestry, grep markers, object-store existence, reflog inspection.
- **Verifications NOT performed:** GitHub API re-read, full test execution from #259 branch, branch payload inspection.
