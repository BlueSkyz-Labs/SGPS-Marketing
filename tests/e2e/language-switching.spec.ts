import { test, expect } from "@playwright/test";

test("language switcher navigates between en and vi", async ({ page }) => {
  await page.goto("/en/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("link", { name: "Tiếng Việt" }).first().click();
  await expect(page).toHaveURL(/\/vi\//);
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
});

test("language switcher appears once in header and footer", async ({
  page,
}) => {
  await page.goto("/en/");
  const header = page.getByRole("navigation", { name: "Primary" });
  const footer = page.getByRole("contentinfo");
  await expect(header.getByRole("link", { name: "Tiếng Việt" })).toBeAttached();
  await expect(footer.getByRole("link", { name: "Tiếng Việt" })).toBeAttached();
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
