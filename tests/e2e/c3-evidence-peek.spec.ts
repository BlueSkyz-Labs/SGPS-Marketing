import { test, expect } from "@playwright/test";
import { startFixtureServer } from "./helpers/parity-fixture";

/** C3-B Task 3: native evidence peek remains complete and truthful without enhancement. */
test.describe("C3-B evidence peek", () => {
  let origin = "";
  let closeServer = () => Promise.resolve();
  test.beforeAll(async () => {
    const server = await startFixtureServer();
    origin = server.origin;
    closeServer = server.close;
  });
  test.afterAll(async () => {
    await closeServer();
  });

  test("native proof preview works without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      await page.goto(`${origin}/product-acts/`);
      const peek = page.locator(
        '[data-product-proof-capability="Fixture capability one"]',
      );
      await expect(peek).toHaveCount(1);
      await expect(peek).not.toHaveAttribute("open", "");
      await peek.locator("summary").click();
      await expect(peek).toHaveAttribute("open", "");
      await expect(peek.locator(".c3-product-proof__item")).toHaveCount(2);
      await expect(peek.locator("[data-truth-state]")).toHaveCount(2);
      await expect(peek.locator(".c3-product-proof__passport")).toHaveAttribute(
        "href",
        /\/en\/evidence\//,
      );
      await expect(
        peek.locator(".c3-product-proof__boundary").first(),
      ).toBeVisible();
      await expect(
        page.locator('[data-product-proof-capability="Fixture capability three"]'),
      ).toHaveCount(0);
    } finally {
      await context.close();
    }
  });

  test("mobile keyboard proof keeps 44px target", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(`${origin}/product-acts-vi/`);
    const peek = page.locator(
      '[data-product-proof-capability="Fixture capability one"]',
    );
    const summary = peek.locator("summary");
    const bounds = await summary.boundingBox();
    expect(bounds?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(peek).toHaveAttribute("open", "");
    await expect(peek).toContainText("Hồ sơ bằng chứng");
  });
});
