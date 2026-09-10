import { test, expect } from "@playwright/test";

test("language switcher navigates between en and vi", async ({ page }) => {
  await page.goto("/en/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("link", { name: "Tiếng Việt" }).click();
  await expect(page).toHaveURL(/\/vi\//);
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
});

test("hreflang links present on all pages", async ({ page }) => {
  await page.goto("/en/about/");
  await expect(page.locator('link[hreflang="en"]')).toBeVisible();
  await expect(page.locator('link[hreflang="vi"]')).toBeVisible();
  await expect(page.locator('link[hreflang="x-default"]')).toBeVisible();
});

test("x-default points to en", async ({ page }) => {
  await page.goto("/vi/about/");
  const xDefault = page.locator('link[hreflang="x-default"]');
  await expect(xDefault).toHaveAttribute("href", /\/en\//);
});
