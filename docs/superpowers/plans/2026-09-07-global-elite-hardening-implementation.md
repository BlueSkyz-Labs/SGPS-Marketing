# Global Elite Hardening Implementation Plan

> **Execution record:** this plan is the hardening execution contract. Checkboxes track verified execution; unresolved external controls remain open rather than being documented as PASS.

**Goal:** Add fail-closed supply-chain policy and enforceable PR source-assurance evidence while preserving Cloudflare Workers as the deployment authority.

**Architecture:** A secretless GitHub Actions workflow produces deterministic exact-head source checks. pnpm policy is fail-closed in `pnpm-workspace.yaml`; deployment tooling is locked in the project graph. Cloudflare Workers Builds remains preview/production deployment authority.

**Tech Stack:** Astro 7, TypeScript 6, pnpm 11, Node 24, GitHub Actions, Playwright/axe, Lighthouse CI, Cloudflare Workers Builds.

**Spec:** `docs/superpowers/specs/2026-09-07-global-elite-hardening-design.md`

## Global constraints

- No production/cloud deployment from GitHub Actions and no Cloudflare secrets in GitHub workflow jobs.
- GitHub workflow token permission is `contents: read` only; checkout credentials are not persisted.
- Every external GitHub Action reference is pinned to a full 40-character SHA.
- Project package manager is pnpm `11.25.0` with Corepack SHA-512 integrity; pnpm 12 is out of scope.
- Do not invent corporate emails, legal/product claims, proof assets, photography, or domain facts.
- Do not close Issue #8 until an active ruleset is read back from GitHub.
- Never weaken architecture, typecheck, lint, formatting, build, client-budget, static-link, Playwright/axe, Lighthouse, public-truth, CSP, or header controls.
- Dependency lifecycle scripts remain explicit allowlist only; no wildcard or `dangerouslyAllowAllBuilds` bypass.

---

### Task 1: Lock the package-manager supply-chain contract

**Files:** `tests/architecture/supply-chain-policy.test.mjs`, `package.json`, `pnpm-workspace.yaml`, `.npmrc`.

- [x] Write the architecture contract before policy remediation.
- [x] Verify the baseline fails the new contract for the intended reasons.
- [x] Pin `packageManager` to integrity-verified pnpm 11.25.0 and engine `>=11.25.0 <12`.
- [x] Move active policy to `pnpm-workspace.yaml`: `minimumReleaseAge: 1440`, strict release-time handling, `blockExoticSubdeps: true`, `strictDepBuilds: true`.
- [x] Remove the inert/unsafe `.npmrc` project policy.
- [x] Discover required lifecycle scripts through clean frozen-install failures rather than guessing; allow only `esbuild` and, after Wrangler integration proved it necessary, `workerd`.
- [x] Verify architecture contracts and clean frozen installs without disabling security controls.

**Invariant:** `dangerouslyAllowAllBuilds`, wildcard lifecycle approval, mutable package-manager selection, or a widened pnpm major range are regressions.

---

### Task 2: Add immutable least-privilege Source Assurance

**Files:** `.github/workflows/quality-gates.yml`, `tests/architecture/supply-chain-policy.test.mjs`.

- [x] Add failing workflow-policy assertions before the workflow existed.
- [x] Add `Source Assurance` using full-SHA `actions/checkout` and `actions/setup-node`.
- [x] Restrict workflow permissions to `contents: read`; set `persist-credentials: false` and exact candidate SHA checkout in both jobs.
- [x] Keep workflow secretless and free of Cloudflare/deployment commands.
- [x] Add bounded `Quality Gates` job: frozen install → architecture → typecheck → lint → format → build → client budget → static links.
- [x] Add bounded `Browser Assurance` job after Quality Gates: static build → Chromium bootstrap → Playwright/axe → Lighthouse.
- [x] Root-cause workflow bootstrap/formatting failures without suppressing tests; verify both jobs green on PR #68 candidate `b2b3779e1c910e372677e6f093065a7b96f37e90`.
- [ ] Re-verify both jobs on the **final combined PR head** after all hardening/docs changes.

---

### Task 2A: Lock the Cloudflare deployment CLI

**Finding:** recovery deployment used `npx wrangler deploy` without Wrangler in the committed project graph, allowing release-time CLI resolution drift.

**Files:** `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `scripts/deploy-workers.mjs`, `tests/architecture/deploy-toolchain.test.mjs`.

- [x] Write a deploy-toolchain architecture contract rejecting bare/mutable deployment resolution.
- [x] Pin project-local `wrangler@4.127.1` and commit the lockfile.
- [x] Change repository recovery deploy to `pnpm wrangler deploy`.
- [x] Run clean frozen-install diagnostics; observe `ERR_PNPM_IGNORED_BUILDS` for `workerd` rather than broadening policy blindly.
- [x] Verify `workerd` is the locked Wrangler runtime binary installer/version checker, then allow only `workerd: true` in addition to existing `esbuild: true`.
- [x] Verify isolated exact-head clean install, targeted deploy contract, full architecture suite, typecheck, lint, format, static build, client budget and static links.
- [x] Verify Cloudflare preview succeeds after the lifecycle-policy remediation.
- [x] Port only the five verified repository files into PR #68 via an atomic fast-forward tree commit; do not carry the temporary diagnostic workflow.
- [ ] Verify the **combined PR head** through official `Quality Gates`, `Browser Assurance`, and Cloudflare preview.
- [ ] **EXTERNAL:** normalize stored Cloudflare trigger deploy commands to explicit `pnpm wrangler ...`; the current frozen install contains the pinned Wrangler, but external config should match the repository contract.

---

### Task 3: Reconcile governance sources of truth

**Files:** `README.md`, `docs/QA_STRATEGY.md`, `AGENTS.md`, `docs/superpowers/plans/2026-09-03-remaining-convergence.md`, `docs/evidence/2026-09-07-global-elite-hardening.md`.

- [x] Replace the obsolete blanket GitHub-Actions prohibition with ADR 0005 dual control.
- [x] Document GitHub Source Assurance as secretless source-only verification and Cloudflare Workers Builds as deployment authority.
- [x] Update agent/operator guidance to normal branch → PR → exact-head checks → merge; direct-to-main is emergency-only while Issue #8 is open.
- [x] Reconcile remaining-convergence to distinguish implemented checks from absent ruleset enforcement.
- [x] Record baseline, findings, remediation evidence, action pins/check names, Wrangler root cause and residual external blockers.
- [x] Correct README package-manager/CI drift.
- [x] Correct the stale GitHub repository description and read back the Astro 7 / Workers description.

---

### Task 4: Clean stale PR state and maintain governance ticket truth

- [x] Re-fetch PR #67 and verify its material commit had already landed on `main`.
- [x] Close PR #67 as superseded instead of merging its stale head.
- [x] Update Issue #8 to exact required-check names `Quality Gates` and `Browser Assurance`; close it after active-ruleset read-back.
- [x] Preserve direct-push rejection, strict/up-to-date checks, conversation resolution, deletion/force-push blocking and ruleset read-back as Issue #8 acceptance criteria.
- [x] Search other open PR state; do not bulk-close ambiguous work.
- [x] Create and verify active `main` ruleset `main-promotion-governance` (GitHub ruleset `22500299`) requiring PR, strict `Quality Gates` + `Browser Assurance`, conversation resolution, force-push blocking and deletion blocking. Direct-write mutation proof was intentionally omitted under the safety contract.

---

### Task 5: Full verification, red-team and promotion

- [ ] Verify final exact-head `Quality Gates` success.
- [ ] Verify final exact-head `Browser Assurance` success.
- [ ] Verify final exact-head Cloudflare preview success.
- [ ] Review final diff/dependency graph for accidental files, dead/duplicate implementation, unresolved conflicts and stale TODO/FIXME/HACK.
- [ ] Red-team secrets, permissive build settings, workflow write permissions/secrets/unpinned actions, mutable deployment commands, unsafe JSON-LD, CSP wildcards, non-production URL poisoning, misleading product/proof claims and chained supply-chain paths.
- [ ] Review PR threads/reviews and resolve every material finding.
- [ ] Confirm two consecutive deep-audit passes add no meaningful agent-actionable finding beyond documented residual external/owner items.
- [ ] Mark PR ready and squash-merge **only** the verified head using `expected_head_sha`; never direct-push as fallback.
- [ ] Post-merge read-back: verify `main`, merged PR, main workflow status, Cloudflare status and rulesets.

## Acceptance criteria

1. Final PR head has successful `Quality Gates`, `Browser Assurance`, and Cloudflare preview evidence.
2. Package-manager and deploy-toolchain security contracts pass on clean frozen install.
3. GitHub Source Assurance is read-only, secretless, exact-head and full-SHA pinned.
4. Cloudflare deployment authority remains outside GitHub Actions.
5. PR #67 is closed as superseded; Issue #8 remains open while rulesets are `[]`.
6. Documentation does not confuse implemented CI with enforcement or invent missing production truth.
7. No agent-fixable P0/P1 remains before promotion.
8. Residual owner/external items are explicit and UNKNOWN/NOT VERIFIED is never promoted to PASS.

## Evidence

See `docs/evidence/2026-09-07-global-elite-hardening.md` for Detected → Remediated → Verified evidence and residual blockers.
