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

test("every product profile page renders audience through the shared helper", () => {
  for (const p of [
    "src/pages/products/[slug].astro",
    "src/pages/en/products/[slug].astro",
    "src/pages/vi/products/[slug].astro",
    "src/pages/zh/products/[slug].astro",
    "src/pages/zh-hant/products/[slug].astro",
  ]) {
    const s = readFileSync(p, "utf8");
    assert.match(s, /audienceText\(/, p);
    assert.doesNotMatch(s, /AUDIENCE_LABELS\[a\]/, p);
  }
});

test("zh-Hant audience row label is 適用對象, not 適用物件", () => {
  const s = readFileSync("src/pages/zh-hant/products/[slug].astro", "utf8");
  assert.ok(s.includes("適用對象"));
  assert.ok(!s.includes("適用物件"));
});

test("negative proof: the legacy professional/business audience is detected", () => {
  const legacy = registry("sotro").replace(
    "audience:\n  - individual\n",
    "audience:\n  - professional\n  - business\n",
  );
  assert.notDeepEqual(audienceOf(legacy), ["individual"]);
});
