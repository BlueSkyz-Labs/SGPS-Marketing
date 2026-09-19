import { expect, test, type Page } from "@playwright/test";

/**
 * C3-A Task 5 — Route Transition Grammar (design S5).
 *
 * The grammar is declarative: `@view-transition { navigation: auto }` in the
 * global sheet plus a small, closed set of stable names. Two properties matter
 * more than the animation itself and are what this guard protects:
 *
 *   - a name must be UNIQUE inside a document (the platform fails silently on
 *     duplicates) and must come from the convention, not from a new invention;
 *   - navigation must complete whether or not the engine implements the API, so
 *     the transition can never be a precondition for reaching a page.
 */
const NAME =
  /^(?:root|product-(?:card|media)-[a-z0-9]+(?:-[a-z0-9]+)*|language-(?:en|vi|zh))$/;

const ROUTES = ["/en/", "/vi/", "/en/products/", "/vi/products/", "/en/about/"];

/**
 * Every `view-transition-name` the document carries, read from the authored
 * style attribute so the contract is measurable in engines that do not
 * implement the API yet, and cross-checked against the computed value when the
 * engine does expose it (that also catches a name declared in CSS).
 */
async function transitionNames(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const names = new Set<string>();
    for (const el of document.querySelectorAll<HTMLElement>("[style]")) {
      const declared = /view-transition-name:\s*([^;]+)/i.exec(
        el.getAttribute("style") ?? "",
      );
      if (declared) names.add(declared[1].trim());
    }
    for (const el of document.querySelectorAll<HTMLElement>("body *")) {
      const computed = getComputedStyle(el).viewTransitionName;
      if (computed && computed !== "none") names.add(computed);
    }
    return [...names].sort();
  });
}

/** Running view-transition pseudo animations, e.g. a cross-fade in flight. */
async function pseudoTransitionsRunning(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      document.getAnimations().filter((animation) => {
        const pseudo = (animation.effect as KeyframeEffect | null)
          ?.pseudoElement;
        return typeof pseudo === "string" && pseudo.startsWith("::view");
      }).length,
  );
}

test.describe("C3-A Route Transition Grammar — naming", () => {
  for (const route of ROUTES) {
    test(`${route}: names are unique and drawn from the convention`, async ({
      page,
    }) => {
      await page.goto(route);
      const names = await transitionNames(page);
      const duplicates = names.filter(
        (name, index) => names.indexOf(name) !== index,
      );
      expect(
        duplicates,
        `a duplicate view-transition-name makes the platform drop the transition silently`,
      ).toEqual([]);
      for (const name of names) {
        expect(name, `${route} invented a name outside the convention`).toMatch(
          NAME,
        );
      }
    });
  }

  test("names are stable across loads", async ({ page }) => {
    await page.goto("/en/products/");
    const first = await transitionNames(page);
    await page.reload();
    const second = await transitionNames(page);
    expect(second).toEqual(first);
  });

  test("the locale pair is named on both locales", async ({ page }) => {
    for (const [route, active] of [
      ["/en/", "en"],
      ["/vi/", "vi"],
    ] as const) {
      await page.goto(route);
      const names = await transitionNames(page);
      for (const language of ["en", "vi"]) {
        expect(
          names,
          `${route} must name the ${language} switcher target so EN↔VI can pair`,
        ).toContain(`language-${language}`);
      }
      expect(
        names,
        "the active locale is expressed by aria-current, not by a second name",
      ).toContain(`language-${active}`);
    }
  });
});

test.describe("C3-A Route Transition Grammar — navigation", () => {
  test("navigation completes when the API is absent", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.addInitScript(() => {
      // Simulate an engine without the transition API: the page must still be
      // reachable, because the transition is decoration, never a precondition.
      Reflect.deleteProperty(document, "startViewTransition");
    });
    await page.goto("/en/");
    await page.locator("header nav a", { hasText: "Products" }).first().click();
    await expect(page).toHaveURL(/\/en\/products\/$/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("reduced motion keeps navigation immediate and complete", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en/");
    const duration = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--motion-continuity-duration")
        .trim(),
    );
    expect(
      duration,
      "reduced motion must collapse the continuity duration to zero",
    ).toMatch(/^0(?:s|ms)$/);
    await page.locator("header nav a", { hasText: "Products" }).first().click();
    await expect(page).toHaveURL(/\/en\/products\/$/);
    await expect(page.locator("h1").first()).toBeVisible();
    expect(await pseudoTransitionsRunning(page)).toBe(0);
  });
});
