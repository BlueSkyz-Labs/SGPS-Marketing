# Repository rename runbook — `SGPS-Marketing` to `blueskyz-web`

**Status:** PREPARED, NOT EXECUTED. **Owner decision:** 2026-10-25 (SGPS naming rule PD-2026-024: lowercase ASCII kebab-case).
**Actor:** the Human Owner performs every provider step. Agents cannot rename the repository and must not add or remove the `owner-approved` label.

This migration PR changes current-state references to the repository slug only. It must merge **after** the provider rename. The stable machine IDs (`sgps-marketing` project/entity ID, `system.sgps-marketing` architecture ID) are unchanged. Historical records (`docs/evidence/`, `docs/superpowers/`, `docs/lessons/`, `docs/sgps/`, `docs/decisions/`, `CHANGELOG`) keep the old name by design.

New About description (Owner-approved, verbatim):

> BlueSkyz Labs website — the public home for our products, with each product's status and the evidence behind every claim.

## 1. Preconditions

- [ ] Cloudflare Workers Builds is green again on the current `main` head (latest production build succeeded).
- [ ] No open PR is mid-merge: no PR with auto-merge enabled and no required check still running. Merge or pause them first.
- [ ] This migration PR and the paired control-plane PR (`github/repository-metadata.json`) are open, green on their exact heads and not yet merged.

## 2. Rename on GitHub (Owner)

1. GitHub, repository **Settings → General → Repository name**: change `SGPS-Marketing` to `blueskyz-web` and confirm.
2. Same page, **About** (gear on the repository home) → Description: paste the exact text above.
3. Confirm the ruleset `main-promotion-governance` (`22500299`) is still active on `main` (rulesets follow the repository ID).

## 3. Verify Cloudflare Workers Builds

1. Cloudflare dashboard, Workers & Pages, the BlueSkyz Labs web Worker, **Settings → Builds**: confirm the Git connection shows `BlueSkyz-Labs/blueskyz-web` and branch `main`.
2. Trigger proof: push or merge a trivial commit (this migration PR is a suitable trigger) and confirm a build starts and succeeds.
3. If no build triggers or the connection shows an error: disconnect and reconnect the repository in the Cloudflare dashboard (Builds → Git repository), re-check the build command and production branch, then repeat step 2. Do not change any other build setting.

## 4. Update local remotes (every clone and worktree host)

```bash
git remote set-url origin https://github.com/BlueSkyz-Labs/blueskyz-web.git   # or the SSH form
git remote get-url origin
```

This matters for tooling: `scripts/verify-git-evidence.mjs` compares each `sourceEvidence.repository` in `architecture/sgps-model.json` with the slug in `origin`. A clone whose `origin` still names the old slug **skips** that evidence instead of verifying it. Update remotes before running `pnpm architecture:views:check` or the architecture tests as release evidence.

## 5. Merge order

1. Merge this migration PR (exact-head Source Assurance green).
2. Then merge the control-plane PR that sets the repository slug and description state for `sgps-marketing`.
3. Control-plane follow-up (single-writer lane): once the provider read-back shows the new name, update the `repository` slug in the control-plane inventory and metadata, and clear `rename_gate`.

## 6. Rollback

- Renaming back to `SGPS-Marketing` in Settings restores the old name. While the old name has not been reused by another repository, GitHub redirects web, `git` and API requests from the old name to the current one.
- Do **not** create a new repository named `SGPS-Marketing` while the rename may still be reversed, because that ends the redirect.
- If this migration PR is already merged and the rename is reverted, revert the PR as well.

## 7. Evidence to capture

- Screenshot or provider read-back of the new repository name and About description, with date and GMT+7 time.
- `gh api repos/BlueSkyz-Labs/blueskyz-web` output: `full_name`, `id` (must still be `1350655394`), `description`.
- `gh api repos/BlueSkyz-Labs/SGPS-Marketing` showing the redirect (`301`) or resolving to the same ID.
- Ruleset read-back for `main-promotion-governance` after the rename.
- Cloudflare Workers Builds: connected repository, plus the build ID and commit SHA of the build triggered after the rename.
- `git remote get-url origin` on each updated clone.
- Merge commit SHAs of this PR and the control-plane PR.
