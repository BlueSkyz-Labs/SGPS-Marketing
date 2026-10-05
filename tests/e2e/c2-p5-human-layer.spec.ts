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
      // v8 W2: the orphan "Explore products" link is removed.
      await expect(page.locator("[data-hero-secondary]")).toHaveCount(0);
    });

    test("the home ends without a closing horizon band", async ({ page }) => {
      // v8 W2 (V7-C-08): the trailing empty gradient band before the footer is
      // removed; the trust strip is the last content block.
      await page.goto(locale.path);
      await expect(page.locator("[data-closing-horizon]")).toHaveCount(0);
      await expect(page.locator("[data-trust-band]")).toHaveCount(1);
    });
  });
}
