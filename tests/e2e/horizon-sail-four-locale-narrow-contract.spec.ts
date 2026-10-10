import { expect, test, type Page } from "@playwright/test";

/**
 * W0/W4: all four public locale shells retain a usable narrow-screen
 * reading path in both themes, without changing visual snapshots or budgets.
 *
 * This is an executable structural guard, NOT independent visual review,
 * native language validation or proof of the Cloudflare served revision.
 */
const locales = [
  { route: "en", documentLang: "en" },
  { route: "vi", documentLang: "vi" },
  { route: "zh", documentLang: "zh-Hans" },
  { route: "zh-hant", documentLang: "zh-Hant" },
] as const;

const viewports = [
  { width: 320, height: 720 },
  { width: 390, height: 844 },
] as const;

async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    metrics.scrollWidth,
    `content overflows at viewport ${metrics.clientWidth}px: ${JSON.stringify(metrics)}`,
  ).toBeLessThanOrEqual(metrics.clientWidth);
}

for (const { route, documentLang } of locales) {
  for (const viewport of viewports) {
    for (const theme of ["light", "dark"] as const) {
      test(`${route} ${viewport.width}px ${theme}: home and Verify remain readable`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await page.addInitScript((mode: string) => {
          try {
            localStorage.setItem("blueskyz-theme", mode);
          } catch {
            // Storage may be disabled; the visual baseline is still HTML.
          }
        }, theme);

        await page.goto(`/${route}/`);
        await expect(page.locator("html")).toHaveAttribute(
          "lang",
          documentLang,
        );
        await expect(page.locator("html")).toHaveAttribute(
          "data-theme",
          theme,
        );
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.locator("[data-hero-primary]")).toBeVisible();
        await assertNoHorizontalOverflow(page);

        await page.goto(`/${route}/verify/`);
        await expect(page.locator("html")).toHaveAttribute(
          "data-theme",
          theme,
        );
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await assertNoHorizontalOverflow(page);
      });
    }
  }
}

test.describe("Chinese locale static fallback at 320px", () => {
  test.use({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 720 },
    reducedMotion: "reduce",
  });

  for (const { route, documentLang } of locales.filter((x) =>
    x.route.startsWith("zh"),
  )) {
    test(`${route}: home and Verify remain usable without JS`, async ({
      page,
    }) => {
      await page.goto(`/${route}/`);
      await expect(page.locator("html")).toHaveAttribute("lang", documentLang);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await assertNoHorizontalOverflow(page);

      await page.goto(`/${route}/verify/`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await assertNoHorizontalOverflow(page);
    });
  }
});
