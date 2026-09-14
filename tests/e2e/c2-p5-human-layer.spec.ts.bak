import { expect, test } from "@playwright/test";

const LOCALES = [
  { path: "/en/", lang: "en" },
  { path: "/vi/", lang: "vi" },
] as const;

for (const locale of LOCALES) {
  test.describe(locale.path, () => {
    test("About section exists with factual content", async ({ page }) => {
      await page.goto(locale.path);
      const about = page.locator("[data-about-blueskyz]");
      await expect(about).toBeVisible();
      // Semantic heading exists
      await expect(about.getByRole("heading", { level: 2 })).toBeVisible();
      // Founder attribution present (factual)
      const text = await about.textContent();
      expect(text).toMatch(/tony nguyen/i);
      // No fabricated claims
      expect(text).not.toMatch(/\d+\s*(employees?|staff|team members?)/i);
      expect(text).not.toMatch(/offices? in/i);
      expect(text).not.toMatch(/customers?|clients?/i);
    });

    test("Final action section has at most 2 CTAs", async ({ page }) => {
      await page.goto(locale.path);
      const finalAction = page.locator("[data-final-action]");
      await expect(finalAction).toBeVisible();
      const links = finalAction.getByRole("link");
      const count = await links.count();
      expect(count).toBeGreaterThanOrEqual(1);
      expect(count).toBeLessThanOrEqual(2);
    });

    test("Final CTAs have valid internal destinations", async ({ page }) => {
      await page.goto(locale.path);
      const finalAction = page.locator("[data-final-action]");
      const links = finalAction.getByRole("link");
      const count = await links.count();
      for (let i = 0; i < count; i++) {
        const href = await links.nth(i).getAttribute("href");
        expect(href).toBeTruthy();
        expect(href).toMatch(/^\//);
      }
    });

    test("Closing horizon is decorative and hidden from AT", async ({
      page,
    }) => {
      await page.goto(locale.path);
      // Closing horizon must be aria-hidden
      const horizon = page.locator("[data-closing-horizon]");
      await expect(horizon).toHaveAttribute("aria-hidden", "true");
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
