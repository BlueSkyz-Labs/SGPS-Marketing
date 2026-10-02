# Self-hosted brand font

Inter variable, weight axis only (wght 400-700), instanced from
`@fontsource-variable/inter@5.3.0` (`files/inter-*-opsz-normal.woff2`, the
optical-size + weight build) by `tools/instance-inter.py`: opsz pinned to 14
(the text size; display headings use Plus Jakarta Sans), hinting and
gasp/STAT/MVAR dropped, cmap and layout features unchanged. Reproduce with
`pip install --user fonttools brotli` then
`python3 tools/instance-inter.py <upstream-opsz.woff2> public/fonts/inter-<subset>-wght-v5.3.0.woff2`
(upstream bytes: the previous `inter-*-opsz-v5.3.0.woff2` files at commit 2e2cfa8).
SIL Open Font License 1.1 in `OFL.txt`. `tests/architecture/inter-glyph-coverage.test.mjs`
checks built HTML against the new cmap.

| File                                 | Subset     |  Bytes | SHA-256                                                            |
| ------------------------------------ | ---------- | -----: | ------------------------------------------------------------------ |
| `inter-latin-wght-v5.3.0.woff2`      | Latin      | 34,224 | `807ac29aa1d2e3ca0e78eaf6d1962de2733deaa9069b842ee9f37a65a152a989` |
| `inter-vietnamese-wght-v5.3.0.woff2` | Vietnamese |  7,100 | `7ce9c75e40446bcb2d1cfc1ab1f22ff919ae59adfee201502d64d4f15fda93e1` |

`public/theme-init.js` preloads Inter (Latin on every locale, plus Vietnamese
on `/vi/`; about 51 KB on `/vi/`) for Chromium/Firefox only. The preload is
engine-gated because on WebKit it makes the subset download twice and would
exceed the 100 KB page font budget. Other locales request a subset
only when their text needs it. Give updated files new versioned URLs and
recompute these hashes.

## Display face (Experience v6 S4)

Plus Jakarta Sans 2.071, weight 700 only, for display headings
(`.type-d1`, `.type-d2`, `.hero-headline` on h1/h2; never body, never CJK).
Source: `@fontsource-variable/plus-jakarta-sans@5.3.0` `files/*-wght-normal.woff2`
(npm registry tarball, not added as a dependency). Each subset was instanced
to `wght=700` and re-subsetted with fontTools (`instancer` + `subset`, WOFF2,
hinting dropped, cmap unchanged), so these bytes are NOT the package bytes.
Licence: SIL OFL 1.1, `OFL-PlusJakartaSans.txt`, copied from
<https://raw.githubusercontent.com/tokotype/PlusJakartaSans/master/OFL.txt>
(Copyright 2020 The Plus Jakarta Sans Project Authors).

| File                                            | Subset     |  Bytes | SHA-256                                                            |
| ----------------------------------------------- | ---------- | -----: | ------------------------------------------------------------------ |
| `plus-jakarta-sans-latin-700-v5.3.0.woff2`      | Latin      | 10,656 | `bbf50daf2928bb1c54f6e979083422867f946658fa5a82f46d63ee01a2e1df87` |
| `plus-jakarta-sans-latin-ext-700-v5.3.0.woff2`  | Latin-ext  |  9,652 | `f0096e10c8c3c0268adfc22841f242f1ce7e6f7c21a1b8cf384260bf80e01a03` |
| `plus-jakarta-sans-vietnamese-700-v5.3.0.woff2` | Vietnamese |  3,724 | `560ab02586a509cb68934eca1c3320e4f70c3ff096af4bf01fe5efda4edfec07` |

All three: 24,032 bytes added; `/vi/` and `/en/` request Latin + Vietnamese or
Latin only (latin-ext loads only when a heading needs it). Preloaded
from `public/theme-init.js` (same engine gate as Inter, requested before Inter
so the 74 KB Inter Latin transfer cannot queue ahead of it): the hero H1 is the
mobile LCP element and measured 2026-10-01 (Lighthouse mobile, 7 runs, `/vi/`)
element render delay fell ~290 ms to ~197 ms, median LCP 2546 to 2368 ms, CLS 0.
This supersedes the earlier S4 "never preloaded" statement.
