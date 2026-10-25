/**
 * Owner 2026-10-24 (O-04): `appLanguages` is an optional BCP 47 list on the
 * product record. It renders one "App language" fact row (names from
 * Intl.DisplayNames in the page locale) and becomes `inLanguage` in the
 * product SoftwareApplication JSON-LD. Absent field: no row, page-language
 * `inLanguage` as before.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { appLanguageNames } from "../../src/lib/app-languages.ts";
import { productSchema } from "../../src/lib/product-schema.ts";
import { productJsonLd } from "../../src/lib/seo.ts";

const synthetic = (extra = {}) => ({
  slug: "sotro",
  name: "Fixture Sổ Trọ",
  shortDescription: "Synthetic record for the language fact.",
  lifecycle: "development",
  availability: "preview",
  publicLabel: "In development",
  audience: ["individual"],
  jobs: ["Review a synthetic record"],
  capabilities: ["Synthetic scope A", "Synthetic scope B"],
  platforms: ["web"],
  primaryAction: {
    type: "preview",
    label: "Preview",
    href: "https://blueskyzlabs.com/en/products/sotro/",
  },
  proof: { publicUrl: "https://blueskyzlabs.com/en/products/sotro/" },
  endorsement: "A BlueSkyz Labs product",
  featuredTier: "hero",
  displayOrder: 1,
  public: true,
  sourceRevision: "abcdef1",
  lastReviewedAt: "2026-09-27",
  ...extra,
});

test("schema accepts canonical codes and rejects malformed or duplicate ones", () => {
  assert.equal(productSchema.safeParse(synthetic()).success, true);
  assert.equal(
    productSchema.safeParse(synthetic({ appLanguages: ["vi", "en"] })).success,
    true,
  );
  for (const bad of [
    [],
    ["VI"],
    ["vi_VN"],
    ["not a tag"],
    ["vi", "vi"],
    [""],
  ]) {
    assert.equal(
      productSchema.safeParse(synthetic({ appLanguages: bad })).success,
      false,
      JSON.stringify(bad),
    );
  }
});

test("names come from Intl.DisplayNames in the page locale", () => {
  assert.equal(appLanguageNames(["vi"], "en"), "Vietnamese");
  assert.equal(appLanguageNames(["vi"], "vi"), "Tiếng Việt");
  assert.equal(appLanguageNames(["vi"], "zh"), "越南语");
  assert.equal(appLanguageNames(["vi"], "zh-hant"), "越南文");
  assert.equal(appLanguageNames(undefined, "en"), null);
  assert.equal(appLanguageNames([], "en"), null);
});

test("JSON-LD inLanguage is the code array only when the record has it", () => {
  const base = {
    name: "x",
    description: "d",
    slug: "sotro",
    platforms: ["web"],
  };
  const withLang = productJsonLd(
    { ...base, appLanguages: ["vi"] },
    "https://blueskyzlabs.com",
    "en",
  );
  assert.deepEqual(withLang.inLanguage, ["vi"]);
  const without = productJsonLd(base, "https://blueskyzlabs.com", "en");
  assert.equal(without.inLanguage, "en");
});

test("Sổ Trọ declares appLanguages: [vi] and every locale page renders the row", () => {
  const record = readFileSync("src/content/products/sotro.yaml", "utf8");
  assert.match(record, /^appLanguages:\n {2}- vi$/m);
  for (const lang of ["en", "vi", "zh", "zh-hant"]) {
    const page = readFileSync(
      `src/pages/${lang}/products/[slug].astro`,
      "utf8",
    );
    assert.match(page, /appLanguageNames\(data\.appLanguages, lang\)/, lang);
    assert.match(page, /appLanguages: data\.appLanguages/, lang);
    assert.match(page, /data-app-language/, lang);
  }
});

test("negative proof: a record without appLanguages renders no row and no array", () => {
  assert.equal(appLanguageNames(undefined, "vi"), null);
  const out = productJsonLd(
    { name: "x", description: "d", slug: "s", platforms: ["web"] },
    "https://blueskyzlabs.com",
    "vi",
  );
  assert.equal(Array.isArray(out.inLanguage), false);
});
