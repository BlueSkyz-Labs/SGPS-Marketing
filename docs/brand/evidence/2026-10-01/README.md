# Evidence — brand sync, Sổ Trọ red-book icon — 2026-10-01

Class: E1/E2 (local static build, headless Chromium). Not Human E4, not served-revision proof.

**Environment:** Linux; Node v24.19.0 (repo asks for >=24.20.0, the closest installed; pnpm 11.25.0 warns only); Chromium build 1194 at `/opt/pw-browsers/chromium-1194` driven through `@playwright/test` 1.63.0 with `executablePath`; site built with `pnpm build` and served by `astro preview --port 4329` (stopped afterwards). Only Chromium was available: Firefox/WebKit/mobile-Chromium projects of the repo's E4 matrix and Lighthouse are NOT VERIFIED here.

**Screenshots:** `{home,products,sotro}-{1440,390,320}-{light,dark}.jpg` are full-page captures of `/en/`, `/en/products/` and `/en/products/sotro/` (JPEG q50, reduced motion, lazy media scrolled in). Regenerate with `node docs/brand/evidence/2026-10-01/capture.mjs` (set `CHROMIUM` if needed). The Sổ Trọ intro video poster on `/en/products/sotro/` still shows the old blue-house card: conformance row BK-35.

**Gate results** are listed in the commit report; the conformance table is `../../BRAND_KIT_CONFORMANCE_2026-10-01.md`.
