import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("v4 hero uses the supplied website artwork and flat lockup", () => {
  const hero = readFileSync("src/components/sections/Hero.astro", "utf8");
  const lockup = readFileSync("src/components/brand/BrandLockup.astro", "utf8");
  const site = readFileSync("src/data/site.ts", "utf8");
  // C2 (approved design §9 W1 + plan Task 5) transforms the hero from a framed
  // brand-art card into an integrated Horizon field, so the brand raster is no
  // longer required IN the hero. Brand fidelity still means the v4 lockup, the
  // ink plane and the tagline contract — and the removed framed card must not
  // come back.
  assert.match(hero, /BrandLockup/);
  assert.match(hero, /HorizonField/);
  assert.match(hero, /hero-plane--ink/);
  assert.doesNotMatch(hero, /hero-art-frame|brandAssets\.hero/);
  assert.match(site, /taglineLead: "Intelligence\. Elevated\."/);
  assert.match(site, /taglineAccent: "Impact\."/);
  assert.match(
    lockup,
    /\/brand\/blueskyz\/v4\/logos\/horizontal-flat-light\.svg/,
  );
  assert.match(
    lockup,
    /\/brand\/blueskyz\/v4\/logos\/horizontal-reverse-white\.svg/,
  );
});

test("v4 principle icons remain available while C2 home uses the editorial interlude", () => {
  // The reusable S+ matrix remains intact for any surface that still needs the
  // operating-model detail, but C2 Task 10 deliberately removes the homepage
  // dependency on that equal-card treatment in favor of an editorial interlude.
  const matrix = readFileSync(
    "src/components/experience/OneHouseMatrix.astro",
    "utf8",
  );
  const assets = readFileSync("src/data/brand-assets.ts", "utf8");
  for (const name of ["intelligence", "elevation", "trust", "impact"]) {
    assert.ok(
      matrix.includes("brandAssets.principles." + name),
      "matrix must render the " + name + " principle icon",
    );
    assert.match(assets, new RegExp(name + ":"));
  }

  const house = readFileSync("src/components/sections/OneHouse.astro", "utf8");
  assert.doesNotMatch(house, /OneHouseMatrix/);
  assert.match(house, /data-one-house-editorial/);
  assert.match(house, /data-one-house-concept/);
});

test("v4 copy library description is the public brand proposition", () => {
  const site = readFileSync("src/data/site.ts", "utf8");
  assert.match(
    site,
    /We build intelligent products that empower people and elevate the way work gets done\./,
  );
  assert.match(site, /A higher perspective builds a brighter tomorrow\./);
});
