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
   The smoke suite checks, at minimum: EN/VI/zh-Hans home 200, canonical pages,
   legacy redirects, the branded 404 on every fallback path, the evidence
   passport surface, published-locale sitemap and no-JS language gateway, `/.well-known/sgps.json` (schema 1.0) and
   `/.well-known/security.txt` (Contact + Expires). It also fetches every locale home, products index and product
   page, and requires each same-origin asset they reference to return 200 with no
   redirect and a matching content-type; and it asserts the CSP directives, COOP,
   CORP, nosniff and `/_astro/*` immutable caching declared in `public/_headers`.
2. Spot-check the edge header set (`curl -sI https://blueskyzlabs.com/en/`):
   HSTS, CSP (`script-src 'self'`, `frame-ancestors 'none'`),
   `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
   `Referrer-Policy`, `Permissions-Policy`.
3. Record the outcome in a post-merge read-back ledger under `docs/evidence/`
   with the **full 40-character deployed Git revision**, smoke result and
   canonical host read-back.
4. Certify that exact served revision explicitly:
   `pnpm check:deployment-evidence -- <ledger-path> --expected-sha <40-character-served-sha>`.
   The no-argument CI invocation validates historical ledger structure only
   and reports `current revision NOT_VERIFIED`; it is never current-runtime proof.

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
broken routes, security-relevant regression) and a fix cannot land quickly.

A previously stable provider version is **not automatically rollback-eligible**.
Before changing the provider deployment:

1. Map the candidate provider version to its exact 40-character Git revision.
   If that mapping is unknown, the rollback target is `NOT_VERIFIED / INELIGIBLE`.
2. From a full-history current repository checkout, run:
   `node scripts/check-rollback-candidate.mjs --candidate <40-character-git-sha>`.
   The guard requires the candidate to stay on current `main` lineage, remain
   at/after every active security floor, retain the no-payment-authority guard,
   and contain no VietQR/NAPAS/EMVCo payment-authority markers in public source.
3. Only after the source guard reports `Rollback candidate: ELIGIBLE`, use the
   Cloudflare dashboard → Worker → **Deployments** to select the mapped version
   and _Rollback / redeploy that version_.
   (Equivalent: re-run Workers Builds on that exact eligible `main` commit.)
4. Immediately re-run §2 post-deploy verification against the rolled-back
   revision, record the full-SHA ledger entry, and certify it with
   `pnpm check:deployment-evidence -- <ledger-path> --expected-sha <40-character-served-sha>`.
   An eligible source target is not runtime proof.
5. Open an issue or PR describing the incident, target revision, security-floor
   qualification, provider rollback and forward-fix plan. No direct pushes to
   `main`, no bypassing protection.

**Never** patch production outside the pipeline, and never roll back without
re-running the smoke suite — an unverified rollback is not a recovery.

## 5. Ownership

Single-human operator (owner) holds Cloudflare dashboard access, DNS and the
production email variables. Agent lanes can prepare everything up to — but not
including — those provider-private actions.
