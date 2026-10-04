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

// Owner 2026-10-04: icon-only trigger. The glyph shows the RESOLVED theme
// (sun / moon, read from the rays' computed opacity), a cobalt dot marks System,
// the accessible name states the mode and a CSS tooltip repeats it.
async function glyphState(page: Page): Promise<{
  rays: number;
  dot: number;
}> {
  return page.evaluate(() => {
    const svg = document.querySelector(
      "header [data-theme-trigger] .tt-morph",
    )!;
    const read = (sel: string) =>
      Number(getComputedStyle(svg.querySelector(sel)!).opacity);
    return { rays: read(".tt-rays"), dot: read(".tt-dot") };
  });
}

test("desktop icon trigger morphs to the chosen mode, names it and keeps it after a reload", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en/");
  const trigger = page.locator("header [data-theme-trigger]");
  await expect(trigger).toHaveAttribute("data-theme-current", "system");
  await expect(trigger).toHaveAttribute("aria-label", "Theme: System");
  await expect(trigger).not.toHaveAttribute("title", /.*/);
  // No visible label, no chevron: a 44px square whose only text is the tooltip.
  const box = await trigger.boundingBox();
  expect(Math.round(box!.width)).toBe(44);
  expect(Math.round(box!.height)).toBe(44);
  await expect(trigger.locator("[data-theme-current-label]")).toHaveCount(0);
  await expect(trigger.locator(".hc-chevron")).toHaveCount(0);
  // System on a light OS: sun + status dot.
  expect(await glyphState(page)).toEqual({ rays: 1, dot: 1 });
  // Mask ids are unique per instance (header + compact menu).
  const ids = await page.$$eval("mask[id]", (masks) => masks.map((m) => m.id));
  expect(ids.length).toBeGreaterThan(1);
  expect(new Set(ids).size).toBe(ids.length);

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
  // Moon (rays gone) and no dot outside System.
  expect(await glyphState(page)).toEqual({ rays: 0, dot: 0 });

  await page.reload();
  await expect(trigger).toHaveAttribute("data-theme-current", "dark");
  await expect(trigger).toHaveAttribute("aria-label", "Theme: Dark");
  expect(await glyphState(page)).toEqual({ rays: 0, dot: 0 });
  await trigger.click();
  await expect(
    page
      .getByRole("group", { name: "Theme" })
      .getByRole("button", { name: "Dark" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("group", { name: "Theme" })
    .getByRole("button", { name: "Light" })
    .click();
  await expect(trigger).toHaveAttribute("aria-label", "Theme: Light");
  // Pinned Light: sun, no dot.
  expect(await glyphState(page)).toEqual({ rays: 1, dot: 0 });
});

test("System on an OS-dark device shows the moon with the status dot", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en/");
  await expect(page.locator("header [data-theme-trigger]")).toHaveAttribute(
    "aria-label",
    "Theme: System",
  );
  expect(await glyphState(page)).toEqual({ rays: 0, dot: 1 });
});

test("the tooltip names the mode on hover and focus, never while the panel is open", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/vi/");
  const trigger = page.locator("header [data-theme-trigger]");
  const tip = trigger.locator("[data-theme-tip]");
  await expect(tip).toHaveAttribute("aria-hidden", "true");
  await expect(tip).toBeHidden();
  // The hover tooltip exists only for hover-capable pointers (@media
  // (hover: hover)); touch devices (mobile project) must NOT show it on tap.
  const canHover = await page.evaluate(
    () => matchMedia("(hover: hover)").matches,
  );
  await trigger.hover();
  if (canHover) {
    await expect(tip).toBeVisible();
    // innerText: only the current mode's word is rendered (display), not all three.
    await expect.poll(() => tip.innerText()).toBe("Giao diện: Tự động");
  } else {
    await expect(tip).toBeHidden();
  }
  // The tooltip never widens the page.
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(tip).toBeHidden();
  await page
    .getByRole("group", { name: "Giao diện" })
    .getByRole("button", { name: "Tối" })
    .click();
  await page.mouse.move(10, 600);
  await expect(tip).toBeHidden();
  // Keyboard focus shows it again with the new mode.
  await trigger.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(trigger).toBeFocused();
  await expect(tip).toBeVisible();
  // innerText: only the current mode's word is rendered (display), not all three.
  await expect.poll(() => tip.innerText()).toBe("Giao diện: Tối");
  await expect(trigger).toHaveAttribute("aria-label", "Giao diện: Tối");
});

test("below lg the icon trigger keeps its accessible name", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1023, height: 800 });
  await page.goto("/vi/");
  const trigger = page.locator("header [data-theme-trigger]");
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-label", "Giao diện: Tự động");
});
