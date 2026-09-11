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

test("homepage keeps the C1.1 customer order landmarks", async ({ page }) => {
  await page.goto("/en/");
  // Featured shelf is omitted while the public registry is empty.
  await expect(
    page.getByRole("heading", { name: "Featured products" }),
  ).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "One house" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trust" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "About BlueSkyz" }),
  ).toBeVisible();
});
