# v12 convergence: Showcase story, customer-led content and SEO

**Date:** 2026-10-05 (GMT+7).

**Plan:** `docs/superpowers/plans/2026-10-04-v12-showcase-story-content-seo.md`.

**Final main:** `6518532` (after #510).

**Verdict:** the v12 acceptance criteria are met on main, with one recorded performance delta (§3) and two narrow SEO-lane coverage notes (§4). No approved executable gap remains. The residual items are Owner or external steps (§5).

## 1. What landed

| PR   | Scope                                                                    | Merge commit |
| ---- | ------------------------------------------------------------------------ | ------------ |
| #507 | Calm-chrome round (W1)                                                   | `70062f0`    |
| #508 | S2: customer-led copy, linked `@id` JSON-LD, SEO guards                  | `94c31b2`    |
| #509 | S1: Feature Story (one month as a landlord, sticky stage)                | `5c4e1d0`    |
| #510 | S2 remainder: record-owned `applicationCategory` (`BusinessApplication`) | `6518532`    |

Each PR merged at its exact head with Quality Gates, Browser Assurance (chromium, firefox, webkit, mobile-chromium), Visual regression gate and Lighthouse CI green on that head.

**Visual baselines:** #508 re-baselined 16 snapshots from CI run `37233266238`. Every diff band was reviewed and maps to S2 copy. The attempt-vs-retry differences were the known sub-threshold Menu button noise (≤2 channels, ~80 px). #509 needed no re-baseline because the story sits below the captured frames.

## 2. Acceptance criteria

### S2: content and SEO

| Criterion                                    | Result | Evidence                                                                                                                                                                                                                                              |
| -------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gates green                                  | PASS   | CI on each exact head (§1)                                                                                                                                                                                                                            |
| Lighthouse SEO 100 on 4 routes               | PASS   | Local run, production-origin build (`PUBLIC_SITE_URL=https://blueskyzlabs.com`). Routes `/en/`, `/vi/`, `/en/products/sotro/`, `/vi/products/sotro/` all score SEO 100, accessibility 100 and best practices 100 (Lighthouse 13.4.1, desktop preset). |
| Title and description unique in every locale | PASS   | `tests/architecture/seo-v12-structured-data.test.mjs` (built pages) and `tests/e2e/seo-v12-routes.spec.ts` (served pages)                                                                                                                             |
| JSON-LD built only from registry fields      | PASS   | The same guards. `applicationCategory` must equal the record value and is present only when declared. Negative proofs cover forbidden keys, a foreign category, a dropped category and a literal in the page call.                                    |
| VI and EN copy signed off                    | PASS   | Orchestrator review during #508. zh and zh-hant stay `NOT VERIFIED (native review pending)`.                                                                                                                                                          |

### S1: Feature Story

| Criterion                                          | Result         | Evidence                                                                                                                                                                                                                                                              |
| -------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gates green, client JS budget unchanged            | PASS           | CI on `87a40d6`; the client budget gate is part of Quality Gates                                                                                                                                                                                                      |
| Screens and captions only from the registry        | PASS           | `tests/architecture/feature-story.test.mjs`, which includes the negative proof for an unknown screen id                                                                                                                                                               |
| Screenshot review                                  | PASS (partial) | Orchestrator, at 1440 light and 390 dark on a local build. The sticky stage swaps to the active chapter. All 6 images load on scroll. Mobile shows inline screens. 1440 dark and 390 light were covered only by the CI visual matrix, which does not reach the story. |
| Lighthouse on the product route no worse than main | See §3         | A/B below                                                                                                                                                                                                                                                             |

## 3. Product route performance: A/B

**Method:**

- **A:** `94c31b2`, before #509.
- **B:** `5c4e1d0`, after #509.
- Both are production-origin builds served locally.
- Lighthouse 13.4.1 desktop preset, 3 runs per route, medians.

| Build | Route                 | Perf | A11y | BP  | SEO | LCP    | CLS | TBT | Bytes   |
| ----- | --------------------- | ---- | ---- | --- | --- | ------ | --- | --- | ------- |
| A     | `/vi/products/sotro/` | 100  | 100  | 100 | 100 | 703 ms | 0   | 0   | 346 KiB |
| B     | `/vi/products/sotro/` | 99   | 100  | 100 | 100 | 784 ms | 0   | 0   | 484 KiB |
| A     | `/en/products/sotro/` | 99   | 100  | 100 | 100 | 768 ms | 0   | 0   | 435 KiB |
| B     | `/en/products/sotro/` | 99   | 100  | 100 | 100 | 784 ms | 0   | 0   | 494 KiB |

**Reading:**

- The added bytes are the five story screens (`op-0*-480.webp`, about 128 KiB in total). They are `loading="lazy"` and fetched at Low priority: Chrome's lazy-load distance reaches the story from the first viewport.
- CLS and TBT stay at 0.
- The performance score moves by at most 1 point, which is within run-to-run variance.
- LCP grows by 16 ms (EN) to 81 ms (VI).

**CI:** the mobile Lighthouse lane, which includes `/vi/products/sotro/`, and the Experience performance budget (SGPS-DEC-2026-025) passed on the #509 head `87a40d6` and on the #510 head `77f9ba5`.

**Classification:** no score regression beyond noise, plus a measurable LCP and bytes cost that the content itself explains. Recorded, not hidden. If a later round tightens LCP, the lever is to load chapters 2 to 5 nearer to view, not to remove content.

## 4. SEO lane coverage (CI)

CI does enforce SEO. The Lighthouse CI job ends with a dedicated SEO lane, `node scripts/run-lighthouse-seo.mjs`. That lane:

- uses `lighthouserc.seo.json`;
- builds against the production origin `https://blueskyzlabs.com`;
- runs at least 3 times on the mobile gate routes `/en/`, `/vi/`, `/en/products/` and `/vi/products/sotro/`;
- asserts `categories:seo` ≥ 0.95, plus `is-crawlable`, `canonical`, `hreflang`, `meta-description`, `document-title` and `http-status-code`, all as **errors**;
- is guarded by `tests/architecture/lighthouse-seo-lane.test.mjs`.

It passed on the exact heads of #509 and #510. The `lighthouserc.json` desktop lane (`/`, SEO `warn`) is not the SEO authority.

Two notes, neither a v12 gap:

1. **Threshold:** the lane's floor is 0.95, while v12's target was 100. The 100 is evidenced by the local production-origin runs in §2, not enforced by CI.
2. **Routes:** `/en/products/sotro/` is not among the lane's routes; `/vi/products/sotro/` is. The local runs in §2 cover the EN page at 100.

Raising the floor to 1.0 or adding the EN product route would change `lighthouserc.mobile.json` or `lighthouserc.seo.json`, which are protected paths. That needs an Owner decision and is not proposed as v12 work.

## 5. Residual (Owner or external)

- Lift Cloudflare Access, which starts the T3 production smoke.
- Human E4.
- Native zh and zh-hant review.
- RUM provider.
- #488 legal facts.
- Enable "Automatically delete head branches". The agent proxy cannot delete branches.

## ENVIRONMENT BOOTSTRAP & TEST EXECUTION

**Environment:**

- Claude Code cloud container.
- Node v22.22.2. The repo wants ≥ 24.20.0; the engine warning was accepted for local gates, and CI uses the pinned Node.
- pnpm 11.25.0.
- Chromium 1194 at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, passed through `CHROME_PATH` for Lighthouse.

**Commands:**

- `pnpm test:architecture` and `pnpm typecheck`.
- `PUBLIC_SITE_URL=https://blueskyzlabs.com pnpm build`.
- Lighthouse CLI from the repo's devDependency, serving `dist` with `python3 -m http.server`.

**Limitations:**

- These are local Lighthouse numbers, not production RUM or field data.
- They are not proof of deployed production behaviour, which waits on Cloudflare Access.
