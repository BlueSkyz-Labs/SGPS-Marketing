# C2 route hygiene — legacy stubs + product profile route contract

Date: 2026-09-13
Waves: C2 support (P0/P1-adjacent)
Status: COMPLETED (agent-side); one owner-gated dependency recorded

## Finding

An independent read-only red-team audit of the C2 P1 homepage recomposition
(`feat/c2-p1-home`) reported that `getProductProfilePath()` emits
`/{lang}/products/{slug}/` while the repository only ships
`src/pages/products/[slug].astro`. Investigating that report produced two
verified facts:

1. **The legacy stub pattern is intentional, but the stubs carried dead
   templates.** `src/pages/index.astro`, `src/pages/products/index.astro` and
   `src/pages/products/[slug].astro` all `return Astro.redirect(...)` in their
   frontmatter and then shipped a full pre-C2 template below it. `Astro.redirect`
   returns before rendering, so that markup could never render — but it is dead
   weight that could resurface as a stale page, and it kept the retired
   `FeaturedProducts` / `FlagshipProof` composition (and its imports) alive.
2. **The locale product profile route is genuinely missing.** No
   `src/pages/{en,vi}/products/[slug].astro` exists, so the moment a product
   becomes public every product link (product cards, Atlas nodes, Decision Room
   rows, and the new C2 `FlagshipTheatre` / `ProductHouse`) would point at a path
   that resolves to nothing. The empty public registry hides this today; it is a
   latent defect, not a P1 regression.

## Change

- The three legacy routes are now minimal redirect stubs (redirect target and a
  comment only). No public copy changed: the redirect behaviour is identical.
- New guard `tests/architecture/product-route-contract.test.mjs`:
  - the locale product index routes must exist for both locales;
  - the profile-path helper must stay locale-prefixed;
  - legacy root paths must stay redirect stubs and must not render a template;
  - **fail-closed:** the moment the content registry declares a public product
    (`public: true`) without real locale profile routes, the guard fails — and
    it rejects a redirect stub as a "profile page";
  - non-vacuity is proven in-suite: the detector is fed a synthetic public
    product with no routes (must report missing), with stub routes (must report
    "still a redirect stub"), and with real pages (must be clean).

## Evidence

```
node --test tests/architecture/product-route-contract.test.mjs
ℹ tests 5   ℹ pass 5   ℹ fail 0
```

`pnpm test:architecture` 313/313, `pnpm build` static export verified (root
paths still redirect: `/` → `/en/`, `/products/` → `/en/products/`).

## Residual / owner-gated dependency

`OWNER-GATED (product publication)`: before the first public product is
published, `src/pages/en/products/[slug].astro` and
`src/pages/vi/products/[slug].astro` must exist and render the real profile
(with VI copy reviewed by the owner). The route-contract guard enforces this at
CI level, so the publication PR cannot land without them. This is a dependency
of product publication — it is **not** a C2 P1 blocker, and no product fact,
screenshot or copy was invented to close it.

## Verification state

Green evidence belongs only to the exact tested SHA. Browser evidence for the
C2 P1 change set lives in PR #160; this document covers the route contract only.
