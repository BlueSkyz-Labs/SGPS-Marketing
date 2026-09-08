import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("v4 hero uses the supplied website artwork and flat lockup", () => {
  const hero = readFileSync("src/components/sections/Hero.astro", "utf8");
  const lockup = readFileSync("src/components/brand/BrandLockup.astro", "utf8");
  const site = readFileSync("src/data/site.ts", "utf8");
  assert.match(hero, /brandAssets\.hero\.(png|webp|avif)/);
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

test("v4 principle icons are rendered without publishing product claims", () => {
  const house = readFileSync("src/components/sections/OneHouse.astro", "utf8");
  const assets = readFileSync("src/data/brand-assets.ts", "utf8");
  for (const name of ["intelligence", "elevation", "trust", "impact"]) {
    assert.match(house, new RegExp(`brandAssets\.principles\.${name}`));
    assert.match(assets, new RegExp(`${name}:`));
  }
});

test("v4 copy library description is the public brand proposition", () => {
  const site = readFileSync("src/data/site.ts", "utf8");
  assert.match(
    site,
    /We build intelligent products that empower people and elevate the way work gets done\./,
  );
  assert.match(site, /A higher perspective builds a brighter tomorrow\./);
});
