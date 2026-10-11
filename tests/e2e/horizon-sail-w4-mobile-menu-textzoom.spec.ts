import { expect, test, type Page } from "@playwright/test";

/**
 * W4: at 200% text zoom the compact menu must remain inside the viewport
 * when OPEN. Checking document scrollWidth with the menu closed misses an
 * off-screen absolute panel that overhangs the left edge.
 */

/**
 * 200% text zoom injected into the served HTML itself, so it applies with or
 * without client JavaScript (page.addStyleTag needs page script and timed out
 * in CI). The inline <style> is allowed by the site CSP (style-src
 * 'unsafe-inline').
 */
async function zoomText200(page: Page): Promise<void> {
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() !== "document") {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    const body = (await response.text()).replace(
      "</head>",
      "<style>html { font-size: 200% !important; }</style></head>",
    );
    await route.fulfill({ response, body });
  });
}

/** The panel's own navigation; the language switcher nests another nav. */
const panelNav = (page: Page) =>
  page.locator("header details").first().locator(":scope > div > nav");

for (const lang of ["en", "vi", "zh", "zh-hant"] as const) {
  for (const width of [320, 390]) {
    test(`${lang} ${width}px: open compact menu fits 200% text zoom`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await zoomText200(page);
      await page.goto(`/${lang}/`);

      const disclosure = page.locator("header details").first();
      await disclosure.locator("summary").click();
      await expect(panelNav(page)).toBeVisible();

      const box = await panelNav(page).evaluate((node) => {
        const panel = node.parentElement!;
        const r = panel.getBoundingClientRect();
        return { left: r.left, right: r.right, width: r.width };
      });
      expect(box.width).toBeGreaterThan(0);
      expect(
        box.left,
        `menu clipped on left: ${JSON.stringify(box)}`,
      ).toBeGreaterThanOrEqual(-1);
      expect(
        box.right,
        `menu clipped on right: ${JSON.stringify(box)}`,
      ).toBeLessThanOrEqual(width + 1);
      await expect(panelNav(page).locator("a").first()).toBeVisible();
    });
  }
}

test.describe("W4 no-JS native disclosure on 320px", () => {
  test.use({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 844 },
    reducedMotion: "reduce",
  });

  for (const lang of ["vi", "zh-hant"] as const) {
    test(`${lang}: menu is usable without client JavaScript`, async ({
      page,
    }) => {
      await zoomText200(page);
      await page.goto(`/${lang}/`);
      const disclosure = page.locator("header details").first();
      await disclosure.locator("summary").click();
      await expect(panelNav(page).locator("a").first()).toBeVisible();
      const { left, right } = await panelNav(page).evaluate((node) => {
        const r = node.parentElement!.getBoundingClientRect();
        return { left: r.left, right: r.right };
      });
      expect(left).toBeGreaterThanOrEqual(-1);
      expect(right).toBeLessThanOrEqual(321);
    });
  }
});
