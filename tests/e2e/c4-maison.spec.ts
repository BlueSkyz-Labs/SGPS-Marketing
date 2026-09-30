import { expect, test } from "@playwright/test";

/**
 * C4-B maison orientation surface, retired from the home by Experience v6 S1.
 *
 * The unlabelled four-link "house index" strip (Products / Security /
 * Architecture / About) duplicated the header and footer navigation (audit 2.3).
 * The `MaisonIndex` component and `src/lib/maison.ts` stay in the repo; a
 * runtime spec returns with the first surface that mounts it. These tests pin
 * that the home carries exactly one footer navigation cluster and no strip.
 */
for (const lang of ["en", "vi"] as const) {
  test(`/${lang}/ renders no house-index strip`, async ({ page }) => {
    await page.goto(`/${lang}/`);
    await expect(page.locator("[data-maison-index]")).toHaveCount(0);
    await expect(
      page.getByRole("navigation", {
        name: /House index|Mục lục ngôi nhà|Site index|Mục lục trang/,
      }),
    ).toHaveCount(0);
  });

  test(`/${lang}/ keeps the footer navigation as the single link cluster`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/`);
    await expect(
      page.getByRole("contentinfo").getByRole("navigation"),
    ).toHaveCount(1);
  });
}
