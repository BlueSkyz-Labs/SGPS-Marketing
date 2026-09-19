import { expect, test } from "@playwright/test";
import { startFixtureServer } from "./helpers/parity-fixture";

test.describe("C3-B truth choreography", () => {
  let origin = "";
  let closeServer = () => Promise.resolve();
  test.beforeAll(async () => {
    const fixture = await startFixtureServer();
    origin = fixture.origin;
    closeServer = fixture.close;
  });
  test.afterAll(async () => {
    await closeServer();
  });

  test("state patterns preserve meaning", async ({ page }) => {
    await page.goto(`${origin}/truth-choreography/`);
    for (const [state, style] of [
      ["changed", "dashed"],
      ["not-published", "dotted"],
      ["unavailable", "dotted"],
    ] as const) {
      const item = page.locator(`[data-truth-state="${state}"]`);
      await expect(item).toBeVisible();
      await expect(item.locator(".truth-state__label")).not.toBeEmpty();
      const border = await item.evaluate(
        (el) => getComputedStyle(el).borderTopStyle,
      );
      expect(border).toBe(style);
    }
    const labels = await page.locator("[data-truth-choreography]").innerText();
    expect(labels).not.toMatch(/score|certified|verified|%/i);
  });

  test("no-JS and reduced motion preserve meaning", async ({ browser, page }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      reducedMotion: "reduce",
    });
    try {
      const noJs = await context.newPage();
      await noJs.goto(`${origin}/truth-choreography/`);
      await expect(noJs.locator("[data-truth-state]")).toHaveCount(5);
      await expect(
        noJs.locator('[data-truth-state="not-published"]'),
      ).toHaveAccessibleName("Not published");
      const changed = noJs.locator('[data-truth-state="changed"]');
      const result = await changed.evaluate((el) => ({
        animation: getComputedStyle(el).animationName,
        transition: getComputedStyle(el).transitionDuration,
      }));
      expect(result.animation).toBe("none");
      expect(result.transition).toBe("0s");
    } finally {
      await context.close();
    }
    await page.goto(`${origin}/truth-choreography/`);
    await page.setViewportSize({ width: 320, height: 720 });
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
