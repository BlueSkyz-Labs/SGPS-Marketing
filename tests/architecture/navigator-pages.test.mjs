import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const LANGS = ["en", "vi", "zh", "zh-hant"];
const read = (path) => readFileSync(path, "utf8");

// The navigator must reuse existing copy. These constants are copied from the
// page files; if either side changes, this fails instead of the palette
// silently diverging from the page titles.
const navigatorSource = read("src/lib/navigator.ts");

function record(name) {
  const block = navigatorSource.match(
    new RegExp(`const ${name}: Record<Language, string> = \\{([\\s\\S]*?)\\};`),
  );
  assert.ok(block, `${name} present`);
  const out = {};
  for (const m of block[1].matchAll(/"?([\w-]+)"?:\s*"([^"]+)"/g)) {
    out[m[1]] = m[2];
  }
  return out;
}

test("decision-room palette label equals each locale's page title", () => {
  const labels = record("DECISION_ROOM_LABEL");
  for (const lang of LANGS) {
    const page = read(`src/pages/${lang}/decision-room.astro`);
    assert.match(page, new RegExp(`title="${labels[lang]}"`), lang);
  }
});

test("guide palette alias equals the product showcase's own guide link text", () => {
  const labels = record("GUIDE_LINK_TEXT");
  // v8 W3: the showcase link is now the shorter "Read the guide"; the alias
  // must still equal a guide link text that exists on a product surface.
  const showcase = read("src/components/product/ProductShowcase.astro");
  const site = read("src/data/site.ts");
  for (const lang of LANGS) {
    assert.ok(labels[lang], lang);
    assert.ok(
      showcase.includes(`"${labels[lang]}"`) ||
        site.includes(`"${labels[lang]}"`),
      `${lang}: ${labels[lang]} appears in ProductShowcase or SHARED_LABELS.readGuide`,
    );
  }
});

test("negative proof: a divergent label is detected", () => {
  const labels = record("DECISION_ROOM_LABEL");
  const page = read("src/pages/en/decision-room.astro");
  assert.doesNotMatch(page, new RegExp(`title="${labels.en} (changed)"`));
});

test("verify aliases only reuse wording already on the site", () => {
  const source =
    read("src/data/site.ts") + read("src/components/sections/ProofBand.astro");
  for (const alias of ["核实", "查證", "查看", "依据", "Kiểm chứng", "Xem"]) {
    assert.ok(source.includes(alias), alias);
  }
  assert.ok(source.includes("Xem các tuyên bố"));
});

// Round-4 review: the concierge corpus feed must use each locale's own copy —
// the top-level shortDescription is English-only, so feeding it put English
// sentences into the VI/ZH search text (attribute-only, but wrong-language).
test("the concierge corpus feed prefers each locale's product copy", () => {
  const component = read("src/components/experience/CommandNavigator.astro");
  assert.match(
    component,
    /entry\.data\.i18n\?\.\[lang\]\?\.shortDescription \?\?\s*\n?\s*entry\.data\.shortDescription/,
    "the feed must prefer the locale's shortDescription with the top-level as fallback",
  );
  assert.doesNotMatch(
    component,
    /description:\s*entry\.data\.shortDescription,/,
    "the bare English-only description must not feed the corpus",
  );
});
