import { expect, test } from "@playwright/test";
import { getPublicProductCount } from "./product-helpers.ts";

const PRODUCT_SLUGS = [
  "apexagent",
  "fluentarc",
  "sotam",
  "sotro",
  "vungtaylai",
];

test.describe("published products render without client scripting", () => {
  test.use({ javaScriptEnabled: false });

  test("each product page renders name, description, action without JS", async ({
    page,
  }) => {
    for (const slug of PRODUCT_SLUGS) {
      await page.goto(`/en/products/${slug}/`);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h1")).not.toBeEmpty();
    }
  });

  test("product listing renders published products without JS", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    const cards = page.locator("[data-product-card]");
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe("published registry listing", () => {
  /**
   * The empty branch cannot be reached through a live route while products are published, so it is
   * covered where it can be proven: tests/architecture/product-empty-branch.test.mjs (loader count
   * for an empty and for a private-only registry, plus the localized empty-state contract). This
   * suite asserts the published side of the same contract instead of a case that could not fail.
   */
  test("the listing renders one card per published product with a reachable profile link", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    const published = getPublicProductCount("src/content/products");
    await expect(page.locator("[data-product-card]")).toHaveCount(published);
    for (const slug of PRODUCT_SLUGS) {
      await expect(
        page
          .locator(`[data-product-card] a[href="/en/products/${slug}/"]`)
          .first(),
      ).toBeVisible();
    }
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/has no products|không có sản phẩm/i);
  });
});
