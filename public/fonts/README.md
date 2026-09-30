# Self-hosted brand font

Inter variable with optical-size and weight axes, sourced from
`@fontsource-variable/inter@5.3.0` (`files/inter-*-opsz-normal.woff2`).
Subset binaries are unchanged from that package; the Inter project is
distributed under the SIL Open Font License 1.1 in `OFL.txt`.

| File                                 | Subset     |  Bytes | SHA-256                                                            |
| ------------------------------------ | ---------- | -----: | ------------------------------------------------------------------ |
| `inter-latin-opsz-v5.3.0.woff2`      | Latin      | 72,920 | `2c295d99e26dcf357d4d01bcf270fd6924b600c9a13dd8c363ef114f4c6976fa` |
| `inter-vietnamese-opsz-v5.3.0.woff2` | Vietnamese | 15,268 | `935ab355938e6cd9b5fa39f2c3250ee16f3b08807c65dc4162356b50dbc8c7a2` |

Only English pages preload Latin. `/vi/` requests both subsets on demand
(88,188 bytes total); preloading Latin there makes WebKit fetch that subset
twice and exceeds the 100 KB page font budget. Other locales request a subset
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
Latin only (latin-ext loads only when a heading needs it). No preload: the
display face is never the LCP dependency (`font-display: swap` with the
`Display Fallback` metric-matched face).
