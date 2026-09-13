// C2 — Horizon Arrival: reduced-motion equivalence.
//
// The hero must be content-equivalent with and without motion: the headline,
// supporting copy and both actions are present and usable, the decorative
// signature carries no transition under `prefers-reduced-motion: reduce`, and
// nothing overflows sideways at 320px/390px. Emulation uses the real browser
// preference (no injected style tag), so this proves the shipped CSS block.
import { expect, test, type Page } from "@playwright/test";

const overflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test.describe(`prefers-reduced-motion: ${reducedMotion}`, () => {
    test.use({ reducedMotion });

    test("hero content and actions stay complete", async ({ page }) => {
      await page.goto("/en/");
      const h1 = page.locator("#hero-title");
      await expect(h1).toBeVisible();
      await expect(h1).toContainText(/Intelligence|Trí tuệ/i);
      await expect(h1).toContainText(/Impact|Tác động/i);

      const actions = page.locator(".hero-actions a");
      await expect(actions).toHaveCount(2);
      for (let index = 0; index < 2; index += 1) {
        await expect(actions.nth(index)).toBeVisible();
        const href = await actions.nth(index).getAttribute("href");
        expect(href?.startsWith("/")).toBe(true);
      }
    });

    test("no sideways scroll at 320px and 390px", async ({ page }) => {
      await page.goto("/en/");
      for (const width of [320, 390]) {
        await page.setViewportSize({ width, height: 800 });
        expect(await overflow(page), `${width}px overflow`).toBeLessThanOrEqual(
          1,
        );
      }
    });
  });
}

test("reduced motion neutralises the decorative horizon signature", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/");
  const signature = page.locator(".horizon-signature").first();
  if ((await signature.count()) > 0) {
    const styles = await signature.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        transitionDuration: computed.transitionDuration,
        animationName: computed.animationName,
      };
    });
    expect(styles.transitionDuration.split(",")[0].trim()).toBe("0s");
    expect(styles.animationName).toBe("none");
  }
});

test("the hero carries the same content with motion enabled", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/en/");
  await expect(page.locator("#hero-title")).toContainText(/Impact|Tác động/i);
  await expect(page.locator(".hero-actions a")).toHaveCount(2);
});
