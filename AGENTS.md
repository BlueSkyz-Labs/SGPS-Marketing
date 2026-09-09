# Agent guide — BlueSkyz Labs Web (SGPS-Marketing)

Trusted current source of truth only:

| Role                               | Path                                                                                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Experience contract                | `docs/superpowers/specs/2026-09-03-blueskyz-web-v1-c1-1-design.md` — substantive design remains authoritative; its pre-implementation status text is historical |
| Historical implementation plan     | `docs/superpowers/plans/2026-09-04-blueskyz-web-v1-c1-1-implementation.md`                                                                                      |
| Active residual / owner-gated work | `docs/superpowers/plans/2026-09-03-remaining-convergence.md`                                                                                                    |
| Framework decision                 | `docs/decisions/0004-web-framework-selection.md` (`ASTRO_7`)                                                                                                    |
| Source assurance decision          | `docs/decisions/0005-dual-control-source-assurance.md`; historical pre-ruleset wording is superseded by provider read-back                                      |
| Canonical domain decision          | `docs/decisions/0006-domain-migration-and-product-subdomains.md`                                                                                                |
| Architecture decision              | `docs/decisions/0007-sgps-architecture-canonical-model.md`                                                                                                      |
| Canonical architecture model       | `architecture/sgps-model.json`                                                                                                                                  |
| Derived architecture views         | `architecture/derived-views.json` — `VIEW_IS_DERIVED_NOT_ARCHITECTURE_TRUTH`                                                                                    |
| Decisions index                    | `docs/decisions/README.md`                                                                                                                                      |

Latest immutable post-merge convergence evidence: `docs/evidence/2026-09-09-pr77-post-merge.md`.

## Hard rules

- Do **not** invent corporate emails, legal prose, product claims, screenshots, photography, or owner/product facts.
- Prefer the smallest **sufficient** root-cause change over symptom patches.
- Never weaken tests, lint, truth gates, dependency audit, security controls, or provider governance to go green.
- Canonical organizational origin is `https://blueskyzlabs.com` per ADR 0006. `tonydemo.com` is retired/transition history and must not pass the production public-truth gate.
- Empty public registry + empty email → Act soft-land via `src/lib/act.ts` (About / Security), not a Contact dead-end.
- Normal changes use **branch → PR → Source Assurance → merge**. Direct-to-`main` is not a fallback.
- Active ruleset `main-promotion-governance` (`22500299`) protects `main`: PR required, strict `Quality Gates` + `Browser Assurance`, conversation resolution, non-fast-forward/deletion blocking, no bypass actors. Issue #8 is resolved/closed.
- Green evidence belongs only to the exact tested SHA. UNKNOWN / skipped / stale checks are not PASS.
- GitHub Actions is **source assurance only**: read-only token, no persisted checkout credentials, no Cloudflare secrets, no deployment commands.
- Cloudflare Workers Builds remains preview/production build and deployment authority.
- SGPS architecture truth lives in `architecture/sgps-model.json`; diagrams/views are derived. Provider/runtime evidence outranks stale authored topology and must trigger reconciliation.

## Source gates

Canonical source-assurance path:

`frozen install → dependency audit → architecture contracts → typecheck → lint → format → build → client budget → static links → browser/axe → Lighthouse`

Architecture-affecting changes must regenerate/check derived views with `pnpm architecture:views:check`. GitHub Source Assurance repeats deterministic source gates and adds Chromium Playwright/axe + Lighthouse evidence for PR/main candidates. See `README.md` and `docs/QA_STRATEGY.md` for full commands and promotion flow.
