# Incident and recovery — an orphan-branch prune left main's HEAD dangling

**Recorded:** 2026-09-24 (Asia/Ho_Chi_Minh, SEAST)
**Related:** the orphan-branch takeover recorded in `2026-09-24-orphan-branch-takeover.md` (PR #251)
**Severity:** process-integrity — no committed work was lost, but the working tree became unusable and
every merge-queue lane died silently for roughly an hour.

## What happened

The takeover pass deleted 77 superseded local branches. One of them — `feat/hardening/git-evidence-cleanup`
(tip `5c37e21`) — turned out to be the branch the **main clone directory itself** had checked out.

The pre-delete guard excluded refs that are open-PR heads, named in live queue arguments, `main`, or
checked out in a worktree, using
`git worktree list --porcelain | sed -n 's|^branch refs/heads/||p'`. That parse **did not contain the
main clone's branch**, because `git worktree list` lists the main entry as
`C:/00. AI Project/SGPS-Marketing   (bare)`. With the main entry reported bare, git saw no worktree
holding the branch and **allowed the delete**.

## Symptoms (and why they are easy to misread)

- `git rev-parse HEAD` → `fatal: Needed a single revision`
- `git status` → `fatal: this operation must be run in a work tree`
- but `git fetch`, `git rev-parse origin/main`, `gh pr list` and every worktree operation kept working.

Anything that merely fetches looked healthy, so the breakage was invisible from the pipeline's own
output — while every merge-queue lane, which inspects the working tree, died. The reflog made the cause
unambiguous: the last line was `<sha> 0000000000000000000000000000000000000000` — a deletion.

## Blast radius

Uncommitted-work risk: **none materialised**. A backup was taken before touching anything
(`git diff HEAD` and `git diff --cached` patches plus `git status --porcelain`, ~159 KB each, under the
host temp dir), and the post-recovery status contained **only untracked** entries — session probe
scripts, Playwright logs, `.pnpm-store/` and the owner's `00_Branding Kit/` — with zero tracked
modifications. Committed history was never at risk: the removed refs' SHAs had been written into the
takeover manifest, and the reflog retained the tip.

## Recovery performed

1. Read `.git/HEAD` → `ref: refs/heads/feat/hardening/git-evidence-cleanup` (the deleted ref).
2. Established that the tip is **not** an ancestor of `main` (`git merge-base --is-ancestor`) — i.e. the
   local clone's checkout was a diverged branch, not a stale main.
3. Reattached HEAD to `refs/heads/main`, set `core.bare false`.
4. **Backed up** the index and working-tree diffs before any destructive step.
5. `git fetch && git reset --hard origin/main` → HEAD now `668ed74` on `main`, working tree clean of
   tracked modifications.
6. Restarted the merge queues; verified they run and that merges resumed (`#251` merged afterwards).

## Rules this incident adds

- **Read every repo root's `.git/HEAD` before deleting branches**, not just `git worktree list`.
- **A `(bare)` main entry means the main clone's checkout is invisible to the worktree parse** — treat
  the main clone's HEAD as its own protected ref.
- **A dangling HEAD fails asymmetrically**: fetch-side commands succeed, worktree-side commands fail.
  When lanes die with no error of their own, check `git rev-parse HEAD` in the clone they operate on.
- **Recovery is lossless when SHAs were recorded first** — which is why the manifest is written and
  pushed before the first `git branch -D`, not after.
