import { expect, test } from "@playwright/test";

test("404 page recovers without atelier copy", async ({ page }) => {
  const response = await page.goto("/en/404/", {
    waitUntil: "domcontentloaded",
  });
  expect(response, "404 page response").not.toBeNull();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /not found/i,
  );
  await expect(
    page
      .getByRole("link", {
        name: /Go home|About BlueSkyz|Contact|Explore products/i,
      })
      .first(),
  ).toBeVisible();
  await expect(
    page.getByText(/Quiet luxury|digital atelier|Savile Row/i),
  ).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});

test("404 page renders in Vietnamese", async ({ page }) => {
  await page.goto("/vi/404/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /không tìm thấy/i,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});

test("homepage empty registry omits hollow featured shelf", async ({
  page,
}) => {
  await page.goto("/en/");
  await expect(
    page.getByRole("heading", { name: "Featured products" }),
  ).toHaveCount(0);
  await expect(page.locator("[data-product-card]")).toHaveCount(0);
  const body = await page.locator("body").innerText();
  expect(body).not.toMatch(/docs\/evidence|candidates under review/i);
  await expect(
    page.getByRole("link", { name: /Explore all products/i }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: /About BlueSkyz/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByText(/No public products are published yet/i).first(),
  ).toBeVisible();
});

test("contact empty-email state leads with working security path", async ({
  page,
}) => {
  await page.goto("/en/contact/");
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: /private vulnerability reporting/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Security" }).first(),
  ).toBeVisible();
});
