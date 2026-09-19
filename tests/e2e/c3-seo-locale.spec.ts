import { expect, test } from "@playwright/test";

/** C3-C W6: social previews must describe the actual published language. */
for (const [lang, og, alternate, skip] of [
  ["en", "en_US", ["vi_VN", "zh_CN"], "Skip to main content"],
  ["vi", "vi_VN", ["en_US", "zh_CN"], "Chuyển đến nội dung chính"],
  ["zh", "zh_CN", ["en_US", "vi_VN"], "跳转到主要内容"],
] as const) {
  test(`${lang} page has its own social metadata and accessible skip link`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/about/`);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      "content",
      og,
    );
    const alternates = await page
      .locator('meta[property="og:locale:alternate"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("content")));
    expect(alternates).toEqual(alternate);
    await expect(page.locator(".skip-link")).toHaveText(skip);
    await expect(page.locator('link[hreflang="zh-Hans"]')).toHaveAttribute(
      "href",
      /\\/zh\\/about\\//,
    );
  });
}
