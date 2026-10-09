/**
 * i18n route parity (mechanics audit 2026-10-07).
 *
 * Every static page in the `pages` content collection must exist in all four
 * locales. A page added to only 3 of 4 locales would otherwise ship silently:
 * routes are static per-locale files, so the missing locale gets a 404 while
 * hreflang still advertises the locale. The hreflang contract only asserts
 * `>= 7` paths for en/vi and an exact zh<->zh-hant mirror, which does not
 * catch a 3-of-4 drift.
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const LOCALES = ["en", "vi", "zh", "zh-hant"];

test("every pages-collection entry exists in all four locales", () => {
  const pages = new Map();
  for (const lang of LOCALES) {
    const dir = join("src", "content", "pages", lang);
    assert.ok(existsSync(dir), `missing locale dir: ${dir}`);
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".yaml")) continue;
      if (!pages.has(file)) pages.set(file, []);
      pages.get(file).push(lang);
    }
  }
  assert.ok(pages.size > 0, "no pages found in the collection");
  const incomplete = [...pages.entries()].filter(
    ([, langs]) => langs.length < 4,
  );
  assert.deepEqual(
    incomplete.map(([file]) => file),
    [],
    `pages missing in some locale: ${JSON.stringify(incomplete)}`,
  );
});
