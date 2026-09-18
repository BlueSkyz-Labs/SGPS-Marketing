# C3-C — Brand Experience Upgrade Program (zh locale, premium theme, brand-kit UI rounds)

**Owner invocation:** 2026-09-18 — brand kit v4 zip + guidelines PDF re-delivered, with directions: add business-register Simplified Chinese to the interface, design the language switcher, design a premium Light/Dark control, run several rounds of comprehensive UI upgrade leveraging the brand kit, adopt SGPS:Experience (FULL).

**MODE:** EXECUTE · **PROJECT_STAGE:** PRODUCTION · **Delivery:** branch → PR → exact-head gates → merge (ruleset `main-promotion-governance`).

## Objective contract

**OBJECTIVE** — Extend the production site to three locales and two themes as first-class, brand-faithful experiences, and lift the interface to the brand kit v4 standard in successive evidence-gated rounds, without weakening any truth, truth-state, accessibility, performance or source-assurance invariant.

**SUCCESS CRITERIA**

1. `/zh/` exists for every published page with authored business-register Simplified Chinese; no English fallback is ever served under `/zh/`.
2. Three-way reciprocal hreflang (plus `x-default`) on every page; sitemap and switcher agree.
3. A visitor can choose Light / Dark / System; the choice persists; with JavaScript disabled the site still honours `prefers-color-scheme`; there is no wrong-theme flash.
4. Both controls meet the accessibility contract (focus, `aria-current`, 44px touch floor, no-JS operability) and stay inside the client-JS budget and CSP (`script-src 'self'`).
5. Every dark/light surface uses kit-legal colour pairs (kit contrast matrix binding).
6. Brand-kit tokens (typography scale, spacing, radius, motion, gradient, breakpoints) are consumed through the existing token layer rather than re-invented per component.
7. SGPS:Experience adoption is traced decision → gap → task → implementation → runtime evidence → guard, with each applicable decision classified explicitly.
8. All existing gates stay green: architecture contracts, public-truth/assurance-language, static links, client budget, axe/cross-browser, Lighthouse.

**IN-SCOPE** — locale #3 plumbing + content; premium language switcher; premium theme control + dark semantics activation; brand-kit-token-driven UI upgrade rounds; SGPS:Experience FULL discovery/classification/adoption evidence; guards for each.

**OUT-OF-SCOPE / NON-GOALS** — fabricating product/screenshot/claim/legal/corporate facts; runtime machine translation; third-party font/CDN/analytics surfaces; payments/identity; C3-E Concierge provider selection; C3-G WebGL; changing the canonical domain or the public-truth model.

**CONSTRAINTS** — no test/scanner/budget weakening; no inline executable script; `zh` is translation of approved copy only; theme/locale are presentation state and never mutate truth.

## Verified baseline at program start

| Fact | Evidence |
| --- | --- |
| Brand kit v4 binaries | **219/219 byte-identical to kit masters** in the repo (own hash comparison) |
| Kit guard | `tests/architecture/brand-kit-v4-fidelity.test.mjs` (50 published artifacts + token layer + head tags) — passes today |
| Contrast matrix | Ink/Porcelain 17.82 · Cobalt/Porcelain 4.55 · Slate700 9.74 · Slate650 7.13 · White/Ink 18.93 · **Slate500 4.48 FAIL** · **Cobalt/Ink 3.92 FAIL** |
| Locales today | `en`, `vi` (`src/lib/i18n.ts`); 20 `Record<Language, …>` sites across 8 files; 13 test files hardcode `vi` |
| Theme today | `color-scheme: light` + **dormant** `[data-theme="dark"]` block in `src/styles/global.css` |
| CSP/budget | inline executable scripts forbidden; per-route Brotli client-JS budget enforced by `scripts/check-client-budget.mjs` |
| C3-A / C3-B | C3-A converged (Tasks 3,4,5,6,7 merged); C3-B Task 1 merged (#188), Tasks 2+5 in PR #190 |

## Waves

### W1 — Trilingual foundation (`/zh/`)
Type widening (`Language`), `i18n.ts` (labels, path helpers, hreflang), `site.ts` label maps, the remaining `Record<Language, …>` sites, six `zh` content files, routes, sitemap, switcher wiring, and trilingual tests. Ships as the program's first PR.

**Guard:** every locale resolves its own content; a missing zh translation fails rather than falling back.

### W2 — Premium language switcher
Three-way control: preserves path, `aria-current`, full-name accessible labels, 44px floor, no-JS links, motion under reduced-motion honouring the C3-A microinteraction grammar.

### W3 — Premium Light/Dark theme
Activate dark semantics from kit tokens; `prefers-color-scheme` baseline; persisted Light/Dark/System choice applied before first paint by a same-origin script inside budget; theme control with the same accessibility contract; contrast pairs checked against the kit matrix; dark-surface visual pass on hero, product house, trust surfaces and footer.

### W4 — Brand-kit UI upgrade rounds
Typography scale + spacing/radius/motion consumption through tokens; hero/prismatic imagery used per kit rules (flat vector for UI, prismatic raster for hero/campaign only); product lockups/principle icons where they carry meaning; motion grammar consistency; then an independent UX/a11y critique round (dogfood + axe + Lighthouse) with fixes.

### W5 — SGPS:Experience FULL adoption
Discover live SGPS Experience decisions (core pulled 2026-09-18 at `68707d4`: DEC-004 portfolio experience system, DEC-006 Experience FULL VCDI convergence, DEC-007 evidence recognition, DEC-008 attention measurement integrity, DEC-012 experience brand operationalization/public truth, plus GUX master standard and the bilingual profile → trilingual extension), classify applicability per decision (APPLICABLE / NOT APPLICABLE / DEFERRED / EXPLICIT EXCEPTION), write the baseline→target and gap matrix, implement the applicable gaps, then record convergence evidence with the adoption contract (applicability, intended outcome, evidence, verification, anti-patterns, guard, convergence criteria).

**Non-negotiable:** no "SGPS adopted" blanket statement; each decision carries its own classification and evidence, and declared ≠ operational ≠ verified ≠ guarded ≠ converged.

## Definition of done per wave

Green exact-head gates (architecture, typecheck, lint, format, build, client budget, static links, cross-browser/axe, Lighthouse) → merged PR → router/`docs/current-work.json` updated → worktree/branch cleaned up.