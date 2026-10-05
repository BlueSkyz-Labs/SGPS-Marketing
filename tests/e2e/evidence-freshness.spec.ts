import { expect, test } from "@playwright/test";

/**
 * v8 W5a: the review date sits in the one "Sources" line of a reviewed page
 * (security). Pages whose claim carries no review record show no date.
 */
test.describe("authored evidence freshness", () => {
  test("reviewed surfaces show the authored review date", async ({ page }) => {
    await page.goto("/en/security/");
    const line = page.locator("[data-sources-line]");
    await expect(line).toBeVisible();
    await expect(line).toContainText(/Reviewed September 12, 2026/);
    await expect(line.locator("time")).toHaveAttribute(
      "datetime",
      "2026-09-12",
    );
  });

  test("no date is invented when metadata is absent", async ({ page }) => {
    await page.goto("/en/privacy/");
    await expect(page.locator("[data-sources-line]")).toBeVisible();
    await expect(page.locator("[data-sources-line] time")).toHaveCount(0);
    await page.goto("/en/verify/");
    await expect(page.locator("[data-sources-line] time")).toHaveCount(0);
  });

  test("no relative or generated time language appears", async ({ page }) => {
    await page.goto("/en/security/");
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/today|yesterday|\bago\b|hours? ago|just now/i);
  });

  test("no perpetual pulse animation on the sources line", async ({ page }) => {
    await page.goto("/en/security/");
    const names = await page
      .locator("[data-sources-line], [data-sources-line] *")
      .evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).animationName),
      );
    for (const name of names) {
      expect(name).toBe("none");
    }
  });

  test("VI freshness row is localized", async ({ page }) => {
    await page.goto("/vi/security/");
    await expect(page.locator("[data-sources-line]")).toContainText(
      /Rà soát 12 tháng 9, 2026/,
    );
  });
});
