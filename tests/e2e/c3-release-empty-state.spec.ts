import { expect, test } from "@playwright/test";

test("does not show release chrome while the public product registry is empty", async ({
  page,
}) => {
  for (const route of ["/en/", "/en/products/", "/vi/", "/vi/products/"]) {
    await page.goto(route);
    await expect(page.locator("[data-product-card]")).toHaveCount(0);
    await expect(page.locator("[data-release-signal]")).toHaveCount(0);
  }
});
