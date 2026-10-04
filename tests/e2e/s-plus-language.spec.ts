import { expect, test, type Page } from "@playwright/test";

/** The options live in a native popover: open the visible header trigger. */
async function openSwitcher(page: Page, { settle = true } = {}) {
  // Below the md breakpoint the switcher sits inside the header "Menu"
  // disclosure; open it first, as a visitor would (no-op on desktop).
  const menu = page.locator("header details:not([open]) > summary");
  if (await menu.isVisible()) await menu.click();
  await page.locator("header [data-language-trigger]:visible").first().click();
  const panel = page.locator("header [data-language-panel]:popover-open");
  await expect(panel).toBeVisible();
  // Let the 170ms entrance transition finish so the options are stable targets.
  // A JavaScript-disabled context cannot evaluate this in every engine
  // (Firefox hangs), so no-JS callers use reduced motion instead: the panel
  // then has no transition to wait for.
  if (settle) {
    await panel.evaluate((element) =>
      Promise.all(
        element.getAnimations().map((animation) => animation.finished),
      ),
    );
  }
}

test("language switch keeps real links with route context on /en/about/", async ({
  page,
}) => {
  await page.goto("/en/about/");
  await openSwitcher(page);
  const switcher = page.getByRole("navigation", { name: "Language" }).first();
  const viLink = switcher.getByRole("link", { name: "Tiếng Việt" });
  await expect(viLink).toHaveAttribute("href", "/vi/about/");
  await expect(viLink).toHaveAttribute("hreflang", "vi");
  const enLink = switcher.getByRole("link", { name: "English" });
  await expect(enLink).toHaveAttribute("aria-current", "page");
});

test("switching navigates for real and preserves route context", async ({
  page,
}) => {
  await page.goto("/en/about/");
  await openSwitcher(page);
  await page
    .getByRole("navigation", { name: "Language" })
    .first()
    .getByRole("link", { name: "Tiếng Việt" })
    .click();
  await page.waitForURL("**/vi/about/");
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // Focus semantics remain normal after a real navigation.
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: /Chuyển đến|Bỏ qua|Skip to/i }),
  ).toBeFocused();
});

test("reduced motion keeps ordinary navigation", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/en/about/");
  await openSwitcher(page);
  await page
    .getByRole("navigation", { name: "Language" })
    .first()
    .getByRole("link", { name: "Tiếng Việt" })
    .click();
  await page.waitForURL("**/vi/about/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await context.close();
});

test("view transitions are CSS-only with a reduced-motion override", async ({
  page,
}) => {
  await page.goto("/en/about/");
  // Read every linked stylesheet: Astro may split page-scoped CSS into its
  // own chunk ahead of the global sheet, so "the first link" is not stable.
  const cssHrefs = await page.evaluate(() =>
    [...document.querySelectorAll('link[rel="stylesheet"]')]
      .filter(
        (link): link is HTMLLinkElement => link instanceof HTMLLinkElement,
      )
      .map((link) => link.href),
  );
  expect(cssHrefs.length).toBeGreaterThan(0);
  let css = "";
  for (const href of cssHrefs) {
    const response = await page.request.get(href);
    expect(response.ok()).toBe(true);
    css += await response.text();
  }
  expect(css).toContain("@view-transition");
  expect(css).toContain("view-transition-old(root)");
  expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
});

test("switching works without JavaScript (ordinary links)", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/en/about/");
  await openSwitcher(page, { settle: false });
  const link = page
    .getByRole("navigation", { name: "Language" })
    .first()
    .getByRole("link", { name: "Tiếng Việt" });
  await expect(link).toHaveAttribute("href", "/vi/about/");
  // Ordinary anchor navigation is the authority; do not let the click action
  // observe the cross-document transition it triggers (see c2-product-continuity).
  await Promise.all([
    page.waitForURL("**/vi/about/"),
    link.click({ noWaitAfter: true }),
  ]);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await context.close();
});

test("hreflang alternates stay reciprocal after switching", async ({
  page,
}) => {
  await page.goto("/vi/support/");
  const alternates = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('link[rel="alternate"][hreflang]'),
    ).map((element) => [
      element.getAttribute("hreflang"),
      element.getAttribute("href"),
    ]),
  );
  const map = new Map(alternates as Array<[string, string]>);
  expect(map.get("en")?.endsWith("/en/support/")).toBe(true);
  expect(map.get("vi")?.endsWith("/vi/support/")).toBe(true);
  expect(map.get("zh-Hans")?.endsWith("/zh/support/")).toBe(true);
  expect(map.get("zh-Hant")?.endsWith("/zh-hant/support/")).toBe(true);
  expect(map.get("x-default")?.endsWith("/en/support/")).toBe(true);
});
