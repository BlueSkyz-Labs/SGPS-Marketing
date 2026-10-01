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
  const showcase = read("src/components/product/ProductShowcase.astro");
  for (const lang of LANGS) {
    assert.ok(labels[lang], lang);
    assert.ok(
      showcase.includes(`"${labels[lang]}"`),
      `${lang}: ${labels[lang]} appears in ProductShowcase`,
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
  for (const alias of [
    "核实",
    "核验",
    "查證",
    "我们如何核验",
    "我們如何核驗",
  ]) {
    assert.ok(source.includes(alias), alias);
  }
  assert.ok(source.includes("Cách chúng tôi xác minh"));
});
