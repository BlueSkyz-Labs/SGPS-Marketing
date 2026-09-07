# BlueSkyzLabs Production v4 Marketing Asset Migration Plan

**Goal:** Make `BlueSkyzLabs_Brand_Kit_Production_v4` the sole canonical branding source for SGPS-Marketing and migrate runtime visuals from legacy R4d to exact Production v4 exports without approximation.

**Canonical archive:** `BlueSkyzLabs_Brand_Kit_Production_v4.zip`

**Expected SHA-256:** `9534d34ef91a039f59da916426f4ca465c142d743c0b263671e9d0411693b75d`

## Phase A — canonical correction (actionable now)

- [x] Record Production v4 as `FINAL_PRODUCTION_READY` canonical kit in `brand/production-v4/STATUS.json`.
- [x] Record verified audit counts: 242 files; 153 raster; 46 SVG; 18 PDF; Guidelines v4 10 pages; 20 dimension checks PASS; ZIP integrity 0; errors 0; warnings 0.
- [x] Mark R4d as superseded and non-canonical.
- [x] Preserve Tony Nguyen — Founder & CEO, Ho Chi Minh City, Vietnam, and `blueskyzlabs.com` as centralized public identity.
- [x] Correct architecture tests so they no longer require an R4d visual asset as the intended branding contract.
- [x] Keep canonical URL/public-truth/security behavior independent from branding migration.
- [ ] Run architecture/typecheck/lint/format/build/client-budget/static-links against the corrected contract.
- [ ] Run Chromium/axe/Lighthouse against the corrected branch head.
- [ ] Record exact-head evidence.

## Phase B — exact Production v4 binary import (artifact-gated)

Prerequisite: exact `BlueSkyzLabs_Brand_Kit_Production_v4.zip` bytes must be mounted or committed.

- [ ] Compute SHA-256 and require exact match with `9534d34ef91a039f59da916426f4ca465c142d743c0b263671e9d0411693b75d` before extraction.
- [ ] Reject archive on checksum mismatch, path traversal, malformed ZIP entries, unexpected executable content or integrity failure.
- [ ] Import the canonical kit under `brand/production-v4/` and project only web-required exports to `public/brand/blueskyz/v4/`.
- [ ] Preserve original filenames and a machine-readable source→runtime projection manifest.
- [ ] Replace header/footer/hero logo and symbol references with exact v4 assets.
- [ ] Replace favicon/app icons/social OG/banner assets with exact v4 exports where applicable.
- [ ] Replace R4d-derived CSS palette/gradients/type rules with exact Production v4 tokens; derive accessible UI variants only when WCAG requires them and record the derivation.
- [ ] Replace any remaining R4d decorative artwork on About/Home with v4 artwork.
- [ ] Update `STATUS.json` to `archive.importedIntoRepository=true` only after checksum and projection verification.
- [ ] Add tests that reject runtime `/r4d/` references once v4 migration is complete.
- [ ] Re-run full source, browser, accessibility and Lighthouse gates.
- [ ] Red-team responsive layouts at the 320px floor and desktop breakpoints.
- [ ] Record final provenance evidence and only then open/promote the focused PR.

## Hard constraints

- Do not copy R4d assets into a v4 directory.
- Do not recreate the v4 logo, fonts, banners, badges, icons or gradients from memory.
- Do not claim Production v4 visual migration complete while the exact archive is absent.
- Do not invent email, social handles, certifications, legal identity or customer claims.
- No new branding-only runtime JavaScript or third-party dependency.
- R4d may remain only as a clearly documented temporary runtime fallback until Phase B completes.
