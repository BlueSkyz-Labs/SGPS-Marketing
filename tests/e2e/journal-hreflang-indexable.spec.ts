import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

// SEO: hreflang must not point at a noindex page. A journal index is noindex
// until its language has a published post, so an indexable journal index
// names only the languages that have one. Expected languages come from the
// content files, so a first zh post widens the set without a test edit.
const HREFLANG = { en: "en", vi: "vi", zh: "zh-Hans", "zh-hant": "zh-Hant" };
const DIR = "src/content/journal";

function publishedLanguages(): string[] {
  const langs = new Set<string>();
  for (const file of readdirSync(DIR).filter((f) => f.endsWith(".md"))) {
    const front = readFileSync(join(DIR, file), "utf8").split("---")[1] ?? "";
    const lang = /^lang:\s*"?([a-z-]+)"?\s*$/m.exec(front)?.[1];
    if (lang && !/^draft:\s*true\s*$/m.test(front)) langs.add(lang);
  }
  return [...langs];
}

const published = publishedLanguages();
const expected = Object.entries(HREFLANG)
  .filter(([lang]) => published.includes(lang))
  .map(([, tag]) => tag)
  .sort();

test.describe("journal index hreflang", () => {
  test("at least one journal language is published", () => {
    expect(published.length).toBeGreaterThan(0);
  });

  for (const lang of published) {
    test(`${lang}: alternates name only indexable journal indexes`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/journal/`);
      const tags = await page
        .locator('head link[rel="alternate"][hreflang]')
        .evaluateAll((links) =>
          links
            .map((link) => link.getAttribute("hreflang") ?? "")
            .filter((tag) => tag !== "x-default"),
        );
      expect(tags.sort()).toEqual(expected);
      await expect(
        page.locator('head link[rel="alternate"][hreflang="x-default"]'),
      ).toHaveCount(published.includes("en") ? 1 : 0);
    });
  }

  test("other routes keep all four alternates", async ({ page }) => {
    await page.goto("/en/about/");
    await expect(
      page.locator(
        'head link[rel="alternate"][hreflang]:not([hreflang="x-default"])',
      ),
    ).toHaveCount(4);
  });
});
