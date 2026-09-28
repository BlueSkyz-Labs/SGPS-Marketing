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
