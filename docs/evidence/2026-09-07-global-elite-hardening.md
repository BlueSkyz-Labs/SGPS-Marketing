# Global Elite hardening evidence — 2026-09-07

## Scope and baseline

- Repository: `BlueSkyz-Labs/SGPS-Marketing`
- Audit baseline: `main@d0ef2a8dcb3b463ad4b774a1ad29bf6fa6155235`
- Execution contract: C1.1 spec/plan, ADR 0004, remaining-convergence plan, ADR 0005, and the 2026-09-07 hardening plan
- Delivery branch: `audit/global-elite-hardening-2026-09-07`
- PR: #68 `security: fail-closed supply chain and source assurance`

## Detected → remediated → verified

### P1 — fail-open / misleading package-manager policy

**Detected:** `.npmrc` contained pnpm policy including `minimum-release-age=0` and `dangerouslyAllowAllBuilds=true`; pnpm 11 project policy belongs in `pnpm-workspace.yaml`.

**Remediated:** removed the inert/unsafe `.npmrc` policy; pinned pnpm 11.25.0 with Corepack SHA-512 integrity; set `minimumReleaseAge: 1440`, strict missing-time handling, `blockExoticSubdeps: true`, `strictDepBuilds: true`, and an explicit lifecycle-build allowlist.

**Verified:** clean frozen installs verify the lockfile against the policy. Required lifecycle scripts are limited to `esbuild` and `workerd`; `workerd` was added only after `ERR_PNPM_IGNORED_BUILDS` proved the locked Wrangler graph required it. No wildcard or `dangerouslyAllowAllBuilds` bypass exists.

### P1 — mutable deployment CLI

**Detected:** recovery deployment used `npx wrangler deploy` while Wrangler was absent from the project dependency graph, allowing release-time CLI resolution to drift.

**Remediated:** pinned project-local `wrangler@4.127.1`, committed the resulting lockfile, changed the recovery deploy script to `pnpm wrangler deploy`, and added `tests/architecture/deploy-toolchain.test.mjs`.

**Verified:** isolated exact-head diagnostic ran a clean frozen install, deployment-toolchain contract, full architecture suite, typecheck, lint, formatting, static build, client-JS budget and static links successfully. Cloudflare preview also succeeded after the required `workerd` lifecycle build was explicitly allowlisted.

**Residual external:** Cloudflare's stored trigger commands were previously configured as `npx wrangler deploy` / `npx wrangler versions upload`. With the frozen project install they resolve the pinned local Wrangler, but the external configuration should be normalized to explicit `pnpm wrangler ...`; no Cloudflare configuration write connector is available in this session.

### P1 — GitHub source promotion had no enforceable exact-head signal

**Detected:** repository ruleset read-back was `[]`, direct writes to `main` were possible, and no GitHub job existed that a future ruleset could require.

**Remediated:** ADR 0005 adds `Source Assurance` with two jobs: `Quality Gates` and `Browser Assurance`. Both check out the exact candidate SHA, use `contents: read`, do not persist checkout credentials, use full 40-character action SHAs, reference no repository secrets, and contain no Cloudflare deployment command.

**Verified:** on PR #68 candidate `b2b3779e1c910e372677e6f093065a7b96f37e90`, `Quality Gates`, `Browser Assurance`, and `Workers Builds: blueskyz-web` all completed successfully before Wrangler integration. The combined head is re-verified again before promotion.

**Residual external:** `GET /repos/BlueSkyz-Labs/SGPS-Marketing/rulesets` still returns `[]`. Issue #8 remains open. CI existence is not treated as ruleset enforcement.

### P2 — governance/documentation drift

**Detected:** README/remaining-convergence still described pnpm 11.6 and/or the superseded blanket prohibition on GitHub Actions; PR #67 remained misleadingly open after its material change had already landed.

**Remediated:** README, QA strategy, AGENTS guidance, ADR index and remaining-convergence were reconciled to ADR 0005. PR #67 was closed as superseded rather than merged over newer `main`.

### P2 — repository metadata drift

**Detected:** GitHub repository description still advertises the retired Next.js/Framer Motion/Cloudflare Pages architecture and `portfolio.tonydemo.com`.

**Status:** **EXTERNAL CONFIG UPDATE REQUIRED**. Current connector can read repository metadata but exposes no repository-description update action. In-repo README/ADR documentation is authoritative and corrected.

## Threat model / red-team scope

The product is a static Astro marketing front end: no application authentication, tenant store, server API, database, queue, or mutable business transaction exists in this repository. Applicable trust boundaries are GitHub source → package registry/lockfile → build runner → Cloudflare artifact → browser, plus owner/product evidence → content schema → generated HTML.

Controls reviewed include dependency/lifecycle compromise, action pinning and CI token scope, deployment CLI drift, secrets, CSP/header bypass, unsafe JSON-LD serialization, non-production URL/canonical poisoning, false product claims, local proof-asset constraints, static-link failures, noindex behavior and browser accessibility/performance gates. Backend-specific BOLA/IDOR/session/transaction/database controls are N/A for the current static architecture rather than assumed PASS.

## Security and QA evidence

- Architecture contracts: 85/85 passed before deploy-toolchain integration; isolated deploy hardening raised the suite to 87/87 and passed.
- Typecheck: zero errors/warnings/hints on verified candidate runs.
- ESLint: zero-warning gate passed.
- Prettier: canonical formatting gate passed after formatter-root-cause remediation.
- Build/static export, client JavaScript budget and static-link validation passed on verified candidates.
- Playwright Chromium + axe and Lighthouse passed on PR #68 candidate before final combined-head verification.
- Cloudflare preview Builds succeeded for the hardening candidate and after the Wrangler lifecycle-policy remediation.
- Security headers/CSP, public-truth gates, product-schema behavior, JSON-LD escaping, noindex/SEO and proof provenance are regression-tested architecture contracts.

## Supply-chain review

- Astro remains on the current 7.3.1 line and above the patched floors for the reviewed Astro XSS advisories.
- Wrangler 4.127.1 is deliberately locked rather than blindly taking a just-published version and is above the patched floor for the reviewed Wrangler command-injection advisory.
- Dependabot covers pnpm and GitHub Actions with bounded update noise.
- No production release artifacts are published through GitHub Releases; Cloudflare Workers Builds is the managed deployment authority. SLSA-style signed release artifacts are therefore not asserted as implemented.

## Residual truth / owner gates

- Production `PUBLIC_CONTACT_EMAIL` and `PUBLIC_SECURITY_EMAIL` remain absent. `validate:public-truth` must stay fail-closed and must not be bypassed with invented addresses.
- Public product entries, customer proof, photography and other owner facts remain evidence-gated.
- Privacy-conscious RUM design exists, but production telemetry remains disabled until collection purpose/provider/retention/privacy treatment is approved.

## Promotion rule

Do not merge #68 until the **current combined head** has successful `Quality Gates`, `Browser Assurance`, and Cloudflare preview evidence, material PR review findings are resolved, and final diff/red-team review finds no remaining agent-fixable P0/P1. Merge must use the PR path with `expected_head_sha`; direct-to-`main` is not an acceptable fallback.
