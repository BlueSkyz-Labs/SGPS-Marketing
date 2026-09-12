import { expect, test } from "@playwright/test";

/**
 * Wave H13 — forced colors (Windows High Contrast) sanity.
 * The palette is provider-forced; the requirement is that the document still
 * renders its content (headings, copy, links) rather than disappearing into
 * transparent backgrounds or system-invisible colours.
 */
test.use({ viewport: { width: 1280, height: 900 } });

for (const route of ["/en/", "/en/security/", "/en/decision-room/"]) {
  test(`${route} keeps its content visible under forced colors`, async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto(route);
    const visibleBlocks = await page.evaluate(() => {
      const main = document.querySelector("main");
      if (!main) return 0;
      return [...main.querySelectorAll("h1, h2, p, a")].filter((el) => {
        const rect = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 && cs.visibility !== "hidden";
      }).length;
    });
    expect(visibleBlocks).toBeGreaterThan(5);
    await expect(page.locator("h1").first()).toBeVisible();
  });
}
