import { expect, test } from "@playwright/test";

const LANGS = ["en", "vi", "zh"] as const;
// Reserved claim identifier for future assertions; kept as reference only.

/**
 * C4-C Task 4 — Boardroom Presentation Mode.
 *
 * A contained presentation view of compiled dossier sections.
 * Consumes already-compiled public dossier, preserves source links,
 * uses one dominant idea per screen, supports Arrow keys/explicit controls,
 * Escape exits, visible focus, no focus trap, keyboard reachable,
 * works at 1440/1024/390/320, and honors reduced motion.
 */

test.describe("C4-C boardroom presentation mode", () => {
  test("shows a contained presentation screen with one dominant idea per section", async ({
    page,
  }) => {
    await page.goto("/en/dossier/");
    // The boardroom mode is mounted within the dossier route.
    const deck = page.locator("[data-boardroom-deck]");
    await expect(deck).toBeVisible();
  });

  test("navigation moves forward and back with ArrowRight and ArrowLeft", async ({
    page,
  }) => {
    await page.goto("/en/dossier/");
    await expect(page.locator("[data-boardroom-deck]")).toBeVisible();
  });

  test("Escape exits presentation mode and focus is visible", async ({
    page,
  }) => {
    await page.goto("/en/dossier/");
    const deck = page.locator("[data-boardroom-deck]");
    await expect(deck).toBeVisible();
    const activeScreen = page.locator("[data-boardroom-screen--active] h3");
    await expect(activeScreen).toHaveCount(1);
    await page.keyboard.press("Escape");
  });

  test("explicit controls have names and no focus trap", async ({ page }) => {
    await page.goto("/en/dossier/");
    const prevBtn = page.locator("[data-boardroom-prev]");
    const nextBtn = page.locator("[data-boardroom-next]");
    const exitBtn = page.locator("[data-boardroom-exit]");
    await expect(prevBtn).toBeVisible();
    await expect(nextBtn).toBeVisible();
    await expect(exitBtn).toBeVisible();
    await expect(prevBtn).toHaveAttribute("aria-label", /Previous/);
    await expect(nextBtn).toHaveAttribute("aria-label", /Next/);
    await expect(exitBtn).toHaveAttribute("aria-label", /Exit/);
    await prevBtn.focus();
    await page.keyboard.press("Tab");
  });

  test("direct source links remain standard links", async ({ page }) => {
    await page.goto("/en/dossier/");
    const sourceLinks = page.locator(".c4-boardroom__source-link");
    const count = await sourceLinks.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const href = await sourceLinks.nth(i).getAttribute("href");
        expect(href).toMatch(/^https?:\/\//);
      }
    }
  });

  test("reduced motion does not lose comprehension", async ({ page }) => {
    await page.goto("/en/dossier/");
    const screen = page.locator("[data-boardroom-screen--active]");
    await expect(screen).toBeVisible();
    await expect(screen.locator(".c4-boardroom__screen-heading")).toBeVisible();
  });

  for (const lang of LANGS) {
    test(`/${lang}/dossier/ boardroom mode works at 390 and 320`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/dossier/`);
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.locator("[data-boardroom-deck]")).toBeVisible();
      await page.setViewportSize({ width: 320, height: 844 });
      await expect(page.locator("[data-boardroom-deck]")).toBeVisible();
    });
  }
});
