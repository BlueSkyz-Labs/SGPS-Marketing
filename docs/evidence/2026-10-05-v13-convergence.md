# v13 convergence: Experience — Global Enterprise

**Date:** 2026-10-05 (GMT+7).

**Plan:** `docs/superpowers/plans/2026-10-05-v13-experience-global-enterprise.md`.

**Final main:** `dc3e128`.

**Verdict:** **CONVERGED_WITH_RESIDUALS.**

- All approved executable work has landed or ended as a recorded NO-GO.
- The remaining items are Owner or external steps (§4).
- No approved executable gap remains.

## 1. Workstream outcomes

| ID  | Outcome                                                                                                                        | Evidence                                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| W1  | **Landed.** `SGPS-DEC-2026-037` (no flags for languages; one-icon appearance control) is merged in sgps-core and adopted here. | sgps-core #280 `3f2bbe8`; #512 `d24a5af` (globe + language-code trigger, ADR 0009 amendment); #513 `dc3e128` (one-icon theme control) |
| W2  | **Landed.** WCAG 2.2 AA lock-in.                                                                                               | #514 `f3a2d35`                                                                                                                        |
| W3  | **NO-GO** (§2).                                                                                                                | This record                                                                                                                           |
| W4  | **NO-GO** (§3).                                                                                                                | v12 record §3 and this record                                                                                                         |
| W5  | **BLOCKED_OWNER_FACT.** No Sổ Tâm screens exist in `src/content/showcases/`.                                                   | —                                                                                                                                     |

**W2 details:**

- Measured on `main@fd8776f`: 80 routes × 3 configurations had zero axe violations at any impact.
- The new sweep found one real defect: `/zh/` and `/zh-hant/decision-room/` failed WCAG 1.4.10 reflow at 320 px. The cause was `keep-all` on CJK headings, which is now fixed.
- `tests/e2e/a11y-wcag22-sweep.spec.ts` now blocks merges in CI on four checks: axe at any impact, 2.4.11, 1.4.10 and 1.4.12. Each check has a negative-proof fixture.

## 2. W3 NO-GO: Interop 2026 enhancements

The plan admitted a platform feature only if it **removes JavaScript** or **measurably improves the experience**, with a fallback.

**`<dialog closedby="any">` for the command palette:**

- Today the palette's backdrop light-dismiss is about 8 lines in `src/scripts/command-navigator.ts`.
- Dialogs and popovers, including `closedby`, are an Interop 2026 _focus area_ ([web.dev, 2026-02-12](https://web.dev/blog/interop-2026)). That means the feature is not yet interoperable, so the JS fallback must stay.
- Result: no code is removed, and a second behaviour path must be tested. **NO-GO** until `closedby` is Baseline.

**`popover="hint"` for the theme tooltip:**

- The tooltip is CSS-only today and uses no JavaScript.
- A hint popover needs JS or `interestfor` to open on hover or focus, which would add JS.
- **NO-GO.**

**Re-open trigger:** `closedby` reaches Baseline Newly Available. At that point the backdrop handler can be deleted outright.

## 3. W4 NO-GO: product-route LCP

- The v12 A/B measured LCP +16 to +81 ms on the product route, with the performance score within ±1 of noise.
- The story screens are already `loading="lazy"` and fetched at Low priority. Chrome's lazy-load distance reaches them from the first viewport.
- Deferring them further needs new JavaScript, such as an IntersectionObserver swap. That conflicts with the v12 motion rule (no new JS without a measured need), and lab noise does not meet the measured-need bar.

**Re-open trigger:** field LCP (CrUX or RUM) on the product route exceeds the 2.5 s "good" threshold. That requires lifting Cloudflare Access and choosing a RUM provider.

## 4. Residual (Owner or external)

- Lift Cloudflare Access. Field Core Web Vitals and the T3 production smoke depend on it.
- Choose the RUM provider.
- Human E4.
- Native zh review.
- #488 legal facts, plus an accessibility statement if the EU market is targeted.
- Supply Sổ Tâm screens for W5.
- Propagate `SGPS-DEC-2026-037` to Sổ Trọ. That repository is not in this session's scope, so it needs a session with access to it.

## ENVIRONMENT BOOTSTRAP & TEST EXECUTION

**Environment:**

- Claude Code cloud container.
- Node v22.22.2 (engine warning accepted; CI uses the pinned 24.20.0).
- pnpm 11.25.0 with a frozen install per worktree.
- Chromium 1194, used through a local Playwright config with `executablePath`, because Playwright 1.63 expects revision 1243.

**Commands:**

- `pnpm test:architecture`, `pnpm typecheck`, `pnpm lint` and `pnpm build`.
- The Playwright chromium suite.
- `tests/e2e/a11y-wcag22-sweep.spec.ts`.
- Lighthouse 13.4.1 (v12).

**Limitations:**

- Two e2e tests fail locally only: decision room and dossier composer "no network requests". CI is authoritative for them.
- Lab evidence is not field evidence.
