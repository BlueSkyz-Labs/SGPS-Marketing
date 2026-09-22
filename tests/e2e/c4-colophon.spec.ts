import { expect, test } from "@playwright/test";

/**
 * C4-A Task 7 — Signature Colophon.
 *
 * The colophon states identity and language only. Every public trust/security
 * route is already owned by the footer navigation, so the colophon must add no
 * second link target for the same destination — and it must fit the smallest
 * phone without dropping below the tap-target floor.
 */
const ROUTES = ["/en/", "/vi/"] as const;
const COLOPHON = "[data-c4-colophon]";

test.describe("C4-A signature colophon", () => {
  for (const route of ROUTES) {
    test(`${route} renders identity and language`, async ({ page }) => {
      await page.goto(route);
      const colophon = page.locator(COLOPHON).first();
      await expect(colophon).toBeVisible();
      await expect(colophon.locator(".c4-colophon__identity")).toHaveText(
        /\S+/,
      );
      await expect(colophon.locator(".c4-colophon__language")).toHaveText(
        /\S+/,
      );
    });

    test(`${route} adds no duplicate public link target`, async ({ page }) => {
      await page.goto(route);
      const colophonLinks = await page
        .locator(`${COLOPHON} a`)
        .evaluateAll((els) => els.length);
      expect(colophonLinks).toBe(0);

      // The footer nav still owns exactly one link per public destination:
      // no two links inside the footer may point at the same href.
      const hrefs = await page
        .getByRole("contentinfo")
        .getByRole("link")
        .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
      const duplicates = hrefs.filter(
        (href, index) => hrefs.indexOf(href) !== index,
      );
      expect(duplicates).toEqual([]);
    });

    test(`${route} colophon fits a 320px phone`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 720 });
      await page.goto(route);
      const fits = await page
        .locator(COLOPHON)
        .first()
        .evaluate((el) => {
          const r = el.getBoundingClientRect();
          return r.width <= document.documentElement.clientWidth + 1;
        });
      expect(fits).toBe(true);
    });

    test(`${route} colophon items clear the tap-target floor`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route);
      const small = await page
        .locator(`${COLOPHON} a`)
        .evaluateAll(
          (els) =>
            els
              .map((el) => el.getBoundingClientRect())
              .filter((r) => r.width > 0 && (r.width < 24 || r.height < 24))
              .length,
        );
      expect(small).toBe(0);
    });
  }
});
