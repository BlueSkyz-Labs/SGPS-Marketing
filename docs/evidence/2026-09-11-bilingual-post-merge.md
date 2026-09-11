# Bilingual (EN/VI) Post-Merge Evidence Ledger — 2026-09-11

**Scope:** closes the post-merge evidence gap for the bilingual architecture
(ADR 0008) and its follow-up hardening. Read-back against merged `main` only.

## Merged state

| Work                                                                                      | PR       | Verified                                                                                                                                     |
| ----------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Bilingual routing `/en/` + `/vi/`, reciprocal hreflang + x-default, legacy root redirects | #92, #93 | 10/10 routes answered 200; hreflang reciprocal (e2e `language-switching`, `hreflang-contract`, `i18n-contract`)                              |
| Legacy roots become real cross-host 301s (`return Astro.redirect` + `public/_redirects`)  | #116     | Live `curl -sI`: `/`, `/about/`, `/contact/`, `/privacy/`, `/security/`, `/support/`, `/products/` → **301** → `/en/…` on `blueskyzlabs.com` |
| Shared-component locale hardening (CTA labels/paths, parity fixture, guardrails)          | #120     | Architecture **138/138**; parity e2e 6/6 (chromium + firefox); production smoke included EN/VI checks                                        |

## Verification anchors

- Production smoke (`scripts/smoke-production.mjs`): **19/19 PASS** at
  `f2c3339` (includes VI home, VI trust routes, canonical-domain check).
- E4 automated matrix (`scripts/e4-matrix.mjs`): 38/38 across
  chromium/firefox/webkit incl. 320–1920px and reduced motion.
- Browser Assurance (Linux, all engines): green on the exact head of every
  merged PR above.

## Open items (tracked, not drift)

- **VI copy review:** all Vietnamese copy is a working draft until the owner
  reviews it (bilingual plan Open Question #3) — MANUAL/EXTERNAL REQUIRED.
- **Human E4** (real-user comprehension/credibility): OPEN — protocol in
  `docs/evidence/2026-09-11-s-plus-e4.md` §5.
