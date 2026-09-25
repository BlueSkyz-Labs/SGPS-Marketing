# C4 convergence read-back — 2026-09-25

## Source-of-truth snapshot

- Repository: `BlueSkyz-Labs/SGPS-Marketing`
- Base read-back: `origin/main` at `45e3fdda9ad4e9f0ca7f167b57c343d7c5407541`
- The repository was read from live GitHub/Git state; prior child reports and stale worktree snapshots were not treated as evidence.

## Landed integration

- PR #231 (`feat/c4-e-dossier-handoff`) landed at `45e3fdd`.
- Its exact pre-merge head was `a3805d7219554e7af9616fc3cc06de0a5be35724`.
- Recorded targeted verification: 69/69 browser tests passed across Chromium, Firefox and WebKit, including text-zoom and dossier-handoff coverage.
- Live read-back confirms `mergedAt` is present and `mergeCommit.oid` is `45e3fdda9ad4e9f0ca7f167b57c343d7c5407541`.

## Superseded work

- PR #225 was closed as superseded after its stale branch was found to contain unrelated deletions relative to current `origin/main`. No force-push or branch deletion was used.
- PRs #228 and #230 were closed as superseded by the landed PR #231; their Decision Atelier work is represented in the landed exact-head content.

## Active integration

- PR #263 (`feat/c4-d-architecture-salon-integrated`) is the clean re-cut of C4-D from current `origin/main`.
- Exact candidate head: `53f57b99e51851147825430f9235ceec1f4df139`.
- Changed-file inventory is limited to Architecture Salon components/routes, approved maison/site adapters, the shared salon stylesheet block, and related contract/e2e tests.
- Local exact-head gates: architecture 548/548 PASS; typecheck PASS; lint PASS; format PASS; build PASS (56 pages); targeted Chromium + mobile Chromium Browser Assurance 40/40 PASS.
- GitHub exact-head status at this read-back: Quality Gates PASS, Workers Builds PASS, Browser Assurance IN_PROGRESS. Therefore C4-D remains `IN_PROGRESS`, not `MERGED`, until GitHub Browser Assurance and the required landing read-back are green.

## Fail-closed notes

- The first #263 CI attempt failed only Formatting because five new Astro files were not Prettier-normalized; Browser Assurance was skipped. The files were formatted, committed as `53f57b9`, and the exact-head source gates were rerun before the second CI attempt.
- The products registry remains honestly empty; the build warning is preserved rather than masked. Public product activation remains owner-fact gated.
- Owner decisions in `docs/current-work.json` are unchanged.
