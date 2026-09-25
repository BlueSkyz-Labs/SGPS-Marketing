import { expect, test } from "@playwright/test";

const LANGS = ["en", "vi", "zh"] as const;
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
  { width: 320, height: 844 },
];

/**
 * C4-C Task 4 — Boardroom Presentation Mode.
 *
 * A contained presentation view of the already-compiled public dossier:
 * one dominant idea per screen, explicit controls plus Arrow keys, Escape
 * exits, focus is visible and never trapped, routes are never intercepted,
 * source links stay ordinary links, and reduced motion must not cost
 * comprehension. Every assertion reads the shipped DOM — none of these is a
 * placeholder.
 */
test.describe("C4-C boardroom presentation mode", () => {
  test("one dominant idea per screen on load", async ({ page }) => {
    await page.goto("/en/dossier/");

    const deck = page.locator("[data-boardroom-deck]");
    await expect(deck).toBeVisible();
    expect(
      await page.locator("[data-boardroom-screen]").count(),
    ).toBeGreaterThan(1);

    const active = page.locator(".c4-boardroom__screen--active");
    await expect(active).toHaveCount(1);
    await expect(active.locator(".c4-boardroom__screen-heading")).toHaveCount(
      1,
    );

    await expect(page.locator("[data-boardroom-progress-current]")).toHaveText(
      "1",
    );
    await expect(page.locator("[data-boardroom-prev]")).toBeDisabled();
    await expect(page.locator("[data-boardroom-next]")).toBeEnabled();
  });

  test("explicit controls advance and rewind without touching the route", async ({
    page,
  }) => {
    await page.goto("/en/dossier/");
    const url = page.url();
    const progress = page.locator("[data-boardroom-progress-current]");

    await page.locator("[data-boardroom-next]").click();
    await expect(progress).toHaveText("2");
    await expect(page.locator(".c4-boardroom__screen--active")).toHaveCount(1);
    await expect(page.locator("[data-boardroom-prev]")).toBeEnabled();

    await page.locator("[data-boardroom-prev]").click();
    await expect(progress).toHaveText("1");

    // Presentation is a contained view state: the route never changes.
    expect(page.url()).toBe(url);
  });

  test("arrow keys move between screens and Escape exits the mode", async ({
    page,
  }) => {
    await page.goto("/en/dossier/");
    const progress = page.locator("[data-boardroom-progress-current]");

    await page.locator("[data-boardroom-next]").focus();
    await page.keyboard.press("ArrowRight");
    await expect(progress).toHaveText("2");

    await page.keyboard.press("ArrowLeft");
    await expect(progress).toHaveText("1");

    await page.keyboard.press("Escape");
    await expect(page.locator(".c4-boardroom__screen--active")).toHaveCount(0);
    await expect(page.locator("[data-boardroom-exit]")).toBeFocused();
    await expect(page.locator("[data-boardroom-next]")).toBeDisabled();
  });

  test("controls are named, keyboard reachable, and never trapped", async ({
    page,
  }) => {
    await page.goto("/en/dossier/");

    await expect(page.locator("[data-boardroom-prev]")).toHaveAttribute(
      "aria-label",
      /previous/i,
    );
    await expect(page.locator("[data-boardroom-next]")).toHaveAttribute(
      "aria-label",
      /next/i,
    );
    await expect(page.locator("[data-boardroom-exit]")).toHaveAttribute(
      "aria-label",
      /exit/i,
    );

    await page.locator("[data-boardroom-exit]").focus();
    await expect(page.locator("[data-boardroom-exit]")).toBeFocused();

    // Tabbing out of the last control must leave the deck (no focus trap).
    await page.keyboard.press("Tab");
    const trapped = await page.evaluate(() =>
      Boolean(document.activeElement?.closest("[data-boardroom-deck]")),
    );
    expect(trapped).toBe(false);
  });

  test("keyboard navigation moves visible focus onto the active screen", async ({
    page,
  }) => {
    await page.goto("/en/dossier/");

    await page.locator("[data-boardroom-next]").focus();
    await page.keyboard.press("ArrowRight");

    const heading = page.locator(
      ".c4-boardroom__screen--active .c4-boardroom__screen-heading",
    );
    await expect(heading).toBeFocused();
    await expect(heading).not.toBeEmpty();
  });

  test("focus is not stolen on load", async ({ page }) => {
    await page.goto("/en/dossier/");

    const insideDeck = await page.evaluate(() =>
      Boolean(document.activeElement?.closest("[data-boardroom-deck]")),
    );
    expect(insideDeck).toBe(false);
  });

  test("source links remain ordinary links", async ({ page }) => {
    await page.goto("/en/dossier/");

    const links = page.locator(".c4-boardroom__source-link");
    expect(await links.count()).toBeGreaterThan(0);
    expect(await links.first().getAttribute("href")).toMatch(
      /^(?:https?:\/\/|\/)/,
    );

    const activeLink = page.locator(
      ".c4-boardroom__screen--active .c4-boardroom__source-link",
    );
    if (await activeLink.count()) {
      await expect(activeLink.first()).toBeVisible();
    }
  });

  test("reduced motion drops the transition without losing the content", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en/dossier/");

    const active = page.locator(".c4-boardroom__screen--active");
    await expect(active.locator(".c4-boardroom__screen-heading")).toBeVisible();
    await expect(active).not.toBeEmpty();

    // "No transition" is a property of transition-property, not of a specific
    // duration string (engines report the `none` duration differently).
    const motion = await page
      .locator("[data-boardroom-screen]")
      .first()
      .evaluate((element) => ({
        property: getComputedStyle(element).transitionProperty,
        reduceMatched: matchMedia("(prefers-reduced-motion: reduce)").matches,
      }));
    expect(motion.reduceMatched).toBe(true);
    expect(motion.property).toBe("none");
  });

  for (const lang of LANGS) {
    test(`/${lang}/dossier/ stays contained at 1440/1024/390/320`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/dossier/`);
      const deck = page.locator("[data-boardroom-deck]");
      await expect(deck).toBeVisible();

      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await expect(deck).toBeVisible();
        const overflow = await deck.evaluate(
          (element) => element.scrollWidth - element.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe("C4-C boardroom without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("every screen and its source stays readable", async ({ page }) => {
    await page.goto("/en/dossier/");

    await expect(page.locator("[data-boardroom-deck]")).toBeVisible();

    // Without the enhancement no screen is collapsed: the whole presentation
    // is an ordinary readable section list.
    const screens = page.locator("[data-boardroom-screen]");
    const count = await screens.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      await expect(screens.nth(index)).toBeVisible();
    }
    expect(await page.locator(".c4-boardroom__screen--active").count()).toBe(0);

    // Controls that cannot work must not be offered.
    await expect(page.locator("[data-boardroom-next]")).toBeHidden();

    const links = page.locator(".c4-boardroom__source-link");
    expect(await links.count()).toBeGreaterThan(0);
    await expect(links.first()).toBeVisible();
  });
});
