import { expect, test, type Page } from "@playwright/test";

/**
 * SGPS-DEC-2026-025 step friction (contract §3): base step counts for the
 * critical journeys J1–J3, recorded as a regression floor. A "step" is one
 * link activation from the locale home; scrolling is not counted.
 *   J1 understand the studio  → 0 steps (H1 in the first mobile viewport)
 *   J2 find Sổ Trọ + status   → 1 step  (home links the product page; the
 *                                         status is in its first viewport)
 *   J3 verify a public claim  → 1 step  (home links Verify; a claim and its
 *                                         stated limit render there)
 */
const LOCALES = ["en", "vi"] as const;

async function inFirstViewport(page: Page, selector: string): Promise<boolean> {
  return page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.height > 0 && r.top >= 0 && r.top < window.innerHeight;
    });
}

for (const lang of LOCALES) {
  test.describe(`${lang}: journey step counts`, () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("J1 is 0 steps: the H1 is in the first viewport", async ({ page }) => {
      await page.goto(`/${lang}/`);
      expect(await inFirstViewport(page, "h1")).toBe(true);
    });

    test("J2 is 1 step: home links Sổ Trọ, whose status is above the fold", async ({
      page,
    }) => {
      await page.goto(`/${lang}/`);
      const link = page.locator(`main a[href="/${lang}/products/sotro/"]`);
      expect(await link.count()).toBeGreaterThan(0);
      await link.first().click();
      await expect(page).toHaveURL(new RegExp(`/${lang}/products/sotro/$`));
      expect(await inFirstViewport(page, "[data-product-status]")).toBe(true);
    });

    test("J3 is 1 step: home links Verify, which shows a claim with its limit", async ({
      page,
    }) => {
      await page.goto(`/${lang}/`);
      const link = page.locator(`main a[href="/${lang}/verify/"]`);
      expect(await link.count()).toBeGreaterThan(0);
      await link.first().click();
      await expect(page).toHaveURL(new RegExp(`/${lang}/verify/$`));
      const claim = page.locator("[data-claim-id]").first();
      await expect(claim).toBeVisible();
      await expect(claim.locator(".verify-claim__limit")).toBeVisible();
    });
  });
}
