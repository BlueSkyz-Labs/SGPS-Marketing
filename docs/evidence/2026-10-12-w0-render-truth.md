# W0 fresh render truth (2026-10-12)

Bound to main SHA `a35163472f372715e9be3249f847cd9296a2237d`. Workstream W0 of `docs/superpowers/plans/2026-10-10-signature-visual-experience-horizon-sail.md`.

## Environment class

Local `pnpm build` + `astro preview` on 127.0.0.1:3101. This is **not production and not a provider-served SHA**. Chromium headless_shell 1194 via Playwright 1.63.0, Node v22.22.2, Linux, browser locale en-US. Full environment: `w0-render-2026-10-12/manifest.json`.

## Method

- Routes: Home, Products, Sổ Trọ profile, Verify, About, Contact, 404, for `en`, `vi`, `zh`, `zh-hant`.
- Base matrix: 1440x900 and 390x844, light and dark (localStorage `blueskyz-theme` plus emulated color scheme): 112 captures. Axe ran on these.
- Home extras for each locale: full-page (4 variants), no-JS (390, 1440), reduced-motion (390, 1440), 320px width, 200% text zoom (390, 1440). Forced-colors on Home for en and vi: 4 captures. Total **164 captures**.
- Per capture: horizontal overflow, H1 in first viewport, first primary CTA in first viewport, console errors, non-127.0.0.1 requests, axe violation count.
- 200% text zoom is emulated with `html{font-size:200%}`, not native browser zoom.
- Lighthouse 13.4.1 CLI, mobile preset, 1 run per URL (not the 3-run lhci median).
- Images are downscaled WebP (about 3.7 MB committed). Original PNG hashes are in the manifest.
- Gaps below come from the numbers and from viewing contact sheets of the images. They are not verdicts.

## Measured facts

| Metric                                 | Result (scope: 164 captures, local build)                                                                                                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Horizontal overflow                    | 0 of 164 (including 320px and 200% zoom)                                                                                                                                                      |
| H1 in first viewport                   | 164 of 164                                                                                                                                                                                    |
| Primary CTA in first viewport          | Home: all true except 200% zoom (CTA top at 1243-2015px, below the fold, all 8 zoom captures). Products and other routes: **not measured**, the selector found no `.btn--primary` on Products |
| Console errors                         | 0                                                                                                                                                                                             |
| Non-local requests                     | 0                                                                                                                                                                                             |
| Axe (default rules, 112 base captures) | 0 violations, 0 axe errors                                                                                                                                                                    |
| Lighthouse mobile, en Home             | Perf 99, A11y 100, BP 100, SEO 69; LCP 1.9 s, CLS 0, TBT 0 ms                                                                                                                                 |
| Lighthouse mobile, vi Home             | 100 / 100 / 100 / 69; LCP 1.7 s                                                                                                                                                               |
| Lighthouse mobile, en Products         | 99 / 100 / 100 / 69; LCP 1.8 s                                                                                                                                                                |
| Lighthouse mobile, vi Products         | 100 / 100 / 100 / 69; LCP 1.8 s                                                                                                                                                               |

SEO 69 comes from one failing audit, `is-crawlable`. The local build emits `noindex` (meta robots and `X-Robots-Tag`). It is an environment artifact and says nothing about production. Lighthouse is a lab run on one machine, not field data.

## Severity-ranked gap map

Severity is the author's judgement on the observed evidence, not a verdict.

1. **MEDIUM, mobile product theatre legibility.** At 390px the Home tablet/desktop UI screenshot of Sổ Trọ renders at about 235px wide. Its text is illegible and carries no focus (all locales, light and dark). Relevant to W2.
2. **MEDIUM, possible blank tablet image in vi full-page capture.** The `vi` Home full-page mobile light shot shows the tablet frame as an empty dark box. The same section renders in `en`, `zh-hant` and desktop. This may be a lazy-load artifact of a full-page capture taken without scrolling. **Unconfirmed.** Re-check with scroll-to-load before treating it as a defect.
3. **MEDIUM, locale-suggestion banner pushes the hero (vi, zh, zh-hant).** With an en-US browser, a "View this page in English?" bar sits above the hero. On mobile it moves the H1 and CTA down by about 60-90px, and it appears on every route. Metrics still pass at 390x844. It would matter at shorter viewports or at 200% zoom. The banner is by design, so the question is its footprint.
4. **LOW-MEDIUM, zh and zh-hant H1 line breaks mid-word on mobile.** Observed breaks: "智能化产/品" (zh) and "智慧化產/品" (zh-hant), and the zh-hant 320px shot also splits words. Needs native-language review to judge.
5. **LOW-MEDIUM, 200% text zoom pushes the Home CTA below the fold.** This is expected under zoom, so it is a layout note, not a failure. Check that the CTA remains reachable and that nothing is clipped (nothing overflowed horizontally).
6. **LOW, desktop Home vertical rhythm.** There is a large empty band under the hero, and the tablet section and "Also in development" are separated by about 100px of blank space. In light theme the dark hero meets a white section abruptly. This is composition and taste, so it needs human review.
7. **LOW, Contact (mobile).** The blue primary-styled "Open private vulnerability reporting" button is the strongest element, while the general business contact is a plain link. Product intent is unknown, so this is an observation only.
8. **INFO, hero phone screenshot shows Vietnamese UI on en, zh and zh-hant pages.** It is labelled "Development build, sample data, 2026-09-30" on the Home hero. No change is suggested here.

Forced-colors on Home (en, vi) retained the H1, the links and an outlined CTA. The decorative sail was not visible in the forced-colors shots. I did not inspect individual widgets beyond what the sheets show.

## NOT VERIFIED

- Independent human beauty-blind review, and any visual PASS/FAIL verdict.
- Native-language review of zh, zh-hant and vi rendering, including line breaks.
- Production served-SHA. This evidence comes from a local build, not a provider-served build.
- Field Core Web Vitals / RUM.
- Keyboard-navigation checks and native browser zoom (only emulated).
- Firefox and WebKit rendering (Chromium only).
- Primary-CTA position on Products, Verify, About, Contact and 404.
- Lighthouse variance (single run per URL).
- Scope of the axe claim: default rules on the 112 base captures only, not on the variant captures.
