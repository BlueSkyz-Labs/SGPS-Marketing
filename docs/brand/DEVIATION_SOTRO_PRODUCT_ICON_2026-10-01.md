# Brand Kit v4 deviation — Sổ Trọ product icon — 2026-10-01

**Status:** Owner-approved DEVIATION from Brand Kit v4 / Brand Guidelines v4 p.06 (Product brands). Applies to Sổ Trọ only.
**Decision (Owner, 2026-10-01, re-confirmed twice):** the one Sổ Trọ product icon on the website is the original red-background "Cuốn Sổ Đỏ Vàng Kim" app icon (red leather book, gold lock and key, gold "SỔ TRỌ" text). It replaces the kit v4 blue-house Sổ Trọ mark (`03_ICONS/03_PRODUCT_ICONS/sotro.*`, `06_PRODUCT_BRANDS/01_LOCKUPS_SVG/sotro_endorsed_lockup_*`, `REFERENCE_sotro_icon_*`) everywhere on the website.

## Reason

- The Owner approved the Cuốn Sổ Đỏ Vàng Kim design as the app's official icon on 2026-08-10 (Sotro PR #8, commit `ad7551a`). It is the product's recognised mark.
- It carries the project's Vietnamese red-gold identity; the kit v4 blue house was a generic placeholder drawn for the endorsed-lockup system.
- One product, one icon: the app, the PWA and the website must not show two different Sổ Trọ marks.

## Scope and what does not change

| In scope (changed)                                                                              | Not changed                                                                                                  |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `public/products/sotro/icon.svg`, `icon.png`, `identity.png`                                    | The BlueSkyz Labs header, footer and gateway lockups (flat lockup exactly as the kit says; Owner decision 2) |
| `public/brand/blueskyz/v4/products/sotro.svg`, `sotro_endorsed_lockup_{light,dark}.svg`         | Masterbrand rules: clearspace, minimum sizes, Prismatic-in-hero-only, tokens, favicon/PWA set, OG card       |
| Product cards, flagship hero card, product profile header, profile lockup, proof/identity stage | ApexAgent, FluentArc, Sổ Tâm, Vững Tay Lái (kit marks, byte-identical)                                       |
| Nothing under `brand/blueskyz-production-v4/**` is edited; `SHA256SUMS.txt` stays valid         | The kit distribution (the blue house remains in the kit as the superseded v4 reference)                      |

## Implementation record

- **Source (read-only):** Sotro app repo `public/icons/icon.svg` (sha256 `974982e146e549b838e602e6c92899143aa186b33bff646e89be8dc05ac43fff`, 512 viewBox) and `public/icons/icon-512.webp` (sha256 `b1446b9f002e32c995b62aad32ec1651b26aad93bfe98b1e40891a377fac14af`; `icon-512-maskable.webp` is byte-identical). Rules: `docs/ICON_DESIGN_STANDARD.md` (full-bleed square, no transparency, OS rounds the corners, Vietnamese text only).
- **Vector at small sizes:** `icon.svg` is copied byte for byte to `public/products/sotro/icon.svg` and `public/brand/blueskyz/v4/products/sotro.svg`, and is embedded as the glyph of both endorsed lockups (a lockup renders the icon about 22 to 28 px tall on profile pages).
- **Raster at 2x or more:** product cards, the flagship hero card and the profile header use `public/products/sotro/icon.png`, a 256 x 256 opaque PNG resampled from `icon-512.webp`. The largest rendered size is 92 px of content (112 px tile with padding), so the file is at least 2.7x the display size. The large identity art `identity.png` (1800 x 504) embeds the 512 px raster at 330 px, 2.3x its maximum on-page width share.
- **Endorsed lockups:** built from the kit's own `sotro_endorsed_lockup_{light,dark}.svg` by replacing only the glyph group `translate(40 70) scale(4.3)` with the icon in the same 275.2 x 275.2 box. Viewbox, product name "Sổ Trọ", descriptor "Smart Rental Management", "A BlueSkyz Labs product", fills and `aria-label` are the kit's bytes. Reproduce with `node docs/brand/sotro-icon/build-sotro-assets.mjs <sotro-checkout>`; the guard recomputes them from the kit and the icon.
- **Container:** the kit's other product lockups use no container, so none is added. The vector carries the app's own 25 percent corner radius (`rx` 128 of 512); the raster inside `identity.png` is clipped to the same radius so both read as one mark. Site tiles that already round product icons keep doing so.
- **Known difference to resolve in the app repo, not here:** the app's `icon.svg` is a simplified drawing of the same motif (book, key, "SỔ TRỌ", coins) and is not a trace of the raster. It uses live `system-ui` text and `feDropShadow`, so its lettering varies by platform. The website follows the Owner's instruction (vector at small sizes, raster at 2x or more).

## Guard

`tests/architecture/sotro-redbook-icon.test.mjs` fails if any file under `public/` or `dist/` is still one of the six blue-house Sổ Trọ assets (content hash) or an SVG containing the blue-house glyph, if source or built pages reference the kit's Sổ Trọ reference or product-icon paths, if the lockups drift from kit layout plus the icon, or if the icon files drift from the documented source and sizes. Each guard has a negative proof. `tests/architecture/brand-kit-v4-fidelity.test.mjs` keeps requiring byte identity with the kit for the other four products only.

## Conformance impact

`docs/brand/BRAND_KIT_CONFORMANCE_2026-10-01.md` row BK-32 records this as DEVIATION(Owner). The kit distribution still lists the blue house; a future kit revision (v5) should adopt this decision so the kit and the website agree.
