# Production smoke, observability and rollback

Operational contract for `https://blueskyzlabs.com` (Cloudflare Workers static
assets). This document exists so an operator — or a new agent without context —
can verify a deployment, detect a bad release and recover from it without
guessing.

## 1. Deployment authority

- **Cloudflare Workers Builds** is the build and deploy authority
  (`repo: BlueSkyz-Labs/SGPS-Marketing`, branch `main`).
- **GitHub Actions is source assurance only**: no Cloudflare credentials, no
  deploy commands, read-only tokens, full commit-SHA pins (ADR 0005).
- Promotion is `branch → PR → Source Assurance → merge → Workers Builds`.

## 2. Post-deploy verification (always, in this order)

1. Confirm the deployed revision: `SMOKE_COMMIT_SHA=<sha> node scripts/smoke-production.mjs`.
   The smoke suite checks, at minimum: EN/VI home 200, canonical pages,
   legacy redirects, the branded 404 on every fallback path, the evidence
   passport surface, `/.well-known/sgps.json` (schema 1.0) and
   `/.well-known/security.txt` (Contact + Expires).
2. Spot-check the edge header set (`curl -sI https://blueskyzlabs.com/en/`):
   HSTS, CSP (`script-src 'self'`, `frame-ancestors 'none'`),
   `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
   `Referrer-Policy`, `Permissions-Policy`.
3. Record the outcome in a post-merge read-back ledger under `docs/evidence/`
   (declared revision + smoke result + host), which
   `pnpm check:deployment-evidence` validates in CI.

## 3. Observability (deliberately minimal)

- **Provider-level**: Cloudflare Workers request/deployment analytics in the
  dashboard (status codes, volume, errors).
- **Per-PR**: GitHub Source Assurance (deterministic gates + browser matrix +
  Lighthouse).
- **No client-side telemetry**: no analytics, no RUM, no cookies, no storage —
  transmission is intentionally off until a provider/privacy decision is made
  (recorded as an owner decision in `docs/current-work.json`).
- Consequence: a purely client-side regression that no automated test covers
  would be detected by the smoke suite, the browser matrix or a human report —
  not by production monitoring. Treat that as accepted residual risk, not as
  coverage.

## 4. Bad release — rollback vs fix-forward

**Choose fix-forward when** the defect is content-level, the fix is small and
the pipeline is healthy: open a PR, pass Source Assurance, merge.

**Roll back when** the deployed revision is materially broken (broken layout,
broken routes, security-relevant regression) and a fix cannot land quickly:

1. Cloudflare dashboard → the Worker → **Deployments** → select the last known
   good version → _Rollback / redeploy that version_.
   (Equivalent: re-run Workers Builds on the last known good `main` commit.)
2. Immediately re-run §2 post-deploy verification against the rolled-back
   revision and record the ledger entry (`pnpm check:deployment-evidence`).
3. Open an issue or PR describing the incident, the rolled-back revision and
   the forward-fix plan; the fix follows the normal gates. No direct pushes to
   `main`, no bypassing protection.

**Never** patch production outside the pipeline, and never roll back without
re-running the smoke suite — an unverified rollback is not a recovery.

## 5. Ownership

Single-human operator (owner) holds Cloudflare dashboard access, DNS and the
production email variables. Agent lanes can prepare everything up to — but not
including — those provider-private actions.
