# SGPS remaining local mappings — DEC-001, 014, 022, 024 + GTS, GSRS, GECAS, Repository Health

**Bound to:** `main@c9198a5` (2026-10-04, GMT+7).
**Pin:** `v1.13.0`, unchanged.
**Index:** `docs/sgps/EFFECTIVE_SGPS_CONTEXT.md`.

This record closes the PARTIAL rows the 2026-10-04 SGPS FULL round left for agent work. Owner-gated items stay named as such.

## SGPS-DEC-2026-001 — Product Compatibility Contract

The public site is a compatibility surface for visitors, search engines and inbound links.

| Governed dimension                                      | Contract                                                                       | Guard                                                                                                                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public URLs and locale routes (`/{en,vi,zh,zh-hant}/…`) | A removed or renamed route needs a 301 in `public/_redirects`, in a single hop | `tests/architecture/redirect-contract.test.mjs`, `tests/architecture/rt03-single-hop-redirects.test.mjs`, `tests/architecture/redirects-asset-safety.test.mjs` |
| Canonical, hreflang and sitemap                         | Reciprocal alternates plus x-default; canonical host is the apex               | `tests/architecture/hreflang-contract.test.mjs`, `tests/architecture/seo-contract.test.mjs`, `tests/architecture/seo-technical-metadata.test.mjs`              |
| Machine-readable surfaces                               | `/.well-known/security.txt` (RFC 9116) and JSON-LD                             | `tests/architecture/security-surface.test.mjs`, `tests/architecture/seo-v7-technical.test.mjs`                                                                 |
| Locale preference                                       | A stored choice wins; the site never navigates on its own                      | `tests/architecture/locale-suggestion-contract.test.mjs`                                                                                                       |

**Classification rule:**

| Class   | Change                                                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `none`  | Copy or styling with every URL kept                                                                                                               |
| `patch` | Fixes that keep every URL and surface                                                                                                             |
| `minor` | A new route or locale, additive                                                                                                                   |
| `major` | Removing or renaming a public URL without a 301; changing the canonical host; dropping a locale; changing a machine-readable surface incompatibly |

A `major` change needs an ADR and Owner approval.

## SGPS-DEC-2026-014 — Risk, Control & Resilience (scoped record)

| Risk                                                         | Treatment / control                                                                                                                     | Residual                                                            | Owner gate                  |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------- |
| R1. Lifting Access exposes the site publicly                 | The content is the approved launch content. Public-truth gate; www → apex 301; JS Detections off; v9 T3 smoke runs right after the lift | Live headers and runtime are NOT VERIFIED until the lift            | O-1, the Access lift        |
| R2. Privacy notice incomplete at launch (PDPL, GDPR Art. 13) | Drafts in #488. No cookies, no trackers                                                                                                 | HIGH until the Owner approves the notice                            | Owner / legal (#488)        |
| R3. The dependency-audit exception expires 2026-11-03        | Exposure guard plus an expiry test (`tests/architecture/audit-exceptions.test.mjs`)                                                     | The test turns red at expiry, forcing a re-assessment               | Owner label for any renewal |
| R4. Recovery not drilled                                     | Rollback-candidate eligibility check (`scripts/check-rollback-candidate.mjs`, `tests/architecture/rollback-security-floor.test.mjs`)    | Workers version rollback not observed, so NOT VERIFIED (SBD-INV-09) | Owner drill                 |
| R5. Single provider (Cloudflare)                             | Static `dist/` is portable (see DEC-022)                                                                                                | A provider outage takes the site down; accepted for a brand site    | —                           |

## SGPS-DEC-2026-022 — Evidence Convergence and Reversible Architecture (provider record)

**Adopted:** Astro 7 static output (ADR 0004), served by Cloudflare Workers static assets and deployed by Workers Builds.

**Evidence:**

- 98 static pages;
- zero runtime bindings (`wrangler.toml`);
- client JS 12.6 kB on the worst page.

**Exit path:**

- `dist/` is plain static HTML, CSS and JS that any static host can serve.
- Provider-specific pieces:
  - `public/_headers` and `public/_redirects`, which need translating into the target host's syntax;
  - Workers Builds deploy wiring.
- **Exit cost:** low. No data migration, no server code.

**Reversibility trigger:** a re-review under DEC-029 if a runtime surface is added.

## SGPS-DEC-2026-024 — Merge gate (Marketing variant)

**Controls:**

- `scripts/check-merge-policy.mjs` runs from the pull request's BASE commit (`.github/workflows/quality-gates.yml`).
- Protected paths need the Owner's `owner-approved` label. Agents never add or remove it.
- `.sgps/merge-gate.json` is exempt for this repository (DEC-024 §11).

**Ruleset read-back (2026-10-04, `GET repos/BlueSkyz-Labs/SGPS-Marketing/rules/branches/main`):** the required status checks are `Quality Gates` and `Browser Assurance` (GitHub Actions app 15368).

**Live negative proof (2026-10-04):**

- PR #487 changes the protected `public/_headers` and has no label.
- `Quality Gates` failed exactly at "Merge policy (protected paths need the owner-approved label)" (run 37185987721).
- Browser Assurance was skipped behind it, so the PR could not merge.

**Open item:** PR #484 (local-agent lane) changes the gate itself; this record does not depend on it.

## Standards

| Standard                   | How it is applied here                                                                                                                                                                                                                                                         | Evidence                                                                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GTS (testing)**          | Architecture suite: 190 files, about 1150 tests, with negative proofs required for every guard (v9 §8.2). E2E matrix: Chromium, Firefox, WebKit and mobile Chromium. Visual regression gate (E3). Lighthouse desktop, mobile and SEO lanes. Exact-SHA evidence rules (v9 §8.3) | `docs/QA_STRATEGY.md`, `.github/workflows/quality-gates.yml`                                                                                                                     |
| **GSRS (security review)** | Multi-round red-team (v10 multidimensional, v11, v12, v13 in flight); SBD map; header and CSP guards; supply-chain policy                                                                                                                                                      | `docs/evidence/2026-10-04-pre-golive-redteam-v11.md`, `docs/evidence/2026-10-04-pre-golive-security-round-v12.md`, `docs/sgps/adoption/SGPS_DEC_2026_017_SECURITY_BY_DEFAULT.md` |
| **GECAS (assurance)**      | Work-ready task cards with preconditions, files and done-when (v9 §9, v10 §8); IMPLEMENTED, VERIFIED, ACCEPTED and RELEASED kept distinct; convergence audits (E7)                                                                                                             | `docs/superpowers/plans/2026-10-02-v9-completion-golive.md`, `docs/evidence/2026-10-04-v10-e7-delta-post-e4.md`                                                                  |
| **Repository Health**      | **Baseline 2026-10-04:** 371 remote branches; 82 already merged into `main` by ancestry (squash-merged branches add more); oldest 2026-09-02. **Finding (LOW):** merged head branches are not auto-deleted                                                                     | Recommendation: the Owner enables "Automatically delete head branches" in repository settings. Deleting existing branches is an Owner decision; agents do not mass-delete        |
