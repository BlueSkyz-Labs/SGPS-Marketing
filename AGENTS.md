# Agent guide — BlueSkyz Labs Web (SGPS-Marketing)

Trusted Source of Truth only:

| Role                        | Path                                                                       |
| --------------------------- | -------------------------------------------------------------------------- |
| Experience contract         | `docs/superpowers/specs/2026-09-03-blueskyz-web-v1-c1-1-design.md`         |
| Implementation plan         | `docs/superpowers/plans/2026-09-04-blueskyz-web-v1-c1-1-implementation.md` |
| Residual / owner-gated work | `docs/superpowers/plans/2026-09-03-remaining-convergence.md`               |
| Framework decision          | `docs/decisions/0004-web-framework-selection.md` (`ASTRO_7`)               |
| Source assurance decision   | `docs/decisions/0005-dual-control-source-assurance.md`                     |
| Decisions index             | `docs/decisions/README.md`                                                 |

## Hard rules

- Do **not** invent corporate emails, legal prose, product claims, screenshots, photography, or final domain facts.
- Prefer smallest **sufficient** change (root cause) over symptom patches.
- Never weaken tests, lint, truth gates, or security controls to go green.
- Temporary site identity may be `tonydemo.com`; emails may still be empty.
- Empty public registry + empty email → Act soft-land via `src/lib/act.ts` (About / Security), not a Contact dead-end.
- Normal changes use **branch → PR → Source Assurance → merge**. Direct-to-`main` is emergency-only until Issue #8 is enforced.
- Required-check candidates are **`Quality Gates`** and **`Browser Assurance`**. Green evidence belongs only to the exact tested SHA.
- GitHub Actions is **source assurance only**: read-only token, no persisted checkout credentials, no Cloudflare secrets, no deployment commands.
- Cloudflare Workers Builds remains preview/production build and deployment authority.
- Issue #8 ruleset remains open while repository read-back is `rulesets=[]`; never describe documentation or CI existence as ruleset enforcement.

## Source gates

Local canonical gate:

`architecture → typecheck → lint → format → build → client budget → static links`

GitHub Source Assurance repeats deterministic source gates and adds Chromium Playwright/axe + Lighthouse evidence for PR/main candidates. See `README.md` and `docs/QA_STRATEGY.md` for full commands and promotion flow.
