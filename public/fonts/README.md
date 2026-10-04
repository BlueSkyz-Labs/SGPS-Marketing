# Self-hosted brand font

Inter variable, weight axis only (wght 400-700), instanced from
`@fontsource-variable/inter@5.3.0` (`files/inter-*-opsz-normal.woff2`, the
optical-size + weight build) by `tools/instance-inter.py`: opsz pinned to 14
(the text size; display headings also use this face, see below), hinting and
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

## Display headings (calm-chrome round, 2026-10-04)

Display headings (`.type-d1`, `.type-d2`, `.hero-headline` on h1/h2; never
body, never CJK) use this same Inter Variable face at `--display-weight`
(520) with tight tracking. The Plus Jakarta Sans 700 display face from
Experience v6 S4 was retired by the Owner on 2026-10-04 ("calm chrome"); its
three subsets (about 26 KB) and `OFL-PlusJakartaSans.txt` were removed, so
display headings add no font bytes. Guard:
`tests/architecture/display-typeface-contract.test.mjs`.
