import { expect, test } from "@playwright/test";

const LOCALES = [
  { path: "/en/", lang: "en" },
  { path: "/vi/", lang: "vi" },
] as const;

for (const locale of LOCALES) {
  test.describe(locale.path, () => {
    test("home carries no About block, founder line or closing CTA band", async ({
      page,
    }) => {
      // Experience v6 S1 (audit E-05/E-24): the About block repeated the tagline
      // and the closing band repeated the hero action. The founder line is an
      // Owner-confirmation item (E-26) and is not printed on the home.
      await page.goto(locale.path);
      await expect(page.locator("[data-about-blueskyz]")).toHaveCount(0);
      await expect(page.locator("[data-final-action]")).toHaveCount(0);
      await expect(page.locator("main")).not.toContainText(/tony nguyen/i);
    });

    test("the hero action has a valid internal destination", async ({
      page,
    }) => {
      await page.goto(locale.path);
      const primary = page.locator("[data-hero-primary]");
      await expect(primary).toHaveCount(1);
      expect(await primary.getAttribute("href")).toMatch(/^\//);
      const secondary = page.locator("[data-hero-secondary]");
      await expect(secondary).toHaveCount(1);
      expect(await secondary.getAttribute("href")).toMatch(/^\//);
    });

    test("Closing horizon is decorative and hidden from AT", async ({
      page,
    }) => {
      await page.goto(locale.path);
      // Closing horizon must be aria-hidden
      const horizon = page.locator("[data-closing-horizon]");
      await expect(horizon).toHaveAttribute("aria-hidden", "true");
    });

    test("Closing horizon stays at the end of the document", async ({
      page,
    }) => {
      await page.goto(locale.path);
      // Regression: without its own in-flow box the closing signature
      // resolved against the viewport and painted a grey band under the hero.
      const box = await page.evaluate(() => {
        const horizon = document.querySelector("[data-closing-horizon]");
        if (!horizon) return null;
        const h = horizon.getBoundingClientRect();
        return {
          top: h.top + scrollY,
          height: h.height,
          doc: document.documentElement.scrollHeight,
        };
      });
      expect(box).not.toBeNull();
      // It must sit in the last part of the page and stay a bounded band,
      // never a viewport-sized layer anchored near the top.
      expect(box!.top).toBeGreaterThan(box!.doc * 0.6);
      expect(box!.height).toBeLessThan(400);
    });

    test("No horizontal overflow at 390px", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(locale.path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  });
}
