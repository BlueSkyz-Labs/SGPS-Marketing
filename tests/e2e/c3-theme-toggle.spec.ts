import { test, expect, type Page } from "@playwright/test";

// S6: on desktop the three-way group lives behind one compact header trigger
// (native popover); the compact menu still shows the group inline.
async function openThemeGroup(page: Page): Promise<void> {
  const trigger = page.locator("header [data-theme-trigger]:visible");
  if (await trigger.count()) await trigger.click();
}

test("theme storage is opt-in and the chosen mode survives navigation", async ({
  page,
}) => {
  await page.goto("/en/");
  // A compact viewport exposes the control inside the native mobile disclosure.
  const mobileMenu = page.locator("header details > summary");
  if (await mobileMenu.isVisible()) await mobileMenu.click();
  await openThemeGroup(page);
  const theme = page.getByRole("group", { name: "Theme" });
  const system = theme.getByRole("button", { name: "System" });
  await expect(system).toHaveAttribute("aria-pressed", "true");
  expect(
    await page.evaluate(() => localStorage.getItem("blueskyz-theme")),
  ).toBeNull();

  await theme.getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page.evaluate(() => localStorage.getItem("blueskyz-theme")),
  ).toBe("dark");

  await page.goto("/vi/");
  if (await mobileMenu.isVisible()) await mobileMenu.click();
  await openThemeGroup(page);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("group", { name: "Giao diện" }).getByRole("button", {
      name: "Tối",
    }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("mobile theme controls meet the 44px touch floor", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/vi/");
  await page.locator("header details > summary").click();
  const theme = page.getByRole("group", { name: "Giao diện" });
  const buttons = theme.getByRole("button");
  await expect(buttons).toHaveCount(3);
  for (let index = 0; index < 3; index++) {
    const rect = await buttons.nth(index).boundingBox();
    expect(rect).not.toBeNull();
    expect(rect!.height).toBeGreaterThanOrEqual(44);
    expect(rect!.width).toBeGreaterThanOrEqual(44);
  }
  await theme.getByRole("button", { name: "Tối" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("explicit Light overrides OS-dark, System restores it without tracking", async ({
  browser,
}) => {
  const context = await browser.newContext({
    colorScheme: "dark",
    viewport: { width: 1280, height: 900 },
  });
  try {
    const page = await context.newPage();
    await page.goto("/en/");
    await openThemeGroup(page);
    const theme = page.getByRole("group", { name: "Theme" });
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-theme",
      /light|dark/,
    );
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).colorScheme,
      ),
    ).toBe("dark");
    expect(
      await page.evaluate(() => localStorage.getItem("blueskyz-theme")),
    ).toBeNull();

    await theme.getByRole("button", { name: "Light" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).colorScheme,
      ),
    ).toBe("light");
    await page.goto("/en/about/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(
      await page.evaluate(() => localStorage.getItem("blueskyz-theme")),
    ).toBe("light");

    await openThemeGroup(page);
    await page
      .getByRole("group", { name: "Theme" })
      .getByRole("button", { name: "System" })
      .click();
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-theme",
      /light|dark/,
    );
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).colorScheme,
      ),
    ).toBe("dark");
    expect(
      await page.evaluate(() => localStorage.getItem("blueskyz-theme")),
    ).toBe("system");
  } finally {
    await context.close();
  }
});

test("without JavaScript System still follows OS preference", async ({
  browser,
}) => {
  const context = await browser.newContext({
    colorScheme: "dark",
    javaScriptEnabled: false,
  });
  try {
    const page = await context.newPage();
    await page.goto("/en/");
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).colorScheme,
      ),
    ).toBe("dark");
    // The switcher options live in a native popover (closed without JS), so
    // assert the real links are present in the server HTML.
    await expect(
      page.locator('[data-language-choice="vi"]').first(),
    ).toBeAttached();
  } finally {
    await context.close();
  }
});

test("desktop trigger shows the current mode icon + label and keeps them after a choice and a reload", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en/");
  const trigger = page.locator("header [data-theme-trigger]");
  await expect(trigger).toHaveAttribute("data-theme-current", "system");
  await expect(trigger).toHaveAttribute("aria-label", "Theme: System");
  // The label is visible from lg and the accessible name contains it (2.5.3).
  await expect(trigger.locator("[data-theme-current-label]")).toBeVisible();
  await expect(trigger.locator("[data-theme-current-label]")).toHaveText(
    "System",
  );

  await trigger.click();
  const theme = page.getByRole("group", { name: "Theme" });
  // Rows are ordered Light, Dark, System.
  await expect(theme.getByRole("button")).toHaveText([
    /Light/,
    /Dark/,
    /System/,
  ]);
  await theme.getByRole("button", { name: "Dark" }).click();

  // Choosing closes the popover, returns focus and keeps aria-expanded true to state.
  await expect(theme.getByRole("button")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toHaveAttribute("data-theme-current", "dark");
  await expect(trigger).toHaveAttribute("aria-label", "Theme: Dark");
  await expect(trigger.locator("[data-theme-current-label]")).toHaveText(
    "Dark",
  );
  await expect(trigger.locator('[data-theme-icon="dark"]')).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(trigger.locator('[data-theme-icon="system"]')).toHaveCSS(
    "opacity",
    "0",
  );

  await page.reload();
  await expect(trigger).toHaveAttribute("data-theme-current", "dark");
  await expect(trigger).toHaveAttribute("aria-label", "Theme: Dark");
  await expect(trigger.locator("[data-theme-current-label]")).toHaveText(
    "Dark",
  );
  await trigger.click();
  await expect(
    page
      .getByRole("group", { name: "Theme" })
      .getByRole("button", { name: "Dark" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("below lg the trigger is icon + chevron only but keeps its accessible name", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1023, height: 800 });
  await page.goto("/vi/");
  const trigger = page.locator("header [data-theme-trigger]");
  await expect(trigger).toBeVisible();
  await expect(trigger.locator("[data-theme-current-label]")).toBeHidden();
  await expect(trigger).toHaveAttribute("aria-label", "Giao diện: Tự động");
});
