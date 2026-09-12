import { expect, test } from "@playwright/test";

/**
 * Wave H6 — print surface.
 * A printed evidence passport must read as a document: no site chrome, and the
 * evidence detail that is collapsed on screen must be visible on paper.
 */
test.describe("print surface", () => {
  test("site chrome is hidden and evidence detail stays readable on paper", async ({
    page,
  }) => {
    await page.goto("/en/evidence/security-reporting-is-private/");
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("header").first()).toBeHidden();
    await expect(page.locator("footer").first()).toBeHidden();
    await expect(page.locator(".skip-link").first()).toBeHidden();

    const details = page.locator(".evidence-details__more").first();
    if ((await details.count()) > 0) {
      await expect(details.locator("> *:not(summary)").first()).toBeVisible();
    }
    // The evidence content itself must remain on paper.
    await expect(page.locator("main").first()).toBeVisible();
    // A navigation affordance is dead on paper.
    await expect(page.locator(".evidence-passport__context")).toBeHidden();
  });

  test("the navigator and journey bar do not print anywhere", async ({
    page,
  }) => {
    await page.goto("/en/");
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("[data-command-navigator]")).toBeHidden();
    await expect(page.locator("[data-journey-bar]").first()).toBeHidden();
    await expect(page.locator("header").first()).toBeHidden();
  });

  test("screen media restores the chrome", async ({ page }) => {
    await page.goto("/en/about/");
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("header").first()).toBeHidden();
    await page.emulateMedia({ media: "screen" });
    await expect(page.locator("header").first()).toBeVisible();
  });
});
