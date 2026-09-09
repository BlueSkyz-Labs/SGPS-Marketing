# Global Elite hardening evidence — 2026-09-07 / post-merge reconciliation 2026-09-08

> **Evidence status:** the original hardening campaign is promoted and historical. PR #68 and the follow-up privacy/anti-drift PR #75 are merged and provider-verified. New findings are recorded as new Detected → Remediated → Verified work rather than pretending the repository is frozen at the 2026-09-07 baseline.

## Scope and immutable references

- Repository: `BlueSkyz-Labs/SGPS-Marketing`
- Original audit baseline: `main@d0ef2a8dcb3b463ad4b774a1ad29bf6fa6155235`
- Original delivery branch: `audit/global-elite-hardening-2026-09-07`
- PR #68: `security: fail-closed supply chain and source assurance`
- PR #68 final head: `3da147b7ae7d7da7c5f60c9120dc7087e35d0690`
- PR #68 merge commit: `f3079c7c1c7385e4f7079a08f537bf1f34578980`
- PR #75 final head: `9b5038b57a7920977704c2e9e71e9ae03a5f8253`
- PR #75 merge commit: `b050cb9fd216f5b0bb305cde51a731faf0d95c96`
- Governing decisions: ADR 0004 (Astro 7 / Workers Static Assets) and ADR 0005 (GitHub Source Assurance + Cloudflare deployment dual control)

## Detected → remediated → verified

### P1 — fail-open / misleading package-manager policy

**Detected:** `.npmrc` contained pnpm policy including an unsafe release-age/broad-build posture while pnpm 11 project policy belongs in `pnpm-workspace.yaml`.

**Remediated:** removed the inert/unsafe `.npmrc` policy; pinned pnpm 11.25.0 with Corepack SHA-512 integrity; set `minimumReleaseAge: 1440`, strict missing-time handling, `blockExoticSubdeps: true`, `strictDepBuilds: true`, and an explicit lifecycle-build allowlist.

**Verified:** clean frozen installs succeed under the policy. Required lifecycle scripts are limited to `esbuild` and `workerd`; no wildcard or `dangerouslyAllowAllBuilds` bypass exists.

### P1 — mutable deployment CLI

**Detected:** recovery deployment used bare `npx wrangler deploy` while Wrangler was absent from the project graph, allowing release-time CLI drift.

**Remediated:** pinned project-local `wrangler@4.127.1`, committed the lockfile, changed repository recovery deploy to `pnpm wrangler deploy`, and added `tests/architecture/deploy-toolchain.test.mjs`.

**Verified:** clean frozen-install diagnostics, deployment-toolchain contract, architecture, typecheck, lint, formatting, build, client-JS budget and static links passed. Cloudflare stored preview and production commands were later read back as `pnpm wrangler versions upload` and `pnpm wrangler deploy`, and provider builds succeeded with the normalized commands.

### P1 — vulnerable Lighthouse/LHCI transitive tooling graph

**Detected:** `pnpm audit` found High advisories in the LHCI development graph (`tmp`, `extract-zip`) and, after those paths were removed, Moderate advisories in `uuid` and `qs`.

**Remediated:** retained `@lhci/cli@0.15.1` while applying narrow workspace overrides: `tmp: 0.2.7`, `lighthouse: 13.4.1`, `uuid: 11.1.1`, and `qs: 6.16.0`. The Lighthouse override removes the vulnerable `extract-zip` path. `tests/architecture/tooling-vulnerabilities.test.mjs` rejects regression.

**Verified:** clean frozen install, `pnpm audit --audit-level=moderate`, architecture, typecheck, lint, formatting, static build, budgets/links, Chromium Playwright/axe and Lighthouse all passed on the patched graph. Dependency audit is now an official `Quality Gates` step.

The local Lighthouse SEO reduction caused by intentional localhost/preview `noindex` remains a justified non-production behavior; it is not a reason to weaken indexing protection.

### P1 — unenforced source promotion

**Detected:** the repository initially had no active ruleset and therefore no provider-enforced requirement for exact-head source checks.

**Remediated:** ADR 0005 introduced `Source Assurance` with `Quality Gates` and `Browser Assurance`; both jobs use exact candidate SHA checkout, `contents: read`, `persist-credentials: false`, full-SHA action pins, no repository secrets and no Cloudflare deployment command.

**Verified:** repository ruleset `main-promotion-governance` (`22500299`) is active and targets only `refs/heads/main`. Provider read-back confirms pull-request-before-merge, strict `Quality Gates` + `Browser Assurance`, conversation resolution, non-fast-forward blocking, deletion blocking and no bypass actors. Issue #8 was closed after non-destructive read-back verification.

### P1 — persisted Worker invocation URLs exposed query strings

**Detected after promotion:** `main@2b4ff555917318cccf29400d637d82483909f0d7` persisted invocation logs with full head sampling but did not set Workers observability query-string redaction. Because invocation telemetry includes request URLs, persisting raw query strings creates unnecessary privacy/data-minimization exposure for campaign identifiers or future user-supplied URL parameters.

**Remediated and promoted in PR #75:** `wrangler.toml` sets `redact_query_string = true` under `[observability.logs]` while retaining observability, invocation logs and existing routing hardening. `tests/architecture/cloudflare-workers.test.mjs` requires the redaction setting.

**TDD evidence:** test-only commit `2104bf12866dd754a79a37fdf483753cc884a071` completed frozen install and dependency audit, then failed at Architecture contracts as expected because the production setting was absent. Minimal implementation commit `2b9434b122c932fe0b000084eaee08de06640727` subsequently passed dependency audit and the architecture contract.

**Final PR #75 evidence:** exact head `9b5038b57a7920977704c2e9e71e9ae03a5f8253` completed `Quality Gates` successfully (check `102132579642`), `Browser Assurance` successfully (check `102132850879`; Playwright/axe and Lighthouse), and `Workers Builds: blueskyz-web` successfully (check `102133101923`, Cloudflare build `eb18b5e0-d1c4-4e14-af6a-7f19b6e5e559`, version `11bbc33e-a8cf-4067-ae5b-16cdc1b47761`). Two consecutive settled-head deep-audit/red-team cycles produced no additional meaningful agent-actionable finding before promotion.

**Post-merge read-back:** PR #75 merged through the protected PR path on 2026-09-08 as `main@b050cb9fd216f5b0bb305cde51a731faf0d95c96`. That merge SHA independently completed `Quality Gates` successfully (check `102134804565`), `Browser Assurance` successfully (check `102135040015`), and `Workers Builds: blueskyz-web` successfully (check `102135197945`, Cloudflare build `e4a087cc-7f31-41ee-b0fb-ad0ffdb04320`, version `7d47b3ae-7e8e-48d9-8024-c389e115c332`). Repository read-back showed zero open pull requests and zero open issues after the merge.

### P1 — canonical production identity drift after ADR 0006

**Detected 2026-09-09:** ADR 0006 had already selected `https://blueskyzlabs.com` as the canonical organizational origin, but `src/lib/truth.ts` still exempted `tonydemo.com`, `www.tonydemo.com`, and `blueskyz.tonydemo.com` from non-production classification. Current SoT therefore conflicted with the newer accepted domain decision.

**Remediated in PR #77:** removed the temporary-host exemption and made the production truth gate accept only the exact canonical BlueSkyz origin while continuing to reject local, preview, documentation, staging, alternate-port, path, query, and retired `tonydemo.com` identities. `.env.example`, `AGENTS.md`, and the active residual plan were reconciled to ADR 0006 without rewriting historical evidence.

**TDD evidence:** the test-only candidate first failed exactly on retired `tonydemo.com` acceptance and the missing SGPS architecture model. After implementation, the canonical-origin assertions pass in Architecture contracts.

### P1 — new Wrangler/Miniflare transitive `sharp` advisory

**Detected 2026-09-09:** a fresh `pnpm audit --audit-level=moderate` failed High because `wrangler@4.127.1 → miniflare` resolved `sharp@0.35.2`, below the patched `0.35.4` floor.

**Remediated in PR #77:** added the narrow workspace override `sharp: 0.35.4` and regenerated the lockfile with lifecycle scripts disabled. The repository already used the patched Sharp line through other tooling, so the change avoided an unnecessary Wrangler upgrade.

**Verified before final promotion:** clean frozen install accepts the regenerated lockfile and `pnpm audit --audit-level=moderate` reports no known vulnerabilities. Final exact-head promotion checks remain governed by the normal PR ruleset rather than by the temporary lockfile/formatting helpers.

### P2 — missing SGPS-native canonical architecture model

**Detected 2026-09-09:** architecture truth existed across ADRs/config/code but there was no SGPS-native machine-readable canonical model. This left portfolio/system topology, ownership, trust boundaries, data-resource classification, deployment, and external dependencies without a single deterministic architecture source.

**Remediated in PR #77:** ADR 0007 adopts `architecture/sgps-model.json` as canonical architecture truth with stable IDs, immutable Git evidence references, graph-valid relationships, explicit N/A backend surface, and the invariant `VIEW_IS_DERIVED_NOT_ARCHITECTURE_TRUTH`. `scripts/generate-architecture-views.mjs` derives deterministic portfolio, context, component, dependency, data-flow, deployment, security/trust, and ownership views. Architecture tests fail closed on duplicate IDs, unknown parents/endpoints, parent cycles, invalid relation types, stale derived views, or fabricated API/Event entities.

**Factory learning:** a first deterministic-view implementation exposed a formatter/generator representation mismatch. The generator now formats generated JSON through the project-pinned Prettier implementation, so the derived-view freshness gate and repository format gate share one canonical representation instead of fighting each other.

### P2 — governance / documentation drift

**Detected:** README/residual plans/evidence accumulated stale descriptions of pnpm, Source Assurance, unresolved ruleset state, Cloudflare command normalization and pre-/post-merge status.

**Remediated:** README/QA/AGENTS/ADR guidance were reconciled during the original hardening; the post-merge reconciliation marks the hardening plan as historical/promoted and narrows the active remaining-convergence plan to genuine owner/privacy/product-direction gaps. Historical evidence is retained but obsolete pre-merge instructions are explicitly superseded by immutable promotion outcomes.

### P2 — repository metadata drift

**Detected:** repository description advertised retired Next.js/Framer Motion/Cloudflare Pages architecture.

**Remediated and verified:** repository description was updated and read back as `BlueSkyz Labs marketing site — Astro 7 static architecture on Cloudflare Workers, with evidence-gated product truth and hardened source assurance.`

## Threat model / red-team scope

The current product is a static Astro marketing front end: no application authentication, tenant store, server API, database, queue or mutable business transaction exists in this repository. Applicable trust boundaries are GitHub source → package registry/lockfile → build runner → Cloudflare artifact → browser, plus owner/product evidence → schema → generated HTML, and browser request metadata → Cloudflare observability storage.

Applicable attack/privacy paths include dependency/lifecycle compromise, mutable tool resolution, Action/workflow token compromise, deploy-authority confusion, CSP/header bypass, unsafe JSON-LD serialization, non-production canonical/index poisoning, false product claims, proof-path traversal, URL query leakage into telemetry, public bypass routes, and chained supply-chain paths. Backend-specific BOLA/IDOR/session/transaction/database controls remain N/A rather than assumed PASS.

## Promotion and post-merge evidence for PR #68

- Final head `3da147b7ae7d7da7c5f60c9120dc7087e35d0690`:
  - `Quality Gates` — PASS, check `101918609484`.
  - `Browser Assurance` — PASS, check `101918737841`.
  - `Workers Builds: blueskyz-web` — PASS, check `101918792135`, Cloudflare build `c3fe1d6e-7ee5-4f7a-883e-35d46607e1bd`.
- PR #68 merged through the PR path on 2026-09-08; merge commit `f3079c7c1c7385e4f7079a08f537bf1f34578980`.
- Ruleset `22500299` is active on `main` with the required controls and no bypass actor.
- Later `main@2b4ff555917318cccf29400d637d82483909f0d7` independently completed `Quality Gates`, `Browser Assurance`, and `Workers Builds: blueskyz-web` successfully after subsequent brand, routing and observability changes.
- Repository description and Cloudflare stored Wrangler commands are reconciled and no longer residual blockers.

## Supply-chain / release invariants

- pnpm 11.25.0 remains integrity-pinned and constrained to major 11.
- Lifecycle builds fail closed and are limited to `esbuild` and `workerd`.
- Wrangler 4.127.1 is project-local and lockfile-pinned.
- Moderate-and-higher dependency audit is an official source-assurance gate.
- GitHub Actions remains source assurance only; Cloudflare Workers Builds remains deployment authority.
- No GitHub Release artifact/signing claim is made because this repository deploys through Cloudflare Workers Builds rather than a GitHub release pipeline.

## Residual truth / owner gates

- Verified `PUBLIC_CONTACT_EMAIL` and `PUBLIC_SECURITY_EMAIL` remain absent; `validate:public-truth` must stay fail-closed and must not be bypassed with invented addresses.
- Public product entries, customer proof and photography remain owner/evidence-gated.
- Production RUM remains disabled until purpose/provider/retention/privacy treatment is approved.
- Optional Cursor access to private `sgps-core` is not a current runtime blocker.

## Current promotion rule

PR #68 and PR #75 are already merged; their former pre-merge rules are satisfied and superseded. Any future work must independently meet the active `main` ruleset: current exact-head `Quality Gates` and `Browser Assurance` must pass, provider deployment evidence must be green where applicable, material review findings must be resolved, and no actionable P0/P1 may remain. Direct-to-`main` is not an acceptable fallback.

For PR #77 and later promotions, bot-pushed helper commits are not accepted as final source-assurance evidence; promotion evidence must bind the settled exact head that actually received the required Source Assurance checks.