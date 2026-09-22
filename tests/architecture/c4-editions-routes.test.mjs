import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { EDITIONS } from "../../src/data/editions.ts";

const LANGS = ["en", "vi", "zh"];
const SEO = "src/lib/seo.ts";
const SITEMAP = "src/pages/sitemap.xml.ts";

test("C4-B edition routes: every language ships an index and a story route", () => {
  for (const lang of LANGS) {
    assert.ok(
      existsSync(`src/pages/${lang}/editions/index.astro`),
      `${lang} needs an editions index route`,
    );
    assert.ok(
      existsSync(`src/pages/${lang}/editions/[id].astro`),
      `${lang} needs an editions story route`,
    );
  }
});

test("C4-B edition routes: the public path list includes every editions index", () => {
  const seo = readFileSync(SEO, "utf8");
  for (const lang of LANGS) {
    assert.ok(
      seo.includes(`"/${lang}/editions/"`),
      `PUBLIC_STATIC_PATHS must list /${lang}/editions/`,
    );
  }
});

test("C4-B edition routes: the sitemap enumerates editions from authored data", () => {
  const sitemap = readFileSync(SITEMAP, "utf8");
  assert.ok(
    sitemap.includes("EDITIONS"),
    "sitemap must read the authored editions",
  );
  assert.match(
    sitemap,
    /\$\{lang\}\/editions\/\$\{edition\.id\}\//,
    "story URLs must derive from edition ids, never be hard-coded",
  );
  for (const edition of EDITIONS) {
    assert.ok(
      !sitemap.includes(`/editions/${edition.id}/`),
      "sitemap must not hard-code a specific edition id",
    );
  }
});

test("C4-B edition routes: story routes are generated from the authored editions", () => {
  for (const lang of LANGS) {
    const story = readFileSync(`src/pages/${lang}/editions/[id].astro`, "utf8");
    assert.ok(
      story.includes("getStaticPaths"),
      `${lang} story route needs getStaticPaths`,
    );
    assert.ok(
      story.includes("EDITIONS"),
      `${lang} story route must enumerate EDITIONS`,
    );
    assert.ok(
      story.includes(`resolveEdition(edition, "${lang}")`),
      `${lang} story route must resolve for its own language`,
    );
  }
});

test("C4-B edition routes: index pages are localized, not copies", () => {
  const seen = new Set();
  for (const lang of LANGS) {
    const index = readFileSync(
      `src/pages/${lang}/editions/index.astro`,
      "utf8",
    );
    assert.ok(
      index.includes(`lang="${lang}"`),
      `${lang} index must pass its own lang`,
    );
    assert.ok(
      index.includes(`path="/${lang}/editions/"`),
      `${lang} index must set its path`,
    );
    const heading = index.match(/title="([^"]+)"/)?.[1] ?? "";
    assert.ok(heading.length > 0, `${lang} index needs a heading`);
    assert.ok(
      !seen.has(heading),
      `${lang} heading must be authored, not copied`,
    );
    seen.add(heading);
  }
});
