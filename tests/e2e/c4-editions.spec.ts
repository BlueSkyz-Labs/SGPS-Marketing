import { expect, test } from "@playwright/test";

const LANGS = ["en", "vi", "zh"] as const;
const EDITION = "trust-foundations";

test.describe("C4-B collected editions", () => {
  for (const lang of LANGS) {
    test(`/${lang}/editions/ lists the edition and nothing invented`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/editions/`);
      await expect(page.locator("h1")).toHaveCount(1);
      const index = page.locator("[data-edition-index]");
      await expect(index).toBeVisible();
      const items = index.locator("[data-edition]");
      await expect(items).toHaveCount(1);
      await expect(items.first()).toHaveAttribute("data-edition", EDITION);
      await expect(
        index.locator(`a[href="/${lang}/editions/${EDITION}/"]`),
      ).toBeVisible();
      // No engagement or social-proof surface may appear on an edition index.
      const text = (await index.innerText()).toLowerCase();
      for (const banned of [
        "views",
        "likes",
        "shares",
        "readers",
        "subscribers",
      ]) {
        expect(text, `index must not show ${banned}`).not.toContain(banned);
      }
    });

    test(`/${lang}/editions/${EDITION}/ renders sources and date`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/editions/${EDITION}/`);
      await expect(page.locator("h1")).toHaveCount(1);
      const story = page.locator(`[data-edition-story="${EDITION}"]`);
      await expect(story).toBeVisible();

      const sources = story.locator("[data-edition-source]");
      await expect(sources).toHaveCount(3);
      for (let index = 0; index < 3; index += 1) {
        const link = sources.nth(index).locator("a");
        await expect(link).toBeVisible();
        const href = await link.getAttribute("href");
        expect(href ?? "", "source must link somewhere canonical").not.toBe("");
      }
      await expect(story.locator("time")).toHaveAttribute(
        "datetime",
        /^\d{4}-\d{2}-\d{2}$/,
      );
    });

    test(`/${lang}/editions/ is complete without JavaScript`, async ({
      request,
    }) => {
      const indexHtml = await (await request.get(`/${lang}/editions/`)).text();
      expect(indexHtml).toContain("data-edition-index");
      expect(indexHtml).toContain(`/${lang}/editions/${EDITION}/`);
      const storyHtml = await (
        await request.get(`/${lang}/editions/${EDITION}/`)
      ).text();
      expect(storyHtml).toContain("data-edition-story");
      expect(storyHtml).toContain("data-edition-source");
    });

    test(`/${lang}/editions/ has valid localized alternates`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/editions/`);
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      expect(canonical ?? "").toContain(`/${lang}/editions/`);
      const alternates = await page
        .locator('link[rel="alternate"][hreflang]')
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("hreflang")),
        );
      expect(alternates).toEqual(
        expect.arrayContaining(["en", "vi", "zh-Hans", "x-default"]),
      );
    });
  }

  test("edition pages are reachable from the sitemap", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    // The sitemap is deliberately empty while the site URL is non-production
    // (truth guard), so assert the invariant only when it lists URLs at all.
    // The path list itself is proven by tests/architecture/c4-editions-routes.test.mjs.
    if (!xml.includes("<url>")) return;
    for (const lang of LANGS) {
      expect(xml, `sitemap must list /${lang}/editions/`).toContain(
        `/${lang}/editions/`,
      );
      expect(xml, `sitemap must list the ${lang} edition`).toContain(
        `/${lang}/editions/${EDITION}/`,
      );
    }
  });

  test("an edition stays readable in print", async ({ page }) => {
    await page.goto(`/en/editions/${EDITION}/`);
    await page.emulateMedia({ media: "print" });
    const story = page.locator(`[data-edition-story="${EDITION}"]`);
    await expect(story.locator("h1")).toBeVisible();
    await expect(story.locator("[data-edition-source]").first()).toBeVisible();
  });
});
