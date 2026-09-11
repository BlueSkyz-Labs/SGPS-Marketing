import { expect, test } from "@playwright/test";

test("language switch keeps real links with route context on /en/about/", async ({
  page,
}) => {
  await page.goto("/en/about/");
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
    page.getByRole("link", { name: /Bỏ qua|Skip to/i }),
  ).toBeFocused();
});

test("reduced motion keeps ordinary navigation", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/en/about/");
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
  const cssHref = await page.evaluate(() => {
    const link = document.querySelector('link[rel="stylesheet"]');
    return link instanceof HTMLLinkElement ? link.href : null;
  });
  expect(cssHref).toBeTruthy();
  const response = await page.request.get(cssHref as string);
  expect(response.ok()).toBe(true);
  const css = await response.text();
  expect(css).toContain("@view-transition");
  expect(css).toContain("view-transition-old(root)");
  expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
});

test("switching works without JavaScript (ordinary links)", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en/about/");
  await page
    .getByRole("navigation", { name: "Language" })
    .first()
    .getByRole("link", { name: "Tiếng Việt" })
    .click();
  await page.waitForURL("**/vi/about/");
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
});
