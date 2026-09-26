import { expect, test } from "@playwright/test";
import { hasPublicProducts } from "./product-helpers.ts";

test("products index is honest when the public registry is empty", async ({
  page,
}) => {
  test.skip(
    hasPublicProducts,
    "Public products are published; empty index test only applies to empty registry",
  );
  await page.goto("/en/products/");
  await expect(
    page.getByRole("heading", { level: 1, name: /Products/i }),
  ).toBeVisible();
  await expect(page.locator("[data-product-card]")).toHaveCount(0);
  await expect(page.locator("[data-proof-first-empty-state]")).toBeVisible();
  const body = await page.locator("body").innerText();
  expect(body).not.toMatch(/docs\/evidence/i);
  expect(body).not.toMatch(/PUBLIC_[A-Z_]+/);
});

test("products index renders product cards when products are public", async ({
  page,
}) => {
  test.skip(!hasPublicProducts, "Requires published products");
  await page.goto("/en/products/");
  await expect(
    page.getByRole("heading", { level: 1, name: /Products/i }),
  ).toBeVisible();
  await expect(page.locator("[data-product-card]").first()).toBeVisible();
  const count = await page.locator("[data-product-card]").count();
  expect(count).toBeGreaterThanOrEqual(1);
});
