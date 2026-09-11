import { expect, test } from "@playwright/test";

test("products index is honest when the public registry is empty", async ({
  page,
}) => {
  await page.goto("/en/products/");
  await expect(
    page.getByRole("heading", { level: 1, name: /Products/i }),
  ).toBeVisible();
  await expect(page.locator("[data-product-card]")).toHaveCount(0);
  await expect(
    page.getByText(/No public products are published yet/i),
  ).toBeVisible();
  const body = await page.locator("body").innerText();
  expect(body).not.toMatch(/docs\/evidence/i);
  expect(body).not.toMatch(/PUBLIC_[A-Z_]+/);
});
