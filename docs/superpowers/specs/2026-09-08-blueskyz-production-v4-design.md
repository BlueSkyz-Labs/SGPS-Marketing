# BlueSkyz Labs Production v4 Website Design

## Goal

Replace the website's R4d v1.1 candidate projection with the owner-supplied
BlueSkyz Labs Production Brand Kit v4.0.0, while preserving the existing
evidence-gated product registry and the live `blueskyzlabs.com` deployment.

## Source of truth

- The supplied `BlueSkyzLabs_Brand_Kit_Production_v4.zip` is the authoritative
  production asset source.
- `01_BRAND_GUIDELINES/` and `00_START_HERE/BRAND_STANDARDS.md` define usage,
  color, typography, clearspace, minimum sizes, and source-of-truth hierarchy.
- `08_REFERENCE_MOCKUPS/` and `10_CONCEPT_REFERENCE/` remain reference-only;
  neither may be used as production identity or product evidence.
- The website uses `blueskyzlabs.com` as its canonical public origin.

## Experience direction

The homepage keeps the existing evidence-safe information architecture but
adopts the v4 visual language: Porcelain/Ink surfaces, cobalt accents, the
official brand line `Intelligence. Elevated. Impact.`, the supplied website
hero artwork, Inter-compatible system typography, and the four principle
icons. The page must remain useful when the public product registry is empty;
no product names, screenshots, metrics, emails, or contact details are
invented merely because the kit contains product-brand assets.

## Asset architecture

1. Import the complete supplied kit under `brand/blueskyz-production-v4/` for
   provenance and future channel handoff.
2. Project only web/runtime assets into `public/brand/blueskyz/v4/` and
   `public/social/`.
3. Use canonical flat SVG masters for header, footer, favicon, and small UI
   surfaces. Use the supplied Prismatic Hero/website hero raster only for the
   large hero/campaign surface where the guideline permits it.
4. Use the v4 PWA family: SVG favicon, ICO fallback, opaque Apple Touch icon,
   `any` and `maskable` PWA icons, Safari pinned tab, and Windows tile assets.
5. Add the five endorsed product lockups and product icons to the runtime
   asset map without publishing product claims until product evidence exists.
6. Keep a v4 SHA-256 manifest and a source-kit verification test so future
   asset drift fails deterministically.

## Token and layout architecture

- Map `07_DESIGN_TOKENS/tokens.css` and `tokens.json` into the existing
  semantic CSS layer rather than scattering raw values through components.
- Use v4 values: Ink `#0B1020`, Porcelain `#F7F8FA`, Cobalt `#2564FF`, Slate
  700 `#334155`, and Slate 650 `#475569` for supporting body text.
- Reserve Slate 500 `#64748B` for large/decorative content because the v4
  contrast audit rejects it for normal body text.
- Preserve accessible focus states, reduced-motion behavior, and the existing
  static Astro architecture.

## Verification and release

- Verify imported kit with the supplied v4 verifier and manifest checks.
- Run architecture, typecheck, lint, format, build, client budget, static
  links, Chromium/axe, and Lighthouse gates.
- Promote through the existing GitHub PR/source-assurance flow, then trigger
  Cloudflare Workers Builds production from the merged `main` SHA.
- Smoke-test apex, `www`, canonical, OG/PWA assets, robots, sitemap, and a
  missing route after deployment.

## Explicit non-goals

- Do not populate the product registry or assert product readiness.
- Do not invent or publish corporate/security emails.
- Do not use concept/reference mockups as production assets.
- Do not perform trademark filing, legal clearance, specialty print proof, or
  social-platform uploads; those remain external kit gates.
