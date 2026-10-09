# Website production launch read-back — 2026-10-09

## Source and promotion

Owner approved publishing Tony Nguyen as Founder & CEO, operating since 2026, and `tony@blueskyzlabs.com` as the Contact mailbox. The artwork is decorative brand illustration, not a photograph of the Founder.

- Contact build configuration: [PR #544](https://github.com/BlueSkyz-Labs/SGPS-Marketing/pull/544), exact tested head `d5e921c039649d07ca22169a0a68e8a9859ce457`, [Source Assurance run 37881926671](https://github.com/BlueSkyz-Labs/SGPS-Marketing/actions/runs/37881926671), all eight checks passed; merge `8a46e718e02057e4060ddadd8fe805fd8bfeea31`.
- Premium About and reviewed multilingual/header polish: [PR #543](https://github.com/BlueSkyz-Labs/SGPS-Marketing/pull/543), exact tested head `23f716b1a4b19a52412fda2f9fd0ae3b5e4fd144`, [Source Assurance run 37885186594](https://github.com/BlueSkyz-Labs/SGPS-Marketing/actions/runs/37885186594), all eight checks passed, including the four browser projects, visual regression and Lighthouse.
- Normal protected merge produced `d9cfd2522d2a6c77bbf0e706992df54a8cd0c896`. No check, budget or Owner label requirement was bypassed. The final workflow was unchanged from main.
- [Cloudflare Workers Build bee82e62](https://dash.cloudflare.com/0dd046dab63171c38a6548642bc9f2d4/workers/services/view/blueskyz-web/production/builds/bee82e62-5f50-4c69-9bfe-4b4038861a46) check completed successfully for that merged source at 05:12:08 UTC (12:12:08 GMT+7). GitHub Actions supplied source assurance only.

## Anonymous production observations

At 05:12:32 UTC (12:12:32 GMT+7), TLS-verified requests to `https://blueskyzlabs.com` confirmed About and Contact in `en`, `vi`, `zh` and `zh-hant`. An independent audit also confirmed Home, Products, About and Contact across those four locales: 16/16 routes returned HTTP 200.

- About renders the Founder feature, Tony Nguyen, operating year 2026 and the decorative illustration.
- All four Contact pages publish `mailto:tony@blueskyzlabs.com`; descriptions no longer promise a mailbox at a future date. The private GitHub security-report channel remains separate.
- Products exposes Sổ Trọ and Sổ Tâm with their actual development status; no additional unpublished product was promoted.
- `https://blueskyzlabs.com/images/about/founder-elevation.webp` returned HTTP 200, `image/webp`, 52,822 bytes. Its SHA-256 was `3bedc552b87aa0733cc27c536faa73f430f68b557c00ebbb3d3c66babb4f1656`, identical to the source asset.

Session receipts: `/tmp/sgps-prod-final-about-smoke.json`; rendered source screenshots: `/workspace/artifacts/about-premium/desktop.png`, `mobile.png`, `dark.png` and `source-proof.json`. These are session-local artifacts, not permanent public evidence links. The CI run above retains independent source-check provenance.

## Scope and outstanding evidence

Observed HTML and asset matching establish source consistency. They do not attest the exact served Worker version: authenticated provider deployment/version read-back remains NOT_VERIFIED. Live browser interaction was not independently verified in this session because the managed proxy certificate was not accepted by Playwright; TLS verification was not disabled. The passing CI browser and rendered-source proofs remain scoped to their tested source and environment.

Publishing a Contact address does not prove MX configuration, independent receive/reply, staffing, recovery or security/privacy mailbox ownership. Issues #281 and #522 remain open for that operational evidence. Issue #523 also requires its full search/provider/mail acceptance evidence before closure. Human E4, native copy review, legal/trademark facts, provider branch isolation, privacy/RUM and release-source decisions retain their existing boundaries. This read-back does not adopt the SGPS Core candidate or certify another model/harness.
