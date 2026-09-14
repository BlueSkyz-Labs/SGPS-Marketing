# C2 P3 — product storytelling (Flagship Theatre + Product House hierarchy)

Date: 2026-09-14
Wave: C2 P3 (plan Tasks 7–9, PR-D)
Status: MERGED

## Outcome

PR #168 merged the truth-driven Product Storytelling wave into `main`.

- **Flagship Theatre** consumes the canonical product record, keeps the real screenshot as the visual protagonist, uses `ProductStatus` for factual status, and renders no fabricated product when the public registry is empty.
- **Product House** renders canonical products with editorial hierarchy while preserving ordinary links and literal action semantics.
- **Native continuity** derives stable transition names from the canonical product slug. Normal navigation remains authoritative; there is no client router, click interception, hydration requirement, or animation framework.
- **Cinematic enhancement** is desktop-only, transform-only and reset under reduced motion. Mobile remains a direct editorial composition.

Fixture-backed tests prove the product-present path without treating synthetic fixture content as production truth. Production still has zero published products behind the owner-gated screenshot floor.

## Exact-head assurance

- PR: #168
- Tested PR head: `8c0b81a18795f5f9a43f3bc20d2f746513a7a1f7`
- Source Assurance run: `34809543321`
- Quality Gates: SUCCESS
- Browser Assurance: SUCCESS
- Playwright + axe: SUCCESS
- Lighthouse CI: SUCCESS
- Merge commit: `c304ba66c5a3f152df4c4705fba0018caae32603`
- Post-merge `main` Source Assurance run: `34825983821` — SUCCESS

Pre-push evidence on the same implementation wave also recorded:

```text
pnpm typecheck                 -> 0 errors / 0 warnings / 0 hints
pnpm lint                      -> clean
pnpm format:check              -> clean
pnpm test:architecture         -> 338/338
pnpm build                     -> 30 pages, static export verified
pnpm architecture:views:check  -> PASS
pnpm check:client-budget       -> PASS: site-wide 2600 B; worst page 2069 B < 120000 B
pnpm check:static-links        -> PASS: 30 pages; 1016 links; 0 broken
pnpm check:publishability      -> PASS
pnpm check:product-provenance  -> IDLE: zero published products
pnpm check:integrity-firewall  -> PASS
chromium + mobile full project -> 721 passed, 1 skipped, 0 failed
continuity firefox + webkit    -> 16 passed, 0 failed
```

## Regression guards

- `tests/e2e/c2-flagship-theatre.spec.ts`
- `tests/e2e/c2-product-house.spec.ts`
- `tests/e2e/c2-product-continuity.spec.ts`
- `tests/architecture/product-continuity.test.mjs`
- existing C2 performance and truth-boundary contracts

## Residual

- The screenshot/publication floor remains owner-gated. Zero public products is still the legal production state.
- The canonical localized product profile route `/<lang>/products/<slug>/` is not implemented in production. The product-present continuity path is therefore proven with the test-only fixture until real product truth is supplied.
- No Cloudflare production read-back is claimed by this ledger; final runtime/provider read-back belongs to P6.