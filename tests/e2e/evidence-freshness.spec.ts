import { expect, test } from "@playwright/test";

test.describe("authored evidence freshness", () => {
  test("reviewed surfaces show the authored review date", async ({ page }) => {
    await page.goto("/en/security/");
    const review = page
      .locator(
        '[data-integrity-lens][data-surface="security"] [data-evidence-review]',
      )
      .first();
    await review.scrollIntoViewIfNeeded();
    await page
      .locator('[data-integrity-lens][data-surface="security"] details')
      .first()
      .evaluate((el) => {
        (el as HTMLDetailsElement).open = true;
      });
    await expect(review).toBeVisible();
    await expect(review).toHaveText(/2026-09-12/);
  });

  test("no date is invented when metadata is absent", async ({ page }) => {
    await page.goto("/en/products/");
    const lens = page.locator('[data-integrity-lens][data-surface="products"]');
    await lens
      .locator("details")
      .first()
      .evaluate((el) => {
        (el as HTMLDetailsElement).open = true;
      });
    await expect(lens.locator("[data-evidence-review]")).toHaveCount(0);
  });

  test("no relative or generated time language appears", async ({ page }) => {
    await page.goto("/en/security/");
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/today|yesterday|\bago\b|hours? ago|just now/i);
  });

  test("no perpetual pulse animation in the lens", async ({ page }) => {
    await page.goto("/en/security/");
    const names = await page
      .locator("[data-integrity-lens] *")
      .evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).animationName),
      );
    for (const name of names) {
      expect(name).toBe("none");
    }
  });

  test("VI freshness row is localized", async ({ page }) => {
    await page.goto("/vi/security/");
    await page
      .locator('[data-integrity-lens][data-surface="security"] details')
      .first()
      .evaluate((el) => {
        (el as HTMLDetailsElement).open = true;
      });
    await expect(
      page
        .locator(
          '[data-integrity-lens][data-surface="security"] [data-evidence-review]',
        )
        .first(),
    ).toHaveText(/Đã xem xét: 2026-09-12/);
  });
});
