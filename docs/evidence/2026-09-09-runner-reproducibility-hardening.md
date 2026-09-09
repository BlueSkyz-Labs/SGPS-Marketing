# Source Assurance runner reproducibility hardening — 2026-09-09

## Scope

This ledger records the P2 reproducibility finding discovered during the post-architecture convergence deep audit. The change is limited to GitHub Source Assurance runner selection and its SGPS architecture evidence; it does not change the site runtime, Cloudflare deployment topology, permissions, secrets, product truth, or browser matrix.

## Finding lifecycle

### DETECTED

- Verified default-branch baseline before the change: `main@ebd7e29b626025ce5904ad7b6d0ce8988ffd1f9a` with `Quality Gates`, `Browser Assurance`, and `Workers Builds: blueskyz-web` successful.
- The Source Assurance workflow pinned Node, pnpm, checkout/setup-node action SHAs, exact candidate SHA, and read-only GitHub permissions, but both jobs still used mutable `runs-on: ubuntu-latest`.
- Risk classification: **P2 reproducibility / supply-chain environment drift**. A future GitHub remap of `ubuntu-latest` could change the runner OS major without a repository change.
- The RED job showed that `ubuntu-latest` currently resolved to Ubuntu 24.04, so pinning `ubuntu-24.04` preserves the current operating-system family while closing silent major-version drift.

### REMEDIATED

- TDD RED commit: `a46d30bdf11dca776111285e6c007bd681e3bc11`.
  - Frozen dependency install: PASS.
  - `pnpm audit --audit-level=moderate`: `No known vulnerabilities found`.
  - Architecture suite: 102/103 PASS; the only failure was the new runner contract, with actual `["ubuntu-latest", "ubuntu-latest"]` versus required `["ubuntu-24.04", "ubuntu-24.04"]`.
  - `Quality Gates` check: `102470185375`, failed at Architecture contracts as intentionally expected for RED.
- Workflow remediation commit: `15094e5a2a77a1ff83f38fecedd92e6a00bfa653`.
  - `Quality Gates` and `Browser Assurance` now use `ubuntu-24.04`.
  - Existing full-SHA action pins, `contents: read`, exact-head checkout, `persist-credentials: false`, dependency audit, cross-browser Playwright/axe, and Lighthouse gates remain unchanged.
- SGPS architecture evidence was refreshed to bind `component.source-assurance` to workflow revision `15094e5a2a77a1ff83f38fecedd92e6a00bfa653`.
- A formatting-only failure in the regression test was fixed without weakening assertions; this also reinforced the repository rule that formatter failures are not bypassed or reclassified as green.

### VERIFIED — pre-ledger candidate

Exact candidate: `7adb122e2e4b8e148efa0c0e381bc39504ce4994`.

- Quality Gates: check `102472408316` — PASS.
- Browser Assurance: check `102472646148` — PASS.
- Cloudflare Workers Build: check `102472665619`, build `b1a72495-b00a-4108-ad55-1bdbcb47ae05`, version `b6b2231f-e0f7-4669-877a-74e16fb5d658` — PASS.

Quality evidence includes frozen install, dependency vulnerability audit, 103/103 architecture contracts, typecheck, lint, formatting, static build, client-JS budget, and static-link validation. Browser Assurance includes the repository cross-browser Playwright/axe matrix and Lighthouse CI on the pinned runner family.

Because this ledger itself changes the candidate SHA, these checks are explicitly **pre-ledger evidence**, not final promotion evidence. Final exact-head checks and the merge/post-merge SHA are recorded on PR #83 and GitHub check-runs after this commit; stale green is not promoted.

## Threat / blast-radius review

- No GitHub token permission increase.
- No new secret access or persisted checkout credentials.
- No deployment command added to GitHub Actions.
- No dependency or lockfile mutation.
- No user-visible runtime or Product Truth behavior change.
- Rollback/fix-forward is a two-line workflow runner-label revert plus the associated SGPS evidence revision.

## Residuals

- Provider-native Dependabot / secret-scanning alert read-back is **UNKNOWN through the current connector endpoint**, not PASS. The repository-enforced `pnpm audit --audit-level=moderate` is independently green for the current dependency graph.
- Verified production contact/security email facts, public product/proof/photography inputs, production RUM approval, and human E4 customer-task/brand interpretation remain external/owner/human-gated per the active residual execution contract. They are not fabricated to satisfy technical gates.
