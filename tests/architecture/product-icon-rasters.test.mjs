import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * BK-31: the `icon.png` masters of the four non-Sổ Trọ products are the kit v4
 * `03_ICONS/03_PRODUCT_ICONS/<product>_512.png` rasters (which render the same
 * drawing as the kit SVG). The pre-fix masters were the `REFERENCE_*_extracted`
 * drawings with heavy padding. Sổ Trọ is the Owner-approved red-book deviation
 * and is guarded by sotro-redbook-icon.test.mjs, so it is not covered here.
 */
const KIT = "brand/blueskyz-production-v4/03_ICONS/03_PRODUCT_ICONS";
const PRODUCTS = {
  apexagent: {
    old: "6ce12607a5c64c9e8747679e3b66979f3008ac161bdd684886715379b46bcbbb",
  },
  fluentarc: {
    old: "39c294bda7e12d01557f1ddd053fd8b4f68bc1650950f507ca2be73ab3e7772a",
  },
  sotam: {
    old: "59ddc1970a43d952e0ab6c52aeb0d83133273b45e21b974ba8f2408c874568e7",
  },
  vungtaylai: {
    old: "d57d7ed7b3693d2e72b97f38f9da03865a0c25b9714ec78544879be1bd5d96fa",
  },
};
const sha = (buf) => createHash("sha256").update(buf).digest("hex");

function dims(buf) {
  assert.equal(buf.subarray(1, 4).toString(), "PNG");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function checkMaster(slug, master, kit) {
  const { old } = PRODUCTS[slug];
  assert.deepEqual(dims(master), { width: 512, height: 512 }, `${slug} size`);
  assert.deepEqual(dims(master), dims(kit), `${slug} matches kit size`);
  assert.notEqual(sha(master), old, `${slug} is still the old artwork`);
  assert.equal(sha(master), sha(kit), `${slug} must equal the kit raster`);
}

test("BK-31 product masters are the kit v4 rasters, not the old artwork", () => {
  for (const slug of Object.keys(PRODUCTS)) {
    checkMaster(
      slug,
      readFileSync(`public/products/${slug}/icon.png`),
      readFileSync(`${KIT}/${slug}_512.png`),
    );
  }
});

test("negative proof: old artwork or a wrong size turns the check RED", () => {
  const slug = "sotam";
  const kit = readFileSync(`${KIT}/${slug}_512.png`);
  const current = readFileSync(`public/products/${slug}/icon.png`);
  // A master that hashes to the pre-fix artwork is rejected.
  const realOld = PRODUCTS[slug].old;
  PRODUCTS[slug].old = sha(current);
  assert.throws(() => checkMaster(slug, current, kit), /old artwork/);
  PRODUCTS[slug].old = realOld;
  // A different drawing at the right size is rejected.
  const other = readFileSync(`${KIT}/apexagent_512.png`);
  assert.throws(() => checkMaster(slug, other, kit), /kit raster/);
  // A wrong-sized master is rejected.
  const small = Buffer.from(current);
  small.writeUInt32BE(256, 16);
  assert.throws(() => checkMaster(slug, small, kit));
});
