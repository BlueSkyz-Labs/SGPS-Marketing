# Wave H3 — breadcrumbs, reduced motion, product provenance

Date: 2026-09-12
Branch: `feat/wave-h3` (base `caf0719`, squash of wave H2b / #140)
Status: **VERIFYING** — local gates green; awaiting exact-head Source Assurance.

## Scope

Third hardening wave: structured-data depth, a real accessibility guarantee, and
the product provenance guard the plan asked for (T3), all reachable without
owner authority.

| Item           | Artifact                                                                                            | Status            |
| -------------- | --------------------------------------------------------------------------------------------------- | ----------------- |
| Breadcrumbs    | `src/lib/breadcrumbs.ts` + `BaseLayout.astro` + `tests/architecture/breadcrumb-contract.test.mjs`   | REMEDIATED        |
| Reduced motion | `tests/architecture/motion-reduce-contract.test.mjs`                                                | GUARDED           |
| T3 provenance  | `scripts/check-product-provenance.mjs` + `tests/architecture/product-provenance.test.mjs` + CI step | REMEDIATED (idle) |

## What changed

1. **Breadcrumb structured data.** Subpages now emit a `BreadcrumbList` JSON-LD
   entry (the home page deliberately does not). Names come only from data the
   site already declares — the footer nav labels, the Decision Room heading, and
   the Evidence passport label — so a route without a canonical name gets **no**
   breadcrumb rather than an invented one. The contract test pins the trail
   shape, the declared-name rule, fail-closed unknown/cross-locale paths,
   canonical absolute URLs, contiguous positions, and EN/VI parity of the
   decorated route set.
2. **Reduced motion is now a contract, not a habit.** The global stylesheet
   neutralises transitions and animations for `prefers-reduced-motion: reduce`
   via `!important` durations on the universal selector, and the entrance
   animations live behind `no-preference`. The guard asserts the neutraliser
   exists, that **nothing outside the reduce block out-ranks it with
   `!important`**, that every decorative animation has a `@keyframes`
   definition, and that no `@keyframes` block is dead code. (No defects found —
   the value is the regression guard, which previously did not exist.)
3. **Product provenance (T3).** `pnpm check:product-provenance` fails closed when
   a listing cites a `sourceRevision` that does not resolve, or resolves to a
   commit unreachable from the checked-out candidate — the same class of drift
   that CI caught in wave H2. An empty registry reports
   `IDLE (0 published products)` instead of a silent pass, and the guard is
   wired into Quality Gates so it activates the moment a product is listed.

## Evidence (local, exact this branch)

- `pnpm test:architecture` → **279 pass / 0 fail**
- `pnpm typecheck` → 0 errors; `pnpm lint` clean (`--max-warnings=0`); `pnpm format:check` clean
- `pnpm build` → Static export verified; `dist/en/about/index.html`, `dist/vi/privacy/index.html`,
  `dist/en/decision-room/index.html` each contain exactly one `BreadcrumbList`; `dist/en/index.html` contains none
- `pnpm check:product-provenance` → `Product provenance: IDLE (0 published products …)`
- `pnpm check:client-budget` → site-wide 2 567 B, worst page 2 036 B (< 120 000 Brotli)
- e2e chromium (touched surfaces) → 9/9 (`integrity-lens`, `shell`)

## Residual risk

- Breadcrumb labels for future routes must be added to declared data; the guard
  will keep those routes crumb-free until that happens (intended, but a visible
  gap until then).
- The motion guard inspects the global stylesheet only; component-scoped
  `<style>` blocks are covered transitively by the universal neutraliser, not
  individually asserted.
- The provenance guard reads source files, not the runtime registry: if the
  content collection ever loads products from elsewhere, the scanner needs a
  matching source.
