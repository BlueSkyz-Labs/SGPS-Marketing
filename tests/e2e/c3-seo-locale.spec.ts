import { expect, test } from "@playwright/test";

/** C3-C W6: social previews must describe the actual published language. */
for (const [lang, htmlLang, og, alternate, skip] of [
  ["en", "en", "en_US", ["vi_VN", "zh_CN", "zh_TW"], "Skip to main content"],
  [
    "vi",
    "vi",
    "vi_VN",
    ["en_US", "zh_CN", "zh_TW"],
    "Chuyển đến nội dung chính",
  ],
  ["zh", "zh-Hans", "zh_CN", ["en_US", "vi_VN", "zh_TW"], "跳转到主要内容"],
  ["zh-hant", "zh-Hant", "zh_TW", ["en_US", "vi_VN", "zh_CN"], "跳到主要內容"],
] as const) {
  test(`${lang} page has its own social metadata and accessible skip link`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/about/`);
    await expect(page.locator("html")).toHaveAttribute("lang", htmlLang);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      "content",
      og,
    );
    const alternates = await page
      .locator('meta[property="og:locale:alternate"]')
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("content")),
      );
    expect(alternates).toEqual(alternate);
    await expect(page.locator(".skip-link")).toHaveText(skip);
    await expect(page.locator('link[hreflang="zh-Hans"]')).toHaveAttribute(
      "href",
      /\/zh\/about\//,
    );
    await expect(page.locator('link[hreflang="zh-Hant"]')).toHaveAttribute(
      "href",
      /\/zh-hant\/about\//,
    );
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
      "href",
      /\/en\/about\//,
    );
  });
}
