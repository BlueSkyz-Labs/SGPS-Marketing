# SGPS-DEC-2026-043 local mapping: RC staging parity and config as code

**Date:** 2026-10-24 GMT+7
**Status:** VERIFYING (not ADOPTED: ADOPTED needs the merge of this mapping and its guard, AGENTS rule 54).
**Reference (exact):** `decisions/SGPS-DEC-2026-043-release-candidate-staging-parity-config-as-code.md` at sgps-core `origin/main@75715d89ccb7f07e58ed0c5e56d601eab8c7bf2d` (status there: VALIDATE).
**Guard:** `tests/architecture/dec043-config-presence.test.mjs`.

Everything not provable from this repository is marked NOT VERIFIED. Nothing here reads or changes the Cloudflare dashboard.

## P1 RC parity

- Pre-production here is the Cloudflare Workers Builds **PR preview build of the exact PR head** (`docs/QA_STRATEGY.md` flow: Source Assurance, then Workers preview, then E4 review, then merge).
- Production is a **separate Workers Builds build of `main`** (`docs/QA_STRATEGY.md` section "Workers Builds (dashboard)"): `pnpm install --frozen-lockfile && pnpm validate:public-truth && pnpm build && pnpm check:client-budget && pnpm check:static-links`. It is a rebuild after merge, not a promotion of the previewed artifact. The merge commit can differ from the tested PR head, so green evidence for the head is not evidence for the production build (see P4).
- Declared, known differences between preview and production inputs:
  1. `PUBLIC_SITE_URL`: production requires exactly `https://blueskyzlabs.com` (`src/lib/truth.ts:98-107`, enforced by `validate:public-truth`). `src/data/site.ts:17` falls back to `http://localhost:4321` when unset. Non-production URLs switch on noindex, robots disallow and an empty sitemap (`isNonProductionSiteUrl`, `src/lib/truth.ts:74`). Where preview builds get this value from is NOT VERIFIED.
  2. Build command: `docs/QA_STRATEGY.md` allows preview builds to omit `validate:public-truth`.
  3. `PUBLIC_SECURITY_EMAIL`: required by the production gate, not declared in the repo (see P3).
- Whether the dashboard holds a different build command, variable set or branch-control setting for previews than the documented one is NOT VERIFIED.
- `wrangler.toml` declares no `[vars]` and no environments, and `workers_dev = false`, `preview_urls = false` (lines 1-8): nothing in the Worker config differs per environment.

## P2 Schema first: NOT_APPLICABLE

The site has no database, no migration and no runtime binding: static assets-only Worker (`wrangler.toml` `[assets]`, no `d1_databases`/`kv_namespaces`; `docs/sgps/EFFECTIVE_SGPS_CONTEXT.md` DEC-029 baseline "zero runtime bindings"). Re-open if a server-side runtime, form or database is introduced.

## P3 Config as code

Keys the source reads (discovered from `src/data/site.ts:17-37`, `src/lib/truth.ts:105-115`, `astro.config.mjs:8`, `scripts/validate-public-truth.mjs:5-7`). All are non-secret, public build-time values. `astro build` runs in Vite production mode, so it loads `.env.production` for every Workers Builds build, preview and production alike (framework behaviour, not exercised here).

| Key                     | Declared in repo                                                   | Class                 | Note                                                                          |
| ----------------------- | ------------------------------------------------------------------ | --------------------- | ----------------------------------------------------------------------------- |
| `PUBLIC_CONTACT_EMAIL`  | `.env.production:3`                                                | required, declared    | guarded                                                                       |
| `PUBLIC_SUPPORT_EMAIL`  | `.env.production:5`                                                | required, declared    | guarded                                                                       |
| `PUBLIC_SITE_URL`       | not in `.env.production`; template value only at `.env.example:12` | **GAP, NOT VERIFIED** | required by production gate; presumed dashboard-only                          |
| `PUBLIC_SECURITY_EMAIL` | not in `.env.production`; empty at `.env.example:16`               | **GAP, NOT VERIFIED** | required by production gate (`src/lib/truth.ts:115`); presumed dashboard-only |
| `PUBLIC_PRIVACY_EMAIL`  | `.env.example:15` (empty)                                          | optional              | absent yields null and a soft-landed Act path                                 |
| `PUBLIC_FOUNDER_EMAIL`  | `.env.example:17` (empty)                                          | optional              | same                                                                          |

Notes:

- `astro.config.mjs:8` reads `process.env.PUBLIC_SITE_URL` before Vite loads env files, so a value only in `.env.production` would not reach it. Whether the Astro `site` setting is affected is NOT VERIFIED; do not move `PUBLIC_SITE_URL` without testing both consumers.
- `scripts/deploy-workers.mjs:8` (manual deploy) requires `PUBLIC_SITE_URL` in the shell. It runs `wrangler deploy` with a config that has no `[vars]`, so it declares nothing that could be wiped; the DEC-043 evidence-2 hazard does not apply to current repo config.
- **Owner gap:** `PUBLIC_SITE_URL` and `PUBLIC_SECURITY_EMAIL` production values, and any other dashboard variable, cannot be read from the repo. Declaring them in repo config is a production config change and stays Owner-gated. No value is guessed here.
- No secret is declared; the guard also rejects secret-shaped key names.

## P4 Evidence binding

`AGENTS.md` hard rule: "Green evidence belongs only to the exact tested SHA. UNKNOWN / skipped / stale checks are not PASS." Evidence from a preview of one head is NOT VERIFIED for a production build of a different `main` commit or different dashboard inputs. Post-deploy smoke binds `SMOKE_COMMIT_SHA` (`docs/operations/production-smoke-and-rollback.md`).

## P5 Local mapping

This document. Central indexing follows merged evidence only (DEC-043 point 5, rule 54).

## Guard and negative proof

`tests/architecture/dec043-config-presence.test.mjs` (point 6, config presence):

1. every `PUBLIC_*` key the source reads must be classified (a new key forces a decision);
2. required keys must be declared in `.env.production`;
3. no secret-shaped key may be declared.

Negative proof: deleting `PUBLIC_CONTACT_EMAIL` from `.env.production` made test 2 fail ("must be declared"); restored, it passes. Pre-deploy parity (point 6, second check) is NOT IMPLEMENTED: no staging runtime exposes a commit or schema to compare.
