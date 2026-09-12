# Brand Kit v4 Production — Fidelity Verification & Guard

Date: 2026-09-12 · Kit release: **4.0.0** (2026-09-07) · Owner delivery: Production v4 zip + guidelines PDF.

## 1. Reconciliation of the delivered kit

The delivered kit was hash-compared against the committed kit mirror at
`brand/blueskyz-production-v4/` (applied earlier via PR #72):

- **242/242 files byte-identical**, 0 only-in-kit, 0 only-in-mirror.
- 3 CSVs (`ASSET_USAGE_MATRIX.csv`, `MANIFEST.csv`,
  `accessibility_contrast_matrix.csv`) differ **only by line endings**
  (CRLF delivery vs LF normalization) — content identical; mirror kept as-is.
- ⇒ The website already consumed this exact kit; this wave converts the
  application from _declared_ to _guarded_.

## 2. Published-asset fidelity (repo ↔ kit master)

50 published artifacts byte-compared (**50/50 identical**): 22 favicon/PWA
files, 3 canonical lockups, hero PNG/WebP/AVIF, 4 principle icons, 15
product icons/lockups, 3 token files. Full matrix is enforced by
`tests/architecture/brand-kit-v4-fidelity.test.mjs`.

## 3. Token layer completion (this wave)

`src/styles/global.css` gains the remaining Brand Kit v4 aliases so the CSS
layer matches `tokens.css`/`tokens.json` values exactly:

- `--brand-slate-650`, `--brand-slate-500` (decorative-only, per kit notes)
- `--brand-action-dark` (small-text accessible action, already the UI value)
- `--brand-text-disabled` (#94A3B8)
- `--brand-shadow-subtle` (kit shadow)
- `--brand-gradient-hero` (kit hero gradient)
- dormant `[data-theme="dark"]` semantics block (ships light-only today)

## 4. Rendered verification (browser evidence)

Hero screenshots (1440 desktop + 390 mobile) and the passport page were
rendered from the local build and visually inspected:

- Reverse-white lockup crisp on Ink; tagline "Intelligence. Elevated."
  porcelain + "Impact." cobalt, as the copy library requires.
- `website_hero_1920x1080` artwork renders as the premium hero visual with
  no stretching/clipping; no visual defects observed.
- Passport page brand surfaces render correctly.

## 5. Contrast compliance (kit matrix vs site)

| Pair                  | Kit ratio | Site status                                                                  |
| --------------------- | --------- | ---------------------------------------------------------------------------- |
| Ink on Porcelain      | 17.82     | PASS (primary text)                                                          |
| Cobalt on Porcelain   | 4.55      | PASS (accent/link)                                                           |
| Slate700 on Porcelain | 9.74      | PASS                                                                         |
| Slate650 on Porcelain | 7.13      | PASS (`--text-muted`)                                                        |
| Slate500 on Porcelain | 4.48 FAIL | Reserved decorative/large — matched                                          |
| White on Ink          | 18.93     | PASS                                                                         |
| Cobalt on Ink         | 3.92 FAIL | Footer accent uses cobalt-mix (`#6692FF`, 6.42:1) — resolved in earlier wave |

## 6. Guard added

`brand-kit-v4-fidelity.test.mjs` (4 tests, arch tier):

1. byte-equality of all 50 published assets vs kit masters (drift fails CI);
2. CSS token layer carries kit brand/semantic colors + motion values +
   gradient + dormant dark block;
3. document head keeps favicon.svg / favicon.ico `sizes=any` /
   apple-touch / manifest / `theme-color #0B1020`;
4. kit mirror reports 4.0.0.

## 7. Residual / external

- Inter font binaries are intentionally not packaged by the kit; the site
  uses the `Inter, ui-sans-serif, system-ui` stack and ships no font files
  (no licensing surface added). Owner may later self-host licensed Inter.
- Prismatic Hero remains raster-first (kit caveat); flat vectors are used
  in UI. Billboard-scale prismatic needs future native rebuild (kit caveat).
- Trademark/legal clearance and specialty print remain owner/external.
