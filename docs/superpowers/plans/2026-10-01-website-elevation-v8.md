# SGPS:Experience FULL v8: Website Elevation and Completion Plan

**Status:** PLANNED. This is the execution contract for the implementing coding agent(s); nothing here has been executed yet.
**Date:** 2026-10-01.
**Owner request (verbatim, translated):** "Audit and write a comprehensive upgrade strategy to complete the project. Write a detailed plan, then commit a PR to main. I will call a coding agent to save cost. Audit thoroughly and lift the website to a higher level."
**Measured revision:** an integration build of `main@c790abb` (#410) plus the three open PRs that are expected to land first:

- #407 `fix/v7-truth-content` @ `d25b451`
- #411 `fix/v7-shell` @ `9249ecb`
- #412 `fix/seo-technical` @ `05ceaf4`

The integration head was `6fbef52`, a local commit that is not pushed. It resolves one conflict in `src/pages/zh/security.astro` as described in §4 W0.
**SGPS context:** the project pin stays `v1.13.0`. No repin and no new overlay are adopted. The Experience standard is BPXS 1.4.0. GUX, GTS and GSRS apply as pinned.
**Inputs carried in:** the read-only v7 audits of 2026-10-01 at `098b3cb`:

- 4 lenses: A visual, B interaction, C responsive, D content. 79 raw findings.
- The v7 global SEO audit.
- The v7 copy deck, now committed at [`v8/copy-deck.md`](v8/copy-deck.md). Its Vietnamese column is final.

**Evidence class:** E1/E2 only. That covers source reading, a local prod-like build served by `wrangler dev --local`, headless Chromium screenshots and DOM probes, and axe-core 4.13.
It does not cover Firefox/WebKit, real devices, field Core Web Vitals, production headers behind Cloudflare Access, or native-speaker review of zh/zh-hant. All of those are `NOT VERIFIED` until W11.
**Supersedes:** the open frontier of `2026-10-01-experience-full-v6.md` and the post-v7 queue. v6/v7 work that is already merged keeps its evidence.

---

## 1. Executive summary

**Verdict.** The site is now **sound but not yet elevated**. The engineering is better than most production marketing sites: axe reports 0 violations on 36 page×theme loads, nothing overflows horizontally from 320 to 2560 px, client JS is about 12 KB, there are no cookies, and the claims are evidence-bound. What holds it back from "premium" is no longer bugs. It is **composition, density and voice**:

1. **Home still has two focal points and dead zones.**
   - The sail sits right and the product card left. The card's text column is about 40 % empty at 1440, and a lone "Explore products" link hangs under it.
   - The "What we're building" band squeezes three 120 px cards beside the capture.
   - "The rest of the house" is one half-width card.
   - The trust band is one sentence followed by about 250 px of empty space.
2. **Product pages read like data sheets, not stories.**
   - Above the fold: Access / Current stage / Platforms / Audience, then six small-text cards.
   - Sổ Tâm shows "Access: Android, iOS (in development)" right above "Platforms: Web", which is confusing.
   - Its brand art says "AI Journal for Clarity" while the copy says "local-first journal". That is a public-truth mismatch the Owner must settle.
3. **The trust cluster is still engineered output.**
   - Verify has 40 CTAs. Security has a full-width 1214 px CTA bar and an EN/VI mirror block on the English page.
   - Dossier still renders a "Boardroom presentation" of item 1 while 0 items are selected.
   - Decision Room opens with a 290 px empty board.
   - Architecture repeats the same "This website / Static site pages / Claims check" cards across 5 views (5 781 px tall).
4. **No single design system yet.**
   - 3 button families and 4 card radii.
   - Container widths drift: 534, 650, 704, 768, 1214 and 1256 px.
   - Dark mode is one flat navy.
   - The header is 82 % translucent with no blur, so text ghosts through it.
5. **Copy still carries template tells.**
   - "first-class routes — not slogans" (2 pages).
   - "View development status" used as a CTA without naming the object.
   - "Web / PWA" is unsourced.
   - "The rest of the house".
   - 您/你 is mixed in zh (11 pages).
   - The English-only footer tagline appears in zh/zh-hant.
   - The VI hero H1 is a literal calque.

**Target.** A site a first-time visitor reads in 5 seconds as: _"BlueSkyz builds Sổ Trọ (landlord notebook) and Sổ Tâm (private journal); both are in development; every claim here links to proof."_ It should look like one designed object: one grid, one type scale, one button family and one signature (Reveal). It should be **50–75 % shorter on trust pages** with zero loss of truth.

**How.** Twelve waves (W0–W11), each a small PR with disjoint file ownership. They are sequenced so a coding agent can run 2–3 lanes in parallel. Owner-gated choices are isolated in §6 with a recommended default, so execution never stalls on them.

**Weakest point of this plan (stated up front).**

- The plan raises _perceived_ quality mostly by subtraction and consistency. It does not add new proof assets such as product OG cards, a real video poster or an About composition. Those either need new imagery the Owner must approve, or facts the repo does not hold.
- If the Owner's bar for "premium" is visual richness rather than restraint, W2–W6 will not fully meet it without the W12 asset track (§4), and that track is Owner-input dependent.
- The second weakness is review independence. The same model family wrote the audit, the copy deck and this plan. The W11 verifier lane must be a distinct agent run against the exact merged revision (AGENTS rule 29), and native zh/zh-hant review stays `NOT VERIFIED`.

---

## 2. Audit at the integration head (v8)

### 2.1 What was verified

| Check                                                | Scope                                                                                 | Result                                                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Screenshots                                          | 24 routes × 1440/390 × light (+ dark on 7 routes)                                     | 124 images reviewed                                                                         |
| DOM probe                                            | title, H1, H2 font, word count, CTA count, page height, overflow, distinct font sizes | §2.3                                                                                        |
| axe-core 4.13 (wcag2a/aa, 21aa, 22aa, best-practice) | 18 routes × light/dark                                                                | **0 violations**, except `heading-order` (moderate) on evidence pages: an `h3` with no `h2` |
| Residual grep in `dist/`                             | known v7 defects                                                                      | §2.4                                                                                        |
| Dead code                                            | unused `.astro` components                                                            | 11 found (§4 W10)                                                                           |

**NOT VERIFIED:**

- Firefox and WebKit.
- Lighthouse on the integration head. The perf worker on `perf/lcp-headroom` owns that check; main is red on `/vi/` mobile LCP of about 2.56 s.
- Reveal motion frames.
- Real print preview.
- Production headers.
- Native zh/zh-hant review.

### 2.2 Scorecard (0–10, integration head)

| Dimension               | v7 (098b3cb) | v8       | Why                                                                                                                                               |
| ----------------------- | ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| First impression / hero | 5            | 6.5      | Mobile hero fixed (#410) and the product line was added. Desktop still has a split focal point, a half-empty card body and an orphan link.        |
| Layout and rhythm       | 5            | 5.5      | The footer is grouped now (#411). Dead bands remain on home, products and verify, and widths drift.                                               |
| Typography              | 5            | 6        | Embedded headings are styled on most pages. Privacy H2 is still Inter 400/40px and the decision-room H2 is 400/16px. No single scale exists yet.  |
| Component consistency   | 5            | 5        | 3 button families (solid, outline+dot, chip), 4 radii, 2 card shadows.                                                                            |
| Imagery                 | 7            | 7        | Real captures are sharp. The hero phone crop is cut at the top. The video poster is a dark generic box. There are no product OG cards.            |
| Content density         | 6            | 6.5      | Home and brand pages are lean. Verify (40 CTAs), architecture (717 words, 5 781 px), security (374 words) and dossier are not.                    |
| Voice / copy            | 5            | 6        | Overclaims are gone (#407). Template phrases and generic CTAs remain.                                                                             |
| Localization            | 7            | 7.5      | zh-hant terms fixed (#407). 您/你 mix, English footer tagline in CJK, `lang="zh"`, and the VI calque H1 remain.                                   |
| Accessibility           | 8            | 9        | axe clean and aria-current styled. Remaining: heading order on evidence pages, 13–20 px native checkboxes, a not-scrollable rail with `tabindex`. |
| Performance             | 8            | 7.5      | The client budget is fine, but main is red on `/vi/` mobile LCP.                                                                                  |
| SEO                     | 7            | 8.5      | #412 adds gateway JSON-LD, print noindex and descriptive titles. Remaining: `lastmod`, per-product OG, `zh-Hans` lang, legacy redirect targets.   |
| **Overall**             | **~6**       | **~6.8** | Clean and honest, not yet premium.                                                                                                                |

### 2.3 Measurements (1440, light)

| Route                 | Words (main) |   CTAs | Height px | Note                                                    |
| --------------------- | -----------: | -----: | --------: | ------------------------------------------------------- |
| `/en/`                |          153 |      8 |     3 126 | 2 focal points; dead space after the trust band         |
| `/vi/`                |          235 |      8 |     3 277 | VI is 54 % wordier than EN                              |
| `/en/products/`       |           94 |     13 |     1 677 | persona chips + orphan "How we verify"                  |
| `/en/products/sotro/` |          419 |     11 |     7 322 | 12 captures, data-sheet top                             |
| `/vi/products/sotro/` |          562 |     11 |     7 339 |                                                         |
| `/en/products/sotam/` |          128 |      9 |     2 443 | Access vs Platforms contradiction; art tagline mismatch |
| `/en/about/`          |          115 |      6 |     1 453 | no imagery; generic pillars                             |
| `/en/security/`       |          374 |      7 |     2 998 | 1214 px CTA bar; EN/VI mirror on the EN page            |
| `/en/privacy/`        |          280 |     11 |     2 816 | H2 Inter 400/40px                                       |
| `/en/verify/`         |          187 | **40** |     2 384 | right half empty at 1440                                |
| `/en/architecture/`   |      **717** |      6 | **5 781** | the same cards repeated across 5 views                  |
| `/en/decision-room/`  |          308 |     17 |     2 452 | 290 px empty board; only claims have dossier checkboxes |
| `/en/dossier/`        |          277 |     15 |     3 575 | lede said twice; boardroom shows item 1 at 0 selected   |

### 2.4 Residual register

Status values:

- **FIXED** means merged, or in #407/#411/#412.
- **OPEN** means work remains; the Wave column names the wave in §4 that owns it.
- **OG** means Owner-gated (see §6).
- **KEEP** means by design.

| ID                                       | Finding                                                                                                   | Status                                                                                                    | Wave      |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------- |
| V7-C-01/02, A-01, B-12                   | Hero card breaks on phones                                                                                | FIXED (#410)                                                                                              | —         |
| V7-A-02, C-07, C-04                      | Hero: two focal points; half-empty card body; orphan "Explore products"; phone capture cropped at the top | OPEN                                                                                                      | W2        |
| V7-D-04, SEO-16                          | H1 names no product                                                                                       | FIXED by the product line (#410). The H1 itself is Owner-locked; the VI calque is OG-1                    | W2 / OG-1 |
| V7-A-06, C-08                            | Home dead bands; half-width Sổ Tâm card; thin trust band                                                  | OPEN                                                                                                      | W2        |
| V7-D-17, glo-6                           | "View development status" ×2 (home + products)                                                            | OPEN                                                                                                      | W1        |
| V7-D-16, glo-8                           | "The rest of the house"                                                                                   | OPEN                                                                                                      | W1        |
| V7-D-01                                  | Support overclaim                                                                                         | FIXED (#407)                                                                                              | —         |
| hom-18                                   | "first-class routes — not slogans" in `ProofBand.astro`, `VerifyCentre.astro` (and dead `Trust.astro`)    | OPEN                                                                                                      | W1        |
| glo-7                                    | "Web / PWA" unsourced (8 pages)                                                                           | OPEN                                                                                                      | W1        |
| V7-A-05                                  | Persona chips + orphan link on /products                                                                  | OPEN (OG-5, default remove)                                                                               | W4        |
| V7-A-15, V7-D-24                         | Sổ Tâm art tagline "AI Journal for Clarity"; audience mismatch                                            | OG-3                                                                                                      | W3        |
| NEW-01                                   | Sổ Tâm "Access: Android/iOS in development" shown above "Platforms: Web"                                  | OPEN                                                                                                      | W3        |
| V7-D-13                                  | Lifecycle ladder                                                                                          | FIXED (no "Next in the ladder" in dist)                                                                   | —         |
| V7-D-14                                  | Sign-in prominence                                                                                        | FIXED ("Sign in (existing users)" secondary)                                                              | —         |
| V7-A-16, D-15                            | Sổ Trọ page 7 322 px; 12 captures; data-sheet top; generic video poster                                   | OPEN                                                                                                      | W3        |
| V7-C-11                                  | Endorsed lockup at 32 px on phones                                                                        | OPEN (brand min size; no protected path touched if the small variant is used)                             | W3        |
| V7-A-03                                  | Unstyled embedded headings (privacy H2 400/40, decision-room H2 400/16)                                   | PARTLY FIXED (#409)                                                                                       | W5/W6     |
| V7-B-04/05                               | Dossier: boardroom shows item 1 at 0 selected; lede duplicated                                            | OPEN                                                                                                      | W5        |
| V7-B-06                                  | URL write-back                                                                                            | FIXED (#409)                                                                                              | —         |
| V7-B-07..11                              | Decision room: side-by-side, aria, limit hint, reset, CLS                                                 | MOSTLY FIXED (#409). The 290 px empty board and the inconsistent "Include in a dossier" checkboxes remain | W5        |
| V7-D-02, A-04                            | Architecture model dump                                                                                   | FIXED → explainer (#408). Repetition across 5 views remains (NEW-02)                                      | W5        |
| V7-D-03                                  | Repetition on privacy/security/verify                                                                     | PARTLY FIXED. Security still has 6 sections that restate one claim plus an EN/VI mirror                   | W5        |
| V7-D-10/12                               | One page, three names; jargon (Boardroom, Atlas, Source-linked, Dossier)                                  | OPEN (OG-6 for route names; default rename labels only)                                                   | W5        |
| V7-D-18                                  | Evidence H1 = claim                                                                                       | FIXED                                                                                                     | —         |
| NEW-03                                   | Evidence pages: `heading-order` (h3 without h2)                                                           | OPEN                                                                                                      | W5        |
| V7-A-07, C-13                            | Container width drift; empty right half on verify/dossier/security                                        | OPEN                                                                                                      | W6        |
| V7-A-09                                  | Three button families; card radii 8/12/20/28                                                              | OPEN                                                                                                      | W6        |
| V7-A-13                                  | 18 font sizes, 37 line-heights                                                                            | OPEN                                                                                                      | W6        |
| V7-A-14                                  | Flat dark mode                                                                                            | OPEN                                                                                                      | W6        |
| V7-B-15, C-12                            | Header 82 % translucent, no blur → ghosting                                                               | OPEN (ADR 0012 governs the material, so read it first)                                                    | W6        |
| V7-C-05                                  | Phone header not sticky                                                                                   | OPEN (OG-7, default keep non-sticky + add back-to-top on pages > 3 viewports)                             | W6        |
| V7-A-08, C-14                            | CJK word breaks; no CJK font stack; VI widow                                                              | OPEN                                                                                                      | W6        |
| V7-C-03                                  | Print hero invisible                                                                                      | OPEN                                                                                                      | W6        |
| V7-B-18/19/20/21                         | cursor, `:active`, rail `tabindex`, 44 px targets                                                         | OPEN                                                                                                      | W6        |
| V7-B-01/02/03/16/22/24, A-11, D-11, C-06 | Shell                                                                                                     | FIXED (#411)                                                                                              | —         |
| V7-D-05                                  | Footer tagline English in zh/zh-hant                                                                      | OPEN (OG-2)                                                                                               | W7        |
| V7-D-06                                  | zh-hant mainland terms                                                                                    | FIXED (#407)                                                                                              | —         |
| V7-D-07                                  | 您/你 mix (11 zh pages)                                                                                   | OPEN                                                                                                      | W7        |
| V7-D-08/09                               | VI calques and label variants                                                                             | OPEN (deck VI column is final)                                                                            | W1/W7     |
| V7-D-20                                  | Dates                                                                                                     | FIXED for verify/dossier ("September 12, 2026"). Confirm vi/zh use `Intl` per locale                      | W7        |
| V7-A-17, D-22                            | Locale-suggestion banner in English on vi pages                                                           | KEEP. It speaks the visitor's browser language on purpose (`src/lib/locale-suggestion.ts`)                | —         |
| SEO-01/02/04/08/11/14a/24                | Gateway JSON-LD, print noindex, titles, og alt                                                            | FIXED (#412)                                                                                              | —         |
| SEO-05                                   | `lang="zh"` vs hreflang `zh-Hans`                                                                         | OPEN (4 specs pin `zh`; update them in the same PR)                                                       | W8        |
| SEO-10                                   | Sitemap `lastmod`                                                                                         | OPEN                                                                                                      | W8        |
| SEO-14b                                  | Per-product OG cards; 932 KB default OG                                                                   | OPEN (W12 asset; OG-8)                                                                                    | W8/W12    |
| SEO-13                                   | `applicationCategory` / `operatingSystem` truth                                                           | OG-4                                                                                                      | W8        |
| SEO-19                                   | Legacy `/products/sotro` → product page                                                                   | OPEN, protected path `public/_redirects`: Owner label                                                     | W8        |
| SEO-06/12/21                             | `og:locale:alternate` full set; BreadcrumbList on editions; 404 JSON-LD                                   | OPEN (low)                                                                                                | W8        |
| SEO-17, V7-C-09                          | `/vi/` mobile LCP                                                                                         | OPEN. The perf PR is in flight                                                                            | W0/W9     |
| V7-C-10                                  | Icon PNGs oversized; lockup `<img>` unsized                                                               | PARTLY FIXED (#404)                                                                                       | W9        |
| NEW-04                                   | 11 unused components                                                                                      | OPEN                                                                                                      | W10       |

---

## 3. Target state: definition of "elevated"

Every wave must move at least one row below. W11 measures all of them.

| Dimension       | Acceptance (measurable)                                                                                                                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5-second test   | On `/<lang>/` at 390 and 1440, the first viewport shows the H1, the product line naming both products with status, **one** primary CTA naming its object, and one real capture. No orphan links.                                    |
| One focal point | The hero has exactly one dominant visual. Either the sail is the atmosphere behind/next to the H1 and the capture is the focal object, or the reverse. Only one has a glow.                                                         |
| Density         | Trust pages at or below the copy-deck targets: security ≤ 120 words, privacy ≤ 160, verify ≤ 160 words and ≤ 12 CTAs, architecture ≤ 250 words and ≤ 2 200 px at 1440. Sổ Trọ page ≤ 5 000 px at 1440.                              |
| One system      | Font sizes ≤ 9 steps site-wide (12/14/16/18/20/24/32/44/64, ±clamp). Exactly 2 container widths (reading `72ch`/~720 px, wide 1256 px). One button family with primary/secondary/on-ink. Card radius 12, media radius 20, pill 999. |
| Dark mode       | ≥ 2 surface elevations distinguishable at a contrast ratio ≥ 1.1 between Ink-900 and Ink-850. Cards are not border-only.                                                                                                            |
| Voice           | 0 hits in `dist/` for: "first-class", "not slogans", "View development status", "The rest of the house", "Web / PWA", "Boardroom", "salon", "empower" outside the Owner-locked H1.                                                  |
| Localization    | 0 您 in zh, unless the Owner keeps a formal register for security only. Footer tagline per OG-2. `lang="zh-Hans"` on /zh/. Dates via `Intl.DateTimeFormat(locale)` everywhere.                                                      |
| Accessibility   | axe 0 violations on all routes × 2 themes. All interactive targets ≥ 44 px, or ≥ 24 px with spacing for inline links. Keyboard traversal and focus-visible screenshots for the palette, menu, decision room and dossier.            |
| Performance     | Lighthouse mobile (CI config) LCP ≤ 2 300 ms on `/en/` and `/vi/` (200 ms headroom under the 2 500 ms budget), CLS ≤ 0.02, TBT ≤ 150 ms. Client JS budget unchanged or lower.                                                       |
| SEO             | Each indexable page has a unique, descriptive title ≤ 60 Latin chars or ≤ 30 CJK chars, `lastmod` from git (or omitted if it cannot be accurate), per-product OG image (W12), and consistent `lang` and hreflang.                   |
| Truth           | 0 new facts. Every changed claim string re-runs the claim gate (`pnpm check:publishability`) and keeps its `evidenceIds` and `reviewId`.                                                                                            |

---

## 4. Waves

Each wave lands as **one PR**, sized ≤ 400 changed lines excluding snapshots, with the files listed under "Owns". Two waves running in parallel must not own the same file. Order and parallel lanes are in §7. Every wave follows the operating contract in §5.

### W0: Land the in-flight frontier (prerequisite, no new design)

**Goal.** Main is green and #407, #411 and #412 are merged.

1. The perf PR from `perf/lcp-headroom` (the `/vi/` mobile LCP regression from #410) goes green and merges.
2. Update the #407 and #411 branches from main (merge commit, no rebase) and let auto-merge land them.
3. #412 will then conflict in `src/pages/zh/security.astro`. Resolve it by taking #412's `title="安全：私下报告漏洞"` and **#407's** description with `你` (not `您`), and keep `lensBoundaries={false}` from #407.
4. Post-merge, run `node scripts/smoke-production.mjs` against the Workers preview if it is reachable. Production stays behind Access until the Owner flips it.

**Acceptance.** Main is green on all 4 engines plus Lighthouse. `git log origin/main` contains #407, #411, #412 and the perf PR.

### W1: Copy foundation (global chrome and shared labels)

**Owns:**

- `src/data/site.ts` (SHARED_LABELS, NAV/footer labels)
- `src/lib/lifecycle-cta.ts` (rendered label only)
- `src/lib/product-copy.ts` (`PLATFORM_LABELS`)
- `src/components/sections/ProofBand.astro`
- `src/components/verify/VerifyCentre.astro` (lede only)
- `src/data/experience.ts` (one line)
- the tests that pin these strings

**Do** (copy-deck rows glo-6..glo-11, hom-17..hom-19, plus VI final):

1. Product CTAs:
   - `view-development-status` renders "See Sổ Trọ" / "See Sổ Tâm" (vi "Xem Sổ Trọ", zh/zh-hant "查看 Sổ Trọ").
   - Keep the verb id and its lifecycle semantics. Only the label gets the product name, via a `{product}` placeholder resolved by the caller.
2. `PLATFORM_LABELS.web`: "Web / PWA" → "Web" (vi "Web", zh "网页", zh-hant "網頁"). Source: `platforms: [web]` in both product yamls.
3. `SHARED_LABELS.continuationHeading`: "Also in development" (vi "Cũng đang phát triển", zh "同样在开发中", zh-hant "同樣在開發中").
4. Delete `featuredBody`/`continuationBody` (glo-9) and every render site.
5. Trust band: heading "Check what we say", body "Our public claims link to the sources behind them.", CTA "Check our claims →". VI, zh and zh-hant are in deck rows hom-17..19.
6. Replace the "first-class routes — not slogans" lede in `VerifyCentre.astro` with deck row ver-1: "Check our claims against public sources."
7. `experience.ts:194`: change "treated as first-class routes, not afterthoughts" to a plain sentence, or delete it if it is unused.
8. Capture caption (glo-11): "Development build · sample data · 2026-09-30". The hash stays only in the `data-capture-revision` attribute, as it is today.

**Tests:**

- Update the string pins.
- Add `tests/architecture/v8-voice.test.mjs`. It fails if any banned phrase in §3 "Voice" appears in `src/**` (excluding tests, docs and the locked `SITE.proposition`).
- Negative proof: re-insert "first-class routes" into a fixture string and show that the test fails.

**Acceptance.** `grep -r` of `dist/` returns 0 hits for the W1 phrases. 4 locales are covered.

### W2: Home elevation (one focal point, no dead zones)

**Owns:**

- `src/components/sections/Hero.astro`
- `src/components/product/FlagshipCapture.astro`
- `src/components/product/FlagshipTheatre.astro`
- `src/components/product/ProductHouse.astro` and the home composition in `src/pages/{en,vi,zh,zh-hant}/index.astro`
- `src/components/sections/ProofBand.astro` (layout only; W1 owns its copy, so W2 runs after W1)
- the home-scoped styles in `src/styles/global.css`, in a fenced `/* v8-home */` block to avoid W6 conflicts

**Do:**

1. **Hero composition, desktop ≥ 1024:**
   - Left column: kicker (none), H1, product line.
   - Right column: **one** focal object. Recommended (OG-1b default) is the **sail as atmosphere at reduced scale behind the capture**, with the real Sổ Trọ phone capture (`op-01-home` at ≥ 280 px CSS width, full frame, not cropped at the top) as the focal object.
   - Remove the bordered flagship card. Its name, badge and blurb become a compact caption row under the capture, together with the single primary CTA ("See Sổ Trọ").
   - Delete the orphan "Explore products" link. The header CTA already goes to Products.
2. **Hero 768–1023:** two columns from `md`, and the H1 wraps to ≤ 5 lines.
3. **Hero ≤ 767:**
   - Order: H1, product line, capture (centered, ~220 px), caption row, then a full-width CTA.
   - The sail stays as a background glow at ≤ 40 % opacity behind the H1, or is hidden. It must not push the CTA below 2 viewports.
4. **"What we're building" band:**
   - Change the three proof points from 3 × 120 px cards to a vertical list next to the desktop capture, with an icon and one line each.
   - Keep 2 proof points (deck hom-8, hom-9), with the copy from the deck.
   - Remove the redundant second caption (hom-11).
5. **Sổ Tâm row:**
   - A full-width horizontal card: icon, name, badge, one-liner and "See Sổ Tâm".
   - Optionally show the existing brand art at small size, but **not** its "AI Journal for Clarity" line until OG-3 is decided. Either crop to the mark, or use the icon only.
6. **Trust band:** fold it into a compact two-column strip, heading + body | CTA, with ≤ 96 px vertical padding. Remove the trailing empty gradient band before the footer (V7-C-08).

**Tests:**

- Update `exp-s1-home-caps`, `exp-s2-hero-flagship`, `v7-hero`, `display-typography`.
- New e2e `v8-home.spec.ts`:
  - At 390, 1024 and 1440, exactly one element matching `[data-hero-focal]`.
  - The primary CTA is visible in the first viewport at 1440 and inside 2 viewports at 390.
  - No `a` element inside `main` with an empty row around it (the orphan check: link-only blocks are forbidden).
  - The page height at 1440 is ≤ 2 900 px.
- Negative proof: add a second `[data-hero-focal]` and show the test fails.

**Do not:**

- change the H1 text
- add infinite animations
- add a new font
- change brand assets under `brand/` or `public/brand/` (protected)

**Watch LCP.** The H1 stays the LCP element. Do not lazy-load the hero capture, but give it `fetchpriority="low"` so the text paints first. Run Lighthouse locally before pushing (§5.4).

### W3: Product pages (story, not data sheet)

**Owns:**

- `src/components/product/AppAccess.astro`
- `src/components/product/ProductStatus.astro`
- `src/components/product/ProductShowcase.astro`
- `src/components/product/ProductGuide.astro` (captions only)
- `src/pages/*/products/sotro/index.astro`
- `src/pages/*/products/sotam/index.astro`
- `src/content/products/sotro.yaml` / `sotam.yaml` (`i18n` copy strings only; never `public`, `lifecycle` or URLs)
- the product-copy tests

**Do:**

1. **Top of the page, in this order:**
   1. Breadcrumb.
   2. Icon, name and status badge.
   3. A one-liner from deck sro-4 / stm-3.
   4. One primary action: "See the screens" (anchor to the gallery) for Sổ Trọ, none for Sổ Tâm.
   5. A secondary text link: "Already have an account? Sign in" (vi "Đã có tài khoản? Đăng nhập").
2. **Merge Access + Current stage + Platforms + Audience into one "Availability" line:**
   - "Web: in development · Android and iOS: in development, no store release" (deck sro-5 / stm-4).
   - This resolves NEW-01 (Access vs Platforms contradiction).
   - Drop "Audience" from the visible page. It stays in the JSON-LD only if sourced (OG-3).
3. **"What it does":** one list of ≤ 5 items (deck sro-8 / stm-8) that replaces "What it's for" + "What we're building" (two numbered card grids).
4. **Sổ Trọ gallery:**
   - Keep 3 hero captures: today, meter readings, collect.
   - Then one desktop capture.
   - Move the remaining 8 to the guide page, or behind a "More screens" `<details>`. The guide already shows most of them.
   - Use real-frame posters for the video. Run `ffmpeg -ss 2 -frames:v 1` on the existing `public/media/...` intro video **only if** the asset folder is not protected. `public/brand/` is protected; `public/media` is not. Otherwise keep the current poster.
   - Captions are from deck sro-12; they drop the idioms "with a clear head", "stand out" and "gentler".
5. **Endorsed lockup on phones:** hide below 480 px, or use the icon-only variant that already exists in `public/brand` (no new asset).
6. **Sổ Tâm brand art:** show the mark-only crop, or hide the art block, until OG-3 is decided. The current "AI Journal for Clarity" line must not render by default.
7. **"Privacy, security, support" chips:** one inline sentence of 3 links in the standard link style. The external-arrow chips are a 4th button style.

**Tests:**

- Update `product-*`, `exp-*` and `bilingual-parity` pins.
- Architecture test: product pages render exactly one `[data-primary-action]` (Sổ Trọ) or zero (Sổ Tâm).
- Architecture test: the "Availability" line never contains a store CTA.
- Height assertion at 1440: Sổ Trọ ≤ 5 000 px.
- Negative proof for each.

**Truth:** no new capability, platform, audience or date. Every string maps to a yaml field or an existing page claim, as cited in the deck's "Truth source" column.

### W4: Products index

**Owns:**

- `src/pages/*/products/index.astro`
- `src/components/product/ProductCard.astro`
- `src/components/experience/IntentControl.astro` (removal)
- the related tests

**Do:**

1. Product cards: add the product's real capture thumbnail for Sổ Trọ and the icon composition for Sổ Tâm, the one-liner, the badge once (deck prd-3 notes "badge shown twice"), and "See Sổ Trọ" / "See Sổ Tâm" from W1.
2. Remove the "What brings you here?" persona chips and the orphan "How we verify →" (OG-5, default remove). Fold "How we verify" into the Next-steps row.
3. Lede (deck prd-2): "Both are in development. Each page states its status."

**Tests:**

- Update the intent-control specs. Remove a spec only if its component is removed, and say so in the PR body.
- Negative proof: the products page has no `[data-intent]` control.

### W5: Trust cluster consolidation

Split into **W5a** (verify + security + privacy) and **W5b** (dossier + decision room + architecture + evidence + editions). They own disjoint files and may run in parallel.

**W5a owns:**

- `src/pages/*/verify.astro`, `src/components/verify/*`
- `src/pages/*/security.astro`, `src/content/pages/*/security.yaml`
- `src/pages/*/privacy.astro`
- `src/components/integrity/BilingualMirror.astro` usage on security (not the component's existence)

**W5a does** (deck rows ver-1..8, sec-1..7, pri-1..6):

1. **Verify:**
   - Three claims, each shown once with its limit and sources inline (deck ver-2..4).
   - Then "What backs it" (Privacy / Security / Support with states).
   - Then one link to Compare.
   - Collapse the Atlas/"Evidence map" behind `<details>` (closed by default).
   - Remove "Where this statement comes from" and "Evidence by page" duplicates from the default view.
   - Target ≤ 12 CTAs.
   - Use the wide layout: claims left, sources rail right ≥ 1024.
2. **Security:**
   - Lede + CTA (CTA width = content width, not 1214 px) + one "What we do not offer" line + "Why private" / "Limit" + sources line.
   - Remove the EN/VI `BilingualMirror` block from **en/zh/zh-hant** pages. Keep it on `/vi/` only if the Owner wants it (OG-9, default remove everywhere: the localized page is the source of truth).
   - Remove the 5 restating sections ("What we chose", "What limits it", "How it works", "What it does not do", "Evidence").
3. **Privacy:** deck pri-1..5. Fix the H2 that renders Inter 400/40px; it must use the page heading scale.

**W5b owns:**

- `src/pages/*/dossier/**`, `src/components/dossier/*`, `src/scripts/dossier-composer.ts`
- `src/pages/*/decision-room.astro`, `src/components/experience/DecisionRoom.astro`, `src/scripts/decision-room.ts`
- `src/pages/*/architecture.astro`, `src/components/architecture/*`, `src/data/architecture-copy.ts`
- `src/pages/*/evidence/[id].astro`
- `src/pages/*/editions/**`

**W5b does:**

1. **Dossier** (deck dos-1..3):
   - Visible name "Printable summary" (vi "Bản tóm tắt để in"). The route stays `/dossier/` (OG-6).
   - Remove the duplicated lede.
   - Render "Present" (formerly "Boardroom presentation") **only when ≥ 1 item is selected**. This is the B-05 residual and is a behaviour fix with an e2e plus negative proof.
   - Checkboxes are 20 px custom with a ≥ 44 px label hit area.
   - Use the wide layout: composer left, preview right ≥ 1024.
2. **Decision room** (deck dec-1..5):
   - Visible name "Compare claims" (vi "So sánh tuyên bố"). The route stays.
   - The empty board collapses to one line ("Nothing selected yet. Choose up to four items.") with no 290 px reserved box. To keep CLS ≤ 0.02, insert the board **below** the item grid, or animate its height with `transform`.
   - The "Include in a dossier" checkbox is either on every card or on none. Default: none on the card, plus one "Add selection to summary" action on the board.
3. **Architecture** (NEW-02, deck arc-1..2):
   - One plain explainer of 4 sentences.
   - **One** labelled diagram (parts + connections, drawn once).
   - Then the 5 lenses as `<details>`, each listing only what is **new** in that lens. Cards already shown are not repeated.
   - "Technical names" stays collapsed.
   - Targets: ≤ 250 visible words and ≤ 2 200 px at 1440.
   - Title "How this site is built" (vi "Cách trang web này được xây dựng"). The route stays.
4. **Evidence pages:** fix `heading-order`. The kicker is a styled `<p>`, or add a visually present `h2` before the `h3`. Keep axe at 0.
5. **Editions:** deck edi-1/2, edt-1/2 ("Collections"). Add BreadcrumbList (SEO-12).

**Tests (both halves):**

- Update the pinned specs. Every removed section that a spec pins needs the spec changed in the same PR, with the reason in the PR body.
- New negative-proof e2e:
  - The dossier has no present-view at 0 selections.
  - The decision-room CLS stays ≤ 0.02 after adding 4 items, in Chromium.
  - Architecture: each card title appears at most once outside `<details>`.
  - Verify: CTA count ≤ 12.

**Truth:** claim/boundary strings in `claims.ts`, `integrity.ts` and `trust-ledger.ts` are bound text. Change meaning **never**. Change wording only as the deck specifies. Re-run `pnpm check:publishability` and the claim-gate tests (deck open question 9).

### W6: Design system pass (one grid, one scale, one family)

Runs **after** W2–W5 merge, because it touches shared CSS.

**Owns:**

- `src/styles/global.css`, `src/styles/*.css` (except fenced wave blocks, which it folds in)
- `src/components/ui/ButtonLink.astro`
- `src/components/layout/Container.astro`
- `src/components/layout/Header.astro` (material only)

**Do:**

1. **Tokens:**
   - `--size-1..9` (12/14/16/18/20/24/32/44/64) with paired line heights.
   - `--container-reading: 45rem`, `--container-wide: 78.5rem`.
   - `--radius-card: 12px`, `--radius-media: 20px`, `--radius-pill: 999px`.
   - `--surface-1/2/3` for both themes, where dark Ink-950/900/850.
   - Replace fractional sizes (9.75, 12.48, 14.4, 15.6, 20.35) and stray `max-w-[..ch]` values with tokens.
2. **Buttons:** primary (solid cobalt), secondary (outline, **no dot**), on-ink. Retire the outline-with-dot pill and the square external-arrow chip. Next-steps chips use secondary. Add `:active` (scale .98, reduced-motion guarded) and `button:not(:disabled){cursor:pointer}`.
3. **Containers:** every section uses reading or wide. Verify, dossier and security use wide with a right rail (W5 provides the markup; W6 normalizes it).
4. **Header material:** follow ADR 0012.
   - If it allows `backdrop-filter`, use `blur(12px)` with ≥ 0.86 alpha and a solid fallback via `@supports not`.
   - If it forbids blur, raise alpha to ≥ 0.94.
   - Record which in the PR.
5. **Dark elevation:** cards on `--surface-2` with a 1px top highlight. The hero keeps the only glow.
6. **CJK and VI type:**
   - `:lang(zh-Hans)` and `:lang(zh-Hant)` font stacks (PingFang SC/TC, Noto Sans SC/TC, Microsoft YaHei/JhengHei).
   - `word-break: keep-all; line-break: strict` on CJK headings.
   - `text-wrap: balance` on H1/H2, `text-wrap: pretty` on body.
7. **Print:** hero text black on white, hide atmosphere and sail, underline links, unfold `<details>` (V7-C-03).
8. **Long pages:** add a "Back to top" link on pages > 3 viewports at ≤ 767 px (OG-7 default). It is a plain anchor, with no JS.
9. **Showcase rail:** set `tabindex="0"` only when the rail overflows. Apply it via CSS `@media (max-width: 64rem)` with a static attribute split, or with the existing script (no new script file; client budget).

**Tests:**

- Architecture: computed distinct font sizes ≤ 10 per page, via an e2e probe at 1440 and 390 over 12 routes.
- No class outside the button family uses `rounded-full border` with an inline dot.
- The containers set equals {reading, wide}.
- The print media snapshot has the hero colour = black.
- Negative proof for each: inject a stray size or radius in a fixture.

**Watch:** `c3-fidelity`, `reveal.css` and the motion contracts (no infinite loops; ≥ 2 s animations must be ambient-infinite, so in practice do not add long one-shots). Also `exp-s6-shell`, `v7-shell` and the header z-index hit-target test from #403.

### W7: Localization finish

**Owns:**

- `src/data/*` zh/zh-hant/vi strings that W1–W5 did not touch
- `src/components/layout/Footer.astro` (tagline)
- `src/lib/i18n.ts` date helpers
- `src/components/experience/CommandNavigator.astro` keyword lists

**Do:**

1. **zh register:**
   - Use 你 everywhere (11 pages carry 您 today, so grep `dist/zh` and fix at the source).
   - zh-hant uses 你 as well, consistent with the current body copy. If the Owner wants 您 for security only, record it as OG-10. Default is 你.
2. **Footer tagline (OG-2):**
   - Default: **Option A**. Keep "Intelligence. Elevated. Impact." as brand-locked English in all locales, and add `lang="en"` on that element so screen readers pronounce it correctly.
   - Option B removes it.
   - The vi rendering "Trí tuệ. Nâng tầm. Tác động." stays as it is today unless the Owner chooses differently.
3. **Dates:** every visible date goes through one `formatDate(locale, iso)` helper backed by `Intl.DateTimeFormat`. vi gives "12 tháng 9, 2026", zh/zh-hant "2026年9月12日". Add a unit test.
4. **VI pass** (D-08/D-09), applying the glossary in §5.3:
   - one term per concept
   - no "site" in VI copy
   - About label = "Về BlueSkyz" in nav, footer, H1 and title
   - "dữ liệu mẫu" everywhere, not "dữ liệu minh hoạ"
5. **Palette:** add zh/zh-hant synonyms (核实/核验/验证; 核實/核驗/驗證/查證) and keywords for every item. Each palette item has ≥ 2 keywords per locale.

**Tests:**

- An architecture test bans `您` in `src/**` zh strings unless allow-listed.
- A test bans "site" as a standalone word in vi strings.
- A unit test covers `formatDate`.
- Negative proof for each.

### W8: Global SEO completion

**Owns:**

- `src/lib/seo.ts`
- `src/pages/sitemap.xml.ts`
- `src/layouts/BaseLayout.astro` (head only)
- `src/lib/i18n.ts` (`htmlLang`)
- the 4 specs that pin `lang="zh"`
- the JSON-LD builders

**Do:**

1. **SEO-05:**
   - Emit `lang="zh-Hans"` on /zh/.
   - Update `c3-seo-locale`, `c3-trilingual-parity`, `evidence-passport` and `decision-room` in the same PR, and state it in the PR body. This changes a test expectation, not a guard: the guard still requires the right script subtag.
   - CSS `:lang(zh)` selectors keep matching `zh-Hans`. Verify this.
2. **SEO-10, sitemap `lastmod`:** at build, take the per-route last content-change date from `git log -1 --format=%cs -- <source files of the route>`.
   - If the build environment has a shallow clone, the date is unreliable, so **omit `lastmod`**. Never use build time.
   - Add a test that `lastmod` is either absent or ≤ today and ≥ 2026-08-01.
3. **SEO-06:** `og:locale:alternate` lists all 3 other locales.
4. **SEO-12/21:**
   - Editions BreadcrumbList is in W5b.
   - Remove hreflang and Organization/WebSite JSON-LD from the 404 pages, which are noindex.
5. **SEO-13 (OG-4):** add `applicationCategory` only after the Owner confirms it. Default: omit. Keep `operatingSystem: "Web"`, which is sourced.
6. **SEO-19, legacy `/products/sotro` → `/en/products/sotro/`:** this is in `public/_redirects`, a **protected path**.
   - Open a separate PR. The Owner adds `owner-approved`. Agents never add, remove or ask to bypass that label.
   - Do not enable auto-merge on it.
7. **SEO-14b, per-product OG cards:** see W12. Until the cards exist, product pages use the default card with a localized alt (#412).

**Tests:** extend `seo-v7-technical.test.mjs` with negative proofs for `lang`, `lastmod` and `og:locale:alternate`.

### W9: Performance headroom

**Owns:** whatever the perf root-cause touches. It is coordinated with `perf/lcp-headroom` and must not duplicate it.

**Goal.** `/en/` and `/vi/` mobile LCP ≤ 2 300 ms (lab, CI config), so that the 2 500 ms budget is no longer marginal and PRs stop flaking red.

**Do:**

1. Measure first: run Lighthouse ×3 per route and take the median.
2. Candidate levers, in order of risk:
   1. Inline the critical above-the-fold CSS for `BaseLayout`, or split it.
   2. Preload only the display-face subset actually used by the H1 (vi glyphs).
   3. Keep `theme-init` inline (already inline; confirm it).
   4. Lower the hero capture `fetchpriority`.
   5. Avoid layout-shifting web-font swaps on the H1 (`size-adjust` fallback metrics).
3. Icon PNGs above 20 KB that render at 36–76 px get width-matched WebP/AVIF derivatives. Give lockup `<img>` explicit `width`/`height` (V7-C-10).

**Acceptance.** Lighthouse CI is green for 3 consecutive main runs. `pnpm check:client-budget` is unchanged or lower.

### W10: Repository gardening

**Owns:**

- the unused components (§2.1):
  - `ui/Reveal.astro`
  - `sections/OneHouse.astro`, `FlagshipProof.astro`, `FeaturedProducts.astro`, `NextStep.astro`, `Trust.astro`, `AboutBlueSkyz.astro`
  - `maison/MaisonIndex.astro`
  - `experience/OneHouseMatrix.astro`, `IntentLens.astro`, `ExperienceSpine.astro`
- their now-orphan CSS, scripts and data

**Do:**

1. For each component, `grep -r <Name> tests/`. If an architecture test reads the file as a contract, decide one of two things:
   - Keep it, and record why in the PR.
   - Delete the component and the test together, with the reason.
2. Delete any CSS selector that no longer matches any `dist/` HTML. Use a scripted check and attach its output to the PR.
3. Follow `skills/repository-gardening/SKILL.md` from the pinned SGPS.

**Acceptance.** Build output is byte-identical for all pages except removed dead CSS. Verify by diffing `dist/**/*.html` before and after.

### W11: Independent verification and release readiness

**Owns:**

- `docs/evidence/2026-10-xx-experience-v8-verification.md`
- the go-live readiness report update

**Do:**

1. A **distinct verifier lane** (a different agent session from the implementers) binds to the exact merged `main` SHA.
2. Run every gate in §5.4 plus:
   - all 4 Playwright engines (dispatch the workflow on a branch, or rely on the main push run)
   - Lighthouse ×3 for `/en/`, `/vi/` and `/en/products/sotro/`
   - axe over all routes × 2 themes
   - keyboard traversal recordings of the header, menu, palette, decision room and dossier
   - print-to-PDF of home, Sổ Trọ and an evidence page
   - screenshots of every route at 320, 390, 768, 1024, 1440 and 2560, light and dark
3. Score against §3. Every row is `PASS / FAIL / NOT VERIFIED`. Missing evidence is never PASS.
4. Update the go-live readiness report. Production checks stay `NOT VERIFIED` until the Owner lifts Access, then run `node scripts/smoke-production.mjs --site https://blueskyzlabs.com`.

### W12: Asset track (Owner-input dependent, optional for go-live)

The goal is to raise visual richness without inventing anything. Each item is blocked until its Owner input arrives:

1. **Per-product OG cards** (1200×630, ≤ 200 KB WebP/PNG): built from existing brand art + the existing capture + the "In development" label. `sharp` is present only as a transitive dependency of Astro (`node_modules/.pnpm/sharp@0.35.4…`), not a direct one. Generate the images with a one-off local run, commit only the output images under `public/social/`, and record the exact command in the PR body. Do not add a script under `scripts/` (protected), and do not add a dependency (`package.json` is protected). The Owner approves the images (OG-8).
2. **Default OG** re-encoded from 932 KB to ≤ 250 KB with no visual change. This one is not gated.
3. **About composition:** one Reveal frame from the existing sail construction lines (v6 plan §About). Taste is Owner-gated (OG-11). Default: none.
4. **Video poster:** a real frame from the existing intro video (W3 step 4).

---

## 5. Operating contract for the implementing agent

### 5.1 Setup (per wave)

```bash
cd <repo clone> && git fetch -q origin main
git worktree add ../wt-<wave> -b <type>/v8-<wave>-<slug> origin/main
cd ../wt-<wave> && pnpm install --frozen-lockfile --prefer-offline
```

Every wave picks its **own ports**: preview `33<NN>`, wrangler `34<NN>`, inspector `+6000`. Port `3000` belongs to Playwright's default server. Always set `PLAYWRIGHT_BASE_URL=http://127.0.0.1:<your preview port>` so that you never test another worker's build.

### 5.2 Hard rules

1. **Truth:**
   - Never invent facts, metrics, users, testimonials, emails, founder lines, dates, partners, locations, screenshots or platform claims.
   - Copy changes come only from `docs/superpowers/plans/v8/copy-deck.md`, or remove overclaim, repetition or jargon.
   - Every new string cites its truth source in the PR body.
2. **Protected paths. Never edit them in a wave PR:**
   - `.github/`, `.githooks/`, `scripts/`, `brand/`, `docs/decisions/`
   - `AGENTS.md`, `SECURITY.md`, `pnpm-workspace.yaml`, `.node-version`, `wrangler.toml`
   - `public/_headers`, `public/_redirects`
   - `eslint.config.mjs`, `playwright.config.ts`, `lighthouserc*`
   - `package.json` scripts and dependencies

   If a fix truly needs one, stop and open a separate PR that says so. Agents never add, remove or request bypass of the `owner-approved` label, and never enable auto-merge on such a PR.

3. **Tests and gates:**
   - Never weaken a test, budget or gate to get green.
   - Every behavioural or visual fix ships with a regression test **and a negative proof**: the PR body shows the test failing with the invariant broken.
   - A pinned spec may change only when the pinned behaviour is the thing this plan changes, and the PR body says so.
4. **Motion:**
   - No infinite loops except existing ambient ones.
   - No new one-shot animation ≥ 2 s.
   - Honour reduced motion.
   - The hero H1 subtree has no transitions (#396).
5. **Budgets:**
   - Client JS stays within `pnpm check:client-budget`.
   - No new runtime dependency.
   - No new font file.
6. **Git:**
   - No force-push and no history rewrite on shared branches.
   - Merge `main` in to update a branch; do not rebase.
   - No model names in commits, PRs or code.
   - Commit trailer as the repo's recent history shows.
7. **Tooling:**
   - Never run `playwright install`. Chromium is at `/opt/pw-browsers/chromium`; Firefox/WebKit run in CI only.
   - Stop servers with `fuser -k <port>/tcp`, never `pkill -f`.
   - `astro preview` is a singleton daemon: run `pnpm exec astro preview stop` before starting one.
8. **Vietnamese and CJK:**
   - Any vi/zh/zh-hant string change is listed verbatim in the PR body under **Copy changes**.
   - Vietnamese must come from the deck's final column or follow §5.3.
   - zh/zh-hant lines are deck suggestions and stay `NOT VERIFIED` for native review.

### 5.3 Vietnamese glossary (binding for all waves)

| Concept                         | Use                                       | Avoid                                                                                     |
| ------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| claim                           | tuyên bố                                  | nhận định, khẳng định (mixed)                                                             |
| evidence                        | bằng chứng                                | chứng cứ                                                                                  |
| source                          | nguồn                                     |                                                                                           |
| website                         | trang web; "trang" for one page           | site                                                                                      |
| in development                  | đang phát triển                           | đang phát triển thử nghiệm                                                                |
| sample data                     | dữ liệu mẫu                               | dữ liệu minh hoạ                                                                          |
| sign in (existing users)        | Đã có tài khoản? Đăng nhập                | Người dùng hiện tại: đăng nhập                                                            |
| About                           | Về BlueSkyz                               | Giới thiệu, Tìm hiểu BlueSkyz (except the page title, if a test pins it: update the test) |
| private vulnerability reporting | báo cáo lỗ hổng riêng tư                  |                                                                                           |
| maintainers                     | người bảo trì                             |                                                                                           |
| offline                         | khi không có mạng                         | ngoại tuyến (UI copy)                                                                     |
| first-class route               | (do not translate; remove the phrase)     | tuyến đường hạng nhất                                                                     |
| verify                          | xác minh (page name), kiểm chứng (action) |                                                                                           |
| printable summary               | bản tóm tắt để in                         | hồ sơ, dossier                                                                            |
| compare claims                  | so sánh tuyên bố                          | phòng quyết định                                                                          |
| how this site is built          | cách trang web này được xây dựng          | kiến trúc (as a visitor label)                                                            |

### 5.4 Checks before every push

Remove `.wrangler` first.

```bash
pnpm test:architecture && pnpm typecheck && pnpm lint && pnpm format:check
PUBLIC_SITE_URL=https://blueskyzlabs.com pnpm build
pnpm check:client-budget && pnpm check:static-links && pnpm check:publishability
# e2e, CI-style build
rm -rf tests/e2e/fixtures/parity-app/dist && node scripts/build-parity-fixture.mjs
PUBLIC_SITE_URL=http://127.0.0.1:3000 pnpm build
pnpm exec astro preview stop; pnpm exec astro preview --host 127.0.0.1 --port <PORT> &
PLAYWRIGHT_BASE_URL=http://127.0.0.1:<PORT> pnpm exec playwright test --project=chromium --project=mobile-chromium <touched specs + home + shell>
# perf-sensitive waves (W2, W3, W6, W9): local Lighthouse mobile on /en/ and /vi/ x3, median LCP <= 2300 ms
```

The pre-commit hook runs the local source gate. Never bypass it with `--no-verify`.

### 5.5 PR conventions

- **Title:** `<type>(<scope>): <what> (v8 W<n>)`.
- **Body:**
  - finding IDs
  - before/after screenshot names (light and dark, 390 and 1440)
  - checks run, with counts
  - test changes, each with its reason
  - Copy changes
  - truth sources
  - It ends with the repo's standard Claude Code footer.
- **Auto-merge:** may be enabled only on non-protected PRs, after the author has seen local gates pass.
- **PR events:** if CI fails, fix and push. Do not re-run hoping for a flake. "Flake" is not a root cause.

---

## 6. Owner decisions needed

Each has a recommended default. Waves proceed with the default unless the Owner answers otherwise.

| ID    | Question                                                                                                                                                      | Recommended default                                                                                                              | Blocks         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| OG-1  | VI hero H1 is a literal calque ("…để trao quyền cho con người và nâng tầm cách công việc được thực hiện"). Approve a natural rendering with the same meaning? | Approve: **"Chúng tôi xây dựng sản phẩm thông minh, giúp con người làm chủ và nâng tầm cách làm việc."** The EN H1 is unchanged. | W2 (copy only) |
| OG-1b | Hero focal point: capture (sail as atmosphere) or sail (capture moves to band 2)?                                                                             | Capture as focal, sail as atmosphere. It shows the product first (v6 principle 1).                                               | W2             |
| OG-2  | Footer tagline in zh/zh-hant: A keep English, B remove, C new line                                                                                            | A, with `lang="en"`                                                                                                              | W7             |
| OG-3  | Sổ Tâm: brand art says "AI Journal for Clarity", copy says "local-first journal". Which is true? Audience "Individuals, Professionals"?                       | Hide the tagline line and audience until confirmed                                                                               | W3, W8         |
| OG-4  | `applicationCategory` for both products in JSON-LD                                                                                                            | Omit until confirmed                                                                                                             | W8             |
| OG-5  | Remove the persona chips on /products?                                                                                                                        | Remove                                                                                                                           | W4             |
| OG-6  | Keep the routes `/dossier/`, `/decision-room/`, `/architecture/` and change only the visible names?                                                           | Yes. Rename labels only; no route or redirect changes                                                                            | W5b            |
| OG-7  | Phone header sticky?                                                                                                                                          | No. Add "Back to top" on long pages                                                                                              | W6             |
| OG-8  | Approve generated per-product OG cards                                                                                                                        | Review the images when W12 produces them                                                                                         | W12            |
| OG-9  | Keep the EN/VI mirror block on security?                                                                                                                      | Remove everywhere                                                                                                                | W5a            |
| OG-10 | zh register: 你 everywhere?                                                                                                                                   | 你 everywhere                                                                                                                    | W7             |
| OG-11 | About page Reveal composition                                                                                                                                 | None for go-live                                                                                                                 | W12            |
| OG-12 | `public/_redirects` legacy product mapping (protected path)                                                                                                   | Approve via the `owner-approved` label on the separate PR                                                                        | W8             |

Also still open from earlier (not part of this plan's execution):

- Lift Cloudflare Access at go-live, then run production smoke and decide GO/NO-GO.
- Labels for #405, #367, #368 and #371.
- HSTS is blocked by the 502 `sgps`/`atlas` subdomains.

---

## 7. Sequencing and parallel lanes

```
W0 (frontier) ──┬─> W1 (copy foundation) ──┬─> W2 (home) ───────────┐
                │                          ├─> W3 (product pages) ──┤
                │                          └─> W4 (products index) ─┤
                ├─> W5a (verify/security/privacy) ──────────────────┤
                ├─> W5b (dossier/decision/arch/evidence/editions) ──┤
                ├─> W8 (SEO; W8.6 is a separate protected PR) ──────┤
                └─> W9 (perf; starts with the in-flight perf PR) ───┤
                                                                    v
                                         W6 (design system) ─> W7 (localization) ─> W10 (gardening) ─> W11 (verify)
W12 (assets): whenever Owner input arrives; never blocks W11.
```

- **Lane A:** W1 → W2 → W3 → W4.
- **Lane B:** W5a, then W5b. Or run them in parallel; their files are disjoint.
- **Lane C:** W8, W9.

W6 waits for lanes A and B to merge because it rewrites shared CSS. W7 waits for W6 because both touch strings and type. At most 3 lanes run at once. Each lane updates its branch from main before pushing, because the strict ruleset requires up-to-date branches.

File conflicts to expect:

- `global.css`: W2–W5 add only fenced blocks; W6 folds them in.
- `site.ts`: W1 only. Later waves import from it but do not edit it, except W7 for strings.
- The product yamls: W3 only.

---

## 8. Definition of done (project convergence)

The plan is complete when all of these hold:

1. W0–W11 are merged on `main`, and W11's evidence record reports every §3 row `PASS`, or `NOT VERIFIED` with the named environment gap (Firefox/WebKit local, field CWV, native review, production headers).
2. Every row in the §2.4 register is `FIXED`, `KEEP`, or Owner-decided.
3. The executable-frontier audit (`docs/continuation/TERMINATION_CONTRACT.md` in the pinned SGPS) finds no `SAFE_EXECUTABLE_NOW` item inside this scope.
4. The go-live readiness report is updated. The only residual gates left are Owner actions: lift Access, run production smoke, label protected PRs, fix HSTS subdomains.

`PLAN COMPLETE != PROJECT COMPLETE`: after go-live, outcome convergence follows from field data (Search Console, CrUX once eligible, real-user feedback). Any new work there is a separate plan.

---

## 9. Risks and mitigations

| Risk                                             | Mitigation                                                                                                                    |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| LCP budget flakes on every hero/CSS PR           | W9 headroom target 2 300 ms; perf-sensitive waves run local Lighthouse ×3 before push                                         |
| Pinned specs make copy changes noisy             | Change pins only for intended behaviour; list each in the PR body; never delete a guard without a replacement                 |
| Subtraction reads as "less premium" to the Owner | W2 and W3 add composition (one focal capture, story order) as well as removing things; W12 adds richness with approved assets |
| Bound-claim wording drift breaks evidence        | Deck rows only; `check:publishability` and claim-gate tests every PR                                                          |
| Parallel lanes collide in CSS                    | Fenced blocks; W6 serial after lanes A/B                                                                                      |
| VI quality regresses through agent edits         | §5.3 glossary plus the "Copy changes" listing; orchestrator/Owner review before merge for any VI string not in the deck       |
| zh/zh-hant correctness                           | Remains `NOT VERIFIED` for native review; deck lines are suggestions; no new zh copy beyond the deck                          |

---

## 10. ENVIRONMENT BOOTSTRAP & TEST EXECUTION (audit run of this plan)

- **Environment:**
  - Claude Code cloud container, Linux.
  - Node 22.22.2, pnpm (repo lockfile).
  - Playwright-core 1.63.0 with Chromium at `/opt/pw-browsers/chromium`.
  - axe-core 4.13.0 from `node_modules`.
- **Bootstrap:**
  - Worktree at the integration head (local `6fbef52` = `main@c790abb` + #407 + #411 + #412, with one conflict resolved as in W0).
  - `pnpm install --frozen-lockfile --prefer-offline`.
  - `PUBLIC_SITE_URL=https://blueskyzlabs.com pnpm build`: 98 HTML files.
  - `wrangler dev --local --port 3501`.
- **Commands:**
  - A screenshot and DOM-probe script: 24 routes × 2 widths, plus dark on 7 routes. It produced 124 images and `meas.json`.
  - axe-core over 18 routes × light/dark, with `bypassCSP` because the site CSP forbids injected scripts.
  - `grep` residual checks over `dist/`.
  - An unused-component scan over `src/components`.
- **Artifacts:** screenshots and scripts are session-local and not committed. They are referenced by name in §2.
- **Limitations:**
  - No Firefox/WebKit.
  - No Lighthouse on the integration head (the perf lane owns it).
  - No motion frames, no real print dialog, no production headers (Access), no native zh review.
- **Platform gaps:** mobile is emulated viewport only; there are no real devices.
