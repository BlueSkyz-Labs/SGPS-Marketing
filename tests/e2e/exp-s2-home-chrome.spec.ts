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
        // In-page measurement: the seam line sits on the hero's bottom edge.
        const offset = await page.evaluate(() => {
          const hero = document.querySelector(".hero-plane")!;
          const line = hero.querySelector(".horizon-seam__line")!;
          const h = hero.getBoundingClientRect();
          const l = line.getBoundingClientRect();
          return Math.abs(l.top + l.height / 2 - h.bottom);
        });
        expect(offset).toBeLessThan(4);
      });
    });
  }
}

test.describe("ink header focus ring", () => {
  test.use({ colorScheme: "light" });

  // WCAG 2.x relative luminance contrast of two computed colours. Computed
  // color-mix() serialises as color(srgb r g b) in 0..1, rgb() in 0..255.
  const contrast = (a: string, b: string) => {
    const lum = (c: string) => {
      const scale = c.startsWith("color(") ? 1 : 255;
      const [r, g, b2] = (c.match(/[\d.]+/g) ?? []).slice(0, 3).map((v) => {
        const x = Number(v) / scale;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b2;
    };
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  for (const lang of ["en", "vi", "zh", "zh-hant"] as const) {
    test(`${lang} light theme: header focus ring is >= 3:1 on ink`, async ({
      page,
    }) => {
      await page.addInitScript(() => {
        try {
          localStorage.setItem("blueskyz-theme", "light");
        } catch {
          /* attribute fallback */
        }
      });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/${lang}/`, { waitUntil: "load" });
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      const { ring, bg } = await page.evaluate(() => {
        const header = document.querySelector('header[data-scene="ink"]')!;
        const probe = document.createElement("span");
        probe.style.color = "var(--focus-ring)";
        header.append(probe);
        const ring = getComputedStyle(probe).color;
        probe.remove();
        return { ring, bg: getComputedStyle(header).backgroundColor };
      });
      expect(bg).toBe(INK);
      expect(contrast(ring, bg)).toBeGreaterThanOrEqual(3);
    });
  }
});
