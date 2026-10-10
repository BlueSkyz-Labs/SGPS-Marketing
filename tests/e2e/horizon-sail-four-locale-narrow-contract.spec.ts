import { expect, test } from "@playwright/test";

/**
 * W0/W4: four public locale shells retain usable narrow-screen routes
 * in both themes. This is structural QA, not native-language or visual E4.
 */
const locales = [
  ["en", "en"],
  ["vi", "vi"],
  ["zh", "zh-Hans"],
  ["zh-hant", "zh-Hant"],
] as const;

async function noOverflow(page: import("@playwright/test").Page) {
  const overflowing = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflowing).toBe(false);
}

for (const [lang, documentLang] of locales) {
  for (const width of [320, 390]) {
    for (const theme of ["light", "dark"] as const) {
      test(`${lang} ${width}px ${theme}: Home and Verify`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.addInitScript((mode: string) => {
          try {
            localStorage.setItem("blueskyz-theme", mode);
          } catch {
            // When storage is unavailable, the HTML fallback still applies.
          }
        }, theme);
        await page.goto(`/${lang}/`);
        await expect(page.locator("html")).toHaveAttribute("lang", documentLang);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.locator("[data-hero-primary]")).toBeVisible();
        await noOverflow(page);

        await page.goto(`/${lang}/verify/`);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await noOverflow(page);
      });
    }
  }
}

test.describe("Chinese static fallback at 320px", () => {
  test.use({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 720 },
    reducedMotion: "reduce",
  });

  for (const [lang, documentLang] of locales.slice(2)) {
    test(`${lang}: Home and Verify without JS`, async ({ page }) => {
      await page.goto(`/${lang}/`);
      await expect(page.locator("html")).toHaveAttribute("lang", documentLang);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await noOverflow(page);

      await page.goto(`/${lang}/verify/`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await noOverflow(page);
    });
  }
});
