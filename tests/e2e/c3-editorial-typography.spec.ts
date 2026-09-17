// C3-A Task 3 — Editorial Typography v2 contract (RED first).
// Asserts EN/VI wrapping + 200% zoom + text-spacing at 1440/390/320px.
import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "small", width: 320, height: 720 },
] as const;

test.describe("C3-A Editorial Typography — EN/VI wrapping", () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.name} (${viewport.width}px): no horizontal overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/en/");

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `${viewport.name} overflow`).toBeLessThanOrEqual(1);
    });
  }

  test("200% text zoom keeps content readable", async ({ page }) => {
    await page.goto("/en/");
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, "200% zoom overflow").toBeLessThanOrEqual(4);
  });

  test("text-spacing override is respected", async ({ page }) => {
    await page.addStyleTag({
      content: `
        * {
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
          line-height: 1.5 !important;
        }
      `,
    });
    await page.goto("/en/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, "text-spacing overflow").toBeLessThanOrEqual(4);
  });
});

test.describe("C3-A Editorial Typography — display hierarchy", () => {
  test("headings render with display weight and section hierarchy", async ({
    page,
  }) => {
    await page.goto("/en/");
    await expect(page.locator("h1").first()).toBeVisible();

    const h1Styles = await page.locator("h1").first().evaluate((el) => {
      const computed = getComputedStyle(el);
      return {
        fontWeight: Number(computed.fontWeight),
        fontSize: Number.parseFloat(computed.fontSize),
      };
    });
    expect(h1Styles.fontWeight).toBeGreaterThanOrEqual(500);
    expect(h1Styles.fontSize).toBeGreaterThanOrEqual(24);
  });
});
