# W1 production read-back: 2026-10-20 experience audit wave

**Observed:** 2026-10-23 (UTC). **Production origin:** `https://blueskyzlabs.com`.
**Source reference:** `main` / `origin/main` at
`76cbc5095029720402f758605b448e10ac5fe577`. The served Worker revision is
**NOT VERIFIED**.

## Scope and method

An anonymous production Chromium run observed EN and VI About, Products, Verify,
Sổ Trọ and Sổ Tâm pages at 1440px and 390px (20 URL/viewport observations).
It used Chromium `151.0.7922.173`, Playwright `1.63.0`, Node `v24.19.0`, on
Linux `6.18.55`, in light theme with reduced motion. The run is observational
E3 evidence; it is not a canonical repository gate, Human E4, or native-language
review. Every route returned HTTP 200, rendered one main H1, and had no measured
horizontal overflow.

The committed [render manifest](2026-10-23-w1-render-manifest.json) preserves
the per-observation DOM/computed-style results, screenshot filenames and SHA-256
checksums. Screenshot files are in `/workspace/scratch/marketing-harness-w1/lead-render/`;
they are scratch artifacts and are not committed or guaranteed to remain portable. The independently
fetched source HTML snapshots for the eight changed routes are in
`/workspace/scratch/marketing-harness-w1/evidence/html/`. Those source snapshots
showed HTTP 200 and the expected page copy; HTML alone is not rendered proof.

## Read-back

| Item                          | Result       | Observation                                                                                                                                                                                            |
| ----------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| About CTA band, EN/VI         | PASS         | About page header has zero links; the next-steps band remains with its two destination links.                                                                                                          |
| Products active cue, EN/VI    | PASS         | At 1440px, the visible Products navigation item has computed `text-decoration: underline` on `/products/`; mobile navigation is collapsed at 390px.                                                    |
| Verify glosses, EN/VI         | PASS         | The visible EN/VI Verify content includes the approved first-use glosses and “page” wording, including the Vietnamese GitHub issue gloss.                                                              |
| Product availability, EN/VI   | PASS         | Both product detail pages show one availability line. Sổ Trọ says its web preview is open with limited places and Android/iOS are in development; Sổ Tâm says web, Android and iOS are in development. |
| Profile lockup removed, EN/VI | PASS         | No profile lockup image was observed in the rendered main content on the Sổ Trọ or Sổ Tâm pages.                                                                                                       |
| Route response and layout     | PASS         | All 20 observations returned 200, had one main H1 and no horizontal overflow.                                                                                                                          |
| Served source revision        | NOT VERIFIED | No Cloudflare Worker deployment/version read-back was available; production HTML and visual similarity do not bind the served page to a source SHA.                                                    |
| Human E4 / native review      | NOT VERIFIED | This agent-operated Chromium read-back is not real-participant research or native review.                                                                                                              |

Full-page product screenshots include below-fold lazy placeholders. This record
makes no claim that all product media or product UX was reviewed or certified.

## Source-wave routing

The source wave is marked `MERGED` in `docs/current-work.json`; this W1 record
commit is unmerged, so the W1 record PR integration status is `NOT VERIFIED`. Protected changes
landed in #645 (`96de169d8256df7007afc9592927bcad57aea8e4`), #652
(`39be0ae86aaebbc61fef959a7f45ab38362b0cf6`), #653
(`e7edff20e12f82fe0082ab2dbee74d0f520e6382`), #654
(`edf79f71a43bc4b7edfb292a5cc4865a874b3509`), #655
(`4322aa4aba67713bdb1244b17a0003b5c0d31da8`) and #656
(`ebe5b506019f31a1539d996ada34d0aef3b32526`). Delivery-operations PR #659
merged at `239ad24266ed201c88ad372af14e36c4f1457739`. These source merges do
not prove the served Worker SHA.

The audit's unrelated residuals remain open: stale visual baselines since #637;
TRU-12's self-only security source; the #655 word-cap changes; confirmation of
the `pageloadId` allowance with a second beacon observation; Human E4, native
zh/zh-Hant review and BB-02 recapture. See the owner-decision record for details.

At read-back time, open PRs #661 and #662 were both `BEHIND`. #661's latest
completed Source Assurance run `39610685607` succeeded on head
`af38f460bbbeca40fe63d37f172f020d05b8b122`; #662's latest completed run
`39611107125` had browser shard failures on head
`418b6e3be49361527612363aa9d60a0e2bc0525b`. They are dependency PRs and do not
change this wave's production findings.
