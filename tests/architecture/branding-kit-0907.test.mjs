import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import test from "node:test";

const V4_SHA256 =
  "9534d34ef91a039f59da916426f4ca465c142d743c0b263671e9d0411693b75d";

function sourceFiles(root) {
  return readdirSync(root).flatMap((name) => {
    const path = `${root}/${name}`;
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

test("Production v4 is checksum-verified and fully promoted to the web runtime", () => {
  const status = JSON.parse(
    readFileSync("brand/production-v4/STATUS.json", "utf8"),
  );

  assert.equal(status.canonicalKit, "BlueSkyzLabs_Brand_Kit_Production_v4");
  assert.equal(status.version, "v4");
  assert.equal(status.status, "FINAL_PRODUCTION_READY");
  assert.equal(status.archive.expectedSha256, V4_SHA256);
  assert.equal(status.archive.verifiedSha256, V4_SHA256);
  assert.equal(status.archive.importedIntoRepository, true);
  assert.equal(status.runtimePolicy.runtimeSource, "production-v4");
  assert.equal(status.runtimePolicy.legacyR4dMayRemainAsTemporaryRuntimeFallback, false);
  assert.equal(status.runtimePolicy.legacyR4dIsCanonical, false);
});

test("Production v4 web projection assets match their recorded source SHA-256", () => {
  assert.equal(existsSync("brand/production-v4/WEB_PROJECTION.json"), true);
  const projection = JSON.parse(
    readFileSync("brand/production-v4/WEB_PROJECTION.json", "utf8"),
  );

  assert.equal(projection.archiveSha256, V4_SHA256);
  assert.equal(projection.verification.packageVerifier, "PASS");
  assert.ok(projection.assets.length >= 18, "expected full web projection");

  for (const asset of projection.assets) {
    assert.equal(existsSync(asset.runtimePath), true, asset.runtimePath);
    const digest = createHash("sha256")
      .update(readFileSync(asset.runtimePath))
      .digest("hex");
    assert.equal(digest, asset.sha256, `${asset.runtimePath} sha256 mismatch`);
    assert.equal(asset.transform, "exact-copy");
  }
});

test("runtime source no longer references the superseded R4d public asset tree", () => {
  const brand = readFileSync("src/data/brand.ts", "utf8");
  assert.match(brand, /source:\s*"production-v4"/);
  assert.doesNotMatch(brand, /legacy-r4d-fallback/);
  assert.doesNotMatch(brand, /\/brand\/blueskyz\/r4d/);

  for (const path of sourceFiles("src")) {
    const source = readFileSync(path, "utf8");
    assert.doesNotMatch(
      source,
      /\/brand\/blueskyz\/r4d\//,
      `${path} must not bind to superseded R4d runtime assets`,
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

test("About integrates the BlueSkyz-led public identity without unsupported claims", () => {
  const about = readFileSync("src/pages/about.astro", "utf8");
  const story = readFileSync(
    "src/components/sections/BrandStory.astro",
    "utf8",
  );

  assert.match(about, /BrandStory/);
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
