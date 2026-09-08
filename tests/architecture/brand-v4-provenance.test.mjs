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
