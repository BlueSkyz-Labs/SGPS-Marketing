# Wave H7 — markup baseline (passport h1)

Date: 2026-09-12
Branch: `feat/wave-h7` (base `475ea7b`, squash of wave H6 / #144)
Status: **VERIFYING** — local gates green; awaiting exact-head Source Assurance.

## Finding

A static sweep of all **30 built pages** (`dist/**/*.html`, checking document
language, h1 count, image alt text, duplicate ids, title/description/canonical)
found one real defect class:

- **The evidence passport documents had no `h1` at all.** The claim rendered at
  `h2` with no page-level heading above it, so the printed/readable document
  structure started mid-hierarchy. (Remaining sweep output — legacy redirect
  stubs and the localhost canonical of a local build — is expected: stubs are
  noindex shims and the production build rewrites the canonical.)

## What changed

- `src/pages/{en,vi}/evidence/[id].astro` render a localized document title —
  **"Evidence passport" / "Hộ chiếu bằng chứng"** — as the page `h1`, above the
  claim (`h2`) and the sources list (`h3`): a valid h1→h2→h3 hierarchy.
- `tests/e2e/markup-baseline.spec.ts` asserts, across nine EN/VI routes: exactly
  one **visible** `h1`, correct document language, absolute canonical containing
  the route, and a non-trivial meta description; plus that the passport page
  names both the document (h1) and the claim (section heading).

## Evidence (local, exact this branch)

- Rebuild → `dist/{en,vi}/evidence/security-reporting-is-private/index.html` each contain exactly one `h1`
- `pnpm exec playwright test tests/e2e/markup-baseline.spec.ts --project=chromium --workers=1` → **10/10 pass**
- `pnpm test:architecture` → **296 pass / 0 fail** · `pnpm lint` / `pnpm format:check` clean
- Sweep re-run: no remaining real-page findings (only redirect stubs + local-build canonical)

## Residual risk

- The sweep script lives in `.hermes/exp-audit/` (git-ignored) and is evidence,
  not a gate; the durable contract is the e2e spec.
- Duplicate `title` on `/404` surfaces (root fallback vs localized pages) is
  intentional; search engines see 404 status, not duplicate content.
