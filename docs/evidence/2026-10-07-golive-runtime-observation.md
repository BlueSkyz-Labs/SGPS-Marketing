# Production surface observation — 2026-10-07

**Status: public surface smoke PASS; deployed revision NOT_VERIFIED.** This is
an observation record, not a deployment evidence ledger and not proof that the
current `main` revision is serving.

Observed at **2026-10-07 16:54:57 GMT+7** (`2026-10-07T09:54:57Z`). The
checkout was `2fadb48f37049a0318711940f1fe5f7a8539b0ee`, matching `origin/main`.
The production smoke intentionally ran without `SMOKE_COMMIT_SHA`: the served
revision had not been read back from Cloudflare Workers Builds.

## Public route and edge checks

- `https://blueskyzlabs.com/` and `/en/` returned HTTP 200 without an Access
  login redirect.
- `https://www.blueskyzlabs.com/` redirects to the apex with HTTP 301.
- `node --use-env-proxy scripts/smoke-production.mjs` completed **37 checks:
  37 PASS, 0 FAIL**. This covers localized routes, canonical metadata, legacy
  redirects, 404s, manifests, sitemap, same-origin assets, and the declared
  security/cache headers.
- A separate anonymous GET check found **0 `mailto:` links** on `/en/contact/`,
  `/en/support/`, `/en/security/`, and `/.well-known/security.txt` (all four
  returned HTTP 200). The task environment has public email variables, but that
  does not show that Cloudflare Workers Builds received them. No mailbox value
  or deliverability claim is recorded here.

## Release and owner gates

- The smoke output did not contain a commit SHA. The production revision remains
  **NOT_VERIFIED** until it is read from Cloudflare Workers → Deployments. The
  smoke script only echoes `SMOKE_COMMIT_SHA`; it does not compare that value to
  the served site. Follow
  [the production runbook](../operations/production-smoke-and-rollback.md)
  before creating a certified post-merge ledger.
- Issue [#375](https://github.com/BlueSkyz-Labs/SGPS-Marketing/issues/375)
  remains open: Worker Builds branch control, production/preview commands,
  Worker Previews activation, and a negative non-main branch isolation proof
  require provider read-back. Wrangler 4.141.0 is present, but the source
  preparation `previews = {}` changes protected `wrangler.toml` and requires the
  repository's `owner-approved` label. Source configuration alone cannot close
  the provider gate.
- Issues [#281](https://github.com/BlueSkyz-Labs/SGPS-Marketing/issues/281) and
  [#522](https://github.com/BlueSkyz-Labs/SGPS-Marketing/issues/522) remain open:
  no public mailbox is currently rendered, and provider/MX, receive/reply,
  staffing, and recovery evidence is still required before mailbox readiness
  can be claimed.
- Issue [#523](https://github.com/BlueSkyz-Labs/SGPS-Marketing/issues/523)
  remains open for public organization verification. This runtime observation
  does not resolve its owner-fact or public-truth requirements.

The latest source-assurance run on the recorded checkout passed, but source
assurance and public HTTP success do not establish the served revision or close
the provider isolation and mailbox gates.
