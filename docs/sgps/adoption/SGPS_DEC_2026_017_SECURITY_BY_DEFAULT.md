# SGPS-DEC-2026-017 — Security-by-Default: local mapping (SGPS-Marketing)

**Decision status:** LOCK, portfolio-mandatory standing doctrine; no project-local waiver or exception.
**Canonical:** sgps-core `standards/security/SECURITY_BY_DEFAULT_DOCTRINE.md` at `91e5c1a`.
**Project pin:** SGPS `v1.13.0`, unchanged. This record maps a source-overlay doctrine and does not repin.
**Bound to:** `main@ecc67e7` (2026-10-04).
**Guard:** `tests/architecture/sgps-sbd-mapping.test.mjs`. It fails if an invariant is missing, duplicated, waived, or cites an evidence path that does not exist.

## Scope

The product is a static brand site: Astro output served by an assets-only Cloudflare Worker. It has:

- no application authentication;
- no forms;
- no payment authority (Owner D-0);
- no runtime agent.

Deployment authority sits with Cloudflare Workers Builds. GitHub Actions is source assurance only.

## Invariant map

Dispositions:

- `ENFORCED`: an existing control and its guard are cited.
- `NOT_APPLICABLE`: the reason is stated, with the trigger that would make the invariant apply.
- `OWNER_GATED`: the required evidence needs an Owner action and stays NOT VERIFIED.

`WAIVED` is not a valid disposition (SBD-INV-16).

| Invariant    | Disposition    | Local control                                                                                                                                                                                                                             | Evidence                                                                                                                                                                                          |
| ------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SBD-INV-01` | ENFORCED       | Missing facts fail closed. The public-truth promotion state stays `BLOCKED_OWNER_FACT` while the contact emails are empty, and the merge policy fails until the Owner labels a protected change                                           | `scripts/check-promotion-state.mjs`, `tests/architecture/promotion-state.test.mjs`, `tests/architecture/merge-policy.test.mjs`                                                                    |
| `SBD-INV-02` | NOT_APPLICABLE | The site has no application authentication or authorization. The pre-launch Cloudflare Access gate is provider authority. Applies when an authenticated surface is added                                                                  | `docs/evidence/2026-10-04-cloudflare-zone-readback.md`                                                                                                                                            |
| `SBD-INV-03` | ENFORCED       | CI holds a read-only token (`contents: read`, `persist-credentials: false`) and no Cloudflare secret. Deploy authority is Workers Builds, not Actions                                                                                     | `.github/workflows/quality-gates.yml`, `tests/architecture/supply-chain-policy.test.mjs`, `tests/architecture/deploy-contract.test.mjs`                                                           |
| `SBD-INV-04` | ENFORCED       | No host implies blanket access. `workers_dev` and preview URLs are disabled, and `www` is a 301 to the apex, so no bypass host serves the site                                                                                            | `wrangler.toml`, `tests/architecture/cloudflare-workers.test.mjs`, `docs/evidence/2026-10-04-cloudflare-zone-readback.md`                                                                         |
| `SBD-INV-05` | ENFORCED       | The Worker is assets-only, with no `main` script, no bindings and no secrets, so compromising it grants no other authority. The CSP is same-origin with Trusted Types and `frame-ancestors 'none'`                                        | `wrangler.toml`, `tests/architecture/cloudflare-workers.test.mjs`, `public/_headers`, `tests/architecture/security-headers.test.mjs`                                                              |
| `SBD-INV-06` | ENFORCED       | The deployable component's union of capabilities is static asset serving only: no KV, D1, R2 or service bindings and no secrets                                                                                                           | `wrangler.toml`, `tests/architecture/cloudflare-workers.test.mjs`                                                                                                                                 |
| `SBD-INV-07` | ENFORCED       | The merge policy runs from the pull request's BASE commit, so a change cannot weaken the gate that evaluates it. Gate, CI, hook and policy paths are protected and need the Owner's label                                                 | `.github/workflows/quality-gates.yml`, `scripts/check-merge-policy.mjs`, `tests/architecture/merge-policy.test.mjs`                                                                               |
| `SBD-INV-08` | ENFORCED       | Green configuration or scans never stand alone. Evidence must bind an exact SHA and include runtime and negative proof (v9 §8.3), plus live edge evidence for edge claims                                                                 | `docs/superpowers/plans/2026-10-02-v9-completion-golive.md`, `docs/evidence/2026-10-04-pre-golive-redteam-v11.md`                                                                                 |
| `SBD-INV-09` | OWNER_GATED    | Rollback eligibility is checked from source (`check-rollback-candidate`). A real provider rollback or restore has not been observed, so recovery stays NOT VERIFIED until the Owner runs a Workers version rollback drill                 | `scripts/check-rollback-candidate.mjs`                                                                                                                                                            |
| `SBD-INV-10` | ENFORCED       | Agents hold no root or R4 authority. Agents never add or remove `owner-approved`. Account-level Cloudflare changes (Access, account rules) are held for the Owner                                                                         | `AGENTS.md`, `tests/architecture/merge-policy.test.mjs`                                                                                                                                           |
| `SBD-INV-11` | ENFORCED       | Agent output is a proposal. Merges require exact-head Quality Gates and Browser Assurance under ruleset `main-promotion-governance`, plus the Owner label for protected paths                                                             | `AGENTS.md`, `scripts/check-merge-policy.mjs`                                                                                                                                                     |
| `SBD-INV-12` | ENFORCED       | Agents cannot widen their own authority. Policy, gates, CI and agent-policy files are protected paths                                                                                                                                     | `scripts/check-merge-policy.mjs`, `tests/architecture/merge-policy.test.mjs`                                                                                                                      |
| `SBD-INV-13` | NOT_APPLICABLE | No material autonomous runtime agent runs inside this product. Development agents act through Owner-issued, Owner-revocable GitHub and Cloudflare credentials outside the product. Applies if the C3 Concierge or any runtime agent ships | `AGENTS.md`                                                                                                                                                                                       |
| `SBD-INV-14` | ENFORCED       | New dependencies and major bumps are protected changes. pnpm enforces `minimumReleaseAge` and blocks exotic subdependencies. Audit exceptions expire and carry an exposure guard                                                          | `scripts/check-merge-policy.mjs`, `pnpm-workspace.yaml`, `tests/architecture/supply-chain-policy.test.mjs`, `docs/security/audit-exceptions.json`, `tests/architecture/audit-exceptions.test.mjs` |
| `SBD-INV-15` | ENFORCED       | Public, product and architecture truth is bound to canonical registries (the product registry and `architecture/sgps-model.json`). Views are derived and cannot become authority                                                          | `tests/architecture/public-truth-gate.test.mjs`, `tests/architecture/product-truth.test.mjs`, `architecture/sgps-model.json`                                                                      |
| `SBD-INV-16` | ENFORCED       | No waiver exists. The single dependency-audit exception is time-boxed (expires 2026-11-03), guarded, Owner-labelled, and does not relax any SBD invariant. This map has no `WAIVED` row, and its guard rejects one                        | `docs/security/audit-exceptions.json`, `tests/architecture/sgps-sbd-mapping.test.mjs`                                                                                                             |

## Residuals (NOT VERIFIED)

- **SBD-INV-09:** a provider rollback drill, which is an Owner action.
- **Live response headers on the apex:** verified after the Access lift by v9 T3.
- **Routing this doctrine from `AGENTS.md`:** a protected path, so the Owner labels the change.
