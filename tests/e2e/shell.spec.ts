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
  // Experience v6 S6: the header CTA has a job distinct from the Products
  // link, so it is never "Explore products" (Contact with a real mailbox,
  // otherwise About via the Act soft-land).
  const primary = page.getByRole("navigation", { name: "Primary" });
  await expect(
    primary.getByRole("link", { name: "About BlueSkyz" }),
  ).toBeVisible();
  await expect(
    primary.getByRole("link", { name: "Explore products" }),
  ).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "See what remains unpaid this month",
  );
  await expect(page.getByRole("contentinfo")).toContainText(
    "Intelligence. Elevated. Impact.",
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
