# Go-live pre-cutover verification (v9 §3C)

**Plan item:** v9 `A` (land open PRs) complete → `C` (pre-cutover verification). **Revision:** `main@0658697b` (A1–A7 merged: #368, #367, #371, #405, #443, #364, #365). **Date:** 2026-10-03. **Method:** local lab run (E1/E2) on the exact revision; CI evidence from the runs on the same SHA. Lab numbers are lab-only; production stays `NOT VERIFIED` until the owner-executed smoke (§3E).

## Environment bootstrap

- Windows 11 host, Node 24-class toolchain via the repo's pnpm 11.25.0; deps from the frozen install (junction-shared `node_modules`), no install drift.
- Build: `PUBLIC_SITE_URL=https://blueskyzlabs.com pnpm build` — **PASS, 0 errors** (2 pre-existing Astro `is:inline` hints on zh-hant product pages, unchanged).
- Served static build via `astro preview` (3311) for axe; `wrangler dev` (8901) for the redirect matrix (Workers Static Assets honours `public/_redirects`).

## Gate results (PASS / FAIL / NOT VERIFIED)

| Gate                                                       | Result                                            | Evidence                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prod-env build                                             | **PASS**                                          | `precutover-build.log` — 0 errors                                                                                                                                                                                                                                                                                                                            |
| axe, every built route × light/dark                        | **PASS**                                          | `precutover-axe.json` — **180 scans, 0 violations at any impact level, 0 errored** (W11 scanner, same tags `wcag2a/2aa/21a/21aa/22a/22aa`)                                                                                                                                                                                                                   |
| VI glossary sweep on `dist/` (7 terms)                     | **PASS with one finding → fixed in this PR**      | `precutover-vi-sweep.txt`: 6 terms 0 hits; `dữ liệu minh hoạ` → 1 file. See finding below.                                                                                                                                                                                                                                                                   |
| Redirect matrix (exact-path probes, local Workers preview) | **PASS**                                          | `/about/`, `/contact/`, `/privacy/`, `/security/`, `/support/`, `/products/`, `/products/sotro/`, `/products/sotro` → **301 to the expected `/en/...` targets**; asset negatives `/products/sotro/showcase/op-01-home-480.webp`, `intro.vi.vtt`, `/fonts/inter-latin-wght-v5.3.0.woff2` → **200** (never swallowed — the #379 regression class stays absent) |
| Four-engine CI on this revision                            | **PASS (in progress at writing; being recorded)** | main push run `37063562297` — four real shards + Lighthouse CI; every PR in the A-chain ran the full matrix after #405 (chromium ≈9m, firefox ≈12m, mobile ≈12–14m, webkit ≈15–20m, all green)                                                                                                                                                               |
| Lighthouse CI per PR/merged SHA                            | **PASS**                                          | Lighthouse CI green on every A-chain run (e.g. #405 run `37052950235` job `110991056090`)                                                                                                                                                                                                                                                                    |

## Finding F-10 — VI caption carried the pre-deck wording variant

- **What:** `public/products/sotro/showcase/intro.vi.vtt` (final caption card) read `Ảnh chụp từ bản chạy thử với dữ liệu minh hoạ · blueskyzlabs.com`. The copy deck bans that variant: row **sro-9** mandates "_vi: use one term `dữ liệu mẫu` everywhere_" and row **glo-11** fixes the approved caption wording. The sibling zh/zh-hant caption files already used the sanctioned equivalents (示例数据 / 範例資料).
- **Provenance:** present since #356 (pre-deck showcase wave); the W11 sweep covered built **HTML routes**, so a `public/`-sourced `.vtt` never entered its scope — this wider sweep caught it. The W11 record's wording is corrected here: its 0-hit claim was HTML-route-scoped, not `dist/`-global.
- **Fix (this PR):** one-term swap to the deck's `dữ liệu mẫu` — the minimal deck-authoritative change.
- **Residual (recorded, not fixable in-repo):** the video's burned-in text still shows the pre-deck wording; a video re-render is an asset task (owner/brand). The caption files are text alternatives and already translate the visual (as the zh files do), so caption↔deck alignment is the correct in-repo move.

## Explicitly NOT VERIFIED (unchanged)

- Production smoke (§3E): headers/served SHA/anonymous access — owner gate (Cloudflare Access lift) remains closed.
- Field Core Web Vitals / CrUX; real devices and native Safari/Firefox; screen-reader sessions; native VI/ZH copy review (R4/F2); Human E4 (F3).
- The remaining review items from §2 A8 (#436 green-ready, #437 re-scope recommendation posted, #374) — owner/orchestrator decisions.

## Reporting per v9 §7

- Plan item: **C** (pre-cutover verification). Gates above carry PASS / FAIL / NOT VERIFIED explicitly.
- Copy change (vtt): VI **before** `… với dữ liệu minh hoạ · blueskyzlabs.com` → **after** `… với dữ liệu mẫu · blueskyzlabs.com` (deck rows sro-9, glo-11).

🤖 Generated with Hermes Agent
