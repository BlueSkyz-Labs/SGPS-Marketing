import { expect, test } from "@playwright/test";

/**
 * Aesthetic slice S2: the Home chrome is one ink surface.
 *
 * - The sticky glass header over the ink hero must be the opaque brand ink in
 *   the light theme too (ink at 88% blended with the porcelain page into grey).
 * - The hero's bottom edge carries the static HorizonSeam so the ink-to-page
 *   change reads as an intentional horizon line.
 *
 * Motion stays at the default so the frosted-glass path (not the static
 * premium fallback, which is already opaque) is the one under test.
 */
const INK = "rgb(11, 16, 32)";

for (const theme of ["light", "dark"] as const) {
  for (const lang of ["en", "vi", "zh"] as const) {
    test.describe(`${lang} Home, ${theme} theme`, () => {
      test.use({ colorScheme: theme });

      test.beforeEach(async ({ page }) => {
        await page.addInitScript((mode: string) => {
          try {
            localStorage.setItem("blueskyz-theme", mode);
          } catch {
            /* attribute fallback below */
          }
        }, theme);
      });

      test("ink-scene header is opaque brand ink, at the top and after scrolling", async ({
        page,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(`/${lang}/`, { waitUntil: "load" });
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        const header = page.locator('header[data-scene="ink"]');
        await expect(header).toHaveCSS("background-color", INK);
        await page.evaluate(() => window.scrollTo(0, 600));
        await expect(header).toHaveCSS("background-color", INK);
      });

      test("hero bottom edge carries the static, decorative horizon seam", async ({
        page,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(`/${lang}/`, { waitUntil: "load" });
        const seam = page.locator(".hero-plane > .horizon-seam");
        await expect(seam).toHaveCount(1);
        await expect(seam).toHaveAttribute("aria-hidden", "true");
        // Out of flow: it must not take layout space or intercept input.
        await expect(seam).toHaveCSS("position", "absolute");
        await expect(seam).toHaveCSS("pointer-events", "none");
        const [heroBox, seamBox] = await Promise.all([
          page.locator(".hero-plane").boundingBox(),
          seam.boundingBox(),
        ]);
        expect(heroBox && seamBox).toBeTruthy();
        // The seam line sits on the hero's bottom edge (within a few px).
        const lineCentre = seamBox!.y + seamBox!.height / 2;
        expect(
          Math.abs(lineCentre - (heroBox!.y + heroBox!.height)),
        ).toBeLessThan(4);
      });
    });
  }
}

test("hero headline never animates and no seam ships on porcelain-scene pages", async ({
  page,
}) => {
  await page.goto("/en/about/", { waitUntil: "load" });
  await expect(page.locator(".hero-plane > .horizon-seam")).toHaveCount(0);
  await page.goto("/en/", { waitUntil: "load" });
  const animation = await page
    .locator("#hero-title")
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(animation).toBe("none");
});
