import { expect, test } from "@playwright/test";

// Primary nav and the desktop trigger are desktop-only; pin the viewport so
// these tests behave identically across all projects (incl. mobile-chromium).
test.use({ viewport: { width: 1280, height: 800 } });

test("command navigator has a visible discoverable trigger", async ({
  page,
}) => {
  await page.goto("/en/");
  const trigger = page.locator("[data-command-trigger]:visible");
  await expect(trigger).toHaveCount(1);
  await expect(trigger).toHaveAttribute("aria-keyshortcuts", /Control\+K/);
});

test("Ctrl+K opens the dialog with focus in search; Escape restores focus", async ({
  page,
}) => {
  await page.goto("/en/");
  const trigger = page.locator("[data-command-trigger]:visible");
  await trigger.focus();
  await page.keyboard.press("Control+k");

  const dialog = page.locator("dialog[data-command-navigator]");
  await expect(dialog).toHaveAttribute("open", "");
  await expect(page.locator("[data-command-input]")).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).not.toHaveAttribute("open", "");
  await expect(trigger).toBeFocused();
});

test("filtering narrows to matching destinations with an empty state", async ({
  page,
}) => {
  await page.goto("/en/");
  await page.keyboard.press("Control+k");
  const input = page.locator("[data-command-input]");
  const visibleItems = page.locator("[data-command-item]:not([hidden])");

  await input.fill("privacy");
  await expect(visibleItems).toHaveCount(1);
  await expect(visibleItems.first()).toContainText("Privacy");

  await input.fill("zzzz-no-match");
  await expect(visibleItems).toHaveCount(0);
  await expect(page.locator("[data-command-empty]")).toBeVisible();

  await input.fill("");
  const total = await page.locator("[data-command-item]").count();
  await expect(visibleItems).toHaveCount(total);
});

test("results are real links to approved routes", async ({ page }) => {
  await page.goto("/en/");
  await page.keyboard.press("Control+k");
  const hrefs = await page
    .locator("[data-command-item] a")
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("href")),
    );
  expect(hrefs.length).toBeGreaterThan(0);
  expect(hrefs.every((href) => href?.startsWith("/en/"))).toBe(true);
  const privacy = page.locator('[data-command-item] a[href="/en/privacy/"]');
  await expect(privacy).toHaveCount(1);
  await privacy.click();
  await page.waitForURL("**/en/privacy/");
});

test("VI search is localized and diacritic-insensitive", async ({ page }) => {
  await page.goto("/vi/");
  await page.keyboard.press("Control+k");
  await page.locator("[data-command-input]").fill("quyen");
  const visibleItems = page.locator("[data-command-item]:not([hidden])");
  await expect(visibleItems.first()).toContainText("Quyền riêng tư");
});

test("no-JS keeps the navigator out and base navigation sufficient", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  await page.goto("/en/");
  await expect(page.locator("[data-command-trigger]:visible")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await context.close();
});
