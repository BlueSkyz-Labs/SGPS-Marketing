# BlueSkyz Labs Production v4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the owner-supplied BlueSkyz Labs Production Brand Kit v4.0.0 to the Astro website and redeploy the verified result to `blueskyzlabs.com`.

**Architecture:** Keep the existing Astro static architecture and evidence-gated product registry. Store the complete v4 kit under `brand/` for provenance, project only web/runtime assets into `public/`, centralize v4 values in semantic CSS tokens, and wire the supplied hero, PWA, OG, logo, principle, and product assets through focused components.

**Tech Stack:** Astro 7, Tailwind CSS 4, TypeScript, Node test runner, Playwright/axe, Lighthouse, Cloudflare Workers Builds.

**Spec:** `docs/superpowers/specs/2026-09-08-blueskyz-production-v4-design.md`

## Global Constraints

- Canonical origin is `https://blueskyzlabs.com`.
- The supplied `BlueSkyzLabs_Brand_Kit_Production_v4.zip` is the only production asset source.
- `08_REFERENCE_MOCKUPS/` and `10_CONCEPT_REFERENCE/` are never production identity sources.
- Product registry, product proof, emails, and unsupported claims remain empty.
- UI colors use Ink `#0B1020`, Porcelain `#F7F8FA`, Cobalt `#2564FF`, Slate 700 `#334155`, and Slate 650 `#475569`.
- Slate 500 `#64748B` is decorative/large-only, never normal body text on Porcelain.
- Production identity uses flat vectors; Prismatic Hero raster is limited to large hero/campaign surfaces.
- Changes ship through branch → PR → source assurance → merge → Workers Builds.

---

### Task 1: Import and verify the v4 source kit

**Files:**

- Create: `brand/blueskyz-production-v4/**` from the supplied ZIP
- Use: `brand/blueskyz-production-v4/00_START_HERE/SHA256SUMS.txt` from the supplied kit
- Create: `tests/architecture/brand-v4-provenance.test.mjs`

**Interfaces:**

- Produces the complete, traceable source tree and a deterministic list of
  source files used by later public projections.

- [ ] **Step 1: Extract the supplied ZIP into a temporary directory.**

Run:

```powershell
$kitZip = 'C:\Users\thinh\Downloads\Thinh Drive\OneDrive\09_AI Product Projects\BlueSkyzLabs_Brand_Kit_Production_v4.zip'
$kitTemp = 'tmp\brand-kit-v4-source'
if (Test-Path -LiteralPath $kitTemp) { Remove-Item -LiteralPath $kitTemp -Recurse -Force }
Expand-Archive -LiteralPath $kitZip -DestinationPath $kitTemp
```

Expected: `tmp\brand-kit-v4-source\BlueSkyzLabs_Brand_Kit_Production_v4` exists and contains `00_START_HERE` through `10_CONCEPT_REFERENCE`.

- [ ] **Step 2: Write the failing provenance test.**

Create `tests/architecture/brand-v4-provenance.test.mjs`:

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = "brand/blueskyz-production-v4";

test("v4 source kit keeps production standards and version metadata", () => {
  const version = readFileSync(`${root}/00_START_HERE/VERSION.txt`, "utf8");
  const standards = readFileSync(
    `${root}/00_START_HERE/BRAND_STANDARDS.md`,
    "utf8",
  );
  assert.match(version, /Version:\s*4\.0\.0/);
  assert.match(version, /Production candidate/);
  assert.match(standards, /Ink #0B1020/);
  assert.match(standards, /Cobalt #2564FF/);
  assert.match(standards, /Slate 650 #475569/);
});

test("v4 source kit contains canonical web and product masters", () => {
  for (const path of [
    "02_LOGOS/01_VECTOR_SVG/FULL_LOCKUPS/blueskyzlabs_horizontal_flat_dark.svg",
    "02_LOGOS/01_VECTOR_SVG/FULL_LOCKUPS/blueskyzlabs_horizontal_reverse_white.svg",
    "03_ICONS/01_FAVICON_PWA/favicon.svg",
    "03_ICONS/01_FAVICON_PWA/site.webmanifest",
    "03_ICONS/02_BRAND_PRINCIPLES/intelligence.svg",
    "03_ICONS/03_PRODUCT_ICONS/apexagent.svg",
    "04_DIGITAL/01_WEBSITE/website_hero_1920x1080.png",
    "04_DIGITAL/01_WEBSITE/open_graph_1200x630.png",
    "06_PRODUCT_BRANDS/01_LOCKUPS_SVG/apexagent_endorsed_lockup_dark.svg",
    "07_DESIGN_TOKENS/tokens.css",
    "09_QA_AUDIT/v4/verification_snapshot.json",
  ]) {
    assert.equal(existsSync(`${root}/${path}`), true, path);
  }
});
```

- [ ] **Step 3: Run the test to verify it fails before the import.**

Run: `node --test tests/architecture/brand-v4-provenance.test.mjs`

Expected: FAIL because `brand/blueskyz-production-v4` does not exist yet.

- [x] **Step 4: Copy the complete source kit and preserve the supplied SHA256 sums.**

Copy the extracted kit directory to `brand/blueskyz-production-v4`, preserving
all production, documentation, QA, and reference folders. The kit's supplied
`00_START_HERE/SHA256SUMS.txt` remains the source checksum manifest; the
runtime provenance test verifies canonical files against it.

- [ ] **Step 5: Run the test to verify it passes.**

Run: `node --test tests/architecture/brand-v4-provenance.test.mjs`

Expected: PASS, 2 tests, 0 failures.

- [ ] **Step 6: Commit the source-kit import.**

```bash
git add brand/blueskyz-production-v4 tests/architecture/brand-v4-provenance.test.mjs
git commit -m "feat(brand): import BlueSkyz Production v4 source kit"
```

### Task 2: Project v4 web assets and semantic tokens

**Files:**

- Create: `public/brand/blueskyz/v4/**`
- Create: `public/social/og-default.png`
- Create: `public/site.webmanifest`
- Create: `public/browserconfig.xml`
- Create: `public/safari-pinned-tab.svg`
- Modify: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `tests/architecture/c1-tokens.test.mjs`
- Modify: `tests/architecture/brand-v4-provenance.test.mjs`

**Interfaces:**

- Produces stable URL paths under `/brand/blueskyz/v4/` for all UI assets.
- Preserves existing semantic tokens used by components while mapping them to
  v4 values.

- [ ] **Step 1: Extend tests with v4 runtime paths and values.**

Add assertions for `#2564ff`, `/brand/blueskyz/v4/`, `/favicon.svg`,
`/safari-pinned-tab.svg`, `/browserconfig.xml`, and v4 manifest metadata.

- [ ] **Step 2: Run the focused tests and confirm RED.**

Run: `node --test tests/architecture/c1-tokens.test.mjs tests/architecture/brand-v4-provenance.test.mjs`

Expected: FAIL on the old `#2568ff` token and old `/r4d/` paths.

- [ ] **Step 3: Copy only web/runtime projections into `public/`.**

Copy canonical flat logos, v4 favicon/PWA family, principle SVGs, product
icons/lockups, v4 tokens, website hero PNG/WebP/AVIF, and v4 Open Graph PNG
into deterministic public paths. Do not copy `08_REFERENCE_MOCKUPS` or
`10_CONCEPT_REFERENCE` into `public/`.

- [ ] **Step 4: Map v4 tokens into the semantic CSS layer.**

Update `src/styles/global.css` so brand primitives and semantic tokens match
the guideline values, add the v4 typography scale/spacing/motion variables
needed by the refreshed layout, and retain the existing contrast-safe muted
text comment and reduced-motion behavior.

- [ ] **Step 5: Update document head and PWA metadata.**

Update `src/layouts/BaseLayout.astro` to use the v4 SVG favicon, ICO fallback,
opaque Apple Touch icon, Safari pinned tab, v4 manifest, theme color, and the
v4 OG asset. Keep canonical/robots/JSON-LD behavior unchanged except for the
already-live `blueskyzlabs.com` origin.

- [ ] **Step 6: Run focused tests and format.**

Run: `node --test tests/architecture/c1-tokens.test.mjs tests/architecture/brand-v4-provenance.test.mjs`
Run: `pnpm prettier --check src/styles/global.css src/layouts/BaseLayout.astro tests/architecture/c1-tokens.test.mjs tests/architecture/brand-v4-provenance.test.mjs`

Expected: all focused tests PASS and Prettier reports all files checked.

- [ ] **Step 7: Commit the token and asset projection.**

```bash
git add public src/styles/global.css src/layouts/BaseLayout.astro tests/architecture/c1-tokens.test.mjs tests/architecture/brand-v4-provenance.test.mjs
git commit -m "feat(brand): project v4 web tokens and runtime assets"
```

### Task 3: Rebuild the homepage around the v4 visual system

**Files:**

- Modify: `src/components/brand/BrandLockup.astro`
- Modify: `src/components/sections/Hero.astro`
- Modify: `src/components/sections/OneHouse.astro`
- Modify: `src/components/sections/Trust.astro`
- Modify: `src/data/site.ts`
- Create: `src/data/brand-assets.ts`
- Create: `tests/architecture/brand-v4-experience.test.mjs`
- Modify: `tests/architecture/ui-inventory.test.mjs`

**Interfaces:**

- `src/data/brand-assets.ts` exports typed maps for principle icons and the
  five endorsed product lockups/icons.
- `Hero.astro` renders the supplied v4 website hero artwork responsively with
  an accessible decorative/meaningful alt decision.
- `OneHouse.astro` renders the four v4 principles with their supplied icons.

- [ ] **Step 1: Write the failing experience tests.**

Create assertions that the hero uses the v4 website hero asset and v4 logo,
the four principles use v4 icon paths, the official one-line description is
present, and product data remains empty when no evidence-backed entries exist.

- [ ] **Step 2: Run the experience tests to verify RED.**

Run: `node --test tests/architecture/brand-v4-experience.test.mjs`

Expected: FAIL because the current hero and principle sections still point to
R4d v1.1 assets and do not render the v4 asset map.

- [ ] **Step 3: Implement typed v4 asset maps.**

Add `src/data/brand-assets.ts` with exact keys and paths for `intelligence`,
`elevation`, `trust`, `impact`, `apexagent`, `sotam`, `sotro`, `fluentarc`,
and `vungtaylai`. Keep the map data-only and do not make it a product claim.

- [ ] **Step 4: Update lockup and homepage components.**

Use v4 canonical flat/reverse SVG lockups with the guideline minimum digital
width. Update Hero to use the v4 website hero image as the visual media layer
with a responsive `<picture>` fallback chain. Update OneHouse to render the
four supplied principle SVGs. Preserve evidence-safe CTA behavior and keep
`FeaturedProducts` hidden for an empty registry.

- [ ] **Step 5: Update brand copy to the v4 library.**

Use the approved one-line description and secondary line where appropriate;
retain the existing calm, evidence-safe copy and do not add unverified
performance or product claims.

- [ ] **Step 6: Run the focused experience tests and browser shell.**

Run: `node --test tests/architecture/brand-v4-experience.test.mjs tests/architecture/ui-inventory.test.mjs`
Run: `pnpm build`

Expected: all focused tests pass, Astro build exits 0, and generated pages
contain the v4 logo/hero/principle asset URLs.

- [ ] **Step 7: Commit the homepage integration.**

```bash
git add src/components src/data src/pages tests/architecture/brand-v4-experience.test.mjs tests/architecture/ui-inventory.test.mjs
git commit -m "feat(brand): apply v4 homepage experience"
```

### Task 4: Run full verification and prepare the release

**Files:**

- Modify: `docs/evidence/2026-09-08-blueSkyz-production-v4.md`
- Modify: `docs/superpowers/plans/2026-09-08-blueskyz-production-v4-implementation.md`

- [ ] **Step 1: Run the complete source gate.**

Run, in order:

```powershell
pnpm test:architecture
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm check:client-budget
pnpm check:static-links
```

Expected: every command exits 0 with no warnings that indicate a new defect.

- [ ] **Step 2: Run browser/accessibility assurance.**

Run: `pnpm exec playwright test --project=chromium`
Run: `pnpm lighthouse`

Expected: Chromium/axe and Lighthouse gates pass without weakening assertions.

- [ ] **Step 3: Verify the supplied v4 QA package.**

Run the kit verifier from
`brand/blueskyz-production-v4/09_QA_AUDIT/v4/verify_brand_kit.py` with the
bundled Python runtime and record its PASS result plus the source manifest
digest in `docs/evidence/2026-09-08-blueSkyz-production-v4.md`.

- [ ] **Step 4: Record the implementation evidence.**

Document exact source SHA, v4 version, imported asset count, public projection
paths, test counts, and the unchanged non-goals (empty registry/emails,
external legal/print gates).

- [ ] **Step 5: Review the complete diff and commit evidence.**

Run: `git diff --check; git status --short; git diff --stat main...HEAD`

Expected: only the v4 source import, runtime projection, homepage wiring,
tests, and evidence/plan files are changed.

```bash
git add docs/evidence/2026-09-08-blueSkyz-production-v4.md docs/superpowers/plans/2026-09-08-blueskyz-production-v4-implementation.md
git commit -m "docs: record BlueSkyz Production v4 verification"
```

### Task 5: Source assurance, merge, Cloudflare deploy, and live smoke

**Files:**

- No further product files; release state is external and read back.

- [ ] **Step 1: Push the branch and open a PR.**

```bash
git push -u origin brand/production-v4-integration-20260908
gh pr create --base main --head brand/production-v4-integration-20260908 --title "feat: apply BlueSkyz Production Brand Kit v4" --body-file docs/evidence/2026-09-08-blueSkyz-production-v4.md
```

- [ ] **Step 2: Wait for exact-SHA Source Assurance.**

Read the PR checks and require `Quality Gates`, `Browser Assurance`, and
Workers Builds to pass on the exact PR head. Do not merge a stale SHA.

- [ ] **Step 3: Merge only after checks pass.**

Use the PR API with the expected head SHA and squash merge. Read back the
merge SHA and main branch status.

- [ ] **Step 4: Confirm Cloudflare production build.**

Read the `blueskyz-web` Workers Build for the merge SHA and require a success
outcome with `pnpm wrangler deploy`. Read back `PUBLIC_SITE_URL` as
`https://blueskyzlabs.com`.

- [ ] **Step 5: Smoke-test the live site.**

Verify `https://blueskyzlabs.com/`, `https://www.blueskyzlabs.com/`,
`/robots.txt`, `/sitemap.xml`, `/favicon.svg`, `/site.webmanifest`, the v4 OG
asset, canonical URL, and a missing route. Confirm no provider-owned hostname
is canonical.

- [ ] **Step 6: Stop and report exact evidence.**

Report the merged SHA, Cloudflare build UUID, live URLs, gate results, and any
remaining external gates without claiming legal/print/social completion.
