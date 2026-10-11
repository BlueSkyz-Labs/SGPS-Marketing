import { expect, test } from "@playwright/test";

/**
 * W4: at 200% text zoom the compact menu must remain inside the viewport
 * when OPEN. Checking document scrollWidth with the menu closed misses an
 * off-screen absolute panel that overhangs the left edge.
 */
for (const lang of ["en", "vi", "zh", "zh-hant"] as const) {
  for (const width of [320, 390]) {
    test(`${lang} ${width}px: open compact menu fits 200% text zoom`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/${lang}/`);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });

      const disclosure = page.locator("header details").first();
      await disclosure.locator("summary").click();
      await expect(disclosure.locator("nav")).toBeVisible();

      const box = await disclosure.locator("nav").evaluate((node) => {
        const panel = node.parentElement!;
        const r = panel.getBoundingClientRect();
        return { left: r.left, right: r.right, width: r.width };
      });
      expect(box.width).toBeGreaterThan(0);
      expect(box.left, `menu clipped on left: ${JSON.stringify(box)}`).toBeGreaterThanOrEqual(-1);
      expect(box.right, `menu clipped on right: ${JSON.stringify(box)}`).toBeLessThanOrEqual(width + 1);
      await expect(disclosure.locator("nav a").first()).toBeVisible();
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
      await page.goto(`/${lang}/`);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      const disclosure = page.locator("header details").first();
      await disclosure.locator("summary").click();
      await expect(disclosure.locator("nav a").first()).toBeVisible();
      const { left, right } = await disclosure.locator("nav").evaluate((node) => {
        const r = node.parentElement!.getBoundingClientRect();
        return { left: r.left, right: r.right };
      });
      expect(left).toBeGreaterThanOrEqual(-1);
      expect(right).toBeLessThanOrEqual(321);
    });
  }
});
