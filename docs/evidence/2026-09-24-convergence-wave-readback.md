# Convergence wave read-back — 2026-09-24

## Operating classification

- **MODE:** EXECUTE
- **PROJECT_STAGE:** PRODUCTION
- **Live baseline HEAD (origin/main):** `2d2b84cf9322778c056167c07d4657881724470d`
- **Merge gate:** `main-promotion-governance` (`22500299`) — PR flow, strict Quality Gates + Browser Assurance, conversation resolution, blocking non-fast-forward/deletion.
- **This document:** factual read-back of the 2026-09-24 convergence wave. It records what GitHub reports as merged, what the open PR surface looks like, and the specific fix/factual claims the wave produces. It does **not** claim new product/truth outcomes.

## Wave snapshot — merged today

Source: `gh pr list --state merged --limit 25 --json number,title,mergeCommit,mergedAt`, re-derived 2026-09-24.

| #       | Title                                                                                    | Merge SHA     | MergedAt (UTC)           |
| ------- | ---------------------------------------------------------------------------------------- | ------------- | ------------------------ |
| 256     | docs(evidence): gate surface + M01–M08 modernization baseline on main                    | `2d2b84c`     | 2026-09-24T12:13:29Z     |
| 255     | docs(evidence): W7 convergence read-back — completed, verified, blocked, external        | `2dcf9be`     | 2026-09-24T10:45:23Z     |
| 252     | docs(evidence): W7 public-route probe — Access still on, legacy-domain 301 finding       | `668ed74`     | 2026-09-24T08:38:50Z     |
| 251     | docs(evidence): orphan branch takeover — triage, verdicts and recovery manifest          | `f1608a2`     | 2026-09-24T09:14:43Z     |
| 250     | docs(evidence): W5/W6 correctness, locale/SEO audit and hardening evidence               | `9a0f484`     | 2026-09-24T08:06:17Z     |
| 249     | docs(evidence): W3 experience baseline, target and gap map                               | `062fcbf`     | 2026-09-24T07:20:56Z     |
| **248** | **fix(c4): restore claim source links from the provenance route (#240)**                 | **`dcfb121`** | **2026-09-24T11:24:42Z** |
| 247     | fix(c4): compare a claim's surface identity, not its id against a URL (#239)             | `687aa92`     | 2026-09-24T05:42:51Z     |
| 246     | docs(decisions): ADR 0011 — model-assisted briefing synthesis stays NO-GO until approved | `e26be9e`     | 2026-09-24T04:49:56Z     |
| 244     | feat(c4-g): deterministic briefing composer and document (Task 2)                        | `ff67050`     | 2026-09-24T04:04:45Z     |
| 243     | fix(i18n): published-language entry, routing and production smoke parity                 | `3ec6bbb`     | 2026-09-24T03:01:52Z     |
| 241     | fix(c4): refuse malformed public provenance destinations                                 | `1265c53`     | 2026-09-24T01:42:14Z     |
| 238     | docs(marketing): native-first modernization and SGPS experience execution gates          | `df011c2`     | 2026-09-24T00:00:08Z     |
| 236     | docs(marketing): SGPS FULL audit and C4 experience convergence plan                      | `578aa5f`     | 2026-09-23T23:23:44Z     |
| 235     | chore(deps-dev): bump prettier-plugin-astro from 0.14.1 to 1.0.1                         | `8aa3202`     | 2026-09-24T11:16:03Z     |
| 233     | chore(deps): bump astro from 7.3.2 to 7.3.3 in the production-dependencies group         | `33b4ef7`     | 2026-09-24T05:09:46Z     |

Waves W3–W7 evidence PRs (249, 250, 251, 252, 255, 256) plus the C4/C4-G/C4-D/C4-i18n/C4-c4 work in 238, 241, 243, 244, 246, 247, 233 are all present on `origin/main` at this refresh.

## Factual fixes this wave (verify-before-write)

### #248 — dossier provenance href fix + rewritten provenance tests

- **PR:** #248 — `fix(c4): restore claim source links from the provenance route (#240)`
- **State (GitHub API):** `MERGED`, mergeCommit `dcfb121775435112290b3b9501ee1b25911aed92`, mergedAt `2026-09-24T11:24:42Z`.
- **What it does:** `dossier.ts` previously asked `publicRoute(claim.surface)` for a destination. `publicRoute` only accepts a path (`surface.startsWith("/")`), but `claim.surface` is a logical id (`security`, `privacy`, `products`) — so it answered `null` for every declared claim, and both `DossierComposer` and `DossierDocument` omitted the source anchor even though the print introduction promises every published item links to its source.
- **Fix:** the destination now comes from the same provenance authority the claim's sources already use — the surface's route evidence inside `provenance.sourceRefs`, passed through the existing `publicRoute` safety guard. No second provenance authority (per #227), no `EVIDENCE_INDEX` reintroduction into `dossier.ts`, no path inferred from an unchecked string. No genuine route ⇒ `href` stays `null`, never guessed.
- **Test impact:** new contract #240 pins, for en/vi/zh, `entry.href === provenance route ref.href === published route destination`, plus the safe-path invariant. Baseline before fix: 1 failing test (href always null). After: dossier contract 10/10.
- **Reported verification at head `9378600`:** `fmt` 0 · `typecheck` 0 · `lint` 0 · `arch` 515/515 · `build` 0 · e2e chromium 19/19 + mobile-chromium 19/19 (`c4-dossier-composer` + `c4-dossier-print`), including `/zh/dossier/ keeps every published source reachable without JavaScript`.
- **⚠️ HEAD_REACHABILITY FOOTNOTE (do not silently paper over):** At this refresh `git merge-base --is-ancestor dcfb1217 origin/main` returns false and `git log --all --oneline | grep -c dcfb121` returns 1 (the commit exists in the local object store but is not reachable from `origin/main`). The GitHub REST API still reports the PR as `MERGED` with mergeCommit `dcfb121`. Two non-mutually-exclusive explanations are consistent with the data: (a) the merge landed on a branch that is not `origin/main`'s current tip (for example a dependabot/rebase target that was later force-tipped or rebased away), or (b) the merge SHA was reported by the API but the commit was not retained on the mainline history that `origin/main` now points at. This document records the API claim verbatim and flags the reachability mismatch; it does **not** assert either cause or silently upgrade the claim to "landed on main."

### #235 — prettier-plugin-astro 0.14.1 → 1.0.1 with repo-wide reformat

- **PR:** #235 — `chore(deps-dev): bump prettier-plugin-astro from 0.14.1 to 1.0.1`
- **State:** `MERGED`, mergeCommit `8aa320218d1da66254dd58d9f30ca5c2ed24f4db`, mergedAt `2026-09-24T11:16:03Z`.
- **Presence on main:** confirmed reachable from `origin/main` (visible in `git log --oneline origin/main`).
- **What changed:** the plugin was rewritten on top of Astro 7's Rust compiler (v1.0.0), with v1.0.1 adding TypeScript declarations for plugin options, a fix for errors when a JS comment appears before a raw/custom-printed element, and a fix for non-idempotent CSS `<style>` block formatting under `astroCompressHTML`.
- **Repo consequence:** the major rewrite changes Astro-page HTML whitespace handling to match Astro's own whitespace handling, so the bump came with a repo-wide reformat. This is the kind of dependency change that touches every formatted Astro file; the merge record is the evidence that the reformat landed cleanly through the normal gate.

### #231 — two committed conflict regions in `c4-quiet-authority.css` resolved from clean commit `b9654a6`

- **PR:** #231 — `feat(c4-e): hand the visitor's own ticks to the dossier (Task 5)` — still OPEN, mergeStateStatus `DIRTY`, Browser Assurance FAILED on its last run.
- **Conflict resolution claim:** the PR body for #231 says the shared stylesheet was rebuilt on current `main` so the atelier controls and the reason line sit alongside main's own rules, and that "an earlier conflict resolution had dropped both the control styles and, in the first repair attempt, main's newer print-document rules. Both are now present and asserted."
- **Commit evidence:** `b9654a6452cc437eeef4aa800e83802ab452aed7` (author: Source Assurance; subject: `feat(c4-e): hand the visitor's own ticks to the dossier (Task 5)`) touches `src/styles/c4-quiet-authority.css` with 145 insertions/+9 deletions and is the clean commit the PR body points at for the stylesheet rebuild. The diff from `b9654a6^..b9654a6` to `src/styles/c4-quiet-authority.css` shows the CSS being rewritten as one unit (C4-D provenance lens block + C4-E atelier controls block) rather than a live conflict marker resolution — i.e., the "two committed conflict regions" were resolved by rebuilding the file from a clean baseline commit, not by patching conflict markers in place.
- **Status:** the PR is open and its Browser Assurance is currently red; this read-back records the claimed resolution source (`b9654a6`) and the file, not a verification that the currently-open #231 branch is green.

### WebKit text-zoom overflow on `/vi/decision-room/` — fixed by clipping `.decision-room__atelier-field`

- **Fixing commit:** `c00738272b760b5e7792eb71b67ba68a7b38defd` — `fix(c4-e): constrain native select intrinsic width at 200% text zoom`
- **File:** `src/styles/c4-quiet-authority.css`
- **What was added (diff summary):**
  - `.decision-room__atelier` — `grid-template-columns: minmax(0, 1fr)` + `min-inline-size: 0`
  - `.decision-room__atelier-field` — `min-inline-size: 0` + `max-inline-size: 100%`
  - new rule `.decision-room__atelier-select` — `box-sizing: border-box; inline-size: min(100%, 20rem); min-inline-size: 0; max-inline-size: 100%`
  - comment: "Native select intrinsic option width must not dictate the page width at 200% zoom."
- **Root cause:** WebKit does not apply `overflow` to a native `<select>`, so the longest option paints past its box and forces the page wide at 200% text zoom. The fix constrains the field and the select itself rather than relying on overflow clipping, which WebKit would ignore on the native control.
- **Note:** this commit exists in the local object store (`git cat-file -t c007382` → `commit`) but, like `dcfb121`, should be re-checked against `origin/main` before asserting it is live on main; this document records the fix's content and root cause verbatim.

### #234 dependabot group rebuilt on current main with wrangler deliberately left at 4.131.1

- **PR:** #234 — `chore(deps-dev): bump the development-dependencies group with 5 updates` — OPEN, BLOCKED (Quality Gates green, Browser Assurance IN_PROGRESS at refresh, Workers Builds green).
- **What the group would bump:** `@types/node` 26.5.1→26.6.2, `eslint` 10.10.0→10.11.0, `eslint-plugin-astro` 3.1.0→3.2.1, `prettier` 3.9.6→3.9.8, `wrangler` 4.131.1→4.135.0.
- **Why wrangler is deliberately pinned:** `tests/architecture/deploy-toolchain.test.mjs` asserts `pkg.devDependencies?.wrangler === "4.131.1"` and matches the deploy script against `run("pnpm", ["wrangler", "deploy"])` while asserting it does **not** contain `wrangler@latest` or `pnpm ... dlx`. That test is the deploy-governance pin: bumping wrangler would break the test, so the group is rebuilt on current main with wrangler left at 4.131.1 by design rather than by accident.

## Open PR surface at refresh

Source: `gh pr list --state open --json number,mergeStateStatus,statusCheckRollup,title`, re-derived 2026-09-24.

| #   | Title                                                                                  | MergeStateStatus | Quality Gates | Browser Assurance | Workers Builds |
| --- | -------------------------------------------------------------------------------------- | ---------------- | ------------- | ----------------- | -------------- |
| 254 | docs(evidence): W4 matrix verification (CI green) + orphan-prune HEAD incident         | BLOCKED          | SUCCESS       | IN_PROGRESS       | SUCCESS        |
| 253 | docs(evidence): decommission legacy tonydemo deployment (owner directive)              | BLOCKED          | SUCCESS       | IN_PROGRESS       | SUCCESS        |
| 245 | docs(decisions): resolve the duplicate ADR 0009 without rewriting published references | BLOCKED          | SUCCESS       | IN_PROGRESS       | SUCCESS        |
| 234 | chore(deps-dev): bump the development-dependencies group with 5 updates                | BLOCKED          | SUCCESS       | IN_PROGRESS       | SUCCESS        |
| 231 | feat(c4-e): hand the visitor's own ticks to the dossier (Task 5)                       | DIRTY            | SUCCESS       | **FAILURE**       | SUCCESS        |
| 230 | feat(c4-e): sourced why-this-is-shown reasons (Task 4)                                 | DIRTY            | SUCCESS       | **FAILURE**       | SUCCESS        |
| 229 | feat(c4-e): atelier controls over the decision room (Task 3)                           | BLOCKED          | SUCCESS       | IN_PROGRESS       | SUCCESS        |
| 228 | feat(c4-e): explicit decision atelier arrangement (Tasks 1-2)                          | BLOCKED          | SUCCESS       | IN_PROGRESS       | SUCCESS        |
| 225 | feat(c4-d): architecture salon on a new public route (Task 2)                          | BEHIND           | SUCCESS       | **FAILURE**       | SUCCESS        |
| 224 | docs(c4): reconcile the current-work router with delivered C4 waves                    | BLOCKED          | SUCCESS       | IN_PROGRESS       | SUCCESS        |

Pattern: Quality Gates and Workers Builds are green across the open C4-E/C4-D surface; the blocker is Browser Assurance (IN_PROGRESS on the newest waves, FAILURE on #231/#230/#225). The two DIRTY PRs (#231, #230) are the ones touching the shared `c4-quiet-authority.css` atelier/provenance surface — consistent with the conflict-resolution and text-zoom-fix history on that file.

## Not in this wave (recorded so the read-back does not silently invent)

- No product/trust-continuum/public-truth outcome is claimed by this document. The empty public product registry and owner-gated emails remain the production-truth boundary recorded in earlier evidence.
- No new ADRs, no new dependency bumps, no new deploy, no new test weakening.
- No claim that #248's fix is live on `origin/main` at this refresh — see the HEAD_REACHABILITY footnote above.

## Verification performed for this document

- `gh pr list --state merged --limit 25 --json number,title,mergeCommit,mergedAt` — re-derived merged list.
- `gh pr list --state open --json number,mergeStateStatus,statusCheckRollup,title` — re-derived open-surface check states.
- `gh pr view 248`, `gh pr view 235`, `gh pr view 231`, `gh pr view 234`, `gh pr view 237` — individual PR state, body, mergeCommit.
- `git log --oneline origin/main` — live `main` tip and presence/absence of named SHAs.
- `git merge-base --is-ancestor` for `dcfb121` against `origin/main` — reachability check.
- `git show c007382 --stat` + `git show c007382 --format=""` — WebKit fix commit contents.
- `git diff b9654a6^..b9654a6 -- src/styles/c4-quiet-authority.css` — conflict-resolution stylesheet rebuild shape.
- `git show dcfb121 --stat` — #248 merge commit touched 6 files including rewritten provenance tests.
- `grep -n "wrangler\|4.131" tests/architecture/deploy-toolchain.test.mjs` — deploy-governance pin located.
- `grep -rn "decision-room__atelier-field" src/styles/` — rule present in source.
- `date -u` — refresh timestamp.

## Gaps / not verified

- `dcfb121` (#248 merge commit) is reported MERGED by the GitHub API but is **not reachable from `origin/main`** at this refresh. Cause not determined here; flagged for owner/merge-race follow-up rather than asserted.
- `c007382` (WebKit text-zoom fix) is present in the local object store but its reachability from `origin/main` was not independently re-confirmed in this pass; recorded verbatim from `git show`.
- #231 is open and red — the claim that its CSS conflict regions were resolved from `b9654a6` is the PR's own stated source; this document does not re-run that PR's Browser Assurance.

---

Refresh timestamp (UTC): 2026-09-24T12:37:10Z  
Generated from: `origin/main` tip `2d2b84cf9322778c056167c07d4657881724470d`
