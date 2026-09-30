import { test, expect, type Page } from "@playwright/test";

/** The header switcher trigger that is visible at the current viewport. */
const headerTrigger = (page: Page) =>
  page.locator("header [data-language-trigger]:visible").first();

async function openHeaderSwitcher(page: Page) {
  await headerTrigger(page).click();
  const panel = page.locator("header [data-language-panel]:popover-open");
  await expect(panel).toBeVisible();
  // Let the 170ms entrance transition finish so the options are stable targets.
  await panel.evaluate((element) =>
    Promise.all(element.getAnimations().map((animation) => animation.finished)),
  );
}

test("language switcher navigates between en and vi", async ({ page }) => {
  await page.goto("/en/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await openHeaderSwitcher(page);
  await page.getByRole("link", { name: "Tiếng Việt" }).first().click();
  await expect(page).toHaveURL(/\/vi\//);
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("blueskyz.ui.language")),
    )
    .toBe("vi");
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
});

test("switcher reaches Traditional Chinese on the same page and remembers it", async ({
  page,
}) => {
  await page.goto("/en/about/");
  await openHeaderSwitcher(page);
  const option = page.locator(
    'header [data-language-panel]:popover-open a[data-language-choice="zh-hant"]',
  );
  await expect(option).toHaveAttribute("href", "/zh-hant/about/");
  await expect(option).toHaveAttribute("hreflang", "zh-Hant");
  await expect(option).toHaveAttribute("lang", "zh-Hant");
  await option.click();
  await expect(page).toHaveURL(/\/zh-hant\/about\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hant");
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("blueskyz.ui.language")),
    )
    .toBe("zh-hant");
  // The trigger now shows the compact Traditional code.
  await expect(headerTrigger(page)).toContainText("繁");
});

test("the panel lists every language as a link with a check on the current one", async ({
  page,
}) => {
  await page.goto("/zh-hant/about/");
  await openHeaderSwitcher(page);
  const options = page.locator("header [data-language-panel]:popover-open a");
  await expect(options).toHaveCount(4);
  await expect(options.locator(".lang-option__native")).toHaveText([
    "English",
    "Tiếng Việt",
    "简体中文",
    "繁體中文",
  ]);
  await expect(
    options.locator(".lang-option__english").filter({ hasText: /./ }),
  ).toHaveText(["Vietnamese", "Simplified Chinese", "Traditional Chinese"]);
  const current = page.locator(
    'header [data-language-panel]:popover-open a[aria-current="page"]',
  );
  await expect(current).toHaveCount(1);
  await expect(current).toHaveAttribute("data-language-choice", "zh-hant");
  // Visible check mark on the current row only.
  await expect(current.locator(".lang-option__check svg")).toBeVisible();
  await expect(page.locator("header [data-language-panel] svg")).toHaveCount(
    // one check per panel instance (desktop nav + mobile menu), never per row
    2,
  );
});

test("the popover opens and closes with pointer and keyboard, without JS", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/en/");
    const panel = page.locator("header [data-language-panel]").first();
    await expect(panel).toBeHidden();
    await headerTrigger(page).click();
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await headerTrigger(page).click();
    await expect(panel).toBeVisible();
    // Light dismiss: a click outside closes it.
    await page.mouse.click(5, 400);
    await expect(panel).toBeHidden();
  } finally {
    await context.close();
  }
});

test("keyboard: Enter opens, Tab reaches the options, Escape restores focus", async ({
  page,
}) => {
  await page.goto("/en/");
  await headerTrigger(page).focus();
  await page.keyboard.press("Enter");
  const panel = page.locator("header [data-language-panel]:popover-open");
  await expect(panel).toBeVisible();
  await expect(headerTrigger(page)).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(panel.locator("a").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(headerTrigger(page)).toBeFocused();
  await expect(headerTrigger(page)).toHaveAttribute("aria-expanded", "false");
});

test("language switcher renders in footer on all viewports", async ({
  page,
}) => {
  await page.goto("/en/");
  const footer = page.locator("footer");
  const trigger = footer.locator("[data-language-trigger]");
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(footer.getByRole("link", { name: "Tiếng Việt" })).toBeVisible();
  await expect(
    footer.getByRole("link", { name: "English", exact: false }).first(),
  ).toBeVisible();
  await expect(
    footer.getByRole("link", { name: "繁體中文", exact: false }),
  ).toBeVisible();
});

test("hreflang links present on all pages", async ({ page }) => {
  await page.goto("/en/about/");
  await expect(page.locator('link[hreflang="en"]')).toBeAttached();
  await expect(page.locator('link[hreflang="vi"]')).toBeAttached();
  await expect(page.locator('link[hreflang="zh-Hans"]')).toBeAttached();
  await expect(page.locator('link[hreflang="zh-Hant"]')).toHaveAttribute(
    "href",
    /\/zh-hant\/about\/$/,
  );
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
    // The gateway is the nav itself. Matching page-wide would also see the
    // noscript fallback link "Continue in English", whose accessible name contains
    // "English" — asserting inside the gateway is what the claim actually means.
    const gateway = page.locator('nav[aria-label="Language"]');
    await expect(gateway).toHaveCount(1);
    const vietnamese = gateway.getByRole("link", { name: "Tiếng Việt" });
    const english = gateway.getByRole("link", { name: "English", exact: true });
    const simplifiedChinese = gateway.getByRole("link", { name: "简体中文" });
    const traditionalChinese = gateway.getByRole("link", { name: "繁體中文" });
    await expect(vietnamese).toHaveAttribute("href", "/vi/");
    await expect(english).toHaveAttribute("href", "/en/");
    await expect(simplifiedChinese).toHaveAttribute("href", "/zh/");
    await expect(traditionalChinese).toHaveAttribute("href", "/zh-hant/");
    await expect(traditionalChinese).toHaveAttribute("lang", "zh-Hant");
    // the gateway must expose every live locale, not merely appear
    await expect(gateway.getByRole("link")).toHaveCount(4);
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

test("root gateway sends a saved Traditional Chinese choice to /zh-hant/", async ({
  page,
}) => {
  await page.goto("/en/");
  await page.evaluate(() =>
    localStorage.setItem("blueskyz.ui.language", "zh-hant"),
  );
  await page.goto("/");
  await expect(page).toHaveURL(/\/zh-hant\/$/);
});

test("language trigger and choices retain the 44px touch floor on desktop and mobile", async ({
  page,
}) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en/");
    if (width < 768) {
      await page.locator("header details > summary").click();
    }

    const trigger = headerTrigger(page);
    const triggerBox = await trigger.boundingBox();
    expect(triggerBox, "visible trigger has a bounding box").not.toBeNull();
    expect(triggerBox!.width, "trigger touch width").toBeGreaterThanOrEqual(44);
    expect(triggerBox!.height, "trigger touch height").toBeGreaterThanOrEqual(
      44 - 0.001,
    );

    await trigger.click();
    const choices = page.locator("[data-language-choice]:visible");
    const count = await choices.count();
    expect(count).toBe(4);

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
      // The panel must stay inside the viewport (no horizontal overflow).
      expect(rect!.x).toBeGreaterThanOrEqual(0);
      expect(rect!.x + rect!.width).toBeLessThanOrEqual(width + 0.5);
    }
  }
});
