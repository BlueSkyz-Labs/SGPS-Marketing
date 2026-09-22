import { expect, test } from "@playwright/test";

/**
 * C4-A Task 6 — Editorial Folio System.
 *
 * The folio is decoration with real text: the ordinal is redundant ornament,
 * the label and running context stay readable, no heading semantics are
 * duplicated, nothing becomes a progress score, and it never traps focus.
 */
const ROUTES = ["/en/", "/vi/"] as const;
const FOLIO = "[data-c4-folio]";

test.describe("C4-A editorial folio", () => {
  for (const route of ROUTES) {
    test(`${route} renders a folio with real text`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      const folio = page.locator(FOLIO).first();
      await expect(folio).toBeVisible();
      await expect(folio.locator(".c4-folio__label")).toHaveText(/\S+/);
      await expect(folio.locator(".c4-folio__context")).toHaveText(/\S+/);
    });

    test(`${route} keeps the ordinal decorative only`, async ({ page }) => {
      await page.goto(route);
      const ordinal = page.locator(`${FOLIO} .c4-folio__ordinal`).first();
      await expect(ordinal).toHaveAttribute("aria-hidden", "true");
    });

    test(`${route} never duplicates heading semantics`, async ({ page }) => {
      await page.goto(route);
      const folioTag = await page
        .locator(FOLIO)
        .first()
        .evaluate((el) => el.tagName.toLowerCase());
      expect(folioTag).toBe("p");
      const headings = await page
        .locator(`${FOLIO} :is(h1,h2,h3,h4,h5,h6)`)
        .evaluateAll((els) => els.length);
      expect(headings).toBe(0);
    });

    test(`${route} is not a progress score and not focusable`, async ({
      page,
    }) => {
      await page.goto(route);
      const info = await page
        .locator(FOLIO)
        .first()
        .evaluate((el) => ({
          text: (el.textContent ?? "").trim(),
          focusable: el.matches("a,button,[tabindex],input,select,textarea"),
        }));
      expect(info.text.length).toBeGreaterThan(0);
      expect(info.focusable).toBe(false);
      expect(info.text).not.toMatch(/\d+\s*%/);
    });

    for (const width of [390, 320] as const) {
      test(`${route} folio stays inside the phone at ${width}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(route);
        const fits = await page
          .locator(FOLIO)
          .first()
          .evaluate((el) => {
            const r = el.getBoundingClientRect();
            return r.width <= document.documentElement.clientWidth + 1;
          });
        expect(fits).toBe(true);
      });
    }

    test(`${route} folio survives print media`, async ({ page }) => {
      await page.goto(route);
      await page.emulateMedia({ media: "print" });
      const folio = page.locator(FOLIO).first();
      await expect(folio).toBeVisible();
      await expect(folio.locator(".c4-folio__label")).toHaveText(/\S+/);
    });
  }
});
