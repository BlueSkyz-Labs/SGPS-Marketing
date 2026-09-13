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
  const items = await page.locator("[data-command-item]").evaluateAll((els) =>
    els.map((el) => ({
      kind: el.getAttribute("data-command-kind"),
      href: el.querySelector("a")?.getAttribute("href") ?? "",
    })),
  );
  expect(items.length).toBeGreaterThan(0);
  for (const item of items) {
    if (item.kind === "evidence") {
      // Provenance evidence may be a public https endpoint (e.g. the GitHub
      // advisory channel) — never an unknown internal route.
      expect(item.href).toMatch(/^\/(en|vi)\/|^https:\/\//);
    } else {
      expect(item.href).toMatch(/^\/en\//);
    }
  }
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

test("the result count is announced to assistive tech", async ({ page }) => {
  await page.goto("/en/");
  await page.keyboard.press("Control+k");
  const live = page.locator("[data-command-live]");
  await expect(live).toHaveAttribute("aria-live", "polite");
  await expect(live).toHaveAttribute("role", "status");
  await expect(live).not.toHaveText("", { timeout: 5000 });
  await expect(live).toHaveText(/results?$/);

  await page.locator("[data-command-input]").fill("products");
  await expect(live).toHaveText(/results?$/);

  await page.locator("[data-command-input]").fill("zzz-no-such-destination");
  await expect(live).toHaveText("No results");
});

test("VI announces the count in Vietnamese", async ({ page }) => {
  await page.goto("/vi/");
  await page.keyboard.press("Control+k");
  const live = page.locator("[data-command-live]");
  await expect(live).toHaveText(/kết quả/);
});
