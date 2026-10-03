import { expect, test } from "@playwright/test";

/*
 * v10 card E3: visual regression gate for key routes.
 *
 * Chromium only, Linux CI baselines (Playwright 1.63 / Chromium 1243).
 * Baselines are generated in CI via the temporary workflow_dispatch job
 * (see .github/workflows/visual-baseline-update.yml — removed before merge)
 * and committed; CI never auto-updates snapshots.
 *
 * Determinism controls: reducedMotion reduce, animations disabled per
 * screenshot, fonts awaited, theme pinned pre-paint via localStorage
 * (blueskyz-theme, see src/lib/theme.ts), viewport-only captures.
 * Pixel threshold: maxDiffPixelRatio 0.001 (plan: ≤ 0.1 %).
 */

const ROUTES = [
  "/en/",
  "/vi/",
  "/en/products/",
  "/vi/products/sotro/",
  "/en/about/",
  "/en/verify/",
] as const;

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
] as const;

const THEMES = ["light", "dark"] as const;
type Theme = (typeof THEMES)[number];

const slug = (route: string): string =>
  route.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "root";

for (const viewport of VIEWPORTS) {
  for (const theme of THEMES satisfies readonly Theme[]) {
    test.describe(`${viewport.width}px / ${theme}`, () => {
      test.use({
        viewport: { width: viewport.width, height: viewport.height },
        colorScheme: theme,
      });

      for (const route of ROUTES) {
        test(`${slug(route)} matches baseline`, async ({ page }) => {
          await page.addInitScript((mode: string) => {
            try {
              localStorage.setItem("blueskyz-theme", mode);
            } catch {
              /* storage unavailable: attribute fallback still applies below */
            }
          }, theme);
          await page.goto(route, { waitUntil: "load" });
          await page.evaluate(() => document.fonts.ready);
          await expect(page.locator("html")).toHaveAttribute(
            "data-theme",
            theme,
          );
          await page.waitForTimeout(250);
          await expect(page).toHaveScreenshot(
            `${slug(route)}-${viewport.width}px-${theme}.png`,
            { maxDiffPixelRatio: 0.001, animations: "disabled" },
          );
        });
      }
    });
  }
}
