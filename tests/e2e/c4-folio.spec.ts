import { expect, test } from "@playwright/test";

/**
 * C4-A Task 6 — Editorial Folio System, retired from the home by Experience v6 S1.
 *
 * The folio ("01 CHAPTER — ONE HOUSE") existed only inside the One House band
 * and was the start of a numbering system that never continued (audit 2.2).
 * It left the home with that band. The `Folio` component stays in the repo;
 * a runtime folio spec returns with the first surface that mounts it.
 */
for (const route of ["/en/", "/vi/"] as const) {
  test(`${route} renders no orphaned folio ordinal`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("[data-c4-folio]")).toHaveCount(0);
    await expect(page.locator(".c4-folio__ordinal")).toHaveCount(0);
  });
}
