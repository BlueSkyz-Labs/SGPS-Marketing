import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const V4_SHA256 =
  "9534d34ef91a039f59da916426f4ca465c142d743c0b263671e9d0411693b75d";

test("Production v4 is the canonical Branding 0907 source and R4d is superseded", () => {
  const status = JSON.parse(
    readFileSync("brand/production-v4/STATUS.json", "utf8"),
  );
  const legacyManifest = JSON.parse(
    readFileSync("public/brand/blueskyz/r4d/brand-manifest.json", "utf8"),
  );

  assert.equal(status.canonicalKit, "BlueSkyzLabs_Brand_Kit_Production_v4");
  assert.equal(status.version, "v4");
  assert.equal(status.status, "FINAL_PRODUCTION_READY");
  assert.equal(status.archive.expectedSha256, V4_SHA256);
  assert.equal(
    status.supersedes,
    "BlueSkyz_Identity_R4d_Production_Master_Candidate_v1.1",
  );
  assert.equal(status.runtimePolicy.legacyR4dIsCanonical, false);
  assert.equal(
    status.runtimePolicy.canonicalSource,
    "BlueSkyzLabs_Brand_Kit_Production_v4",
  );
  assert.equal(
    status.runtimePolicy.doNotReconstructOrApproximateMissingV4BinaryAssets,
    true,
  );

  const v4RuntimeExists = existsSync("public/brand/blueskyz/v4");
  assert.equal(status.archive.importedIntoRepository, v4RuntimeExists);

  // Legacy provenance remains truthful while R4d is only a temporary fallback.
  assert.equal(legacyManifest.canonicalMasterbrandPromoted, false);
  assert.equal(legacyManifest.status, "IDENTITY_PROTOTYPE_READY");
  assert.equal(legacyManifest.designState, "DESIGN_FREEZE_CANDIDATE");
});

test("runtime branding is routed through one migration adapter instead of component-level R4d paths", () => {
  assert.equal(
    existsSync("src/data/brand.ts"),
    true,
    "brand adapter must exist",
  );

  const brand = readFileSync("src/data/brand.ts", "utf8");
  assert.match(brand, /BlueSkyzLabs_Brand_Kit_Production_v4/);
  assert.match(brand, /legacy-r4d-fallback/);
  assert.match(brand, /\/brand\/blueskyz\/r4d/);

  for (const path of [
    "src/components/brand/BrandLockup.astro",
    "src/components/sections/BrandStory.astro",
    "src/layouts/BaseLayout.astro",
  ]) {
    const source = readFileSync(path, "utf8");
    assert.doesNotMatch(
      source,
      /\/brand\/blueskyz\/r4d/,
      `${path} must use the centralized brand adapter`,
    );
  }
});

test("approved Production v4 public identity is centralized", () => {
  const site = readFileSync("src/data/site.ts", "utf8");

  assert.match(site, /publicWebsite:\s*"https:\/\/blueskyzlabs\.com"/);
  assert.match(site, /founder:\s*\{/);
  assert.match(site, /name:\s*"Tony Nguyen"/);
  assert.match(site, /role:\s*"Founder & CEO"/);
  assert.match(site, /location:\s*\{/);
  assert.match(site, /locality:\s*"Ho Chi Minh City"/);
  assert.match(site, /country:\s*"Vietnam"/);
});

test("About integrates the BlueSkyz-led public identity without binding to a legacy visual asset", () => {
  const about = readFileSync("src/pages/about.astro", "utf8");

  assert.equal(
    existsSync("src/components/sections/BrandStory.astro"),
    true,
    "BrandStory.astro must exist",
  );
  assert.match(about, /BrandStory/);
  assert.doesNotMatch(about, /publishes when approved/i);

  const story = readFileSync(
    "src/components/sections/BrandStory.astro",
    "utf8",
  );
  assert.match(story, /BRAND_PRINCIPLES/);
  assert.match(story, /SITE\.founder/);
  assert.match(story, /SITE\.location/);
  assert.match(story, /SITE\.publicWebsite/);
  assert.doesNotMatch(story, /\bISO\b|\bSOC\b|bank-grade|military-grade/i);
});

test("homepage and footer consume the centralized founder and location identity", () => {
  const homeAbout = readFileSync(
    "src/components/sections/AboutBlueSkyz.astro",
    "utf8",
  );
  const footer = readFileSync("src/components/layout/Footer.astro", "utf8");

  assert.match(homeAbout, /SITE\.founder/);
  assert.match(homeAbout, /SITE\.location/);
  assert.match(homeAbout, /href="\/about\/"/);
  assert.doesNotMatch(homeAbout, /Tony Nguyen/);

  assert.match(footer, /SITE\.founder/);
  assert.match(footer, /SITE\.location/);
  assert.match(footer, /SITE\.publicWebsite/);
  assert.doesNotMatch(footer, /Tony Nguyen/);
});
