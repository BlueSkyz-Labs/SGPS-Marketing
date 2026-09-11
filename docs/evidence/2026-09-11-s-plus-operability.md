# S+ Production Operability: Smoke, Observability, Rollback — 2026-09-11

**Scope:** S+ Task 12C / issue #101. Ties release confidence to exact deployed
evidence using the repository's real Cloudflare deployment model.

## Deploy model (as-is)

- **Cloudflare Workers Builds is the build/deploy authority.** Pull requests
  get preview deployments; merges to `main` deploy production.
- GitHub Actions is **source assurance only** (read-only token, no deploy
  steps, no Cloudflare credentials) — see AGENTS.md and ADR 0005.
- The ruleset `main-promotion-governance` blocks direct pushes to `main`;
  every change lands via PR with strict required checks (Quality Gates +
  Browser Assurance, branch up-to-date).

## Post-deploy smoke contract

Run after every production deploy:

```bash
SMOKE_COMMIT_SHA=<deployed-main-sha> node scripts/smoke-production.mjs
```

`scripts/smoke-production.mjs` performs read-only checks and exits non-zero on
any failure:

- EN home responds 200, contains the hero proposition, carries no `noindex`;
- VI home responds 200 with the localized hero;
- `privacy` / `security` / `support` routes respond 200 (EN + VI);
- canonical metadata matches the production domain on `/en/about/`;
- the seven legacy root routes (`/`, `/about/`, `/contact/`, `/privacy/`,
  `/security/`, `/support/`, `/products/`) redirect to their `/en/`
  equivalents — accepting either an edge 3xx (`_redirects`) or a
  meta-refresh stub (fallback hosting);
- `robots.txt` allows crawling and links the sitemap;
- the sitemap lists exactly the 14 canonical localized routes (no legacy
  duplicates);
- critical navigation links are present on the EN home.

**Evidence recording:** the smoke output includes the site, timestamp, and
the deployed commit SHA (pass `SMOKE_COMMIT_SHA`). Pair it with the
Cloudflare deployment identity: Workers & Pages → `blueskyz-web` →
**Deployments** shows the build ID, commit, and timestamp for the serving
version; `cf-ray` response headers identify the edge for a given request.

## Rollback / fix-forward procedure

1. **Fix-forward (preferred):** open a revert PR (or a corrective PR) against
   `main`; required checks run on the exact head; merge when green; Workers
   Builds redeploys automatically; rerun the smoke contract.
2. **Fast rollback (incident path):** Cloudflare dashboard → Workers & Pages →
   `blueskyz-web` → Deployments → roll back to the previous healthy build.
   Record the rolled-back build ID + reason; then land a fix-forward PR so
   `main` matches the serving state again.
3. Never force-push or rewrite `main` history; the ruleset blocks it anyway.
4. Never commit credentials or secrets; deployment secrets live only in the
   Cloudflare build environment.

## Observability (as-is, honest)

- **Available:** Cloudflare edge analytics and Workers logs (request volume,
  status classes, latency, error rates) at the platform level; GitHub
  Actions run history for source assurance; Lighthouse evidence per PR.
- **Not present:** no application backend, no client-side telemetry
  transmission (S+ Task 12B deliberately ships the taxonomy with
  transmission disabled pending a provider + privacy decision), no
  structured error reporting service.
- **Revisit condition:** if a backend or analytics provider is adopted,
  the Task 12B taxonomy is the ready-made event contract; alerts/SLIs
  should be defined against the platform metrics first.

## Verification performed (this task)

- The smoke script was executed against live production on 2026-09-11:
  all content/robots/sitemap/navigation checks passed; the seven legacy
  redirect checks **failed against the pre-fix deployment** — live
  confirmation of the Task 12A duplicate-content finding.
- **Post-merge read-back:** rerun the smoke after the Task 12A fix
  deploys; all checks must pass (reported on the PR).
