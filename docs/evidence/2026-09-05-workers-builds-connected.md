# Workers Builds connected — blueskyz-web — 2026-09-05

## Outcome

Agent closed the prior Builds Git Connect gap **via Cloudflare Builds API**
(no dashboard click required). First production build succeeded.

| Item                 | Value                                         |
| -------------------- | --------------------------------------------- |
| Worker               | `blueskyz-web`                                |
| Worker tag           | `8a8fece25ca94b0cb05bcabac63c9020`            |
| Repo connection UUID | `6e5f43ce-ea83-4233-b747-077735e68d36`        |
| GitHub               | `BlueSkyz-Labs/SGPS-Marketing` (`1350655394`) |
| Production trigger   | `06090354-5888-4fc9-981d-6937c2be2eb7`        |
| Preview trigger      | `a5a17355-aa5c-4ed9-9edf-ff135a12757b`        |
| First build UUID     | `2fa74438-1fc0-408c-beb2-70eeb653c6bc`        |
| Build outcome        | **stopped / success**                         |
| Deployed version     | `c0c5e193-5c51-4c05-8c37-245570d4d5c2`        |
| Builds list          | `total_count=1` (was `0`)                     |

## Commands configured

Production + preview build:

```text
pnpm install --frozen-lockfile && pnpm build && pnpm check:client-budget && pnpm check:static-links
```

- Production deploy: `pnpm wrangler deploy` (branch `main`; verified 2026-09-08)
- Preview deploy: `pnpm wrangler versions upload` (all branches except `main`; verified 2026-09-08)
- Trigger env: `PUBLIC_SITE_URL=https://blueskyz-web.thinhnguyen-km10.workers.dev`

`pnpm validate:public-truth` is **intentionally omitted** until owner supplies a
canonical corporate domain + production emails (the gate rejects `*.workers.dev`
by design).

## How it was done

1. Confirmed Cloudflare GitHub App already installed for `BlueSkyz-Labs`
   (`GET /pages/connections/github` → org present; repos list includes
   `SGPS-Marketing`).
2. `PUT /builds/repos/connections` → repo connection created.
3. `POST /builds/triggers` ×2 (production + preview) using existing account
   build token `vungtaylai-production`.
4. `PATCH .../environment_variables` for `PUBLIC_SITE_URL`.
5. `POST .../builds` with `{"branch":"main"}` → queued → success (~1 min).

## GitHub check visibility

At verify time, `GET .../commits/main/check-runs` still returned `total_count=0`.
Builds success is evidenced on the Cloudflare Builds API; GitHub status-check
name for Issue #8 ruleset is still **unknown** until Cloudflare emits a check
or owner maps the actual check name after Connect settles.

## Supersedes

`docs/evidence/2026-09-04-workers-builds-gap.md` — gap closed for Git Connect /
non-empty Builds list. Remaining owner gates: production truth env, Issue #8
ruleset write, R4d/`sgps-core` read for this agent identity.
