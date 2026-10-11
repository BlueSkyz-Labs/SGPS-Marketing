import { expect, test } from "@playwright/test";

/** W0/W4 browser-only structural checks, not human visual certification. */
for (const lang of ["en", "vi", "zh", "zh-hant"] as const) {
  for (const width of [320, 390]) {
    for (const theme of ["light", "dark"] as const) {
      test(`${lang} ${width}px ${theme}: home and Verify`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.addInitScript((mode: string) => {
          localStorage.setItem("blueskyz-theme", mode);
        }, theme);

        await page.goto(`/${lang}/`);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.locator("[data-hero-primary]")).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

        const homeOverflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
        );
        expect(homeOverflow).toBe(false);

        await page.goto(`/${lang}/verify/`);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        const verifyOverflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
        );
        expect(verifyOverflow).toBe(false);
      });
    }
  }
}

test.describe("no-JS Chinese 320px fallback", () => {
  test.use({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 720 },
    reducedMotion: "reduce",
  });

  for (const lang of ["zh", "zh-hant"] as const) {
    test(`${lang}: static home and Verify`, async ({ page }) => {
      await page.goto(`/${lang}/`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.goto(`/${lang}/verify/`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }
});
