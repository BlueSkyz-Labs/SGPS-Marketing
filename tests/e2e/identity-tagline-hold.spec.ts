import { expect, test } from "@playwright/test";

// OG-3: identity art whose baked-in tagline is not confirmed against Product
// Truth never renders on the profile page. Vững Tay Lái's art reads "AI Driving
// Coach"; its Product Truth V0 has no remote runtime AI dependency.
const LOCALES = ["en", "vi", "zh", "zh-hant"];

test.describe("identity art with a held tagline", () => {
  for (const lang of LOCALES) {
    test(`${lang}: Vững Tay Lái shows its screens, never the held identity art`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/products/vungtaylai/`);
      await expect(
        page.locator("[data-showcase-disclosure]").first(),
      ).toBeAttached();
      await expect(
        page.locator('img[src*="/products/vungtaylai/identity"]'),
      ).toHaveCount(0);
      await expect(page.locator("[data-profile-identity-stage]")).toHaveCount(
        0,
      );
      // Neither the markup nor the JSON-LD image may point at the held art.
      expect(await page.content()).not.toContain(
        "/products/vungtaylai/identity",
      );
    });
  }

  // The hold lives in one helper (displayableMedia), so it also covers the
  // home flagship theatre and any future surface that renders proof media.
  for (const lang of LOCALES) {
    test(`${lang}: the home page never points at the held identity art`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/`);
      expect(await page.content()).not.toContain(
        "/products/vungtaylai/identity",
      );
    });
  }

  test("Sổ Trọ keeps its identity strip (no hold)", async ({ page }) => {
    await page.goto("/en/products/sotro/");
    await expect(page.locator("[data-profile-identity-stage]")).toHaveCount(1);
  });
});
