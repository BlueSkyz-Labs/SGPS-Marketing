import { test, expect } from "@playwright/test";

test("language switcher navigates between en and vi", async ({ page }) => {
  await page.goto("/en/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("link", { name: "Tiếng Việt" }).first().click();
  await expect(page).toHaveURL(/\/vi\//);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("blueskyz.ui.language")))
    .toBe("vi");
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
});

test("language switcher renders in footer on all viewports", async ({
  page,
}) => {
  await page.goto("/en/");
  const footer = page.locator("footer");
  await expect(footer.getByRole("link", { name: "Tiếng Việt" })).toBeAttached();
  await expect(footer.getByRole("link", { name: "English" })).toBeAttached();
});

test("hreflang links present on all pages", async ({ page }) => {
  await page.goto("/en/about/");
  await expect(page.locator('link[hreflang="en"]')).toBeAttached();
  await expect(page.locator('link[hreflang="vi"]')).toBeAttached();
  await expect(page.locator('link[hreflang="x-default"]')).toBeAttached();
});

test("x-default points to en", async ({ page }) => {
  await page.goto("/vi/about/");
  const xDefault = page.locator('link[hreflang="x-default"]');
  await expect(xDefault).toHaveAttribute("href", /\/en\//);
});

test("root gateway respects the returning user's explicit saved language", async ({
  page,
}) => {
  await page.goto("/en/");
  await page.evaluate(() => localStorage.setItem("blueskyz.ui.language", "vi"));
  await page.goto("/");
  await expect(page).toHaveURL(/\/vi\/$/);
});

test("localized URLs stay stable instead of geo/browser redirecting", async ({
  page,
}) => {
  await page.goto("/en/about/");
  await expect(page).toHaveURL(/\/en\/about\/$/);
  await page.goto("/vi/about/");
  await expect(page).toHaveURL(/\/vi\/about\/$/);
});
