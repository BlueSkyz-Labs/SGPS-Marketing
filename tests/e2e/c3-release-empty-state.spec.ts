import { expect, test } from "@playwright/test";
import { hasPublicProducts } from "./product-helpers.ts";

test("does not show release chrome while the public product registry is empty", async ({
  page,
}) => {
  test.skip(
    hasPublicProducts,
    "Public products are published; empty registry release test only applies to empty registry",
  );
  for (const route of ["/en/", "/en/products/", "/vi/", "/vi/products/"]) {
    await page.goto(route);
    await expect(page.locator("[data-product-card]")).toHaveCount(0);
    await expect(page.locator("[data-release-signal]")).toHaveCount(0);
  }
});

test("does not show release chrome when no release source is published", async ({
  page,
}) => {
  for (const route of ["/en/", "/en/products/", "/vi/", "/vi/products/"]) {
    await page.goto(route);
    await expect(page.locator("[data-release-signal]")).toHaveCount(0);
  }
});
