import { expect, test } from "@playwright/test";

test.describe("SGPS integrity lens", () => {
  test("/en/security/ shows a modeled lens with truthful content", async ({
    page,
  }) => {
    await page.goto("/en/security/");
    const lens = page.locator('[data-integrity-lens][data-surface="security"]');
    await expect(lens).toBeVisible();
    await expect(
      lens.getByRole("heading", { level: 2, name: "Verify this page" }),
    ).toBeVisible();
    await expect(lens.locator('[data-truth-state="source-linked"]')).toHaveText(
      /Source-linked/,
    );
    await expect(lens.locator("[data-evidence-review]")).toHaveText(
      /2026-09-12/,
    );
    await expect(
      lens.getByRole("link", {
        name: /GitHub private vulnerability reporting/i,
      }),
    ).toHaveAttribute(
      "href",
      "https://github.com/BlueSkyz-Labs/SGPS-Marketing/security/advisories/new",
    );
  });

  test("/en/products/ lens reports the not-published registry state", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    const lens = page.locator('[data-integrity-lens][data-surface="products"]');
    await expect(lens).toBeVisible();
    await expect(lens.locator('[data-truth-state="not-published"]')).toHaveText(
      /Not published/,
    );
    await expect(lens.locator("[data-evidence-review]")).toHaveCount(0);
  });

  test("unmodeled surfaces render no hollow lens shell", async ({ page }) => {
    for (const route of ["/en/contact/", "/en/about/", "/en/support/"]) {
      await page.goto(route);
      await expect(page.locator("[data-integrity-lens]")).toHaveCount(0);
    }
  });

  test("VI security lens is localized", async ({ page }) => {
    await page.goto("/vi/security/");
    const lens = page.locator('[data-integrity-lens][data-surface="security"]');
    await expect(lens).toBeVisible();
    await expect(
      lens.getByRole("heading", { level: 2, name: "Xác minh trang này" }),
    ).toBeVisible();
    await expect(lens.locator('[data-truth-state="source-linked"]')).toHaveText(
      /Đã gắn nguồn/,
    );
  });

  test("lens toggles with the keyboard (native details)", async ({ page }) => {
    await page.goto("/en/security/");
    const lens = page.locator('[data-integrity-lens][data-surface="security"]');
    const summary = lens.locator("details > summary").first();
    await summary.focus();
    await expect(summary).toBeFocused();
    await page.keyboard.press("Enter");
    const details = lens.locator("details").first();
    await expect(details).toHaveAttribute("open", "");
  });
});

test.describe("integrity lens without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("lens and its native toggle render statically", async ({ page }) => {
    await page.goto("/en/privacy/");
    const lens = page.locator('[data-integrity-lens][data-surface="privacy"]');
    await expect(lens).toBeVisible();
    await expect(
      lens.getByRole("heading", { level: 2, name: "Verify this page" }),
    ).toBeVisible();
  });
});
