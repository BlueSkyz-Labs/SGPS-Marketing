import { expect, test } from "@playwright/test";

/**
 * C4-A Task 3 — Optical Typography Calibration.
 *
 * Hierarchy must stay semantic and visually ordered, long-form measure must stay
 * bounded, EN/VI diacritics must never clip, and nothing may overflow the phone.
 */
const ROUTES = ["/en/", "/vi/"] as const;
const SURFACE = "[data-one-house-editorial]";

test.describe("C4-A optical typography", () => {
  for (const route of ROUTES) {
    test(`${route} keeps a stable heading hierarchy at 1440`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      const sizes = await page.evaluate(() => {
        const px = (sel: string) => {
          const el = document.querySelector(sel);
          return el ? Number.parseFloat(getComputedStyle(el).fontSize) : 0;
        };
        return { h1: px("h1"), h2: px(`${"[data-one-house-editorial]"} h2`) };
      });
      expect(sizes.h1).toBeGreaterThan(0);
      expect(sizes.h2).toBeGreaterThan(0);
      expect(sizes.h1).toBeGreaterThan(sizes.h2);
    });

    for (const width of [390, 320] as const) {
      test(`${route} has no horizontal overflow at ${width}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(route);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }

    test(`${route} bounds the long-form reading measure`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      const width = await page.evaluate(() => {
        const p = document.querySelector(`${"[data-one-house-editorial]"} p`);
        return p ? p.getBoundingClientRect().width : 0;
      });
      expect(width).toBeGreaterThan(0);
      expect(width).toBeLessThanOrEqual(760);
    });

    test(`${route} never clips heading diacritics`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      const clipped = await page.evaluate(() => {
        const h2 = document.querySelector(`${"[data-one-house-editorial]"} h2`);
        if (!h2) return true;
        const cs = getComputedStyle(h2);
        const vertical =
          h2.scrollHeight > h2.clientHeight + 1 && cs.overflowY === "hidden";
        const horizontal =
          h2.scrollWidth > h2.clientWidth + 1 && cs.overflowX === "hidden";
        return vertical || horizontal;
      });
      expect(clipped).toBe(false);
    });
  }
});
