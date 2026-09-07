import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("approved Branding Kit 0907 public identity is centralized without promoting R4d provenance", () => {
  const site = readFileSync("src/data/site.ts", "utf8");
  const manifest = JSON.parse(
    readFileSync("public/brand/blueskyz/r4d/brand-manifest.json", "utf8"),
  );

  assert.match(site, /publicWebsite:\s*"https:\/\/blueskyzlabs\.com"/);
  assert.match(site, /founder:\s*\{/);
  assert.match(site, /name:\s*"Tony Nguyen"/);
  assert.match(site, /role:\s*"Founder & CEO"/);
  assert.match(site, /location:\s*\{/);
  assert.match(site, /locality:\s*"Ho Chi Minh City"/);
  assert.match(site, /country:\s*"Vietnam"/);

  assert.equal(manifest.canonicalMasterbrandPromoted, false);
  assert.equal(manifest.status, "IDENTITY_PROTOTYPE_READY");
  assert.equal(manifest.designState, "DESIGN_FREEZE_CANDIDATE");
});

test("About integrates a BlueSkyz-led verified R4d brand story", () => {
  const about = readFileSync("src/pages/about.astro", "utf8");

  assert.equal(
    existsSync("src/components/sections/BrandStory.astro"),
    true,
    "BrandStory.astro must exist",
  );
  assert.match(about, /BrandStory/);
  assert.doesNotMatch(about, /publishes when approved/i);

  const story = readFileSync("src/components/sections/BrandStory.astro", "utf8");
  assert.match(story, /symbol_material_expression\.svg/);
  assert.match(story, /BRAND_PRINCIPLES/);
  assert.match(story, /SITE\.founder/);
  assert.match(story, /SITE\.location/);
  assert.match(story, /SITE\.publicWebsite/);
  assert.doesNotMatch(story, /\bISO\b|\bSOC\b|bank-grade|military-grade/i);
});
