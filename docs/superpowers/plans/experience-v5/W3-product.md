# W3 — Product presentation & locale (Brand Kit v4 W2–W3, Council S01/S05/G05/G06)

Depends on W2.1. Product facts come only from `src/content/products/*.yaml` (owner-approved truth, see #291/#293). Never add capabilities.

## W3.1 Typed media kind (S01)

- `src/lib/product-schema.ts`: `proof.media.kind: "identity-art" | "ui-screenshot"` (required). Set all five products to `identity-art`.
- Captions, `ProductVisual`, profile pages and JSON-LD derive wording from `kind`, never from the filename. `--c3-image-surface-background` stays ink only for `identity-art`; `ui-screenshot` uses a device frame (W3.3).
- Rename assets `public/products/*/screenshot.png` → `identity.png` with redirects not required (not linked externally; verify with `check:static-links`).
- **Negative proof:** a product with `kind: ui-screenshot` but identity-art caption fails `product-provenance` checks.

## W3.2 Lifecycle → CTA mapper (S05)

- New `src/lib/lifecycle-cta.ts`: maps `lifecycle` × `availability` × locale → verb (`Learn`, `View development status`, `Try`) and destination. `Try` only when `availability` is `public` and `primaryAction.href` is an allow-listed HTTPS product origin.
- Replace hard-coded "Preview X"/"Explore X" in `ProductCard.astro`, `FlagshipTheatre.astro`, profile pages.
- **Negative proof:** a `development` product can never render `Try`.

## W3.3 Bento product card & profile

> **Ownership:** the bento ProductCard and device frame are implemented by the Brand Kit v4 lane (#307, #308). Converge on one icon helper and one localized-copy source; do not duplicate.

- `ProductCard.astro`: product icon already published at `public/brand/blueskyz/v4/products/<slug>.svg` (source: `brand/blueskyz-production-v4/03_ICONS/03_PRODUCT_ICONS/`), static status chip (no pulse), platform chips from `platforms`, CTA from W3.2. Hover elevation already exists — keep reduced-motion neutraliser.
- Profile: endorsed lockup (`public/brand/blueskyz/v4/products/<slug>_endorsed_lockup_{light,dark}.svg`, theme-swapped like W2.4) + 128 px icon header; bento grid for jobs and direction (replaces `<ul>`); identity stage for `identity-art`; device frame reserved for future `ui-screenshot`.
- De-duplicate: homepage flagship product is excluded from the featured grid (`ProductHouse` receives the flagship slug).
- **Acceptance:** W1.1 diffs reviewed; 44 px targets; 320 px/200 % zoom clean.

## W3.4 Localized product content (F-05, G06)

- Schema: `jobs`, `capabilities`, `shortDescription`, `publicLabel`, `audience` labels, `primaryAction.label` become locale maps `{ en, vi, zh }` keyed per claim; build **fails** when a locale is missing (no English fallback).
- Authoring: translate existing English claims faithfully; do not add or strengthen meaning. Mark the PR `FEEDBACK_CHECKPOINT: native VI/ZH review` and list every string for the Owner cross-check. zh promotion remains gated by DEC-019 residuals.
- Localize status/chip vocabulary in `src/lib/product-schema.ts` / `public-state-semantics.ts`.
- **Acceptance:** W1.6 locale-leak probe passes for product routes (remove its `test.fail`).

## W3.5 Shared `[lang]` product routes (F-12)

- Replace `src/pages/{en,vi,zh}/products/[slug].astro` and `index.astro` with `src/pages/[lang]/products/...` using `getStaticPaths` over `SUPPORTED_LANGUAGES × products`. URLs, canonical, hreflang, breadcrumbs and JSON-LD must be byte-identical in meaning (compare built HTML before/after with a script; attach the diff summary).
- **Acceptance:** zero W1.1 visual diff; sitemap unchanged; all trilingual contract tests pass.
