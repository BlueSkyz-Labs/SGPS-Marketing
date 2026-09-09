# PR #77 post-merge convergence evidence — 2026-09-09

This record is the current post-merge evidence for the canonical-domain, supply-chain and SGPS:Architecture convergence work delivered by PR #77. Historical RED runs and pre-promotion statements remain in their original evidence files; this record supersedes them only for the live promotion state.

## Immutable delivery references

- Repository: `BlueSkyz-Labs/SGPS-Marketing`
- PR: `#77` — `fix: converge canonical domain and architecture truth`
- Final candidate head: `17208736acc7f99eda67feba3dc2a0af1c0774f9`
- Merge commit / final verified `main`: `7600db7a361e7d309cacadac914ab535de3705f8`
- Canonical organizational origin: `https://blueskyzlabs.com` per ADR 0006
- Canonical architecture decision: ADR 0007
- Canonical architecture model: `architecture/sgps-model.json`
- Derived architecture invariant: `VIEW_IS_DERIVED_NOT_ARCHITECTURE_TRUTH`

## Delivered and verified

- The public-truth gate rejects retired `tonydemo.com`, preview/staging hosts, alternate origins, non-root paths, query strings and non-default ports; only the exact canonical BlueSkyz organizational origin is eligible for production identity.
- The SGPS-native architecture model records applicable portfolio, domain, system, component, data-resource, infrastructure, external-dependency and deployment entities without fabricating backend API/Event/auth/database/queue surfaces that do not exist in this static site.
- Derived architecture views are deterministic and non-authoritative; graph contracts fail closed on duplicate IDs, unknown parents/endpoints, parent cycles, invalid relationship types and stale generated views.
- The fresh High transitive Sharp advisory in `wrangler -> miniflare -> sharp@0.35.2` was remediated with the narrow `sharp@0.35.4` workspace override and a regenerated lockfile. The dependency audit reports no known vulnerabilities at the configured Moderate-and-higher gate.
- Generator output and repository formatting now share the project-pinned Prettier representation, eliminating the formatter/generator drift found during PR verification.

## Exact candidate verification

Final candidate `17208736acc7f99eda67feba3dc2a0af1c0774f9` completed all required promotion evidence successfully:

- `Quality Gates` — SUCCESS — check `102332468981`.
- `Browser Assurance` — SUCCESS — check `102332614458`; Chromium Playwright/axe completed 33/33 tests and Lighthouse processed 3/3 runs.
- `Workers Builds: blueskyz-web` — SUCCESS — check `102332737907`; Cloudflare build `71e22929-c419-46ec-8d2d-f73297f4f79d`, version `9c4c139f-2eac-47d8-8dfa-587887bc86d8`.

The localhost Lighthouse SEO score remains a justified non-production exception because preview/local builds intentionally request `noindex`; it is not a production canonical-domain regression.

## Post-merge verification

PR #77 merged through the protected PR path on 2026-09-09. Provider read-back confirms `main` at `7600db7a361e7d309cacadac914ab535de3705f8` and the merge SHA independently completed:

- `Quality Gates` — SUCCESS — check `102334026831`.
- `Browser Assurance` — SUCCESS — check `102334164495`.
- `Workers Builds: blueskyz-web` — SUCCESS — check `102334269284`; Cloudflare build `39fbb13e-f0b7-4ee8-9753-e395a47f1c82`, version `193a20ec-a34b-452d-9e09-dead7ebb57e1`.

Repository governance read-back after merge confirms ruleset `main-promotion-governance` (`22500299`) remains active on `refs/heads/main`, requires a pull request plus strict `Quality Gates` and `Browser Assurance`, requires review-thread resolution, blocks non-fast-forward updates and deletion, and has no bypass actors. Repository sweep found zero open pull requests and zero open issues at this verification point.

## Residual state

The remaining deltas are not safely inferable from repository code and must not be fabricated:

- verified `PUBLIC_CONTACT_EMAIL` and `PUBLIC_SECURITY_EMAIL`;
- evidence-backed public product/proof and optional photography;
- production RUM purpose/provider/retention/privacy approval;
- optional future `/so-tro` product scope and optional private SGPS source grant.

No current P0/P1 repository-controlled blocker is recorded by this evidence. Future changes must independently satisfy the active protected-promotion path and exact-head verification; this document is evidence for the immutable states above, not a permanent green claim for future revisions.
