# W5 — Share & discovery

Depends on W3.1.

## W5.1 Build-time Open Graph images

- Generate `public/social/products/<slug>-<lang>.png` (1200×630) at build from brand-kit assets (identity art + endorsed lockup) using `sharp` (already an Astro dependency) in a script run by `pnpm build`; no runtime service.
- Wire `og:image`, `og:image:alt` (localized), `twitter:card=summary_large_image` per product profile.
- **Acceptance:** architecture test asserts every public product × locale has an OG file with correct dimensions and alt text; `check:static-links` passes.

## W5.2 Sitemap / hreflang regression

- Test: sitemap lists 5 products × 3 locales + indexes; every product page carries reciprocal `hreflang` (`en`, `vi`, `zh-Hans`, `x-default`) and a self canonical.
