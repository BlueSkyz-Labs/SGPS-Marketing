import { expect, test } from "@playwright/test";

test("homepage explains BlueSkyz and rejects old positioning", async ({
  page,
}) => {
  await page.goto("/en/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /Intelligence\.\s*Elevated\./i,
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /Impact\./i,
  );
  await expect(
    page.getByRole("link", { name: /About BlueSkyz/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByText(/Quiet luxury|digital atelier|Savile Row|Selected works/i),
  ).toHaveCount(0);
});

test("320px homepage has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/en/");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("homepage keeps the C2 act landmarks", async ({ page }) => {
  await page.goto("/en/");
  // The product act is present and honest while the public registry is empty:
  // the heading explains the act, no product card is invented.
  await expect(
    page.getByRole("heading", { name: "Featured products" }),
  ).toBeVisible();
  await expect(page.locator("[data-product-card]")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { level: 2, name: "One house" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Trust" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "About BlueSkyz" }),
  ).toBeVisible();
});
