# Global Elite Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add fail-closed supply-chain policy and enforceable PR source-assurance evidence while preserving Cloudflare Workers as the deployment authority.

**Architecture:** A secretless GitHub Actions workflow produces deterministic PR status checks from the same commands already trusted locally. pnpm policy moves into `pnpm-workspace.yaml` with explicit supply-chain controls. Architecture tests make these controls regression-resistant, and governance documentation/issue state is reconciled to what GitHub actually enforces.

**Tech Stack:** Astro 7, TypeScript 6, pnpm 11, Node 24, GitHub Actions, Playwright/axe, Lighthouse CI, Cloudflare Workers Builds.

**Spec:** `docs/superpowers/specs/2026-09-07-global-elite-hardening-design.md`

## Global Constraints

- No production/cloud deployment from GitHub Actions and no Cloudflare secrets in GitHub workflow jobs.
- GitHub workflow token permissions are `contents: read` only.
- Every external action reference is pinned to a full 40-character commit SHA.
- Project package manager is pnpm `11.25.0`; pnpm 12 is out of scope.
- Do not invent corporate emails, legal/product claims, proof assets, photography, or domain facts.
- Do not close Issue #8 until an active ruleset is read back from GitHub.
- Never weaken existing architecture, typecheck, lint, formatting, build, client-budget, static-link, Playwright/axe, Lighthouse, public-truth, CSP, or header controls.

---

### Task 1: Lock the supply-chain contract with a failing architecture test

**Files:**

- Create: `tests/architecture/supply-chain-policy.test.mjs`
- Later modify: `package.json`
- Later create: `pnpm-workspace.yaml`
- Later delete: `.npmrc`

**Interfaces:**

- Consumes: Node built-in `node:test`, `node:assert/strict`, filesystem reads used by existing architecture tests.
- Produces: regression assertions for package-manager floor and pnpm project policy.

- [ ] **Step 1: Write the failing test**

The test reads `package.json`, `pnpm-workspace.yaml`, and `.npmrc` if present. Assert:

```js
assert.equal(pkg.packageManager, "pnpm@11.25.0");
assert.equal(pkg.engines.pnpm, ">=11.25.0 <12");
assert.match(workspace, /minimumReleaseAge:\s*1440/);
assert.match(workspace, /minimumReleaseAgeStrict:\s*true/);
assert.match(workspace, /minimumReleaseAgeIgnoreMissingTime:\s*false/);
assert.match(workspace, /blockExoticSubdeps:\s*true/);
assert.match(workspace, /strictDepBuilds:\s*true/);
assert.doesNotMatch(workspace, /dangerouslyAllowAllBuilds/);
assert.doesNotMatch(
  npmrc,
  /minimum-release-age|dangerouslyAllowAllBuilds|ignore-scripts/,
);
```

Also assert `allowBuilds:` exists so lifecycle-script execution cannot silently widen.

- [ ] **Step 2: Verify RED**

Run through the PR workflow once the test-only commit exists. Expected failure: missing `pnpm-workspace.yaml` and/or packageManager mismatch (`11.6.0` vs `11.25.0`).

- [ ] **Step 3: Implement the minimal policy**

Create `pnpm-workspace.yaml` with:

```yaml
minimumReleaseAge: 1440
minimumReleaseAgeStrict: true
minimumReleaseAgeIgnoreMissingTime: false
blockExoticSubdeps: true
strictDepBuilds: true
allowBuilds: {}
```

Update `package.json` to `packageManager: pnpm@11.25.0` and `engines.pnpm: ">=11.25.0 <12"`. Delete `.npmrc` because it contains no auth/registry settings and its non-auth pnpm policy is inert/misleading under pnpm 11.

- [ ] **Step 4: Verify GREEN / discover required build scripts**

Run a clean frozen install in GitHub Actions. If `strictDepBuilds` reports an unapproved dependency build, add only the exact package(s) demonstrated necessary to `allowBuilds` and rerun. Do not use `dangerouslyAllowAllBuilds` or wildcard approval.

- [ ] **Step 5: Run `pnpm test:architecture` and preserve all existing architecture gates**

Expected: zero failures.

---

### Task 2: Add an immutable, least-privilege source-assurance workflow

**Files:**

- Create: `.github/workflows/quality-gates.yml`
- Modify: `tests/architecture/supply-chain-policy.test.mjs`

**Interfaces:**

- Consumes: package scripts in `package.json`; Node 24.20.0; project pnpm pin.
- Produces: required-check candidates `Quality Gates` and `Browser Assurance`.

- [ ] **Step 1: Extend the architecture test before creating the workflow**

Assert the workflow file exists and contains:

```text
permissions:
  contents: read
```

Assert every `uses:` value ends in `@[0-9a-f]{40}` and that the workflow does not reference `secrets.` or deployment commands (`wrangler`, `deploy:workers`).

- [ ] **Step 2: Verify RED**

Run `pnpm test:architecture`. Expected: failure because `.github/workflows/quality-gates.yml` does not exist.

- [ ] **Step 3: Add the workflow**

Use only:

- `actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803` (v6 commit resolved from the action repository)
- `actions/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38` (v6 commit resolved from the action repository)

Workflow requirements:

```yaml
name: Source Assurance
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
concurrency:
  group: source-assurance-${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true
```

`Quality Gates` runs frozen install then architecture, typecheck, lint, format, build, client budget and static links. `Browser Assurance` depends on `Quality Gates`, installs Chromium with system dependencies, runs Playwright Chromium (which includes axe coverage in the repository suite), then Lighthouse CI. Each job has a bounded timeout.

- [ ] **Step 4: Verify GREEN on architecture test**

Expected: workflow-policy assertions pass.

- [ ] **Step 5: Verify the actual PR workflow**

Create/update PR, inspect the exact head workflow run, and require both jobs to finish successfully. If failure is caused by environment/bootstrap rather than product code, fix the workflow root cause without weakening tests.

---

### Task 3: Reconcile governance source-of-truth documents

**Files:**

- Modify: `docs/QA_STRATEGY.md`
- Modify: `AGENTS.md`
- Modify: `docs/superpowers/plans/2026-09-03-remaining-convergence.md`
- Create: `docs/evidence/2026-09-07-global-elite-hardening.md`

**Interfaces:**

- Consumes: status-check names from Task 2 and verified repository `rulesets=[]` state.
- Produces: truthful operator/agent guidance that distinguishes implemented CI from pending ruleset enforcement.

- [ ] **Step 1: Update QA strategy**

Replace the blanket GitHub-Actions prohibition with the dual-control model:

- GitHub = secretless source assurance / future required status checks.
- Cloudflare Workers Builds = preview, production truth gate and deployment.
- GitHub workflow must never deploy or hold Cloudflare credentials.

- [ ] **Step 2: Update AGENTS.md**

Require branch + PR for normal changes, record `Quality Gates` / `Browser Assurance`, and state that direct-to-main is emergency-only while Issue #8 remains open.

- [ ] **Step 3: Update remaining convergence**

Mark creation of source-assurance checks as complete only after their PR run is verified. Keep ruleset creation/read-back unchecked and owner/external.

- [ ] **Step 4: Add evidence**

Record baseline SHA, ruleset read (`[]`), stale PR #67 state, supply-chain finding, action pin SHAs, PR/run evidence, and residual blockers. Never label pending ruleset enforcement as complete.

---

### Task 4: Clean stale PR state and update Issue #8

**Files:** GitHub metadata only.

**Interfaces:**

- Consumes: verified main history and PR #67 metadata.
- Produces: clean PR backlog and an exact governance remediation ticket.

- [ ] **Step 1: Re-fetch PR #67**

Confirm it remains draft/open and its documented landed commit (`6862bf4`) is an ancestor of current `main`.

- [ ] **Step 2: Close PR #67 as superseded**

Update state to `closed`; do not merge its stale head over newer `main`.

- [ ] **Step 3: Update Issue #8**

Keep it open. Replace obsolete expected check language with exact checks `Quality Gates` and `Browser Assurance`; document the connector limitation (ruleset reads available, no create/update ruleset action) and preserve direct-push rejection/read-back as acceptance criteria.

- [ ] **Step 4: Search for other open PRs**

Close only those proven fully landed/superseded. Do not bulk-close ambiguous active work.

---

### Task 5: Full verification, red-team re-audit, and promotion

**Files:** all changed files plus GitHub PR metadata.

**Interfaces:**

- Consumes: Tasks 1–4.
- Produces: verified hardening commit on `main` or a precise blocker report if GitHub prevents promotion.

- [ ] **Step 1: Verify exact-head checks**

Inspect workflow run/jobs/logs. Required result: `Quality Gates` success and `Browser Assurance` success on the current PR head.

- [ ] **Step 2: Red-team the diff and repository**

Search for secrets, permissive build settings, workflow `secrets.`, write permissions, unpinned actions, deployment commands, `TODO/FIXME/HACK`, direct unsafe JSON-LD output, CSP wildcards, and stale governance claims.

- [ ] **Step 3: Review PR threads/reviews and resolve material findings**

Do not self-approve around an actual failed check or unresolved security finding.

- [ ] **Step 4: Merge only the verified PR**

Use squash merge with `expected_head_sha`. Do not fall back to a direct push if PR merge is denied; preserving the newly established control path is part of the remediation.

- [ ] **Step 5: Post-merge read-back**

Verify `main` moved to the merge commit, fetch the merged PR, inspect post-merge workflow status where available, and re-read rulesets. Issue #8 remains open unless rulesets become non-empty and satisfy the acceptance criteria.
