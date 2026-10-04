import { expect, test } from "@playwright/test";

// Vietnamese labels stay in sentence case (cross-subset kerning gap, e.g.
// "GIAI ĐOẠN HIỆN T ẠI"); Latin-script locales keep the uppercase eyebrow.
for (const [lang, expected] of [
  ["vi", "none"],
  ["en", "uppercase"],
] as const) {
  test(`${lang}: ladder term text-transform is ${expected}`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/products/sotro/`);
    const term = page.locator(".product-ladder__term").first();
    await expect(term).toBeVisible();
    expect(
      await term.evaluate((el) => getComputedStyle(el).textTransform),
    ).toBe(expected);
  });
}
