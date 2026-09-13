# Agent guide — BlueSkyz Labs Web (SGPS-Marketing)

Trusted current source of truth only:

- **Experience contract:** `docs/superpowers/specs/2026-09-03-blueskyz-web-v1-c1-1-design.md` — substantive design remains authoritative; its pre-implementation status text is historical.
- **Active C2 experience design:** `docs/superpowers/specs/2026-09-13-c2-cinematic-product-house-design.md` — supersedes conflicting homepage/public-composition guidance from older S+ specs.
- **Active C2 implementation plan:** `docs/superpowers/plans/2026-09-13-c2-cinematic-product-house-implementation.md` — execute P0–P6 as separate gated waves/PRs.
- **Historical implementation plan:** `docs/superpowers/plans/2026-09-04-blueskyz-web-v1-c1-1-implementation.md`.
- **Active residual / owner-gated work:** `docs/current-work.json` — canonical current-work router, including product screenshot/owner facts, Human E4 and RUM privacy decision.
- **Framework decision:** `docs/decisions/0004-web-framework-selection.md` (`ASTRO_7`).
- **Source assurance decision:** `docs/decisions/0005-dual-control-source-assurance.md`; historical pre-ruleset wording is superseded by provider read-back.
- **Canonical domain decision:** `docs/decisions/0006-domain-migration-and-product-subdomains.md`.
- **Architecture decision:** `docs/decisions/0007-sgps-architecture-canonical-model.md`.
- **Canonical architecture model:** `architecture/sgps-model.json`.
- **Derived architecture views:** `architecture/derived-views.json` — `VIEW_IS_DERIVED_NOT_ARCHITECTURE_TRUTH`.
- **Decisions index:** `docs/decisions/README.md`.

Before C2 runtime work, refresh live `main`, open PRs/issues, `docs/current-work.json`, and any newer ADR/spec/plan. The SHA recorded in a plan is a handoff baseline, never permission to ignore newer repository truth.

## C2 execution doctrine

- **Static-first. Product-led. Cinematic at the moments that matter. Evidence-rich underneath.**
- Product truth is a prerequisite for product spectacle. If a real screenshot/product fact is absent, record the blocker; never fabricate it.
- C2 changes public composition and disclosure depth, not the authority of SGPS truth/security/provenance systems.
- `ExperienceSpine`, `IntentLens`, and `Atlas` are no longer required prominent homepage surfaces under C2; do not delete their capabilities merely because the homepage stops rendering them.
- Cinematic code may consume product/claim truth but may never become a second registry or invent stronger assurance semantics.
- Prefer HTML/CSS/SVG/native View Transitions. No animation framework or WebGL dependency without a later approved architectural decision and evidence-backed GO gate.
- Static/no-JS and reduced-motion states must independently meet the content/action contract.
- Execute C2 as separate P0–P6 waves/PRs; do not create a mega-PR.

## Hard rules

- Do **not** invent corporate emails, legal prose, product claims, screenshots, photography, owner/product facts, user-research participants, quotes, completion rates or acceptance outcomes.
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
- Automated/browser E4 evidence does **not** substitute for real-user customer-task and brand-interpretation evidence required by the C1.1 experience contract; agent walkthroughs and LLM simulations are preflight only.

## Source gates

Canonical source-assurance path:

`frozen install → dependency audit → architecture contracts → typecheck → lint → format → build → client budget → static links → cross-browser/axe → Lighthouse`

Architecture-affecting changes must regenerate/check derived views with `pnpm architecture:views:check`. GitHub Source Assurance repeats deterministic source gates and runs the repository E4 Playwright/axe matrix across Chromium, Firefox, WebKit/Safari-class and mobile Chromium, followed by Lighthouse evidence for PR/main candidates. See `README.md` and `docs/QA_STRATEGY.md` for full commands and promotion flow.
