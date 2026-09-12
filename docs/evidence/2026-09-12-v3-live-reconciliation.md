# v3 Live-State Reconciliation and Completion Matrix — 2026-09-12

**Task 0.1** of `docs/superpowers/plans/2026-09-12-god-tier-v3-trust-experience-implementation.md`.
Recorded against live `origin/main` before any v3 runtime work.

## Live baseline

- **`origin/main` SHA:** `1fc6ab2` (v3 design+plan merged via #122; v1/v2 programs fully merged).
- **Open PRs:** 0. **Open issues:** 0. Working tree clean.

## Live modules and surfaces found (adopted, not re-created)

| Concern                     | Live source                                                                                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Integrity types/selectors   | `src/data/integrity.ts` (`TruthState`, `EvidenceReference`, `ReviewMetadata`, `BoundaryStatement`, fail-closed `INTEGRITY_ENTRIES`), `src/lib/integrity.ts` |
| Public-truth validation     | `src/lib/truth.ts`, `src/pages/…` soft-land via `src/lib/act.ts`                                                                                            |
| Product selector            | `src/lib/products.ts` (`getPublicProducts`, `getFlagshipProduct`)                                                                                           |
| Locale-aware product routes | `src/lib/product-routes.ts`                                                                                                                                 |
| Shared EN/VI labels         | `src/data/site.ts` (`SHARED_LABELS`, `labelFor`, `getNav`, `getFooterLinks`)                                                                                |
| Route/i18n helpers          | `src/lib/i18n.ts`, `src/lib/seo.ts`                                                                                                                         |
| Navigator builder           | `src/lib/navigator.ts` + `src/components/experience/CommandNavigator.astro` + `src/scripts/command-navigator.ts`                                            |
| Atlas builder               | `src/lib/atlas.ts` + `src/components/experience/Atlas.astro`                                                                                                |
| Journey model               | `src/lib/journey.ts` + `JourneyBar.astro`                                                                                                                   |
| Analytics emitter           | `src/lib/analytics.ts` + `src/scripts/analytics-bridge.ts` (transmission disabled)                                                                          |
| Trust ledger                | `src/data/trust-ledger.ts` + `TrustLedger.astro`                                                                                                            |
| Smoke command               | `pnpm smoke:production` → `scripts/smoke-production.mjs`                                                                                                    |
| E4 matrix                   | `pnpm e4:matrix` → `scripts/e4-matrix.mjs`                                                                                                                  |
| Promotion authority         | Source Assurance (GitHub Actions) + Workers Builds (Cloudflare); ruleset `main-promotion-governance` (strict)                                               |

## v3 completion matrix (live verdicts)

| Task                                  | Verdict              | Basis                                                                                                                        |
| ------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 0.1 Reconciliation                    | **DONE (this file)** | —                                                                                                                            |
| 1 S+1 Truth-State Visual Grammar      | OPEN → this PR       | no `TruthState.astro` exists                                                                                                 |
| 2 S+2 Proof-First Empty States        | OPEN → this PR       | products empty block is inline page copy                                                                                     |
| 3 S+3 Boundary Cards                  | OPEN → this PR       | `BoundaryStatement` type exists; no authoring, no component                                                                  |
| 4 S+4 Safe Action Preflight           | OPEN → this PR       | advisory links render without destination context                                                                            |
| 5 S+5 SGPS Integrity Lens             | OPEN                 | no lens component exists                                                                                                     |
| 6 S+6 Executive ↔ Evidence depth      | OPEN                 | —                                                                                                                            |
| 7 S+7 Evidence Pulse                  | OPEN                 | requires authored review metadata                                                                                            |
| 8 S+8 Bilingual Mirror                | OPEN                 | —                                                                                                                            |
| 9 S+9 Deterministic Provenance Search | OPEN                 | `navigator.ts` exists to extend                                                                                              |
| 10 S+10 Evidence Change Intelligence  | **EVIDENCE-GATED**   | requires the public change-source GO decision (docs-only NO-GO fallback allowed)                                             |
| 11–20 G1–G10                          | OPEN                 | no claim fabric, trace, passport, decision room, mission paths, atlas V2, manifest, deep links, publishability, firewall yet |
| 21–23 Red-team / Human E4 / Promotion | OPEN                 | task 22 stays `NOT RUN` until real participants                                                                              |

## v1/v2 preservation anchors (must not weaken)

- No inline executable scripts (CSP `script-src 'self'`); client JS budget 1,644 B ≤ 120 KB enforced by `check:client-budget`.
- Legacy root 301s live; production smoke 19/19 at `f2c3339`.
- Architecture 138/138; e2e matrix incl. parity fixture; bilingual guardrails.
