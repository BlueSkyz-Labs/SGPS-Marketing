# Experience audit wave, 2026-10-20: Owner decisions and routing

Baseline: main `3d397c3` / `0d809a7` (audit), recorded at main `0cfa331`.

The audit covered acquisition journeys (ACQ-01..12) and trust journeys
(TRU-01..15). It was rendered in Chromium only, on a local preview, at E3
level. It is not Human E4, not field CWV and not a native-language review.

## Owner decisions (2026-10-20)

| Item              | Decision                                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| G10 home H1       | 44px from 768px. Revert if LCP regresses by more than 100ms. Merged in #650 (`0cfa331`); the PR's LCP table showed no regression beyond noise.                           |
| G1 / TRU-02       | The claim title links to its evidence page.                                                                                                                              |
| G8 / TRU-04       | The security source points to `/security/`.                                                                                                                              |
| TRU-12            | Add passport links. Removing privacy as a source of the security claim is **blocked**: the chain would then cite only itself. It needs a second source or an Owner rule. |
| G5 / TRU-06/07    | Scroll to the tray after the first pick (respects reduced motion), boundary row in the tray, handoff is a secondary button, no sticky bar.                               |
| G6 / ACQ-03/11    | Keep the badge, de-emphasize the stage row, one availability line with the contact link, the Sổ Tâm chip reads "Web · đang phát triển".                                  |
| G7 / TRU-10       | Gloss terms on first use; "route" becomes "page"; make no claim about who the maintainers are.                                                                           |
| G9 / TRU-11       | A no-JS lede; the status line is hidden when JS is off.                                                                                                                  |
| S8 / ACQ-07       | About drops its CTA pair and keeps the next-steps band; one rule under the H1.                                                                                           |
| S9 / ACQ-10       | One link per product per section; hero product names become plain text.                                                                                                  |
| S10 / ACQ-09      | Products nav shows an underline when active.                                                                                                                             |
| TRU-15            | Journal stays hidden until its first entry exists.                                                                                                                       |
| ACQ-04            | Kept as is.                                                                                                                                                              |
| RUM contract      | The agent may edit `docs/sgps/adoption/rum-beacon-fields.json` to declare the observed fields; the change ships in a protected PR.                                       |
| C3-G Spatial halo | A native HTML/CSS prototype as a draft PR, not shipped. WebGL only after an ADR.                                                                                         |

Copy for G6, TRU-10 and TRU-11 was approved by the Owner as exact strings on
2026-10-20. The approved strings are the ones in the PRs below; no agent wrote
new brand copy.

## Routing

Unprotected PRs merge one at a time at 8/8 green on the exact head:
#647, #648, #649, #651, #655.

Protected PRs wait for the Owner's `owner-approved` label (agents never apply
it): #645 (TRU-13, BB-03), #652 (ACQ-07), #653 (RUM contract), #654 (ACQ-09),
#656 (G6, after its baselines).

## Residuals

- **Visual baselines are stale since #637.** The committed baselines do not
  show the header Contact link; main passes only because the difference is
  under `maxDiffPixelRatio` 0.001. A full refresh changes `tests/visual/`
  and needs the label.
- **Privacy as a source of the security claim** (TRU-12, above).
- **#655 loosens two word caps** (vi verify 215 to 230, vi privacy 225 to 231) to fit the approved glosses; the reasons are in the test.
- **#653 allows `pageloadId`** as a page-load-scoped field on one observed
  beacon. A second observation should confirm it.
- Human E4, native zh / zh-Hant review and BB-02 recapture stay with the
  Owner.
