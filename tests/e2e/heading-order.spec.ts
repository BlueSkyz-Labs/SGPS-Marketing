import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * F-22 — products index heading order.
 *
 * `ProductCard.astro` renders product names as `<h3>`, so each products index
 * page must expose a level-2 section heading between the page `<h1>`
 * (`PageHeader`) and the cards. Otherwise axe `heading-order` flags a skipped
 * level on /en/products/, /vi/products/ and /zh/products/.
 *
 * Guard: zero axe `heading-order` violations per locale, plus the anchored
 * level-2 label itself while the published registry is non-empty.
 */
const LOCALES = [
  { route: "/en/products/", heading: "Published products" },
  { route: "/vi/products/", heading: "Sản phẩm đã công bố" },
  { route: "/zh/products/", heading: "已发布的产品" },
] as const;

for (const { route, heading } of LOCALES) {
  test(`heading order is sequential on ${route}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response, `${route} response`).not.toBeNull();
    expect(response!.status(), `${route} status`).toBeLessThan(400);

    const results = await new AxeBuilder({ page })
      .withRules(["heading-order"])
      .analyze();

    expect(
      results.violations,
      `heading-order violations on ${route}:\n${JSON.stringify(results.violations, null, 2)}`,
    ).toEqual([]);

    // The heading exists only when the public registry has cards to label;
    // the empty-registry branch keeps its proof-first empty state unchanged.
    if ((await page.locator("[data-product-card]").count()) > 0) {
      await expect(
        page.getByRole("heading", { level: 2, name: heading }),
      ).toBeVisible();
    }
  });
}
