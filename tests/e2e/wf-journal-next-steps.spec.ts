import { expect, test } from "@playwright/test";

/**
 * Audit IX-01: the Journal index and a post end in the shared Next steps
 * band. Each page has exactly one band, with Product status, Verify and
 * Contact links of its own locale.
 */
const PAGES = [
  "/en/journal/",
  "/en/journal/thue-cho-thue-tro-2026/",
  "/vi/journal/",
  "/zh/journal/",
  "/zh-hant/journal/",
] as const;

for (const path of PAGES) {
  test(`${path} ends in the Next steps band`, async ({ page }) => {
    await page.goto(path);
    const lang = path.split("/")[1];
    const bar = page.locator("[data-journey-bar]");
    await expect(bar).toHaveCount(1);
    for (const segment of ["products", "verify", "contact"]) {
      await expect(bar.locator(`a[href="/${lang}/${segment}/"]`)).toHaveCount(
        1,
      );
    }
  });
}

test("negative proof: a route outside the map has no band", async ({
  page,
}) => {
  await page.goto("/en/privacy/");
  await expect(page.locator("[data-journey-bar]")).toHaveCount(0);
});
