# Global Elite Hardening Implementation Plan

> **Status: HISTORICAL / PROMOTED.** This file records the completed 2026-09-07 hardening execution. It is no longer an active pre-merge checklist after PR #68 merged. Current residual work is governed by `docs/superpowers/plans/2026-09-03-remaining-convergence.md` and newer committed decisions/evidence.

**Goal:** Add fail-closed supply-chain policy and enforceable PR source-assurance evidence while preserving Cloudflare Workers as the deployment authority.

**Architecture:** A secretless GitHub Actions workflow produces deterministic exact-head source checks. pnpm policy is fail-closed in `pnpm-workspace.yaml`; deployment tooling is locked in the project graph. Cloudflare Workers Builds remains preview/production deployment authority.

**Tech Stack:** Astro 7, TypeScript 6, pnpm 11, Node 24, GitHub Actions, Playwright/axe, Lighthouse CI, Cloudflare Workers Builds.

**Spec:** `docs/superpowers/specs/2026-09-07-global-elite-hardening-design.md`

## Promotion outcome

- PR #68 `security: fail-closed supply chain and source assurance` final head: `3da147b7ae7d7da7c5f60c9120dc7087e35d0690`.
- Final exact-head `Quality Gates`: PASS, check `101918609484`.
- Final exact-head `Browser Assurance`: PASS, check `101918737841`.
- Final exact-head `Workers Builds: blueskyz-web`: PASS, check `101918792135`, Cloudflare build `c3fe1d6e-7ee5-4f7a-883e-35d46607e1bd`.
- PR #68 merged through the PR path on 2026-09-08; merge commit `f3079c7c1c7385e4f7079a08f537bf1f34578980`.
- Repository ruleset `main-promotion-governance` (`22500299`) is active on `main`; read-back confirms PR-before-merge, strict `Quality Gates` + `Browser Assurance`, conversation resolution, non-fast-forward blocking, deletion blocking and no bypass actors.
- Issue #8 is closed after non-destructive ruleset read-back verification.
- Cloudflare stored deployment commands were normalized and verified as `pnpm wrangler versions upload` for preview and `pnpm wrangler deploy` for production.
- Repository description was reconciled to the Astro 7 / Cloudflare Workers architecture.
- Post-merge `main@2b4ff555917318cccf29400d637d82483909f0d7` independently completed `Quality Gates`, `Browser Assurance`, and `Workers Builds: blueskyz-web` successfully after subsequent brand/routing/observability PRs.

## Global constraints retained after promotion

- No production/cloud deployment from GitHub Actions and no Cloudflare secrets in GitHub workflow jobs.
- GitHub workflow token permission remains `contents: read`; checkout credentials are not persisted.
- Every external GitHub Action reference is pinned to a full 40-character SHA.
- Project package manager remains pnpm `11.25.0` with Corepack SHA-512 integrity and pnpm 12 out of scope.
- Do not invent corporate emails, legal/product claims, proof assets, photography, or domain facts.
- Never weaken architecture, dependency audit, typecheck, lint, formatting, build, client-budget, static-link, Playwright/axe, Lighthouse, public-truth, CSP, or header controls to obtain a green result.
- Dependency lifecycle scripts remain explicit allowlist only; no wildcard or `dangerouslyAllowAllBuilds` bypass.

---

## Completed workstreams

### 1. Package-manager supply-chain contract — VERIFIED

- Architecture contract was written before remediation and observed failing on the unsafe baseline.
- `packageManager` is integrity-pinned to pnpm 11.25.0 and engine constrained to `>=11.25.0 <12`.
- Active policy lives in `pnpm-workspace.yaml`: `minimumReleaseAge: 1440`, strict release-time handling, `blockExoticSubdeps: true`, `strictDepBuilds: true`.
- The inert/unsafe `.npmrc` project policy was removed.
- Clean frozen-install failures were used to discover required lifecycle scripts; only `esbuild` and `workerd` are allowed.
- `dangerouslyAllowAllBuilds`, wildcard lifecycle approval, mutable package-manager selection and widened pnpm major ranges remain regressions.

### 2. Immutable least-privilege Source Assurance — VERIFIED

- `.github/workflows/quality-gates.yml` provides `Quality Gates` and dependent `Browser Assurance`.
- Both jobs check out the exact PR head/push SHA with full-SHA-pinned Actions, `contents: read`, and `persist-credentials: false`.
- Source Assurance references no repository secrets and contains no Cloudflare deployment command.
- Quality Gates includes frozen install, dependency vulnerability audit, architecture, typecheck, lint, format, build, client budget and static links.
- Browser Assurance builds the exact artifact and runs Chromium Playwright/axe plus Lighthouse.
- Final PR #68 exact-head checks and later post-merge `main` checks are recorded in the Promotion outcome above.

### 3. Cloudflare deployment CLI — VERIFIED

- Project-local `wrangler@4.127.1` is lockfile-pinned.
- Repository recovery deploy uses `pnpm wrangler deploy`.
- `workerd` was allowlisted only after a clean frozen-install failure proved the pinned Wrangler graph required its lifecycle installer/version check.
- Deployment-toolchain architecture tests reject bare/mutable resolution such as unpinned `npx wrangler`, `wrangler@latest`, and `pnpm dlx`.
- Cloudflare stored preview/production commands were normalized to project-local `pnpm wrangler ...` and verified by successful provider builds.

### 4. Vulnerable LHCI tooling graph — VERIFIED

- High advisories in `tmp` and `extract-zip` plus Moderate advisories in `uuid` and `qs` were detected through `pnpm audit`.
- Narrow workspace overrides retain the LHCI API surface while pinning `tmp: 0.2.7`, `lighthouse: 13.4.1`, `uuid: 11.1.1`, and `qs: 6.16.0`.
- `tests/architecture/tooling-vulnerabilities.test.mjs` rejects regression to the vulnerable graph.
- `pnpm audit --audit-level=moderate` is an official Quality Gate; the verified graph reported no known vulnerabilities.

### 5. Governance and documentation — VERIFIED

- README, QA strategy, AGENTS guidance, ADR index and residual plan were reconciled to ADR 0005 dual control.
- PR #67 was closed as superseded after its material change was proven landed.
- Repository metadata was corrected to Astro 7 / Cloudflare Workers.
- Active ruleset `22500299` enforces the required PR path on `main`; direct-write mutation proof was intentionally omitted because non-destructive provider read-back is sufficient evidence under the safety contract.

### 6. Promotion and post-merge read-back — VERIFIED

- Final PR #68 exact-head source and Cloudflare checks were green before promotion.
- Material review findings about README drift, mutable Wrangler resolution and stale repository metadata were remediated without weakening Source Assurance.
- PR #68 was promoted through the PR path and is merged.
- Post-merge read-back confirms `main` contains the promoted lineage, required checks continue to run successfully, Cloudflare deployment remains healthy, and the active ruleset remains enforced.

## Current acceptance state

1. Source Assurance and Cloudflare provider checks are reproducible and green on current `main`.
2. Package-manager and deployment-toolchain security contracts are fail-closed and automated.
3. GitHub Source Assurance is read-only, secretless, exact-head and full-SHA pinned.
4. Cloudflare remains deployment authority; GitHub Actions does not hold deployment credentials.
5. Issue #8 is closed because active ruleset `22500299` is verified; the historical `rulesets=[]` blocker is resolved.
6. Documentation must not confuse implemented CI, provider deployment authority, or owner-gated Product Truth.
7. No owner fact may be fabricated to satisfy the production truth gate.
8. New findings after promotion are handled through new PRs/evidence rather than reopening this historical pre-merge checklist.

## Residual owner/external scope

- Verified `PUBLIC_CONTACT_EMAIL` and `PUBLIC_SECURITY_EMAIL` are still required before enabling the production public-truth promotion gate.
- Public product facts/proof, customer claims and photography remain owner/evidence-gated.
- Production RUM remains a privacy/owner decision; absence of owner-approved purpose/provider/retention treatment is not converted into a fake PASS.

## Evidence

See `docs/evidence/2026-09-07-global-elite-hardening.md` for the detailed Detected → Remediated → Verified record and newer post-merge evidence for subsequent changes.
