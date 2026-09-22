import { expect, test } from "@playwright/test";

/**
 * C4-A Task 7 — Signature Colophon.
 *
 * The colophon states identity, language and approved public routes only: no
 * internal machinery, no invented freshness, no dead links, and it must fit the
 * smallest phone.
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

    test(`${route} exposes only public routes`, async ({ page }) => {
      await page.goto(route);
      const hrefs = await page
        .locator(`${COLOPHON} a`)
        .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
      expect(hrefs.length).toBeGreaterThan(0);
      for (const href of hrefs) {
        expect(href).toMatch(/^\/(?:en|vi|zh)\//);
        expect(href).not.toMatch(/\.github|\.worktrees|docs\//);
      }
    });

    test(`${route} colophon links all resolve`, async ({ page, request }) => {
      await page.goto(route);
      const hrefs = await page
        .locator(`${COLOPHON} a`)
        .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
      for (const href of hrefs) {
        const res = await request.get(href);
        expect(res.status(), `${href} should resolve`).toBeLessThan(400);
      }
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
  }
});
