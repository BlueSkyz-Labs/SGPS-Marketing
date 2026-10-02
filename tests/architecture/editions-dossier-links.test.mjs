import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { getFooterLinks, getNav } from "../../src/data/site.ts";

const LANGS = ["en", "vi", "zh", "zh-hant"];

function pageTitle(lang, route) {
  const source = readFileSync(`src/pages/${lang}/${route}/index.astro`, "utf8");
  return source.match(/^\s+title="([^"]+)"/m)?.[1];
}

for (const lang of LANGS) {
  test(`${lang}: footer links /editions and /dossier with the pages' own titles`, () => {
    const footer = getFooterLinks(lang);
    for (const route of ["editions", "dossier"]) {
      const link = footer.find((item) => item.href === `/${lang}/${route}/`);
      assert.ok(link, `${lang} footer links ${route}`);
      assert.equal(
        link.label,
        pageTitle(lang, route),
        `${lang} ${route} label reuses the page title`,
      );
    }
  });

  test(`${lang}: main nav stays unchanged (no editions/dossier)`, () => {
    const hrefs = getNav(lang).map((item) => item.href);
    assert.equal(
      hrefs.some((h) => /editions|dossier/.test(h)),
      false,
    );
  });
}

test("negative proof: a footer without the links is detected", () => {
  for (const lang of LANGS) {
    const withoutEditions = getFooterLinks(lang).filter(
      (item) => !item.href.includes("/editions/"),
    );
    assert.equal(
      withoutEditions.some((item) => item.href === `/${lang}/editions/`),
      false,
    );
    assert.notEqual(withoutEditions.length, getFooterLinks(lang).length);
  }
});
