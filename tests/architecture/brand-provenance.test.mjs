import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const m = JSON.parse(
  readFileSync("public/brand/blueskyz/r4d/brand-manifest.json", "utf8"),
);

test("R4d kit projection preserves candidate provenance", () => {
  assert.equal(m.assetId, "BLUESKYZ-MASTERBRAND-R4D");
  assert.equal(m.assetVersion, "1.1.0");
  assert.equal(m.canonicalName, "BlueSkyz Labs");
  assert.equal(m.status, "IDENTITY_PROTOTYPE_READY");
  assert.equal(m.designState, "DESIGN_FREEZE_CANDIDATE");
  assert.equal(m.canonicalMasterbrandPromoted, false);
  assert.equal(
    m.kitPackage,
    "BlueSkyz_Identity_R4d_Production_Master_Candidate_v1.1",
  );
  assert.equal(m.runtimeFontDependencyForWordmark, "NONE_VECTOR_OUTLINES");
  assert.equal(existsSync(m.kitPath), true);
});

test("R4d production masters match brand-manifest digests", () => {
  const files = {
    "symbol_mono_ink.svg": m.fileSha256.symbol_mono_ink,
    "micro_mark_ink.svg": m.fileSha256.micro_mark_ink,
    "lockup_horizontal_dark.svg": m.fileSha256.lockup_horizontal_dark,
    "lockup_horizontal_light.svg": m.fileSha256.lockup_horizontal_light,
    "brand_tokens.json": m.fileSha256.brand_tokens,
  };
  for (const [name, expected] of Object.entries(files)) {
    const path = `public/brand/blueskyz/r4d/${name}`;
    assert.equal(existsSync(path), true, `${path} must exist`);
    const digest = createHash("sha256")
      .update(readFileSync(path, "utf8").replaceAll("\r\n", "\n"))
      .digest("hex");
    assert.equal(digest, expected, `${name} sha256 mismatch`);
    assert.match(expected, /^[0-9a-f]{64}$/);
  }
});

test("header and footer use R4d outlined horizontal lockups", () => {
  const lockup = readFileSync("src/components/brand/BrandLockup.astro", "utf8");
  assert.match(lockup, /\/brand\/blueskyz\/r4d\/lockup_horizontal_dark\.svg/);
  assert.match(lockup, /\/brand\/blueskyz\/r4d\/lockup_horizontal_light\.svg/);
  assert.doesNotMatch(lockup, /SITE\.name/);
  for (const path of [
    "src/components/layout/Header.astro",
    "src/components/layout/Footer.astro",
  ]) {
    assert.match(
      readFileSync(path, "utf8"),
      /BrandLockup/,
      `${path} must render BrandLockup`,
    );
  }
});
