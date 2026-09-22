import { expect, test } from "@playwright/test";

/**
 * C4-A Task 2 — Editorial Grid System v3.
 *
 * Desktop must be a deliberate asymmetric composition, not a uniform stack; the
 * phone composition is authored as a single column so DOM reading order never
 * depends on visual placement. Measured on the representative authority surface
 * (`[data-one-house-editorial]`) at the widths the plan names.
 */
const ROUTES = ["/en/", "/vi/"] as const;
const SECTION = "[data-one-house-editorial]";

const trackCount = (el: Element): number =>
  getComputedStyle(el)
    .gridTemplateColumns.split(" ")
    .filter((part) => part.trim().length > 0).length;

const trackWidths = (el: Element): number[] =>
  getComputedStyle(el)
    .gridTemplateColumns.split(" ")
    .filter((part) => part.trim().length > 0)
    .map((part) => Number.parseFloat(part));

test.describe("C4-A editorial grid", () => {
  for (const route of ROUTES) {
    test(`${route} composes asymmetrically at 1440`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      const section = page.locator(SECTION);
      await expect(section).toBeVisible();

      expect(await section.evaluate(trackCount)).toBeGreaterThan(1);

      const widths = await section.evaluate(trackWidths);
      expect(widths.length).toBeGreaterThan(1);
      expect(Math.abs(widths[0] - widths[1])).toBeGreaterThan(1);
    });

    for (const width of [390, 320] as const) {
      test(`${route} is single-column with no overflow at ${width}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(route);
        const section = page.locator(SECTION);
        await expect(section).toBeVisible();

        expect(await section.evaluate(trackCount)).toBe(1);

        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }

    test(`${route} keeps semantic reading order`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      const order = await page
        .locator(`${SECTION} > *`)
        .evaluateAll((els) => els.map((el) => el.tagName.toLowerCase()));
      expect(order[0]).toBe("div");
      expect(order[1]).toBe("ol");
    });
  }
});
