import { expect, test } from "@playwright/test";

/**
 * Owner 2026-10-24 (O-04): Sổ Trọ shows one "App language" fact row, named
 * through Intl.DisplayNames in the page locale, and its SoftwareApplication
 * JSON-LD carries `inLanguage: ["vi"]`. A product without the field shows
 * no row.
 */
const EXPECTED = {
  en: ["App language", "Vietnamese"],
  vi: ["Ngôn ngữ ứng dụng", "Tiếng Việt"],
  zh: ["应用语言", "越南语"],
  "zh-hant": ["應用程式語言", "越南文"],
} as const;

for (const [lang, [label, value]] of Object.entries(EXPECTED)) {
  test(`${lang}: Sổ Trọ shows the app-language row and JSON-LD inLanguage`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/products/sotro/`);
    const row = page.locator("[data-app-language]");
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(label);
    await expect(row).toContainText(value);
    const ld = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const app = ld
      .map((text) => JSON.parse(text))
      .find((node) => node["@type"] === "SoftwareApplication");
    expect(app.inLanguage).toEqual(["vi"]);
  });
}

test("negative proof: a product without appLanguages shows no row", async ({
  page,
}) => {
  await page.goto("/en/products/sotam/");
  await expect(page.locator("[data-app-language]")).toHaveCount(0);
});
