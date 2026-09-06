# Global Elite Hardening — Design

**Date:** 2026-09-07  
**Baseline:** `main@d0ef2a8dcb3b463ad4b774a1ad29bf6fa6155235`

## Objective

Move SGPS-Marketing from strong local/Cloudflare assurance with fail-open GitHub governance to a fail-closed, evidence-first delivery model without moving deployment credentials or production deployment authority into GitHub Actions.

## Findings driving this design

1. `main` has no active repository rulesets (`rulesets=[]`), so direct pushes are technically possible.
2. PR #67 is still draft/open although its material change already landed on `main` via direct push. This proves the documented PR-first flow is not technically enforced.
3. The repository has no GitHub workflow that emits a deterministic source-quality status suitable for a required-status-check rule.
4. `.npmrc` contains non-auth pnpm settings (`minimum-release-age=0`, `dangerouslyAllowAllBuilds=true`, etc.). On pnpm 11 these settings belong in `pnpm-workspace.yaml`; leaving them in `.npmrc` is misleading and can falsely imply a policy is active.
5. The project is pinned to pnpm 11.6.0 while the current maintained v11 line is newer. Stay on major 11 for compatibility, but raise the floor to the current v11 security/maintenance baseline.
6. Existing application-layer controls are already strong: restrictive CSP/security headers, public-truth validation, static-link/client-JS budgets, architecture tests, Playwright/axe and Lighthouse coverage. The hardening should preserve these rather than duplicate deployment logic.

## Target architecture

### 1. Dual-control promotion

GitHub becomes the immutable source-control gate; Cloudflare remains the preview/production build and deploy authority.

- GitHub Actions runs a **secretless, read-only source assurance workflow** on PRs and `main`.
- It never deploys and receives no Cloudflare credentials.
- Workflow actions are pinned to full commit SHAs and `GITHUB_TOKEN` is `contents: read` only.
- The future `main` ruleset requires the GitHub source-assurance checks before merge.
- Cloudflare Workers Builds continues preview/prod deployment and post-deploy verification.

This intentionally supersedes the prior blanket statement that required GitHub Actions must not exist. The old constraint was useful while deployment compute was being consolidated, but it leaves no enforceable GitHub status for rulesets.

### 2. Supply-chain fail closed

Move pnpm policy to `pnpm-workspace.yaml`, the pnpm 11 project configuration source.

Policy:

- pnpm: exact project package manager `11.25.0`; engine range `>=11.25.0 <12`.
- `minimumReleaseAge: 1440` and strict handling of missing/ineligible release-time metadata.
- `blockExoticSubdeps: true`.
- `strictDepBuilds: true`.
- `dangerouslyAllowAllBuilds` is forbidden.
- Dependency lifecycle scripts are explicit allowlist only. Start from deny-all and allow only packages proven necessary by a failing clean install.
- Keep lockfile verification enabled; do not trust a lockfile merely because it was committed.

### 3. Test-first policy enforcement

A new architecture test must fail on the current baseline before configuration is changed. It locks:

- required pnpm 11.25.0 packageManager/engine floor;
- presence and values of supply-chain settings in `pnpm-workspace.yaml`;
- absence of non-auth project policy in `.npmrc`;
- absence of `dangerouslyAllowAllBuilds` anywhere in active pnpm policy;
- GitHub workflow least privilege and full-SHA action pinning.

### 4. Governance truthfulness

Documentation must distinguish **implemented controls** from **externally blocked enforcement**.

- Issue #8 stays open until an active ruleset can be created and read back.
- The connector available in this session has read access to rulesets but no ruleset write action; documentation cannot be used as a substitute for enforcement.
- PR-first becomes the normative path immediately; direct-to-main is emergency-only until the ruleset exists.
- Stale PRs whose commits already landed are closed as superseded rather than left as misleading open work.

## Workflow design

Two jobs are intentionally separate so rulesets can require both and failures are diagnosable:

1. **Quality Gates** — install with frozen lockfile, architecture tests, typecheck, lint, format check, build, client budget, static links.
2. **Browser Assurance** — Chromium bootstrap, Playwright Chromium/axe suite, Lighthouse CI.

Both use Node 24.20.0, Corepack, the pinned project pnpm, no repository secrets, `permissions: contents: read`, bounded timeouts and concurrency cancellation.

## Non-goals

- Do not invent production email addresses, legal claims, product proof, customer references, photography, or final corporate-domain facts.
- Do not move Cloudflare deploy credentials into GitHub Actions.
- Do not enable a fake or documentation-only ruleset.
- Do not upgrade to pnpm 12 during this pass.
- Do not re-architect the Astro application where existing controls already satisfy the security/trust contract.

## Acceptance criteria

1. A PR from the hardening branch emits fresh `Quality Gates` and `Browser Assurance` evidence.
2. All existing local-source-equivalent tests continue to pass on the exact PR head.
3. Supply-chain architecture test demonstrates a real red→green cycle.
4. The workflow has read-only token permissions, no secrets, and full-SHA action references.
5. PR #67 is closed as superseded after confirming its change is on `main`.
6. Issue #8 is updated with the exact new status-check names and remains open while `rulesets=[]`.
7. Documentation no longer claims GitHub Actions are categorically prohibited; it documents the split of source assurance vs deployment authority.
8. A final red-team pass finds no remaining agent-fixable P0/P1 security/governance gap in the repository. External/owner facts remain explicit holds.
