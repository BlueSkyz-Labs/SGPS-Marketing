import { expect, test } from "@playwright/test";

test("reduced motion keeps hero content immediately visible", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/en/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Contact|Explore products/i }).first(),
  ).toBeVisible();
  await context.close();
});

test("default motion still exposes readable hero content", async ({ page }) => {
  await page.goto("/en/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const opacity = await page
    .getByRole("heading", { level: 1 })
    .evaluate((el) => getComputedStyle(el).opacity);
  expect(Number(opacity)).toBeGreaterThan(0.9);
});
