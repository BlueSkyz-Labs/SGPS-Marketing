# Visual runtime audit, 2026-10-19

**Baseline:** `main@d8c28bf` (after #641). The published SGPS release pin is unchanged at `v1.13.0`.
**Kind:** a BPXS VISUAL_RUNTIME_CONVERGENCE_AUDIT pass. It produces agent (E3) evidence only. It does not count as Human E4, native zh review, or field Core Web Vitals.
**"Global Elite"** here means the internal BPXS composite bar (v10 plan §0). It is not a certification, and nothing in this record claims the site meets it.

## Method

1. Built the site locally from the baseline with `pnpm build` (94 pages) and served `dist/` with `astro preview`.
2. Rendered 20 routes in Chromium in light and dark at three widths: 320, 390 and 1440 px.
   - Routes: home in en, vi, zh and zh-hant; products; both product profiles; About; Security; Support; Contact; Journal; Decision Room; Verify; Evidence; Editions; Dossier; Privacy; 404.
   - Full-page captures were taken at 390 and 1440. Before each capture the page was scrolled so lazy images load.
3. For every page the run recorded:
   - horizontal overflow;
   - interactive targets under 24 px outside running text;
   - text under 12 px;
   - images without dimensions, and broken images;
   - the number of `h1` elements;
   - CLS from the Layout Instability API.
4. Separate captures covered states that a full-page capture cannot show:
   - the sticky scrollytelling on the Sổ Trọ profile, at steps 3 and 5 and at both widths;
   - the Decision Room controls.
5. Shifts were attributed with `PerformanceObserver` `layout-shift` sources.

## Results on the baseline

| Check                                    | Result                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------- |
| Horizontal overflow (120 page renders)   | 0                                                                          |
| Targets under 24 px outside running text | 0                                                                          |
| Text under 12 px                         | 0                                                                          |
| Broken images, images without dimensions | 0                                                                          |
| One `h1` per page                        | All pages                                                                  |
| CLS above 0.02                           | **1 route: `/en/decision-room/`** (0.27 at 390, 0.11 at 1440, 0.31 at 320) |
| Status                                   | All 200, except `/en/evidence/` = 404                                      |

`/en/evidence/` has no index page by design: only the three evidence detail pages exist. Nothing links to the bare path; the static link check reports 0 broken links. It is not a defect.

## Findings and dispositions

| ID    | Route                                                       | Finding                                                                                                                                                                                                                                                         | Disposition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| VA-01 | `/<lang>/decision-room/`                                    | **CLS 0.27 at 390 px**, above the 0.1 CWV "good" threshold. The atelier controls were server-rendered with `hidden`, and the script then un-hid them. That pushed `.decision-room__items` down by 372 px (390) or 294 px (1440) after the first paint.          | **Fixed.** With scripting on, the controls render from the first paint (`@media (scripting: enabled)`). Without scripting they never render, so there is still no dead UI. A browser without the media feature falls back to the old reveal. Guards: a deterministic "holds its space before the script runs" check and a Chromium CLS < 0.02 check. Both failed on the baseline (negative proof) and pass on the fix. The no-JS check now uses a real JavaScript-disabled context instead of a source regex. |
| VA-02 | `/<lang>/decision-room/`                                    | The atelier controls had no visible boundaries. The goal `<select>` had no border, and "Reset arrangement" read as plain text, not a button. The Dossier controls on the sibling route are bordered.                                                            | **Fixed.** The panel, the select and the reset button now use the same tokens and shape as the Dossier controls and the Decision Room buttons. The 44 px heights and the 24 px checkbox rule are unchanged, and no copy changed.                                                                                                                                                                                                                                                                              |
| VA-03 | `/<lang>/products/sotro/` (any record with an interim note) | The "Get in touch" link inside the interim-note sentence was a 44 px `inline-flex` box, so its line had about twice the leading of the line above it. This is the same shape as BB-04, but here the Owner B-01 exception (2026-10-18) had not yet been applied. | **Fixed** under Owner B-01: the link is a plain inline sentence link. Its destination keeps a tap-sized twin, the footer Contact link, and the new guard checks that twin. Guard plus negative proof are in `ux-wave2-rhythm.spec.ts`.                                                                                                                                                                                                                                                                        |
| VA-04 | `/<lang>/decision-room/` at 1440                            | The four-column item grid stops at 72 rem, short of the content column's right edge.                                                                                                                                                                            | **Observation, no change.** It is the declared `max-width`, and widening it changes line lengths for the claim text.                                                                                                                                                                                                                                                                                                                                                                                          |
| —     | `/<lang>/products/sotro/`                                   | The first full-page capture showed an empty device frame.                                                                                                                                                                                                       | **Not a defect.** Lazy images were not loaded in an unscrolled capture. Viewport captures at steps 3 and 5 show the sticky device updating correctly at both widths.                                                                                                                                                                                                                                                                                                                                          |

Open items from the 2026-10-03 Beauty-Blind review stay with their recorded owner:

- BB-01: hero and footer copy. The Owner kept it.
- BB-02: mobile capture legibility. Owner/design.
- BB-03: lockup secondary lines. Brand kit.

This pass does not reopen them.

## Verification

All results below are from the fix build, run locally on Chromium:

| Check                                                                                                      | Result                                         |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `node --test tests/architecture/*.test.mjs`                                                                | 1333 / 1333 pass                               |
| Lint, Prettier, client budget                                                                              | pass (site-wide 17 593 B, worst page 13 227 B) |
| Static links                                                                                               | 0 broken                                       |
| Decision Room, atelier, accessibility, Sổ Trọ profile and interim-note suites (chromium + mobile-chromium) | 290 / 290 pass                                 |

**Not verified locally:**

- Firefox and WebKit: no local browsers. The CI shards run them.
- The visual regression baselines: they are CI-environment snapshots.
- Lighthouse: CI only.

**Visual baselines:** the interim-note change alters `vi-products-sotro-*`. If CI reports a diff, the accepted baselines go to `tests/visual/`, which is a protected path that needs the Owner label.

## Weakest point

The VA-01 fix shows the controls before the module has run. If the script fails to load on a modern browser, the controls stay visible but do nothing until a reload. The item list and the sources still work without them.

This is the same trade-off the room already makes for its "Compare" buttons, which are visible by default and hidden only by `<noscript>`. The alternative is a reveal after the first paint, which costs every visitor a 0.27 shift.
