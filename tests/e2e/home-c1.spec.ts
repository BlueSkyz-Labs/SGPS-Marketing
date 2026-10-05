import { expect, test } from "@playwright/test";
import { hasPublicProducts } from "./product-helpers.ts";

test("homepage explains BlueSkyz and rejects old positioning", async ({
  page,
}) => {
  await page.goto("/en/");
  // Experience v6 S2: the brand promise in the H1, the flagship directly
  // below it, the brand tagline once in the footer, one primary action plus one quiet link in the hero.
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    hasPublicProducts
      ? /We build intelligent products/i
      : /Intelligence\.\s*Elevated\./i,
  );
  await expect(page.getByRole("contentinfo")).toContainText(
    /Intelligence\.\s*Elevated\.\s*Impact\./i,
  );
  await expect(page.locator("[data-hero-primary]")).toBeVisible();
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
  // The product act is present and honest:
  await expect(
    page.getByRole("heading", {
      name: hasPublicProducts ? "Also in development" : "Featured products",
    }),
  ).toBeVisible();
  if (hasPublicProducts) {
    await expect(page.locator("[data-product-card]").first()).toBeVisible();
  } else {
    await expect(page.locator("[data-product-card]")).toHaveCount(0);
  }
  await expect(page.locator("[data-trust-band]")).toBeVisible();
  // Removed in S1: One house word band, About block, closing action band.
  for (const name of [
    "One house",
    "About BlueSkyz",
    "Start with what you need",
  ]) {
    await expect(page.getByRole("heading", { level: 2, name })).toHaveCount(0);
  }
});
