# Experience v5 — audit round 2 (measured, 2026-09-29)

**Audited revision:** `main@2595d76` (after #332, #329, #316, #336 landed).
**Evidence class:** E1/E2 — source reading, local static build, headless Chromium (Playwright 1.63), axe-core, Lighthouse. Firefox and WebKit were **not** run locally. Nothing here is Human E4, served-revision proof, anonymous-access proof or Owner acceptance.
**Verifier role:** independent read-only verification. No `src/` or `tests/` file is changed by this document's PR.

## Environment bootstrap & test execution

| Item        | Value                                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime     | Node 24.20.0 (bootstrapped into a scratch directory; host default differs), pnpm 11.25.0, `pnpm install --frozen-lockfile`                              |
| Browser     | Chromium at `/opt/pw-browsers/chromium`, headless; uncommitted local config only                                                                        |
| Server      | `python3 -m http.server` over `dist/` (no compression, no Cloudflare headers)                                                                           |
| Gates       | `pnpm test:architecture` 701/701, typecheck 0 errors/0 warnings, lint, format, build (67 pages), client JS 10 920 B Brotli, static links 0 broken: PASS |
| Limitations | Lighthouse LCP is pessimistic (no compression). No Firefox/WebKit. Production is behind Cloudflare Access, so served behaviour is **NOT VERIFIED**.     |

## Progress against the v5 plan (from merge evidence plus the measurements below)

Score: done = 1, partial = 0.5, not started = 0. Cards that duplicate another wave are counted once (W7 is canonical). It counts cards, not effort, and overstates progress where a card is large (for example W1.1).

| Wave                              | Score  | State                                                                                                                                      |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| W0 P0 and base defects (#302)     | 7/7    | Done                                                                                                                                       |
| W1 gates that see what users see  | 1.5/8  | Only W1.7 (via W7.10) is done; W1.3 partial. No W1 PR is in flight.                                                                        |
| W2 design foundation              | 3/5    | Shell material (ADR 0012) and self-hosted Inter (#316) done; tokens and lockup partial; fluid type not started                             |
| W3 product presentation           | 3/5    | Typed media kind (#336), bento cards and profiles (#332), localized copy done; W3.2 CTA mapper in #339; shared `[lang]` routes not started |
| W4 homepage                       | 2/4    | Hero (#317) done; density and motion partial; principle cards exist only in a component that no page mounts (F-30)                         |
| W5 share and discovery            | 0.5/2  | Only generic hreflang coverage; no per-product Open Graph images                                                                           |
| W6 external gates                 | 0/7    | Not agent-completable; no evidence yet                                                                                                     |
| W7 premium re-cut                 | 12/13  | Remaining: W7.11 (evidence record)                                                                                                         |
| **Overall (deduplicated, no W6)** | ≈ 52 % | 16.0 of 31 cards                                                                                                                           |

Root-cause corrections to earlier plan text: the Firefox deep-link failure was Firefox restoring the previous scroll position over a same-tab fragment navigation (fixed in #329 by `fragment-anchor.ts`), not a transition that never settles as the W7.8 card guessed. The self-host font failure in #316 was WebKit downloading a preloaded subset twice; the fix is an engine-aware preload injected by `public/theme-init.js`.

## Findings

Severity: **P1** = visible defect or WCAG failure on the public surface; **P2** = quality gap; **P3** = hygiene. Numbers were measured on `main@2595d76` in Chromium unless stated.

| ID   | Sev | Finding                                                                                                                                                                                                                                                                                                                              | Evidence                                                                                                                                   | Status                                                    |
| ---- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| F-21 | P1  | Header language switcher: the active label is 1.06:1 in dark mode (OS dark and `data-theme=dark`); the accessible name did not contain the visible code (WCAG 2.5.3).                                                                                                                                                                | Active `EN` `#0b1020` on `#0f172a`; axe `color-contrast` violation; Lighthouse `label-content-name-mismatch`. Light mode measured 18.93:1. | Fix in #337, measured 17.85:1 at head `69c9b82`; unmerged |
| F-22 | P2  | `/en/products/` heading order is H1>H3>H3>H2…: cards use `h3` before the first `h2`.                                                                                                                                                                                                                                                 | Heading sequence read from the DOM; Lighthouse `heading-order`.                                                                            | Open                                                      |
| F-23 | P2  | Two-character zh labels are 28–30 px wide at 390 px (footer navigation and profile breadcrumb), below the project floor of 44 px. After #316 `/en/` `About` is 42×44 and `/vi/` has one target at the 44 px edge.                                                                                                                    | Bounding boxes at 390 px                                                                                                                   | Fix in #340, measured 0 targets under 44 px; unmerged     |
| F-24 | P2  | Inter was not self-hosted.                                                                                                                                                                                                                                                                                                           | No `@font-face` before #316                                                                                                                | **Resolved** by #316                                      |
| F-25 | P2  | Mobile homepage is still long: 6 413 px (en), 6 707 px (vi), 5 660 px (zh); target ≤ 5 500 px.                                                                                                                                                                                                                                       | `scrollHeight` at 390 px                                                                                                                   | Open (W4.2)                                               |
| F-26 | P3  | `docs/current-work.json` still describes v5 as PLANNED.                                                                                                                                                                                                                                                                              | Router read                                                                                                                                | #333 in flight                                            |
| F-27 | P1  | Flagship Theatre primary action ("Preview Sổ Trọ") in dark mode: white 16 px text on `#3b82f6` = 3.67:1. `--action-primary` is `#3b82f6` in both dark blocks and is used both as a fill and as a text colour, so one value cannot serve both.                                                                                        | axe `color-contrast` violation, `main@2595d76`, `/en/` with `colorScheme: dark`                                                            | Open; token decision                                      |
| F-28 | P1  | Trust ledger status chips ("Available", three cards) in dark mode render a light chip (`color-mix(in srgb, var(--brand-cobalt) 6%, white)`) with `#3b82f6` text: 3.39:1. This is the literal-white defect class fixed in Wave 0, reintroduced through `color-mix(..., white)`, which `theme-blind-surface.test.mjs` does not detect. | axe violation on the privacy, security and support trust cards; source `src/components/experience/TrustLedger.astro:23`                    | Open; token and guard decision                            |
| F-29 | P2  | Product profile index numerals use `text-[var(--brand-cobalt)]` at 12 px: 3.78:1 on the tinted tile in light, 3.30:1 in dark, 3.69:1 on the dark surface. The `01` beside "jobs" is `aria-hidden`; the capability tile numeral is not.                                                                                               | axe violations on `/en/products/sotro/` and `/vi/products/sotro/`; source `src/pages/{en,vi,zh}/products/[slug].astro:250,284`             | Open (introduced after #332)                              |
| F-30 | P2  | `OneHouseMatrix.astro` is not imported by any page, and the tests assert `[data-principle-matrix]` count 0 on the homepage. Restyling it (#338) has no rendered effect; only a source-reading test can pass.                                                                                                                         | 0 of 67 built pages contain `data-principle-card`; the only non-self importer is a comment in `src/data/experience.ts`                     | Open; #338 unmerged                                       |
| F-31 | P3  | `aria-label="Platforms"` on a `div` with no role (axe `aria-prohibited-attr`, `incomplete`): the platform chip group on the home and products pages.                                                                                                                                                                                 | axe on `/en/` (1 node) and `/en/products/` (2 nodes)                                                                                       | Open                                                      |

Verified as **not** defects on this revision: horizontal overflow (0 at 390 and 1440 px across nine routes); CLS 0 on every measured route; Lighthouse mobile Performance 92–98 with Accessibility 100 on `/`, `/vi/` and `/vi/products/sotro/`; no vi/zh leak of the English UI strings on the 22-string list I checked (only `Web / PWA` and the proper name `GitHub Security Advisories` remain).

## Gate gaps (why these defects passed CI)

| ID  | Gap                                                                                                                                                                                                               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G-1 | `os-dark-contrast.spec.ts` uses a 3:1 floor for everything, so 3.3–3.7:1 small text (F-27, F-28, F-29) passes. W1.3 requires 4.5:1 below 24 px.                                                                   |
| G-2 | `theme-blind-surface.test.mjs` rejects literal white surfaces but not `color-mix(..., white)`.                                                                                                                    |
| G-3 | Lighthouse CI measures only `/` on the desktop preset, so mobile and product routes are unmeasured (W1.4).                                                                                                        |
| G-4 | The translucent header (#306) makes axe unable to determine the background for about 30–60 nodes per page (`color-contrast` `incomplete`), so header text contrast needs a rendered-pixel probe, not an axe scan. |
| G-5 | The F-23 guard scans only the two zh routes although the same rule now fails on en and vi after the font change.                                                                                                  |

## Independent verification of open PRs (measured at each head)

| PR                    | Result                                                                                                                                                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| #337 F-21 (`69c9b82`) | Active label 17.85:1 dark, 18.93:1 light; accessible name contains the visible code. Observation: the active pill and the shell share one colour in dark (1.00:1), so the selected state rests on text brightness and shadow.                                                                          |
| #340 F-23 (`1ae761b`) | Targets under 44 px at 390 px: `/zh/` 5→0, `/zh/products/sotro/` 6→0, `/vi/` 1→0, `/en/` 1→0. No overflow; page heights unchanged.                                                                                                                                                                     |
| #338 W4 (`119073d`)   | Page metrics equal the `main` baseline except `/vi/` mobile +6 px; axe violations none; principle cards are not rendered anywhere (F-30). The hero halo adds a static glow; whether that fits the "no glow filler" doctrine is an Owner design call.                                                   |
| #339 W3.2 (`fe90a41`) | `resolveLifecycleCta` fails closed: `try` needs a Try-eligible lifecycle, `availability: public` and the product's own HTTPS origin; concept/prototype/development never return `try`. The branch conflicts with `main` in `FlagshipTheatre.astro`, three `[slug].astro` files and the parity fixture. |

## Repository hygiene (E1, pattern based)

A pattern scan of the added lines in 1 359 commits and 254 remote branches found no matches for common secret formats (cloud keys, private keys, GitHub/OpenAI/Slack/Google tokens, JWTs, generic secret assignments). The only env-style file ever committed is `.env.example`. Limits: regex only (no entropy scanner); binary files other than the two brand PDFs and one concept PNG were not read; GitHub secret-scanning and push-protection settings could not be read (API 403), so their state is **NOT VERIFIED**.

## Served revision (W6)

The Cloudflare connector lists Workers and their last-modified time but exposes no version or commit identifier. `blueskyz-web` was modified at 2026-09-29T08:56:55Z, about six minutes after #336 merged (08:50Z): consistent with that build being deployed, but **not** proof of which SHA is served. Anonymous access remains blocked by Cloudflare Access and is owner-executed.

## NOT VERIFIED

Production and anonymous access; Firefox and WebKit locally; real-user comprehension; native VI/ZH review; GitHub security settings; whether #337 and #340 CI finished green.

## Brand kit v4 — Owner Drive copy vs repository (E1)

| Check                                                             | Result                                                                                                                                                                                                                       |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Drive `SHA256SUMS.txt` vs `brand/blueskyz-production-v4/`         | Same size (29 829 B); sampled hashes identical (guidelines PDF, `tokens.json`, `ASSET_USAGE_MATRIX.csv`, `verify_brand_kit.py`, a concept PNG). Drive `MANIFEST.csv` differs only by BOM/CRLF.                               |
| Repository `sha256sum -c`                                         | Was 238/240: two CSVs had been normalised to LF by `.gitattributes`. This PR restores their CRLF bytes and marks the mirror `-text`; now 240/240.                                                                            |
| `09_QA_AUDIT/v4/verify_brand_kit.py`                              | PASS (raster 153, SVG 46, JSON 4, XML 1).                                                                                                                                                                                    |
| Drive-only files                                                  | A duplicate guidelines PDF (same size) and `Mockup DEMO.png` (1254×1254, not in the manifest). The mockup shows hidden products, an unverified asset-count claim and a signature: reference only, never a production source. |
| `public/` icons, logos, product marks and default OG vs kit bytes | 62/128 files are byte-identical to kit files. The rest are the hero mark resized to 560 and 840 px, three flags, and a legacy `public/brand/blueskyz/r4d/` tree that pages do not reference.                                 |

Standardisation applied in this PR (no file of an open PR is touched):

- `tests/architecture/brand-kit-v4-integrity.test.mjs`: the whole mirror must match all 240 `SHA256SUMS.txt` entries, and any file not in that list fails (so a mockup dropped into the kit is caught). Its negative proof changes, deletes, adds and CRLF-normalises files in a temporary copy and requires all four to be reported.
- `.gitattributes`: `brand/blueskyz-production-v4/** -text`, so Git cannot rewrite kit bytes on any OS.
- `brand-kit-v4-fidelity.test.mjs`: the default Open Graph PNG, WebP and AVIF must be byte-identical to the kit `open_graph_1200x630` masters. Mutation proof: one byte appended to `og-default.webp` makes the test fail with `assets drifted from the kit master: public/social/og-default.webp`.

Also applied: the legacy `public/brand/blueskyz/r4d/` tree (60 files, unreferenced) and `scripts/generate-brand-assets.py` (it would have overwritten the kit Open Graph master with a legacy composite) are removed; `brand-assets.test.mjs` now fails on any published brand tree other than `v4` and `flags`, or a returning generator.

Still open (implementation lane or Owner): per-product Open Graph images (W5.1; needs the profile pages that #339 and #342 edit); the dark `--action-primary` `#3b82f6` is not a kit value (the kit defines no dark action colour; F-27, `global.css` is edited by #342). Limitation: Drive binaries were compared by size and sampled hash, not by a full per-file hash.
