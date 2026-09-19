import { test, expect } from "@playwright/test";

test("theme storage is opt-in and the chosen mode survives navigation", async ({
  page,
}) => {
  await page.goto("/en/");
  // A compact viewport exposes the control inside the native mobile disclosure.
  const mobileMenu = page.locator("header details > summary");
  if (await mobileMenu.isVisible()) await mobileMenu.click();
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
    await expect(
      page.getByRole("link", { name: "Tiếng Việt" }).first(),
    ).toBeAttached();
  } finally {
    await context.close();
  }
});
