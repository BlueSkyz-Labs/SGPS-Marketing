# Experience v6 S7 — Reveal signature: provenance and prototype status

Status: **VALIDATE prototype.** Not a House Code promotion, not a recognition result, not Human E4. Evidence class E1/E2 (local static build, headless Chromium). Stacked on S1 (PR #384).

Plan: Experience FULL v6 §1 decision 2 (Owner chose signature "A. Reveal", 2026-09-30), §7 motion system, slice S7.

## Design intelligence consulted (VCDI)

Per `standards/experience/BPXS_INVOCATION_CONTRACT.md` (sgps-core `ec0a1cf`), VCDI sources are design-intelligence inputs, not styles or runtime themes:

| Source  | VCDI domain         | How it informed the prototype (structural, not decorative)                                                                                  |
| ------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Sơn Mài | Depth & Revelation  | Order of disclosure: three sail layers lay down back-to-front with a fixed stagger; below-fold planes reveal with translucency then settle. |
| Chu Đậu | Clarity & Precision | Drawing discipline: thin exact strokes (`stroke-dashoffset`, non-scaling 1.5 px) trace the real construction joins before any fill lands.   |

No lacquer colour, texture, ceramic motif or cultural ornament is used. Token names are functional (`--motion-*`, `--ease-*`); a guard rejects cultural token names. The only visible signature in the composition is the hero mark assembly; the proof band and flagship frame reuse the same grammar quietly (plane opacity and clip-path) and never play in the same viewport as the mark (they arm only when below the fold).

## Status and non-claims

- House Code status for both sources stays `VALIDATE`. This change does not satisfy `HOUSE_CODE_PROMOTION_CONTRACT.json` (no recognition study, no Owner promotion approval) and claims no promotion.
- No claim that the motion improves comprehension, trust or brand recognition. Those need real-user evidence.
- Timing values are the plan's starting point (`VALIDATE`); none was tuned in this slice.

## Transformation record

| Item                | Source                                                                                                                    | Transformation                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Sail geometry       | `public/brand/blueskyz/v4/logos/horizontal-flat-dark.svg` (same paths as `public/icons/favicon.svg`), viewBox 0 0 512 512 | Path data and dark-variant gradient stops copied into `src/components/motion/SailReveal.astro`. `brand/` is not modified.        |
| Construction guides | Derived: chord, baseline and mast line between existing path vertices (72,432), (394,54), (371,408), (255,334)            | Three hairline strokes; no new brand geometry.                                                                                   |
| Hero hand-off       | S1 raster mark `public/brand/blueskyz/v4/hero/prismatic-r4d-mark-*.webp`                                                  | Overlay scaled 1.07 and shifted to sit on the raster sail, then fades out; the raster (unchanged, non-LCP) is the resting state. |

## Mechanics

- CSS default = final state. No-JS, `prefers-reduced-motion: reduce`, forced colors and print show it at t=0.
- `RevealObserver` (one `<script>`, under 2 KB source) sets `html[data-motion="on"]` only when motion is allowed, and arms `.reveal-planes` elements that start below the fold with `data-revealed="false"` then `"true"` once.
- Only `transform`, `opacity`, `stroke-dashoffset`, `clip-path`; no infinite iteration; no `will-change`; no `backdrop-filter`. The dead perpetual `hero-glow-pulse` (unused `.hero-visual-glow`) is deleted.
- The LCP (hero `h1`) is never an animation target; the mark is aria-hidden, decorative and desktop-only (the S1 hero visual is hidden below 1024 px).
- Existing `.reveal` (global.css, a 400 ms transform-only rise from the `Reveal` wrapper) is a different, older utility and is unchanged; the new utility is `.reveal-planes` to avoid a name collision.

## Residual

- Lighthouse and human review: see the PR body for what was measured.
- `/verify` disclosure appearance (plan §7 item 3) waits for S3; `.reveal-planes` is ready to be used there.
