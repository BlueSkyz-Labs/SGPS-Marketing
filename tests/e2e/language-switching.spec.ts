import { test, expect } from "@playwright/test";

test("language switcher navigates between en and vi", async ({ page }) => {
  await page.goto("/en/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("link", { name: "Tiếng Việt" }).first().click();
  await expect(page).toHaveURL(/\/vi\//);
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("blueskyz.ui.language")),
    )
    .toBe("vi");
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
});

test("language switcher renders in footer on all viewports", async ({
  page,
}) => {
  await page.goto("/en/");
  const footer = page.locator("footer");
  await expect(footer.getByRole("link", { name: "Tiếng Việt" })).toBeAttached();
  await expect(footer.getByRole("link", { name: "English" })).toBeAttached();
});

test("hreflang links present on all pages", async ({ page }) => {
  await page.goto("/en/about/");
  await expect(page.locator('link[hreflang="en"]')).toBeAttached();
  await expect(page.locator('link[hreflang="vi"]')).toBeAttached();
  await expect(page.locator('link[hreflang="x-default"]')).toBeAttached();
});

test("x-default points to en", async ({ page }) => {
  await page.goto("/vi/about/");
  const xDefault = page.locator('link[hreflang="x-default"]');
  await expect(xDefault).toHaveAttribute("href", /\/en\//);
});

test("root gateway respects the returning user's explicit saved language", async ({
  page,
}) => {
  await page.goto("/en/");
  await page.evaluate(() => localStorage.setItem("blueskyz.ui.language", "vi"));
  await page.goto("/");
  await expect(page).toHaveURL(/\/vi\/$/);
});

test("root no-JS gateway offers every live locale", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const vietnamese = page.getByRole("link", { name: "Tiếng Việt" });
    const english = page.getByRole("link", { name: "English" });
    const simplifiedChinese = page.getByRole("link", { name: "简体中文" });
    const traditionalChinese = page.getByRole("link", { name: "繁體中文" });
    await expect(vietnamese).toHaveAttribute("href", "/vi/");
    await expect(english).toHaveAttribute("href", "/en/");
    await expect(simplifiedChinese).toHaveAttribute("href", "/zh/");
    await expect(traditionalChinese).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("localized URLs stay stable instead of geo/browser redirecting", async ({
  page,
}) => {
  await page.goto("/en/about/");
  await expect(page).toHaveURL(/\/en\/about\/$/);
  await page.goto("/vi/about/");
  await expect(page).toHaveURL(/\/vi\/about\/$/);
});

test("language choices retain the 44px touch floor on desktop and mobile", async ({
  page,
}) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en/");
    if (width < 768) {
      await page.locator("header details > summary").click();
    }

    const choices = page.locator("[data-language-choice]:visible");
    const count = await choices.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index++) {
      const rect = await choices.nth(index).boundingBox();
      expect(rect, "visible language choice has a bounding box").not.toBeNull();
      expect(rect!.width, "language touch width").toBeGreaterThanOrEqual(44);
      // Firefox on Linux reports a 44px min-height box as 43.9998: sub-pixel
      // float rounding, not a smaller target. The 44px floor is still enforced.
      expect(
        rect!.height,
        `language touch height (got ${rect!.height})`,
      ).toBeGreaterThanOrEqual(44 - 0.001);
    }
  }
});
