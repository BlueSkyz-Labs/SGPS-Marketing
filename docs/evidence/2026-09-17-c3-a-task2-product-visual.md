# C3-A Task 2 — shared ProductVisual, product continuity, and truthful fixture rendering

## Scope

**Objective.** Give every product surface one responsive, intrinsic-size, accessible
product visual primitive (C3-A Task 2 / design S2) without letting presentation
become a second product-truth or transition-identity owner.

**Delivered on `main`.** `feat(c3-a): build shared ProductVisual (#176)`, squash
`dde7dbf`. Task 2 is merged; C3-A remains the only in-progress wave.

## What shipped

- `src/components/product/ProductVisual.astro` — the single shared primitive:
  intrinsic `width`/`height`, record `alt`, `loading`/`decoding` policy, an
  optional `data-product-continuity` hook, and forwarding (never authoring) of the
  continuity identity produced by `src/lib/product-transition.ts`.
- `src/components/product/FlagshipTheatre.astro` consumes the primitive instead of
  inlining its own `<img>`; product facts still come only from the record.
- `src/styles/c3-craft.css` — the C3 craft layer keeps its Task 1 role aliases and
  adds the primitive's layout contract: one owner per rule, no `!important`
  overrides, no second palette, no keyframes, no transition identity.
- `tests/e2e/c3-product-visual.spec.ts` — fixture-backed contract: intrinsic
  dimensions, meaningful alt, lazy/async decoding, readable rendered size at
  1440/390px, an exact (1px sub-pixel) horizontal-overflow bound, and the
  fail-closed case proving the real site renders no invented visual while
  screenshot truth is absent.
- Architecture guards: `product-continuity`, `product-proof-contract`,
  `c3-craft-contract`, `c3-fixture-style-fidelity`.
- Fixture screenshots: three synthetic 1280×800 PNGs under
  `tests/e2e/fixtures/parity-app/public/products/fixtures/` (fixture app only,
  never deployed, never presented as product truth).

## Defects found and fixed during this task

### 1. Continuity identity was produced but never consumed (regression, fixed)

`ProductVisual` accepted a `transitionStyle` prop and never applied it, so the
element carrying `data-product-continuity="media"` reached the document without
its `view-transition-name`. `src/lib/product-transition.ts` became a producer with
no consumer and the C2 continuity contract failed across the browser matrix
(16 tests: `c2-flagship-theatre`, `c2-product-continuity`).

Fix: the primitive forwards the identity it is handed and still authors none.
Root cause was a partially-adopted refactor, not a missing test.

### 2. The parity fixture served stylesheets with a generic content type (fixed)

`tests/e2e/helpers/parity-fixture.ts` returned every non-HTML asset as
`text/plain`. Under strict MIME checking the browser refuses a stylesheet served
that way, so the fixture pages rendered **unstyled**.

Consequence: every fixture-backed layout assertion silently measured an unstyled
page. The product visual reported its 1280px intrinsic width inside a 390px
viewport — a "mobile overflow" that did not exist once the stylesheets actually
loaded. This is exactly the class of false signal the fail-closed doctrine warns
about: a test harness that cannot render the artifact it claims to verify.

Fix: an extension → content-type map (`text/css`, `text/javascript`,
`image/png`, …) with `application/octet-stream` as the explicit fallback. The
fixture app is now a real parity render of the runtime style entry. A guard in
`tests/architecture/c3-fixture-style-fidelity.test.mjs` asserts the stylesheet
content type so the harness cannot silently regress.

### 3. Symptom patches removed

Chasing (2) had produced `!important` overrides and a duplicated
`.c2-flagship-theatre__frame` owner in `c3-craft.css`. Both are gone: the frame
contract lives with the shared primitive (`min-width: 0` + `overflow: hidden`),
and unlayered craft rules win over Tailwind's layered preflight without
escalation.

## Evidence

Bound to the tested head (local, built site + built parity fixture):

- `node --test tests/architecture/*.test.mjs` — 345/345 pass.
- `playwright` `c2-flagship-theatre`, `c2-product-continuity`, `c2-product-house`,
  `c3-product-visual` on chromium + mobile-chromium — 50/50 pass, including the
  exact overflow bound and the no-JS/mobile continuity path.
- `pnpm typecheck` 0 errors; `pnpm lint` clean; `pnpm format:check` clean;
  `pnpm build` "Static export verified"; `check:client-budget`, `check:static-links`,
  `check:product-provenance`, `check:publishability`, `check:integrity-firewall`,
  `architecture:views:check`, `check:promotion-state` all PASS.
- GitHub Source Assurance on the merged head: `Quality Gates` pass,
  `Browser Assurance` pass, `Workers Builds` pass.

## Residual / not claimed

- The public product registry stays intentionally empty. No screenshot,
  product fact, capability or assurance claim was invented; the fixture app is
  synthetic and never deployed.
- Automated browser evidence does not substitute for real-user E4 evidence.
- Task 2 does not assert a real product profile render on the public site — that
  remains owner-fact gated (C2 P0 `BLOCKED_OWNER_FACT`).

## Factory learning

A test double that renders the real artifact must serve it truthfully. Any harness
that can silently drop a stylesheet, script or font turns a layout/behaviour
assertion into a measurement of an unstyled or script-less page, and it does so
without failing loudly. Guard the harness's own fidelity, not only the product's.
