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

**Verified:** isolated exact-head diagnostics ran a clean frozen install, deployment-toolchain contract, full architecture suite, typecheck, lint, formatting, static build, client-JS budget and static links successfully. Cloudflare preview also succeeded after the required `workerd` lifecycle build was explicitly allowlisted.

**Residual external:** Cloudflare's stored trigger commands were previously configured as `npx wrangler deploy` / `npx wrangler versions upload`. With the frozen project install they resolve the pinned local Wrangler, but the external configuration should be normalized to explicit `pnpm wrangler ...`; no Cloudflare configuration write connector is available in this session.

### P1 — vulnerable Lighthouse/LHCI transitive tooling graph

**Detected:** `pnpm audit` found two High advisories in the LHCI-only development graph: vulnerable `tmp` path traversal and `extract-zip` symlink traversal. After removing those High paths, a full Moderate audit identified vulnerable `uuid` and `qs` versions beneath `@lhci/cli`.

**Remediated:** kept `@lhci/cli@0.15.1` API surface stable while applying narrow pnpm workspace overrides: `tmp: 0.2.7`, `lighthouse: 13.4.1`, `uuid: 11.1.1`, and `qs: 6.16.0`. The Lighthouse override removes the `extract-zip` path. `tests/architecture/tooling-vulnerabilities.test.mjs` rejects regression to the vulnerable graph.

**Verified:** a lifecycle-free writer generated the lockfile while holding temporary write permission; dependency lifecycle code was not executed with the write token. A separate exact-head read-only verifier then proved:

- clean frozen install and supply-chain policy validation PASS;
- `pnpm audit --audit-level=moderate` → `No known vulnerabilities found`;
- tooling advisory contract PASS;
- architecture contracts 88/88 PASS;
- typecheck 0 errors/warnings/hints, ESLint and Prettier PASS;
- static build, client-JS budget and static links PASS;
- Playwright Chromium + axe 33/33 PASS;
- Lighthouse CI runs 3/3 PASS with the overridden Lighthouse runtime.

The local Lighthouse SEO score remains 0.69 only because `PUBLIC_SITE_URL=http://127.0.0.1:3000` intentionally triggers the non-production `noindex` control; diagnostic output identified the sole failed SEO audit as `is-crawlable`. This is a **JUSTIFIED LOCAL-TEST EXCEPTION**, not a production SEO defect and not a reason to weaken the preview noindex behavior.

### P1 — GitHub source promotion had no enforceable exact-head signal

**Detected:** repository ruleset read-back was `[]`, direct writes to `main` were possible, and no GitHub job existed that a future ruleset could require.

**Remediated:** ADR 0005 adds `Source Assurance` with two jobs: `Quality Gates` and `Browser Assurance`. Both check out the exact candidate SHA, use `contents: read`, do not persist checkout credentials, use full 40-character action SHAs, reference no repository secrets, and contain no Cloudflare deployment command.

**Verified:** multiple PR #68 candidate heads have completed `Quality Gates`, `Browser Assurance`, and `Workers Builds: blueskyz-web` successfully. The final combined head is re-verified before any promotion decision.

**Remediated after handoff:** GitHub ruleset `main-promotion-governance` (`22500299`) was created active on 2026-09-08 and read back from `GET /repos/BlueSkyz-Labs/SGPS-Marketing/rulesets/22500299`. The read-back confirms target `refs/heads/main`, pull-request-before-merge, strict required checks `Quality Gates` and `Browser Assurance`, conversation resolution, non-fast-forward blocking, deletion blocking, and no bypass actors. A direct-write mutation test was intentionally not attempted because the safety contract forbids a potentially mutating proof; the ruleset API read-back is the recorded non-destructive enforcement evidence. Issue #8 was updated and closed after this verification.

### P2 — governance/documentation drift

**Detected:** README/remaining-convergence described obsolete pnpm and/or source-assurance behavior; PR #67 remained misleadingly open after its material change had already landed.

**Remediated:** README, QA strategy, AGENTS guidance, ADR index and remaining-convergence were reconciled to ADR 0005. PR #67 was closed as superseded rather than merged over newer `main`.

### P2 — repository metadata drift

**Detected:** GitHub repository description still advertises the retired Next.js/Framer Motion/Cloudflare Pages architecture and `portfolio.tonydemo.com`.

**Remediated after handoff:** GitHub repository description was updated and read back as: `BlueSkyz Labs marketing site — Astro 7 static architecture on Cloudflare Workers, with evidence-gated product truth and hardened source assurance.`

## Threat model / red-team scope

The product is a static Astro marketing front end: no application authentication, tenant store, server API, database, queue, or mutable business transaction exists in this repository. Applicable trust boundaries are GitHub source → package registry/lockfile → build runner → Cloudflare artifact → browser, plus owner/product evidence → content schema → generated HTML.

Controls reviewed include dependency/lifecycle compromise, action pinning and CI token scope, deployment CLI drift, secrets, CSP/header bypass, unsafe JSON-LD serialization, non-production URL/canonical poisoning, false product claims, local proof-asset constraints, static-link failures, noindex behavior and browser accessibility/performance gates. Backend-specific BOLA/IDOR/session/transaction/database controls are N/A for the current static architecture rather than assumed PASS.

## Security and QA evidence

- Architecture contracts: 88/88 PASS on the fully patched tooling diagnostic graph.
- Dependency audit: Moderate-and-higher audit PASS with no known vulnerabilities on that exact graph.
- Typecheck: zero errors/warnings/hints.
- ESLint and Prettier: PASS.
- Build/static export, client JavaScript budget and static-link validation: PASS.
- Playwright Chromium + axe: 33/33 PASS.
- Lighthouse: 3/3 runs processed successfully; local `is-crawlable` warning is explained by intentional preview `noindex` behavior.
- Cloudflare preview Builds succeeded on preceding integrated hardening heads; final combined-head read-back is required before promotion.
- Security headers/CSP, public-truth gates, product-schema behavior, JSON-LD escaping, noindex/SEO and proof provenance are regression-tested architecture contracts.

## Supply-chain review

- pnpm 11.25.0 is integrity-pinned through Corepack metadata and constrained to major 11.
- Lifecycle builds are fail-closed and limited to `esbuild` and `workerd`.
- Wrangler 4.127.1 is project-local and lockfile-pinned.
- LHCI transitive advisories are constrained by explicit workspace overrides plus a regression test; Moderate-and-higher audit is clean on the verified graph.
- Dependabot covers pnpm and GitHub Actions with bounded update noise.
- No production release artifacts are published through GitHub Releases; Cloudflare Workers Builds is the managed deployment authority. SLSA-style signed release artifacts are therefore not asserted as implemented.

## Residual truth / owner gates

- Production `PUBLIC_CONTACT_EMAIL` and `PUBLIC_SECURITY_EMAIL` remain absent. `validate:public-truth` must stay fail-closed and must not be bypassed with invented addresses.
- Public product entries, customer proof, photography and other owner facts remain evidence-gated.
- Privacy-conscious RUM design exists, but production telemetry remains disabled until collection purpose/provider/retention/privacy treatment is approved.

## Promotion rule

Do not merge #68 until the **current combined head** has successful `Quality Gates`, `Browser Assurance`, and Cloudflare preview evidence, material PR review findings are resolved, final diff/red-team review finds no remaining agent-fixable P0/P1, and governance requirements in the committed execution contract are satisfied or explicitly reclassified by an authoritative decision. Merge must use the PR path with `expected_head_sha`; direct-to-`main` is not an acceptable fallback.
