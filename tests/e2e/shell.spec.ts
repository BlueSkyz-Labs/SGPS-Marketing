import { expect, test } from "@playwright/test";

test("shell exposes skip link and product-led nav", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/en/");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeAttached();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Products" }).first(),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "About" }).first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Contact" }).first(),
  ).toBeVisible();
  // Empty registry + empty email: primary CTA soft-lands on About, not Contact dead-end.
  await expect(
    page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
      name: "About BlueSkyz",
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Intelligence. Elevated.",
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Impact.",
  );
});

test("footer exposes trust routes", async ({ page }) => {
  await page.goto("/en/");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", { name: "Support" })).toBeVisible();
  await expect(footer.getByRole("link", { name: "Privacy" })).toBeVisible();
  await expect(footer.getByRole("link", { name: "Security" })).toBeVisible();
});

test("VI shell exposes a localized skip link", async ({ page }) => {
  await page.goto("/vi/");
  await expect(
    page.getByRole("link", { name: "Chuyển đến nội dung chính" }),
  ).toBeAttached();
  // CSS locator: the primary nav is display-hidden at mobile widths.
  await expect(page.locator('header nav[aria-label="Chính"]')).toBeAttached();
});
