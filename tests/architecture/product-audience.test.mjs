import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/** Owner decision F1 (2026-10-01): Sổ Trọ's audience is individual landlords. */
const registry = (slug) =>
  readFileSync(`src/content/products/${slug}.yaml`, "utf8");
const audienceOf = (yaml) =>
  yaml.match(/^audience:\n((?:  - .+\n)+)/m)?.[1].match(/[a-z]+/g) ?? [];

const labelSource = readFileSync("src/lib/product-audience.ts", "utf8");

test("Sổ Trọ registry audience is individual only", () => {
  assert.deepEqual(audienceOf(registry("sotro")), ["individual"]);
});

test("Sổ Tâm audience is unchanged", () => {
  assert.deepEqual(audienceOf(registry("sotam")), [
    "individual",
    "professional",
  ]);
});

test("Sổ Trọ audience label reads Landlords in every locale", () => {
  for (const [key, value] of [
    ["en", "Landlords"],
    ["vi", "Chủ trọ"],
    ["zh", "房东"],
    ['"zh-hant"', "房東"],
  ]) {
    assert.ok(
      labelSource.includes(`${key}: "${value}"`),
      `sotro ${key} label ${value}`,
    );
  }
});

// v8 W3 (OG-3): the visible Audience row is dropped from the locale profile
// pages; the derived label conflicted with the record's `audience`. The legacy
// redirect page keeps the shared helper.
const LOCALE_PROFILES = ["en", "vi", "zh", "zh-hant"].map(
  (lang) => `src/pages/${lang}/products/[slug].astro`,
);
const rendersAudience = (s) =>
  /audienceText\(|AUDIENCE_LABELS|適用對象|適用物件/.test(s);

test("locale product profile pages render no audience row", () => {
  for (const p of LOCALE_PROFILES) {
    assert.equal(rendersAudience(readFileSync(p, "utf8")), false, p);
  }
  const legacy = readFileSync("src/pages/products/[slug].astro", "utf8");
  assert.match(legacy, /audienceText\(/);
  assert.doesNotMatch(legacy, /AUDIENCE_LABELS\[a\]/);
});

test("negative proof: a visible audience row is detected", () => {
  const s = readFileSync(LOCALE_PROFILES[0], "utf8");
  assert.equal(rendersAudience(`${s}\n{audienceText(a, b, c, "en")}`), true);
});

test("negative proof: the legacy professional/business audience is detected", () => {
  const legacy = registry("sotro").replace(
    "audience:\n  - individual\n",
    "audience:\n  - professional\n  - business\n",
  );
  assert.notDeepEqual(audienceOf(legacy), ["individual"]);
});
